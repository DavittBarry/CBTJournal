import { useState } from 'react'
import { useAppStore } from '@/stores/appStore'
import { COGNITIVE_DISTORTIONS } from '@/types'
import { format, parseISO } from 'date-fns'
import { ThoughtRecordForm } from './ThoughtRecordForm'

export function ThoughtDetailView() {
  const { thoughtRecords, selectedRecordId, setView, deleteThoughtRecord } = useAppStore()
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const record = thoughtRecords.find(r => r.id === selectedRecordId)

  if (!record) {
    return (
      <div className="text-center py-16">
        <p className="text-stone-500 mb-4">Record not found</p>
        <button
          onClick={() => setView('home')}
          className="text-sage-600 hover:text-sage-700 font-medium"
        >
          Go back
        </button>
      </div>
    )
  }

  if (isEditing) {
    return <ThoughtRecordForm existingRecord={record} />
  }

  const handleDelete = async () => {
    await deleteThoughtRecord(record.id)
    setView('home')
  }

  const getDistortion = (id: number) => COGNITIVE_DISTORTIONS.find(d => d.id === id)

  const maxInitialEmotion = record.emotions.reduce(
    (max, e) => (e.intensity > max.intensity ? e : max),
    record.emotions[0]
  )
  const maxOutcomeEmotion = record.outcomeEmotions.length > 0
    ? record.outcomeEmotions.reduce(
        (max, e) => (e.intensity > max.intensity ? e : max),
        record.outcomeEmotions[0]
      )
    : null

  return (
    <div className="pb-28">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setView('home')}
          className="text-stone-500 hover:text-stone-700 flex items-center gap-1"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="text-sage-600 hover:text-sage-700 px-3 py-1 font-medium"
          >
            Edit
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-critical-500 hover:text-critical-600 px-3 py-1 font-medium"
          >
            Delete
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-stone-800 mb-2">Delete this record?</h3>
            <p className="text-stone-500 text-sm mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-critical-500 hover:bg-critical-600 text-white font-medium py-3 px-6 rounded-xl transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="text-stone-500 text-sm mb-6">
        {format(parseISO(record.date), 'EEEE, MMMM d, yyyy')}
      </div>

      <div className="space-y-4">
        <section className="card p-5">
          <h2 className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-2">Situation</h2>
          <p className="text-stone-700 leading-relaxed">{record.situation}</p>
        </section>

        <section className="card p-5">
          <h2 className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-3">Initial emotions</h2>
          <div className="flex flex-wrap gap-2">
            {record.emotions.map((emotion, i) => (
              <div key={i} className="bg-warm-200 rounded-full px-3 py-1.5">
                <span className="text-stone-700 text-sm">{emotion.name}</span>
                <span className="text-stone-500 text-sm ml-1.5">{emotion.intensity}%</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-5">
          <h2 className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-2">Automatic thoughts</h2>
          <p className="text-stone-700 whitespace-pre-wrap leading-relaxed">{record.automaticThoughts}</p>
        </section>

        <section className="card p-5">
          <h2 className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-3">Cognitive distortions</h2>
          <div className="space-y-2">
            {record.distortions.map((id) => {
              const distortion = getDistortion(id)
              return distortion ? (
                <div key={id} className="bg-sage-50 border border-sage-200 rounded-xl p-4">
                  <div className="text-sage-700 font-medium text-sm">
                    {distortion.id}. {distortion.name}
                  </div>
                  <div className="text-stone-500 text-sm mt-1 leading-relaxed">{distortion.description}</div>
                </div>
              ) : null
            })}
          </div>
        </section>

        <section className="card p-5">
          <h2 className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-2">Rational response</h2>
          <p className="text-stone-700 whitespace-pre-wrap leading-relaxed">{record.rationalResponse}</p>
        </section>

        <section className="card p-5">
          <h2 className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-3">Outcome emotions</h2>
          <div className="flex flex-wrap gap-2">
            {record.outcomeEmotions.map((emotion, i) => (
              <div key={i} className="bg-warm-200 rounded-full px-3 py-1.5">
                <span className="text-stone-700 text-sm">{emotion.name}</span>
                <span className="text-stone-500 text-sm ml-1.5">{emotion.intensity}%</span>
              </div>
            ))}
          </div>
          {maxInitialEmotion && maxOutcomeEmotion && (
            <div className="mt-4 text-sm font-medium">
              {maxInitialEmotion.intensity > maxOutcomeEmotion.intensity ? (
                <span className="text-helpful-500">
                  ↓ Reduced by {maxInitialEmotion.intensity - maxOutcomeEmotion.intensity}%
                </span>
              ) : maxInitialEmotion.intensity < maxOutcomeEmotion.intensity ? (
                <span className="text-coral-500">
                  ↑ Increased by {maxOutcomeEmotion.intensity - maxInitialEmotion.intensity}%
                </span>
              ) : (
                <span className="text-stone-400">No change</span>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
