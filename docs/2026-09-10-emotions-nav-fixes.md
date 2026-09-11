# Cambios de Emociones y Navegación — 10 Septiembre 2026

## Sistema de Emociones

### Escala de 3 niveles
Cada emoción tiene 3 estados:
| Valor | Estado | Descripción |
|-------|--------|-------------|
| 0 | No percibido | Emoción no presente |
| 1 | Ligero | Emoción presente pero leve |
| 2 | Notable | Emoción fuerte o intensa |

### Orden de emociones (radar)
Positivas arriba, negativas abajo:
```
        Calma (↑)
  Apertura     Energía (↑)
    Estrés (↓)   Tristeza (↓)
        Ansiedad (↓)
```

### Colores
| Emoción | Color | Hex | Tipo |
|---------|-------|-----|------|
| Calma | Teal | `#14b8a6` | Positiva |
| Energía | Amber | `#f59e0b` | Positiva |
| Apertura | Purple | `#a855f7` | Positiva |
| Estrés | Red | `#ef4444` | Negativa |
| Tristeza | Slate | `#64748b` | Negativa |
| Ansiedad | Rose | `#f43f5e` | Negativa |

### Interacción con el radar
- **Tap**: Cicla entre 0 → 1 → 2 → 0
- **Pausa del timer**: Al tocar cualquier botón, el auto-skip de 5s se pausa
- **Estado visible**: Cada botón muestra el estado actual (ej: "Calma Ligero")

### Visualización
- **Vértices**: Glow/sutil de color según intensidad
  - Radio: `18 + value * 6`
  - Opacidad: `0.15 + value * 0.1`
- **Polígono**: Color según emoción dominante
- **Grid**: 3 hexágonos concéntricos (0, 1, 2)

### Animaciones
- **Polígono**: Interpolación suave de 300ms entre estados
- **Vértices**: Movimiento suave con los puntos
- **Pulse**: Efecto de latido sutil (escala 1.03, ciclo 4s)
  - Se activa con `pulse={true}` durante la sesión

### Pantalla de resultados
- Radar interactivo con "¿Cómo te sientes ahora?"
- Pre-carga con emotionAfter o emotionBefore
- Delta en tiempo real al modificar
- Botón "Confirmar Emociones" para guardar
- Botón "Volver al Inicio" para salir

---

## Navegación

### Session exit (X o Finalizar)
```typescript
session.stop()  // Detiene metrónomo, cronómetro, audio
navigate("/")   // Navega a home
```

### Session completion → Summary
```typescript
session.stop()  // Detiene todo
navigate("/summary")
```

### Summary → Home
```typescript
// Botón "Volver al Inicio"
onHome()  // Resetea emociones, navega a "/"
```

### Back button en Summary
- Navega a home (no a la sesión)
- El historial se reemplaza correctamente

---

## Archivos modificados

### Frontend
- `app/src/components/emotion/types.ts` — Escala 0/1/2, orden de emociones
- `app/src/components/emotion/EmotionRadar.tsx` — Animaciones, glow, pulse
- `app/src/components/emotion/EmotionScreen.tsx` — Pausa de timer
- `app/src/components/emotion/EmotionDelta.tsx` — Adaptado a 3 niveles
- `app/src/pages/SessionSummaryPage.tsx` — Radar interactivo
- `app/src/hooks/useBreathingSession.ts` — Función stop()
- `app/src/App.tsx` — Navegación corregida

### Backend
- `backend/app/routers/emotions.py` — Modelo actualizado
- `backend/tests/test_api.py` — Test data actualizado
