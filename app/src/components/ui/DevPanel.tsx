import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wifi, WifiOff, Code, ChevronDown } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export function DevPanel() {
  const { mode, user, enableDevMode, enableOfflineMode, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  if (!import.meta.env.DEV) return null

  const modeLabel = {
    offline: 'Offline',
    dev: 'Dev Bypass',
    real: 'Real Auth',
  }

  const ModeIcon = mode === 'offline' ? WifiOff : mode === 'dev' ? Code : Wifi

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <motion.button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-surface border border-outline/30 shadow-soft text-xs font-mono"
        whileTap={{ scale: 0.95 }}
      >
        <ModeIcon className="w-3.5 h-3.5" />
        <span>{modeLabel[mode]}</span>
        <ChevronDown
          className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full right-0 mb-2 w-56 p-3 rounded-xl bg-surface border border-outline/30 shadow-soft"
          >
            <p className="text-[10px] uppercase tracking-wider text-text-muted mb-2 font-medium">
              Auth Mode (Dev Only)
            </p>

            {user && (
              <p className="text-xs text-text-muted mb-3 truncate">
                {user.email}
              </p>
            )}

            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => {
                  enableOfflineMode()
                  setIsOpen(false)
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                  mode === 'offline'
                    ? 'bg-accent/10 text-accent'
                    : 'hover:bg-surface-2 text-text-muted'
                }`}
              >
                <WifiOff className="w-3.5 h-3.5 inline mr-2" />
                Offline (local only)
              </button>

              <button
                type="button"
                onClick={() => {
                  enableDevMode()
                  setIsOpen(false)
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                  mode === 'dev'
                    ? 'bg-accent/10 text-accent'
                    : 'hover:bg-surface-2 text-text-muted'
                }`}
              >
                <Code className="w-3.5 h-3.5 inline mr-2" />
                Dev Bypass
              </button>

              {mode !== 'offline' && (
                <button
                  type="button"
                  onClick={() => {
                    logout()
                    setIsOpen(false)
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  Disconnect
                </button>
              )}
            </div>

            <p className="text-[9px] text-text-muted/50 mt-3 leading-relaxed">
              Access via URL: <code>?auth=dev</code>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
