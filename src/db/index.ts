import { openDB, DBSchema, IDBPDatabase } from 'idb'
import type { ThoughtRecord, DepressionChecklistEntry, GratitudeEntry } from '@/types'
import { logger } from '@/utils/logger'
import { toast } from '@/stores/toastStore'

interface UntwistDB extends DBSchema {
  thoughtRecords: {
    key: string
    value: ThoughtRecord
    indexes: { 'by-date': string }
  }
  depressionChecklists: {
    key: string
    value: DepressionChecklistEntry
    indexes: { 'by-date': string }
  }
  gratitudeEntries: {
    key: string
    value: GratitudeEntry
    indexes: { 'by-date': string }
  }
}

let dbPromise: Promise<IDBPDatabase<UntwistDB>> | null = null

function getDB() {
  if (!dbPromise) {
    logger.debug('DB', 'Initializing IndexedDB connection')
    
    dbPromise = openDB<UntwistDB>('untwist', 2, {
      upgrade(db, oldVersion, newVersion) {
        logger.info('DB', 'Upgrading database', { oldVersion, newVersion })
        
        if (oldVersion < 1) {
          const thoughtStore = db.createObjectStore('thoughtRecords', { keyPath: 'id' })
          thoughtStore.createIndex('by-date', 'date')

          const depressionStore = db.createObjectStore('depressionChecklists', { keyPath: 'id' })
          depressionStore.createIndex('by-date', 'date')
        }
        
        if (oldVersion < 2) {
          const gratitudeStore = db.createObjectStore('gratitudeEntries', { keyPath: 'id' })
          gratitudeStore.createIndex('by-date', 'date')
        }
      },
      blocked() {
        logger.warn('DB', 'Database upgrade blocked by other tabs')
        toast.warning('Please close other tabs with this app to complete update')
      },
      blocking() {
        logger.warn('DB', 'This tab is blocking a database upgrade')
      },
      terminated() {
        logger.error('DB', 'Database connection unexpectedly terminated')
        dbPromise = null
      }
    }).catch((error) => {
      logger.error('DB', 'Failed to open database', error)
      dbPromise = null
      throw error
    })
  }
  return dbPromise
}

async function withErrorHandling<T>(
  operation: string,
  fn: () => Promise<T>,
  showToast = false
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    logger.error('DB', `${operation} failed`, error)
    
    if (showToast) {
      toast.error(`Failed to ${operation.toLowerCase()}. Please try again.`)
    }
    
    throw error
  }
}

