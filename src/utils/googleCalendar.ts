import { logger } from '@/utils/logger'

export interface GoogleCalendarEvent {
  id: string
  summary: string
  description?: string
  start: {
    dateTime?: string
    date?: string
    timeZone?: string
  }
  end: {
    dateTime?: string
    date?: string
    timeZone?: string
  }
  status: 'confirmed' | 'tentative' | 'cancelled'
  htmlLink?: string
  created?: string
  updated?: string
}

export interface CalendarListEntry {
  id: string
  summary: string
  primary?: boolean
  backgroundColor?: string
  accessRole: 'owner' | 'writer' | 'reader' | 'freeBusyReader'
}

export interface FetchEventsResult {
  success: boolean
  events?: GoogleCalendarEvent[]
  error?: string
}

export interface FetchCalendarsResult {
  success: boolean
  calendars?: CalendarListEntry[]
  error?: string
}

export interface CreateEventResult {
  success: boolean
  event?: GoogleCalendarEvent
  error?: string
}

export interface UpdateEventResult {
  success: boolean
  event?: GoogleCalendarEvent
  error?: string
}

export interface DeleteEventResult {
  success: boolean
  error?: string
}

const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3'

export const CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly',
]

export const getCalendarAuthScope = (): string => {
  return CALENDAR_SCOPES.join(' ')
}

export const fetchUserCalendars = async (accessToken: string): Promise<FetchCalendarsResult> => {
  try {
    const response = await fetch(`${CALENDAR_API_BASE}/users/me/calendarList`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorDetails = errorText
      try {
        const errorJson = JSON.parse(errorText)
        errorDetails = JSON.stringify(errorJson, null, 2)
        logger.error('GoogleCalendar', 'Failed to fetch calendars', {
          status: response.status,
          error: errorJson.error?.message || errorText,
          reason: errorJson.error?.errors?.[0]?.reason,
          fullError: errorJson,
        })
      } catch {
        logger.error('GoogleCalendar', 'Failed to fetch calendars', {
          status: response.status,
          error: errorText,
        })
      }
      return {
        success: false,
        error: `Failed to fetch calendars: ${response.status} - ${errorDetails}`,
      }
    }

    const data = await response.json()
    const calendars: CalendarListEntry[] = data.items || []

    logger.info('GoogleCalendar', 'Fetched calendars', { count: calendars.length })
    return { success: true, calendars }
  } catch (error) {
    logger.error('GoogleCalendar', 'Error fetching calendars', error)
    return { success: false, error: String(error) }
  }
}

export const fetchCalendarEvents = async (
  accessToken: string,
  calendarId: string,
  timeMin: string,
  timeMax: string
): Promise<FetchEventsResult> => {
  try {
    const params = new URLSearchParams({
      timeMin,
      timeMax,
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '100',
    })

    const response = await fetch(
      `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      const error = await response.text()
      logger.error('GoogleCalendar', 'Failed to fetch events', { status: response.status, error })
      return { success: false, error: `Failed to fetch events: ${response.status}` }
    }

    const data = await response.json()
    const events: GoogleCalendarEvent[] = (data.items || []).filter(
      (e: GoogleCalendarEvent) => e.status !== 'cancelled'
    )

    logger.info('GoogleCalendar', 'Fetched events', { calendarId, count: events.length })
    return { success: true, events }
  } catch (error) {
    logger.error('GoogleCalendar', 'Error fetching events', error)
    return { success: false, error: String(error) }
  }
}

export const createCalendarEvent = async (
  accessToken: string,
  calendarId: string,
  event: {
    summary: string
    description?: string
    start: { dateTime: string; timeZone?: string }
    end: { dateTime: string; timeZone?: string }
  }
): Promise<CreateEventResult> => {
  try {
    const response = await fetch(
      `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      logger.error('GoogleCalendar', 'Failed to create event', { status: response.status, error })
      return { success: false, error: `Failed to create event: ${response.status}` }
    }

    const createdEvent: GoogleCalendarEvent = await response.json()
    logger.info('GoogleCalendar', 'Created event', { eventId: createdEvent.id })
    return { success: true, event: createdEvent }
  } catch (error) {
    logger.error('GoogleCalendar', 'Error creating event', error)
    return { success: false, error: String(error) }
  }
}

export const updateCalendarEvent = async (
  accessToken: string,
  calendarId: string,
  eventId: string,
  event: {
    summary?: string
    description?: string
    start?: { dateTime: string; timeZone?: string }
    end?: { dateTime: string; timeZone?: string }
  }
): Promise<UpdateEventResult> => {
  try {
    const response = await fetch(
      `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      logger.error('GoogleCalendar', 'Failed to update event', { status: response.status, error })
      return { success: false, error: `Failed to update event: ${response.status}` }
    }

    const updatedEvent: GoogleCalendarEvent = await response.json()
    logger.info('GoogleCalendar', 'Updated event', { eventId: updatedEvent.id })
    return { success: true, event: updatedEvent }
  } catch (error) {
    logger.error('GoogleCalendar', 'Error updating event', error)
    return { success: false, error: String(error) }
  }
}

export const deleteCalendarEvent = async (
  accessToken: string,
  calendarId: string,
  eventId: string
): Promise<DeleteEventResult> => {
  try {
    const response = await fetch(
      `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok && response.status !== 204) {
      const error = await response.text()
      logger.error('GoogleCalendar', 'Failed to delete event', { status: response.status, error })
      return { success: false, error: `Failed to delete event: ${response.status}` }
    }

    logger.info('GoogleCalendar', 'Deleted event', { eventId })
    return { success: true }
  } catch (error) {
    logger.error('GoogleCalendar', 'Error deleting event', error)
    return { success: false, error: String(error) }
  }
}

export const getEventDateTime = (event: GoogleCalendarEvent): Date => {
  const startStr = event.start.dateTime || event.start.date
  if (!startStr) {
    return new Date()
  }
  return new Date(startStr)
}

export const getEventEndDateTime = (event: GoogleCalendarEvent): Date => {
  const endStr = event.end.dateTime || event.end.date
  if (!endStr) {
    return new Date()
  }
  return new Date(endStr)
}

export const isAllDayEvent = (event: GoogleCalendarEvent): boolean => {
  return !event.start.dateTime && !!event.start.date
}

export const formatEventTime = (event: GoogleCalendarEvent): string => {
  if (isAllDayEvent(event)) {
    return 'All day'
  }
  const date = getEventDateTime(event)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export const getEventDurationMinutes = (event: GoogleCalendarEvent): number => {
  const start = getEventDateTime(event)
  const end = getEventEndDateTime(event)
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60))
}

export const validateCalendarToken = async (accessToken: string): Promise<boolean> => {
  try {
    const response = await fetch(`${CALENDAR_API_BASE}/users/me/calendarList?maxResults=1`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    return response.ok
  } catch {
    return false
  }
}
