# Lord of the Clicks

> Clicker incremental ambientado en _El Señor de los Anillos_, construido como
> demo de portfolio frontend. El gameplay (mapa interactivo, combate por
> click, jefes con timer, reclutamiento, equipo situacional, misiones) es la
> excusa: el objetivo real es enseñar arquitectura React/TS de producción,
> estado global desacoplado, testeo del dominio, accesibilidad y un layout
> responsive cuidado.

[![CI](https://img.shields.io/badge/CI-passing-brightgreen)](./.github/workflows/ci.yml)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Zustand](https://img.shields.io/badge/Zustand-5-FF6B35)](https://github.com/pmndrs/zustand)
[![Vitest](https://img.shields.io/badge/Vitest-3-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#-licencia)

---

## TL;DR para revisores

Si vienes a evaluar perfil frontend, lo más interesante:

- **Separación motor / UI**: la lógica del juego son funciones puras TS en
  `src/engine/` (reducers de combate, fórmulas, progresión, persistencia,
  spawn). El store Zustand sólo orquesta y los componentes React sólo
  pintan. Eso hace cada pieza testable y reutilizable.
- **Datos como código**: `src/data/` es la fuente de verdad de zonas,
  enemigos, items, compañeros y misiones. Todo tipado y validado por tests
  de integridad para evitar referencias rotas.
- **Tests del motor**: Vitest cubre fórmulas, combate, progresión y
  contenido. CI corre `lint + typecheck + test + build`.
- **Responsive real**: layout desktop de 3 columnas + drawers mutuamente
  exclusivos en mobile/tablet, con compactación selectiva de copy y
  controles (texto a icono, "Nivel" → "Lvl", "Comprar · 950 oro" → "950 G",
  abreviaturas de tipo a 1 letra cuando hace falta).
- **Performance consciente**: mapa drag/zoom escribiendo `translate3d`
  directo al DOM con `requestAnimationFrame`, autosave debounced,
  selectors granulares de Zustand y `useMemo` para listas pesadas.
- **Accesibilidad**: todo lo interactivo es `<button>` semántico con
  `aria-label`, `focus-visible`, alts, tooltips contextuales, y
  `eslint-plugin-jsx-a11y` bloqueando el lint.
- **Tooling**: TS strict, ESLint flat config, Prettier, Husky +
  lint-staged en pre-commit y GitHub Actions en CI.

Una vista rápida: `pnpm install && pnpm dev` y abre `http://localhost:5173`.

## ✨ Características

### Gameplay

- 🗺️ **Mapa interactivo** de la Tierra Media con pan/zoom (rueda en
  desktop, drag con touch en mobile), centrado animado, modo pantalla
  completa, y badge `!` informativo sobre las zonas con misiones por
  recoger. Optimizado escribiendo `translate3d` directo al DOM durante el
  drag, sin pasar por React.
- ⚔️ **Combate por click** con animaciones, partículas de oro, barra de
  vida, sprite de enemigo por zona y números de daño flotantes.
- 👹 **Jefes y semi-jefes con tiempo limitado** (default 30s,
  configurable). Si el timer llega a 0 pierdes y vuelves al pool normal
  con flash de derrota; con la `✕` flotante puedes **abandonar
  manualmente** sin penalización. Durante un encuentro se puede cambiar
  de semi a jefe (o viceversa) sin abandonar, sustituye la pelea.
- 🧩 **Tipos de enemigo y equipo situacional**: los objetos aplican
  multiplicadores porcentuales contra orcos, Uruk-hai, espectros, trolls,
  bestias, mordor, naturaleza, humanos o criatura antigua. Algunos
  enemigos icónicos (Ojo de Sauron, El Anillo) son intencionalmente sin
  tipo: no reciben bonificación. Bonus visibles como **chips coloreados**
  (`BonusVsChips`) tanto en tienda interna como en panel de equipo.
- ⬅️➡️ **Navegación rápida entre zonas adyacentes** con flechas laterales.
- 🧙 **Reclutamiento de La Comunidad** en zonas de descanso: silueta
  negra hasta reclutar; al desbloquear se revela retrato a color y se
  unen al cálculo de DPS. Frodo y Sam son gratis pero requieren
  reclutarlos; el resto cuesta oro. La Comarca se "abre" hacia el Bosque
  Viejo cuando completas el `unlockGate`. Algunos compañeros tienen
  **gate por jefe derrotado** (p. ej. el Rey de los Muertos sólo se une
  tras vencer el boss de Senderos de los Muertos).
- 🏪 **Tiendas locales**: las zonas de descanso son las tiendas naturales.
  Algunas zonas de combate (Fangorn, Senderos de los Muertos) tienen un
  **toggle "Reclutar / Tienda"** que abre un panel especial para
  reclutar compañeros únicos.
- 🛡️ **Equipo épico** (Dardo, Hadhafang, Hacha de Gimli, Cota de
  Mithril, Luz de Galadriel, Palantír…) comprable por zona y con bonus
  de especialización.
- ⏱️ **Armaduras como tiempo**: el `def` de las armaduras ya no suma DPS,
  ahora **añade segundos al timer de semi/jefe** (`+1s` cada 5 puntos).
  Es una decisión de diseño visible: la UI etiqueta el stat como
  `s en semi/jefe`.
- 📈 **Cap de nivel de compañeros por progreso de aventura**: la subida
  está topada según `locIdx`. Avanzar desbloquea capas más altas y evita
  farmear las primeras zonas para trivializar el final.
- 📜 **Misiones descubribles**: las misiones empiezan ocultas y se
  revelan con un botón `!` en la pantalla de combate. Las misiones
  `reach` se reparten en la zona _anterior_ ("vé a X") así que aceptarlas
  nunca bloquea tu avance.
- 💾 **Guardado automático** en `localStorage`, debounced a 500ms, con
  migración entre versiones de save.
- ✨ **Halos coloreados configurables** por compañero y enemigo. Elfos
  con halo blanco sutil, Galadriel/Celeborn con halo blanco intenso, el
  Rey de los Muertos con halo turquesa tanto en su carta de reclutar como
  en el sprite del jefe.

### UI / responsive

- 🖥️ **Desktop**: tres columnas (Comunidad + Equipo · Batalla + Mapa ·
  Misiones + Tienda).
- 📱 **Tablet y mobile**: foco en `BattlePanel`, mapa como tira
  inferior, paneles laterales se vuelven drawers laterales mutuamente
  exclusivos (abrir Comunidad cierra Misiones y viceversa).
- 📐 **Compactación selectiva por viewport**:
  - `CurrencyBar` reduce iconos, oculta labels y cambia "Nivel 50" → "Lvl 50".
  - Botón "Comprar · 950 oro" → "950 G", "✓ En la Comunidad" → "✓".
  - Tipos de enemigo en chips de tienda: "+45% O" en lugar de "+45% ORC"
    cuando la rejilla está densa.
  - Botones de semi/boss en esquinas (top-left / top-right).
  - Panel de stats abreviado a "DPS" solo en mobile.
- 🎨 **Fondos por localización** y temática visual coherente: tipografía
  **Ringbearer** para el título principal, Aniron/Cinzel para el resto,
  paleta dorada y pergamino.
- ♿ **Accesibilidad**: todos los interactivos son `<button>` semánticos
  con `aria-label`, tooltips contextuales, `focus-visible` consistente y
  `eslint-plugin-jsx-a11y` activo.
- 🧱 **Error boundary global** que captura crashes y muestra fallback sin
  perder el save.

## 🛠️ Stack

| Capa            | Herramienta                                                               |
| --------------- | ------------------------------------------------------------------------- |
| Build / dev     | **Vite 6** con HMR                                                        |
| Lenguaje        | **TypeScript 5.7** (strict, `noUnusedLocals`, `noUnusedParameters`)       |
| UI              | **React 19**                                                              |
| Estado          | **Zustand 5** (store global + selectors)                                  |
| Estilos         | **Tailwind 4** + **CSS Modules** para temas visuales custom               |
| Tests           | **Vitest 3** + **Testing Library** + jsdom                                |
| Linting         | **ESLint 9** (flat) + **typescript-eslint** + **jsx-a11y** + **Prettier** |
| Pre-commit      | **Husky** + **lint-staged**                                               |
| Observabilidad  | Abstracción `logger` lista para enchufar Sentry/Datadog                   |
| CI              | **GitHub Actions** (lint + typecheck + test + build)                      |
| Package manager | **pnpm 11**                                                               |

## 🏗️ Arquitectura

```
src/
├── types/game.ts              # Modelo de dominio (Location, Enemy, Quest, Companion, GameState…)
├── data/                      # Contenido del juego (data-as-code)
│   ├── locations.ts           #   30 zonas siguiendo la trilogía de Peter Jackson
│   ├── enemies.ts             #   pool de mobs + semi-jefes + jefes por zona (con glow opcional)
│   ├── companions.ts          #   miembros de La Comunidad (coste, retrato, glow, gates)
│   ├── shop.ts                #   armas, armaduras y accesorios
│   ├── quests.ts              #   misiones de tipo kills_at / boss / reach
│   └── index.ts               #   barrel exports
├── engine/                    # Lógica de juego pura (TS sin React)
│   ├── formulas.ts            #   xp/nivel, DPS, daño click, bonus por tipo, bonus de armor en timer
│   ├── combat.ts              #   dealDamage (reducer puro testable)
│   ├── progression.ts         #   desbloqueo de zonas, gates, reach quests, cap nivel compañeros, fightTimeLimitForFight
│   ├── spawn.ts               #   generación de enemigos / semi-bosses / bosses
│   ├── persistence.ts         #   save/load + migraciones por SAVE_KEY
│   ├── store.ts               #   Zustand store (datos + actions: startBossFight, abandonBossFight, failBossFight…)
│   └── __tests__/             #   tests unitarios del motor (27 tests)
├── hooks/                     # Hooks reutilizables
│   ├── useGameLoop.ts         #   tick de DPS, auto-save, deadline de boss-fight
│   └── useMapInteraction.ts   #   pan / zoom / drag (mouse + touch) del mapa con translate3d + rAF
├── components/                # Componentes React (TSX, un componente por archivo)
│   ├── App.tsx                #   layout principal, drawers laterales en mobile, dev cheats
│   ├── ErrorBoundary.tsx      #   captura crashes y renderiza fallback
│   ├── BattlePanel.tsx        #   combate; subcomponentes internos: FloatingActions, EncounterChip,
│   │                          #   RestModeToggle, RecruitPanel, RecruitCard, RestShopPanel, RestShopCard
│   ├── BonusVsChips.tsx       #   chips coloreados por tipo (variantes full / mini)
│   ├── MapPanel.tsx           #   wrapper con título = nombre de zona actual + modo expandido
│   ├── MapView.tsx            #   viewport del mapa (consume useMapInteraction)
│   ├── MapMarker.tsx          #   marcador memoizado + badge "!" informativo
│   ├── MapPaths.tsx           #   rutas SVG entre zonas desbloqueadas
│   ├── Modal.tsx              #   modal genérico (mapa expandido)
│   ├── CompanionsPanel.tsx    #   lista de héroes, subida de nivel, cap por progreso
│   ├── EquipmentPanel.tsx     #   slots de arma/armadura/accesorio con BonusVsChips
│   ├── QuestsPanel.tsx        #   misiones aceptadas + claim
│   ├── ShopPanel.tsx          #   tienda global filtrada por zonas visitadas (slot derecho desktop)
│   ├── CurrencyBar.tsx        #   oro, mithril, XP y kills (full / mini según viewport)
│   └── Panel.tsx              #   marco de pergamino reutilizable con título centrado
├── styles/                    # CSS Modules para temas custom
│   ├── app.module.css         #   layout responsive + drawers
│   ├── battle.module.css      #   escena de combate, semis/jefes, reclutamiento, tienda local
│   ├── currency.module.css    #   currency bar full / mini
│   ├── map.module.css         #   mapa, marcadores, ruta, toolbar
│   └── panel.module.css       #   marco de pergamino + cards de Comunidad / equipo / misiones
├── lib/                       # Utilidades transversales
│   ├── equipmentText.ts       #   labels/iconos/colores/abreviaturas de tipos, getBonusVsEntries, formatArmorStatLine
│   └── logger.ts              #   logger abstraído (preparado para Sentry/Datadog)
├── test/setup.ts              # Setup global de Vitest
├── main.tsx                   # Entry point (StrictMode + ErrorBoundary)
└── index.css                  # Tailwind v4 + tema CSS vars + @font-face Ringbearer/Aniron
```

### Decisiones de diseño

- **Motor puro**: `combat.ts`, `progression.ts`, `formulas.ts` y `spawn.ts`
  son funciones puras sin dependencias de React, fácilmente testables. El
  store de Zustand expone datos + actions y nada más.
- **Side-effects en hooks**: tick de DPS, autosave y deadline de las
  boss-fights viven en `useGameLoop`, no a nivel de módulo. Compatible
  con HMR, SSR y unit-testable.
- **`useMapInteraction`**: pan/zoom/drag/wheel + touch fuera del
  componente; `MapView` queda como vista. Durante el drag el transform
  se aplica vía `translate3d` directo al DOM con `requestAnimationFrame`
  para mantener fluidez con la imagen pesada del mapa.
- **Tailwind para layout, CSS Modules para temas**: utilidades rápidas
  para grids/spacings y CSS aislado para escena de combate, mapa, retratos
  con vignette, currency bar, drawers, etc.
- **Datos como código**: añadir contenido es editar un `.ts` con
  autocompletado. Cada zona declara `semiBoss`, `boss`, `semiBossAt`,
  `bossAt`, `semiBossTimeLimit`, `bossTimeLimit`, `unlockGate`,
  `hasShop`, `background`, etc. Cada enemigo tiene `enemyType?` (opcional
  para foes únicos sin debilidades), `sprite?`, `glow?` y `glowColor?`.
  Cada item declara `bonusVs`. Cada compañero declara `recruitCost`,
  `portrait`, `portraitScale`, `portraitOffsetY`, `portraitFocus`,
  `portraitGlow?`, `portraitGlowColor?` y opcionalmente
  `requireBossDefeated`.
- **Equipo situacional con UI consistente**: `calcEnemyTypeMultiplier`,
  `calcClickDamageAgainstEnemy` y `calcDpsAgainstEnemy` aplican los
  multiplicadores por tipo en el momento de dañar. `BonusVsChips` +
  `getBonusVsEntries` renderizan los bonuses como chips coloreados en
  tienda y equipamiento.
- **Cap de nivel de compañeros**: `companionLevelCapForLocation(locIdx)`
  define tramos crecientes. El store rechaza `levelUpCompanion` por
  encima del cap; `CompanionsPanel` muestra "MAX" en el botón con
  tooltip cuando está topado. Tests dedicados en `progression.test.ts`.
- **Boss-fight: fail vs abandon**: `failBossFight` se dispara desde el
  `useGameLoop` cuando expira el deadline (muestra flash "¡Has perdido!").
  `abandonBossFight` es la acción del usuario al pulsar la `✕` flotante
  (silenciosa, sin flash). `startBossFight` con un tier distinto al
  activo **sustituye** el encuentro (permite saltar entre semi y boss en
  caliente).
- **Quests data-driven**: las misiones `reach` declaran `pickupLoc`
  (donde aparece el `!`) ≠ `loc` (destino), para que la zona anterior
  "dé" la quest sin bloquear el avance.
- **Estado serializable**: `GameState` es un POJO. `persistence.ts` usa
  una `SAVE_KEY` versionada y aplica migraciones al cargar saves
  antiguos.
- **Accesibilidad por defecto**: `eslint-plugin-jsx-a11y` bloquea el lint
  si se introduce un elemento interactivo sin semántica adecuada.
- **Responsive de verdad**: `app.module.css` define el grid desktop y
  cambia a una sola columna con drawers en `max-width: 1180px`. Los
  paneles internos compactan textos sustituyendo spans
  `data-form="full"` por `data-form="mini"` en media queries específicas,
  manteniendo el HTML semántico igual en ambos tamaños.

## Qué demuestra técnicamente

### Frontend architecture

- Componentes React con responsabilidad clara y comunicación vía store.
- Estado global con Zustand usando selectors granulares
  (`useGameStore((s) => s.state.gold)`) para minimizar re-renders.
- Dominio desacoplado de React: reducers y fórmulas del juego viven en
  `src/engine/` y se pueden ejecutar fuera del navegador.
- Side effects aislados en hooks (`useGameLoop`, `useMapInteraction`) en
  lugar de timers/listeners a nivel de módulo.

### TypeScript

- `strict` activo. `noUnusedLocals`, `noUnusedParameters`.
- Tipos de dominio explícitos (`EnemyType`, `BossFightState`, `Quest`,
  `Location`, `ShopItem`, `Companion`).
- Datos estáticos tipados → autocompletado y validación al añadir
  contenido.
- Tests de integridad para detectar referencias rotas entre
  localizaciones, enemigos, misiones, tienda y compañeros.

### UI/UX

- Layout desktop de tres columnas; en mobile/tablet se reorganiza en una
  columna con drawers mutuamente exclusivos para Comunidad/Equipo y
  Misiones/Tienda.
- CSS Modules para piezas visuales custom (combate, mapa, reclutamiento,
  drawers, currency bar) y Tailwind para layout y utilidades.
- Mapa interactivo con drag (mouse + touch), zoom y modal fullscreen.
- Feedback visual: daño flotante, críticos, partículas, temporizador de
  jefe, barras de vida, halos coloreados configurables, hover de
  retratos sólo sobre la imagen y no sobre la tarjeta entera.

### Calidad

- ESLint 9 flat config, Prettier, `eslint-plugin-jsx-a11y`, Husky y
  lint-staged.
- CI corre lint, typecheck, tests y build en cada push/PR a `main`.
- `ErrorBoundary` global para evitar pantallas en blanco.
- Guardado en `localStorage` con migraciones y autosave debounced.
- 27 tests Vitest cubriendo combate, fórmulas, progresión y contenido.

## 🚀 Desarrollo

Requiere **Node 20+** y **pnpm 11+**.

```bash
pnpm install
pnpm dev          # http://localhost:5173 con HMR
pnpm build        # bundle de producción a dist/
pnpm preview      # sirve dist/
pnpm test         # vitest en modo watch
pnpm test:run     # vitest una vez (lo que corre CI)
pnpm lint         # ESLint + jsx-a11y
pnpm lint:fix     # ESLint con autofix
pnpm typecheck    # tsc --noEmit
pnpm format       # Prettier
```

### Variables de entorno

Copia `.env.example` a `.env.local`. Todas las variables deben llevar el
prefijo `VITE_` para exponerse al cliente; sus tipos viven en
`src/vite-env.d.ts`.

### Calidad de código

- **Pre-commit** (Husky + lint-staged): cada commit pasa ESLint y
  Prettier automáticamente sobre los archivos staged.
- **CI**: GitHub Actions corre `lint`, `typecheck`, `test:run` y `build`
  en cada push/PR a `main`.
- **Reglas activas**: TS strict, `react-hooks/recommended`,
  `react-refresh`, `jsx-a11y/recommended`, Prettier como árbitro final.

### Modo dev (cheats)

En desarrollo aparecen botones extra en la cabecera (no se renderizan en
producción):

- **⚙ Unlock all** — desbloquea todas las ubicaciones del mapa.
- **⛀ +1M Gold** — añade un millón de oro al monedero.
- **⏭ Complete zone** — completa la zona actual (kills al máximo, boss
  - semi-boss derrotados, siguiente zona desbloqueada).
- **★ Complete game** — simula una partida completada al 100%.

## 📋 Añadir contenido

Cada tipo de contenido vive en `src/data/`. El `enemyType` se asigna en
el mapa `ENEMY_TYPES` del propio `enemies.ts`:

```ts
// src/data/enemies.ts
// 1) Declara el tipo (omitir para enemigos sin debilidad como el Ojo de Sauron)
const ENEMY_TYPES: Record<string, EnemyType> = {
  orco_guardia: 'orco',
  // …
};

// 2) Añade la def (stats, sprite opcional, glow opcional)
orco_guardia: {
  id: 'orco_guardia',
  name: 'Orco Guardia',
  hp: 220,
  gold: 42,
  xp: 28,
},
```

Un objeto con bonus situacional (se renderiza como chips coloreados con
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

Una zona de combate con semi-jefe y jefe:

```ts
// src/data/locations.ts
{
  id: 'eregion',
  name: 'Eregion',
  desc: 'Las tierras de los herreros élficos',
  enemies: ['huargo', 'orco_moria'],
  killsNeeded: 80,
  semiBoss: 'capitan_orco',
  boss: 'troll_caverna',
  semiBossAt: 40,            // opcional, default floor(killsNeeded/2)
  bossAt: 80,                // opcional, default killsNeeded
  semiBossTimeLimit: 30,     // opcional, default 30s
  bossTimeLimit: 30,         // opcional, default 30s
  pos: [54.0, 32.5],
  background: '/backgrounds/eregion.jpg',
},
```

Un compañero gateado por jefe:

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
  portraitGlow: 24,            // halo turquesa intenso
  portraitGlowColor: '102, 217, 217',
},
```

> **Cap de nivel:** si insertas una zona en mitad de la lista, los
> índices se desplazan y debes ajustar `COMPANION_LEVEL_CAPS` en
> `src/engine/progression.ts` (y sus tests) para que el tramo siga
> coincidiendo con la zona correcta.

Una misión `reach` recogida en la zona anterior:

```ts
// src/data/quests.ts
{
  id: 'q13',
  name: 'Pasar por Eregion',
  desc: 'Alcanza Eregion',
  type: 'reach',
  loc: 'eregion',            // destino objetivo
  pickupLoc: 'rivendel',     // donde aparece el "!"
  need: 1,
  reward: { gold: 500, mithril: 25 },
},
```

Para convenciones (estructura, naming, dónde poner hooks, reglas de
accesibilidad…), ver [`AGENTS.md`](./AGENTS.md). Para ideas y backlog,
ver [`IDEAS.md`](./IDEAS.md).

## 🧪 Testing

Tests del motor en `src/engine/__tests__/` cubren:

- Fórmulas de daño, XP, level-up, coste de subida de compañeros, bonus
  de equipo por tipo, bonus de armor en el timer (`armorFightTimeBonusS`).
- Reducer de combate (daño al enemigo, recompensas, transición).
- Progresión (desbloqueo de zonas, completion de misiones `reach`,
  gating por compañeros, cap de nivel por zona, `fightTimeLimitForFight`).
- Integridad de contenido: referencias válidas entre `locations`,
  `enemies`, `quests`, `shop` y `companions`, y que cada `enemyType` esté
  en el set permitido (admitiendo enemigos sin tipo).

```bash
pnpm test:run
```

## ☁️ Deploy (Cloudflare)

| Campo                      | Valor                             |
| -------------------------- | --------------------------------- |
| **Build command**          | `pnpm run build`                  |
| **Build output directory** | `dist`                            |
| **Node.js version**        | `22` (`.node-version` en la raíz) |

El proyecto usa **pnpm 11** (`packageManager` en `package.json`). Si
Cloudflare no lo detecta solo, añade **`PNPM_VERSION`** = `11.1.2`.

### Opción A — Cloudflare Pages (recomendada para este SPA)

Deja el **deploy command vacío**. Pages publica `dist/` tras el build; no
hace falta Wrangler.

### Opción B — Workers + assets estáticos

Si usas deploy con Wrangler, **no** uses `npx wrangler deploy` (descarga
wrangler en caliente y vuelve a instalar deps con scripts bloqueados).
Usa:

| Campo              | Valor             |
| ------------------ | ----------------- |
| **Deploy command** | `pnpm run deploy` |

`wrangler.jsonc` ya está en el repo (SPA en `dist/`). `wrangler` va en
`devDependencies` y `pnpm-workspace.yaml` aprueba `esbuild`, `sharp` y
`workerd`.

> **Errores comunes de pnpm en CI:** `packages field missing` → falta
> `packages: ['.']` en `pnpm-workspace.yaml`. `ERR_PNPM_IGNORED_BUILDS`
> → añade el paquete en `allowBuilds` (p. ej. `esbuild`, `sharp`,
> `workerd`).

Rutas del SPA:

- **Workers (`pnpm run deploy`)**: usa
  `not_found_handling: "single-page-application"` en `wrangler.jsonc`.
  **No** añadas `public/_redirects`: Cloudflare detecta bucle infinito
  si conviven ambos (`Invalid _redirects configuration`, código
  `100324`).
- **Pages (sin Wrangler)**: crea `public/_redirects` con una sola línea
  `/*    /index.html   200` para el fallback del SPA. No uses ese
  archivo si despliegas con Workers.

## 🗺️ Roadmap

- [x] Responsive layout para tablet/móvil (drawers, compactación de UI,
      touch drag en el mapa).
- [x] Sistema de halos coloreados configurables por compañero/enemigo.
- [x] Armaduras como bonus de tiempo en semi/jefe.
- [x] Deploy en Cloudflare Pages.
- [ ] Forja de Khazad: mejoras permanentes con mithril (ver `IDEAS.md`).
- [ ] Bestiario / códice (ver `IDEAS.md`).
- [ ] Sprites pixel art para enemigos y compañeros restantes.
- [ ] Sonidos al pegar / críticos / jefe (Howler.js).
- [ ] Extraer subcomponentes de `BattlePanel` a archivos propios
      (`RecruitPanel`, `RestShopPanel`, `EncounterActions`).
- [ ] Simulador de balance/TTK por zona para ajustar economía y tiempos
      de boss.
- [ ] Internacionalización (es / en) con `i18next`.
- [ ] Modo PWA instalable + offline.
- [ ] Migración a IndexedDB con versionado de saves.
- [ ] Storybook para los paneles.
- [ ] Preview por PR en Cloudflare.

## 📝 Licencia

MIT — proyecto personal con fines de aprendizaje, sin afiliación con
Middle-earth Enterprises ni Warner Bros.
