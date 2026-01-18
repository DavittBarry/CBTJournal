import { useState, useEffect } from 'react'
import { useAppStore } from '@/stores/appStore'
import { useBackupStore } from '@/stores/backupStore'
import { downloadBackup, hasFileSystemAccess, setupAutoSave, saveToFile } from '@/utils/backup'
import { toast } from '@/stores/toastStore'

export function BackupReminder() {
  const { thoughtRecords, depressionChecklists, gratitudeEntries, exportData } = useAppStore()
  const { 
    shouldShowBackupReminder, 
    dismissBackupReminder,
    setLastBackupDate,
    setTotalEntriesAtLastBackup,
    autoSaveEnabled,
    setAutoSaveEnabled
  } = useBackupStore()
  
  const [isVisible, setIsVisible] = useState(false)
  
  const totalEntries = thoughtRecords.length + depressionChecklists.length + gratitudeEntries.length

  useEffect(() => {
    if (shouldShowBackupReminder(totalEntries)) {
      setIsVisible(true)
    }
  }, [totalEntries, shouldShowBackupReminder])

  const handleExport = async () => {
    try {
      const jsonData = await exportData()
      await downloadBackup(jsonData)
      
      setLastBackupDate(new Date().toISOString())
      setTotalEntriesAtLastBackup(totalEntries)
      setIsVisible(false)
      toast.success('Backup saved successfully')
    } catch (error) {
      toast.error('Failed to create backup')
    }
  }

  const handleSetupAutoSave = async () => {
    const handle = await setupAutoSave()
    if (handle) {
      ;(window as any).__autoSaveFileHandle = handle
      setAutoSaveEnabled(true)
      
      const jsonData = await exportData()
      const success = await saveToFile(handle, jsonData)
      
      if (success) {
        setLastBackupDate(new Date().toISOString())
        setTotalEntriesAtLastBackup(totalEntries)
        setIsVisible(false)
        toast.success('Auto-save configured and first backup saved')
      }
    }
  }

  const handleDismiss = () => {
    dismissBackupReminder()
    setIsVisible(false)
  }

  if (!isVisible) return null

  const daysSinceBackup = useBackupStore.getState().lastBackupDate
    ? Math.floor((Date.now() - new Date(useBackupStore.getState().lastBackupDate!).getTime()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
      <div className="card p-4 border-l-4 border-amber-500 dark:border-amber-600">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-amber-600 dark:text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-stone-800 dark:text-stone-100 mb-1">
              Time to back up your data
            </h3>
            <p className="text-sm text-stone-600 dark:text-stone-400 mb-3">
              {daysSinceBackup && daysSinceBackup >= 30
                ? `It's been ${daysSinceBackup} days since your last backup. `
                : `You have ${totalEntries} entries. `}
              Your data is stored in your browser and could be lost if you clear your cache or switch devices.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleExport}
                className="btn-primary py-2 px-4 text-xs"
              >
                Export backup now
              </button>
              {hasFileSystemAccess() && !autoSaveEnabled && (
                <button
                  onClick={handleSetupAutoSave}
                  className="btn-secondary py-2 px-4 text-xs"
                >
                  Set up auto-save
                </button>
              )}
              <button
                onClick={handleDismiss}
                className="py-2 px-4 text-xs text-stone-600 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
              >
                Remind me later
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 hover:bg-stone-100 dark:hover:bg-stone-700 rounded transition-colors"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
