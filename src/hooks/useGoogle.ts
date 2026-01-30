import { useCallback, useEffect, useState } from 'react'
import {
  useGoogleStore,
  initializeGoogleConnection,
  hasCalendarAccess,
  hasDriveAccess,
} from '@/stores/googleStore'
import { googleAuth } from '@/services/googleAuth'
import {
  fetchCalendarEvents,
  fetchUserCalendars,
  type CalendarListEntry,
  getEventDateTime,
  getEventEndDateTime,
  isAllDayEvent,
  formatEventTime,
  deleteCalendarEvent as deleteCalendarEventApi,
} from '@/utils/googleCalendar'
import type { CalendarEventDisplay } from '@/types'
import { logger } from '@/utils/logger'
import { toast } from '@/stores/toastStore'
import { format, parseISO, startOfDay, endOfDay, addDays, isBefore, isEqual } from 'date-fns'

const BACKUP_FILENAME = 'cbtjournal-data.json'

export function useGoogle() {
  const store = useGoogleStore()
  const [calendarEvents, setCalendarEvents] = useState<CalendarEventDisplay[]>([])
  const [availableCalendars, setAvailableCalendars] = useState<CalendarListEntry[]>([])
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (!initialized) {
      initializeGoogleConnection().then(() => setInitialized(true))
    }
  }, [initialized])

  const connect = useCallback(
    async (service: 'calendar' | 'drive' | 'both' = 'both'): Promise<boolean> => {
      if (!googleAuth.isConfigured()) {
        toast.error('Google is not configured')
        return false
      }

      store.setIsConnecting(true)
      store.setLastError(null)

      try {
        let token = store.accessToken

        if (!token) {
          token = await googleAuth.signIn(service)
        } else if (service === 'calendar' && !hasCalendarAccess()) {
          token = await googleAuth.requestAdditionalScopes('calendar')
        } else if (service === 'drive' && !hasDriveAccess()) {
          token = await googleAuth.requestAdditionalScopes('drive')
        }

        const authState = googleAuth.getState()
        store.setAuthState({
          accessToken: authState.accessToken,
          grantedScopes: authState.grantedScopes,
          connectedAt: authState.connectedAt,
          lastValidated: authState.lastValidated,
        })

        if (service === 'calendar' || service === 'both') {
          if (hasCalendarAccess()) {
            await setupCalendar(token)
          }
        }

        if (service === 'drive' || service === 'both') {
          if (hasDriveAccess()) {
            await setupDrive(token)
          }
        }

        toast.success('Connected to Google')
        return true
      } catch (error) {
        if (error instanceof Error && error.message !== 'popup_closed_by_user') {
          logger.error('useGoogle', 'Connection failed', error)
          store.setLastError(String(error))
          toast.error('Failed to connect to Google')
        }
        return false
      } finally {
        store.setIsConnecting(false)
      }
    },
    [store]
  )

  const setupCalendar = async (token: string): Promise<void> => {
    const calendarsResult = await fetchUserCalendars(token)
    if (!calendarsResult.success || !calendarsResult.calendars) {
      throw new Error(calendarsResult.error || 'Failed to fetch calendars')
    }

    setAvailableCalendars(calendarsResult.calendars)

    const primaryCalendar =
      calendarsResult.calendars.find((c) => c.primary) || calendarsResult.calendars[0]
    if (!primaryCalendar) {
      throw new Error('No calendars found')
    }

    store.setCalendar({
      selectedCalendarId: primaryCalendar.id,
      selectedCalendarName: primaryCalendar.summary,
    })

    logger.info('useGoogle', 'Calendar setup complete', { calendarId: primaryCalendar.id })
  }

  const setupDrive = async (token: string): Promise<void> => {
    const fileId = await findOrCreateDriveFile(token)

    store.setDrive({
      fileId,
      fileName: BACKUP_FILENAME,
      syncMode: 'manual',
      syncOnStartup: true,
    })

    logger.info('useGoogle', 'Drive setup complete', { fileId })
  }

  const findOrCreateDriveFile = async (token: string): Promise<string> => {
    const gapi = googleAuth.getGapi()
    if (!gapi?.client?.drive) {
      await googleAuth.initialize()
    }

    const gapiClient = googleAuth.getGapi()
    if (!gapiClient?.client?.drive) {
      throw new Error('Google Drive API not loaded')
    }

    const searchResponse = await gapiClient.client.drive.files.list({
      q: `name='${BACKUP_FILENAME}' and trashed=false`,
      spaces: 'drive',
      fields: 'files(id, name, modifiedTime)',
    })

    const files = searchResponse.result.files || []

    if (files.length > 0) {
      return files[0].id
    }

    const createResponse = await gapiClient.client.drive.files.create({
      resource: { name: BACKUP_FILENAME, mimeType: 'application/json' },
      fields: 'id',
    })

    return createResponse.result.id
  }

  const connectCalendar = useCallback(async (): Promise<boolean> => {
    return connect('calendar')
  }, [connect])

  const connectDrive = useCallback(async (): Promise<boolean> => {
    return connect('drive')
  }, [connect])

  const reconnect = useCallback(async (): Promise<boolean> => {
    store.setIsConnecting(true)
    store.setLastError(null)

    try {
      const silentToken = await googleAuth.silentSignIn(store.accessToken || undefined)

      if (!silentToken) {
        const newToken = await googleAuth.signIn('both')
        const authState = googleAuth.getState()
        store.setAuthState({
          accessToken: authState.accessToken,
          grantedScopes: authState.grantedScopes,
          connectedAt: authState.connectedAt,
          lastValidated: authState.lastValidated,
        })

        if (store.calendar && hasCalendarAccess()) {
          await setupCalendar(newToken)
        }
        if (store.drive && hasDriveAccess()) {
          await setupDrive(newToken)
        }
      } else {
        const authState = googleAuth.getState()
        store.setAuthState({
          accessToken: authState.accessToken,
          grantedScopes: authState.grantedScopes,
          lastValidated: authState.lastValidated,
        })
      }

      toast.success('Reconnected to Google')
      return true
    } catch (error) {
      logger.error('useGoogle', 'Reconnection failed', error)
      store.setLastError('Failed to reconnect')
      toast.error('Failed to reconnect to Google')
      return false
    } finally {
      store.setIsConnecting(false)
    }
  }, [store])

  const disconnect = useCallback(() => {
    store.disconnect()
    setCalendarEvents([])
    setAvailableCalendars([])
    toast.info('Disconnected from Google')
  }, [store])

  const disconnectCalendar = useCallback(() => {
    store.disconnectCalendar()
    setCalendarEvents([])
    setAvailableCalendars([])
    toast.info('Disconnected from Google Calendar')
  }, [store])

  const disconnectDrive = useCallback(() => {
    store.disconnectDrive()
    toast.info('Disconnected from Google Drive')
  }, [store])

  const fetchEvents = useCallback(
    async (startDate: Date, endDate: Date): Promise<CalendarEventDisplay[]> => {
      if (!store.accessToken || !store.calendar?.selectedCalendarId) {
        return []
      }

      const isValid = await googleAuth.validateToken(store.accessToken)
      if (!isValid) {
        store.setLastError('Session expired')
        toast.warning('Google session expired. Please reconnect.')
        return []
      }

      store.setIsSyncing(true)

      try {
        const timeMin = startOfDay(startDate).toISOString()
        const timeMax = endOfDay(endDate).toISOString()

        const result = await fetchCalendarEvents(
          store.accessToken,
          store.calendar.selectedCalendarId,
          timeMin,
          timeMax
        )

        if (!result.success || !result.events) {
          throw new Error(result.error || 'Failed to fetch events')
        }

        const displayEvents: CalendarEventDisplay[] = []

        for (const event of result.events) {
          const eventStart = getEventDateTime(event)
          const eventEnd = getEventEndDateTime(event)
          const eventStartDay = startOfDay(eventStart)
          const eventEndDay = startOfDay(eventEnd)

          const isMultiDay = !isEqual(eventStartDay, eventEndDay)

          if (isMultiDay && isAllDayEvent(event)) {
            let currentDay = eventStartDay
            const lastDay = eventEndDay

            while (isBefore(currentDay, lastDay)) {
              const isFirstDay = isEqual(currentDay, eventStartDay)
              const dayCount = Math.ceil(
                (lastDay.getTime() - eventStartDay.getTime()) / (1000 * 60 * 60 * 24)
              )
              const currentDayNum =
                Math.ceil(
                  (currentDay.getTime() - eventStartDay.getTime()) / (1000 * 60 * 60 * 24)
                ) + 1

              displayEvents.push({
                id: `gcal-${event.id}-${format(currentDay, 'yyyy-MM-dd')}`,
                googleEventId: event.id,
                title: event.summary || '(No title)',
                date: format(currentDay, 'yyyy-MM-dd'),
                startTime: undefined,
                endTime: undefined,
                isAllDay: true,
                isMultiDay: true,
                multiDayInfo: isFirstDay
                  ? `Day 1 of ${dayCount}`
                  : `Day ${currentDayNum} of ${dayCount}`,
                description: event.description,
                htmlLink: event.htmlLink,
              })

              currentDay = addDays(currentDay, 1)
            }
          } else {
            displayEvents.push({
              id: `gcal-${event.id}`,
              googleEventId: event.id,
              title: event.summary || '(No title)',
              date: format(eventStart, 'yyyy-MM-dd'),
              startTime: isAllDayEvent(event) ? undefined : formatEventTime(event),
              endTime: event.end.dateTime
                ? format(parseISO(event.end.dateTime), 'HH:mm')
                : undefined,
              isAllDay: isAllDayEvent(event),
              description: event.description,
              htmlLink: event.htmlLink,
            })
          }
        }

        store.updateCalendar({ lastSyncAt: new Date().toISOString() })
        setCalendarEvents(displayEvents)

        return displayEvents
      } catch (error) {
        logger.error('useGoogle', 'Failed to fetch events', error)
        store.setLastError(String(error))
        return []
      } finally {
        store.setIsSyncing(false)
      }
    },
    [store]
  )

  const selectCalendar = useCallback(
    (calendar: CalendarListEntry) => {
      store.updateCalendar({
        selectedCalendarId: calendar.id,
        selectedCalendarName: calendar.summary,
      })
      setCalendarEvents([])
    },
    [store]
  )

  const deleteCalendarEvent = useCallback(
    async (eventId: string): Promise<boolean> => {
      if (!store.accessToken || !store.calendar?.selectedCalendarId) {
        return false
      }

      try {
        const result = await deleteCalendarEventApi(
          store.accessToken,
          store.calendar.selectedCalendarId,
          eventId
        )
        return result.success
      } catch (error) {
        logger.error('useGoogle', 'Failed to delete calendar event', error)
        return false
      }
    },
    [store]
  )

  const saveToDrive = useCallback(
    async (jsonData: string): Promise<boolean> => {
      if (!store.accessToken || !store.drive?.fileId) {
        return false
      }

      store.setIsSyncing(true)

      try {
        const response = await fetch(
          `https://www.googleapis.com/upload/drive/v3/files/${store.drive.fileId}?uploadType=media`,
          {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${store.accessToken}`,
              'Content-Type': 'application/json',
            },
            body: jsonData,
          }
        )

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.status}`)
        }

        store.updateDrive({ lastSyncAt: new Date().toISOString() })
        logger.info('useGoogle', 'Saved to Google Drive')
        return true
      } catch (error) {
        logger.error('useGoogle', 'Drive save failed', error)
        return false
      } finally {
        store.setIsSyncing(false)
      }
    },
    [store]
  )

  const loadFromDrive = useCallback(async (): Promise<string | null> => {
    if (!store.accessToken || !store.drive?.fileId) {
      return null
    }

    store.setIsSyncing(true)

    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${store.drive.fileId}?alt=media`,
        {
          headers: {
            Authorization: `Bearer ${store.accessToken}`,
          },
        }
      )

      if (!response.ok) {
        if (response.status === 404) {
          return ''
        }
        throw new Error(`Download failed: ${response.status}`)
      }

      const data = await response.text()
      store.updateDrive({ lastSyncAt: new Date().toISOString() })
      logger.info('useGoogle', 'Loaded from Google Drive', { size: data.length })
      return data
    } catch (error) {
      logger.error('useGoogle', 'Drive load failed', error)
      return null
    } finally {
      store.setIsSyncing(false)
    }
  }, [store])

  return {
    isConfigured: googleAuth.isConfigured(),
    isConnected: Boolean(store.accessToken),
    isConnecting: store.isConnecting,
    isValidating: store.isValidating,
    isSyncing: store.isSyncing,
    lastError: store.lastError,

    hasCalendarAccess: hasCalendarAccess(),
    hasDriveAccess: hasDriveAccess(),

    calendar: store.calendar,
    drive: store.drive,
    calendarEvents,
    availableCalendars,
    showCalendarEvents: store.showCalendarEvents,

    connect,
    connectCalendar,
    connectDrive,
    reconnect,
    disconnect,
    disconnectCalendar,
    disconnectDrive,

    fetchEvents,
    selectCalendar,
    deleteCalendarEvent,
    setShowCalendarEvents: store.setShowCalendarEvents,

    saveToDrive,
    loadFromDrive,
    setDriveSyncMode: (mode: 'manual' | 'auto') => store.updateDrive({ syncMode: mode }),
    setDriveSyncOnStartup: (enabled: boolean) => store.updateDrive({ syncOnStartup: enabled }),
  }
}
