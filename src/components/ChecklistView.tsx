import { useState, useMemo, useEffect } from 'react'
import { useAppStore } from '@/stores/appStore'
import { getDepressionLevel, DEPRESSION_ITEMS, type DepressionScores } from '@/types'
import { format, parseISO, isAfter, subDays, subMonths, subYears } from 'date-fns'
import { PageIntro, TimeFilter } from '@/components/InfoComponents'
import { toast } from '@/stores/toastStore'
import { AppLink } from '@/components/AppLink'

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
    max: data.count * 4,
  }))
}

export function ChecklistView() {
  const { depressionChecklists, deleteDepressionChecklist } = useAppStore()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [timeFilter, setTimeFilter] = useState('all')
  const [columnCount, setColumnCount] = useState(1)

  useEffect(() => {
    const updateColumnCount = () => {
      const width = window.innerWidth
      if (width >= 768) setColumnCount(2)
      else setColumnCount(1)
    }

    updateColumnCount()
    window.addEventListener('resize', updateColumnCount)
    return () => window.removeEventListener('resize', updateColumnCount)
  }, [])

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
      filtered = filtered.filter((e) => isAfter(parseISO(e.date), cutoffDate))
    }

    return filtered
  }, [depressionChecklists, timeFilter])

  const groupedByRow = useMemo(() => {
    const rows: { entries: typeof filteredChecklists; expandedIndex: number }[] = []
    for (let i = 0; i < filteredChecklists.length; i += columnCount) {
      const rowEntries = filteredChecklists.slice(i, i + columnCount)
      const expandedIndex = rowEntries.findIndex((e) => e.id === expandedId)
      rows.push({ entries: rowEntries, expandedIndex })
    }
    return rows
  }, [filteredChecklists, columnCount, expandedId])

  const handleCardClick = (id: string, e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.ctrlKey || e.metaKey) {
      return
    }
    e.preventDefault()
    e.currentTarget.blur()
    if (expandedId === id) {
      setExpandedId(null)
    } else {
      setExpandedId(id)
    }
  }

  const handleDelete = async (id: string) => {
    await deleteDepressionChecklist(id)
    setShowDeleteConfirm(null)
    setExpandedId(null)
    toast.success('Checklist deleted')
  }

  const getPrevEntry = (entry: (typeof depressionChecklists)[0]) => {
    return depressionChecklists.find((e) => new Date(e.date) < new Date(entry.date))
  }

  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      'text-green-500': 'text-helpful-500',
      'text-green-400': 'text-helpful-500',
      'text-yellow-500': 'text-amber-600 dark:text-amber-500',
      'text-yellow-600': 'text-amber-600 dark:text-amber-500',
      'text-orange-500': 'text-orange-600 dark:text-orange-500',
      'text-orange-600': 'text-orange-600 dark:text-orange-500',
      'text-red-500': 'text-critical-500 dark:text-critical-400',
      'text-red-600': 'text-critical-600 dark:text-critical-400',
    }
    return colorMap[color] || 'text-stone-600 dark:text-stone-400'
  }

  // Render the small card content
  const renderSmallCardContent = (entry: (typeof filteredChecklists)[0], isExpanded: boolean) => {
    const { level, color } = getDepressionLevel(entry.total)
    const prevEntry = getPrevEntry(entry)
    const change = prevEntry ? entry.total - prevEntry.total : null
    const mappedColor = getColorClass(color)
    const categoryScores = getCategoryScores(entry.scores)

    return (
      <a
        href={`#checklist-entry/${entry.id}`}
        onClick={(e) => handleCardClick(entry.id, e)}
        className="block w-full text-left p-5 focus:ring-0 focus:ring-offset-0"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-stone-400 dark:text-stone-500">
            {format(parseISO(entry.date), 'MMM d, yyyy')}
          </div>
          <div className="flex items-center gap-2">
            {change !== null && (
              <span
                className={`text-xs font-medium ${change < 0 ? 'text-helpful-500' : change > 0 ? 'text-critical-500 dark:text-critical-400' : 'text-stone-400 dark:text-stone-500'}`}
              >
                {change > 0 ? '+' : ''}
                {change}
              </span>
            )}
            <svg
              className={`w-5 h-5 text-stone-400 dark:text-stone-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
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
          <span className="text-3xl font-semibold text-stone-800 dark:text-stone-100">
            {entry.total}
          </span>
          <span className="text-stone-400 dark:text-stone-500">/100</span>
        </div>

        <div className={`text-sm font-medium ${mappedColor} mb-3`}>{level}</div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {categoryScores.map((cat) => (
            <span
              key={cat.name}
              className="text-xs bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 px-2 py-1 rounded-full"
            >
              {cat.name}: {cat.score}/{cat.max}
            </span>
          ))}
        </div>

        <div className="h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${entry.total}%`,
              background: `linear-gradient(90deg, #5a8a5a 0%, #d4a84a 50%, #c97b70 100%)`,
            }}
          />
        </div>
      </a>
    )
  }

  return (
    <div>
      <PageIntro
        title="Burns Depression Checklist (legacy)"
        description="This 25-item self-assessment was developed by Dr. David Burns. We now recommend the PHQ-9 for new assessments since it's clinically validated and widely used in healthcare settings. Your historical data is preserved here for continuity."
        steps={[
          'For new assessments, use PHQ-9 or GAD-7 in the Mood section.',
          'This section preserves your historical Burns checklist data.',
          'You can still complete new checklists here if you prefer this format.',
          'The PHQ-9 (0-27) and GAD-7 (0-21) use different scales than Burns (0-100).',
        ]}
      />

      <div className="flex items-center justify-center mb-4">
        <AppLink to="new-checklist" className="btn-primary text-sm py-2.5 px-4 text-center">
          New checklist
        </AppLink>
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
            <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-2">
              Delete this checklist?
            </h3>
            <p className="text-stone-500 dark:text-stone-400 text-sm mb-5">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(null)} className="btn-secondary flex-1">
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
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sage-100 dark:bg-sage-900/30 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-sage-400 dark:text-sage-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <p className="text-stone-500 dark:text-stone-400 mb-4">No checklists completed yet</p>
          <AppLink
            to="new-checklist"
            className="text-sage-600 dark:text-sage-400 hover:text-sage-700 dark:hover:text-sage-300 font-medium"
          >
            Complete your first checklist
          </AppLink>
        </div>
      ) : filteredChecklists.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-stone-500 dark:text-stone-400">No checklists in this time period</p>
          <button
            onClick={() => setTimeFilter('all')}
            className="text-sage-600 dark:text-sage-400 hover:text-sage-700 dark:hover:text-sage-300 font-medium mt-2"
          >
            Show all
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedByRow.map(({ entries: row, expandedIndex }, rowIndex) => {
            const expandedEntry = expandedIndex >= 0 ? row[expandedIndex] : null

            return (
              <div key={rowIndex}>
                <div
                  className="grid gap-4"
                  style={{
                    gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                  }}
                >
                  {row.map((entry) => {
                    const isExpanded = expandedId === entry.id

                    if (isExpanded) {
                      // Render invisible placeholder to maintain grid structure
                      return (
                        <div key={entry.id} className="card" style={{ visibility: 'hidden' }} />
                      )
                    }

                    return (
                      <div
                        key={entry.id}
                        className="card overflow-hidden transition-all duration-300 hover:shadow-soft-lg dark:hover:shadow-soft-lg-dark"
                      >
                        {renderSmallCardContent(entry, false)}
                      </div>
                    )
                  })}
                </div>

                {expandedEntry &&
                  (() => {
                    const { level, color } = getDepressionLevel(expandedEntry.total)
                    const prevEntry = getPrevEntry(expandedEntry)
                    const change = prevEntry ? expandedEntry.total - prevEntry.total : null
                    const mappedColor = getColorClass(color)
                    const categoryScores = getCategoryScores(expandedEntry.scores)

                    return (
                      <div className="rounded-xl ring-2 ring-sage-400 dark:ring-sage-500 bg-white dark:bg-stone-800 overflow-hidden animate-fade-in mt-4">
                        {/* Small card section */}
                        <a
                          href={`#checklist-entry/${expandedEntry.id}`}
                          onClick={(e) => handleCardClick(expandedEntry.id, e)}
                          className="block w-full text-left p-5 focus:ring-0 focus:ring-offset-0"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm text-stone-400 dark:text-stone-500">
                              {format(parseISO(expandedEntry.date), 'MMM d, yyyy')}
                            </div>
                            <div className="flex items-center gap-2">
                              {change !== null && (
                                <span
                                  className={`text-xs font-medium ${change < 0 ? 'text-helpful-500' : change > 0 ? 'text-critical-500 dark:text-critical-400' : 'text-stone-400 dark:text-stone-500'}`}
                                >
                                  {change > 0 ? '+' : ''}
                                  {change}
                                </span>
                              )}
                              <svg
                                className="w-5 h-5 text-stone-400 dark:text-stone-500 transition-transform duration-200 rotate-180"
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
                            <span className="text-3xl font-semibold text-stone-800 dark:text-stone-100">
                              {expandedEntry.total}
                            </span>
                            <span className="text-stone-400 dark:text-stone-500">/100</span>
                          </div>

                          <div className={`text-sm font-medium ${mappedColor} mb-3`}>{level}</div>

                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {categoryScores.map((cat) => (
                              <span
                                key={cat.name}
                                className="text-xs bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 px-2 py-1 rounded-full"
                              >
                                {cat.name}: {cat.score}/{cat.max}
                              </span>
                            ))}
                          </div>

                          <div className="h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${expandedEntry.total}%`,
                                background: `linear-gradient(90deg, #5a8a5a 0%, #d4a84a 50%, #c97b70 100%)`,
                              }}
                            />
                          </div>
                        </a>

                        {/* Expanded content section */}
                        <div className="px-5 pb-5">
                          <div className="pt-4 mb-4">
                            <h4 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-3">
                              Score guide
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs">
                              <div className="flex justify-between">
                                <span className="text-stone-400 dark:text-stone-500">0-5</span>
                                <span className="text-stone-600 dark:text-stone-300">
                                  No depression
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-stone-400 dark:text-stone-500">6-10</span>
                                <span className="text-stone-600 dark:text-stone-300">
                                  Normal ups/downs
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-stone-400 dark:text-stone-500">11-25</span>
                                <span className="text-stone-600 dark:text-stone-300">Mild</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-stone-400 dark:text-stone-500">26-50</span>
                                <span className="text-stone-600 dark:text-stone-300">Moderate</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-stone-400 dark:text-stone-500">51-75</span>
                                <span className="text-stone-600 dark:text-stone-300">Severe</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-stone-400 dark:text-stone-500">76-100</span>
                                <span className="text-stone-600 dark:text-stone-300">Extreme</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-4 border-t border-stone-100 dark:border-stone-700">
                            <AppLink
                              to="checklist-detail"
                              id={expandedEntry.id}
                              onClick={(e) => e.stopPropagation()}
                              className="flex-1 btn-secondary py-2.5 text-sm text-center"
                            >
                              View details
                            </AppLink>
                            <AppLink
                              to="new-checklist"
                              id={expandedEntry.id}
                              onClick={(e) => e.stopPropagation()}
                              className="flex-1 btn-secondary py-2.5 text-sm text-center"
                            >
                              Edit
                            </AppLink>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowDeleteConfirm(expandedEntry.id)
                              }}
                              className="px-4 py-2.5 text-sm font-medium text-critical-500 dark:text-critical-400 hover:text-critical-600 dark:hover:text-critical-300 hover:bg-critical-50 dark:hover:bg-critical-500/10 rounded-xl transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })()}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
