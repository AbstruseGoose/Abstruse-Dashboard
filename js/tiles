// js/tiles/now.js
import { getWeatherData } from "../core/weatherEngine.js";

export const id = "now";
export const label = "Now / Weather";
export const defaultSize = { colSpan: 2, rowSpan: 1 };

export function createInitialConfig() {
  return {};
}

export function render(container, tile, ctx) {
  container.innerHTML = `
    <div class="nowTime" id="nowTime-${tile.instanceId}">--:--</div>
    <div class="nowDate" id="nowDate-${tile.instanceId}"></div>
    <div class="nowRow">
      <div class="nowWeatherMain">
        <img id="nowIcon-${tile.instanceId}" alt="Weather" />
        <div>
          <div class="nowTemp" id="nowTemp-${tile.instanceId}">--°F</div>
          <div class="nowDesc" id="nowDesc-${tile.instanceId}">Loading...</div>
        </div>
      </div>
      <div style="text-align:right;">
        <div class="nowRain" id="nowRain-${tile.instanceId}">--% 🌧️</div>
      </div>
    </div>
  `;

  updateClock(tile.instanceId);
  setInterval(() => updateClock(tile.instanceId), 1000);
  updateWeather(tile.instanceId);

  window.addEventListener("weatherUpdated", () => {
    updateWeather(tile.instanceId);
  });
}

function updateClock(id) {
  const now = new Date();
  const tEl = document.getElementById(`nowTime-${id}`);
  const dEl = document.getElementById(`nowDate-${id}`);
  if (!tEl || !dEl) return;
  tEl.textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  dEl.textContent = now.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

function updateWeather(id) {
  const data = getWeatherData();
  if (!data || !data.list || !data.list.length) return;
  const current = data.list[0];

  const iconEl = document.getElementById(`nowIcon-${id}`);
  const tempEl = document.getElementById(`nowTemp-${id}`);
  const descEl = document.getElementById(`nowDesc-${id}`);
  const rainEl = document.getElementById(`nowRain-${id}`);
  if (!iconEl) return;

  const icon = current.weather[0].icon;
  const temp = Math.round(current.main.temp);
  const desc = current.weather[0].description;
  const pop  = Math.round((current.pop || 0) * 100);

  iconEl.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
  tempEl.textContent = `${temp}°F`;
  descEl.textContent = desc;
  rainEl.textContent = `${pop}% 🌧️`;
}

export function buildSettingsUI(panel, tile, ctx) {
  panel.innerHTML = `<div class="ts-row"><span>Current time & weather (no extra settings yet).</span></div>`;
}
export function saveConfig(panel, tile, ctx) {
  // nothing yet
}
