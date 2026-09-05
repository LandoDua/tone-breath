export type PhaseName = 'inhale' | 'hold' | 'exhale' | 'holdEmpty'

export interface RoutinePhase {
  name: PhaseName
  duration: number
  label: string
}

export interface Routine {
  id: string
  name: string
  description: string
  icon: 'moon' | 'waves' | 'square'
  defaultDuration: number
  phases: RoutinePhase[]
}

export const routines: Record<string, Routine> = {
  '4-7-8': {
    id: '4-7-8',
    name: 'Dormir',
    description: 'Desconecta la mente',
    icon: 'moon',
    defaultDuration: 8,
    phases: [
      { name: 'inhale', duration: 4, label: 'Inhala' },
      { name: 'hold', duration: 7, label: 'Retén' },
      { name: 'exhale', duration: 8, label: 'Exhala' },
    ],
  },
  coherent: {
    id: 'coherent',
    name: 'Relajar',
    description: 'Paz en el presente',
    icon: 'waves',
    defaultDuration: 5,
    phases: [
      { name: 'inhale', duration: 5.5, label: 'Inhala' },
      { name: 'exhale', duration: 5.5, label: 'Exhala' },
    ],
  },
  square: {
    id: 'square',
    name: 'Estrés',
    description: 'Alivio inmediato',
    icon: 'square',
    defaultDuration: 4,
    phases: [
      { name: 'inhale', duration: 4, label: 'Inhala' },
      { name: 'hold', duration: 4, label: 'Retén' },
      { name: 'exhale', duration: 4, label: 'Exhala' },
      { name: 'holdEmpty', duration: 4, label: 'Pausa' },
    ],
  },
}

export const routineList: Routine[] = [routines['4-7-8'], routines.coherent, routines.square]

export const defaultRoutine: Routine = routines.coherent

export function getCycleDuration(routine: Routine): number {
  return routine.phases.reduce((sum, p) => sum + p.duration, 0)
}

export interface PhaseInfo {
  phase: RoutinePhase
  progress: number
  phaseIndex: number
  phaseStart: number
  cycleTime: number
  cycleDuration: number
}

export function getPhaseInfo(routine: Routine, elapsedSeconds: number): PhaseInfo {
  const cycleDuration = getCycleDuration(routine)
  const cycleTime = ((elapsedSeconds % cycleDuration) + cycleDuration) % cycleDuration

  let accumulated = 0
  for (let i = 0; i < routine.phases.length; i++) {
    const phase = routine.phases[i]
    if (cycleTime < accumulated + phase.duration) {
      return {
        phase,
        progress: (cycleTime - accumulated) / phase.duration,
        phaseIndex: i,
        phaseStart: accumulated,
        cycleTime,
        cycleDuration,
      }
    }
    accumulated += phase.duration
  }

  const last = routine.phases[routine.phases.length - 1]
  return {
    phase: last,
    progress: 1,
    phaseIndex: routine.phases.length - 1,
    phaseStart: accumulated - last.duration,
    cycleTime,
    cycleDuration,
  }
}

export function formatPhasePattern(routine: Routine): string {
  return routine.phases.map((p) => String(p.duration)).join(' - ')
}
