interface NotificationBadgeProps {
  show: boolean
  priority?: 'high' | 'medium' | 'low'
  className?: string
}

export function NotificationBadge({ show, priority = 'medium', className = '' }: NotificationBadgeProps) {
  if (!show) return null

  const colorClasses = {
    high: 'bg-amber-500',
    medium: 'bg-sage-500',
    low: 'bg-stone-400 dark:bg-stone-500',
  }

  return (
    <span
      className={`absolute top-0 right-0 w-2 h-2 rounded-full ${colorClasses[priority]} ${className}`}
      aria-hidden="true"
    />
  )
}
