declare global {
  interface FileSystemHandlePermissionDescriptor {
    mode?: 'read' | 'readwrite'
  }

  interface FileSystemHandle {
    readonly kind: 'file' | 'directory'
    readonly name: string
    isSameEntry(other: FileSystemHandle): Promise<boolean>
    queryPermission(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>
    requestPermission(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>
  }

  interface FileSystemFileHandle extends FileSystemHandle {
    readonly kind: 'file'
    getFile(): Promise<File>
    createWritable(options?: FileSystemCreateWritableOptions): Promise<FileSystemWritableFileStream>
  }

  interface FileSystemCreateWritableOptions {
    keepExistingData?: boolean
  }

  interface FileSystemWritableFileStream extends WritableStream {
    write(data: FileSystemWriteChunkType): Promise<void>
    seek(position: number): Promise<void>
    truncate(size: number): Promise<void>
  }

  type FileSystemWriteChunkType =
    | BufferSource
    | Blob
    | string
    | { type: 'write'; position?: number; data: BufferSource | Blob | string }
    | { type: 'seek'; position: number }
    | { type: 'truncate'; size: number }

  interface FilePickerAcceptType {
    description?: string
    accept: Record<string, string | string[]>
  }

  interface OpenFilePickerOptions {
    multiple?: boolean
    excludeAcceptAllOption?: boolean
    types?: FilePickerAcceptType[]
    startIn?: 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos'
  }

  interface SaveFilePickerOptions {
    suggestedName?: string
    excludeAcceptAllOption?: boolean
    types?: FilePickerAcceptType[]
    startIn?: 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos'
  }

  interface Window {
    showOpenFilePicker(options?: OpenFilePickerOptions): Promise<FileSystemFileHandle[]>
    showSaveFilePicker(options?: SaveFilePickerOptions): Promise<FileSystemFileHandle>
  }
}

export {}
