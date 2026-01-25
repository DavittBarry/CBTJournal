import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { googleAuth, type GoogleAuthState } from '@/services/googleAuth'
import { useBackupStore } from '@/stores/backupStore'
import { fetchUserCalendars } from '@/utils/googleCalendar'
import { findOrCreateGoogleDriveFile } from '@/utils/cloudSync'
import { logger } from '@/utils/logger'

interface CalendarInfo {
  selectedCalendarId: string
  selectedCalendarName: string
  lastSyncAt?: string
}

interface DriveInfo {
  fileId?: string
  fileName: string
  lastSyncAt?: string
  syncMode: 'manual' | 'auto'
  syncOnStartup: boolean
}

interface GoogleState {
  accessToken: string | null
  grantedScopes: string[]
  connectedAt: string | null
  lastValidated: string | null
  lastError: string | null

  calendar: CalendarInfo | null
  drive: DriveInfo | null

  isConnecting: boolean
  isValidating: boolean
  isSyncing: boolean

  showCalendarEvents: boolean

  setAuthState: (state: Partial<GoogleAuthState>) => void
  setCalendar: (info: CalendarInfo | null) => void
  setDrive: (info: DriveInfo | null) => void
  updateCalendar: (updates: Partial<CalendarInfo>) => void
  updateDrive: (updates: Partial<DriveInfo>) => void
  setIsConnecting: (isConnecting: boolean) => void
  setIsValidating: (isValidating: boolean) => void
  setIsSyncing: (isSyncing: boolean) => void
  setShowCalendarEvents: (show: boolean) => void
  setLastError: (error: string | null) => void
  disconnect: () => void
  disconnectCalendar: () => void
  disconnectDrive: () => void
}

export const useGoogleStore = create<GoogleState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      grantedScopes: [],
      connectedAt: null,
      lastValidated: null,
      lastError: null,

      calendar: null,
      drive: null,

      isConnecting: false,
      isValidating: false,
      isSyncing: false,

      showCalendarEvents: true,

      setAuthState: (state) =>
        set((prev) => ({
          ...prev,
          ...state,
        })),

      setCalendar: (info) => set({ calendar: info }),

      setDrive: (info) => set({ drive: info }),

      updateCalendar: (updates) =>
        set((state) => ({
          calendar: state.calendar ? { ...state.calendar, ...updates } : null,
        })),

      updateDrive: (updates) =>
        set((state) => ({
          drive: state.drive ? { ...state.drive, ...updates } : null,
        })),

      setIsConnecting: (isConnecting) => set({ isConnecting }),

      setIsValidating: (isValidating) => set({ isValidating }),

      setIsSyncing: (isSyncing) => set({ isSyncing }),

      setShowCalendarEvents: (show) => set({ showCalendarEvents: show }),

      setLastError: (error) => set({ lastError: error }),

      disconnect: () => {
        googleAuth.signOut()
        set({
          accessToken: null,
          grantedScopes: [],
          connectedAt: null,
          lastValidated: null,
          lastError: null,
          calendar: null,
          drive: null,
        })
      },

      disconnectCalendar: () => {
        const state = get()
        if (!state.drive) {
          googleAuth.signOut()
          set({
            accessToken: null,
            grantedScopes: [],
            connectedAt: null,
            lastValidated: null,
            lastError: null,
            calendar: null,
          })
        } else {
          set({ calendar: null })
        }
      },

      disconnectDrive: () => {
        const state = get()
        if (!state.calendar) {
          googleAuth.signOut()
          set({
            accessToken: null,
            grantedScopes: [],
            connectedAt: null,
            lastValidated: null,
            lastError: null,
            drive: null,
          })
        } else {
          set({ drive: null })
        }
      },
    }),
    {
      name: 'cbtjournal-google',
      partialize: (state) => ({
        accessToken: state.accessToken,
        grantedScopes: state.grantedScopes,
        connectedAt: state.connectedAt,
        lastValidated: state.lastValidated,
        calendar: state.calendar,
        drive: state.drive,
        showCalendarEvents: state.showCalendarEvents,
      }),
    }
  )
)

