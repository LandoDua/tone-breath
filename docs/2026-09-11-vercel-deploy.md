# Sesión de Aprendizaje — Primer Deploy en Vercel (Serverless)

**Fecha**: 11 de Septiembre, 2026
**Rama**: develop → master
**Resultado**: https://tone-breath.vercel.app funcionando (PWA + API + Swagger)

---

## Contexto

Teníamos una PWA (React/Vite) y un backend FastAPI con endpoints stub. Queríamos el primer deploy en Vercel del stack completo. Lo que parecía "push y ya" terminó siendo una cadena de 4 errores que hoy me enseñaron cómo funciona Vercel por dentro. Este documento es mi registro de qué falló, por qué, y qué aprendí para no volver a tropezar.

---

## Problema 1: La PWA no se servía (raíz → Not Found, pero `/docs` sí)

**Síntoma**: `https://tone-breath.vercel.app/` daba Not Found, pero `/docs` (Swagger de FastAPI) funcionaba.

**Diagnóstico**: No existía `vercel.json` ni carpeta `api/` en el repo. Al conectar el repo, Vercel solo "vio" el backend Python y desplegó únicamente la función FastAPI. El frontend compilado (`app/dist/`) estaba en el repo pero Vercel no tenía ninguna instrucción para publicarlo.

**Aprendizaje**:
- Vercel es 100% guiado por configuración: sin `vercel.json`, decide por sí solo qué eres (y suele equivocarse con monorepos).
- El hecho de que `/docs` funcionara era la pista: la app FastAPI estaba desplegada, pero nadie le dijo a Vercel que había un frontend que servir.

**Fix**: Crear `vercel.json` con estructura backend+frontend, y `api/index.py` como entrypoint.

---

## Problema 2: Build con errores disparatados (ENOENT)

**Síntoma**:
```
npm error path /vercel/path0/backend/app/package.json
npm error ENOENT ... open '/vercel/path0/backend/app/package.json'
```

**Diagnóstico**: Mi primer instinto fue "bug del segundo commit" o "algo del package.json". El log me salvó: el build estaba corriendo con working directory `/vercel/path0/backend/`. Por eso `cd app` buscaba `backend/app`, que no existe.

**Causa raíz**: Al crear el proyecto, la **detección de framework** de Vercel encontró `backend/requirements.txt` y guardó **Root Directory = `backend`**. Todo el build corría relativo a esa carpeta. Y ojo: ese setting vive en el **dashboard de Vercel (server-side)**, no en el repo.

**Aprendizaje**:
- **Leer el log de build completo es obligatorio.** El path que aparece en el primer error me dijo exactamente dónde empezaba el build.
- En Vercel, "Root Directory" es la variable más importante del proyecto: define dónde vive el `vercel.json`, desde dónde corre el build, y dónde se buscan los manifests.
- No se puede arreglar desde el repo un proyecto ya creado: hay que cambiarlo en Settings → General → Root Directory → `/`.

**Fix**: Root Directory → `/` en el dashboard.

---

## Problema 3: 404 elegante de Vercel en TODAS las URLs

**Síntoma**: Después de corregir la raíz, se veía la página 404 "bonita" de Vercel (con request ID) en absolutamente todo.

**Diagnóstico**: Ese 404 con branding es la página de Vercel cuando **ninguna ruta matchea y no hay archivo estático ni rewrite**. Había intentado separar estáticos (`outputDirectory: "app/dist"`) de la función (`/api/* → api/index.py`). La combinación de servicio estático + función Python no quedó bien publicada: el output estático no apareció y las rutas cayeron al vacío.

**Aprendizaje**:
- El 404 "elegante" = problema del **routing/output de Vercel**, no del código.
- La estrategia de `outputDirectory` + función es la frágil cuando el proyecto es un monorepo raro. Me metí en un callejón pensando "en la teoría esto debería funcionar" en vez de simplificar.
- **Simplicidad > elegancia técnica para un MVP.** Cambié de arquitectura: en vez de dos servicios (estático + función), una sola función FastAPI que sirve TODO (API + Swagger + SPA). `main.py` ya estaba diseñado para servir `app/dist/`; solo había que dejar que Vercel le pasara todo el tráfico.

