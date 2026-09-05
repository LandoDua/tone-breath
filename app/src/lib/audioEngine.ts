import * as Tone from 'tone'
import type { Routine } from './routines'
import { getPhaseInfo } from './routines'
import {
  createAmbientPad,
  defaultAmbientProfile,
  profileForRoutine,
  type AmbientPadHandle,
  type AmbientProfile,
} from './ambientPad'
import { loadAudioLevels } from './audioSettings'

let synth: Tone.Synth | null = null
let metronomeGain: Tone.Gain | null = null
let reverb: Tone.Reverb | null = null
let ambient: AmbientPadHandle | null = null
let transportStarted = false
let initialized = false

const levels = loadAudioLevels()
let metronomeLevel = levels.metronome
let ambientLevel = levels.ambient

const NOTE_BY_PHASE: Record<string, string> = {
  inhale: 'C4',
  exhale: 'G3',
  hold: 'G4',
  holdEmpty: 'E4',
}

const PHASE_ACCENT = 0.7
const PHASE_MUTED = 0.15

export function getElapsed(): number {
  return Tone.Transport.seconds
}

export async function initAudio(): Promise<void> {
  if (initialized) return
  await Tone.start()
  reverb = new Tone.Reverb({ decay: 4, wet: 0.55 }).toDestination()
  await reverb.ready
  synth = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.01, decay: 0.3, sustain: 0.15, release: 1.6 },
    volume: 0,
  })
  metronomeGain = new Tone.Gain(metronomeLevel)
  synth.chain(metronomeGain, reverb)
  ambient = createAmbientPad()
  Tone.Transport.bpm.value = 60
  initialized = true
}

function ensureTransportRunning(): void {
  if (!transportStarted) {
    Tone.Transport.start()
    transportStarted = true
  }
  if (!ambient?.isPlaying()) {
    void ambient?.start()
  }
}

export function startMetronome(routine: Routine): void {
  if (!synth || !ambient) return
  Tone.Transport.cancel(0)
  let lastPhaseIndex = -1
  Tone.Transport.scheduleRepeat((time) => {
    const elapsed = Tone.Transport.seconds
    const phaseInfo = getPhaseInfo(routine, elapsed)
    const note = NOTE_BY_PHASE[phaseInfo.phase.name] ?? 'C4'
    const isFirstPulse = phaseInfo.phaseIndex !== lastPhaseIndex
    const velocity = isFirstPulse ? PHASE_ACCENT : PHASE_MUTED
    lastPhaseIndex = phaseInfo.phaseIndex
    synth!.triggerAttackRelease(note, '8n', time, velocity)
  }, '4n')
  ambient.setVolume(ambientLevel)
  void ambient.setProfile(profileForRoutine(routine))
  ensureTransportRunning()
}

export function startAmbientDemo(profile: AmbientProfile): void {
  if (!ambient) return
  Tone.Transport.cancel(0)
  void ambient.setProfile(profile)
  ambient.setVolume(ambientLevel)
  ensureTransportRunning()
}

export function stopAmbient(): void {
  ambient?.stop()
  if (transportStarted) {
    Tone.Transport.stop()
    transportStarted = false
  }
}

export function pauseTransport(): void {
  Tone.Transport.pause()
  ambient?.stop()
}

export function resumeTransport(): void {
  ensureTransportRunning()
}

export function stopMetronome(): void {
  Tone.Transport.stop()
  Tone.Transport.cancel(0)
  Tone.Transport.seconds = 0
  transportStarted = false
  ambient?.stop()
}

export function setAmbientProfile(profile: AmbientProfile): void {
  void ambient?.setProfile(profile)
}

export function getAmbientProfile(): AmbientProfile {
  return ambient?.getProfile() ?? defaultAmbientProfile()
}

export function setAmbientVolume(value: number): void {
  ambientLevel = value
  ambient?.setVolume(value)
}

export function getAmbientVolume(): number {
  return ambientLevel
}

export function setMetronomeVolume(value: number): void {
  metronomeLevel = value
  metronomeGain?.gain.rampTo(value, 0.05)
}

export function getMetronomeVolume(): number {
  return metronomeLevel
}

export function playCompletionChord(): void {
  if (!reverb) return
  const chordGain = new Tone.Gain(metronomeLevel)
  const chordSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: { attack: 0.8, decay: 0.2, sustain: 0.8, release: 2.5 },
    volume: -12,
  })
  chordSynth.connect(chordGain)
  chordGain.connect(reverb)
  chordSynth.triggerAttackRelease(['C4', 'E4', 'G4'], '2n')
  const now = Tone.now()
  chordGain.gain.setValueAtTime(metronomeLevel, now + 1.5)
  chordGain.gain.linearRampToValueAtTime(0, now + 3.5)
  setTimeout(() => {
    chordSynth.dispose()
    chordGain.dispose()
  }, 5000)
}

export function disposeAudio(): void {
  stopMetronome()
  synth?.dispose()
  metronomeGain?.dispose()
  reverb?.dispose()
  ambient?.dispose()
  synth = null
  metronomeGain = null
  reverb = null
  ambient = null
  initialized = false
  transportStarted = false
}
