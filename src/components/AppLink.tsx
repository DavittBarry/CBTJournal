import { type ReactNode, type MouseEvent, type AnchorHTMLAttributes } from 'react'
import { useAppStore, type ViewType } from '@/stores/appStore'

interface AppLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick'> {
  to: ViewType
  id?: string
  children: ReactNode
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void
}

/**
 * A link component that supports middle-click to open in new tab
 * while still using SPA navigation for regular clicks.
 */
export function AppLink({ to, id, children, onClick, className, ...props }: AppLinkProps) {
  const {
    setView,
    setSelectedRecordId,
    setSelectedGratitudeId,
    setSelectedMoodCheckId,
    setSelectedChecklistId,
    setSelectedActivityId,
  } = useAppStore()

  // Build the hash URL
  const getHref = () => {
    const routeMap: Partial<Record<ViewType, string>> = {
      home: 'records',
      'thought-detail': id ? `record/${id}` : 'records',
      'new-thought': id ? `new-record/${id}` : 'new-record',
      gratitude: 'gratitude',
      'new-gratitude': id ? `gratitude-entry/${id}` : 'gratitude',
      'mood-check': 'mood',
      'new-mood-check': id ? `mood-entry/${id}` : 'mood',
      activities: 'activities',
      'new-activity': id ? `activity/${id}` : 'activities',
      toolkit: 'toolkit',
      insights: 'insights',
      settings: 'settings',
      checklist: 'checklist',
      'checklist-detail': id ? `checklist-entry/${id}` : 'checklist',
    }
    return `#${routeMap[to] || to}`
  }

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Let middle-click, ctrl+click, cmd+click work naturally (open in new tab)
    if (e.button === 1 || e.ctrlKey || e.metaKey) {
      return
    }

    // Regular click - use SPA navigation
    e.preventDefault()

    // Set the appropriate ID based on view type
    if (id) {
      if (to === 'thought-detail' || to === 'new-thought') {
        setSelectedRecordId(id)
      } else if (to === 'new-gratitude') {
        setSelectedGratitudeId(id)
      } else if (to === 'new-mood-check') {
        setSelectedMoodCheckId(id)
      } else if (to === 'checklist-detail') {
        setSelectedChecklistId(id)
      } else if (to === 'new-activity') {
        setSelectedActivityId(id)
      }
    }

    setView(to)

    if (onClick) {
      onClick(e)
    }
  }

  return (
    <a href={getHref()} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  )
}
