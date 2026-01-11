import { useState, useEffect, useRef } from 'react'
import { useAppStore } from '@/stores/appStore'
import type { GratitudeEntry } from '@/types'
import { format } from 'date-fns'
import { PageIntro, InfoButton } from '@/components/InfoComponents'
import { toast } from '@/stores/toastStore'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

interface AutoExpandInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

function AutoExpandInput({ value, onChange, placeholder }: AutoExpandInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    
    textarea.style.height = 'auto'
    const newHeight = Math.max(textarea.scrollHeight, 48)
    textarea.style.height = `${newHeight}px`
  }, [value])

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={1}
      className="input-field resize-y min-h-[48px] py-3"
      style={{ overflow: 'hidden' }}
    />
  )
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
      toast.warning('Please add at least one gratitude item')
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
      toast.success('Entry updated')
    } else {
      await addGratitudeEntry(entry)
      toast.success('Entry saved')
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
      toast.success('Entry deleted')
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
      <div className="flex items-center justify-between mb-4">
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

      <PageIntro
        title={existingEntry ? 'Edit entry' : 'New gratitude entry'}
        description="Take a moment to notice the good things in your life, however small. Studies show that people who regularly practice gratitude experience more positive emotions, sleep better, express more compassion, and even have stronger immune systems."
        centered={false}
      />

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
            What are you grateful for?
            <InfoButton
              title="Writing effective gratitude entries"
              content="Be specific rather than general. Instead of 'my family', try 'the way my partner made me laugh at dinner'. Include small everyday moments, not just major events. Try to notice new things each day rather than repeating the same items."
              example="The warm sunshine on my walk to work this morning"
            />
          </label>
          <div className="space-y-3">
            {entries.map((entry, index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="flex items-center text-sage-400 text-sm font-medium w-6 pt-3">
                  {index + 1}.
                </div>
                <div className="flex-1">
                  <AutoExpandInput
                    value={entry}
                    onChange={(value) => updateEntry(index, value)}
                    placeholder="Something you're grateful for..."
                  />
                </div>
                {entries.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEntry(index)}
                    className="text-stone-400 hover:text-critical-500 p-1 pt-3 transition-colors flex-shrink-0"
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
