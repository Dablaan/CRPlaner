# **📊 Base de Datos de Progresión de Clash Royale (Meta Abril 2026\)**

Este documento contiene las constantes técnicas del sistema de progresión de Clash Royale, actualizado tras la reestructuración de la economía del juego que eliminó las cartas comodines de élite (EWC) en favor de copias físicas y oro estandarizado.

## **🔑 1\. Niveles Iniciales por Rareza**

Cada rareza tiene un nivel base predeterminado al ser desbloqueada en el juego:

* **Común:** Nivel 1  
* **Especial (Rara):** Nivel 3  
* **Épica:** Nivel 6  
* **Legendaria:** Nivel 9  
* **Campeón:** Nivel 11

## **📈 2\. Tablas Maestras de Mejora (Cartas y Oro)**

### **⚪ Cartas Comunes**

| Salto de Nivel | Cartas Necesarias | Coste de Oro |
| :---- | :---- | :---- |
| **1 → 2** | 2 | 5 |
| **2 → 3** | 4 | 20 |
| **3 → 4** | 10 | 50 |
| **4 → 5** | 20 | 150 |
| **5 → 6** | 50 | 400 |
| **6 → 7** | 100 | 1,000 |
| **7 → 8** | 200 | 2,000 |
| **8 → 9** | 400 | 4,000 |
| **9 → 10** | 800 | 8,000 |
| **10 → 11** | 1,000 | 15,000 |
| **11 → 12** | 1,500 | 25,000 |
| **12 → 13** | 3,000 | 40,000 |
| **13 → 14** | 5,000 | 60,000 |
| **14 → 15** | 5,500 | 90,000 |
| **15 → 16** | 7,500 | 120,000 |

### **🟠 Cartas Especiales (Raras)**

| Salto de Nivel | Cartas Necesarias | Coste de Oro |
| :---- | :---- | :---- |
| **3 → 4** | 2 | 50 |
| **4 → 5** | 4 | 150 |
| **5 → 6** | 10 | 400 |
| **6 → 7** | 20 | 1,000 |
| **7 → 8** | 50 | 2,000 |
| **8 → 9** | 100 | 4,000 |
| **9 → 10** | 200 | 8,000 |
| **10 → 11** | 400 | 15,000 |
| **11 → 12** | 500 | 25,000 |
| **12 → 13** | 750 | 40,000 |
| **13 → 14** | 750 | 60,000 |
| **14 → 15** | 1,000 | 90,000 |
| **15 → 16** | 1,400 | 120,000 |

### **🔮 Cartas Épicas**

| Salto de Nivel | Cartas Necesarias | Coste de Oro |
| :---- | :---- | :---- |
| **6 → 7** | 2 | 400 |
| **7 → 8** | 4 | 2,000 |
| **8 → 9** | 10 | 4,000 |
| **9 → 10** | 20 | 8,000 |
| **10 → 11** | 40 | 15,000 |
| **11 → 12** | 50 | 25,000 |
| **12 → 13** | 100 | 40,000 |
| **13 → 14** | 100 | 60,000 |
| **14 → 15** | 130 | 90,000 |
| **15 → 16** | 180 | 120,000 |

### **💎 Cartas Legendarias**

| Salto de Nivel | Cartas Necesarias | Coste de Oro |
| :---- | :---- | :---- |
| **9 → 10** | 2 | 5,000 |
| **10 → 11** | 4 | 15,000 |
| **11 → 12** | 6 | 25,000 |
| **12 → 13** | 9 | 40,000 |
| **13 → 14** | 12 | 60,000 |
| **14 → 15** | 14 | 90,000 |
| **15 → 16** | 20 | 120,000 |

### **🏆 Cartas de Campeón**

