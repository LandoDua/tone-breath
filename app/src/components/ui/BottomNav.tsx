import { Home, User } from "lucide-react"

interface BottomNavProps {
  active: "home" | "profile"
  onHome: () => void
  onProfile: () => void
}

export function BottomNav({ active, onHome, onProfile }: BottomNavProps) {
  return (
    <nav className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border border-outline/10 bg-surface p-1.5 shadow-soft">
      <button
        type="button"
        onClick={onHome}
        className={
          "flex min-h-[44px] items-center gap-2 rounded-full px-6 transition-colors " +
          (active === "home"
            ? "bg-accent/10 text-accent shadow-[0_0_22px_-2px_var(--glow)]"
            : "text-text-muted active:bg-surface-2")
        }
      >
        <Home className="h-5 w-5" strokeWidth={active === "home" ? 2.4 : 2} />
        <span className="text-sm font-medium">Inicio</span>
      </button>
      <button
        type="button"
        onClick={onProfile}
        className={
          "flex min-h-[44px] items-center gap-2 rounded-full px-6 transition-colors " +
          (active === "profile"
            ? "bg-accent/10 text-accent shadow-[0_0_22px_-2px_var(--glow)]"
            : "text-text-muted active:bg-surface-2")
        }
      >
        <User className="h-5 w-5" strokeWidth={active === "profile" ? 2.4 : 2} />
        <span className="text-sm font-medium">Perfil</span>
      </button>
    </nav>
  )
}