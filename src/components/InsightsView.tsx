import { useMemo } from 'react'
import { useAppStore } from '@/stores/appStore'
import { useThemeStore } from '@/stores/themeStore'
import { COGNITIVE_DISTORTIONS, getDepressionLevel, getPHQ9Level, getGAD7Level } from '@/types'
import { format, parseISO, getDay } from 'date-fns'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from 'recharts'
import { PageIntro, StatInfoButton } from '@/components/InfoComponents'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function InsightsView() {
  const { thoughtRecords, depressionChecklists, gratitudeEntries, moodChecks } = useAppStore()
  const { resolvedTheme } = useThemeStore()
  const isDark = resolvedTheme === 'dark'

  const chartColors = {
    axis: isDark ? '#78716c' : '#a8a29e',
    line: isDark ? '#7d8f7d' : '#617161',
    lineSecondary: isDark ? '#8b9dc3' : '#6b7db3',
    bar: isDark ? '#7d8f7d' : '#7d8f7d',
    tooltipBg: isDark ? '#292524' : '#fff',
    tooltipBorder: isDark ? '#44403c' : '#e7e5e4',
    tooltipText: isDark ? '#fafaf9' : '#44403c',
    phq9: isDark ? '#7d8f7d' : '#617161',
    gad7: isDark ? '#c4a87d' : '#b8956d',
    legacy: isDark ? '#9ca3af' : '#6b7280',
  }

  const stats = useMemo(() => {
    if (thoughtRecords.length === 0) return null

    const distortionCounts: Record<number, number> = {}
    const dayOfWeekCounts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
    let totalImprovement = 0
    let improvementCount = 0
    const emotionCounts: Record<string, number> = {}

    for (const record of thoughtRecords) {
      for (const id of record.distortions) {
        distortionCounts[id] = (distortionCounts[id] || 0) + 1
      }

      const dayOfWeek = getDay(parseISO(record.date))
      dayOfWeekCounts[dayOfWeek]++

      if (record.emotions.length > 0 && record.outcomeEmotions.length > 0) {
        const maxInitial = Math.max(...record.emotions.map((e) => e.intensity))
        const maxOutcome = Math.max(...record.outcomeEmotions.map((e) => e.intensity))
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
        name: COGNITIVE_DISTORTIONS.find((d) => d.id === parseInt(id))?.shortName || '',
        count,
      }))

    const dayOfWeekData = Object.entries(dayOfWeekCounts).map(([day, count]) => ({
      day: DAYS[parseInt(day)],
      count,
    }))

    const topEmotions = Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    return {
      totalRecords: thoughtRecords.length,
      topDistortions,
      dayOfWeekData,
      averageImprovement:
        improvementCount > 0 ? Math.round(totalImprovement / improvementCount) : 0,
      topEmotions,
    }
  }, [thoughtRecords])

  // PHQ-9 and GAD-7 trends from mood checks
  const moodTrends = useMemo(() => {
    const phq9Checks = moodChecks.filter((m) => m.type === 'phq9' && m.phq9Scores)
    const gad7Checks = moodChecks.filter((m) => m.type === 'gad7' && m.gad7Scores)

    const phq9Data = phq9Checks
      .slice()
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((entry) => {
        const score = entry.phq9Scores
          ? Object.values(entry.phq9Scores).reduce((a, b) => a + b, 0)
          : 0
        return {
          date: format(parseISO(entry.date), 'MMM d'),
          score,
          ...getPHQ9Level(score),
        }
      })

    const gad7Data = gad7Checks
      .slice()
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((entry) => {
        const score = entry.gad7Scores
          ? Object.values(entry.gad7Scores).reduce((a, b) => a + b, 0)
          : 0
        return {
          date: format(parseISO(entry.date), 'MMM d'),
          score,
          ...getGAD7Level(score),
        }
      })

    // Combined data for dual chart
    const allDates = new Set([...phq9Data.map((d) => d.date), ...gad7Data.map((d) => d.date)])
    const combinedData = Array.from(allDates)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      .map((date) => ({
        date,
        phq9: phq9Data.find((d) => d.date === date)?.score,
        gad7: gad7Data.find((d) => d.date === date)?.score,
      }))

    return {
      phq9: phq9Data,
      gad7: gad7Data,
      combined: combinedData,
      hasPhq9: phq9Data.length > 0,
      hasGad7: gad7Data.length > 0,
    }
  }, [moodChecks])

  // Legacy Burns Depression Checklist trend
  const legacyDepressionTrend = useMemo(() => {
    return depressionChecklists
      .slice()
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((entry) => ({
        date: format(parseISO(entry.date), 'MMM d'),
        score: entry.total,
        ...getDepressionLevel(entry.total),
      }))
  }, [depressionChecklists])

  const gratitudeStats = useMemo(() => {
    if (gratitudeEntries.length === 0) return null

    const totalEntries = gratitudeEntries.reduce((sum, entry) => sum + entry.entries.length, 0)

    return {
      totalDays: gratitudeEntries.length,
      totalEntries,
      avgPerDay: Math.round((totalEntries / gratitudeEntries.length) * 10) / 10,
    }
  }, [gratitudeEntries])

  const hasAnyData =
    stats ||
    moodTrends.hasPhq9 ||
    moodTrends.hasGad7 ||
    legacyDepressionTrend.length > 0 ||
    gratitudeStats

  if (!hasAnyData) {
    return (
      <div>
        <PageIntro
          title="Insights"
          description="This section shows patterns in your thought records, mood assessments, and gratitude practice. As you add more data, you'll see trends emerge that can help you understand your thinking patterns and track your progress over time."
        />
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sage-100 dark:bg-sage-900/30 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-sage-400 dark:text-sage-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
          </div>
          <p className="text-stone-500 dark:text-stone-400">
            Add some records to see your patterns.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <PageIntro
        title="Insights"
        description="Track your progress and discover patterns. This view combines validated clinical assessments (PHQ-9 for depression, GAD-7 for anxiety) with your thought record practice to give you a comprehensive picture of your mental health journey."
      />

      {stats && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-3xl font-semibold text-stone-800 dark:text-stone-100">
                    {stats.totalRecords}
                  </div>
                  <div className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                    Thought records
                  </div>
                </div>
                <StatInfoButton
                  title="Thought records"
                  content="The total number of thought records you've completed. More records means more practice challenging negative thoughts and building healthier thinking patterns."
                />
              </div>
            </div>
            <div className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-3xl font-semibold text-helpful-500 dark:text-helpful-500">
                    {stats.averageImprovement > 0 ? `↓${stats.averageImprovement}%` : '—'}
                  </div>
                  <div className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                    Avg improvement
                  </div>
                </div>
                <StatInfoButton
                  title="Average improvement"
                  content="The average reduction in emotional intensity after completing a thought record. This shows how much the cognitive restructuring process helps reduce the intensity of negative emotions."
                />
              </div>
            </div>
            {gratitudeStats && (
              <>
                <div className="card p-5">
                  <div className="text-3xl font-semibold text-stone-800 dark:text-stone-100">
                    {gratitudeStats.totalDays}
                  </div>
                  <div className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                    Gratitude days
                  </div>
                </div>
                <div className="card p-5">
                  <div className="text-3xl font-semibold text-stone-800 dark:text-stone-100">
                    {gratitudeStats.avgPerDay}
                  </div>
                  <div className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                    Avg items/day
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-stone-700 dark:text-stone-300">
                  Top cognitive distortions
                </h2>
                <StatInfoButton
                  title="Top cognitive distortions"
                  content="These are the thinking patterns that appear most often in your thought records. Knowing your most common distortions helps you recognize them faster in daily life and challenge them more effectively."
                />
              </div>
              <div className="space-y-3">
                {stats.topDistortions.map((d, i) => (
                  <div key={d.id} className="flex items-center gap-3">
                    <div className="text-stone-400 dark:text-stone-500 w-4 text-sm">{i + 1}.</div>
                    <div className="flex-1 text-stone-700 dark:text-stone-300">{d.name}</div>
                    <div className="text-sage-600 dark:text-sage-400 font-medium">{d.count}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-stone-700 dark:text-stone-300">
                  Most frequent emotions
                </h2>
                <StatInfoButton
                  title="Most frequent emotions"
                  content="The emotions that appear most often in your thought records. Understanding which emotions you experience most frequently can help you anticipate triggers and develop targeted coping strategies."
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {stats.topEmotions.map(([emotion, count]) => (
                  <span
                    key={emotion}
                    className="bg-warm-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 px-3 py-1.5 rounded-full text-sm"
                  >
                    {emotion} ({count})
                  </span>
                ))}
              </div>
              {stats.topEmotions.length === 0 && (
                <p className="text-stone-400 dark:text-stone-500 text-sm">
                  No emotions recorded yet
                </p>
              )}
            </div>
          </div>
        </>
      )}

      {/* PHQ-9 and GAD-7 mood trends */}
      {(moodTrends.hasPhq9 || moodTrends.hasGad7) && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-stone-700 dark:text-stone-300">
              Mood assessment trends
            </h2>
            <StatInfoButton
              title="Mood assessment trends"
              content="PHQ-9 measures depression symptoms (0-27 scale) and GAD-7 measures anxiety symptoms (0-21 scale). Both are clinically validated tools used worldwide. Lower scores indicate fewer symptoms. A downward trend shows improvement."
            />
          </div>
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={moodTrends.combined}>
                <XAxis
                  dataKey="date"
                  stroke={chartColors.axis}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke={chartColors.axis}
                  fontSize={12}
                  domain={[0, 'auto']}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartColors.tooltipBg,
                    border: `1px solid ${chartColors.tooltipBorder}`,
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.06)',
                  }}
                  labelStyle={{ color: chartColors.tooltipText }}
                />
                <Legend />
                {moodTrends.hasPhq9 && (
                  <Line
                    type="monotone"
                    dataKey="phq9"
                    name="PHQ-9 (Depression)"
                    stroke={chartColors.phq9}
                    strokeWidth={2}
                    dot={{ fill: chartColors.phq9, strokeWidth: 0, r: 4 }}
                    activeDot={{ fill: chartColors.phq9, strokeWidth: 0, r: 6 }}
                    connectNulls
                  />
                )}
                {moodTrends.hasGad7 && (
                  <Line
                    type="monotone"
                    dataKey="gad7"
                    name="GAD-7 (Anxiety)"
                    stroke={chartColors.gad7}
                    strokeWidth={2}
                    dot={{ fill: chartColors.gad7, strokeWidth: 0, r: 4 }}
                    activeDot={{ fill: chartColors.gad7, strokeWidth: 0, r: 6 }}
                    connectNulls
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-4 mt-4 text-xs text-stone-500 dark:text-stone-400">
            {moodTrends.hasPhq9 && moodTrends.phq9.length > 0 && (
              <div>
                Latest PHQ-9:{' '}
                <span className={moodTrends.phq9[moodTrends.phq9.length - 1].color}>
                  {moodTrends.phq9[moodTrends.phq9.length - 1].score} (
                  {moodTrends.phq9[moodTrends.phq9.length - 1].level})
                </span>
              </div>
            )}
            {moodTrends.hasGad7 && moodTrends.gad7.length > 0 && (
              <div>
                Latest GAD-7:{' '}
                <span className={moodTrends.gad7[moodTrends.gad7.length - 1].color}>
                  {moodTrends.gad7[moodTrends.gad7.length - 1].score} (
                  {moodTrends.gad7[moodTrends.gad7.length - 1].level})
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legacy Burns Depression Checklist trend - only show if user has historical data */}
      {legacyDepressionTrend.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-stone-700 dark:text-stone-300">
                Burns checklist
              </h2>
              <span className="text-xs bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400 px-2 py-0.5 rounded-full">
                Legacy
              </span>
            </div>
            <StatInfoButton
              title="Burns Depression Checklist (legacy)"
              content="Historical data from the Burns Depression Checklist (0-100 scale), developed by Dr. David Burns. For new assessments, we recommend PHQ-9 which is clinically validated and widely used in healthcare. Your existing data is preserved here."
            />
          </div>
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={legacyDepressionTrend}>
                <XAxis
                  dataKey="date"
                  stroke={chartColors.axis}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke={chartColors.axis}
                  fontSize={12}
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartColors.tooltipBg,
                    border: `1px solid ${chartColors.tooltipBorder}`,
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.06)',
                  }}
                  labelStyle={{ color: chartColors.tooltipText }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke={chartColors.legacy}
                  strokeWidth={2}
                  dot={{ fill: chartColors.legacy, strokeWidth: 0, r: 4 }}
                  activeDot={{ fill: chartColors.legacy, strokeWidth: 0, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {stats && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-stone-700 dark:text-stone-300">
              Records by day of week
            </h2>
            <StatInfoButton
              title="Records by day of week"
              content="Shows which days you tend to write thought records. This can reveal patterns, like if certain days are more emotionally difficult for you or when you're most likely to practice CBT techniques."
            />
          </div>
          <div className="h-40 sm:h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.dayOfWeekData}>
                <XAxis
                  dataKey="day"
                  stroke={chartColors.axis}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke={chartColors.axis}
                  fontSize={12}
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                />
                <Bar dataKey="count" fill={chartColors.bar} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {!stats && gratitudeStats && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-stone-700 dark:text-stone-300">
              Gratitude practice
            </h2>
            <StatInfoButton
              title="Gratitude practice"
              content="Tracks your gratitude journaling consistency. Research shows that writing 3-5 gratitude items daily for 2+ weeks can measurably increase happiness and reduce depression symptoms."
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-semibold text-stone-800 dark:text-stone-100">
                {gratitudeStats.totalDays}
              </div>
              <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">Days logged</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-stone-800 dark:text-stone-100">
                {gratitudeStats.totalEntries}
              </div>
              <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">Total items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-stone-800 dark:text-stone-100">
                {gratitudeStats.avgPerDay}
              </div>
              <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">Avg per day</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
