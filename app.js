// app.js - Clash Royale Deck & Progression Tracker (Meta 2026)

// ----------------------------------------------------
// CONSTANTES Y TABLAS DE COSTES
// ----------------------------------------------------
const CR_COSTS = {
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
};

// Clasificación de cartas para recomendador inteligente e importador
const WIN_CONDITIONS = [
  "Hog Rider", "Giant", "Balloon", "Goblin Barrel", "Golem", "Sparky", "X-Bow", 
  "Royal Giant", "Graveyard", "Miner", "Electro Giant", "Ram Rider", "Goblin Giant", 
  "Battle Ram", "Wall Breakers", "Lava Hound", "Three Musketeers", "Royal Hogs", "Elixir Golem"
];

const KEY_SPELLS = [
  "Fireball", "Rocket", "Lightning", "Poison", "The Log", "Tornado", "Zap", 
  "Arrows", "Giant Snowball", "Rage", "Freeze", "Earthquake"
];

// Cartas que disponen de versión Héroe en Clash Royale (independiente de la rareza Campeón)
const HERO_CARDS = [
  "Musketeer", "Bowler", "Knight", "Mini P.E.K.K.A", "Giant", "Ice Golem", 
  "Balloon", "Barbarian Barrel", "Goblins", "Mega Minion", "Wizard", "Magic Archer", "Dark Prince"
];

// ----------------------------------------------------
// ESTADO GLOBAL DE LA APLICACIÓN
// ----------------------------------------------------
let appState = {
  playerData: null,          // Datos cargados del jugador
  collection: [],            // Colección de cartas unificada y reescalada
  savedDecks: [],            // Mazos favoritos guardados en localStorage
  activeDeck: Array(8).fill(null), // Mazo actual en edición (8 slots)
  activeDeckName: "",        // Nombre del mazo activo
  targetLevels: {},          // Niveles objetivo por cardId (15 o 16, default 15)
  filters: {
    rarity: "all",           // Filtro de rareza
    onlyEvo: false,          // Filtro de sólo evolucionadas
    search: ""               // Búsqueda por texto
  },
  collectionSortBy: "name-asc",   // Criterio de orden en Colección
  bottomSheetSortBy: "name-asc",  // Criterio de orden en Bottom Sheet
  bottomSheetSearch: "",          // Búsqueda por texto en Bottom Sheet
  deckBuilderActiveSlot: null, // Índice del slot del mazo que se está editando (0-7)
  bottomSheetActiveTab: "normal", // Filtro de pestaña activa en bottom sheet: 'evo', 'hero', 'champion', 'normal'
  activeSection: "collection" // Sección activa de la aplicación: 'collection' o 'decks'
};

// ----------------------------------------------------
// TRADUCTOR Y AUXILIARES DE RAREZAS
// ----------------------------------------------------
function translateRarity(rarity) {
  switch (rarity?.toLowerCase()) {
    case 'common': return 'Común';
    case 'rare': return 'Especial';
    case 'epic': return 'Épica';
    case 'legendary': return 'Legendaria';
    case 'champion': return 'Campeón';
    default: return rarity || 'Común';
  }
}

function getLevelOffset(rarity) {
  switch (rarity?.toLowerCase()) {
    case 'common': return 0;
    case 'rare': return 2;
    case 'epic': return 5;
    case 'legendary': return 8;
    case 'champion': return 10;
    default: return 0;
  }
}

function getBaseLevel(rarity) {
  switch (rarity?.toLowerCase()) {
    case 'common': return 1;
    case 'rare': return 3;
    case 'epic': return 6;
    case 'legendary': return 9;
    case 'champion': return 11;
    default: return 1;
  }
}

