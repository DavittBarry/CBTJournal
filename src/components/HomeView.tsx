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
    <div className="pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Thought records</h1>
        <button
          onClick={() => setView('new-thought')}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + New
        </button>
      </div>

      {thoughtRecords.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-slate-500 mb-4">No thought records yet</div>
          <button
            onClick={() => setView('new-thought')}
            className="text-blue-400 hover:text-blue-300"
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
                className="w-full text-left bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg p-4 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="text-sm text-slate-400">
                    {format(parseISO(record.date), 'MMM d, yyyy')}
                  </div>
                  <div className="flex items-center gap-2">
                    {record.voiceTag && (
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        record.voiceTag === 'helpful' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {record.voiceTag === 'helpful' ? 'Helpful' : 'Critical'}
                      </span>
                    )}
                    {improvement > 0 && (
                      <span className="text-xs text-green-400">
                        ↓{improvement}%
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="text-white font-medium mb-2 line-clamp-2">
                  {record.situation}
                </div>
                
                <div className="flex flex-wrap gap-1 mb-2">
                  {record.emotions.slice(0, 3).map((emotion, i) => (
                    <span key={i} className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
                      {emotion.name} {emotion.intensity}%
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1">
                  {record.distortions.slice(0, 3).map((id) => (
                    <span key={id} className="text-xs text-blue-400">
                      #{getDistortionName(id)}
                    </span>
                  ))}
                  {record.distortions.length > 3 && (
                    <span className="text-xs text-slate-500">
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
