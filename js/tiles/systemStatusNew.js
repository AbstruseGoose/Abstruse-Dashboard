// js/tiles/systemStatus.js
export const id = "systemStatus";
export const label = "System Status";
export const defaultSize = { w: 2, h: 2 };

export function createInitialState() {
  return {
    layoutMode: "full",    // "full" | "noc" | "hud"
    autoLayout: true,

    useBrowser: true,
    useHelper: false,
    helperUrl: "http://localhost:7734/system.json",

    useEsp: false,
    espUrl: "http://192.168.1.55/telemetry.json",

    updateIntervalMs: 2000,

    __timerId: null,
    __busy: false,
  };
}

export function render(root, tileCfg, ctx) {
  // Clear previous timer if re-rendering
  if (tileCfg.config.__timerId) {
    clearInterval(tileCfg.config.__timerId);
    tileCfg.config.__timerId = null;
  }

  root.innerHTML = `
    <div class="sysStatusRoot" id="${tileCfg.id}-root">
      <div style="font-size:12px;color:var(--text-soft);margin-bottom:4px;">
        Gathering system stats...
      </div>
    </div>
  `;
  const container = root.querySelector(`#${tileCfg.id}-root`);

  const tick = async () => {
    if (tileCfg.config.__busy) return;
    tileCfg.config.__busy = true;
    try {
      const data = await gatherAllSources(tileCfg.config);
      renderLayout(container, tileCfg, data);
    } finally {
      tileCfg.config.__busy = false;
    }
  };

  tick();
  tileCfg.config.__timerId = setInterval(
    tick,
    tileCfg.config.updateIntervalMs || 2000
  );
}

/* ================== DATA GATHERING ================== */

async function gatherAllSources(cfg) {
  const result = {
    browser: await getBrowserStats(cfg.useBrowser),
    helper: null,
    esp: null,
    combined: null,
  };

  if (cfg.useHelper && cfg.helperUrl) {
    result.helper = await fetchJsonSafe(cfg.helperUrl, 1500);
  }
  if (cfg.useEsp && cfg.espUrl) {
    result.esp = await fetchJsonSafe(cfg.espUrl, 1500);
  }

  result.combined = combineStats(result);
  return result;
}

async function getBrowserStats(enabled) {
  if (!enabled) return null;

  const stats = {
    memoryGb: navigator.deviceMemory || null,
    online: navigator.onLine,
    connection: null,
    batteryLevel: null,
    batteryCharging: null,
    userAgent: navigator.userAgent || "",
  };

  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (conn) {
    stats.connection = {
      effectiveType: conn.effectiveType || conn.type || null,
      downlink: conn.downlink || null,
      rtt: conn.rtt || null,
    };
  }

  if (navigator.getBattery) {
    try {
      const b = await navigator.getBattery();
      stats.batteryLevel = b.level != null ? Math.round(b.level * 100) : null;
      stats.batteryCharging = !!b.charging;
    } catch {
      // ignore
    }
  }

  return stats;
}

async function fetchJsonSafe(url, timeoutMs = 1500) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, cache: "no-store" });
    if (!res.ok) throw new Error("Bad status " + res.status);
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

