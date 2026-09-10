# Fase 2: UI/UX - Registro de Emociones

## 1. Filosofía del Registro

El registro emocional debe sentirse como una micro-pausa, no como una tarea. El usuario debe poder expresar cómo se siente en 2-3 taps, y la app debe respetar si prefiere no hacerlo.

**Principios:**
- **Ultra-rápido**: 2-3 taps máximo, auto-skip después de 2 segundos
- **No intrusivo**: Se siente como parte del flujo, no como una interrupción
- **Visual inmediato**: El polígono del radar se actualiza en tiempo real
- **Empático**: "¿Cómo te sientes?" no "Registrá tu estado emocional"

---

## 2. Flujo de Experiencia

### 2.1 Registro Antes de Sesión

```
┌─────────────────────────────────────────┐
│         Usuario toca "Iniciar"          │
└───────────────────┬─────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│  "¿Cómo te sientes?"                   │
│                                         │
│         * Calma *                       │
│        /       \                        │
│  Apertura     Ansiedad                  │
│      |         |                        │
│  Tristeza     Energía                   │
│        \       /                        │
│         * Enfoque *                     │
│                                         │
│  [Omitir]              [Confirmar]      │
│                                         │
│  ⏱️ Auto-skip en 2s...                  │
└───────────────────┬─────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌───────────────┐       ┌───────────────┐
│  Sesión       │       │  Sesión       │
│  comienza     │       │  comienza     │
│  (sin datos)  │       │  (con datos)  │
└───────────────┘       └───────────────┘
```

### 2.2 Registro Después de Sesión

```
┌─────────────────────────────────────────┐
│  Sesión completada                      │
│  "¿Cómo te sientes ahora?"             │
│                                         │
│         * Calma *                       │
│        /       \                        │
│  Apertura     Ansiedad                  │
│      |         |                        │
│  Tristeza     Energía                   │
│        \       /                        │
│         * Enfoque *                     │
│                                         │
│  [Omitir]              [Confirmar]      │
└───────────────────┬─────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│  Resumen de sesión                      │
│  "Tu mente te agradece este momento"    │
│                                         │
│  Delta: Calma ↑2  Ansiedad ↓3          │
│                                         │
│  [Continuar]                            │
└─────────────────────────────────────────┘
```

---

## 3. Componentes UI

### 3.1 EmotionScreen (Pantalla Completa)

```tsx
// components/emotion/EmotionScreen.tsx
interface EmotionScreenProps {
  type: 'before' | 'after';
  sessionDuration?: number;
  routineType?: string;
  onConfirm: (dimensions: EmotionDimensions) => void;
  onSkip: () => void;
}

export function EmotionScreen({
  type,
  onConfirm,
  onSkip
}: EmotionScreenProps) {
  const [dimensions, setDimensions] = useState<EmotionDimensions>({
    calma: 5,
    ansiedad: 5,
    energia: 5,
    tristeza: 5,
    enfoque: 5,
    apertura: 5
  });

  // Auto-skip después de 2 segundos
  useEffect(() => {
    const timer = setTimeout(onSkip, 2000);
    return () => clearTimeout(timer);
  }, [onSkip]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900 z-50 flex flex-col items-center justify-center p-6"
    >
      <h2 className="text-xl text-slate-100 mb-8">
        ¿Cómo te sientes{type === 'after' ? ' ahora' : ''}?
      </h2>

      <EmotionRadar
        dimensions={dimensions}
        onChange={setDimensions}
        size="full"
      />

      <div className="flex gap-4 mt-8 w-full max-w-xs">
        <button
          onClick={onSkip}
          className="flex-1 py-3 px-4 rounded-xl bg-slate-700 text-slate-300
                     hover:bg-slate-600 transition-colors"
        >
          Omitir
        </button>
        <button
          onClick={() => onConfirm(dimensions)}
          className="flex-1 py-3 px-4 rounded-xl bg-teal-500 text-white
                     hover:bg-teal-400 transition-colors"
        >
          Confirmar
        </button>
      </div>

      <p className="text-slate-500 text-sm mt-4">
        Auto-skip en 2s...
      </p>
    </motion.div>
  );
}
```

### 3.2 EmotionRadar (Gráfico Radar)

