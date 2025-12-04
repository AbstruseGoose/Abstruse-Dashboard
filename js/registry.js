/* =====================================================================
   ABSTRUSE DASHBOARD — SAFE TILE REGISTRY
   Automatically ignores missing or broken tiles.
   Never crashes the dashboard due to a bad module.
   ===================================================================== */

/* ---------------------------------------------------------
   SAFE IMPORT WRAPPER
   --------------------------------------------------------- */

async function safeImport(path, fallbackId) {
  try {
    const module = await import(path);
    return module;
  } catch (err) {
    console.warn(`⚠ Failed to load tile module: ${path}`, err);

    // Return safe fallback tile instead of crashing
    return {
      id: fallbackId || path.split("/").pop().replace(".js", ""),
      label: "Unavailable Tile",
      defaultSize: { w: 1, h: 1 },

      render(root) {
        root.innerHTML = `
          <div style="padding:12px;font-size:12px;color:#f66;">
            <b>Tile unavailable</b><br>
            <small>${path}</small><br>
            <span style="opacity:0.8;">(Missing or under construction)</span>
          </div>
        `;
      },

      buildSettings(root) {
        root.innerHTML = `
          <div style="padding:10px;font-size:12px;color:#ccc;">
            This tile is unavailable or under construction.
          </div>
        `;
      }
    };
  }
}

/* ---------------------------------------------------------
   LOAD ENGINE CORE
   --------------------------------------------------------- */

import { startDashboard } from "./core/engine.js";

/* ---------------------------------------------------------
   ASYNC REGISTER ALL TILES
   (All imports wrapped in safeImport)
   --------------------------------------------------------- */

const NowTile            = await safeImport("./tiles/now.js", "now");
const HourlyTile         = await safeImport("./tiles/hourly.js", "hourly");
const DailyTile          = await safeImport("./tiles/daily.js", "daily");
const Forecast7Tile      = await safeImport("./tiles/forecast7.js", "forecast7");
const AlertsTile         = await safeImport("./tiles/alerts.js", "alerts");
const RadarTile          = await safeImport("./tiles/radar.js", "radar");
const RadarControlsTile  = await safeImport("./tiles/radarControls.js", "radarControls");

// Cameras
const CamTile            = await safeImport("./tiles/camera.js", "camera");
const CamGridTile        = await safeImport("./tiles/cameraGrid.js", "cameraGrid");
const CamDiscoveryTile   = await safeImport("./tiles/cameraDiscovery.js", "cameraDiscovery");

// System / Network
const SystemInfoTile     = await safeImport("./tiles/systemInfo.js", "systemInfo");
const SystemStatusTile   = await safeImport("./tiles/systemStatus.js", "systemStatus");
const NetworkScanTile    = await safeImport("./tiles/networkScan.js", "networkScan");
const UptimeTile         = await safeImport("./tiles/uptime.js", "uptime");
const TrafficTile        = await safeImport("./tiles/traffic.js", "traffic");

// Utility
const TodoTile           = await safeImport("./tiles/todo.js", "todo");
const NotesTile          = await safeImport("./tiles/notes.js", "notes");
const ClockTile          = await safeImport("./tiles/clock.js", "clock");
const CalculatorTile     = await safeImport("./tiles/calculator.js", "calculator");
const IframeTile         = await safeImport("./tiles/iframe.js", "iframe");
const CustomHTMLTile     = await safeImport("./tiles/customHTML.js", "customHTML");
const FileUploadTile     = await safeImport("./tiles/uploader.js", "uploader");

// Cosmic / Farm
const MoonTile           = await safeImport("./tiles/moon.js", "moon");
const SunTile            = await safeImport("./tiles/sun.js", "sun");
const GardenTile         = await safeImport("./tiles/garden.js", "garden");

// Speed / Ping
const SpeedTile          = await safeImport("./tiles/speed.js", "speed");

// Calendar
const ScheduleTile       = await safeImport("./tiles/schedule.js", "schedule");

/* ---------------------------------------------------------
   TILE REGISTRY
   --------------------------------------------------------- */

export const tileTypes = {
  [NowTile.id]: NowTile,
  [HourlyTile.id]: HourlyTile,
  [DailyTile.id]: DailyTile,
  [Forecast7Tile.id]: Forecast7Tile,
  [AlertsTile.id]: AlertsTile,
  [RadarTile.id]: RadarTile,
  [RadarControlsTile.id]: RadarControlsTile,
  [CamTile.id]: CamTile,
  [CamGridTile.id]: CamGridTile,
  [CamDiscoveryTile.id]: CamDiscoveryTile,
  [SystemInfoTile.id]: SystemInfoTile,
  [SystemStatusTile.id]: SystemStatusTile,
  [NetworkScanTile.id]: NetworkScanTile,
  [UptimeTile.id]: UptimeTile,
  [TrafficTile.id]: TrafficTile,
  [TodoTile.id]: TodoTile,
  [NotesTile.id]: NotesTile,
  [ClockTile.id]: ClockTile,
  [CalculatorTile.id]: CalculatorTile,
  [IframeTile.id]: IframeTile,
  [CustomHTMLTile.id]: CustomHTMLTile,
  [FileUploadTile.id]: FileUploadTile,
  [MoonTile.id]: MoonTile,
  [SunTile.id]: SunTile,
  [GardenTile.id]: GardenTile,
  [SpeedTile.id]: SpeedTile,
  [ScheduleTile.id]: ScheduleTile
};

/* ---------------------------------------------------------
   DEFAULT LAYOUT
   (Same layout you were working with)
   --------------------------------------------------------- */

const defaultLayout = {
  extras: {
    gpsEnabled: true,
    weatherApiKey: "",
    icsCalendar: "",
    tilePadding: 12,
    gridCols: 6
  },

  tiles: [
    { id: "weather-now", type: "now", label: "Current Weather", colSpan: 2, rowSpan: 1, order: 1, enabled: true, config: {} },
    { id: "weather-hourly", type: "hourly", label: "Hourly Weather", colSpan: 3, rowSpan: 1, order: 2, enabled: true, config: {} },

    { id: "radar-main", type: "radar", label: "Live Radar", colSpan: 3, rowSpan: 2, order: 3, enabled: true, config: {} },

    { id: "camera-1", type: "camera", label: "Camera 1", colSpan: 2, rowSpan: 2, order: 4, enabled: true, config: {} },

    { id: "schedule", type: "schedule", label: "Schedule", colSpan: 2, rowSpan: 1, order: 5, enabled: true, config: {} },

    { id: "system-info", type: "systemInfo", label: "System Info", colSpan: 1, rowSpan: 1, order: 6, enabled: true, config: {} },

    { id: "system-status", type: "systemStatus", label: "System Status", colSpan: 2, rowSpan: 2, order: 7, enabled: true, config: SystemStatusTile.createInitialState() },

    { id: "speedtest", type: "speed", label: "Speed Test", colSpan: 2, rowSpan: 1, order: 8, enabled: true, config: {} },

    { id: "clock", type: "clock", label: "Clock", colSpan: 1, rowSpan: 1, order: 9, enabled: true, config: {} }
  ]
};

/* ---------------------------------------------------------
   START DASHBOARD ENGINE
   --------------------------------------------------------- */

startDashboard({
  tileTypes,
  defaultLayout
});
