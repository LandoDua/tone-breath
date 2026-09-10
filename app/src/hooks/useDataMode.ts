import { useAuth } from './useAuth'

export function useDataMode() {
  const { isAuthenticated, mode } = useAuth()

  const shouldSync = isAuthenticated && mode === 'real'
  const isOffline = !isAuthenticated || mode === 'offline'
  const isDev = mode === 'dev'

  return {
    shouldSync,
    isOffline,
    isDev,
    isOnline: !isOffline,
  }
}
