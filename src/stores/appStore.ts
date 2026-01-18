import { create } from 'zustand'
import { db } from '@/db'
import type { ThoughtRecord, DepressionChecklistEntry, GratitudeEntry } from '@/types'
import { useBackupStore } from '@/stores/backupStore'
import { saveToFile } from '@/utils/backup'

interface AppState {
  thoughtRecords: ThoughtRecord[]
  depressionChecklists: DepressionChecklistEntry[]
  gratitudeEntries: GratitudeEntry[]
  isLoading: boolean
  currentView: 'home' | 'new-thought' | 'thought-detail' | 'checklist' | 'new-checklist' | 'checklist-detail' | 'gratitude' | 'new-gratitude' | 'insights' | 'settings'
  selectedRecordId: string | null
  selectedGratitudeId: string | null
  selectedChecklistId: string | null

  loadData: () => Promise<void>
  addThoughtRecord: (record: ThoughtRecord) => Promise<void>
  updateThoughtRecord: (record: ThoughtRecord) => Promise<void>
  deleteThoughtRecord: (id: string) => Promise<void>
  addDepressionChecklist: (entry: DepressionChecklistEntry) => Promise<void>
  updateDepressionChecklist: (entry: DepressionChecklistEntry) => Promise<void>
  deleteDepressionChecklist: (id: string) => Promise<void>
  addGratitudeEntry: (entry: GratitudeEntry) => Promise<void>
  updateGratitudeEntry: (entry: GratitudeEntry) => Promise<void>
  deleteGratitudeEntry: (id: string) => Promise<void>
  setView: (view: AppState['currentView']) => void
  setSelectedRecordId: (id: string | null) => void
  setSelectedGratitudeId: (id: string | null) => void
  setSelectedChecklistId: (id: string | null) => void
  exportData: () => Promise<string>
  importData: (jsonString: string, mode?: 'merge' | 'replace') => Promise<void>
  tryAutoSave: () => Promise<void>
}

export const useAppStore = create<AppState>((set, get) => ({
  thoughtRecords: [],
  depressionChecklists: [],
  gratitudeEntries: [],
  isLoading: true,
  currentView: 'home',
  selectedRecordId: null,
  selectedGratitudeId: null,
  selectedChecklistId: null,

  loadData: async () => {
    set({ isLoading: true })
    const [thoughtRecords, depressionChecklists, gratitudeEntries] = await Promise.all([
      db.getAllThoughtRecords(),
      db.getAllDepressionChecklists(),
      db.getAllGratitudeEntries()
    ])
    set({ thoughtRecords, depressionChecklists, gratitudeEntries, isLoading: false })
  },

  addThoughtRecord: async (record) => {
    await db.addThoughtRecord(record)
    set((state) => ({
      thoughtRecords: [record, ...state.thoughtRecords]
    }))
    await get().tryAutoSave()
  },

  updateThoughtRecord: async (record) => {
    await db.updateThoughtRecord(record)
    set((state) => ({
      thoughtRecords: state.thoughtRecords.map((r) => (r.id === record.id ? record : r))
    }))
    await get().tryAutoSave()
  },

  deleteThoughtRecord: async (id) => {
    await db.deleteThoughtRecord(id)
    set((state) => ({
      thoughtRecords: state.thoughtRecords.filter((r) => r.id !== id)
    }))
    await get().tryAutoSave()
  },

  addDepressionChecklist: async (entry) => {
    await db.addDepressionChecklist(entry)
    set((state) => ({
      depressionChecklists: [entry, ...state.depressionChecklists]
    }))
    await get().tryAutoSave()
  },

  updateDepressionChecklist: async (entry) => {
    await db.updateDepressionChecklist(entry)
    set((state) => ({
      depressionChecklists: state.depressionChecklists.map((e) => (e.id === entry.id ? entry : e))
    }))
    await get().tryAutoSave()
  },

  deleteDepressionChecklist: async (id) => {
    await db.deleteDepressionChecklist(id)
    set((state) => ({
      depressionChecklists: state.depressionChecklists.filter((e) => e.id !== id)
    }))
    await get().tryAutoSave()
  },

  addGratitudeEntry: async (entry) => {
    await db.addGratitudeEntry(entry)
    set((state) => ({
      gratitudeEntries: [entry, ...state.gratitudeEntries]
    }))
    await get().tryAutoSave()
  },

  updateGratitudeEntry: async (entry) => {
    await db.updateGratitudeEntry(entry)
    set((state) => ({
      gratitudeEntries: state.gratitudeEntries.map((e) => (e.id === entry.id ? entry : e))
    }))
    await get().tryAutoSave()
  },

  deleteGratitudeEntry: async (id) => {
    await db.deleteGratitudeEntry(id)
    set((state) => ({
      gratitudeEntries: state.gratitudeEntries.filter((e) => e.id !== id)
    }))
    await get().tryAutoSave()
  },

  setView: (view) => set({ currentView: view }),

  setSelectedRecordId: (id) => set({ selectedRecordId: id }),

  setSelectedGratitudeId: (id) => set({ selectedGratitudeId: id }),

  setSelectedChecklistId: (id) => set({ selectedChecklistId: id }),

  exportData: async () => {
    const data = await db.exportData()
    return JSON.stringify(data, null, 2)
  },

  importData: async (jsonString, mode: 'merge' | 'replace' = 'merge') => {
    const data = JSON.parse(jsonString)
    await db.importData(data, mode)
    await get().loadData()
  },

  tryAutoSave: async () => {
    const backupState = useBackupStore.getState()
    if (!backupState.autoSaveEnabled) return

    const fileHandle = (window as any).__autoSaveFileHandle
    if (!fileHandle) return

    try {
      const jsonData = await get().exportData()
      await saveToFile(fileHandle, jsonData)
    } catch (error) {
      console.error('Auto-save failed:', error)
    }
  }
}))
