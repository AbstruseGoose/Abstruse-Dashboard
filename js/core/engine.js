// js/core/engine.js
const STORAGE_KEY = "abstruse_dashboard_modular_v1";
const EDIT_LONGPRESS_MS = 700;

let tileTypes = {};
let state = null;
let editMode = false;

const canvas = document.getElementById("canvas");
const editBar = document.getElementById("editBar");
const editDoneBtn = document.getElementById("editDoneBtn");
const editTileManagerBtn = document.getElementById("editTileManagerBtn");

const tmOverlay = document.getElementById("tileManagerOverlay");
const tmCloseBtn = document.getElementById("tmCloseBtn");
const tmActiveList = document.getElementById("tmActiveList");
const tmAvailableList = document.getElementById("tmAvailableList");
const tmIcsTextarea = document.getElementById("tmIcsTextarea");
const tmSaveIcsBtn = document.getElementById("tmSaveIcsBtn");

export function initDashboard(allTileTypes, defaultLayout) {
  tileTypes = allTileTypes;
  state = loadState(defaultLayout);
  renderAllTiles();
  setupEditModeHandlers();
  setupTileManagerHandlers();
}

/* --- State persistence --- */
function loadState(defaultLayout) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        icsRaw: "",
        tiles: defaultLayout.map((t, idx) => ({
          instanceId: t.instanceId || `${t.typeId}-${idx + 1}`,
          typeId: t.typeId,
          label: t.label || tileTypes[t.typeId]?.label || t.typeId,
          colSpan: t.colSpan || 1,
          rowSpan: t.rowSpan || 1,
          order: t.order ?? idx + 1,
          config: tileTypes[t.typeId]?.createInitialConfig
            ? tileTypes[t.typeId].createInitialConfig()
            : {}
        }))
      };
    }
    const parsed = JSON.parse(raw);
    // Backfill labels and defaults
    parsed.tiles.forEach(tile => {
      const def = tileTypes[tile.typeId];
      if (def) {
        tile.label = tile.label || def.label;
        if (!tile.colSpan) tile.colSpan = def.defaultSize?.colSpan || 1;
        if (!tile.rowSpan) tile.rowSpan = def.defaultSize?.rowSpan || 1;
        tile.config = { ...(def.createInitialConfig?.() || {}), ...(tile.config || {}) };
      }
    });
    return parsed;
  } catch (e) {
    console.error("State load error", e);
    return {
      icsRaw: "",
      tiles: defaultLayout
    };
  }
}
function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("State save error", e);
  }
}

/* --- Public helpers for other modules --- */
export function getDashboardState() {
  return state;
}
export function setDashboardState(newState) {
  state = newState;
  saveState();
  renderAllTiles();
}
export function rerenderTilesOfType(typeId) {
  // just re-render all tiles for simplicity
  renderAllTiles();
}

