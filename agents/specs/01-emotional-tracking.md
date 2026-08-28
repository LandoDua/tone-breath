# Emotional Tracking System

## Concept

A radar/spider chart where each vertex represents a predefined emotional dimension. The user places pins on each axis to indicate their emotional state. The resulting polygon shape creates a unique "emotional fingerprint" for each moment.

The shape of the polygon changes before and after breathing sessions, providing visual feedback on the session's impact.

## Emotional Dimensions (Fixed, Predefined)

The radar uses **6 core dimensions** arranged in a hexagonal layout:

| # | Dimension | Description | Range |
|---|-----------|-------------|-------|
| 1 | **Calma** (Calm) | Inner peace, tranquility | 0-10 |
| 2 | **Ansiedad** (Anxiety) | Nervousness, worry, tension | 0-10 |
| 3 | **Energia** (Energy) | Vitality, activation level | 0-10 |
| 4 | **Tristeza** (Sadness) | Melancholy, heaviness | 0-10 |
| 5 | **Enfoque** (Focus) | Mental clarity, concentration | 0-10 |
| 6 | **Apertura** (Openness) | Emotional openness, receptivity | 0-10 |

### Dimension Rationale

- **Calma vs Ansiedad**: Opposing axes to create visual tension in the polygon
- **Energia vs Tristeza**: Activation vs deactivation spectrum
- **Enfoque vs Apertura**: Internal concentration vs external receptivity

The polygon shape immediately communicates the user's state:
- Balanced hexagon = stable emotional state
- Elongated toward Calma/Enfoque = relaxed and focused
- Elongated toward Ansiedad/Tristeza = distressed state
- Flat toward Energia = low activation (tired, lethargic)

## Registration Flow

### Trigger Points

1. **Before Session**: Prompted when user starts a breathing routine
2. **After Session**: Prompted when session completes (or user taps "Finish")
3. **Skip Option**: Both prompts can be dismissed with "Skip" or back button

### UX Flow (2-3 Taps)

```
[Session Start] -> [Emotion Screen] -> [Tap axis to set level] -> [Confirm] -> [Session Begins]
                                                    |
                                               [Skip] -> [Session Begins]
```

**Screen Layout:**
```
+----------------------------------+
|  "How are you feeling?"          |
|  [Skip] button top-right         |
|                                  |
|        * Calma *                 |
|       /       \                  |
| Apertura     Ansiedad            |
|      |         |                 |
| Tristeza     Energia             |
|       \       /                  |
|        * Enfoque *               |
|                                  |
|  [Confirm] button bottom         |
+----------------------------------+
```

**Interaction Model:**
- Tap an axis label or vertex area to increment its value (0-10)
- Long press or double-tap to decrement
- Visual feedback: the polygon updates in real-time as values change
- Default state: all values at 5 (neutral midpoint)

### Timing
- The emotion screen appears for **2 seconds** max before auto-skipping to session
- User can tap to register or let it auto-skip
- This keeps friction extremely low

## Radar Chart Visualization

### Visual Properties

| Property | Value |
|----------|-------|
| Shape | Regular hexagon (6 axes) |
| Fill | Teal (#14B8A6) at 20% opacity |
| Stroke | Teal (#14B8A6) at 80% opacity, 2px |
| Vertices | Solid teal circles, 8px radius |
| Axes | Gray (#6C7A77) at 30% opacity, 1px |
| Labels | Inter font, label-sm (12px), gray |
| Background | None (transparent) |
| Grid rings | 3 concentric hexagons at 33%, 66%, 100% |

### Animation

- Polygon vertices animate smoothly between states using spring physics
- Scale-in animation when the radar first appears (0.8 -> 1.0 with spring)
- Color shift: polygon fill changes based on dominant emotion:
  - High Calma/Enfoque: teal tint
  - High Ansiedad/Tristeza: warm slate tint
  - High Energia: vibrant teal tint

### Size Variants

| Context | Diameter | Use |
|---------|----------|-----|
| Full screen | 280px | Registration screen |
| Mini (timeline) | 64px | Calendar view entries |
| Card | 120px | Session summary |

## Data Model

### EmotionEntry

```typescript
interface EmotionEntry {
  id: string;              // UUID
  user_id: string;         // FK to users
  session_id: string | null; // FK to sessions (null for free-form entries)
  timestamp: string;       // ISO 8601
  type: 'before' | 'after' | 'free';  // When the emotion was recorded
  dimensions: {
    calma: number;         // 0-10
    ansiedad: number;      // 0-10
    energia: number;       // 0-10
    tristeza: number;      // 0-10
    enfoque: number;       // 0-10
    apertura: number;      // 0-10
  };
  dominant_emotion: string; // Computed: highest-scoring dimension
  polygon_hash: string;     // Computed: simplified shape identifier for quick lookups
}
```

### Aggregations

- **Daily Average**: Mean of all dimension values for a given day
- **Session Delta**: Difference between before/after values per session
- **Weekly Trend**: Moving average of each dimension over 7 days
- **Dominant Pattern**: Most frequent dominant emotion per time period

## Calendar View (Timeline + Radar)

### Layout

```
+----------------------------------+
|  August 2026          <  >      |
+----------------------------------+
|  Mon 25   [mini radar] Calma    |
|           "Felt peaceful after  |
|            4-7-8 session"       |
+----------------------------------+
|  Tue 26   [mini radar] Ansiedad |
|           "Work stress today"   |
+----------------------------------+
|  Wed 27   [mini radar] Enfoque  |
|           (no note)             |
+----------------------------------+
```

### Components

1. **Month Navigator**: Previous/next month with year display
2. **Day Row**: Contains mini radar (64px), dominant emotion label, and optional note preview
3. **Expandable Detail**: Tap a day to see full radar + all notes for that day
4. **Streak Indicator**: Small flame icon next to consecutive days with entries

### Filtering

- Filter by dominant emotion
- Filter by session type
- Filter by date range
- Sort by: date (default), dominant emotion, session count

## Emotional Insights (Phase 3 Foundation)

The data collected here feeds into the recommendation engine:

- **Stress Pattern Detection**: High Ansiedad on weekday mornings
- **Session Effectiveness**: Which routines produce the best delta (before -> after)
- **Optimal Timing**: When the user is most receptive to breathing exercises
- **Progress Tracking**: Long-term trends in each dimension
