import { toast } from '@/stores/toastStore'
import { logger } from '@/utils/logger'

export type CloudProvider = 'google-drive' | 'dropbox' | null

export interface CloudConnection {
  provider: CloudProvider
  accessToken: string
  refreshToken?: string
  expiresAt?: number
  fileId?: string
  fileName?: string
  lastSyncAt?: string
}

export interface SyncResult {
  success: boolean
  data?: string
  error?: string
  lastModified?: string
}

interface GoogleTokenResponse {
  access_token: string
  error?: string
}

interface GoogleTokenClient {
  requestAccessToken: (options: { prompt: string }) => void
}

interface GoogleOAuth2 {
  initTokenClient: (config: {
    client_id: string
    scope: string
    callback: (response: GoogleTokenResponse) => void
  }) => GoogleTokenClient
}

interface GoogleAccounts {
  oauth2: GoogleOAuth2
}

interface GoogleIdentityServices {
  accounts: GoogleAccounts
}

interface GapiClient {
  init: (config: { apiKey: string; discoveryDocs: string[] }) => Promise<void>
  setToken: (token: { access_token: string } | null) => void
  drive: {
    files: {
      list: (params: { q: string; spaces: string; fields: string }) => Promise<{
        result: { files?: Array<{ id: string; name: string; modifiedTime?: string }> }
      }>
      create: (params: {
        resource: { name: string; mimeType: string }
        fields: string
      }) => Promise<{ result: { id: string } }>
    }
  }
}

interface Gapi {
  load: (api: string, callback: () => void) => void
  client: GapiClient
}

interface WindowWithGoogleApis extends Window {
  gapi?: Gapi
  google?: GoogleIdentityServices
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || ''
const DROPBOX_APP_KEY = import.meta.env.VITE_DROPBOX_APP_KEY || ''

const BACKUP_FILENAME = 'cbtjournal-data.json'

let googleTokenClient: GoogleTokenClient | null = null

const getWindow = (): WindowWithGoogleApis => window as WindowWithGoogleApis

export const isGoogleDriveConfigured = (): boolean => {
  return Boolean(GOOGLE_CLIENT_ID && GOOGLE_API_KEY)
}

export const isDropboxConfigured = (): boolean => {
  return Boolean(DROPBOX_APP_KEY)
}

export const loadGoogleApi = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!isGoogleDriveConfigured()) {
      reject(new Error('Google Drive is not configured'))
      return
    }

    const win = getWindow()
    if (win.gapi?.client?.drive) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://apis.google.com/js/api.js'
    script.onload = () => {
      const gapi = win.gapi
      if (!gapi) {
        reject(new Error('Failed to load Google API'))
        return
      }
      gapi.load('client', async () => {
        try {
          await gapi.client.init({
            apiKey: GOOGLE_API_KEY,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
          })
          resolve()
        } catch (err) {
          reject(err)
        }
      })
    }
    script.onerror = reject
    document.head.appendChild(script)
  })
}

export const loadGoogleIdentityServices = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!isGoogleDriveConfigured()) {
      reject(new Error('Google Drive is not configured'))
      return
    }

    const win = getWindow()
    if (win.google?.accounts?.oauth2) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.onload = () => resolve()
    script.onerror = reject
    document.head.appendChild(script)
  })
}

export const initGoogleDriveAuth = async (): Promise<string> => {
  await loadGoogleApi()
  await loadGoogleIdentityServices()

  const win = getWindow()
  if (!win.google?.accounts?.oauth2) {
    throw new Error('Google Identity Services not loaded')
  }

  return new Promise((resolve, reject) => {
    googleTokenClient = win.google!.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/drive.file',
      callback: (response: GoogleTokenResponse) => {
        if (response.error) {
          logger.error('CloudSync', 'Google auth failed', response)
          reject(new Error(response.error))
          return
        }
        logger.info('CloudSync', 'Google Drive authenticated')
        resolve(response.access_token)
      },
    })

    googleTokenClient.requestAccessToken({ prompt: 'consent' })
  })
}

