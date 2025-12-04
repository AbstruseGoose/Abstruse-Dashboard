export const id = "clock";
export const label = "Clock";
export const defaultSize = { w: 1, h: 1 };

export function render(root) {
  root.innerHTML = `
    <div style="font-size:26px;font-weight:600;" id="${id}-time"></div>
    <div style="font-size:13px;color:var(--text-soft);" id="${id}-date"></div>
  `;
  const tEl = root.querySelector(`#${id}-time`);
  const dEl = root.querySelector(`#${id}-date`);
  function tick() {
    const now = new Date();
    tEl.textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    dEl.textContent = now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  }
  tick();
  setInterval(tick, 1000);
}
