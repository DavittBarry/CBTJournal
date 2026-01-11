import { useRef, useState } from 'react'
import { useAppStore } from '@/stores/appStore'

type ImportStep = 'idle' | 'choose-mode' | 'confirm-replace'

export function SettingsView() {
  const { exportData, importData, thoughtRecords, depressionChecklists, gratitudeEntries } = useAppStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importStep, setImportStep] = useState<ImportStep>('idle')
  const [pendingImportData, setPendingImportData] = useState<string | null>(null)

  const hasExistingData = thoughtRecords.length > 0 || depressionChecklists.length > 0 || gratitudeEntries.length > 0

  const handleExport = async () => {
    const data = await exportData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `untwist-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const text = await file.text()
    
    try {
      JSON.parse(text)
    } catch {
      alert('Invalid JSON file.')
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

  const doImport = async (data: string, mode: 'merge' | 'replace') => {
    try {
      await importData(data, mode)
      alert('Data imported successfully!')
    } catch (err) {
      alert('Failed to import data. Make sure the file format is correct.')
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

  return (
    <div className="pb-28">
      <h1 className="text-2xl font-semibold text-stone-800 mb-8">Settings</h1>

      {importStep === 'choose-mode' && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-stone-800 mb-2">Import data</h3>
            <p className="text-stone-500 text-sm mb-5">
              You have existing data. How would you like to import?
            </p>
            <div className="space-y-3">
              <button
                onClick={handleMerge}
                className="btn-secondary w-full text-left px-4"
              >
                <div className="font-medium text-stone-700">Merge</div>
                <div className="text-sm text-stone-500">Add imported data to your existing records</div>
              </button>
              <button
                onClick={handleReplaceChosen}
                className="btn-secondary w-full text-left px-4"
              >
                <div className="font-medium text-stone-700">Replace</div>
                <div className="text-sm text-stone-500">Clear existing data and use only imported data</div>
              </button>
              <button
                onClick={resetImportState}
                className="w-full text-stone-500 hover:text-stone-700 py-2 text-sm font-medium"
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
            <h3 className="text-lg font-semibold text-stone-800 mb-2">Save a backup first?</h3>
            <p className="text-stone-500 text-sm mb-5">
              Replacing will permanently delete your current data. Would you like to export a backup before continuing?
            </p>
            <div className="space-y-3">
              <button
                onClick={handleExportThenReplace}
                className="btn-primary w-full"
              >
                Export backup, then replace
              </button>
              <button
                onClick={handleReplaceWithoutBackup}
                className="btn-secondary w-full text-critical-600 hover:text-critical-700"
              >
                Replace without backup
              </button>
              <button
                onClick={() => setImportStep('choose-mode')}
                className="w-full text-stone-500 hover:text-stone-700 py-2 text-sm font-medium"
              >
                Go back
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="mb-8">
        <h2 className="text-base font-semibold text-stone-700 mb-4">Your data</h2>
        <div className="card p-5 space-y-4">
          <div className="flex justify-between">
            <span className="text-stone-500">Thought records</span>
            <span className="text-stone-800 font-medium">{thoughtRecords.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Gratitude entries</span>
            <span className="text-stone-800 font-medium">{gratitudeEntries.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Depression checklists</span>
            <span className="text-stone-800 font-medium">{depressionChecklists.length}</span>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-stone-700 mb-4">Export & import</h2>
        <div className="space-y-3">
          <button
            onClick={handleExport}
            className="btn-secondary w-full"
          >
            Export data as JSON
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
            id="import-file"
          />
          <label
            htmlFor="import-file"
            className="btn-secondary block w-full text-center cursor-pointer"
          >
            Import data from JSON
          </label>
        </div>
        <p className="text-stone-500 text-sm mt-3 leading-relaxed">
          Your data is stored locally on your device. Export regularly to back up your data.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-stone-700 mb-4">About</h2>
        <div className="card p-5">
          <p className="text-stone-600 mb-3 leading-relaxed">
            Untwist is based on the cognitive behavioral therapy techniques from 
            "Feeling Good" by David D. Burns, M.D.
          </p>
          <p className="text-stone-500 text-sm leading-relaxed">
            This app is not a replacement for professional mental health care. 
            If you're struggling, please reach out to a mental health professional.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-base font-semibold text-stone-700 mb-4">Resources</h2>
        <div className="space-y-3">
          <a
            href="https://feelinggood.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="card block p-5 hover:shadow-soft-lg transition-shadow duration-200"
          >
            <div className="text-stone-800 font-medium">Feeling Good (David D. Burns)</div>
            <div className="text-stone-500 text-sm mt-1">Official website with resources and podcasts</div>
          </a>
          <a
            href="https://www.findahelpline.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="card block p-5 hover:shadow-soft-lg transition-shadow duration-200"
          >
            <div className="text-stone-800 font-medium">Find a Helpline</div>
            <div className="text-stone-500 text-sm mt-1">Free emotional support helplines worldwide</div>
          </a>
        </div>
      </section>
    </div>
  )
}
