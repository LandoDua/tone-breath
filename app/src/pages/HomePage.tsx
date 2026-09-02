import { AudioLines, Leaf, Moon, Square, Waves } from "lucide-react"
import { useTheme } from "../context/ThemeContext"
import { ScreenHeader } from "../components/ui/ScreenHeader"
import { ModeCard } from "../components/home/ModeCard"
import { SosButton } from "../components/home/SosButton"
import { BottomNav } from "../components/ui/BottomNav"

const routineList = [
  { id: "4-7-8", tag: "Dormir", title: "4-7-8", description: "Para conciliar el sueño", icon: Moon },
  { id: "coherent", tag: "Calma", title: "Coherente", description: "Equilibra tu sistema", icon: Waves },
  { id: "square", tag: "Foco", title: "Cuadrada", description: "Reduce la ansiedad", icon: Square },
] as const

interface HomePageProps {
  onSelectRoutine: (id: string) => void
  onSos: () => void
  onDemo: () => void
}

export function HomePage({ onSelectRoutine, onSos, onDemo }: HomePageProps) {
  const { theme, toggle } = useTheme()

  return (
    <div className="flex min-h-[max(884px,100dvh)] flex-col">
      <ScreenHeader
        title="Tone Breath"
        titleClassName="text-2xl font-light tracking-tight text-accent"
        left={<Leaf className="h-6 w-6 text-accent" strokeWidth={1.8} />}
        right={
          <button
            type="button"
            onClick={toggle}
            aria-label="Cambiar tema"
            className="text-text-muted"
          >
            {theme === "dark" ? <Moon className="h-5 w-5" /> : <span className="text-lg">☀︎</span>}
          </button>
        }
      />

      <main className="flex flex-1 flex-col gap-12 px-6 pb-28 pt-12">
        <section className="flex flex-col gap-3">
          <h2 className="text-[34px] font-light leading-tight text-text">
            Hola, ¿Tienes un momento?
          </h2>
          <p className="text-lg text-text-muted">
            Selecciona un modo para comenzar a respirar.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-5">
          {routineList.map((r) => (
            <ModeCard
              key={r.id}
              tag={r.tag}
              title={r.title}
              description={r.description}
              icon={r.icon}
              onClick={() => onSelectRoutine(r.id)}
            />
          ))}
        </section>

        <section>
          <SosButton onClick={onSos} />
        </section>

        <button
          type="button"
          onClick={onDemo}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-outline/20 py-3 text-sm font-medium text-text-muted transition-colors active:bg-surface-2"
        >
          <AudioLines className="h-4 w-4" strokeWidth={2} />
          Probar audio por modo
        </button>

        <BottomNav
          active="home"
          onHome={() => undefined}
          onProfile={() => undefined}
        />
      </main>
    </div>
  )
}
