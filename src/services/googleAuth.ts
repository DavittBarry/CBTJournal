import { logger } from '@/utils/logger'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || ''

const CALENDAR_SCOPES =
  'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly'
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file'
const ALL_SCOPES = `${CALENDAR_SCOPES} ${DRIVE_SCOPE}`

interface GoogleTokenResponse {
  access_token: string
  error?: string
  scope?: string
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
  drive?: {
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

interface WindowWithGoogle extends Window {
  google?: GoogleIdentityServices
  gapi?: Gapi
}

export interface GoogleAuthState {
  accessToken: string | null
  grantedScopes: string[]
  connectedAt: string | null
  lastValidated: string | null
}

type AuthStateListener = (state: GoogleAuthState) => void

class GoogleAuthService {
  private tokenClient: GoogleTokenClient | null = null
  private currentState: GoogleAuthState = {
    accessToken: null,
    grantedScopes: [],
    connectedAt: null,
    lastValidated: null,
  }
  private listeners: Set<AuthStateListener> = new Set()
  private gisLoaded = false
  private gapiLoaded = false
  private initPromise: Promise<void> | null = null

  isConfigured(): boolean {
    return Boolean(GOOGLE_CLIENT_ID && GOOGLE_API_KEY)
  }

  getState(): GoogleAuthState {
    return { ...this.currentState }
  }

  hasCalendarAccess(): boolean {
    return this.currentState.grantedScopes.some(
      (s) => s.includes('calendar.events') || s.includes('calendar.readonly')
    )
  }

  hasDriveAccess(): boolean {
    return this.currentState.grantedScopes.some((s) => s.includes('drive.file'))
  }

  subscribe(listener: AuthStateListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notifyListeners(): void {
    const state = this.getState()
    this.listeners.forEach((listener) => listener(state))
  }

  private updateState(updates: Partial<GoogleAuthState>): void {
    this.currentState = { ...this.currentState, ...updates }
    this.notifyListeners()
  }

  private async loadGoogleIdentityServices(): Promise<void> {
    if (this.gisLoaded) return

    return new Promise((resolve, reject) => {
      const win = window as WindowWithGoogle
      if (win.google?.accounts?.oauth2) {
        this.gisLoaded = true
        resolve()
        return
      }

      if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
        const checkLoaded = setInterval(() => {
          if ((window as WindowWithGoogle).google?.accounts?.oauth2) {
            clearInterval(checkLoaded)
            this.gisLoaded = true
            resolve()
          }
        }, 100)
        setTimeout(() => {
          clearInterval(checkLoaded)
          reject(new Error('Timeout loading Google Identity Services'))
        }, 10000)
        return
      }

      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.onload = () => {
        const checkLoaded = setInterval(() => {
          if ((window as WindowWithGoogle).google?.accounts?.oauth2) {
            clearInterval(checkLoaded)
            this.gisLoaded = true
            resolve()
          }
        }, 100)
        setTimeout(() => {
          clearInterval(checkLoaded)
          reject(new Error('Timeout loading Google Identity Services'))
        }, 5000)
      }
      script.onerror = () => reject(new Error('Failed to load Google Identity Services'))
      document.head.appendChild(script)
    })
  }

  private async loadGapi(): Promise<void> {
    if (this.gapiLoaded) return

    return new Promise((resolve, reject) => {
      const win = window as WindowWithGoogle
      if (win.gapi?.client) {
        this.gapiLoaded = true
        resolve()
        return
      }

      if (document.querySelector('script[src="https://apis.google.com/js/api.js"]')) {
        const checkLoaded = setInterval(() => {
          if ((window as WindowWithGoogle).gapi) {
            clearInterval(checkLoaded)
            this.initializeGapiClient()
              .then(() => {
                this.gapiLoaded = true
                resolve()
              })
              .catch(reject)
          }
        }, 100)
        setTimeout(() => {
          clearInterval(checkLoaded)
          reject(new Error('Timeout loading Google API'))
        }, 10000)
        return
      }

      const script = document.createElement('script')
      script.src = 'https://apis.google.com/js/api.js'
      script.onload = () => {
        this.initializeGapiClient()
          .then(() => {
            this.gapiLoaded = true
            resolve()
          })
          .catch(reject)
      }
      script.onerror = () => reject(new Error('Failed to load Google API'))
      document.head.appendChild(script)
    })
  }

  private async initializeGapiClient(): Promise<void> {
    const win = window as WindowWithGoogle
    const gapi = win.gapi
    if (!gapi) throw new Error('GAPI not loaded')

    return new Promise((resolve, reject) => {
      gapi.load('client', async () => {
        try {
          await gapi.client.init({
            apiKey: GOOGLE_API_KEY,
            discoveryDocs: [
              'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
              'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
            ],
          })
          resolve()
        } catch (err) {
          reject(err)
        }
      })
    })
  }

  async initialize(): Promise<void> {
    if (!this.isConfigured()) return
    if (this.initPromise) return this.initPromise

    this.initPromise = (async () => {
      try {
        await Promise.all([this.loadGoogleIdentityServices(), this.loadGapi()])
        logger.info('GoogleAuth', 'Initialized successfully')
      } catch (error) {
        logger.error('GoogleAuth', 'Initialization failed', error)
        throw error
      }
    })()

    return this.initPromise
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`
      )
      if (!response.ok) return false

      const data = await response.json()
      if (data.scope) {
        this.updateState({
          grantedScopes: data.scope.split(' '),
          lastValidated: new Date().toISOString(),
        })
      }
      return true
    } catch {
      return false
    }
  }

  async silentSignIn(existingToken?: string): Promise<string | null> {
    if (!this.isConfigured()) return null

    try {
      await this.initialize()

      if (existingToken) {
        const isValid = await this.validateToken(existingToken)
        if (isValid) {
          this.updateState({
            accessToken: existingToken,
            lastValidated: new Date().toISOString(),
          })
          this.setGapiToken(existingToken)
          logger.info('GoogleAuth', 'Existing token validated')
          return existingToken
        }
      }

      const win = window as WindowWithGoogle
      if (!win.google?.accounts?.oauth2) {
        return null
      }

      return new Promise((resolve) => {
        this.tokenClient = win.google!.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: ALL_SCOPES,
          callback: (response: GoogleTokenResponse) => {
            if (response.error) {
              logger.debug('GoogleAuth', 'Silent sign-in failed (expected if no session)')
              resolve(null)
              return
            }

            const grantedScopes = response.scope?.split(' ') || []
            this.updateState({
              accessToken: response.access_token,
              grantedScopes,
              connectedAt: new Date().toISOString(),
              lastValidated: new Date().toISOString(),
            })
            this.setGapiToken(response.access_token)
            logger.info('GoogleAuth', 'Silent sign-in successful', { scopes: grantedScopes })
            resolve(response.access_token)
          },
        })

        this.tokenClient.requestAccessToken({ prompt: '' })
      })
    } catch (error) {
      logger.debug('GoogleAuth', 'Silent sign-in error', error)
      return null
    }
  }

  async signIn(requestedScopes?: 'calendar' | 'drive' | 'both'): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Google is not configured')
    }

    await this.initialize()

    const win = window as WindowWithGoogle
    if (!win.google?.accounts?.oauth2) {
      throw new Error('Google Identity Services not available')
    }

    let scope: string
    switch (requestedScopes) {
      case 'calendar':
        scope = CALENDAR_SCOPES
        break
      case 'drive':
        scope = DRIVE_SCOPE
        break
      default:
        scope = ALL_SCOPES
    }

    return new Promise((resolve, reject) => {
      this.tokenClient = win.google!.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope,
        callback: (response: GoogleTokenResponse) => {
          if (response.error) {
            logger.error('GoogleAuth', 'Sign-in failed', response)
            reject(new Error(response.error))
            return
          }

          const grantedScopes = response.scope?.split(' ') || []
          this.updateState({
            accessToken: response.access_token,
            grantedScopes,
            connectedAt: new Date().toISOString(),
            lastValidated: new Date().toISOString(),
          })
          this.setGapiToken(response.access_token)
          logger.info('GoogleAuth', 'Sign-in successful', { scopes: grantedScopes })
          resolve(response.access_token)
        },
      })

      this.tokenClient.requestAccessToken({ prompt: 'consent' })
    })
  }

  async requestAdditionalScopes(scopes: 'calendar' | 'drive'): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Google is not configured')
    }

    await this.initialize()

    const win = window as WindowWithGoogle
    if (!win.google?.accounts?.oauth2) {
      throw new Error('Google Identity Services not available')
    }

    const newScope = scopes === 'calendar' ? CALENDAR_SCOPES : DRIVE_SCOPE
    const combinedScope = [
      ...new Set([...this.currentState.grantedScopes, ...newScope.split(' ')]),
    ].join(' ')

    return new Promise((resolve, reject) => {
      this.tokenClient = win.google!.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: combinedScope,
        callback: (response: GoogleTokenResponse) => {
          if (response.error) {
            logger.error('GoogleAuth', 'Additional scope request failed', response)
            reject(new Error(response.error))
            return
          }

          const grantedScopes = response.scope?.split(' ') || []
          this.updateState({
            accessToken: response.access_token,
            grantedScopes,
            lastValidated: new Date().toISOString(),
          })
          this.setGapiToken(response.access_token)
          logger.info('GoogleAuth', 'Additional scopes granted', { scopes: grantedScopes })
          resolve(response.access_token)
        },
      })

      this.tokenClient.requestAccessToken({ prompt: 'consent' })
    })
  }

  private setGapiToken(token: string | null): void {
    const win = window as WindowWithGoogle
    if (win.gapi?.client) {
      win.gapi.client.setToken(token ? { access_token: token } : null)
    }
  }

  signOut(): void {
    this.updateState({
      accessToken: null,
      grantedScopes: [],
      connectedAt: null,
      lastValidated: null,
    })
    this.setGapiToken(null)
    this.tokenClient = null
    logger.info('GoogleAuth', 'Signed out')
  }

  getAccessToken(): string | null {
    return this.currentState.accessToken
  }

  getGapi(): Gapi | undefined {
    return (window as WindowWithGoogle).gapi
  }
}

export const googleAuth = new GoogleAuthService()
