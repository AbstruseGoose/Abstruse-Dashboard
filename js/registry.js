/* =====================================================================
   ABSTRUSE DASHBOARD — TILE REGISTRY
   Loads every tile module and initializes the dashboard engine.
   ===================================================================== */

import { startDashboard } from "./core/engine.js";

/* =============================
   IMPORT ALL TILE MODULES
   ============================= */

// Weather tiles
import * as NowTile from "./tiles/now.js";
import * as HourlyTile from "./tiles/hourly.js";
import * as DailyTile from "./tiles/daily.js";
import * as Forecast7Tile from "./tiles/forecast7.js";
import * as AlertsTile from "./tiles/alerts.js";
import * as RadarTile from "./tiles/radar.js";
import * as RadarControlsTile from "./tiles/radarControls.js";

// Cameras
import * as CamTile from "./tiles/camera.js";
import * as CamGridTile from "./tiles/cameraGrid.js";
import * as CamDiscoveryTile from "./tiles/cameraDiscovery.js";

// System / Network
import * as SystemInfoTile from "./tiles/systemInfo.js";
import * as SystemStatusTile from "./tiles/systemStatus.js";
import * as NetworkScanTile from "./tiles/networkScan.js";
import * as UptimeTile from "./tiles/uptime.js";
import * as TrafficTile from "./tiles/traffic.js";

// Utility tiles
import * as TodoTile from "./tiles/todo.js";
import * as NotesTile from "./tiles/notes.js";
import * as ClockTile from "./tiles/clock.js";
import * as CalculatorTile from "./tiles/calculator.js";
import * as IframeTile from "./tiles/iframe.js";
import * as CustomHTMLTile from "./tiles/customHTML.js";
import * as FileUploadTile from "./tiles/uploader.js";

// Cosmic / Farm / Sensors
import * as MoonTile from "./tiles/moon.js";
import * as SunTile from "./tiles/sun.js";
import * as GardenTile from "./tiles/garden.js";

// Speed / Ping
import * as SpeedTile from "./tiles/speed.js";

// Calendar
import * as ScheduleTile from "./tiles/schedule.js";



/* =====================================================================
   TILE REGISTRY — maps tile IDs to their modules.
   ===================================================================== */

export const tileTypes = {
  // Weather
  [NowTile.id]: NowTile,
  [HourlyTile.id]: HourlyTile,
  [DailyTile.id]: DailyTile,
  [Forecast7Tile.id]: Forecast7Tile,
  [AlertsTile.id]: AlertsTile,
  [RadarTile.id]: RadarTile,
  [RadarControlsTile.id]: RadarControlsTile,

  // Cameras
  [CamTile.id]: CamTile,
  [CamGridTile.id]: CamGridTile,
  [CamDiscoveryTile.id]: CamDiscoveryTile,

  // System / Network
  [SystemInfoTile.id]: SystemInfoTile,
  [SystemStatusTile.id]: SystemStatusTile,
  [NetworkScanTile.id]: NetworkScanTile,
  [UptimeTile.id]: UptimeTile,
  [TrafficTile.id]: TrafficTile,

  // Utility
  [TodoTile.id]: TodoTile,
  [NotesTile.id]: NotesTile,
  [ClockTile.id]: ClockTile,
  [CalculatorTile.id]: CalculatorTile,
  [IframeTile.id]: IframeTile,
  [CustomHTMLTile.id]: CustomHTMLTile,
  [FileUploadTile.id]: FileUploadTile,

  // Cosmic / Farm
  [MoonTile.id]: MoonTile,
  [SunTile.id]: SunTile,
  [GardenTile.id]: GardenTile,

  // Speed / Ping
  [SpeedTile.id]: SpeedTile,

  // Calendar
  [ScheduleTile.id]: ScheduleTile
};



/* =====================================================================
   DEFAULT LAYOUT — starting tile layout when clearing local storage.
   You can modify this however you want.
   ===================================================================== */