// ----------------------------------------------------
// ORDENACIÓN DE CARTAS (ALFABÉTICO, NIVEL, RAREZA, ELIXIR)
// ----------------------------------------------------
function sortCardsList(cards, criteria) {
  const rarityValues = {
    "common": 1,
    "rare": 2,
    "epic": 3,
    "legendary": 4,
    "champion": 5
  };

  return cards.sort((a, b) => {
    switch (criteria) {
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'level-desc':
        if ((b.currentLevel || 1) !== (a.currentLevel || 1)) {
          return (b.currentLevel || 1) - (a.currentLevel || 1);
        }
        return a.name.localeCompare(b.name);
      case 'level-asc':
        if ((a.currentLevel || 1) !== (b.currentLevel || 1)) {
          return (a.currentLevel || 1) - (b.currentLevel || 1);
        }
        return a.name.localeCompare(b.name);
      case 'rarity-desc':
        const rValA = rarityValues[a.rarity?.toLowerCase()] || 0;
        const rValB = rarityValues[b.rarity?.toLowerCase()] || 0;
        if (rValB !== rValA) {
          return rValB - rValA;
        }
        return a.name.localeCompare(b.name);
      case 'rarity-asc':
        const rValA2 = rarityValues[a.rarity?.toLowerCase()] || 0;
        const rValB2 = rarityValues[b.rarity?.toLowerCase()] || 0;
        if (rValA2 !== rValB2) {
          return rValA2 - rValB2;
        }
        return a.name.localeCompare(b.name);
      case 'elixir-desc':
        if ((b.elixirCost || 0) !== (a.elixirCost || 0)) {
          return (b.elixirCost || 0) - (a.elixirCost || 0);
        }
        return a.name.localeCompare(b.name);
      case 'elixir-asc':
        if ((a.elixirCost || 0) !== (b.elixirCost || 0)) {
          return (a.elixirCost || 0) - (b.elixirCost || 0);
        }
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });
}

// ----------------------------------------------------
// ALGORITMOS DE CÁLCULO DE COSTES
// ----------------------------------------------------
function calculateUpgradeCost(rarityName, currentLvl, targetLvl, currentCount) {
  if (currentLvl >= targetLvl) {
    return { goldNeeded: 0, cardsNeeded: 0, isReady: false };
  }

  let goldTotal = 0;
  let cardsMissingTotal = 0;
  let tempCount = currentCount;

  for (let l = currentLvl; l < targetLvl; l++) {
    const nextL = l + 1;
    const step = CR_COSTS[rarityName] ? CR_COSTS[rarityName][String(nextL)] : null;
    if (!step) continue;

    const reqCards = step.c;
    const reqGold = step.g;

    goldTotal += reqGold;

    if (tempCount >= reqCards) {
      tempCount -= reqCards;
    } else {
      const diff = reqCards - tempCount;
      cardsMissingTotal += diff;
      tempCount = 0;
    }
  }

  const isReady = (cardsMissingTotal === 0);
  return { 
    goldNeeded: goldTotal, 
    cardsNeeded: cardsMissingTotal, 
    isReady: isReady 
  };
}

// ----------------------------------------------------
// MOTOR DE INGESTACIÓN Y INICIALIZACIÓN
// ----------------------------------------------------
function initApp() {
  loadFromLocalStorage();
  buildCollection();
  setupEventListeners();
  renderCollection();
  renderActiveDeck();
  renderSavedDecks();
  updateRecommendations();
  switchSection(appState.activeSection);
}

function buildCollection() {
  const playerCardsMap = {};
  if (appState.playerData && appState.playerData.cards) {
    appState.playerData.cards.forEach(c => {
      playerCardsMap[c.id] = c;
    });
  }

  appState.collection = CARDS_DB.map(staticCard => {
    const playerCard = playerCardsMap[staticCard.id];
    
    let apiLevel = playerCard ? playerCard.level : 1;
    let offset = getLevelOffset(staticCard.rarity);
    let currentLevel = playerCard ? (apiLevel + offset) : getBaseLevel(staticCard.rarity);
    let count = playerCard ? playerCard.count : 0;

    if (!appState.targetLevels[staticCard.id]) {
      appState.targetLevels[staticCard.id] = 15;
    }

    return {
      ...staticCard,
      currentLevel: currentLevel,
      count: count,
      isPlayerOwned: !!playerCard,
      evolutionLevel: playerCard ? (playerCard.evolutionLevel || 0) : 0,
      starLevel: playerCard ? (playerCard.starLevel || 0) : 0
    };
  });
}

// ----------------------------------------------------
// PERSISTENCIA LOCAL (LOCAL STORAGE)
// ----------------------------------------------------
function saveToLocalStorage() {
  localStorage.setItem('cr_target_levels', JSON.stringify(appState.targetLevels));
  localStorage.setItem('cr_saved_decks', JSON.stringify(appState.savedDecks));
  if (appState.playerData) {
    localStorage.setItem('cr_player_data', JSON.stringify(appState.playerData));
  }
}

function loadFromLocalStorage() {
  const targetLevelsRaw = localStorage.getItem('cr_target_levels');
  if (targetLevelsRaw) appState.targetLevels = JSON.parse(targetLevelsRaw);

  const savedDecksRaw = localStorage.getItem('cr_saved_decks');
  if (savedDecksRaw) appState.savedDecks = JSON.parse(savedDecksRaw);

  const playerDataRaw = localStorage.getItem('cr_player_data');
  if (playerDataRaw) {
    appState.playerData = JSON.parse(playerDataRaw);
    document.getElementById('player-profile-panel').classList.remove('hidden');
    document.getElementById('player-name').innerText = appState.playerData.name;
    document.getElementById('player-tag-display').innerText = appState.playerData.tag;
    document.getElementById('player-trophies').innerText = appState.playerData.trophies;
    document.getElementById('player-arena').innerText = appState.playerData.arena ? appState.playerData.arena.name : '';
  }
}

// ----------------------------------------------------
// TABS NAVIGATION (COLECCIÓN VS MAZOS)
// ----------------------------------------------------
function switchSection(section) {
  appState.activeSection = section;
  
  const colBtn = document.getElementById('nav-btn-collection');
  const decBtn = document.getElementById('nav-btn-decks');
  const colView = document.getElementById('view-collection');
  const decView = document.getElementById('view-decks');

  if (section === 'collection') {
    colBtn.className = "flex-1 py-2.5 text-xs md:text-sm font-black rounded-xl transition text-center bg-pink-600 text-white shadow-md";
    decBtn.className = "flex-1 py-2.5 text-xs md:text-sm font-black rounded-xl transition text-center text-slate-400 hover:text-slate-200";
    
    colView.classList.remove('hidden');
    colView.classList.add('flex');
    decView.classList.add('hidden');
    decView.classList.remove('flex-col');
  } else {
    decBtn.className = "flex-1 py-2.5 text-xs md:text-sm font-black rounded-xl transition text-center bg-pink-600 text-white shadow-md";
    colBtn.className = "flex-1 py-2.5 text-xs md:text-sm font-black rounded-xl transition text-center text-slate-400 hover:text-slate-200";
    
    decView.classList.remove('hidden');
    decView.classList.add('flex-col');
    colView.classList.add('hidden');
    colView.classList.remove('flex');
    
    renderActiveDeck();
    updateRecommendations();
    renderSavedDecks();
  }
}

// ----------------------------------------------------
// MANEJADORES DE LA INTERFAZ DE USUARIO (UI)
// ----------------------------------------------------
function setupEventListeners() {
  document.getElementById('nav-btn-collection').addEventListener('click', () => switchSection('collection'));
  document.getElementById('nav-btn-decks').addEventListener('click', () => switchSection('decks'));

  const tagInput = document.getElementById('player-tag-input');
  tagInput.addEventListener('input', (e) => {
    let val = e.target.value.toUpperCase();
    if (val && !val.startsWith('#')) {
      val = '#' + val;
    }
    val = '#' + val.substring(1).replace(/[^A-Z0-9]/g, '');
    e.target.value = val;
  });

  const syncBtn = document.getElementById('btn-sync-player');
  syncBtn.addEventListener('click', () => {
    const tag = tagInput.value.trim();
    if (!tag || tag === '#') {
      alert('Por favor introduce un tag de jugador válido (ej: #G2LPQ0YV)');
      return;
    }
    fetchPlayerData(tag);
  });

  const chips = document.querySelectorAll('.filter-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      appState.filters.rarity = chip.dataset.rarity;
      renderCollection();
    });
  });

  const evoToggle = document.getElementById('filter-evo-toggle');
  evoToggle.addEventListener('change', (e) => {
    appState.filters.onlyEvo = e.target.checked;
    renderCollection();
  });

  const searchInput = document.getElementById('card-search-input');
  searchInput.addEventListener('input', (e) => {
    appState.filters.search = e.target.value.toLowerCase().trim();
    renderCollection();
  });

  document.getElementById('close-bottom-sheet').addEventListener('click', closeBottomSheet);
  document.getElementById('bottom-sheet-overlay').addEventListener('click', closeBottomSheet);
  document.getElementById('btn-save-deck').addEventListener('click', saveActiveDeck);

  document.getElementById('deck-name-input').addEventListener('input', (e) => {
    appState.activeDeckName = e.target.value;
  });

  document.getElementById('btn-export-deck').addEventListener('click', exportActiveDeck);

  // Ordenamiento de la Colección
  const collectionSort = document.getElementById('collection-sort-by');
  if (collectionSort) {
    collectionSort.addEventListener('change', (e) => {
      appState.collectionSortBy = e.target.value;
      renderCollection();
    });
  }

  // Búsqueda en el Bottom Sheet
  const bottomSheetSearchInput = document.getElementById('bottom-sheet-search');
  if (bottomSheetSearchInput) {
    bottomSheetSearchInput.addEventListener('input', (e) => {
      appState.bottomSheetSearch = e.target.value.toLowerCase().trim();
      renderBottomSheetCards();
    });
  }

  // Ordenamiento en el Bottom Sheet
  const bottomSheetSort = document.getElementById('bottom-sheet-sort-by');
  if (bottomSheetSort) {
    bottomSheetSort.addEventListener('change', (e) => {
      appState.bottomSheetSortBy = e.target.value;
      renderBottomSheetCards();
    });
  }
}

