import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Music, X } from "lucide-react"
import {
  getAmbientVolume,
  getMetronomeVolume,
  setAmbientVolume,
  setMetronomeVolume,
} from "../../lib/audioEngine"
import { saveAudioLevels } from "../../lib/audioSettings"

interface VolumeControlsProps {
  open: boolean
  onClose: () => void
}

interface VolumeRowProps {
  label: string
  percent: number
  onPercent: (v: number) => void
}

function VolumeRow({ label, percent, onPercent }: VolumeRowProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-text">{label}</span>
        <span className="tabular-nums text-text-muted">{Math.round(percent * 100)}%</span>
      </div>
      <input
        type="range"
        className="tb-range"
        min={0}
        max={1}
        step={0.05}
        value={percent}
        onChange={(e) => onPercent(parseFloat(e.target.value))}
        aria-label={label}
      />
    </div>
  )
}

export function VolumeControls({ open, onClose }: VolumeControlsProps) {
  const [metronome, setMetronome] = useState(getMetronomeVolume())
  const [ambient, setAmbient] = useState(getAmbientVolume())

  const onMetronome = (v: number) => {
    setMetronome(v)
    setMetronomeVolume(v)
    saveAudioLevels({ metronome: v, ambient })
  }

  const onAmbient = (v: number) => {
    setAmbient(v)
    setAmbientVolume(v)
    saveAudioLevels({ metronome, ambient: v })
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Control de volumen"
            className="w-full max-w-[340px] rounded-3xl bg-surface p-6 shadow-soft"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <Music className="h-5 w-5" strokeWidth={1.8} />
                </div>
                <h2 className="text-lg font-medium text-text">Sonido</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="flex h-10 w-10 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-2 active:scale-95"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>

            <div className="flex flex-col gap-6">
              <VolumeRow label="Pulsos (metrónomo)" percent={metronome} onPercent={onMetronome} />
              <VolumeRow label="Música de fondo" percent={ambient} onPercent={onAmbient} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}