# Lord of the Clicks

<p>
  <a href="README.md"><img src="docs/readme/lang-es.svg" alt="Español" width="170"></a>
  <img src="docs/readme/lang-en-active.svg" alt="English" width="170">
  <a href="README.ca.md"><img src="docs/readme/lang-ca.svg" alt="Català" width="170"></a>
</p>

> An incremental clicker set in _The Lord of the Rings_. It started as a
> personal project to combine two things I enjoy: incremental games and
> building interfaces with good visual detail. The idea is to travel across
> Middle-earth, unlock zones, recruit companions, upgrade your gear and take
> on timed mini-bosses and bosses.
>
> Although it started out as something fun, I have treated it as a complete
> frontend app: domain logic separated from React, strict TypeScript, global
> state with Zustand, real responsive design, logic tests, accessibility and
> deployment on Cloudflare.

[![CI](https://img.shields.io/badge/CI-passing-brightgreen)](./.github/workflows/ci.yml)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Zustand](https://img.shields.io/badge/Zustand-5-FF6B35)](https://github.com/pmndrs/zustand)
[![Vitest](https://img.shields.io/badge/Vitest-3-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#-license)

---

## Why this project

I wanted to build a small game with enough depth to force me to solve real
product problems: economy, progression, saving, migrations, responsive design,
data-driven content and a UI that wouldn't break on mobile.

The result isn't meant to be an isolated demo or a portfolio landing page, but
a playable project that I keep iterating on little by little. Even so, the
code shows several decisions I care about as a frontend developer:

- **Separating game rules from the UI.** The important logic lives in
  `src/engine/` as plain TypeScript; React takes care of rendering state and
  dispatching actions.
- **Building with data.** Zones, enemies, companions, gear, quests and
  upgrades live in `src/data/`; adding content doesn't require touching the UI.
- **Taking responsive design seriously.** Desktop uses three columns; mobile
  narrows the focus to combat, side drawers and compact controls.
- **Making state persistent and migratable.** The save uses versioned keys and
  migrations to handle model changes without breaking existing saved games.
- **Testing what can break the game.** There are tests for formulas, combat,
  progression, the store, content and the game loop.

To try it locally:

```bash
pnpm install && pnpm dev   # http://localhost:5173
```

## ✨ Features

### Gameplay

- 🗺️ **Interactive map** of Middle-earth with pan/zoom (mouse wheel on
  desktop, touch drag on mobile), animated centering, fullscreen mode,
  and an informational `!` badge on zones with quests waiting to be
  picked up. Optimized by writing `translate3d` directly to the DOM during
  drag, without going through React.
- ⚔️ **Click combat** with animations, gold particles, a health bar, an
  enemy sprite per zone and floating damage numbers.
- 👹 **Timed bosses and mini-bosses** (30s by default,
  configurable). If the timer hits 0 you lose and return to the normal pool
  with a persistent defeat toast (closed with the `×`); with the floating
  `✕` you can **abandon manually** with no penalty.
  During an encounter you can switch from mini-boss to boss (or vice versa)
  without abandoning; it replaces the fight. The deadline check runs both in
  `useGameLoop` and in the `BattlePanel` interval, so it doesn't depend
  on a single global interval.
- 🧩 **Enemy types and situational gear**: items apply percentage
  multipliers against orcs, Uruk-hai, wraiths, trolls, beasts, Mordor,
  nature, men or ancient creatures. Some iconic enemies (the Eye of
  Sauron, the Ring) are intentionally typeless. Bonuses are shown as
  **colored chips** (`BonusVsChips`).
  In addition to `bonusVs`, items can declare `goldPct` to add an extra
  percentage of gold per kill while equipped (stackable with the Forge
  upgrades).
- 🪙 **Forge of Rivendell**: a permanent upgrade tree unlocked by
  visiting Rivendell. **14 nodes across 5 chains** (damage, wealth, wisdom,
  time and companions) with prerequisites drawn as SVG lines, a
  diamond layout, click/double-click purchasing, reset with in-game
  confirmation and a full mithril refund.
- 🧙 **Recruiting the Fellowship** in rest zones, with full-color
  portraits once unlocked and boss-defeat gates for iconic heroes
  (e.g. the King of the Dead).
- 🏪 **Local shops** in rest zones with a **"Reclutar / Tienda"**
  (Recruit / Shop) toggle. In combat zones with `hasShop` (e.g.
  Fangorn) the toggle becomes **"Combate / Reclutar"** (Combat / Recruit)
  and the second tab exposes recruitment of the zone's unique companion
  (Treebeard).
- 🛡️ **Epic gear** (Sting, Hadhafang, Gimli's Axe, Mithril Coat,
  Phial of Galadriel, Palantír…) with specialization bonuses.
- ⏱️ **Armor as time**: armor `def` doesn't add DPS, it
  **adds seconds to the mini-boss/boss timer** (`+1s` per 5 points).
- 📈 **Companion level cap based on progress**: prevents farming the
  early game to trivialize the endgame.
- 📜 **24 discoverable quests** (`reach` / `kills_at` / `boss`) with
  a `!` badge; `reach` quests are handed out in the _previous_ zone and are
  credited when you **physically visit** the target zone, not when it gets
  unlocked through a gate (explicit `visitedLocs` vs `unlockedLocs`
  separation to avoid accidental auto-completion).
- 💾 **Autosave** to `localStorage`, debounced at 500ms, with
  **migration between save versions** (versioned `SAVE_KEY`,
  currently `v11`; the v10→v11 migration rebuilds `visitedLocs` from
  `locIdx` to clean up wrongly completed `reach` quests). On reload,
  players with a game in progress skip the welcome screen and the game loop
  starts instantly (it also resyncs when coming back from bfcache or
  switching tabs, avoiding "frozen passive DPS"). The restart game
  button clears both keys and returns to the welcome screen after an
  in-game confirmation modal.
- 📤 **Export / import saves** from the **Settings** menu: the save
  is serialized to a **Base64**-encoded `.txt` (`SaveBackupFile`
  with `app`, `fileVersion`, `saveKey` and `state`). On import, the
  structure is validated before writing to `localStorage` and the page
  reloads; autosave remains the main mechanism, this is
  just an optional backup.
- ✨ **Configurable colored halos** per companion and enemy.

### UI / responsive

- 🖥️ **Desktop**: three columns (Fellowship + Gear · Battle + Map ·
  Quests + Shop).
- 📱 **Tablet and mobile**: focus on `BattlePanel`, the map becomes a bottom
  strip, and side panels turn into mutually exclusive drawers.
- 📐 **Selective compaction per viewport**: `CurrencyBar` shrinks
  icons and changes "Nivel 50" → "Lvl 50"; "Comprar · 950 oro" → "950 G";
  "+45% ORC" → "+45% O" when the grid gets dense.
- 🎨 **Per-location backgrounds** with **smart preloading** (current
  zone + unlocked adjacent ones), `Image.decoding = 'async'` and a cache
  of already requested URLs so traveling on mobile doesn't flash
  black. Consistent visual theme: the **Ringbearer** typeface for the
  main title, Aniron/Cinzel for everything else, a gold and parchment
  palette, and a neutral gray page background.
- ♿ **Accessibility**: semantic `<button>` interactive elements with
  `aria-label`, tooltips, consistent `focus-visible` and
  `eslint-plugin-jsx-a11y` failing the lint step in CI.
- 🧱 **Global error boundary** that catches crashes without losing the save.

## 🛠️ Stack

| Layer           | Tool                                                                      |
| --------------- | ------------------------------------------------------------------------- |
| Build / dev     | **Vite 6** with HMR                                                       |
| Language        | **TypeScript 5.7** (strict, `noUnusedLocals`, `noUnusedParameters`)       |
| UI              | **React 19**                                                              |
| State           | **Zustand 5** (global store + selectors)                                  |
| Styles          | **Tailwind 4** + **CSS Modules** for custom visual themes                 |
| Tests           | **Vitest 3** + **Testing Library** + jsdom                                |
| Linting         | **ESLint 9** (flat) + **typescript-eslint** + **jsx-a11y** + **Prettier** |
| Pre-commit      | **Husky** + **lint-staged**                                               |
| Observability   | `logger` abstraction ready to plug into Sentry/Datadog                    |
| CI              | **GitHub Actions** (lint + typecheck + test + build)                      |
| Deploy          | **Cloudflare Pages / Workers** (`wrangler` optional)                      |
| Package manager | **pnpm 11**                                                               |

## 🏗️ Architecture

```
src/
├── types/game.ts              # Domain model (Location, Enemy, Quest, Companion, GameState, UpgradeDefinition…)
├── data/                      # Game content (data-as-code)
│   ├── locations.ts           #   30 zones following Peter Jackson's trilogy
│   ├── enemies.ts             #   mob pool + mini-bosses + bosses per zone (with optional glow)
│   ├── companions.ts          #    20 members of the Fellowship (cost, portrait, glow, gates)
│   ├── shop.ts                #   weapons, armor and accessories per zone
│   ├── quests.ts              #   24 quests of type kills_at / boss / reach
│   ├── upgrades.ts            #   Forge upgrade tree (5 chains, 14 nodes)
│   └── index.ts               #   barrel exports
├── engine/                    # Pure game logic (TS without React)
│   ├── formulas.ts            #   xp/level, DPS, click damage, type bonus, armorFightTimeBonusS, upgradeCost
│   ├── combat.ts              #   dealDamage (pure, testable reducer)
│   ├── progression.ts         #   zone unlocking, gates, reach quests (visitedLocs), level cap, fightTimeLimitForFight
│   ├── spawn.ts               #   enemy / semi-boss / boss generation
│   ├── persistence.ts         #   save/load + migrations by versioned SAVE_KEY (v10 → v11)
│   ├── store.ts               #   Zustand store (data + actions: startBossFight, buyUpgrade, resetUpgrades…)
│   └── __tests__/             #   engine unit tests (engine + content + store)
├── hooks/                     # Reusable hooks
│   ├── useGameLoop.ts         #   DPS tick, auto-save, boss-fight deadline, resync on visibility/pageshow
│   ├── __tests__/             #   game loop tests (deadline + activation)
│   └── useMapInteraction.ts   #   map pan / zoom / drag (mouse + touch) with translate3d + rAF
├── components/                # React components (TSX, one component per file)
│   ├── ErrorBoundary.tsx      #   catches crashes and renders a fallback
│   ├── BattlePanel.tsx        #   combat; internal subcomponents: FloatingActions, EncounterChip, …
│   ├── ForgeModal.tsx         #   upgrade tree modal (diamonds + SVG connections + confirm modal)
│   ├── ConfirmDialog.tsx      #   reusable confirmation modal (destructive actions, Esc / backdrop)
│   ├── BonusVsChips.tsx       #   colored chips per type (full / mini variants)
│   ├── MapPanel.tsx           #   wrapper with title = current zone name + expanded mode
│   ├── MapView.tsx            #   map viewport (consumes useMapInteraction)
│   ├── MapMarker.tsx          #   memoized marker + informational "!" badge
│   ├── MapPaths.tsx           #   SVG paths between unlocked zones
│   ├── Modal.tsx              #   generic modal (expanded map)
│   ├── CompanionsPanel.tsx    #   hero list, level-ups, progress-based cap
│   ├── EquipmentPanel.tsx     #   weapon/armor/accessory slots with BonusVsChips
│   ├── QuestsPanel.tsx        #   accepted quests + claim
│   ├── ShopPanel.tsx          #   global shop filtered by visited zones
│   ├── CurrencyBar.tsx        #   gold, mithril, XP, kills + Forge button (with locked/unlocked state)
│   ├── ForgeButton.tsx        #   reusable Forge button (desktop in CurrencyBar, mobile in mobileActions)
│   └── Panel.tsx              #   reusable parchment frame with centered title
├── styles/                    # CSS Modules for custom themes
│   ├── app.module.css         #   responsive layout + drawers
│   ├── battle.module.css      #   combat scene, mini-bosses/bosses, recruitment, local shop, Forge toast
│   ├── currency.module.css    #   full / mini currency bar, Forge button with highlight/locked
│   ├── forge.module.css       #   Forge modal: diamond nodes, SVG lines, confirm modal
│   ├── map.module.css         #   map, markers, route, toolbar
│   └── panel.module.css       #   parchment frame + cards
├── lib/                       # Cross-cutting utilities
│   ├── equipmentText.ts       #   type labels/icons/colors, getBonusVsEntries, formatItemStatLine
│   └── logger.ts              #   abstracted logger (ready for Sentry/Datadog)
├── test/setup.ts              # Global Vitest setup
├── App.tsx                    # main layout, side drawers on mobile, dev cheats
├── main.tsx                   # Entry point (StrictMode + ErrorBoundary)
└── index.css                  # Tailwind v4 + CSS vars theme + @font-face Ringbearer/Aniron
```

### Design decisions (why everything is where it is)

- **Pure engine, thin store, dumb components.** `combat.ts`,
  `progression.ts`, `formulas.ts` and `spawn.ts` are pure functions with no
  React dependencies. The Zustand store only exposes data +
  actions. Components don't compute game rules; they only
  consume them. This makes it possible to test the domain without mounting
  anything and to migrate the UI without touching the logic.
- **Side effects in hooks, never at module level.** The DPS tick,
  autosave and boss-fight deadline live in `useGameLoop`, which
  also resyncs on `visibilitychange` and `pageshow` so that
  passive DPS doesn't freeze after switching tabs or coming back
  from bfcache. Map pan/zoom/drag lives in `useMapInteraction`.
  HMR-friendly, SSR-compatible and unit-testable.
- **`useMapInteraction` applies `translate3d` directly to the DOM with `rAF`**
  during drag to keep 60 fps with the heavy map image,
  avoiding React re-renders on every `pointermove`.
- **Tailwind for layout, CSS Modules for custom themes.** Quick
  utilities for grids/spacing and isolated CSS for the combat scene,
  map, vignetted portraits, currency bar, drawers, Forge modal,
  etc. No styled-components, no emotion, no massive inline styles.
- **Data as code and autocompletion.** Adding content means editing a
  fully typed `.ts` file. Each zone declares `semiBoss`, `boss`,
  `semiBossAt`, `bossAt`, `semiBossTimeLimit`, `bossTimeLimit`,
  `unlockGate`, `hasShop`, `background`, etc. An integrity test
  detects broken references between `locations`, `enemies`, `quests`,
  `shop` and `companions`.
- **Situational gear with a consistent UI.** `calcEnemyTypeMultiplier`,
  `calcClickDamageAgainstEnemy` and `calcDpsAgainstEnemy` apply the
  per-type multipliers. `BonusVsChips` + `getBonusVsEntries`
  render bonuses as colored chips in the shop and
  equipment panels.
- **Companion level cap.** `companionLevelCapForLocation(locIdx)`
  defines increasing tiers. The store rejects `levelUpCompanion` above
  the cap; the panel shows "MAX" with a tooltip. Dedicated tests.
- **Boss fight: fail vs abandon.** `failBossFight` is triggered from
  `useGameLoop` (and, as a safety net, from `BattlePanel` itself)
  when the deadline expires, showing a persistent
  "¡Has perdido!" ("You lost!") toast that the player closes manually with the `×`.
  `abandonBossFight` is the explicit (silent) user action.
  `startBossFight` with a different tier **replaces** the encounter.
- **Data-driven quests.** `reach` quests declare `pickupLoc` ≠
  `loc`, so the previous zone "gives" the quest without blocking progress.
- **Serializable state + migrations.** `GameState` is a POJO.
  `persistence.ts` uses a versioned `SAVE_KEY` and applies migrations when
  loading old saves (e.g. introducing `forgeUnlocked`/`forgeSeen`
  without breaking existing saves). It also cleans up saves in odd states
  (mini-boss/boss on screen without `bossFight`, corrupted companion
  levels) by respawning a mob from the pool and normalizing `level`. The
  **v10 → v11** migration illustrates the strategy: the legacy save is
  detected, `visitedLocs` is rebuilt from `locIdx` (the map is linear,
  so every zone before the current one was visited) and
  `questProgress` is reset for `reach` quests not yet claimed, preserving
  completed ones so existing saves don't break.
- **`visitedLocs` vs `unlockedLocs`.** An explicit distinction in the domain:
  a zone can be **unlocked** (reachable on the map, e.g. after
  recruiting Frodo + Sam) without being **visited** (having traveled there).
  `reach` quests check `visitedLocs`; components
  (`QuestsPanel`, `combat.ts`, `applyPostMutations`) use the same
  source. A test in `store.test.ts` locks this case down to prevent
  auto-completion when gates are unlocked.
- **Unlockable Forge with onboarding.** The button starts locked
  (gray + `disabled` + `aria-disabled`). When you visit Rivendell for
  the first time it unlocks, a persistent toast fires
  ("¡Forja desbloqueada!", "Forge unlocked!") and the button pulses with a
  golden glow. The highlight turns off the first time the Forge is opened.
  State lives in the store + a UI driven by flags (`forgeUnlocked`, `forgeSeen`,
  `forgeUnlockFlash`).
- **In-game confirmations, not `window.confirm`.** Destructive
  actions (resetting the Forge tree, restarting the game) open
  a styled modal (reusable `ConfirmDialog` + the Forge's internal
  confirm) with `Esc`, backdrop dismiss and `autoFocus` on the
  confirm button. No native browser dialogs.
- **Accessibility by default.** `eslint-plugin-jsx-a11y` breaks the lint
  if an interactive element without semantics is introduced. Always `<button>`, never
  `<div onClick>`. Decorative icons with `aria-hidden`. Images with
  `alt`.
- **Responsive with stable semantic HTML.** `app.module.css` defines the
  desktop grid and switches to a single column with drawers at
  `max-width: 1180px`. Panels compact their text by swapping
  `data-form="full"` spans for `data-form="mini"` via media queries,
  keeping the same HTML at both sizes (better for tests and a11y).

## Technical overview

### Frontend architecture

- Components with narrow responsibilities that communicate through the store.
- Zustand with **granular selectors** to avoid unnecessary re-renders.
- Domain decoupled from React: runnable outside the browser and testable
  without mounting components.
- Side effects isolated in hooks (`useGameLoop`, `useMapInteraction`), not in
  global modules.

### TypeScript

- `strict` enabled, plus `noUnusedLocals` and `noUnusedParameters`.
- Explicit domain types (`EnemyType`, `BossFightState`, `Quest`,
  `Location`, `ShopItem`, `Companion`, `UpgradeDefinition`).
- `Partial<Record<…>>` where appropriate, with explicit guards when
  iterating to satisfy the compiler without `as` or `!`.
- Integrity tests to detect broken references between data files.

### UI/UX

- 3-column desktop layout that switches to 1 column with mutually
  exclusive drawers on mobile/tablet.
- CSS Modules for custom visual pieces (combat, map, recruitment,
  drawers, currency bar, Forge modal) and Tailwind for layout.
- Interactive map with drag (mouse + touch), zoom and a fullscreen modal.
- Visual feedback: floating damage, critical hits, particles, boss
  timer, health bars, colored halos, hover only over the image,
  persistent toasts for progress milestones.

### Quality

- ESLint 9 flat config, Prettier, `eslint-plugin-jsx-a11y`, Husky and
  lint-staged.
- CI runs **lint + typecheck + test + build** on every push/PR to `main`.
- Global `ErrorBoundary` to avoid blank screens.
- Saving to `localStorage` with migrations and debounced autosave.
- **43 Vitest tests** across 6 files covering combat, formulas,
  progression, store, game loop and content.

### Things I still want to improve

I don't consider it "finished". Some parts work well but still have room for improvement:

- `BattlePanel.tsx` holds too much code (combat, recruitment,
  local shop and encounter chips). I want to extract subcomponents to
  reduce its size and make testing easier.
- Visual interaction tests with Testing Library are missing for the map, drawers,
  modals and the recruitment flow.
- The economy balance is tuned by hand; a TTK and per-zone reward
  simulator would be useful.
- There are temporary sprites and placeholders; I want to replace them with
  more consistent art.
- `localStorage` persistence is enough for the current scope, but
  IndexedDB would be a better fit if the save grew or added more metadata.
- The project is in Spanish; ES/EN i18n would make the UI text code more
  maintainable.

## 🚀 Development

Requires **Node 20+** and **pnpm 11+**.

```bash
pnpm install
pnpm dev          # http://localhost:5173 with HMR
pnpm build        # production bundle to dist/
pnpm preview      # serves dist/
pnpm test         # vitest in watch mode
pnpm test:run     # vitest once (what CI runs)
pnpm lint         # ESLint + jsx-a11y
pnpm lint:fix     # ESLint with autofix
pnpm typecheck    # tsc --noEmit
pnpm format       # Prettier
```

### Environment variables

Copy `.env.example` to `.env.local`. All variables must have the
`VITE_` prefix to be exposed to the client; their types live in
`src/vite-env.d.ts`.

### Code quality

- **Pre-commit** (Husky + lint-staged): every commit automatically runs ESLint
  and Prettier on the staged files.
- **CI**: GitHub Actions runs `lint`, `typecheck`, `test:run` and `build`
  on every push/PR to `main`.
- **Active rules**: TS strict, `react-hooks/recommended`,
  `react-refresh`, `jsx-a11y/recommended`, Prettier as the final arbiter.

### Settings menu and dev cheats

The header holds the **Ajustes** (Settings) button (an SVG gear icon; on mobile
just the icon). It opens a menu with two sections:

**Always available**

- **📥 Descargar partida** (Download save) — exports the current save as a Base64
  `.txt`.
- **📤 Importar partida** (Import save) — opens a file picker and replaces the
  save after validating the format.

**Development only** (not rendered in production):

- **⚙ Desbloquear todas las zonas** (Unlock all zones) — unlocks every map location
  and the Forge, and also makes the mini-boss and boss available in
  every zone (bypasses the kill gate and pre-marks mini-bosses as
  defeated, without touching `bossDefeated`).
- **⛀ +1.000.000 oro y mithril** (+1,000,000 gold and mithril) — adds 1M gold and 1M mithril to the
  wallet.
- **⏭ Completar zona actual** (Complete current zone) — completes the current zone (kills maxed
  out, boss + mini-boss defeated, next zone unlocked).
- **★ Completar juego entero** (Complete entire game) — simulates a 100% completed game,
  leaving heroes at level 1 with no gear equipped so you can test
  without excessive passive DPS.
- **↺ Reiniciar partida** (Restart game) — deletes the save and returns to the welcome screen
  after an in-game confirmation modal (`ConfirmDialog`).

## 📋 Adding content

Each content type lives in `src/data/`. The `enemyType` is assigned in
the `ENEMY_TYPES` map inside `enemies.ts` itself:

```ts
// src/data/enemies.ts
// 1) Declare the type (omit it for enemies with no weakness, like the Eye of Sauron)
const ENEMY_TYPES: Record<string, EnemyType> = {
  guard_orc: 'orco',
  // …
};

// 2) Add the def (id in English snake_case, visible name in Spanish)
guard_orc: {
  id: 'guard_orc',
  name: 'Orco Guardia',
  hp: 220,
  gold: 42,
  xp: 28,
},
```

An item with a situational bonus (rendered as colored chips by
`BonusVsChips`):

```ts
// src/data/shop.ts
{
  id: 'hoja_oeste',
  name: 'Hoja del Oeste',
  dmg: 18,
  cost: 500,
  loc: 'rivendel',
  bonusVs: { espectro: 0.35, mordor: 0.2 },
},
```

An accessory with no direct damage but with `goldPct` (a passive economy
effect, stackable with the Forge upgrades):

```ts
// src/data/shop.ts
{
  id: 'pipa_fumar',
  name: 'Pipa de Fumar',
  bonus: 0,
  cost: 60,
  loc: 'comarca',
  desc: 'Hierba de la Comarca, calma y concentración',
  goldPct: 0.05,         // +5% gold per kill while equipped
},
```

A combat zone with a mini-boss and a boss:

```ts
// src/data/locations.ts
{
  id: 'eregion',
  name: 'Eregion',
  desc: 'Las tierras de los herreros élficos',
  enemies: ['warg', 'moria_orc'],
  killsNeeded: 80,
  semiBoss: 'orc_captain',
  boss: 'cave_troll',
  semiBossAt: 40,            // optional, default floor(killsNeeded/2)
  bossAt: 80,                // optional, default killsNeeded
  semiBossTimeLimit: 30,     // optional, default 30s
  bossTimeLimit: 30,         // optional, default 30s
  pos: [54.0, 32.5],
  background: '/backgrounds/eregion.jpg',
},
```

A companion gated by a boss:

```ts
// src/data/companions.ts
{
  id: 'rey_muertos',
  name: 'Rey de los Muertos',
  title: 'Señor del Juramento Roto',
  baseDps: 18,
  unlockAt: 'paso_de_los_muertos',
  color: '#8ea5b0',
  recruitCost: 35000,
  portrait: '/companions/king-dead.png',
  requireBossDefeated: 'paso_de_los_muertos',
  portraitScale: 1.4,
  portraitGlow: 24,            // intense turquoise halo
  portraitGlowColor: '102, 217, 217',
},
```

A Forge tree node:

```ts
// src/data/upgrades.ts
{
  id: 'tesoros_antiguos',
  name: 'Tesoros antiguos',
  shortName: 'Tesoros',
  desc: '+5% oro de enemigos por rango.',
  maxRank: 5,
  baseCost: 8,
  costGrowth: 1.7,
  effect: 'gold_pct',
  valuePerRank: 0.05,
  requires: { golpe_elfico: 2 },   // prerequisite gate
  position: { x: 24, y: 68 },      // % over the background tree
  branch: 'wealth',
},
```

> **Level cap:** if you insert a zone in the middle of the list, the
> indices shift and you must adjust `COMPANION_LEVEL_CAPS` in
> `src/engine/progression.ts` (and its tests) so each tier still
> matches the right zone.

A `reach` quest picked up in the previous zone:

```ts
// src/data/quests.ts
{
  id: 'q13',
  name: 'Pasar por Eregion',
  desc: 'Alcanza Eregion',
  type: 'reach',
  loc: 'eregion',            // target destination
  pickupLoc: 'rivendel',     // where the "!" appears
  need: 1,
  reward: { gold: 500, mithril: 25 },
},
```

For conventions (structure, naming, where to put hooks, accessibility
rules…), see [`AGENTS.md`](./AGENTS.md). For ideas and backlog,
see [`IDEAS.md`](./IDEAS.md).

## 🧪 Testing

43 Vitest tests split between the engine and the hooks:

- **`engine/__tests__/formulas.test.ts`** — damage, XP, level-up, companion
  level-up cost, type bonus, armor bonus on the timer
  (`armorFightTimeBonusS`), Forge upgrade cost and
  `applyRewardMultiplier` with `goldPct` from equipped items (e.g. the
  Pipa de Fumar, a smoking pipe).
- **`engine/__tests__/combat.test.ts`** — combat reducer (damage to the
  enemy, rewards, transition, mithril drop by tier).
- **`engine/__tests__/progression.test.ts`** — zone unlocking,
  `reach` quest completion (via `visitedLocs`), companion gating,
  per-zone level cap, `fightTimeLimitForFight`.
- **`engine/__tests__/store.test.ts`** — Zustand store actions
  on real state: upgrade purchases, `requires`/`maxRank` gates,
  and the regression case "recruiting Frodo + Sam doesn't complete the
  Old Forest quest until you've traveled there". It also covers the cheats:
  `completeAll` (all zones unlocked and visited, heroes at
  level 1 with no gear equipped) and `unlockAll` (every zone with a mini-boss/boss
  becomes immediately playable without auto-marking the boss as defeated).
- **`engine/__tests__/content.test.ts`** — integrity: valid references
  between `locations`, `enemies`, `quests`, `shop`, `companions`
  and `upgrades`; every `enemyType` is in the allowed set.
- **`hooks/__tests__/useGameLoop.test.ts`** — the loop ends the fight
  when the deadline expires and doesn't advance while inactive (welcome
  screen).

```bash
pnpm test:run
```

## ☁️ Deploy (Cloudflare)

| Field                      | Value                              |
| -------------------------- | ---------------------------------- |
| **Build command**          | `pnpm run build`                   |
| **Build output directory** | `dist`                             |
| **Node.js version**        | `22` (`.node-version` at the root) |

The project uses **pnpm 11** (`packageManager` in `package.json`). If
Cloudflare doesn't detect it on its own, add **`PNPM_VERSION`** = `11.1.2`.

### Option A — Cloudflare Pages (recommended for this SPA)

Leave the **deploy command empty**. Pages publishes `dist/` after the build; you
don't need Wrangler.

### Option B — Workers + static assets

If you deploy with Wrangler, do **not** use `npx wrangler deploy` (it downloads
wrangler on the fly and reinstalls deps with blocked scripts).
Use:

| Field              | Value             |
| ------------------ | ----------------- |
| **Deploy command** | `pnpm run deploy` |

`wrangler.jsonc` is already in the repo (SPA in `dist/`). `wrangler` is in
`devDependencies` and `pnpm-workspace.yaml` approves `esbuild`, `sharp` and
`workerd`.

> **Common pnpm errors in CI:** `packages field missing` → you're missing
> `packages: ['.']` in `pnpm-workspace.yaml`. `ERR_PNPM_IGNORED_BUILDS`
> → add the package to `allowBuilds` (e.g. `esbuild`, `sharp`,
> `workerd`).

SPA routing:

- **Workers (`pnpm run deploy`)**: use
  `not_found_handling: "single-page-application"` in `wrangler.jsonc`.
  Do **not** add `public/_redirects`: Cloudflare detects an infinite loop
  if both coexist (`Invalid _redirects configuration`, code
  `100324`).
- **Pages (without Wrangler)**: create `public/_redirects` with a single line
  `/*    /index.html   200` for the SPA fallback. Don't use that
  file if you deploy with Workers.

## 🗺️ Roadmap

- [x] Responsive layout for tablet/mobile (drawers, UI compaction,
      touch drag on the map).
- [x] Configurable colored halo system per companion/enemy.
- [x] Armor as a time bonus against mini-bosses/bosses.
- [x] Deploy on Cloudflare Pages.
- [x] **Forge of Rivendell**: permanent upgrade tree using mithril,
      unlocked by visiting Rivendell, with reset and refund.
- [ ] Bestiary / codex (see `IDEAS.md`).
- [ ] Pixel art sprites for the remaining enemies and companions.
- [ ] Sounds on hit / critical hits / bosses (Howler.js).
- [ ] Extract `BattlePanel` subcomponents into their own files
      (`RecruitPanel`, `RestShopPanel`, `EncounterActions`).
- [ ] Per-zone balance/TTK simulator to tune the economy and boss
      timers.
- [ ] Internationalization (es / en) with `i18next`.
- [ ] Installable PWA mode + offline support.
- [ ] Migration to IndexedDB with versioned saves.
- [ ] Storybook for the panels.
- [ ] Per-PR previews on Cloudflare.

## 📝 License

MIT — a personal learning project, not affiliated with
Middle-earth Enterprises or Warner Bros.
