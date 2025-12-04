// js/tiles/schedule.js
import { getDashboardState } from "../core/engine.js";

export const id = "schedule";
export const label = "Schedule";
export const defaultSize = { colSpan: 2, rowSpan: 2 };

export function createInitialConfig() {
  return {
    showPast: false,
    maxEvents: 20,
    timeFormat24: false
  };
}

export function render(container, tile, ctx) {
  container.innerHTML = `
    <div id="scheduleDateLabel-${tile.instanceId}" style="font-size:13px; color:var(--text-soft);"></div>
    <div class="scheduleList" id="scheduleList-${tile.instanceId}"></div>
  `;
  renderSchedule(tile);
}

function parseICSTime(dtVal) {
  const datePart = dtVal.slice(0, 8);
  const year = parseInt(datePart.slice(0, 4), 10);
  const month = parseInt(datePart.slice(4, 6), 10) - 1;
  const day = parseInt(datePart.slice(6, 8), 10);
  if (dtVal.length > 8) {
    const timePart = dtVal.slice(9, 15);
    const hour = parseInt(timePart.slice(0, 2), 10);
    const minute = parseInt(timePart.slice(2, 4), 10);
    const second = parseInt(timePart.slice(4, 6), 10);
    return new Date(Date.UTC(year, month, day, hour, minute, second));
  } else {
    return new Date(year, month, day);
  }
}

function formatTimeLabel(dateObj, allDay, use24h) {
  if (allDay) return "All day";
  return dateObj.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: !use24h
  });
}

function renderSchedule(tile) {
  const dateLabel = document.getElementById(`scheduleDateLabel-${tile.instanceId}`);
  const list = document.getElementById(`scheduleList-${tile.instanceId}`);
  if (!dateLabel || !list) return;

  const now = new Date();
  const todayKey = now.toISOString().slice(0, 10).replace(/-/g, "");
  dateLabel.textContent = now.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric"
  });

  const st = getDashboardState();
  const text = (st.icsRaw || "").trim();
  if (!text) {
    list.innerHTML = `<div class="scheduleEmpty">Paste ICS in Tile Manager to see schedule.</div>`;
    return;
  }

  const cfg = tile.config;
  const showPast = !!cfg.showPast;
  const maxEvents = cfg.maxEvents || 20;
  const use24h = !!cfg.timeFormat24;

  const blocks = text.split("BEGIN:VEVENT").slice(1);
  const events = [];

  blocks.forEach(blockRaw => {
    const block = "BEGIN:VEVENT" + blockRaw;
    const lines = block.split(/\r?\n/);
    const dtStartLine = lines.find(l => l.startsWith("DTSTART"));
    const summaryLine = lines.find(l => l.startsWith("SUMMARY:"));
    if (!dtStartLine || !summaryLine) return;
    const dtVal = dtStartLine.split(":")[1].trim();
    const dateKey = dtVal.slice(0, 8);
    if (dateKey !== todayKey) return;
    const allDay = dtVal.length === 8;
    const startDate = parseICSTime(dtVal);
    const title = summaryLine.slice("SUMMARY:".length).trim();
    if (!showPast && !allDay && startDate < now) return;
    events.push({ start: startDate, allDay, title });
  });

  events.sort((a, b) => a.start - b.start);
  list.innerHTML = "";

  if (!events.length) {
    list.innerHTML = `<div class="scheduleEmpty">No events for the rest of today.</div>`;
  } else {
    events.slice(0, maxEvents).forEach(evt => {
      const item = document.createElement("div");
      item.className = "scheduleItem";
      const timeLabel = formatTimeLabel(evt.start, evt.allDay, use24h);
      item.innerHTML = `
        <div class="scheduleTime">${timeLabel}</div>
        <div class="scheduleTitle">${evt.title}</div>
      `;
      list.appendChild(item);
    });
  }
}

export function buildSettingsUI(panel, tile, ctx) {
  panel.innerHTML = `
    <div class="ts-row">
      <label><input type="checkbox" class="ts-showPast" ${tile.config.showPast ? "checked" : ""}> Show past events today</label>
      <label><input type="checkbox" class="ts-24h" ${tile.config.timeFormat24 ? "checked" : ""}> 24h time</label>
    </div>
  `;
}
export function saveConfig(panel, tile, ctx) {
  const showPast = panel.querySelector(".ts-showPast");
  const h24 = panel.querySelector(".ts-24h");
  tile.config.showPast = !!showPast?.checked;
  tile.config.timeFormat24 = !!h24?.checked;
}
