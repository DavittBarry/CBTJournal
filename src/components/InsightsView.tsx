import { useMemo, useState } from 'react'
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
  AreaChart,
  Area,
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

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function InsightCard({ insight }: { insight: PersonalInsight }) {
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
    <div className="card overflow-hidden">
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
  const { thoughtRecords, depressionChecklists, gratitudeEntries, moodChecks } = useAppStore()
  const { resolvedTheme } = useThemeStore()
  const isDark = resolvedTheme === 'dark'
  const [expandedDistortion, setExpandedDistortion] = useState<number | null>(null)

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

  const emotionalTrend = useMemo(() => {
    if (thoughtRecords.length < 3) return null

    const sorted = [...thoughtRecords]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-20)

    return sorted.map((record) => {
      const maxBefore =
        record.emotions.length > 0 ? Math.max(...record.emotions.map((e) => e.intensity)) : 0
      const maxAfter =
        record.outcomeEmotions.length > 0 && record.outcomeEmotions[0].name
          ? Math.max(...record.outcomeEmotions.map((e) => e.intensity))
          : null

      return {
        date: format(parseISO(record.date), 'MMM d'),
        before: maxBefore,
        after: maxAfter,
        improvement: maxAfter !== null ? maxBefore - maxAfter : null,
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

  const hasAnyData =
    progressMetrics ||
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
    <div className="space-y-6">
      <PageIntro
        title="Insights"
        description="Personalized analysis of your CBT practice. Track your progress, understand your patterns, and get evidence-based tips tailored to your thinking style."
      />

      {personalInsights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {personalInsights.map((insight, i) => (
            <InsightCard key={i} insight={insight} />
          ))}
        </div>
      )}

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
                content="Total thought records completed. Research shows that regular practice (3+ records/week) leads to measurable improvement in mood within 4-6 weeks."
              />
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-3xl font-semibold text-helpful-500">
                  {progressMetrics.avgImprovementAllTime > 0
                    ? `↓${progressMetrics.avgImprovementAllTime}%`
                    : '—'}
                </div>
                <div className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                  Avg improvement
                </div>
              </div>
              <StatInfoButton
                title="Average improvement"
                content="Average reduction in emotional intensity after completing thought records. This measures how effectively the cognitive restructuring process is working for you."
              />
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-3xl font-semibold text-stone-800 dark:text-stone-100">
                  {progressMetrics.streak > 0 ? `${progressMetrics.streak}🔥` : '0'}
                </div>
                <div className="text-sm text-stone-500 dark:text-stone-400 mt-1">Day streak</div>
              </div>
              <StatInfoButton
                title="Current streak"
                content="Consecutive days with at least one thought record. Building a habit of regular practice is one of the strongest predictors of CBT success."
              />
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-3xl font-semibold text-stone-800 dark:text-stone-100">
                  {progressMetrics.completionRate}%
                </div>
                <div className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                  Completion rate
                </div>
              </div>
              <StatInfoButton
                title="Completion rate"
                content="Percentage of records where you tracked outcome emotions. Completing the full process helps you measure what works and builds the skill of re-evaluating thoughts."
              />
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
              title="Emotional intensity trend"
              content="Shows your peak emotional intensity before (darker line) and after (lighter area) completing thought records. A widening gap indicates your CBT practice is becoming more effective."
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
                    boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.06)',
                  }}
                  labelStyle={{ color: chartColors.tooltipText }}
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
                  dot={{ fill: chartColors.area, strokeWidth: 0, r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="after"
                  stroke={chartColors.line}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: chartColors.line, strokeWidth: 0, r: 3 }}
                  connectNulls
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-2 text-xs text-stone-500 dark:text-stone-400">
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-sage-600 dark:bg-sage-400" />
              <span>Before</span>
            </div>
            <div className="flex items-center gap-1">
              <div
                className="w-3 h-0.5 bg-sage-600 dark:bg-sage-400 opacity-50"
                style={{ borderBottom: '2px dashed' }}
              />
              <span>After</span>
            </div>
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
              content="These are the thinking patterns that appear most often in your thought records. Understanding your patterns helps you catch them faster. Click each one for personalized tips."
            />
          </div>
          <div className="space-y-2">
            {distortionInsights.map((d) => (
              <DistortionCard
                key={d.id}
                distortion={d}
                isExpanded={expandedDistortion === d.id}
                onToggle={() => setExpandedDistortion(expandedDistortion === d.id ? null : d.id)}
              />
            ))}
          </div>
        </div>
      )}

      {emotionPatterns.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-stone-700 dark:text-stone-300">
              Emotion analysis
            </h2>
            <StatInfoButton
              title="Emotion patterns"
              content="Detailed analysis of your most frequent emotions, including average improvement and common triggers. Understanding your emotional patterns helps you prepare coping strategies."
            />
          </div>
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
                    <span className="text-xs text-stone-400 dark:text-stone-500">
                      ({emotion.count} records)
                    </span>
                  </div>
                  {emotion.avgImprovement > 0 && (
                    <span className="text-sm text-helpful-600 dark:text-helpful-400">
                      ↓{emotion.avgImprovement}% avg improvement
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-stone-500 dark:text-stone-400">
                  <span>
                    Avg before:{' '}
                    <strong className="text-critical-500">{emotion.avgIntensityBefore}%</strong>
                  </span>
                  {emotion.avgIntensityAfter > 0 && (
                    <span>
                      Avg after:{' '}
                      <strong className="text-helpful-500">{emotion.avgIntensityAfter}%</strong>
                    </span>
                  )}
                </div>
                {emotion.commonTriggers.length > 0 && (
                  <div className="mt-2 text-xs text-stone-500 dark:text-stone-400">
                    Common triggers:{' '}
                    {emotion.commonTriggers.map((t, i) => (
                      <span
                        key={t}
                        className="bg-stone-100 dark:bg-stone-700 px-1.5 py-0.5 rounded ml-1"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {(moodTrends.hasPhq9 || moodTrends.hasGad7) && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-stone-700 dark:text-stone-300">
              Clinical assessment trends
            </h2>
            <StatInfoButton
              title="PHQ-9 & GAD-7"
              content="PHQ-9 measures depression (0-27) and GAD-7 measures anxiety (0-21). These are clinically validated tools used worldwide. Lower scores mean fewer symptoms. A downward trend shows improvement."
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
              title="Burns Depression Checklist"
              content="Historical data from the Burns Depression Checklist (0-100 scale). For new assessments, we recommend PHQ-9 which is clinically validated and widely used in healthcare."
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

      {timePatterns && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-stone-700 dark:text-stone-300">
              Weekly patterns
            </h2>
            <StatInfoButton
              title="Weekly patterns"
              content="Shows which days you tend to experience more intense emotions and when you're most likely to practice CBT. Understanding your patterns helps you prepare."
            />
          </div>
          <div className="h-40 sm:h-48">
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
                    boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.06)',
                  }}
                  formatter={(value: number, name: string) => [
                    value,
                    name === 'count' ? 'Records' : 'Avg intensity',
                  ]}
                />
                <Bar dataKey="count" fill={chartColors.bar} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-4 mt-4 text-xs text-stone-500 dark:text-stone-400">
            <div>
              Most records:{' '}
              <span className="font-medium text-stone-700 dark:text-stone-300">
                {timePatterns.peakDay}
              </span>
            </div>
            <div>
              Highest intensity:{' '}
              <span className="font-medium text-stone-700 dark:text-stone-300">
                {timePatterns.peakDay}
              </span>
            </div>
          </div>
        </div>
      )}

      {gratitudeStats && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-stone-700 dark:text-stone-300">
              Gratitude practice
            </h2>
            <StatInfoButton
              title="Gratitude journaling"
              content="Research shows that writing 3-5 gratitude items daily for 2+ weeks measurably increases happiness and reduces depression symptoms. Consistency matters more than quantity."
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
