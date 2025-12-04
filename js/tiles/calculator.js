export const id = "calculator";
export const label = "Calculator";
export const defaultSize = { w: 1, h: 1 };

export function render(root) {
  root.innerHTML = `
    <input type="text" id="${id}-expr" placeholder="e.g. (5*3)+2" style="width:100%;font-size:12px;padding:3px 4px;border-radius:6px;border:1px solid rgba(255,255,255,0.25);background:rgba(0,0,0,0.85);color:var(--text-main);margin-bottom:4px;" />
    <button id="${id}-btn" style="font-size:12px;padding:2px 8px;border-radius:999px;border:1px solid rgba(255,255,255,0.25);background:rgba(0,0,0,0.85);color:var(--text-main);cursor:pointer;">=</button>
    <div id="${id}-out" style="margin-top:4px;font-size:13px;"></div>
  `;
  const exprEl = root.querySelector(`#${id}-expr`),
    btn = root.querySelector(`#${id}-btn`),
    outEl = root.querySelector(`#${id}-out`);

  function calc() {
    const expr = exprEl.value.trim();
    if (!expr) return;
    try {
      // VERY small helper – not hardened; fine for local dashboard use
      // eslint-disable-next-line no-eval
      const res = eval(expr);
      outEl.textContent = "= " + res;
    } catch {
      outEl.textContent = "Error";
    }
  }
  btn.addEventListener("click", calc);
  exprEl.addEventListener("keydown", e => {
    if (e.key === "Enter") calc();
  });
}
