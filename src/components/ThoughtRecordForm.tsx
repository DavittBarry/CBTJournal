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
  const [voiceTag, setVoiceTag] = useState<'helpful' | 'critical' | null>(existingRecord?.voiceTag || null)

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
      outcomeEmotions: outcomeEmotions.filter(e => e.name.trim()),
      voiceTag
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
    <form onSubmit={handleSubmit} className="space-y-6 pb-24">
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={() => setView('home')}
          className="text-slate-400 hover:text-white"
        >
          ← Back
        </button>
        <h1 className="text-xl font-semibold">
          {existingRecord ? 'Edit thought record' : 'New thought record'}
        </h1>
        <div className="w-12" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Situation
          <span className="text-slate-500 font-normal ml-2">What triggered the emotion?</span>
        </label>
        <textarea
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          rows={3}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white resize-none"
          placeholder="Describe the event or situation..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Emotions
          <span className="text-slate-500 font-normal ml-2">Rate intensity 0-100%</span>
        </label>
        {emotions.map((emotion, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={emotion.name}
              onChange={(e) => updateEmotion(index, 'name', e.target.value, false)}
              placeholder="Emotion name"
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
            />
            <input
              type="number"
              min="0"
              max="100"
              value={emotion.intensity}
              onChange={(e) => updateEmotion(index, 'intensity', parseInt(e.target.value) || 0, false)}
              className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-center"
            />
            <span className="flex items-center text-slate-500">%</span>
            {emotions.length > 1 && (
              <button
                type="button"
                onClick={() => removeEmotion(index, false)}
                className="text-red-400 hover:text-red-300 px-2"
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => addEmotion(false)}
          className="text-blue-400 hover:text-blue-300 text-sm mt-1"
        >
          + Add emotion
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Automatic thoughts
          <span className="text-slate-500 font-normal ml-2">What went through your mind?</span>
        </label>
        <textarea
          value={automaticThoughts}
          onChange={(e) => setAutomaticThoughts(e.target.value)}
          rows={4}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white resize-none"
          placeholder="Write the automatic thoughts..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Voice tag
          <span className="text-slate-500 font-normal ml-2">Is this your helpful or critical inner voice?</span>
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setVoiceTag(voiceTag === 'helpful' ? null : 'helpful')}
            className={`flex-1 py-2 rounded-lg border transition-colors ${
              voiceTag === 'helpful'
                ? 'bg-green-500/20 border-green-500 text-green-400'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
            }`}
          >
            Helpful
          </button>
          <button
            type="button"
            onClick={() => setVoiceTag(voiceTag === 'critical' ? null : 'critical')}
            className={`flex-1 py-2 rounded-lg border transition-colors ${
              voiceTag === 'critical'
                ? 'bg-red-500/20 border-red-500 text-red-400'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
            }`}
          >
            Critical
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Cognitive distortions
        </label>
        <div className="grid grid-cols-1 gap-2">
          {COGNITIVE_DISTORTIONS.map((distortion) => (
            <button
              key={distortion.id}
              type="button"
              onClick={() => toggleDistortion(distortion.id)}
              className={`text-left p-3 rounded-lg border transition-colors ${
                distortions.includes(distortion.id)
                  ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              <div className="font-medium text-sm">{distortion.id}. {distortion.shortName}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Rational response
          <span className="text-slate-500 font-normal ml-2">Challenge the automatic thoughts</span>
        </label>
        <textarea
          value={rationalResponse}
          onChange={(e) => setRationalResponse(e.target.value)}
          rows={4}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white resize-none"
          placeholder="Write your rational response..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Outcome emotions
          <span className="text-slate-500 font-normal ml-2">How do you feel now? (0-100%)</span>
        </label>
        {outcomeEmotions.map((emotion, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={emotion.name}
              onChange={(e) => updateEmotion(index, 'name', e.target.value, true)}
              placeholder="Emotion name"
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
            />
            <input
              type="number"
              min="0"
              max="100"
              value={emotion.intensity}
              onChange={(e) => updateEmotion(index, 'intensity', parseInt(e.target.value) || 0, true)}
              className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-center"
            />
            <span className="flex items-center text-slate-500">%</span>
            {outcomeEmotions.length > 1 && (
              <button
                type="button"
                onClick={() => removeEmotion(index, true)}
                className="text-red-400 hover:text-red-300 px-2"
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => addEmotion(true)}
          className="text-blue-400 hover:text-blue-300 text-sm mt-1"
        >
          + Add emotion
        </button>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg transition-colors"
      >
        {existingRecord ? 'Update record' : 'Save record'}
      </button>
    </form>
  )
}
