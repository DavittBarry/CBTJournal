import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CalendarListEntry } from '@/utils/googleCalendar'

export interface CalendarConnection {
  accessToken: string
  connectedAt: string
  selectedCalendarId: string
  selectedCalendarName: string
  lastSyncAt?: string
  lastError?: string
}

interface CalendarState {
  connection: CalendarConnection | null
  availableCalendars: CalendarListEntry[]
  isConnecting: boolean
  isSyncing: boolean
  showCalendarEvents: boolean

  setConnection: (connection: CalendarConnection | null) => void
  updateConnection: (updates: Partial<CalendarConnection>) => void
  setAvailableCalendars: (calendars: CalendarListEntry[]) => void
  setIsConnecting: (isConnecting: boolean) => void
  setIsSyncing: (isSyncing: boolean) => void
  setShowCalendarEvents: (show: boolean) => void
  setLastError: (error: string | null) => void
  disconnect: () => void
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set) => ({
      connection: null,
      availableCalendars: [],
      isConnecting: false,
      isSyncing: false,
      showCalendarEvents: true,

      setConnection: (connection) => set({ connection }),

      updateConnection: (updates) =>
        set((state) => ({
          connection: state.connection ? { ...state.connection, ...updates } : null,
        })),

      setAvailableCalendars: (calendars) => set({ availableCalendars: calendars }),

      setIsConnecting: (isConnecting) => set({ isConnecting }),

      setIsSyncing: (isSyncing) => set({ isSyncing }),

      setShowCalendarEvents: (show) => set({ showCalendarEvents: show }),

      setLastError: (error) =>
        set((state) => ({
          connection: state.connection
            ? { ...state.connection, lastError: error || undefined }
            : null,
        })),

      disconnect: () =>
        set({
          connection: null,
          availableCalendars: [],
        }),
    }),
    {
      name: 'cbtjournal-calendar',
      partialize: (state) => ({
        connection: state.connection,
        showCalendarEvents: state.showCalendarEvents,
      }),
    }
  )
)
