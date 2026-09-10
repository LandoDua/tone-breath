# Fase 2: Estrategia Offline-First y Sincronización

## 1. Filosofía

Tone Breath es una app de bienestar. Si el usuario está en un avión, en el metro, o sin conexión, la app debe funcionar al 100%. El backend es un respaldo para sincronización y acceso multi-dispositivo, no un requisito para el uso diario.

**Regla de oro:** Nunca bloquear al usuario esperando una respuesta del servidor.

---

## 2. Arquitectura de Almacenamiento

### 2.1 Capas de Storage

```
┌─────────────────────────────────────────────────┐
│                   UI Layer                       │
│            (React State + Context)               │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│              Service Layer                       │
│         (useBreathingSession, etc.)              │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│              Storage Layer                       │
│         (IndexedDB via Dexie.js)                 │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│              Sync Layer                          │
│       (Background Sync Manager)                  │
└──────────────────────┬──────────────────────────┘
                       │
                ┌──────▼──────┐
                │  Supabase    │
                └─────────────┘
```

### 2.2 IndexedDB Schema (Dexie.js)

```typescript
// db.ts
import Dexie, { Table } from 'dexie';

export interface EmotionEntry {
  id: string;              // UUID local
  remote_id?: string;      // ID en Supabase (asignado después de sync)
  user_id: string;
  session_id?: string;
  type: 'before' | 'after' | 'free';
  dimensions: {
    calma: number;
    ansiedad: number;
    energia: number;
    tristeza: number;
    enfoque: number;
    apertura: number;
  };
  dominant_emotion: string;
  recorded_at: string;     // ISO 8601
  sync_status: 'pending' | 'synced' | 'conflict';
  last_modified: string;   // ISO 8601
}

export interface BreathingSession {
  id: string;              // UUID local
  remote_id?: string;
  user_id: string;
  routine_type: 'square' | '4-7-8' | 'coherent';
  duration_seconds: number;
  completion_percentage: number;
  started_at: string;
  completed_at?: string;
  sync_status: 'pending' | 'synced' | 'conflict';
  last_modified: string;
}

export interface SyncQueue {
  id: number;              // Auto-increment
  table_name: string;
  record_id: string;
  operation: 'create' | 'update' | 'delete';
  payload: any;
  created_at: string;
  retries: number;
}

export class ToneBreathDB extends Dexie {
  emotions!: Table<EmotionEntry>;
  sessions!: Table<BreathingSession>;
  sync_queue!: Table<SyncQueue>;

  constructor() {
    super('tone-breath-db');
    this.version(1).stores({
      emotions: 'id, remote_id, user_id, session_id, type, recorded_at, sync_status',
      sessions: 'id, remote_id, user_id, routine_type, started_at, sync_status',
      sync_queue: '++id, table_name, record_id, operation, created_at'
    });
  }
}

export const db = new ToneBreathDB();
```

---

## 3. Flujo de Datos

### 3.1 Guardado Local (Offline)

```
Usuario toca "Confirmar" en registro emocional
    │
    ▼
1. Generar UUID local
2. Guardar en IndexedDB (sync_status: 'pending')
3. Agregar a sync_queue
4. Actualizar UI inmediatamente
    │
    ▼
App lista para siguiente interacción
```

### 3.2 Sincronización (Background)

```
Service Worker detecta conexión a internet
    │
    ▼
1. Leer sync_queue (orden cronológico)
2. Para cada item:
   a. Enviar a Supabase API
   b. Si éxito:
      - Actualizar remote_id en IndexedDB
      - Cambiar sync_status a 'synced'
      - Eliminar de sync_queue
   c. Si error de red:
      - Reintentar después de 30s
      - Incrementar retries
   d. Si conflicto (409):
      - Marcar sync_status como 'conflict'
      - Resolver con estrategia (ver §4)
3. Continuar hasta vaciar cola
```

### 3.3 Estrategia de Resolución de Conflictos

| Escenario | Estrategia |
|-----------|-----------|
| **Mismo registro, offline Modificado** | Última modificación gana (last-write-wins) |
| **Mismo registro, uno eliminado** | Mantener el existente, marcar como "deleted locally" |
| **Conexión perdida durante sync** | Reintentar con backoff exponencial (30s, 60s, 120s, max 5min) |
| **Cola > 100 items** | Priorizar: emociones > sesiones >其余 |

---

## 4. Implementación del Sync Manager

```typescript
// lib/syncManager.ts
import { db } from './db';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

class SyncManager {
  private isSyncing = false;
  private retryTimeout: NodeJS.Timeout | null = null;

  async sync(): Promise<void> {
    if (this.isSyncing || !navigator.onLine) return;

    this.isSyncing = true;

    try {
      const queue = await db.sync_queue
        .orderBy('id')
        .limit(50)
        .toArray();

      for (const item of queue) {
        try {
          await this.processItem(item);
          await db.sync_queue.delete(item.id);
        } catch (error) {
          if (item.retries >= 5) {
            await db.sync_queue.delete(item.id);
            console.error(`Sync failed after 5 retries:`, item);
          } else {
            await db.sync_queue.update(item.id, {
              retries: item.retries + 1
            });
          }
        }
      }
    } finally {
      this.isSyncing = false;
      this.scheduleNextSync();
    }
  }

  private async processItem(item: SyncQueueItem): Promise<void> {
    const headers = {
      'Authorization': `Bearer ${this.getAccessToken()}`,
      'Content-Type': 'application/json'
    };

    const url = `${SUPABASE_URL}/rest/v1/${item.table_name}`;

    switch (item.operation) {
      case 'create':
        const response = await fetch(url, {
          method: 'POST',
          headers: { ...headers, 'Prefer': 'return=representation' },
          body: JSON.stringify(item.payload)
        });
        const data = await response.json();
        // Actualizar remote_id en IndexedDB
        break;

      case 'update':
        await fetch(`${url}?id=eq.${item.record_id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(item.payload)
        });
        break;

      case 'delete':
        await fetch(`${url}?id=eq.${item.record_id}`, {
          method: 'DELETE',
          headers
        });
        break;
    }
  }

  private scheduleNextSync(): void {
    if (this.retryTimeout) clearTimeout(this.retryTimeout);

    this.retryTimeout = setTimeout(() => {
      if (navigator.onLine) {
        this.sync();
      }
    }, 30000); // Revisar cada 30 segundos
  }

  private getAccessToken(): string {
    // Obtener del contexto de auth o memoria
    return localStorage.getItem('supabase.access_token') || '';
  }
}