let tokenRefreshInterval: ReturnType<typeof setInterval> | null = null
let visibilityHandler: (() => void) | null = null
const TOKEN_REFRESH_INTERVAL = 15 * 60 * 1000
const TOKEN_VALIDATION_CACHE_MS = 5 * 60 * 1000

export async function initializeGoogleConnection(): Promise<void> {
  const store = useGoogleStore.getState()
  const backupStore = useBackupStore.getState()

  if (!googleAuth.isConfigured()) {
    logger.debug('GoogleStore', 'Google not configured, skipping initialization')
    return
  }

  const existingGoogleDriveConnection = backupStore.cloudConnections.find(
    (c) => c.provider === 'google-drive'
  )

  const hasExistingToken = store.accessToken || existingGoogleDriveConnection?.accessToken
  const hasGoogleServices = store.calendar || store.drive || existingGoogleDriveConnection

  if (!hasExistingToken && !hasGoogleServices) {
    logger.debug('GoogleStore', 'No existing Google connection, skipping initialization')
    return
  }

  store.setIsValidating(true)
  store.setLastError(null)

  try {
    await googleAuth.initialize()

    const tokenToValidate = store.accessToken || existingGoogleDriveConnection?.accessToken
    const token = await googleAuth.silentSignIn(tokenToValidate || undefined)

    if (token) {
      const authState = googleAuth.getState()
      store.setAuthState({
        accessToken: authState.accessToken,
        grantedScopes: authState.grantedScopes,
        lastValidated: authState.lastValidated,
        connectedAt: store.connectedAt || authState.connectedAt,
      })

      const hasCalendarScopes = authState.grantedScopes.some(
        (s) => s.includes('calendar.events') || s.includes('calendar.readonly')
      )
      const hasDriveScopes = authState.grantedScopes.some((s) => s.includes('drive.file'))

      if (store.calendar && hasCalendarScopes) {
        try {
          const calendarsResult = await fetchUserCalendars(token)
          if (calendarsResult.success && calendarsResult.calendars) {
            const selectedCal = calendarsResult.calendars.find(
              (c) => c.id === store.calendar?.selectedCalendarId
            )
            if (selectedCal) {
              logger.info('GoogleStore', 'Calendar connection restored', {
                calendarId: selectedCal.id,
              })
            } else if (calendarsResult.calendars.length > 0) {
              const primaryCal =
                calendarsResult.calendars.find((c) => c.primary) || calendarsResult.calendars[0]
              store.setCalendar({
                selectedCalendarId: primaryCal.id,
                selectedCalendarName: primaryCal.summary,
                lastSyncAt: store.calendar?.lastSyncAt,
              })
              logger.info('GoogleStore', 'Calendar updated to available calendar', {
                calendarId: primaryCal.id,
              })
            }
          }
        } catch (calError) {
          logger.warn('GoogleStore', 'Failed to restore calendar, will retry on use', calError)
        }
      }

      if (existingGoogleDriveConnection && !store.drive) {
        store.setDrive({
          fileId: existingGoogleDriveConnection.fileId,
          fileName: existingGoogleDriveConnection.fileName || 'cbtjournal-data.json',
          lastSyncAt: existingGoogleDriveConnection.lastSyncAt,
          syncMode: existingGoogleDriveConnection.syncMode || 'manual',
          syncOnStartup: existingGoogleDriveConnection.syncOnStartup !== false,
        })
      }

      if (
        existingGoogleDriveConnection &&
        store.drive &&
        !store.drive.fileId &&
        existingGoogleDriveConnection.fileId
      ) {
        store.updateDrive({ fileId: existingGoogleDriveConnection.fileId })
        logger.info('GoogleStore', 'Migrated fileId from old connection', {
          fileId: existingGoogleDriveConnection.fileId,
        })
      }

      if ((store.drive || existingGoogleDriveConnection) && hasDriveScopes) {
        const driveInfo = store.drive || {
          fileId: existingGoogleDriveConnection?.fileId,
          fileName: existingGoogleDriveConnection?.fileName || 'cbtjournal-data.json',
        }

        if (!driveInfo.fileId) {
          try {
            const fileId = await findOrCreateGoogleDriveFile(token)
            store.updateDrive({ fileId })
            backupStore.updateCloudConnection('google-drive', { fileId })
            logger.info('GoogleStore', 'Drive file ID restored', { fileId })
          } catch (driveError) {
            logger.warn('GoogleStore', 'Failed to find/create Drive file', driveError)
          }
        }

        backupStore.updateCloudConnection('google-drive', {
          accessToken: token,
          lastError: null,
        })
      }

      startTokenRefreshTimer()
      startVisibilityHandler()

      logger.info('GoogleStore', 'Connection restored successfully', {
        hasCalendar: !!store.calendar,
        hasDrive: !!store.drive || !!existingGoogleDriveConnection,
        scopes: authState.grantedScopes,
      })
    } else if (tokenToValidate) {
      logger.info('GoogleStore', 'Silent sign-in failed, session may be expired')
      store.setLastError('Session expired. Please reconnect.')

      if (existingGoogleDriveConnection) {
        backupStore.setConnectionError('google-drive', 'Session expired. Please reconnect.')
      }
    }
  } catch (error) {
    logger.error('GoogleStore', 'Failed to initialize connection', error)
    store.setLastError('Failed to connect to Google')
  } finally {
    store.setIsValidating(false)
  }
}

