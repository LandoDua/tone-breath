# Fase 2: Calendario de Emociones

## 1. Visión General

El calendario de emociones es la vista principal para explorar el historial emocional del usuario. Combina una vista mensual con mini radars por día, permitiendo identificar patrones y tendencias a lo largo del tiempo.

**Metáfora visual:** Un diario de bienestar donde cada día tiene una "huella emocional" única.

---

## 2. Layout Principal

```
┌─────────────────────────────────────────┐
│  ← Agosto 2026 →                        │
│                                         │
│  Lun 25  [●] Calma                      │
│          "Me sentí en paz después       │
│           de la sesión de 4-7-8"        │
│                                         │
│  Mar 26  [●] Ansiedad                   │
│          "Estrés laboral hoy"           │
│                                         │
│  Mié 27  [●] Enfoque                    │
│          (sin nota)                     │
│                                         │
│  Jue 28  [●] Energía                    │
│          "Buen día de productividad"    │
│                                         │
│  Vie 29  [●] Calma                      │
│          "Sesión de relajación          │
│           muy efectiva"                 │
│                                         │
│  Sáb 30  [sin datos]                    │
│                                         │
│  Dom 31  [sin datos]                    │
│                                         │
│  ─────────────────────────────────────  │
│  🔥 Racha: 5 días consecutivos          │
└─────────────────────────────────────────┘
```

---

## 3. Componentes

### 3.1 EmotionCalendar (Contenedor Principal)

```tsx
// components/calendar/EmotionCalendar.tsx
interface EmotionCalendarProps {
  userId: string;
  onSelectDay: (date: string) => void;
}

export function EmotionCalendar({ userId, onSelectDay }: EmotionCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const { entries, isLoading } = useEmotionCalendar(userId, currentMonth);

  return (
    <div className="space-y-4">
      {/* Navegación de mes */}
      <MonthNavigator
        currentMonth={currentMonth}
        onPrev={() => setCurrentMonth(prev => addMonths(prev, -1))}
        onNext={() => setCurrentMonth(prev => addMonths(prev, 1))}
      />

      {/* Lista de días */}
      <div className="space-y-2">
        {getDaysInMonth(currentMonth).map(day => {
          const dayEntries = entries.filter(e => isSameDay(e.recorded_at, day));
          const hasData = dayEntries.length > 0;

          return (
            <DayRow
              key={day.toISOString()}
              date={day}
              entries={dayEntries}
              hasData={hasData}
              isSelected={selectedDay === day.toISOString()}
              onSelect={() => {
                setSelectedDay(day.toISOString());
                onSelectDay(day.toISOString());
              }}
            />
          );
        })}
      </div>

      {/* Indicador de racha */}
      <StreakIndicator entries={entries} />
    </div>
  );
}
```

### 3.2 MonthNavigator

```tsx
// components/calendar/MonthNavigator.tsx
interface MonthNavigatorProps {
  currentMonth: Date;
  onPrev: () => void;
  onNext: () => void;
}

export function MonthNavigator({ currentMonth, onPrev, onNext }: MonthNavigatorProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2">
      <button
        onClick={onPrev}
        className="p-2 rounded-full hover:bg-slate-700 transition-colors"
        aria-label="Mes anterior"
      >
        <ChevronLeft className="w-5 h-5 text-slate-400" />
      </button>

      <h2 className="text-lg font-medium text-slate-200">
        {format(currentMonth, 'MMMM yyyy', { locale: es })}
      </h2>

      <button
        onClick={onNext}
        className="p-2 rounded-full hover:bg-slate-700 transition-colors"
        aria-label="Mes siguiente"
      >
        <ChevronRight className="w-5 h-5 text-slate-400" />
      </button>
    </div>
  );
}
```

### 3.3 DayRow

```tsx
// components/calendar/DayRow.tsx
interface DayRowProps {
  date: Date;
  entries: EmotionEntry[];
  hasData: boolean;
  isSelected: boolean;
  onSelect: () => void;
}

export function DayRow({ date, entries, hasData, isSelected, onSelect }: DayRowProps) {
  const dominantEmotion = hasData
    ? getDominantEmotion(entries[0].dimensions)
    : null;

  const note = entries[0]?.note || null;

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
        isSelected
          ? 'bg-slate-700/50 border border-teal-500/30'
          : 'hover:bg-slate-800/50'
      }`}
    >
      {/* Mini radar o placeholder */}
      {hasData ? (
        <EmotionRadar
          dimensions={entries[0].dimensions}
          size="mini"
          interactive={false}
        />
      ) : (
        <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center">
          <span className="text-slate-600 text-xs">
            {format(date, 'd')}
          </span>
        </div>
      )}

      {/* Info del día */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-300">
            {format(date, 'EEE d', { locale: es })}
          </span>
          {dominantEmotion && (
            <span className={`px-2 py-0.5 rounded-full text-xs ${getEmotionColor(dominantEmotion)}`}>
              {dominantEmotion}
            </span>
          )}
        </div>

        {note && (
          <p className="text-sm text-slate-500 mt-1 truncate">
            "{note}"
          </p>
        )}
      </div>

      {/* Contador de entradas */}
      {entries.length > 1 && (
        <span className="text-xs text-slate-500">
          {entries.length} registros
        </span>
      )}
    </motion.div>
  );
}

