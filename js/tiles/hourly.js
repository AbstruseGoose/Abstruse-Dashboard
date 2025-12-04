// js/tiles/hourly.js
import { getWeatherData } from "../core/weatherEngine.js";

export const id = "hourly";
export const label = "Hourly Forecast";
export const defaultSize = { colSpan: 2, rowSpan: 1 };

export function createInitialConfig() {
  return {};
}

export function render(container, tile, ctx) {
  container.innerHTML = `
    <div class="hourlyStrip" id="hourlyStrip-${tile.instanceId}"></div>
  `;
  renderHourly(tile.instanceId);
  window.addEventListener("weatherUpdated", () => renderHourly(tile.instanceId));
}

function renderHourly(id) {
  const data = getWeatherData();
  const strip = document.getElementById(`hourlyStrip-${id}`);
  if (!data || !data.list || !strip) return;

  strip.innerHTML = "";
  const list = data.list.slice(0, 12);
  list.forEach(hr => {
    const t = new Date(hr.dt * 1000).toLocaleTimeString([], { hour: "numeric" });
    const hrTemp = Math.round(hr.main.temp);
    const icon = hr.weather[0].icon;
    const pop = Math.round((hr.pop || 0) * 100);
    const item = document.createElement("div");
    item.className = "hourItem";
    item.innerHTML = `
      <div>${t}</div>
      <img src="https://openweathermap.org/img/wn/${icon}.png" alt="">
      <div class="hourTemp">${hrTemp}°F</div>
      <div class="hourRain">${pop}% 🌧️</div>
    `;
    strip.appendChild(item);
  });
}

export function buildSettingsUI(panel, tile, ctx) {
  panel.innerHTML = `<div class="ts-row"><span>12-hour strip using OpenWeather forecast.</span></div>`;
}
export function saveConfig(panel, tile, ctx) {}
