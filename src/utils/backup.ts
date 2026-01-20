import { toast } from '@/stores/toastStore'
import { logger } from '@/utils/logger'
import { supportsFileSystemAccess } from '@/utils/platform'
import { openDB, IDBPDatabase } from 'idb'

const FILE_HANDLE_STORE = 'fileHandles'
const BACKUP_FILENAME = 'cbtjournal-data.json'

interface FileHandleDB {
  fileHandles: {
    key: string
    value: {
      handle: FileSystemFileHandle
      name: string
      lastUsed: string
    }
  }
}

let fileHandleDB: IDBPDatabase<FileHandleDB> | null = null

async function getFileHandleDB(): Promise<IDBPDatabase<FileHandleDB>> {
  if (!fileHandleDB) {
    fileHandleDB = await openDB<FileHandleDB>('cbtjournal-filehandles', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(FILE_HANDLE_STORE)) {
          db.createObjectStore(FILE_HANDLE_STORE, { keyPath: 'key' })
        }
      },
    })
  }
  return fileHandleDB
}

export const hasFileSystemAccess = (): boolean => {
  return supportsFileSystemAccess()
}

export const downloadBackup = async (jsonData: string): Promise<void> => {
  const blob = new Blob([jsonData], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `cbtjournal-backup-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export const storeFileHandle = async (handle: FileSystemFileHandle): Promise<void> => {
  try {
    const db = await getFileHandleDB()
    await db.put(FILE_HANDLE_STORE, {
      key: 'primary',
      handle,
      name: handle.name,
      lastUsed: new Date().toISOString(),
    })
    logger.debug('Backup', 'File handle stored', { name: handle.name })
  } catch (error) {
    logger.error('Backup', 'Failed to store file handle', error)
  }
}

export const getStoredFileHandle = async (): Promise<FileSystemFileHandle | null> => {
  try {
    const db = await getFileHandleDB()
    const record = await db.get(FILE_HANDLE_STORE, 'primary')
    if (record?.handle) {
      logger.debug('Backup', 'Retrieved stored file handle', { name: record.name })
      return record.handle
    }
  } catch (error) {
    logger.error('Backup', 'Failed to get stored file handle', error)
  }
  return null
}

export const clearStoredFileHandle = async (): Promise<void> => {
  try {
    const db = await getFileHandleDB()
    await db.delete(FILE_HANDLE_STORE, 'primary')
    logger.debug('Backup', 'Cleared stored file handle')
  } catch (error) {
    logger.error('Backup', 'Failed to clear file handle', error)
  }
}

export const verifyFileHandlePermission = async (
  handle: FileSystemFileHandle,
  mode: 'read' | 'readwrite' = 'readwrite'
): Promise<boolean> => {
  try {
    const options: FileSystemHandlePermissionDescriptor = { mode }

    if ((await handle.queryPermission(options)) === 'granted') {
      return true
    }

    if ((await handle.requestPermission(options)) === 'granted') {
      return true
    }

    return false
  } catch (error) {
    logger.error('Backup', 'Permission verification failed', error)
    return false
  }
}

export const setupAutoSave = async (): Promise<FileSystemFileHandle | null> => {
  if (!hasFileSystemAccess()) {
    toast.error('Auto-save is only available in Chrome and Edge')
    return null
  }

  try {
    const handle = await window.showSaveFilePicker({
      suggestedName: BACKUP_FILENAME,
      types: [
        {
          description: 'JSON Files',
          accept: { 'application/json': ['.json'] },
        },
      ],
    })

    await storeFileHandle(handle)
    toast.success('Save location configured')
    return handle
  } catch (error: unknown) {
    if (error instanceof Error && error.name !== 'AbortError') {
      logger.error('Backup', 'Setup auto-save failed', error)
      toast.error('Failed to set up auto-save')
    }
    return null
  }
}

export const initAutoSave = async (): Promise<FileSystemFileHandle | null> => {
  if (!hasFileSystemAccess()) {
    return null
  }

  const storedHandle = await getStoredFileHandle()
  if (!storedHandle) {
    return null
  }

  const hasPermission = await verifyFileHandlePermission(storedHandle)
  if (!hasPermission) {
    logger.info('Backup', 'File handle exists but permission denied/not granted')
    return null
  }

  logger.info('Backup', 'Auto-save initialized with stored file handle')
  return storedHandle
}

export const saveToFile = async (
  handle: FileSystemFileHandle,
  jsonData: string
): Promise<boolean> => {
  try {
    const writable = await handle.createWritable()
    await writable.write(jsonData)
    await writable.close()

    await storeFileHandle(handle)

    logger.debug('Backup', 'Saved to file', { name: handle.name, size: jsonData.length })
    return true
  } catch (error) {
    logger.error('Backup', 'Save to file failed', error)
    return false
  }
}

export const loadFromFile = async (): Promise<string | null> => {
  if (!hasFileSystemAccess()) {
    return null
  }

  try {
    const [handle] = await window.showOpenFilePicker({
      types: [
        {
          description: 'JSON Files',
          accept: { 'application/json': ['.json'] },
        },
      ],
      multiple: false,
    })

    const file = await handle.getFile()
    const text = await file.text()
    return text
  } catch (error: unknown) {
    if (error instanceof Error && error.name !== 'AbortError') {
      toast.error('Failed to load file')
    }
    return null
  }
}

export const loadFromStoredFile = async (): Promise<{
  data: string
  handle: FileSystemFileHandle
} | null> => {
  if (!hasFileSystemAccess()) {
    return null
  }

  const handle = await getStoredFileHandle()
  if (!handle) {
    return null
  }

  const hasPermission = await verifyFileHandlePermission(handle, 'read')
  if (!hasPermission) {
    return null
  }

  try {
    const file = await handle.getFile()
    const data = await file.text()
    logger.info('Backup', 'Loaded from stored file', { name: handle.name, size: data.length })
    return { data, handle }
  } catch (error) {
    logger.error('Backup', 'Failed to load from stored file', error)
    return null
  }
}

export const loadMultipleFiles = async (): Promise<string[]> => {
  if (!hasFileSystemAccess()) {
    return []
  }

  try {
    const handles = await window.showOpenFilePicker({
      types: [
        {
          description: 'JSON Files',
          accept: { 'application/json': ['.json'] },
        },
      ],
      multiple: true,
    })

    const results: string[] = []
    for (const handle of handles) {
      const file = await handle.getFile()
      const text = await file.text()
      results.push(text)
    }

    return results
  } catch (error: unknown) {
    if (error instanceof Error && error.name !== 'AbortError') {
      toast.error('Failed to load files')
    }
    return []
  }
}

export const getStoredFileName = async (): Promise<string | null> => {
  const handle = await getStoredFileHandle()
  return handle?.name || null
}