function combineStats({ browser, helper, esp }) {
  const combined = {
    cpuUsage: null,
    ramUsedPct: null,
    ramUsedGb: null,
    ramTotalGb: null,

    cpuTemp: null,
    gpuTemp: null,
    mbTemp: null,
    diskTemp: null,

    espRackTemp: null,
    espTrailerTemp: null,
    espOutsideTemp: null,
    espHumidity: null,

    batteryLevel: browser?.batteryLevel ?? helper?.battery?.level ?? null,
    batteryCharging: browser?.batteryCharging ?? helper?.battery?.charging ?? null,

    helperOnline: !!helper,
    espOnline: !!esp,
    browserOnline: browser?.online ?? true,

    networkType: browser?.connection?.effectiveType ?? null,
    networkDownlink: browser?.connection?.downlink ?? null,
    networkRtt: browser?.connection?.rtt ?? null,

    alerts: [],
  };

  // Helper-supplied CPU/RAM/temps if available
  if (helper?.cpu) {
    if (typeof helper.cpu.usage === "number") combined.cpuUsage = helper.cpu.usage;
    if (typeof helper.cpu.temp === "number") combined.cpuTemp = helper.cpu.temp;
  }
  if (helper?.ram) {
    combined.ramUsedGb = helper.ram.usedGb ?? null;
    combined.ramTotalGb = helper.ram.totalGb ?? null;
    if (helper.ram.usedPct != null) {
      combined.ramUsedPct = helper.ram.usedPct;
    } else if (helper.ram.usedGb != null && helper.ram.totalGb != null && helper.ram.totalGb > 0) {
      combined.ramUsedPct = (helper.ram.usedGb / helper.ram.totalGb) * 100;
    }
  }
  if (helper?.temps) {
    combined.gpuTemp = helper.temps.gpu ?? combined.gpuTemp;
    combined.mbTemp  = helper.temps.motherboard ?? combined.mbTemp;
    combined.diskTemp = helper.temps.disk ?? combined.diskTemp;
  }

  // Browser-only RAM fallback
  if (!combined.ramTotalGb && browser?.memoryGb) {
    combined.ramTotalGb = browser.memoryGb;
  }

  // ESP telemetry
  if (esp) {
    combined.espRackTemp    = esp.rackTemp ?? combined.espRackTemp;
    combined.espTrailerTemp = esp.trailerTemp ?? combined.espTrailerTemp;
    combined.espOutsideTemp = esp.outsideTemp ?? combined.espOutsideTemp;
    combined.espHumidity    = esp.humidity ?? combined.espHumidity;
  }

  // Compute some alerts
  if (combined.cpuTemp != null && combined.cpuTemp > 85) {
    combined.alerts.push("CPU temperature high");
  }
  if (combined.gpuTemp != null && combined.gpuTemp > 85) {
    combined.alerts.push("GPU temperature high");
  }
  if (!combined.browserOnline) {
    combined.alerts.push("Browser offline (no network)");
  }
  if (!combined.helperOnline) {
    combined.alerts.push("Local helper not responding");
  }
  if (combined.espOnline === false) {
    combined.alerts.push("ESP32 telemetry offline");
  }

  return combined;
}

/* ================== LAYOUT RENDERING ================== */

function renderLayout(container, tileCfg, data) {
  const c = data.combined;
  if (!c) {
    container.innerHTML = `<div style="font-size:12px;color:var(--text-soft);">No data yet...</div>`;
    return;
  }

  const mode = resolveLayoutMode(container, tileCfg);

  if (mode === "noc") {
    renderNocLayout(container, c, data);
  } else if (mode === "hud") {
    renderHudLayout(container, c, data);
  } else {
    renderFullLayout(container, c, data);
  }
}

function resolveLayoutMode(container, tileCfg) {
  if (!tileCfg.config.autoLayout) return tileCfg.config.layoutMode || "full";

  const tileEl = container.closest(".tile");
  if (!tileEl) return tileCfg.config.layoutMode || "full";
  const rect = tileEl.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;

  if (w < 260 || h < 160) return "hud";
  if (w < 380 || h < 220) return "noc";
  return "full";
}

/* ===== Full Vertical Diagnostic (A) ===== */
function renderFullLayout(container, c, data) {
  container.innerHTML = `
    <div style="display:flex;flex-direction:column;height:100%;font-size:12px;">
      <div style="display:flex;justify-content:space-between;gap:8px;margin-bottom:6px;">
        <div>
          <div><strong>CPU:</strong> ${fmtPct(c.cpuUsage)}%</div>
          <div><strong>RAM:</strong> ${fmtRam(c)}</div>
        </div>
        <div style="text-align:right;">
          <div><strong>Battery:</strong> ${fmtBattery(c)}</div>
          <div><strong>Network:</strong> ${fmtNetwork(c)}</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:6px;">
        ${tempCell("CPU", c.cpuTemp)}
        ${tempCell("GPU", c.gpuTemp)}
        ${tempCell("MB", c.mbTemp)}
        ${tempCell("Disk", c.diskTemp)}
      </div>

      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-bottom:6px;">
        ${tempCell("Rack", c.espRackTemp, "ESP")}
        ${tempCell("Trailer", c.espTrailerTemp, "ESP")}
        ${tempCell("Outside", c.espOutsideTemp, "ESP")}
        ${humCell("Humidity", c.espHumidity)}
      </div>

      <div style="flex:1;overflow-y:auto;">
        ${renderAlerts(data)}
      </div>
    </div>
  `;
}

