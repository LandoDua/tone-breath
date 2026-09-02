Tone Breath | Especificación Técnica de Audio (Spec)

Documentación oficial del motor de audio procedural para Tone Breath, implementado con Tone.js v15. Esta especificación está diseñada para guiar el desarrollo técnico (OpenCode) y asegurar una experiencia sonora Zen, inmersiva y adaptativa.

1. Filosofía Sonora y Objetivos Técnicos

Audio 100% Procedural: No se cargan archivos estáticos (.mp3 / .wav). Todo se genera en tiempo real mediante síntesis en el navegador, manteniendo la PWA ultraligera y permitiendo personalizaciones futuras por usuario.

Prevención de Delay Bluetooth (Noise Gate): Utiliza un colchón sonoro continuo (Pad ambiental) para evitar que los auriculares inalámbricos entren en reposo absoluto durante los silencios, eliminando los molestos retrasos que rompen el ritmo del metrónomo.

Estética Zen y Subacuática: Sonidos cálidos, orgánicos y sin estridencias, inspirados en ambientes envolventes (estilo Subnautica), optimizados para la relajación profunda y la regulación del sistema nervioso.

2. Arquitectura del Motor de Audio (audioEngine.ts)

El motor se compone de tres capas principales sincronizadas a través de un reloj maestro (Tone.Transport):

A. Reloj Maestro y Transporte

BPM: Configurado estrictamente a 60 BPM (1 pulso = 1 segundo cronológico exacto).

Sincronización: Todas las tareas repetitivas se programan mediante Tone.Transport.scheduleRepeat utilizando subdivisión '4n' (negra).

B. El Metrónomo Psicoacústico (Guía de Tiempo)

Timbre: Onda senoidal (sine) pura y redonda.

Envolvente (ADSR):

attack: 0.02 (golpe suave).

decay: 0.3 / 1.5.

sustain: 0.

release: 0.5 / 2.

Acentuación Dinámica (Velocity):

El primer latido de cada fase tiene una velocidad alta (0.7) para marcar un anclaje claro.

Los latidos subsiguientes de la misma fase se atenúan (0.15 - 0.2) para no saturar al usuario.

Afinación por Fase (Mapeo Emocional):

Inhalar: Nota media (C4) - Referencia y estabilidad.

Retener (Lleno): Nota aguda (G4 o E4) - Tensión controlada.

Exhalar: Nota grave (G3) - Simula un suspiro de alivio profundo.

Pausa (Vacío): Nota neutra (C3 o E4).

C. El Pad de Cuerdas Cálidas (Colchón Ambiental Estilo Chelo)

Timbre: Tone.PolySynth utilizando Síntesis AM (Amplitud Modulada) con ondas triangulares (triangle) y armonicidad ajustada (1.01 para generar una sutil desafinación orgánica).

Envolvente: Ataque y liberación largos (attack: 4s, release: 5s) para transiciones imperceptibles.

Cadena de Efectos (FX):

Tone.Vibrato (frequency: 4.5, depth: 0.15): Simula el movimiento de la mano del violonchelista.

Tone.Chorus (4, 2.5, 0.5): Engrosa el sonido dándole un carácter coral y masivo.

Tone.Filter (800Hz, lowpass): Corta cualquier estridencia o frecuencia aguda.

Tone.Reverb (decay: 6, preDelay: 0.1, wet: 0.7): Reverberación global profunda compartida con el metrónomo.

Comportamiento Generativo: El motor selecciona notas de una escala específica del modo activo y realiza un glide (rampTo) fluido cada 8 segundos, evitando la monotonía.

3. Perfiles Sonoros por Modo de Respiración

Modo

Objetivo

Escala / Acordes del Pad

Filtro Base

Comportamiento del Pad

Dormir (4-7-8)

Inducir sueño profundo

Pentatónica menor (C3, E3, G3, C4, A2...)

800 Hz

Oscuro, estable, notas graves de chelo muy espaciadas.

Calma (Coherente)

Equilibrar sistema nervioso

Acordes Maj7 y Dom7 flotantes (F3, A3, C4, E4...)

1000 Hz

Dinámico, marea expansiva con paneo estéreo envolvente.

Foco (Cuadrada)

Reducir ansiedad / Grounding

Acordes Sus4 estables (C3, F3, G3, C4...)

900 Hz

Presente, sólido, con alto índice de Chorus para anclaje.

4. Guía de Implementación para OpenCode

Al integrar este módulo en la estructura del proyecto (app/src/lib/audioEngine.ts o equivalente):

Desbloqueo de Audio: Asegurarse de invocar await Tone.start() estrictamente dentro de un manejador de eventos de usuario (clic en botón "Empezar").

Limpieza de Memoria: Implementar funciones de dispose (synth.dispose(), reverb.dispose(), Tone.Transport.stop()) al desmontar componentes de React para evitar fugas de memoria en el navegador.

Sincronización UI: Utilizar Tone.Draw.schedule() para actualizar los estados visuales (como el texto del círculo y el temporizador) exactamente en el frame donde se ejecuta el pulso de audio.