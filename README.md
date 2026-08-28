# Tone Breath

Respiración guiada y mindfulness con sonido procedural. Una PWA mobile-first que te acompaña en sesiones de respiración coherente, relajación y alivio del estrés, con metrónomo y tonos generados en tiempo real (Tone.js).

## Características

- **3 rutinas de respiración**:
  - **Dormir** (4-7-8) — desconecta la mente
  - **Relajar** (coherente, 5.5–5.5) — paz en el presente
  - **Estrés** (cuadrado 4-4-4-4) — alivio inmediato
- **Audio procedural** con Tone.js: pulso de metrónomo que sigue la fase activa y cues sonoros en cada cambio de fase (inhalar/exhalar/retener/pausa), con reverb.
- **Círculo de respiración animado** que escala con las fases; el texto central permanece en tamaño fijo y legible.
- **SOS**: inicio rápido de una sesión de Relajar de 5 minutos desde la pantalla principal.
- **Tema claro/oscuro** y **transiciones animadas** entre pantallas (respetan `prefers-reduced-motion`).
- **PWA** instalable (manifest + service worker), lista para agregar al inicio en móvil.
- Barra de navegación inferior flotante y diseño adaptativo centrado a 480px en escritorio.

## Stack

- [React](https://react.dev) 19 + [TypeScript](https://www.typescriptlang.org) ~6
- [Vite](https://vite.dev) 8 + [vite-plugin-pwa](https://vite-pwa-org.netlify.app)
- [Tailwind CSS](https://tailwindcss.com) v4
- [Tone.js](https://tonejs.github.io) 15 — síntesis y scheduling de audio
- [Framer Motion](https://www.framer.com/motion/) 13 — animaciones
- [React Router](https://reactrouter.com) 7
- [Lucide React](https://lucide.dev) — iconos

## Empezar

```bash
cd app
npm install
npm run dev        # http://localhost:5173
```

Scripts:

```bash
npm run dev        # servidor de desarrollo (visible en la red local)
npm run build      # typecheck (tsc -b) + build de producción en dist/
npm run lint       # oxlint
npm run preview    # sirve el build de producción en http://localhost:4173
```

Para probar en un teléfono en la misma red WiFi, entra a `http://<tu-ip>:5173` (el servidor dev y preview escuchan en todas las interfaces).

## Despliegue en homelab (Docker)

El proyecto incluye `Dockerfile`, `nginx.conf`, `docker-compose.yml`, `Makefile` y `.dockerignore`. El build es multi-stage: compila con Node 22 + Vite y sirve el `dist/` con nginx (imagen final ~25 MB).

```bash
make build   # docker compose build
make up      # docker compose up -d
# App en http://<homelab-ip>:8080
```

Otros targets: `make logs`, `make restart`, `make down`. El contenedor reinicia solo y trae healthcheck.

### Nota sobre HTTPS y la PWA

Los Service Workers (instalación/offline) **solo funcionan en origen seguro (HTTPS)**, no por HTTP simple. Sobre la red LAN funcionará como web app, pero para que la PWA sea instalable en el móvil de un amigo necesitas exponerla con TLS delante del contenedor. Si usas Tailscale Serve:

```bash
tailscale serve --bg --https=443 http://homelab-ip:8080
# -> https://<tu-tailnet>.ts.net
```

El contenedor solo expone HTTP interno en `:80`; el proxy (Tailscale, Caddy con dominio, Cloudflare Tunnel…) termina el TLS, así que el service worker registra sin problema.

## Estructura

```
app/
  src/
    components/          # UI reusable y de dominio (circle, nav, targetas…)
    context/             # ThemeContext (claro/oscuro)
    hooks/               # useBreathingSession (estado de la sesión + audio)
    lib/                 # audioEngine, breathingClock, routines, format
    pages/               # Home, Selector de tiempo, Sesión, Resumen
    App.tsx              # rutas y orquestación
docs/
  audio.md               # documentación del motor de sonido (tonos y reverb)
context/                 # diseño de referencia y PDF de diseño (Stitch)
Dockerfile               # build multi-stage (Node 22 + nginx)
nginx.conf               # servidor estático con cabeceras PWA
docker-compose.yml       # servicio para homelab (puerto 8080)
Makefile                 # make build/up/down/logs…
```

## Documentación de audio

El motor de sonido (tonos por fase, niveles de reverb, comportamiento del metrónomo y cues) está documentado en [`docs/audio.md`](docs/audio.md).

## Roadmap (temprano)

- Barra de volumen en la app
- Ajustes finos de reverb y tonos
- Registro emocional, diario y backend (ver `agents/specs/`)

## Licencia

MIT — usa, estudia y reutiliza. Ver [`LICENSE`](LICENSE).