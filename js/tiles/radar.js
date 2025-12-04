// js/tiles/radar.js
import { getLocation } from "../core/weatherEngine.js";

export const id = "radar";
export const label = "Live Radar";
export const defaultSize = { colSpan: 2, rowSpan: 2 };

let radarMap = null;
let radarLayer = null;
let radarBaseLayer = null;
let radarFrames = [];
let radarFrameIndex = 0;
let radarAnimTimer = null;
let radarHost = "https://tilecache.rainviewer.com";

export function createInitialConfig() {
  return {
    rain: true,
    gpsLock: true,
    animSpeedMs: 700,
    opacity: 0.7,
    baseLayer: "dark"
  };
}

export function render(container, tile, ctx) {
  container.innerHTML = `<div id="radarMap-${tile.instanceId}" style="flex:1; border-radius:8px;"></div>`;
  initRadar(tile);
}

async function initRadar(tile) {
  const mapDiv = document.getElementById(`radarMap-${tile.instanceId}`);
  if (!mapDiv || typeof L === "undefined") return;

  const cfg = tile.config;
  const loc = getLocation();
  const lat = cfg.gpsLock && loc.lat != null ? loc.lat : 36.03;
  const lon = cfg.gpsLock && loc.lon != null ? loc.lon : -84.15;

  if (!radarMap) {
    radarMap = L.map(mapDiv, { zoomControl: true, attributionControl: false });
  } else {
    radarMap._container = mapDiv;
    radarMap.invalidateSize();
  }

  radarMap.setView([lat, lon], 8);

  if (radarBaseLayer) radarMap.removeLayer(radarBaseLayer);
  const base = cfg.baseLayer || "dark";
  if (base === "light") {
    radarBaseLayer = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      { maxZoom: 18 }
    ).addTo(radarMap);
  } else {
    radarBaseLayer = L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
      { maxZoom: 18 }
    ).addTo(radarMap);
  }

  await loadRadarData(tile);
}

async function loadRadarData(tile) {
  try {
    const res = await fetch("https://api.rainviewer.com/public/weather-maps.json");
    const data = await res.json();
    radarHost = data.host || "https://tilecache.rainviewer.com";
    const past = data.radar && data.radar.past ? data.radar.past : [];
    if (!past.length) return;
    radarFrames = past.slice(-8);
    radarFrameIndex = 0;
    updateRadarLayer(tile);

    if (radarAnimTimer) clearInterval(radarAnimTimer);
    const speed = tile.config.animSpeedMs || 700;
    radarAnimTimer = setInterval(() => {
      radarFrameIndex = (radarFrameIndex + 1) % radarFrames.length;
      updateRadarLayer(tile);
    }, speed);
  } catch (e) {
    console.error("Radar data error", e);
  }
}

function radarTileUrl(framePath) {
  return radarHost + framePath + "/256/{z}/{x}/{y}/2/1_1.png";
}

function updateRadarLayer(tile) {
  if (!radarMap || !radarFrames.length) return;
  const frame = radarFrames[radarFrameIndex];
  const urlTemplate = radarTileUrl(frame.path);
  const opacity = tile.config.rain ? (tile.config.opacity || 0.7) : 0.0;

  if (radarLayer) {
    radarLayer.setUrl(urlTemplate);
    radarLayer.setOpacity(opacity);
  } else {
    radarLayer = L.tileLayer(urlTemplate, { opacity });
    radarLayer.addTo(radarMap);
  }
}

export function buildSettingsUI(panel, tile, ctx) {
  panel.innerHTML = `
    <div class="ts-row">
      <label><input type="checkbox" class="ts-rain" ${tile.config.rain ? "checked" : ""}> Rain</label>
      <label><input type="checkbox" class="ts-gps" ${tile.config.gpsLock ? "checked" : ""}> GPS Lock</label>
    </div>
  `;
}
export function saveConfig(panel, tile, ctx) {
  const rain = panel.querySelector(".ts-rain");
  const gps = panel.querySelector(".ts-gps");
  tile.config.rain = !!rain?.checked;
  tile.config.gpsLock = !!gps?.checked;
}
