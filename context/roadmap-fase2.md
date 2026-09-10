# Roadmap Fase 2 — Backend + Tracking Emocional

## Decisiones Tomadas

- **Backend**: FastAPI en Vercel Functions (serverless)
- **DB + Auth**: Supabase (PostgreSQL + Supabase Auth)
- **Auth en desarrollo**: Mecanismo de bypass para agilizar pruebas
- **Offline-first**: Prioridad — los usuarios no deben tener fricción cuando necesitan relajarse
- **Deploy**: Todo en Vercel (frontend + backend), costo $0/mes para MVP

---

## Orden de Ejecución

```
2.1 Backend + Auth          ← En paralelo con 2.4 si hay prisa
  └─→ 2.2 CRUD API
       └─→ 2.3 Frontend Auth
            ├─→ 2.4 Emotional UI ─→ 2.5 Offline ─→ 2.6 Calendar
            └─→ 2.5 Offline ─→ 2.7 Diary
                                   └─→ 2.8 Integration
```

**Empezamos por 2.4 (Emotional UI)** para tener feedback visual rápido. El backend se desarrolla en paralelo.

---

## 2.1 — Cimientos (Backend + Auth)

| # | Tarea | Estado | Archivos |
|---|-------|--------|----------|
| 1 | Crear proyecto Supabase, configurar DB | ⬜ | Supabase Dashboard |
| 2 | Ejecutar SQL de schema (user_profiles, breathing_sessions, emotion_entries, notes) | ⬜ | `fase2-backend-emociones.md` §4 |
| 3 | Scaffold backend en `backend/` (FastAPI, config, supabase client) | ⬜ | `03-backend-architecture.md` §Project Structure |
| 4 | Implementar `auth.py` router (register, login, refresh, me) | ⬜ | `fase2-backend-emociones.md` §5.1 |
| 5 | Implementar `dependencies.py` (get_current_user via JWT) | ⬜ | `03-backend-architecture.md` §Auth Flow |
| 6 | Configurar Vercel: `vercel.json`, `pyproject.toml`, entrypoint | ⬜ | Vercel docs |
| 7 | Deploy a Vercel, verificar `/health` y `/docs` (Swagger) | ⬜ | — |

**Entregable**: API desplegada en Vercel, auth funcional, Swagger operativo.

---

## 2.2 — Backend Core (CRUD)

| # | Tarea | Estado | Archivos |
|---|-------|--------|----------|
| 8 | Implementar `sessions.py` router (CRUD + stats) | ⬜ | `03-backend-architecture.md` §Sessions |
| 9 | Implementar `emotions.py` router (CRUD + calendar, trends, delta) | ⬜ | `03-backend-architecture.md` §Emotions |
| 10 | Implementar `notes.py` router (CRUD + full-text search) | ⬜ | `03-backend-architecture.md` §Notes |
| 11 | Agregar rate limiting middleware | ⬜ | `03-backend-architecture.md` §Rate Limiting |
| 12 | Tests de integración para todos los endpoints | ⬜ | `tests/` |

**Entregable**: API completa, todos los CRUD operativos, tests pasando.

---

## 2.3 — Frontend: Auth + Data Layer

| # | Tarea | Estado | Archivos |
|---|-------|--------|----------|
| 13 | Configurar cliente Supabase en frontend (`lib/supabase.ts`) | ⬜ | — |
| 14 | Crear pantallas de Login/Register (`pages/AuthPage.tsx`) | ⬜ | — |
| 15 | Implementar `AuthContext` (token management, protected routes) | ⬜ | — |
| 16 | Crear `lib/api.ts` (fetch wrapper con JWT auto-attach) | ⬜ | — |
| 17 | Integrar Supabase Auth en el flow de sesión existente | ⬜ | — |
| 17b | **Dev bypass**: Auth automático sin login para desarrollo | ⬜ | — |

**Entregable**: Login/registro funcionando, usuario autenticado, dev bypass operativo.

---

## 2.4 — Frontend: Emotional Tracking UI ⭐ EMPEZAMOS AQUÍ

