# Fase 2: Backend + Tracking Emocional

## 1. Visión General

La Fase 2 transforma Tone Breath de una PWA sin estado a una aplicación con memoria persistente y capacidades de análisis emocional. El usuario podrá registrar su estado emocional antes y después de cada sesión, visualizar su progreso en un calendario, y acceder a su historial desde cualquier dispositivo.

**Principios Fundamentales:**
- **Offline-first**: La app funciona 100% sin conexión. El backend es un respaldo, no un requisito.
- **Sincronización transparente**: Los cambios se sincronizan automáticamente cuando hay conexión.
- **Privacidad**: Los datos emocionales son sensibles. Encriptación en reposo y tránsito.
- **UX sin fricción**: El registro emocional toma 2-3 taps máximo. Auto-skip después de 2 segundos.

**Modelo de despliegue: Vercel Functions (Serverless)**
- FastAPI se ejecuta como una Vercel Function, no como un servidor persistente.
- Cada request HTTP invoca la function, que procesa y responde. No hay proceso 24/7.
- Supabase maneja la base de datos y auth directamente — el backend solo valida JWTs y ejecuta lógica de negocio.
- Ventaja clave: un solo deploy (frontend + backend en Vercel), costo $0/mes para MVP.

---

## 2. Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (PWA)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   IndexedDB  │  │   UI Layer  │  │  Sync Manager       │  │
│  │  (Offline)   │  │  (React)    │  │  (Background)       │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
│         │                │                     │             │
│         └────────────────┼─────────────────────┘             │
│                          │                                   │
└──────────────────────────┼───────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │   Supabase   │  ← DB + Auth (gestionado)
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   FastAPI    │  ← Vercel Function (serverless)
                    │  (Backend)   │     Escala a 0 cuando idle
                    └─────────────┘
```

### ¿Por qué serverless es suficiente?

| Característica del backend | Por qué serverless funciona |
|---------------------------|------------------------------|
| Operaciones stateless | Cada request es independiente, sin estado en memoria |
| Ejecución corta (<200ms) | Las queries a Supabase son rápidas, nunca se acerca al límite de 60s |
| Sin conexiones persistentes | No usa WebSockets ni Server-Sent Events |
| Sin background jobs pesados | Tareas programadas se ejecutan en Supabase (pg_cron, Edge Functions) |
| Sin dependencia de filesystem | Todos los datos viven en Supabase |
| Auth delegada | Supabase Auth maneja JWTs, FastAPI solo valida |
| Escalabilidad por demanda | Paga por request, no por hora — ideal para MVP |

### Componentes

| Capa | Tecnología | Responsabilidad |
|------|-----------|-----------------|
| **Storage Local** | IndexedDB (Dexie.js) | Datos offline, cola de sincronización |
| **UI** | React + Framer Motion | Interfaz de registro, calendario, radar |
| **Sync Manager** | Service Worker + fetch | Sincronización background cuando hay red |
| **Backend** | FastAPI (Vercel Functions) | API REST stateless, auth JWT, lógica de negocio |
| **Database** | Supabase (PostgreSQL) | Persistencia en la nube |
| **Auth** | Supabase Auth | JWT-based authentication |

### Migración futura si es necesario

Si la app necesita capacidades que serverless no soporta (WebSockets, background workers de larga duración, etc.), el código FastAPI migra a Railway o similar con cambios mínimos:
- Agregar `uvicorn` como comando de inicio
- Desplegar como contenedor Docker
- El código de la API no cambia — solo el target de despliegue

---

## 3. Stack Tecnológico - Backend

### 3.1 FastAPI en Vercel Functions

```python
# Estructura del backend
tone-breath/
  app/                        # Frontend React
  backend/
    app/
      main.py              # FastAPI app entry (Vercel entrypoint)
      config.py            # Settings, env vars
      dependencies.py      # Shared dependencies
      models/              # Pydantic models
        user.py
        session.py
        emotion.py
      routers/             # API endpoints
        auth.py
        sessions.py
        emotions.py
      services/            # Business logic
        auth_service.py
        session_service.py
        emotion_service.py
      utils/
        supabase.py        # Supabase client
  tests/
  requirements.txt
  pyproject.toml           # Vercel entrypoint config
  vercel.json              # Vercel function settings
  .env.example