export const db = {
  async addThoughtRecord(record: ThoughtRecord): Promise<string> {
    return withErrorHandling('Add thought record', async () => {
      const database = await getDB()
      await database.add('thoughtRecords', record)
      logger.debug('DB', 'Added thought record', { id: record.id })
      return record.id
    }, true)
  },

  async updateThoughtRecord(record: ThoughtRecord): Promise<void> {
    return withErrorHandling('Update thought record', async () => {
      const database = await getDB()
      await database.put('thoughtRecords', record)
      logger.debug('DB', 'Updated thought record', { id: record.id })
    }, true)
  },

  async deleteThoughtRecord(id: string): Promise<void> {
    return withErrorHandling('Delete thought record', async () => {
      const database = await getDB()
      await database.delete('thoughtRecords', id)
      logger.debug('DB', 'Deleted thought record', { id })
    }, true)
  },

  async getThoughtRecord(id: string): Promise<ThoughtRecord | undefined> {
    return withErrorHandling('Get thought record', async () => {
      const database = await getDB()
      return database.get('thoughtRecords', id)
    })
  },

  async getAllThoughtRecords(): Promise<ThoughtRecord[]> {
    return withErrorHandling('Get all thought records', async () => {
      const database = await getDB()
      const records = await database.getAll('thoughtRecords')
      logger.debug('DB', 'Retrieved thought records', { count: records.length })
      return records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    })
  },

  async getThoughtRecordsByDateRange(startDate: string, endDate: string): Promise<ThoughtRecord[]> {
    return withErrorHandling('Get thought records by date range', async () => {
      const database = await getDB()
      const records = await database.getAllFromIndex('thoughtRecords', 'by-date', IDBKeyRange.bound(startDate, endDate))
      return records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    })
  },

  async addDepressionChecklist(entry: DepressionChecklistEntry): Promise<string> {
    return withErrorHandling('Add depression checklist', async () => {
      const database = await getDB()
      await database.add('depressionChecklists', entry)
      logger.debug('DB', 'Added depression checklist', { id: entry.id })
      return entry.id
    }, true)
  },

  async updateDepressionChecklist(entry: DepressionChecklistEntry): Promise<void> {
    return withErrorHandling('Update depression checklist', async () => {
      const database = await getDB()
      await database.put('depressionChecklists', entry)
      logger.debug('DB', 'Updated depression checklist', { id: entry.id })
    }, true)
  },

  async deleteDepressionChecklist(id: string): Promise<void> {
    return withErrorHandling('Delete depression checklist', async () => {
      const database = await getDB()
      await database.delete('depressionChecklists', id)
      logger.debug('DB', 'Deleted depression checklist', { id })
    }, true)
  },

  async getAllDepressionChecklists(): Promise<DepressionChecklistEntry[]> {
    return withErrorHandling('Get all depression checklists', async () => {
      const database = await getDB()
      const entries = await database.getAll('depressionChecklists')
      logger.debug('DB', 'Retrieved depression checklists', { count: entries.length })
      return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    })
  },

  async addGratitudeEntry(entry: GratitudeEntry): Promise<string> {
    return withErrorHandling('Add gratitude entry', async () => {
      const database = await getDB()
      await database.add('gratitudeEntries', entry)
      logger.debug('DB', 'Added gratitude entry', { id: entry.id })
      return entry.id
    }, true)
  },

  async updateGratitudeEntry(entry: GratitudeEntry): Promise<void> {
    return withErrorHandling('Update gratitude entry', async () => {
      const database = await getDB()
      await database.put('gratitudeEntries', entry)
      logger.debug('DB', 'Updated gratitude entry', { id: entry.id })
    }, true)
  },

  async deleteGratitudeEntry(id: string): Promise<void> {
    return withErrorHandling('Delete gratitude entry', async () => {
      const database = await getDB()
      await database.delete('gratitudeEntries', id)
      logger.debug('DB', 'Deleted gratitude entry', { id })
    }, true)
  },

  async getAllGratitudeEntries(): Promise<GratitudeEntry[]> {
    return withErrorHandling('Get all gratitude entries', async () => {
      const database = await getDB()
      const entries = await database.getAll('gratitudeEntries')
      logger.debug('DB', 'Retrieved gratitude entries', { count: entries.length })
      return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    })
  },

  async exportData(): Promise<{ thoughtRecords: ThoughtRecord[]; depressionChecklists: DepressionChecklistEntry[]; gratitudeEntries: GratitudeEntry[] }> {
    return withErrorHandling('Export data', async () => {
      const database = await getDB()
      const data = {
        thoughtRecords: await database.getAll('thoughtRecords'),
        depressionChecklists: await database.getAll('depressionChecklists'),
        gratitudeEntries: await database.getAll('gratitudeEntries')
      }
      logger.info('DB', 'Exported data', { 
        thoughtRecords: data.thoughtRecords.length,
        depressionChecklists: data.depressionChecklists.length,
        gratitudeEntries: data.gratitudeEntries.length
      })
      return data
    }, true)
  },

  async importData(
    data: { thoughtRecords?: ThoughtRecord[]; depressionChecklists?: DepressionChecklistEntry[]; gratitudeEntries?: GratitudeEntry[] }, 
    mode: 'merge' | 'replace' = 'merge'
  ): Promise<{ imported: { thoughtRecords: number; depressionChecklists: number; gratitudeEntries: number } }> {
    return withErrorHandling('Import data', async () => {
      const database = await getDB()
      const tx = database.transaction(['thoughtRecords', 'depressionChecklists', 'gratitudeEntries'], 'readwrite')
      
      logger.info('DB', 'Starting data import', { mode })
      
      if (mode === 'replace') {
        await tx.objectStore('thoughtRecords').clear()
        await tx.objectStore('depressionChecklists').clear()
        await tx.objectStore('gratitudeEntries').clear()
        logger.debug('DB', 'Cleared existing data for replace mode')
      }
      
      const imported = {
        thoughtRecords: 0,
        depressionChecklists: 0,
        gratitudeEntries: 0
      }

      if (data.thoughtRecords) {
        for (const record of data.thoughtRecords) {
          await tx.objectStore('thoughtRecords').put(record)
          imported.thoughtRecords++
        }
      }
      
      if (data.depressionChecklists) {
        for (const entry of data.depressionChecklists) {
          await tx.objectStore('depressionChecklists').put(entry)
          imported.depressionChecklists++
        }
      }
      
      if (data.gratitudeEntries) {
        for (const entry of data.gratitudeEntries) {
          await tx.objectStore('gratitudeEntries').put(entry)
          imported.gratitudeEntries++
        }
      }
      
      await tx.done
      
      logger.info('DB', 'Data import completed', imported)
      return { imported }
    }, true)
  },

  async clearAllData(): Promise<void> {
    return withErrorHandling('Clear all data', async () => {
      const database = await getDB()
      const tx = database.transaction(['thoughtRecords', 'depressionChecklists', 'gratitudeEntries'], 'readwrite')
      await tx.objectStore('thoughtRecords').clear()
      await tx.objectStore('depressionChecklists').clear()
      await tx.objectStore('gratitudeEntries').clear()
      await tx.done
      logger.info('DB', 'Cleared all data')
    }, true)
  },

  async getStats(): Promise<{ thoughtRecords: number; depressionChecklists: number; gratitudeEntries: number }> {
    return withErrorHandling('Get stats', async () => {
      const database = await getDB()
      return {
        thoughtRecords: await database.count('thoughtRecords'),
        depressionChecklists: await database.count('depressionChecklists'),
        gratitudeEntries: await database.count('gratitudeEntries')
      }
    })
  }
}
