import { useState, useCallback } from 'react'
import { useCalendarStore } from '@/stores/calendarStore'
import {
  fetchCalendarEvents,
  fetchUserCalendars,
  validateCalendarToken,
  type GoogleCalendarEvent,
  type CalendarListEntry,
  getEventDateTime,
  isAllDayEvent,
  formatEventTime,
} from '@/utils/googleCalendar'
import type { CalendarEventDisplay } from '@/types'
import { logger } from '@/utils/logger'
import { toast } from '@/stores/toastStore'
import { format, parseISO, startOfDay, endOfDay } from 'date-fns'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || ''

interface GoogleTokenResponse {
  access_token: string
  error?: string
}

interface GoogleTokenClient {
  requestAccessToken: (options: { prompt: string }) => void
}

interface GoogleOAuth2 {
  initTokenClient: (config: {
    client_id: string
    scope: string
    callback: (response: GoogleTokenResponse) => void
  }) => GoogleTokenClient
}

interface GoogleAccounts {
  oauth2: GoogleOAuth2
}

interface GoogleIdentityServices {
  accounts: GoogleAccounts
}

interface WindowWithGoogle extends Window {
  google?: GoogleIdentityServices
}

const CALENDAR_SCOPE =
  'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly'

let tokenClient: GoogleTokenClient | null = null

const loadGoogleIdentityServices = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const win = window as WindowWithGoogle
    if (win.google?.accounts?.oauth2) {
      resolve()
      return
    }

    if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
      const checkLoaded = setInterval(() => {
        if (win.google?.accounts?.oauth2) {
          clearInterval(checkLoaded)
          resolve()
        }
      }, 100)
      setTimeout(() => {
        clearInterval(checkLoaded)
        reject(new Error('Timeout loading Google Identity Services'))
      }, 10000)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.onload = () => {
      const checkLoaded = setInterval(() => {
        if (win.google?.accounts?.oauth2) {
          clearInterval(checkLoaded)
          resolve()
        }
      }, 100)
      setTimeout(() => {
        clearInterval(checkLoaded)
        reject(new Error('Timeout loading Google Identity Services'))
      }, 5000)
    }
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'))
    document.head.appendChild(script)
  })
}

export const isCalendarConfigured = (): boolean => {
  return Boolean(GOOGLE_CLIENT_ID && GOOGLE_API_KEY)
}

