import { useAppStore } from '@/stores/appStore'
import { useBackupStore } from '@/stores/backupStore'
import { downloadBackup } from '@/utils/backup'
import { toast } from '@/stores/toastStore'
import { useReminders } from '@/hooks/useReminders'

function RecordsIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14,2 14,8 20,8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  )
}

function ActivitiesIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <path d="M9 16l2 2 4-4" />
    </svg>
  )
}

function MoodIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 21H4.6c-.56 0-.84 0-1.05-.11a1 1 0 0 1-.44-.44C3 20.24 3 19.96 3 19.4V3" />
      <path d="M7 14l4-4 4 4 6-6" />
      <circle cx="21" cy="8" r="2" />
    </svg>
  )
}

function ToolkitIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  )
}

function GratitudeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  )
}

function InsightsIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 21H4.6c-.56 0-.84 0-1.05-.11a1 1 0 0 1-.44-.44C3 20.24 3 19.96 3 19.4V3" />
      <path d="M7 17V13" />
      <path d="M11 17V9" />
      <path d="M15 17V11" />
      <path d="M19 17V7" />
    </svg>
  )
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function AppLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#617161" />
      <g fill="none" stroke="white" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 16c0-4.4 3.6-8 8-8" strokeWidth="2.5" opacity="0.5" />
        <path d="M12 16c0-2.2 1.8-4 4-4" strokeWidth="2.5" opacity="0.75" />
        <path d="M16 16h10" strokeWidth="2.5" />
        <path d="M23 13l3 3-3 3" strokeWidth="2" />
      </g>
    </svg>
  )
}

