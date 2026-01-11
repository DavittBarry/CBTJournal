import { useState, useEffect } from 'react'
import { useAppStore } from '@/stores/appStore'
import type { GratitudeEntry } from '@/types'
import { format } from 'date-fns'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function NewGratitudeView() {
  const { 
    gratitudeEntries, 
    selectedGratitudeId, 
    addGratitudeEntry, 
    updateGratitudeEntry,
    deleteGratitudeEntry,
    setView,
    setSelectedGratitudeId
  } = useAppStore()
  
  const existingEntry = selectedGratitudeId 
    ? gratitudeEntries.find(e => e.id === selectedGratitudeId) 
    : null

  const [date, setDate] = useState(existingEntry?.date || format(new Date(), 'yyyy-MM-dd'))
  const [entries, setEntries] = useState<string[]>(existingEntry?.entries || ['', '', ''])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (existingEntry) {
      setDate(existingEntry.date)
      setEntries(existingEntry.entries.length > 0 ? existingEntry.entries : ['', '', ''])
    }
  }, [existingEntry])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const filteredEntries = entries.filter(e => e.trim())
    if (filteredEntries.length === 0) {
      alert('Please add at least one gratitude item.')
      return
    }

    const entry: GratitudeEntry = {
      id: existingEntry?.id || generateId(),
      createdAt: existingEntry?.createdAt || new Date().toISOString(),
      date,
      entries: filteredEntries
    }

    if (existingEntry) {
      await updateGratitudeEntry(entry)
    } else {
      await addGratitudeEntry(entry)
    }
    
    setSelectedGratitudeId(null)
    setView('gratitude')
  }

  const handleBack = () => {
    setSelectedGratitudeId(null)
    setView('gratitude')
  }

  const handleDelete = async () => {
    if (existingEntry) {
      await deleteGratitudeEntry(existingEntry.id)
    }
    setSelectedGratitudeId(null)
    setView('gratitude')
  }

  const updateEntry = (index: number, value: string) => {
    const updated = [...entries]
    updated[index] = value
    setEntries(updated)
  }

  const addEntry = () => {
    setEntries([...entries, ''])
  }

  const removeEntry = (index: number) => {
    if (entries.length > 1) {
      setEntries(entries.filter((_, i) => i !== index))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="pb-28">
      <div className="flex items-center justify-between mb-8">
        <button
          type="button"
          onClick={handleBack}
          className="text-stone-500 hover:text-stone-700 flex items-center gap-1"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 className="text-xl font-semibold text-stone-800">
          {existingEntry ? 'Edit entry' : 'New entry'}
        </h1>
        <div className="w-16">
          {existingEntry && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-critical-500 hover:text-critical-600 font-medium text-sm"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-stone-800 mb-2">Delete this entry?</h3>
            <p className="text-stone-500 text-sm mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 bg-critical-500 hover:bg-critical-600 text-white font-medium py-3 px-6 rounded-xl transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="card p-5">
          <label className="label">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input-field"
          />
        </div>

        <div className="card p-5">
          <label className="label">
            What are you grateful for today?
            <span className="label-hint">Write as many as you like</span>
          </label>
          <div className="space-y-3">
            {entries.map((entry, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex items-center text-sage-400 text-sm font-medium w-6">
                  {index + 1}.
                </div>
                <input
                  type="text"
                  value={entry}
                  onChange={(e) => updateEntry(index, e.target.value)}
                  placeholder="Something you're grateful for..."
                  className="input-field flex-1"
                />
                {entries.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEntry(index)}
                    className="text-stone-400 hover:text-critical-500 px-2 transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addEntry}
            className="text-sage-600 hover:text-sage-700 text-sm font-medium mt-4"
          >
            + Add another
          </button>
        </div>

        <button
          type="submit"
          className="btn-primary w-full"
        >
          {existingEntry ? 'Update entry' : 'Save entry'}
        </button>
      </div>
    </form>
  )
}
