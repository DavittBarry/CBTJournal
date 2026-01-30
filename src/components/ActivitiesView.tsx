import { useState, useEffect, useMemo } from 'react'
import { useAppStore } from '@/stores/appStore'
import {
  type ActivityEntry,
  type ActivityCategory,
  type CalendarEventDisplay,
  ACTIVITY_CATEGORIES,
} from '@/types'
import {
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isToday,
  isPast,
  isYesterday,
  isTomorrow,
  startOfDay,
} from 'date-fns'
import { PageIntro, InfoButton } from '@/components/InfoComponents'
import { AutoExpandTextarea } from '@/components/AutoExpandTextarea'
import { toast } from '@/stores/toastStore'
import { useGoogleCalendar, isCalendarConfigured } from '@/hooks/useGoogleCalendar'
import { categorizeActivity } from '@/utils/activityCategorizer'
import {
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from '@/utils/googleCalendar'
import { useGoogleStore } from '@/stores/googleStore'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

interface ActivityFormProps {
  existingActivity?: ActivityEntry
  initialData?: {
    activity?: string
    date?: string
    plannedTime?: string
    suggestedCategory?: ActivityCategory
    googleEventId?: string
  }
  onSave: (activity: ActivityEntry) => void
  onCancel: () => void
  mode?: 'plan' | 'complete' | 'edit'
}

function ActivityForm({
  existingActivity,
  initialData,
  onSave,
  onCancel,
  mode = 'plan',
}: ActivityFormProps) {
  const [activity, setActivity] = useState(
    existingActivity?.activity || initialData?.activity || ''
  )
  const [category, setCategory] = useState<ActivityCategory>(
    existingActivity?.category || initialData?.suggestedCategory || 'other'
  )
  const [hasManuallySetCategory, setHasManuallySetCategory] = useState(false)
  const [date, setDate] = useState(
    existingActivity?.date || initialData?.date || format(new Date(), 'yyyy-MM-dd')
  )
  const [plannedTime, setPlannedTime] = useState(
    existingActivity?.plannedTime || initialData?.plannedTime || ''
  )
  const [isCompleted, setIsCompleted] = useState(
    existingActivity?.isCompleted ?? mode === 'complete'
  )
  const [moodBefore, setMoodBefore] = useState(existingActivity?.moodBefore ?? 5)
  const [moodAfter, setMoodAfter] = useState(existingActivity?.moodAfter ?? 5)
  const [pleasureRating, setPleasureRating] = useState(existingActivity?.pleasureRating ?? 5)
  const [masteryRating, setMasteryRating] = useState(existingActivity?.masteryRating ?? 5)
  const [notes, setNotes] = useState(existingActivity?.notes || '')
  const [syncToCalendar, setSyncToCalendar] = useState(existingActivity?.syncWithCalendar ?? false)

  const { accessToken, calendar } = useGoogleStore()
  const canSyncToCalendar = isCalendarConfigured() && accessToken && calendar

  const handleActivityChange = (value: string) => {
    setActivity(value)
    if (!existingActivity && !initialData?.suggestedCategory && !hasManuallySetCategory) {
      const detectedCategory = categorizeActivity(value)
      if (detectedCategory !== 'other') {
        setCategory(detectedCategory)
      }
    }
  }

  const handleCategoryChange = (newCategory: ActivityCategory) => {
    setCategory(newCategory)
    setHasManuallySetCategory(true)
  }

  const selectedCategory = ACTIVITY_CATEGORIES.find((c) => c.id === category)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!activity.trim()) {
      toast.warning('Please enter an activity')
      return
    }

    const entry: ActivityEntry = {
      id: existingActivity?.id || generateId(),
      date,
      createdAt: existingActivity?.createdAt || new Date().toISOString(),
      activity: activity.trim(),
      category,
      plannedTime: plannedTime || undefined,
      isPlanned: !isCompleted,
      isCompleted,
      moodBefore: isCompleted ? moodBefore : undefined,
      moodAfter: isCompleted ? moodAfter : undefined,
      pleasureRating: isCompleted ? pleasureRating : undefined,
      masteryRating: isCompleted ? masteryRating : undefined,
      notes: notes.trim() || undefined,
      source:
        existingActivity?.source || (initialData?.googleEventId ? 'google-calendar' : 'local'),
      googleCalendarEventId: existingActivity?.googleCalendarEventId || initialData?.googleEventId,
      googleCalendarId: existingActivity?.googleCalendarId || calendar?.selectedCalendarId,
      syncWithCalendar: syncToCalendar,
      lastSyncedAt: existingActivity?.lastSyncedAt,
    }

    if (syncToCalendar && accessToken && calendar) {
      try {
        const startDateTime = plannedTime ? `${date}T${plannedTime}:00` : `${date}T09:00:00`
        const endDateTime = plannedTime
          ? `${date}T${plannedTime
              .split(':')
              .map((v, i) => (i === 0 ? String(parseInt(v) + 1).padStart(2, '0') : v))
              .join(':')}:00`
          : `${date}T10:00:00`

        if (entry.googleCalendarEventId) {
          const result = await updateCalendarEvent(
            accessToken,
            calendar.selectedCalendarId,
            entry.googleCalendarEventId,
            {
              summary: activity.trim(),
              description: notes.trim() || undefined,
              start: { dateTime: startDateTime },
              end: { dateTime: endDateTime },
            }
          )
          if (result.success) {
            entry.lastSyncedAt = new Date().toISOString()
          }
        } else {
          const result = await createCalendarEvent(accessToken, calendar.selectedCalendarId, {
            summary: activity.trim(),
            description: notes.trim() || undefined,
            start: { dateTime: startDateTime },
            end: { dateTime: endDateTime },
          })

          if (result.success && result.event) {
            entry.googleCalendarEventId = result.event.id
            entry.lastSyncedAt = new Date().toISOString()
            toast.success('Added to Google Calendar')
          }
        }
      } catch (error) {
        console.error('Failed to sync to calendar:', error)
      }
    }

    onSave(entry)
  }

  const moodChange = moodAfter - moodBefore

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="card p-5">
        <label className="label">What activity?</label>
        <input
          type="text"
          value={activity}
          onChange={(e) => handleActivityChange(e.target.value)}
          placeholder="e.g., 20 minute walk, coffee with friend"
          className="input-field"
          autoFocus
        />
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-2">
          Tip: Start small. A 5-minute walk counts. The goal is building momentum, not perfection.
        </p>
      </div>

      <div className="card p-5">
        <label className="label">
          Type of activity
          <InfoButton
            title="Activity types and mood"
            content="Different activities serve different psychological needs. Research shows balancing pleasure (enjoyment), mastery (accomplishment), social connection, and meaning creates the most robust improvement in mood."
          />
        </label>
        <div className="grid grid-cols-3 gap-2">
          {ACTIVITY_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryChange(cat.id)}
              className={`p-2.5 rounded-xl border-2 transition-all text-center ${
                category === cat.id
                  ? 'bg-sage-50 dark:bg-sage-900/30 border-sage-400 dark:border-sage-600'
                  : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-600 hover:border-stone-300 dark:hover:border-stone-500'
              }`}
            >
              <div className="text-lg">{cat.icon}</div>
              <div
                className={`text-xs font-medium ${category === cat.id ? 'text-sage-700 dark:text-sage-400' : 'text-stone-600 dark:text-stone-400'}`}
              >
                {cat.label}
              </div>
            </button>
          ))}
        </div>
        {selectedCategory && (
          <div className="mt-3 p-3 bg-stone-50 dark:bg-stone-800/50 rounded-lg">
            <p className="text-xs text-stone-600 dark:text-stone-400">
              <span className="font-medium">{selectedCategory.label}:</span>{' '}
              {selectedCategory.whyItHelps}
            </p>
          </div>
        )}
      </div>

      {mode !== 'complete' && (
        <div className="grid grid-cols-2 gap-3">
          <div className="card p-4">
            <label className="label text-sm">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="card p-4">
            <label className="label text-sm">Time (optional)</label>
            <input
              type="time"
              value={plannedTime}
              onChange={(e) => setPlannedTime(e.target.value)}
              className="input-field"
            />
          </div>
        </div>
      )}

      {mode !== 'complete' && (
        <div className="card p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isCompleted}
              onChange={(e) => setIsCompleted(e.target.checked)}
              className="rounded border-stone-300 dark:border-stone-600 text-sage-600 focus:ring-sage-500 w-5 h-5"
            />
            <span className="text-stone-700 dark:text-stone-300">I've already done this</span>
          </label>
        </div>
      )}

      {isCompleted && (
        <div className="space-y-4 animate-fade-in">
          <div className="card p-5 bg-gradient-to-br from-sage-50 to-white dark:from-sage-900/20 dark:to-stone-800">
            <h3 className="font-medium text-stone-700 dark:text-stone-300 mb-1">
              How did it affect your mood?
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
              This is the key insight: tracking the actual impact helps you learn what works for
              you.
            </p>

            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-stone-600 dark:text-stone-400">Mood before</span>
                  <span className="font-medium text-stone-700 dark:text-stone-300">
                    {moodBefore}/10
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={moodBefore}
                  onChange={(e) => setMoodBefore(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-stone-400 mt-1">
                  <span>Low</span>
                  <span>Great</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-stone-600 dark:text-stone-400">Mood after</span>
                  <span className="font-medium text-stone-700 dark:text-stone-300">
                    {moodAfter}/10
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={moodAfter}
                  onChange={(e) => setMoodAfter(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-stone-400 mt-1">
                  <span>Low</span>
                  <span>Great</span>
                </div>
              </div>

              {moodChange !== 0 && (
                <div
                  className={`text-center py-2.5 rounded-lg font-medium ${
                    moodChange > 0
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                  }`}
                >
                  {moodChange > 0
                    ? `↑ Mood improved by ${moodChange}`
                    : `↓ Mood dropped by ${Math.abs(moodChange)}`}
                </div>
              )}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-medium text-stone-700 dark:text-stone-300 mb-4">
              Rate the experience
            </h3>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">😊</span>
                  <span className="text-sm text-stone-600 dark:text-stone-400">Pleasure</span>
                  <span className="text-sm font-medium text-stone-700 dark:text-stone-300 ml-auto">
                    {pleasureRating}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={pleasureRating}
                  onChange={(e) => setPleasureRating(parseInt(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">How enjoyable?</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">💪</span>
                  <span className="text-sm text-stone-600 dark:text-stone-400">Mastery</span>
                  <span className="text-sm font-medium text-stone-700 dark:text-stone-300 ml-auto">
                    {masteryRating}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={masteryRating}
                  onChange={(e) => setMasteryRating(parseInt(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
                  Sense of achievement?
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card p-4">
        <label className="label text-sm">Notes (optional)</label>
        <AutoExpandTextarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          minRows={2}
          maxRows={4}
          placeholder="Any observations..."
        />
      </div>

      {canSyncToCalendar && (
        <div className="card p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={syncToCalendar}
              onChange={(e) => setSyncToCalendar(e.target.checked)}
              className="rounded border-stone-300 dark:border-stone-600 text-sage-600 focus:ring-sage-500 w-5 h-5"
            />
            <div>
              <span className="text-stone-700 dark:text-stone-300">
                {existingActivity?.googleCalendarEventId
                  ? 'Update in Google Calendar'
                  : 'Add to Google Calendar'}
              </span>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {existingActivity?.googleCalendarEventId
                  ? 'Sync changes back to your calendar'
                  : 'Create a calendar event for this activity'}
              </p>
            </div>
          </label>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">
          Cancel
        </button>
        <button type="submit" className="btn-primary flex-1">
          {existingActivity ? 'Update' : isCompleted ? 'Log activity' : 'Plan activity'}
        </button>
      </div>
    </form>
  )
}

interface QuickCompleteModalProps {
  activity: ActivityEntry
  onSave: (
    activity: ActivityEntry,
    options?: { removeAfter?: boolean; deleteFromCalendar?: boolean }
  ) => void
  onCancel: () => void
}

function QuickCompleteModal({ activity, onSave, onCancel }: QuickCompleteModalProps) {
  const [moodBefore, setMoodBefore] = useState(5)
  const [moodAfter, setMoodAfter] = useState(5)
  const [pleasureRating, setPleasureRating] = useState(5)
  const [masteryRating, setMasteryRating] = useState(5)
  const [removeAfterLogging, setRemoveAfterLogging] = useState(false)
  const [deleteFromCalendar, setDeleteFromCalendar] = useState(false)

  const hasCalendarLink = !!activity.googleCalendarEventId

  const handleSave = () => {
    const updated: ActivityEntry = {
      ...activity,
      isCompleted: true,
      completedTime: format(new Date(), 'HH:mm'),
      moodBefore,
      moodAfter,
      pleasureRating,
      masteryRating,
    }
    onSave(updated, { removeAfter: removeAfterLogging, deleteFromCalendar })
  }

  const moodChange = moodAfter - moodBefore
  const cat = ACTIVITY_CATEGORIES.find((c) => c.id === activity.category)

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white dark:bg-stone-800 rounded-2xl max-w-md w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-5">
          <div className="text-4xl mb-2">{cat?.icon || '✓'}</div>
          <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100">
            {activity.activity}
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            How did this affect you?
          </p>
        </div>

        <div className="space-y-4 mb-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-stone-600 dark:text-stone-400 mb-1 block">
                Mood before
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={moodBefore}
                onChange={(e) => setMoodBefore(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="text-center text-sm font-medium text-stone-700 dark:text-stone-300">
                {moodBefore}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-stone-600 dark:text-stone-400 mb-1 block">
                Mood after
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={moodAfter}
                onChange={(e) => setMoodAfter(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="text-center text-sm font-medium text-stone-700 dark:text-stone-300">
                {moodAfter}
              </div>
            </div>
          </div>

          {moodChange !== 0 && (
            <div
              className={`text-center text-sm font-medium py-2 rounded-lg ${
                moodChange > 0
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                  : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
              }`}
            >
              {moodChange > 0 ? `↑ +${moodChange}` : `↓ ${moodChange}`}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-stone-600 dark:text-stone-400 mb-1 block">
                😊 Pleasure
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={pleasureRating}
                onChange={(e) => setPleasureRating(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="text-center text-sm font-medium text-stone-700 dark:text-stone-300">
                {pleasureRating}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-stone-600 dark:text-stone-400 mb-1 block">
                💪 Mastery
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={masteryRating}
                onChange={(e) => setMasteryRating(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="text-center text-sm font-medium text-stone-700 dark:text-stone-300">
                {masteryRating}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-5 pt-4 border-t border-stone-200 dark:border-stone-700">
          <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-700/50">
            <input
              type="checkbox"
              checked={removeAfterLogging}
              onChange={(e) => setRemoveAfterLogging(e.target.checked)}
              className="rounded border-stone-300 dark:border-stone-600 text-sage-600 focus:ring-sage-500"
            />
            <div>
              <span className="text-sm text-stone-700 dark:text-stone-300">
                Hide from Activities
              </span>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Still visible in Insights
              </p>
            </div>
          </label>

          {hasCalendarLink && (
            <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-700/50">
              <input
                type="checkbox"
                checked={deleteFromCalendar}
                onChange={(e) => setDeleteFromCalendar(e.target.checked)}
                className="rounded border-stone-300 dark:border-stone-600 text-critical-600 focus:ring-critical-500"
              />
              <div>
                <span className="text-sm text-stone-700 dark:text-stone-300">
                  Delete from Google Calendar
                </span>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Also remove the calendar event
                </p>
              </div>
            </label>
          )}
        </div>

        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1">
            Cancel
          </button>
          <button onClick={handleSave} className="btn-primary flex-1">
            ✓ Done
          </button>
        </div>
      </div>
    </div>
  )
}

interface ImportModalProps {
  events: CalendarEventDisplay[]
  onImport: (events: Array<{ event: CalendarEventDisplay; category: ActivityCategory }>) => void
  onCancel: () => void
}

interface EventGroup {
  title: string
  normalizedTitle: string
  events: CalendarEventDisplay[]
  category: ActivityCategory
  selected: boolean
}

function normalizeTitle(title: string): string {
  return title.toLowerCase().trim().replace(/\s+/g, ' ')
}

function ImportModal({ events, onImport, onCancel }: ImportModalProps) {
  const [eventGroups, setEventGroups] = useState<EventGroup[]>(() => {
    const groupMap = new Map<string, CalendarEventDisplay[]>()

    events.forEach((event) => {
      const key = normalizeTitle(event.title)
      if (!groupMap.has(key)) {
        groupMap.set(key, [])
      }
      groupMap.get(key)!.push(event)
    })

    return Array.from(groupMap.entries()).map(([normalizedTitle, groupEvents]) => ({
      title: groupEvents[0].title,
      normalizedTitle,
      events: groupEvents.sort((a, b) => a.date.localeCompare(b.date)),
      category: categorizeActivity(groupEvents[0].title, groupEvents[0].description),
      selected: true,
    }))
  })

  const toggleGroup = (normalizedTitle: string) => {
    setEventGroups((prev) =>
      prev.map((g) => (g.normalizedTitle === normalizedTitle ? { ...g, selected: !g.selected } : g))
    )
  }

  const changeGroupCategory = (normalizedTitle: string, category: ActivityCategory) => {
    setEventGroups((prev) =>
      prev.map((g) => (g.normalizedTitle === normalizedTitle ? { ...g, category } : g))
    )
  }

  const selectAll = () => {
    setEventGroups((prev) => prev.map((g) => ({ ...g, selected: true })))
  }

  const selectNone = () => {
    setEventGroups((prev) => prev.map((g) => ({ ...g, selected: false })))
  }

  const selectedGroups = eventGroups.filter((g) => g.selected)
  const selectedEventCount = selectedGroups.reduce((sum, g) => sum + g.events.length, 0)

  const handleImport = () => {
    const toImport: Array<{ event: CalendarEventDisplay; category: ActivityCategory }> = []

    selectedGroups.forEach((group) => {
      group.events.forEach((event) => {
        toImport.push({
          event,
          category: group.category,
        })
      })
    })

    onImport(toImport)
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white dark:bg-stone-800 rounded-2xl max-w-lg w-full max-h-[80vh] flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-stone-200 dark:border-stone-700">
          <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100">
            Import calendar events
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Multi-day events are grouped together. Select a group to import all its days.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={selectAll}
              className="text-xs text-sage-600 dark:text-sage-400 hover:text-sage-700 dark:hover:text-sage-300 font-medium"
            >
              Select all
            </button>
            <span className="text-stone-300 dark:text-stone-600">|</span>
            <button
              onClick={selectNone}
              className="text-xs text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 font-medium"
            >
              Select none
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {eventGroups.map((group) => {
            const isMultiDay = group.events.length > 1
            const firstDate = group.events[0].date
            const lastDate = group.events[group.events.length - 1].date

            return (
              <div
                key={group.normalizedTitle}
                className={`p-3 rounded-xl border-2 transition-colors ${
                  group.selected
                    ? 'border-sage-400 dark:border-sage-600 bg-sage-50/50 dark:bg-sage-900/20'
                    : 'border-stone-200 dark:border-stone-700 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={group.selected}
                    onChange={() => toggleGroup(group.normalizedTitle)}
                    className="mt-1 rounded border-stone-300 dark:border-stone-600 text-sage-600 focus:ring-sage-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-stone-700 dark:text-stone-300 text-sm">
                      {group.title}
                    </div>
                    <div className="text-xs text-stone-500 dark:text-stone-400">
                      {isMultiDay ? (
                        <span className="flex items-center gap-1">
                          <span className="text-purple-500 dark:text-purple-400 font-medium">
                            {group.events.length} days
                          </span>
                          <span>·</span>
                          <span>
                            {format(parseISO(firstDate), 'MMM d')} –{' '}
                            {format(parseISO(lastDate), 'MMM d')}
                          </span>
                        </span>
                      ) : (
                        <span>
                          {format(parseISO(firstDate), 'EEE, MMM d')}
                          {group.events[0].startTime && ` at ${group.events[0].startTime}`}
                        </span>
                      )}
                    </div>
                  </div>
                  <select
                    value={group.category}
                    onChange={(e) =>
                      changeGroupCategory(group.normalizedTitle, e.target.value as ActivityCategory)
                    }
                    disabled={!group.selected}
                    className="text-xs bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-lg px-2 py-1"
                  >
                    {ACTIVITY_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )
          })}
        </div>

        <div className="p-4 border-t border-stone-200 dark:border-stone-700 flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1">
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={selectedEventCount === 0}
            className="btn-primary flex-1"
          >
            Import {selectedEventCount} event{selectedEventCount !== 1 ? 's' : ''}
            {selectedGroups.length > 0 && selectedGroups.length < eventGroups.length && (
              <span className="text-sage-200 ml-1">({selectedGroups.length} groups)</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

interface DayItem {
  type: 'activity' | 'calendar'
  data: ActivityEntry | CalendarEventDisplay
  time?: string
}

interface DaySectionProps {
  date: Date
  items: DayItem[]
  isExpanded: boolean
  onToggle: () => void
  onCompleteActivity: (activity: ActivityEntry) => void
  onEditActivity: (activity: ActivityEntry) => void
  onDeleteActivity: (id: string) => void
  onTrackCalendarEvent: (event: CalendarEventDisplay) => void
}

function DaySection({
  date,
  items,
  isExpanded,
  onToggle,
  onCompleteActivity,
  onEditActivity,
  onDeleteActivity,
  onTrackCalendarEvent,
}: DaySectionProps) {
  const today = isToday(date)
  const yesterday = isYesterday(date)
  const tomorrow = isTomorrow(date)
  const past = isPast(startOfDay(date)) && !today

  const completedCount = items.filter(
    (i) => i.type === 'activity' && (i.data as ActivityEntry).isCompleted
  ).length
  const totalActivities = items.filter((i) => i.type === 'activity').length
  const calendarCount = items.filter((i) => i.type === 'calendar').length

  const getDayLabel = () => {
    if (today) return 'Today'
    if (yesterday) return 'Yesterday'
    if (tomorrow) return 'Tomorrow'
    return format(date, 'EEEE')
  }

  const sortedItems = [...items].sort((a, b) => {
    const timeA = a.time || '99:99'
    const timeB = b.time || '99:99'
    return timeA.localeCompare(timeB)
  })

  return (
    <div
      className={`rounded-xl overflow-hidden ${today ? 'ring-2 ring-sage-400 dark:ring-sage-600' : ''}`}
    >
      <button
        onClick={onToggle}
        className={`w-full p-4 flex items-center justify-between transition-colors ${
          today
            ? 'bg-sage-100 dark:bg-sage-900/40'
            : past
              ? 'bg-stone-100 dark:bg-stone-800/50'
              : 'bg-stone-50 dark:bg-stone-800/30'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`text-2xl font-bold ${today ? 'text-sage-700 dark:text-sage-400' : 'text-stone-400 dark:text-stone-500'}`}
          >
            {format(date, 'd')}
          </div>
          <div>
            <div
              className={`font-medium ${today ? 'text-sage-800 dark:text-sage-300' : 'text-stone-700 dark:text-stone-300'}`}
            >
              {getDayLabel()}
            </div>
            <div className="text-xs text-stone-500 dark:text-stone-400">
              {format(date, 'MMM d')}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {totalActivities > 0 && (
            <div className="flex items-center gap-1">
              {completedCount === totalActivities ? (
                <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                  ✓ All done
                </span>
              ) : (
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  {completedCount}/{totalActivities} tracked
                </span>
              )}
            </div>
          )}
          {calendarCount > 0 && (
            <span className="text-xs text-blue-600 dark:text-blue-400">📅 {calendarCount}</span>
          )}
          <svg
            className={`w-5 h-5 text-stone-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </button>

      {isExpanded && (
        <div className="bg-white dark:bg-stone-900/50 divide-y divide-stone-100 dark:divide-stone-800">
          {sortedItems.length === 0 ? (
            <div className="p-4 text-center text-sm text-stone-400 dark:text-stone-500">
              {today
                ? 'Nothing tracked yet. What could you do that might help your mood?'
                : 'Nothing scheduled'}
            </div>
          ) : (
            sortedItems.map((item) => {
              if (item.type === 'calendar') {
                const event = item.data as CalendarEventDisplay
                return (
                  <div
                    key={event.id}
                    className="p-4 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => onTrackCalendarEvent(event)}
                        className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 flex items-center justify-center text-lg flex-shrink-0 transition-colors border-2 border-dashed border-blue-300 dark:border-blue-700"
                        title="Track this event"
                      >
                        📅
                      </button>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-stone-700 dark:text-stone-300">
                          {event.title}
                        </h4>
                        <div className="text-xs text-stone-500 dark:text-stone-400">
                          {event.isAllDay
                            ? 'All day'
                            : `${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''}`}
                          {event.isMultiDay && event.multiDayInfo && (
                            <span className="text-purple-500 dark:text-purple-400 ml-2">
                              · {event.multiDayInfo}
                            </span>
                          )}
                          <span className="text-blue-500 dark:text-blue-400 ml-2">
                            Calendar event
                          </span>
                        </div>
                        <button
                          onClick={() => onTrackCalendarEvent(event)}
                          className="text-xs text-sage-600 dark:text-sage-400 hover:text-sage-700 dark:hover:text-sage-300 font-medium mt-1"
                        >
                          + Track how it affected you
                        </button>
                      </div>
                    </div>
                  </div>
                )
              }

              const activity = item.data as ActivityEntry
              const cat = ACTIVITY_CATEGORIES.find((c) => c.id === activity.category)
              const moodChange =
                activity.isCompleted &&
                activity.moodBefore !== undefined &&
                activity.moodAfter !== undefined
                  ? activity.moodAfter - activity.moodBefore
                  : null

              return (
                <div
                  key={activity.id}
                  className={`p-4 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors ${
                    activity.isCompleted ? 'bg-green-50/30 dark:bg-green-900/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {activity.isCompleted ? (
                      <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => onCompleteActivity(activity)}
                        className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-sage-100 dark:hover:bg-sage-900/30 flex items-center justify-center text-lg flex-shrink-0 transition-colors border-2 border-dashed border-stone-300 dark:border-stone-600 hover:border-sage-400 dark:hover:border-sage-600"
                        title="Mark as complete"
                      >
                        {cat?.icon || '📝'}
                      </button>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4
                            className={`font-medium ${activity.isCompleted ? 'text-green-700 dark:text-green-400' : 'text-stone-700 dark:text-stone-300'}`}
                          >
                            {activity.activity}
                          </h4>
                          <div className="text-xs text-stone-500 dark:text-stone-400 flex flex-wrap items-center gap-2">
                            <span>
                              {cat?.icon} {cat?.label}
                            </span>
                            {activity.plannedTime && <span>· {activity.plannedTime}</span>}
                            {activity.googleCalendarEventId && (
                              <span className="text-blue-500">· From calendar</span>
                            )}
                          </div>
                        </div>
                        {moodChange !== null && (
                          <span
                            className={`text-xs font-bold px-2 py-1 rounded-full ${
                              moodChange > 0
                                ? 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30'
                                : moodChange < 0
                                  ? 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30'
                                  : 'text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800'
                            }`}
                          >
                            {moodChange > 0 ? '+' : ''}
                            {moodChange}
                          </span>
                        )}
                      </div>

                      {activity.isCompleted &&
                        (activity.pleasureRating !== undefined ||
                          activity.masteryRating !== undefined) && (
                          <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-stone-500 dark:text-stone-400">
                            {activity.pleasureRating !== undefined && (
                              <span>😊 {activity.pleasureRating}</span>
                            )}
                            {activity.masteryRating !== undefined && (
                              <span>💪 {activity.masteryRating}</span>
                            )}
                          </div>
                        )}

                      <div className="flex items-center gap-3 mt-2">
                        {!activity.isCompleted && (
                          <button
                            onClick={() => onCompleteActivity(activity)}
                            className="text-xs text-sage-600 dark:text-sage-400 hover:text-sage-700 dark:hover:text-sage-300 font-medium"
                          >
                            ✓ Complete
                          </button>
                        )}
                        <button
                          onClick={() => onEditActivity(activity)}
                          className="text-xs text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDeleteActivity(activity.id)}
                          className="text-xs text-critical-500 hover:text-critical-600 dark:text-critical-400 dark:hover:text-critical-300"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

function CalendarConnectionBanner() {
  const {
    isConfigured,
    isConnected,
    isConnecting,
    isSyncing,
    connection,
    connect,
    disconnect,
    fetchEvents,
    showCalendarEvents,
    setShowCalendarEvents,
  } = useGoogleCalendar()

  if (!isConfigured) {
    return null
  }

  if (!isConnected) {
    return (
      <div className="card p-4 mb-5 border-l-4 border-blue-400">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-medium text-stone-700 dark:text-stone-300">Google Calendar</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Import events and track how they affect your mood
            </p>
          </div>
          <button
            onClick={connect}
            disabled={isConnecting}
            className="btn-secondary text-sm whitespace-nowrap"
          >
            {isConnecting ? 'Connecting...' : 'Connect'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-3 mb-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">📅</span>
          <span className="text-sm text-stone-600 dark:text-stone-400">
            {connection?.selectedCalendarName}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 cursor-pointer">
            <input
              type="checkbox"
              checked={showCalendarEvents}
              onChange={(e) => setShowCalendarEvents(e.target.checked)}
              className="rounded border-stone-300 dark:border-stone-600 text-sage-600 focus:ring-sage-500"
            />
            Show
          </label>
          <button
            onClick={() => {
              const now = new Date()
              const weekStart = startOfWeek(now, { weekStartsOn: 1 })
              const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
              fetchEvents(weekStart, weekEnd)
            }}
            disabled={isSyncing}
            className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            title="Refresh"
          >
            <svg
              className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
            </svg>
          </button>
          <button onClick={disconnect} className="text-xs text-stone-400 hover:text-critical-500">
            Disconnect
          </button>
        </div>
      </div>
    </div>
  )
}

export function ActivitiesView() {
  const { activities, addActivity, updateActivity, deleteActivity } = useAppStore()
  const [showForm, setShowForm] = useState(false)
  const [formMode, setFormMode] = useState<'plan' | 'complete' | 'edit'>('plan')
  const [editingActivity, setEditingActivity] = useState<ActivityEntry | undefined>()
  const [completingActivity, setCompletingActivity] = useState<ActivityEntry | null>(null)
  const [trackingCalendarEvent, setTrackingCalendarEvent] = useState<CalendarEventDisplay | null>(
    null
  )
  const [showImportModal, setShowImportModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [expandedDays, setExpandedDays] = useState<Set<string>>(
    new Set([format(new Date(), 'yyyy-MM-dd')])
  )

  const { isConnected, calendarEvents, fetchEvents, showCalendarEvents } = useGoogleCalendar()

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  useEffect(() => {
    if (isConnected && showCalendarEvents) {
      fetchEvents(weekStart, weekEnd)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, showCalendarEvents, weekStart.toISOString(), weekEnd.toISOString()])

  useEffect(() => {
    setExpandedDays(new Set([format(new Date(), 'yyyy-MM-dd')]))
  }, [])

  const itemsByDay = useMemo(() => {
    const map = new Map<string, DayItem[]>()

    weekDays.forEach((day) => {
      const dateKey = format(day, 'yyyy-MM-dd')
      const dayItems: DayItem[] = []

      activities
        .filter((a) => a.date === dateKey && !a.hiddenFromActivities)
        .forEach((activity) => {
          dayItems.push({
            type: 'activity',
            data: activity,
            time: activity.plannedTime,
          })
        })

      if (showCalendarEvents) {
        const trackedEventIds = new Set(
          activities.filter((a) => a.googleCalendarEventId).map((a) => a.googleCalendarEventId)
        )

        calendarEvents
          .filter((e) => e.date === dateKey && !trackedEventIds.has(e.googleEventId))
          .forEach((event) => {
            dayItems.push({
              type: 'calendar',
              data: event,
              time: event.startTime,
            })
          })
      }

      map.set(dateKey, dayItems)
    })

    return map
  }, [activities, calendarEvents, showCalendarEvents, weekDays])

  const unimportedCalendarEvents = useMemo(() => {
    if (!showCalendarEvents) return []

    const trackedEventIds = new Set(
      activities.filter((a) => a.googleCalendarEventId).map((a) => a.googleCalendarEventId)
    )

    return calendarEvents.filter(
      (e) =>
        !trackedEventIds.has(e.googleEventId) &&
        parseISO(e.date) >= weekStart &&
        parseISO(e.date) <= weekEnd
    )
  }, [activities, calendarEvents, showCalendarEvents, weekStart, weekEnd])

  const weekStats = useMemo(() => {
    let completed = 0
    let planned = 0
    let totalMoodChange = 0
    let moodChangeCount = 0

    activities.forEach((a) => {
      const activityDate = parseISO(a.date)
      if (activityDate >= weekStart && activityDate <= weekEnd) {
        if (a.isCompleted) {
          completed++
          if (a.moodBefore !== undefined && a.moodAfter !== undefined) {
            totalMoodChange += a.moodAfter - a.moodBefore
            moodChangeCount++
          }
        } else {
          planned++
        }
      }
    })

    return {
      completed,
      planned,
      avgMoodChange: moodChangeCount > 0 ? totalMoodChange / moodChangeCount : 0,
    }
  }, [activities, weekStart, weekEnd])

  const toggleDay = (dateKey: string) => {
    setExpandedDays((prev) => {
      const next = new Set(prev)
      if (next.has(dateKey)) {
        next.delete(dateKey)
      } else {
        next.add(dateKey)
      }
      return next
    })
  }

  const handleSave = async (activity: ActivityEntry) => {
    if (editingActivity) {
      await updateActivity(activity)
      toast.success('Activity updated')
    } else {
      await addActivity(activity)
      toast.success(activity.isCompleted ? 'Activity logged' : 'Activity planned')
    }
    setShowForm(false)
    setEditingActivity(undefined)
    setTrackingCalendarEvent(null)
  }

  const handleCompleteActivity = (activity: ActivityEntry) => {
    setCompletingActivity(activity)
  }

  const handleQuickComplete = async (
    activity: ActivityEntry,
    options?: { removeAfter?: boolean; deleteFromCalendar?: boolean }
  ) => {
    const { accessToken, calendar } = useGoogleStore.getState()

    const updatedActivity = { ...activity }

    if (options?.removeAfter) {
      updatedActivity.hiddenFromActivities = true
    }

    await updateActivity(updatedActivity)

    if (options?.deleteFromCalendar && activity.googleCalendarEventId && accessToken && calendar) {
      try {
        await deleteCalendarEvent(
          accessToken,
          calendar.selectedCalendarId,
          activity.googleCalendarEventId
        )
        toast.success('Deleted from Google Calendar')
      } catch (error) {
        console.error('Failed to delete from calendar:', error)
        toast.error('Failed to delete from calendar')
      }
    }

    if (options?.removeAfter) {
      toast.success('Logged and hidden from Activities')
    } else {
      toast.success('✓ Completed!')
    }

    setCompletingActivity(null)
  }

  const handleEdit = (activity: ActivityEntry) => {
    setEditingActivity(activity)
    setFormMode('edit')
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this activity?')) {
      await deleteActivity(id)
      toast.success('Activity deleted')
    }
  }

  const handleTrackCalendarEvent = (event: CalendarEventDisplay) => {
    setTrackingCalendarEvent(event)
    setFormMode('complete')
    setShowForm(true)
  }

  const handleImport = async (
    items: Array<{ event: CalendarEventDisplay; category: ActivityCategory }>
  ) => {
    for (const item of items) {
      const activity: ActivityEntry = {
        id: generateId(),
        date: item.event.date,
        createdAt: new Date().toISOString(),
        activity: item.event.title,
        category: item.category,
        plannedTime: item.event.startTime,
        isPlanned: true,
        isCompleted: false,
        source: 'google-calendar',
        googleCalendarEventId: item.event.googleEventId,
      }
      await addActivity(activity)
    }
    toast.success(`Imported ${items.length} event${items.length !== 1 ? 's' : ''}`)
    setShowImportModal(false)
  }

  if (showForm) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => {
              setShowForm(false)
              setEditingActivity(undefined)
              setTrackingCalendarEvent(null)
            }}
            className="text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 flex items-center gap-1"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>

        <PageIntro
          title={
            editingActivity
              ? 'Edit activity'
              : trackingCalendarEvent
                ? 'Track calendar event'
                : formMode === 'complete'
                  ? 'Log completed activity'
                  : 'Plan an activity'
          }
          description={
            trackingCalendarEvent
              ? "Record how this event affected you. Over time, you'll learn which activities actually improve your mood."
              : formMode === 'complete'
                ? 'Log something you did and rate how it affected you. This builds your personal evidence base.'
                : 'Planning activities increases follow-through. Pick something achievable, even small.'
          }
          centered={false}
        />

        <ActivityForm
          existingActivity={editingActivity}
          initialData={
            trackingCalendarEvent
              ? {
                  activity: trackingCalendarEvent.title,
                  date: trackingCalendarEvent.date,
                  plannedTime: trackingCalendarEvent.startTime,
                  suggestedCategory: categorizeActivity(
                    trackingCalendarEvent.title,
                    trackingCalendarEvent.description
                  ),
                  googleEventId: trackingCalendarEvent.googleEventId,
                }
              : undefined
          }
          mode={formMode}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false)
            setEditingActivity(undefined)
            setTrackingCalendarEvent(null)
          }}
        />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageIntro
        title="Activity tracking"
        description="Track what you do and how it affects you. Build evidence of what actually helps."
        centered={false}
      />

      <CalendarConnectionBanner />

      {activities.length === 0 && (
        <div className="card p-5 mb-5 bg-gradient-to-br from-sage-50 to-white dark:from-sage-900/20 dark:to-stone-800 border-l-4 border-sage-400">
          <h3 className="font-medium text-stone-700 dark:text-stone-300 mb-2">
            Get started with activity tracking
          </h3>
          <p className="text-sm text-stone-600 dark:text-stone-400 mb-3">
            The key insight from behavioral activation research: tracking how activities affect your
            mood helps you discover what actually works for you. Calendar events show your schedule,
            but tracking adds the data that matters.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setFormMode('complete')
                setShowForm(true)
              }}
              className="btn-primary text-sm"
            >
              Log something you did
            </button>
            {unimportedCalendarEvents.length > 0 && (
              <button onClick={() => setShowImportModal(true)} className="btn-secondary text-sm">
                Import {unimportedCalendarEvents.length} calendar events
              </button>
            )}
          </div>
        </div>
      )}

      {activities.length > 0 && (
        <>
          <div className="flex gap-2 mb-5">
            <button
              onClick={() => {
                setFormMode('plan')
                setShowForm(true)
              }}
              className="btn-secondary flex-1"
            >
              + Plan
            </button>
            <button
              onClick={() => {
                setFormMode('complete')
                setShowForm(true)
              }}
              className="btn-primary flex-1"
            >
              + Log completed
            </button>
          </div>

          {unimportedCalendarEvents.length > 0 && (
            <button
              onClick={() => setShowImportModal(true)}
              className="w-full mb-5 p-3 rounded-xl border-2 border-dashed border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-sm font-medium"
            >
              📅 Import {unimportedCalendarEvents.length} calendar event
              {unimportedCalendarEvents.length !== 1 ? 's' : ''} for tracking
            </button>
          )}

          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="card p-3 text-center">
              <div className="text-xl font-bold text-green-600 dark:text-green-400">
                {weekStats.completed}
              </div>
              <div className="text-xs text-stone-500 dark:text-stone-400">Tracked</div>
            </div>
            <div className="card p-3 text-center">
              <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
                {weekStats.planned}
              </div>
              <div className="text-xs text-stone-500 dark:text-stone-400">Planned</div>
            </div>
            <div className="card p-3 text-center">
              <div
                className={`text-xl font-bold ${weekStats.avgMoodChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}
              >
                {weekStats.avgMoodChange >= 0 ? '+' : ''}
                {weekStats.avgMoodChange.toFixed(1)}
              </div>
              <div className="text-xs text-stone-500 dark:text-stone-400">Mood Δ</div>
            </div>
          </div>
        </>
      )}

      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() =>
            setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() - 7)))
          }
          className="p-2 text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h2 className="text-sm font-medium text-stone-700 dark:text-stone-300">
          {format(weekStart, 'MMM d')} – {format(weekEnd, 'MMM d')}
        </h2>
        <button
          onClick={() =>
            setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() + 7)))
          }
          className="p-2 text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <div className="space-y-2">
        {weekDays.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd')
          const items = itemsByDay.get(dateKey) || []

          return (
            <DaySection
              key={dateKey}
              date={day}
              items={items}
              isExpanded={expandedDays.has(dateKey)}
              onToggle={() => toggleDay(dateKey)}
              onCompleteActivity={handleCompleteActivity}
              onEditActivity={handleEdit}
              onDeleteActivity={handleDelete}
              onTrackCalendarEvent={handleTrackCalendarEvent}
            />
          )
        })}
      </div>

      {completingActivity && (
        <QuickCompleteModal
          activity={completingActivity}
          onSave={handleQuickComplete}
          onCancel={() => setCompletingActivity(null)}
        />
      )}

      {showImportModal && (
        <ImportModal
          events={unimportedCalendarEvents}
          onImport={handleImport}
          onCancel={() => setShowImportModal(false)}
        />
      )}

      <div className="mt-8 p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl">
        <h3 className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">The science</h3>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Behavioral activation is as effective as antidepressants for mild-to-moderate depression
          (Cuijpers et al., 2007). The mechanism:{' '}
          <strong className="text-stone-600 dark:text-stone-300">
            tracking what you do and how it affects you
          </strong>{' '}
          builds personal evidence that breaks the cycle of inactivity → low mood → more inactivity.
        </p>
      </div>
    </div>
  )
}
