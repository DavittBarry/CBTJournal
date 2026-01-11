type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  timestamp: string
  level: LogLevel
  context: string
  message: string
  data?: unknown
  stack?: string
}

const LOG_STORAGE_KEY = 'untwist_logs'
const MAX_LOGS = 500

class Logger {
  private isDev = import.meta.env.DEV
  private logs: LogEntry[] = []

  constructor() {
    this.loadLogs()
  }

  private loadLogs(): void {
    try {
      const stored = localStorage.getItem(LOG_STORAGE_KEY)
      if (stored) {
        this.logs = JSON.parse(stored)
      }
    } catch {
      this.logs = []
    }
  }

  private saveLogs(): void {
    try {
      if (this.logs.length > MAX_LOGS) {
        this.logs = this.logs.slice(-MAX_LOGS)
      }
      localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(this.logs))
    } catch {
    }
  }

  private formatTimestamp(): string {
    return new Date().toISOString()
  }

  private createEntry(level: LogLevel, context: string, message: string, data?: unknown, error?: Error): LogEntry {
    return {
      timestamp: this.formatTimestamp(),
      level,
      context,
      message,
      data: data !== undefined ? this.sanitizeData(data) : undefined,
      stack: error?.stack
    }
  }

  private sanitizeData(data: unknown): unknown {
    try {
      return JSON.parse(JSON.stringify(data))
    } catch {
      return String(data)
    }
  }

  private log(level: LogLevel, context: string, message: string, data?: unknown, error?: Error): void {
    const entry = this.createEntry(level, context, message, data, error)
    this.logs.push(entry)
    this.saveLogs()

    if (this.isDev) {
      const consoleMethod = level === 'debug' ? 'log' : level
      const prefix = `[${entry.timestamp}] [${level.toUpperCase()}] [${context}]`
      
      if (error) {
        console[consoleMethod](prefix, message, data ?? '', error)
      } else if (data !== undefined) {
        console[consoleMethod](prefix, message, data)
      } else {
        console[consoleMethod](prefix, message)
      }
    }
  }

  debug(context: string, message: string, data?: unknown): void {
    this.log('debug', context, message, data)
  }

  info(context: string, message: string, data?: unknown): void {
    this.log('info', context, message, data)
  }

  warn(context: string, message: string, data?: unknown): void {
    this.log('warn', context, message, data)
  }

  error(context: string, message: string, error?: Error | unknown, data?: unknown): void {
    const err = error instanceof Error ? error : undefined
    const extraData = error instanceof Error ? data : error
    this.log('error', context, message, extraData, err)
  }

  getLogs(options?: { level?: LogLevel; context?: string; since?: Date }): LogEntry[] {
    let filtered = [...this.logs]

    if (options?.level) {
      const levels: LogLevel[] = ['debug', 'info', 'warn', 'error']
      const minIndex = levels.indexOf(options.level)
      filtered = filtered.filter(log => levels.indexOf(log.level) >= minIndex)
    }

    if (options?.context) {
      filtered = filtered.filter(log => log.context.includes(options.context!))
    }

    if (options?.since) {
      const sinceTime = options.since.getTime()
      filtered = filtered.filter(log => new Date(log.timestamp).getTime() >= sinceTime)
    }

    return filtered
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }

  clearLogs(): void {
    this.logs = []
    localStorage.removeItem(LOG_STORAGE_KEY)
  }

  getRecentErrors(count = 10): LogEntry[] {
    return this.logs
      .filter(log => log.level === 'error')
      .slice(-count)
  }
}

export const logger = new Logger()
