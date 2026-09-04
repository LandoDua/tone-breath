import { useEffect, useState } from "react"
import { Moon, Pause, Play, Waves, Square } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { ScreenHeader } from "../components/ui/ScreenHeader"
import {
  AMBIENT_PROFILES,
  type AmbientProfile,
} from "../lib/ambientPad"
import {
  getAmbientProfile,
  getAmbientVolume,
  getMetronomeVolume,
  initAudio,
  setAmbientProfile,
  setAmbientVolume,
  startAmbientDemo,
  stopAmbient,
} from "../lib/audioEngine"
import { saveAudioLevels } from "../lib/audioSettings"

const ICON_BY_NAME: Record<string, typeof Moon> = {
  dormir: Moon,
  calma: Waves,
  foco: Square,
}

const BEHAVIOR_LABEL: Record<AmbientProfile["behavior"], string> = {
  stable: "Oscuro y estable",
  expansive: "Marea expansiva estéreo",
  grounded: "Presente y sólido",
}

export function AmbientDemoPage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<AmbientProfile>(getAmbientProfile())
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(getAmbientVolume())

  useEffect(() => {
    void initAudio()
  }, [])

  useEffect(() => {
    return () => {
      stopAmbient()
    }
  }, [])

  const selectProfile = (p: AmbientProfile) => {
    setProfile(p)
    setAmbientProfile(p)
  }

  const togglePlay = async () => {
    await initAudio()
    if (playing) {
      stopAmbient()
      setPlaying(false)
    } else {
      startAmbientDemo(profile)
      setPlaying(true)
    }
  }

  const onVolume = (v: number) => {
    setVolume(v)
    setAmbientVolume(v)
    saveAudioLevels({ metronome: getMetronomeVolume(), ambient: v })
  }

  const Icon = ICON_BY_NAME[profile.name] ?? Moon

  return (
    <div className="flex min-h-[max(884px,100dvh)] flex-col">
      <ScreenHeader
        title="Demo de Audio"
        left={
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Volver"
            className="text-text-muted"
          >
            <span className="text-2xl leading-none">←</span>
          </button>
        }
        right={<div className="h-12 w-12" />}
      />

      <main className="flex flex-1 flex-col gap-10 px-6 pb-28 pt-6">
        <section className="flex flex-col gap-3">
          <h2 className="text-[28px] font-light leading-tight text-text">
            Prueba cada modo de audio
          </h2>
          <p className="text-lg text-text-muted">
            El pad de fondo suena de forma distinta según el modo de respiración.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-4">
          {AMBIENT_PROFILES.map((p) => {
            const PIcon = ICON_BY_NAME[p.name] ?? Moon
            const isActive = p.name === profile.name
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => selectProfile(p)}
                className={
                  "flex w-full items-center justify-between gap-5 rounded-3xl p-6 text-left shadow-soft transition-all active:scale-[0.99] " +
                  (isActive
                    ? "bg-accent/10 ring-2 ring-accent/60"
                    : "bg-surface hover:bg-surface-2/60")
                }
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                    <PIcon className="h-6 w-6" strokeWidth={1.8} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-lg font-medium text-text">{p.label}</span>
                    <span className="text-sm text-text-muted">{BEHAVIOR_LABEL[p.behavior]}</span>
                  </div>
                </div>
                {isActive && <span className="text-xs font-semibold uppercase tracking-wide text-accent">Activo</span>}
              </button>
            )
          })}
        </section>

        <section className="flex flex-col gap-5 rounded-3xl border border-outline/20 bg-surface p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-text-muted">
              Perfil activo
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <Icon className="h-6 w-6" strokeWidth={1.8} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-surface-2 p-4">
              <div className="text-xs uppercase tracking-wide text-text-muted">Filtro base</div>
              <div className="mt-1 text-lg font-medium text-text">{profile.filterHz} Hz</div>
            </div>
            <div className="rounded-2xl bg-surface-2 p-4">
              <div className="text-xs uppercase tracking-wide text-text-muted">Comportamiento</div>
              <div className="mt-1 text-sm font-medium text-text">
                {BEHAVIOR_LABEL[profile.behavior]}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-surface-2 p-4">
            <div className="mb-3 text-xs uppercase tracking-wide text-text-muted">Escala</div>
            <div className="flex flex-wrap gap-2">
              {profile.scale.map((n) => (
                <span
                  key={n}
                  className="rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent"
                >
                  {n}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-text">Volumen del pad</span>
            <span className="tabular-nums text-text-muted">{Math.round(volume * 100)}%</span>
          </div>
          <input
            type="range"
            className="tb-range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => onVolume(parseFloat(e.target.value))}
            aria-label="Volumen del pad"
          />
        </section>

        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={() => void togglePlay()}
            className={
              "flex h-20 w-20 items-center justify-center rounded-full text-white shadow-soft transition-transform active:scale-95 " +
              (playing ? "bg-text-muted" : "bg-accent shadow-[0_0_40px_-4px_var(--glow)]")
            }
            aria-label={playing ? "Detener audio" : "Reproducir audio"}
          >
            {playing ? (
              <Pause className="h-8 w-8" strokeWidth={2} />
            ) : (
              <Play className="h-8 w-8 translate-x-0.5" strokeWidth={2} />
            )}
          </button>
        </div>
      </main>
    </div>
  )
}