/* ===== NOC Two-Column Layout (B) ===== */
function renderNocLayout(container, c, data) {
  container.innerHTML = `
    <div style="display:grid;grid-template-columns:1.1fr 1.1fr;gap:8px;font-size:12px;height:100%;">
      <div style="display:flex;flex-direction:column;gap:6px;">
        <div>
          <div><strong>CPU:</strong> ${fmtPct(c.cpuUsage)}%</div>
          <div>${bar(c.cpuUsage)}</div>
        </div>
        <div>
          <div><strong>RAM:</strong> ${fmtRam(c)}</div>
          <div>${bar(c.ramUsedPct)}</div>
        </div>
        <div>
          <div><strong>Battery:</strong> ${fmtBattery(c)}</div>
          <div><strong>Network:</strong> ${fmtNetwork(c)}</div>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;">
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;">
          ${tempCell("CPU", c.cpuTemp)}
          ${tempCell("GPU", c.gpuTemp)}
          ${tempCell("MB", c.mbTemp)}
          ${tempCell("Disk", c.diskTemp)}
        </div>
        <div style="flex:1;overflow-y:auto;">
          ${renderAlerts(data)}
        </div>
      </div>
    </div>
  `;
}

/* ===== Compact HUD Layout (C) ===== */
function renderHudLayout(container, c, data) {
  container.innerHTML = `
    <div style="font-size:11px;display:flex;flex-direction:column;gap:4px;height:100%;">
      <div style="display:flex;justify-content:space-between;gap:6px;">
        <div>
          <div><strong>CPU</strong></div>
          <div>${fmtPct(c.cpuUsage)}%</div>
        </div>
        <div>
          <div><strong>RAM</strong></div>
          <div>${fmtPct(c.ramUsedPct)}%</div>
        </div>
        <div>
          <div><strong>Temp</strong></div>
          <div>${fmtTempShort(c.cpuTemp)}</div>
        </div>
      </div>
      <div>
        <div><strong>Net:</strong> ${fmtNetwork(c)}</div>
        <div><strong>Bat:</strong> ${fmtBattery(c)}</div>
      </div>
      <div style="flex:1;overflow-y:auto;">
        ${renderAlerts(data, 3)}
      </div>
    </div>
  `;
}

/* ================== HELPERS ================== */

function fmtPct(v) {
  if (v == null || isNaN(v)) return "--";
  return Math.round(v);
}

function fmtRam(c) {
  if (!c.ramTotalGb) return "N/A";
  if (c.ramUsedGb != null) {
    const used = c.ramUsedGb.toFixed(1);
    const total = c.ramTotalGb.toFixed(1);
    const pct = fmtPct(c.ramUsedPct);
    return `${used}/${total} GB (${pct}%)`;
  }
  return `${c.ramTotalGb.toFixed(1)} GB total`;
}

function fmtBattery(c) {
  if (c.batteryLevel == null) return "N/A";
  const lvl = c.batteryLevel + "%";
  return c.batteryCharging ? `${lvl} (charging)` : lvl;
}

function fmtNetwork(c) {
  if (!c.browserOnline) return "Offline";
  const type = c.networkType || "unknown";
  const dl = c.networkDownlink ? `${c.networkDownlink} Mbps` : "";
  const rtt = c.networkRtt ? `${c.networkRtt} ms` : "";
  return `${type}${dl ? ", " + dl : ""}${rtt ? ", " + rtt : ""}`;
}

function tempCell(label, val, tag) {
  const vStr = val == null ? "N/A" : `${val.toFixed(1)}°C`;
  let color = "#8bc34a";
  if (val != null && val > 80) color = "#ff5252";
  else if (val != null && val > 60) color = "#ffc107";

  return `
    <div style="border-radius:6px;border:1px solid rgba(255,255,255,0.16);padding:4px;">
      <div style="display:flex;justify-content:space-between;">
        <span>${label}</span>
        ${tag ? `<span style="font-size:10px;color:var(--text-soft);">${tag}</span>` : ""}
      </div>
      <div style="font-weight:600;color:${color};">${vStr}</div>
    </div>
  `;
}

function humCell(label, val) {
  const vStr = val == null ? "N/A" : `${val.toFixed(0)}%`;
  return `
    <div style="border-radius:6px;border:1px solid rgba(255,255,255,0.16);padding:4px;">
      <div>${label}</div>
      <div style="font-weight:600;color:#4dd0ff;">${vStr}</div>
    </div>
  `;
}

