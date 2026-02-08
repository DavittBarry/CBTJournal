import type { GratitudeEntry } from '@/types'
import { parseISO, differenceInDays, startOfWeek, format, subDays } from 'date-fns'

export interface GratitudePatternInsight {
  type: 'celebration' | 'pattern' | 'tip' | 'warning'
  icon: string
  title: string
  description: string
}

export interface WeeklyGratitudeData {
  week: string
  weekStart: Date
  entryCount: number
  itemCount: number
}

export interface DayOfWeekGratitude {
  day: string
  count: number
}

export interface GratitudeTheme {
  theme: string
  count: number
  percentage: number
}

export interface GratitudeInsightSummary {
  totalDays: number
  totalItems: number
  avgItemsPerDay: number
  currentStreak: number
  longestStreak: number
  depthScore: number
  daysWithWhyGrateful: number
  daysWithSavoring: number
  weeklyTrend: WeeklyGratitudeData[]
  dayOfWeekPattern: DayOfWeekGratitude[]
  topThemes: GratitudeTheme[]
  personalInsights: GratitudePatternInsight[]
}

const GRATITUDE_THEMES: Record<string, string[]> = {
  Family: [
    'family',
    'mom',
    'dad',
    'parent',
    'child',
    'son',
    'daughter',
    'sibling',
    'brother',
    'sister',
    'spouse',
    'wife',
    'husband',
    'partner',
    'grandma',
    'grandpa',
  ],
  Friends: ['friend', 'friendship', 'buddy', 'pal', 'mate'],
  Health: [
    'health',
    'healthy',
    'exercise',
    'walk',
    'run',
    'workout',
    'sleep',
    'energy',
    'body',
    'gym',
    'yoga',
  ],
  Nature: [
    'nature',
    'sun',
    'sunshine',
    'weather',
    'garden',
    'tree',
    'flower',
    'park',
    'ocean',
    'beach',
    'mountain',
    'outdoor',
    'sky',
    'rain',
    'bird',
  ],
  Work: [
    'work',
    'job',
    'career',
    'project',
    'colleague',
    'boss',
    'promotion',
    'achievement',
    'office',
    'team',
  ],
  Food: [
    'food',
    'meal',
    'cook',
    'coffee',
    'tea',
    'breakfast',
    'lunch',
    'dinner',
    'restaurant',
    'eat',
    'bake',
  ],
  Home: ['home', 'house', 'apartment', 'room', 'comfort', 'cozy', 'safe', 'bed', 'warm'],
  Growth: [
    'learn',
    'grow',
    'progress',
    'improve',
    'accomplish',
    'goal',
    'success',
    'proud',
    'achieve',
    'skill',
  ],
  Moments: [
    'moment',
    'laugh',
    'smile',
    'joy',
    'fun',
    'happy',
    'peace',
    'calm',
    'quiet',
    'relax',
    'enjoy',
  ],
  Kindness: [
    'kind',
    'help',
    'support',
    'love',
    'care',
    'generous',
    'thankful',
    'grateful',
    'compassion',
  ],
}