// ----------------------------------------------------
// SINCRONIZACIÓN CON LA API
// ----------------------------------------------------
async function fetchPlayerData(tag) {
  const syncBtn = document.getElementById('btn-sync-player');
  const spinner = document.getElementById('sync-spinner');
  
  syncBtn.disabled = true;
  spinner.classList.remove('hidden');

  try {
    let apiUrl = '/api/player?tag=' + encodeURIComponent(tag);
    if (window.location.protocol === 'file:') {
      apiUrl = 'http://localhost:8000/api/player?tag=' + encodeURIComponent(tag);
    }

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.error || 'Error al conectar con el servidor.');
    }

    appState.playerData = data;
    saveToLocalStorage();
    buildCollection();
    
    document.getElementById('player-profile-panel').classList.remove('hidden');
    document.getElementById('player-name').innerText = data.name;
    document.getElementById('player-tag-display').innerText = data.tag;
    document.getElementById('player-trophies').innerText = data.trophies;
    document.getElementById('player-arena').innerText = data.arena ? data.arena.name : 'Arena Desconocida';

    renderCollection();
    updateRecommendations();
    
    alert(`Sincronización exitosa: ¡Hola, ${data.name}!`);
  } catch (error) {
    console.error(error);
    alert('Error de Sincronización: ' + error.message + '\n(Asegúrate de que el servidor dev_server.py esté encendido si estás probando localmente).');
  } finally {
    syncBtn.disabled = false;
    spinner.classList.add('hidden');
  }
}

// ----------------------------------------------------
// RENDERS DE SECCIONES DE LA INTERFAZ
// ----------------------------------------------------

