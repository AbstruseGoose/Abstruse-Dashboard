// js/tiles/speed.js
export const id = "speed";
export const label = "Speed / Ping";
export const defaultSize = { colSpan: 1, rowSpan: 1 };

export function createInitialConfig() {
  return {
    speedUrl: "https://www.abstrusenetworks.com/speedtest.bin",
    pingTarget: "https://dns.google/resolve?name=google.com"
  };
}

export function render(container, tile, ctx) {
  container.innerHTML = `
    <div class="speedStats">
      <div class="speedLine">
        <div class="speedLabel">Ping</div>
        <div class="speedValue speedPingVal statusWarn">-- ms</div>
      </div>
      <div class="speedLine">
        <div class="speedLabel">Download</div>
        <div class="speedValue speedDownVal statusWarn">-- Mbps</div>
      </div>
    </div>
    <button class="speedBtn">Run speed & ping</button>
  `;

  const btn = container.querySelector(".speedBtn");
  btn.addEventListener("click", () => {
    runPing(tile);
    runSpeed(tile);
  });
}

function setStatusColor(el, val, type) {
  let cls = "statusGood";
  if (type === "ping") {
    if (val > 200) cls = "statusBad";
    else if (val > 80) cls = "statusWarn";
  } else if (type === "speed") {
    if (val < 5) cls = "statusBad";
    else if (val < 20) cls = "statusWarn";
  }
  el.classList.remove("statusGood", "statusWarn", "statusBad");
  el.classList.add(cls);
}

async function runPing(tile) {
  const root = document.querySelector(`[data-instance-id="${tile.instanceId}"] .tileInner`);
  if (!root) return;
  const pingEl = root.querySelector(".speedPingVal");
  const url = tile.config.pingTarget || createInitialConfig().pingTarget;
  const start = performance.now();
  try {
    await fetch(url, { cache: "no-store" });
    const ms = Math.round(performance.now() - start);
    pingEl.textContent = ms + " ms";
    setStatusColor(pingEl, ms, "ping");
  } catch {
    pingEl.textContent = "offline";
    pingEl.classList.remove("statusGood", "statusWarn");
    pingEl.classList.add("statusBad");
  }
}

async function runSpeed(tile) {
  const root = document.querySelector(`[data-instance-id="${tile.instanceId}"] .tileInner`);
  if (!root) return;
  const speedEl = root.querySelector(".speedDownVal");
  const url = tile.config.speedUrl || createInitialConfig().speedUrl;

  try {
    const start = performance.now();
    const response = await fetch(url + (url.includes("?") ? "&" : "?") + "t=" + Date.now(), {
      cache: "no-store"
    });
    let bytes = 0;
    if (response.body) {
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.length;
      }
    } else {
      const buf = await response.arrayBuffer();
      bytes = buf.byteLength;
    }
    const duration = (performance.now() - start) / 1000;
    const bits = bytes * 8;
    const mbps = (bits / duration) / 1e6;
    speedEl.textContent = mbps.toFixed(1) + " Mbps";
    setStatusColor(speedEl, mbps, "speed");
  } catch (e) {
    console.error("Speedtest error", e);
    speedEl.textContent = "ERR";
    speedEl.classList.remove("statusGood", "statusWarn");
    speedEl.classList.add("statusBad");
  }
}

export function buildSettingsUI(panel, tile, ctx) {
  panel.innerHTML = `
    <div class="ts-row">
      <label>Speed URL
        <input type="text" class="ts-speed-url" value="${tile.config.speedUrl}">
      </label>
    </div>
    <div class="ts-row">
      <label>Ping URL
        <input type="text" class="ts-ping-url" value="${tile.config.pingTarget}">
      </label>
    </div>
  `;
}
export function saveConfig(panel, tile, ctx) {
  const su = panel.querySelector(".ts-speed-url");
  const pu = panel.querySelector(".ts-ping-url");
  tile.config.speedUrl = su.value.trim() || tile.config.speedUrl;
  tile.config.pingTarget = pu.value.trim() || tile.config.pingTarget;
}
