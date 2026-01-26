import { useState, useEffect, useCallback } from 'react'
import {
  useGoogleStore,
  hasCalendarAccess,
  hasDriveAccess,
  cleanupGoogleConnection,
  startGoogleConnectionHandlers,
} from '@/stores/googleStore'
import { useAppStore } from '@/stores/appStore'
import { googleAuth } from '@/services/googleAuth'
import { fetchUserCalendars, type CalendarListEntry } from '@/utils/googleCalendar'
import { findOrCreateGoogleDriveFile, isGoogleDriveConfigured } from '@/utils/cloudSync'
import { toast } from '@/stores/toastStore'
import { logger } from '@/utils/logger'

export function GoogleConnectionCard() {
  const {
    accessToken,
    grantedScopes,
    lastValidated,
    lastError,
    calendar,
    drive,
    isConnecting,
    isValidating,
    isSyncing,
    setAuthState,
    setCalendar,
    setDrive,
    updateDrive,
    setIsConnecting,
    setLastError,
    disconnect,
    showCalendarEvents,
    setShowCalendarEvents,
  } = useGoogleStore()

  const { syncToCloud, syncFromCloud } = useAppStore()

  const [availableCalendars, setAvailableCalendars] = useState<CalendarListEntry[]>([])
  const [isExpanded, setIsExpanded] = useState(false)

  const isConnected = Boolean(accessToken && grantedScopes.length > 0)
  const hasCalendar = hasCalendarAccess()
  const hasDrive = hasDriveAccess()

  const getLastSyncText = (lastSyncAt?: string | null) => {
    if (!lastSyncAt) return null
    const diff = Date.now() - new Date(lastSyncAt).getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
    const days = Math.floor(hours / 24)
    return `${days} day${days === 1 ? '' : 's'} ago`
  }

  useEffect(() => {
    if (isConnected && hasCalendar && accessToken && availableCalendars.length === 0) {
      fetchUserCalendars(accessToken).then((result) => {
        if (result.success && result.calendars) {
          setAvailableCalendars(result.calendars)
        }
      })
    }
  }, [isConnected, hasCalendar, accessToken, availableCalendars.length])

  const handleConnect = useCallback(
    async (services: 'both' | 'calendar' | 'drive') => {
      if (!isGoogleDriveConfigured()) {
        toast.error('Google is not configured')
        return
      }

      setIsConnecting(true)
      setLastError(null)

      try {
        await googleAuth.initialize()

        let token: string
        if (services === 'both') {
          token = await googleAuth.signIn('both')
        } else {
          token = await googleAuth.signIn(services)
        }

        const authState = googleAuth.getState()
        setAuthState({
          accessToken: authState.accessToken,
          grantedScopes: authState.grantedScopes,
          connectedAt: authState.connectedAt,
          lastValidated: authState.lastValidated,
        })

        const newHasCalendar = authState.grantedScopes.some(
          (s) => s.includes('calendar.events') || s.includes('calendar.readonly')
        )
        const newHasDrive = authState.grantedScopes.some((s) => s.includes('drive.file'))

        if (newHasCalendar && !calendar) {
          const calendarsResult = await fetchUserCalendars(token)
          if (calendarsResult.success && calendarsResult.calendars) {
            setAvailableCalendars(calendarsResult.calendars)
            const primaryCal =
              calendarsResult.calendars.find((c) => c.primary) || calendarsResult.calendars[0]
            if (primaryCal) {
              setCalendar({
                selectedCalendarId: primaryCal.id,
                selectedCalendarName: primaryCal.summary,
              })
            }
          }
        }

        if (newHasDrive && !drive?.fileId) {
          try {
            const fileId = await findOrCreateGoogleDriveFile(token)
            setDrive({
              fileId,
              fileName: 'cbtjournal-data.json',
              syncMode: 'manual',
              syncOnStartup: true,
            })
          } catch (driveError) {
            logger.warn('GoogleConnection', 'Failed to set up Drive file', driveError)
          }
        }

        startGoogleConnectionHandlers()
        toast.success('Connected to Google')
        logger.info('GoogleConnection', 'Connected successfully', {
          scopes: authState.grantedScopes,
        })
      } catch (error) {
        if (error instanceof Error && error.message !== 'popup_closed_by_user') {
          logger.error('GoogleConnection', 'Connection failed', error)
          setLastError(String(error))
          toast.error('Failed to connect to Google')
        }
      } finally {
        setIsConnecting(false)
      }
    },
    [calendar, drive?.fileId, setAuthState, setCalendar, setDrive, setIsConnecting, setLastError]
  )

  const handleAddService = useCallback(
    async (service: 'calendar' | 'drive') => {
      if (!accessToken) return

      setIsConnecting(true)
      setLastError(null)

      try {
        const token = await googleAuth.requestAdditionalScopes(service)

        const authState = googleAuth.getState()
        setAuthState({
          accessToken: authState.accessToken,
          grantedScopes: authState.grantedScopes,
          lastValidated: authState.lastValidated,
        })

        if (service === 'calendar') {
          const calendarsResult = await fetchUserCalendars(token)
          if (calendarsResult.success && calendarsResult.calendars) {
            setAvailableCalendars(calendarsResult.calendars)
            const primaryCal =
              calendarsResult.calendars.find((c) => c.primary) || calendarsResult.calendars[0]
            if (primaryCal) {
              setCalendar({
                selectedCalendarId: primaryCal.id,
                selectedCalendarName: primaryCal.summary,
              })
            }
          }
          toast.success('Calendar access enabled')
        } else {
          const fileId = await findOrCreateGoogleDriveFile(token)
          setDrive({
            fileId,
            fileName: 'cbtjournal-data.json',
            syncMode: 'manual',
            syncOnStartup: true,
          })
          toast.success('Drive backup enabled')
        }
      } catch (error) {
        if (error instanceof Error && error.message !== 'popup_closed_by_user') {
          logger.error('GoogleConnection', 'Failed to add service', error)
          toast.error(`Failed to enable ${service}`)
        }
      } finally {
        setIsConnecting(false)
      }
    },
    [accessToken, setAuthState, setCalendar, setDrive, setIsConnecting, setLastError]
  )

  const handleSelectCalendar = useCallback(
    (cal: CalendarListEntry) => {
      setCalendar({
        selectedCalendarId: cal.id,
        selectedCalendarName: cal.summary,
      })
      toast.success(`Switched to ${cal.summary}`)
    },
    [setCalendar]
  )

  const handleDisconnect = useCallback(() => {
    cleanupGoogleConnection()
    disconnect()
    setAvailableCalendars([])
    toast.info('Disconnected from Google')
  }, [disconnect])

  const handleRefreshConnection = useCallback(async () => {
    if (!accessToken) return

    try {
      const token = await googleAuth.silentSignIn(accessToken)
      if (token) {
        const authState = googleAuth.getState()
        setAuthState({
          accessToken: authState.accessToken,
          grantedScopes: authState.grantedScopes,
          lastValidated: authState.lastValidated,
        })
        setLastError(null)
        toast.success('Connection refreshed')
      } else {
        setLastError('Session expired. Please reconnect.')
      }
    } catch (error) {
      logger.error('GoogleConnection', 'Refresh failed', error)
      setLastError('Failed to refresh connection')
    }
  }, [accessToken, setAuthState, setLastError])

  const handleSyncToCloud = useCallback(async () => {
    const success = await syncToCloud('google-drive')
    if (success) {
      toast.success('Synced to Google Drive')
    }
  }, [syncToCloud])

  const handleSyncFromCloud = useCallback(async () => {
    await syncFromCloud('google-drive')
  }, [syncFromCloud])

  const handleToggleSyncMode = useCallback(() => {
    if (!drive) return
    const newMode = drive.syncMode === 'auto' ? 'manual' : 'auto'
    updateDrive({ syncMode: newMode })
    toast.info(newMode === 'auto' ? 'Auto-sync enabled' : 'Switched to manual sync')
  }, [drive, updateDrive])

  const handleToggleSyncOnStartup = useCallback(() => {
    if (!drive) return
    updateDrive({ syncOnStartup: !drive.syncOnStartup })
  }, [drive, updateDrive])

  if (!isGoogleDriveConfigured()) {
    return null
  }

  if (!isConnected) {
    return (
      <div className="card p-5">
        <div className="flex items-center gap-3 mb-4">
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <h3 className="text-lg font-medium text-stone-800 dark:text-stone-100">Connect Google</h3>
        </div>
        <p className="text-stone-600 dark:text-stone-300 text-sm mb-4 leading-relaxed">
          Connect your Google account to sync data to Drive and import events from Calendar. You can
          choose which services to enable.
        </p>
        <div className="space-y-2">
          <button
            onClick={() => handleConnect('both')}
            disabled={isConnecting}
            className="btn-primary w-full"
          >
            {isConnecting ? 'Connecting...' : 'Connect with Calendar & Drive'}
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => handleConnect('calendar')}
              disabled={isConnecting}
              className="btn-secondary flex-1 text-sm"
            >
              Calendar only
            </button>
            <button
              onClick={() => handleConnect('drive')}
              disabled={isConnecting}
              className="btn-secondary flex-1 text-sm"
            >
              Drive only
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <div>
            <h3 className="text-lg font-medium text-stone-800 dark:text-stone-100">
              Google connected
            </h3>
            {lastValidated && (
              <p className="text-xs text-stone-400 dark:text-stone-500">
                Validated {getLastSyncText(lastValidated)}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors"
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          <svg
            className={`w-5 h-5 text-stone-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {lastError && (
        <div className="bg-critical-50 dark:bg-critical-900/20 text-critical-700 dark:text-critical-300 text-sm p-3 rounded-lg mb-4">
          <div className="mb-2">{lastError}</div>
          <button
            onClick={handleRefreshConnection}
            disabled={isValidating}
            className="text-sm font-medium text-critical-600 dark:text-critical-400 hover:text-critical-700 dark:hover:text-critical-300 underline"
          >
            {isValidating ? 'Refreshing...' : 'Refresh connection'}
          </button>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        {hasCalendar && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-helpful-50 dark:bg-helpful-900/30 text-helpful-700 dark:text-helpful-300 text-xs font-medium rounded-full">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
              <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
              <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
              <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
            </svg>
            Calendar
          </span>
        )}
        {hasDrive && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-helpful-50 dark:bg-helpful-900/30 text-helpful-700 dark:text-helpful-300 text-xs font-medium rounded-full">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            Drive
          </span>
        )}
      </div>

      {hasDrive && drive && (
        <div className="mb-4">
          {drive.lastSyncAt && (
            <p className="text-xs text-stone-400 dark:text-stone-500 mb-2">
              Last synced: {getLastSyncText(drive.lastSyncAt)}
            </p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleSyncToCloud}
              className="btn-secondary flex items-center justify-center gap-2"
              disabled={isSyncing}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              {isSyncing ? 'Syncing...' : 'Push to Drive'}
            </button>
            <button
              onClick={handleSyncFromCloud}
              className="btn-secondary flex items-center justify-center gap-2"
              disabled={isSyncing}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              {isSyncing ? 'Syncing...' : 'Pull from Drive'}
            </button>
          </div>
        </div>
      )}

      {hasDrive && !drive?.fileId && (
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-sm rounded-lg">
          Drive connection incomplete. Please disconnect and reconnect to set up backup.
        </div>
      )}

      {!hasCalendar && (
        <button
          onClick={() => handleAddService('calendar')}
          disabled={isConnecting}
          className="btn-secondary w-full mb-2 text-sm"
        >
          {isConnecting ? 'Adding...' : '+ Enable Calendar'}
        </button>
      )}
      {!hasDrive && (
        <button
          onClick={() => handleAddService('drive')}
          disabled={isConnecting}
          className="btn-secondary w-full mb-2 text-sm"
        >
          {isConnecting ? 'Adding...' : '+ Enable Drive backup'}
        </button>
      )}

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-700 space-y-4 animate-fade-in">
          {hasCalendar && (
            <div>
              <h4 className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                Calendar settings
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-stone-50 dark:bg-stone-800 rounded-lg">
                  <div>
                    <span className="text-sm text-stone-600 dark:text-stone-300">
                      Show calendar events
                    </span>
                    <p className="text-xs text-stone-400 dark:text-stone-500">
                      Display events in Activities view.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCalendarEvents(!showCalendarEvents)}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                      showCalendarEvents ? 'bg-sage-500' : 'bg-stone-300 dark:bg-stone-600'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm ${
                        showCalendarEvents ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {calendar && (
                  <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-lg">
                    <div className="text-sm text-stone-600 dark:text-stone-300 mb-2">
                      Selected calendar
                    </div>
                    <select
                      value={calendar.selectedCalendarId}
                      onChange={(e) => {
                        const cal = availableCalendars.find((c) => c.id === e.target.value)
                        if (cal) handleSelectCalendar(cal)
                      }}
                      className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-100 text-sm"
                    >
                      {availableCalendars.map((cal) => (
                        <option key={cal.id} value={cal.id}>
                          {cal.summary} {cal.primary && '(Primary)'}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {hasDrive && drive && (
            <div>
              <h4 className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                Drive backup settings
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-stone-50 dark:bg-stone-800 rounded-lg">
                  <div>
                    <span className="text-sm text-stone-600 dark:text-stone-300">
                      Auto-sync on changes
                    </span>
                    <p className="text-xs text-stone-400 dark:text-stone-500">
                      Sync to cloud after each change.
                    </p>
                  </div>
                  <button
                    onClick={handleToggleSyncMode}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                      drive.syncMode === 'auto' ? 'bg-sage-500' : 'bg-stone-300 dark:bg-stone-600'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm ${
                        drive.syncMode === 'auto' ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-stone-50 dark:bg-stone-800 rounded-lg">
                  <div>
                    <span className="text-sm text-stone-600 dark:text-stone-300">
                      Sync on startup
                    </span>
                    <p className="text-xs text-stone-400 dark:text-stone-500">
                      Pull updates when app opens.
                    </p>
                  </div>
                  <button
                    onClick={handleToggleSyncOnStartup}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                      drive.syncOnStartup ? 'bg-sage-500' : 'bg-stone-300 dark:bg-stone-600'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm ${
                        drive.syncOnStartup ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-lg">
                  <div className="text-sm text-stone-600 dark:text-stone-300">
                    Backup file: <span className="font-mono">{drive.fileName}</span>
                  </div>
                  {drive.lastSyncAt && (
                    <div className="text-xs text-stone-400 dark:text-stone-500 mt-1">
                      Last synced: {getLastSyncText(drive.lastSyncAt)}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleSyncToCloud}
                    className="btn-secondary"
                    disabled={isSyncing}
                  >
                    {isSyncing ? 'Syncing...' : 'Push'}
                  </button>
                  <button
                    onClick={handleSyncFromCloud}
                    className="btn-secondary"
                    disabled={isSyncing}
                  >
                    {isSyncing ? 'Syncing...' : 'Pull'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={handleDisconnect}
              className="btn-secondary w-full text-critical-600 hover:text-critical-700 dark:text-critical-400"
            >
              Disconnect Google
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
