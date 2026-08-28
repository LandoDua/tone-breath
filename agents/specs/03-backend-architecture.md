# Backend Architecture

## Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| API Framework | FastAPI | Async REST API |
| Database | Supabase (PostgreSQL) | Data storage |
| Auth | Supabase Auth | JWT-based authentication |
| ORM | SQLAlchemy (async) | Database queries |
| Validation | Pydantic v2 | Request/response schemas |
| Migration | Alembic | Schema versioning |

## Project Structure

```
tone-breath-backend/
  app/
    main.py                 # FastAPI app entry
    config.py               # Settings, env vars
    dependencies.py         # Shared dependencies
    models/                 # SQLAlchemy models
      user.py
      session.py
      emotion.py
      note.py
    schemas/                # Pydantic schemas
      user.py
      session.py
      emotion.py
      note.py
    routers/                # API endpoints
      auth.py
      sessions.py
      emotions.py
      notes.py
      recommendations.py   # Phase 3
    services/               # Business logic
      auth_service.py
      session_service.py
      emotion_service.py
      note_service.py
      recommendation_service.py  # Phase 3
    utils/
      supabase.py           # Supabase client
      audio_analysis.py     # Future: audio processing
  alembic/                  # Migrations
  tests/
  requirements.txt
  .env.example
```

## API Endpoints

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register with email/password |
| POST | `/auth/login` | Login, returns JWT |
| POST | `/auth/refresh` | Refresh JWT token |
| GET | `/auth/me` | Get current user profile |
| DELETE | `/auth/me` | Delete account |

### Sessions (Breathing)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/sessions` | Create new breathing session |
| GET | `/sessions` | List user sessions (paginated) |
| GET | `/sessions/{id}` | Get session detail |
| PATCH | `/sessions/{id}` | Update session (e.g., add completion %) |
| DELETE | `/sessions/{id}` | Delete session |
| GET | `/sessions/stats` | Aggregated session statistics |

### Emotions

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/emotions` | Record emotion entry |
| GET | `/emotions` | List emotion entries (paginated, filterable) |
| GET | `/emotions/{id}` | Get emotion entry detail |
| DELETE | `/emotions/{id}` | Delete emotion entry |
| GET | `/emotions/calendar` | Calendar view data (grouped by day) |
| GET | `/emotions/trends` | Weekly/monthly trends per dimension |
| GET | `/emotions/delta` | Before/after deltas per session |

### Notes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/notes` | Create note (session-linked or free) |
| GET | `/notes` | List notes (paginated, filterable) |
| GET | `/notes/{id}` | Get note detail |
| PATCH | `/notes/{id}` | Update note content |
| DELETE | `/notes/{id}` | Delete note |
| GET | `/notes/search` | Full-text search |

### Recommendations (Phase 3)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/recommendations/today` | Get today's suggested routine |
| GET | `/recommendations/history` | Past recommendations |
| POST | `/recommendations/feedback` | User feedback on recommendation |

## Database Schema (Supabase/PostgreSQL)

### Users (managed by Supabase Auth)

Supabase handles auth. We extend with a profile table:

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  preferred_routine TEXT DEFAULT 'coherente',
  preferred_duration_minutes INT DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Sessions

```sql
CREATE TABLE breathing_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  routine_type TEXT NOT NULL CHECK (routine_type IN ('square', '4-7-8', 'coherent')),
  duration_seconds INT NOT NULL,
  completion_percentage REAL DEFAULT 0.0,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_date ON breathing_sessions(user_id, started_at DESC);
```

### Emotions

