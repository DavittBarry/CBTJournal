import { useState, useMemo, useEffect, useRef } from 'react'
import { useAppStore } from '@/stores/appStore'
import { COGNITIVE_DISTORTIONS } from '@/types'
import { format, parseISO, isAfter, subDays, subMonths, subYears } from 'date-fns'
import { PageIntro, SearchBar, TimeFilter } from '@/components/InfoComponents'
import { toast } from '@/stores/toastStore'
import { ReminderBanner } from '@/components/ReminderBanner'
import { useReminders } from '@/hooks/useReminders'
import { AppLink } from '@/components/AppLink'
import { calculateWellnessScore } from '@/utils/insightGenerator'

export function HomeView() {
  const {
    thoughtRecords,
    setView,
    setSelectedRecordId,
    deleteThoughtRecord,
    duplicateThoughtRecord,
  } = useAppStore()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [timeFilter, setTimeFilter] = useState('all')
  const [columnCount, setColumnCount] = useState(1)
  const gridRef = useRef<HTMLDivElement>(null)
  const { getReminder } = useReminders()
  const recordsReminder = getReminder('records')

  const getDistortionName = (id: number) => {
    return COGNITIVE_DISTORTIONS.find((d) => d.id === id)?.shortName || ''
  }

  const getEmotionChanges = (record: (typeof thoughtRecords)[0]) => {
    const matches: { name: string; before: number; after: number; diff: number }[] = []
    for (const oe of record.outcomeEmotions) {
      if (!oe.name.trim()) continue
      const initial = record.emotions.find(
        (e) => e.name.trim().toLowerCase() === oe.name.trim().toLowerCase()
      )
      if (initial) {
        matches.push({
          name: oe.name,
          before: initial.intensity,
          after: oe.intensity,
          diff: initial.intensity - oe.intensity,
        })
      }
    }
    return matches
  }

  const getAverageImprovement = (record: (typeof thoughtRecords)[0]) => {
    const changes = getEmotionChanges(record)
    if (changes.length === 0) return 0
    const totalDiff = changes.reduce((sum, c) => sum + c.diff, 0)
    return Math.round(totalDiff / changes.length)
  }

  const getWellnessScore = (record: (typeof thoughtRecords)[0]) => {
    const improvement = getAverageImprovement(record)
    return calculateWellnessScore(improvement, record.newEmotions)
  }

  useEffect(() => {
    const updateColumnCount = () => {
      const width = window.innerWidth
      if (width >= 1280) setColumnCount(4)
      else if (width >= 1024) setColumnCount(3)
      else if (width >= 768) setColumnCount(2)
      else setColumnCount(1)
    }

    updateColumnCount()
    window.addEventListener('resize', updateColumnCount)
    return () => window.removeEventListener('resize', updateColumnCount)
  }, [])

  const filteredRecords = useMemo(() => {
    let filtered = thoughtRecords

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
      filtered = filtered.filter((r) => isAfter(parseISO(r.date), cutoffDate))
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (r) =>
          r.situation.toLowerCase().includes(query) ||
          r.automaticThoughts.toLowerCase().includes(query) ||
          r.rationalResponse.toLowerCase().includes(query) ||
          r.emotions.some((e) => e.name.toLowerCase().includes(query)) ||
          r.distortions.some((id) => getDistortionName(id).toLowerCase().includes(query))
      )
    }

    return filtered
  }, [thoughtRecords, searchQuery, timeFilter])

  const groupedByRow = useMemo(() => {
    const rows: { records: typeof filteredRecords; expandedIndex: number }[] = []
    for (let i = 0; i < filteredRecords.length; i += columnCount) {
      const rowRecords = filteredRecords.slice(i, i + columnCount)
      const expandedIndex = rowRecords.findIndex((r) => r.id === expandedId)
      rows.push({ records: rowRecords, expandedIndex })
    }
    return rows
  }, [filteredRecords, columnCount, expandedId])

  const handleCardClick = (id: string, e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.ctrlKey || e.metaKey) {
      return
    }
    e.preventDefault()
    e.currentTarget.blur()
    setExpandedId((current) => (current === id ? null : id))
  }

  const handleDelete = async (id: string) => {
    await deleteThoughtRecord(id)
    setShowDeleteConfirm(null)
    setExpandedId(null)
    toast.success('Record deleted')
  }

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDeleteConfirm(id)
  }

  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newId = await duplicateThoughtRecord(id)
    if (newId) {
      toast.success('Record duplicated')
      setSelectedRecordId(newId)
      setView('new-thought')
    }
  }

  // Render the small card content (reused in both normal and expanded states)
  const renderSmallCardContent = (record: (typeof filteredRecords)[0], isExpanded: boolean) => {
    const hasOutcome = record.outcomeEmotions.length > 0 && !!record.outcomeEmotions[0]?.name

    return (
      <a
        href={`#record/${record.id}`}
        onClick={(e) => handleCardClick(record.id, e)}
        className={`block w-full text-left p-5 focus:outline-none flex flex-col ${
          isExpanded ? '' : 'overflow-hidden h-full'
        }`}
      >
        {/* Date and situation */}
        <div className="flex-shrink-0 space-y-3">
          <div className="flex items-start justify-between">
            <div className="text-sm text-stone-400 dark:text-stone-500">
              {format(parseISO(record.date), 'MMM d, yyyy')}
            </div>
            <svg
              className={`w-5 h-5 text-stone-400 dark:text-stone-500 transition-transform duration-200 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
          <div
            className={`text-stone-700 dark:text-stone-200 font-medium leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}
          >
            {record.situation}
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-grow min-h-3" />

        {/* Before/After panels */}
        {hasOutcome ? (
          (() => {
            const outcomeFiltered = record.outcomeEmotions.filter((e) => e.name.trim())
            const showEmotions = isExpanded ? record.emotions : record.emotions.slice(0, 3)
            const showOutcome = isExpanded ? outcomeFiltered : outcomeFiltered.slice(0, 3)
            return (
              <div className="flex-shrink-0 mt-3 space-y-1.5">
                <div className="py-1.5 px-3 bg-critical-50 dark:bg-critical-900/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wide text-stone-400 dark:text-stone-500 font-medium flex-shrink-0">
                      Before
                    </span>
                    <div className="flex flex-wrap gap-1 min-w-0">
                      {showEmotions.map((e, i) => (
                        <span
                          key={i}
                          className="text-xs text-critical-700 dark:text-critical-300 bg-critical-100 dark:bg-critical-900/20 px-2 py-0.5 rounded-full whitespace-nowrap"
                        >
                          {e.name} {e.intensity}%
                        </span>
                      ))}
                      {!isExpanded && record.emotions.length > 3 && (
                        <span className="text-xs text-stone-400 dark:text-stone-500">
                          +{record.emotions.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="py-1.5 px-3 bg-helpful-50 dark:bg-helpful-900/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wide text-stone-400 dark:text-stone-500 font-medium flex-shrink-0">
                      After
                    </span>
                    <div className="flex flex-wrap gap-1 min-w-0">
                      {showOutcome.map((e, i) => (
                        <span
                          key={i}
                          className="text-xs text-helpful-700 dark:text-helpful-300 bg-helpful-100 dark:bg-helpful-900/20 px-2 py-0.5 rounded-full whitespace-nowrap"
                        >
                          {e.name} {e.intensity}%
                        </span>
                      ))}
                      {!isExpanded && outcomeFiltered.length > 3 && (
                        <span className="text-xs text-stone-400 dark:text-stone-500">
                          +{outcomeFiltered.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })()
        ) : (
          <>
            {/* Emotion tags when no outcome */}
            <div className="flex-shrink-0 mt-3">
              <div className="flex flex-wrap gap-1.5">
                {(isExpanded ? record.emotions : record.emotions.slice(0, 3)).map((emotion, i) => (
                  <span
                    key={i}
                    className="text-xs bg-warm-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 px-2.5 py-1 rounded-full"
                  >
                    {emotion.name} {emotion.intensity}%
                  </span>
                ))}
                {!isExpanded && record.emotions.length > 3 && (
                  <span className="text-xs text-stone-400 dark:text-stone-500 px-1 py-1">
                    +{record.emotions.length - 3} more
                  </span>
                )}
              </div>
            </div>
            {/* Incomplete indicator */}
            <div className="flex-shrink-0 mt-3">
              <div className="flex items-center gap-1.5 py-1.5 px-3 bg-amber-50/60 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30 rounded-lg text-xs text-amber-600 dark:text-amber-400">
                <svg
                  className="w-3.5 h-3.5 flex-shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
                <span>Edit to re-rate emotions</span>
              </div>
            </div>
          </>
        )}

        {/* Distortions */}
        <div className="flex-shrink-0 mt-3">
          <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs">
            {record.distortions.slice(0, 2).map((id) => (
              <span key={id} className="text-sage-500 dark:text-sage-400">
                {getDistortionName(id)}
              </span>
            ))}
            {record.distortions.length > 2 && (
              <span className="text-stone-400 dark:text-stone-500">
                +{record.distortions.length - 2} more
              </span>
            )}
          </div>
        </div>
      </a>
    )
  }

  return (
    <div>
      <PageIntro
        title="Thought records"
        description="Thought records are the core tool of cognitive behavioral therapy. They help you catch negative automatic thoughts, identify thinking patterns, and develop more balanced perspectives. Regular practice can significantly reduce anxiety and depression by changing how you relate to your thoughts."
        steps={[
          'Notice when you feel upset or distressed.',
          'Write down the situation and your automatic thoughts.',
          'Identify which cognitive distortions are present.',
          'Create a more balanced, rational response.',
          'Track your progress over time in the Insights section.',
        ]}
      />

      <ReminderBanner
        reminder={recordsReminder}
        onAction={() => {
          setSelectedRecordId(null)
          setView('new-thought')
        }}
        actionLabel="New record"
      />

      <div className="flex items-center justify-center mb-4">
        <button
          onClick={() => {
            setSelectedRecordId(null)
            setView('new-thought')
          }}
          className="btn-primary text-sm py-2.5 px-4"
        >
          New record
        </button>
      </div>

      {thoughtRecords.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-2 mb-4 max-w-2xl mx-auto">
          <div className="flex-1">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search records..."
            />
          </div>
          <div className="w-full sm:w-40">
            <TimeFilter value={timeFilter} onChange={setTimeFilter} />
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-2">
              Delete this record?
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

      {thoughtRecords.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sage-100 dark:bg-sage-900/30 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-sage-400 dark:text-sage-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14,2 14,8 20,8" />
            </svg>
          </div>
          <p className="text-stone-500 dark:text-stone-400 mb-4">No thought records yet</p>
          <button
            onClick={() => {
              setSelectedRecordId(null)
              setView('new-thought')
            }}
            className="text-sage-600 dark:text-sage-400 hover:text-sage-700 dark:hover:text-sage-300 font-medium"
          >
            Create your first record
          </button>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-stone-500 dark:text-stone-400">No records match your search</p>
          <button
            onClick={() => {
              setSearchQuery('')
              setTimeFilter('all')
            }}
            className="text-sage-600 dark:text-sage-400 hover:text-sage-700 dark:hover:text-sage-300 font-medium mt-2"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div ref={gridRef} className="space-y-4">
          {groupedByRow.map(({ records: row, expandedIndex }, rowIndex) => {
            const expandedRecord = expandedIndex >= 0 ? row[expandedIndex] : null

            return (
              <div key={rowIndex}>
                <div
                  className="grid gap-4"
                  style={{
                    gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                  }}
                >
                  {row.map((record) => {
                    const isExpanded = expandedId === record.id

                    if (isExpanded) {
                      return (
                        <div
                          key={record.id}
                          className="card-thought-record"
                          style={{ visibility: 'hidden' }}
                        />
                      )
                    }

                    return (
                      <div
                        key={record.id}
                        className="card overflow-hidden transition-all duration-300 hover:shadow-soft-lg dark:hover:shadow-soft-lg-dark card-thought-record"
                      >
                        {renderSmallCardContent(record, false)}
                      </div>
                    )
                  })}
                </div>

                {expandedRecord &&
                  (() => {
                    const record = expandedRecord
                    const maxEmotion = record.emotions.reduce(
                      (max, e) => (e.intensity > max.intensity ? e : max),
                      record.emotions[0]
                    )
                    const changes = getEmotionChanges(record)
                    const avgImprovement = getAverageImprovement(record)
                    const wellnessScore = getWellnessScore(record)
                    const hasOutcome =
                      record.outcomeEmotions.length > 0 && !!record.outcomeEmotions[0]?.name

                    return (
                      <div className="rounded-xl ring-2 ring-sage-400 dark:ring-sage-500 bg-white dark:bg-stone-800 overflow-hidden animate-fade-in mt-4">
                        {/* Expanded card header - just date and full situation */}
                        <a
                          href={`#record/${record.id}`}
                          onClick={(e) => handleCardClick(record.id, e)}
                          className="block p-5 focus:outline-none"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="text-sm text-stone-400 dark:text-stone-500">
                              {format(parseISO(record.date), 'MMM d, yyyy')}
                            </div>
                            <svg
                              className="w-5 h-5 text-stone-400 dark:text-stone-500 rotate-180 flex-shrink-0"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            >
                              <path d="M6 9l6 6 6-6" />
                            </svg>
                          </div>
                          <div className="text-stone-700 dark:text-stone-200 font-medium leading-relaxed">
                            {record.situation}
                          </div>
                        </a>

                        {/* Expanded content section */}
                        <div className="px-5 pb-5 pt-4 border-t border-stone-200 dark:border-stone-700">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                            <AppLink
                              to="thought-detail"
                              id={record.id}
                              onClick={(e) => e.stopPropagation()}
                              className="btn-secondary py-2 text-sm text-center"
                            >
                              View
                            </AppLink>
                            <AppLink
                              to="new-thought"
                              id={record.id}
                              onClick={(e) => e.stopPropagation()}
                              className="btn-secondary py-2 text-sm text-center"
                            >
                              Edit
                            </AppLink>
                            <button
                              onClick={(e) => handleDuplicate(record.id, e)}
                              className="btn-secondary py-2 text-sm"
                              type="button"
                            >
                              Duplicate
                            </button>
                            <button
                              onClick={(e) => handleDeleteClick(record.id, e)}
                              className="py-2 text-sm font-medium text-critical-500 dark:text-critical-400 hover:text-critical-600 dark:hover:text-critical-300 bg-critical-50 dark:bg-critical-900/20 hover:bg-critical-100 dark:hover:bg-critical-900/30 rounded-xl transition-colors"
                              type="button"
                            >
                              Delete
                            </button>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <div className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-4 flex flex-col">
                              <div className="flex items-center gap-2 mb-3">
                                <span className="w-6 h-6 rounded-full bg-critical-100 dark:bg-critical-900/30 text-critical-600 dark:text-critical-400 text-xs font-bold flex items-center justify-center">
                                  1
                                </span>
                                <h4 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide">
                                  Emotions (before)
                                </h4>
                              </div>
                              <div className="flex flex-wrap gap-1.5 mb-4">
                                {record.emotions.map((emotion, i) => (
                                  <span
                                    key={i}
                                    className="text-xs bg-critical-100 dark:bg-critical-900/30 text-critical-700 dark:text-critical-300 px-2.5 py-1 rounded-full"
                                  >
                                    {emotion.name} {emotion.intensity}%
                                  </span>
                                ))}
                              </div>
                              <div className="mt-auto pt-3 border-t border-stone-200 dark:border-stone-700">
                                <div className="text-xs text-stone-400 dark:text-stone-500 mb-1">
                                  Peak intensity
                                </div>
                                <div className="text-2xl font-semibold text-critical-500 dark:text-critical-400">
                                  {maxEmotion?.intensity || 0}%
                                </div>
                              </div>
                            </div>

                            <div className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-4 flex flex-col">
                              <div className="flex items-center gap-2 mb-3">
                                <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center justify-center">
                                  2
                                </span>
                                <h4 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide">
                                  Automatic thoughts
                                </h4>
                              </div>
                              <p className="text-stone-700 dark:text-stone-300 text-sm leading-relaxed whitespace-pre-wrap flex-grow">
                                {record.automaticThoughts || 'No automatic thoughts recorded'}
                              </p>
                              {record.distortions.length > 0 && (
                                <div className="mt-auto pt-3 border-t border-stone-200 dark:border-stone-700">
                                  <div className="text-xs text-stone-400 dark:text-stone-500 mb-2">
                                    Distortions identified
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {record.distortions.map((id) => (
                                      <span
                                        key={id}
                                        className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded"
                                      >
                                        {getDistortionName(id)}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-4 flex flex-col">
                              <div className="flex items-center gap-2 mb-3">
                                <span className="w-6 h-6 rounded-full bg-helpful-100 dark:bg-helpful-900/30 text-helpful-600 dark:text-helpful-400 text-xs font-bold flex items-center justify-center">
                                  3
                                </span>
                                <h4 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide">
                                  Rational response
                                </h4>
                              </div>
                              <p className="text-stone-700 dark:text-stone-300 text-sm leading-relaxed whitespace-pre-wrap flex-grow">
                                {record.rationalResponse || 'No rational response recorded'}
                              </p>
                              {hasOutcome && (
                                <div className="mt-auto pt-3 border-t border-stone-200 dark:border-stone-700">
                                  <div className="text-xs text-stone-400 dark:text-stone-500 mb-2">
                                    Emotion changes
                                  </div>
                                  {changes.length > 0 ? (
                                    <div className="space-y-1 mb-2">
                                      {changes.map((c) => (
                                        <div
                                          key={c.name}
                                          className="flex items-center justify-between text-xs"
                                        >
                                          <span className="text-stone-600 dark:text-stone-300">
                                            {c.name}
                                          </span>
                                          <span
                                            className={`font-medium tabular-nums ${
                                              c.diff > 0
                                                ? 'text-green-600 dark:text-green-400'
                                                : c.diff < 0
                                                  ? 'text-amber-600 dark:text-amber-400'
                                                  : 'text-stone-500 dark:text-stone-400'
                                            }`}
                                          >
                                            {c.before}% → {c.after}%
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                      {record.outcomeEmotions.map((emotion, i) => (
                                        <span
                                          key={i}
                                          className="text-xs bg-helpful-100 dark:bg-helpful-900/30 text-helpful-700 dark:text-helpful-300 px-2.5 py-1 rounded-full"
                                        >
                                          {emotion.name} {emotion.intensity}%
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  {record.newEmotions && record.newEmotions.length > 0 && (
                                    <div className="mt-2">
                                      <div className="text-xs text-stone-400 dark:text-stone-500 mb-1">
                                        New feelings
                                      </div>
                                      <div className="flex flex-wrap gap-1.5">
                                        {record.newEmotions.map((emotion, i) => (
                                          <span
                                            key={i}
                                            className="text-xs bg-helpful-100 dark:bg-helpful-900/30 text-helpful-700 dark:text-helpful-300 px-2.5 py-1 rounded-full"
                                          >
                                            {emotion.name} {emotion.intensity}%
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {(avgImprovement > 0 || wellnessScore > 0) && (
                                    <div className="flex items-center gap-3 mt-2">
                                      {avgImprovement > 0 && (
                                        <span className="text-sm font-medium text-helpful-600 dark:text-helpful-400">
                                          ↓ {avgImprovement}% avg. improvement
                                        </span>
                                      )}
                                      {wellnessScore > 0 && (
                                        <span
                                          className="text-sm font-medium text-sage-600 dark:text-sage-400"
                                          title="Wellness score: combines negative emotion reduction (70%) + new positive feelings (30%)"
                                        >
                                          wellness {wellnessScore}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
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
