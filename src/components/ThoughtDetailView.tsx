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
      <div className="text-center py-12">
        <div className="text-slate-500">Record not found</div>
        <button
          onClick={() => setView('home')}
          className="text-blue-400 hover:text-blue-300 mt-4"
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
    <div className="pb-24">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setView('home')}
          className="text-slate-400 hover:text-white"
        >
          ← Back
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-400 hover:text-blue-300 px-3 py-1"
          >
            Edit
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-red-400 hover:text-red-300 px-3 py-1"
          >
            Delete
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-2">Delete this record?</h3>
            <p className="text-slate-400 text-sm mb-4">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div className="text-slate-400">
          {format(parseISO(record.date), 'EEEE, MMMM d, yyyy')}
        </div>
        {record.voiceTag && (
          <span className={`text-xs px-2 py-0.5 rounded ${
            record.voiceTag === 'helpful' 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-red-500/20 text-red-400'
          }`}>
            {record.voiceTag === 'helpful' ? 'Helpful' : 'Critical'}
          </span>
        )}
      </div>

      <section className="mb-6">
        <h2 className="text-sm font-medium text-slate-400 mb-2">Situation</h2>
        <p className="text-white">{record.situation}</p>
      </section>

      <section className="mb-6">
        <h2 className="text-sm font-medium text-slate-400 mb-2">Initial emotions</h2>
        <div className="flex flex-wrap gap-2">
          {record.emotions.map((emotion, i) => (
            <div key={i} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2">
              <span className="text-white">{emotion.name}</span>
              <span className="text-slate-400 ml-2">{emotion.intensity}%</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-sm font-medium text-slate-400 mb-2">Automatic thoughts</h2>
        <p className="text-white whitespace-pre-wrap">{record.automaticThoughts}</p>
      </section>

      <section className="mb-6">
        <h2 className="text-sm font-medium text-slate-400 mb-2">Cognitive distortions</h2>
        <div className="space-y-2">
          {record.distortions.map((id) => {
            const distortion = getDistortion(id)
            return distortion ? (
              <div key={id} className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <div className="text-blue-300 font-medium text-sm">
                  {distortion.id}. {distortion.name}
                </div>
                <div className="text-slate-400 text-sm mt-1">{distortion.description}</div>
              </div>
            ) : null
          })}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-sm font-medium text-slate-400 mb-2">Rational response</h2>
        <p className="text-white whitespace-pre-wrap">{record.rationalResponse}</p>
      </section>

      <section className="mb-6">
        <h2 className="text-sm font-medium text-slate-400 mb-2">Outcome emotions</h2>
        <div className="flex flex-wrap gap-2">
          {record.outcomeEmotions.map((emotion, i) => (
            <div key={i} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2">
              <span className="text-white">{emotion.name}</span>
              <span className="text-slate-400 ml-2">{emotion.intensity}%</span>
            </div>
          ))}
        </div>
        {maxInitialEmotion && maxOutcomeEmotion && (
          <div className="mt-3 text-sm">
            {maxInitialEmotion.intensity > maxOutcomeEmotion.intensity ? (
              <span className="text-green-400">
                ↓ Reduced by {maxInitialEmotion.intensity - maxOutcomeEmotion.intensity}%
              </span>
            ) : maxInitialEmotion.intensity < maxOutcomeEmotion.intensity ? (
              <span className="text-orange-400">
                ↑ Increased by {maxOutcomeEmotion.intensity - maxInitialEmotion.intensity}%
              </span>
            ) : (
              <span className="text-slate-400">No change</span>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