```sql
CREATE TABLE emotion_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES breathing_sessions(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('before', 'after', 'free')),
  calma INT NOT NULL DEFAULT 5 CHECK (calma BETWEEN 0 AND 10),
  ansiedad INT NOT NULL DEFAULT 5 CHECK (ansiedad BETWEEN 0 AND 10),
  energia INT NOT NULL DEFAULT 5 CHECK (energia BETWEEN 0 AND 10),
  tristeza INT NOT NULL DEFAULT 5 CHECK (tristeza BETWEEN 0 AND 10),
  enfoque INT NOT NULL DEFAULT 5 CHECK (enfoque BETWEEN 0 AND 10),
  apertura INT NOT NULL DEFAULT 5 CHECK (apertura BETWEEN 0 AND 10),
  dominant_emotion TEXT GENERATED ALWAYS AS (
    CASE
      WHEN calma >= ansiedad AND calma >= energia AND calma >= tristeza
           AND calma >= enfoque AND calma >= apertura THEN 'calma'
      WHEN ansiedad >= energia AND ansiedad >= tristeza
           AND ansiedad >= enfoque AND ansiedad >= apertura THEN 'ansiedad'
      WHEN energia >= tristeza AND energia >= enfoque
           AND energia >= apertura THEN 'energia'
      WHEN tristeza >= enfoque AND tristeza >= apertura THEN 'tristeza'
      WHEN enfoque >= apertura THEN 'enfoque'
      ELSE 'apertura'
    END
  ) STORED,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_emotions_user_date ON emotion_entries(user_id, recorded_at DESC);
CREATE INDEX idx_emotions_session ON emotion_entries(session_id) WHERE session_id IS NOT NULL;
```

### Notes

```sql
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES breathing_sessions(id) ON DELETE SET NULL,
  emotion_entry_id UUID REFERENCES emotion_entries(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('session', 'free')),
  content TEXT,
  tags TEXT[] DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notes_user_date ON notes(user_id, created_at DESC);
CREATE INDEX idx_notes_search ON notes USING GIN(to_tsvector('spanish', content));
CREATE INDEX idx_notes_tags ON notes USING GIN(tags);
```

## Pydantic Schemas

### Emotion Schemas

```python
from pydantic import BaseModel, Field

class EmotionDimensions(BaseModel):
    calma: int = Field(5, ge=0, le=10)
    ansiedad: int = Field(5, ge=0, le=10)
    energia: int = Field(5, ge=0, le=10)
    tristeza: int = Field(5, ge=0, le=10)
    enfoque: int = Field(5, ge=0, le=10)
    apertura: int = Field(5, ge=0, le=10)

class EmotionEntryCreate(BaseModel):
    session_id: str | None = None
    type: Literal['before', 'after', 'free']
    dimensions: EmotionDimensions

class EmotionEntryResponse(BaseModel):
    id: str
    user_id: str
    session_id: str | None
    type: str
    dimensions: EmotionDimensions
    dominant_emotion: str
    recorded_at: str

class EmotionCalendarDay(BaseModel):
    date: str
    entries: list[EmotionEntryResponse]
    avg_dimensions: EmotionDimensions
    dominant_emotion: str
    note_count: int

class EmotionDelta(BaseModel):
    session_id: str
    before: EmotionDimensions | None
    after: EmotionDimensions | None
    delta: EmotionDimensions | None
    routine_type: str
    duration_seconds: int
```

### Note Schemas

```python
class NoteCreate(BaseModel):
    session_id: str | None = None
    emotion_entry_id: str | None = None
    content: str | None = None
    tags: list[str] = []
    is_pinned: bool = False

class NoteUpdate(BaseModel):
    content: str | None = None
    tags: list[str] | None = None
    is_pinned: bool | None = None

class NoteResponse(BaseModel):
    id: str
    user_id: str
    session_id: str | None
    emotion_entry_id: str | None
    type: str
    content: str | None
    tags: list[str]
    is_pinned: bool
    created_at: str
    updated_at: str
    # Computed fields for session notes
    session_meta: SessionNoteMeta | None = None
```

## Authentication Flow

```
1. User registers/logs in via Supabase Auth (email or social)
2. Supabase returns JWT access_token + refresh_token
3. Frontend stores tokens in memory (not localStorage for security)
4. API calls include: Authorization: Bearer <access_token>
5. FastAPI validates JWT with Supabase JWT secret
6. user_id extracted from JWT claims
7. Token refresh handled automatically before expiry
```

## Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| POST /emotions | 30 | per hour |
| POST /notes | 50 | per hour |
| POST /sessions | 20 | per hour |
| GET /* | 200 | per minute |

## Error Responses

```json
{
  "detail": {
    "code": "EMOTION_INVALID_DIMENSION",
    "message": "Dimension value must be between 0 and 10",
    "field": "dimensions.calma"
  }
}
```

Standard HTTP status codes:
- 200: Success
- 201: Created
- 400: Validation error
- 401: Unauthorized
- 403: Forbidden
- 404: Not found
- 429: Rate limited
- 500: Internal error
