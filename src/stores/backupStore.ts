import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CloudProvider = 'google-drive' | 'dropbox'
export type SyncMode = 'manual' | 'auto'

export interface CloudConnection {
  provider: CloudProvider
  accessToken: string
  fileId?: string
  fileName?: string
  lastSyncAt?: string
  syncMode: SyncMode
  syncOnStartup?: boolean
  lastError?: string | null
}

interface BackupState {
  lastBackupDate: string | null
  totalEntriesAtLastBackup: number
  autoSaveEnabled: boolean
  storedFileName: string | null

  cloudConnections: CloudConnection[]
  isSyncing: boolean

  setLastBackupDate: (date: string) => void
  setTotalEntriesAtLastBackup: (count: number) => void
  setAutoSaveEnabled: (enabled: boolean) => void
  setStoredFileName: (name: string | null) => void
  shouldShowBackupReminder: (currentTotalEntries: number) => boolean
  dismissBackupReminder: () => void

  addCloudConnection: (connection: CloudConnection) => void
  updateCloudConnection: (provider: CloudProvider, updates: Partial<CloudConnection>) => void
  removeCloudConnection: (provider: CloudProvider) => void
  getCloudConnection: (provider: CloudProvider) => CloudConnection | undefined
  setIsSyncing: (syncing: boolean) => void
  setSyncMode: (provider: CloudProvider, mode: SyncMode) => void
  setSyncOnStartup: (provider: CloudProvider, enabled: boolean) => void
  setConnectionError: (provider: CloudProvider, error: string | null) => void
  updateSyncTime: (provider: CloudProvider, lastSyncAt: string) => void
}

export const useBackupStore = create<BackupState>()(
  persist(
    (set, get) => ({
      lastBackupDate: null,
      totalEntriesAtLastBackup: 0,
      autoSaveEnabled: false,
      storedFileName: null,

      cloudConnections: [],
      isSyncing: false,

      setLastBackupDate: (date) => set({ lastBackupDate: date }),

      setTotalEntriesAtLastBackup: (count) => set({ totalEntriesAtLastBackup: count }),

      setAutoSaveEnabled: (enabled) => set({ autoSaveEnabled: enabled }),

      setStoredFileName: (name) => set({ storedFileName: name }),

      shouldShowBackupReminder: (currentTotalEntries) => {
        const state = get()

        if (state.cloudConnections.length > 0 || state.autoSaveEnabled) {
          return false
        }

        const entriesSinceBackup = currentTotalEntries - state.totalEntriesAtLastBackup

        if (!state.lastBackupDate) {
          return currentTotalEntries >= 10
        }

        const daysSinceBackup = Math.floor(
          (Date.now() - new Date(state.lastBackupDate).getTime()) / (1000 * 60 * 60 * 24)
        )

        if (daysSinceBackup >= 30) return true
        if (daysSinceBackup >= 7 && entriesSinceBackup >= 5) return true
        if (entriesSinceBackup >= 10) return true

        return false
      },

      dismissBackupReminder: () => {
        set({
          lastBackupDate: new Date().toISOString(),
          totalEntriesAtLastBackup: 0,
        })
      },

      addCloudConnection: (connection) =>
        set((state) => {
          const existing = state.cloudConnections.find((c) => c.provider === connection.provider)
          if (existing) {
            return {
              cloudConnections: state.cloudConnections.map((c) =>
                c.provider === connection.provider ? connection : c
              ),
            }
          }
          return {
            cloudConnections: [...state.cloudConnections, connection],
          }
        }),

      updateCloudConnection: (provider, updates) =>
        set((state) => ({
          cloudConnections: state.cloudConnections.map((c) =>
            c.provider === provider ? { ...c, ...updates } : c
          ),
        })),

      removeCloudConnection: (provider) =>
        set((state) => ({
          cloudConnections: state.cloudConnections.filter((c) => c.provider !== provider),
        })),

      getCloudConnection: (provider) => {
        return get().cloudConnections.find((c) => c.provider === provider)
      },

      setIsSyncing: (syncing) => set({ isSyncing: syncing }),

      setSyncMode: (provider, mode) =>
        set((state) => ({
          cloudConnections: state.cloudConnections.map((c) =>
            c.provider === provider ? { ...c, syncMode: mode } : c
          ),
        })),

      setSyncOnStartup: (provider, enabled) =>
        set((state) => ({
          cloudConnections: state.cloudConnections.map((c) =>
            c.provider === provider ? { ...c, syncOnStartup: enabled } : c
          ),
        })),

      setConnectionError: (provider, error) =>
        set((state) => ({
          cloudConnections: state.cloudConnections.map((c) =>
            c.provider === provider ? { ...c, lastError: error } : c
          ),
        })),

      updateSyncTime: (provider, lastSyncAt) =>
        set((state) => ({
          cloudConnections: state.cloudConnections.map((c) =>
            c.provider === provider ? { ...c, lastSyncAt, lastError: null } : c
          ),
        })),
    }),
    {
      name: 'cbtjournal-backup-store',
      version: 1,
      partialize: (state) => ({
        lastBackupDate: state.lastBackupDate,
        totalEntriesAtLastBackup: state.totalEntriesAtLastBackup,
        autoSaveEnabled: state.autoSaveEnabled,
        storedFileName: state.storedFileName,
        cloudConnections: state.cloudConnections,
      }),
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as Record<string, unknown>

        if (version === 0) {
          const oldConnection = state.cloudConnection as CloudConnection | null
          if (oldConnection && oldConnection.provider) {
            state.cloudConnections = [oldConnection]
          } else {
            state.cloudConnections = []
          }
          delete state.cloudConnection
          delete state.lastCloudSyncError
        }

        return state as BackupState
      },
    }
  )
)