// 1. Render de la colección de cartas (Grid principal)
function renderCollection() {
  const grid = document.getElementById('collection-grid');
  grid.innerHTML = '';

  const filteredCards = appState.collection.filter(card => {
    if (appState.filters.search && !card.name.toLowerCase().includes(appState.filters.search)) {
      return false;
    }
    if (appState.filters.rarity !== 'all') {
      const spanishRarity = translateRarity(card.rarity);
      if (appState.filters.rarity === 'common' && spanishRarity !== 'Común') return false;
      if (appState.filters.rarity === 'rare' && spanishRarity !== 'Especial') return false;
      if (appState.filters.rarity === 'epic' && spanishRarity !== 'Épica') return false;
      if (appState.filters.rarity === 'legendary' && spanishRarity !== 'Legendaria') return false;
      if (appState.filters.rarity === 'champion' && spanishRarity !== 'Campeón') return false;
    }
    if (appState.filters.onlyEvo && !card.evolutionIconUrl) {
      return false;
    }
    return true;
  });

  sortCardsList(filteredCards, appState.collectionSortBy);

  if (filteredCards.length === 0) {
    grid.innerHTML = `<div class="col-span-full text-center text-slate-400 py-8">No se encontraron cartas con los filtros actuales.</div>`;
    return;
  }

  filteredCards.forEach(card => {
    const spanishRarity = translateRarity(card.rarity);
    const targetLvl = appState.targetLevels[card.id] || 15;
    const costs = calculateUpgradeCost(spanishRarity, card.currentLevel, targetLvl, card.count);
    
    const cardEl = document.createElement('div');
    cardEl.id = `card-node-${card.id}`;
    cardEl.className = `card-grid-item p-4 glass-panel rounded-3xl flex flex-col justify-between relative overflow-hidden rarity-${card.rarity.toLowerCase()}`;
    
    // Insignias dinámicas de la tarjeta (Evolución o Héroe)
    let badgesHTML = '';
    
    if (costs.isReady) {
      badgesHTML += `
        <div class="absolute top-2 right-2 copies-ready-badge text-[10px] px-2 py-0.5 rounded-full text-white font-bold flex items-center gap-0.5 z-10 shadow-md">
          <span>✓</span> <span>Listo</span>
        </div>`;
    } else {
      let innerBadges = '';
      // Mostrar indicador de evolución sólo si la carta está realmente evolucionada por el jugador
      const hasEvoUnlocked = card.evolutionIconUrl && card.evolutionLevel > 0 && !HERO_CARDS.includes(card.name);
      if (hasEvoUnlocked) {
        innerBadges += `<span class="evo-badge text-[8px] px-1.5 py-0.5 rounded-md text-white font-extrabold shadow-md">🌸 EVO</span>`;
      }
      
      // Mostrar indicador de Héroe sólo si el jugador posee desbloqueada la versión Héroe
      const hasHeroUnlocked = (HERO_CARDS.includes(card.name) || card.heroIconUrl) && card.evolutionLevel > 0;
      if (hasHeroUnlocked) {
        innerBadges += `<span class="bg-emerald-600 text-[8px] px-1.5 py-0.5 rounded-md text-white font-extrabold shadow-md border border-emerald-500">⚡ HÉROE</span>`;
      }
      
      if (innerBadges) {
        badgesHTML = `<div class="absolute top-2 right-2 flex gap-1 z-10">${innerBadges}</div>`;
      }
    }

    let cardIconUrl = card.iconUrl;
    // Si tiene la evolución desbloqueada, mostrar imagen evolucionada en la colección
    if (card.evolutionLevel > 0 && !HERO_CARDS.includes(card.name) && card.evolutionIconUrl) {
      cardIconUrl = card.evolutionIconUrl;
    } else if (card.evolutionLevel > 0 && HERO_CARDS.includes(card.name) && card.heroIconUrl) {
      // Si tiene héroe desbloqueado, mostrar imagen de héroe en la colección
      cardIconUrl = card.heroIconUrl;
    }

    // Diseñar tarjeta centrada con IMAGEN GRANDE (más protagonismo)
    cardEl.innerHTML = `
      ${badgesHTML}
      <div class="flex flex-col items-center gap-3 text-center">
        <!-- Imagen más grande y destacada en el centro -->
        <div class="relative w-24 h-28 flex items-center justify-center bg-slate-950/40 rounded-2xl border border-slate-800/50 p-1.5 shadow-inner">
          <img class="w-full h-full object-contain rounded-xl drop-shadow-lg transition-transform duration-300 hover:scale-105" src="${cardIconUrl}" alt="${card.name}" onerror="this.src='https://placehold.co/100x120/1e293b/ffffff?text=${card.name}'">
        </div>
        <div class="w-full min-w-0">
          <h4 class="text-sm font-extrabold truncate text-slate-100">${card.name}</h4>
          <p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">${spanishRarity}</p>
          <div class="flex items-center justify-center gap-1.5 mt-1.5">
            <span class="text-xs bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800 font-black text-slate-300">
              Nivel ${card.currentLevel}
            </span>
            <span class="text-[11px] text-slate-500 font-bold">
              (${card.count} cps)
            </span>
          </div>
        </div>
      </div>

      <div class="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <span class="text-xs text-slate-400 font-bold">Objetivo:</span>
        <div class="flex bg-slate-950 p-0.5 rounded-xl border border-slate-800">
          <button class="target-lvl-btn px-2.5 py-0.5 rounded-lg text-xs font-black transition ${targetLvl === 15 ? 'bg-pink-600 text-white' : 'text-slate-555'}" onclick="setTargetLevel(${card.id}, 15)">15</button>
          <button class="target-lvl-btn px-2.5 py-0.5 rounded-lg text-xs font-black transition ${targetLvl === 16 ? 'bg-pink-600 text-white' : 'text-slate-555'}" onclick="setTargetLevel(${card.id}, 16)">16</button>
        </div>
      </div>

      <div class="mt-3.5 text-xs space-y-1.5">
        <div class="flex justify-between items-center bg-slate-950/60 p-1.5 rounded-lg px-2.5 border border-slate-850">
          <span class="text-slate-400 flex items-center gap-1 font-semibold">
             <span>🪙</span> Oro
          </span>
          <span class="font-extrabold text-amber-300">${costs.goldNeeded.toLocaleString()}</span>
        </div>
        <div class="flex justify-between items-center bg-slate-950/60 p-1.5 rounded-lg px-2.5 border border-slate-850">
          <span class="text-slate-400 flex items-center gap-1 font-semibold">
             <span>🎴</span> Faltan
          </span>
          <span class="font-extrabold ${costs.cardsNeeded > 0 ? 'text-red-400' : 'text-emerald-400'}">
            ${costs.cardsNeeded > 0 ? costs.cardsNeeded.toLocaleString() : '¡Listas!'}
          </span>
        </div>
      </div>
    `;

    grid.appendChild(cardEl);
  });
}

window.setTargetLevel = function(cardId, newLvl) {
  appState.targetLevels[cardId] = newLvl;
  saveToLocalStorage();
  buildCollection();
  renderCollection();
  if (appState.activeSection === 'decks') {
    renderActiveDeck();
    updateRecommendations();
  }
};

