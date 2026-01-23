import { useState, useMemo } from 'react'
import { useAppStore } from '@/stores/appStore'
import { COGNITIVE_DISTORTIONS } from '@/types'
import { format, parseISO, isAfter, subDays, subMonths, subYears } from 'date-fns'
import { PageIntro, SearchBar, TimeFilter } from '@/components/InfoComponents'
import { toast } from '@/stores/toastStore'
import { ReminderBanner } from '@/components/ReminderBanner'
import { useReminders } from '@/hooks/useReminders'

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
  const { getReminder } = useReminders()
  const recordsReminder = getReminder('records')

  const getDistortionName = (id: number) => {
    return COGNITIVE_DISTORTIONS.find((d) => d.id === id)?.shortName || ''
  }

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

  const handleCardClick = (id: string, e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur()
    setExpandedId((current) => (current === id ? null : id))
  }

  const handleView = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedRecordId(id)
    setView('thought-detail')
  }

  const handleEdit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedRecordId(id)
    setView('new-thought')
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
        <div className="card-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-start">
          {filteredRecords.map((record) => {
            const maxEmotion = record.emotions.reduce(
              (max, e) => (e.intensity > max.intensity ? e : max),
              record.emotions[0]
            )
            const hasOutcome = record.outcomeEmotions.length > 0 && record.outcomeEmotions[0].name
            const outcomeIntensity = hasOutcome ? record.outcomeEmotions[0].intensity : null
            const improvement =
              maxEmotion && outcomeIntensity !== null ? maxEmotion.intensity - outcomeIntensity : 0
            const isExpanded = expandedId === record.id

            return (
              <div
                key={record.id}
                className={`card overflow-hidden transition-all duration-300 hover:shadow-soft-lg dark:hover:shadow-soft-lg-dark ${
                  !isExpanded ? 'card-thought-record' : 'h-auto col-span-full'
                }`}
              >
                <button
                  onClick={(e) => handleCardClick(record.id, e)}
                  className={`w-full text-left p-5 focus:outline-none focus:ring-2 focus:ring-sage-400/50 dark:focus:ring-sage-500/50 rounded-t-xl overflow-hidden ${!isExpanded ? 'flex flex-col h-full rounded-xl' : ''}`}
                  type="button"
                >
                  <div className={`flex-shrink-0 space-y-3 ${!isExpanded ? 'h-24' : ''}`}>
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

                  <div className={`flex-shrink-0 ${!isExpanded ? 'mt-3' : 'mt-6'}`}>
                    <div className="flex flex-wrap gap-1.5">
                      {record.emotions.map((emotion, i) => (
                        <span
                          key={i}
                          className="text-xs bg-warm-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 px-2.5 py-1 rounded-full"
                        >
                          {emotion.name} {emotion.intensity}%
                        </span>
                      ))}
                    </div>
                  </div>

                  {!isExpanded && <div className="flex-grow" />}

                  <div className={`flex-shrink-0 space-y-3 ${!isExpanded ? '' : 'mt-6'}`}>
                    {maxEmotion && hasOutcome && (
                      <div className="flex items-center gap-2 py-2 px-3 bg-stone-50 dark:bg-stone-700/50 rounded-lg text-xs">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] uppercase tracking-wide text-stone-400 dark:text-stone-500 font-medium">
                            Before
                          </span>
                          <span className="font-semibold text-critical-500 dark:text-critical-400">
                            {maxEmotion.intensity}%
                          </span>
                        </div>
                        <svg
                          className="w-3 h-3 text-stone-300 dark:text-stone-600 flex-shrink-0"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] uppercase tracking-wide text-stone-400 dark:text-stone-500 font-medium">
                            After
                          </span>
                          <span className="font-semibold text-helpful-600 dark:text-helpful-500">
                            {outcomeIntensity}%
                          </span>
                        </div>
                        {improvement > 0 && (
                          <span className="ml-auto font-medium text-stone-500 dark:text-stone-400 whitespace-nowrap">
                            {improvement}% better
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs">
                      {(isExpanded ? record.distortions : record.distortions.slice(0, 2)).map(
                        (id) => (
                          <span key={id} className="text-sage-500 dark:text-sage-400">
                            {getDistortionName(id)}
                          </span>
                        )
                      )}
                      {!isExpanded && record.distortions.length > 2 && (
                        <span className="text-stone-400 dark:text-stone-500">
                          +{record.distortions.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-3 space-y-4">
                    <div className="flex gap-2 pb-4">
                      <button
                        onClick={(e) => handleView(record.id, e)}
                        className="flex-1 btn-secondary py-2 text-sm"
                        type="button"
                      >
                        View
                      </button>
                      <button
                        onClick={(e) => handleEdit(record.id, e)}
                        className="flex-1 btn-secondary py-2 text-sm"
                        type="button"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => handleDuplicate(record.id, e)}
                        className="flex-1 btn-secondary py-2 text-sm"
                        type="button"
                      >
                        Duplicate
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(record.id, e)}
                        className="px-3 py-2 text-sm font-medium text-critical-500 dark:text-critical-400 hover:text-critical-600 dark:hover:text-critical-300 hover:bg-critical-50 dark:hover:bg-critical-500/10 rounded-xl transition-colors"
                        type="button"
                      >
                        Delete
                      </button>
                    </div>

                    {record.automaticThoughts && (
                      <div className="pt-4 border-t border-stone-100 dark:border-stone-700">
                        <h4 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-2">
                          Automatic thoughts
                        </h4>
                        <p className="text-stone-700 dark:text-stone-300 text-sm leading-relaxed whitespace-pre-wrap">
                          {record.automaticThoughts}
                        </p>
                      </div>
                    )}

                    {record.rationalResponse && (
                      <div className="pt-4 border-t border-stone-100 dark:border-stone-700">
                        <h4 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-2">
                          Rational response
                        </h4>
                        <p className="text-stone-700 dark:text-stone-300 text-sm leading-relaxed whitespace-pre-wrap">
                          {record.rationalResponse}
                        </p>
                      </div>
                    )}

                    {record.outcomeEmotions.length > 0 && record.outcomeEmotions[0].name && (
                      <div className="pt-4 border-t border-stone-100 dark:border-stone-700">
                        <h4 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-2">
                          Outcome emotions
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {record.outcomeEmotions.map((emotion, i) => (
                            <span
                              key={i}
                              className="text-xs bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 px-2.5 py-1 rounded-full"
                            >
                              {emotion.name} {emotion.intensity}%
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
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
