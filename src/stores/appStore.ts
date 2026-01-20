import { create } from 'zustand'
import { db } from '@/db'
import type { ThoughtRecord, DepressionChecklistEntry, GratitudeEntry } from '@/types'
import { useBackupStore } from '@/stores/backupStore'
import {
  saveToFile,
  initAutoSave,
  getStoredFileHandle,
  verifyFileHandlePermission,
} from '@/utils/backup'
import {
  saveToGoogleDrive,
  saveToDropbox,
  loadFromGoogleDrive,
  loadFromDropbox,
  validateGoogleToken,
  validateDropboxToken,
  reauthorizeGoogleDrive,
  getGoogleDriveFileMetadata,
  getDropboxFileMetadata,
} from '@/utils/cloudSync'
import { logger } from '@/utils/logger'
import { toast } from '@/stores/toastStore'

interface AppState {
  thoughtRecords: ThoughtRecord[]
  depressionChecklists: DepressionChecklistEntry[]
  gratitudeEntries: GratitudeEntry[]
  isLoading: boolean
  currentView:
    | 'home'
    | 'new-thought'
    | 'thought-detail'
    | 'checklist'
    | 'new-checklist'
    | 'checklist-detail'
    | 'gratitude'
    | 'new-gratitude'
    | 'insights'
    | 'settings'
  selectedRecordId: string | null
  selectedGratitudeId: string | null
  selectedChecklistId: string | null

  fileHandle: FileSystemFileHandle | null

  loadData: () => Promise<void>
  addThoughtRecord: (record: ThoughtRecord) => Promise<void>
  updateThoughtRecord: (record: ThoughtRecord) => Promise<void>
  deleteThoughtRecord: (id: string) => Promise<void>
  addDepressionChecklist: (entry: DepressionChecklistEntry) => Promise<void>
  updateDepressionChecklist: (entry: DepressionChecklistEntry) => Promise<void>
  deleteDepressionChecklist: (id: string) => Promise<void>
  addGratitudeEntry: (entry: GratitudeEntry) => Promise<void>
  updateGratitudeEntry: (entry: GratitudeEntry) => Promise<void>
  deleteGratitudeEntry: (id: string) => Promise<void>
  setView: (view: AppState['currentView']) => void
  setSelectedRecordId: (id: string | null) => void
  setSelectedGratitudeId: (id: string | null) => void
  setSelectedChecklistId: (id: string | null) => void
  exportData: () => Promise<string>
  importData: (jsonString: string, mode?: 'merge' | 'replace') => Promise<void>
  tryAutoSave: () => Promise<void>
  setFileHandle: (handle: FileSystemFileHandle | null) => void
  initializeAutoSave: () => Promise<void>
  syncToCloud: () => Promise<boolean>
  syncFromCloud: () => Promise<boolean>
  initializeCloudSync: () => Promise<void>
  checkCloudForUpdates: () => Promise<boolean>
}

let autoSaveDebounceTimer: ReturnType<typeof setTimeout> | null = null
const AUTO_SAVE_DEBOUNCE_MS = 2000

