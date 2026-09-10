import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react'
import { type AuthState, DEV_USER, OFFLINE_STATE, getAuthMode } from '../lib/auth'

export interface AuthContextValue extends AuthState {
  enableDevMode: () => void
  enableOfflineMode: () => void
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue>({
  ...OFFLINE_STATE,
  enableDevMode: () => {},
  enableOfflineMode: () => {},
  login: async () => {},
  logout: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const mode = getAuthMode()

    if (mode === 'dev') {
      return { mode: 'dev', user: DEV_USER, isAuthenticated: true, isLoading: false }
    }

    return OFFLINE_STATE
  })

  useEffect(() => {
    const handleStorage = () => {
      const mode = getAuthMode()
      if (mode === 'dev') {
        setState({ mode: 'dev', user: DEV_USER, isAuthenticated: true, isLoading: false })
      } else {
        setState(OFFLINE_STATE)
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const enableDevMode = useCallback(() => {
    localStorage.setItem('tone-breath-auth-mode', 'dev')
    setState({ mode: 'dev', user: DEV_USER, isAuthenticated: true, isLoading: false })
  }, [])

  const enableOfflineMode = useCallback(() => {
    localStorage.removeItem('tone-breath-auth-mode')
    setState(OFFLINE_STATE)
  }, [])

  const login = useCallback(async (_email: string, _password: string) => {
    setState((prev) => ({ ...prev, isLoading: true }))

    // TODO: Implement real Supabase Auth
    // For now, just simulate
    await new Promise((resolve) => setTimeout(resolve, 500))

    setState({
      mode: 'real',
      user: { id: 'real-user', email: _email },
      isAuthenticated: true,
      isLoading: false,
    })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('tone-breath-auth-mode')
    setState(OFFLINE_STATE)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        ...state,
        enableDevMode,
        enableOfflineMode,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext }
