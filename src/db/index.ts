import { openDB, DBSchema, IDBPDatabase } from 'idb'
import type {
  ThoughtRecord,
  DepressionChecklistEntry,
  GratitudeEntry,
  MoodCheckEntry,
  ActivityEntry,
  SafetyPlan,
  CopingSkillLog,
} from '@/types'
import { logger } from '@/utils/logger'
import { toast } from '@/stores/toastStore'

interface CBTJournalDB extends DBSchema {
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
  moodChecks: {
    key: string
    value: MoodCheckEntry
    indexes: { 'by-date': string; 'by-type': string }
  }
  activities: {
    key: string
    value: ActivityEntry
    indexes: { 'by-date': string; 'by-category': string }
  }
  safetyPlans: {
    key: string
    value: SafetyPlan
  }
  copingSkillLogs: {
    key: string
    value: CopingSkillLog
    indexes: { 'by-date': string; 'by-category': string }
  }
}

let dbPromise: Promise<IDBPDatabase<CBTJournalDB>> | null = null

function getDB() {
  if (!dbPromise) {
    logger.debug('DB', 'Initializing IndexedDB connection')

    dbPromise = openDB<CBTJournalDB>('cbtjournal', 3, {
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

        if (oldVersion < 3) {
          const moodStore = db.createObjectStore('moodChecks', { keyPath: 'id' })
          moodStore.createIndex('by-date', 'date')
          moodStore.createIndex('by-type', 'type')

          const activityStore = db.createObjectStore('activities', { keyPath: 'id' })
          activityStore.createIndex('by-date', 'date')
          activityStore.createIndex('by-category', 'category')

          db.createObjectStore('safetyPlans', { keyPath: 'id' })

          const copingStore = db.createObjectStore('copingSkillLogs', { keyPath: 'id' })
          copingStore.createIndex('by-date', 'date')
          copingStore.createIndex('by-category', 'category')
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
      },
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
    return withErrorHandling(
      'Add thought record',
      async () => {
        const database = await getDB()
        await database.add('thoughtRecords', record)
        logger.debug('DB', 'Added thought record', { id: record.id })
        return record.id
      },
      true
    )
  },

  async updateThoughtRecord(record: ThoughtRecord): Promise<void> {
    return withErrorHandling(
      'Update thought record',
      async () => {
        const database = await getDB()
        await database.put('thoughtRecords', record)
        logger.debug('DB', 'Updated thought record', { id: record.id })
      },
      true
    )
  },

  async deleteThoughtRecord(id: string): Promise<void> {
    return withErrorHandling(
      'Delete thought record',
      async () => {
        const database = await getDB()
        await database.delete('thoughtRecords', id)
        logger.debug('DB', 'Deleted thought record', { id })
      },
      true
    )
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
      return records.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    })
  },

  async getThoughtRecordsByDateRange(startDate: string, endDate: string): Promise<ThoughtRecord[]> {
    return withErrorHandling('Get thought records by date range', async () => {
      const database = await getDB()
      const records = await database.getAllFromIndex(
        'thoughtRecords',
        'by-date',
        IDBKeyRange.bound(startDate, endDate)
      )
      return records.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    })
  },

  async addDepressionChecklist(entry: DepressionChecklistEntry): Promise<string> {
    return withErrorHandling(
      'Add depression checklist',
      async () => {
        const database = await getDB()
        await database.add('depressionChecklists', entry)
        logger.debug('DB', 'Added depression checklist', { id: entry.id })
        return entry.id
      },
      true
    )
  },

  async updateDepressionChecklist(entry: DepressionChecklistEntry): Promise<void> {
    return withErrorHandling(
      'Update depression checklist',
      async () => {
        const database = await getDB()
        await database.put('depressionChecklists', entry)
        logger.debug('DB', 'Updated depression checklist', { id: entry.id })
      },
      true
    )
  },

  async deleteDepressionChecklist(id: string): Promise<void> {
    return withErrorHandling(
      'Delete depression checklist',
      async () => {
        const database = await getDB()
        await database.delete('depressionChecklists', id)
        logger.debug('DB', 'Deleted depression checklist', { id })
      },
      true
    )
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
    return withErrorHandling(
      'Add gratitude entry',
      async () => {
        const database = await getDB()
        await database.add('gratitudeEntries', entry)
        logger.debug('DB', 'Added gratitude entry', { id: entry.id })
        return entry.id
      },
      true
    )
  },

  async updateGratitudeEntry(entry: GratitudeEntry): Promise<void> {
    return withErrorHandling(
      'Update gratitude entry',
      async () => {
        const database = await getDB()
        await database.put('gratitudeEntries', entry)
        logger.debug('DB', 'Updated gratitude entry', { id: entry.id })
      },
      true
    )
  },

  async deleteGratitudeEntry(id: string): Promise<void> {
    return withErrorHandling(
      'Delete gratitude entry',
      async () => {
        const database = await getDB()
        await database.delete('gratitudeEntries', id)
        logger.debug('DB', 'Deleted gratitude entry', { id })
      },
      true
    )
  },

  async getAllGratitudeEntries(): Promise<GratitudeEntry[]> {
    return withErrorHandling('Get all gratitude entries', async () => {
      const database = await getDB()
      const entries = await database.getAll('gratitudeEntries')
      logger.debug('DB', 'Retrieved gratitude entries', { count: entries.length })
      return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    })
  },

  async addMoodCheck(entry: MoodCheckEntry): Promise<string> {
    return withErrorHandling(
      'Add mood check',
      async () => {
        const database = await getDB()
        await database.add('moodChecks', entry)
        logger.debug('DB', 'Added mood check', { id: entry.id })
        return entry.id
      },
      true
    )
  },

  async updateMoodCheck(entry: MoodCheckEntry): Promise<void> {
    return withErrorHandling(
      'Update mood check',
      async () => {
        const database = await getDB()
        await database.put('moodChecks', entry)
        logger.debug('DB', 'Updated mood check', { id: entry.id })
      },
      true
    )
  },

  async deleteMoodCheck(id: string): Promise<void> {
    return withErrorHandling(
      'Delete mood check',
      async () => {
        const database = await getDB()
        await database.delete('moodChecks', id)
        logger.debug('DB', 'Deleted mood check', { id })
      },
      true
    )
  },

  async getAllMoodChecks(): Promise<MoodCheckEntry[]> {
    return withErrorHandling('Get all mood checks', async () => {
      const database = await getDB()
      const entries = await database.getAll('moodChecks')
      logger.debug('DB', 'Retrieved mood checks', { count: entries.length })
      return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    })
  },

  async getMoodChecksByType(type: 'phq9' | 'gad7' | 'quick'): Promise<MoodCheckEntry[]> {
    return withErrorHandling('Get mood checks by type', async () => {
      const database = await getDB()
      const entries = await database.getAllFromIndex('moodChecks', 'by-type', type)
      return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    })
  },

  async addActivity(entry: ActivityEntry): Promise<string> {
    return withErrorHandling(
      'Add activity',
      async () => {
        const database = await getDB()
        await database.add('activities', entry)
        logger.debug('DB', 'Added activity', { id: entry.id })
        return entry.id
      },
      true
    )
  },

  async updateActivity(entry: ActivityEntry): Promise<void> {
    return withErrorHandling(
      'Update activity',
      async () => {
        const database = await getDB()
        await database.put('activities', entry)
        logger.debug('DB', 'Updated activity', { id: entry.id })
      },
      true
    )
  },

  async deleteActivity(id: string): Promise<void> {
    return withErrorHandling(
      'Delete activity',
      async () => {
        const database = await getDB()
        await database.delete('activities', id)
        logger.debug('DB', 'Deleted activity', { id })
      },
      true
    )
  },

  async getAllActivities(): Promise<ActivityEntry[]> {
    return withErrorHandling('Get all activities', async () => {
      const database = await getDB()
      const entries = await database.getAll('activities')
      logger.debug('DB', 'Retrieved activities', { count: entries.length })
      return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    })
  },

  async getActivitiesByDateRange(startDate: string, endDate: string): Promise<ActivityEntry[]> {
    return withErrorHandling('Get activities by date range', async () => {
      const database = await getDB()
      const entries = await database.getAllFromIndex(
        'activities',
        'by-date',
        IDBKeyRange.bound(startDate, endDate)
      )
      return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    })
  },

  async saveSafetyPlan(plan: SafetyPlan): Promise<string> {
    return withErrorHandling(
      'Save safety plan',
      async () => {
        const database = await getDB()
        await database.put('safetyPlans', plan)
        logger.debug('DB', 'Saved safety plan', { id: plan.id })
        return plan.id
      },
      true
    )
  },

  async getSafetyPlan(): Promise<SafetyPlan | undefined> {
    return withErrorHandling('Get safety plan', async () => {
      const database = await getDB()
      const plans = await database.getAll('safetyPlans')
      return plans.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0]
    })
  },

  async addCopingSkillLog(entry: CopingSkillLog): Promise<string> {
    return withErrorHandling(
      'Add coping skill log',
      async () => {
        const database = await getDB()
        await database.add('copingSkillLogs', entry)
        logger.debug('DB', 'Added coping skill log', { id: entry.id })
        return entry.id
      },
      true
    )
  },

  async getAllCopingSkillLogs(): Promise<CopingSkillLog[]> {
    return withErrorHandling('Get all coping skill logs', async () => {
      const database = await getDB()
      const entries = await database.getAll('copingSkillLogs')
      logger.debug('DB', 'Retrieved coping skill logs', { count: entries.length })
      return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    })
  },

  async deleteCopingSkillLog(id: string): Promise<void> {
    return withErrorHandling(
      'Delete coping skill log',
      async () => {
        const database = await getDB()
        await database.delete('copingSkillLogs', id)
        logger.debug('DB', 'Deleted coping skill log', { id })
      },
      true
    )
  },

  async exportData(): Promise<{
    thoughtRecords: ThoughtRecord[]
    depressionChecklists: DepressionChecklistEntry[]
    gratitudeEntries: GratitudeEntry[]
    moodChecks: MoodCheckEntry[]
    activities: ActivityEntry[]
    safetyPlans: SafetyPlan[]
    copingSkillLogs: CopingSkillLog[]
  }> {
    return withErrorHandling(
      'Export data',
      async () => {
        const database = await getDB()
        const data = {
          thoughtRecords: await database.getAll('thoughtRecords'),
          depressionChecklists: await database.getAll('depressionChecklists'),
          gratitudeEntries: await database.getAll('gratitudeEntries'),
          moodChecks: await database.getAll('moodChecks'),
          activities: await database.getAll('activities'),
          safetyPlans: await database.getAll('safetyPlans'),
          copingSkillLogs: await database.getAll('copingSkillLogs'),
        }
        logger.info('DB', 'Exported data', {
          thoughtRecords: data.thoughtRecords.length,
          depressionChecklists: data.depressionChecklists.length,
          gratitudeEntries: data.gratitudeEntries.length,
          moodChecks: data.moodChecks.length,
          activities: data.activities.length,
          safetyPlans: data.safetyPlans.length,
          copingSkillLogs: data.copingSkillLogs.length,
        })
        return data
      },
      true
    )
  },

  async importData(
    data: {
      thoughtRecords?: ThoughtRecord[]
      depressionChecklists?: DepressionChecklistEntry[]
      gratitudeEntries?: GratitudeEntry[]
      moodChecks?: MoodCheckEntry[]
      activities?: ActivityEntry[]
      safetyPlans?: SafetyPlan[]
      copingSkillLogs?: CopingSkillLog[]
    },
    mode: 'merge' | 'replace' = 'merge'
  ): Promise<{
    imported: {
      thoughtRecords: number
      depressionChecklists: number
      gratitudeEntries: number
      moodChecks: number
      activities: number
      safetyPlans: number
      copingSkillLogs: number
    }
  }> {
    return withErrorHandling(
      'Import data',
      async () => {
        const database = await getDB()
        const tx = database.transaction(
          [
            'thoughtRecords',
            'depressionChecklists',
            'gratitudeEntries',
            'moodChecks',
            'activities',
            'safetyPlans',
            'copingSkillLogs',
          ],
          'readwrite'
        )

        logger.info('DB', 'Starting data import', { mode })

        if (mode === 'replace') {
          await tx.objectStore('thoughtRecords').clear()
          await tx.objectStore('depressionChecklists').clear()
          await tx.objectStore('gratitudeEntries').clear()
          await tx.objectStore('moodChecks').clear()
          await tx.objectStore('activities').clear()
          await tx.objectStore('safetyPlans').clear()
          await tx.objectStore('copingSkillLogs').clear()
          logger.debug('DB', 'Cleared existing data for replace mode')
        }

        const imported = {
          thoughtRecords: 0,
          depressionChecklists: 0,
          gratitudeEntries: 0,
          moodChecks: 0,
          activities: 0,
          safetyPlans: 0,
          copingSkillLogs: 0,
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

        if (data.moodChecks) {
          for (const entry of data.moodChecks) {
            await tx.objectStore('moodChecks').put(entry)
            imported.moodChecks++
          }
        }

        if (data.activities) {
          for (const entry of data.activities) {
            await tx.objectStore('activities').put(entry)
            imported.activities++
          }
        }

        if (data.safetyPlans) {
          for (const entry of data.safetyPlans) {
            await tx.objectStore('safetyPlans').put(entry)
            imported.safetyPlans++
          }
        }

        if (data.copingSkillLogs) {
          for (const entry of data.copingSkillLogs) {
            await tx.objectStore('copingSkillLogs').put(entry)
            imported.copingSkillLogs++
          }
        }

        await tx.done

        logger.info('DB', 'Data import completed', imported)
        return { imported }
      },
      true
    )
  },

  async clearAllData(): Promise<void> {
    return withErrorHandling(
      'Clear all data',
      async () => {
        const database = await getDB()
        const tx = database.transaction(
          [
            'thoughtRecords',
            'depressionChecklists',
            'gratitudeEntries',
            'moodChecks',
            'activities',
            'safetyPlans',
            'copingSkillLogs',
          ],
          'readwrite'
        )
        await tx.objectStore('thoughtRecords').clear()
        await tx.objectStore('depressionChecklists').clear()
        await tx.objectStore('gratitudeEntries').clear()
        await tx.objectStore('moodChecks').clear()
        await tx.objectStore('activities').clear()
        await tx.objectStore('safetyPlans').clear()
        await tx.objectStore('copingSkillLogs').clear()
        await tx.done
        logger.info('DB', 'Cleared all data')
      },
      true
    )
  },

  async getStats(): Promise<{
    thoughtRecords: number
    depressionChecklists: number
    gratitudeEntries: number
    moodChecks: number
    activities: number
    copingSkillLogs: number
  }> {
    return withErrorHandling('Get stats', async () => {
      const database = await getDB()
      return {
        thoughtRecords: await database.count('thoughtRecords'),
        depressionChecklists: await database.count('depressionChecklists'),
        gratitudeEntries: await database.count('gratitudeEntries'),
        moodChecks: await database.count('moodChecks'),
        activities: await database.count('activities'),
        copingSkillLogs: await database.count('copingSkillLogs'),
      }
    })
  },
}
