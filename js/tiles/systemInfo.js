// js/tiles/systemInfo.js
export const id = "systemInfo";
export const label = "System Info";
export const defaultSize = { w: 1, h: 1 };

export function render(root) {
  const uid = `sysinfo-${Math.random().toString(36).slice(2, 8)}`;

  root.innerHTML = `
    <div style="font-size:13px;line-height:1.4;">
      <div><strong>Platform:</strong> <span id="${uid}-platform"></span></div>
      <div><strong>Browser:</strong> <span id="${uid}-browser"></span></div>
      <div><strong>Memory:</strong> <span id="${uid}-mem"></span></div>
      <div><strong>Battery:</strong> <span id="${uid}-bat"></span></div>
      <div><strong>Network:</strong> <span id="${uid}-net"></span></div>
    </div>
  `;

  const platEl = root.querySelector(`#${uid}-platform`);
  const browEl = root.querySelector(`#${uid}-browser`);
  const memEl  = root.querySelector(`#${uid}-mem`);
  const batEl  = root.querySelector(`#${uid}-bat`);
  const netEl  = root.querySelector(`#${uid}-net`);

  platEl.textContent = navigator.platform || "Unknown";
  browEl.textContent = navigator.userAgent.slice(0, 60) + "...";

  // Memory (approx)
  if (navigator.deviceMemory) {
    memEl.textContent = `${navigator.deviceMemory} GB (approx device memory)`;
  } else {
    memEl.textContent = "Not available";
  }

  // Battery
  if (navigator.getBattery) {
    navigator.getBattery().then(b => {
      const level = Math.round((b.level || 0) * 100);
      batEl.textContent = `${level}% ${b.charging ? "(charging)" : ""}`;
    }).catch(() => {
      batEl.textContent = "Not available";
    });
  } else {
    batEl.textContent = "Not available";
  }

  // Network info (Android/modern browsers)
  function updateNet() {
    const online = navigator.onLine ? "Online" : "Offline";
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!conn) {
      netEl.textContent = online;
      return;
    }
    const type = conn.effectiveType || conn.type || "unknown";
    const down = conn.downlink ? `${conn.downlink} Mbps` : "";
    const rtt  = conn.rtt ? `${conn.rtt} ms` : "";
    netEl.textContent = `${online} (${type}${down ? ", " + down : ""}${rtt ? ", " + rtt : ""})`;
  }

  updateNet();
  window.addEventListener("online", updateNet);
  window.addEventListener("offline", updateNet);
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (conn) conn.addEventListener("change", updateNet);
}

export function buildSettings(extra) {
  extra.innerHTML = `
    <div class="ts-row">
      <span>Shows basic browser/device info from the current client.</span>
    </div>
  `;
}
