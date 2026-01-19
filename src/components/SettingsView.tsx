import { useRef, useState, useMemo } from 'react'
import { useAppStore } from '@/stores/appStore'
import { useBackupStore } from '@/stores/backupStore'
import { useThemeStore } from '@/stores/themeStore'
import { logger } from '@/utils/logger'
import { toast } from '@/stores/toastStore'
import { hasFileSystemAccess, setupAutoSave, saveToFile, loadMultipleFiles } from '@/utils/backup'

type ImportStep = 'idle' | 'choose-mode' | 'confirm-replace'

interface WindowWithAutoSave extends Window {
  __autoSaveFileHandle?: FileSystemFileHandle | null
}

export function SettingsView() {
  const { exportData, importData, thoughtRecords, depressionChecklists, gratitudeEntries } =
    useAppStore()
  const { theme, setTheme } = useThemeStore()
  const {
    lastBackupDate,
    autoSaveEnabled,
    setAutoSaveEnabled,
    setLastBackupDate,
    setTotalEntriesAtLastBackup,
  } = useBackupStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importStep, setImportStep] = useState<ImportStep>('idle')
  const [pendingImportData, setPendingImportData] = useState<string | null>(null)
  const [showDevTools, setShowDevTools] = useState(false)
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false)
  const [showPasteModal, setShowPasteModal] = useState(false)
  const [pasteText, setPasteText] = useState('')

  const hasExistingData =
    thoughtRecords.length > 0 || depressionChecklists.length > 0 || gratitudeEntries.length > 0
  const isDev = import.meta.env.DEV
  const totalEntries = thoughtRecords.length + depressionChecklists.length + gratitudeEntries.length

  const daysSinceBackup = useMemo(() => {
    if (!lastBackupDate) return null
    // eslint-disable-next-line react-hooks/purity
    return Math.floor((Date.now() - new Date(lastBackupDate).getTime()) / (1000 * 60 * 60 * 24))
  }, [lastBackupDate])

  const handleExport = async () => {
    try {
      const data = await exportData()
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cbtjournal-export-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)

      setLastBackupDate(new Date().toISOString())
      setTotalEntriesAtLastBackup(totalEntries)

      toast.success('Data exported successfully')
    } catch {
      toast.error('Failed to export data')
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const text = await file.text()

    try {
      JSON.parse(text)
    } catch {
      toast.error('Invalid JSON file')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setPendingImportData(text)

    if (hasExistingData) {
      setImportStep('choose-mode')
    } else {
      await doImport(text, 'replace')
    }

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleMultipleFilesImport = async () => {
    const files = await loadMultipleFiles()

    if (files.length === 0) return

    try {
      interface MergedData {
        thoughtRecords: Array<{ id: string; [key: string]: unknown }>
        depressionChecklists: Array<{ id: string; [key: string]: unknown }>
        gratitudeEntries: Array<{ id: string; [key: string]: unknown }>
      }

      const mergedData: MergedData = {
        thoughtRecords: [],
        depressionChecklists: [],
        gratitudeEntries: [],
      }

      for (const fileContent of files) {
        const parsed = JSON.parse(fileContent)
        if (parsed.thoughtRecords) mergedData.thoughtRecords.push(...parsed.thoughtRecords)
        if (parsed.depressionChecklists)
          mergedData.depressionChecklists.push(...parsed.depressionChecklists)
        if (parsed.gratitudeEntries) mergedData.gratitudeEntries.push(...parsed.gratitudeEntries)
      }

      const uniqueThoughts = Array.from(
        new Map(mergedData.thoughtRecords.map((item) => [item.id, item])).values()
      )
      const uniqueChecklists = Array.from(
        new Map(mergedData.depressionChecklists.map((item) => [item.id, item])).values()
      )
      const uniqueGratitude = Array.from(
        new Map(mergedData.gratitudeEntries.map((item) => [item.id, item])).values()
      )

      mergedData.thoughtRecords = uniqueThoughts
      mergedData.depressionChecklists = uniqueChecklists
      mergedData.gratitudeEntries = uniqueGratitude

      setPendingImportData(JSON.stringify(mergedData))

      if (hasExistingData) {
        setImportStep('choose-mode')
      } else {
        await importData(JSON.stringify(mergedData), 'replace')
        toast.success(`Imported from ${files.length} files successfully`)
      }
    } catch {
      toast.error('Failed to import files. Check file format.')
    }
  }

  const doImport = async (data: string, mode: 'merge' | 'replace') => {
    try {
      await importData(data, mode)
      toast.success('Data imported successfully')
    } catch {
      toast.error('Failed to import data. Check file format.')
    }
    resetImportState()
  }

  const handleMerge = async () => {
    if (pendingImportData) {
      await doImport(pendingImportData, 'merge')
    }
  }

  const handleReplaceChosen = () => {
    setImportStep('confirm-replace')
  }

  const handleExportThenReplace = async () => {
    await handleExport()
    if (pendingImportData) {
      await doImport(pendingImportData, 'replace')
    }
  }

  const handleReplaceWithoutBackup = async () => {
    if (pendingImportData) {
      await doImport(pendingImportData, 'replace')
    }
  }

  const resetImportState = () => {
    setImportStep('idle')
    setPendingImportData(null)
  }

  const handlePasteImport = async () => {
    try {
      JSON.parse(pasteText)
    } catch {
      toast.error('Invalid JSON format')
      return
    }

    setPendingImportData(pasteText)
    setShowPasteModal(false)
    setPasteText('')

    if (hasExistingData) {
      setImportStep('choose-mode')
    } else {
      await doImport(pasteText, 'replace')
    }
  }

  const handleSetupAutoSave = async () => {
    const handle = await setupAutoSave()
    if (handle) {
      ;(window as WindowWithAutoSave).__autoSaveFileHandle = handle
      setAutoSaveEnabled(true)

      const jsonData = await exportData()
      const success = await saveToFile(handle, jsonData)

      if (success) {
        setLastBackupDate(new Date().toISOString())
        setTotalEntriesAtLastBackup(totalEntries)
        toast.success('Auto-save configured')
      }
    }
  }

  const handleDisableAutoSave = () => {
    setAutoSaveEnabled(false)
    ;(window as WindowWithAutoSave).__autoSaveFileHandle = null
    toast.info('Auto-save disabled')
  }

  const handleExportLogs = () => {
    const logs = logger.exportLogs()
    const blob = new Blob([logs], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cbtjournal-logs-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Logs exported')
  }

  const handleClearLogs = () => {
    logger.clearLogs()
    toast.info('Logs cleared')
  }

  const recentErrors = logger.getRecentErrors(5)
  const allLogs = logger.getLogs()

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-stone-800 dark:text-stone-100 mb-8 text-center">
        Settings & Guide
      </h1>

      {importStep === 'choose-mode' && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-2">
              Import data
            </h3>
            <p className="text-stone-500 dark:text-stone-400 text-sm mb-5">
              You have existing data. How would you like to import?
            </p>
            <div className="space-y-3">
              <button onClick={handleMerge} className="btn-secondary w-full text-left px-4">
                <div className="font-medium text-stone-700 dark:text-stone-200">Merge</div>
                <div className="text-sm text-stone-500 dark:text-stone-400">
                  Add imported data to your existing records
                </div>
              </button>
              <button onClick={handleReplaceChosen} className="btn-secondary w-full text-left px-4">
                <div className="font-medium text-stone-700 dark:text-stone-200">Replace</div>
                <div className="text-sm text-stone-500 dark:text-stone-400">
                  Clear existing data and use only imported data
                </div>
              </button>
              <button
                onClick={resetImportState}
                className="w-full text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 py-2 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {importStep === 'confirm-replace' && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-2">
              Save a backup first?
            </h3>
            <p className="text-stone-500 dark:text-stone-400 text-sm mb-5">
              Replacing will permanently delete your current data. Would you like to export a backup
              before continuing?
            </p>
            <div className="space-y-3">
              <button onClick={handleExportThenReplace} className="btn-primary w-full">
                Export backup, then replace
              </button>
              <button
                onClick={handleReplaceWithoutBackup}
                className="btn-secondary w-full text-critical-600 hover:text-critical-700 dark:text-critical-400 dark:hover:text-critical-300"
              >
                Replace without backup
              </button>
              <button
                onClick={() => setImportStep('choose-mode')}
                className="w-full text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 py-2 text-sm font-medium"
              >
                Go back
              </button>
            </div>
          </div>
        </div>
      )}

      {showPasteModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 max-w-lg w-full">
            <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-2">
              Paste JSON data
            </h3>
            <p className="text-stone-500 dark:text-stone-400 text-sm mb-4">
              Paste your exported JSON data below.
            </p>
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder='{"thoughtRecords":[],...}'
              className="w-full h-48 p-3 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sage-500 mb-4"
            />
            <div className="flex gap-3">
              <button onClick={handlePasteImport} className="btn-primary flex-1">
                Import
              </button>
              <button
                onClick={() => {
                  setShowPasteModal(false)
                  setPasteText('')
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showPrivacyPolicy && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between mb-4 flex-shrink-0">
              <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100">
                Privacy policy
              </h3>
              <button
                onClick={() => setShowPrivacyPolicy(false)}
                className="text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto flex-1 pr-2">
              <div className="prose prose-sm dark:prose-invert max-w-none text-stone-600 dark:text-stone-300">
                <p className="text-xs text-stone-400 dark:text-stone-500 mb-4">
                  Last updated: January 18, 2026
                </p>

                <h4 className="text-stone-800 dark:text-stone-100 font-semibold mt-4 mb-2">
                  Overview
                </h4>
                <p className="text-sm leading-relaxed mb-4">
                  CBTJournal is a cognitive behavioral therapy (CBT) thought journal designed to
                  help users track and manage their thoughts, emotions, and mental wellness. Your
                  privacy is our top priority.
                </p>

                <h4 className="text-stone-800 dark:text-stone-100 font-semibold mt-4 mb-2">
                  Data storage
                </h4>
                <p className="text-sm leading-relaxed mb-2">
                  <strong>All your data stays on your device.</strong> CBTJournal stores all
                  information locally in your device's browser storage (IndexedDB). We do not:
                </p>
                <ul className="text-sm space-y-1 mb-4">
                  <li>Collect any personal information.</li>
                  <li>Transmit any data to external servers.</li>
                  <li>Track your usage.</li>
                  <li>Use analytics or cookies.</li>
                  <li>Share your data with third parties.</li>
                </ul>

                <h4 className="text-stone-800 dark:text-stone-100 font-semibold mt-4 mb-2">
                  What data is stored
                </h4>
                <p className="text-sm leading-relaxed mb-2">
                  The following information is stored locally on your device only:
                </p>
                <ul className="text-sm space-y-1 mb-4">
                  <li>
                    Thought records (situations, emotions, cognitive distortions, rational
                    responses).
                  </li>
                  <li>Gratitude journal entries.</li>
                  <li>Depression checklist responses.</li>
                  <li>User preferences (theme, settings).</li>
                  <li>Backup timestamps.</li>
                </ul>

                <h4 className="text-stone-800 dark:text-stone-100 font-semibold mt-4 mb-2">
                  Data control
                </h4>
                <p className="text-sm leading-relaxed mb-2">
                  You have complete control over your data:
                </p>
                <ul className="text-sm space-y-1 mb-4">
                  <li>
                    <strong>Export:</strong> You can export all your data as a JSON file at any
                    time.
                  </li>
                  <li>
                    <strong>Import:</strong> You can import previously exported data.
                  </li>
                  <li>
                    <strong>Delete:</strong> You can delete individual entries or clear all data.
                  </li>
                  <li>
                    <strong>Backup:</strong> You are responsible for backing up your data.
                  </li>
                </ul>

                <h4 className="text-stone-800 dark:text-stone-100 font-semibold mt-4 mb-2">
                  Auto-save feature (desktop only)
                </h4>
                <p className="text-sm leading-relaxed mb-4">
                  On desktop browsers (Chrome/Edge), you may optionally enable an auto-save feature
                  that saves your data to a file location you choose on your computer. This file
                  remains entirely under your control on your local filesystem.
                </p>

                <h4 className="text-stone-800 dark:text-stone-100 font-semibold mt-4 mb-2">
                  Data loss
                </h4>
                <p className="text-sm leading-relaxed mb-2">Since all data is stored locally:</p>
                <ul className="text-sm space-y-1 mb-4">
                  <li>Clearing your browser cache/data will delete all records.</li>
                  <li>Uninstalling the app will delete all data.</li>
                  <li>Switching devices will not transfer your data.</li>
                  <li>We cannot recover lost data.</li>
                </ul>
                <p className="text-sm font-medium mb-4">
                  We strongly recommend exporting backups regularly.
                </p>

                <h4 className="text-stone-800 dark:text-stone-100 font-semibold mt-4 mb-2">
                  Third-party services
                </h4>
                <p className="text-sm leading-relaxed mb-4">
                  CBTJournal does not use any third-party services, analytics, or tracking tools.
                </p>

                <h4 className="text-stone-800 dark:text-stone-100 font-semibold mt-4 mb-2">
                  Children's privacy
                </h4>
                <p className="text-sm leading-relaxed mb-4">
                  CBTJournal does not knowingly collect information from anyone under the age of 13.
                  The app is designed for adults (18+) or use under parental guidance.
                </p>

                <h4 className="text-stone-800 dark:text-stone-100 font-semibold mt-4 mb-2">
                  Medical disclaimer
                </h4>
                <p className="text-sm leading-relaxed mb-2">
                  CBTJournal is not a substitute for professional mental health care. If you are
                  experiencing a mental health crisis, please contact:
                </p>
                <ul className="text-sm space-y-1 mb-4">
                  <li>Emergency services (911 in US).</li>
                  <li>National Suicide Prevention Lifeline: 1-800-273-8255.</li>
                  <li>Crisis Text Line: Text HOME to 741741.</li>
                </ul>

                <h4 className="text-stone-800 dark:text-stone-100 font-semibold mt-4 mb-2">
                  Contact
                </h4>
                <p className="text-sm leading-relaxed mb-4">
                  For questions about this privacy policy or CBTJournal, please contact:
                  davittbarry333@gmail.com
                </p>

                <h4 className="text-stone-800 dark:text-stone-100 font-semibold mt-4 mb-2">
                  Your rights
                </h4>
                <p className="text-sm leading-relaxed mb-4">
                  Depending on your location, you may have rights under data protection laws such as
                  GDPR or CCPA. Since we don't collect any data, these rights automatically apply -
                  you have full control and ownership of all your data.
                </p>

                <div className="bg-stone-50 dark:bg-stone-800 rounded-lg p-4 mt-6">
                  <p className="text-sm font-medium text-stone-800 dark:text-stone-100 mb-2">
                    By using CBTJournal, you acknowledge that:
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>All data is stored locally on your device.</li>
                    <li>You are responsible for backing up your data.</li>
                    <li>We cannot recover data if it is lost.</li>
                    <li>The app is for informational purposes and is not medical advice.</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="mt-4 flex-shrink-0">
              <button onClick={() => setShowPrivacyPolicy(false)} className="btn-primary w-full">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section>
          <h2 className="text-base font-semibold text-stone-700 dark:text-stone-300 mb-4">
            Your data
          </h2>
          <div className="card p-5 space-y-4">
            <div className="flex justify-between">
              <span className="text-stone-500 dark:text-stone-400">Thought records</span>
              <span className="text-stone-800 dark:text-stone-100 font-medium">
                {thoughtRecords.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500 dark:text-stone-400">Gratitude entries</span>
              <span className="text-stone-800 dark:text-stone-100 font-medium">
                {gratitudeEntries.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500 dark:text-stone-400">Depression checklists</span>
              <span className="text-stone-800 dark:text-stone-100 font-medium">
                {depressionChecklists.length}
              </span>
            </div>
            {lastBackupDate && (
              <div className="pt-3 border-t border-stone-100 dark:border-stone-700">
                <div className="text-sm text-stone-500 dark:text-stone-400">Last backup</div>
                <div className="text-sm text-stone-700 dark:text-stone-300 mt-1">
                  {daysSinceBackup === 0
                    ? 'Today'
                    : daysSinceBackup === 1
                      ? 'Yesterday'
                      : `${daysSinceBackup} days ago`}
                </div>
              </div>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold text-stone-700 dark:text-stone-300 mb-4">
            Export & import
          </h2>
          <div className="space-y-3">
            <button onClick={handleExport} className="btn-secondary w-full">
              Export data as JSON
            </button>

            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              id="import-file"
            />
            <label
              htmlFor="import-file"
              className="btn-secondary block w-full text-center cursor-pointer"
            >
              Import from file
            </label>

            <button onClick={() => setShowPasteModal(true)} className="btn-secondary w-full">
              Paste JSON data
            </button>

            {hasFileSystemAccess() && (
              <button onClick={handleMultipleFilesImport} className="btn-secondary w-full">
                Import & merge multiple files
              </button>
            )}
          </div>
          <p className="text-stone-500 dark:text-stone-400 text-sm mt-3 leading-relaxed">
            Your data is stored locally in your browser. Export regularly to back up your data.
            <span className="block mt-2 text-stone-600 dark:text-stone-300 font-medium">
              On mobile: If the file picker doesn't show your JSON file, use "Paste JSON data"
              instead.
            </span>
          </p>
        </section>
      </div>

      {hasFileSystemAccess() && (
        <section className="mt-6">
          <h2 className="text-base font-semibold text-stone-700 dark:text-stone-300 mb-4">
            Auto-save (Chrome/Edge only)
          </h2>
          <div className="card p-5">
            {!autoSaveEnabled ? (
              <>
                <p className="text-stone-600 dark:text-stone-300 text-sm mb-4 leading-relaxed">
                  Set up auto-save to automatically save your data to a file on your computer. This
                  provides an extra layer of protection.
                </p>
                <button onClick={handleSetupAutoSave} className="btn-primary w-full">
                  Set up auto-save
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-helpful-600 dark:text-helpful-500 mb-4">
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Auto-save is enabled</span>
                </div>
                <p className="text-stone-600 dark:text-stone-300 text-sm mb-4 leading-relaxed">
                  Your data is automatically saved to your chosen file location when you make
                  changes.
                </p>
                <button onClick={handleDisableAutoSave} className="btn-secondary w-full">
                  Disable auto-save
                </button>
              </>
            )}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-base font-semibold text-stone-700 dark:text-stone-300 mb-4">
          Appearance
        </h2>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-stone-800 dark:text-stone-100">Theme</div>
              <div className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
                Choose your preferred color scheme
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            <button
              onClick={() => setTheme('light')}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-colors ${
                theme === 'light'
                  ? 'border-sage-500 bg-sage-50 dark:bg-sage-900/30'
                  : 'border-stone-200 dark:border-stone-600 hover:border-stone-300 dark:hover:border-stone-500'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-warm-100 border border-stone-200 flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span
                className={`text-sm font-medium ${theme === 'light' ? 'text-sage-700 dark:text-sage-300' : 'text-stone-600 dark:text-stone-400'}`}
              >
                Light
              </span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-colors ${
                theme === 'dark'
                  ? 'border-sage-500 bg-sage-50 dark:bg-sage-900/30'
                  : 'border-stone-200 dark:border-stone-600 hover:border-stone-300 dark:hover:border-stone-500'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-stone-800 border border-stone-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-stone-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              </div>
              <span
                className={`text-sm font-medium ${theme === 'dark' ? 'text-sage-700 dark:text-sage-300' : 'text-stone-600 dark:text-stone-400'}`}
              >
                Dark
              </span>
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-colors ${
                theme === 'system'
                  ? 'border-sage-500 bg-sage-50 dark:bg-sage-900/30'
                  : 'border-stone-200 dark:border-stone-600 hover:border-stone-300 dark:hover:border-stone-500'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-warm-100 to-stone-800 border border-stone-300 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-stone-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <span
                className={`text-sm font-medium ${theme === 'system' ? 'text-sage-700 dark:text-sage-300' : 'text-stone-600 dark:text-stone-400'}`}
              >
                System
              </span>
            </button>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-base font-semibold text-stone-700 dark:text-stone-300 mb-4">About</h2>
        <div className="card p-5">
          <p className="text-stone-600 dark:text-stone-300 mb-3 leading-relaxed">
            CBTJournal is based on the cognitive behavioral therapy techniques from "Feeling Good"
            by David D. Burns, M.D.
          </p>
          <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed mb-3">
            This app is not a replacement for professional mental health care. If you're struggling,
            please reach out to a mental health professional.
          </p>
          <button
            onClick={() => setShowPrivacyPolicy(true)}
            className="text-sm text-sage-600 dark:text-sage-400 hover:text-sage-700 dark:hover:text-sage-300 underline"
          >
            Privacy policy
          </button>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-base font-semibold text-stone-700 dark:text-stone-300 mb-4">
          Privacy & data
        </h2>
        <div className="card p-5 space-y-3">
          <div className="text-stone-600 dark:text-stone-300 leading-relaxed space-y-3">
            <p className="font-medium text-stone-700 dark:text-stone-200">
              Your data stays on your device.
            </p>
            <p className="text-sm">
              All thought records, gratitude entries, and checklist responses are stored locally in
              your browser using IndexedDB. Nothing is sent to any server.
            </p>
            <p className="text-sm">
              This means you have complete control and privacy, but you're also responsible for
              backing up your data regularly.
            </p>
          </div>

          <div className="pt-3 border-t border-stone-100 dark:border-stone-700">
            <h3 className="text-sm font-medium text-stone-700 dark:text-stone-200 mb-2">
              What gets stored
            </h3>
            <ul className="text-sm text-stone-600 dark:text-stone-300 space-y-1">
              <li>• Your thought records and responses.</li>
              <li>• Gratitude journal entries.</li>
              <li>• Depression checklist scores.</li>
              <li>• App preferences (theme, settings).</li>
            </ul>
          </div>

          <div className="pt-3 border-t border-stone-100 dark:border-stone-700">
            <h3 className="text-sm font-medium text-stone-700 dark:text-stone-200 mb-2">
              What doesn't happen
            </h3>
            <ul className="text-sm text-stone-600 dark:text-stone-300 space-y-1">
              <li>• No analytics or tracking.</li>
              <li>• No cloud sync or external servers.</li>
              <li>• No data collection by third parties.</li>
            </ul>
          </div>

          <div className="pt-3 border-t border-stone-100 dark:border-stone-700 bg-amber-50 dark:bg-amber-900/20 -mx-5 -mb-5 p-5 rounded-b-xl">
            <div className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <div className="text-sm text-amber-800 dark:text-amber-200">
                <p className="font-medium mb-1">Data can be lost</p>
                <p>
                  Clearing your browser data or uninstalling the app will delete everything. Export
                  backups regularly to protect your work.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPrivacyPolicy(true)}
              className="mt-4 text-sm text-stone-600 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 underline"
            >
              Read full privacy policy
            </button>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-base font-semibold text-stone-700 dark:text-stone-300 mb-4">Guide</h2>
        <div className="card p-5 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-stone-700 dark:text-stone-200 mb-2">
              Thought records
            </h3>
            <p className="text-sm text-stone-600 dark:text-stone-300">
              When you notice negative emotions, record the situation, identify your automatic
              thoughts, spot cognitive distortions, and develop balanced responses.
            </p>
          </div>

          <div className="pt-3 border-t border-stone-100 dark:border-stone-700">
            <h3 className="text-sm font-medium text-stone-700 dark:text-stone-200 mb-2">
              Gratitude journal
            </h3>
            <p className="text-sm text-stone-600 dark:text-stone-300">
              Daily gratitude practice. Note three things you're grateful for to build positive
              thought patterns over time.
            </p>
          </div>

          <div className="pt-3 border-t border-stone-100 dark:border-stone-700">
            <h3 className="text-sm font-medium text-stone-700 dark:text-stone-200 mb-2">
              Depression checklist
            </h3>
            <p className="text-sm text-stone-600 dark:text-stone-300">
              Track your mood with the Burns Depression Checklist. Regular tracking helps you spot
              patterns and measure progress.
            </p>
          </div>

          <div className="pt-3 border-t border-stone-100 dark:border-stone-700">
            <h3 className="text-sm font-medium text-stone-700 dark:text-stone-200 mb-2">
              Insights
            </h3>
            <p className="text-sm text-stone-600 dark:text-stone-300">
              After you've created a few entries, the Insights page shows visual charts and
              statistics. Track emotion trends over time, see which cognitive distortions appear
              most often, and monitor your depression checklist scores. The more data you add, the
              more useful these patterns become for understanding your mental health journey.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-base font-semibold text-stone-700 dark:text-stone-300 mb-4">
          Resources
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <a
            href="https://feelinggood.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="card block p-5 hover:shadow-soft-lg dark:hover:shadow-soft-lg-dark transition-shadow duration-200"
          >
            <div className="text-stone-800 dark:text-stone-100 font-medium">
              Feeling Good (David D. Burns)
            </div>
            <div className="text-stone-500 dark:text-stone-400 text-sm mt-1">
              Official website with resources and podcasts
            </div>
          </a>
          <a
            href="https://www.findahelpline.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="card block p-5 hover:shadow-soft-lg dark:hover:shadow-soft-lg-dark transition-shadow duration-200"
          >
            <div className="text-stone-800 dark:text-stone-100 font-medium">Find a Helpline</div>
            <div className="text-stone-500 dark:text-stone-400 text-sm mt-1">
              Free emotional support helplines worldwide
            </div>
          </a>
        </div>
      </section>

      {isDev && (
        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-stone-700 dark:text-stone-300">
              Developer tools
            </h2>
            <button
              onClick={() => setShowDevTools(!showDevTools)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:ring-0 focus:ring-offset-0 ${
                showDevTools ? 'bg-sage-500' : 'bg-stone-300 dark:bg-stone-600'
              }`}
              aria-label="Toggle developer tools"
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm ${
                  showDevTools ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {showDevTools && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
              <div className="card p-5">
                <div className="flex justify-between mb-4">
                  <span className="text-stone-500 dark:text-stone-400 text-sm">Total logs</span>
                  <span className="text-stone-800 dark:text-stone-100 font-mono text-sm">
                    {allLogs.length}
                  </span>
                </div>
                <div className="flex justify-between mb-4">
                  <span className="text-stone-500 dark:text-stone-400 text-sm">Recent errors</span>
                  <span className="text-stone-800 dark:text-stone-100 font-mono text-sm">
                    {recentErrors.length}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleExportLogs} className="btn-secondary flex-1 py-2 text-sm">
                    Export logs
                  </button>
                  <button onClick={handleClearLogs} className="btn-secondary flex-1 py-2 text-sm">
                    Clear logs
                  </button>
                </div>
              </div>

              <div className="card p-5">
                <h3 className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-3">
                  Test actions
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => toast.success('Test success message')}
                    className="btn-secondary w-full py-2 text-sm"
                  >
                    Test success toast
                  </button>
                  <button
                    onClick={() => toast.error('Test error message')}
                    className="btn-secondary w-full py-2 text-sm"
                  >
                    Test error toast
                  </button>
                  <button
                    onClick={() => logger.error('Test', 'Manual test error')}
                    className="btn-secondary w-full py-2 text-sm"
                  >
                    Log test error
                  </button>
                </div>
              </div>

              {recentErrors.length > 0 && (
                <div className="card p-5 md:col-span-2">
                  <h3 className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-3">
                    Recent errors
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {recentErrors.map((log, i) => (
                      <div
                        key={i}
                        className="bg-critical-50 dark:bg-critical-500/10 rounded-lg p-3 text-xs"
                      >
                        <div className="text-critical-600 dark:text-critical-400 font-mono mb-1">
                          [{log.context}]
                        </div>
                        <div className="text-critical-700 dark:text-critical-300">
                          {log.message}
                        </div>
                        <div className="text-critical-400 dark:text-critical-500 mt-1">
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
