import { create } from 'zustand'

type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
  initTheme: () => void
}

const STORAGE_KEY = 'untwist-theme'

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(resolvedTheme: 'light' | 'dark') {
  const htmlElement = document.documentElement
  
  if (resolvedTheme === 'dark') {
    htmlElement.classList.add('dark')
  } else {
    htmlElement.classList.remove('dark')
  }
}

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system'
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored
  }
  return 'system'
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'system',
  resolvedTheme: 'light',

  setTheme: (theme) => {
    const resolvedTheme = theme === 'system' ? getSystemTheme() : theme
    localStorage.setItem(STORAGE_KEY, theme)
    applyTheme(resolvedTheme)
    set({ theme, resolvedTheme })
  },

  initTheme: () => {
    const theme = getStoredTheme()
    const resolvedTheme = theme === 'system' ? getSystemTheme() : theme
    applyTheme(resolvedTheme)
    set({ theme, resolvedTheme })

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      const currentTheme = get().theme
      if (currentTheme === 'system') {
        const newResolved = getSystemTheme()
        applyTheme(newResolved)
        set({ resolvedTheme: newResolved })
      }
    }
    mediaQuery.addEventListener('change', handleChange)
  }
}))
