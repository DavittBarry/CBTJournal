import { useState } from 'react'
import { useAppStore } from '@/stores/appStore'
import { DEPRESSION_ITEMS, type DepressionScores, type DepressionChecklistEntry, getDepressionLevel } from '@/types'
import { format } from 'date-fns'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

const initialScores: DepressionScores = {
  feelingSad: 0,
  feelingUnhappy: 0,
  cryingSpells: 0,
  feelingDiscouraged: 0,
  feelingHopeless: 0,
  lowSelfEsteem: 0,
  feelingWorthless: 0,
  guiltOrShame: 0,
  selfCriticism: 0,
  difficultyDecisions: 0,
  lossOfInterestPeople: 0,
  loneliness: 0,
  lessTimeSocial: 0,
  lossOfMotivation: 0,
  lossOfInterestWork: 0,
  avoidingWork: 0,
  lossOfPleasure: 0,
  lossOfSexDrive: 0,
  poorAppetite: 0,
  overeating: 0,
  sleepProblems: 0,
  fatigue: 0,
  concernsHealth: 0,
  suicidalThoughts: 0,
  wishingDead: 0
}

const scoreLabels = [
  { value: 0, label: 'Not at all' },
  { value: 1, label: 'Somewhat' },
  { value: 2, label: 'Moderately' },
  { value: 3, label: 'A lot' },
  { value: 4, label: 'Extremely' }
]

export function NewChecklistView() {
  const { addDepressionChecklist, setView } = useAppStore()
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [scores, setScores] = useState<DepressionScores>(initialScores)

  const total = Object.values(scores).reduce((sum, val) => sum + val, 0)
  const { level } = getDepressionLevel(total)

  const updateScore = (key: keyof DepressionScores, value: number) => {
    setScores(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const entry: DepressionChecklistEntry = {
      id: generateId(),
      date,
      scores,
      total
    }

    await addDepressionChecklist(entry)
    setView('checklist')
  }

  const categories = [...new Set(DEPRESSION_ITEMS.map(item => item.category))]

  return (
    <form onSubmit={handleSubmit} className="pb-28">
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={() => setView('checklist')}
          className="text-stone-500 hover:text-stone-700 flex items-center gap-1"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 className="text-xl font-semibold text-stone-800">Depression checklist</h1>
        <div className="w-16" />
      </div>

      <div className="sticky top-0 bg-warm-100/95 backdrop-blur py-4 -mx-5 px-5 mb-6 z-10">
        <div className="card p-4">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl font-semibold text-stone-800">{total}</span>
            <span className="text-stone-400">/100</span>
            <span className="text-sm text-stone-600 ml-2">{level}</span>
          </div>
          <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-300"
              style={{ 
                width: `${total}%`,
                background: `linear-gradient(90deg, #5a8a5a 0%, #d4a84a 50%, #c97b70 100%)`
              }}
            />
          </div>
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

      <p className="text-stone-500 text-sm mb-6 leading-relaxed">
        Rate each item from 0 (not at all) to 4 (extremely) based on how you've felt recently.
      </p>

      {categories.map(category => (
        <div key={category} className="mb-8">
          <h2 className="text-base font-semibold text-stone-700 mb-4 px-1">{category}</h2>
          <div className="space-y-3">
            {DEPRESSION_ITEMS.filter(item => item.category === category).map((item) => (
              <div key={item.key} className="card p-4">
                <div className="text-stone-700 mb-3 text-sm leading-relaxed">{item.label}</div>
                <div className="flex gap-1.5">
                  {scoreLabels.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => updateScore(item.key, value)}
                      className={`flex-1 py-2.5 text-xs rounded-lg border-2 transition-all duration-200 ${
                        scores[item.key] === value
                          ? 'bg-sage-50 border-sage-400 text-sage-700'
                          : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300'
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
      ))}

      <button
        type="submit"
        className="btn-primary w-full"
      >
        Save checklist
      </button>
    </form>
  )
}