function calculateStreaks(entries: GratitudeEntry[]): {
  currentStreak: number
  longestStreak: number
} {
  if (entries.length === 0) return { currentStreak: 0, longestStreak: 0 }

  const recordDates = new Set(entries.map((e) => format(parseISO(e.date), 'yyyy-MM-dd')))

  const today = format(new Date(), 'yyyy-MM-dd')
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')

  let currentStreak = 0
  if (recordDates.has(today) || recordDates.has(yesterday)) {
    let checkDate = new Date()
    if (!recordDates.has(today)) {
      checkDate = subDays(checkDate, 1)
    }
    while (recordDates.has(format(checkDate, 'yyyy-MM-dd'))) {
      currentStreak++
      checkDate = subDays(checkDate, 1)
    }
  }

  const sortedDates = Array.from(recordDates).sort()
  let longestStreak = 0
  let tempStreak = 1

  for (let i = 1; i < sortedDates.length; i++) {
    const prev = parseISO(sortedDates[i - 1])
    const curr = parseISO(sortedDates[i])
    if (differenceInDays(curr, prev) === 1) {
      tempStreak++
    } else {
      longestStreak = Math.max(longestStreak, tempStreak)
      tempStreak = 1
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak, currentStreak)

  return { currentStreak, longestStreak }
}

function calculateWeeklyTrend(entries: GratitudeEntry[]): WeeklyGratitudeData[] {
  if (entries.length === 0) return []

  const weekMap = new Map<string, { weekStart: Date; entryCount: number; itemCount: number }>()

  for (const entry of entries) {
    const date = parseISO(entry.date)
    const ws = startOfWeek(date, { weekStartsOn: 1 })
    const key = format(ws, 'yyyy-MM-dd')

    const existing = weekMap.get(key)
    if (existing) {
      existing.entryCount++
      existing.itemCount += entry.entries.length
    } else {
      weekMap.set(key, {
        weekStart: ws,
        entryCount: 1,
        itemCount: entry.entries.length,
      })
    }
  }

  return Array.from(weekMap.values())
    .sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime())
    .slice(-8)
    .map((w) => ({
      week: format(w.weekStart, 'MMM d'),
      weekStart: w.weekStart,
      entryCount: w.entryCount,
      itemCount: w.itemCount,
    }))
}

function calculateDayOfWeek(entries: GratitudeEntry[]): DayOfWeekGratitude[] {
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const counts: number[] = [0, 0, 0, 0, 0, 0, 0]

  for (const entry of entries) {
    const day = parseISO(entry.date).getDay()
    counts[day]++
  }

  return DAYS.map((day, i) => ({ day, count: counts[i] }))
}

function detectThemes(entries: GratitudeEntry[]): GratitudeTheme[] {
  const themeCounts: Record<string, number> = {}
  let totalItems = 0

  for (const entry of entries) {
    for (const item of entry.entries) {
      const lower = item.toLowerCase()
      totalItems++
      const matchedThemes = new Set<string>()

      for (const [theme, keywords] of Object.entries(GRATITUDE_THEMES)) {
        if (keywords.some((kw) => lower.includes(kw))) {
          matchedThemes.add(theme)
        }
      }

      for (const theme of matchedThemes) {
        themeCounts[theme] = (themeCounts[theme] || 0) + 1
      }
    }
  }

  if (totalItems === 0) return []

  return Object.entries(themeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([theme, count]) => ({
      theme,
      count,
      percentage: Math.round((count / totalItems) * 100),
    }))
}

