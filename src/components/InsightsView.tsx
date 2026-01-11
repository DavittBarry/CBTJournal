import { useMemo } from 'react'
import { useAppStore } from '@/stores/appStore'
import { COGNITIVE_DISTORTIONS, getDepressionLevel } from '@/types'
import { format, parseISO, getDay } from 'date-fns'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar } from 'recharts'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function InsightsView() {
  const { thoughtRecords, depressionChecklists } = useAppStore()

  const stats = useMemo(() => {
    if (thoughtRecords.length === 0) return null

    const distortionCounts: Record<number, number> = {}
    const dayOfWeekCounts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
    const voiceCounts = { helpful: 0, critical: 0, untagged: 0 }
    let totalImprovement = 0
    let improvementCount = 0
    const emotionCounts: Record<string, number> = {}

    for (const record of thoughtRecords) {
      for (const id of record.distortions) {
        distortionCounts[id] = (distortionCounts[id] || 0) + 1
      }

      const dayOfWeek = getDay(parseISO(record.date))
      dayOfWeekCounts[dayOfWeek]++

      if (record.voiceTag === 'helpful') voiceCounts.helpful++
      else if (record.voiceTag === 'critical') voiceCounts.critical++
      else voiceCounts.untagged++

      if (record.emotions.length > 0 && record.outcomeEmotions.length > 0) {
        const maxInitial = Math.max(...record.emotions.map(e => e.intensity))
        const maxOutcome = Math.max(...record.outcomeEmotions.map(e => e.intensity))
        totalImprovement += maxInitial - maxOutcome
        improvementCount++
      }

      for (const emotion of record.emotions) {
        const name = emotion.name.toLowerCase().trim()
        if (name) {
          emotionCounts[name] = (emotionCounts[name] || 0) + 1
        }
      }
    }

    const topDistortions = Object.entries(distortionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, count]) => ({
        id: parseInt(id),
        name: COGNITIVE_DISTORTIONS.find(d => d.id === parseInt(id))?.shortName || '',
        count
      }))

    const dayOfWeekData = Object.entries(dayOfWeekCounts).map(([day, count]) => ({
      day: DAYS[parseInt(day)],
      count
    }))

    const topEmotions = Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    return {
      totalRecords: thoughtRecords.length,
      topDistortions,
      dayOfWeekData,
      voiceCounts,
      averageImprovement: improvementCount > 0 ? Math.round(totalImprovement / improvementCount) : 0,
      topEmotions
    }
  }, [thoughtRecords])

  const depressionTrend = useMemo(() => {
    return depressionChecklists
      .slice()
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(entry => ({
        date: format(parseISO(entry.date), 'MMM d'),
        score: entry.total,
        ...getDepressionLevel(entry.total)
      }))
  }, [depressionChecklists])

  if (!stats && depressionChecklists.length === 0) {
    return (
      <div className="pb-28">
        <h1 className="text-2xl font-semibold text-stone-800 mb-6">Insights</h1>
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sage-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-sage-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
          </div>
          <p className="text-stone-500">
            Add some thought records or complete a depression checklist to see your patterns.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-28 space-y-4">
      <h1 className="text-2xl font-semibold text-stone-800 mb-6">Insights</h1>

      {stats && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="card p-5">
              <div className="text-3xl font-semibold text-stone-800">{stats.totalRecords}</div>
              <div className="text-sm text-stone-500 mt-1">Total records</div>
            </div>
            <div className="card p-5">
              <div className="text-3xl font-semibold text-helpful-500">
                {stats.averageImprovement > 0 ? `↓${stats.averageImprovement}%` : '—'}
              </div>
              <div className="text-sm text-stone-500 mt-1">Avg improvement</div>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="text-base font-semibold text-stone-700 mb-4">Inner voice breakdown</h2>
            <div className="flex gap-4">
              <div className="flex-1 text-center">
                <div className="text-2xl font-semibold text-helpful-500">{stats.voiceCounts.helpful}</div>
                <div className="text-sm text-stone-500">Helpful</div>
              </div>
              <div className="flex-1 text-center">
                <div className="text-2xl font-semibold text-critical-500">{stats.voiceCounts.critical}</div>
                <div className="text-sm text-stone-500">Critical</div>
              </div>
              <div className="flex-1 text-center">
                <div className="text-2xl font-semibold text-stone-400">{stats.voiceCounts.untagged}</div>
                <div className="text-sm text-stone-500">Untagged</div>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="text-base font-semibold text-stone-700 mb-4">Top cognitive distortions</h2>
            <div className="space-y-3">
              {stats.topDistortions.map((d, i) => (
                <div key={d.id} className="flex items-center gap-3">
                  <div className="text-stone-400 w-4 text-sm">{i + 1}.</div>
                  <div className="flex-1 text-stone-700">{d.name}</div>
                  <div className="text-sage-600 font-medium">{d.count}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="text-base font-semibold text-stone-700 mb-4">Records by day of week</h2>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.dayOfWeekData}>
                  <XAxis dataKey="day" stroke="#a8a29e" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#a8a29e" fontSize={12} allowDecimals={false} tickLine={false} axisLine={false} />
                  <Bar dataKey="count" fill="#7d8f7d" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="text-base font-semibold text-stone-700 mb-4">Most frequent emotions</h2>
            <div className="flex flex-wrap gap-2">
              {stats.topEmotions.map(([emotion, count]) => (
                <span key={emotion} className="bg-warm-200 text-stone-600 px-3 py-1.5 rounded-full text-sm">
                  {emotion} ({count})
                </span>
              ))}
            </div>
          </div>
        </>
      )}

      {depressionTrend.length > 0 && (
        <div className="card p-5">
          <h2 className="text-base font-semibold text-stone-700 mb-4">Depression score trend</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={depressionTrend}>
                <XAxis dataKey="date" stroke="#a8a29e" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#a8a29e" fontSize={12} domain={[0, 100]} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e7e5e4',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.06)'
                  }}
                  labelStyle={{ color: '#44403c' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#617161" 
                  strokeWidth={2}
                  dot={{ fill: '#617161', strokeWidth: 0, r: 4 }}
                  activeDot={{ fill: '#617161', strokeWidth: 0, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
