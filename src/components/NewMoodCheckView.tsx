import { useState } from 'react'
import { useAppStore } from '@/stores/appStore'
import {
  PHQ9_ITEMS,
  GAD7_ITEMS,
  type PHQ9Scores,
  type GAD7Scores,
  type MoodCheckEntry,
  getPHQ9Level,
  getGAD7Level,
  CRISIS_RESOURCES,
} from '@/types'
import { format } from 'date-fns'
import { PageIntro, InfoButton } from '@/components/InfoComponents'
import { AutoExpandTextarea } from '@/components/AutoExpandTextarea'
import { toast } from '@/stores/toastStore'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

const SCORE_OPTIONS = [
  { value: 0, label: 'Not at all', shortLabel: '0' },
  { value: 1, label: 'Several days', shortLabel: '1' },
  { value: 2, label: 'More than half the days', shortLabel: '2' },
  { value: 3, label: 'Nearly every day', shortLabel: '3' },
]

type CheckType = 'phq9' | 'gad7' | 'quick' | 'combined'

interface Props {
  existingEntry?: MoodCheckEntry
}

export function NewMoodCheckView({ existingEntry }: Props) {
  const { addMoodCheck, updateMoodCheck, setView } = useAppStore()

  const [checkType, setCheckType] = useState<CheckType>(
    existingEntry?.type === 'quick' ? 'quick' : 'combined'
  )
  const [date, setDate] = useState(existingEntry?.date || format(new Date(), 'yyyy-MM-dd'))
  const [notes, setNotes] = useState(existingEntry?.notes || '')

  const [phq9Scores, setPhq9Scores] = useState<PHQ9Scores>(
    existingEntry?.phq9Scores || {
      interest: 0,
      depressed: 0,
      sleep: 0,
      energy: 0,
      appetite: 0,
      selfEsteem: 0,
      concentration: 0,
      movement: 0,
      suicidal: 0,
    }
  )

  const [gad7Scores, setGad7Scores] = useState<GAD7Scores>(
    existingEntry?.gad7Scores || {
      anxious: 0,
      worrying: 0,
      worryingTooMuch: 0,
      relaxing: 0,
      restless: 0,
      irritable: 0,
      afraid: 0,
    }
  )

  const [quickMood, setQuickMood] = useState(existingEntry?.quickMood || 5)
  const [quickAnxiety, setQuickAnxiety] = useState(existingEntry?.quickAnxiety || 5)

  const phq9Total = Object.values(phq9Scores).reduce((sum, val) => sum + val, 0)
  const gad7Total = Object.values(gad7Scores).reduce((sum, val) => sum + val, 0)
  const phq9Level = getPHQ9Level(phq9Total)
  const gad7Level = getGAD7Level(gad7Total)

  const showCrisisResources = phq9Scores.suicidal > 0

  const updatePHQ9 = (key: keyof PHQ9Scores, value: number) => {
    setPhq9Scores((prev) => ({ ...prev, [key]: value }))
  }

  const updateGAD7 = (key: keyof GAD7Scores, value: number) => {
    setGad7Scores((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const entry: MoodCheckEntry = {
      id: existingEntry?.id || generateId(),
      date,
      createdAt: existingEntry?.createdAt || new Date().toISOString(),
      type: checkType === 'combined' ? 'phq9' : checkType,
      notes: notes.trim() || undefined,
    }

    if (checkType === 'quick') {
      entry.quickMood = quickMood
      entry.quickAnxiety = quickAnxiety
    } else {
      entry.phq9Scores = phq9Scores
      if (checkType === 'combined') {
        entry.gad7Scores = gad7Scores
      }
    }

    if (existingEntry) {
      await updateMoodCheck(entry)
      toast.success('Mood check updated')
    } else {
      await addMoodCheck(entry)
      toast.success('Mood check saved')
    }

    setView('mood-check')
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setView('mood-check')}
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
      </div>

      <PageIntro
        title={existingEntry ? 'Edit mood check' : 'New mood check'}
        description="Track your depression and anxiety symptoms using validated clinical questionnaires. The PHQ-9 measures depression severity, while the GAD-7 measures anxiety. Both are used by healthcare professionals worldwide and can help you track your progress over time."
        centered={false}
      />

      {showCrisisResources && (
        <div className="card p-5 mb-6 border-2 border-amber-400 dark:border-amber-500 bg-amber-50 dark:bg-amber-900/20">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💛</div>
            <div>
              <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-2">
                Support is available
              </h3>
              <p className="text-sm text-stone-600 dark:text-stone-300 mb-3">
                You indicated thoughts of hurting yourself. If you're in crisis, please reach out
                for support.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-stone-700 dark:text-stone-300">🇺🇸 US:</span>
                  <a href="tel:988" className="text-sage-600 dark:text-sage-400 font-medium">
                    988 (Suicide & Crisis Lifeline)
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-stone-700 dark:text-stone-300">
                    🇫🇮 Finland:
                  </span>
                  <a href="tel:0925250111" className="text-sage-600 dark:text-sage-400 font-medium">
                    09 2525 0111 (Mieli)
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-stone-700 dark:text-stone-300">
                    🇮🇪 Ireland:
                  </span>
                  <a href="tel:116123" className="text-sage-600 dark:text-sage-400 font-medium">
                    116 123 (Samaritans)
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-stone-700 dark:text-stone-300">🇬🇧 UK:</span>
                  <a href="tel:116123" className="text-sage-600 dark:text-sage-400 font-medium">
                    116 123 (Samaritans)
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card p-5 mb-6">
        <label className="label">Assessment type</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { id: 'combined' as const, label: 'PHQ-9 + GAD-7', desc: 'Depression & Anxiety' },
            { id: 'phq9' as const, label: 'PHQ-9 only', desc: 'Depression' },
            { id: 'gad7' as const, label: 'GAD-7 only', desc: 'Anxiety' },
          ].map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => setCheckType(type.id)}
              className={`p-3 rounded-xl border-2 transition-all text-left ${
                checkType === type.id
                  ? 'bg-sage-50 dark:bg-sage-900/30 border-sage-400 dark:border-sage-600'
                  : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-600 hover:border-stone-300 dark:hover:border-stone-500'
              }`}
            >
              <div
                className={`font-medium text-sm ${checkType === type.id ? 'text-sage-700 dark:text-sage-400' : 'text-stone-700 dark:text-stone-300'}`}
              >
                {type.label}
              </div>
              <div className="text-xs text-stone-500 dark:text-stone-400">{type.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="card p-5 mb-6">
        <label className="label">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input-field"
        />
      </div>

      {(checkType === 'phq9' || checkType === 'combined') && (
        <>
          <div className="sticky top-0 bg-warm-100/95 dark:bg-stone-900/95 backdrop-blur py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 mb-6 z-10">
            <div className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-sm font-medium text-stone-600 dark:text-stone-400">
                    PHQ-9 Depression
                  </span>
                  <InfoButton
                    title="PHQ-9 Scoring"
                    content="0-4: Minimal depression. 5-9: Mild depression. 10-14: Moderate depression. 15-19: Moderately severe. 20-27: Severe depression. The PHQ-9 is validated against clinical diagnosis with 88% sensitivity and specificity."
                  />
                </div>
                <div className="text-right">
                  <span className="text-2xl font-semibold text-stone-800 dark:text-stone-200">
                    {phq9Total}
                  </span>
                  <span className="text-stone-400 dark:text-stone-500">/27</span>
                </div>
              </div>
              <div className={`text-sm font-medium ${phq9Level.color}`}>{phq9Level.level}</div>
              <div className="h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${(phq9Total / 27) * 100}%`,
                    background: `linear-gradient(90deg, #5a8a5a 0%, #d4a84a 50%, #c97b70 100%)`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-base font-semibold text-stone-700 dark:text-stone-300 mb-2">
              PHQ-9: Depression assessment
            </h2>
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">
              Over the <strong>last 2 weeks</strong>, how often have you been bothered by any of the
              following problems?
            </p>
            <div className="space-y-3">
              {PHQ9_ITEMS.map((item) => (
                <div key={item.key} className="card p-4">
                  <div className="text-stone-700 dark:text-stone-300 mb-3 text-sm leading-relaxed">
                    {item.label}
                  </div>
                  <div className="flex gap-1.5">
                    {SCORE_OPTIONS.map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => updatePHQ9(item.key as keyof PHQ9Scores, value)}
                        className={`flex-1 py-2.5 text-xs rounded-lg border-2 transition-all duration-200 ${
                          phq9Scores[item.key as keyof PHQ9Scores] === value
                            ? 'bg-sage-50 dark:bg-sage-900/30 border-sage-400 dark:border-sage-600 text-sage-700 dark:text-sage-400'
                            : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-600 text-stone-500 dark:text-stone-400 hover:border-stone-300 dark:hover:border-stone-500'
                        }`}
                      >
                        <div className="font-semibold">{value}</div>
                        <div className="hidden sm:block text-[10px] mt-0.5 opacity-75">{label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {(checkType === 'gad7' || checkType === 'combined') && (
        <>
          {checkType === 'combined' && (
            <div className="sticky top-0 bg-warm-100/95 dark:bg-stone-900/95 backdrop-blur py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 mb-6 z-10">
              <div className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-sm font-medium text-stone-600 dark:text-stone-400">
                      GAD-7 Anxiety
                    </span>
                    <InfoButton
                      title="GAD-7 Scoring"
                      content="0-4: Minimal anxiety. 5-9: Mild anxiety. 10-14: Moderate anxiety. 15-21: Severe anxiety. The GAD-7 is also effective at screening for panic disorder, social anxiety, and PTSD."
                    />
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-semibold text-stone-800 dark:text-stone-200">
                      {gad7Total}
                    </span>
                    <span className="text-stone-400 dark:text-stone-500">/21</span>
                  </div>
                </div>
                <div className={`text-sm font-medium ${gad7Level.color}`}>{gad7Level.level}</div>
                <div className="h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${(gad7Total / 21) * 100}%`,
                      background: `linear-gradient(90deg, #5a8a5a 0%, #d4a84a 50%, #c97b70 100%)`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-base font-semibold text-stone-700 dark:text-stone-300 mb-2">
              GAD-7: Anxiety assessment
            </h2>
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">
              Over the <strong>last 2 weeks</strong>, how often have you been bothered by any of the
              following problems?
            </p>
            <div className="space-y-3">
              {GAD7_ITEMS.map((item) => (
                <div key={item.key} className="card p-4">
                  <div className="text-stone-700 dark:text-stone-300 mb-3 text-sm leading-relaxed">
                    {item.label}
                  </div>
                  <div className="flex gap-1.5">
                    {SCORE_OPTIONS.map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => updateGAD7(item.key as keyof GAD7Scores, value)}
                        className={`flex-1 py-2.5 text-xs rounded-lg border-2 transition-all duration-200 ${
                          gad7Scores[item.key as keyof GAD7Scores] === value
                            ? 'bg-sage-50 dark:bg-sage-900/30 border-sage-400 dark:border-sage-600 text-sage-700 dark:text-sage-400'
                            : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-600 text-stone-500 dark:text-stone-400 hover:border-stone-300 dark:hover:border-stone-500'
                        }`}
                      >
                        <div className="font-semibold">{value}</div>
                        <div className="hidden sm:block text-[10px] mt-0.5 opacity-75">{label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {checkType !== 'combined' && checkType !== 'phq9' && checkType !== 'gad7' && (
        <div className="space-y-6 mb-8">
          <div className="card p-5">
            <label className="label">Overall mood (0 = worst, 10 = best)</label>
            <input
              type="range"
              min="0"
              max="10"
              value={quickMood}
              onChange={(e) => setQuickMood(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-stone-500 dark:text-stone-400 mt-1">
              <span>Very low</span>
              <span className="font-medium text-stone-700 dark:text-stone-300">{quickMood}</span>
              <span>Excellent</span>
            </div>
          </div>

          <div className="card p-5">
            <label className="label">Anxiety level (0 = calm, 10 = extremely anxious)</label>
            <input
              type="range"
              min="0"
              max="10"
              value={quickAnxiety}
              onChange={(e) => setQuickAnxiety(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-stone-500 dark:text-stone-400 mt-1">
              <span>Calm</span>
              <span className="font-medium text-stone-700 dark:text-stone-300">{quickAnxiety}</span>
              <span>Very anxious</span>
            </div>
          </div>
        </div>
      )}

      <div className="card p-5 mb-6">
        <label className="label">Notes (optional)</label>
        <AutoExpandTextarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          minRows={2}
          maxRows={6}
          placeholder="Any context or observations about how you're feeling..."
        />
      </div>

      {(phq9Total >= 10 || gad7Total >= 10) && (
        <div className="card p-5 mb-6 bg-stone-50 dark:bg-stone-800/50">
          <h3 className="font-medium text-stone-700 dark:text-stone-300 mb-2">
            {phq9Total >= 15 || gad7Total >= 15 ? '⚠️ Recommendation' : '💡 Suggestion'}
          </h3>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            {phq9Total >= 15
              ? phq9Level.recommendation
              : gad7Total >= 15
                ? gad7Level.recommendation
                : phq9Total >= 10
                  ? phq9Level.recommendation
                  : gad7Level.recommendation}
          </p>
        </div>
      )}

      <button type="submit" className="btn-primary w-full">
        {existingEntry ? 'Update mood check' : 'Save mood check'}
      </button>
    </form>
  )
}