export const syncManager = new SyncManager();
```

---

## 5. Hooks React para Offline-First

### 5.1 useEmotions Hook

```typescript
// hooks/useEmotions.ts
import { useState, useEffect } from 'react';
import { db, EmotionEntry } from '../lib/db';
import { syncManager } from '../lib/syncManager';

export function useEmotions(userId: string) {
  const [emotions, setEmotions] = useState<EmotionEntry[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Cargar de IndexedDB
    loadLocalEmotions();

    // Escuchar cambios de conexión
    const handleOnline = () => {
      setIsOnline(true);
      syncManager.sync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [userId]);

  const loadLocalEmotions = async () => {
    const local = await db.emotions
      .where('user_id')
      .equals(userId)
      .reverse()
      .sortBy('recorded_at');

    setEmotions(local);
  };

  const addEmotion = async (entry: Omit<EmotionEntry, 'id' | 'sync_status' | 'last_modified'>) => {
    const newEntry: EmotionEntry = {
      ...entry,
      id: crypto.randomUUID(),
      sync_status: 'pending',
      last_modified: new Date().toISOString()
    };

    // Guardar local
    await db.emotions.add(newEntry);
    await db.sync_queue.add({
      table_name: 'emotion_entries',
      record_id: newEntry.id,
      operation: 'create',
      payload: newEntry,
      created_at: new Date().toISOString(),
      retries: 0
    });

    // Actualizar UI
    setEmotions(prev => [newEntry, ...prev]);

    // Intentar sync si online
    if (navigator.onLine) {
      syncManager.sync();
    }

    return newEntry;
  };

  return {
    emotions,
    isOnline,
    addEmotion,
    refresh: loadLocalEmotions
  };
}
```

---

## 6. Service Worker para Background Sync

```typescript
//(sw.ts)
// Registrar sync cuando hay cambios pendientes
self.addEventListener('sync', (event) => {
  if (event.tag === 'tone-breath-sync') {
    event.waitUntil(syncPendingData());
  }
});

// Notificar al usuario sobre estado de sync
self.addEventListener('message', (event) => {
  if (event.data.type === 'SYNC_COMPLETE') {
    self.registration.showNotification('Tone Breath', {
      body: 'Tus datos se han sincronizado correctamente',
      icon: '/icons/icon-192x192.png'
    });
  }
});

async function syncPendingData() {
  // Implementación del sync con Supabase
  // Similar a syncManager pero en el contexto del Service Worker
}
```

---

## 7. Indicadores de Estado en UI

### 7.1 Badges de Estado

```
┌─────────────────────────────────────────────────┐
│  ┌─────────┐                                     │
│  │  ● Sync │  ← Verde: sync completado          │
│  │  ○ Sync │  ← Gris: sin conexión              │
│  │  ◐ Sync │  ← Amarillo: sincronizando         │
│  │  ⚠ Sync │  ← Rojo: error de sync            │
│  └─────────┘                                     │
└─────────────────────────────────────────────────┘
```

### 7.2 Componente React

```tsx
// components/SyncStatus.tsx
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useSyncQueue } from '../hooks/useSyncQueue';

export function SyncStatus() {
  const isOnline = useOnlineStatus();
  const pendingCount = useSyncQueue();

  if (isOnline && pendingCount === 0) {
    return <Badge color="green">Synced</Badge>;
  }

  if (!isOnline) {
    return <Badge color="gray">Offline</Badge>;
  }

  if (pendingCount > 0) {
    return <Badge color="yellow">Syncing ({pendingCount})</Badge>;
  }

  return <Badge color="red">Error</Badge>;
}
```

---

## 8. Estrategia de Cache

### 8.1 Cache de Solo Lectura

| Recurso | TTL | Estrategia |
|---------|-----|-----------|
| Assets estáticos (JS, CSS) | 1 año | Cache-First |
| Imágenes | 30 días | Cache-First |
| API responses (GET) | 5 min | Stale-While-Revalidate |
| Datos de usuario | Offline | Network-First con fallback a cache |

### 8.2 Datos que NUNCA se cachean

- Tokens de autenticación (solo en memoria)
- Datos de pago (si se implementan)
- Información médica sensible (si aplica)

---

## 9. Testing de Offline

### 9.1 Casos de Prueba

1. **App funciona sin conexión**: Todos los botones responden, datos se guardan
2. **Reconexión automática**: Sync se inicia al detectar internet
3. **Datos no se pierden**: Cerrar app sin conexión, reabrir, verificar datos
4. **Conflictos se resuelven**: Modificar mismo registro en dos dispositivos
5. **Cola de sync límite**: 100+ items en cola, app sigue responsiva
6. **Storage lleno**: Manejar error de quota exceeded

### 9.2 Herramientas

- Chrome DevTools > Application > Service Workers > Offline
- Chrome DevTools > Application > Storage > Clear site data
- Lighthouse PWA audit
- WebPageTest con throttling de red
