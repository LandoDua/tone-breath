# Flujo de sesión y finalización

Documenta el ciclo de vida de una sesión de respiración: desde el wake lock hasta la animación de finalización y la pantalla de resultados.

## Wake Lock — evitar apagado de pantalla

Implementado en `app/src/hooks/useBreathingSession.ts` con el hook interno `useScreenWakeLock`.

- Usa la **Screen Wake Lock API** (`navigator.wakeLock.request('screen')`).
- Se adquiere automáticamente cuando el estado de la sesión es `'running'`.
- Se libera al pausar, finalizar, o desmontar el componente.
- Si el browser no soporta la API, falla silenciosamente (fallback graceful).
- La pantalla de resultados (`SessionSummaryPage`) también libera cualquier wake lock residual al montar como medida de seguridad.

## Animación de finalización

Implementada en `app/src/pages/ActiveSessionPage.tsx`.

Cuando la sesión se completa (tiempo agotado o botón "Finalizar"):

1. Se ejecuta `finish()` en el hook, que:
   - Detiene el metrónomo y el reloj de respiración.
   - Toca el acorde de finalización.
   - Marca `isCompleting = true`.
2. La UI reacciona al estado `isCompleting`:
   - **Header, footer e indicador de fase** hacen fade out en 0.4s.
   - **El círculo de respiración** se expande de su escala actual a 8x en 1.4s (ease-in).
   - **El fondo** cambia al color accent con una transición CSS de 1s.
3. Después de **1.8 segundos** (1.4s animación + buffer), se navega a `/summary`.
4. La transición entre la sesión y el resumen es un **fade**自然 (AnimatePresence de React Router).

La navegación está controlada por un `useEffect` en `App.tsx` que observa `session.isCompleting` y usa un `setTimeout`.

## Acorde de finalización

Implementado en `app/src/lib/audioEngine.ts` → `playCompletionChord()`.

- **Notas**: C4 + E4 + G4 (acorde de Do mayor, sonido dulce y resolutivo).
- **Sintetizador**: `Tone.PolySynth(Tone.Synth)` temporal con oscilador sine.
- **Volumen**: controlado por `metronomeLevel` (mismo volumen que los pulsos del metrónomo, por defecto 0.63).
- **Envelope**: attack 0.8s, decay 0.2s, sustain 0.8, release 2.5s.
- **Fade out**: la ganancia baja linealmente desde el segundo 1.5 hasta el 3.5.
- **Limpieza**: el synth y su ganancia se disponen a los 5 segundos.
- Se conecta a la misma `reverb` que el metrónomo para mantener coherencia espacial.

## Reset de `isCompleting`

Para evitar que la navegación automática se re-active al volver al home:

- El hook expone `resetCompleting()` que pone `isCompleting = false`.
- Se llama inmediatamente después de navegar a `/summary` en `App.tsx`.
- Así, al regresar a `/`, el `useEffect` que observa `isCompleting` ya no dispara.

## Pantalla de resultados — `SessionSummaryPage`

- Muestra el **tiempo real transcurrido** (`elapsedAtFinish`), no el programado.
  - Si `elapsedSeconds > 0`, formatea con `formatTime()` (mm:ss).
  - Si es 0 (no debería ocurrir), muestra los minutos programados.
- **Icono de rutina**: en lugar de un check genérico, muestra el icono correspondiente a cada rutina:
  - `4-7-8` (Dormir) → `Moon`
  - `coherent` (Relajar) → `Waves`
  - `square` (Foco) → `Square`
- Libera wake lock residual al montar.

## Iconos de rutina

Los iconos se definieron en `app/src/lib/routines.ts` en el tipo `Routine.icon`:

| Rutina      | Icono     | Componente lucide-react |
| ----------- | --------- | ----------------------- |
| `4-7-8`     | `'moon'`  | `Moon`                  |
| `coherent`  | `'waves'` | `Waves`                 |
| `square`    | `'square'`| `Square`                |

El mismo mapping se usa en `HomePage.tsx` (local) y en `SessionSummaryPage.tsx` (via `ICON_MAP`).

## Flujo completo

```
Home → Seleccionar rutina → Seleccionar tiempo → Sesión (wake lock activo)
  ↓
Sesión corriendo (circulo animado + metrónomo + pad ambiental)
  ↓
Tiempo agotado / Botón "Finalizar"
  ↓
finish() → stop metronome → play chord → isCompleting = true
  ↓
Animación: controles fade out + círculo expande + fondo cambia (1.4s)
  ↓
setTimeout(1.8s) → navigate("/summary") → resetCompleting()
  ↓
Resultados: tiempo real + icono rutina (wake lock liberado)
  ↓
Volver al Inicio
```
