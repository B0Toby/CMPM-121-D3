// @deno-types="npm:@types/leaflet"
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./style.css";

// UCSC classroom center
const CENTER = { lat: 36.997936938057016, lng: -122.05703507501151 };

// Make a container if none exists
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
}

document.readyState === "loading"
  ? document.addEventListener("DOMContentLoaded", init, { once: true })
  : init();
