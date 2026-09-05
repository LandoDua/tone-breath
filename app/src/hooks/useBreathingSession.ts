import { useCallback, useEffect, useRef, useState } from 'react'
import { useMotionValue, type MotionValue } from 'framer-motion'
import { defaultRoutine, type Routine, type RoutinePhase } from '../lib/routines'
import {
  getElapsed,
  initAudio,
  pauseTransport,
  playCompletionChord,
  resumeTransport,
  startMetronome,
  stopMetronome,
} from '../lib/audioEngine'
import { createBreathingClock, MIN_SCALE, type BreathingClockHandle } from '../lib/breathingClock'

export type SessionStatus = 'idle' | 'running' | 'paused' | 'finished'

export interface BreathingSession {
  scale: MotionValue<number>
  status: SessionStatus
  phase: RoutinePhase
  secondsRemaining: number
  completion: number
  isCompleting: boolean
  elapsedAtFinish: number
  start: (override?: { routine?: Routine; durationMinutes?: number }) => void
  pause: () => void
  resume: () => void
  finish: () => void
  resetCompleting: () => void
}

function useScreenWakeLock(active: boolean) {
  const lockRef = useRef<WakeLockSentinel | null>(null)

  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return
    let cancelled = false

    const request = async () => {
      try {
        const sentinel = await navigator.wakeLock.request('screen')
        if (!cancelled) {
          lockRef.current = sentinel
          sentinel.addEventListener('release', () => {
            lockRef.current = null
          })
        } else {
          sentinel.release()
        }
      } catch {
        // Wake lock not supported or denied — graceful fallback
      }
    }

    void request()

    return () => {
      cancelled = true
      lockRef.current?.release()
      lockRef.current = null
    }
  }, [active])
}

export function useBreathingSession(
  routine?: Routine,
  durationMinutes: number = 5,
  onComplete?: () => void,
): BreathingSession {
  const r0 = routine ?? defaultRoutine
  const total0 = Math.max(1, Math.round(durationMinutes * 60))
  const scale = useMotionValue(MIN_SCALE)
  const [status, setStatus] = useState<SessionStatus>('idle')
  const [phase, setPhase] = useState<RoutinePhase>(r0.phases[0])
  const [secondsRemaining, setSecondsRemaining] = useState(total0)
  const [completion, setCompletion] = useState(0)
  const [isCompleting, setIsCompleting] = useState(false)
  const [elapsedAtFinish, setElapsedAtFinish] = useState(0)

  const routineRef = useRef(r0)
  const durationRef = useRef(durationMinutes)
  const totalRef = useRef(total0)
  const statusRef = useRef<SessionStatus>('idle')
  const clockRef = useRef<BreathingClockHandle | null>(null)
  const onCompleteRef = useRef(onComplete)

  useScreenWakeLock(status === 'running')

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    routineRef.current = routine ?? defaultRoutine
    durationRef.current = durationMinutes
    totalRef.current = Math.max(1, Math.round(durationMinutes * 60))
    statusRef.current = status
  }, [routine, durationMinutes, status])

  const stopClock = useCallback(() => {
    clockRef.current?.stop()
    clockRef.current = null
  }, [])

  const finish = useCallback(() => {
    const elapsed = getElapsed()
    setElapsedAtFinish(elapsed)
    setCompletion(Math.min(1, elapsed / totalRef.current))
    stopMetronome()
    stopClock()
    playCompletionChord()
    setIsCompleting(true)
  }, [stopClock])

  const startClock = useCallback(() => {
    stopClock()
    clockRef.current = createBreathingClock(
      routineRef.current,
      scale,
      (phase) => {
        setPhase(phase)
      },
      (elapsed) => {
        setSecondsRemaining(Math.max(0, totalRef.current - Math.floor(elapsed)))
        if (elapsed >= totalRef.current && statusRef.current === 'running') {
          finish()
        }
      },
    )
  }, [scale, stopClock, finish])

  const start = useCallback(
    async (override?: { routine?: Routine; durationMinutes?: number }) => {
      if (override?.routine) routineRef.current = override.routine
      if (override?.durationMinutes != null) {
        durationRef.current = override.durationMinutes
        totalRef.current = Math.max(1, Math.round(override.durationMinutes * 60))
      }
      setSecondsRemaining(totalRef.current)
      await initAudio()
      if (statusRef.current === 'paused') {
        resumeTransport()
      } else {
        startMetronome(routineRef.current)
      }
      startClock()
      setStatus('running')
    },
    [startClock],
  )

  const pause = useCallback(() => {
    pauseTransport()
    stopClock()
    setStatus('paused')
  }, [stopClock])

  const resume = useCallback(() => {
    void start()
  }, [start])

  const resetCompleting = useCallback(() => {
    setIsCompleting(false)
  }, [])

  useEffect(() => {
    return () => {
      stopMetronome()
      stopClock()
    }
  }, [stopClock])

  return { scale, status, phase, secondsRemaining, completion, isCompleting, elapsedAtFinish, start, pause, resume, finish, resetCompleting }
}
