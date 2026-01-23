import { type ReactNode, type MouseEvent, type AnchorHTMLAttributes } from 'react'
import { useAppStore, type ViewType } from '@/stores/appStore'

interface AppLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick'> {
  to: ViewType
  id?: string
  children: ReactNode
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void
}

export function AppLink({ to, id, children, onClick, className, ...props }: AppLinkProps) {
  const {
    setView,
    setSelectedRecordId,
    setSelectedGratitudeId,
    setSelectedMoodCheckId,
    setSelectedChecklistId,
    setSelectedActivityId,
  } = useAppStore()

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
      'new-checklist': 'new-checklist',
      'checklist-detail': id ? `checklist-entry/${id}` : 'checklist',
    }
    return `#${routeMap[to] || to}`
  }

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.ctrlKey || e.metaKey) {
      return
    }

    e.preventDefault()

    if (id) {
      if (to === 'thought-detail' || to === 'new-thought') {
        setSelectedRecordId(id)
      } else if (to === 'new-gratitude') {
        setSelectedGratitudeId(id)
      } else if (to === 'new-mood-check') {
        setSelectedMoodCheckId(id)
      } else if (to === 'checklist-detail' || to === 'new-checklist') {
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

  const handleAuxClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.button === 1) {
      e.stopPropagation()
    }
  }

  return (
    <a
      href={getHref()}
      onClick={handleClick}
      onAuxClick={handleAuxClick}
      className={className}
      {...props}
    >
      {children}
    </a>
  )
}
