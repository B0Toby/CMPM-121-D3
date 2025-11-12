# D3: World of Bits

# Game Design Vision

A location-tinted clicker/crafter: the map is divided into small cells, you harvest simple tokens from nearby cells, then fuse matching tokens into stronger ones to chase a target tier.

# Technologies

- TypeScript (little explicit HTML; custom styles live in `style.css`)
- Leaflet for the map
- Deno + Vite for build/dev
- GitHub Actions + GitHub Pages for deploys

# Assignments

## D3.a: Core mechanics (token collection + crafting)

**Tech focus:** assemble a Leaflet map UI.
**Play focus:** let players gather nearby tokens and combine equals into higher tiers.

### Steps

- [x] delete everything in `src/main.ts`
- [x] render a basic Leaflet map centered on the classroom
- [x] show a player marker
- [x] draw a grid that covers the viewport
- [x] deterministically decide which cells contain a token
- [x] restrict interactions to “nearby” cells
- [x] merge two tokens of the same value into the next tier
- [x] Add WASD movement (one cell per key press) and make “nearby” checks relative to player