**Fix**:
```json
"routes": [{ "src": "/(.*)", "dest": "api/index.py" }]
```

**Aprendizaje extra**: confirmé la teoría localmente con `TestClient(vercel)` importando desde `api/index.py` — el mismo camino que usa Vercel. Esto atrapa bugs de imports y de serving antes de gastar un ciclo de deploy.

---

## Problema 4: 500 FUNCTION_INVOCATION_FAILED incluso en `/health`

**Síntoma**: Ahora sí, todo el tráfico llegaba a la función... y la función reventaba: "This Serverless Function has crashed."

**Diagnóstico**: El log decía:
```
No Python manifest found; creating an empty pyproject.toml and uv.lock...
```
O sea: Vercel **no encontró requirements.txt** y creó un pyproject vacío → instaló **cero dependencias** → `import fastapi` fallaba al importar → la función crasheaba en cada invocación.

**Causa raíz**: Tenía `requirements.txt` dentro de `backend/` y de `api/`. El builder de Python de Vercel **solo mira la raíz del Root Directory**. Las carpetas internas le dan igual. Sin manifest en la raíz, no instala nada.

**Aprendizaje**:
- `500 FUNCTION_INVOCATION_FAILED` + un import en el código fuente = casi seguro dependencias no instaladas.
- **En Vercel, los requirements.txt "de la función" no existen: el manifest vive en la raíz.** `backend/requirements.txt` es para desarrollo local; el de producción es el de la raíz.
- El mensaje "creating an empty pyproject.toml" es la firma de este bug. Si lo ves, ya sabes qué falta.

**Fix**: `requirements.txt` en la raíz del repo, y borrar el `/api/requirements.txt` redundante para no autosabotearme en el futuro.

---

## Bonus Aprendizaje: el prefijo `/api` no existe

FastAPI define `/health`, no `/api/health`. Intenté probar `/api/health` y FastAPI me devolvió la SPA (su catch-all). Hice trampa mental: asumí que debía haber un prefijo `/api` porque es la convención en Vercel/Next. **La URL refleja las rutas de FastAPI tal cual**: `/health`, `/auth/login`, `/docs`, etc., en el mismo dominio, sin prefijo.

---

## Síntesis de aprendizajes

1. **El log de build ES el doctor.** Cada error que resolví tenía la respuesta en el log: el path del working directory, el "No Python manifest found", las fases del build. Ver el log primero nunca falla.
2. **Root Directory gobierna todo** (dónde está vercel.json, dónde corre el build, dónde se buscan manifests). Es server-side; se arregla en el dashboard, no en el repo.
3. **Vercel solo lee el manifest Python de la raíz.** requirements.txt debe estar en `/`, no en `backend/` ni `api/`.
4. **Un solo funcionamiento es más robusto que dos servicios.** Para el MVP: una función FastAPI que sirva SPA + API eliminó una clase entera de problemas de routing/output.
5. **Reproducir localmente el camino real de producción** (importar desde `api/index.py` con TestClient) atrapa bugs de import y de serving sin gastar deploys.
6. **Insistir en teoría me costó ciclos.** La primera arquitectura "correcta" (estático + función) falló dos veces. Vi el log, simplifiqué, y funcionó a la primera.
7. **El check-list de verificación** después de cada deploy: `/` → PWA, `/health` → JSON, `/docs` → Swagger.

---

## Próximos pasos (deploy)

1. Migrar el serving estático al CDN de Vercel (mantener API como función) cuando el rendimiento lo pida.
2. MCP de Vercel configurado para inspeccionar logs/deploys desde la sesión.
3. Conectar Supabase real (los endpoints aún son stubs).