function getEmotionColor(emotion: string): string {
  const colors: Record<string, string> = {
    calma: 'bg-teal-500/20 text-teal-300',
    ansiedad: 'bg-rose-500/20 text-rose-300',
    energia: 'bg-amber-500/20 text-amber-300',
    tristeza: 'bg-slate-500/20 text-slate-300',
    enfoque: 'bg-blue-500/20 text-blue-300',
    apertura: 'bg-purple-500/20 text-purple-300'
  };
  return colors[emotion] || colors.calma;
}
```

### 3.4 DayDetail (Expandido)

```tsx
// components/calendar/DayDetail.tsx
interface DayDetailProps {
  date: string;
  entries: EmotionEntry[];
  onClose: () => void;
}

export function DayDetail({ date, entries, onClose }: DayDetailProps) {
  const avgDimensions = calculateAverageDimensions(entries);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 bg-slate-900/95 z-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <h2 className="text-lg font-medium text-slate-200">
          {format(new Date(date), "EEEE d 'de' MMMM", { locale: es })}
        </h2>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-slate-700"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      {/* Radar promedio */}
      <div className="flex justify-center py-6">
        <EmotionRadar
          dimensions={avgDimensions}
          size="full"
          interactive={false}
        />
      </div>

      {/* Lista de entradas */}
      <div className="flex-1 overflow-y-auto px-4 space-y-3">
        {entries.map(entry => (
          <EntryCard key={entry.id} entry={entry} />
        ))}
      </div>

      {/* Delta si hay before/after */}
      {entries.length === 2 &&
       entries.some(e => e.type === 'before') &&
       entries.some(e => e.type === 'after') && (
        <div className="p-4 border-t border-slate-700">
          <h3 className="text-sm font-medium text-slate-400 mb-2">
            Delta de la sesión
          </h3>
          <EmotionDelta
            before={entries.find(e => e.type === 'before')!.dimensions}
            after={entries.find(e => e.type === 'after')!.dimensions}
          />
        </div>
      )}
    </motion.div>
  );
}
```

### 3.5 StreakIndicator

```tsx
// components/calendar/StreakIndicator.tsx
interface StreakIndicatorProps {
  entries: EmotionEntry[];
}

export function StreakIndicator({ entries }: StreakIndicatorProps) {
  const streak = calculateStreak(entries);

  if (streak < 2) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center justify-center gap-2 py-3"
    >
      <Flame className="w-5 h-5 text-amber-500" />
      <span className="text-sm text-slate-400">
        Racha: {streak} días consecutivos
      </span>
    </motion.div>
  );
}

