import { useMemo } from 'react'
import { useAppStore } from '@/stores/appStore'

export interface Reminder {
  type: 'mood' | 'records' | 'gratitude' | 'activities' | 'safety-plan'
  priority: 'high' | 'medium' | 'low'
  message: string
  shortMessage: string
  daysSince: number | null
  isFirstTime: boolean
}

interface ReminderConfig {
  type: Reminder['type']
  intervalDays: number
  firstTimeMessage: string
  firstTimeShort: string
  overdueMessage: (days: number) => string
  overdueShort: (days: number) => string
  priority: Reminder['priority']
}

const REMINDER_CONFIGS: ReminderConfig[] = [
  {
    type: 'mood',
    intervalDays: 14,
    firstTimeMessage: 'Complete your first PHQ-9 and GAD-7 assessment to establish a baseline for tracking your mental health over time.',
    firstTimeShort: 'Set your baseline',
    overdueMessage: (days) => `It's been ${days} days since your last mood check. The PHQ-9 and GAD-7 assessments measure symptoms over 2-week periods, so it's time for a new one.`,
    overdueShort: (days) => `${days} days since last check`,
    priority: 'high',
  },
  {
    type: 'records',
    intervalDays: 7,
    firstTimeMessage: 'Start your first thought record to practice identifying and reframing unhelpful thinking patterns.',
    firstTimeShort: 'Get started',
    overdueMessage: (days) => `You haven't logged a thought record in ${days} days. Regular practice helps build cognitive flexibility.`,
    overdueShort: (days) => `${days} days since last entry`,
    priority: 'medium',
  },
  {
    type: 'gratitude',
    intervalDays: 7,
    firstTimeMessage: 'Begin a gratitude practice. Research shows regular gratitude journaling improves wellbeing and sleep quality.',
    firstTimeShort: 'Start practicing',
    overdueMessage: (days) => `It's been ${days} days since your last gratitude entry. Even brief entries can shift your focus toward the positive.`,
    overdueShort: (days) => `${days} days ago`,
    priority: 'low',
  },
  {
    type: 'activities',
    intervalDays: 7,
    firstTimeMessage: 'Start tracking activities to see how they affect your mood. Behavioral activation is one of the most effective depression treatments.',
    firstTimeShort: 'Start tracking',
    overdueMessage: (days) => `No activities logged in ${days} days. Tracking helps you identify which activities lift your mood.`,
    overdueShort: (days) => `${days} days since last log`,
    priority: 'medium',
  },
  {
    type: 'safety-plan',
    intervalDays: 0, // One-time setup, no recurring reminder
    firstTimeMessage: 'Create a safety plan. Having one ready before a crisis makes it easier to use when you need it most.',
    firstTimeShort: 'Create your plan',
    overdueMessage: () => '',
    overdueShort: () => '',
    priority: 'high',
  },
]

function getLatestEntryDate(entries: Array<{ date?: string; createdAt?: string }>): Date | null {
  if (entries.length === 0) return null
  
  const dates = entries.map(e => {
    const dateStr = e.date || e.createdAt
    return dateStr ? new Date(dateStr) : null
  }).filter((d): d is Date => d !== null)
  
  if (dates.length === 0) return null
  
  return dates.reduce((latest, current) => 
    current > latest ? current : latest
  )
}

function getDaysSince(date: Date | null): number | null {
  if (!date) return null
  const now = new Date()
  const diffTime = now.getTime() - date.getTime()
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
}

