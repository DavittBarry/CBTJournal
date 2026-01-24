import { ActivityEntry, ACTIVITY_CATEGORIES, type ActivityCategory } from '@/types'
import { parseISO, differenceInDays, startOfWeek, format } from 'date-fns'

export interface ActivityCategoryInsight {
  category: ActivityCategory
  label: string
  icon: string
  count: number
  completedCount: number
  avgMoodChange: number
  avgPleasure: number
  avgMastery: number
  percentageOfTotal: number
}

export interface TopActivityInsight {
  activity: string
  category: ActivityCategory
  categoryIcon: string
  occurrences: number
  avgMoodChange: number
  avgPleasure: number
  avgMastery: number
  totalMoodBoost: number
}

export interface ActivityPatternInsight {
  type: 'celebration' | 'pattern' | 'tip' | 'warning'
  icon: string
  title: string
  description: string
}

export interface WeeklyActivityData {
  week: string
  weekStart: Date
  activityCount: number
  avgMoodChange: number
  completedCount: number
}

export interface ActivityInsightSummary {
  totalActivities: number
  completedActivities: number
  activitiesWithMoodData: number
  overallAvgMoodChange: number
  positiveOutcomePercentage: number
  avgPleasure: number
  avgMastery: number
  mostEffectiveCategory: ActivityCategoryInsight | null
  leastUsedCategories: ActivityCategory[]
  categoryBreakdown: ActivityCategoryInsight[]
  topMoodBoosters: TopActivityInsight[]
  weeklyTrend: WeeklyActivityData[]
  personalInsights: ActivityPatternInsight[]
  streakDays: number
  balanceScore: number
}

