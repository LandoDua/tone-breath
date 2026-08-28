import { X } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { ScreenHeader } from "../components/ui/ScreenHeader"
import { TimeSlider } from "../components/time/TimeSlider"
import { formatMMSS } from "../lib/format"

interface TimeSelectorPageProps {
  duration: number
  setDuration: (v: number) => void
  onStart: () => void
}

export function TimeSelectorPage({
  duration,
  setDuration,
  onStart,
}: TimeSelectorPageProps) {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-[max(884px,100dvh)] flex-col">
      <ScreenHeader
        title="Duración"
        left={
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Volver"
            className="text-text-muted"
          >
            <X className="h-6 w-6" strokeWidth={2} />
          </button>
        }
        right={<div className="h-12 w-12" />}
      />

      <main className="flex flex-1 flex-col items-center justify-center gap-10 px-6">
        <h1 className="max-w-[280px] text-center text-2xl font-light leading-snug text-text">
          ¿Cuánto tiempo quieres dedicarte?
        </h1>

        <div className="relative flex h-64 w-64 items-center justify-center rounded-full border border-surface-2 bg-surface shadow-soft">
          <div className="absolute inset-4 rounded-full border border-accent/10" />
          <div className="text-center">
            <div className="text-5xl font-light tracking-tight text-accent tabular-nums">
              {formatMMSS(duration)}
            </div>
            <div className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
              minutos
            </div>
          </div>
        </div>

        <div className="w-full max-w-[320px]">
          <TimeSlider value={duration} onChange={setDuration} />
        </div>
      </main>

      <div className="p-6 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={onStart}
          className="w-full rounded-full bg-accent py-5 text-xl font-medium text-white transition-transform active:scale-[0.99]"
        >
          Empezar
        </button>
      </div>
    </div>
  )
}
