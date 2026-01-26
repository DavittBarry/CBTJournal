import { useState, useCallback, useEffect } from 'react'
import {
  useGoogleStore,
  getValidGoogleToken,
  startGoogleConnectionHandlers,
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
} from '@/utils/googleCalendar'
import type { CalendarEventDisplay } from '@/types'
import { logger } from '@/utils/logger'
import { toast } from '@/stores/toastStore'
import { format, parseISO, startOfDay, endOfDay, addDays, isBefore, isEqual } from 'date-fns'

export const isCalendarConfigured = (): boolean => {
  return googleAuth.isConfigured()
}

export function useGoogleCalendar() {
  const {
    accessToken,
    grantedScopes,
    calendar,
    isConnecting,
    isSyncing,
    showCalendarEvents,
    lastError,
    setAuthState,
    setCalendar,
    updateCalendar,
    setIsConnecting,
    setIsSyncing,
    setShowCalendarEvents,
    setLastError,
    disconnectCalendar,
  } = useGoogleStore()

  const [calendarEvents, setCalendarEvents] = useState<CalendarEventDisplay[]>([])
  const [availableCalendars, setAvailableCalendars] = useState<CalendarListEntry[]>([])

  const hasCalendarAccess = grantedScopes.some(
    (s) => s.includes('calendar.events') || s.includes('calendar.readonly')
  )

  const connect = useCallback(async (): Promise<boolean> => {
    if (!isCalendarConfigured()) {
      toast.error('Google Calendar is not configured')
      return false
    }

    setIsConnecting(true)
    setLastError(null)

    try {
      await googleAuth.initialize()

      let token = accessToken

      if (!token || !hasCalendarAccess) {
        if (token && !hasCalendarAccess) {
          token = await googleAuth.requestAdditionalScopes('calendar')
        } else {
          token = await googleAuth.signIn('calendar')
        }
      }

      const authState = googleAuth.getState()
      setAuthState({
        accessToken: authState.accessToken,
        grantedScopes: authState.grantedScopes,
        connectedAt: authState.connectedAt,
        lastValidated: authState.lastValidated,
      })

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

      setCalendar({
        selectedCalendarId: primaryCalendar.id,
        selectedCalendarName: primaryCalendar.summary,
      })

      startGoogleConnectionHandlers()

      logger.info('Calendar', 'Connected successfully', {
        calendarId: primaryCalendar.id,
      })
      toast.success('Connected to Google Calendar')
      setIsConnecting(false)
      return true
    } catch (error) {
      logger.error('Calendar', 'Connection failed', error)
      setLastError(String(error))
      if (error instanceof Error && error.message !== 'popup_closed_by_user') {
        toast.error('Failed to connect to Google Calendar')
      }
      setIsConnecting(false)
      return false
    }
  }, [accessToken, hasCalendarAccess, setAuthState, setCalendar, setIsConnecting, setLastError])

  const validateConnection = useCallback(async (): Promise<boolean> => {
    const token = await getValidGoogleToken()
    if (!token) {
      setLastError('Session expired')
      return false
    }
    return true
  }, [setLastError])

  const refreshConnectionSilently = useCallback(async (): Promise<boolean> => {
    if (!calendar) return false

    try {
      const token = await getValidGoogleToken()
      if (token) {
        const authState = googleAuth.getState()
        setAuthState({
          accessToken: authState.accessToken,
          grantedScopes: authState.grantedScopes,
          lastValidated: authState.lastValidated,
        })

        if (authState.grantedScopes.some((s) => s.includes('calendar'))) {
          const calendarsResult = await fetchUserCalendars(token)
          if (calendarsResult.success && calendarsResult.calendars) {
            setAvailableCalendars(calendarsResult.calendars)
          }
        }

        return true
      }
      return false
    } catch (error) {
      logger.debug('Calendar', 'Silent refresh failed', error)
      return false
    }
  }, [calendar, setAuthState])

  useEffect(() => {
    if (calendar && accessToken && hasCalendarAccess && availableCalendars.length === 0) {
      fetchUserCalendars(accessToken).then((result) => {
        if (result.success && result.calendars) {
          setAvailableCalendars(result.calendars)
        }
      })
    }
  }, [calendar, accessToken, hasCalendarAccess, availableCalendars.length])

  const fetchEvents = useCallback(
    async (startDate: Date, endDate: Date): Promise<CalendarEventDisplay[]> => {
      if (!calendar?.selectedCalendarId) {
        return []
      }

      const token = await getValidGoogleToken()
      if (!token) {
        toast.warning('Calendar session expired. Please reconnect.')
        return []
      }

      setIsSyncing(true)

      try {
        const timeMin = startOfDay(startDate).toISOString()
        const timeMax = endOfDay(endDate).toISOString()

        const result = await fetchCalendarEvents(
          token,
          calendar.selectedCalendarId,
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

        updateCalendar({ lastSyncAt: new Date().toISOString() })
        setCalendarEvents(displayEvents)
        setIsSyncing(false)

        return displayEvents
      } catch (error) {
        logger.error('Calendar', 'Failed to fetch events', error)
        setLastError(String(error))
        setIsSyncing(false)
        return []
      }
    },
    [calendar?.selectedCalendarId, updateCalendar, setIsSyncing, setLastError]
  )

  const selectCalendar = useCallback(
    (cal: CalendarListEntry) => {
      setCalendar({
        selectedCalendarId: cal.id,
        selectedCalendarName: cal.summary,
      })
      setCalendarEvents([])
    },
    [setCalendar]
  )

  const handleDisconnect = useCallback(() => {
    disconnectCalendar()
    setCalendarEvents([])
    setAvailableCalendars([])
    toast.info('Disconnected from Google Calendar')
  }, [disconnectCalendar])

  return {
    isConfigured: isCalendarConfigured(),
    isConnected: Boolean(accessToken && calendar && hasCalendarAccess),
    isConnecting,
    isSyncing,
    connection: calendar
      ? {
          accessToken,
          connectedAt: useGoogleStore.getState().connectedAt || '',
          selectedCalendarId: calendar.selectedCalendarId,
          selectedCalendarName: calendar.selectedCalendarName,
          lastSyncAt: calendar.lastSyncAt,
          lastError: lastError || undefined,
        }
      : null,
    availableCalendars,
    calendarEvents,
    showCalendarEvents,
    connect,
    disconnect: handleDisconnect,
    fetchEvents,
    selectCalendar,
    setShowCalendarEvents,
    validateConnection,
    refreshConnectionSilently,
  }
}
