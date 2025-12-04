export const id = "iframe";
export const label = "URL Viewer";
export const defaultSize = { w: 2, h: 2 };

export function createInitialState() {
  return { url: "https://www.abstrusenetworks.com" };
}

export function render(root, tileCfg, ctx) {
  root.innerHTML = `
    <div style="display:flex;flex-direction:column;height:100%;">
      <input type="text" id="${tileCfg.id}-url" value="${tileCfg.config.url || ""}" style="font-size:12px;padding:2px 4px;border-radius:6px;border:1px solid rgba(255,255,255,0.25);background:rgba(0,0,0,0.85);color:var(--text-main);margin-bottom:4px;">
      <iframe id="${tileCfg.id}-frame" src="${tileCfg.config.url || ""}" style="flex:1;border-radius:8px;border:1px solid rgba(255,255,255,0.25);background:#000;"></iframe>
    </div>
  `;
  const urlInput = root.querySelector(`#${tileCfg.id}-url`);
  const frame = root.querySelector(`#${tileCfg.id}-frame`);
  urlInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      tileCfg.config.url = urlInput.value.trim();
      frame.src = tileCfg.config.url;
      ctx.updateConfig(() => {});
    }
  });
}
