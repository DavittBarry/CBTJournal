import { useEffect } from 'react'
import { useAppStore, type ViewType } from '@/stores/appStore'
import { useThemeStore } from '@/stores/themeStore'
import { Navigation } from '@/components/Navigation'
import { BackupReminder } from '@/components/BackupReminder'
import { OnboardingFlow } from '@/components/OnboardingFlow'
import { HomeView } from '@/components/HomeView'
import { ThoughtRecordForm } from '@/components/ThoughtRecordForm'
import { ThoughtDetailView } from '@/components/ThoughtDetailView'
import { GratitudeView } from '@/components/GratitudeView'
import { NewGratitudeView } from '@/components/NewGratitudeView'
import { ChecklistView } from '@/components/ChecklistView'
import { NewChecklistView } from '@/components/NewChecklistView'
import { ChecklistDetailView } from '@/components/ChecklistDetailView'
import { InsightsView } from '@/components/InsightsView'
import { SettingsView } from '@/components/SettingsView'
import { MoodCheckView } from '@/components/MoodCheckView'
import { NewMoodCheckView } from '@/components/NewMoodCheckView'
import { ActivitiesView } from '@/components/ActivitiesView'
import { CopingToolkitView } from '@/components/CopingToolkitView'
import { SafetyPlanView } from '@/components/SafetyPlanView'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ToastContainer } from '@/components/Toast'
import { logger } from '@/utils/logger'

function App() {
  const {
    currentView,
    setView,
    isLoading,
    loadData,
    selectedRecordId,
    setSelectedRecordId,
    selectedGratitudeId,
    setSelectedGratitudeId,
    thoughtRecords,
    selectedChecklistId,
    setSelectedChecklistId,
    selectedMoodCheckId,
    setSelectedMoodCheckId,
    moodChecks,
    initializeAutoSave,
    initializeCloudSync,
  } = useAppStore()
  const initTheme = useThemeStore((state) => state.initTheme)

  useEffect(() => {
    initTheme()
  }, [initTheme])

  // Hash-based routing for middle-click/new tab support
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) // Remove #
      if (!hash) return

      const parts = hash.split('/')
      const route = parts[0]
      const id = parts[1]

      const routeMap: Record<string, ViewType> = {
        records: 'home',
        record: 'thought-detail',
        'new-record': 'new-thought',
        gratitude: 'gratitude',
        'gratitude-entry': 'new-gratitude',
        mood: 'mood-check',
        'mood-entry': 'new-mood-check',
        activities: 'activities',
        toolkit: 'toolkit',
        insights: 'insights',
        settings: 'settings',
        checklist: 'checklist',
        'checklist-entry': 'checklist-detail',
      }

      const view = routeMap[route]
      if (view) {
        if (route === 'record' && id) {
          setSelectedRecordId(id)
        } else if (route === 'gratitude-entry' && id) {
          setSelectedGratitudeId(id)
        } else if (route === 'mood-entry' && id) {
          setSelectedMoodCheckId(id)
        } else if (route === 'checklist-entry' && id) {
          setSelectedChecklistId(id)
        }
        setView(view)
      }
    }

    // Handle initial hash on load
    if (window.location.hash) {
      handleHashChange()
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [
    setView,
    setSelectedRecordId,
    setSelectedGratitudeId,
    setSelectedMoodCheckId,
    setSelectedChecklistId,
  ])

  // Update hash when view changes (but don't trigger hashchange loop)
  useEffect(() => {
    const viewToRoute: Partial<Record<ViewType, string>> = {
      home: 'records',
      'thought-detail': selectedRecordId ? `record/${selectedRecordId}` : 'records',
      'new-thought': selectedRecordId ? `new-record/${selectedRecordId}` : 'new-record',
      gratitude: 'gratitude',
      'new-gratitude': selectedGratitudeId ? `gratitude-entry/${selectedGratitudeId}` : 'gratitude',
      'mood-check': 'mood',
      'new-mood-check': selectedMoodCheckId ? `mood-entry/${selectedMoodCheckId}` : 'mood',
      activities: 'activities',
      toolkit: 'toolkit',
      insights: 'insights',
      settings: 'settings',
      checklist: 'checklist',
      'checklist-detail': selectedChecklistId
        ? `checklist-entry/${selectedChecklistId}`
        : 'checklist',
    }

    const route = viewToRoute[currentView]
    if (route) {
      const newHash = `#${route}`
      if (window.location.hash !== newHash) {
        window.history.replaceState(null, '', newHash)
      }
    }
  }, [currentView, selectedRecordId, selectedGratitudeId, selectedMoodCheckId, selectedChecklistId])

  useEffect(() => {
    logger.debug('App', 'Loading initial data')
    loadData().catch((error) => {
      logger.error('App', 'Failed to load initial data', error)
    })
  }, [loadData])

  useEffect(() => {
    logger.debug('App', 'Initializing auto-save')
    initializeAutoSave().catch((error) => {
      logger.error('App', 'Failed to initialize auto-save', error)
    })
  }, [initializeAutoSave])

  useEffect(() => {
    if (!isLoading) {
      logger.debug('App', 'Initializing cloud sync')
      initializeCloudSync().catch((error) => {
        logger.error('App', 'Failed to initialize cloud sync', error)
      })
    }
  }, [isLoading, initializeCloudSync])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [currentView])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-200 dark:bg-stone-900 flex items-center justify-center">
        <div className="text-stone-400 dark:text-stone-500">Loading...</div>
      </div>
    )
  }

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView />
      case 'new-thought': {
        const existingRecord = selectedRecordId
          ? thoughtRecords.find((r) => r.id === selectedRecordId)
          : undefined
        return <ThoughtRecordForm key={selectedRecordId || 'new'} existingRecord={existingRecord} />
      }
      case 'thought-detail':
        return <ThoughtDetailView />
      case 'gratitude':
        return <GratitudeView />
      case 'new-gratitude':
        return <NewGratitudeView />
      case 'checklist':
        return <ChecklistView />
      case 'new-checklist':
        return <NewChecklistView key={selectedChecklistId || 'new'} />
      case 'checklist-detail':
        return <ChecklistDetailView />
      case 'mood-check':
        return <MoodCheckView />
      case 'new-mood-check': {
        const existingEntry = selectedMoodCheckId
          ? moodChecks.find((m) => m.id === selectedMoodCheckId)
          : undefined
        return <NewMoodCheckView key={selectedMoodCheckId || 'new'} existingEntry={existingEntry} />
      }
      case 'activities':
        return <ActivitiesView />
      case 'toolkit':
        return <CopingToolkitView />
      case 'safety-plan':
        return <SafetyPlanView />
      case 'insights':
        return <InsightsView />
      case 'settings':
        return <SettingsView />
      default:
        return <HomeView />
    }
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-warm-200 dark:bg-stone-900 text-stone-800 dark:text-stone-100">
        <OnboardingFlow />
        <Navigation />
        <BackupReminder />

        <main
          className="
          pb-24 lg:pb-8
          lg:ml-64
          px-4 sm:px-6 lg:px-8 xl:px-12
          py-6 lg:py-8
        "
        >
          <div className="max-w-[1600px] mx-auto">{renderView()}</div>
        </main>

        <ToastContainer />
      </div>
    </ErrorBoundary>
  )
}

export default App
