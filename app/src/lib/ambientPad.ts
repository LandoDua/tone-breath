import * as Tone from 'tone'
import type { Routine } from './routines'

export interface AmbientProfile {
  name: string
  label: string
  scale: string[]
  filterHz: number
  chorus: number
  panner: number
  behavior: 'stable' | 'expansive' | 'grounded'
}

const PROFILES: Record<string, AmbientProfile> = {
  '4-7-8': {
    name: 'dormir',
    label: 'Dormir',
    scale: ['C3', 'G3', 'D4', 'C4', 'E4', 'A3'],
    filterHz: 800,
    chorus: 0.4,
    panner: 0,
    behavior: 'stable',
  },
  coherent: {
    name: 'calma',
    label: 'Calma',
    scale: ['F3', 'A3', 'C4', 'E4', 'D4', 'B3'],
    filterHz: 1000,
    chorus: 0.5,
    panner: 0.4,
    behavior: 'expansive',
  },
  square: {
    name: 'foco',
    label: 'Foco',
    scale: ['C3', 'F3', 'G3', 'D4', 'C4', 'E4'],
    filterHz: 900,
    chorus: 0.6,
    panner: 0,
    behavior: 'grounded',
  },
}

export const AMBIENT_PROFILES: AmbientProfile[] = [
  PROFILES['4-7-8'],
  PROFILES.coherent,
  PROFILES.square,
]

export function defaultAmbientProfile(): AmbientProfile {
  return PROFILES.coherent
}

export function profileForRoutine(routine: Routine): AmbientProfile {
  return PROFILES[routine.id] ?? defaultAmbientProfile()
}

function randomScaleNote(scale: string[], exclude?: string): string {
  let candidates = scale
  if (exclude && scale.length > 1) {
    candidates = scale.filter((n) => n !== exclude)
  }
  return candidates[Math.floor(Math.random() * candidates.length)]
}

export interface AmbientPadHandle {
  getProfile: () => AmbientProfile
  isPlaying: () => boolean
  setProfile: (profile: AmbientProfile) => void
  setVolume: (value: number) => void
  start: () => void
  stop: () => void
  dispose: () => void
}

export function createAmbientPad(): AmbientPadHandle {
  let pad: Tone.PolySynth | null = null
  let vibrato: Tone.Vibrato | null = null
  let chorus: Tone.Chorus | null = null
  let filter: Tone.Filter | null = null
  let panner: Tone.AutoPanner | null = null
  let reverb: Tone.Reverb | null = null
  let gain: Tone.Gain | null = null

  let current: AmbientProfile = defaultAmbientProfile()
  let currentNote: string | null = null
  let playing = false
  let glideId: number | null = null
  let buildPromise: Promise<void> | null = null

  const teardownNodes = () => {
    pad?.releaseAll()
    pad?.dispose()
    vibrato?.dispose()
    chorus?.dispose()
    filter?.dispose()
    panner?.dispose()
    reverb?.dispose()
    gain?.dispose()
    pad = null
    vibrato = null
    chorus = null
    filter = null
    panner = null
    reverb = null
    gain = null
  }

  const build = (profile: AmbientProfile): Promise<void> => {
    current = profile
    teardownNodes()

    const poly = (pad = new Tone.PolySynth(Tone.AMSynth, {
      harmonicity: 1.01,
      oscillator: { type: 'triangle' },
      modulation: { type: 'sine' },
      envelope: { attack: 4, decay: 0, sustain: 0.9, release: 5 },
      modulationEnvelope: { attack: 4, decay: 0, sustain: 0.9, release: 5 },
    }))

    const vib = (vibrato = new Tone.Vibrato({ frequency: 4.5, depth: 0.15 }))
    const cho = (chorus = new Tone.Chorus(4, 2.5, profile.chorus).start())
    const flt = (filter = new Tone.Filter(profile.filterHz, 'lowpass'))
    const g = (gain = new Tone.Gain(0.8))

    poly.chain(vib, cho, flt, g)

    let out: Tone.ToneAudioNode = g
    if (profile.panner > 0) {
      out = panner = new Tone.AutoPanner({ frequency: 0.08, depth: profile.panner }).start()
      g.connect(out)
    }

    const rvb = (reverb = new Tone.Reverb({ decay: 6, preDelay: 0.1, wet: 0.7 }))
    buildPromise = rvb.ready.then(() => {
      out.connect(rvb)
      rvb.toDestination()
      buildPromise = null
    })
    currentNote = null
    return buildPromise
  }

  const glide = () => {
    if (!pad || !playing) return
    const note = randomScaleNote(current.scale, currentNote ?? undefined)
    currentNote = note
    pad.triggerAttackRelease(note, 7)
  }

  const start = async () => {
    if (playing) return
    playing = true
    if (!pad) await build(current)
    else if (buildPromise) await buildPromise
    glide()
    if (glideId != null) Tone.Transport.clear(glideId)
    glideId = Tone.Transport.scheduleRepeat(() => glide(), 8)
  }

  const stop = () => {
    if (!playing) return
    playing = false
    if (glideId != null) {
      Tone.Transport.clear(glideId)
      glideId = null
    }
    pad?.releaseAll()
  }

  const setProfile = async (profile: AmbientProfile) => {
    if (profile.name === current.name) return
    const wasPlaying = playing
    stop()
    await build(profile)
    if (wasPlaying) start()
  }
  const setVolume = (value: number) => {
    if (gain) gain.gain.rampTo(value, 0.05)
  }

  const dispose = () => {
    if (glideId != null) {
      Tone.Transport.clear(glideId)
      glideId = null
    }
    playing = false
    teardownNodes()
  }

  return {
    getProfile: () => current,
    isPlaying: () => playing,
    setProfile,
    setVolume,
    start,
    stop,
    dispose,
  }
}