function generatePersonalInsights(
  entries: GratitudeEntry[],
  currentStreak: number,
  depthScore: number,
  topThemes: GratitudeTheme[],
  weeklyTrend: WeeklyGratitudeData[],
  totalDays: number
): GratitudePatternInsight[] {
  const insights: GratitudePatternInsight[] = []
  const now = new Date()

  if (currentStreak >= 3) {
    insights.push({
      type: 'celebration',
      icon: '🔥',
      title: `${currentStreak}-day gratitude streak!`,
      description: `You've been journaling gratitude consistently. Regular practice trains your brain to notice positives more naturally.`,
    })
  }

  const recentEntries = entries.filter((e) => differenceInDays(now, parseISO(e.date)) <= 7)
  if (recentEntries.length >= 4 && currentStreak < 3) {
    insights.push({
      type: 'celebration',
      icon: '🌟',
      title: 'Consistent practice',
      description: `You've logged gratitude ${recentEntries.length} times this week. Consistency is more important than volume.`,
    })
  }

  if (weeklyTrend.length >= 8) {
    const firstHalf = weeklyTrend.slice(0, 4)
    const secondHalf = weeklyTrend.slice(-4)
    const firstAvg = firstHalf.reduce((s, w) => s + w.itemCount, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((s, w) => s + w.itemCount, 0) / secondHalf.length

    if (secondAvg > firstAvg * 1.3 && firstAvg > 0) {
      insights.push({
        type: 'celebration',
        icon: '📈',
        title: 'Growing practice',
        description: `You're logging more gratitude items recently. Your practice is deepening over time.`,
      })
    } else if (secondAvg < firstAvg * 0.7 && firstAvg > 0) {
      insights.push({
        type: 'warning',
        icon: '📉',
        title: 'Practice winding down',
        description: `Your gratitude entries have decreased recently. Even one item a day keeps the benefits going.`,
      })
    }
  }

  if (depthScore < 30 && entries.length >= 5) {
    insights.push({
      type: 'tip',
      icon: '💡',
      title: 'Deepen your practice',
      description: `Try using the "Why does this matter?" and "Savoring moment" fields. Research shows reflecting on why amplifies gratitude's benefits.`,
    })
  } else if (depthScore >= 70) {
    insights.push({
      type: 'celebration',
      icon: '🧘',
      title: 'Deep reflective practice',
      description: `You're regularly going beyond listing items to truly reflect. This deeper engagement maximizes wellbeing benefits.`,
    })
  }

  if (topThemes.length >= 3) {
    const themeNames = topThemes
      .slice(0, 3)
      .map((t) => t.theme.toLowerCase())
      .join(', ')
    insights.push({
      type: 'pattern',
      icon: '✨',
      title: 'Diverse gratitude',
      description: `Your gratitude spans ${themeNames}. Noticing good things across different life areas builds resilience.`,
    })
  }

  if (topThemes.length > 0 && topThemes[0].percentage > 50 && entries.length >= 10) {
    insights.push({
      type: 'tip',
      icon: '🔄',
      title: 'Expand your lens',
      description: `${topThemes[0].percentage}% of your items relate to ${topThemes[0].theme.toLowerCase()}. Try noticing new areas to broaden the benefits.`,
    })
  }

  const milestones = [100, 50, 25, 10]
  for (const milestone of milestones) {
    if (totalDays >= milestone && totalDays < milestone + 3) {
      insights.push({
        type: 'celebration',
        icon: '🏆',
        title: `${milestone}-day milestone!`,
        description: `You've logged gratitude on ${totalDays} days. That level of commitment shows real dedication to your wellbeing.`,
      })
      break
    }
  }

  const hasRecentEntry = entries.some((e) => differenceInDays(now, parseISO(e.date)) <= 7)
  if (!hasRecentEntry && entries.length > 0) {
    insights.push({
      type: 'tip',
      icon: '⏰',
      title: 'Resume your practice',
      description: `It's been over a week since your last entry. Even a quick list of three things can restart the habit.`,
    })
  }

  return insights.slice(0, 4)
}

export function generateGratitudeInsights(
  entries: GratitudeEntry[]
): GratitudeInsightSummary | null {
  if (entries.length === 0) return null

  const totalDays = entries.length
  const totalItems = entries.reduce((sum, e) => sum + e.entries.length, 0)
  const avgItemsPerDay = Math.round((totalItems / totalDays) * 10) / 10

  const { currentStreak, longestStreak } = calculateStreaks(entries)

  const daysWithWhyGrateful = entries.filter((e) => e.whyGrateful?.trim()).length
  const daysWithSavoring = entries.filter((e) => e.savoring?.trim()).length
  const depthScore = Math.round(((daysWithWhyGrateful + daysWithSavoring) / (totalDays * 2)) * 100)

  const weeklyTrend = calculateWeeklyTrend(entries)
  const dayOfWeekPattern = calculateDayOfWeek(entries)
  const topThemes = detectThemes(entries)

  const personalInsights = generatePersonalInsights(
    entries,
    currentStreak,
    depthScore,
    topThemes,
    weeklyTrend,
    totalDays
  )

  return {
    totalDays,
    totalItems,
    avgItemsPerDay,
    currentStreak,
    longestStreak,
    depthScore,
    daysWithWhyGrateful,
    daysWithSavoring,
    weeklyTrend,
    dayOfWeekPattern,
    topThemes,
    personalInsights,
  }
}
