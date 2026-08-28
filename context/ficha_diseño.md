
### 🎨 Ficha de Diseño UI/UX: Tone Breath

**1. Filosofía y Experiencia de Usuario (UX)**

* Tone Breath está concebida como una PWA directa y minimalista, enfocada en el bienestar y el *mindfulness*^^.
* El tono de la interfaz debe ser acogedor, humano y libre de distracciones^^.
* Para apoyar la salud mental del usuario sin emitir juicios, la interfaz empleará *captions* reconfortantes, utilizando frases como "¿Tienes un momento para ti?" o "Está bien no estar bien todo el tiempo"^^.
* Al basarnos en las directrices de Material Design, la estética se apoyará fuertemente en el uso de colores neutros, mucho espacio en blanco y la aplicación de sombras suaves para dar profundidad^^.

**2. Paleta de Colores Adaptativa**

Esta paleta respeta tu idea de evitar blancos puros para prevenir la fatiga visual, integrando los tonos verdes azulados que funcionaron en la prueba de audio.

| **Elemento**          | **Modo Claro (Light Mode)**               | **Modo Oscuro (Dark Mode)**     | **Notas de Implementación**                                                    |
| --------------------------- | ----------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------- |
| **Fondo Principal**   | Gris perla / Hueso suave (`#F8FAFC`o similar) | Azul noche muy profundo (`#0F172A`) | Los fondos rotos relajan la vista y mejoran el contraste con las sombras.             |
| **Acento (Primario)** | Verde azulado vibrante (`#14B8A6`)            | Verde azulado luminoso (`#2DD4BF`)  | El color característico de la marca para botones, sliders y el círculo central.     |
| **Superficies**       | Blanco roto con ligera opacidad                 | Gris azulado oscuro (`#1E293B`)     | Ideal para contenedores y tarjetas flotantes usando las sombras suaves de Material^^. |
| **Texto Principal**   | Gris asfalto cálido (`#334155`)              | Gris nube claro (`#E2E8F0`)         | Garantiza legibilidad sin llegar al contraste extremo del negro sobre blanco.         |

**3. Comportamiento Visual y Animaciones**

* El núcleo visual será un círculo central que servirá como guía visual de respiración^^.
* Para indicar la inhalación, el círculo se expandirá hacia los bordes de la pantalla^^.
* Durante la exhalación o retención, el círculo se contraerá suavemente hacia el centro^^.
* Dado que ya tienes una sólida experiencia programando PWAs completas en React y diseñando animaciones web responsivas y fluidas, trasladar estas mecánicas de interfaz te resultará un proceso muy natural.
* Utilizaremos Framer Motion a 60 fps para controlar estos cambios de tamaño, aplicando físicas de resorte ( *spring* ) para que la expansión y contracción se sientan orgánicas y naturales^^.
* Es estrictamente necesario que estas animaciones visuales operen en perfecta sincronía con el reloj maestro (Transport) y el metrónomo procedural de Tone.js^^.

**4. Tipografía e Iconografía**

* **Iconos:** Para mantener una estética limpia y alineada con Material, se utilizarán íconos vectoriales de la librería Lucide React^^.
* **Tipografía:** Se recomienda una fuente geométrica y humanista (como Roboto, típica de Material, o Inter), priorizando grosores ligeros (Light o Regular) en los títulos para transmitir serenidad.



### 🟢 Dinámica del Círculo Guía

* **Fases Cambiantes:** Durante la inhalación, el círculo se expandirá hacia los bordes de la pantalla^^. Para la exhalación, el círculo se contraerá suavemente hacia el centro^^.
* **Fases Estáticas (Latido):** En los momentos de retención (lleno o vacío), programaremos un bucle de animación suave que escale el círculo ligeramente (por ejemplo, entre un 98% y un 102%) para simular un pulso constante.
* **Indicador Central:** El centro del círculo mostrará un texto central indicativo de la acción, como "Inhala" o "Exhalar", guiando al usuario paso a paso^^.
* **Límite Visual (Sombra):** Un anillo tenue y estático marcará el tamaño máximo del círculo, sirviendo como meta visual para la capacidad pulmonar del usuario.
* **Tecnología:** Utilizaremos Framer Motion combinado con Tailwind CSS para garantizar que todas estas transiciones se ejecuten de forma fluida a 60 fps^^.

### 🎨 Propuesta de Opacidades y Sombras

Para lograr ese efecto de "sombra de tamaño máximo" sin romper el minimalismo de Material Design, propongo los siguientes valores adaptativos:

| **Elemento**              | **Modo Claro**          | **Modo Oscuro**                  | **Comportamiento**                                         |
| ------------------------------- | ----------------------------- | -------------------------------------- | ---------------------------------------------------------------- |
| **Círculo Activo**       | Verde azulado (Opacidad 100%) | Verde azulado luminoso (Opacidad 100%) | Cambia de tamaño y late según la fase de respiración.         |
| **Sombra Límite (Meta)** | Verde azulado (Opacidad 10%)  | Verde azulado (Opacidad 20%)           | Estática en el tamaño máximo; marca el límite de expansión. |
| **Texto Central**         | Gris oscuro cálido           | Blanco humo                            | Transición fluida al cambiar la instrucción.                   |
