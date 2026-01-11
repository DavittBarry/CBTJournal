import { useState } from 'react'
import { useAppStore } from '@/stores/appStore'
import { COGNITIVE_DISTORTIONS, type ThoughtRecord, type Emotion, type CognitiveDistortionId } from '@/types'
import { format } from 'date-fns'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

interface Props {
  existingRecord?: ThoughtRecord
}

export function ThoughtRecordForm({ existingRecord }: Props) {
  const { addThoughtRecord, updateThoughtRecord, setView } = useAppStore()
  
  const [date, setDate] = useState(existingRecord?.date || format(new Date(), 'yyyy-MM-dd'))
  const [situation, setSituation] = useState(existingRecord?.situation || '')
  const [emotions, setEmotions] = useState<Emotion[]>(existingRecord?.emotions || [{ name: '', intensity: 50 }])
  const [automaticThoughts, setAutomaticThoughts] = useState(existingRecord?.automaticThoughts || '')
  const [distortions, setDistortions] = useState<CognitiveDistortionId[]>(existingRecord?.distortions || [])
  const [rationalResponse, setRationalResponse] = useState(existingRecord?.rationalResponse || '')
  const [outcomeEmotions, setOutcomeEmotions] = useState<Emotion[]>(existingRecord?.outcomeEmotions || [{ name: '', intensity: 50 }])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const record: ThoughtRecord = {
      id: existingRecord?.id || generateId(),
      createdAt: existingRecord?.createdAt || new Date().toISOString(),
      date,
      situation,
      emotions: emotions.filter(e => e.name.trim()),
      automaticThoughts,
      distortions,
      rationalResponse,
      outcomeEmotions: outcomeEmotions.filter(e => e.name.trim())
    }

    if (existingRecord) {
      await updateThoughtRecord(record)
    } else {
      await addThoughtRecord(record)
    }
    
    setView('home')
  }

  const addEmotion = (isOutcome: boolean) => {
    if (isOutcome) {
      setOutcomeEmotions([...outcomeEmotions, { name: '', intensity: 50 }])
    } else {
      setEmotions([...emotions, { name: '', intensity: 50 }])
    }
  }

  const updateEmotion = (index: number, field: 'name' | 'intensity', value: string | number, isOutcome: boolean) => {
    const setter = isOutcome ? setOutcomeEmotions : setEmotions
    const current = isOutcome ? outcomeEmotions : emotions
    const updated = [...current]
    updated[index] = { ...updated[index], [field]: value }
    setter(updated)
  }

  const removeEmotion = (index: number, isOutcome: boolean) => {
    const setter = isOutcome ? setOutcomeEmotions : setEmotions
    const current = isOutcome ? outcomeEmotions : emotions
    setter(current.filter((_, i) => i !== index))
  }

  const toggleDistortion = (id: CognitiveDistortionId) => {
    setDistortions(prev => 
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    )
  }

  return (
    <form onSubmit={handleSubmit} className="pb-28">
      <div className="flex items-center justify-between mb-8">
        <button
          type="button"
          onClick={() => setView('home')}
          className="text-stone-500 hover:text-stone-700 flex items-center gap-1"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 className="text-xl font-semibold text-stone-800">
          {existingRecord ? 'Edit record' : 'New record'}
        </h1>
        <div className="w-16" />
      </div>

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
            Situation
            <span className="label-hint">What triggered the emotion?</span>
          </label>
          <textarea
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            rows={3}
            className="input-field resize-none"
            placeholder="Describe the event or situation..."
          />
        </div>

        <div className="card p-5">
          <label className="label">
            Emotions
            <span className="label-hint">Rate intensity 0-100%</span>
          </label>
          <div className="space-y-2">
            {emotions.map((emotion, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={emotion.name}
                  onChange={(e) => updateEmotion(index, 'name', e.target.value, false)}
                  placeholder="Emotion name"
                  className="input-field flex-1"
                />
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={emotion.intensity}
                    onChange={(e) => updateEmotion(index, 'intensity', parseInt(e.target.value) || 0, false)}
                    className="input-field w-16 text-center"
                  />
                  <span className="text-stone-400 text-sm">%</span>
                </div>
                {emotions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEmotion(index, false)}
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
            onClick={() => addEmotion(false)}
            className="text-sage-600 hover:text-sage-700 text-sm font-medium mt-3"
          >
            + Add emotion
          </button>
        </div>

        <div className="card p-5">
          <label className="label">
            Automatic thoughts
            <span className="label-hint">What went through your mind?</span>
          </label>
          <textarea
            value={automaticThoughts}
            onChange={(e) => setAutomaticThoughts(e.target.value)}
            rows={4}
            className="input-field resize-none"
            placeholder="Write the automatic thoughts..."
          />
        </div>

        <div className="card p-5">
          <label className="label">Cognitive distortions</label>
          <div className="space-y-2">
            {COGNITIVE_DISTORTIONS.map((distortion) => (
              <button
                key={distortion.id}
                type="button"
                onClick={() => toggleDistortion(distortion.id)}
                className={`w-full text-left p-3.5 rounded-xl border-2 transition-all duration-200 ${
                  distortions.includes(distortion.id)
                    ? 'bg-sage-50 border-sage-400 text-sage-700'
                    : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                }`}
              >
                <span className="font-medium text-sm">{distortion.id}. {distortion.shortName}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <label className="label">
            Rational response
            <span className="label-hint">Challenge the automatic thoughts</span>
          </label>
          <textarea
            value={rationalResponse}
            onChange={(e) => setRationalResponse(e.target.value)}
            rows={4}
            className="input-field resize-none"
            placeholder="Write your rational response..."
          />
        </div>

        <div className="card p-5">
          <label className="label">
            Outcome emotions
            <span className="label-hint">How do you feel now? (0-100%)</span>
          </label>
          <div className="space-y-2">
            {outcomeEmotions.map((emotion, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={emotion.name}
                  onChange={(e) => updateEmotion(index, 'name', e.target.value, true)}
                  placeholder="Emotion name"
                  className="input-field flex-1"
                />
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={emotion.intensity}
                    onChange={(e) => updateEmotion(index, 'intensity', parseInt(e.target.value) || 0, true)}
                    className="input-field w-16 text-center"
                  />
                  <span className="text-stone-400 text-sm">%</span>
                </div>
                {outcomeEmotions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEmotion(index, true)}
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
            onClick={() => addEmotion(true)}
            className="text-sage-600 hover:text-sage-700 text-sm font-medium mt-3"
          >
            + Add emotion
          </button>
        </div>

        <button
          type="submit"
          className="btn-primary w-full"
        >
          {existingRecord ? 'Update record' : 'Save record'}
        </button>
      </div>
    </form>
  )
}
