import { useState, useMemo } from 'react'
import { useAppStore } from '@/stores/appStore'
import { format, parseISO, isAfter, subDays, subMonths, subYears } from 'date-fns'
import { PageIntro, SearchBar, TimeFilter } from '@/components/InfoComponents'
import { toast } from '@/stores/toastStore'

export function GratitudeView() {
  const { gratitudeEntries, setView, setSelectedGratitudeId, deleteGratitudeEntry } = useAppStore()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [timeFilter, setTimeFilter] = useState('all')

  const filteredEntries = useMemo(() => {
    let filtered = gratitudeEntries

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

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(e => 
        e.entries.some(item => item.toLowerCase().includes(query))
      )
    }

    return filtered
  }, [gratitudeEntries, searchQuery, timeFilter])

  const handleCardClick = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null)
    } else {
      setExpandedId(id)
    }
  }

  const handleEdit = (id: string) => {
    setSelectedGratitudeId(id)
    setView('new-gratitude')
  }

  const handleDelete = async (id: string) => {
    await deleteGratitudeEntry(id)
    setShowDeleteConfirm(null)
    setExpandedId(null)
    toast.success('Entry deleted')
  }

  return (
    <div className="pb-28">
      <PageIntro
        title="Gratitude"
        description="Gratitude journaling is a simple but powerful practice. Research consistently shows that regularly noting things you're grateful for can increase happiness, reduce depression, improve sleep, and strengthen relationships. It works by training your brain to notice positive experiences you might otherwise overlook."
        steps={[
          'At the end of each day, write 3-5 things you are grateful for.',
          'Be specific rather than general (not just "family" but "the conversation I had with my sister").',
          'Include small everyday moments, not just big things.',
          'Try to notice new things rather than repeating the same items.'
        ]}
      />

      <div className="flex items-center justify-center mb-4">
        <button
          onClick={() => {
            setSelectedGratitudeId(null)
            setView('new-gratitude')
          }}
          className="btn-primary text-sm py-2.5 px-4"
        >
          New entry
        </button>
      </div>

      {gratitudeEntries.length > 0 && (
        <div className="flex gap-2 mb-4">
          <div className="flex-1">
            <SearchBar 
              value={searchQuery} 
              onChange={setSearchQuery} 
              placeholder="Search entries..."
            />
          </div>
          <div className="w-36">
            <TimeFilter value={timeFilter} onChange={setTimeFilter} />
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-stone-800 mb-2">Delete this entry?</h3>
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

      {gratitudeEntries.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sage-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-sage-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
          <p className="text-stone-500 mb-4">No gratitude entries yet</p>
          <button
            onClick={() => {
              setSelectedGratitudeId(null)
              setView('new-gratitude')
            }}
            className="text-sage-600 hover:text-sage-700 font-medium"
          >
            Write your first entry
          </button>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-stone-500">No entries match your search</p>
          <button
            onClick={() => { setSearchQuery(''); setTimeFilter('all'); }}
            className="text-sage-600 hover:text-sage-700 font-medium mt-2"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEntries.map((entry) => {
            const isExpanded = expandedId === entry.id

            return (
              <div
                key={entry.id}
                className={`card overflow-hidden transition-all duration-300 ${
                  isExpanded ? 'shadow-soft-lg' : 'hover:shadow-soft-lg'
                }`}
              >
                <button
                  onClick={() => handleCardClick(entry.id)}
                  className="w-full text-left p-5 focus:ring-0 focus:ring-offset-0"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm text-stone-400">
                      {format(parseISO(entry.date), 'MMM d, yyyy')}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-sage-500 font-medium">
                        {entry.entries.length} item{entry.entries.length !== 1 ? 's' : ''}
                      </span>
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
                  
                  <ul className="space-y-1.5">
                    {(isExpanded ? entry.entries : entry.entries.slice(0, 3)).map((item, i) => (
                      <li key={i} className="text-stone-700 text-sm leading-relaxed flex items-start gap-2">
                        <span className="text-sage-400 mt-0.5 flex-shrink-0">•</span>
                        <span className={isExpanded ? '' : 'line-clamp-1'}>{item}</span>
                      </li>
                    ))}
                    {!isExpanded && entry.entries.length > 3 && (
                      <li className="text-stone-400 text-sm pl-4">
                        +{entry.entries.length - 3} more
                      </li>
                    )}
                  </ul>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5">
                    <div className="flex gap-2 pt-4 border-t border-stone-100">
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