export const findOrCreateGoogleDriveFile = async (accessToken: string): Promise<string> => {
  const win = getWindow()
  const gapi = win.gapi
  if (!gapi?.client) {
    throw new Error('Google API not loaded')
  }

  gapi.client.setToken({ access_token: accessToken })

  const searchResponse = await gapi.client.drive.files.list({
    q: `name='${BACKUP_FILENAME}' and trashed=false`,
    spaces: 'drive',
    fields: 'files(id, name, modifiedTime)',
  })

  const files = searchResponse.result.files || []

  if (files.length > 0) {
    logger.info('CloudSync', 'Found existing Google Drive file', { fileId: files[0].id })
    return files[0].id
  }

  const metadata = {
    name: BACKUP_FILENAME,
    mimeType: 'application/json',
  }

  const createResponse = await gapi.client.drive.files.create({
    resource: metadata,
    fields: 'id',
  })

  logger.info('CloudSync', 'Created new Google Drive file', { fileId: createResponse.result.id })
  return createResponse.result.id
}

export const saveToGoogleDrive = async (
  accessToken: string,
  fileId: string,
  jsonData: string
): Promise<SyncResult> => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: jsonData,
      }
    )

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`)
    }

    logger.info('CloudSync', 'Saved to Google Drive')
    return { success: true, lastModified: new Date().toISOString() }
  } catch (error) {
    logger.error('CloudSync', 'Google Drive save failed', error)
    return { success: false, error: String(error) }
  }
}

export const loadFromGoogleDrive = async (
  accessToken: string,
  fileId: string
): Promise<SyncResult> => {
  try {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return { success: true, data: '' }
      }
      throw new Error(`Download failed: ${response.status}`)
    }

    const data = await response.text()
    logger.info('CloudSync', 'Loaded from Google Drive', { size: data.length })
    return { success: true, data }
  } catch (error) {
    logger.error('CloudSync', 'Google Drive load failed', error)
    return { success: false, error: String(error) }
  }
}

export const initDropboxAuth = async (): Promise<string> => {
  if (!isDropboxConfigured()) {
    throw new Error('Dropbox is not configured')
  }

  return new Promise((resolve, reject) => {
    const redirectUri = `${window.location.origin}/dropbox-callback.html`
    const state = Math.random().toString(36).substring(7)

    sessionStorage.setItem('dropbox_state', state)

    const authUrl = new URL('https://www.dropbox.com/oauth2/authorize')
    authUrl.searchParams.set('client_id', DROPBOX_APP_KEY)
    authUrl.searchParams.set('response_type', 'token')
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('state', state)

    const width = 500
    const height = 600
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2

    const popup = window.open(
      authUrl.toString(),
      'dropbox-auth',
      `width=${width},height=${height},left=${left},top=${top}`
    )

    if (!popup) {
      reject(new Error('Popup blocked'))
      return
    }

    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed)
        const token = sessionStorage.getItem('dropbox_token')
        sessionStorage.removeItem('dropbox_token')
        sessionStorage.removeItem('dropbox_state')

        if (token) {
          logger.info('CloudSync', 'Dropbox authenticated')
          resolve(token)
        } else {
          reject(new Error('Authentication cancelled'))
        }
      }
    }, 500)

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      if (event.data?.type === 'dropbox-auth') {
        clearInterval(checkClosed)
        window.removeEventListener('message', handleMessage)
        popup?.close()

        if (event.data.error) {
          sessionStorage.removeItem('dropbox_state')
          reject(new Error(event.data.error))
          return
        }

        // Validate state parameter
        const storedState = sessionStorage.getItem('dropbox_state')
        sessionStorage.removeItem('dropbox_state')

        if (event.data.token && event.data.state === storedState) {
          logger.info('CloudSync', 'Dropbox authenticated via message')
          resolve(event.data.token)
        } else {
          reject(new Error('State mismatch - possible CSRF attack'))
        }
      }
    }

    window.addEventListener('message', handleMessage)
  })
}

export const saveToDropbox = async (accessToken: string, jsonData: string): Promise<SyncResult> => {
  try {
    const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/octet-stream',
        'Dropbox-API-Arg': JSON.stringify({
          path: `/${BACKUP_FILENAME}`,
          mode: 'overwrite',
          autorename: false,
          mute: true,
        }),
      },
      body: jsonData,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Upload failed: ${error}`)
    }

    logger.info('CloudSync', 'Saved to Dropbox')
    return { success: true, lastModified: new Date().toISOString() }
  } catch (error) {
    logger.error('CloudSync', 'Dropbox save failed', error)
    return { success: false, error: String(error) }
  }
}

