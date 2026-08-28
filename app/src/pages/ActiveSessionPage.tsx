import type { MotionValue } from "framer-motion"
import { Pause, Play, X } from "lucide-react"
import { ScreenHeader } from "../components/ui/ScreenHeader"
import { BreathingCircle } from "../components/breathing/BreathingCircle"
import { PhaseIndicator } from "../components/breathing/PhaseIndicator"
import { formatTime } from "../lib/format"
import type { Routine } from "../lib/routines"

interface ActiveSessionPageProps {
  routine: Routine
  phaseLabel: string
  scale: MotionValue<number>
  activePhaseIndex: number
  remaining: number
  isPaused: boolean
  onTogglePause: () => void
  onFinish: () => void
  onExit: () => void
}

export function ActiveSessionPage({
  routine,
  phaseLabel,
  scale,
  activePhaseIndex,
  remaining,
  isPaused,
  onTogglePause,
  onFinish,
  onExit,
}: ActiveSessionPageProps) {
  return (
    <div className="flex min-h-[max(884px,100dvh)] flex-col">
      <ScreenHeader
        title={routine.name}
        left={
          <button
            type="button"
            onClick={onExit}
            aria-label="Salir"
            className="text-text-muted"
          >
            <X className="h-6 w-6" strokeWidth={2} />
          </button>
        }
        right={<div className="h-12 w-12" />}
      />

      <main className="flex flex-1 flex-col items-center justify-center px-6">
        <BreathingCircle label={phaseLabel} scale={scale} />
        <PhaseIndicator
          phases={routine.phases.map((p) => p.duration)}
          activeIndex={activePhaseIndex}
          className="mt-12"
        />
      </main>

      <footer className="flex flex-col items-center gap-12 px-6 pb-12">
        <div className="text-4xl font-light tabular-nums text-text">
          {formatTime(remaining)}
        </div>
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={onTogglePause}
            aria-label={isPaused ? "Reanudar" : "Pausar"}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-2 text-text transition-transform active:scale-95"
          >
            {isPaused ? (
              <Play className="h-6 w-6" strokeWidth={2} />
            ) : (
              <Pause className="h-6 w-6" strokeWidth={2} />
            )}
          </button>
          <button
            type="button"
            onClick={onFinish}
            className="rounded-full bg-surface-2 px-10 py-4 text-base font-medium text-text-muted transition-transform active:scale-95"
          >
            Finalizar
          </button>
        </div>
      </footer>
    </div>
  )
}
