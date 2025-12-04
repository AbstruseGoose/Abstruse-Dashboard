// js/tiles/cameraDiscovery.js
export const id = "camAuto";
export const label = "Camera Discovery";
export const defaultSize = { colSpan: 1, rowSpan: 1 };

export function createInitialConfig() {
  return {
    subnetPrefix: "192.168.1.",
    discoveredIp: "",
    discoveredPath: "",
    username: "",
    password: ""
  };
}

export function render(container, tile, ctx) {
  container.innerHTML = `
    <div class="camDiscover">
      <div class="camDiscoverStatus">Idle. Click scan to search.</div>
      <div class="camDiscoverPreview">
        <img class="camDiscoverImg" style="display:none;" />
        <div class="camDiscoverMeta">No camera discovered yet.</div>
      </div>
      <div class="camDiscoverButtons">
        <button class="camDiscoverScan">Scan subnet</button>
        <button class="camDiscoverApply">Apply to first Camera tile</button>
      </div>
    </div>
  `;

  const statusEl = container.querySelector(".camDiscoverStatus");
  const imgEl = container.querySelector(".camDiscoverImg");
  const metaEl = container.querySelector(".camDiscoverMeta");
  const scanBtn = container.querySelector(".camDiscoverScan");
  const applyBtn = container.querySelector(".camDiscoverApply");

  if (tile.config.discoveredIp && tile.config.discoveredPath) {
    const url = buildDiscoveredUrl(tile.config);
    imgEl.src = url;
    imgEl.style.display = "block";
    metaEl.textContent = `${tile.config.discoveredIp} ${tile.config.discoveredPath}`;
    statusEl.textContent = "Previously discovered camera.";
  }

  scanBtn.addEventListener("click", async () => {
    scanBtn.disabled = true;
    applyBtn.disabled = true;
    await runScan(tile, container);
    scanBtn.disabled = false;
    applyBtn.disabled = false;
  });

  applyBtn.addEventListener("click", () => {
    if (!tile.config.discoveredIp || !tile.config.discoveredPath) {
      alert("No discovered camera yet.");
      return;
    }
    const st = ctx.state;
    const camTile = st.tiles.find(t => t.typeId === "cam");
    if (!camTile) {
      alert("No Camera tile to apply to.");
      return;
    }
    camTile.config.url = "http://" + tile.config.discoveredIp;
    camTile.config.username = tile.config.username || "";
    camTile.config.password = tile.config.password || "";
    localStorage.setItem("abstruse_dashboard_modular_v1", JSON.stringify(st));
    window.location.reload();
  });
}

function buildDiscoveredUrl(cfg) {
  try {
    const base = "http://" + cfg.discoveredIp;
    const u = new URL(base);
    u.pathname = cfg.discoveredPath.split("?")[0];
    const qs = cfg.discoveredPath.includes("?") ? cfg.discoveredPath.split("?")[1] : "";
    const ts = "t=" + Date.now();
    u.search = qs ? qs + "&" + ts : ts;
    if (cfg.username) u.username = cfg.username;
    if (cfg.password) u.password = cfg.password;
    return u.toString();
  } catch {
    return "";
  }
}

function probeImage(url, timeoutMs = 1500) {
  return new Promise(resolve => {
    const img = new Image();
    let done = false;
    const timer = setTimeout(() => {
      if (done) return;
      done = true;
      resolve(false);
    }, timeoutMs);
    img.onload = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      resolve(true);
    };
    img.onerror = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      resolve(false);
    };
    img.src = url;
  });
}

async function runScan(tile, container) {
  const statusEl = container.querySelector(".camDiscoverStatus");
  const imgEl = container.querySelector(".camDiscoverImg");
  const metaEl = container.querySelector(".camDiscoverMeta");

  const subnet = tile.config.subnetPrefix || "192.168.1.";
  statusEl.textContent = "Scanning " + subnet + "1–254…";

  const paths = [
    "/cgi-bin/mjpg/video.cgi?channel=1&subtype=1",
    "/cgi-bin/mjpg/video.cgi?channel=0&subtype=1",
    "/mjpeg",
    "/video.mjpeg",
    "/snapshot.jpg",
    "/image.jpg"
  ];
  const creds = [
    { user: "", pass: "" },
    { user: "admin", pass: "admin" },
    { user: "admin", pass: "" }
  ];

  let found = null;

  outer:
  for (let host = 1; host <= 254; host++) {
    const ip = subnet + host;
    statusEl.textContent = "Testing " + ip + "...";
    for (const path of paths) {
      for (const c of creds) {
        try {
          const u = new URL("http://" + ip);
          u.pathname = path.split("?")[0];
          const qs = path.includes("?") ? path.split("?")[1] : "";
          const ts = "t=" + Date.now();
          u.search = qs ? qs + "&" + ts : ts;
          if (c.user) u.username = c.user;
          if (c.pass) u.password = c.pass;
          const ok = await probeImage(u.toString());
          if (ok) {
            found = { ip, path, username: c.user, password: c.pass };
            break outer;
          }
        } catch (e) {
          console.error("Probe error", e);
        }
      }
    }
  }

  if (!found) {
    statusEl.textContent = "Scan complete — no cameras found.";
    imgEl.style.display = "none";
    metaEl.textContent = "No match.";
    return;
  }

  tile.config.discoveredIp = found.ip;
  tile.config.discoveredPath = found.path;
  tile.config.username = found.username;
  tile.config.password = found.password;

  statusEl.textContent = "Camera found at " + found.ip;
  const url = buildDiscoveredUrl(tile.config);
  imgEl.src = url;
  imgEl.style.display = "block";
  metaEl.textContent = found.ip + " " + found.path +
    (found.username ? " [" + found.username + "]" : "");
}

export function buildSettingsUI(panel, tile, ctx) {
  panel.innerHTML = `
    <div class="ts-row">
      <label>Subnet prefix
        <input type="text" class="ts-subnet" value="${tile.config.subnetPrefix}">
      </label>
    </div>
  `;
}
export function saveConfig(panel, tile, ctx) {
  const sp = panel.querySelector(".ts-subnet");
  tile.config.subnetPrefix = sp.value.trim() || tile.config.subnetPrefix;
}
