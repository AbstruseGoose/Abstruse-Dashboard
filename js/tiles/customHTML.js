export const id = "customHTML";
export const label = "Custom HTML";
export const defaultSize = { w: 1, h: 1 };

export function createInitialState() {
  return { html: "<div>Custom tile</div>" };
}

export function render(root, tileCfg) {
  root.innerHTML = tileCfg.config.html || "<div>Empty custom HTML tile</div>";
}

export function buildSettings(extra, tileCfg, ctx) {
  extra.innerHTML = `
    <div class="ts-row">
      <label>HTML content
        <textarea class="ts-html" rows="4">${tileCfg.config.html || ""}</textarea>
      </label>
    </div>
  `;
  const panel = extra.parentElement;
  const saveBtn = panel.querySelector(".ts-save");
  saveBtn.onclick = () => {
    const ta = panel.querySelector(".ts-html");
    tileCfg.config.html = ta.value;
    ctx.updateConfig(() => {});
    ctx.requestRerender();
  };
}