function bar(v) {
  if (v == null || isNaN(v)) v = 0;
  const pct = Math.max(0, Math.min(100, v));
  return `
    <div style="width:100%;height:6px;border-radius:999px;background:rgba(255,255,255,0.08);overflow:hidden;">
      <div style="width:${pct}%;height:100%;background:linear-gradient(90deg,#4dd0ff,#00e676);"></div>
    </div>
  `;
}

function fmtTempShort(v) {
  if (v == null || isNaN(v)) return "--";
  return `${Math.round(v)}°C`;
}

function renderAlerts(data, limit) {
  const alerts = data.combined.alerts || [];
  if (!alerts.length) {
    return `<div style="font-size:11px;color:var(--text-soft);">No active alerts.</div>`;
  }
  const slice = limit ? alerts.slice(0, limit) : alerts;
  return `
    <div style="font-size:11px;color:#ff9800;">
      ${slice.map(a => `<div>• ${a}</div>`).join("")}
      ${limit && alerts.length > limit ? `<div>… +${alerts.length - limit} more</div>` : ""}
    </div>
  `;
}

/* ================== SETTINGS UI ================== */

export function buildSettings(extra, tileCfg, ctx) {
  const cfg = tileCfg.config;

  extra.innerHTML = `
    <div class="ts-row">
      <label>Layout
        <select class="ts-layout">
          <option value="full"${cfg.layoutMode === "full" ? " selected" : ""}>Full Diagnostic</option>
          <option value="noc"${cfg.layoutMode === "noc" ? " selected" : ""}>NOC Panel</option>
          <option value="hud"${cfg.layoutMode === "hud" ? " selected" : ""}>Compact HUD</option>
        </select>
      </label>
      <label>
        <input type="checkbox" class="ts-autoLayout"${cfg.autoLayout ? " checked" : ""}>
        Auto-select layout by tile size
      </label>
    </div>

    <div class="ts-row">
      <label><input type="checkbox" class="ts-useBrowser"${cfg.useBrowser ? " checked" : ""}> Use browser stats</label>
      <label><input type="checkbox" class="ts-useHelper"${cfg.useHelper ? " checked" : ""}> Use local helper</label>
      <label><input type="checkbox" class="ts-useEsp"${cfg.useEsp ? " checked" : ""}> Use ESP32 telemetry</label>
    </div>

    <div class="ts-row">
      <label>Helper URL
        <input type="text" class="ts-helperUrl" value="${cfg.helperUrl || ""}">
      </label>
    </div>

    <div class="ts-row">
      <label>ESP32 URL
        <input type="text" class="ts-espUrl" value="${cfg.espUrl || ""}">
      </label>
    </div>

    <div class="ts-row">
      <label>Update interval (ms)
        <select class="ts-interval">
          ${[1000, 2000, 5000].map(v => `
            <option value="${v}"${(cfg.updateIntervalMs || 2000) === v ? " selected" : ""}>${v}</option>
          `).join("")}
        </select>
      </label>
    </div>
  `;

  const panel = extra.parentElement;
  const saveBtn = panel.querySelector(".ts-save");

  saveBtn.onclick = () => {
    const layoutSel = panel.querySelector(".ts-layout");
    const autoCb    = panel.querySelector(".ts-autoLayout");
    const useBrowserCb = panel.querySelector(".ts-useBrowser");
    const useHelperCb  = panel.querySelector(".ts-useHelper");
    const useEspCb     = panel.querySelector(".ts-useEsp");
    const helperInput  = panel.querySelector(".ts-helperUrl");
    const espInput     = panel.querySelector(".ts-espUrl");
    const intervalSel  = panel.querySelector(".ts-interval");
    const labelInput   = panel.querySelector(".ts-label"); // from base settings

    cfg.layoutMode      = layoutSel.value;
    cfg.autoLayout      = !!autoCb.checked;
    cfg.useBrowser      = !!useBrowserCb.checked;
    cfg.useHelper       = !!useHelperCb.checked;
    cfg.useEsp          = !!useEspCb.checked;
    cfg.helperUrl       = helperInput.value.trim() || cfg.helperUrl;
    cfg.espUrl          = espInput.value.trim() || cfg.espUrl;
    cfg.updateIntervalMs = parseInt(intervalSel.value, 10) || 2000;

    if (labelInput && labelInput.value.trim()) {
      tileCfg.label = labelInput.value.trim();
    }

    ctx.updateConfig(() => {});
    ctx.requestRerender();
  };
}