function startTokenRefreshTimer(): void {
  if (tokenRefreshInterval) {
    clearInterval(tokenRefreshInterval)
  }

  tokenRefreshInterval = setInterval(async () => {
    const store = useGoogleStore.getState()
    if (!store.accessToken) {
      stopTokenRefreshTimer()
      return
    }

    try {
      const isValid = await googleAuth.validateToken(store.accessToken)
      if (!isValid) {
        logger.info('GoogleStore', 'Token expired, attempting silent refresh')
        const newToken = await googleAuth.silentSignIn(store.accessToken)
        if (newToken) {
          const authState = googleAuth.getState()
          store.setAuthState({
            accessToken: authState.accessToken,
            grantedScopes: authState.grantedScopes,
            lastValidated: authState.lastValidated,
          })
          store.setLastError(null)
          logger.info('GoogleStore', 'Token refreshed successfully')
        } else {
          store.setLastError('Session expired. Please reconnect.')
          stopTokenRefreshTimer()
        }
      } else {
        store.setAuthState({
          lastValidated: new Date().toISOString(),
        })
      }
    } catch (error) {
      logger.warn('GoogleStore', 'Token refresh check failed', error)
    }
  }, TOKEN_REFRESH_INTERVAL)

  logger.debug('GoogleStore', 'Token refresh timer started')
}

function stopTokenRefreshTimer(): void {
  if (tokenRefreshInterval) {
    clearInterval(tokenRefreshInterval)
    tokenRefreshInterval = null
    logger.debug('GoogleStore', 'Token refresh timer stopped')
  }
}

function startVisibilityHandler(): void {
  if (visibilityHandler) return

  visibilityHandler = async () => {
    if (document.visibilityState !== 'visible') return

    const store = useGoogleStore.getState()
    if (!store.accessToken) return

    const lastValidatedTime = store.lastValidated ? new Date(store.lastValidated).getTime() : 0
    const timeSinceValidation = Date.now() - lastValidatedTime

    if (timeSinceValidation < TOKEN_VALIDATION_CACHE_MS) {
      logger.debug('GoogleStore', 'Skipping visibility refresh, recently validated')
      return
    }

    logger.debug('GoogleStore', 'Tab became visible, validating token')

    try {
      const isValid = await googleAuth.validateToken(store.accessToken)
      if (isValid) {
        store.setAuthState({
          lastValidated: new Date().toISOString(),
        })
        store.setLastError(null)
      } else {
        logger.info('GoogleStore', 'Token invalid on visibility, attempting silent refresh')
        const newToken = await googleAuth.silentSignIn(store.accessToken)
        if (newToken) {
          const authState = googleAuth.getState()
          store.setAuthState({
            accessToken: authState.accessToken,
            grantedScopes: authState.grantedScopes,
            lastValidated: authState.lastValidated,
          })
          store.setLastError(null)
          logger.info('GoogleStore', 'Token refreshed on visibility change')
        } else {
          store.setLastError('Session expired. Please reconnect.')
        }
      }
    } catch (error) {
      logger.debug('GoogleStore', 'Visibility refresh check failed', error)
    }
  }

  document.addEventListener('visibilitychange', visibilityHandler)
  logger.debug('GoogleStore', 'Visibility handler started')
}

