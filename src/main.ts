// @deno-types="npm:@types/leaflet"
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./style.css";

// keep these helpers from the starter kit
import "./_leafletWorkaround.ts";
import luck from "./_luck.ts";

const CENTER = { lat: 36.997936938057016, lng: -122.05703507501151 };
const CELL_DEG = 1e-4;
const ORIGIN = CENTER; // use the classroom as grid origin for D3.a

function ensureContainer(): HTMLElement {
  let el = document.getElementById("map") ??
    document.getElementById("app") ??
    document.getElementById("root");
  if (!el) {
    el = document.createElement("div");
    el.id = "map";
    document.body.appendChild(el);
  }
  return el;
}

function cellBounds(i: number, j: number): L.LatLngBoundsExpression {
  return [
    [ORIGIN.lat + i * CELL_DEG, ORIGIN.lng + j * CELL_DEG],
    [ORIGIN.lat + (i + 1) * CELL_DEG, ORIGIN.lng + (j + 1) * CELL_DEG],
  ];
}

function cellCenter(i: number, j: number): [number, number] {
  const south = ORIGIN.lat + i * CELL_DEG;
  const west = ORIGIN.lng + j * CELL_DEG;
  return [south + CELL_DEG / 2, west + CELL_DEG / 2];
}

/* ---------- deterministic token generation ---------- */
function tokenValue(i: number, j: number): number {
  // tweak thresholds for density; deterministic per (i,j)
  const r = luck(`spawn:${i},${j}`);
  if (r < 0.15) return 2; // 15%
  if (r < 0.20) return 4; // 5%
  if (r < 0.22) return 8; // 2%
  return 0;
}

/* ---------- “nearby” helper (player stays at origin in this step) ---------- */
const INTERACT_STEPS = 3; // Chebyshev distance in cell steps
function isNear(i: number, j: number): boolean {
  return Math.max(Math.abs(i), Math.abs(j)) <= INTERACT_STEPS;
}

function drawGrid(
  map: L.Map,
  gridLayer: L.LayerGroup,
  tokenLayer: L.LayerGroup,
) {
  gridLayer.clearLayers();
  tokenLayer.clearLayers();

  const pad = 0.25;
  const view = map.getBounds().pad(pad);
  const south = view.getSouth();
  const north = view.getNorth();
  const west = view.getWest();
  const east = view.getEast();

  const iMin = Math.floor((south - ORIGIN.lat) / CELL_DEG);
  const iMax = Math.floor((north - ORIGIN.lat) / CELL_DEG);
  const jMin = Math.floor((west - ORIGIN.lng) / CELL_DEG);
  const jMax = Math.floor((east - ORIGIN.lng) / CELL_DEG);

  for (let i = iMin; i <= iMax; i++) {
    for (let j = jMin; j <= jMax; j++) {
      const near = isNear(i, j);

      L.rectangle(cellBounds(i, j), {
        color: near ? "#2a7a5e" : "#3d30306e",
        weight: near ? 2 : 1,
        fillOpacity: 0,
        interactive: false,
      }).addTo(gridLayer);

      const v = tokenValue(i, j);
      if (v > 0) {
        L.marker(cellCenter(i, j), {
          icon: L.divIcon({
            className: near ? "token-label" : "token-label token-far",
            html: String(v),
            iconSize: [0, 0],
          }),
          interactive: false,
        }).addTo(tokenLayer);
      }
    }
  }
}

function init() {
  const container = ensureContainer();

  const map = L.map(container, { preferCanvas: true }).setView(
    [CENTER.lat, CENTER.lng],
    19,
  );

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 20,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  const playerIcon = L.divIcon({
    className: "player-marker",
    html: "📍",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
  L.marker([CENTER.lat, CENTER.lng], { icon: playerIcon })
    .addTo(map)
    .bindTooltip("You", { direction: "top", offset: [0, -12] });

  const gridLayer = L.layerGroup().addTo(map);
  const tokenLayer = L.layerGroup().addTo(map);
  const redraw = () => drawGrid(map, gridLayer, tokenLayer);

  redraw();
  map.on("moveend zoomend resize", redraw);
}

document.readyState === "loading"
  ? document.addEventListener("DOMContentLoaded", init, { once: true })
  : init();
