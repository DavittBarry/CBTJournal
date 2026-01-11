import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { logger } from '@/utils/logger'
import { toast } from '@/stores/toastStore'

window.addEventListener('error', (event) => {
  logger.error('Global', 'Uncaught error', event.error, {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  })
})

window.addEventListener('unhandledrejection', (event) => {
  logger.error('Global', 'Unhandled promise rejection', event.reason)
  
  if (event.reason?.message?.includes('QuotaExceeded')) {
    toast.error('Storage is full. Please export and clear some data.')
  }
})

if (import.meta.env.DEV) {
  (window as unknown as Record<string, unknown>).__UNTWIST_DEBUG__ = {
    logger,
    getLogs: () => logger.getLogs(),
    getErrors: () => logger.getRecentErrors(),
    exportLogs: () => {
      const logs = logger.exportLogs()
      console.log(logs)
      return logs
    },
    clearLogs: () => logger.clearLogs()
  }
  
  console.log(
    '%c🧠 Untwist Debug Mode',
    'color: #617161; font-size: 14px; font-weight: bold;'
  )
  console.log(
    '%cAccess debug tools via window.__UNTWIST_DEBUG__',
    'color: #78716c; font-size: 12px;'
  )
}

logger.info('App', 'Application starting', {
  version: import.meta.env.VITE_APP_VERSION ?? 'dev',
  mode: import.meta.env.MODE
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
