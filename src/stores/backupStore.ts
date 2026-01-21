import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CloudProvider = 'google-drive' | 'dropbox' | null
export type SyncMode = 'manual' | 'auto'

interface CloudConnection {
  provider: CloudProvider
  accessToken: string
  fileId?: string
  fileName?: string
  lastSyncAt?: string
  syncMode: SyncMode
  syncOnStartup?: boolean
}

interface BackupState {
  lastBackupDate: string | null
  totalEntriesAtLastBackup: number
  autoSaveEnabled: boolean
  storedFileName: string | null

  cloudConnection: CloudConnection | null
  isSyncing: boolean
  lastCloudSyncError: string | null

  setLastBackupDate: (date: string) => void
  setTotalEntriesAtLastBackup: (count: number) => void
  setAutoSaveEnabled: (enabled: boolean) => void
  setStoredFileName: (name: string | null) => void
  shouldShowBackupReminder: (currentTotalEntries: number) => boolean
  dismissBackupReminder: () => void

  setCloudConnection: (connection: CloudConnection | null) => void
  updateCloudSync: (lastSyncAt: string) => void
  setIsSyncing: (syncing: boolean) => void
  setCloudSyncError: (error: string | null) => void
  setSyncMode: (mode: SyncMode) => void
  setSyncOnStartup: (enabled: boolean) => void
  disconnectCloud: () => void
}

export const useBackupStore = create<BackupState>()(
  persist(
    (set, get) => ({
      lastBackupDate: null,
      totalEntriesAtLastBackup: 0,
      autoSaveEnabled: false,
      storedFileName: null,

      cloudConnection: null,
      isSyncing: false,
      lastCloudSyncError: null,

      setLastBackupDate: (date) => set({ lastBackupDate: date }),

      setTotalEntriesAtLastBackup: (count) => set({ totalEntriesAtLastBackup: count }),

      setAutoSaveEnabled: (enabled) => set({ autoSaveEnabled: enabled }),

      setStoredFileName: (name) => set({ storedFileName: name }),

      shouldShowBackupReminder: (currentTotalEntries) => {
        const state = get()

        if (state.cloudConnection || state.autoSaveEnabled) {
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

      setCloudConnection: (connection) =>
        set({
          cloudConnection: connection,
          lastCloudSyncError: null,
        }),

      updateCloudSync: (lastSyncAt) =>
        set((state) => ({
          cloudConnection: state.cloudConnection ? { ...state.cloudConnection, lastSyncAt } : null,
        })),

      setIsSyncing: (syncing) => set({ isSyncing: syncing }),

      setCloudSyncError: (error) => set({ lastCloudSyncError: error }),

      setSyncMode: (mode) =>
        set((state) => ({
          cloudConnection: state.cloudConnection
            ? { ...state.cloudConnection, syncMode: mode }
            : null,
        })),

      setSyncOnStartup: (enabled) =>
        set((state) => ({
          cloudConnection: state.cloudConnection
            ? { ...state.cloudConnection, syncOnStartup: enabled }
            : null,
        })),

      disconnectCloud: () =>
        set({
          cloudConnection: null,
          lastCloudSyncError: null,
          isSyncing: false,
        }),
    }),
    {
      name: 'cbtjournal-backup-store',
      partialize: (state) => ({
        lastBackupDate: state.lastBackupDate,
        totalEntriesAtLastBackup: state.totalEntriesAtLastBackup,
        autoSaveEnabled: state.autoSaveEnabled,
        storedFileName: state.storedFileName,
        cloudConnection: state.cloudConnection,
      }),
    }
  )
)
