import { useAppStore } from '@/stores/appStore'

export function Navigation() {
  const { currentView, setView } = useAppStore()

  const navItems = [
    { id: 'home' as const, label: 'Records', icon: '📝' },
    { id: 'checklist' as const, label: 'Checklist', icon: '📊' },
    { id: 'insights' as const, label: 'Insights', icon: '💡' },
    { id: 'settings' as const, label: 'Settings', icon: '⚙️' }
  ]

  const isActive = (id: string) => {
    if (id === 'home') return currentView === 'home' || currentView === 'new-thought' || currentView === 'thought-detail'
    if (id === 'checklist') return currentView === 'checklist' || currentView === 'new-checklist'
    return currentView === id
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 px-4 py-2 z-50">
      <div className="max-w-lg mx-auto flex justify-around">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
              isActive(item.id)
                ? 'text-blue-400'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-xs mt-1">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
