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

#### Steps

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

#### Steps

- [x] movement (WASD / Buttons) and make “nearby” checks relative to player
- [x] null island anchor
- [x] memoryless cells
- [x] win condition

### D3.c

**Tech focus:** use a `Map` plus deterministic spawning so untouched cells don’t allocate memory, while modified cells live in a single structure we can reuse and later serialize.\
**Play focus:** make the world feel persistent so cells remember the player’s actions even after scrolling or walking away.

#### Steps

- [x] keep modified cells in a shared `Map` and reuse them when cells scroll off-screen (no more forgetting changes out of view)
