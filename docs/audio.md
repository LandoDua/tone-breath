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

| Fase          | Rutina         | Etiqueta | Nota   | Carácter  |
| ------------- | -------------- | -------- | ------ | ---------- |
| `inhale`    | todas          | Inhala   | `C4` | referencia |
| `exhale`    | todas          | Exhala   | `G3` | grave      |
| `hold`      | Dormir/Estrés | Retén   | `G4` | agudo      |
| `holdEmpty` | Estrés        | Pausa    | `E4` | neutro     |

Cualquier fase desconocida cae a `C4` por defecto (`?? 'C4'`).

## Fuentes de sonido

### 1. Metrónomo — `startMetronome(routine)`

- Pulso regular cada **`'4n'`** (1 segundo a 60 BPM).
- La nota **sigue a la fase activa**: en cada tick consulta `getPhaseInfo(routine, elapsed)` y dispara la nota de esa fase.
- Duración de la nota: `'8n'` (0.5 s).
- **Acentuación por fase**: el primer pulso de cada fase (inhalar, mantener, etc.) suena a *velocity* **0.7** para marcar el cambio de fase; el resto se atenúa a **0.15**.
- Se agenda con `Tone.Transport.scheduleRepeat` (colgado del reloj de audio, por eso es estable).

### 2. Pad ambiental — `app/src/lib/ambientPad.ts`

- **Colchón continuo** de `Tone.PolySynth(Tone.AMSynth)` (triangular, `harmonicity 1.01`) con envolvente de ataque/release largos (`attack 4s`, `release 5s`).
- Cadena de efectos: `Vibrato(4.5, 0.15)` → `Chorus(4, 2.5)` → `Filter(lowpass)` → (opcional `AutoPanner`) → `Reverb` propio (`decay 6`, `preDelay 0.1`, `wet 0.7`).
- Perfil distinto por modo (escala, filtro base, chorus, comportamiento):
  - `4-7-8` (Dormir): pentatónica menor, **800 Hz**, oscuro y estable.
  - `coherent` (Calma): acordes Maj7/Dom7, **1000 Hz**, marea expansiva con paneo estéreo.
  - `square` (Foco): acordes Sus4, **900 Hz**, presente y sólido.
- **Glide generativo**: cada 8 s selecciona una nota de la escala del modo activo y la toca largamente, evitando la monotonía.
- Suena durante toda la sesión a volumen menor que el metrónomo (`0.4`).

## Niveles y ajustes

| Parámetro             | Valor actual | Dónde                |
| ---------------------- | ------------ | -------------------- |
| Synth volume          | -4 dB        | `initAudio`          |
| Reverb metrónomo      | decay 4, wet 0.55 | `initAudio`     |
| Reverb pad            | decay 6, wet 0.7 | `ambientPad`    |
| Velocity 1er pulso fase | 0.7          | `startMetronome`     |
| Velocity resto         | 0.15         | `startMetronome`     |
| Volumen pad sesión     | 0.4          | `startMetronome`     |

> Notas de uso:
>
> - `pauseTransport()` / `resumeTransport()` pausan y reanudan el `Transport` (detienen/reanudan también el pad).
> - `stopMetronome()` resetea `Transport.seconds` a 0 y detiene el pad.
> - `disposeAudio()` libera synth/reverb/pad y vuelve a `initialized = false`.
> - Demo: `startAmbientDemo(profile)`, `setAmbientProfile(profile)`, `setAmbientVolume(value)` en `/demo`.

## Pendiente (próximo paso)

- **Barra de volumen maestro** en la UI (aún no implementada). Probablemente un gancho `useMasterVolume` que ajuste el volumen del synth, y opcionalmente el `wet` de la reverb desde pantalla.
- Afinar niveles de reverb, tonos y perfiles del pad según feedback auditivo.
