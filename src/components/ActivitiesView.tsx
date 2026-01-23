import { useState } from 'react'
import { useAppStore } from '@/stores/appStore'
import { type ActivityEntry, type ActivityCategory, ACTIVITY_CATEGORIES } from '@/types'
import {
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isToday,
  isSameDay,
} from 'date-fns'
import { PageIntro, InfoButton } from '@/components/InfoComponents'
import { AutoExpandTextarea } from '@/components/AutoExpandTextarea'
import { toast } from '@/stores/toastStore'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

interface ActivityFormProps {
  existingActivity?: ActivityEntry
  onSave: (activity: ActivityEntry) => void
  onCancel: () => void
}

function ActivityForm({ existingActivity, onSave, onCancel }: ActivityFormProps) {
  const [activity, setActivity] = useState(existingActivity?.activity || '')
  const [category, setCategory] = useState<ActivityCategory>(existingActivity?.category || 'other')
  const [date, setDate] = useState(existingActivity?.date || format(new Date(), 'yyyy-MM-dd'))
  const [plannedTime, setPlannedTime] = useState(existingActivity?.plannedTime || '')
  const [isPlanned, setIsPlanned] = useState(existingActivity?.isPlanned ?? true)
  const [isCompleted, setIsCompleted] = useState(existingActivity?.isCompleted ?? false)
  const [moodBefore, setMoodBefore] = useState(existingActivity?.moodBefore ?? 5)
  const [moodAfter, setMoodAfter] = useState(existingActivity?.moodAfter ?? 5)
  const [pleasureRating, setPleasureRating] = useState(existingActivity?.pleasureRating ?? 5)
  const [masteryRating, setMasteryRating] = useState(existingActivity?.masteryRating ?? 5)
  const [notes, setNotes] = useState(existingActivity?.notes || '')

  const handleSubmit = (e: React.FormEvent) => {
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
      isPlanned,
      isCompleted,
      moodBefore: isCompleted ? moodBefore : undefined,
      moodAfter: isCompleted ? moodAfter : undefined,
      pleasureRating: isCompleted ? pleasureRating : undefined,
      masteryRating: isCompleted ? masteryRating : undefined,
      notes: notes.trim() || undefined,
    }

    onSave(entry)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card p-5">
        <label className="label">Activity</label>
        <input
          type="text"
          value={activity}
          onChange={(e) => setActivity(e.target.value)}
          placeholder="What activity are you planning or logging?"
          className="input-field"
        />
      </div>

      <div className="card p-5">
        <label className="label">Category</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {ACTIVITY_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={`p-3 rounded-xl border-2 transition-all text-left ${
                category === cat.id
                  ? 'bg-sage-50 dark:bg-sage-900/30 border-sage-400 dark:border-sage-600'
                  : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-600 hover:border-stone-300 dark:hover:border-stone-500'
              }`}
            >
              <div className="text-xl mb-1">{cat.icon}</div>
              <div
                className={`font-medium text-sm ${category === cat.id ? 'text-sage-700 dark:text-sage-400' : 'text-stone-700 dark:text-stone-300'}`}
              >
                {cat.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card p-5">
          <label className="label">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input-field"
          />
        </div>
        <div className="card p-5">
          <label className="label">Time (optional)</label>
          <input
            type="time"
            value={plannedTime}
            onChange={(e) => setPlannedTime(e.target.value)}
            className="input-field"
          />
        </div>
      </div>

      <div className="card p-5">
        <label className="label flex items-center gap-2">
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={(e) => setIsCompleted(e.target.checked)}
            className="rounded border-stone-300 dark:border-stone-600 text-sage-600 focus:ring-sage-500"
          />
          <span>I've completed this activity</span>
        </label>
      </div>

      {isCompleted && (
        <div className="space-y-4 animate-fade-in">
          <div className="card p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="label">
                  Mood before (0-10)
                  <InfoButton
                    title="Rate your mood"
                    content="0 = lowest mood, 10 = best possible mood. Track how activities affect your mood over time."
                  />
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={moodBefore}
                  onChange={(e) => setMoodBefore(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-stone-500 dark:text-stone-400">
                  <span>Low</span>
                  <span className="font-medium">{moodBefore}</span>
                  <span>Great</span>
                </div>
              </div>
              <div>
                <label className="label">Mood after (0-10)</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={moodAfter}
                  onChange={(e) => setMoodAfter(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-stone-500 dark:text-stone-400">
                  <span>Low</span>
                  <span className="font-medium">{moodAfter}</span>
                  <span>Great</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="label">
                  Pleasure (0-10)
                  <InfoButton
                    title="Pleasure rating"
                    content="How enjoyable was this activity? Even small amounts of pleasure matter."
                  />
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={pleasureRating}
                  onChange={(e) => setPleasureRating(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-stone-500 dark:text-stone-400">
                  <span>None</span>
                  <span className="font-medium">{pleasureRating}</span>
                  <span>High</span>
                </div>
              </div>
              <div>
                <label className="label">
                  Mastery (0-10)
                  <InfoButton
                    title="Mastery rating"
                    content="How much sense of accomplishment did you feel? Even small accomplishments count."
                  />
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={masteryRating}
                  onChange={(e) => setMasteryRating(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-stone-500 dark:text-stone-400">
                  <span>None</span>
                  <span className="font-medium">{masteryRating}</span>
                  <span>High</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card p-5">
        <label className="label">Notes (optional)</label>
        <AutoExpandTextarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          minRows={2}
          maxRows={6}
          placeholder="Any observations about how this activity went..."
        />
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">
          Cancel
        </button>
        <button type="submit" className="btn-primary flex-1">
          {existingActivity ? 'Update' : 'Save'} activity
        </button>
      </div>
    </form>
  )
}

export function ActivitiesView() {
  const { activities, addActivity, updateActivity, deleteActivity, setView } = useAppStore()
  const [showForm, setShowForm] = useState(false)
  const [editingActivity, setEditingActivity] = useState<ActivityEntry | undefined>()
  const [selectedDate, setSelectedDate] = useState(new Date())

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const activitiesThisWeek = activities.filter((a) => {
    const activityDate = parseISO(a.date)
    return activityDate >= weekStart && activityDate <= weekEnd
  })

  const getActivitiesForDay = (day: Date) => {
    return activities.filter((a) => isSameDay(parseISO(a.date), day))
  }

  const handleSave = async (activity: ActivityEntry) => {
    if (editingActivity) {
      await updateActivity(activity)
      toast.success('Activity updated')
    } else {
      await addActivity(activity)
      toast.success('Activity saved')
    }
    setShowForm(false)
    setEditingActivity(undefined)
  }

  const handleEdit = (activity: ActivityEntry) => {
    setEditingActivity(activity)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this activity?')) {
      await deleteActivity(id)
      toast.success('Activity deleted')
    }
  }

  const completedCount = activitiesThisWeek.filter((a) => a.isCompleted).length
  const plannedCount = activitiesThisWeek.filter((a) => !a.isCompleted).length

  const avgMoodChange =
    activitiesThisWeek
      .filter((a) => a.isCompleted && a.moodBefore !== undefined && a.moodAfter !== undefined)
      .reduce((sum, a) => sum + ((a.moodAfter || 0) - (a.moodBefore || 0)), 0) /
    (activitiesThisWeek.filter((a) => a.isCompleted && a.moodBefore !== undefined).length || 1)

  if (showForm) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => {
              setShowForm(false)
              setEditingActivity(undefined)
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
          title={editingActivity ? 'Edit activity' : 'New activity'}
          description="Schedule activities that bring pleasure or a sense of accomplishment. Behavioral activation is one of the most effective treatments for depression, with research showing it's as effective as full cognitive therapy."
          centered={false}
        />

        <ActivityForm
          existingActivity={editingActivity}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false)
            setEditingActivity(undefined)
          }}
        />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageIntro
        title="Activity scheduling"
        description="Behavioral activation helps break the cycle of depression by increasing engagement in meaningful activities. Even when you don't feel like it, doing activities often improves mood more than waiting to feel better first."
        centered={false}
      />

      <button onClick={() => setShowForm(true)} className="btn-primary w-full mb-6">
        + Schedule activity
      </button>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card p-4 text-center">
          <div className="text-2xl font-semibold text-sage-600 dark:text-sage-400">
            {completedCount}
          </div>
          <div className="text-xs text-stone-500 dark:text-stone-400">Completed</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-semibold text-amber-600 dark:text-amber-400">
            {plannedCount}
          </div>
          <div className="text-xs text-stone-500 dark:text-stone-400">Planned</div>
        </div>
        <div className="card p-4 text-center">
          <div
            className={`text-2xl font-semibold ${avgMoodChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}
          >
            {avgMoodChange >= 0 ? '+' : ''}
            {avgMoodChange.toFixed(1)}
          </div>
          <div className="text-xs text-stone-500 dark:text-stone-400">Avg mood change</div>
        </div>
      </div>

      <div className="card p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
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
            {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
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

        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day) => {
            const dayActivities = getActivitiesForDay(day)
            const completedToday = dayActivities.filter((a) => a.isCompleted).length
            const plannedToday = dayActivities.filter((a) => !a.isCompleted).length

            return (
              <div
                key={day.toISOString()}
                className={`p-2 rounded-lg text-center ${
                  isToday(day)
                    ? 'bg-sage-100 dark:bg-sage-900/30'
                    : 'bg-stone-50 dark:bg-stone-800/50'
                }`}
              >
                <div className="text-xs text-stone-500 dark:text-stone-400">
                  {format(day, 'EEE')}
                </div>
                <div
                  className={`text-sm font-medium ${isToday(day) ? 'text-sage-700 dark:text-sage-400' : 'text-stone-700 dark:text-stone-300'}`}
                >
                  {format(day, 'd')}
                </div>
                {(completedToday > 0 || plannedToday > 0) && (
                  <div className="flex justify-center gap-1 mt-1">
                    {completedToday > 0 && (
                      <span
                        className="w-2 h-2 rounded-full bg-sage-500"
                        title={`${completedToday} completed`}
                      />
                    )}
                    {plannedToday > 0 && (
                      <span
                        className="w-2 h-2 rounded-full bg-amber-400"
                        title={`${plannedToday} planned`}
                      />
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📅</div>
          <h3 className="text-lg font-medium text-stone-700 dark:text-stone-300 mb-2">
            No activities yet
          </h3>
          <p className="text-stone-500 dark:text-stone-400 text-sm max-w-sm mx-auto">
            Schedule activities that bring you pleasure or a sense of accomplishment. Start small
            and build up gradually.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-stone-600 dark:text-stone-400">This week</h2>
          {activitiesThisWeek.length === 0 ? (
            <p className="text-sm text-stone-500 dark:text-stone-400 py-4 text-center">
              No activities scheduled for this week
            </p>
          ) : (
            activitiesThisWeek.map((activity) => {
              const cat = ACTIVITY_CATEGORIES.find((c) => c.id === activity.category)
              const moodChange =
                activity.isCompleted &&
                activity.moodBefore !== undefined &&
                activity.moodAfter !== undefined
                  ? activity.moodAfter - activity.moodBefore
                  : null

              return (
                <div key={activity.id} className="card p-4 group">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{cat?.icon || '📝'}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3
                            className={`font-medium ${activity.isCompleted ? 'text-stone-700 dark:text-stone-300' : 'text-stone-500 dark:text-stone-400'}`}
                          >
                            {activity.activity}
                          </h3>
                          <div className="text-xs text-stone-500 dark:text-stone-400">
                            {format(parseISO(activity.date), 'EEE, MMM d')}
                            {activity.plannedTime && ` at ${activity.plannedTime}`}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {activity.isCompleted ? (
                            <span className="text-xs font-medium text-sage-600 dark:text-sage-400 bg-sage-50 dark:bg-sage-900/30 px-2 py-0.5 rounded-full">
                              ✓ Done
                            </span>
                          ) : (
                            <span className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                              Planned
                            </span>
                          )}
                          {moodChange !== null && (
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                moodChange > 0
                                  ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30'
                                  : moodChange < 0
                                    ? 'text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/30'
                                    : 'text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800'
                              }`}
                            >
                              {moodChange > 0 ? '+' : ''}
                              {moodChange} mood
                            </span>
                          )}
                        </div>
                      </div>
                      {activity.notes && (
                        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1 line-clamp-2">
                          {activity.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(activity)}
                      className="text-xs text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(activity.id)}
                      className="text-xs text-critical-500 hover:text-critical-600 dark:text-critical-400 dark:hover:text-critical-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      <div className="mt-8 p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl">
        <h3 className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
          About behavioral activation
        </h3>
        <div className="text-xs text-stone-500 dark:text-stone-400 space-y-2">
          <p>
            Behavioral activation (BA) is one of the most effective treatments for depression.
            Meta-analyses show it's as effective as full cognitive therapy, with effect sizes of
            0.69-0.87.
          </p>
          <p>
            The key insight is that <strong>action often comes before motivation</strong>, not
            after. By scheduling and completing activities, even when you don't feel like it, you
            can gradually rebuild positive experiences.
          </p>
          <p>
            Focus on activities that provide <strong>pleasure</strong> (enjoyment) or{' '}
            <strong>mastery</strong> (sense of accomplishment). Both are important for wellbeing.
          </p>
        </div>
      </div>
    </div>
  )
}