// 2. Render del Mazo Activo
function renderActiveDeck() {
  const container = document.getElementById('deck-slots-container');
  container.innerHTML = '';

  appState.activeDeck.forEach((slot, index) => {
    const slotEl = document.createElement('div');
    let slotLabel = `Slot ${index + 1}`;
    let restrictionHTML = '';

    if (index === 0) {
      slotLabel = "Slot 1: Evolución / Normal";
      restrictionHTML = `<span class="text-[9px] text-pink-400 font-black absolute bottom-2 right-3">EVO / NORMAL</span>`;
    } else if (index === 1) {
      slotLabel = "Slot 2: Héroe / Campeón / Normal";
      restrictionHTML = `<span class="text-[9px] text-amber-400 font-black absolute bottom-2 right-3">HÉROE / CAMPEÓN / NORMAL</span>`;
    } else if (index === 2) {
      slotLabel = "Slot 3: Híbrido";
      restrictionHTML = `<span class="text-[9px] text-purple-400 font-black absolute bottom-2 right-3">EVO / HÉROE / CAMPEÓN / NORMAL</span>`;
    } else {
      slotLabel = `Slot ${index + 1}: Convencional`;
    }

    if (slot) {
      const card = appState.collection.find(c => c.id === slot.cardId);
      const isEvo = slot.isEvolved;
      const isHero = slot.isHero;
      const spanishRarity = translateRarity(card?.rarity);
      
      let borderClass = `rarity-${card?.rarity.toLowerCase()}`;
      let badgeHTML = '';

      if (isEvo) {
        borderClass = 'rarity-epic border-pink-500';
        badgeHTML = `<div class="evo-badge absolute -top-1.5 -right-1.5 text-[9px] px-2 py-0.5 rounded-full text-white font-extrabold">EVO</div>`;
      } else if (isHero) {
        borderClass = 'border-emerald-500';
        badgeHTML = `<div class="absolute -top-1.5 -right-1.5 bg-emerald-600 border border-emerald-500 text-[9px] px-2 py-0.5 rounded-full text-white font-extrabold shadow-lg">HÉROE</div>`;
      } else if (card?.rarity.toLowerCase() === 'champion') {
        badgeHTML = `<div class="absolute -top-1.5 -right-1.5 bg-amber-500 text-[9px] px-2 py-0.5 rounded-full text-slate-950 font-black">👑</div>`;
      }

      let cardIconUrl = card?.iconUrl;
      if (isEvo && card?.evolutionIconUrl) {
        cardIconUrl = card.evolutionIconUrl;
      } else if (isHero && card?.heroIconUrl) {
        cardIconUrl = card.heroIconUrl;
      }

      slotEl.className = `relative p-3 rounded-2xl cursor-pointer glass-panel border flex items-center gap-3.5 ${borderClass}`;
      slotEl.innerHTML = `
        ${badgeHTML}
        <img class="w-12 h-14 object-contain" src="${cardIconUrl}" alt="${slot.name}" onerror="this.src='https://placehold.co/100x120/1e293b/ffffff?text=${slot.name}'">
        <div class="flex-1 min-w-0">
          <h5 class="text-xs md:text-sm font-extrabold truncate leading-tight text-slate-100">${slot.name}</h5>
          <p class="text-[10px] md:text-xs text-slate-400 leading-tight mt-0.5">${spanishRarity}</p>
          <p class="text-[10px] text-slate-500 font-bold">Nivel ${card?.currentLevel}</p>
        </div>
        <button class="text-slate-500 hover:text-red-400 text-xs font-black p-1.5 self-start" onclick="removeCardFromActiveDeck(event, ${index})">✕</button>
      `;
    } else {
      slotEl.className = 'p-4 rounded-2xl border-2 border-dashed border-slate-800 bg-slate-950/20 hover:bg-slate-950/50 cursor-pointer flex flex-col items-center justify-center min-h-[64px] transition relative';
      slotEl.innerHTML = `
        <span class="text-slate-500 text-xs font-bold">${slotLabel}</span>
        <span class="text-slate-600 text-[10px]">Toca para añadir</span>
        ${restrictionHTML}
      `;
    }

    slotEl.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON') return;
      openDeckBuilder(index);
    });

    container.appendChild(slotEl);
  });

  calculateDeckConsolidatedCost();
}

window.removeCardFromActiveDeck = function(event, index) {
  event.stopPropagation();
  appState.activeDeck[index] = null;
  renderActiveDeck();
};

function calculateDeckConsolidatedCost() {
  let totalGold = 0;
  const missingCardsByRarity = {
    "Común": 0,
    "Especial": 0,
    "Épica": 0,
    "Legendaria": 0,
    "Campeón": 0
  };

  appState.activeDeck.forEach(slot => {
    if (!slot) return;
    const card = appState.collection.find(c => c.id === slot.cardId);
    if (!card) return;

    const spanishRarity = translateRarity(card.rarity);
    const targetLvl = appState.targetLevels[card.id] || 15;
    const upgradeInfo = calculateUpgradeCost(spanishRarity, card.currentLevel, targetLvl, card.count);

    totalGold += upgradeInfo.goldNeeded;
    missingCardsByRarity[spanishRarity] += upgradeInfo.cardsNeeded;
  });

  document.getElementById('deck-total-gold').innerText = totalGold.toLocaleString() + ' 🪙';

  const breakdownContainer = document.getElementById('deck-breakdown-container');
  breakdownContainer.innerHTML = '';

  let hasMissingCards = false;
  Object.keys(missingCardsByRarity).forEach(rarity => {
    const missing = missingCardsByRarity[rarity];
    if (missing > 0) {
      hasMissingCards = true;
      const badge = document.createElement('div');
      badge.className = 'bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl text-center flex flex-col justify-center shadow-inner';
      badge.innerHTML = `
        <span class="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-wider">${rarity}</span>
        <span class="text-xs md:text-sm text-pink-500 font-extrabold">${missing.toLocaleString()} cp</span>
      `;
      breakdownContainer.appendChild(badge);
    }
  });

  if (!hasMissingCards) {
    breakdownContainer.innerHTML = `<div class="col-span-full text-center text-emerald-400 font-bold text-xs py-2.5 bg-emerald-950/20 border border-emerald-900/50 rounded-xl">¡Todas las cartas del mazo están en el nivel objetivo!</div>`;
  }
}

