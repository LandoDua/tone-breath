import { useEffect } from "react"
import { Moon, Square, Waves, X } from "lucide-react"
import { ScreenHeader } from "../components/ui/ScreenHeader"
import { formatTime } from "../lib/format"
import type { Routine } from "../lib/routines"

const ICON_MAP = { moon: Moon, waves: Waves, square: Square } as const

interface SessionSummaryPageProps {
  routine: Routine
  durationMinutes: number
  elapsedSeconds: number
  onHome: () => void
}

export function SessionSummaryPage({
  routine,
  durationMinutes,
  elapsedSeconds,
  onHome,
}: SessionSummaryPageProps) {
  useEffect(() => {
    if ("wakeLock" in navigator) {
      navigator.wakeLock?.request("screen").then((s) => s.release()).catch(() => {})
    }
  }, [])

  const displayMinutes = elapsedSeconds > 0
    ? Math.floor(elapsedSeconds / 60)
    : durationMinutes

  const Icon = ICON_MAP[routine.icon]

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

      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 pt-6 text-center">
        <div className="flex h-40 w-40 items-center justify-center rounded-[32px] bg-accent/10 text-accent shadow-soft">
          <Icon className="h-16 w-16" strokeWidth={1.8} />
        </div>

        <h2 className="text-3xl font-light text-text">¡Buen trabajo!</h2>

        <p className="max-w-[300px] text-lg text-text-muted">
          Has completado la rutina <span className="text-text">{routine.name}</span>.
        </p>

        <p className="text-base text-text-muted">
          Duración: {elapsedSeconds > 0 ? formatTime(elapsedSeconds) : `${displayMinutes} minutos`}
        </p>

        <div className="mt-2 max-w-[320px] rounded-2xl border border-outline/30 bg-surface/60 px-8 py-6">
          <p className="text-base font-light italic text-text-muted">
            "Tu mente te agradece este momento de paz."
          </p>
        </div>
      </main>

      <div className="p-6 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={onHome}
          className="w-full rounded-full bg-accent py-4 text-lg font-medium text-white transition-transform active:scale-[0.99]"
        >
          Volver al Inicio
        </button>
      </div>
    </div>
  )
}
