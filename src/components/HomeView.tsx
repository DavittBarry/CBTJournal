import { useAppStore } from '@/stores/appStore'
import { COGNITIVE_DISTORTIONS } from '@/types'
import { format, parseISO } from 'date-fns'

export function HomeView() {
  const { thoughtRecords, setView, setSelectedRecordId } = useAppStore()

  const getDistortionName = (id: number) => {
    return COGNITIVE_DISTORTIONS.find(d => d.id === id)?.shortName || ''
  }

  const handleRecordClick = (id: string) => {
    setSelectedRecordId(id)
    setView('thought-detail')
  }

  return (
    <div className="pb-28">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-stone-800">Thought records</h1>
        <button
          onClick={() => setView('new-thought')}
          className="btn-primary text-sm py-2.5 px-4"
        >
          New record
        </button>
      </div>

      {thoughtRecords.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sage-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-sage-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14,2 14,8 20,8" />
            </svg>
          </div>
          <p className="text-stone-500 mb-4">No thought records yet</p>
          <button
            onClick={() => setView('new-thought')}
            className="text-sage-600 hover:text-sage-700 font-medium"
          >
            Create your first record
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {thoughtRecords.map((record) => {
            const maxEmotion = record.emotions.reduce(
              (max, e) => (e.intensity > max.intensity ? e : max),
              record.emotions[0]
            )
            const improvement = maxEmotion && record.outcomeEmotions.length > 0
              ? maxEmotion.intensity - record.outcomeEmotions[0].intensity
              : 0

            return (
              <button
                key={record.id}
                onClick={() => handleRecordClick(record.id)}
                className="w-full text-left card p-5 hover:shadow-soft-lg transition-shadow duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="text-sm text-stone-400">
                    {format(parseISO(record.date), 'MMM d, yyyy')}
                  </div>
                  {improvement > 0 && (
                    <span className="text-xs text-helpful-500 font-medium">
                      ↓ {improvement}%
                    </span>
                  )}
                </div>
                
                <div className="text-stone-700 font-medium mb-3 line-clamp-2 leading-relaxed">
                  {record.situation}
                </div>
                
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {record.emotions.slice(0, 3).map((emotion, i) => (
                    <span key={i} className="text-xs bg-warm-200 text-stone-600 px-2.5 py-1 rounded-full">
                      {emotion.name} {emotion.intensity}%
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-x-2 gap-y-1">
                  {record.distortions.slice(0, 3).map((id) => (
                    <span key={id} className="text-xs text-sage-500">
                      {getDistortionName(id)}
                    </span>
                  ))}
                  {record.distortions.length > 3 && (
                    <span className="text-xs text-stone-400">
                      +{record.distortions.length - 3} more
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
