import { create } from 'zustand'
import { db } from '@/db'
import type { ThoughtRecord, DepressionChecklistEntry } from '@/types'

interface AppState {
  thoughtRecords: ThoughtRecord[]
  depressionChecklists: DepressionChecklistEntry[]
  isLoading: boolean
  currentView: 'home' | 'new-thought' | 'thought-detail' | 'checklist' | 'new-checklist' | 'insights' | 'settings'
  selectedRecordId: string | null

  loadData: () => Promise<void>
  addThoughtRecord: (record: ThoughtRecord) => Promise<void>
  updateThoughtRecord: (record: ThoughtRecord) => Promise<void>
  deleteThoughtRecord: (id: string) => Promise<void>
  addDepressionChecklist: (entry: DepressionChecklistEntry) => Promise<void>
  deleteDepressionChecklist: (id: string) => Promise<void>
  setView: (view: AppState['currentView']) => void
  setSelectedRecordId: (id: string | null) => void
  exportData: () => Promise<string>
  importData: (jsonString: string) => Promise<void>
}

export const useAppStore = create<AppState>((set, get) => ({
  thoughtRecords: [],
  depressionChecklists: [],
  isLoading: true,
  currentView: 'home',
  selectedRecordId: null,

  loadData: async () => {
    set({ isLoading: true })
    const [thoughtRecords, depressionChecklists] = await Promise.all([
      db.getAllThoughtRecords(),
      db.getAllDepressionChecklists()
    ])
    set({ thoughtRecords, depressionChecklists, isLoading: false })
  },

  addThoughtRecord: async (record) => {
    await db.addThoughtRecord(record)
    set((state) => ({
      thoughtRecords: [record, ...state.thoughtRecords]
    }))
  },

  updateThoughtRecord: async (record) => {
    await db.updateThoughtRecord(record)
    set((state) => ({
      thoughtRecords: state.thoughtRecords.map((r) => (r.id === record.id ? record : r))
    }))
  },

  deleteThoughtRecord: async (id) => {
    await db.deleteThoughtRecord(id)
    set((state) => ({
      thoughtRecords: state.thoughtRecords.filter((r) => r.id !== id)
    }))
  },

  addDepressionChecklist: async (entry) => {
    await db.addDepressionChecklist(entry)
    set((state) => ({
      depressionChecklists: [entry, ...state.depressionChecklists]
    }))
  },

  deleteDepressionChecklist: async (id) => {
    await db.deleteDepressionChecklist(id)
    set((state) => ({
      depressionChecklists: state.depressionChecklists.filter((e) => e.id !== id)
    }))
  },

  setView: (view) => set({ currentView: view }),

  setSelectedRecordId: (id) => set({ selectedRecordId: id }),

  exportData: async () => {
    const data = await db.exportData()
    return JSON.stringify(data, null, 2)
  },

  importData: async (jsonString) => {
    const data = JSON.parse(jsonString)
    await db.importData(data)
    await get().loadData()
  }
}))
