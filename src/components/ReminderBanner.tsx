import type { Reminder } from '@/hooks/useReminders'

interface ReminderBannerProps {
  reminder: Reminder | undefined
  onAction?: () => void
  actionLabel?: string
}

export function ReminderBanner({ reminder, onAction, actionLabel }: ReminderBannerProps) {
  if (!reminder) return null

  const bgClasses = {
    high: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50',
    medium: 'bg-sage-50 dark:bg-sage-900/20 border-sage-200 dark:border-sage-800/50',
    low: 'bg-stone-50 dark:bg-stone-800/50 border-stone-200 dark:border-stone-700',
  }

  const iconClasses = {
    high: 'text-amber-500 dark:text-amber-400',
    medium: 'text-sage-600 dark:text-sage-400',
    low: 'text-stone-500 dark:text-stone-400',
  }

  return (
    <div className={`rounded-lg border p-4 mb-6 ${bgClasses[reminder.priority]}`}>
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 mt-0.5 ${iconClasses[reminder.priority]}`}>
          {reminder.isFirstTime ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-stone-700 dark:text-stone-200">
            {reminder.message}
          </p>
          {onAction && actionLabel && (
            <button
              onClick={onAction}
              className="mt-2 text-sm font-medium text-sage-600 dark:text-sage-400 hover:text-sage-700 dark:hover:text-sage-300"
            >
              {actionLabel} →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
