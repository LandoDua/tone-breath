export interface AudioLevels {
  metronome: number
  ambient: number
}

export const DEFAULT_AUDIO_LEVELS: AudioLevels = {
  metronome: 0.63,
  ambient: 0.4,
}

const STORAGE_KEY = 'tone-breath:audio-levels'

function clamp(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(1, Math.max(0, value))
}

export function loadAudioLevels(): AudioLevels {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_AUDIO_LEVELS
    const parsed = JSON.parse(raw) as Partial<AudioLevels>
    return {
      metronome: clamp(parsed.metronome ?? DEFAULT_AUDIO_LEVELS.metronome),
      ambient: clamp(parsed.ambient ?? DEFAULT_AUDIO_LEVELS.ambient),
    }
  } catch {
    return DEFAULT_AUDIO_LEVELS
  }
}

export function saveAudioLevels(levels: AudioLevels): void {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ metronome: clamp(levels.metronome), ambient: clamp(levels.ambient) }),
    )
  } catch {
    // Ignorar fallos de almacenamiento (modo privado, cuota, etc.)
  }
}