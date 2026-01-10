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
  const { level, color } = getDepressionLevel(total)

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
    <form onSubmit={handleSubmit} className="pb-24">
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={() => setView('checklist')}
          className="text-slate-400 hover:text-white"
        >
          ← Back
        </button>
        <h1 className="text-xl font-semibold">Depression checklist</h1>
        <div className="w-12" />
      </div>

      <div className="sticky top-0 bg-slate-900/95 backdrop-blur py-3 -mx-4 px-4 mb-4 border-b border-slate-800 z-10">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white">{total}</span>
          <span className="text-slate-500">/100</span>
          <span className={`text-sm ${color} ml-2`}>{level}</span>
        </div>
        <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all"
            style={{ width: `${total}%` }}
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-300 mb-2">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"
        />
      </div>

      <p className="text-slate-400 text-sm mb-6">
        Rate each item from 0 (not at all) to 4 (extremely) based on how you've felt recently.
      </p>

      {categories.map(category => (
        <div key={category} className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">{category}</h2>
          <div className="space-y-4">
            {DEPRESSION_ITEMS.filter(item => item.category === category).map((item, index) => (
              <div key={item.key} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <div className="text-white mb-3">{item.label}</div>
                <div className="flex gap-2">
                  {scoreLabels.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => updateScore(item.key, value)}
                      className={`flex-1 py-2 text-xs rounded-lg border transition-colors ${
                        scores[item.key] === value
                          ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <div className="font-bold">{value}</div>
                      <div className="hidden sm:block text-[10px] mt-0.5">{label}</div>
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
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg transition-colors"
      >
        Save checklist
      </button>
    </form>
  )
}
