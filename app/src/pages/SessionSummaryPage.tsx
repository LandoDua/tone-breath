import { useEffect, useState } from "react"
import { Moon, Square, Waves, X } from "lucide-react"
import { ScreenHeader } from "../components/ui/ScreenHeader"
import { EmotionDelta } from "../components/emotion/EmotionDelta"
import { EmotionRadar } from "../components/emotion/EmotionRadar"
import { EMOTION_DIMENSIONS_DEFAULT } from "../components/emotion/types"
import { formatTime } from "../lib/format"
import type { Routine } from "../lib/routines"
import type { EmotionDimensions } from "../components/emotion/types"

const ICON_MAP = { moon: Moon, waves: Waves, square: Square } as const

interface SessionSummaryPageProps {
  routine: Routine
  durationMinutes: number
  elapsedSeconds: number
  emotionBefore: EmotionDimensions | null
  emotionAfter: EmotionDimensions | null
  onHome: () => void
  onEmotionAfterConfirm: (dimensions: EmotionDimensions) => void
}

export function SessionSummaryPage({
  routine,
  durationMinutes,
  elapsedSeconds,
  emotionBefore,
  emotionAfter,
  onHome,
  onEmotionAfterConfirm,
}: SessionSummaryPageProps) {
  useEffect(() => {
    if ("wakeLock" in navigator) {
      navigator.wakeLock?.request("screen").then((s) => s.release()).catch(() => {})
    }
  }, [])

  const [editDimensions, setEditDimensions] = useState<EmotionDimensions>(
    emotionAfter ?? emotionBefore ?? EMOTION_DIMENSIONS_DEFAULT,
  )

  const displayMinutes = elapsedSeconds > 0
    ? Math.floor(elapsedSeconds / 60)
    : durationMinutes

  const Icon = ICON_MAP[routine.icon]
  const hasEmotions = emotionBefore !== null
  const hasDelta = emotionBefore !== null && emotionAfter !== null

  return (
    <div className="flex min-h-[max(884px,100dvh)] flex-col">
      <ScreenHeader
        title="Sesión Completa"
        titleClassName="text-xl font-medium text-accent"
        left={
          <button
            type="button"
            onClick={onHome}
            aria-label="Volver al inicio"
            className="text-text-muted"
          >
            <X className="h-6 w-6" strokeWidth={2} />
          </button>
        }
        right={<div className="h-12 w-12" />}
      />

      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="flex h-32 w-32 items-center justify-center rounded-[28px] bg-accent/10 text-accent shadow-soft">
          <Icon className="h-14 w-14" strokeWidth={1.8} />
        </div>

        <h2 className="text-2xl font-light text-text">¡Buen trabajo!</h2>

        <p className="max-w-[300px] text-base text-text-muted">
          Has completado la rutina <span className="text-text">{routine.name}</span>.
        </p>

        <p className="text-sm text-text-muted">
          Duración: {elapsedSeconds > 0 ? formatTime(elapsedSeconds) : `${displayMinutes} minutos`}
        </p>

        {/* Interactive Emotion Radar */}
        {hasEmotions && (
          <div className="w-full max-w-[360px] space-y-3">
            <p className="text-sm text-text-muted">¿Cómo te sientes ahora?</p>
            <div className="flex justify-center">
              <EmotionRadar dimensions={editDimensions} onChange={setEditDimensions} size="full" />
            </div>
            {hasDelta && (
              <EmotionDelta before={emotionBefore!} after={editDimensions} />
            )}
          </div>
        )}

        <div className="mt-2 max-w-[320px] rounded-2xl border border-outline/30 bg-surface/60 px-6 py-4">
          <p className="text-sm font-light italic text-text-muted">
            {hasEmotions
              ? "Tu mente te agradece este momento de paz."
              : "Cada respiración es un paso hacia tu bienestar."
            }
          </p>
        </div>
      </main>

      <div className="p-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] space-y-3">
        {hasEmotions && (
          <button
            type="button"
            onClick={() => onEmotionAfterConfirm(editDimensions)}
            className="w-full rounded-full bg-accent py-3 text-base font-medium text-white transition-transform active:scale-[0.99]"
          >
            Confirmar Emociones
          </button>
        )}
        <button
          type="button"
          onClick={onHome}
          className="w-full rounded-full bg-surface-2 py-3 text-base font-medium text-text-muted transition-transform active:scale-[0.99]"
        >
          Volver al Inicio
        </button>
      </div>
    </div>
  )
}
