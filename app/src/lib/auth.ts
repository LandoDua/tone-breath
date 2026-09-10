export type AuthMode = 'offline' | 'dev' | 'real'

export interface User {
  id: string
  email: string
  displayName?: string
}

export interface AuthState {
  mode: AuthMode
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export const DEV_USER: User = {
  id: 'dev-user-000',
  email: 'dev@tonebreath.local',
  displayName: 'Developer',
}

export const OFFLINE_STATE: AuthState = {
  mode: 'offline',
  user: null,
  isAuthenticated: false,
  isLoading: false,
}

export function getAuthMode(): AuthMode {
  if (typeof window === 'undefined') return 'offline'

  const params = new URLSearchParams(window.location.search)
  if (params.get('auth') === 'dev') return 'dev'

  if (import.meta.env.DEV) {
    const stored = localStorage.getItem('tone-breath-auth-mode')
    if (stored === 'dev') return 'dev'
  }

  return 'offline'
}

export function setAuthMode(mode: AuthMode): void {
  if (mode === 'offline') {
    localStorage.removeItem('tone-breath-auth-mode')
  } else {
    localStorage.setItem('tone-breath-auth-mode', mode)
  }
}