```tsx
// components/emotion/EmotionRadar.tsx
interface EmotionRadarProps {
  dimensions: EmotionDimensions;
  onChange?: (dims: EmotionDimensions) => void;
  size: 'full' | 'card' | 'mini';
  interactive?: boolean;
}

export function EmotionRadar({
  dimensions,
  onChange,
  size = 'full',
  interactive = true
}: EmotionRadarProps) {
  const sizeMap = {
    full: 280,
    card: 120,
    mini: 64
  };

  const svgSize = sizeMap[size];
  const center = svgSize / 2;
  const radius = (svgSize / 2) - 20;

  // Calcular puntos del polígono
  const dimensionsArray = Object.values(dimensions);
  const angleStep = (Math.PI * 2) / 6;

  const points = dimensionsArray.map((value, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const r = (value / 10) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  });

  const polygonPoints = points.map(p => `${p.x},${p.y}`).join(' ');

  // Handles para interacción
  const handleAxisTap = (axis: keyof EmotionDimensions) => {
    if (!interactive || !onChange) return;

    onChange({
      ...dimensions,
      [axis]: Math.min(10, dimensions[axis] + 1)
    });
  };

  const handleAxisLongPress = (axis: keyof EmotionDimensions) => {
    if (!interactive || !onChange) return;

    onChange({
      ...dimensions,
      [axis]: Math.max(0, dimensions[axis] - 1)
    });
  };

  return (
    <motion.svg
      width={svgSize}
      height={svgSize}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      {/* Grid rings */}
      {[0.33, 0.66, 1].map((scale, i) => (
        <polygon
          key={i}
          points={getHexagonPoints(center, radius * scale)}
          fill="none"
          stroke="#6C7A77"
          strokeOpacity={0.3}
          strokeWidth={1}
        />
      ))}

      {/* Axes */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const x2 = center + radius * Math.cos(angle);
        const y2 = center + radius * Math.sin(angle);

        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={x2}
            y2={y2}
            stroke="#6C7A77"
            strokeOpacity={0.3}
            strokeWidth={1}
          />
        );
      })}

      {/* Polygon */}
      <motion.polygon
        points={polygonPoints}
        fill="#14B8A6"
        fillOpacity={0.2}
        stroke="#14B8A6"
        strokeOpacity={0.8}
        strokeWidth={2}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      />

      {/* Vertices */}
      {points.map((point, i) => (
        <motion.circle
          key={i}
          cx={point.x}
          cy={point.y}
          r={size === 'full' ? 8 : 4}
          fill="#14B8A6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.05 }}
        />
      ))}

      {/* Labels (solo en tamaño full) */}
      {size === 'full' && DIMENSION_LABELS.map((label, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const labelRadius = radius + 20;
        const x = center + labelRadius * Math.cos(angle);
        const y = center + labelRadius * Math.sin(angle);

        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-slate-400 text-xs"
            onClick={() => handleAxisTap(DIMENSION_KEYS[i])}
          >
            {label}
          </text>
        );
      })}
    </motion.svg>
  );
}

const DIMENSION_KEYS: (keyof EmotionDimensions)[] = [
  'calma', 'ansiedad', 'energia', 'tristeza', 'enfoque', 'apertura'
];

const DIMENSION_LABELS = [
  'Calma', 'Ansiedad', 'Energía', 'Tristeza', 'Enfoque', 'Apertura'
];

function getHexagonPoints(center: number, radius: number): string {
  return Array.from({ length: 6 })
    .map((_, i) => {
      const angle = (i * Math.PI * 2) / 6 - Math.PI / 2;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      return `${x},${y}`;
    })
    .join(' ');
}
```

### 3.3 EmotionDelta (Comparación Antes/Después)

