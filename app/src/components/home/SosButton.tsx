import { LifeBuoy } from "lucide-react"

interface SosButtonProps {
  onClick: () => void
}

export function SosButton({ onClick }: SosButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-2xl bg-surface-2 p-6 text-left transition-transform active:scale-[0.99]"
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#FEE2E2] text-[#DC2626] dark:bg-[#45191B] dark:text-[#F87171]">
        <LifeBuoy className="h-7 w-7" strokeWidth={2.4} />
      </div>
      <div className="flex flex-col">
        <span className="text-base font-semibold text-[#DC2626] dark:text-[#F87171]">Necesito ayuda</span>
        <span className="text-sm text-text-muted">
          Toca si te sientes mal. Será confidencial.
        </span>
      </div>
    </button>
  )
}
