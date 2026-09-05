import { useEffect, useRef, useState } from "react"
import type { MotionValue } from "framer-motion"
import { animate } from "framer-motion"
import { Pause, Play, Volume2, X } from "lucide-react"
import { ScreenHeader } from "../components/ui/ScreenHeader"
import { BreathingCircle } from "../components/breathing/BreathingCircle"
import { PhaseIndicator } from "../components/breathing/PhaseIndicator"
import { VolumeControls } from "../components/session/VolumeControls"
import { formatTime } from "../lib/format"
import type { Routine } from "../lib/routines"

interface ActiveSessionPageProps {
  routine: Routine
  phaseLabel: string
  scale: MotionValue<number>
  activePhaseIndex: number
  remaining: number
  isPaused: boolean
  isCompleting: boolean
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
  isCompleting,
  onTogglePause,
  onFinish,
  onExit,
}: ActiveSessionPageProps) {
  const [volumeOpen, setVolumeOpen] = useState(false)
  const [uiOpacity, setUiOpacity] = useState(1)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!isCompleting || hasAnimated.current) return
    hasAnimated.current = true
    setVolumeOpen(false)
    animate(1, 0, {
      duration: 0.4,
      onUpdate: (v) => setUiOpacity(v),
    })
    animate(scale, 8, {
      duration: 1.4,
      ease: "easeIn",
    })
  }, [isCompleting, scale])

  return (
    <div
      className="flex min-h-[max(884px,100dvh)] flex-col transition-colors duration-1000"
      style={{ backgroundColor: isCompleting ? "var(--color-accent)" : undefined }}
    >
      <div style={{ opacity: uiOpacity, pointerEvents: isCompleting ? "none" : undefined }}>
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
      </div>

      <main className="flex flex-1 flex-col items-center justify-center px-6">
        <BreathingCircle label={isCompleting ? "" : phaseLabel} scale={scale} />
        <div style={{ opacity: uiOpacity, pointerEvents: isCompleting ? "none" : undefined }}>
          <PhaseIndicator
            phases={routine.phases.map((p) => p.duration)}
            activeIndex={activePhaseIndex}
            className="mt-12"
          />
        </div>
      </main>

      <footer
        className="flex flex-col items-center gap-12 px-6 pb-12"
        style={{ opacity: uiOpacity, pointerEvents: isCompleting ? "none" : undefined }}
      >
        <div className="text-4xl font-light tabular-nums text-text">
          {formatTime(remaining)}
        </div>
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => setVolumeOpen(true)}
            aria-label="Volumen"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-2 text-text transition-transform active:scale-95"
          >
            <Volume2 className="h-6 w-6" strokeWidth={2} />
          </button>
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

      <VolumeControls open={volumeOpen} onClose={() => setVolumeOpen(false)} />
    </div>
  )
}
