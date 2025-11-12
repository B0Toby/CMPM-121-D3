// @deno-types="npm:@types/leaflet"
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./style.css";

import "./_leafletWorkaround.ts";
import luck from "./_luck.ts";

const CENTER = { lat: 36.997936938057016, lng: -122.05703507501151 };
const CELL_DEG = 1e-4;
const ORIGIN = { lat: 0, lng: 0 }; // D3.b: global grid
const INTERACT_STEPS = 3; // Chebyshev distance in cells
const WIN_TARGET = 32; // D3.b: higher win threshold

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

function ensureHUD(): HTMLDivElement {
  let hud = document.getElementById("hud") as HTMLDivElement | null;
  if (!hud) {
    hud = document.createElement("div");
    hud.id = "hud";
    document.body.appendChild(hud);
  }
  return hud;
}

function ensureControls(): HTMLDivElement {
  let el = document.getElementById("controls") as HTMLDivElement | null;
  if (!el) {
    el = document.createElement("div");
    el.id = "controls";
    el.innerHTML = `
      <button class="move-btn" data-dir="up"    aria-label="Move up">▲</button>
      <button class="move-btn" data-dir="left"  aria-label="Move left">◀</button>
      <button class="move-btn" data-dir="down"  aria-label="Move down">▼</button>
      <button class="move-btn" data-dir="right" aria-label="Move right">▶</button>
    `;
    document.body.appendChild(el);
  }
  return el;
}

/* ---------- grid helpers ---------- */
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
function latLngToCell(lat: number, lng: number) {
  return {
    i: Math.floor((lat - ORIGIN.lat) / CELL_DEG),
    j: Math.floor((lng - ORIGIN.lng) / CELL_DEG),
  };
}

/* ---------- deterministic token generation ---------- */
function baseToken(i: number, j: number): number {
  const r = luck(`spawn:${i},${j}`);
  if (r < 0.15) return 2;
  if (r < 0.20) return 4;
  if (r < 0.22) return 8;
  return 0;
}

/* ---------- gameplay state (only store cells that changed) ---------- */
type Key = string;
const key = (i: number, j: number) => `${i},${j}`;
const modified = new Map<Key, number>(); // 0 means emptied by pickup
let held: number | null = null;
let hasWon = false;

function getValue(i: number, j: number): number {
  const k = key(i, j);
  return modified.has(k) ? modified.get(k)! : baseToken(i, j);
}
function setValue(i: number, j: number, v: number) {
  modified.set(key(i, j), v);
}

/* ---------- player & proximity ---------- */
const player = { lat: CENTER.lat, lng: CENTER.lng };
let playerMarker: L.Marker;

function playerCell() {
  return latLngToCell(player.lat, player.lng);
}
function isNear(i: number, j: number): boolean {
  const p = playerCell();
  return Math.max(Math.abs(i - p.i), Math.abs(j - p.j)) <= INTERACT_STEPS;
}

function checkWin(hud: HTMLDivElement) {
  if (!hasWon && held !== null && held >= WIN_TARGET) {
    hasWon = true;
    hud.textContent = `Holding: ${held}  •  You win!`;
    alert("You win!");
  }
}

/* ---------- interaction ---------- */
function onCellClick(
  i: number,
  j: number,
  hud: HTMLDivElement,
  redraw: () => void,
) {
  if (!isNear(i, j)) return;

  const cur = getValue(i, j);

  if (held === null) {
    if (cur > 0) {
      held = cur;
      setValue(i, j, 0);
      checkWin(hud);
    }
  } else {
    if (cur === held && cur > 0) {
      setValue(i, j, held * 2);
      held = null;
    }
  }

  if (!hasWon) {
    hud.textContent = `Holding: ${held ?? "—"}  •  Use WASD or buttons to move`;
  }
  redraw();
}

/* ---------- rendering ---------- */
function drawGrid(
  map: L.Map,
  gridLayer: L.LayerGroup,
  tokenLayer: L.LayerGroup,
  hud: HTMLDivElement,
) {
  gridLayer.clearLayers();
  tokenLayer.clearLayers();

  const pad = 0.25;
  const view = map.getBounds().pad(pad);
  const iMin = Math.floor((view.getSouth() - ORIGIN.lat) / CELL_DEG);
  const iMax = Math.floor((view.getNorth() - ORIGIN.lat) / CELL_DEG);
  const jMin = Math.floor((view.getWest() - ORIGIN.lng) / CELL_DEG);
  const jMax = Math.floor((view.getEast() - ORIGIN.lng) / CELL_DEG);

  const redraw = () => drawGrid(map, gridLayer, tokenLayer, hud);

  const visible = new Set<string>();

  for (let i = iMin; i <= iMax; i++) {
    for (let j = jMin; j <= jMax; j++) {
      visible.add(`${i},${j}`);
      const near = isNear(i, j);

      const rect = L.rectangle(cellBounds(i, j), {
        color: near ? "#2a7a5e" : "#3d30306e",
        weight: near ? 2 : 1,
        fillOpacity: 0,
        interactive: true,
      }).addTo(gridLayer);

      rect.on("click", () => onCellClick(i, j, hud, redraw));

      const v = getValue(i, j);
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

  for (const k of Array.from(modified.keys())) {
    if (!visible.has(k)) modified.delete(k);
  }
}

function init() {
  const container = ensureContainer();
  const hud = ensureHUD();
  const controls = ensureControls();

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
  playerMarker = L.marker([player.lat, player.lng], { icon: playerIcon })
    .addTo(map)
    .bindTooltip("You", { direction: "top", offset: [0, -12] });

  hud.textContent = `Holding: —  •  Use WASD or buttons to move`;

  const gridLayer = L.layerGroup().addTo(map);
  const tokenLayer = L.layerGroup().addTo(map);
  const redraw = () => drawGrid(map, gridLayer, tokenLayer, hud);

  const moveBy = (dLat: number, dLng: number) => {
    player.lat += dLat;
    player.lng += dLng;
    playerMarker.setLatLng([player.lat, player.lng]);
    if (!hasWon) {
      hud.textContent = `Holding: ${
        held ?? "—"
      }  •  Use WASD or buttons to move`;
    }
    map.setView([player.lat, player.lng]); // keep centered
    redraw();
  };

  // WASD / Arrow keys
  globalThis.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "w":
      case "ArrowUp":
        moveBy(CELL_DEG, 0);
        break;
      case "s":
      case "ArrowDown":
        moveBy(-CELL_DEG, 0);
        break;
      case "a":
      case "ArrowLeft":
        moveBy(0, -CELL_DEG);
        break;
      case "d":
      case "ArrowRight":
        moveBy(0, CELL_DEG);
        break;
    }
  });

  controls.addEventListener("click", (e) => {
    const t = e.target as HTMLElement;
    if (!(t instanceof HTMLButtonElement)) return;
    switch (t.dataset.dir) {
      case "up":
        moveBy(CELL_DEG, 0);
        break;
      case "down":
        moveBy(-CELL_DEG, 0);
        break;
      case "left":
        moveBy(0, -CELL_DEG);
        break;
      case "right":
        moveBy(0, CELL_DEG);
        break;
    }
  });

  redraw();
  map.on("moveend zoomend resize", redraw);
}

document.readyState === "loading"
  ? document.addEventListener("DOMContentLoaded", init, { once: true })
  : init();
