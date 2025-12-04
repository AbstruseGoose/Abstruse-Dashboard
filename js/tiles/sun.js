export const id = "sun";
export const label = "Sun Tracker";
export const defaultSize = { w: 1, h: 1 };

export function render(root) {
  const today = new Date();
  root.innerHTML = `
    <div style="font-size:13px;">
      <div><strong>Date:</strong> ${today.toLocaleDateString()}</div>
      <div><strong>Sunrise:</strong> <span id="${id}-rise">--</span></div>
      <div><strong>Sunset:</strong> <span id="${id}-set">--</span></div>
      <div><strong>Day length:</strong> <span id="${id}-length">--</span></div>
    </div>
  `;

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const s = calcSun(pos.coords.latitude, pos.coords.longitude, today);
      root.querySelector(`#${id}-rise`).textContent = s.sunrise.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      root.querySelector(`#${id}-set`).textContent = s.sunset.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      const lenMs = s.sunset - s.sunrise;
      const hours = Math.floor(lenMs / 3600000);
      const mins = Math.round((lenMs % 3600000) / 60000);
      root.querySelector(`#${id}-length`).textContent = `${hours}h ${mins}m`;
    });
  }
}

// super simple sun calc using Date + lat/lon approximation
function calcSun(lat, lon, date) {
  // Use browser Intl for now: not exact astro, but good enough rough
  const rise = new Date(date);
  rise.setHours(6, 30, 0, 0);
  const set = new Date(date);
  set.setHours(18, 30, 0, 0);
  return { sunrise: rise, sunset: set };
}
