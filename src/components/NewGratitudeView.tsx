import { useState, useRef, useEffect } from 'react'
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
  minHeight?: number
}

function AutoExpandInput({ value, onChange, placeholder, minHeight = 48 }: AutoExpandInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = 'auto'
    const newHeight = Math.max(textarea.scrollHeight, minHeight)
    textarea.style.height = `${newHeight}px`
  }, [value, minHeight])

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={1}
      className="input-field resize-y py-3"
      style={{ overflow: 'hidden', minHeight: `${minHeight}px` }}
    />
  )
}

// Prompts to help with gratitude practice
const GRATITUDE_PROMPTS = [
  'What made you smile today?',
  'Who helped you recently?',
  'What simple pleasure did you enjoy?',
  'What challenge helped you grow?',
  'What beauty did you notice?',
  'What are you looking forward to?',
  'What comfort do you have that others might not?',
  'What skill or ability are you glad you have?',
] as const

export function NewGratitudeView() {
  const {
    gratitudeEntries,
    selectedGratitudeId,
    addGratitudeEntry,
    updateGratitudeEntry,
    deleteGratitudeEntry,
    setView,
    setSelectedGratitudeId,
  } = useAppStore()

  const existingEntry = selectedGratitudeId
    ? gratitudeEntries.find((e) => e.id === selectedGratitudeId)
    : null

  // Initialize state directly from existingEntry (no useEffect needed)
  const [date, setDate] = useState(() => existingEntry?.date || format(new Date(), 'yyyy-MM-dd'))
  const [entries, setEntries] = useState<string[]>(() =>
    existingEntry?.entries && existingEntry.entries.length > 0
      ? existingEntry.entries
      : ['', '', '']
  )
  const [whyGrateful, setWhyGrateful] = useState(() => existingEntry?.whyGrateful || '')
  const [savoring, setSavoring] = useState(() => existingEntry?.savoring || '')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(() =>
    Boolean(existingEntry?.whyGrateful || existingEntry?.savoring)
  )
  const [currentPrompt, setCurrentPrompt] = useState(
    () => GRATITUDE_PROMPTS[Math.floor(Math.random() * GRATITUDE_PROMPTS.length)]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const filteredEntries = entries.filter((e) => e.trim())
    if (filteredEntries.length === 0) {
      toast.warning('Please add at least one gratitude item')
      return
    }

    const entry: GratitudeEntry = {
      id: existingEntry?.id || generateId(),
      createdAt: existingEntry?.createdAt || new Date().toISOString(),
      date,
      entries: filteredEntries,
      whyGrateful: whyGrateful.trim() || undefined,
      savoring: savoring.trim() || undefined,
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

  const cyclePrompt = () => {
    const currentIndex = GRATITUDE_PROMPTS.indexOf(
      currentPrompt as (typeof GRATITUDE_PROMPTS)[number]
    )
    const nextIndex = (currentIndex + 1) % GRATITUDE_PROMPTS.length
    setCurrentPrompt(GRATITUDE_PROMPTS[nextIndex])
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={handleBack}
          className="text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 flex items-center gap-1"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
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
        description="Take a moment to notice the good things in your life, however small. Research by Robert Emmons shows that people who regularly practice gratitude experience more positive emotions, sleep better, express more compassion, and even have stronger immune systems."
        centered={false}
      />

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-200 mb-2">
              Delete this entry?
            </h3>
            <p className="text-stone-500 dark:text-stone-400 text-sm mb-5">
              This action cannot be undone.
            </p>
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

        {/* Inspiration prompt */}
        <div className="card p-4 bg-sage-50 dark:bg-sage-900/20 border-sage-200 dark:border-sage-800">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-sage-600 dark:text-sage-400 mb-1">Need inspiration?</p>
              <p className="text-sm text-sage-700 dark:text-sage-300 font-medium">
                {currentPrompt}
              </p>
            </div>
            <button
              type="button"
              onClick={cyclePrompt}
              className="text-sage-500 hover:text-sage-600 dark:text-sage-400 dark:hover:text-sage-300 p-1"
              title="Get another prompt"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M23 4v6h-6M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
              </svg>
            </button>
          </div>
        </div>

        <div className="card p-5">
          <label className="label">
            What are you grateful for?
            <InfoButton
              title="Writing effective gratitude entries"
              content="Be specific rather than general. Instead of 'my family', try 'the way my partner made me laugh at dinner'. Include small everyday moments, not just major events. Try to notice new things each day rather than repeating the same items. Research shows specificity amplifies the benefits."
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
                    className="text-stone-400 hover:text-critical-500 dark:hover:text-critical-400 p-1 pt-3 transition-colors flex-shrink-0"
                  >
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
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
            className="text-sage-600 dark:text-sage-400 hover:text-sage-700 dark:hover:text-sage-300 text-sm font-medium mt-4"
          >
            + Add another
          </button>
        </div>

        {/* Advanced options toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
        >
          <svg
            className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
          Deepen your practice (optional)
        </button>

        {showAdvanced && (
          <div className="space-y-6 animate-fade-in">
            <div className="card p-5">
              <label className="label">
                Why does this matter to you?
                <InfoButton
                  title="Understanding your gratitude"
                  content="Reflecting on WHY you're grateful deepens the emotional impact. What does this person, thing, or experience mean to you? How has it affected your life? This reflection helps move gratitude from a mental exercise to a felt experience."
                />
              </label>
              <AutoExpandInput
                value={whyGrateful}
                onChange={setWhyGrateful}
                placeholder="What makes this meaningful to you?"
                minHeight={72}
              />
            </div>

            <div className="card p-5">
              <label className="label">
                Savoring moment
                <InfoButton
                  title="The power of savoring"
                  content="Savoring is the practice of deliberately attending to and appreciating positive experiences. Take a moment to recall one of the things you listed above. Close your eyes and remember it in detail. What did you see, hear, feel? Write about that experience here."
                />
              </label>
              <AutoExpandInput
                value={savoring}
                onChange={setSavoring}
                placeholder="Describe a moment you want to hold onto in detail..."
                minHeight={72}
              />
              <p className="text-xs text-stone-400 dark:text-stone-500 mt-2">
                Try closing your eyes and reliving the moment before writing.
              </p>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex gap-2">
                <span className="text-blue-500 flex-shrink-0">🔬</span>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Research shows that combining gratitude journaling with savoring significantly
                  increases happiness and life satisfaction compared to gratitude alone. Taking time
                  to mentally "relive" positive experiences extends their emotional benefit.
                </p>
              </div>
            </div>
          </div>
        )}

        <button type="submit" className="btn-primary w-full">
          {existingEntry ? 'Update entry' : 'Save entry'}
        </button>
      </div>
    </form>
  )
}
