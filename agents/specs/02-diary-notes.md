# Diary / Notes System

## Concept

A dual-purpose journaling system that serves two needs:
1. **Session-linked notes**: Automatic context from breathing sessions
2. **Free-form notes**: Independent journal entries for any time

The diary is lightweight and designed for quick capture, not long-form writing.

## Note Types

### 1. Session Notes (Automatic Context)

When a user completes a breathing session, the system automatically creates a note entry with:
- Session metadata (routine type, duration, completion %)
- Before/after emotion snapshots (if recorded)
- Timestamp

The user can then **optionally** add a text note to enrich this entry.

**Auto-generated note structure:**
```
---
Routine: 4-7-8 (Dormir)
Duration: 5 minutes
Completed: 100%
Emotions: Ansiedad 7 -> Calma 3 (delta: -4)
---

[User's free text goes here]
```

### 2. Free-form Notes (Independent)

Journal entries not tied to any session. Can be created:
- From the diary tab in navigation
- Via quick-add button (floating action button)
- From the calendar view on any day

**Free note structure:**
```
---
Date: August 27, 2026, 10:30 AM
Type: Free note
---

[User's text]
```

## Note Data Model

### Note

```typescript
interface Note {
  id: string;              // UUID
  user_id: string;         // FK to users
  session_id: string | null; // FK to sessions (null for free notes)
  emotion_entry_id: string | null; // FK to emotion_entries
  type: 'session' | 'free';
  content: string | null;  // User-written text (optional)
  created_at: string;      // ISO 8601
  updated_at: string;      // ISO 8601
  tags: string[];          // Optional user-defined tags
  is_pinned: boolean;      // User can pin important notes
}
```

### Auto-populated Fields (Session Notes)

When `type === 'session'`, these are computed automatically:

```typescript
interface SessionNoteMeta {
  routine_name: string;
  duration_seconds: number;
  completion_percentage: number;
  emotion_before: EmotionEntry | null;
  emotion_after: EmotionEntry | null;
  emotion_delta: {
    calma: number;
    ansiedad: number;
    energia: number;
    tristeza: number;
    enfoque: number;
    apertura: number;
  } | null;
}
```

## UI Components

### Diary List View

```
+----------------------------------+
|  My Diary                   [+] |
+----------------------------------+
|  [Tab: All] [Sessions] [Free]   |
+----------------------------------+
|  Today - Aug 27                 |
|  ┌────────────────────────────┐ |
|  │ 🕐 10:30 AM                │ |
|  │ 4-7-8 (5 min)  [100%]     │ |
|  │ "Felt much calmer after"   │ |
|  │ [mini radar] Calma 8       │ |
|  └────────────────────────────┘ |
|  ┌────────────────────────────┐ |
|  │ 📝 2:15 PM   [Free note]  │ |
|  │ "Need to remember to..."   │ |
|  └────────────────────────────┘ |
+----------------------------------+
|  Yesterday - Aug 26             |
|  ┌────────────────────────────┐ |
|  │ 🕐 8:00 AM                 │ |
|  │ Coherente (10 min) [85%]  │ |
|  │ "Morning routine felt..."  │ |
|  │ [mini radar] Ansiedad 6    │ |
|  └────────────────────────────┘ |
+----------------------------------+
```

### Note Editor

```
+----------------------------------+
|  < Back              Save       |
+----------------------------------+
|  Aug 27, 2026 - 10:30 AM       |
|  4-7-8 Session (5 min)         |
+----------------------------------+
|  ┌────────────────────────────┐ |
|  │                            │ |
|  │  Write your thoughts...    │ |
|  │                            │ |
|  │                            │ |
|  └────────────────────────────┘ |
+----------------------------------+
|  Tags: [+ sleep] [+ calm]      |
|  [Pin this note]               |
+----------------------------------+
```

### Quick Add (FAB)

- Floating action button on diary screen
- Tap opens minimal editor (no session context)
- Auto-saves on blur or back button
- Supports basic text only (no markdown initially)

## Calendar Integration

Each day in the calendar can show:
- Number of notes (session + free)
- Mini radar (from emotion entry)
- Note preview (first 50 chars of most recent note)
- Tap to expand full day view

## Search & Filtering

### Search
- Full-text search across note content
- Search by tag
- Search by date range
- Search by session routine type

### Filters
- Type: All / Session / Free
- Tags: Multi-select
- Has emotion: Boolean
- Date range: Custom picker
- Pinned: Boolean

## Sync Strategy

### Offline-First
- Notes are stored in local IndexedDB first
- Synced to Supabase when online
- Conflict resolution: latest timestamp wins
- Offline indicator in UI when not synced

### Real-time
- Supabase Realtime for multi-device sync
- Optimistic updates in UI

## Privacy

- Notes are private by default
- No sharing features in initial release
- User can export all notes (JSON/CSV) as data portability
- User can delete individual notes or all notes
- Emotion data and notes are separate tables (can delete one without the other)

## Accessibility

- Screen reader labels for all interactive elements
- Voice-to-text input for note creation (Web Speech API)
- High contrast mode for note text
- Minimum touch target: 44x44px
