import { useAppStore } from '@/stores/appStore'
import { getDepressionLevel, DEPRESSION_ITEMS, type DepressionScores } from '@/types'
import { format, parseISO } from 'date-fns'

const scoreLabels = [
  'Not at all',
  'Several days',
  'More than half',
  'Most days',
  'Nearly every day',
]

function getCategoryScores(scores: DepressionScores) {
  const categories: Record<string, { total: number; count: number }> = {}

  for (const item of DEPRESSION_ITEMS) {
    if (!categories[item.category]) {
      categories[item.category] = { total: 0, count: 0 }
    }
    categories[item.category].total += scores[item.key]
    categories[item.category].count++
  }

  return Object.entries(categories).map(([name, data]) => ({
    name,
    score: data.total,
    max: data.count * 4,
  }))
}

export function ChecklistDetailView() {
  const { depressionChecklists, selectedChecklistId, setView, setSelectedChecklistId } =
    useAppStore()

  const entry = depressionChecklists.find((e) => e.id === selectedChecklistId)

  const handleBack = () => {
    setSelectedChecklistId(null)
    setView('checklist')
  }

  const handleEdit = () => {
    setView('new-checklist')
  }

  if (!entry) {
    return (
      <div>
        <button
          onClick={handleBack}
          className="text-stone-500 hover:text-stone-700 flex items-center gap-1 mb-6"
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
        <p className="text-stone-500">Checklist not found</p>
      </div>
    )
  }

  const { level, color } = getDepressionLevel(entry.total)
  const categoryScores = getCategoryScores(entry.scores)

  const colorMap: Record<string, string> = {
    'text-green-500': 'text-helpful-500',
    'text-green-400': 'text-helpful-500',
    'text-yellow-500': 'text-amber-600',
    'text-yellow-600': 'text-amber-600',
    'text-orange-500': 'text-orange-600',
    'text-orange-600': 'text-orange-600',
    'text-red-500': 'text-critical-500',
    'text-red-600': 'text-critical-600',
  }
  const mappedColor = colorMap[color] || 'text-stone-600'

  const categories = [...new Set(DEPRESSION_ITEMS.map((item) => item.category))]

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handleBack}
          className="text-stone-500 hover:text-stone-700 flex items-center gap-1"
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
        <button
          onClick={handleEdit}
          className="text-sage-600 hover:text-sage-700 font-medium text-sm"
        >
          Edit
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="card p-5">
          <div className="text-sm text-stone-400 mb-2">
            {format(parseISO(entry.date), 'MMMM d, yyyy')}
          </div>

          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-4xl font-semibold text-stone-800">{entry.total}</span>
            <span className="text-stone-400 text-lg">/100</span>
          </div>

          <div className={`text-lg font-medium ${mappedColor} mb-4`}>{level}</div>

          <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${entry.total}%`,
                background: `linear-gradient(90deg, #5a8a5a 0%, #d4a84a 50%, #c97b70 100%)`,
              }}
            />
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-base font-semibold text-stone-700 mb-4">Scores by category</h2>
          <div className="space-y-3">
            {categoryScores.map((cat) => (
              <div key={cat.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-stone-600">{cat.name}</span>
                  <span className="text-stone-800 font-medium">
                    {cat.score}/{cat.max}
                  </span>
                </div>
                <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sage-500 rounded-full transition-all duration-300"
                    style={{ width: `${(cat.score / cat.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <h2 className="text-base font-semibold text-stone-700 mb-3 px-1">All responses</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((category) => (
          <div key={category}>
            <h3 className="text-sm font-medium text-stone-500 mb-2 px-1">{category}</h3>
            <div className="card divide-y divide-stone-100">
              {DEPRESSION_ITEMS.filter((item) => item.category === category).map((item) => {
                const score = entry.scores[item.key]
                return (
                  <div key={item.key} className="p-4 flex items-center justify-between gap-4">
                    <span className="text-stone-700 text-sm flex-1">{item.label}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`text-sm font-semibold ${score === 0 ? 'text-helpful-500' : score >= 3 ? 'text-critical-500' : 'text-stone-600'}`}
                      >
                        {score}
                      </span>
                      <span className="text-xs text-stone-400 w-20 text-right">
                        {scoreLabels[score]}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