| # | Tarea | Estado | Archivos |
|---|-------|--------|----------|
| 18 | Implementar `EmotionRadar` component (SVG, 3 tamaños) | ⬜ | `fase2-emociones-ui.md` §3.2 |
| 19 | Implementar `EmotionScreen` (before/after, auto-skip 2s) | ⬜ | `fase2-emociones-ui.md` §3.1 |
| 20 | Implementar `EmotionDelta` component | ⬜ | `fase2-emociones-ui.md` §3.3 |
| 21 | Integrar emotion flow en `useBreathingSession` hook | ⬜ | `fase2-emociones-ui.md` §8 |
| 22 | Modificar `ActiveSessionPage` y `SessionSummaryPage` para mostrar delta | ⬜ | — |

**Entregable**: Registro emocional antes/después de sesión, radar interactivo, delta visible.

---

## 2.5 — Offline-First (IndexedDB + Sync)

| # | Tarea | Estado | Archivos |
|---|-------|--------|----------|
| 23 | Configurar Dexie.js, definir schema IndexedDB | ⬜ | `fase2-offline-sync.md` §2.2 |
| 24 | Implementar `SyncManager` (background sync con retry) | ⬜ | `fase2-offline-sync.md` §4 |
| 25 | Implementar `useEmotions` hook (offline-first) | ⬜ | `fase2-offline-sync.md` §5.1 |
| 26 | Implementar Service Worker para Background Sync API | ⬜ | `fase2-offline-sync.md` §6 |
| 27 | Agregar `SyncStatus` badge en UI | ⬜ | `fase2-offline-sync.md` §7 |

**Entregable**: App funciona 100% offline, sync automático al reconectar.

---

## 2.6 — Calendar View

| # | Tarea | Estado | Archivos |
|---|-------|--------|----------|
| 28 | Implementar `EmotionCalendar` container | ⬜ | `fase2-calendario.md` §3.1 |
| 29 | Implementar `MonthNavigator` | ⬜ | `fase2-calendario.md` §3.2 |
| 30 | Implementar `DayRow` con mini radar | ⬜ | `fase2-calendario.md` §3.3 |
| 31 | Implementar `DayDetail` (radar full + entradas del día) | ⬜ | `fase2-calendario.md` §3.4 |
| 32 | Implementar `StreakIndicator` | ⬜ | `fase2-calendario.md` §3.5 |
| 33 | Implementar `CalendarFilters` y `MonthSummary` | ⬜ | `fase2-calendario.md` §6-7 |
| 34 | Agregar ruta `/calendar` y bottom nav item | ⬜ | `fase2-calendario.md` §8 |

**Entregable**: Calendario mensual con mini radars, filtros, racha, resumen.

---

## 2.7 — Diary / Notes

| # | Tarea | Estado | Archivos |
|---|-------|--------|----------|
| 35 | Implementar `DiaryList` component (tabs: All/Session/Free) | ⬜ | `02-diary-notes.md` §UI |
| 36 | Implementar `NoteEditor` (text + tags + pin) | ⬜ | `02-diary-notes.md` §Note Editor |
| 37 | Implementar auto-creation de session notes al completar sesión | ⬜ | `02-diary-notes.md` §Session Notes |
| 38 | Implementar quick-add FAB para notas libres | ⬜ | `02-diary-notes.md` §Quick Add |
| 39 | Implementar full-text search en notas | ⬜ | `02-diary-notes.md` §Search |
| 40 | Agregar ruta `/diary` y bottom nav item | ⬜ | — |

**Entregable**: Diario funcional, notas vinculadas a sesiones, notas libres, búsqueda.

---

## 2.8 — Integración y Polish

| # | Tarea | Estado | Archivos |
|---|-------|--------|----------|
| 41 | Integrar calendario con diario (tap día → notas del día) | ⬜ | — |
| 42 | Integrar delta emocional en session summary y calendar | ⬜ | — |
| 43 | Optimistic updates en todas las mutaciones | ⬜ | — |
| 44 | Manejo de errores y estados de carga en toda la UI | ⬜ | — |
| 45 | Testing end-to-end: flujo completo offline → sync | ⬜ | — |
| 46 | Deploy final a Vercel, verificar production | ⬜ | — |

**Entregable**: App completa, testada, desplegada.

---

## Auth en Desarrollo

Para agilizar las pruebas, se implementará un mecanismo de bypass:

- **Desarrollo local**: Auth automático con usuario de prueba (sin login)
- **Preview deployments**: Auth con email de prueba (auto-confirmado)
- **Producción**: Supabase Auth completo (email/password + social)

Esto permite desarrollar la UI de emociones y offline-first sin depender del backend desde el inicio.
