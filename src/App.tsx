import { useEffect } from 'react'
import { useAppStore } from '@/stores/appStore'
import { useThemeStore } from '@/stores/themeStore'
import { Navigation } from '@/components/Navigation'
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
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ToastContainer } from '@/components/Toast'
import { logger } from '@/utils/logger'

function App() {
  const { currentView, isLoading, loadData, selectedRecordId, thoughtRecords, selectedChecklistId } = useAppStore()
  const initTheme = useThemeStore((state) => state.initTheme)

  useEffect(() => {
    initTheme()
  }, [initTheme])

  useEffect(() => {
    logger.debug('App', 'Loading initial data')
    loadData().catch((error) => {
      logger.error('App', 'Failed to load initial data', error)
    })
  }, [loadData])

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
          ? thoughtRecords.find(r => r.id === selectedRecordId) 
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
        <Navigation />
        
        <main className="
          pb-24 lg:pb-8
          lg:ml-64
          px-4 sm:px-6 lg:px-8
          py-6 lg:py-8
        ">
          <div className="max-w-4xl mx-auto">
            {renderView()}
          </div>
        </main>
        
        <ToastContainer />
      </div>
    </ErrorBoundary>
  )
}

export default App
