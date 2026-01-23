import { useAppStore } from '@/stores/appStore'
import { format, parseISO } from 'date-fns'
import { getPHQ9Level, getGAD7Level, type MoodCheckEntry } from '@/types'
import { PageIntro } from '@/components/InfoComponents'
import { ReminderBanner } from '@/components/ReminderBanner'
import { useReminders } from '@/hooks/useReminders'
import { AppLink } from '@/components/AppLink'

function MoodCheckCard({ entry }: { entry: MoodCheckEntry }) {
  const phq9Total = entry.phq9Scores
    ? Object.values(entry.phq9Scores).reduce((sum, val) => sum + val, 0)
    : null
  const gad7Total = entry.gad7Scores
    ? Object.values(entry.gad7Scores).reduce((sum, val) => sum + val, 0)
    : null

  const phq9Level = phq9Total !== null ? getPHQ9Level(phq9Total) : null
  const gad7Level = gad7Total !== null ? getGAD7Level(gad7Total) : null

  return (
    <AppLink
      to="new-mood-check"
      id={entry.id}
      className="card p-4 w-full text-left hover:shadow-md transition-shadow block"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="text-sm text-stone-500 dark:text-stone-400">
          {format(parseISO(entry.date), 'EEEE, MMM d, yyyy')}
        </div>
        <div className="flex gap-2">
          {phq9Total !== null && (
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-700 ${phq9Level?.color}`}
            >
              PHQ-9: {phq9Total}
            </span>
          )}
          {gad7Total !== null && (
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-700 ${gad7Level?.color}`}
            >
              GAD-7: {gad7Total}
            </span>
          )}
          {entry.quickMood !== undefined && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300">
              Mood: {entry.quickMood}/10
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {phq9Level && (
          <div>
            <div className="text-xs text-stone-500 dark:text-stone-400 mb-0.5">Depression</div>
            <div className={`text-sm font-medium ${phq9Level.color}`}>{phq9Level.level}</div>
          </div>
        )}
        {gad7Level && (
          <div>
            <div className="text-xs text-stone-500 dark:text-stone-400 mb-0.5">Anxiety</div>
            <div className={`text-sm font-medium ${gad7Level.color}`}>{gad7Level.level}</div>
          </div>
        )}
      </div>

      {entry.notes && (
        <p className="text-sm text-stone-600 dark:text-stone-400 mt-2 line-clamp-2">
          {entry.notes}
        </p>
      )}
    </AppLink>
  )
}

export function MoodCheckView() {
  const { moodChecks, setView, setSelectedMoodCheckId, deleteMoodCheck } = useAppStore()
  const { getReminder } = useReminders()
  const moodReminder = getReminder('mood')

  const handleNewCheck = () => {
    setSelectedMoodCheckId(null)
    setView('new-mood-check')
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Delete this mood check?')) {
      await deleteMoodCheck(id)
    }
  }

  const latestPHQ9 = moodChecks.find((c) => c.phq9Scores)
  const latestGAD7 = moodChecks.find((c) => c.gad7Scores)

  return (
    <div className="max-w-2xl mx-auto">
      <PageIntro
        title="Mood check"
        description="Track your depression and anxiety symptoms using the PHQ-9 and GAD-7, two of the most widely validated clinical questionnaires. Regular tracking helps you and your healthcare providers understand your progress over time."
        centered={false}
      />

      <ReminderBanner
        reminder={moodReminder}
        onAction={handleNewCheck}
        actionLabel="Start assessment"
      />

      <button onClick={handleNewCheck} className="btn-primary w-full mb-6">
        + New mood check
      </button>

      {(latestPHQ9 || latestGAD7) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {latestPHQ9 && latestPHQ9.phq9Scores && (
            <div className="card p-4">
              <div className="text-xs text-stone-500 dark:text-stone-400 mb-1">Latest PHQ-9</div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-stone-800 dark:text-stone-200">
                  {Object.values(latestPHQ9.phq9Scores).reduce((sum, val) => sum + val, 0)}
                </span>
                <span className="text-stone-400 dark:text-stone-500">/27</span>
              </div>
              <div
                className={`text-sm ${getPHQ9Level(Object.values(latestPHQ9.phq9Scores).reduce((sum, val) => sum + val, 0)).color}`}
              >
                {
                  getPHQ9Level(
                    Object.values(latestPHQ9.phq9Scores).reduce((sum, val) => sum + val, 0)
                  ).level
                }
              </div>
              <div className="text-xs text-stone-400 dark:text-stone-500 mt-1">
                {format(parseISO(latestPHQ9.date), 'MMM d, yyyy')}
              </div>
            </div>
          )}
          {latestGAD7 && latestGAD7.gad7Scores && (
            <div className="card p-4">
              <div className="text-xs text-stone-500 dark:text-stone-400 mb-1">Latest GAD-7</div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-stone-800 dark:text-stone-200">
                  {Object.values(latestGAD7.gad7Scores).reduce((sum, val) => sum + val, 0)}
                </span>
                <span className="text-stone-400 dark:text-stone-500">/21</span>
              </div>
              <div
                className={`text-sm ${getGAD7Level(Object.values(latestGAD7.gad7Scores).reduce((sum, val) => sum + val, 0)).color}`}
              >
                {
                  getGAD7Level(
                    Object.values(latestGAD7.gad7Scores).reduce((sum, val) => sum + val, 0)
                  ).level
                }
              </div>
              <div className="text-xs text-stone-400 dark:text-stone-500 mt-1">
                {format(parseISO(latestGAD7.date), 'MMM d, yyyy')}
              </div>
            </div>
          )}
        </div>
      )}

      {moodChecks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-stone-700 dark:text-stone-300 mb-2">
            No mood checks yet
          </h3>
          <p className="text-stone-500 dark:text-stone-400 text-sm max-w-sm mx-auto">
            Complete a PHQ-9 and GAD-7 assessment to track your depression and anxiety symptoms over
            time.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-stone-600 dark:text-stone-400 mb-2">History</h2>
          {moodChecks.map((entry) => (
            <div key={entry.id} className="relative group">
              <MoodCheckCard entry={entry} />
              <button
                onClick={(e) => handleDelete(entry.id, e)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 text-stone-400 hover:text-critical-500 dark:hover:text-critical-400 transition-all"
                title="Delete"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl">
        <h3 className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
          About these assessments
        </h3>
        <div className="text-xs text-stone-500 dark:text-stone-400 space-y-2">
          <p>
            <strong>PHQ-9</strong> (Patient Health Questionnaire-9) is a validated tool for
            screening and measuring depression severity. It has 88% sensitivity and 88% specificity
            against clinical diagnosis.
          </p>
          <p>
            <strong>GAD-7</strong> (Generalized Anxiety Disorder-7) measures anxiety severity and
            also screens effectively for panic disorder, social anxiety, and PTSD.
          </p>
          <p>
            Both questionnaires are free and in the public domain. They're used worldwide by
            healthcare professionals and recommended by clinical guidelines.
          </p>
        </div>
      </div>
    </div>
  )
}
