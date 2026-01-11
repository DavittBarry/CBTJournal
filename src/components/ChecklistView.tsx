import { useAppStore } from '@/stores/appStore'
import { getDepressionLevel } from '@/types'
import { format, parseISO } from 'date-fns'

export function ChecklistView() {
  const { depressionChecklists, setView } = useAppStore()

  return (
    <div className="pb-28">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-stone-800">Depression checklist</h1>
        <button
          onClick={() => setView('new-checklist')}
          className="btn-primary text-sm py-2.5 px-4"
        >
          New checklist
        </button>
      </div>

      <p className="text-stone-500 text-sm mb-6 leading-relaxed">
        Track your symptoms every 2 weeks using the Burns Depression Checklist. 
        Scores range from 0-100.
      </p>

      {depressionChecklists.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sage-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-sage-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <p className="text-stone-500 mb-4">No checklists completed yet</p>
          <button
            onClick={() => setView('new-checklist')}
            className="text-sage-600 hover:text-sage-700 font-medium"
          >
            Complete your first checklist
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {depressionChecklists.map((entry) => {
            const { level, color } = getDepressionLevel(entry.total)
            const prevEntry = depressionChecklists.find(
              (e) => new Date(e.date) < new Date(entry.date)
            )
            const change = prevEntry ? entry.total - prevEntry.total : null

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

            return (
              <div
                key={entry.id}
                className="card p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm text-stone-400">
                    {format(parseISO(entry.date), 'MMM d, yyyy')}
                  </div>
                  {change !== null && (
                    <span className={`text-sm font-medium ${change < 0 ? 'text-helpful-500' : change > 0 ? 'text-critical-500' : 'text-stone-400'}`}>
                      {change > 0 ? '+' : ''}{change} from last
                    </span>
                  )}
                </div>
                
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold text-stone-800">{entry.total}</span>
                  <span className="text-stone-400">/100</span>
                </div>
                
                <div className={`text-sm font-medium ${mappedColor} mt-1`}>{level}</div>
                
                <div className="mt-4 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${entry.total}%`,
                      background: `linear-gradient(90deg, #5a8a5a 0%, #d4a84a 50%, #c97b70 100%)`
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