// ----------------------------------------------------
// BOTTOM SHEET (CONSTRUCTOR DE MAZOS CON PESTAÑAS FILTROS)
// ----------------------------------------------------
function openDeckBuilder(slotIndex) {
  appState.deckBuilderActiveSlot = slotIndex;

  let tabs = [];
  if (slotIndex === 0) {
    tabs = ['evo', 'normal'];
    appState.bottomSheetActiveTab = 'evo';
  } else if (slotIndex === 1) {
    tabs = ['hero', 'champion', 'normal'];
    appState.bottomSheetActiveTab = 'hero';
  } else if (slotIndex === 2) {
    tabs = ['evo', 'hero', 'champion', 'normal'];
    appState.bottomSheetActiveTab = 'evo';
  } else {
    tabs = ['normal'];
    appState.bottomSheetActiveTab = 'normal';
  }

  renderBottomSheetTabs(tabs);

  document.getElementById('bottom-sheet-overlay').classList.remove('hidden');
  const sheet = document.getElementById('deck-builder-bottom-sheet');
  sheet.classList.remove('closed');
  sheet.classList.add('open');

  let label = `Añadir a Slot ${slotIndex + 1}`;
  if (slotIndex === 0) label = "Slot 1 (Evoluciones / Normales)";
  if (slotIndex === 1) label = "Slot 2 (Héroes / Campeones / Normales)";
  if (slotIndex === 2) label = "Slot 3 (Evolución / Héroe / Campeón / Normal)";
  document.getElementById('bottom-sheet-title').innerText = label;

  // Resetear filtros y búsquedas del bottom sheet
  const searchInput = document.getElementById('bottom-sheet-search');
  if (searchInput) searchInput.value = '';
  appState.bottomSheetSearch = '';

  const sortSelect = document.getElementById('bottom-sheet-sort-by');
  if (sortSelect) sortSelect.value = 'name-asc';
  appState.bottomSheetSortBy = 'name-asc';

  renderBottomSheetCards();
}

function renderBottomSheetTabs(tabs) {
  const container = document.getElementById('bottom-sheet-tabs-container');
  container.innerHTML = '';

  if (!tabs || tabs.length <= 1) {
    container.classList.add('hidden');
    return;
  }
  container.classList.remove('hidden');

  tabs.forEach(tab => {
    const btn = document.createElement('button');
    btn.className = `sheet-tab flex-grow py-2 px-3.5 rounded-xl text-xs font-black transition text-center shrink-0 ${appState.bottomSheetActiveTab === tab ? 'active' : ''}`;
    
    let label = '';
    if (tab === 'evo') label = '🌸 Evolución';
    if (tab === 'hero') label = '⚡ Héroe';
    if (tab === 'champion') label = '👑 Campeón';
    if (tab === 'normal') label = '🎴 Normal';
    
    btn.innerText = label;
    btn.addEventListener('click', () => {
      appState.bottomSheetActiveTab = tab;
      renderBottomSheetTabs(tabs);
      renderBottomSheetCards();
    });
    container.appendChild(btn);
  });
}

function closeBottomSheet() {
  document.getElementById('bottom-sheet-overlay').classList.add('hidden');
  const sheet = document.getElementById('deck-builder-bottom-sheet');
  sheet.classList.remove('open');
  sheet.classList.add('closed');
  appState.deckBuilderActiveSlot = null;
}

function renderBottomSheetCards() {
  const container = document.getElementById('bottom-sheet-cards-list');
  container.innerHTML = '';

  const slotIndex = appState.deckBuilderActiveSlot;
  if (slotIndex === null) return;

  const tab = appState.bottomSheetActiveTab;

  const eligibleCards = appState.collection.filter(card => {
    const alreadyUsed = appState.activeDeck.some((s, idx) => s && s.cardId === card.id && idx !== slotIndex);
    if (alreadyUsed) return false;

    if (appState.bottomSheetSearch && !card.name.toLowerCase().includes(appState.bottomSheetSearch)) {
      return false;
    }

    if (tab === 'evo') {
      return !!card.evolutionIconUrl;
    } else if (tab === 'hero') {
      return HERO_CARDS.includes(card.name) || !!card.heroIconUrl;
    } else if (tab === 'champion') {
      return card.rarity.toLowerCase() === 'champion';
    } else {
      return card.rarity.toLowerCase() !== 'champion';
    }
  });

  sortCardsList(eligibleCards, appState.bottomSheetSortBy);

  if (eligibleCards.length === 0) {
    container.innerHTML = `<div class="col-span-full text-center text-slate-550 py-6 text-xs">No hay cartas disponibles para esta categoría.</div>`;
    return;
  }

  eligibleCards.forEach(card => {
    const itemEl = document.createElement('div');
    const isEvoChoice = (tab === 'evo');
    const isHeroChoice = (tab === 'hero');
    const spanishRarity = translateRarity(card.rarity);
    
    let borderClass = 'border-slate-800 hover:bg-slate-800/40';
    let labelTag = '';

    if (isEvoChoice) {
      borderClass = 'border-pink-500 hover:bg-pink-900/10';
      labelTag = '<span class="text-[8px] bg-pink-600 text-white font-extrabold px-1.5 py-0.2 rounded-sm shadow-md">EVO</span>';
    } else if (isHeroChoice) {
      borderClass = 'border-emerald-500 hover:bg-emerald-900/10';
      labelTag = '<span class="text-[8px] bg-emerald-600 text-white font-extrabold px-1.5 py-0.2 rounded-sm shadow-md">HÉROE</span>';
    }

    let cardIconUrl = card.iconUrl;
    if (isEvoChoice && card.evolutionIconUrl) {
      cardIconUrl = card.evolutionIconUrl;
    } else if (isHeroChoice && card.heroIconUrl) {
      cardIconUrl = card.heroIconUrl;
    }

    // En la selección del bottom sheet, las imágenes también son más visibles
    itemEl.className = `p-2.5 rounded-xl border bg-slate-950 flex items-center gap-2.5 cursor-pointer transition ${borderClass}`;
    itemEl.innerHTML = `
      <img class="w-10 h-12 object-contain" src="${cardIconUrl}" alt="${card.name}" onerror="this.src='https://placehold.co/100x120/1e293b/ffffff?text=${card.name}'">
      <div class="flex-1 min-w-0">
        <h6 class="text-xs font-bold truncate leading-tight text-slate-200">${card.name}</h6>
        <p class="text-[9px] text-slate-500 mt-0.5">${spanishRarity}</p>
      </div>
      ${labelTag}
    `;

    itemEl.addEventListener('click', () => {
      selectCardForSlot(card, isEvoChoice, isHeroChoice);
    });

    container.appendChild(itemEl);
  });
}