export function generateActivityInsights(
  activities: ActivityEntry[]
): ActivityInsightSummary | null {
  if (activities.length === 0) {
    return null
  }

  const completedActivities = activities.filter((a) => a.isCompleted)
  const activitiesWithMoodData = completedActivities.filter(
    (a) => a.moodBefore !== undefined && a.moodAfter !== undefined
  )

  const categoryStats = new Map<
    ActivityCategory,
    {
      count: number
      completedCount: number
      moodChanges: number[]
      pleasureRatings: number[]
      masteryRatings: number[]
    }
  >()

  ACTIVITY_CATEGORIES.forEach((cat) => {
    categoryStats.set(cat.id, {
      count: 0,
      completedCount: 0,
      moodChanges: [],
      pleasureRatings: [],
      masteryRatings: [],
    })
  })

  activities.forEach((activity) => {
    const stats = categoryStats.get(activity.category)!
    stats.count++

    if (activity.isCompleted) {
      stats.completedCount++

      if (activity.moodBefore !== undefined && activity.moodAfter !== undefined) {
        stats.moodChanges.push(activity.moodAfter - activity.moodBefore)
      }
      if (activity.pleasureRating !== undefined) {
        stats.pleasureRatings.push(activity.pleasureRating)
      }
      if (activity.masteryRating !== undefined) {
        stats.masteryRatings.push(activity.masteryRating)
      }
    }
  })

  const categoryBreakdown: ActivityCategoryInsight[] = ACTIVITY_CATEGORIES.map((cat) => {
    const stats = categoryStats.get(cat.id)!
    const avgMoodChange =
      stats.moodChanges.length > 0
        ? stats.moodChanges.reduce((a, b) => a + b, 0) / stats.moodChanges.length
        : 0
    const avgPleasure =
      stats.pleasureRatings.length > 0
        ? stats.pleasureRatings.reduce((a, b) => a + b, 0) / stats.pleasureRatings.length
        : 0
    const avgMastery =
      stats.masteryRatings.length > 0
        ? stats.masteryRatings.reduce((a, b) => a + b, 0) / stats.masteryRatings.length
        : 0

    return {
      category: cat.id,
      label: cat.label,
      icon: cat.icon,
      count: stats.count,
      completedCount: stats.completedCount,
      avgMoodChange: Math.round(avgMoodChange * 10) / 10,
      avgPleasure: Math.round(avgPleasure * 10) / 10,
      avgMastery: Math.round(avgMastery * 10) / 10,
      percentageOfTotal:
        activities.length > 0 ? Math.round((stats.count / activities.length) * 100) : 0,
    }
  })
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count)

  const mostEffectiveCategory =
    categoryBreakdown
      .filter((c) => c.completedCount >= 2)
      .sort((a, b) => b.avgMoodChange - a.avgMoodChange)[0] || null

  const usedCategories = new Set(activities.map((a) => a.category))
  const leastUsedCategories = ACTIVITY_CATEGORIES.filter(
    (cat) => !usedCategories.has(cat.id) && cat.id !== 'other'
  )
    .map((cat) => cat.id)
    .slice(0, 3)

  const activityGroups = new Map<
    string,
    {
      activity: string
      category: ActivityCategory
      occurrences: number
      moodChanges: number[]
      pleasureRatings: number[]
      masteryRatings: number[]
    }
  >()

  completedActivities.forEach((a) => {
    const key = a.activity.toLowerCase().trim()
    if (!activityGroups.has(key)) {
      activityGroups.set(key, {
        activity: a.activity,
        category: a.category,
        occurrences: 0,
        moodChanges: [],
        pleasureRatings: [],
        masteryRatings: [],
      })
    }
    const group = activityGroups.get(key)!
    group.occurrences++
    if (a.moodBefore !== undefined && a.moodAfter !== undefined) {
      group.moodChanges.push(a.moodAfter - a.moodBefore)
    }
    if (a.pleasureRating !== undefined) {
      group.pleasureRatings.push(a.pleasureRating)
    }
    if (a.masteryRating !== undefined) {
      group.masteryRatings.push(a.masteryRating)
    }
  })

  const topMoodBoosters: TopActivityInsight[] = Array.from(activityGroups.values())
    .filter((g) => g.moodChanges.length > 0)
    .map((g) => {
      const avgMoodChange = g.moodChanges.reduce((a, b) => a + b, 0) / g.moodChanges.length
      const avgPleasure =
        g.pleasureRatings.length > 0
          ? g.pleasureRatings.reduce((a, b) => a + b, 0) / g.pleasureRatings.length
          : 0
      const avgMastery =
        g.masteryRatings.length > 0
          ? g.masteryRatings.reduce((a, b) => a + b, 0) / g.masteryRatings.length
          : 0
      const cat = ACTIVITY_CATEGORIES.find((c) => c.id === g.category)

      return {
        activity: g.activity,
        category: g.category,
        categoryIcon: cat?.icon || '📝',
        occurrences: g.occurrences,
        avgMoodChange: Math.round(avgMoodChange * 10) / 10,
        avgPleasure: Math.round(avgPleasure * 10) / 10,
        avgMastery: Math.round(avgMastery * 10) / 10,
        totalMoodBoost: g.moodChanges.reduce((a, b) => a + b, 0),
      }
    })
    .sort((a, b) => b.avgMoodChange - a.avgMoodChange)
    .slice(0, 5)

  const weeklyData = new Map<string, WeeklyActivityData>()

  completedActivities.forEach((a) => {
    const date = parseISO(a.date)
    const weekStart = startOfWeek(date, { weekStartsOn: 1 })
    const weekKey = format(weekStart, 'yyyy-MM-dd')

    if (!weeklyData.has(weekKey)) {
      weeklyData.set(weekKey, {
        week: format(weekStart, 'MMM d'),
        weekStart,
        activityCount: 0,
        avgMoodChange: 0,
        completedCount: 0,
      })
    }

    const week = weeklyData.get(weekKey)!
    week.activityCount++
    week.completedCount++

    if (a.moodBefore !== undefined && a.moodAfter !== undefined) {
      const currentTotal = week.avgMoodChange * (week.activityCount - 1)
      week.avgMoodChange = (currentTotal + (a.moodAfter - a.moodBefore)) / week.activityCount
    }
  })

  const weeklyTrend = Array.from(weeklyData.values())
    .sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime())
    .slice(-8)
    .map((w) => ({
      ...w,
      avgMoodChange: Math.round(w.avgMoodChange * 10) / 10,
    }))

  const allMoodChanges = activitiesWithMoodData.map((a) => a.moodAfter! - a.moodBefore!)
  const overallAvgMoodChange =
    allMoodChanges.length > 0
      ? Math.round((allMoodChanges.reduce((a, b) => a + b, 0) / allMoodChanges.length) * 10) / 10
      : 0

  const positiveOutcomes = allMoodChanges.filter((c) => c > 0).length
  const positiveOutcomePercentage =
    allMoodChanges.length > 0 ? Math.round((positiveOutcomes / allMoodChanges.length) * 100) : 0

  const allPleasure = completedActivities
    .filter((a) => a.pleasureRating !== undefined)
    .map((a) => a.pleasureRating!)
  const avgPleasure =
    allPleasure.length > 0
      ? Math.round((allPleasure.reduce((a, b) => a + b, 0) / allPleasure.length) * 10) / 10
      : 0

  const allMastery = completedActivities
    .filter((a) => a.masteryRating !== undefined)
    .map((a) => a.masteryRating!)
  const avgMastery =
    allMastery.length > 0
      ? Math.round((allMastery.reduce((a, b) => a + b, 0) / allMastery.length) * 10) / 10
      : 0

  const sortedDates = [...new Set(activities.map((a) => a.date))].sort().reverse()
  let streakDays = 0
  const today = new Date()
  for (let i = 0; i < sortedDates.length; i++) {
    const date = parseISO(sortedDates[i])
    const daysDiff = differenceInDays(today, date)
    if (daysDiff === i || daysDiff === i + 1) {
      streakDays++
    } else {
      break
    }
  }

  const categoryDiversity = categoryBreakdown.length
  const hasPleasure = categoryBreakdown.some(
    (c) => ['leisure', 'creative', 'self-care'].includes(c.category) && c.count > 0
  )
  const hasMastery = categoryBreakdown.some(
    (c) => ['productive', 'physical'].includes(c.category) && c.count > 0
  )
  const hasSocial = categoryBreakdown.some((c) => c.category === 'social' && c.count > 0)
  const hasMeaning = categoryBreakdown.some(
    (c) => ['values-aligned', 'mindfulness'].includes(c.category) && c.count > 0
  )

  let balanceScore = 0
  if (hasPleasure) balanceScore += 25
  if (hasMastery) balanceScore += 25
  if (hasSocial) balanceScore += 25
  if (hasMeaning) balanceScore += 25
  if (categoryDiversity >= 4) balanceScore = Math.min(100, balanceScore + 10)

  const personalInsights: ActivityPatternInsight[] = []

  if (positiveOutcomePercentage >= 70 && activitiesWithMoodData.length >= 5) {
    personalInsights.push({
      type: 'celebration',
      icon: '🎯',
      title: 'Activities are working',
      description: `${positiveOutcomePercentage}% of your tracked activities improved your mood. This is strong evidence that staying active helps you feel better.`,
    })
  }

  if (mostEffectiveCategory && mostEffectiveCategory.avgMoodChange > 0.5) {
    personalInsights.push({
      type: 'pattern',
      icon: mostEffectiveCategory.icon,
      title: `${mostEffectiveCategory.label} activities help most`,
      description: `Your mood improves by an average of ${mostEffectiveCategory.avgMoodChange > 0 ? '+' : ''}${mostEffectiveCategory.avgMoodChange} points after ${mostEffectiveCategory.label.toLowerCase()} activities. Consider scheduling more of these.`,
    })
  }

  if (streakDays >= 3) {
    personalInsights.push({
      type: 'celebration',
      icon: '🔥',
      title: `${streakDays} day streak`,
      description: 'Consistency matters more than perfection. Keep building this momentum.',
    })
  }

  if (leastUsedCategories.length > 0 && completedActivities.length >= 10) {
    const missingLabels = leastUsedCategories
      .map((c) => ACTIVITY_CATEGORIES.find((cat) => cat.id === c)?.label.toLowerCase())
      .filter(Boolean)
      .slice(0, 2)
      .join(' or ')

    personalInsights.push({
      type: 'tip',
      icon: '💡',
      title: 'Expand your activity mix',
      description: `You haven't tried ${missingLabels} activities yet. Research shows variety in activity types leads to more robust mood improvements.`,
    })
  }

  if (balanceScore < 50 && completedActivities.length >= 5) {
    personalInsights.push({
      type: 'tip',
      icon: '⚖️',
      title: 'Balance your activities',
      description:
        'Try mixing pleasure activities (fun) with mastery activities (achievement) and social connection. This combination is most effective.',
    })
  }

  const avgPleasureLow = avgPleasure > 0 && avgPleasure < 4
  const avgMasteryHigh = avgMastery >= 6
  if (avgPleasureLow && avgMasteryHigh && completedActivities.length >= 5) {
    personalInsights.push({
      type: 'warning',
      icon: '⚠️',
      title: 'Low pleasure, high mastery',
      description:
        "You're accomplishing things but not enjoying them. Depression can steal pleasure from activities. Try scheduling something purely for fun.",
    })
  }

  if (weeklyTrend.length >= 4) {
    const recentWeeks = weeklyTrend.slice(-4)
    const avgRecentActivity =
      recentWeeks.reduce((a, b) => a + b.activityCount, 0) / recentWeeks.length
    const firstHalf = recentWeeks.slice(0, 2)
    const secondHalf = recentWeeks.slice(2)
    const firstAvg = firstHalf.reduce((a, b) => a + b.activityCount, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((a, b) => a + b.activityCount, 0) / secondHalf.length

    if (secondAvg > firstAvg * 1.3) {
      personalInsights.push({
        type: 'celebration',
        icon: '📈',
        title: 'Activity level increasing',
        description:
          "You've been more active recently. This upward trend often precedes mood improvement.",
      })
    } else if (secondAvg < firstAvg * 0.7 && avgRecentActivity > 0) {
      personalInsights.push({
        type: 'warning',
        icon: '📉',
        title: 'Activity level dropping',
        description:
          'Your activity has decreased recently. This can be an early sign of the depression cycle. Even small activities help.',
      })
    }
  }

  return {
    totalActivities: activities.length,
    completedActivities: completedActivities.length,
    activitiesWithMoodData: activitiesWithMoodData.length,
    overallAvgMoodChange,
    positiveOutcomePercentage,
    avgPleasure,
    avgMastery,
    mostEffectiveCategory,
    leastUsedCategories,
    categoryBreakdown,
    topMoodBoosters,
    weeklyTrend,
    personalInsights,
    streakDays,
    balanceScore,
  }
}
