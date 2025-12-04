// js/core/weatherEngine.js
const API_KEY = "ce57b328ddd2af95c06b77dc11a49bf6";
let lastLat = null;
let lastLon = null;
let gpsTried = false;
let weatherData = null;

export function getLocation() {
  return { lat: lastLat, lon: lastLon };
}

export function getWeatherData() {
  return weatherData;
}

export function initWeatherEngine() {
  ensureLocationAndWeather();
  setInterval(ensureLocationAndWeather, 1000 * 60 * 5);
}

function ensureLocationAndWeather() {
  if (!gpsTried && lastLat == null && lastLon == null && navigator.geolocation) {
    gpsTried = true;
    navigator.geolocation.getCurrentPosition(
      pos => {
        lastLat = pos.coords.latitude;
        lastLon = pos.coords.longitude;
        fetchWeather();
      },
      err => {
        console.warn("GPS error, using fallback", err);
        fallbackLocation();
        fetchWeather();
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  } else {
    if (lastLat == null || lastLon == null) {
      fallbackLocation();
    }
    fetchWeather();
  }
}

function fallbackLocation() {
  // Rocky Top-ish
  lastLat = 36.03;
  lastLon = -84.15;
}

async function fetchWeather() {
  try {
    const url =
      "https://api.openweathermap.org/data/2.5/forecast" +
      `?lat=${encodeURIComponent(lastLat)}&lon=${encodeURIComponent(lastLon)}` +
      `&units=imperial&appid=${encodeURIComponent(API_KEY)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.list || !data.list.length) return;
    weatherData = data;
    window.dispatchEvent(new CustomEvent("weatherUpdated", { detail: { data } }));
  } catch (e) {
    console.error("Weather error", e);
  }
}
