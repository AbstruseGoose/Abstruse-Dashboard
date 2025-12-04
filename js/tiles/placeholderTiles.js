// js/tiles/placeholderTiles.js
// Generic factory for simple "coming soon" / basic tiles.

export function makePlaceholderTile(typeId, labelText, description) {
  return {
    id: typeId,
    label: labelText,
    defaultSize: { colSpan: 1, rowSpan: 1 },
    createInitialConfig() {
      return {};
    },
    render(container, tile, ctx) {
      container.innerHTML = `
        <div style="font-size:12px; color:var(--text-soft); display:flex; flex-direction:column; gap:4px;">
          <div><strong>${labelText}</strong></div>
          <div>${description}</div>
        </div>
      `;
    },
    buildSettingsUI(panel, tile, ctx) {
      panel.innerHTML = `<div class="ts-row"><span>${description}</span></div>`;
    },
    saveConfig(panel, tile, ctx) {}
  };
}
