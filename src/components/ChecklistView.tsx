import { useAppStore } from '@/stores/appStore'
import { getDepressionLevel } from '@/types'
import { format, parseISO } from 'date-fns'

export function ChecklistView() {
  const { depressionChecklists, setView } = useAppStore()

  return (
    <div className="pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Depression checklist</h1>
        <button
          onClick={() => setView('new-checklist')}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + New
        </button>
      </div>

      <p className="text-slate-400 text-sm mb-6">
        Track your symptoms every 2 weeks using the Burns Depression Checklist. 
        Scores range from 0-100.
      </p>

      {depressionChecklists.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-slate-500 mb-4">No checklists completed yet</div>
          <button
            onClick={() => setView('new-checklist')}
            className="text-blue-400 hover:text-blue-300"
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

            return (
              <div
                key={entry.id}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-slate-400">
                    {format(parseISO(entry.date), 'MMM d, yyyy')}
                  </div>
                  {change !== null && (
                    <span className={`text-sm ${change < 0 ? 'text-green-400' : change > 0 ? 'text-red-400' : 'text-slate-400'}`}>
                      {change > 0 ? '+' : ''}{change} from last
                    </span>
                  )}
                </div>
                
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">{entry.total}</span>
                  <span className="text-slate-500">/100</span>
                </div>
                
                <div className={`text-sm ${color} mt-1`}>{level}</div>
                
                <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all"
                    style={{ width: `${entry.total}%` }}
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