export const loadFromDropbox = async (accessToken: string): Promise<SyncResult> => {
  try {
    const response = await fetch('https://content.dropboxapi.com/2/files/download', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Dropbox-API-Arg': JSON.stringify({
          path: `/${BACKUP_FILENAME}`,
        }),
      },
    })

    if (!response.ok) {
      if (response.status === 409) {
        const errorData = await response.json()
        if (
          errorData?.error?.['.tag'] === 'path' &&
          errorData?.error?.path?.['.tag'] === 'not_found'
        ) {
          return { success: true, data: '' }
        }
      }
      throw new Error(`Download failed: ${response.status}`)
    }

    const data = await response.text()
    logger.info('CloudSync', 'Loaded from Dropbox', { size: data.length })
    return { success: true, data }
  } catch (error) {
    logger.error('CloudSync', 'Dropbox load failed', error)
    return { success: false, error: String(error) }
  }
}

export const disconnectCloud = async (provider: CloudProvider): Promise<void> => {
  if (provider === 'google-drive') {
    const win = getWindow()
    const gapi = win.gapi
    if (gapi?.client) {
      gapi.client.setToken(null)
    }
    googleTokenClient = null
  }

  logger.info('CloudSync', 'Disconnected from cloud', { provider })
  toast.info(`Disconnected from ${provider === 'google-drive' ? 'Google Drive' : 'Dropbox'}`)
}

export const reauthorizeGoogleDrive = async (): Promise<string | null> => {
  if (!isGoogleDriveConfigured()) {
    return null
  }

  try {
    await loadGoogleApi()
    await loadGoogleIdentityServices()

    const win = getWindow()
    if (!win.google?.accounts?.oauth2) {
      return null
    }

    return new Promise((resolve) => {
      googleTokenClient = win.google!.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/drive.file',
        callback: (response: GoogleTokenResponse) => {
          if (response.error) {
            logger.warn('CloudSync', 'Google re-auth failed', response)
            resolve(null)
            return
          }
          logger.info('CloudSync', 'Google Drive re-authenticated')
          resolve(response.access_token)
        },
      })

      googleTokenClient.requestAccessToken({ prompt: '' })
    })
  } catch (error) {
    logger.error('CloudSync', 'Failed to re-authorize Google Drive', error)
    return null
  }
}

export const validateGoogleToken = async (accessToken: string): Promise<boolean> => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`
    )
    return response.ok
  } catch {
    return false
  }
}

export const validateDropboxToken = async (accessToken: string): Promise<boolean> => {
  try {
    const response = await fetch('https://api.dropboxapi.com/2/users/get_current_account', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    return response.ok
  } catch {
    return false
  }
}

export const getGoogleDriveFileMetadata = async (
  accessToken: string,
  fileId: string
): Promise<{ modifiedTime: string } | null> => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=modifiedTime`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )
    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}

export const getDropboxFileMetadata = async (
  accessToken: string
): Promise<{ server_modified: string } | null> => {
  try {
    const response = await fetch('https://api.dropboxapi.com/2/files/get_metadata', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path: `/${BACKUP_FILENAME}` }),
    })
    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}