/* --- Rendering --- */
function sortTiles() {
  state.tiles.sort((a, b) => a.order - b.order);
}
function renderAllTiles() {
  canvas.innerHTML = "";
  sortTiles();

  state.tiles.forEach(tileCfg => {
    const def = tileTypes[tileCfg.typeId];
    if (!def) return;

    const tile = document.createElement("div");
    tile.className = "tile";
    tile.dataset.instanceId = tileCfg.instanceId;
    tile.style.gridColumn = `span ${tileCfg.colSpan}`;
    tile.style.gridRow = `span ${tileCfg.rowSpan}`;

    const editChrome = document.createElement("div");
    editChrome.className = "tileEditChrome";
    tile.appendChild(editChrome);

    const dragHandle = document.createElement("div");
    dragHandle.className = "dragHandle";
    tile.appendChild(dragHandle);

    const resizeHandle = document.createElement("div");
    resizeHandle.className = "resizeHandle";
    tile.appendChild(resizeHandle);

    const gearBtn = document.createElement("button");
    gearBtn.className = "tileGearBtn";
    gearBtn.textContent = "⚙";
    tile.appendChild(gearBtn);

    const content = document.createElement("div");
    content.className = "tileContent";
    tile.appendChild(content);

    const header = document.createElement("div");
    header.className = "tileLabel";
    header.innerHTML = `<span>${tileCfg.label}</span>`;
    content.appendChild(header);

    const innerHost = document.createElement("div");
    innerHost.className = "tileInner";
    innerHost.style.flex = "1";
    innerHost.style.display = "flex";
    innerHost.style.flexDirection = "column";
    content.appendChild(innerHost);

    // tile-specific render
    def.render(innerHost, tileCfg, { state });

    // per-tile settings panel (gear opens it)
    const settingsPanel = document.createElement("div");
    settingsPanel.className = "tileSettingsPanel";
    tile.appendChild(settingsPanel);

    // Insert "Remove tile" button + Save/Close into each setting panel,
    // tile module fills the custom config part.
    const baseSettingsHeader = document.createElement("div");
    baseSettingsHeader.innerHTML = `
      <div class="ts-row">
        <label>Label
          <input type="text" class="ts-label-input" value="${tileCfg.label}">
        </label>
      </div>
      <div class="ts-buttons">
        <button class="ts-delete">Delete</button>
        <div>
          <button class="ts-close">Close</button>
          <button class="ts-save">Save</button>
        </div>
      </div>
    `;

    // A container for tile-specific config
    const customConfigHost = document.createElement("div");
    customConfigHost.className = "ts-custom";
    settingsPanel.appendChild(customConfigHost);
    def.buildSettingsUI?.(customConfigHost, tileCfg, { state });

    settingsPanel.appendChild(baseSettingsHeader);

    gearBtn.addEventListener("click", e => {
      e.stopPropagation();
      if (!editMode) return;
      settingsPanel.style.display =
        settingsPanel.style.display === "none" || !settingsPanel.style.display
          ? "block"
          : "none";
    });

    const deleteBtn = settingsPanel.querySelector(".ts-delete");
    const saveBtn = settingsPanel.querySelector(".ts-save");
    const closeBtn = settingsPanel.querySelector(".ts-close");
    const labelInput = settingsPanel.querySelector(".ts-label-input");

    deleteBtn.addEventListener("click", () => {
      if (!confirm("Remove this tile?")) return;
      state.tiles = state.tiles.filter(t => t.instanceId !== tileCfg.instanceId);
      saveState();
      renderAllTiles();
    });

    saveBtn.addEventListener("click", () => {
      tileCfg.label = labelInput.value.trim() || tileCfg.label;
      def.saveConfig?.(customConfigHost, tileCfg, { state });
      saveState();
      settingsPanel.style.display = "none";
      renderAllTiles();
    });

    closeBtn.addEventListener("click", () => {
      settingsPanel.style.display = "none";
    });

    canvas.appendChild(tile);

    // drag / resize
    setupTileDrag(tile, dragHandle, tileCfg);
    setupTileResize(tile, resizeHandle, tileCfg);
  });

  applyEditModeVisuals();
}

/* --- Edit mode / long press on empty space --- */
function setupEditModeHandlers() {
  editDoneBtn.addEventListener("click", () => setEditMode(false));
  editTileManagerBtn.addEventListener("click", () => openTileManager());
  tmCloseBtn.addEventListener("click", () => closeTileManager());

  let longPressTimer = null;

  function startPress(e) {
    if (e.target !== canvas) return;
    if (longPressTimer) clearTimeout(longPressTimer);
    longPressTimer = setTimeout(() => {
      setEditMode(true);
      longPressTimer = null;
    }, EDIT_LONGPRESS_MS);
  }
  function endPress() {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  }

  canvas.addEventListener("pointerdown", startPress);
  canvas.addEventListener("pointerup", endPress);
  canvas.addEventListener("pointerleave", endPress);
}

function setEditMode(on) {
  editMode = on;
  applyEditModeVisuals();
}
function applyEditModeVisuals() {
  const tiles = document.querySelectorAll(".tile");
  tiles.forEach(t => {
    if (editMode) t.classList.add("editModeActive");
    else t.classList.remove("editModeActive");
  });
  if (editMode) editBar.classList.add("visible");
  else editBar.classList.remove("visible");
}

/* --- Drag + reorder --- */
function setupTileDrag(tileEl, dragHandle, tileCfg) {
  let dragging = false;
  let startX = 0;
  let startY = 0;

  function onPointerDown(e) {
    if (!editMode) return;
    if (e.target !== dragHandle) return;
    e.preventDefault();
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    tileEl.style.zIndex = 10;
    tileEl.style.transition = "none";

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  }

  function onPointerMove(e) {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    tileEl.style.transform = `translate(${dx}px, ${dy}px)`;
  }

  function onPointerUp() {
    if (!dragging) return;
    dragging = false;
    tileEl.style.zIndex = "";
    tileEl.style.transition = "";

    const rect = tileEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    let closest = null;
    let closestDist = Infinity;
    const tilesDom = Array.from(canvas.querySelectorAll(".tile"));
    tilesDom.forEach(domTile => {
      if (domTile === tileEl) return;
      const r = domTile.getBoundingClientRect();
      const tx = r.left + r.width / 2;
      const ty = r.top + r.height / 2;
      const d = (tx - cx) ** 2 + (ty - cy) ** 2;
      if (d < closestDist) {
        closestDist = d;
        closest = domTile;
      }
    });

    tileEl.style.transform = "";
    if (closest) {
      const otherId = closest.dataset.instanceId;
      const otherTile = state.tiles.find(t => t.instanceId === otherId);
      if (otherTile) {
        const tmp = tileCfg.order;
        tileCfg.order = otherTile.order;
        otherTile.order = tmp;
        saveState();
        renderAllTiles();
      }
    }

    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
  }

  dragHandle.addEventListener("pointerdown", onPointerDown);
}

