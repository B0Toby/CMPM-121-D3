# D3: World of Bits

## Game Design Vision

A location-tinted clicker/crafter: the map is divided into small cells, you harvest simple tokens from nearby cells, then fuse matching tokens into stronger ones to chase a target tier.

## Technologies

- TypeScript (little explicit HTML; custom styles live in `style.css`)
- Leaflet for the map
- Deno + Vite for build/dev
- GitHub Actions + GitHub Pages for deploys

## Assignments

### D3.a: Core mechanics (token collection + crafting)

**Tech focus:** assemble a Leaflet map UI.
**Play focus:** let players gather nearby tokens and combine equals into higher tiers.

#### Steps a

- [x] delete everything in `src/main.ts`
- [x] render a basic Leaflet map centered on the classroom
- [x] show a player marker
- [x] draw a grid that covers the viewport
- [x] deterministically decide which cells contain a token
- [x] restrict interactions to “nearby” cells
- [x] merge two tokens of the same value into the next tier

### D3.b: Core mechanics (movement + win state)

**Tech focus:** Add player movement and update the map based on the player’s location. Make the world lightweight by only remembering changed cells and clearing the rest. Add a basic win check.
**Play focus:** Let players walk around, interact only with nearby cells, and work toward a clear goal (reaching a target token value).

#### Steps b

- [x] movement (WASD / Buttons) and make “nearby” checks relative to player
- [x] null island anchor
- [x] memoryless cells
- [x] win condition

### D3.c

**Tech focus:** use a `Map` plus deterministic spawning so untouched cells don’t allocate memory, while modified cells live in a single structure we can reuse and later serialize.
**Play focus:** make the world feel persistent so cells remember the player’s actions even after scrolling or walking away.

#### Steps c

- [x] keep modified cells in a shared `Map` and reuse them when cells scroll off-screen (no more forgetting changes out of view)

### D3.d

**Tech focus:** geolocation-based movement behind a facade interface and persisting game state across sessions with `localStorage`.\
**Play focus:** support real-world movement and multi-session play without losing progress, with an option to simulate movement via buttons.

#### Steps d

- [x] Introduce movement controller interface (Facade) and migrate button/WASD controls to it
- [x] Add geolocation-based movement controller and runtime toggle between buttons and geolocation
- [ ] Persist game state across sessions using localStorage (player position, held token, modified cells, win state)
- [ ] Add “New Game” flow and do a small cleanup-only pass, then mark D3.d complete
