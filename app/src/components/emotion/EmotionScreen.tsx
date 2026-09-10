import { useCallback, useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { EmotionRadar } from "./EmotionRadar"
import { EMOTION_DIMENSIONS_DEFAULT } from "./types"
import type { EmotionDimensions } from "./types"

const AUTO_SKIP_SECONDS = 5

interface EmotionScreenProps {
  type: "before" | "after"
  initialDimensions?: EmotionDimensions
  onConfirm: (dimensions: EmotionDimensions) => void
  onSkip: () => void
}

export function EmotionScreen({ type, initialDimensions, onConfirm, onSkip }: EmotionScreenProps) {
  const [dimensions, setDimensions] = useState<EmotionDimensions>(
    initialDimensions ?? EMOTION_DIMENSIONS_DEFAULT,
  )
  const [remaining, setRemaining] = useState(AUTO_SKIP_SECONDS)
  const [userInteracted, setUserInteracted] = useState(false)
  const pausedRef = useRef(false)

  useEffect(() => {
    if (remaining <= 0) {
      onSkip()
      return
    }
    if (pausedRef.current) return

    const timer = setTimeout(() => setRemaining((r) => r - 1), 1000)
    return () => clearTimeout(timer)
  }, [remaining, onSkip])

  const handleRadarChange = useCallback(
    (dims: EmotionDimensions) => {
      setDimensions(dims)

      if (!pausedRef.current) {
        pausedRef.current = true
        setUserInteracted(true)
      }
    },
    [],
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-bg z-50 flex flex-col items-center justify-center p-6"
    >
      <h2 className="text-xl font-light text-text mb-8">
        ¿Cómo te sientes{type === "after" ? " ahora" : ""}?
      </h2>

      <EmotionRadar dimensions={dimensions} onChange={handleRadarChange} size="full" />

      <div className="flex gap-4 mt-8 w-full max-w-xs">
        <button
          type="button"
          onClick={onSkip}
          className="flex-1 py-3 px-4 rounded-xl bg-surface-2 text-text-muted transition-colors active:scale-[0.98]"
        >
          Omitir
        </button>
        <button
          type="button"
          onClick={() => onConfirm(dimensions)}
          className="flex-1 py-3 px-4 rounded-xl bg-accent text-white font-medium transition-transform active:scale-[0.98]"
        >
          Confirmar
        </button>
      </div>

      <p className="text-text-muted text-sm mt-4" aria-live="polite">
        {userInteracted
          ? "Toca Confirmar u Omitir"
          : `Auto-skip en ${remaining}s...`
        }
      </p>
    </motion.div>
  )
}