export function useReminders() {
  const {
    moodChecks,
    thoughtRecords,
    gratitudeEntries,
    activities,
    safetyPlan,
  } = useAppStore()

  const reminders = useMemo(() => {
    const result: Reminder[] = []

    // Mood check reminder (PHQ-9/GAD-7)
    const moodConfig = REMINDER_CONFIGS.find(c => c.type === 'mood')!
    const latestMood = getLatestEntryDate(moodChecks)
    const daysSinceMood = getDaysSince(latestMood)
    
    if (moodChecks.length === 0) {
      result.push({
        type: 'mood',
        priority: moodConfig.priority,
        message: moodConfig.firstTimeMessage,
        shortMessage: moodConfig.firstTimeShort,
        daysSince: null,
        isFirstTime: true,
      })
    } else if (daysSinceMood !== null && daysSinceMood >= moodConfig.intervalDays) {
      result.push({
        type: 'mood',
        priority: moodConfig.priority,
        message: moodConfig.overdueMessage(daysSinceMood),
        shortMessage: moodConfig.overdueShort(daysSinceMood),
        daysSince: daysSinceMood,
        isFirstTime: false,
      })
    }

    // Thought records reminder
    const recordsConfig = REMINDER_CONFIGS.find(c => c.type === 'records')!
    const latestRecord = getLatestEntryDate(thoughtRecords)
    const daysSinceRecord = getDaysSince(latestRecord)
    
    if (thoughtRecords.length === 0) {
      result.push({
        type: 'records',
        priority: recordsConfig.priority,
        message: recordsConfig.firstTimeMessage,
        shortMessage: recordsConfig.firstTimeShort,
        daysSince: null,
        isFirstTime: true,
      })
    } else if (daysSinceRecord !== null && daysSinceRecord >= recordsConfig.intervalDays) {
      result.push({
        type: 'records',
        priority: recordsConfig.priority,
        message: recordsConfig.overdueMessage(daysSinceRecord),
        shortMessage: recordsConfig.overdueShort(daysSinceRecord),
        daysSince: daysSinceRecord,
        isFirstTime: false,
      })
    }

    // Gratitude reminder
    const gratitudeConfig = REMINDER_CONFIGS.find(c => c.type === 'gratitude')!
    const latestGratitude = getLatestEntryDate(gratitudeEntries)
    const daysSinceGratitude = getDaysSince(latestGratitude)
    
    if (gratitudeEntries.length === 0) {
      result.push({
        type: 'gratitude',
        priority: gratitudeConfig.priority,
        message: gratitudeConfig.firstTimeMessage,
        shortMessage: gratitudeConfig.firstTimeShort,
        daysSince: null,
        isFirstTime: true,
      })
    } else if (daysSinceGratitude !== null && daysSinceGratitude >= gratitudeConfig.intervalDays) {
      result.push({
        type: 'gratitude',
        priority: gratitudeConfig.priority,
        message: gratitudeConfig.overdueMessage(daysSinceGratitude),
        shortMessage: gratitudeConfig.overdueShort(daysSinceGratitude),
        daysSince: daysSinceGratitude,
        isFirstTime: false,
      })
    }

    // Activities reminder
    const activitiesConfig = REMINDER_CONFIGS.find(c => c.type === 'activities')!
    const latestActivity = getLatestEntryDate(activities)
    const daysSinceActivity = getDaysSince(latestActivity)
    
    if (activities.length === 0) {
      result.push({
        type: 'activities',
        priority: activitiesConfig.priority,
        message: activitiesConfig.firstTimeMessage,
        shortMessage: activitiesConfig.firstTimeShort,
        daysSince: null,
        isFirstTime: true,
      })
    } else if (daysSinceActivity !== null && daysSinceActivity >= activitiesConfig.intervalDays) {
      result.push({
        type: 'activities',
        priority: activitiesConfig.priority,
        message: activitiesConfig.overdueMessage(daysSinceActivity),
        shortMessage: activitiesConfig.overdueShort(daysSinceActivity),
        daysSince: daysSinceActivity,
        isFirstTime: false,
      })
    }

    // Safety plan reminder (one-time only, no recurring)
    if (!safetyPlan) {
      const safetyConfig = REMINDER_CONFIGS.find(c => c.type === 'safety-plan')!
      result.push({
        type: 'safety-plan',
        priority: safetyConfig.priority,
        message: safetyConfig.firstTimeMessage,
        shortMessage: safetyConfig.firstTimeShort,
        daysSince: null,
        isFirstTime: true,
      })
    }

    return result
  }, [moodChecks, thoughtRecords, gratitudeEntries, activities, safetyPlan])

  const hasReminder = (type: Reminder['type']) => 
    reminders.some(r => r.type === type)

  const getReminder = (type: Reminder['type']) => 
    reminders.find(r => r.type === type)

  // Map nav item IDs to reminder types
  const getNavReminder = (navId: string): Reminder | undefined => {
    const mapping: Record<string, Reminder['type']> = {
      'home': 'records',
      'mood-check': 'mood',
      'gratitude': 'gratitude',
      'activities': 'activities',
      'toolkit': 'safety-plan',
    }
    const reminderType = mapping[navId]
    return reminderType ? getReminder(reminderType) : undefined
  }

  const totalReminders = reminders.length
  const highPriorityCount = reminders.filter(r => r.priority === 'high').length

  return {
    reminders,
    hasReminder,
    getReminder,
    getNavReminder,
    totalReminders,
    highPriorityCount,
  }
}
