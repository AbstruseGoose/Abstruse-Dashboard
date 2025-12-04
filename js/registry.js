// js/registry.js
import { initDashboard } from "./core/engine.js";
import { initWeatherEngine } from "./core/weatherEngine.js";

import * as nowTile from "./tiles/now.js";
import * as hourlyTile from "./tiles/hourly.js";
import * as radarTile from "./tiles/radar.js";
import * as scheduleTile from "./tiles/schedule.js";
import * as speedTile from "./tiles/speed.js";
import * as camTile from "./tiles/camera.js";
import * as camAutoTile from "./tiles/cameraDiscovery.js";
import * as systemStatusTile from "./tiles/systemStatus.js";

import { makePlaceholderTile } from "./tiles/placeholderTiles.js";

// Build placeholder tile modules
const dailyTile        = makePlaceholderTile("daily",        "Daily Weather", "Daily high/low summary tile (placeholder for now).");
const forecast7Tile    = makePlaceholderTile("forecast7",    "7-Day Forecast", "Multi-day forecast tile (placeholder).");
const alertsTile       = makePlaceholderTile("alerts",       "Weather Alerts", "Severe weather alerts tile (placeholder).");
const radarCtrlTile    = makePlaceholderTile("radarControls","Radar Controls", "Controls for radar animation and layers (placeholder).");
const lanScanTile      = makePlaceholderTile("lanScan",      "LAN Scanner", "LAN device discovery tile (placeholder).");
const uptimeTile       = makePlaceholderTile("uptime",       "Uptime Monitor", "Service status monitor (placeholder).");
const trafficTile      = makePlaceholderTile("traffic",      "Network Traffic", "Network traffic overview (placeholder).");
const camGridTile      = makePlaceholderTile("camGrid",      "Camera Grid", "Multi-camera grid view (placeholder).");
const camMotionTile    = makePlaceholderTile("camMotion",    "Camera Motion", "Motion alert snapshots (placeholder).");
const todoTile         = makePlaceholderTile("todo",         "To-Do", "Simple to-do list tile (placeholder).");
const notesTile        = makePlaceholderTile("notes",        "Notes", "Quick notes tile (placeholder).");
const htmlTile         = makePlaceholderTile("customHTML",   "Custom HTML", "Render custom HTML (placeholder).");
const iframeTile       = makePlaceholderTile("iframe",       "Web View", "Embed external webpage (placeholder).");
const moonTile         = makePlaceholderTile("moon",         "Moon Phase", "Moon phase visualization (placeholder).");
const sunTile          = makePlaceholderTile("sun",          "Sun Tracker", "Sunrise/sunset tracking (placeholder).");
const gardenTile       = makePlaceholderTile("garden",       "Garden Sensors", "LoRa/ESP32 garden sensor tile (placeholder).");
const calcTile         = makePlaceholderTile("calculator",   "Calculator", "Simple calculator (placeholder).");
const clockTile        = makePlaceholderTile("clock",        "Clock", "Analog/digital clock (placeholder).");
const uploaderTile     = makePlaceholderTile("uploader",     "File Uploader", "File uploader (placeholder).");

// Register all tile types by id
const allTileTypes = {
  [nowTile.id]: nowTile,
  [hourlyTile.id]: hourlyTile,
  [radarTile.id]: radarTile,
  [scheduleTile.id]: scheduleTile,
  [speedTile.id]: speedTile,
  [camTile.id]: camTile,
  [camAutoTile.id]: camAutoTile,
  [systemStatusTile.id]: systemStatusTile,

  [dailyTile.id]: dailyTile,
  [forecast7Tile.id]: forecast7Tile,
  [alertsTile.id]: alertsTile,
  [radarCtrlTile.id]: radarCtrlTile,
  [lanScanTile.id]: lanScanTile,
  [uptimeTile.id]: uptimeTile,
  [trafficTile.id]: trafficTile,
  [camGridTile.id]: camGridTile,
  [camMotionTile.id]: camMotionTile,
  [todoTile.id]: todoTile,
  [notesTile.id]: notesTile,
  [htmlTile.id]: htmlTile,
  [iframeTile.id]: iframeTile,
  [moonTile.id]: moonTile,
  [sunTile.id]: sunTile,
  [gardenTile.id]: gardenTile,
  [calcTile.id]: calcTile,
  [clockTile.id]: clockTile,
  [uploaderTile.id]: uploaderTile
};

// Default layout: what you start with on first load
const defaultLayout = [
  { typeId: "now",      colSpan: 2, rowSpan: 1, label: nowTile.label,      order: 1 },
  { typeId: "hourly",   colSpan: 2, rowSpan: 1, label: hourlyTile.label,   order: 2 },
  { typeId: "schedule", colSpan: 2, rowSpan: 2, label: scheduleTile.label, order: 3 },
  { typeId: "cam",      colSpan: 1, rowSpan: 1, label: "Cam 1",            order: 4 },
  { typeId: "cam",      colSpan: 1, rowSpan: 1, label: "Cam 2",            order: 5 },
  { typeId: "cam",      colSpan: 1, rowSpan: 1, label: "Cam 3",            order: 6 },
  { typeId: "radar",    colSpan: 2, rowSpan: 2, label: radarTile.label,    order: 7 },
  { typeId: "speed",    colSpan: 1, rowSpan: 1, label: speedTile.label,    order: 8 },
  { typeId: "camAuto",  colSpan: 1, rowSpan: 1, label: camAutoTile.label,  order: 9 },
  { typeId: "systemStatus", colSpan: 1, rowSpan: 1, label: systemStatusTile.label, order: 10 }
];

initWeatherEngine();
initDashboard(allTileTypes, defaultLayout);
