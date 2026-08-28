# Contexto del Proyecto: Tone Breath



## 1. Visión General

* Tone Breath es una PWA (Progressive Web App) minimalista orientada al mindfulness y ejercicios de respiración guiada[cite: 1, 2, 5].

* El tono de la aplicación es empático, humano y libre de distracciones, enfocado en el bienestar de la salud mental[cite: 1, 2].

* Las notificaciones y textos usarán un enfoque reconfortante sin emitir juicios[cite: 1].



## 2. Stack Tecnológico

* **Frontend:** React + Vite para tiempos de carga ultraligeros e instantáneos[cite: 1, 2].

* **Estilos y UI:** Tailwind CSS y componentes basados en las directrices de Material Design[cite: 1, 2].

* **Animaciones:** Framer Motion para asegurar transiciones a 60 fps con físicas orgánicas (spring)[cite: 1, 2].

* **Audio:** Tone.js para la síntesis procedural de sonido (sin archivos mp3) y control preciso del tiempo[cite: 2, 4].

* **Backend:** Python con FastAPI, preparado para integrar futuros algoritmos de recomendación[cite: 1, 2].

* **Base de Datos & Auth:** Supabase para la gestión de usuarios y el historial de sesiones[cite: 1, 2].



## 3. Características Core

* **Interfaz Visual:** Basada en la ficha "App respiración | Tone Breath", el núcleo es un círculo que se expande al inhalar, se contrae al exhalar y palpita en las retenciones[cite: 2]. 

* **Audio Zen:** El metrónomo maestro corre a 60 BPM (un latido por segundo) utilizando una onda senoidal que emula un piano suave con alta reverberación[cite: 2, 4]. 

* **Diseño Sonoro Psicoacústico:** El primer latido de cada fase está acentuado (dinámica), los latidos restantes se atenúan, y la exhalación se marca con un tono más grave (ej. G3) para simular alivio[cite: 2, 4].

* **Rutinas Base:**

  * Respiración Cuadrada (Ansiedad): Ciclos 4-4-4-4[cite: 2, 3].

  * Método 4-7-8 (Dormir): Inhalar 4, Retener 7, Exhalar 8[cite: 2, 3].

* Respiración Coherente (Estrés): Ciclos fluidos de 5.5 - 5.5 sin pausas[cite: 2, 3].
