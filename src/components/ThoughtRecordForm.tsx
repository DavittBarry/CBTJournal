import { useState } from 'react'
import { useAppStore } from '@/stores/appStore'
import { COGNITIVE_DISTORTIONS, type ThoughtRecord, type Emotion, type CognitiveDistortionId } from '@/types'
import { format } from 'date-fns'
import { PageIntro, SectionHeader, InfoButton } from '@/components/InfoComponents'
import { AutoExpandTextarea } from '@/components/AutoExpandTextarea'
import { toast } from '@/stores/toastStore'

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
  const [expandedDistortion, setExpandedDistortion] = useState<CognitiveDistortionId | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const filledEmotions = emotions.filter(e => e.name.trim())
    if (!situation.trim()) {
      toast.warning('Please describe the situation')
      return
    }
    if (filledEmotions.length === 0) {
      toast.warning('Please add at least one emotion')
      return
    }
    if (!automaticThoughts.trim()) {
      toast.warning('Please write your automatic thoughts')
      return
    }
    
    const record: ThoughtRecord = {
      id: existingRecord?.id || generateId(),
      createdAt: existingRecord?.createdAt || new Date().toISOString(),
      date,
      situation,
      emotions: filledEmotions,
      automaticThoughts,
      distortions,
      rationalResponse,
      outcomeEmotions: outcomeEmotions.filter(e => e.name.trim())
    }

    if (existingRecord) {
      await updateThoughtRecord(record)
      toast.success('Record updated')
    } else {
      await addThoughtRecord(record)
      toast.success('Record saved')
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
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
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
        <div className="w-16" />
      </div>

      <PageIntro
        title={existingRecord ? 'Edit record' : 'New thought record'}
        description="A thought record helps you examine upsetting thoughts and develop more balanced perspectives. By writing down and analyzing your thoughts, you can identify patterns that contribute to negative emotions and learn to respond more helpfully."
        centered={false}
        steps={[
          'Notice an unpleasant emotion and describe what triggered it.',
          'Write down the automatic thoughts that accompanied the emotion.',
          'Identify which thinking patterns (distortions) are present.',
          'Write a more balanced, rational response to challenge those thoughts.',
          'Notice how your emotions shift after this reflection.'
        ]}
      />

      <div className="space-y-8">
        <section>
          <SectionHeader
            number={1}
            title="The situation"
            description="What happened that led to the unpleasant emotion?"
          />
          
          <div className="card p-5 space-y-4">
            <div>
              <label className="label">
                Date
                <InfoButton
                  title="When did this happen?"
                  content="Record the date of the event. This helps you track patterns over time and see your progress."
                />
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="label">
                Describe the situation
                <InfoButton
                  title="What triggered this?"
                  content="Briefly describe the actual event, thought, or situation that led to your unpleasant emotion. Be specific but concise. Focus on facts rather than interpretations."
                  example="My manager didn't respond to my email after 2 hours"
                />
              </label>
              <AutoExpandTextarea
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                minRows={2}
                maxRows={8}
                placeholder="Describe what happened..."
              />
            </div>
          </div>
        </section>

        <section>
          <SectionHeader
            number={2}
            title="Your emotions"
            description="What emotions did you feel? Rate their intensity."
          />
          
          <div className="card p-5">
            <label className="label">
              Emotions
              <InfoButton
                title="Rating your emotions"
                content="Name each emotion you felt and rate its intensity from 0% (barely noticeable) to 100% (the most intense you've ever felt). Common emotions include: sad, anxious, angry, guilty, ashamed, hopeless, frustrated, lonely."
                example="Anxious 75%, Frustrated 60%"
              />
            </label>
            <div className="space-y-2">
              {emotions.map((emotion, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={emotion.name}
                    onChange={(e) => updateEmotion(index, 'name', e.target.value, false)}
                    placeholder="e.g., Anxious, Sad"
                    className="input-field flex-1 min-w-0"
                  />
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={emotion.intensity}
                      onChange={(e) => updateEmotion(index, 'intensity', parseInt(e.target.value) || 0, false)}
                      className="input-field w-20 text-center tabular-nums"
                    />
                    <span className="text-stone-400 text-sm w-4">%</span>
                  </div>
                  {emotions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEmotion(index, false)}
                      className="text-stone-400 hover:text-critical-500 p-1 transition-colors flex-shrink-0"
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
        </section>

        <section>
          <SectionHeader
            number={3}
            title="Automatic thoughts"
            description="What thoughts went through your mind?"
          />
          
          <div className="card p-5">
            <label className="label">
              Write your thoughts
              <InfoButton
                title="Capturing automatic thoughts"
                content="Write down the thoughts that accompanied your emotion. These are often quick, automatic interpretations that pop into your mind. Try to capture them word-for-word, even if they seem irrational. Don't filter or judge them yet."
                example="He must be angry at me. I always mess things up. I'll probably get fired."
              />
            </label>
            <AutoExpandTextarea
              value={automaticThoughts}
              onChange={(e) => setAutomaticThoughts(e.target.value)}
              minRows={3}
              maxRows={12}
              placeholder="What was going through your mind?..."
            />
          </div>
        </section>

        <section>
          <SectionHeader
            number={4}
            title="Identify thinking patterns"
            description="Which cognitive distortions are present in your thoughts?"
          />
          
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <label className="label mb-0">
                Cognitive distortions
                <InfoButton
                  title="What are cognitive distortions?"
                  content="Cognitive distortions are patterns of biased thinking that can make situations seem worse than they are. We all use them sometimes. Identifying them helps you see your thoughts more objectively and respond more helpfully."
                />
              </label>
              <span className="text-sm text-stone-500">
                {distortions.length} selected
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {COGNITIVE_DISTORTIONS.map((distortion) => (
                <div key={distortion.id} className="sm:contents">
                  <div className={expandedDistortion === distortion.id ? 'sm:col-span-2' : ''}>
                    <button
                      type="button"
                      onClick={() => toggleDistortion(distortion.id)}
                      className={`w-full text-left p-3.5 rounded-xl border-2 transition-all duration-200 ${
                        distortions.includes(distortion.id)
                          ? 'bg-sage-50 border-sage-400'
                          : 'bg-white border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-medium text-sm ${distortions.includes(distortion.id) ? 'text-sage-700' : 'text-stone-700'}`}>
                          {distortion.id}. {distortion.shortName}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setExpandedDistortion(expandedDistortion === distortion.id ? null : distortion.id)
                          }}
                          className="text-stone-400 hover:text-stone-600 p-1"
                        >
                          <svg 
                            className={`w-4 h-4 transition-transform ${expandedDistortion === distortion.id ? 'rotate-180' : ''}`} 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2"
                          >
                            <path d="M6 9l6 6 6-6" />
                          </svg>
                        </button>
                      </div>
                    </button>
                    {expandedDistortion === distortion.id && (
                      <div className="mt-1 ml-4 p-3 bg-stone-50 rounded-lg text-sm text-stone-600 animate-fade-in">
                        {distortion.description}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <SectionHeader
            number={5}
            title="Rational response"
            description="Challenge your automatic thoughts with a more balanced view."
          />
          
          <div className="card p-5">
            <label className="label">
              Write your response
              <InfoButton
                title="Creating a rational response"
                content="Write a more balanced, realistic response to your automatic thoughts. Consider: What evidence supports or contradicts this thought? What would you tell a friend in this situation? What's a more helpful way to view this? You're not trying to be falsely positive, just more accurate and fair to yourself."
                example="He might just be busy. One delayed response doesn't mean he's angry. I've done good work and have no reason to think I'll be fired."
              />
            </label>
            <AutoExpandTextarea
              value={rationalResponse}
              onChange={(e) => setRationalResponse(e.target.value)}
              minRows={3}
              maxRows={12}
              placeholder="Write a more balanced perspective..."
            />
          </div>
        </section>

        <section>
          <SectionHeader
            number={6}
            title="Outcome"
            description="After this reflection, how do you feel now?"
          />
          
          <div className="card p-5">
            <label className="label">
              Re-rate your emotions
              <InfoButton
                title="Measuring the shift"
                content="After writing your rational response, re-rate your emotions. You might use the same emotions from step 2 or notice new ones. The goal isn't to eliminate negative feelings entirely, but to reduce their intensity by seeing things more clearly. Even a small reduction shows the technique is working."
                example="If you started at Anxious 75%, you might now feel Anxious 40%"
              />
            </label>
            <div className="space-y-2">
              {outcomeEmotions.map((emotion, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={emotion.name}
                    onChange={(e) => updateEmotion(index, 'name', e.target.value, true)}
                    placeholder="e.g., Calmer, Less anxious"
                    className="input-field flex-1 min-w-0"
                  />
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={emotion.intensity}
                      onChange={(e) => updateEmotion(index, 'intensity', parseInt(e.target.value) || 0, true)}
                      className="input-field w-20 text-center tabular-nums"
                    />
                    <span className="text-stone-400 text-sm w-4">%</span>
                  </div>
                  {outcomeEmotions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEmotion(index, true)}
                      className="text-stone-400 hover:text-critical-500 p-1 transition-colors flex-shrink-0"
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
        </section>

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
