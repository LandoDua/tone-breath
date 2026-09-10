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
  enfoque: "Enfoque",
  apertura: "Apertura",
}

export function EmotionDelta({ before, after }: EmotionDeltaProps) {
  const deltas = (Object.keys(LABELS) as (keyof EmotionDimensions)[]).map((key) => ({
    key: key as string,
    label: LABELS[key],
    delta: after[key] - before[key],
  }))

  return (
    <div className="flex flex-wrap gap-2 justify-center" role="list" aria-label="Cambio emocional">
      {deltas.map(({ key, label, delta }) => (
        <div
          key={key}
          role="listitem"
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            delta > 0
              ? "bg-accent/20 text-accent"
              : delta < 0
                ? "bg-rose-500/20 text-rose-400"
                : "bg-surface-2 text-text-muted"
          }`}
        >
          {label} {delta > 0 ? "↑" : delta < 0 ? "↓" : "→"}
          {Math.abs(delta)}
        </div>
      ))}
    </div>
  )
}
