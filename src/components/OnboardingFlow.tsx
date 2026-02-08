import { useState } from 'react'
import { useAppStore } from '@/stores/appStore'
import { toast } from '@/stores/toastStore'

const ONBOARDING_KEY = 'untwist-onboarding-completed'

export function OnboardingFlow() {
  const { loadSampleData } = useAppStore()
  const [isVisible, setIsVisible] = useState(() => {
    const completed = localStorage.getItem(ONBOARDING_KEY)
    return !completed
  })
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true')
    setIsVisible(false)
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  const handleLoadSample = async () => {
    setIsLoading(true)
    try {
      await loadSampleData()
      toast.success('Sample data loaded')
      handleComplete()
    } catch {
      toast.error('Failed to load sample data')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isVisible) return null

  const steps = [
    {
      title: 'Welcome to CBTJournal',
      content:
        'A private space for evidence-based mental wellness practices including thought records, clinically validated mood assessments, and gratitude journaling.',
      icon: (
        <svg
          className="w-12 h-12 text-sage-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ),
    },
    {
      title: 'Your data stays private',
      content:
        'Everything you write is stored locally on your device. No cloud sync, no tracking, no external servers. Just you and your thoughts.',
      icon: (
        <svg
          className="w-12 h-12 text-sage-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
      ),
    },
    {
      title: 'Back up regularly',
      content:
        'Since data is stored locally, clearing your browser or uninstalling the app will delete everything. Export backups from Settings to keep your work safe.',
      icon: (
        <svg
          className="w-12 h-12 text-amber-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      ),
    },
    {
      title: 'Try with sample data?',
      content:
        'Load example entries to explore how thought records, mood tracking, gratitude journaling, and insights work. You can always load or clear this later in Settings.',
      icon: (
        <svg
          className="w-12 h-12 text-sage-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
      isSampleStep: true,
    },
  ]

  const step = steps[currentStep]
  const isSampleStep = 'isSampleStep' in step && step.isSampleStep

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card p-8 max-w-md w-full">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6">{step.icon}</div>

          <h2 className="text-2xl font-semibold text-stone-800 dark:text-stone-100 mb-3">
            {step.title}
          </h2>

          <p className="text-stone-600 dark:text-stone-300 mb-8 leading-relaxed">{step.content}</p>

          <div className="flex items-center gap-1.5 mb-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentStep ? 'w-8 bg-sage-500' : 'w-1.5 bg-stone-300 dark:bg-stone-600'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-3 w-full">
            {isSampleStep ? (
              <>
                <button
                  onClick={handleComplete}
                  className="flex-1 btn-secondary"
                  disabled={isLoading}
                >
                  Start empty
                </button>
                <button
                  onClick={handleLoadSample}
                  className="flex-1 btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Load sample data'}
                </button>
              </>
            ) : currentStep < steps.length - 1 ? (
              <>
                <button onClick={handleSkip} className="flex-1 btn-secondary">
                  Skip
                </button>
                <button onClick={handleNext} className="flex-1 btn-primary">
                  Next
                </button>
              </>
            ) : (
              <button onClick={handleComplete} className="w-full btn-primary">
                Get started
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
