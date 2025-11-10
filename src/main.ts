// @deno-types="npm:@types/leaflet"
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import luck from "./_luck.ts";
import "./style.css";

const CENTER = { lat: 36.997936938057016, lng: -122.05703507501151 };

const CELL_DEG = 1e-4;
const ORIGIN = CENTER;
const SPAWN_P = 0.12;

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

function cellCenter(i: number, j: number): L.LatLngExpression {
  return [
    ORIGIN.lat + (i + 0.5) * CELL_DEG,
    ORIGIN.lng + (j + 0.5) * CELL_DEG,
  ];
}

function drawGrid(map: L.Map, layer: L.LayerGroup<L.Layer>) {
  layer.clearLayers();

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
      L.rectangle(cellBounds(i, j), {
        color: "#3d30306e",
        weight: 1,
        fillOpacity: 0,
        interactive: false,
      }).addTo(layer);
    }
  }
}

function drawTokens(map: L.Map, layer: L.LayerGroup<L.Layer>) {
  layer.clearLayers();

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

  const icon = L.divIcon({
    className: "token-marker",
    html: "🔹",
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

  for (let i = iMin; i <= iMax; i++) {
    for (let j = jMin; j <= jMax; j++) {
      const r = luck(`${i},${j},spawn`);
      if (r < SPAWN_P) {
        L.marker(cellCenter(i, j), { icon, interactive: false }).addTo(layer);
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

  const redraw = () => {
    drawGrid(map, gridLayer);
    drawTokens(map, tokenLayer);
  };

  redraw();
  map.on("moveend zoomend", redraw);
}

document.readyState === "loading"
  ? document.addEventListener("DOMContentLoaded", init, { once: true })
  : init();
