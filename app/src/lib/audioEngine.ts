import * as Tone from 'tone'
import type { Routine } from './routines'
import { getPhaseInfo } from './routines'

let synth: Tone.Synth | null = null
let reverb: Tone.Reverb | null = null
let initialized = false

const NOTE_BY_PHASE: Record<string, string> = {
  inhale: 'C4',
  exhale: 'G3',
  hold: 'G4',
  holdEmpty: 'E4',
}

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
    volume: -4,
  }).connect(reverb)
  Tone.Transport.bpm.value = 60
  initialized = true
}

export function startMetronome(routine: Routine): void {
  if (!synth) return
  Tone.Transport.cancel(0)
  Tone.Transport.scheduleRepeat((time) => {
    const elapsed = Tone.Transport.seconds
    const phase = getPhaseInfo(routine, elapsed).phase
    const note = NOTE_BY_PHASE[phase.name] ?? 'C4'
    synth!.triggerAttackRelease(note, '8n', time, 0.5)
  }, '4n')
  Tone.Transport.start()
}

export function playPhaseCue(phaseName: string): void {
  if (!synth) return
  const note = NOTE_BY_PHASE[phaseName] ?? 'C4'
  const now = Tone.now()
  synth.triggerAttackRelease(note, '32n', now, 0.9)
  synth.triggerAttackRelease(note, '32n', now + 0.16, 0.7)
  synth.triggerAttackRelease(note, '32n', now + 0.32, 0.5)
}

export function pauseTransport(): void {
  Tone.Transport.pause()
}

export function resumeTransport(): void {
  Tone.Transport.start()
}

export function stopMetronome(): void {
  Tone.Transport.stop()
  Tone.Transport.cancel(0)
  Tone.Transport.seconds = 0
}

export function disposeAudio(): void {
  stopMetronome()
  synth?.dispose()
  reverb?.dispose()
  synth = null
  reverb = null
  initialized = false
}
