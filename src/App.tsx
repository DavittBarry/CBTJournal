import { useEffect } from 'react'
import { useAppStore } from '@/stores/appStore'
import { Navigation } from '@/components/Navigation'
import { HomeView } from '@/components/HomeView'
import { ThoughtRecordForm } from '@/components/ThoughtRecordForm'
import { ThoughtDetailView } from '@/components/ThoughtDetailView'
import { ChecklistView } from '@/components/ChecklistView'
import { NewChecklistView } from '@/components/NewChecklistView'
import { InsightsView } from '@/components/InsightsView'
import { SettingsView } from '@/components/SettingsView'

function App() {
  const { currentView, isLoading, loadData } = useAppStore()

  useEffect(() => {
    loadData()
  }, [loadData])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-100 flex items-center justify-center">
        <div className="text-stone-400">Loading...</div>
      </div>
    )
  }

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView />
      case 'new-thought':
        return <ThoughtRecordForm />
      case 'thought-detail':
        return <ThoughtDetailView />
      case 'checklist':
        return <ChecklistView />
      case 'new-checklist':
        return <NewChecklistView />
      case 'insights':
        return <InsightsView />
      case 'settings':
        return <SettingsView />
      default:
        return <HomeView />
    }
  }

  return (
    <div className="min-h-screen bg-warm-100 text-stone-800">
      <main className="max-w-lg mx-auto px-5 py-8">
        {renderView()}
      </main>
      <Navigation />
    </div>
  )
}

export default App
