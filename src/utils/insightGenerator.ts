import { ThoughtRecord, COGNITIVE_DISTORTIONS, type CognitiveDistortionId } from '@/types'
import { parseISO, differenceInDays, format, subDays } from 'date-fns'

export interface DistortionInsight {
  id: CognitiveDistortionId
  name: string
  count: number
  percentage: number
  trend: 'improving' | 'stable' | 'increasing' | 'new'
  tip: string
  challenge: string
  coOccurs: string[]
}

export interface EmotionPattern {
  name: string
  count: number
  avgIntensityBefore: number
  avgIntensityAfter: number
  avgImprovement: number
  commonTriggers: string[]
  bestResponses: string[]
}

export interface ProgressMetrics {
  totalRecords: number
  recordsLast30Days: number
  recordsLast7Days: number
  avgImprovementAllTime: number
  avgImprovementRecent: number
  completionRate: number
  streak: number
  longestStreak: number
  bestImprovement: { date: string; improvement: number; situation: string }
  recentWins: { date: string; improvement: number; emotion: string }[]
}

export interface PersonalInsight {
  type: 'progress' | 'pattern' | 'tip' | 'warning' | 'celebration'
  title: string
  description: string
  icon: string
  priority: number
}

export interface TimePattern {
  dayOfWeek: { day: string; count: number; avgIntensity: number }[]
  peakDay: string
  calmestDay: string
}

const DISTORTION_TIPS: Record<CognitiveDistortionId, { tip: string; challenge: string }> = {
  1: {
    tip: "Watch for words like 'always', 'never', 'completely', 'totally'. Life exists in shades of gray, not black and white.",
    challenge:
      "When you notice all-or-nothing thinking, ask: 'What's a more balanced view? What percentage is actually true?'",
  },
  2: {
    tip: "One event doesn't define a pattern. Notice when you're using words like 'always' or 'never' based on single incidents.",
    challenge: "Ask yourself: 'Is this really ALWAYS true? Can I think of even one exception?'",
  },
  3: {
    tip: "You're filtering out positives and only seeing negatives. Try to notice the full picture, not just the dark parts.",
    challenge:
      'For every negative you notice, deliberately find two positives in the same situation.',
  },
  4: {
    tip: "You're rejecting evidence that contradicts your negative beliefs. Positives count just as much as negatives.",
    challenge:
      "When you dismiss something positive, ask: 'Would I accept this same evidence if it were negative?'",
  },
  5: {
    tip: "You're mind-reading or fortune-telling without evidence. Thoughts aren't facts, and you can't predict the future.",
    challenge: "Ask: 'What evidence do I actually have? What are other possible explanations?'",
  },
  6: {
    tip: "You're making mountains out of molehills (or vice versa). Try to see things in realistic proportion.",
    challenge:
      "Ask: 'How important will this be in 5 years? Am I exaggerating the negatives or minimizing the positives?'",
  },
  7: {
    tip: "Feelings are valid, but they don't always reflect reality. 'I feel worthless' doesn't mean you ARE worthless.",
    challenge:
      "Separate the feeling from the conclusion: 'I FEEL anxious' vs 'Something bad WILL happen.'",
  },
  8: {
    tip: "Notice your 'shoulds', 'musts', and 'oughts'. These rigid rules often lead to guilt (self) or resentment (others).",
    challenge:
      "Replace 'should' with 'prefer' or 'would like'. Notice how that changes the feeling.",
  },
  9: {
    tip: "You're defining yourself by a single action or trait. You are more than any label.",
    challenge:
      "Replace the label with a specific behavior: 'I made a mistake' instead of 'I'm a failure.'",
  },
  10: {
    tip: "You're taking responsibility for things outside your control. Not everything is about you.",
    challenge:
      "Ask: 'What percentage of this was actually in my control? What other factors were involved?'",
  },
}

