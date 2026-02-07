import { useMemo, useState } from 'react'
import { useAppStore } from '@/stores/appStore'
import { useThemeStore } from '@/stores/themeStore'
import { getDepressionLevel, getPHQ9Level, getGAD7Level } from '@/types'
import { format, parseISO } from 'date-fns'
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
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
} from 'recharts'
import { PageIntro, StatInfoButton } from '@/components/InfoComponents'
import {
  generateDistortionInsights,
  generateEmotionPatterns,
  generateProgressMetrics,
  generatePersonalInsights,
  generateTimePatterns,
  type DistortionInsight,
  type PersonalInsight,
} from '@/utils/insightGenerator'
import { generateActivityInsights, type ActivityPatternInsight } from '@/utils/activityInsights'

function InsightCard({ insight }: { insight: PersonalInsight | ActivityPatternInsight }) {
  const bgColors = {
    celebration:
      'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800',
    progress:
      'bg-gradient-to-br from-helpful-50 to-sage-50 dark:from-helpful-900/20 dark:to-sage-900/20 border-helpful-200 dark:border-helpful-800',
    tip: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800',
    warning:
      'bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800',
    pattern:
      'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800',
  }

  return (
    <div className={`rounded-xl border p-4 ${bgColors[insight.type]}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{insight.icon}</span>
        <div className="min-w-0">
          <h3 className="font-semibold text-stone-800 dark:text-stone-100 text-sm capitalize">
            {insight.title}
          </h3>
          <p className="text-stone-600 dark:text-stone-400 text-sm mt-1 leading-relaxed">
            {insight.description}
          </p>
        </div>
      </div>
    </div>
  )
}

function DistortionCard({
  distortion,
  isExpanded,
  onToggle,
}: {
  distortion: DistortionInsight
  isExpanded: boolean
  onToggle: () => void
}) {
  const trendColors = {
    improving: 'text-helpful-600 dark:text-helpful-400 bg-helpful-100 dark:bg-helpful-900/30',
    stable: 'text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-700',
    increasing: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30',
    new: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
  }

  const trendLabels = {
    improving: '↓ Improving',
    stable: '→ Stable',
    increasing: '↑ Watch this',
    new: '✦ New pattern',
  }

  return (
    <div
      className={`card overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-2 ring-sage-400 dark:ring-sage-500' : ''}`}
    >
      <button
        onClick={onToggle}
        className="w-full text-left p-4 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-sage-100 dark:bg-sage-900/30 flex items-center justify-center text-sm font-semibold text-sage-700 dark:text-sage-400">
              {distortion.percentage}%
            </div>
            <div>
              <div className="font-medium text-stone-800 dark:text-stone-100">
                {distortion.name}
              </div>
              <div className="text-xs text-stone-500 dark:text-stone-400">
                {distortion.count} occurrences
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full ${trendColors[distortion.trend]}`}>
              {trendLabels[distortion.trend]}
            </span>
            <svg
              className={`w-5 h-5 text-stone-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-stone-100 dark:border-stone-700">
          <div className="pt-4">
            <div className="flex items-start gap-2 mb-3">
              <span className="text-amber-500 text-lg">💡</span>
              <div>
                <div className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-1">
                  How to spot it
                </div>
                <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                  {distortion.tip}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-sage-50 dark:bg-sage-900/20 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <span className="text-helpful-500 text-lg">✨</span>
              <div>
                <div className="text-xs font-semibold text-sage-700 dark:text-sage-400 uppercase tracking-wide mb-1">
                  Challenge question
                </div>
                <p className="text-sm text-sage-800 dark:text-sage-300 leading-relaxed italic">
                  "{distortion.challenge}"
                </p>
              </div>
            </div>
          </div>

          {distortion.coOccurs.length > 0 && (
            <div className="text-xs text-stone-500 dark:text-stone-400">
              Often appears with: {distortion.coOccurs.join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function InsightsView() {
  const { thoughtRecords, depressionChecklists, gratitudeEntries, moodChecks, activities } =
    useAppStore()
  const { resolvedTheme } = useThemeStore()
  const isDark = resolvedTheme === 'dark'
  const [expandedDistortion, setExpandedDistortion] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'thoughts' | 'activities'>('overview')

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
    area: isDark ? '#7d8f7d' : '#617161',
    areaFill: isDark ? 'rgba(125, 143, 125, 0.2)' : 'rgba(97, 113, 97, 0.1)',
    activity: isDark ? '#8bb88b' : '#5a8a5a',
    activityFill: isDark ? 'rgba(139, 184, 139, 0.2)' : 'rgba(90, 138, 90, 0.1)',
    moodChange: isDark ? '#6bbb6b' : '#4a9a4a',
  }

  const distortionInsights = useMemo(
    () => generateDistortionInsights(thoughtRecords),
    [thoughtRecords]
  )

  const emotionPatterns = useMemo(() => generateEmotionPatterns(thoughtRecords), [thoughtRecords])

  const progressMetrics = useMemo(() => generateProgressMetrics(thoughtRecords), [thoughtRecords])

  const personalInsights = useMemo(
    () =>
      generatePersonalInsights(
        thoughtRecords,
        distortionInsights,
        emotionPatterns,
        progressMetrics
      ),
    [thoughtRecords, distortionInsights, emotionPatterns, progressMetrics]
  )

  const timePatterns = useMemo(() => generateTimePatterns(thoughtRecords), [thoughtRecords])

  const activityInsights = useMemo(() => generateActivityInsights(activities), [activities])

  const emotionalTrend = useMemo(() => {
    if (thoughtRecords.length < 3) return null

    const sorted = [...thoughtRecords]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-20)

    return sorted.map((record) => {
      const avgBefore =
        record.emotions.length > 0
          ? Math.round(
              record.emotions.reduce((sum, e) => sum + e.intensity, 0) / record.emotions.length
            )
          : 0

      // Only compute "after" when outcome emotions match initial ones (same names re-rated)
      let avgAfter: number | null = null
      if (record.outcomeEmotions.length > 0 && record.outcomeEmotions[0].name) {
        const matches: { before: number; after: number }[] = []
        for (const oe of record.outcomeEmotions) {
          if (!oe.name.trim()) continue
          const initial = record.emotions.find(
            (e) => e.name.trim().toLowerCase() === oe.name.trim().toLowerCase()
          )
          if (initial) {
            matches.push({ before: initial.intensity, after: oe.intensity })
          }
        }
        if (matches.length > 0) {
          avgAfter = Math.round(matches.reduce((sum, m) => sum + m.after, 0) / matches.length)
        }
      }

      return {
        date: format(parseISO(record.date), 'MMM d'),
        before: avgBefore,
        after: avgAfter,
        improvement: avgAfter !== null ? avgBefore - avgAfter : null,
      }
    })
  }, [thoughtRecords])

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

  const activityBalanceData = useMemo(() => {
    if (!activityInsights) return null

    const categoryGroups = {
      Pleasure: ['leisure', 'creative', 'self-care'],
      Mastery: ['productive', 'physical'],
      Social: ['social'],
      Meaning: ['values-aligned', 'mindfulness'],
    }

    return Object.entries(categoryGroups).map(([name, categories]) => {
      const count = activityInsights.categoryBreakdown
        .filter((c) => categories.includes(c.category))
        .reduce((sum, c) => sum + c.completedCount, 0)
      const avgMood =
        activityInsights.categoryBreakdown
          .filter((c) => categories.includes(c.category) && c.completedCount > 0)
          .reduce((sum, c) => sum + c.avgMoodChange * c.completedCount, 0) / Math.max(count, 1)

      return {
        name,
        count,
        avgMoodChange: Math.round(avgMood * 10) / 10,
        fullMark: Math.max(activityInsights.completedActivities / 2, 5),
      }
    })
  }, [activityInsights])

  const hasAnyData =
    progressMetrics ||
    moodTrends.hasPhq9 ||
    moodTrends.hasGad7 ||
    legacyDepressionTrend.length > 0 ||
    gratitudeStats ||
    activityInsights

  if (!hasAnyData) {
    return (
      <div>
        <PageIntro
          title="Insights"
          description="This section shows patterns in your thought records, mood assessments, activities, and gratitude practice. As you add more data, you'll see trends emerge."
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
            Add some records or activities to see your patterns.
          </p>
        </div>
      </div>
    )
  }

  const allInsights = [...personalInsights, ...(activityInsights?.personalInsights || [])]

  return (
    <div className="space-y-6">
      <PageIntro
        title="Insights"
        description="Personalized analysis of your CBT practice and behavioral activation. Track your progress and discover what works for you."
      />

      <div className="flex gap-2 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'overview'
              ? 'bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-100 shadow-sm'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('thoughts')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'thoughts'
              ? 'bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-100 shadow-sm'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
          }`}
        >
          Thoughts
        </button>
        <button
          onClick={() => setActiveTab('activities')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'activities'
              ? 'bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-100 shadow-sm'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
          }`}
        >
          Activities
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          {allInsights.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {allInsights.slice(0, 4).map((insight, i) => (
                <InsightCard key={i} insight={insight} />
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {progressMetrics && (
              <>
                <div className="card p-4">
                  <div className="text-2xl font-semibold text-stone-800 dark:text-stone-100">
                    {progressMetrics.totalRecords}
                  </div>
                  <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    Thought records
                  </div>
                </div>
                <div className="card p-4">
                  <div className="text-2xl font-semibold text-sage-600 dark:text-sage-400">
                    {progressMetrics.completionRate}%
                  </div>
                  <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    Completion rate
                  </div>
                </div>
              </>
            )}
            {activityInsights && (
              <>
                <div className="card p-4">
                  <div className="text-2xl font-semibold text-stone-800 dark:text-stone-100">
                    {activityInsights.activitiesWithMoodData}
                  </div>
                  <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    Activities tracked
                  </div>
                </div>
                <div className="card p-4">
                  <div
                    className={`text-2xl font-semibold ${activityInsights.overallAvgMoodChange >= 0 ? 'text-helpful-500' : 'text-amber-500'}`}
                  >
                    {activityInsights.overallAvgMoodChange > 0 ? '+' : ''}
                    {activityInsights.overallAvgMoodChange}
                  </div>
                  <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    Avg mood change
                  </div>
                </div>
              </>
            )}
          </div>

          {(moodTrends.hasPhq9 || moodTrends.hasGad7) && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-stone-700 dark:text-stone-300">
                  Clinical assessments
                </h2>
                <StatInfoButton
                  title="PHQ-9 & GAD-7"
                  content="PHQ-9 measures depression (0-27) and GAD-7 measures anxiety (0-21). Lower scores mean fewer symptoms."
                />
              </div>
              <div className="h-48">
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
                      }}
                    />
                    <Legend />
                    {moodTrends.hasPhq9 && (
                      <Line
                        type="monotone"
                        dataKey="phq9"
                        name="PHQ-9"
                        stroke={chartColors.phq9}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        connectNulls
                      />
                    )}
                    {moodTrends.hasGad7 && (
                      <Line
                        type="monotone"
                        dataKey="gad7"
                        name="GAD-7"
                        stroke={chartColors.gad7}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        connectNulls
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'thoughts' && (
        <>
          {progressMetrics && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="card p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-3xl font-semibold text-stone-800 dark:text-stone-100">
                      {progressMetrics.totalRecords}
                    </div>
                    <div className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                      Thought records
                    </div>
                  </div>
                  <StatInfoButton
                    title="Thought records"
                    content="Research shows 3+ records/week leads to measurable improvement within 4-6 weeks."
                  />
                </div>
              </div>
              <div className="card p-5">
                <div className="text-3xl font-semibold text-sage-600 dark:text-sage-400">
                  {progressMetrics.recordsLast30Days}
                </div>
                <div className="text-sm text-stone-500 dark:text-stone-400 mt-1">Last 30 days</div>
              </div>
              <div className="card p-5">
                <div className="text-3xl font-semibold text-stone-800 dark:text-stone-100">
                  {progressMetrics.streak > 0 ? `${progressMetrics.streak}🔥` : '0'}
                </div>
                <div className="text-sm text-stone-500 dark:text-stone-400 mt-1">Day streak</div>
              </div>
              <div className="card p-5">
                <div className="text-3xl font-semibold text-stone-800 dark:text-stone-100">
                  {progressMetrics.completionRate}%
                </div>
                <div className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                  Completion rate
                </div>
              </div>
            </div>
          )}

          {emotionalTrend && emotionalTrend.length >= 3 && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-stone-700 dark:text-stone-300">
                  Emotional intensity over time
                </h2>
                <StatInfoButton
                  title="Emotional intensity"
                  content="Shows average emotional intensity for each record. The 'after' line appears when you re-rate the same emotions, showing how much they shifted."
                />
              </div>
              <div className="h-48 sm:h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={emotionalTrend}>
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
                      }}
                      formatter={(value: number, name: string) => [
                        `${value}%`,
                        name === 'before' ? 'Before' : 'After',
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="before"
                      stroke={chartColors.area}
                      strokeWidth={2}
                      fill={chartColors.areaFill}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="after"
                      stroke={chartColors.line}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ r: 3 }}
                      connectNulls
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {distortionInsights.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-stone-700 dark:text-stone-300">
                  Your thinking patterns
                </h2>
                <StatInfoButton
                  title="Cognitive distortions"
                  content="Patterns that appear most in your records. Click each for tips."
                />
              </div>
              <div className="space-y-2">
                {distortionInsights.map((d) => (
                  <DistortionCard
                    key={d.id}
                    distortion={d}
                    isExpanded={expandedDistortion === d.id}
                    onToggle={() =>
                      setExpandedDistortion(expandedDistortion === d.id ? null : d.id)
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {emotionPatterns.length > 0 && (
            <div className="card p-5">
              <h2 className="text-base font-semibold text-stone-700 dark:text-stone-300 mb-4">
                Emotion analysis
              </h2>
              <div className="space-y-4">
                {emotionPatterns.slice(0, 3).map((emotion) => (
                  <div
                    key={emotion.name}
                    className="border-b border-stone-100 dark:border-stone-700 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-stone-800 dark:text-stone-100 font-medium capitalize">
                          {emotion.name}
                        </span>
                        <span className="text-xs text-stone-400">({emotion.count} records)</span>
                      </div>
                      {emotion.avgImprovement > 0 && (
                        <span className="text-sm text-helpful-600 dark:text-helpful-400">
                          ↓{emotion.avgImprovement}%
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-stone-500 dark:text-stone-400">
                      <span>
                        Before:{' '}
                        <strong className="text-critical-500">{emotion.avgIntensityBefore}%</strong>
                      </span>
                      {emotion.avgIntensityAfter > 0 && (
                        <span>
                          After:{' '}
                          <strong className="text-helpful-500">{emotion.avgIntensityAfter}%</strong>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'activities' && activityInsights && (
        <>
          {activityInsights.personalInsights.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activityInsights.personalInsights.map((insight, i) => (
                <InsightCard key={i} insight={insight} />
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-3xl font-semibold text-stone-800 dark:text-stone-100">
                    {activityInsights.activitiesWithMoodData}
                  </div>
                  <div className="text-sm text-stone-500 dark:text-stone-400 mt-1">Tracked</div>
                </div>
                <StatInfoButton
                  title="Tracked activities"
                  content="Activities where you recorded mood before and after. This data builds your personal evidence base."
                />
              </div>
            </div>
            <div className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div
                    className={`text-3xl font-semibold ${activityInsights.positiveOutcomePercentage >= 50 ? 'text-helpful-500' : 'text-amber-500'}`}
                  >
                    {activityInsights.positiveOutcomePercentage}%
                  </div>
                  <div className="text-sm text-stone-500 dark:text-stone-400 mt-1">Helped mood</div>
                </div>
                <StatInfoButton
                  title="Positive outcomes"
                  content="Percentage of activities that improved your mood. This combats the depression lie that 'nothing helps.'"
                />
              </div>
            </div>
            <div className="card p-5">
              <div
                className={`text-3xl font-semibold ${activityInsights.overallAvgMoodChange >= 0 ? 'text-helpful-500' : 'text-amber-500'}`}
              >
                {activityInsights.overallAvgMoodChange > 0 ? '+' : ''}
                {activityInsights.overallAvgMoodChange}
              </div>
              <div className="text-sm text-stone-500 dark:text-stone-400 mt-1">Avg mood Δ</div>
            </div>
            <div className="card p-5">
              <div className="text-3xl font-semibold text-stone-800 dark:text-stone-100">
                {activityInsights.balanceScore}%
              </div>
              <div className="text-sm text-stone-500 dark:text-stone-400 mt-1">Balance score</div>
            </div>
          </div>

          {activityBalanceData && activityInsights.completedActivities >= 3 && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-stone-700 dark:text-stone-300">
                  Activity balance
                </h2>
                <StatInfoButton
                  title="Activity balance"
                  content="Research shows balancing four types of activities works best: Pleasure (fun), Mastery (achievement), Social (connection), and Meaning (values). Aim for activities in all four areas."
                />
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={activityBalanceData}>
                    <PolarGrid stroke={chartColors.axis} />
                    <PolarAngleAxis
                      dataKey="name"
                      tick={{ fill: chartColors.tooltipText, fontSize: 12 }}
                    />
                    <PolarRadiusAxis tick={{ fill: chartColors.axis, fontSize: 10 }} />
                    <Radar
                      name="Activities"
                      dataKey="count"
                      stroke={chartColors.activity}
                      fill={chartColors.activityFill}
                      fillOpacity={0.6}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: chartColors.tooltipBg,
                        border: `1px solid ${chartColors.tooltipBorder}`,
                        borderRadius: '12px',
                      }}
                      formatter={(
                        value: number,
                        name: string,
                        props: { payload?: { avgMoodChange?: number } }
                      ) => [
                        `${value} activities (avg mood: ${props.payload?.avgMoodChange && props.payload.avgMoodChange > 0 ? '+' : ''}${props.payload?.avgMoodChange ?? 0})`,
                        name,
                      ]}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-4 mt-2 text-xs text-stone-500 dark:text-stone-400 justify-center">
                <span>
                  <strong>Pleasure:</strong> Leisure, creative, self-care
                </span>
                <span>
                  <strong>Mastery:</strong> Productive, physical
                </span>
                <span>
                  <strong>Social:</strong> Connection
                </span>
                <span>
                  <strong>Meaning:</strong> Values, mindfulness
                </span>
              </div>
            </div>
          )}

          {activityInsights.topMoodBoosters.length > 0 && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-stone-700 dark:text-stone-300">
                  Your top mood boosters
                </h2>
                <StatInfoButton
                  title="Top mood boosters"
                  content="Activities that consistently improved your mood the most. This is your personal 'prescription' based on your own data."
                />
              </div>
              <div className="space-y-3">
                {activityInsights.topMoodBoosters.slice(0, 5).map((activity, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{activity.categoryIcon}</span>
                      <div>
                        <div className="font-medium text-stone-700 dark:text-stone-300 text-sm">
                          {activity.activity}
                        </div>
                        <div className="text-xs text-stone-500 dark:text-stone-400">
                          {activity.occurrences}x · 😊 {activity.avgPleasure} · 💪{' '}
                          {activity.avgMastery}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`text-lg font-bold ${activity.avgMoodChange >= 0 ? 'text-helpful-500' : 'text-amber-500'}`}
                    >
                      {activity.avgMoodChange > 0 ? '+' : ''}
                      {activity.avgMoodChange}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activityInsights.categoryBreakdown.length > 0 && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-stone-700 dark:text-stone-300">
                  Activity types
                </h2>
                <StatInfoButton
                  title="Activity categories"
                  content="Breakdown of your activity types and their average mood impact. Different categories serve different psychological needs."
                />
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activityInsights.categoryBreakdown.slice(0, 6)} layout="vertical">
                    <XAxis
                      type="number"
                      stroke={chartColors.axis}
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="label"
                      stroke={chartColors.axis}
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: chartColors.tooltipBg,
                        border: `1px solid ${chartColors.tooltipBorder}`,
                        borderRadius: '12px',
                      }}
                      formatter={(
                        value: number,
                        name: string,
                        props: { payload?: { avgMoodChange?: number } }
                      ) => {
                        if (name === 'completedCount') {
                          const moodChange = props.payload?.avgMoodChange ?? 0
                          return [
                            `${value} completed (avg mood: ${moodChange > 0 ? '+' : ''}${moodChange})`,
                            'Activities',
                          ]
                        }
                        return [value, name]
                      }}
                    />
                    <Bar
                      dataKey="completedCount"
                      fill={chartColors.activity}
                      radius={[0, 6, 6, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activityInsights.weeklyTrend.length >= 3 && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-stone-700 dark:text-stone-300">
                  Weekly activity trend
                </h2>
                <StatInfoButton
                  title="Activity over time"
                  content="Activity count and average mood change per week. Research shows activity level often predicts mood before symptoms appear."
                />
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={activityInsights.weeklyTrend}>
                    <XAxis
                      dataKey="week"
                      stroke={chartColors.axis}
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      yAxisId="left"
                      stroke={chartColors.axis}
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke={chartColors.moodChange}
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      domain={[-5, 5]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: chartColors.tooltipBg,
                        border: `1px solid ${chartColors.tooltipBorder}`,
                        borderRadius: '12px',
                      }}
                    />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="activityCount"
                      name="Activities"
                      fill={chartColors.activity}
                      radius={[6, 6, 0, 0]}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="avgMoodChange"
                      name="Avg mood Δ"
                      stroke={chartColors.moodChange}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activityInsights.activitiesWithMoodData === 0 &&
            activityInsights.totalActivities > 0 && (
              <div className="card p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <h3 className="font-semibold text-stone-800 dark:text-stone-100 text-sm">
                      Track mood to unlock insights
                    </h3>
                    <p className="text-stone-600 dark:text-stone-400 text-sm mt-1">
                      You have {activityInsights.totalActivities} activities but none with mood data
                      yet. When completing activities, rate your mood before and after to discover
                      which activities actually help you feel better.
                    </p>
                  </div>
                </div>
              </div>
            )}
        </>
      )}

      {activeTab === 'activities' && !activityInsights && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sage-100 dark:bg-sage-900/30 flex items-center justify-center">
            <span className="text-2xl">📊</span>
          </div>
          <h3 className="text-stone-700 dark:text-stone-300 font-medium mb-2">
            No activity data yet
          </h3>
          <p className="text-stone-500 dark:text-stone-400 text-sm max-w-md mx-auto">
            Start tracking activities with mood ratings to see which ones help you feel better. This
            builds your personal evidence base.
          </p>
        </div>
      )}

      {activeTab === 'overview' && (
        <>
          {timePatterns && (
            <div className="card p-5">
              <h2 className="text-base font-semibold text-stone-700 dark:text-stone-300 mb-4">
                Weekly patterns
              </h2>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timePatterns.dayOfWeek}>
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
                    <Tooltip
                      contentStyle={{
                        backgroundColor: chartColors.tooltipBg,
                        border: `1px solid ${chartColors.tooltipBorder}`,
                        borderRadius: '12px',
                      }}
                    />
                    <Bar dataKey="count" fill={chartColors.bar} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {gratitudeStats && (
            <div className="card p-5">
              <h2 className="text-base font-semibold text-stone-700 dark:text-stone-300 mb-4">
                Gratitude practice
              </h2>
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
        </>
      )}
    </div>
  )
}