function selectCardForSlot(card, isEvolved, isHero) {
  const slotIndex = appState.deckBuilderActiveSlot;
  if (slotIndex === null) return;

  appState.activeDeck[slotIndex] = {
    cardId: card.id,
    name: card.name,
    isEvolved: isEvolved,
    isHero: isHero
  };

  renderActiveDeck();
  closeBottomSheet();
}

// ----------------------------------------------------
// GESTOR DE MAZOS GUARDADOS (FAVORITOS)
// ----------------------------------------------------
function saveActiveDeck() {
  const name = appState.activeDeckName.trim();
  if (!name) {
    alert('Introduce un nombre para el mazo favorito antes de guardar.');
    return;
  }

  const hasCards = appState.activeDeck.some(s => s !== null);
  if (!hasCards) {
    alert('Añade al menos una carta al mazo antes de guardarlo.');
    return;
  }

  const newDeck = {
    id: Date.now(),
    name: name,
    slots: JSON.parse(JSON.stringify(appState.activeDeck))
  };

  appState.savedDecks.push(newDeck);
  saveToLocalStorage();

  document.getElementById('deck-name-input').value = '';
  appState.activeDeckName = '';

  renderSavedDecks();
  updateRecommendations();
  alert(`Mazo "${name}" guardado en favoritos.`);
}

function renderSavedDecks() {
  const list = document.getElementById('saved-decks-list');
  list.innerHTML = '';

  if (appState.savedDecks.length === 0) {
    list.innerHTML = `<div class="col-span-full text-center text-slate-500 py-6 text-xs bg-slate-950/20 rounded-2xl border border-slate-850">No tienes mazos favoritos guardados. Construye un mazo arriba y nómbralo para guardarlo.</div>`;
    return;
  }

  appState.savedDecks.forEach(deck => {
    const cardEl = document.createElement('div');
    cardEl.className = 'glass-panel p-4 rounded-2xl border border-slate-800 relative flex flex-col justify-between shadow';

    let miniCardsHTML = '';
    deck.slots.forEach(slot => {
      if (slot) {
        const card = appState.collection.find(c => c.id === slot.cardId);
        let icon = card?.iconUrl;
        let border = 'border-slate-850';
        let badge = '';

        if (slot.isEvolved) {
          border = 'border-pink-500';
          if (card?.evolutionIconUrl) icon = card.evolutionIconUrl;
          badge = '<span class="absolute -bottom-1 -right-1 text-[6px] bg-pink-600 px-1 rounded text-white font-extrabold shadow">EVO</span>';
        } else if (slot.isHero) {
          border = 'border-emerald-500';
          if (card?.heroIconUrl) icon = card.heroIconUrl;
          badge = '<span class="absolute -bottom-1 -right-1 text-[6px] bg-emerald-600 px-1 rounded text-white font-extrabold shadow">HERO</span>';
        } else if (card?.rarity.toLowerCase() === 'champion') {
          border = 'border-amber-500';
          badge = '<span class="absolute -bottom-1 -right-1 text-[6px] bg-amber-500 px-1 rounded text-slate-950 font-black shadow">👑</span>';
        }

        miniCardsHTML += `
          <div class="relative w-9 h-11 border rounded-lg bg-slate-950 flex-shrink-0 flex items-center justify-center ${border}">
            <img class="w-full h-full object-contain" src="${icon}" alt="${slot.name}" onerror="this.src='https://placehold.co/50x60?text=${slot.name.substring(0,2)}'">
            ${badge}
          </div>
        `;
      } else {
        miniCardsHTML += `
          <div class="w-9 h-11 border border-dashed border-slate-850 rounded-lg bg-slate-950/20 flex-shrink-0 flex items-center justify-center">
            <span class="text-slate-700 text-[10px] font-bold">Ø</span>
          </div>
        `;
      }
    });

    cardEl.innerHTML = `
      <div class="flex items-center justify-between gap-2 mb-3">
        <h4 class="text-sm font-bold text-slate-200 truncate">${deck.name}</h4>
        <div class="flex gap-3">
          <button class="text-xs text-slate-400 hover:text-pink-500 font-bold" onclick="loadSavedDeckIntoActive(${deck.id})">Cargar</button>
          <button class="text-xs text-slate-500 hover:text-red-400 font-bold" onclick="deleteSavedDeck(${deck.id})">Borrar</button>
        </div>
      </div>
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
        ${miniCardsHTML}
      </div>
    `;

    list.appendChild(cardEl);
  });
}

window.loadSavedDeckIntoActive = function(deckId) {
  const deck = appState.savedDecks.find(d => d.id === deckId);
  if (deck) {
    appState.activeDeck = JSON.parse(JSON.stringify(deck.slots));
    appState.activeDeckName = deck.name;
    document.getElementById('deck-name-input').value = deck.name;
    switchSection('decks');
    renderActiveDeck();
    alert(`Mazo "${deck.name}" cargado en el editor.`);
  }
};

window.deleteSavedDeck = function(deckId) {
  if (confirm('¿Estás seguro de que quieres borrar este mazo favorito?')) {
    appState.savedDecks = appState.savedDecks.filter(d => d.id !== deckId);
    saveToLocalStorage();
    renderSavedDecks();
    updateRecommendations();
  }
};