export function generateDistortionInsights(records: ThoughtRecord[]): DistortionInsight[] {
  if (records.length === 0) return []

  const distortionCounts: Record<number, number> = {}
  const distortionCoOccurrence: Record<number, Record<number, number>> = {}
  const recentRecords = records.filter((r) => differenceInDays(new Date(), parseISO(r.date)) <= 30)
  const olderRecords = records.filter((r) => differenceInDays(new Date(), parseISO(r.date)) > 30)

  const recentDistortionCounts: Record<number, number> = {}
  const olderDistortionCounts: Record<number, number> = {}

  for (const record of records) {
    for (const id of record.distortions) {
      distortionCounts[id] = (distortionCounts[id] || 0) + 1

      if (!distortionCoOccurrence[id]) {
        distortionCoOccurrence[id] = {}
      }
      for (const otherId of record.distortions) {
        if (otherId !== id) {
          distortionCoOccurrence[id][otherId] = (distortionCoOccurrence[id][otherId] || 0) + 1
        }
      }
    }
  }

  for (const record of recentRecords) {
    for (const id of record.distortions) {
      recentDistortionCounts[id] = (recentDistortionCounts[id] || 0) + 1
    }
  }

  for (const record of olderRecords) {
    for (const id of record.distortions) {
      olderDistortionCounts[id] = (olderDistortionCounts[id] || 0) + 1
    }
  }

  const totalDistortions = Object.values(distortionCounts).reduce((a, b) => a + b, 0)

  return Object.entries(distortionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([idStr, count]) => {
      const id = parseInt(idStr) as CognitiveDistortionId
      const distortion = COGNITIVE_DISTORTIONS.find((d) => d.id === id)!

      const recentRate =
        recentRecords.length > 0 ? (recentDistortionCounts[id] || 0) / recentRecords.length : 0
      const olderRate =
        olderRecords.length > 0 ? (olderDistortionCounts[id] || 0) / olderRecords.length : 0

      let trend: 'improving' | 'stable' | 'increasing' | 'new' = 'stable'
      if (olderRecords.length === 0) {
        trend = 'new'
      } else if (recentRate < olderRate * 0.7) {
        trend = 'improving'
      } else if (recentRate > olderRate * 1.3) {
        trend = 'increasing'
      }

      const coOccurs = Object.entries(distortionCoOccurrence[id] || {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(
          ([coId]) => COGNITIVE_DISTORTIONS.find((d) => d.id === parseInt(coId))?.shortName || ''
        )
        .filter(Boolean)

      const tips = DISTORTION_TIPS[id]

      return {
        id,
        name: distortion.shortName,
        count,
        percentage: Math.round((count / totalDistortions) * 100),
        trend,
        tip: tips.tip,
        challenge: tips.challenge,
        coOccurs,
      }
    })
}

export function generateEmotionPatterns(records: ThoughtRecord[]): EmotionPattern[] {
  if (records.length === 0) return []

  const emotionData: Record<
    string,
    {
      count: number
      totalBefore: number
      totalAfter: number
      improvements: number[]
      situations: string[]
      responses: { response: string; improvement: number }[]
    }
  > = {}

  for (const record of records) {
    for (const emotion of record.emotions) {
      const name = emotion.name.toLowerCase().trim()
      if (!name) continue

      if (!emotionData[name]) {
        emotionData[name] = {
          count: 0,
          totalBefore: 0,
          totalAfter: 0,
          improvements: [],
          situations: [],
          responses: [],
        }
      }

      emotionData[name].count++
      emotionData[name].totalBefore += emotion.intensity

      const outcomeEmotion = record.outcomeEmotions.find(
        (e) => e.name.toLowerCase().trim() === name
      )
      if (outcomeEmotion) {
        emotionData[name].totalAfter += outcomeEmotion.intensity
        const improvement = emotion.intensity - outcomeEmotion.intensity
        emotionData[name].improvements.push(improvement)

        if (improvement > 20 && record.rationalResponse) {
          emotionData[name].responses.push({
            response: record.rationalResponse,
            improvement,
          })
        }
      }

      emotionData[name].situations.push(record.situation)
    }
  }

  return Object.entries(emotionData)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5)
    .map(([name, data]) => {
      const avgImprovement =
        data.improvements.length > 0
          ? data.improvements.reduce((a, b) => a + b, 0) / data.improvements.length
          : 0

      const commonWords = extractCommonThemes(data.situations)

      const bestResponses = data.responses
        .sort((a, b) => b.improvement - a.improvement)
        .slice(0, 2)
        .map((r) => r.response.slice(0, 100) + (r.response.length > 100 ? '...' : ''))

      return {
        name,
        count: data.count,
        avgIntensityBefore: Math.round(data.totalBefore / data.count),
        avgIntensityAfter:
          data.improvements.length > 0 ? Math.round(data.totalAfter / data.improvements.length) : 0,
        avgImprovement: Math.round(avgImprovement),
        commonTriggers: commonWords,
        bestResponses,
      }
    })
}

function extractCommonThemes(situations: string[]): string[] {
  const themes: Record<string, number> = {}
  const themeKeywords: Record<string, string[]> = {
    work: ['work', 'job', 'boss', 'colleague', 'meeting', 'deadline', 'project', 'office'],
    relationships: [
      'partner',
      'friend',
      'family',
      'relationship',
      'dating',
      'marriage',
      'boyfriend',
      'girlfriend',
      'wife',
      'husband',
    ],
    social: ['people', 'party', 'social', 'group', 'conversation', 'talk', 'meet'],
    health: ['health', 'doctor', 'sick', 'pain', 'tired', 'sleep', 'exercise'],
    'self-worth': ['failure', 'worthless', 'stupid', 'ugly', 'fat', 'loser', 'inadequate'],
    future: ['future', 'career', 'money', 'financial', 'plan', 'goal'],
    past: ['past', 'regret', 'mistake', 'remember', 'should have'],
  }

  for (const situation of situations) {
    const lower = situation.toLowerCase()
    for (const [theme, keywords] of Object.entries(themeKeywords)) {
      if (keywords.some((kw) => lower.includes(kw))) {
        themes[theme] = (themes[theme] || 0) + 1
      }
    }
  }

  return Object.entries(themes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([theme]) => theme)
}

export function generateProgressMetrics(records: ThoughtRecord[]): ProgressMetrics | null {
  if (records.length === 0) return null

  const sortedRecords = [...records].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const now = new Date()
  const recordsLast30Days = records.filter(
    (r) => differenceInDays(now, parseISO(r.date)) <= 30
  ).length

  const recordsLast7Days = records.filter(
    (r) => differenceInDays(now, parseISO(r.date)) <= 7
  ).length

  let totalImprovement = 0
  let improvementCount = 0
  let recentImprovement = 0
  let recentImprovementCount = 0
  let completedRecords = 0
  let bestImprovement = { date: '', improvement: 0, situation: '' }
  const recentWins: { date: string; improvement: number; emotion: string }[] = []

  for (const record of records) {
    if (
      record.emotions.length > 0 &&
      record.outcomeEmotions.length > 0 &&
      record.outcomeEmotions[0].name
    ) {
      completedRecords++
      const maxInitial = Math.max(...record.emotions.map((e) => e.intensity))
      const maxOutcome = Math.max(...record.outcomeEmotions.map((e) => e.intensity))
      const improvement = maxInitial - maxOutcome

      totalImprovement += improvement
      improvementCount++

      if (differenceInDays(now, parseISO(record.date)) <= 30) {
        recentImprovement += improvement
        recentImprovementCount++
      }

      if (improvement > bestImprovement.improvement) {
        bestImprovement = {
          date: record.date,
          improvement,
          situation: record.situation.slice(0, 60) + (record.situation.length > 60 ? '...' : ''),
        }
      }

      if (improvement >= 30 && differenceInDays(now, parseISO(record.date)) <= 14) {
        recentWins.push({
          date: record.date,
          improvement,
          emotion: record.emotions[0].name,
        })
      }
    }
  }

  const { streak, longestStreak } = calculateStreaks(sortedRecords)

  return {
    totalRecords: records.length,
    recordsLast30Days,
    recordsLast7Days,
    avgImprovementAllTime:
      improvementCount > 0 ? Math.round(totalImprovement / improvementCount) : 0,
    avgImprovementRecent:
      recentImprovementCount > 0 ? Math.round(recentImprovement / recentImprovementCount) : 0,
    completionRate: Math.round((completedRecords / records.length) * 100),
    streak,
    longestStreak,
    bestImprovement,
    recentWins: recentWins.slice(0, 3),
  }
}

function calculateStreaks(sortedRecords: ThoughtRecord[]): {
  streak: number
  longestStreak: number
} {
  if (sortedRecords.length === 0) return { streak: 0, longestStreak: 0 }

  let currentStreak = 0
  let longestStreak = 0
  let lastDate: Date | null = null

  const recordDates = new Set(sortedRecords.map((r) => format(parseISO(r.date), 'yyyy-MM-dd')))

  const today = format(new Date(), 'yyyy-MM-dd')
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')

  if (!recordDates.has(today) && !recordDates.has(yesterday)) {
    currentStreak = 0
  } else {
    let checkDate = new Date()
    if (!recordDates.has(today)) {
      checkDate = subDays(checkDate, 1)
    }

    while (recordDates.has(format(checkDate, 'yyyy-MM-dd'))) {
      currentStreak++
      checkDate = subDays(checkDate, 1)
    }
  }

  let tempStreak = 0
  for (const record of sortedRecords) {
    const recordDate = parseISO(record.date)

    if (lastDate === null) {
      tempStreak = 1
    } else {
      const dayDiff = differenceInDays(lastDate, recordDate)
      if (dayDiff <= 1) {
        tempStreak++
      } else {
        longestStreak = Math.max(longestStreak, tempStreak)
        tempStreak = 1
      }
    }
    lastDate = recordDate
  }
  longestStreak = Math.max(longestStreak, tempStreak, currentStreak)

  return { streak: currentStreak, longestStreak }
}

export function generatePersonalInsights(
  records: ThoughtRecord[],
  distortionInsights: DistortionInsight[],
  emotionPatterns: EmotionPattern[],
  progressMetrics: ProgressMetrics | null
): PersonalInsight[] {
  const insights: PersonalInsight[] = []

  if (!progressMetrics) return insights

  if (progressMetrics.streak >= 3) {
    insights.push({
      type: 'celebration',
      title: `${progressMetrics.streak}-day streak!`,
      description: `You've been consistent with your practice. Consistency is key to rewiring thought patterns.`,
      icon: '🔥',
      priority: 1,
    })
  }

  if (progressMetrics.recentWins.length > 0) {
    const win = progressMetrics.recentWins[0]
    insights.push({
      type: 'celebration',
      title: 'Recent win',
      description: `You reduced ${win.emotion} by ${win.improvement}% on ${format(parseISO(win.date), 'MMM d')}. That's significant progress!`,
      icon: '🎉',
      priority: 2,
    })
  }

  if (progressMetrics.avgImprovementRecent > progressMetrics.avgImprovementAllTime + 5) {
    insights.push({
      type: 'progress',
      title: 'Improving effectiveness',
      description: `Your recent thought records are ${progressMetrics.avgImprovementRecent - progressMetrics.avgImprovementAllTime}% more effective than your average. Your CBT skills are growing!`,
      icon: '📈',
      priority: 3,
    })
  }

  const improvingDistortions = distortionInsights.filter((d) => d.trend === 'improving')
  if (improvingDistortions.length > 0) {
    insights.push({
      type: 'progress',
      title: 'Distortion improving',
      description: `Your "${improvingDistortions[0].name}" thinking is appearing less often. Keep challenging these thoughts!`,
      icon: '💪',
      priority: 4,
    })
  }

  const increasingDistortions = distortionInsights.filter((d) => d.trend === 'increasing')
  if (increasingDistortions.length > 0) {
    const d = increasingDistortions[0]
    insights.push({
      type: 'warning',
      title: 'Watch this pattern',
      description: `"${d.name}" has been appearing more often recently. ${d.tip}`,
      icon: '👀',
      priority: 5,
    })
  }

  if (distortionInsights.length > 0) {
    const topDistortion = distortionInsights[0]
    insights.push({
      type: 'tip',
      title: `Tip for ${topDistortion.name}`,
      description: topDistortion.challenge,
      icon: '💡',
      priority: 6,
    })
  }

  if (emotionPatterns.length > 0) {
    const topEmotion = emotionPatterns[0]
    if (topEmotion.commonTriggers.length > 0) {
      insights.push({
        type: 'pattern',
        title: `${topEmotion.name} triggers`,
        description: `Your ${topEmotion.name} often relates to ${topEmotion.commonTriggers.join(', ')}. Recognizing triggers helps you prepare coping strategies.`,
        icon: '🎯',
        priority: 7,
      })
    }
  }

  if (progressMetrics.completionRate < 70 && progressMetrics.totalRecords >= 5) {
    insights.push({
      type: 'tip',
      title: 'Complete your records',
      description: `Only ${progressMetrics.completionRate}% of your records have outcome emotions. Completing the full process helps measure what works.`,
      icon: '📝',
      priority: 8,
    })
  }

  if (progressMetrics.recordsLast7Days === 0 && progressMetrics.totalRecords > 0) {
    insights.push({
      type: 'tip',
      title: 'Keep practicing',
      description: `You haven't logged a thought record this week. Even one record helps maintain your skills.`,
      icon: '⏰',
      priority: 9,
    })
  }

  return insights.sort((a, b) => a.priority - b.priority).slice(0, 4)
}

export function generateTimePatterns(records: ThoughtRecord[]): TimePattern | null {
  if (records.length < 5) return null

  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const dayData: Record<number, { count: number; totalIntensity: number }> = {}

  for (let i = 0; i < 7; i++) {
    dayData[i] = { count: 0, totalIntensity: 0 }
  }

  for (const record of records) {
    const day = parseISO(record.date).getDay()
    dayData[day].count++
    if (record.emotions.length > 0) {
      const maxIntensity = Math.max(...record.emotions.map((e) => e.intensity))
      dayData[day].totalIntensity += maxIntensity
    }
  }

  const dayOfWeek = Object.entries(dayData).map(([day, data]) => ({
    day: DAYS[parseInt(day)],
    count: data.count,
    avgIntensity: data.count > 0 ? Math.round(data.totalIntensity / data.count) : 0,
  }))

  const daysWithRecords = dayOfWeek.filter((d) => d.count > 0)
  const peakDay =
    daysWithRecords.length > 0
      ? daysWithRecords.reduce((max, d) => (d.avgIntensity > max.avgIntensity ? d : max)).day
      : 'N/A'
  const calmestDay =
    daysWithRecords.length > 0
      ? daysWithRecords.reduce((min, d) => (d.avgIntensity < min.avgIntensity ? d : min)).day
      : 'N/A'

  return { dayOfWeek, peakDay, calmestDay }
}