export const useAppStore = create<AppState>((set, get) => ({
  thoughtRecords: [],
  depressionChecklists: [],
  gratitudeEntries: [],
  isLoading: true,
  currentView: 'home',
  selectedRecordId: null,
  selectedGratitudeId: null,
  selectedChecklistId: null,
  fileHandle: null,

  loadData: async () => {
    set({ isLoading: true })
    const [thoughtRecords, depressionChecklists, gratitudeEntries] = await Promise.all([
      db.getAllThoughtRecords(),
      db.getAllDepressionChecklists(),
      db.getAllGratitudeEntries(),
    ])
    set({ thoughtRecords, depressionChecklists, gratitudeEntries, isLoading: false })
  },

  addThoughtRecord: async (record) => {
    await db.addThoughtRecord(record)
    set((state) => ({
      thoughtRecords: [record, ...state.thoughtRecords],
    }))
    await get().tryAutoSave()
  },

  updateThoughtRecord: async (record) => {
    await db.updateThoughtRecord(record)
    set((state) => ({
      thoughtRecords: state.thoughtRecords.map((r) => (r.id === record.id ? record : r)),
    }))
    await get().tryAutoSave()
  },

  deleteThoughtRecord: async (id) => {
    await db.deleteThoughtRecord(id)
    set((state) => ({
      thoughtRecords: state.thoughtRecords.filter((r) => r.id !== id),
    }))
    await get().tryAutoSave()
  },

  addDepressionChecklist: async (entry) => {
    await db.addDepressionChecklist(entry)
    set((state) => ({
      depressionChecklists: [entry, ...state.depressionChecklists],
    }))
    await get().tryAutoSave()
  },

  updateDepressionChecklist: async (entry) => {
    await db.updateDepressionChecklist(entry)
    set((state) => ({
      depressionChecklists: state.depressionChecklists.map((e) => (e.id === entry.id ? entry : e)),
    }))
    await get().tryAutoSave()
  },

  deleteDepressionChecklist: async (id) => {
    await db.deleteDepressionChecklist(id)
    set((state) => ({
      depressionChecklists: state.depressionChecklists.filter((e) => e.id !== id),
    }))
    await get().tryAutoSave()
  },

  addGratitudeEntry: async (entry) => {
    await db.addGratitudeEntry(entry)
    set((state) => ({
      gratitudeEntries: [entry, ...state.gratitudeEntries],
    }))
    await get().tryAutoSave()
  },

  updateGratitudeEntry: async (entry) => {
    await db.updateGratitudeEntry(entry)
    set((state) => ({
      gratitudeEntries: state.gratitudeEntries.map((e) => (e.id === entry.id ? entry : e)),
    }))
    await get().tryAutoSave()
  },

  deleteGratitudeEntry: async (id) => {
    await db.deleteGratitudeEntry(id)
    set((state) => ({
      gratitudeEntries: state.gratitudeEntries.filter((e) => e.id !== id),
    }))
    await get().tryAutoSave()
  },

  setView: (view) => set({ currentView: view }),

  setSelectedRecordId: (id) => set({ selectedRecordId: id }),

  setSelectedGratitudeId: (id) => set({ selectedGratitudeId: id }),

  setSelectedChecklistId: (id) => set({ selectedChecklistId: id }),

  exportData: async () => {
    const data = await db.exportData()
    return JSON.stringify(data, null, 2)
  },

  importData: async (jsonString, mode: 'merge' | 'replace' = 'merge') => {
    const data = JSON.parse(jsonString)
    await db.importData(data, mode)
    await get().loadData()
  },

  setFileHandle: (handle) => set({ fileHandle: handle }),

  initializeAutoSave: async () => {
    const backupState = useBackupStore.getState()

    if (backupState.autoSaveEnabled) {
      const handle = await initAutoSave()
      if (handle) {
        set({ fileHandle: handle })
        backupState.setStoredFileName(handle.name)
        logger.info('App', 'Auto-save initialized', { fileName: handle.name })
      } else {
        backupState.setAutoSaveEnabled(false)
        backupState.setStoredFileName(null)
      }
    }
  },

  initializeCloudSync: async () => {
    const backupState = useBackupStore.getState()
    const connection = backupState.cloudConnection

    if (!connection) {
      return
    }

    logger.info('App', 'Checking cloud connection', { provider: connection.provider })

    try {
      let isValid = false

      if (connection.provider === 'google-drive') {
        isValid = await validateGoogleToken(connection.accessToken)

        if (!isValid) {
          logger.info('App', 'Google token expired, attempting re-auth')
          const newToken = await reauthorizeGoogleDrive()
          if (newToken) {
            backupState.setCloudConnection({
              ...connection,
              accessToken: newToken,
            })
            isValid = true
            logger.info('App', 'Google Drive re-authenticated successfully')
          }
        }
      } else if (connection.provider === 'dropbox') {
        isValid = await validateDropboxToken(connection.accessToken)
      }

      if (!isValid) {
        logger.warn('App', 'Cloud token invalid, disconnecting')
        backupState.setCloudSyncError('Session expired. Please reconnect.')
        return
      }

      if (connection.syncOnStartup !== false) {
        const hasUpdates = await get().checkCloudForUpdates()
        if (hasUpdates) {
          logger.info('App', 'Cloud has newer data, syncing')
          await get().syncFromCloud()
        }
      }

      logger.info('App', 'Cloud sync initialized', { provider: connection.provider })
    } catch (error) {
      logger.error('App', 'Failed to initialize cloud sync', error)
      backupState.setCloudSyncError('Failed to connect to cloud')
    }
  },

  checkCloudForUpdates: async () => {
    const backupState = useBackupStore.getState()
    const connection = backupState.cloudConnection

    if (!connection) return false

    try {
      let cloudModifiedTime: string | null = null

      if (connection.provider === 'google-drive' && connection.fileId) {
        const metadata = await getGoogleDriveFileMetadata(connection.accessToken, connection.fileId)
        cloudModifiedTime = metadata?.modifiedTime || null
      } else if (connection.provider === 'dropbox') {
        const metadata = await getDropboxFileMetadata(connection.accessToken)
        cloudModifiedTime = metadata?.server_modified || null
      }

      if (!cloudModifiedTime) return false

      const lastSync = connection.lastSyncAt
      if (!lastSync) return true

      return new Date(cloudModifiedTime) > new Date(lastSync)
    } catch (error) {
      logger.error('App', 'Failed to check cloud for updates', error)
      return false
    }
  },

  tryAutoSave: async () => {
    if (autoSaveDebounceTimer) {
      clearTimeout(autoSaveDebounceTimer)
    }

    autoSaveDebounceTimer = setTimeout(async () => {
      const backupState = useBackupStore.getState()
      const state = get()

      if (backupState.autoSaveEnabled && state.fileHandle) {
        try {
          const hasPermission = await verifyFileHandlePermission(state.fileHandle)
          if (hasPermission) {
            const jsonData = await state.exportData()
            const success = await saveToFile(state.fileHandle, jsonData)
            if (success) {
              backupState.setLastBackupDate(new Date().toISOString())
              const totalEntries =
                state.thoughtRecords.length +
                state.depressionChecklists.length +
                state.gratitudeEntries.length
              backupState.setTotalEntriesAtLastBackup(totalEntries)
              logger.debug('App', 'Auto-saved to local file')
            }
          } else {
            const handle = await getStoredFileHandle()
            if (handle) {
              const permission = await verifyFileHandlePermission(handle)
              if (permission) {
                set({ fileHandle: handle })
                const jsonData = await state.exportData()
                await saveToFile(handle, jsonData)
              }
            }
          }
        } catch (error) {
          logger.error('App', 'Auto-save failed', error)
        }
      }

      const cloudConnection = backupState.cloudConnection
      if (cloudConnection?.syncMode === 'auto') {
        await state.syncToCloud()
      }
    }, AUTO_SAVE_DEBOUNCE_MS)
  },

  syncToCloud: async () => {
    const backupState = useBackupStore.getState()
    const connection = backupState.cloudConnection

    if (!connection) {
      return false
    }

    backupState.setIsSyncing(true)
    backupState.setCloudSyncError(null)

    try {
      const jsonData = await get().exportData()
      let result

      if (connection.provider === 'google-drive' && connection.fileId) {
        result = await saveToGoogleDrive(connection.accessToken, connection.fileId, jsonData)
      } else if (connection.provider === 'dropbox') {
        result = await saveToDropbox(connection.accessToken, jsonData)
      } else {
        throw new Error('Invalid cloud connection')
      }

      if (result.success) {
        backupState.updateCloudSync(new Date().toISOString())
        backupState.setLastBackupDate(new Date().toISOString())
        const totalEntries =
          get().thoughtRecords.length +
          get().depressionChecklists.length +
          get().gratitudeEntries.length
        backupState.setTotalEntriesAtLastBackup(totalEntries)
        logger.info('App', 'Synced to cloud', { provider: connection.provider })
        return true
      } else {
        throw new Error(result.error || 'Sync failed')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sync failed'
      backupState.setCloudSyncError(message)
      logger.error('App', 'Cloud sync failed', error)
      return false
    } finally {
      backupState.setIsSyncing(false)
    }
  },

  syncFromCloud: async () => {
    const backupState = useBackupStore.getState()
    const connection = backupState.cloudConnection

    if (!connection) {
      return false
    }

    backupState.setIsSyncing(true)
    backupState.setCloudSyncError(null)

    try {
      let result

      if (connection.provider === 'google-drive' && connection.fileId) {
        result = await loadFromGoogleDrive(connection.accessToken, connection.fileId)
      } else if (connection.provider === 'dropbox') {
        result = await loadFromDropbox(connection.accessToken)
      } else {
        throw new Error('Invalid cloud connection')
      }

      if (result.success) {
        if (result.data && result.data.trim()) {
          const parsed = JSON.parse(result.data)
          if (parsed.thoughtRecords || parsed.depressionChecklists || parsed.gratitudeEntries) {
            await get().importData(result.data, 'replace')
            toast.success('Data synced from cloud')
          }
        }
        backupState.updateCloudSync(new Date().toISOString())
        logger.info('App', 'Synced from cloud', { provider: connection.provider })
        return true
      } else {
        throw new Error(result.error || 'Sync failed')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sync failed'
      backupState.setCloudSyncError(message)
      logger.error('App', 'Cloud sync from failed', error)
      toast.error('Failed to sync from cloud')
      return false
    } finally {
      backupState.setIsSyncing(false)
    }
  },
}))
