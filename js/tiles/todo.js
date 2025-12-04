export const id = "todo";
export const label = "To-Do";
export const defaultSize = { w: 1, h: 1 };

export function createInitialState() {
  return {
    items: []
  };
}

export function render(root, tileCfg, ctx) {
  root.innerHTML = `
    <div style="display:flex;flex-direction:column;height:100%;">
      <div style="flex:1;overflow-y:auto;" id="${tileCfg.id}-list"></div>
      <div style="display:flex;gap:4px;margin-top:4px;">
        <input type="text" id="${tileCfg.id}-input" placeholder="Add item..." style="flex:1;font-size:12px;padding:2px 4px;border-radius:6px;border:1px solid rgba(255,255,255,0.25);background:rgba(0,0,0,0.8);color:var(--text-main);" />
        <button id="${tileCfg.id}-addBtn" style="font-size:12px;padding:2px 8px;border-radius:999px;border:1px solid rgba(255,255,255,0.25);background:rgba(0,0,0,0.8);color:var(--text-main);cursor:pointer;">+</button>
      </div>
    </div>
  `;
  const listEl = root.querySelector(`#${tileCfg.id}-list`);
  const inputEl = root.querySelector(`#${tileCfg.id}-input`);
  const addBtn = root.querySelector(`#${tileCfg.id}-addBtn`);

  function renderList() {
    listEl.innerHTML = "";
    tileCfg.config.items.forEach((item, idx) => {
      const row = document.createElement("div");
      row.style.fontSize = "12px";
      row.style.display = "flex";
      row.style.justifyContent = "space-between";
      row.style.alignItems = "center";
      row.style.marginBottom = "2px";

      const text = document.createElement("span");
      text.textContent = item.text;
      if (item.done) {
        text.style.textDecoration = "line-through";
        text.style.opacity = "0.6";
      }

      const btns = document.createElement("div");
      btns.style.display = "flex";
      btns.style.gap = "4px";

      const toggleBtn = document.createElement("button");
      toggleBtn.textContent = item.done ? "↺" : "✓";
      toggleBtn.style.fontSize = "10px";
      toggleBtn.style.padding = "0 6px";
      toggleBtn.style.borderRadius = "999px";
      toggleBtn.style.border = "1px solid rgba(255,255,255,0.25)";
      toggleBtn.style.background = "rgba(0,0,0,0.85)";
      toggleBtn.style.color = "var(--text-main)";
      toggleBtn.style.cursor = "pointer";
      toggleBtn.onclick = () => {
        item.done = !item.done;
        ctx.updateConfig(() => {});
        renderList();
      };

      const delBtn = document.createElement("button");
      delBtn.textContent = "✕";
      delBtn.style.fontSize = "10px";
      delBtn.style.padding = "0 6px";
      delBtn.style.borderRadius = "999px";
      delBtn.style.border = "1px solid rgba(255,255,255,0.25)";
      delBtn.style.background = "rgba(0,0,0,0.85)";
      delBtn.style.color = "var(--text-main)";
      delBtn.style.cursor = "pointer";
      delBtn.onclick = () => {
        tileCfg.config.items.splice(idx, 1);
        ctx.updateConfig(() => {});
        renderList();
      };

      btns.appendChild(toggleBtn);
      btns.appendChild(delBtn);
      row.appendChild(text);
      row.appendChild(btns);
      listEl.appendChild(row);
    });
  }

  addBtn.onclick = () => {
    const text = inputEl.value.trim();
    if (!text) return;
    tileCfg.config.items.push({ text, done: false });
    inputEl.value = "";
    ctx.updateConfig(() => {});
    renderList();
  };

  inputEl.addEventListener("keydown", e => {
    if (e.key === "Enter") addBtn.click();
  });

  renderList();
}
