# **DOCUMENTO DE REQUISITOS DEL PRODUCTO (PRD)**

## **Clash Royale Deck & Progression Tracker (Meta 2026\)**

* **Estado:** Listo para Desarrollo  
* **Autor:** Analista de Producto Senior & Arquitecto de Soluciones  
* **Target:** Amigos y Testeo Inicial (Fase Alpha)  
* **Plataforma:** Aplicación Web Single Page (SPA)  
* **Hosting y Despliegue:** Vercel (Hobby Tier \- Gratuito)  
* **Persistencia:** Local (localStorage)

## **1\. RESUMEN EJECUTIVO**

Este documento define los requisitos para el desarrollo de una aplicación web móvil optimizada para *Clash Royale* (Meta 2026). La herramienta permite a los usuarios rastrear el nivel de sus colecciones y calcular la inversión necesaria en oro y copias físicas de cartas para subirlas a los niveles objetivo competitivos (Lvl 15 y Lvl 16), eliminando la dependencia de comodines de élite y centrándose en copias físicas reales.

El sistema cuenta con un constructor de mazos dinámico que integra las últimas lógicas del meta del juego, asegurando la correcta asignación de Evoluciones y Campeones de forma restrictiva según el slot correspondiente.

## **2\. OBJETIVOS DEL NEGOCIO**

* **Herramienta de Control Interno:** Facilitar a un grupo cerrado de amigos (y al propio desarrollador) un método visual y matemático de optimización de oro.  
* **Costo de Infraestructura Cero:** Diseñar una arquitectura serverless integrada en Vercel que no requiera servidores dedicados ni bases de datos de pago.  
* **Feedback Rápido (MVP):** Validar la experiencia de usuario y el motor de costes antes de una eventual apertura al público masivo.

## **3\. REQUISITOS FUNCIONALES**

### **Módulo A: Ingesta de Datos (Supercell API Sync)**

* **RF-A1 (Input de Tag de Jugador):**  
  * Campo de texto con autofoco para introducir el Player Tag.  
  * Formateador automático en tiempo real: añade el símbolo \# al inicio si falta y convierte todo el texto a mayúsculas de manera nativa.  
* **RF-A2 (Sincronización mediante Proxy Serverless):**  
  * Para evitar problemas de CORS y proteger la API Key de Supercell (que requiere IP fija), las solicitudes se realizan a través de una función serverless (/api/player?tag=...).  
  * Se mapean las propiedades clave de la API oficial: name, rarity, level (reescalado interno al sistema 1-16) y count (cartas actuales en inventario).  
* **RF-A3 (Persistencia Local de Perfil):**  
  * No hay base de datos. El perfil cargado y las colecciones se guardan en el localStorage del navegador bajo la clave cr\_player\_data. Cada vez que el usuario regresa, se carga su último perfil de forma pasiva.

### **Módulo B: Visualizador de Colección e Inversión Individual**

* **RF-B1 (Grid y Filtros Táctiles):**  
  * Cuadrícula densa adaptada para móviles.  
  * Filtros rápidos interactivos tipo chips: *Común, Especial, Épica, Legendaria, Campeón*.  
  * Filtro secundario interactivo para aislar únicamente las cartas que disponen de estado "Evolucionado".  
* **RF-B2 (Tarjeta de Carta e Identidad Visual):**  
  * Cada tarjeta representa de forma intuitiva su rareza según el código de color y muestra el nivel actual e inventario.  
* **RF-B3 (Selector de Nivel Objetivo):**  
  * Controles sencillos en cada tarjeta para alternar entre dos niveles objetivo: **Nivel 15** y **Nivel 16**.  
* **RF-B4 (Algoritmo de Cálculo de Costes):**  
  * Se ejecutan los siguientes cálculos reactivos por carta basándose en la tabla de costes internos:  
    * ![][image1]  
    * ![][image2]  