```tsx
// components/emotion/EmotionDelta.tsx
interface EmotionDeltaProps {
  before: EmotionDimensions;
  after: EmotionDimensions;
}

export function EmotionDelta({ before, after }: EmotionDeltaProps) {
  const deltas = Object.entries(after).map(([key, value]) => ({
    label: key,
    delta: value - before[key as keyof EmotionDimensions]
  }));

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {deltas.map(({ label, delta }) => (
        <div
          key={label}
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            delta > 0
              ? 'bg-teal-500/20 text-teal-300'
              : delta < 0
              ? 'bg-rose-500/20 text-rose-300'
              : 'bg-slate-700 text-slate-400'
          }`}
        >
          {label} {delta > 0 ? '↑' : delta < 0 ? '↓' : '→'}{Math.abs(delta)}
        </div>
      ))}
    </div>
  );
}
```

---

## 4. Dimensiones Emocionales

### 4.1 Definición

| Dimensión | Descripción | Rango | Color |
|-----------|-------------|-------|-------|
| **Calma** | Paz interior, tranquilidad | 0-10 | Teal |
| **Ansiedad** | Nerviosismo, preocupación, tensión | 0-10 | Rose |
| **Energía** | Vitalidad, nivel de activación | 0-10 | Amber |
| **Tristeza** | Melancolía, pesadez | 0-10 | Slate |
| **Enfoque** | Claridad mental, concentración | 0-10 | Blue |
| **Apertura** | Apertura emocional, receptividad | 0-10 | Purple |

### 4.2 Lógica del Polígono

El forma del polígono comunica el estado emocional:

```
Hexágono equilibrado     → Estado estable
Alargado hacia Calma     → Relajado y enfocado
Alargado hacia Ansiedad  → Estado de estrés
Plano hacia Energía      → Baja activación (cansado)
```

---

## 5. Tamaños y Variantes

### 5.1 Full Screen (280px)
- **Uso**: Pantalla de registro
- **Interactivo**: Sí (tap para incrementar, long press para decrementar)
- **Labels**: Visibles
- **Animaciones**: Spring physics en entrada

### 5.2 Card (120px)
- **Uso**: Resumen de sesión, tarjetas de historial
- **Interactivo**: No
- **Labels**: Ocultos
- **Animaciones**: Mínimas

### 5.3 Mini (64px)
- **Uso**: Calendario, vista timeline
- **Interactivo**: No
- **Labels**: Ocultos
- **Animaciones**: Solo cambios de color

---

## 6. Colores Dinámicos

El color del polígono cambia según la emoción dominante:

```typescript
function getPolygonColor(dimensions: EmotionDimensions): string {
  const { calma, ansiedad, energia, tristeza, enfoque } = dimensions;

  // High Calma/Enfoque: teal tint
  if (calma >= 7 || enfoque >= 7) {
    return '#14B8A6'; // teal-500
  }

  // High Ansiedad/Tristeza: warm slate tint
  if (ansiedad >= 7 || tristeza >= 7) {
    return '#F97316'; // orange-500
  }

  // High Energia: vibrant teal tint
  if (energia >= 7) {
    return '#2DD4BF'; // teal-400
  }

  // Default
  return '#14B8A6';
}
```

---

## 7. Accesibilidad

### 7.1 Keyboard Navigation
- Tab entre ejes del radar
- Arrow keys para ajustar valores
- Enter para confirmar
- Escape para omitir

### 7.2 Screen Readers
- Cada eje tiene aria-label descriptivo
- Valores announces: "Calma: 7 de 10"
- Polígono tiene aria-roledescription="emotion radar chart"

### 7.3 Reduced Motion
- Desactivar animaciones de spring
- Usar transiciones simples de opacidad
- Mantener funcionalidad completa

---

## 8. Integración con Sesión

### 8.1 Modificación de useBreathingSession

```typescript
// hooks/useBreathingSession.ts (modificación)
export function useBreathingSession(routine: Routine) {
  const [showEmotionBefore, setShowEmotionBefore] = useState(false);
  const [showEmotionAfter, setShowEmotionAfter] = useState(false);
  const [emotionBefore, setEmotionBefore] = useState<EmotionDimensions | null>(null);

  const startSession = () => {
    setShowEmotionBefore(true);
  };

  const handleEmotionBeforeConfirm = (dimensions: EmotionDimensions) => {
    setEmotionBefore(dimensions);
    setShowEmotionBefore(false);
    // Iniciar sesión real
    beginBreathing();
  };

  const handleSessionComplete = () => {
    setShowEmotionAfter(true);
  };

  const handleEmotionAfterConfirm = (dimensions: EmotionDimensions) => {
    // Guardar ambas entradas emocionales
    saveEmotionEntry({
      type: 'before',
      dimensions: emotionBefore!,
      session_id: currentSessionId
    });
    saveEmotionEntry({
      type: 'after',
      dimensions,
      session_id: currentSessionId
    });

    // Mostrar resumen con delta
    setShowSummary(true);
  };

  return {
    showEmotionBefore,
    showEmotionAfter,
    emotionBefore,
    handleEmotionBeforeConfirm,
    handleEmotionAfterConfirm,
    handleEmotionBeforeSkip: () => {
      setShowEmotionBefore(false);
      beginBreathing();
    },
    handleEmotionAfterSkip: () => {
      setShowEmotionAfter(false);
      setShowSummary(true);
    }
  };
}
```

---

## 9. Animaciones

### 9.1 Entrada de EmotionScreen
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3, ease: 'easeOut' }}
>
```

### 9.2 Radar Scale-In
```tsx
<motion.svg
  initial={{ scale: 0.8, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
>
```

### 9.3 Polygon Vertex Pop
```tsx
{points.map((point, i) => (
  <motion.circle
    key={i}
    cx={point.x}
    cy={point.y}
    r={8}
    fill="#14B8A6"
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ delay: i * 0.05, type: 'spring' }}
  />
))}
```
