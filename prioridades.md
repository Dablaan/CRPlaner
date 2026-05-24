# 📋 Lista de Prioridades y Futuras Mejoras (CRPlaner)

Este documento detalla las nuevas funciones y correcciones planeadas para la aplicación, organizadas por orden de prioridad. A medida que se completen, se eliminarán de esta lista y se registrarán en el `walkthrough.md`.

---

## 🔥 Prioridad Alta (Mejoras de Usabilidad y Core)

- [ ] **Historial de Cuentas Sincronizadas**:
  - Guardar en `localStorage` los tags y nombres de los últimos jugadores buscados (ej: hasta 5 perfiles).
  - Mostrar un menú desplegable de acceso rápido debajo del buscador para cambiar de perfil con un solo clic sin tener que reescribir el tag.
- [ ] **Copiar Enlace de Mazo al Portapapeles**:
  - Agregar la opción de copiar la URL de exportación (`link.clashroyale.com/...`) directamente al portapapeles con un botón de "copiar", además del botón de exportar actual.
- [ ] **Selector de Nivel Objetivo Global**:
  - Añadir un control en la parte superior de la colección para cambiar el nivel objetivo de todas las cartas a nivel 15 o nivel 16 de forma simultánea.
- [ ] **Coste Medio de Elixir en el Constructor**:
  - Mostrar el costo medio de elixir del mazo de forma dinámica y prominente dentro del editor de mazo activo.
- [ ] **Footer "MAX" en Tarjetas a Nivel Máximo**:
  - En la colección, cuando una carta ya se encuentre en su nivel máximo o nivel objetivo (15/16), ocultar el panel de costes de subida de nivel.
  - Mostrar en su lugar un footer limpio y destacado que diga **MAX** en mayúsculas.
- [ ] **Ajuste del Grid a 4 Columnas e Imágenes Grandes (Escritorio)**:
  - Cambiar el grid de la colección de 3 a 4 columnas en la versión de escritorio (`md:grid-cols-4`).
  - Rediseñar las proporciones internas para que las imágenes de las cartas se visualicen más grandes, sin incrementar el tamaño de la tarjeta de la cuadrícula.

---

## ⚡ Prioridad Media (Análisis de Mazos y Sinergias)

- [ ] **Intercambio por Arrastre (Drag & Drop) entre Slots**:
  - Permitir arrastrar cartas de un slot a otro en el constructor de mazos.
  - Validar que el intercambio sea compatible con las reglas del slot destino (ej. Slot 1: Evoluciones, Slot 2: Héroes/Campeones, Slot 3: Evo/Héroe/Campeón/Normal).
- [ ] **Asistente de Construcción "Deck Checker"**:
  - Analizar la viabilidad del mazo activo en base a métricas competitivas:
    - *Ataque Aéreo*: Validar si hay al menos 2 o 3 cartas capaces de atacar a unidades aéreas.
    - *Hechizos*: Comprobar la presencia de al menos un hechizo ligero (ej. Log, Zap, Arrows) y uno pesado (ej. Fireball, Poison, Lightning).
    - *Win Condition*: Verificar que haya al menos una condición de victoria (ej. Montapuercos, Gigante, Globo).
- [ ] **Visualizador del Ciclo Rápido (4 Cartas)**:
  - Mostrar las 4 cartas de menor coste de elixir del mazo y calcular la velocidad de ciclo (costo de elixir necesario para volver a tener la misma carta en mano).

---

## 🍃 Prioridad Baja (Estética y Datos Adicionales)

- [ ] **Estadísticas de Perfil Ampliadas**:
  - Mostrar en el panel del perfil más información de la API de Supercell: clan actual del jugador, victorias máximas en desafíos y nivel de torre de coronas.
- [ ] **Modo Claro "Liquid Light"**:
  - Implementar un switch para alternar entre el tema oscuro premium por defecto y un modo claro estilo "Liquid Light" con desenfoques claros.
