# Lord of the Clicks

> Clicker incremental ambientado en _El Señor de los Anillos_. Nació como un
> proyecto personal para mezclar dos cosas que disfruto: los juegos
> incrementales y construir interfaces con buen detalle visual. La idea es
> recorrer la Tierra Media, desbloquear zonas, reclutar compañeros, mejorar el
> equipo y enfrentarse a semi-jefes y jefes con temporizador.
>
> Aunque el origen es lúdico, lo he tratado como una app frontend completa:
> dominio separado de React, TypeScript estricto, estado global con Zustand,
> responsive real, tests de lógica, accesibilidad y deploy en Cloudflare.

[![CI](https://img.shields.io/badge/CI-passing-brightgreen)](./.github/workflows/ci.yml)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Zustand](https://img.shields.io/badge/Zustand-5-FF6B35)](https://github.com/pmndrs/zustand)
[![Vitest](https://img.shields.io/badge/Vitest-3-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#-licencia)

---

## Por qué este proyecto

Quería hacer un juego pequeño pero con suficiente profundidad como para que
obligase a resolver problemas reales de producto: economía, progresión,
guardado, migraciones, responsive, contenido data-driven y una UI que no se
rompiera en móvil.

El resultado no busca ser una demo aislada ni una landing de portfolio, sino un
proyecto jugable que voy iterando poco a poco. Aun así, el código deja ver
varias decisiones que me interesan como frontend:

- **Separar reglas de juego y UI.** La lógica importante vive en
  `src/engine/` como TypeScript puro; React se encarga de representar estado y
  lanzar acciones.
- **Construir con datos.** Zonas, enemigos, compañeros, equipo, misiones y
  upgrades viven en `src/data/`; añadir contenido no requiere tocar la UI.
- **Cuidar el responsive de verdad.** Desktop usa tres columnas; mobile reduce
  el foco al combate, drawers laterales y controles compactos.
- **Hacer el estado persistente y migrable.** El save usa claves versionadas y
  migraciones para corregir cambios de modelo sin romper partidas.
- **Probar lo que puede romper el juego.** Hay tests para fórmulas, combate,
  progreso, store, contenido y el game loop.

Para probarlo en local:

```bash
pnpm install && pnpm dev   # http://localhost:5173
```

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
  con un toast persistente de derrota (se cierra con la `×`); con la
  `✕` flotante puedes **abandonar manualmente** sin penalización.
  Durante un encuentro se puede cambiar de semi a jefe (o viceversa) sin
  abandonar, sustituye la pelea. El chequeo del deadline corre tanto en
  `useGameLoop` como en el intervalo del `BattlePanel`, para no depender
  de un único interval global.
- 🧩 **Tipos de enemigo y equipo situacional**: los objetos aplican
  multiplicadores porcentuales contra orcos, Uruk-hai, espectros, trolls,
  bestias, mordor, naturaleza, humanos o criatura antigua. Algunos
  enemigos icónicos (Ojo de Sauron, El Anillo) son intencionalmente sin
  tipo. Bonus visibles como **chips coloreados** (`BonusVsChips`).
- 🪙 **Forja de Rivendel**: árbol de mejoras permanentes desbloqueable al
  visitar Rivendel. **14 nodos en 5 cadenas** (daño, riqueza, sabiduría,
  tiempo y compañeros) con prerequisitos visualizados por líneas SVG,
  diseño en diamante, compra por click/doble-click, reset con
  confirmación in-game y refund completo de mithril.
- 🧙 **Reclutamiento de La Comunidad** en zonas de descanso, con
  retratos a color tras desbloquear y gates por jefe derrotado para
  héroes icónicos (p. ej. el Rey de los Muertos).
- 🏪 **Tiendas locales** y **toggle "Reclutar / Tienda"** en algunas
  zonas de combate para reclutar compañeros únicos.
- 🛡️ **Equipo épico** (Dardo, Hadhafang, Hacha de Gimli, Cota de
  Mithril, Luz de Galadriel, Palantír…) con bonus de especialización.
- ⏱️ **Armaduras como tiempo**: el `def` de las armaduras no suma DPS,
  **añade segundos al timer de semi/jefe** (`+1s` cada 5 puntos).
- 📈 **Cap de nivel de compañeros por progreso**: evita farmear el
  early-game para trivializar el final.
- 📜 **24 misiones descubribles** (`reach` / `kills_at` / `boss`) con
  badge `!`; las quests `reach` se reparten en la zona _anterior_ y se
  acreditan al **visitar físicamente** la zona objetivo, no al
  desbloquearla por gate (separación explícita `visitedLocs` vs
  `unlockedLocs` para evitar autocompletados accidentales).
- 💾 **Guardado automático** en `localStorage`, debounced a 500ms, con
  **migración entre versiones de save** (`SAVE_KEY` versionada,
  actualmente `v11`; la migración v10→v11 reconstruye `visitedLocs` desde
  `locIdx` para sanear quests `reach` mal completadas). Al recargar, los
  jugadores con partida en curso saltan la bienvenida y el game loop
  arranca al instante (también se resincroniza al volver de bfcache o
  cambiar de pestaña, evitando "DPS pasivo congelado"). El botón de
  reiniciar partida borra ambas claves y devuelve a la pantalla de
  bienvenida.
- ✨ **Halos coloreados configurables** por compañero y enemigo.

### UI / responsive

- 🖥️ **Desktop**: tres columnas (Comunidad + Equipo · Batalla + Mapa ·
  Misiones + Tienda).
- 📱 **Tablet y mobile**: foco en `BattlePanel`, mapa como tira
  inferior, paneles laterales se vuelven drawers mutuamente exclusivos.
- 📐 **Compactación selectiva por viewport**: `CurrencyBar` reduce
  iconos y cambia "Nivel 50" → "Lvl 50"; "Comprar · 950 oro" → "950 G";
  "+45% ORC" → "+45% O" cuando la rejilla está densa.
- 🎨 **Fondos por localización** con **precarga inteligente** (zona
  actual + adyacentes desbloqueadas), `Image.decoding = 'async'` y caché
  de URLs ya pedidas para que viajar en móvil no muestre un flash en
  negro. Temática visual coherente: tipografía **Ringbearer** para el
  título principal, Aniron/Cinzel para el resto, paleta dorada y
  pergamino, fondo de página en gris neutro.
- ♿ **Accesibilidad**: interactivos `<button>` semánticos con
  `aria-label`, tooltips, `focus-visible` consistente y
  `eslint-plugin-jsx-a11y` bloqueando el lint en CI.
- 🧱 **Error boundary global** que captura crashes sin perder el save.

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
| Deploy          | **Cloudflare Pages / Workers** (`wrangler` opcional)                      |
| Package manager | **pnpm 11**                                                               |

## 🏗️ Arquitectura

```
src/
├── types/game.ts              # Modelo de dominio (Location, Enemy, Quest, Companion, GameState, UpgradeDefinition…)
├── data/                      # Contenido del juego (data-as-code)
│   ├── locations.ts           #   30 zonas siguiendo la trilogía de Peter Jackson
│   ├── enemies.ts             #   pool de mobs + semi-jefes + jefes por zona (con glow opcional)
│   ├── companions.ts          #    20 miembros de La Comunidad (coste, retrato, glow, gates)
│   ├── shop.ts                #   armas, armaduras y accesorios por zona
│   ├── quests.ts              #   24 misiones de tipo kills_at / boss / reach
│   ├── upgrades.ts            #   árbol de mejoras de la Forja (5 cadenas, 14 nodos)
│   └── index.ts               #   barrel exports
├── engine/                    # Lógica de juego pura (TS sin React)
│   ├── formulas.ts            #   xp/nivel, DPS, daño click, bonus por tipo, armorFightTimeBonusS, upgradeCost
│   ├── combat.ts              #   dealDamage (reducer puro testable)
│   ├── progression.ts         #   desbloqueo de zonas, gates, reach quests (visitedLocs), cap nivel, fightTimeLimitForFight
│   ├── spawn.ts               #   generación de enemigos / semi-bosses / bosses
│   ├── persistence.ts         #   save/load + migraciones por SAVE_KEY versionada (v10 → v11)
│   ├── store.ts               #   Zustand store (datos + actions: startBossFight, buyUpgrade, resetUpgrades…)
│   └── __tests__/             #   tests unitarios del motor (engine + content + store)
├── hooks/                     # Hooks reutilizables
│   ├── useGameLoop.ts         #   tick de DPS, auto-save, deadline de boss-fight, resync en visibility/pageshow
│   ├── __tests__/             #   tests del game loop (deadline + activación)
│   └── useMapInteraction.ts   #   pan / zoom / drag (mouse + touch) del mapa con translate3d + rAF
├── components/                # Componentes React (TSX, un componente por archivo)
│   ├── App.tsx                #   layout principal, drawers laterales en mobile, dev cheats
│   ├── ErrorBoundary.tsx      #   captura crashes y renderiza fallback
│   ├── BattlePanel.tsx        #   combate; subcomponentes internos: FloatingActions, EncounterChip, …
│   ├── ForgeModal.tsx         #   modal del árbol de mejoras (diamantes + SVG connections + confirm modal)
│   ├── BonusVsChips.tsx       #   chips coloreados por tipo (variantes full / mini)
│   ├── MapPanel.tsx           #   wrapper con título = nombre de zona actual + modo expandido
│   ├── MapView.tsx            #   viewport del mapa (consume useMapInteraction)
│   ├── MapMarker.tsx          #   marcador memoizado + badge "!" informativo
│   ├── MapPaths.tsx           #   rutas SVG entre zonas desbloqueadas
│   ├── Modal.tsx              #   modal genérico (mapa expandido)
│   ├── CompanionsPanel.tsx    #   lista de héroes, subida de nivel, cap por progreso
│   ├── EquipmentPanel.tsx     #   slots de arma/armadura/accesorio con BonusVsChips
│   ├── QuestsPanel.tsx        #   misiones aceptadas + claim
│   ├── ShopPanel.tsx          #   tienda global filtrada por zonas visitadas
│   ├── CurrencyBar.tsx        #   oro, mithril, XP, kills + botón de la Forja (con estado bloqueado/desbloqueado)
│   ├── ForgeButton.tsx        #   botón reutilizable de la Forja (desktop en CurrencyBar, móvil en mobileActions)
│   └── Panel.tsx              #   marco de pergamino reutilizable con título centrado
├── styles/                    # CSS Modules para temas custom
│   ├── app.module.css         #   layout responsive + drawers
│   ├── battle.module.css      #   escena de combate, semis/jefes, reclutamiento, tienda local, toast de Forja
│   ├── currency.module.css    #   currency bar full / mini, botón de Forja con highlight/locked
│   ├── forge.module.css       #   modal de la Forja: nodos en diamante, líneas SVG, confirm modal
│   ├── map.module.css         #   mapa, marcadores, ruta, toolbar
│   └── panel.module.css       #   marco de pergamino + cards
├── lib/                       # Utilidades transversales
│   ├── equipmentText.ts       #   labels/iconos/colores/abreviaturas de tipos, getBonusVsEntries
│   └── logger.ts              #   logger abstraído (preparado para Sentry/Datadog)
├── test/setup.ts              # Setup global de Vitest
├── main.tsx                   # Entry point (StrictMode + ErrorBoundary)
└── index.css                  # Tailwind v4 + tema CSS vars + @font-face Ringbearer/Aniron
```

### Decisiones de diseño (por qué cada cosa está donde está)

- **Motor puro, store fino, componentes tontos.** `combat.ts`,
  `progression.ts`, `formulas.ts` y `spawn.ts` son funciones puras sin
  dependencias de React. El store de Zustand sólo expone datos +
  actions. Los componentes no calculan reglas de juego, sólo las
  consumen. Esto permite testear el dominio sin montar nada y migrar la
  UI sin tocar la lógica.
- **Side-effects en hooks, nunca a nivel de módulo.** Tick de DPS,
  autosave y deadline de las boss-fights viven en `useGameLoop`, que
  además se resincroniza con `visibilitychange` y `pageshow` para que
  el DPS pasivo no se quede congelado tras cambiar de pestaña o volver
  desde la bfcache. Pan/zoom/drag del mapa vive en `useMapInteraction`.
  Compatible con HMR, SSR y unit-testable.
- **`useMapInteraction` aplica `translate3d` directo al DOM con `rAF`**
  durante el drag para mantener 60 fps con la imagen pesada del mapa,
  evitando re-renders de React en cada `pointermove`.
- **Tailwind para layout, CSS Modules para temas custom.** Utilidades
  rápidas para grids/spacings y CSS aislado para escena de combate,
  mapa, retratos con vignette, currency bar, drawers, modal de la Forja,
  etc. Sin styled-components, sin emotion, sin inline styles masivos.
- **Datos como código y autocompletado.** Añadir contenido es editar un
  `.ts` con tipos completos. Cada zona declara `semiBoss`, `boss`,
  `semiBossAt`, `bossAt`, `semiBossTimeLimit`, `bossTimeLimit`,
  `unlockGate`, `hasShop`, `background`, etc. Un test de integridad
  detecta referencias rotas entre `locations`, `enemies`, `quests`,
  `shop` y `companions`.
- **Equipo situacional con UI consistente.** `calcEnemyTypeMultiplier`,
  `calcClickDamageAgainstEnemy` y `calcDpsAgainstEnemy` aplican los
  multiplicadores por tipo. `BonusVsChips` + `getBonusVsEntries`
  renderizan los bonuses como chips coloreados en tienda y
  equipamiento.
- **Cap de nivel de compañeros.** `companionLevelCapForLocation(locIdx)`
  define tramos crecientes. El store rechaza `levelUpCompanion` por
  encima del cap; el panel muestra "MAX" con tooltip. Tests dedicados.
- **Boss-fight: fail vs abandon.** `failBossFight` se dispara desde el
  `useGameLoop` (y como red de seguridad desde el propio `BattlePanel`)
  cuando expira el deadline, mostrando un toast persistente
  "¡Has perdido!" que el jugador cierra manualmente con la `×`.
  `abandonBossFight` es la acción explícita del usuario (silenciosa).
  `startBossFight` con un tier distinto **sustituye** el encuentro.
- **Quests data-driven.** Las misiones `reach` declaran `pickupLoc` ≠
  `loc`, para que la zona anterior "dé" la quest sin bloquear el avance.
- **Estado serializable + migraciones.** `GameState` es un POJO.
  `persistence.ts` usa una `SAVE_KEY` versionada y aplica migraciones al
  cargar saves antiguos (p. ej. introducir `forgeUnlocked`/`forgeSeen`
  sin romper partidas existentes). Sanea también partidas en estado raro
  (semi/jefe en pantalla sin `bossFight`, niveles de compañeros
  corruptos) respawneando un mob del pool y normalizando el `level`. La
  migración **v10 → v11** ilustra la estrategia: se detecta el save
  legacy, se reconstruye `visitedLocs` desde `locIdx` (el mapa es lineal,
  así que toda zona anterior a la actual fue visitada) y se resetea
  `questProgress` de las quests `reach` aún no reclamadas, preservando
  las completadas para no romper partidas.
- **`visitedLocs` vs `unlockedLocs`.** Distinción explícita en el dominio:
  una zona puede estar **desbloqueada** (accesible en el mapa, p. ej. al
  reclutar Frodo + Sam) sin estar **visitada** (haber viajado allí). Las
  misiones `reach` consultan `visitedLocs`; los componentes
  (`QuestsPanel`, `combat.ts`, `applyPostMutations`) usan la misma
  fuente. Un test en `store.test.ts` blinda el caso para evitar
  autocompletados al desbloquear gates.
- **Forja desbloqueable con onboarding.** El botón nace bloqueado
  (gris + `disabled` + `aria-disabled`). Al visitar Rivendel por
  primera vez se desbloquea, se dispara un toast persistente
  ("¡Forja desbloqueada!") y el botón pulsa con un glow dorado. El
  highlight se apaga al abrir la Forja por primera vez. Estado en el
  store + UI guiada por flags (`forgeUnlocked`, `forgeSeen`,
  `forgeUnlockFlash`).
- **Confirmaciones in-game, no `window.confirm`.** Las acciones
  destructivas (reset del árbol de la Forja) abren un modal estilizado
  con `Esc`, backdrop dismiss y `autoFocus` en el confirmar, no el
  diálogo nativo del navegador.
- **Accesibilidad por defecto.** `eslint-plugin-jsx-a11y` rompe el lint
  si se introduce un interactivo sin semántica. `<button>` siempre, no
  `<div onClick>`. Iconos decorativos con `aria-hidden`. Imágenes con
  `alt`.
- **Responsive con HTML semántico estable.** `app.module.css` define el
  grid desktop y muta a una sola columna con drawers en
  `max-width: 1180px`. Los paneles compactan textos sustituyendo spans
  `data-form="full"` por `data-form="mini"` vía media queries,
  manteniendo el HTML igual en ambos tamaños (mejor para tests y a11y).

## Lectura técnica del proyecto

### Arquitectura frontend

- Componentes con responsabilidad acotada y comunicación vía store.
- Zustand con **selectors granulares** para evitar re-renders innecesarios.
- Dominio desacoplado de React: ejecutable fuera del navegador y testeable
  sin montar componentes.
- Side effects aislados en hooks (`useGameLoop`, `useMapInteraction`), no en
  módulos globales.

### TypeScript

- `strict` activo, `noUnusedLocals` y `noUnusedParameters`.
- Tipos de dominio explícitos (`EnemyType`, `BossFightState`, `Quest`,
  `Location`, `ShopItem`, `Companion`, `UpgradeDefinition`).
- `Partial<Record<…>>` cuando corresponde, con guards explícitos al
  iterar para satisfacer al compilador sin `as` ni `!`.
- Tests de integridad para detectar referencias rotas entre data files.

### UI/UX

- Layout desktop 3-col que muta a 1-col con drawers mutuamente
  exclusivos en mobile/tablet.
- CSS Modules para piezas visuales custom (combate, mapa, reclutamiento,
  drawers, currency bar, modal de la Forja) y Tailwind para layout.
- Mapa interactivo con drag (mouse + touch), zoom y modal fullscreen.
- Feedback visual: daño flotante, críticos, partículas, temporizador de
  jefe, barras de vida, halos coloreados, hover sólo sobre la imagen,
  toasts persistentes para hitos de progreso.

### Calidad

- ESLint 9 flat config, Prettier, `eslint-plugin-jsx-a11y`, Husky y
  lint-staged.
- CI corre **lint + typecheck + test + build** en cada push/PR a `main`.
- `ErrorBoundary` global para evitar pantallas en blanco.
- Guardado en `localStorage` con migraciones y autosave debounced.
- **40 tests Vitest** en 6 archivos cubriendo combate, fórmulas,
  progresión, store, game-loop y contenido.

### Cosas que todavía quiero mejorar

No lo considero "terminado". Algunas partes funcionan bien pero tienen margen:

- `BattlePanel.tsx` concentra demasiado código (combate, reclutamiento,
  tienda local y chips de encuentro). Quiero extraer subcomponentes para
  reducir tamaño y facilitar tests.
- Faltan tests de interacción visual con Testing Library para mapa, drawers,
  modales y flujo de reclutamiento.
- El balance económico se ajusta a mano; sería útil un simulador de TTK y
  recompensas por zona.
- Hay sprites temporales y placeholders; quiero reemplazarlos por arte más
  coherente.
- La persistencia en `localStorage` es suficiente para el alcance actual, pero
  IndexedDB encajaría mejor si el save creciera o añadiera más metadatos.
- El proyecto está en español; una i18n ES/EN haría el código de textos más
  mantenible.

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

- **⚙ Unlock all** — desbloquea todas las ubicaciones del mapa y la Forja.
- **⛀ +1M G/M** — añade 1M de oro y 1M de mithril al monedero.
- **⏭ Complete zone** — completa la zona actual (kills al máximo, boss
  - semi-boss derrotados, siguiente zona desbloqueada).
- **★ Complete game** — simula una partida completada al 100%, dejando los
  héroes a nivel 1 y sin equipo equipado para poder probar sin DPS pasivo
  exagerado.

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

Un nodo del árbol de la Forja:

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
  requires: { golpe_elfico: 2 },   // gate por prerequisito
  position: { x: 24, y: 68 },      // % sobre el árbol de fondo
  branch: 'wealth',
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

40 tests Vitest distribuidos entre el motor y los hooks:

- **`engine/__tests__/formulas.test.ts`** — daño, XP, level-up, coste
  de subida de compañeros, bonus por tipo, bonus de armor en el timer
  (`armorFightTimeBonusS`), coste de upgrades de la Forja.
- **`engine/__tests__/combat.test.ts`** — reducer de combate (daño al
  enemigo, recompensas, transición, drop de mithril por tier).
- **`engine/__tests__/progression.test.ts`** — desbloqueo de zonas,
  completion de misiones `reach` (vía `visitedLocs`), gating por
  compañeros, cap de nivel por zona, `fightTimeLimitForFight`.
- **`engine/__tests__/store.test.ts`** — acciones del store Zustand
  sobre estado real: compra de upgrades, gates por `requires`/`maxRank`,
  y el caso de regresión "reclutar Frodo + Sam no completa la quest de
  Bosque Viejo hasta haber viajado". También cubre el cheat
  `completeAll` (todas las zonas quedan desbloqueadas, visitadas y
  navegables, héroes a nivel 1 y sin equipo equipado para facilitar
  pruebas manuales sin DPS pasivo excesivo).
- **`engine/__tests__/content.test.ts`** — integridad: referencias
  válidas entre `locations`, `enemies`, `quests`, `shop`, `companions`
  y `upgrades`; cada `enemyType` está en el set permitido.
- **`hooks/__tests__/useGameLoop.test.ts`** — el loop termina la pelea
  al expirar el deadline y no avanza cuando está inactivo (welcome
  screen).

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
- [x] **Forja de Rivendel**: árbol de mejoras permanentes con mithril,
      desbloqueable visitando Rivendel, con reset y refund.
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
