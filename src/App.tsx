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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
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
    <div className="min-h-screen bg-slate-900 text-white">
      <main className="max-w-lg mx-auto px-4 py-6">
        {renderView()}
      </main>
      <Navigation />
    </div>
  )
}

export default App
