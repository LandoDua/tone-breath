
## 🎨 Skills para `@Frontend_UI`

Este agente requiere habilidades enfocadas en la optimización visual, rendimiento de renderizado a 60 fps y traducción fluida de maquetas (como las de Google Stitch) a código limpio en React^^.

* **`react-best-practices` / `react-hooks-lint`** : Esencial para asegurar la separación de lógica y la correcta gestión de referencias (`useRef`) sin provocar re-renderizados innecesarios, lo cual es crítico al sincronizar la interfaz con el motor de audio^^.
* **`tailwind-css`** : Garantiza la implementación limpia de utilidades y la configuración de tokens de diseño para la paleta adaptativa de Material Design (como los tonos gris perla `#F8FAFC`, verde azulado `#14B8A6` y azul noche `#0F172A`)^^.
* **`framer-motion-animations`** : Permite al agente manipular físicas de resorte ( *spring* ) para el escalado fluido del círculo guía, controlar la transición de opacidades y ejecutar la pulsación sutil del 98% al 102% en las fases estáticas^^.

## 🎹 Skills para `@Audio_Engineer`

Dado que el núcleo sonoro de la aplicación es procedural y se apoya en síntesis en tiempo real, este agente necesita destrezas avanzadas en procesamiento de señal en el navegador^^.

* **`web-audio-api` / `tonejs-synthesis`** : Capacita al agente para instanciar nodos de audio, configurar sintetizadores (`Tone.Synth`, `Tone.FMSynth`), ajustar envolventes ADSR (ataque suave, liberación prolongada) y conectar efectos de reverberación profunda (`Tone.Reverb`)^^.
* **`tone-transport-scheduling`** : Proporciona patrones exactos para manejar el reloj maestro a 60 BPM, programar bucles sin desfasamiento y aplicar la dinámica psicoacústica (acentuar el primer golpe de cada fase y usar tonos graves como G3 para la exhalación)^^.
* **`audio-lifecycle-management`** : Reglas para gestionar las restricciones del `AudioContext` de los navegadores (`Tone.start()`) y liberar correctamente la memoria (`dispose()`) al desmontar componentes^^.

## ⚡ Skills para `@Backend_Architect`

Este agente debe centrarse en construir un backend ágil en Python que sirva para autenticación, registro de historial y el futuro soporte de recomendaciones inteligentes^^.

* **`fastapi-best-practices`** : Para estructurar APIs REST asíncronas, modularizar routers y definir modelos de datos limpios con Pydantic^^.
* **`supabase-postgres-expert`** : Reglas de interacción con Supabase, manejo de autenticación JWT y diseño de esquemas para las tablas de usuarios y sesiones de respiración^^.

## 🛠️ Skills Globales de Workflow

| **Skill**                               | **Propósito en el Entorno OpenCode**                                                                      |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **`stitch-to-react`/`html-to-jsx`** | Convierte rápidamente las estructuras HTML/CSS que obtienes de Google Stitch en componentes modulares de React. |
| **`clean-code-refactoring`**          | Mantiene el código coherente con la arquitectura definida en`context/proyecto.md`^^.                          |
