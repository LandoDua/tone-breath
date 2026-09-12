# Tone Breath

Respiración guiada y mindfulness con sonido procedural. Una PWA mobile-first que te acompaña en sesiones de respiración coherente, relajación y alivio del estrés, con metrónomo y tonos generados en tiempo real (Tone.js).

> **🚀 Desplegada en producción:** https://tone-breath.vercel.app
>
> PWA + API (FastAPI serverless) + Swagger (`/docs`).

## Características

- **3 rutinas de respiración**:
  - **Dormir** (4-7-8) — desconecta la mente
  - **Relajar** (coherente, 5.5–5.5) — paz en el presente
  - **Estrés** (cuadrado 4-4-4-4) — alivio inmediato
- **Audio procedural** con Tone.js: pulso de metrónomo que sigue la fase activa y cues sonoros en cada cambio de fase (inhalar/exhalar/retener/pausa), con reverb.
- **Círculo de respiración animado** que escala con las fases; el texto central permanece en tamaño fijo y legible.
- **SOS**: inicio rápido de una sesión de Relajar de 5 minutos desde la pantalla principal.
- **Registro emocional**: radar hexagonal antes/después de cada sesión (Calma, Ansiedad, Energía, Tristeza, Enfoque, Apertura) con auto-skip.
- **Tema claro/oscuro** y **transiciones animadas** entre pantallas (respetan `prefers-reduced-motion`).
- **PWA** instalable (manifest + service worker), lista para agregar al inicio en móvil.
- Barra de navegación inferior flotante y diseño adaptativo centrado a 480px en escritorio.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + TypeScript, Vite, Tailwind CSS v4, Framer Motion, Tone.js |
| PWA | vite-plugin-pwa (manifest + service worker) |
| Backend | Python + FastAPI (async) |
| Despliegue | Vercel (una función serverless sirve API + Swagger + PWA) |
| Base de datos / Auth | Supabase (PostgreSQL + JWT) — en integración |
| Dev | Makefile (make dev/test/setup…), Docker (opcional para homelab) |

## Probar

### Producción

```bash
open https://tone-breath.vercel.app          # PWA
open https://tone-breath.vercel.app/health   # {"status":"ok"}
open https://tone-breath.vercel.app/docs     # Swagger (OpenAPI)
```

### Desarrollo local

```bash
make setup        # crea venv del backend + npm install del frontend
make dev          # backend en :8000 + frontend en :5173 (hot reload)
```

| Comando | Qué hace |
|---------|----------|
| `make dev` | Frontend (:5173) + backend (:8000) en paralelo |
| `make dev-backend` | Solo backend FastAPI (Swagger en `/docs`) |
| `make dev-frontend` | Solo frontend Vite |
| `make dev-full` | Compila la PWA y el backend la sirve entera en :8000 |
| `make test` | Tests del backend + lint del frontend |
| `make build` | Build de producción del frontend |
| `make clean` | Limpia artefactos de build |

Frontend por separado:

```bash
cd app
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck (tsc -b) + build en dist/
npm run lint       # oxlint
```

Backend por separado:

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000   # http://localhost:8000/docs
```

## Despliegue

### Producción (Vercel) — activo

Deploy de una **sola función serverless** que sirve la PWA (`app/dist/`), la API (`/health`, `/auth/*`, `/sessions/*`, `/emotions/*`, `/notes/*`) y el Swagger (`/docs`). Ver [`agents/specs/04-vercel-serverless-deploy.md`](agents/specs/04-vercel-serverless-deploy.md).

- Rama de producción: `master` (se desarrolla en `develop` → PR).
- Configuración en `vercel.json`; dependencias Python en `requirements.txt` de la raíz.
- Dashboard: Root Directory **`/`** y build del frontend manejado por `vercel.json`.

### Alternativa: homelab (Docker)

`Dockerfile`, `nginx.conf`, `docker-compose.yml` y `Makefile` para correr la PWA en casa (build multi-stage Node 22 + nginx, imagen final ~25 MB).

```bash
make docker-build && make docker-up
# App en http://<homelab-ip>:8080
```

**Nota HTTPS**: los Service Workers (instalación/offline) solo funcionan en origen seguro. Sobre la red LAN corre como web app pero no será instalable; para PWA completa pon TLS delante (Tailscale Serve, Caddy, Cloudflare Tunnel…).

## Estructura

```
tone-breath/
  app/                     # Frontend PWA (React + Vite)
    src/
      components/          # UI reusable y de dominio (circle, nav, targetas…)
      context/             # ThemeContext, AuthContext
      hooks/               # useBreathingSession, useAuth, useDataMode
      lib/                 # audioEngine, breathingClock, auth, routines, format
      pages/               # Home, Selector de tiempo, Sesión, Resumen
      App.tsx              # rutas y orquestación
  backend/
    app/
      main.py              # FastAPI app + CORS + serving de la PWA
      config.py            # settings (pydantic-settings)
      routers/             # auth, sessions, emotions, notes
    tests/                 # pytest (5 tests)
  api/
    index.py               # entrypoint de la función Vercel (expone `vercel`)
  vercel.json              # buildCommand + ruteo: todo el tráfico a api/index.py
  requirements.txt         # deps Python para Vercel (solo se lee desde la raíz)
  agents/specs/            # especificaciones por fase (para agentes de IA)
  context/                 # diseño de referencia y specs de implementación
  docs/                    # audio, sesiones, deployment
  Makefile                 # make dev/test/setup/build…
  Dockerfile, docker-compose.yml, nginx.conf   # homelab opcional
```

## Documentación

- [`agents/specs/`](agents/specs/) — especificaciones técnicas por fase (incluida la arquitectura de [deploy serverless en Vercel](agents/specs/04-vercel-serverless-deploy.md)).
- [`docs/audio.md`](docs/audio.md) — motor de sonido (tonos, reverb, metrónomo).
- [`docs/2026-09-11-vercel-deploy.md`](docs/2026-09-11-vercel-deploy.md) — aprendizajes del primer deploy en Vercel.
- [`context/`](context/) — diseño de referencia e implementación fase 2.

## Roadmap

### Fase 1: MVP (Completada) ✅
- [x] 3 rutinas de respiración
- [x] Audio procedural con Tone.js
- [x] Círculo de respiración animado
- [x] SOS button
- [x] Tema claro/oscuro
- [x] PWA instalable
- [x] Despliegue (Docker + Vercel)

### Fase 2: Backend + Tracking Emocional (En progreso)
- [x] Backend FastAPI desplegado como función serverless en Vercel (endpoints stub)
- [x] Sistema de registro emocional (radar 2-3 taps) y delta antes/después
- [ ] Conexión real a Supabase (PostgreSQL + Auth JWT)
- [ ] Calendario de emociones con timeline + radar
- [ ] Offline-first con sincronización automática (IndexedDB)

### Fase 3: Recomendaciones Personalizadas
- [ ] Rutinas adaptativas según historial
- [ ] Ajuste dinámico de tonos y timbre
- [ ] Detección de patrones de estrés

### Fase 4: Sonidos Binaurales
- [ ] Generación procedural de beats binaurales
- [ ] Adaptación por usuario según respuesta medible

## Licencia

MIT — usa, estudia y reutiliza. Ver [`LICENSE`](LICENSE).