const defaultLayout = {
  extras: {
    gpsEnabled: true,
    weatherApiKey: "",
    icsCalendar: "",
    tilePadding: 12,
    gridCols: 6
  },

  tiles: [
    // WEATHER
    {
      id: "weather-now",
      type: "now",
      label: "Current Weather",
      colSpan: 2,
      rowSpan: 1,
      order: 1,
      enabled: true,
      config: {}
    },
    {
      id: "weather-hourly",
      type: "hourly",
      label: "Hourly Weather",
      colSpan: 3,
      rowSpan: 1,
      order: 2,
      enabled: true,
      config: {}
    },
    {
      id: "weather-daily",
      type: "daily",
      label: "Daily Weather",
      colSpan: 2,
      rowSpan: 2,
      order: 3,
      enabled: false,
      config: {}
    },
    {
      id: "weather-7day",
      type: "forecast7",
      label: "7-Day Forecast",
      colSpan: 2,
      rowSpan: 2,
      order: 4,
      enabled: false,
      config: {}
    },
    {
      id: "weather-alerts",
      type: "alerts",
      label: "Weather Alerts",
      colSpan: 2,
      rowSpan: 1,
      order: 5,
      enabled: false,
      config: {}
    },

    // RADAR
    {
      id: "radar-main",
      type: "radar",
      label: "Live Radar",
      colSpan: 3,
      rowSpan: 2,
      order: 6,
      enabled: true,
      config: {}
    },
    {
      id: "radar-controls",
      type: "radarControls",
      label: "Radar Controls",
      colSpan: 1,
      rowSpan: 1,
      order: 7,
      enabled: false,
      config: {}
    },

    // CAMERAS
    {
      id: "camera-1",
      type: "camera",
      label: "Camera 1",
      colSpan: 2,
      rowSpan: 2,
      order: 8,
      enabled: true,
      config: {}
    },
    {
      id: "camera-disc",
      type: "cameraDiscovery",
      label: "Camera Discovery",
      colSpan: 2,
      rowSpan: 2,
      order: 9,
      enabled: false,
      config: {}
    },
    {
      id: "camera-grid",
      type: "cameraGrid",
      label: "Camera Grid",
      colSpan: 3,
      rowSpan: 3,
      order: 10,
      enabled: false,
      config: {}
    },

    // CALENDAR
    {
      id: "schedule",
      type: "schedule",
      label: "Schedule",
      colSpan: 2,
      rowSpan: 1,
      order: 11,
      enabled: true,
      config: {}
    },

    // SYSTEM INFO (your old system tile)
    {
      id: "system-info",
      type: "systemInfo",
      label: "System Info",
      colSpan: 1,
      rowSpan: 1,
      order: 12,
      enabled: true,
      config: {}
    },

    // SYSTEM STATUS (new multi-source huge tile)
    {
      id: "system-status",
      type: "systemStatus",
      label: "System Status",
      colSpan: 2,
      rowSpan: 2,
      order: 13,
      enabled: true,
      config: SystemStatusTile.createInitialState()
    },

    // NETWORK / SPEED
    {
      id: "speedtest",
      type: "speed",
      label: "Speed Test",
      colSpan: 2,
      rowSpan: 1,
      order: 14,
      enabled: true,
      config: {}
    },

    {
      id: "network-scan",
      type: "networkScan",
      label: "LAN Scanner",
      colSpan: 2,
      rowSpan: 2,
      order: 15,
      enabled: false,
      config: {}
    },

    {
      id: "network-uptime",
      type: "uptime",
      label: "Uptime Monitor",
      colSpan: 2,
      rowSpan: 1,
      order: 16,
      enabled: false,
      config: {}
    },

    {
      id: "network-traffic",
      type: "traffic",
      label: "Network Traffic",
      colSpan: 2,
      rowSpan: 2,
      order: 17,
      enabled: false,
      config: {}
    },

    // UTILITIES
    {
      id: "todo",
      type: "todo",
      label: "To Do",
      colSpan: 1,
      rowSpan: 1,
      order: 18,
      enabled: false,
      config: {}
    },
    {
      id: "notes",
      type: "notes",
      label: "Notes",
      colSpan: 1,
      rowSpan: 1,
      order: 19,
      enabled: false,
      config: {}
    },
    {
      id: "clock",
      type: "clock",
      label: "Clock",
      colSpan: 1,
      rowSpan: 1,
      order: 20,
      enabled: true,
      config: {}
    },
    {
      id: "calculator",
      type: "calculator",
      label: "Calculator",
      colSpan: 1,
      rowSpan: 1,
      order: 21,
      enabled: false,
      config: {}
    },
    {
      id: "iframe",
      type: "iframe",
      label: "Iframe Viewer",
      colSpan: 2,
      rowSpan: 2,
      order: 22,
      enabled: false,
      config: {}
    },
    {
      id: "custom-html",
      type: "customHTML",
      label: "Custom HTML",
      colSpan: 2,
      rowSpan: 2,
      order: 23,
      enabled: false,
      config: {}
    },
    {
      id: "uploader",
      type: "uploader",
      label: "File Uploader",
      colSpan: 1,
      rowSpan: 1,
      order: 24,
      enabled: false,
      config: {}
    },

    // COSMIC / FARM
    {
      id: "moon",
      type: "moon",
      label: "Moon Phase",
      colSpan: 1,
      rowSpan: 1,
      order: 25,
      enabled: false,
      config: {}
    },
    {
      id: "sun",
      type: "sun",
      label: "Sun Tracker",
      colSpan: 1,
      rowSpan: 1,
      order: 26,
      enabled: false,
      config: {}
    },
    {
      id: "garden",
      type: "garden",
      label: "Garden Sensors",
      colSpan: 2,
      rowSpan: 2,
      order: 27,
      enabled: false,
      config: {}
    }
  ]
};



/* =====================================================================
   START ENGINE
   ===================================================================== */

startDashboard({
  tileTypes,
  defaultLayout
});
