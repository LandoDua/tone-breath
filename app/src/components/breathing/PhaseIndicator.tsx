interface PhaseIndicatorProps {
  phases: number[]
  activeIndex: number
  className?: string
}

export function PhaseIndicator({ phases, activeIndex, className }: PhaseIndicatorProps) {
  return (
    <div className={"flex items-center justify-center gap-3 " + (className ?? "")}>
      {phases.map((p, i) => (
        <div key={i} className="flex items-center gap-3">
          {i > 0 && <span className="text-lg font-light text-text-muted opacity-40">-</span>}
          {i === activeIndex ? (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 text-lg font-medium text-accent">
              {p}
            </div>
          ) : (
            <span className="text-lg font-light text-text-muted opacity-40">{p}</span>
          )}
        </div>
      ))}
    </div>
  )
}
