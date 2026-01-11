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
    a.download = `untwist-export-${new Date().toISOString().split('T')[0]}.json`
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
    <div className="pb-28">
      <h1 className="text-2xl font-semibold text-stone-800 mb-8">Settings</h1>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-stone-700 mb-4">Your data</h2>
        <div className="card p-5 space-y-4">
          <div className="flex justify-between">
            <span className="text-stone-500">Thought records</span>
            <span className="text-stone-800 font-medium">{thoughtRecords.length}</span>
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
            onChange={handleImport}
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
