export const id = "notes";
export const label = "Notes";
export const defaultSize = { w: 1, h: 1 };

export function createInitialState() {
  return { text: "" };
}

export function render(root, tileCfg, ctx) {
  root.innerHTML = `
    <textarea
      id="${tileCfg.id}-area"
      style="flex:1;width:100%;height:100%;resize:none;font-size:12px;padding:4px;border-radius:8px;border:1px solid rgba(255,255,255,0.25);background:rgba(0,0,0,0.85);color:var(--text-main);"
      placeholder="Scratchpad for quick notes...">${tileCfg.config.text || ""}</textarea>
  `;
  const ta = root.querySelector(`#${tileCfg.id}-area`);
  ta.addEventListener("input", () => {
    tileCfg.config.text = ta.value;
    ctx.updateConfig(() => {});
  });
}