export function useGoogleCalendar() {
  const {
    connection,
    availableCalendars,
    isConnecting,
    isSyncing,
    showCalendarEvents,
    setConnection,
    updateConnection,
    setAvailableCalendars,
    setIsConnecting,
    setIsSyncing,
    setShowCalendarEvents,
    setLastError,
    disconnect,
  } = useCalendarStore()

  const [calendarEvents, setCalendarEvents] = useState<CalendarEventDisplay[]>([])

  const connect = useCallback(async (): Promise<boolean> => {
    if (!isCalendarConfigured()) {
      toast.error('Google Calendar is not configured')
      return false
    }

    setIsConnecting(true)
    setLastError(null)

    try {
      await loadGoogleIdentityServices()

      const win = window as WindowWithGoogle
      if (!win.google?.accounts?.oauth2) {
        throw new Error('Google Identity Services not available')
      }

      return new Promise((resolve) => {
        tokenClient = win.google!.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: CALENDAR_SCOPE,
          callback: async (response: GoogleTokenResponse) => {
            if (response.error) {
              logger.error('Calendar', 'Auth failed', response)
              setLastError(response.error)
              toast.error('Failed to connect to Google Calendar')
              setIsConnecting(false)
              resolve(false)
              return
            }

            try {
              const calendarsResult = await fetchUserCalendars(response.access_token)
              if (!calendarsResult.success || !calendarsResult.calendars) {
                throw new Error(calendarsResult.error || 'Failed to fetch calendars')
              }

              setAvailableCalendars(calendarsResult.calendars)

              const primaryCalendar =
                calendarsResult.calendars.find((c) => c.primary) || calendarsResult.calendars[0]

              if (!primaryCalendar) {
                throw new Error('No calendars found')
              }

              setConnection({
                accessToken: response.access_token,
                connectedAt: new Date().toISOString(),
                selectedCalendarId: primaryCalendar.id,
                selectedCalendarName: primaryCalendar.summary,
              })

              logger.info('Calendar', 'Connected successfully', {
                calendarId: primaryCalendar.id,
              })
              toast.success('Connected to Google Calendar')
              setIsConnecting(false)
              resolve(true)
            } catch (error) {
              logger.error('Calendar', 'Post-auth setup failed', error)
              setLastError(String(error))
              toast.error('Failed to set up calendar connection')
              setIsConnecting(false)
              resolve(false)
            }
          },
        })

        tokenClient.requestAccessToken({ prompt: 'consent' })
      })
    } catch (error) {
      logger.error('Calendar', 'Connection failed', error)
      setLastError(String(error))
      toast.error('Failed to connect to Google Calendar')
      setIsConnecting(false)
      return false
    }
  }, [setConnection, setAvailableCalendars, setIsConnecting, setLastError])

  const validateConnection = useCallback(async (): Promise<boolean> => {
    if (!connection?.accessToken) {
      return false
    }

    try {
      const isValid = await validateCalendarToken(connection.accessToken)
      if (!isValid) {
        setLastError('Session expired')
        return false
      }
      return true
    } catch {
      return false
    }
  }, [connection?.accessToken, setLastError])

  const fetchEvents = useCallback(
    async (startDate: Date, endDate: Date): Promise<CalendarEventDisplay[]> => {
      if (!connection?.accessToken || !connection.selectedCalendarId) {
        return []
      }

      const isValid = await validateConnection()
      if (!isValid) {
        toast.warning('Calendar session expired. Please reconnect.')
        return []
      }

      setIsSyncing(true)

      try {
        const timeMin = startOfDay(startDate).toISOString()
        const timeMax = endOfDay(endDate).toISOString()

        const result = await fetchCalendarEvents(
          connection.accessToken,
          connection.selectedCalendarId,
          timeMin,
          timeMax
        )

        if (!result.success || !result.events) {
          throw new Error(result.error || 'Failed to fetch events')
        }

        const displayEvents: CalendarEventDisplay[] = result.events.map(
          (event: GoogleCalendarEvent) => {
            const eventDate = getEventDateTime(event)
            return {
              id: `gcal-${event.id}`,
              googleEventId: event.id,
              title: event.summary || '(No title)',
              date: format(eventDate, 'yyyy-MM-dd'),
              startTime: isAllDayEvent(event) ? undefined : formatEventTime(event),
              endTime: event.end.dateTime
                ? format(parseISO(event.end.dateTime), 'HH:mm')
                : undefined,
              isAllDay: isAllDayEvent(event),
              description: event.description,
              htmlLink: event.htmlLink,
            }
          }
        )

        updateConnection({ lastSyncAt: new Date().toISOString() })
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
    [
      connection?.accessToken,
      connection?.selectedCalendarId,
      validateConnection,
      updateConnection,
      setIsSyncing,
      setLastError,
    ]
  )

  const selectCalendar = useCallback(
    (calendar: CalendarListEntry) => {
      updateConnection({
        selectedCalendarId: calendar.id,
        selectedCalendarName: calendar.summary,
      })
      setCalendarEvents([])
    },
    [updateConnection]
  )

  const handleDisconnect = useCallback(() => {
    disconnect()
    setCalendarEvents([])
    tokenClient = null
    toast.info('Disconnected from Google Calendar')
  }, [disconnect])

  return {
    isConfigured: isCalendarConfigured(),
    isConnected: Boolean(connection?.accessToken),
    isConnecting,
    isSyncing,
    connection,
    availableCalendars,
    calendarEvents,
    showCalendarEvents,
    connect,
    disconnect: handleDisconnect,
    fetchEvents,
    selectCalendar,
    setShowCalendarEvents,
    validateConnection,
  }
}
