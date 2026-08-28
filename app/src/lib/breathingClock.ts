import type { MotionValue } from 'framer-motion'
import * as Tone from 'tone'
import type { Routine, RoutinePhase } from './routines'
import { getPhaseInfo } from './routines'

export const MIN_SCALE = 0.42
export const MAX_SCALE = 1.0

export interface BreathingClockHandle {
  stop: () => void
}

function targetScale(phaseName: RoutinePhase['name'], progress: number, elapsed: number): number {
  const pulse = Math.sin((elapsed / 1.6) * Math.PI * 2) * 0.015
  switch (phaseName) {
    case 'inhale':
      return MIN_SCALE + (MAX_SCALE - MIN_SCALE) * progress
    case 'exhale':
      return MAX_SCALE - (MAX_SCALE - MIN_SCALE) * progress
    case 'hold':
      return MAX_SCALE + pulse
    case 'holdEmpty':
      return MIN_SCALE + pulse
  }
}

export function createBreathingClock(
  routine: Routine,
  scale: MotionValue<number>,
  onPhaseChange: (phase: RoutinePhase, phaseIndex: number) => void,
  onSecond?: (elapsed: number) => void,
): BreathingClockHandle {
  let raf = 0
  let lastPhaseIndex = -1
  let lastSecond = -1

  const loop = () => {
    const elapsed = Tone.Transport.seconds
    const { phase, progress, phaseIndex } = getPhaseInfo(routine, elapsed)
    scale.set(targetScale(phase.name, progress, elapsed))

    if (phaseIndex !== lastPhaseIndex) {
      lastPhaseIndex = phaseIndex
      onPhaseChange(phase, phaseIndex)
    }

    if (onSecond) {
      const sec = Math.floor(elapsed)
      if (sec !== lastSecond) {
        lastSecond = sec
        onSecond(elapsed)
      }
    }

    raf = requestAnimationFrame(loop)
  }

  raf = requestAnimationFrame(loop)
  return { stop: () => cancelAnimationFrame(raf) }
}