function exportActiveDeck() {
  const cardIds = appState.activeDeck
    .filter(slot => slot !== null)
    .map(slot => slot.cardId);

  if (cardIds.length !== 8) {
    alert('Para poder exportar a Clash Royale, el mazo debe tener exactamente 8 cartas completas.');
    return;
  }

  const link = `https://link.clashroyale.com/deck/es?deck=${cardIds.join(';')}`;
  window.open(link, '_blank');
}

// ----------------------------------------------------
// SISTEMA DE RECOMENDACIÓN INTELIGENTE DE MEJORAS
// ----------------------------------------------------
function updateRecommendations() {
  const container = document.getElementById('recommendations-container');
  container.innerHTML = '';

  if (appState.savedDecks.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center text-slate-400 text-xs py-4">
        Guarda mazos en tus favoritos para que el analizador calcule las prioridades de mejora de tu cuenta.
      </div>`;
    return;
  }

  const cardStats = {};

  appState.savedDecks.forEach(deck => {
    deck.slots.forEach(slot => {
      if (!slot) return;
      
      if (!cardStats[slot.cardId]) {
        cardStats[slot.cardId] = {
          usages: 0,
          usedAsEvo: false,
          usedAsHero: false
        };
      }
      cardStats[slot.cardId].usages += 1;
      if (slot.isEvolved) {
        cardStats[slot.cardId].usedAsEvo = true;
      }
      if (slot.isHero) {
        cardStats[slot.cardId].usedAsHero = true;
      }
    });
  });

  const scoredCards = appState.collection.map(card => {
    const stats = cardStats[card.id];
    let score = 0;
    let reasons = [];

    if (stats && stats.usages > 0) {
      score += stats.usages * 15;
      reasons.push(`Utilizada en ${stats.usages} mazo${stats.usages > 1 ? 's' : ''}`);

      const rarityLower = card.rarity.toLowerCase();

      if (WIN_CONDITIONS.includes(card.name)) {
        score += 25;
        reasons.push("Condición de victoria indispensable en tu mazo");
      }

      if (KEY_SPELLS.includes(card.name)) {
        score += 15;
        reasons.push("Hechizo clave para interacciones de daño");
      }

      if (rarityLower === 'champion') {
        score += 20;
        reasons.push("Campeón único con habilidad especial");
      }

      if (stats.usedAsEvo) {
        score += 15;
        reasons.push("Utilizada en versión evolucionada");
      }

      if (stats.usedAsHero) {
        score += 15;
        reasons.push("Utilizada en su versión Héroe en tu mazo");
      }
    }

    return {
      card,
      score,
      reasons
    };
  });

  const recommended = scoredCards
    .filter(item => {
      if (item.score === 0) return false;
      const targetLvl = appState.targetLevels[item.card.id] || 15;
      return item.card.currentLevel < targetLvl;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  if (recommended.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center text-emerald-400 text-xs py-4 font-bold bg-emerald-950/20 border border-emerald-900/50 rounded-xl">
        ⭐ ¡Increíble! Todas las cartas de tus mazos favoritos ya están en su nivel objetivo.
      </div>`;
    return;
  }

  recommended.forEach(item => {
    const card = item.card;
    const targetLvl = appState.targetLevels[card.id] || 15;
    const spanishRarity = translateRarity(card.rarity);
    const cost = calculateUpgradeCost(spanishRarity, card.currentLevel, targetLvl, card.count);

    const cardEl = document.createElement('div');
    cardEl.className = 'glass-panel p-3.5 rounded-2xl border border-slate-700/80 flex flex-col justify-between gap-3 relative shadow';
    
    let reasonsHTML = item.reasons.map(r => `<li class="flex items-center gap-1.5"><span class="text-pink-500 text-[8px]">◈</span> ${r}</li>`).join('');

    cardEl.innerHTML = `
      <div class="flex items-center gap-3">
        <img class="w-10 h-12 object-contain" src="${card.iconUrl}" alt="${card.name}" onerror="this.src='https://placehold.co/100x120/1e293b/ffffff?text=${card.name}'">
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between">
            <h5 class="text-xs md:text-sm font-extrabold text-slate-100 truncate">${card.name}</h5>
            <span class="text-[9px] bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-lg font-bold text-amber-400">Puntaje: ${item.score}</span>
          </div>
          <p class="text-[10px] md:text-xs text-slate-400 mt-0.5">Nivel ${card.currentLevel} ➜ Objetivo ${targetLvl}</p>
        </div>
      </div>
      <div class="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
        <ul class="space-y-1 font-semibold leading-normal">
          ${reasonsHTML}
        </ul>
      </div>
      <div class="bg-slate-950/60 p-2.5 rounded-xl text-[10px] md:text-xs flex justify-between gap-2 border border-slate-850">
        <div>🪙 <span class="font-extrabold text-amber-400">${cost.goldNeeded.toLocaleString()}</span></div>
        <div>🎴 Faltan: <span class="font-extrabold ${cost.cardsNeeded > 0 ? 'text-red-400' : 'text-emerald-400'}">${cost.cardsNeeded > 0 ? cost.cardsNeeded.toLocaleString() : '¡Listas!'}</span></div>
      </div>
      <button class="w-full py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-600 text-xs font-bold rounded-xl text-slate-300 transition shadow" onclick="scrollToCardInCollection(${card.id})">
        Ver en Colección
      </button>
    `;

    container.appendChild(cardEl);
  });
}

window.scrollToCardInCollection = function(cardId) {
  switchSection('collection');
  setTimeout(() => {
    const el = document.getElementById(`card-node-${cardId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-pink-500');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-pink-500');
      }, 2000);
    }
  }, 100);
};

// ----------------------------------------------------
// ARRANCAR APLICACIÓN
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', initApp);
