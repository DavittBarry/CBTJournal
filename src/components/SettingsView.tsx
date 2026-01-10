import { useRef } from 'react'
import { useAppStore } from '@/stores/appStore'

export function SettingsView() {
  const { exportData, importData, thoughtRecords, depressionChecklists } = useAppStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = async () => {
    const data = await exportData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cbt-tracker-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const text = await file.text()
    try {
      await importData(text)
      alert('Data imported successfully!')
    } catch (err) {
      alert('Failed to import data. Make sure the file is valid.')
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="pb-24">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Your data</h2>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-4">
          <div className="flex justify-between">
            <span className="text-slate-400">Thought records</span>
            <span className="text-white font-medium">{thoughtRecords.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Depression checklists</span>
            <span className="text-white font-medium">{depressionChecklists.length}</span>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Export & import</h2>
        <div className="space-y-3">
          <button
            onClick={handleExport}
            className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white py-3 rounded-lg transition-colors"
          >
            Export data as JSON
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
            id="import-file"
          />
          <label
            htmlFor="import-file"
            className="block w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white py-3 rounded-lg text-center cursor-pointer transition-colors"
          >
            Import data from JSON
          </label>
        </div>
        <p className="text-slate-500 text-sm mt-2">
          Your data is stored locally on your device. Export regularly to back up your data.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">About</h2>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <p className="text-slate-300 mb-3">
            Untwist is based on the cognitive behavioral therapy techniques from 
            "Feeling Good" by David D. Burns, M.D.
          </p>
          <p className="text-slate-400 text-sm">
            This app is not a replacement for professional mental health care. 
            If you're struggling, please reach out to a mental health professional.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Resources</h2>
        <div className="space-y-2">
          <a
            href="https://feelinggood.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:bg-slate-800 transition-colors"
          >
            <div className="text-white">Feeling Good (David D. Burns)</div>
            <div className="text-slate-400 text-sm">Official website with resources and podcasts</div>
          </a>
          <a
            href="https://www.findahelpline.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:bg-slate-800 transition-colors"
          >
            <div className="text-white">Find a Helpline</div>
            <div className="text-slate-400 text-sm">Free emotional support helplines worldwide</div>
          </a>
        </div>
      </section>
    </div>
  )
}
