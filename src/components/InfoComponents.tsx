import { useState, useRef, useEffect } from 'react'

interface InfoButtonProps {
  title: string
  content: string
  example?: string
}

export function InfoButton({ title, content, example }: InfoButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current && 
        !popoverRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <span className="relative inline-flex items-center align-middle">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="ml-1.5 w-[18px] h-[18px] rounded-full bg-stone-200 hover:bg-stone-300 text-stone-500 hover:text-stone-700 inline-flex items-center justify-center transition-colors text-[11px] font-bold leading-none"
        aria-label={`Info about ${title}`}
      >
        ?
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute left-0 top-full mt-2 z-50 w-72 bg-white rounded-xl shadow-soft-lg border border-stone-200 p-4 animate-fade-in"
        >
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold text-stone-800 text-sm">{title}</h4>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-stone-400 hover:text-stone-600"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-stone-600 text-sm leading-relaxed">{content}</p>
          {example && (
            <div className="mt-3 bg-sage-50 rounded-lg p-3">
              <p className="text-xs font-medium text-sage-700 mb-1">Example</p>
              <p className="text-sage-600 text-sm italic">"{example}"</p>
            </div>
          )}
        </div>
      )}
    </span>
  )
}

interface PageIntroProps {
  title: string
  description: string
  steps?: string[]
}

export function PageIntro({ title, description, steps }: PageIntroProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-stone-800">{title}</h1>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-shrink-0 w-8 h-8 rounded-full bg-sage-100 hover:bg-sage-200 text-sage-700 hover:text-sage-800 flex items-center justify-center transition-colors text-sm font-bold leading-none"
          aria-label="How this works"
        >
          ?
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 bg-sage-50 rounded-xl p-5 animate-fade-in">
          <p className="text-stone-600 text-sm leading-relaxed mb-4">{description}</p>
          {steps && steps.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-sage-700 uppercase tracking-wide">The process</p>
              {steps.map((step, index) => (
                <div key={index} className="flex gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-sage-200 text-sage-700 text-xs font-semibold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <p className="text-stone-600 text-sm">{step}</p>
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="mt-4 text-sage-600 hover:text-sage-700 text-sm font-medium"
          >
            Got it
          </button>
        </div>
      )}
    </div>
  )
}

interface SectionHeaderProps {
  number: number
  title: string
  description: string
}

export function SectionHeader({ number, title, description }: SectionHeaderProps) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-3 mb-1">
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-sage-100 text-sage-700 text-sm font-semibold flex items-center justify-center">
          {number}
        </span>
        <h2 className="text-lg font-semibold text-stone-800">{title}</h2>
      </div>
      <p className="text-stone-500 text-sm ml-10">{description}</p>
    </div>
  )
}
