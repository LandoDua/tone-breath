import type { LucideIcon } from "lucide-react"

interface ModeCardProps {
  tag: string
  title: string
  description: string
  icon: LucideIcon
  onClick: () => void
}

export function ModeCard({ tag, title, description, icon: Icon, onClick }: ModeCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-5 rounded-3xl bg-surface p-8 text-left shadow-soft transition-transform active:scale-[0.99]"
    >
      <div className="flex flex-col gap-2">
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          <Icon className="h-4 w-4" strokeWidth={2.2} />
          {tag}
        </span>
        <h3 className="text-xl font-medium text-text">{title}</h3>
        <p className="text-base text-text-muted">{description}</p>
      </div>
      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent">
        <Icon className="h-9 w-9" strokeWidth={1.8} />
      </div>
    </button>
  )
}