| Salto de Nivel | Cartas Necesarias | Coste de Oro |
| :---- | :---- | :---- |
| **11 → 12** | 2 | 25,000 |
| **12 → 13** | 8 | 40,000 |
| **13 → 14** | 10 | 60,000 |
| **14 → 15** | 11 | 90,000 |
| **15 → 16** | 15 | 120,000 |

## **⚡ 3\. Sistema de Evoluciones**

* **Fragmentos Totales:** Todas las cartas que poseen evolución activa requieren de manera uniforme **6 fragmentos** para completarse.  
* **Comodines de Evolución:** Se pueden aplicar a cualquier carta con evolución para sustituir un fragmento específico.

## **⚙️ 4\. Formato JSON de Base de Datos para Desarrollo**

Puedes guardar esta estructura directamente en un archivo .json o como una variable/diccionario en tu entorno de desarrollo para realizar bucles lógicos de coste acumulado.

{  
  "costs": {  
    "Común": {  
      "2":  {"cards": 2,    "gold": 5},  
      "3":  {"cards": 4,    "gold": 20},  
      "4":  {"cards": 10,   "gold": 50},  
      "5":  {"cards": 20,   "gold": 150},  
      "6":  {"cards": 50,   "gold": 400},  
      "7":  {"cards": 100,  "gold": 1000},  
      "8":  {"cards": 200,  "gold": 2000},  
      "9":  {"cards": 400,  "gold": 4000},  
      "10": {"cards": 800,  "gold": 8000},  
      "11": {"cards": 1000, "gold": 15000},  
      "12": {"cards": 1500, "gold": 25000},  
      "13": {"cards": 3000, "gold": 40000},  
      "14": {"cards": 5000, "gold": 60000},  
      "15": {"cards": 5500, "gold": 90000},  
      "16": {"cards": 7500, "gold": 120000}  
    },  
    "Especial": {  
      "4":  {"cards": 2,    "gold": 50},  
      "5":  {"cards": 4,    "gold": 150},  
      "6":  {"cards": 10,   "gold": 400},  
      "7":  {"cards": 20,   "gold": 1000},  
      "8":  {"cards": 50,   "gold": 2000},  
      "9":  {"cards": 100,  "gold": 4000},  
      "10": {"cards": 200,  "gold": 8000},  
      "11": {"cards": 400,  "gold": 15000},  
      "12": {"cards": 500,  "gold": 25000},  
      "13": {"cards": 750,  "gold": 40000},  
      "14": {"cards": 750,  "gold": 60000},  
      "15": {"cards": 1000, "gold": 90000},  
      "16": {"cards": 1400, "gold": 120000}  
    },  
    "Épica": {  
      "7":  {"cards": 2,    "gold": 400},  
      "8":  {"cards": 4,    "gold": 2000},  
      "9":  {"cards": 10,   "gold": 4000},  
      "10": {"cards": 20,   "gold": 8000},  
      "11": {"cards": 40,   "gold": 15000},  
      "12": {"cards": 50,   "gold": 25000},  
      "13": {"cards": 100,  "gold": 40000},  
      "14": {"cards": 100,  "gold": 60000},  
      "15": {"cards": 130,  "gold": 90000},  
      "16": {"cards": 180,  "gold": 120000}  
    },  
    "Legendaria": {  
      "10": {"cards": 2,    "gold": 5000},  
      "11": {"cards": 4,    "gold": 15000},  
      "12": {"cards": 6,    "gold": 25000},  
      "13": {"cards": 9,    "gold": 40000},  
      "14": {"cards": 12,   "gold": 60000},  
      "15": {"cards": 14,   "gold": 90000},  
      "16": {"cards": 20,   "gold": 120000}  
    },  
    "Campeón": {  
      "12": {"cards": 2,    "gold": 25000},  
      "13": {"cards": 8,    "gold": 40000},  
      "14": {"cards": 10,   "gold": 60000},  
      "15": {"cards": 11,   "gold": 90000},  
      "16": {"cards": 15,   "gold": 120000}  
    }  
  }  
}  