export function Navigation() {
  const {
    currentView,
    setView,
    setSelectedGratitudeId,
    setSelectedChecklistId,
    setSelectedRecordId,
    setSelectedMoodCheckId,
    setSelectedActivityId,
    thoughtRecords,
    depressionChecklists,
    gratitudeEntries,
    moodChecks,
    activities,
    copingSkillLogs,
    exportData,
  } = useAppStore()
  const { setLastBackupDate, setTotalEntriesAtLastBackup } = useBackupStore()
  const { getNavReminder } = useReminders()

  const navItems = [
    { id: 'home' as const, label: 'Records', Icon: RecordsIcon },
    { id: 'activities' as const, label: 'Activities', Icon: ActivitiesIcon },
    { id: 'mood-check' as const, label: 'Mood', Icon: MoodIcon },
    { id: 'toolkit' as const, label: 'Toolkit', Icon: ToolkitIcon },
    { id: 'gratitude' as const, label: 'Gratitude', Icon: GratitudeIcon },
    { id: 'insights' as const, label: 'Insights', Icon: InsightsIcon },
    { id: 'settings' as const, label: 'Settings', Icon: SettingsIcon },
  ]

  const mobileNavItems = [
    { id: 'home' as const, label: 'Records', Icon: RecordsIcon },
    { id: 'activities' as const, label: 'Activities', Icon: ActivitiesIcon },
    { id: 'mood-check' as const, label: 'Mood', Icon: MoodIcon },
    { id: 'toolkit' as const, label: 'Toolkit', Icon: ToolkitIcon },
    { id: 'settings' as const, label: 'More', Icon: SettingsIcon },
  ]

  const isActive = (id: string) => {
    if (id === 'home')
      return (
        currentView === 'home' || currentView === 'new-thought' || currentView === 'thought-detail'
      )
    if (id === 'gratitude') return currentView === 'gratitude' || currentView === 'new-gratitude'
    if (id === 'checklist')
      return (
        currentView === 'checklist' ||
        currentView === 'new-checklist' ||
        currentView === 'checklist-detail'
      )
    if (id === 'mood-check') return currentView === 'mood-check' || currentView === 'new-mood-check'
    if (id === 'activities') return currentView === 'activities' || currentView === 'new-activity'
    if (id === 'toolkit')
      return (
        currentView === 'toolkit' ||
        currentView === 'safety-plan' ||
        currentView === 'coping-skills'
      )
    return currentView === id
  }

  const handleNavClick = (id: (typeof navItems)[number]['id']) => {
    if (id === 'gratitude') {
      setSelectedGratitudeId(null)
    }
    if (id === 'home') {
      setSelectedRecordId(null)
    }
    if (id === 'mood-check') {
      setSelectedMoodCheckId(null)
    }
    if (id === 'activities') {
      setSelectedActivityId(null)
    }
    setView(id)
  }

  const handleQuickExport = async () => {
    try {
      const jsonData = await exportData()
      await downloadBackup(jsonData)

      const totalEntries =
        thoughtRecords.length +
        depressionChecklists.length +
        gratitudeEntries.length +
        moodChecks.length +
        activities.length +
        copingSkillLogs.length
      setLastBackupDate(new Date().toISOString())
      setTotalEntriesAtLastBackup(totalEntries)

      toast.success('Backup saved successfully')
    } catch (error) {
      toast.error('Failed to create backup')
    }
  }

  return (
    <>
      {/* Mobile bottom navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-stone-800/95 backdrop-blur-sm border-t border-stone-200/80 dark:border-stone-700/80 px-2 py-2 z-50">
        <div className="max-w-lg mx-auto flex justify-around">
          {mobileNavItems.map((item) => {
            const reminder = getNavReminder(item.id)
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`relative flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-200 focus:ring-0 focus:ring-offset-0 ${
                  isActive(item.id)
                    ? 'text-sage-600 dark:text-sage-400'
                    : 'text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300'
                }`}
              >
                <div className="relative">
                  <item.Icon className="w-5 h-5" />
                  {reminder && (
                    <span
                      className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
                        reminder.priority === 'high'
                          ? 'bg-amber-500'
                          : reminder.priority === 'medium'
                            ? 'bg-sage-500'
                            : 'bg-stone-400'
                      }`}
                    />
                  )}
                </div>
                <span className={`text-[10px] mt-1.5 ${isActive(item.id) ? 'font-medium' : ''}`}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Mobile quick export FAB */}
      <button
        onClick={handleQuickExport}
        className="lg:hidden fixed bottom-20 right-4 bg-sage-600 hover:bg-sage-700 dark:bg-sage-600 dark:hover:bg-sage-500 text-white p-4 rounded-full shadow-lg transition-colors z-40 focus:ring-0 focus:ring-offset-0"
        aria-label="Quick export"
      >
        <DownloadIcon className="w-5 h-5" />
      </button>

      {/* Desktop sidebar navigation */}
      <nav className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-stone-800 border-r border-stone-200 dark:border-stone-700 flex-col z-50">
        <div className="p-6 border-b border-stone-100 dark:border-stone-700">
          <div className="flex items-center">
            <AppLogo className="w-8 h-8 flex-shrink-0" />
            <div className="flex-1 text-center pr-8">
              <h1 className="text-xl font-semibold text-sage-700 dark:text-sage-400">CBTJournal</h1>
              <p className="text-xs text-stone-400 dark:text-stone-500">Evidence-based tools</p>
            </div>
          </div>
        </div>

        <div className="flex-1 py-4 px-3 overflow-y-auto">
          <div className="mb-2 px-4">
            <span className="text-[10px] font-medium text-stone-400 dark:text-stone-500 uppercase tracking-wider">
              Journal
            </span>
          </div>
          {navItems.slice(0, 3).map((item) => {
            const reminder = getNavReminder(item.id)
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-200 mb-1 focus:ring-0 focus:ring-offset-0 ${
                  isActive(item.id)
                    ? 'bg-sage-50 dark:bg-sage-900/30 text-sage-700 dark:text-sage-400'
                    : 'text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-700/50 hover:text-stone-700 dark:hover:text-stone-200'
                }`}
              >
                <div className="relative">
                  <item.Icon className="w-5 h-5" />
                  {reminder && (
                    <span
                      className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${
                        reminder.priority === 'high'
                          ? 'bg-amber-500'
                          : reminder.priority === 'medium'
                            ? 'bg-sage-500'
                            : 'bg-stone-400'
                      }`}
                    />
                  )}
                </div>
                <span className={`text-sm ${isActive(item.id) ? 'font-medium' : ''}`}>
                  {item.label}
                </span>
              </button>
            )
          })}

          <div className="mt-4 mb-2 px-4">
            <span className="text-[10px] font-medium text-stone-400 dark:text-stone-500 uppercase tracking-wider">
              Wellbeing
            </span>
          </div>
          {navItems.slice(3, 5).map((item) => {
            const reminder = getNavReminder(item.id)
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-200 mb-1 focus:ring-0 focus:ring-offset-0 ${
                  isActive(item.id)
                    ? 'bg-sage-50 dark:bg-sage-900/30 text-sage-700 dark:text-sage-400'
                    : 'text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-700/50 hover:text-stone-700 dark:hover:text-stone-200'
                }`}
              >
                <div className="relative">
                  <item.Icon className="w-5 h-5" />
                  {reminder && (
                    <span
                      className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${
                        reminder.priority === 'high'
                          ? 'bg-amber-500'
                          : reminder.priority === 'medium'
                            ? 'bg-sage-500'
                            : 'bg-stone-400'
                      }`}
                    />
                  )}
                </div>
                <span className={`text-sm ${isActive(item.id) ? 'font-medium' : ''}`}>
                  {item.label}
                </span>
              </button>
            )
          })}

          <div className="mt-4 mb-2 px-4">
            <span className="text-[10px] font-medium text-stone-400 dark:text-stone-500 uppercase tracking-wider">
              More
            </span>
          </div>
          {navItems.slice(5).map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-200 mb-1 focus:ring-0 focus:ring-offset-0 ${
                isActive(item.id)
                  ? 'bg-sage-50 dark:bg-sage-900/30 text-sage-700 dark:text-sage-400'
                  : 'text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-700/50 hover:text-stone-700 dark:hover:text-stone-200'
              }`}
            >
              <item.Icon className="w-5 h-5" />
              <span className={`text-sm ${isActive(item.id) ? 'font-medium' : ''}`}>
                {item.label}
              </span>
            </button>
          ))}

          {/* Legacy Burns checklist link - only show if user has historical data */}
          {depressionChecklists.length > 0 && (
            <button
              onClick={() => {
                setSelectedChecklistId(null)
                setView('checklist')
              }}
              className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-200 mb-1 focus:ring-0 focus:ring-offset-0 ${
                isActive('checklist')
                  ? 'bg-sage-50 dark:bg-sage-900/30 text-sage-700 dark:text-sage-400'
                  : 'text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-700/50 hover:text-stone-700 dark:hover:text-stone-200'
              }`}
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
              <span className="text-sm">Burns checklist</span>
              <span className="text-[10px] text-stone-400 dark:text-stone-500">(legacy)</span>
            </button>
          )}
        </div>

        <div className="p-3 border-t border-stone-100 dark:border-stone-700 space-y-3">
          <button
            onClick={handleQuickExport}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-sage-100 hover:bg-sage-200 dark:bg-sage-900/30 dark:hover:bg-sage-900/50 text-sage-700 dark:text-sage-400 transition-colors text-sm font-medium focus:ring-0 focus:ring-offset-0"
          >
            <DownloadIcon className="w-4 h-4" />
            Quick export
          </button>
          <p className="text-xs text-stone-400 dark:text-stone-500 text-center">
            PHQ-9 • GAD-7 • DBT • ACT • MBCT
          </p>
        </div>
      </nav>
    </>
  )
}