function stopVisibilityHandler(): void {
  if (visibilityHandler) {
    document.removeEventListener('visibilitychange', visibilityHandler)
    visibilityHandler = null
    logger.debug('GoogleStore', 'Visibility handler stopped')
  }
}

export function cleanupGoogleConnection(): void {
  stopTokenRefreshTimer()
  stopVisibilityHandler()
}

export function startGoogleConnectionHandlers(): void {
  const store = useGoogleStore.getState()
  if (store.accessToken) {
    startTokenRefreshTimer()
    startVisibilityHandler()
    logger.debug('GoogleStore', 'Connection handlers started')
  }
}

export function hasCalendarAccess(): boolean {
  const state = useGoogleStore.getState()
  return state.grantedScopes.some(
    (s) => s.includes('calendar.events') || s.includes('calendar.readonly')
  )
}

export function hasDriveAccess(): boolean {
  const state = useGoogleStore.getState()
  return state.grantedScopes.some((s) => s.includes('drive.file'))
}

export async function ensureGoogleConnection(
  service: 'calendar' | 'drive'
): Promise<string | null> {
  const store = useGoogleStore.getState()

  if (!googleAuth.isConfigured()) {
    return null
  }

  if (store.accessToken) {
    const isValid = await googleAuth.validateToken(store.accessToken)
    if (isValid) {
      const hasRequiredScope = service === 'calendar' ? hasCalendarAccess() : hasDriveAccess()

      if (hasRequiredScope) {
        return store.accessToken
      }
    }
  }

  try {
    const token = await googleAuth.silentSignIn(store.accessToken || undefined)
    if (token) {
      const authState = googleAuth.getState()
      store.setAuthState({
        accessToken: authState.accessToken,
        grantedScopes: authState.grantedScopes,
        lastValidated: authState.lastValidated,
      })
      store.setLastError(null)

      if (!tokenRefreshInterval) {
        startTokenRefreshTimer()
      }

      return token
    }
  } catch (error) {
    logger.debug('GoogleStore', 'Silent sign-in failed during ensure', error)
  }

  return null
}

export async function getValidGoogleToken(): Promise<string | null> {
  const store = useGoogleStore.getState()

  if (!store.accessToken) {
    return null
  }

  const lastValidatedTime = store.lastValidated ? new Date(store.lastValidated).getTime() : 0
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000

  if (lastValidatedTime > fiveMinutesAgo) {
    return store.accessToken
  }

  const isValid = await googleAuth.validateToken(store.accessToken)
  if (isValid) {
    store.setAuthState({
      lastValidated: new Date().toISOString(),
    })
    return store.accessToken
  }

  try {
    const newToken = await googleAuth.silentSignIn(store.accessToken)
    if (newToken) {
      const authState = googleAuth.getState()
      store.setAuthState({
        accessToken: authState.accessToken,
        grantedScopes: authState.grantedScopes,
        lastValidated: authState.lastValidated,
      })
      store.setLastError(null)
      return newToken
    }
  } catch (error) {
    logger.warn('GoogleStore', 'Failed to refresh token', error)
  }

  store.setLastError('Session expired. Please reconnect.')
  return null
}
