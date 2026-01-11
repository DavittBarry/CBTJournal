import { useAppStore } from '@/stores/appStore'
import { format, parseISO } from 'date-fns'

export function GratitudeView() {
  const { gratitudeEntries, setView, setSelectedGratitudeId } = useAppStore()

  const handleEntryClick = (id: string) => {
    setSelectedGratitudeId(id)
    setView('new-gratitude')
  }

  return (
    <div className="pb-28">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-stone-800">Gratitude</h1>
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

      <p className="text-stone-500 text-sm mb-6 leading-relaxed">
        Write down things you're grateful for. Research shows this simple practice can improve mood and wellbeing over time.
      </p>

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
      ) : (
        <div className="space-y-3">
          {gratitudeEntries.map((entry) => (
            <button
              key={entry.id}
              onClick={() => handleEntryClick(entry.id)}
              className="w-full text-left card p-5 hover:shadow-soft-lg transition-shadow duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-stone-400">
                  {format(parseISO(entry.date), 'MMM d, yyyy')}
                </div>
                <div className="text-xs text-sage-500 font-medium">
                  {entry.entries.length} item{entry.entries.length !== 1 ? 's' : ''}
                </div>
              </div>
              
              <ul className="space-y-1.5">
                {entry.entries.slice(0, 3).map((item, i) => (
                  <li key={i} className="text-stone-700 text-sm leading-relaxed flex items-start gap-2">
                    <span className="text-sage-400 mt-0.5">•</span>
                    <span className="line-clamp-1">{item}</span>
                  </li>
                ))}
                {entry.entries.length > 3 && (
                  <li className="text-stone-400 text-sm">
                    +{entry.entries.length - 3} more
                  </li>
                )}
              </ul>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
