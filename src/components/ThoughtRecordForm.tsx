import { useState, useMemo } from 'react'
import { useAppStore } from '@/stores/appStore'
import {
  COGNITIVE_DISTORTIONS,
  COMMON_EMOTIONS,
  type ThoughtRecord,
  type Emotion,
  type CognitiveDistortionId,
} from '@/types'
import { format, parseISO } from 'date-fns'
import { PageIntro, SectionHeader, InfoButton } from '@/components/InfoComponents'
import { AutoExpandTextarea } from '@/components/AutoExpandTextarea'
import { toast } from '@/stores/toastStore'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

interface Props {
  existingRecord?: ThoughtRecord
}

type RecordMode = 'standard' | 'simple' | 'experiment' | 'defusion'

const DEFUSION_TECHNIQUES = [
  {
    id: 'leaves-stream',
    name: 'Leaves on a stream',
    description: 'Visualize placing your thoughts on leaves floating down a stream',
  },
  {
    id: 'thank-mind',
    name: 'Thank your mind',
    description: 'Say "Thanks mind, I\'ve got this" to acknowledge without engaging',
  },
  {
    id: 'having-thought',
    name: '"I\'m having the thought that..."',
    description: 'Add distance by labeling thoughts as thoughts',
  },
  {
    id: 'silly-voice',
    name: 'Silly voice',
    description: 'Say the thought in a cartoon voice to reduce its power',
  },
  { id: 'singing', name: 'Sing it', description: 'Sing the thought to a familiar tune' },
  {
    id: 'repeat',
    name: 'Rapid repetition',
    description: 'Repeat a key word until it loses meaning',
  },
]

