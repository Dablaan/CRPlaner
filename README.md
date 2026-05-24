# 🏆 Clash Royale Tracker & Deck Builder (Meta 2026)

Este es un tracker de progresión y constructor de mazos optimizado para el Meta 2026 de Clash Royale. Permite a los jugadores sincronizar sus cuentas reales de Supercell, calcular el coste exacto de oro y cartas restantes para subir a niveles 15 y 16, y planificar mazos competitivos con restricciones de slots.

- **URL en Producción (Vercel)**: [https://crplaner.vercel.app](https://crplaner.vercel.app)
- **Repositorio en GitHub**: [https://github.com/Dablaan/CRPlaner](https://github.com/Dablaan/CRPlaner)

---

## 🛠️ Tecnologías y Arquitectura

1. **Frontend (SPA)**:
   - **Estructura**: HTML5 semántico.
   - **Estilos**: Tailwind CSS (vía CDN) combinado con estilos personalizados premium en [index.css](file:///Users/anaferrergarcia/Desktop/CRPlaner/index.css) (diseño estilo *iOS Liquid Glass*, Glassmorphism, y `scrollbar-gutter: stable` para evitar parpadeos y desplazamientos de layout en hover).
   - **Lógica**: JavaScript nativo (ES6) en [app.js](file:///Users/anaferrergarcia/Desktop/CRPlaner/app.js) sin dependencias ni compiladores pesados.

2. **Backend & API Proxy**:
   - **Producción (Vercel Serverless Function)**: [api/player.js](file:///Users/anaferrergarcia/Desktop/CRPlaner/api/player.js) (Node.js) actúa como proxy seguro para ocultar la API Key de Supercell y sortear las políticas de CORS.
   - **Local (Servidor Python 3)**: [dev_server.py](file:///Users/anaferrergarcia/Desktop/CRPlaner/dev_server.py) emula el comportamiento de las funciones serverless de Vercel en local (`/api/player`).

3. **Bypass del Límite de IPs (Supercell API)**:
   - Supercell bloquea peticiones de servidores con IPs dinámicas (como Vercel). Para solucionarlo, las llamadas se enrutan a través del proxy oficial de la comunidad **`https://proxy.royaleapi.dev`**.
   - Para que el tracker funcione con datos reales, la API Key configurada debe tener autorizada la IP fija del proxy de RoyaleAPI: **`45.79.218.79`**.
   - Si no se detecta la API key o falla la red, la API tiene una **lógica de fallback** que lee de forma transparente el archivo de prueba [ejemplojson.json](file:///Users/anaferrergarcia/Desktop/CRPlaner/documentacion/ejemplojson.json) personalizando el tag buscado para mantener la app 100% funcional.

---

## 🎛️ Reglas de Negocio y Lógica

### 1. Reescalado de Niveles de la API de Supercell
La API de Supercell devuelve niveles inconsistentes por rareza. El tracker unifica internamente todos los niveles en la escala real **1-16** utilizando la siguiente fórmula:

$$\text{Nivel Real} = \text{api\_level} + \text{offset}$$

| Rareza | Offset | Ejemplo (API) | Nivel Real Mapeado |
| :--- | :---: | :---: | :---: |
| **Común** | **+0** | Cannon (lvl 15) | **15** |
| **Especial** | **+2** | Hog Rider (lvl 13) | **15** |
| **Épica** | **+5** | Guards (lvl 10) | **15** |
| **Legendaria**| **+8** | Lumberjack (lvl 7) | **15** |
| **Campeón** | **+10**| Golden Knight (lvl 6)| **16** |

### 2. Reglas del Constructor de Mazos (Slots 2026)
El mazo activo de 8 ranuras valida las reglas competitivas del meta actual:
* **Slot 1 (Evolución / Normal)**: Solo permite cartas convencionales o en su versión **Evolución**.
* **Slot 2 (Héroe / Campeón / Normal)**: Solo permite cartas normales, Campeones o versiones **Héroe** (ej. Lanzarrocas Héroe, Mosquetera Héroe).
* **Slot 3 (Híbrido)**: Permite Evoluciones, Héroes, Campeones o cartas normales.
* **Slots 4 al 8 (Convencionales)**: Solo permiten cartas normales (sin evoluciones, héroes ni campeones).

### 3. Recomendador de Prioridades
El sistema evalúa los recursos del jugador y los mazos guardados en favoritos, asignando puntuaciones según:
1. Número de veces que la carta es utilizada en tus mazos favoritos.
2. Si es una **Condición de Victoria (Win Condition)** clave.
3. Si es un **Hechizo Clave** (Fireball, The Log, etc.).
4. Si es usada en su versión **Evolucionada** o **Héroe**.
Sugiere las 4 cartas que el jugador posee a menor nivel que su objetivo y las ordena por su puntuación de importancia.

---

## 📂 Estructura de Archivos

* [index.html](file:///Users/anaferrergarcia/Desktop/CRPlaner/index.html): Maquetación de la SPA con navegación por pestañas (Colección vs Mazos).
* [index.css](file:///Users/anaferrergarcia/Desktop/CRPlaner/index.css): Hojas de estilo personalizadas con estética premium modo oscuro e iOS.
* [app.js](file:///Users/anaferrergarcia/Desktop/CRPlaner/app.js): Lógica de cálculo de costes, ordenación, filtrado y renderizado.
* [cards_db.js](file:///Users/anaferrergarcia/Desktop/CRPlaner/cards_db.js): Metadatos estáticos de las 121 cartas de Clash Royale (IDs oficiales, costes y URLs de imágenes).
* [api/player.js](file:///Users/anaferrergarcia/Desktop/CRPlaner/api/player.js): Endpoint proxy serverless de Vercel.
* [dev_server.py](file:///Users/anaferrergarcia/Desktop/CRPlaner/dev_server.py): Servidor de diagnóstico y desarrollo local en Python.
* [prioridades.md](file:///Users/anaferrergarcia/Desktop/CRPlaner/prioridades.md): Listado de nuevas funciones y backlog ordenado por prioridad.

---

## 🚀 Cómo Desarrollar y Probar Localmente

1. Clona el repositorio e introduce tu API Key:
   ```bash
   export CLASH_ROYALE_API_KEY="tu_token_de_supercell"
   python3 dev_server.py
   ```
2. Abre en tu navegador:
   [http://localhost:8000](http://localhost:8000)

3. Para comprobar errores de la API, la consola del terminal de `dev_server.py` imprimirá logs de diagnóstico en tiempo real sobre las llamadas HTTP y fallos de autorización IP (403).