```

### 3.2 Dependencias Principales

```txt
# requirements.txt
fastapi==0.115.0
supabase==2.9.0
pydantic==2.9.0
pydantic-settings==2.5.0
python-jose[cryptography]==3.3.0
httpx==0.27.0
```

**Nota**: No se necesita uvicorn, SQLAlchemy, asyncpg, ni alembic. Vercel maneja el runtime. Supabase provee la conexión a PostgreSQL directamente.

### 3.3 Variables de Entorno

```bash
# .env.example
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret
JWT_ALGORITHM=HS256
CORS_ORIGINS=["http://localhost:5173","https://your-domain.vercel.app"]
```

**Nota**: No se necesita DATABASE_URL directamente. El cliente de Supabase maneja la conexión a PostgreSQL internamente. Las credenciales de Supabase son suficientes.

---

## 4. Modelo de Base de Datos

### 4.1 user_profiles

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  preferred_routine TEXT DEFAULT 'coherent',
  preferred_duration_minutes INT DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.2 breathing_sessions

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

### 4.3 emotion_entries

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

---

## 5. API Endpoints

### 5.1 Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth/register` | Registrar con email/password |
| POST | `/auth/login` | Login, retorna JWT |
| POST | `/auth/refresh` | Refrescar token JWT |
| GET | `/auth/me` | Obtener perfil del usuario |
| DELETE | `/auth/me` | Eliminar cuenta |

### 5.2 Sesiones de Respiración

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/sessions` | Crear nueva sesión |
| GET | `/sessions` | Listar sesiones (paginado) |
| GET | `/sessions/{id}` | Detalle de sesión |
| PATCH | `/sessions/{id}` | Actualizar sesión |
| DELETE | `/sessions/{id}` | Eliminar sesión |

### 5.3 Emociones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/emotions` | Registrar entrada emocional |
| GET | `/emotions` | Listar entradas (paginado, filtrable) |
| GET | `/emotions/{id}` | Detalle de entrada |
| DELETE | `/emotions/{id}` | Eliminar entrada |
| GET | `/emotions/calendar` | Datos para calendario (agrupado por día) |
| GET | `/emotions/trends` | Tendencias semanales/mensuales |
| GET | `/emotions/delta` | Deltas antes/después por sesión |

---

## 6. Esquemas Pydantic

```python
from pydantic import BaseModel, Field
from typing import Literal

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

---

## 7. Autenticación

```
1. Usuario se registra/inicia sesión vía Supabase Auth
2. Supabase retorna JWT (access_token + refresh_token)
3. Frontend almacena tokens en memoria (no localStorage)
4. Llamadas API incluyen: Authorization: Bearer <access_token>
5. FastAPI valida JWT con Supabase JWT secret (stateless, sin sesión de servidor)
6. user_id extraído de los claims del JWT
7. Refresh automático antes de expiración
```

**Nota serverless**: La validación de JWT es stateless — cada invocación de Vercel Function verifica el token independientemente. No hay store de sesiones en servidor ni caché de tokens. Supabase maneja el refresh y revocación de tokens.

---

## 8. Rate Limiting

| Endpoint | Límite | Ventana |
|----------|--------|---------|
| POST /emotions | 30 | por hora |
| POST /sessions | 20 | por hora |
| GET /* | 200 | por minuto |

---

## 9. Error Responses

```json
{
  "detail": {
    "code": "EMOTION_INVALID_DIMENSION",
    "message": "Dimension value must be between 0 and 10",
    "field": "dimensions.calma"
  }
}
```

Códigos HTTP estándar:
- 200: Éxito
- 201: Creado
- 400: Error de validación
- 401: No autorizado
- 403: Prohibido
- 404: No encontrado
- 429: Rate limited
- 500: Error interno