function calculateStreak(entries: EmotionEntry[]): number {
  if (entries.length === 0) return 0;

  const dates = [...new Set(entries.map(e =>
    new Date(e.recorded_at).toDateString()
  ))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  let streak = 1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Verificar si hoy hay datos
  if (dates[0] !== today.toDateString()) {
    return 0;
  }

  for (let i = 0; i < dates.length - 1; i++) {
    const current = new Date(dates[i]);
    const previous = new Date(dates[i + 1]);
    const diffDays = (current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
```

---

## 4. Datos del Calendario (API)

### 4.1 Endpoint: GET /emotions/calendar

```typescript
// Query parameters
interface CalendarQuery {
  year: number;
  month: number;       // 1-12
  user_id: string;
}

// Response
interface CalendarResponse {
  days: CalendarDay[];
  streak: number;
  total_entries: number;
}

interface CalendarDay {
  date: string;        // YYYY-MM-DD
  entries: EmotionEntry[];
  avg_dimensions: EmotionDimensions;
  dominant_emotion: string;
  note_count: number;
}
```

### 4.2 Implementación del Hook

```typescript
// hooks/useEmotionCalendar.ts
export function useEmotionCalendar(userId: string, month: Date) {
  const [entries, setEntries] = useState<EmotionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMonthEntries();
  }, [userId, month]);

  const loadMonthEntries = async () => {
    setIsLoading(true);

    try {
      // Intentar cargar de IndexedDB primero
      const localEntries = await db.emotions
        .where('user_id')
        .equals(userId)
        .and(e => {
          const date = new Date(e.recorded_at);
          return date.getMonth() === month.getMonth() &&
                 date.getFullYear() === month.getFullYear();
        })
        .toArray();

      setEntries(localEntries);

      // Si hay conexión, sync con backend
      if (navigator.onLine) {
        const remoteEntries = await fetchCalendarEntries(userId, month);
        await syncLocalEntries(localEntries, remoteEntries);
        setEntries(remoteEntries);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { entries, isLoading, refresh: loadMonthEntries };
}
```

---

## 5. Persistencia en IndexedDB

### 5.1 Tabla emotion_entries

```sql
-- Ya definida en fase2-backend-emociones.md
-- Índices adicionales para calendario:
CREATE INDEX idx_emotions_calendar ON emotion_entries(user_id, recorded_at DESC);
CREATE INDEX idx_emotions_month ON emotion_entries(
  user_id,
  EXTRACT(YEAR FROM recorded_at),
  EXTRACT(MONTH FROM recorded_at)
);
```

### 5.2 Consultas Local

```typescript
// db.ts - Consultas para calendario
async function getEntriesForMonth(
  userId: string,
  year: number,
  month: number
): Promise<EmotionEntry[]> {
  return db.emotions
    .where('user_id')
    .equals(userId)
    .and(entry => {
      const date = new Date(entry.recorded_at);
      return date.getFullYear() === year &&
             date.getMonth() === month - 1; // 0-indexed
    })
    .toArray();
}

async function getEntriesForDay(
  userId: string,
  date: string // YYYY-MM-DD
): Promise<EmotionEntry[]> {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return db.emotions
    .where('user_id')
    .equals(userId)
    .and(entry => {
      const entryDate = new Date(entry.recorded_at);
      return entryDate >= start && entryDate <= end;
    })
    .toArray();
}
```

---

## 6. Filtros

### 6.1 Filtros Disponibles

```typescript
interface CalendarFilters {
  emotions?: string[];      // Filtrar por emoción dominante
  routines?: string[];      // Filtrar por tipo de rutina
  dateRange?: {
    start: string;          // YYYY-MM-DD
    end: string;
  };
  sortBy?: 'date' | 'emotion' | 'session_count';
}
```

### 6.2 UI de Filtros

```tsx
// components/calendar/CalendarFilters.tsx
export function CalendarFilters({ onApply }: CalendarFiltersProps) {
  const [filters, setFilters] = useState<CalendarFilters>({});

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {/* Filtro por emoción */}
      <FilterChip
        label="Emoción"
        options={EMOTION_OPTIONS}
        selected={filters.emotions}
        onChange={(emotions) => setFilters(prev => ({ ...prev, emotions }))}
      />

      {/* Filtro por rutina */}
      <FilterChip
        label="Rutina"
        options={ROUTINE_OPTIONS}
        selected={filters.routines}
        onChange={(routines) => setFilters(prev => ({ ...prev, routines }))}
      />

      {/* Botón aplicar */}
      <button
        onClick={() => onApply(filters)}
        className="px-4 py-2 rounded-full bg-teal-500 text-white text-sm"
      >
        Aplicar
      </button>
    </div>
  );
}
```

---

## 7. Insights Rápidos

### 7.1 Resumen del Mes

```tsx
// components/calendar/MonthSummary.tsx
interface MonthSummaryProps {
  entries: EmotionEntry[];
  month: Date;
}

export function MonthSummary({ entries, month }: MonthSummaryProps) {
  const stats = calculateMonthStats(entries);

  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      <StatCard
        label="Sesiones"
        value={stats.totalSessions}
        icon={<Activity className="w-5 h-5" />}
      />
      <StatCard
        label="Emoción más frecuente"
        value={stats.dominantEmotion}
        icon={<Heart className="w-5 h-5" />}
      />
      <StatCard
        label="Mejor delta"
        value={`Calma ${stats.bestDelta.calma > 0 ? '↑' : '↓'}${Math.abs(stats.bestDelta.calma)}`}
        icon={<TrendingUp className="w-5 h-5" />}
      />
    </div>
  );
}
```

### 7.2 Cálculo de Estadísticas

```typescript
function calculateMonthStats(entries: EmotionEntry[]) {
  const sessions = entries.filter(e => e.session_id);
  const uniqueSessions = [...new Set(sessions.map(e => e.session_id))];

  // Emoción dominante más frecuente
  const emotionCounts = entries.reduce((acc, e) => {
    acc[e.dominant_emotion] = (acc[e.dominant_emotion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dominantEmotion = Object.entries(emotionCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'calma';

  // Mejor delta (before/after)
  const beforeAfter = entries.filter(e => e.type === 'before' || e.type === 'after');
  const sessionPairs = groupBySessionId(beforeAfter);

  let bestDelta = { calma: 0, ansiedad: 0, energia: 0, tristeza: 0, enfoque: 0, apertura: 0 };

  Object.values(sessionPairs).forEach(([before, after]) => {
    if (before && after) {
      const delta = calculateDelta(before.dimensions, after.dimensions);
      // delta positivo es bueno para calma, enfoque, etc.
      // delta negativo es bueno para ansiedad, tristeza
      if (delta.calma > bestDelta.calma) {
        bestDelta = delta;
      }
    }
  });

  return {
    totalSessions: uniqueSessions.length,
    dominantEmotion,
    bestDelta
  };
}
```

---

## 8. Navegación

### 8.1 Rutas

```typescript
// App.tsx
<Route path="/calendar" element={<CalendarPage />} />
<Route path="/calendar/:date" element={<DayDetailPage />} />
```

### 8.2 Bottom Nav

```tsx
// Agregar al BottomNav existente
<NavItem
  icon={<CalendarDays />}
  label="Calendario"
  path="/calendar"
/>
```
