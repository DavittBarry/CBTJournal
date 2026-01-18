import { toast } from '@/stores/toastStore'
import { supportsFileSystemAccess } from '@/utils/platform'

export const hasFileSystemAccess = (): boolean => {
  return supportsFileSystemAccess()
}

export const downloadBackup = async (jsonData: string): Promise<void> => {
  const blob = new Blob([jsonData], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `untwist-backup-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export const setupAutoSave = async (): Promise<FileSystemFileHandle | null> => {
  if (!hasFileSystemAccess()) {
    toast.error('Auto-save is only available in Chrome and Edge')
    return null
  }

  try {
    const handle = await (window as any).showSaveFilePicker({
      suggestedName: 'untwist-data.json',
      types: [
        {
          description: 'JSON Files',
          accept: { 'application/json': ['.json'] }
        }
      ]
    })
    
    toast.success('Auto-save location selected')
    return handle
  } catch (error: any) {
    if (error.name !== 'AbortError') {
      toast.error('Failed to set up auto-save')
    }
    return null
  }
}

export const saveToFile = async (
  handle: FileSystemFileHandle,
  jsonData: string
): Promise<boolean> => {
  try {
    const writable = await handle.createWritable()
    await writable.write(jsonData)
    await writable.close()
    return true
  } catch (error) {
    console.error('Auto-save failed:', error)
    return false
  }
}

export const loadFromFile = async (): Promise<string | null> => {
  if (!hasFileSystemAccess()) {
    return null
  }

  try {
    const [handle] = await (window as any).showOpenFilePicker({
      types: [
        {
          description: 'JSON Files',
          accept: { 'application/json': ['.json'] }
        }
      ],
      multiple: false
    })
    
    const file = await handle.getFile()
    const text = await file.text()
    return text
  } catch (error: any) {
    if (error.name !== 'AbortError') {
      toast.error('Failed to load file')
    }
    return null
  }
}

export const loadMultipleFiles = async (): Promise<string[]> => {
  if (!hasFileSystemAccess()) {
    return []
  }

  try {
    const handles = await (window as any).showOpenFilePicker({
      types: [
        {
          description: 'JSON Files',
          accept: { 'application/json': ['.json'] }
        }
      ],
      multiple: true
    })
    
    const results: string[] = []
    for (const handle of handles) {
      const file = await handle.getFile()
      const text = await file.text()
      results.push(text)
    }
    
    return results
  } catch (error: any) {
    if (error.name !== 'AbortError') {
      toast.error('Failed to load files')
    }
    return []
  }
}
