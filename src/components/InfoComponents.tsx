import { useState, useRef, useEffect } from 'react'

interface InfoButtonProps {
  title: string
  content: string
  example?: string
}

export function InfoButton({ title, content, example }: InfoButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLSpanElement>(null)
  const timeoutRef = useRef<number | null>(null)

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 150)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <span 
      ref={containerRef}
      className="relative inline-flex items-center align-middle"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="ml-1.5 w-[18px] h-[18px] rounded-full bg-stone-200 dark:bg-stone-600 hover:bg-stone-300 dark:hover:bg-stone-500 text-stone-500 dark:text-stone-300 hover:text-stone-700 dark:hover:text-stone-100 inline-flex items-center justify-center transition-colors text-[11px] font-bold leading-none focus:ring-0 focus:ring-offset-0"
        aria-label={`Info about ${title}`}
      >
        ?
      </button>

      {isOpen && (
        <div
          className="fixed sm:absolute left-4 right-4 sm:left-0 sm:right-auto top-auto sm:top-full mt-2 z-50 sm:w-72 bg-white dark:bg-stone-800 rounded-xl shadow-soft-lg dark:shadow-soft-lg-dark border border-stone-200 dark:border-stone-700 p-4 animate-fade-in"
          style={{ bottom: 'auto' }}
        >
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold text-stone-800 dark:text-stone-100 text-sm">{title}</h4>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 focus:ring-0 focus:ring-offset-0"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed">{content}</p>
          {example && (
            <div className="mt-3 bg-sage-50 dark:bg-sage-900/30 rounded-lg p-3">
              <p className="text-xs font-medium text-sage-700 dark:text-sage-400 mb-1">Example</p>
              <p className="text-sage-600 dark:text-sage-300 text-sm italic">"{example}"</p>
            </div>
          )}
        </div>
      )}
    </span>
  )
}

interface StatInfoButtonProps {
  title: string
  content: string
}

export function StatInfoButton({ title, content }: StatInfoButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLSpanElement>(null)
  const timeoutRef = useRef<number | null>(null)

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 150)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <span 
      ref={containerRef}
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="ml-1 w-4 h-4 rounded-full bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600 text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 inline-flex items-center justify-center transition-colors text-[10px] font-bold leading-none focus:ring-0 focus:ring-offset-0"
        aria-label={`Info about ${title}`}
      >
        ?
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 z-50 w-64 bg-white dark:bg-stone-800 rounded-xl shadow-soft-lg dark:shadow-soft-lg-dark border border-stone-200 dark:border-stone-700 p-3 animate-fade-in"
        >
          <div className="flex items-start justify-between mb-1.5">
            <h4 className="font-semibold text-stone-800 dark:text-stone-100 text-xs">{title}</h4>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 focus:ring-0 focus:ring-offset-0"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-stone-600 dark:text-stone-300 text-xs leading-relaxed">{content}</p>
        </div>
      )}
    </span>
  )
}

interface PageIntroProps {
  title: string
  description: string
  steps?: string[]
  centered?: boolean
}

export function PageIntro({ title, description, steps, centered = true }: PageIntroProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<number | null>(null)

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsExpanded(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsExpanded(false), 200)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <div className="mb-6" ref={containerRef}>
      <div className={`flex items-center gap-4 ${centered ? 'justify-center' : 'justify-between'}`}>
        {centered && <div className="w-8" />}
        <h1 className="text-2xl font-semibold text-stone-800 dark:text-stone-100">{title}</h1>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="flex-shrink-0 w-8 h-8 rounded-full bg-sage-100 dark:bg-sage-900/40 hover:bg-sage-200 dark:hover:bg-sage-900/60 text-sage-700 dark:text-sage-400 hover:text-sage-800 dark:hover:text-sage-300 flex items-center justify-center transition-colors text-sm font-bold leading-none focus:ring-0 focus:ring-offset-0"
          aria-label="How this works"
        >
          ?
        </button>
      </div>

      {isExpanded && (
        <div 
          className="mt-4 bg-sage-50 dark:bg-sage-900/30 rounded-xl p-5 animate-fade-in max-w-2xl mx-auto"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed mb-4">{description}</p>
          {steps && steps.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-sage-700 dark:text-sage-400 uppercase tracking-wide">The process</p>
              {steps.map((step, index) => (
                <div key={index} className="flex gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-sage-200 dark:bg-sage-800 text-sage-700 dark:text-sage-300 text-xs font-semibold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <p className="text-stone-600 dark:text-stone-300 text-sm">{step}</p>
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="mt-4 text-sage-600 dark:text-sage-400 hover:text-sage-700 dark:hover:text-sage-300 text-sm font-medium focus:ring-0 focus:ring-offset-0"
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
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-sage-100 dark:bg-sage-900/40 text-sage-700 dark:text-sage-400 text-sm font-semibold flex items-center justify-center">
          {number}
        </span>
        <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-100">{title}</h2>
      </div>
      <p className="text-stone-500 dark:text-stone-400 text-sm ml-10">{description}</p>
    </div>
  )
}

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchBar({ value, onChange, placeholder = "Search..." }: SearchBarProps) {
  return (
    <div className="relative">
      <svg 
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500"
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field pl-10 py-2.5 text-sm"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 focus:ring-0 focus:ring-offset-0"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}

interface TimeFilterProps {
  value: string
  onChange: (value: string) => void
}

export function TimeFilter({ value, onChange }: TimeFilterProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="input-field py-2.5 text-sm"
    >
      <option value="all">All time</option>
      <option value="week">Past week</option>
      <option value="month">Past month</option>
      <option value="3months">Past 3 months</option>
      <option value="year">Past year</option>
    </select>
  )
}