* **RF-B5 (Estado de Disponibilidad de Copias):**  
  * Si las cartas acumuladas son suficientes para realizar las subidas de nivel pero falta oro, se muestra un indicador visual con un check verde (✓) y la leyenda: *"Copias Listas \- Falta Oro"*.

### **Módulo C: Gestor de Mazos Favoritos y Coste Agrupado**

* **RF-C1 (Constructor de 8 Slots con Tap):**  
  * Sin drag-and-drop. Al pulsar un slot vacío del mazo, se levanta una ventana inferior modal (*bottom sheet*) que permite filtrar y seleccionar la carta deseada con una sola pulsación.  
* **RF-C2 (Reglas de Ranura para el Meta 2026):**  
  * La cuadrícula de 8 espacios se valida de acuerdo con las siguientes reglas restrictivas:

| Slot | Restricción / Tipo de Carta | Comportamiento del Filtro / Regla de Negocio |
| :---- | :---- | :---- |
| **Slot 1** | **Evolución Obligatoria** | Filtra automáticamente la colección. Solo permite seleccionar una carta en su variante Evolucionada. |
| **Slot 2** | **Héroe / Campeón Obligatorio** | Solo muestra cartas de rareza "Campeón". |
| **Slot 3** | **Slot Híbrido** | Permite introducir indistintamente una segunda Evolución **o** un segundo Campeón en el mazo. |
| **Slot 4 al 8** | **Slots Estándar** | Solo admite cartas convencionales (no Campeones, no variantes evolucionadas). |

* **RF-C3 (Consolidador de Coste del Mazo):**  
  * Panel resumen que calcula dinámicamente:  
    1. **Oro Total Agrupado:** La suma matemática exacta del oro necesario para subir las 8 cartas seleccionadas al nivel objetivo global del mazo.  
    2. **Desglose de Materiales:** Totalizador de cartas faltantes clasificadas y agrupadas visualmente por tipo de rareza.  
* **RF-C4 (Guardado de Mazos Nombrados):**  
  * Opción para nombrar el mazo activo y guardarlo localmente bajo la clave cr\_saved\_decks en localStorage.

## **4\. REQUISITOS NO FUNCIONALES**

* **RNF-1 (Diseño Mobile-First Estricto):**  
  * La interfaz está optimizada y adaptada específicamente para pantallas de entre 360px y 430px de ancho. Se prohíbe el desbordamiento horizontal y se prioriza el scroll vertical optimizado (-webkit-overflow-scrolling: touch).  
* **RNF-2 (Uso de CSS/Tailwind Consistente):**  
  * Fondo Oscuro Base: \#020617 / \#0b0f1a (Tailwind: bg-slate-950).  
  * Tarjetas: \#1e293b con opacidad del 80% y efecto backdrop-blur.  
  * Bordes: \#334155 (Tailwind: border-slate-700).  
  * Acento Elixir / Progreso: \#db2777 (Tailwind: text-pink-600 o bg-pink-600).  
  * Acento de Oro: \#fbbf24 (Tailwind: text-amber-400 o bg-amber-400).  
* **RNF-3 (Cero Exposición de API Keys):**  
  * La clave oficial de Supercell nunca se envía en las llamadas de lado del cliente; reside exclusivamente como variable de entorno oculta en Vercel (process.env.CLASH\_ROYALE\_API\_KEY).

## **5\. PALETA DE COLORES DE RAREZA (CSS/TAILWIND)**

Para los contenedores y textos de las cartas se utilizará el siguiente mapeo:

/\* Paleta de rarezas de Clash Royale \*/  
.rarity-common { color: \#3b82f6; border-color: \#3b82f6; }       /\* Azul Brillante \*/  
.rarity-rare { color: \#f97316; border-color: \#f97316; }         /\* Naranja Fuego \*/  
.rarity-epic { color: \#ec4899; border-color: \#ec4899; }         /\* Rosa / Magenta \*/  
.rarity-legendary { color: \#a855f7; border-color: \#a855f7; }    /\* Morado Mágico \*/  
.rarity-champion { color: \#f59e0b; border-color: \#f59e0b; }     /\* Dorado Corona \*/

## **6\. TABLA DE COSTES DE PROGRESIÓN (META 2026\)**

Diccionario estático de cálculo integrado en el frontend para procesar diferencias de nivel:

{  
  "costs": {  
    "Común": {  
      "2":{"c":2,"g":5},"3":{"c":4,"g":20},"4":{"c":10,"g":50},"5":{"c":20,"g":150},"6":{"c":50,"g":400},"7":{"c":100,"g":1000},"8":{"c":200,"g":2000},"9":{"c":400,"g":4000},"10":{"c":800,"g":8000},"11":{"c":1000,"g":15000},"12":{"c":1500,"g":25000},"13":{"c":3000,"g":40000},"14":{"c":5000,"g":60000},"15":{"c":5500,"g":90000},"16":{"c":7500,"g":120000}  
    },  
    "Especial": {  
      "4":{"c":2,"g":50},"5":{"c":4,"g":150},"6":{"c":10,"g":400},"7":{"c":20,"g":1000},"8":{"c":50,"g":2000},"9":{"c":100,"g":4000},"10":{"c":200,"g":8000},"11":{"c":400,"g":15000},"12":{"c":500,"g":25000},"13":{"c":750,"g":40000},"14":{"c":750,"g":60000},"15":{"c":1000,"g":90000},"16":{"c":1400,"g":120000}  
    },  
    "Épica": {  
      "7":{"c":2,"g":400},"8":{"c":4,"g":2000},"9":{"c":10,"g":4000},"10":{"c":20,"g":8000},"11":{"c":40,"g":15000},"12":{"c":50,"g":25000},"13":{"c":100,"g":40000},"14":{"c":100,"g":60000},"15":{"c":130,"g":90000},"16":{"c":180,"g":120000}  
    },  
    "Legendaria": {  
      "10":{"c":2,"g":5000},"11":{"c":4,"g":15000},"12":{"c":6,"g":25000},"13":{"c":9,"g":40000},"14":{"c":12,"g":60000},"15":{"c":14,"g":90000},"16":{"c":20,"g":120000}  
    },  
    "Campeón": {  
      "12":{"c":2,"g":25000},"13":{"c":8,"g":40000},"14":{"c":10,"g":60000},"15":{"c":11,"g":90000},"16":{"c":15,"g":120000}  
    }  
  }  
}

## **7\. FASES DE DESARROLLO**

FASE 1: API Proxy Serverless (Vercel Node.js Function)  
  ├── Configurar endpoint '/api/player.js' para evadir restricciones de CORS.  
  └── Encriptación segura de la API key de Supercell.

FASE 2: Estructura Base y UI Tailwind CSS  
  ├── Diseñar la interfaz móvil simulando la estética de Clash Royale.  
  └── Integrar la paleta de colores de fondos, bordes y rarezas.

FASE 3: Motor de Cálculos Reactivo (Logic Engine)  
  ├── Importar el diccionario estático de costes.  
  └── Implementar funciones de cálculo dinámico para niveles objetivo (15 y 16).

FASE 4: Algoritmos de Selección y Validadores de Mazo (Meta 2026\)  
  ├── Crear panel deslizable modal inferior para la adición rápida de cartas por pulsación.  
  └── Codificar los validadores lógicos de las 8 ranuras (Evolución, Campeón, Slot Híbrido, Comunes).

FASE 5: Almacenamiento Local, Ajustes Finales y Lanzamiento Alpha  
  ├── Guardar estados, perfil cargado y mazos en localStorage.  
  └── Deploy a producción en Vercel y realizar pruebas con el grupo de amigos.  


[image1]: <data:image/png;base64,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>

[image2]: <data:image/png;base64,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>