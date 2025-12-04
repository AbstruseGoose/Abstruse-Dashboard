/* =====================================================================
   ABSTRUSE DASHBOARD — CORE ENGINE
   Tile rendering, grid layout, edit mode, tile manager control,
   and safe compatibility with dynamic async tile loading.
   ===================================================================== */

import { loadState, saveState } from "./state.js";
import { renderTileManager } from "./tileManager.js";

/* =====================================================================
   START DASHBOARD (MAIN ENTRY POINT)
   ===================================================================== */

export async function startDashboard({ tileTypes, defaultLayout }) {
  console.log("%cAbstruse Dashboard Engine Starting…", "color:#7cf");

  // Load saved layout (or default if none)
  const layout = loadState(defaultLayout);

  // Lock flag
  let editMode = false;

  // Dashboard root
  const root = document.getElementById("dashboard");
  root.classList.add("dashboard-grid");

  /* ---------------------------------------------------------
     INIT GRID SYSTEM
     (basic CSS grid, tile objects manage their own space)
     --------------------------------------------------------- */

  function applyGrid() {
    root.style.gridTemplateColumns = `repeat(${layout.extras.gridCols}, 1fr)`;
    root.style.gridAutoRows = "140px";
    root.style.gap = layout.extras.tilePadding + "px";
  }

  applyGrid();

  /* ---------------------------------------------------------
     RENDER ALL TILES
     --------------------------------------------------------- */

  function renderAllTiles() {
    root.innerHTML = "";

    layout.tiles
      .filter(t => t.enabled)
      .sort((a, b) => a.order - b.order)
      .forEach(tileData => {
        renderTile(tileData);
      });
  }

  /* ---------------------------------------------------------
     RENDER SINGLE TILE
     --------------------------------------------------------- */

  function renderTile(tileData) {
    const tileConfig = tileTypes[tileData.type];

    if (!tileConfig || typeof tileConfig.render !== "function") {
      console.warn("⚠ Tile config missing or faulty:", tileData.type);
      return;
    }

    const tile = document.createElement("div");
    tile.className = "tile";
    tile.dataset.id = tileData.id;

    // Apply grid size
    tile.style.gridColumn = `span ${tileData.colSpan}`;
    tile.style.gridRow = `span ${tileData.rowSpan}`;

    // Tile container
    const tileBody = document.createElement("div");
    tileBody.className = "tile-body";

    tile.appendChild(tileBody);
    root.appendChild(tile);

    // Render tile content
    try {
      tileConfig.render(tileBody, tileData.config || {});
    } catch (err) {
      console.error("Tile render error:", tileData.type, err);
      tileBody.innerHTML = `
        <div style="color:#f66;padding:10px;">
          <b>Error rendering tile:</b> ${tileData.type}
        </div>
      `;
    }

    // Interaction (drag/resize) only in edit mode
    if (editMode) enableTileEditing(tile, tileData);
  }

  /* ---------------------------------------------------------
     ENABLE TILE DRAG + RESIZE
     (simple, stable, non-crashing)
     --------------------------------------------------------- */

  function enableTileEditing(tile, tileData) {
    tile.classList.add("tile-edit");

    let startX, startY, startW, startH;

    // Resize handle
    const handle = document.createElement("div");
    handle.className = "resize-handle";
    tile.appendChild(handle);

    handle.addEventListener("pointerdown", e => {
      e.stopPropagation();
      startX = e.clientX;
      startY = e.clientY;
      startW = tileData.colSpan;
      startH = tileData.rowSpan;

      function move(ev) {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;

        const gridW = Math.max(1, Math.round(startW + dx / 140));
        const gridH = Math.max(1, Math.round(startH + dy / 140));

        tile.style.gridColumn = `span ${gridW}`;
        tile.style.gridRow = `span ${gridH}`;

        tileData.colSpan = gridW;
        tileData.rowSpan = gridH;
      }

      function up() {
        saveState(layout);
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      }

      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    });
  }

  /* ---------------------------------------------------------
     EDIT MODE TOGGLE
     --------------------------------------------------------- */

  function setEditMode(on) {
    editMode = on;

    if (on) {
      document.getElementById("editBar").style.display = "flex";
      document.querySelectorAll(".tile").forEach(tile => {
        const tId = tile.dataset.id;
        const tData = layout.tiles.find(t => t.id === tId);
        enableTileEditing(tile, tData);
      });
    } else {
      document.getElementById("editBar").style.display = "none";
      document.querySelectorAll(".tile").forEach(tile => tile.classList.remove("tile-edit"));
    }
  }

  /* ---------------------------------------------------------
     TILE MANAGER
     --------------------------------------------------------- */

  document.getElementById("editTileManagerBtn").onclick = () => {
    renderTileManager(tileTypes, layout, () => {
      saveState(layout);
      renderAllTiles();
    });
    document.getElementById("tileManagerOverlay").classList.remove("hidden");
  };

  document.getElementById("tmCloseBtn").onclick = () => {
    document.getElementById("tileManagerOverlay").classList.add("hidden");
  };

  /* ---------------------------------------------------------
     EDIT BAR DONE BUTTON
     --------------------------------------------------------- */

  document.getElementById("editDoneBtn").onclick = () => {
    setEditMode(false);
    saveState(layout);
    renderAllTiles();
  };

  /* ---------------------------------------------------------
     HOLD EMPTY SPACE TO ENTER EDIT MODE
     --------------------------------------------------------- */

  let pressTimer = null;

  root.addEventListener("pointerdown", e => {
    if (e.target === root) {
      pressTimer = setTimeout(() => {
        setEditMode(true);
      }, 700);
    }
  });

  window.addEventListener("pointerup", () => {
    clearTimeout(pressTimer);
  });

  /* ---------------------------------------------------------
     INITIALIZE DASHBOARD
     --------------------------------------------------------- */

  renderAllTiles();
  console.log("%cDashboard ready.", "color:#7f7");
}
