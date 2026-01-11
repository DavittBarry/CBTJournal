import { openDB, DBSchema, IDBPDatabase } from 'idb'
import type { ThoughtRecord, DepressionChecklistEntry, GratitudeEntry } from '@/types'

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
    dbPromise = openDB<UntwistDB>('untwist', 2, {
      upgrade(db, oldVersion) {
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
      }
    })
  }
  return dbPromise
}

export const db = {
  async addThoughtRecord(record: ThoughtRecord): Promise<string> {
    const database = await getDB()
    await database.add('thoughtRecords', record)
    return record.id
  },

  async updateThoughtRecord(record: ThoughtRecord): Promise<void> {
    const database = await getDB()
    await database.put('thoughtRecords', record)
  },

  async deleteThoughtRecord(id: string): Promise<void> {
    const database = await getDB()
    await database.delete('thoughtRecords', id)
  },

  async getThoughtRecord(id: string): Promise<ThoughtRecord | undefined> {
    const database = await getDB()
    return database.get('thoughtRecords', id)
  },

  async getAllThoughtRecords(): Promise<ThoughtRecord[]> {
    const database = await getDB()
    const records = await database.getAll('thoughtRecords')
    return records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  async getThoughtRecordsByDateRange(startDate: string, endDate: string): Promise<ThoughtRecord[]> {
    const database = await getDB()
    const records = await database.getAllFromIndex('thoughtRecords', 'by-date', IDBKeyRange.bound(startDate, endDate))
    return records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  async addDepressionChecklist(entry: DepressionChecklistEntry): Promise<string> {
    const database = await getDB()
    await database.add('depressionChecklists', entry)
    return entry.id
  },

  async updateDepressionChecklist(entry: DepressionChecklistEntry): Promise<void> {
    const database = await getDB()
    await database.put('depressionChecklists', entry)
  },

  async deleteDepressionChecklist(id: string): Promise<void> {
    const database = await getDB()
    await database.delete('depressionChecklists', id)
  },

  async getAllDepressionChecklists(): Promise<DepressionChecklistEntry[]> {
    const database = await getDB()
    const entries = await database.getAll('depressionChecklists')
    return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  },

  async addGratitudeEntry(entry: GratitudeEntry): Promise<string> {
    const database = await getDB()
    await database.add('gratitudeEntries', entry)
    return entry.id
  },

  async updateGratitudeEntry(entry: GratitudeEntry): Promise<void> {
    const database = await getDB()
    await database.put('gratitudeEntries', entry)
  },

  async deleteGratitudeEntry(id: string): Promise<void> {
    const database = await getDB()
    await database.delete('gratitudeEntries', id)
  },

  async getAllGratitudeEntries(): Promise<GratitudeEntry[]> {
    const database = await getDB()
    const entries = await database.getAll('gratitudeEntries')
    return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  },

  async exportData(): Promise<{ thoughtRecords: ThoughtRecord[]; depressionChecklists: DepressionChecklistEntry[]; gratitudeEntries: GratitudeEntry[] }> {
    const database = await getDB()
    return {
      thoughtRecords: await database.getAll('thoughtRecords'),
      depressionChecklists: await database.getAll('depressionChecklists'),
      gratitudeEntries: await database.getAll('gratitudeEntries')
    }
  },

  async importData(data: { thoughtRecords?: ThoughtRecord[]; depressionChecklists?: DepressionChecklistEntry[]; gratitudeEntries?: GratitudeEntry[] }, mode: 'merge' | 'replace' = 'merge'): Promise<void> {
    const database = await getDB()
    const tx = database.transaction(['thoughtRecords', 'depressionChecklists', 'gratitudeEntries'], 'readwrite')
    
    if (mode === 'replace') {
      await tx.objectStore('thoughtRecords').clear()
      await tx.objectStore('depressionChecklists').clear()
      await tx.objectStore('gratitudeEntries').clear()
    }
    
    if (data.thoughtRecords) {
      for (const record of data.thoughtRecords) {
        await tx.objectStore('thoughtRecords').put(record)
      }
    }
    
    if (data.depressionChecklists) {
      for (const entry of data.depressionChecklists) {
        await tx.objectStore('depressionChecklists').put(entry)
      }
    }
    
    if (data.gratitudeEntries) {
      for (const entry of data.gratitudeEntries) {
        await tx.objectStore('gratitudeEntries').put(entry)
      }
    }
    
    await tx.done
  },

  async clearAllData(): Promise<void> {
    const database = await getDB()
    const tx = database.transaction(['thoughtRecords', 'depressionChecklists', 'gratitudeEntries'], 'readwrite')
    await tx.objectStore('thoughtRecords').clear()
    await tx.objectStore('depressionChecklists').clear()
    await tx.objectStore('gratitudeEntries').clear()
    await tx.done
  }
}