/* --- Resize (grid-span based) --- */
function setupTileResize(tileEl, resizeHandle, tileCfg) {
  let resizing = false;
  let startX = 0;
  let startY = 0;
  let startColSpan = tileCfg.colSpan;
  let startRowSpan = tileCfg.rowSpan;

  function onPointerDown(e) {
    if (!editMode) return;
    e.preventDefault();
    resizing = true;
    startX = e.clientX;
    startY = e.clientY;
    startColSpan = tileCfg.colSpan;
    startRowSpan = tileCfg.rowSpan;
    tileEl.style.transition = "none";

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  }

  function onPointerMove(e) {
    if (!resizing) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    const canvasWidth = canvas.clientWidth;
    const colCount = getComputedStyle(canvas).gridTemplateColumns.split(" ").length;
    const colWidth = (canvasWidth - (colCount - 1) * 10) / colCount;
    const rowHeight = parseFloat(getComputedStyle(canvas).gridAutoRows);

    let newColSpan = Math.max(1, Math.round(startColSpan + dx / colWidth));
    let newRowSpan = Math.max(1, Math.round(startRowSpan + dy / rowHeight));

    newColSpan = Math.min(Math.max(1, newColSpan), colCount);
    newRowSpan = Math.min(Math.max(1, newRowSpan), 4);

    tileCfg.colSpan = newColSpan;
    tileCfg.rowSpan = newRowSpan;
    tileEl.style.gridColumn = "span " + newColSpan;
    tileEl.style.gridRow = "span " + newRowSpan;
  }

  function onPointerUp() {
    if (!resizing) return;
    resizing = false;
    tileEl.style.transition = "";
    saveState();
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
  }

  resizeHandle.addEventListener("pointerdown", onPointerDown);
}

/* --- Tile Manager UI --- */
function setupTileManagerHandlers() {
  editTileManagerBtn.addEventListener("click", openTileManager);
  tmCloseBtn.addEventListener("click", closeTileManager);
  tmSaveIcsBtn.addEventListener("click", () => {
    state.icsRaw = tmIcsTextarea.value;
    saveState();
    closeTileManager();
  });
}

function openTileManager() {
  updateTileManagerLists();
  tmIcsTextarea.value = state.icsRaw || "";
  tmOverlay.classList.remove("hidden");
}
function closeTileManager() {
  tmOverlay.classList.add("hidden");
}

function updateTileManagerLists() {
  tmActiveList.innerHTML = "";
  tmAvailableList.innerHTML = "";

  const activeTypes = new Set(state.tiles.map(t => t.typeId));

  // active
  state.tiles.forEach(tile => {
    const def = tileTypes[tile.typeId];
    if (!def) return;
    const chip = document.createElement("div");
    chip.className = "tm-chip";
    chip.innerHTML = `
      <span>${tile.label}</span>
      <span class="tm-chip-type">${tile.typeId}</span>
    `;
    const btn = document.createElement("button");
    btn.textContent = "Remove";
    btn.addEventListener("click", () => {
      state.tiles = state.tiles.filter(t => t.instanceId !== tile.instanceId);
      saveState();
      renderAllTiles();
      updateTileManagerLists();
    });
    chip.appendChild(btn);
    tmActiveList.appendChild(chip);
  });

  // available
  Object.keys(tileTypes).forEach(typeId => {
    const def = tileTypes[typeId];
    const chip = document.createElement("div");
    chip.className = "tm-chip";
    chip.innerHTML = `
      <span>${def.label}</span>
      <span class="tm-chip-type">${typeId}</span>
    `;
    const btn = document.createElement("button");
    btn.textContent = "Add";
    btn.addEventListener("click", () => {
      const instanceId = `${typeId}-${Date.now()}`;
      const baseOrder = state.tiles.length
        ? Math.max(...state.tiles.map(t => t.order)) + 1
        : 1;
      state.tiles.push({
        instanceId,
        typeId,
        label: def.label,
        colSpan: def.defaultSize?.colSpan || 1,
        rowSpan: def.defaultSize?.rowSpan || 1,
        order: baseOrder,
        config: def.createInitialConfig ? def.createInitialConfig() : {}
      });
      saveState();
      renderAllTiles();
      updateTileManagerLists();
    });
    tmAvailableList.appendChild(chip);
  });
}
