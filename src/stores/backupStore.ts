import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface BackupState {
  lastBackupDate: string | null
  totalEntriesAtLastBackup: number
  autoSaveEnabled: boolean
  
  setLastBackupDate: (date: string) => void
  setTotalEntriesAtLastBackup: (count: number) => void
  setAutoSaveEnabled: (enabled: boolean) => void
  shouldShowBackupReminder: (currentTotalEntries: number) => boolean
  dismissBackupReminder: () => void
}

export const useBackupStore = create<BackupState>()(
  persist(
    (set, get) => ({
      lastBackupDate: null,
      totalEntriesAtLastBackup: 0,
      autoSaveEnabled: false,

      setLastBackupDate: (date) => set({ lastBackupDate: date }),
      
      setTotalEntriesAtLastBackup: (count) => set({ totalEntriesAtLastBackup: count }),
      
      setAutoSaveEnabled: (enabled) => set({ autoSaveEnabled: enabled }),
      
      shouldShowBackupReminder: (currentTotalEntries) => {
        const state = get()
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
          totalEntriesAtLastBackup: 0
        })
      }
    }),
    {
      name: 'untwist-backup-store',
      partialize: (state) => ({
        lastBackupDate: state.lastBackupDate,
        totalEntriesAtLastBackup: state.totalEntriesAtLastBackup,
        autoSaveEnabled: state.autoSaveEnabled
      })
    }
  )
)
