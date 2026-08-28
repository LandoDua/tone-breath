# Documentación de audio

Motor de sonido de Tone Breath. Implementado en `app/src/lib/audioEngine.ts` usando [Tone.js](https://tonejs.github.io/) v15.

## Arquitectura

- **Synth**: un único `Tone.Synth` con oscilador **sine**.
  - Envelope: `attack 0.01`, `decay 0.3`, `sustain 0.15`, `release 1.6`.
  - `volume: -4 dB`.
  - Se conecta a la reverb y su salida va a `Destination`.
- **Reverb**: `Tone.Reverb` con `decay 4` y `wet 0.55` (55% de señal húmeda), en `toDestination()`.
- **Transport**: `Tone.Transport` a **60 BPM** (un pulso = 1 segundo).
- Inicialización: `initAudio()` (`Tone.start()` para desbloquear audio tras gesto del usuario).

## Tonos por fase

Cada fase de la respiración tiene su propia nota (`NOTE_BY_PHASE` en `audioEngine.ts`):

| Fase         | Rutina         | Etiqueta    | Nota | Carácter        |
|--------------|----------------|-------------|------|-----------------|
| `inhale`     | todas          | Inhala      | `C4` | referencia      |
| `exhale`     | todas          | Exhala      | `G3` | grave           |
| `hold`       | Dormir/Estrés  | Retén       | `G4` | agudo           |
| `holdEmpty`  | Estrés         | Pausa       | `E4` | neutro          |

Cualquier fase desconocida cae a `C4` por defecto (`?? 'C4'`).

## Fuentes de sonido

### 1. Metrónomo — `startMetronome(routine)`
- Pulso regular cada **`'4n'`** (1 segundo a 60 BPM).
- La nota **sigue a la fase activa**: en cada tick consulta `getPhaseInfo(routine, elapsed)` y dispara la nota de esa fase.
- Duración de la nota: `'8n'` (0.5 s). Velocity: **0.5** (uniforme).
- Se agenda con `Tone.Transport.scheduleRepeat` (colgado del reloj de audio, por eso es estable).

### 2. Cue de borde de fase — `playPhaseCue(phaseName)`
- Se dispara **exactamente** en el cambio de fase (desde `onPhaseChange` del reloj visual en `useBreathingSession.ts`), en `Tone.now()`.
- Es un **grupeto de 3 notas** `'32n'` con espaciado de 0.16 s y velocities decrecientes (`0.9`, `0.7`, `0.5`).
- Usa la nota de la fase entrante, así el cambio de fase se oye claro (p. ej. al pasar a Exhalar se escucha `G3` de inmediato) y da la sensación de "metrónomo más rápido" en ese instante.

## Niveles y ajustes

| Parámetro              | Valor actual | Dónde              |
|------------------------|--------------|--------------------|
| Synth volume           | -4 dB        | `initAudio`        |
| Reverb decay           | 4 s          | `initAudio`        |
| Reverb wet             | 0.55         | `initAudio`        |
| Velocity metrónomo     | 0.5          | `startMetronome`   |
| Velocity cues          | 0.9 / 0.7 / 0.5 | `playPhaseCue`   |

> Notas de uso:
> - `pauseTransport()` / `resumeTransport()` pausan y reanudan el `Transport` (el metrónomo se detiene, los cues los controla el reloj visual que también se detiene).
> - `stopMetronome()` resetea `Transport.seconds` a 0.
> - `disposeAudio()` libera synth/reverb y vuelve a `initialized = false`.

## Pendiente (próximo paso)

- **Barra de volumen** en la UI (aún no implementada). Probablemente un gancho `useMasterVolume` que ajuste el volumen del synth, y opcionalmente el `wet` de la reverb desde pantalla.
- Afinar niveles de reverb y tonos según feedback auditivo.