export function ThoughtRecordForm({ existingRecord }: Props) {
  const { addThoughtRecord, addThoughtRecords, updateThoughtRecord, setView } = useAppStore()

  const [mode, setMode] = useState<RecordMode>(
    existingRecord?.isBehavioralExperiment
      ? 'experiment'
      : existingRecord?.defusionTechnique
        ? 'defusion'
        : 'standard'
  )
  const [dates, setDates] = useState<string[]>(
    existingRecord?.date ? [existingRecord.date] : [format(new Date(), 'yyyy-MM-dd')]
  )
  const [dateInput, setDateInput] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [situation, setSituation] = useState(existingRecord?.situation || '')
  const [emotions, setEmotions] = useState<Emotion[]>(
    existingRecord?.emotions || [{ name: '', intensity: 50 }]
  )
  const [automaticThoughts, setAutomaticThoughts] = useState(
    existingRecord?.automaticThoughts || ''
  )
  const [distortions, setDistortions] = useState<CognitiveDistortionId[]>(
    existingRecord?.distortions || []
  )
  const [rationalResponse, setRationalResponse] = useState(existingRecord?.rationalResponse || '')
  const [outcomeEmotions, setOutcomeEmotions] = useState<Emotion[]>(
    existingRecord?.outcomeEmotions || [{ name: '', intensity: 50 }]
  )
  const [newEmotions, setNewEmotions] = useState<Emotion[]>(existingRecord?.newEmotions || [])
  const [expandedDistortion, setExpandedDistortion] = useState<CognitiveDistortionId | null>(null)
  const [showEmotionSuggestions, setShowEmotionSuggestions] = useState(false)
  const [activeEmotionIndex, setActiveEmotionIndex] = useState<number | null>(null)
  const [emotionContext, setEmotionContext] = useState<'initial' | 'outcome' | 'new'>('initial')
  const [beliefBefore, setBeliefBefore] = useState(existingRecord?.beliefRatingBefore ?? 80)
  const [beliefAfter, setBeliefAfter] = useState(existingRecord?.beliefRatingAfter ?? 50)

  const [experimentPrediction, setExperimentPrediction] = useState(
    existingRecord?.experimentPrediction || ''
  )
  const [experimentOutcome, setExperimentOutcome] = useState(
    existingRecord?.experimentOutcome || ''
  )
  const [defusionTechnique, setDefusionTechnique] = useState(
    existingRecord?.defusionTechnique || ''
  )

  // Get challenging questions and reframing strategies for selected distortions
  const selectedDistortionHelpers = useMemo(() => {
    return distortions
      .map((id) => {
        const distortion = COGNITIVE_DISTORTIONS.find((d) => d.id === id)
        return distortion
          ? {
              name: distortion.shortName,
              questions: distortion.challengingQuestions,
              strategy: distortion.reframingStrategy,
            }
          : null
      })
      .filter(Boolean)
  }, [distortions])

  const addDate = () => {
    if (dateInput && !dates.includes(dateInput)) {
      setDates((prev) => [...prev, dateInput].sort())
    }
  }

  const removeDate = (dateToRemove: string) => {
    setDates((prev) => prev.filter((d) => d !== dateToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const filledEmotions = emotions.filter((e) => e.name.trim())
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
    if (dates.length === 0) {
      toast.warning('Please select at least one date')
      return
    }

    const baseRecord = {
      situation,
      emotions: filledEmotions,
      automaticThoughts,
      distortions,
      rationalResponse: mode === 'defusion' ? '' : rationalResponse,
      outcomeEmotions: outcomeEmotions.filter((e) => e.name.trim()),
      newEmotions: newEmotions.filter((e) => e.name.trim()),
      beliefRatingBefore: mode === 'standard' ? beliefBefore : undefined,
      beliefRatingAfter: mode === 'standard' ? beliefAfter : undefined,
      isBehavioralExperiment: mode === 'experiment',
      experimentPrediction: mode === 'experiment' ? experimentPrediction : undefined,
      experimentOutcome: mode === 'experiment' ? experimentOutcome : undefined,
      defusionTechnique: mode === 'defusion' ? defusionTechnique : undefined,
    }

    if (existingRecord) {
      const record: ThoughtRecord = {
        id: existingRecord.id,
        createdAt: existingRecord.createdAt,
        date: dates[0],
        ...baseRecord,
      }
      await updateThoughtRecord(record)
      toast.success('Record updated')
    } else if (dates.length === 1) {
      const record: ThoughtRecord = {
        id: generateId(),
        createdAt: new Date().toISOString(),
        date: dates[0],
        ...baseRecord,
      }
      await addThoughtRecord(record)
      toast.success('Record saved')
    } else {
      const records: ThoughtRecord[] = dates.map((date) => ({
        id: generateId(),
        createdAt: new Date().toISOString(),
        date,
        ...baseRecord,
      }))
      await addThoughtRecords(records)
      toast.success(`${records.length} records saved`)
    }

    setView('home')
  }

  const getEmotionStateForContext = (ctx: 'initial' | 'outcome' | 'new') => {
    if (ctx === 'outcome') return { current: outcomeEmotions, setter: setOutcomeEmotions }
    if (ctx === 'new') return { current: newEmotions, setter: setNewEmotions }
    return { current: emotions, setter: setEmotions }
  }

  const addEmotion = (ctx: 'initial' | 'outcome' | 'new') => {
    const { current, setter } = getEmotionStateForContext(ctx)
    setter([...current, { name: '', intensity: 50 }])
  }

  const updateEmotion = (
    index: number,
    field: 'name' | 'intensity',
    value: string | number,
    ctx: 'initial' | 'outcome' | 'new'
  ) => {
    const { current, setter } = getEmotionStateForContext(ctx)
    const updated = [...current]
    updated[index] = { ...updated[index], [field]: value }
    setter(updated)
  }

  const removeEmotion = (index: number, ctx: 'initial' | 'outcome' | 'new') => {
    const { current, setter } = getEmotionStateForContext(ctx)
    setter(current.filter((_, i) => i !== index))
  }

  const prefillOutcomeEmotions = () => {
    const filled = emotions.filter((e) => e.name.trim())
    if (filled.length > 0) {
      setOutcomeEmotions(filled.map((e) => ({ name: e.name, intensity: e.intensity })))
    }
  }

  const toggleDistortion = (id: CognitiveDistortionId) => {
    setDistortions((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]))
  }

  const handleEmotionFocus = (index: number, ctx: 'initial' | 'outcome' | 'new') => {
    setActiveEmotionIndex(index)
    setEmotionContext(ctx)
    setShowEmotionSuggestions(true)
  }

  const selectEmotionSuggestion = (emotionName: string) => {
    if (activeEmotionIndex !== null) {
      updateEmotion(activeEmotionIndex, 'name', emotionName, emotionContext)
      setShowEmotionSuggestions(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setView('home')}
          className="text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 flex items-center gap-1"
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
        <div className="w-16" />
      </div>

      <PageIntro
        title={existingRecord ? 'Edit record' : 'New thought record'}
        description="Examine your thoughts using evidence-based techniques from CBT, ACT, and behavioral therapy. Choose the approach that works best for you."
        centered={false}
      />

      <div className="card p-5 mb-8">
        <label className="label">
          Choose your approach
          <InfoButton
            title="Different approaches for different situations"
            content="Standard: Classic cognitive restructuring to challenge and reframe thoughts. Behavioral experiment: Test your predictions with real-world experiments. Defusion: Create distance from thoughts using ACT techniques. Simple: Quick 3-column format when you're short on time."
          />
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'standard' as const, label: 'Standard', desc: 'Challenge thoughts' },
            { id: 'experiment' as const, label: 'Experiment', desc: 'Test predictions' },
            { id: 'defusion' as const, label: 'Defusion', desc: 'ACT techniques' },
            { id: 'simple' as const, label: 'Simple', desc: '3-column format' },
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={`p-3 rounded-xl border-2 transition-all text-left ${
                mode === m.id
                  ? 'bg-sage-50 dark:bg-sage-900/30 border-sage-400 dark:border-sage-600'
                  : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-600 hover:border-stone-300 dark:hover:border-stone-500'
              }`}
            >
              <div
                className={`font-medium text-sm ${mode === m.id ? 'text-sage-700 dark:text-sage-400' : 'text-stone-700 dark:text-stone-300'}`}
              >
                {m.label}
              </div>
              <div className="text-xs text-stone-500 dark:text-stone-400">{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

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
                {existingRecord ? 'Date' : 'Date(s)'}
                <InfoButton
                  title="When did this happen?"
                  content={
                    existingRecord
                      ? 'Record the date of the event.'
                      : 'Record the date(s) of the event. You can select multiple dates to create separate entries.'
                  }
                />
              </label>
              {existingRecord ? (
                <input
                  type="date"
                  value={dates[0] || ''}
                  onChange={(e) => setDates([e.target.value])}
                  className="input-field"
                />
              ) : (
                <>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={dateInput}
                      onChange={(e) => setDateInput(e.target.value)}
                      className="input-field flex-1"
                    />
                    <button type="button" onClick={addDate} className="btn-secondary px-4">
                      Add
                    </button>
                  </div>
                  {dates.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {dates.map((d) => (
                        <span
                          key={d}
                          className="inline-flex items-center gap-1.5 text-sm bg-sage-50 dark:bg-sage-900/30 text-sage-700 dark:text-sage-400 px-3 py-1.5 rounded-full"
                        >
                          {format(parseISO(d), 'MMM d, yyyy')}
                          <button
                            type="button"
                            onClick={() => removeDate(d)}
                            className="text-sage-500 hover:text-critical-500 dark:hover:text-critical-400 transition-colors"
                          >
                            <svg
                              className="w-4 h-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </>
              )}
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
                content="Name each emotion you felt and rate its intensity from 0% (barely noticeable) to 100% (the most intense you've ever felt)."
                example="Anxious 75%, Frustrated 60%"
              />
            </label>
            <div className="space-y-2">
              {emotions.map((emotion, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <div className="relative flex-1 min-w-0">
                    <input
                      type="text"
                      value={emotion.name}
                      onChange={(e) => updateEmotion(index, 'name', e.target.value, 'initial')}
                      onFocus={() => handleEmotionFocus(index, 'initial')}
                      onBlur={() => setTimeout(() => setShowEmotionSuggestions(false), 200)}
                      placeholder="e.g., Anxious, Sad"
                      className="input-field w-full"
                    />
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={emotion.intensity}
                      onChange={(e) =>
                        updateEmotion(index, 'intensity', parseInt(e.target.value) || 0, 'initial')
                      }
                      className="input-field w-20 text-center tabular-nums"
                    />
                    <span className="text-stone-400 dark:text-stone-500 text-sm w-4">%</span>
                  </div>
                  {emotions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEmotion(index, 'initial')}
                      className="text-stone-400 dark:text-stone-500 hover:text-critical-500 dark:hover:text-critical-400 p-1 transition-colors flex-shrink-0"
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

            {/* Emotion suggestions */}
            {showEmotionSuggestions &&
              activeEmotionIndex !== null &&
              emotionContext === 'initial' && (
                <div className="mt-3 p-3 bg-stone-50 dark:bg-stone-700/50 rounded-lg">
                  <p className="text-xs text-stone-500 dark:text-stone-400 mb-2">
                    Common emotions (tap to select):
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {COMMON_EMOTIONS.slice(0, 20).map((emotionName) => (
                      <button
                        key={emotionName}
                        type="button"
                        onClick={() => selectEmotionSuggestion(emotionName)}
                        className="text-xs px-2 py-1 bg-white dark:bg-stone-600 rounded-full text-stone-600 dark:text-stone-300 hover:bg-sage-100 dark:hover:bg-sage-800 transition-colors"
                      >
                        {emotionName}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            <button
              type="button"
              onClick={() => addEmotion('initial')}
              className="text-sage-600 dark:text-sage-400 hover:text-sage-700 dark:hover:text-sage-300 text-sm font-medium mt-3"
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
                content="Write down the thoughts that accompanied your emotion. These are often quick, automatic interpretations that pop into your mind. Try to capture them word-for-word."
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

            {mode === 'standard' && (
              <div className="mt-4">
                <label className="label text-sm">
                  How strongly do you believe this thought? ({beliefBefore}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={beliefBefore}
                  onChange={(e) => setBeliefBefore(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-stone-400 dark:text-stone-500">
                  <span>Not at all</span>
                  <span>Completely</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {mode !== 'simple' && (
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
                    content="These are common patterns of biased thinking identified by Aaron Beck and David Burns. Identifying them helps you see your thoughts more objectively. Tap the arrow to see the full description and example."
                  />
                </label>
                <span className="text-sm text-stone-500 dark:text-stone-400">
                  {distortions.length} selected
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {COGNITIVE_DISTORTIONS.map((distortion) => (
                  <div
                    key={distortion.id}
                    className={expandedDistortion === distortion.id ? 'sm:col-span-2' : ''}
                  >
                    <button
                      type="button"
                      onClick={() => toggleDistortion(distortion.id)}
                      className={`w-full text-left p-3.5 rounded-xl border-2 transition-all duration-200 ${
                        distortions.includes(distortion.id)
                          ? 'bg-sage-50 dark:bg-sage-900/30 border-sage-400 dark:border-sage-600'
                          : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-600 hover:border-stone-300 dark:hover:border-stone-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-medium text-sm ${distortions.includes(distortion.id) ? 'text-sage-700 dark:text-sage-400' : 'text-stone-700 dark:text-stone-300'}`}
                        >
                          {distortion.id}. {distortion.shortName}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setExpandedDistortion(
                              expandedDistortion === distortion.id ? null : distortion.id
                            )
                          }}
                          className="text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 p-1"
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
                      <div className="mt-1 p-4 bg-stone-50 dark:bg-stone-700/50 rounded-lg animate-fade-in space-y-3">
                        <p className="text-sm text-stone-600 dark:text-stone-300">
                          {distortion.description}
                        </p>
                        <div className="text-xs text-stone-500 dark:text-stone-400 italic">
                          Example: {distortion.example}
                        </div>
                        {distortion.relatedEmotions && (
                          <div className="flex flex-wrap gap-1">
                            <span className="text-xs text-stone-500 dark:text-stone-400">
                              Related feelings:
                            </span>
                            {distortion.relatedEmotions.map((emotion, i) => (
                              <span
                                key={i}
                                className="text-xs bg-stone-200 dark:bg-stone-600 px-1.5 py-0.5 rounded"
                              >
                                {emotion}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {mode === 'standard' && (
          <section>
            <SectionHeader
              number={5}
              title="Rational response"
              description="Challenge your automatic thoughts with a more balanced view."
            />

            <div className="card p-5 space-y-4">
              {/* Challenging questions helper */}
              {selectedDistortionHelpers.length > 0 && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2">
                    <span>🤔</span> Questions to ask yourself
                  </h4>
                  <div className="space-y-3">
                    {selectedDistortionHelpers.map((helper, idx) => (
                      <div key={idx}>
                        <p className="text-xs font-medium text-blue-600 dark:text-blue-300 mb-1">
                          For {helper?.name}:
                        </p>
                        <ul className="space-y-1">
                          {helper?.questions.slice(0, 2).map((q, i) => (
                            <li
                              key={i}
                              className="text-xs text-blue-600 dark:text-blue-300 flex items-start gap-1.5"
                            >
                              <span className="text-blue-400">•</span>
                              {q}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="label">
                  Write your response
                  <InfoButton
                    title="Creating a rational response"
                    content="Write a more balanced, realistic response to your automatic thoughts. Use the challenging questions above as prompts. Consider: What evidence supports or contradicts this thought? What would you tell a friend?"
                    example="He might just be busy. One delayed response doesn't mean he's angry."
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

              {/* Reframing strategies helper */}
              {selectedDistortionHelpers.length > 0 && (
                <div className="p-4 bg-sage-50 dark:bg-sage-900/20 rounded-lg border border-sage-200 dark:border-sage-800">
                  <h4 className="text-sm font-medium text-sage-700 dark:text-sage-400 mb-2 flex items-center gap-2">
                    <span>💡</span> Reframing strategies
                  </h4>
                  <div className="space-y-2">
                    {selectedDistortionHelpers.map((helper, idx) => (
                      <div key={idx} className="text-xs text-sage-600 dark:text-sage-300">
                        <span className="font-medium">{helper?.name}:</span> {helper?.strategy}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="label text-sm">
                  How strongly do you believe the original thought now? ({beliefAfter}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={beliefAfter}
                  onChange={(e) => setBeliefAfter(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-stone-400 dark:text-stone-500">
                  <span>Not at all</span>
                  <span>Completely</span>
                </div>
                {beliefBefore > beliefAfter && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    ✓ Belief reduced by {beliefBefore - beliefAfter}%
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {mode === 'experiment' && (
          <>
            <section>
              <SectionHeader
                number={5}
                title="Your prediction"
                description="What do you predict will happen? How strongly do you believe it?"
              />

              <div className="card p-5">
                <label className="label">
                  What do you predict?
                  <InfoButton
                    title="Behavioral experiments"
                    content="Instead of just challenging thoughts, behavioral experiments test them in the real world. Research shows this can lead to faster and more lasting belief change than cognitive restructuring alone."
                  />
                </label>
                <AutoExpandTextarea
                  value={experimentPrediction}
                  onChange={(e) => setExperimentPrediction(e.target.value)}
                  minRows={2}
                  maxRows={8}
                  placeholder="e.g., If I send another email, he'll think I'm annoying and get angry (80% belief)"
                />
              </div>
            </section>

            <section>
              <SectionHeader
                number={6}
                title="Experiment outcome"
                description="What actually happened when you tested your prediction?"
              />

              <div className="card p-5">
                <label className="label">
                  What happened?
                  <InfoButton
                    title="Recording the outcome"
                    content="After doing the experiment, record what actually happened. How did it compare to your prediction? What did you learn? This is where real belief change happens."
                  />
                </label>
                <AutoExpandTextarea
                  value={experimentOutcome}
                  onChange={(e) => setExperimentOutcome(e.target.value)}
                  minRows={2}
                  maxRows={8}
                  placeholder="e.g., He replied quickly and apologized for the delay. New belief: 20%"
                />
              </div>
            </section>
          </>
        )}

        {mode === 'defusion' && (
          <section>
            <SectionHeader
              number={5}
              title="Defusion technique"
              description="Choose a technique to create distance from the thought."
            />

            <div className="card p-5">
              <label className="label">
                Select a technique
                <InfoButton
                  title="Cognitive defusion (ACT)"
                  content="Defusion techniques help you step back from thoughts rather than challenging their content. Instead of arguing with a thought, you change your relationship to it. Research shows this can be as effective as cognitive restructuring."
                />
              </label>
              <div className="space-y-2 mb-4">
                {DEFUSION_TECHNIQUES.map((tech) => (
                  <button
                    key={tech.id}
                    type="button"
                    onClick={() => setDefusionTechnique(tech.id)}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                      defusionTechnique === tech.id
                        ? 'bg-sage-50 dark:bg-sage-900/30 border-sage-400 dark:border-sage-600'
                        : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-600 hover:border-stone-300 dark:hover:border-stone-500'
                    }`}
                  >
                    <div
                      className={`font-medium text-sm ${defusionTechnique === tech.id ? 'text-sage-700 dark:text-sage-400' : 'text-stone-700 dark:text-stone-300'}`}
                    >
                      {tech.name}
                    </div>
                    <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                      {tech.description}
                    </div>
                  </button>
                ))}
              </div>

              {defusionTechnique && (
                <div className="p-4 bg-sage-50 dark:bg-sage-900/20 rounded-lg">
                  <h4 className="text-sm font-medium text-sage-700 dark:text-sage-400 mb-2">
                    Try it now
                  </h4>
                  <p className="text-sm text-stone-600 dark:text-stone-400">
                    {defusionTechnique === 'having-thought' && (
                      <>
                        Reframe your thought as: "I'm having the thought that{' '}
                        {automaticThoughts.split('.')[0].toLowerCase() || '...'}"
                      </>
                    )}
                    {defusionTechnique === 'thank-mind' && (
                      <>
                        Say to yourself: "Thanks mind for trying to protect me, but I've got this."
                      </>
                    )}
                    {defusionTechnique === 'leaves-stream' && (
                      <>
                        Close your eyes and imagine placing each thought on a leaf floating down a
                        gentle stream. Watch them drift away.
                      </>
                    )}
                    {defusionTechnique === 'silly-voice' && (
                      <>
                        Try saying your thought out loud in a cartoon character voice. Notice how
                        this changes its impact.
                      </>
                    )}
                    {defusionTechnique === 'singing' && (
                      <>
                        Try singing your thought to the tune of "Happy Birthday" or another familiar
                        song.
                      </>
                    )}
                    {defusionTechnique === 'repeat' && (
                      <>
                        Pick the key word from your thought and repeat it rapidly for 30 seconds
                        until it loses meaning.
                      </>
                    )}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        <section>
          <SectionHeader
            number={mode === 'simple' ? 4 : mode === 'experiment' ? 7 : 6}
            title="Outcome"
            description="Re-rate the same emotions from step 2. How intense are they now?"
          />

          <div className="card p-5">
            <div className="flex items-center justify-between mb-1">
              <label className="label mb-0">
                Re-rate your emotions
                <InfoButton
                  title="Re-rating your emotions (Burns method)"
                  content="In the Daily Mood Log, you re-rate the same negative emotions you identified earlier. The goal isn't to eliminate them but to see if they've shifted after examining your thoughts. Even a small reduction shows the technique is working."
                />
              </label>
              {emotions.some((e) => e.name.trim()) && (
                <button
                  type="button"
                  onClick={prefillOutcomeEmotions}
                  className="text-xs text-sage-600 dark:text-sage-400 hover:text-sage-700 dark:hover:text-sage-300 font-medium px-2 py-1 rounded-lg hover:bg-sage-50 dark:hover:bg-sage-900/20 transition-colors"
                >
                  Copy from step 2
                </button>
              )}
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-3">
              Rate the same emotions again to see how they've shifted.
            </p>
            <div className="space-y-2">
              {outcomeEmotions.map((emotion, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <div className="relative flex-1 min-w-0">
                    <input
                      type="text"
                      value={emotion.name}
                      onChange={(e) => updateEmotion(index, 'name', e.target.value, 'outcome')}
                      onFocus={() => handleEmotionFocus(index, 'outcome')}
                      onBlur={() => setTimeout(() => setShowEmotionSuggestions(false), 200)}
                      placeholder="Same emotion from step 2"
                      className="input-field w-full"
                    />
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={emotion.intensity}
                      onChange={(e) =>
                        updateEmotion(index, 'intensity', parseInt(e.target.value) || 0, 'outcome')
                      }
                      className="input-field w-20 text-center tabular-nums"
                    />
                    <span className="text-stone-400 dark:text-stone-500 text-sm w-4">%</span>
                  </div>
                  {outcomeEmotions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEmotion(index, 'outcome')}
                      className="text-stone-400 dark:text-stone-500 hover:text-critical-500 dark:hover:text-critical-400 p-1 transition-colors flex-shrink-0"
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

            {showEmotionSuggestions &&
              activeEmotionIndex !== null &&
              emotionContext === 'outcome' && (
                <div className="mt-3 p-3 bg-stone-50 dark:bg-stone-700/50 rounded-lg">
                  <p className="text-xs text-stone-500 dark:text-stone-400 mb-2">
                    Your initial emotions (tap to select):
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {emotions
                      .filter((e) => e.name.trim())
                      .map((emotion) => (
                        <button
                          key={emotion.name}
                          type="button"
                          onClick={() => selectEmotionSuggestion(emotion.name)}
                          className="text-xs px-2 py-1 bg-white dark:bg-stone-600 rounded-full text-stone-600 dark:text-stone-300 hover:bg-sage-100 dark:hover:bg-sage-800 transition-colors"
                        >
                          {emotion.name} ({emotion.intensity}%)
                        </button>
                      ))}
                  </div>
                </div>
              )}

            <button
              type="button"
              onClick={() => addEmotion('outcome')}
              className="text-sage-600 dark:text-sage-400 hover:text-sage-700 dark:hover:text-sage-300 text-sm font-medium mt-3"
            >
              + Add emotion
            </button>

            {/* Improvement indicators */}
            {outcomeEmotions.some((oe) => oe.name.trim()) && (
              <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-700">
                {outcomeEmotions
                  .filter((oe) => oe.name.trim())
                  .map((oe) => {
                    const match = emotions.find(
                      (e) => e.name.trim().toLowerCase() === oe.name.trim().toLowerCase()
                    )
                    if (!match) return null
                    const diff = match.intensity - oe.intensity
                    return (
                      <div key={oe.name} className="flex items-center justify-between text-sm py-1">
                        <span className="text-stone-600 dark:text-stone-300">{oe.name}</span>
                        <span
                          className={`font-medium tabular-nums ${
                            diff > 0
                              ? 'text-green-600 dark:text-green-400'
                              : diff < 0
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-stone-500 dark:text-stone-400'
                          }`}
                        >
                          {match.intensity}% → {oe.intensity}%{diff > 0 && ` (↓${diff}%)`}
                          {diff < 0 && ` (↑${Math.abs(diff)}%)`}
                          {diff === 0 && ' (no change)'}
                        </span>
                      </div>
                    )
                  })}
              </div>
            )}

            {/* New emotions section */}
            <div className="mt-6 pt-4 border-t border-stone-200 dark:border-stone-700">
              <div className="flex items-center justify-between mb-1">
                <label className="label mb-0 text-sm">
                  New emotions (optional)
                  <InfoButton
                    title="Positive emotions that emerged"
                    content="After working through your thoughts, you may notice new positive feelings like relief, calm, or hope. These are separate from the re-rated emotions above."
                  />
                </label>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mb-3">
                Any new feelings that emerged after reflection?
              </p>

              {newEmotions.length > 0 && (
                <div className="space-y-2 mb-2">
                  {newEmotions.map((emotion, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <div className="relative flex-1 min-w-0">
                        <input
                          type="text"
                          value={emotion.name}
                          onChange={(e) => updateEmotion(index, 'name', e.target.value, 'new')}
                          onFocus={() => handleEmotionFocus(index, 'new')}
                          onBlur={() => setTimeout(() => setShowEmotionSuggestions(false), 200)}
                          placeholder="e.g., Relieved, Hopeful"
                          className="input-field w-full"
                        />
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={emotion.intensity}
                          onChange={(e) =>
                            updateEmotion(index, 'intensity', parseInt(e.target.value) || 0, 'new')
                          }
                          className="input-field w-20 text-center tabular-nums"
                        />
                        <span className="text-stone-400 dark:text-stone-500 text-sm w-4">%</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeEmotion(index, 'new')}
                        className="text-stone-400 dark:text-stone-500 hover:text-critical-500 dark:hover:text-critical-400 p-1 transition-colors flex-shrink-0"
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
                    </div>
                  ))}
                </div>
              )}

              {showEmotionSuggestions &&
                activeEmotionIndex !== null &&
                emotionContext === 'new' && (
                  <div className="mt-3 p-3 bg-stone-50 dark:bg-stone-700/50 rounded-lg">
                    <p className="text-xs text-stone-500 dark:text-stone-400 mb-2">
                      Positive emotions (tap to select):
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {COMMON_EMOTIONS.slice(20, 32).map((emotionName) => (
                        <button
                          key={emotionName}
                          type="button"
                          onClick={() => selectEmotionSuggestion(emotionName)}
                          className="text-xs px-2 py-1 bg-white dark:bg-stone-600 rounded-full text-stone-600 dark:text-stone-300 hover:bg-sage-100 dark:hover:bg-sage-800 transition-colors"
                        >
                          {emotionName}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              <button
                type="button"
                onClick={() => addEmotion('new')}
                className="text-sage-600 dark:text-sage-400 hover:text-sage-700 dark:hover:text-sage-300 text-sm font-medium mt-2"
              >
                + Add new emotion
              </button>
            </div>
          </div>
        </section>

        <button type="submit" className="btn-primary w-full">
          {existingRecord
            ? 'Update record'
            : dates.length > 1
              ? `Save ${dates.length} records`
              : 'Save record'}
        </button>
      </div>
    </form>
  )
}
