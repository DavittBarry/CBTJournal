import { useState, useMemo } from 'react'
import { useAppStore } from '@/stores/appStore'
import { getDepressionLevel, DEPRESSION_ITEMS, type DepressionScores } from '@/types'
import { format, parseISO, isAfter, subDays, subMonths, subYears } from 'date-fns'
import { PageIntro, TimeFilter } from '@/components/InfoComponents'
import { toast } from '@/stores/toastStore'

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
    name: name.replace('Activities and Personal Relationships', 'Activities & Relationships'),
    score: data.total,
    max: data.count * 4
  }))
}

export function ChecklistView() {
  const { depressionChecklists, setView, setSelectedChecklistId, deleteDepressionChecklist } = useAppStore()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [timeFilter, setTimeFilter] = useState('all')

  const filteredChecklists = useMemo(() => {
    let filtered = depressionChecklists

    if (timeFilter !== 'all') {
      const now = new Date()
      let cutoffDate: Date
      switch (timeFilter) {
        case 'week':
          cutoffDate = subDays(now, 7)
          break
        case 'month':
          cutoffDate = subMonths(now, 1)
          break
        case '3months':
          cutoffDate = subMonths(now, 3)
          break
        case 'year':
          cutoffDate = subYears(now, 1)
          break
        default:
          cutoffDate = new Date(0)
      }
      filtered = filtered.filter(e => isAfter(parseISO(e.date), cutoffDate))
    }

    return filtered
  }, [depressionChecklists, timeFilter])

  const handleCardClick = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null)
    } else {
      setExpandedId(id)
    }
  }

  const handleView = (id: string) => {
    setSelectedChecklistId(id)
    setView('checklist-detail')
  }

  const handleEdit = (id: string) => {
    setSelectedChecklistId(id)
    setView('new-checklist')
  }

  const handleDelete = async (id: string) => {
    await deleteDepressionChecklist(id)
    setShowDeleteConfirm(null)
    setExpandedId(null)
    toast.success('Checklist deleted')
  }

  const getPrevEntry = (entry: typeof depressionChecklists[0]) => {
    return depressionChecklists.find(
      (e) => new Date(e.date) < new Date(entry.date)
    )
  }

  const getColorClass = (color: string) => {
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
    return colorMap[color] || 'text-stone-600'
  }

  return (
    <div>
      <PageIntro
        title="Depression checklist"
        description="This checklist helps you measure the severity of depression symptoms and track changes over time. Based on the Burns Depression Checklist, it covers thoughts, feelings, activities, relationships, and physical symptoms. Regular tracking helps you see your progress and identify what's working."
        steps={[
          'Complete the checklist when you first start using the app.',
          'Retake it every 1-2 weeks to track your progress.',
          'Use the score to guide your efforts and conversations with any healthcare providers.',
          'Watch for trends over time rather than focusing on single scores.'
        ]}
      />

      <div className="flex items-center justify-center mb-4">
        <button
          onClick={() => {
            setSelectedChecklistId(null)
            setView('new-checklist')
          }}
          className="btn-primary text-sm py-2.5 px-4"
        >
          New checklist
        </button>
      </div>

      {depressionChecklists.length > 0 && (
        <div className="flex justify-center mb-4">
          <div className="w-40">
            <TimeFilter value={timeFilter} onChange={setTimeFilter} />
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-stone-800 mb-2">Delete this checklist?</h3>
            <p className="text-stone-500 text-sm mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="flex-1 bg-critical-500 hover:bg-critical-600 text-white font-medium py-3 px-6 rounded-xl transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

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
            onClick={() => {
              setSelectedChecklistId(null)
              setView('new-checklist')
            }}
            className="text-sage-600 hover:text-sage-700 font-medium"
          >
            Complete your first checklist
          </button>
        </div>
      ) : filteredChecklists.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-stone-500">No checklists in this time period</p>
          <button
            onClick={() => setTimeFilter('all')}
            className="text-sage-600 hover:text-sage-700 font-medium mt-2"
          >
            Show all
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredChecklists.map((entry) => {
            const { level, color } = getDepressionLevel(entry.total)
            const prevEntry = getPrevEntry(entry)
            const change = prevEntry ? entry.total - prevEntry.total : null
            const mappedColor = getColorClass(color)
            const isExpanded = expandedId === entry.id
            const categoryScores = getCategoryScores(entry.scores)

            return (
              <div
                key={entry.id}
                className={`card overflow-hidden transition-all duration-300 ${
                  isExpanded ? 'shadow-soft-lg md:col-span-2' : 'hover:shadow-soft-lg'
                }`}
              >
                <button
                  onClick={() => handleCardClick(entry.id)}
                  className="w-full text-left p-5 focus:ring-0 focus:ring-offset-0"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-stone-400">
                      {format(parseISO(entry.date), 'MMM d, yyyy')}
                    </div>
                    <div className="flex items-center gap-2">
                      {change !== null && (
                        <span className={`text-xs font-medium ${change < 0 ? 'text-helpful-500' : change > 0 ? 'text-critical-500' : 'text-stone-400'}`}>
                          {change > 0 ? '+' : ''}{change}
                        </span>
                      )}
                      <svg 
                        className={`w-5 h-5 text-stone-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="1.5"
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-semibold text-stone-800">{entry.total}</span>
                    <span className="text-stone-400">/100</span>
                  </div>
                  
                  <div className={`text-sm font-medium ${mappedColor} mb-3`}>{level}</div>
                  
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {categoryScores.map((cat) => (
                      <span key={cat.name} className="text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded-full">
                        {cat.name}: {cat.score}/{cat.max}
                      </span>
                    ))}
                  </div>
                  
                  <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${entry.total}%`,
                        background: `linear-gradient(90deg, #5a8a5a 0%, #d4a84a 50%, #c97b70 100%)`
                      }}
                    />
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5">
                    <div className="pt-4 border-t border-stone-100 mb-4">
                      <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">Score guide</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-stone-400">0-5</span>
                          <span className="text-stone-600">No depression</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-400">6-10</span>
                          <span className="text-stone-600">Normal ups/downs</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-400">11-25</span>
                          <span className="text-stone-600">Mild</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-400">26-50</span>
                          <span className="text-stone-600">Moderate</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-400">51-75</span>
                          <span className="text-stone-600">Severe</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-400">76-100</span>
                          <span className="text-stone-600">Extreme</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-stone-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleView(entry.id)
                        }}
                        className="flex-1 btn-secondary py-2.5 text-sm"
                      >
                        View details
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEdit(entry.id)
                        }}
                        className="flex-1 btn-secondary py-2.5 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowDeleteConfirm(entry.id)
                        }}
                        className="px-4 py-2.5 text-sm font-medium text-critical-500 hover:text-critical-600 hover:bg-critical-50 rounded-xl transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
