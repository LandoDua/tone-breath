import { DIMENSION_STATE_LABELS } from "./types"
import type { EmotionDimensions } from "./types"

interface EmotionDeltaProps {
  before: EmotionDimensions
  after: EmotionDimensions
}

const LABELS: Record<keyof EmotionDimensions, string> = {
  calma: "Calma",
  ansiedad: "Ansiedad",
  energia: "Energía",
  tristeza: "Tristeza",
  estres: "Estrés",
  apertura: "Apertura",
}

export function EmotionDelta({ before, after }: EmotionDeltaProps) {
  const deltas = (Object.keys(LABELS) as (keyof EmotionDimensions)[]).map((key) => ({
    key: key as string,
    label: LABELS[key],
    delta: after[key] - before[key],
    beforeLabel: DIMENSION_STATE_LABELS[before[key]],
    afterLabel: DIMENSION_STATE_LABELS[after[key]],
  }))

  return (
    <div className="flex flex-wrap gap-2 justify-center" role="list" aria-label="Cambio emocional">
      {deltas.map(({ key, label, delta, beforeLabel, afterLabel }) => (
        <div
          key={key}
          role="listitem"
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            delta > 0
              ? "bg-accent/20 text-accent"
              : delta < 0
                ? "bg-rose-500/20 text-rose-400"
                : "bg-surface-2 text-text-muted"
          }`}
        >
          {label} {delta > 0 ? "↑" : delta < 0 ? "↓" : "→"}{" "}
          {delta !== 0 ? `${beforeLabel} → ${afterLabel}` : afterLabel}
        </div>
      ))}
    </div>
  )
}
