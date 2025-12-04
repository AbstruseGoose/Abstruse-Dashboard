// js/tiles/systemStatus.js
export const id = "systemStatus";
export const label = "System Status";
export const defaultSize = { colSpan: 1, rowSpan: 1 };

export function createInitialConfig() {
  return {};
}

export function render(container, tile, ctx) {
  container.innerHTML = `
    <div style="font-size:12px; color:var(--text-soft); display:flex; flex-direction:column; gap:4px;">
      <div><strong>Platform:</strong> <span id="sysPlat-${tile.instanceId}"></span></div>
      <div><strong>UA:</strong> <span id="sysUa-${tile.instanceId}"></span></div>
      <div><strong>Memory:</strong> <span id="sysMem-${tile.instanceId}"></span></div>
      <div><strong>Battery:</strong> <span id="sysBat-${tile.instanceId}"></span></div>
      <div><strong>Online:</strong> <span id="sysNet-${tile.instanceId}"></span></div>
    </div>
  `;
  updateStatus(tile.instanceId);
  setInterval(() => updateStatus(tile.instanceId), 10000);
}

async function updateStatus(id) {
  const plat = navigator.platform || "N/A";
  const ua = navigator.userAgent || "N/A";
  const mem = navigator.deviceMemory ? navigator.deviceMemory + " GB" : "unknown";
  const online = navigator.onLine ? "online" : "offline";

  const platEl = document.getElementById(`sysPlat-${id}`);
  const uaEl = document.getElementById(`sysUa-${id}`);
  const memEl = document.getElementById(`sysMem-${id}`);
  const batEl = document.getElementById(`sysBat-${id}`);
  const netEl = document.getElementById(`sysNet-${id}`);

  if (!platEl) return;

  platEl.textContent = plat;
  uaEl.textContent = ua;
  memEl.textContent = mem;
  netEl.textContent = online;

  if (navigator.getBattery) {
    try {
      const bat = await navigator.getBattery();
      const pct = Math.round(bat.level * 100);
      batEl.textContent = `${pct}% ${bat.charging ? "(charging)" : ""}`;
    } catch {
      batEl.textContent = "unknown";
    }
  } else {
    batEl.textContent = "N/A";
  }
}

export function buildSettingsUI(panel, tile, ctx) {
  panel.innerHTML = `<div class="ts-row"><span>Basic browser-side system info.</span></div>`;
}
export function saveConfig(panel, tile, ctx) {}
