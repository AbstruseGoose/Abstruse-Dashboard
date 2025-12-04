// js/tiles/camera.js
export const id = "cam";
export const label = "Camera";
export const defaultSize = { colSpan: 1, rowSpan: 1 };

export function createInitialConfig() {
  return {
    url: "http://192.168.1.78",
    username: "",
    password: ""
  };
}

export function render(container, tile, ctx) {
  container.innerHTML = `
    <div class="camView">
      <img id="camImg-${tile.instanceId}" alt="${tile.label}">
    </div>
  `;
  const img = container.querySelector("img");
  setupCamStream(img, tile);
}

function buildCamStreamUrl(cfg) {
  try {
    const base = cfg.url || "http://192.168.1.78";
    const u = new URL(base);
    u.pathname = "/cgi-bin/mjpg/video.cgi";
    u.search = "channel=1&subtype=1&t=" + Date.now();
    if (cfg.username) u.username = cfg.username;
    if (cfg.password) u.password = cfg.password;
    return u.toString();
  } catch (e) {
    console.error("Cam URL error", e);
    return cfg.url;
  }
}

function setupCamStream(img, tile) {
  function refresh() {
    img.src = buildCamStreamUrl(tile.config);
  }
  refresh();
  setInterval(refresh, 20000);
}

export function buildSettingsUI(panel, tile, ctx) {
  panel.innerHTML = `
    <div class="ts-row">
      <label>Base URL
        <input type="text" class="ts-cam-url" value="${tile.config.url}">
      </label>
    </div>
    <div class="ts-row">
      <label>Username
        <input type="text" class="ts-cam-user" value="${tile.config.username}">
      </label>
      <label>Password
        <input type="password" class="ts-cam-pass" value="${tile.config.password}">
      </label>
    </div>
  `;
}
export function saveConfig(panel, tile, ctx) {
  const u = panel.querySelector(".ts-cam-url");
  const usr = panel.querySelector(".ts-cam-user");
  const pw = panel.querySelector(".ts-cam-pass");
  tile.config.url = u.value.trim() || tile.config.url;
  tile.config.username = usr.value.trim();
  tile.config.password = pw.value;
}
