# Lord of the Clicks

> Un clicker incremental ambientado en _El Señor de los Anillos_. Recorre la Tierra Media, recluta a la Comunidad del Anillo, supera misiones por zona y desafía a semi-jefes y jefes con tiempo limitado.

[![CI](https://img.shields.io/badge/CI-passing-brightgreen)](./.github/workflows/ci.yml)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Zustand](https://img.shields.io/badge/Zustand-5-FF6B35)](https://github.com/pmndrs/zustand)
[![Vitest](https://img.shields.io/badge/Vitest-3-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#-licencia)

---

## Por Qué Existe

Este proyecto está planteado como una demo de portfolio frontend, no sólo como un juego. El objetivo es enseñar cómo estructuro una aplicación React con estado complejo, lógica de dominio testable, contenido data-driven, UI cuidada y tooling moderno.

Lo más relevante para una evaluación técnica:

- Arquitectura separada entre **UI React**, **estado global Zustand** y **motor puro TypeScript**.
- Lógica de juego cubierta con tests unitarios y tests de integridad de contenido.
- Datos del juego tipados como código: localizaciones, enemigos, misiones, tienda y compañeros.
- Interacciones ricas de UI: mapa con pan/zoom, modal fullscreen, timers, overlays, animaciones y guardado automático.
- Accesibilidad pragmática: botones semánticos, `aria-label`, estados `focus-visible` y lint `jsx-a11y`.
- Performance consciente: mapa optimizado con `translate3d` + `requestAnimationFrame`, autosave debounced y suscripción acotada a cambios de `state`.

## ✨ Características

- 🗺️ **Mapa interactivo** de la Tierra Media con pan, zoom (rueda + drag), centrado animado, modo pantalla completa optimizado con `translate3d` + `requestAnimationFrame`, y badge `!` informativo sobre las zonas con misiones disponibles.
- ⚔️ **Combate por click** con animaciones, críticos, partículas de oro, barra de vida en tiempo real y sprite de enemigo personalizable por zona.
- 👹 **Jefes y semi-jefes con tiempo limitado**: cada zona desbloquea un semi-jefe a los X kills y un jefe tras los Y kills (configurable por zona). Si no los venzes a tiempo, escapan. Repetibles cuando quieras.
- 🧩 **Tipos de enemigo y equipo situacional**: los objetos pueden aplicar bonus porcentuales contra orcos, Uruk-hai, espectros, trolls, bestias, Mordor, etc. El bonus afecta tanto al click como al DPS pasivo, haciendo útil re-equiparse según la zona.
- ⬅️➡️ **Navegación rápida entre zonas adyacentes** con flechas laterales en el panel de combate.
- 🧙 **Reclutamiento de La Comunidad** en zonas de descanso: silueta negra → retrato a color al desbloquear. Frodo y Sam son gratis pero requieren reclutarlos; el resto cuesta oro. La Comarca se "abre" hacia el Bosque Viejo cuando reclutas a Frodo + Sam (`unlockGate`).
- 🛡️ **Equipo épico** (Dardo, Glamdring, Andúril, Cota de Mithril, Luz de Galadriel, Palantír…) comprable por zona y con bonus de especialización.
- 📜 **Misiones descubribles**: las misiones empiezan ocultas y se revelan con un botón `!` en la pantalla de combate. Las misiones tipo `reach` se reparten en la zona _anterior_ ("vé a X") así que aceptarlas nunca bloquea tu avance.
- 💾 **Guardado automático** en `localStorage`, debounced a 500 ms, con migración de saves entre versiones.
- 🎨 **Fondos por localización** y temática visual coherente (tipografía Aniron, paleta dorada).
- ♿ **Accesible**: todos los interactivos son `<button>` semánticos con `aria-label` y `focus-visible`, validado por `eslint-plugin-jsx-a11y`.
- 🧱 **Error boundary global** que captura crashes y muestra un fallback sin perder el save.

## 🛠️ Stack

| Capa            | Herramienta                                                              |
| --------------- | ------------------------------------------------------------------------ |
| Build / dev     | **Vite 6** con HMR                                                       |
| Lenguaje        | **TypeScript 5.7** (strict, `noUnusedLocals`, `noUnusedParameters`)      |
| UI              | **React 19**                                                             |
| Estado          | **Zustand 5** (store global + selectors)                                 |
| Estilos         | **Tailwind 4** + **CSS Modules** para temas visuales custom              |
| Tests           | **Vitest 3** + **Testing Library** + jsdom                               |
| Linting         | **ESLint 9** (flat) + **typescript-eslint** + **jsx-a11y** + **Prettier** |
| Pre-commit      | **Husky** + **lint-staged**                                              |
| Observabilidad  | Abstracción `logger` lista para enchufar Sentry/Datadog                  |
| CI              | **GitHub Actions** (lint + typecheck + test + build)                     |
| Package manager | **pnpm 11**                                                              |

## 🏗️ Arquitectura

```
src/
├── types/game.ts              # Modelo de dominio (Location, Enemy, Quest, GameState…)
├── data/                      # Contenido estático del juego
│   ├── locations.ts           #   ~29 zonas siguiendo la trilogía de Peter Jackson
│   ├── enemies.ts             #   pool de mobs + semi-jefes + jefes por zona
│   ├── companions.ts          #   miembros de La Comunidad (con coste y retrato)
│   ├── shop.ts                #   armas, armaduras y accesorios
│   ├── quests.ts              #   misiones de tipo kills_at / boss / reach
│   └── index.ts               #   barrel exports
├── engine/                    # Lógica del juego (puro TS, sin React)
│   ├── formulas.ts            #   xp/nivel, DPS, daño click, bonus por tipo
│   ├── combat.ts              #   dealDamage (reducer puro testable)
│   ├── progression.ts         #   desbloqueo de zonas, gates, reach quests
│   ├── spawn.ts               #   generación de enemigos / semi-bosses / bosses
│   ├── persistence.ts         #   save/load + migraciones por SAVE_KEY
│   ├── store.ts               #   Zustand store (datos + actions)
│   └── __tests__/             #   tests unitarios del motor
├── hooks/                     # Hooks reutilizables
│   ├── useGameLoop.ts         #   tick de DPS, auto-save, deadline de boss-fight
│   └── useMapInteraction.ts   #   pan / zoom / drag del mapa (translate3d + rAF)
├── components/                # Componentes React (TSX, un componente por archivo)
│   ├── App.tsx                #   layout principal (header + 3 columnas)
│   ├── ErrorBoundary.tsx      #   captura crashes y renderiza fallback
│   ├── BattlePanel.tsx        #   combate, boss/semi flotantes, "!" de misiones, navegación
│   ├── MapPanel.tsx           #   wrapper con botón de expandir
│   ├── MapView.tsx            #   viewport del mapa (consume useMapInteraction)
│   ├── MapMarker.tsx          #   marcador memoizado + badge "!" informativo
│   ├── MapPaths.tsx           #   rutas SVG entre zonas desbloqueadas
│   ├── Modal.tsx              #   modal genérico (mapa expandido)
│   ├── CompanionsPanel.tsx    #   lista de héroes y subida de nivel
│   ├── EquipmentPanel.tsx     #   slots de arma/armadura/accesorio
│   ├── QuestsPanel.tsx        #   misiones aceptadas, compacto 2-col + claim arriba-derecha
│   ├── ShopPanel.tsx          #   tienda filtrada por zonas visitadas
│   ├── CurrencyBar.tsx        #   oro, mithril, XP y kills
│   └── Panel.tsx              #   marco de pergamino reutilizable con título centrado
├── styles/                    # CSS Modules para los temas custom
│   ├── battle.module.css      #   escena de combate, boss/semi, "!" pickup, reclutamiento
│   ├── map.module.css         #   mapa, marcadores, ruta, badge informativo
│   └── panel.module.css       #   marco de pergamino reutilizable
├── lib/                       # Utilidades transversales
│   ├── equipmentText.ts       #   labels/iconos/formato de equipo y tipos de enemigo
│   └── logger.ts              #   logger abstraído (preparado para Sentry/Datadog)
├── test/setup.ts              # Setup global de Vitest
├── main.tsx                   # Entry point (StrictMode + ErrorBoundary)
└── index.css                  # Tailwind v4 + tema CSS vars + @font-face Aniron
```

### Decisiones de diseño

- **Motor puro**: `combat.ts`, `progression.ts`, `formulas.ts` y `spawn.ts` son funciones puras sin dependencias de React, fácilmente testables. El store de Zustand sólo expone datos + actions.
- **Side-effects en hooks**: el tick de DPS, el auto-save y el deadline de las boss-fights viven en `useGameLoop`, no a nivel de módulo. Compatible con HMR, SSR y unit-testable.
- **`useMapInteraction`**: toda la lógica de pan/zoom/drag/wheel del mapa (>150 líneas) está fuera del componente; el `MapView` queda como vista. En modo pantalla completa, las transformaciones se aplican vía `translate3d` directo al DOM con `requestAnimationFrame` para mantener fluidez con imágenes pesadas.
- **Tailwind para layout, CSS Modules para temas**: utilidades rápidas para grids/spacings y CSS aislado para los efectos visuales custom (pergamino, batalla, mapa, retratos con vignette).
- **Datos como código**: añadir una zona, un enemigo, una misión o un compañero es editar un `.ts` con autocompletado. Cada zona puede declarar `semiBoss`, `boss`, `semiBossAt`, `bossAt`, `semiBossTimeLimit`, `bossTimeLimit`, `unlockGate`, `background`, `backgroundPosition`, `backgroundSize`. Cada enemigo tiene `enemyType`; cada objeto puede declarar `bonusVs`; cada compañero puede declarar `recruitCost`, `portrait` y `portraitScale` (para razas más bajas como enanos/hobbits).
- **Equipo situacional**: `calcEnemyTypeMultiplier`, `calcClickDamageAgainstEnemy` y `calcDpsAgainstEnemy` aplican multiplicadores por tipo de enemigo en el momento de dañar, manteniendo las fórmulas base reutilizables para UI.
- **Quests data-driven**: las misiones `reach` declaran `pickupLoc` (zona donde aparece el `!`) ≠ `loc` (destino objetivo), para que la zona anterior "dé" la quest hacia la siguiente sin bloquear el avance.
- **Estado serializable**: `GameState` es un POJO. `persistence.ts` usa una `SAVE_KEY` versionada y aplica migraciones al cargar saves antiguos.
- **Accesibilidad por defecto**: `eslint-plugin-jsx-a11y` bloquea el lint si se introduce un elemento interactivo sin semántica adecuada.

## Qué Demuestra Técnicamente

### Frontend Architecture

- Componentes React con responsabilidad clara y comunicación vía store.
- Estado global con Zustand usando selectors para minimizar re-renders innecesarios.
- Dominio desacoplado de React: reducers y fórmulas del juego viven en `src/engine/`.
- Side effects aislados en hooks (`useGameLoop`, `useMapInteraction`) en lugar de timers o listeners a nivel de módulo.

### TypeScript

- `strict` activo.
- Tipos de dominio explícitos (`EnemyType`, `BossFightState`, `Quest`, `Location`, `ShopItem`).
- Datos estáticos tipados, lo que permite autocompletado y validación al añadir contenido.
- Tests de integridad para detectar referencias rotas entre localizaciones, enemigos, misiones y tienda.

### UI/UX

- Layout de tres columnas con paneles temáticos.
- CSS Modules para piezas visuales custom: escena de combate, mapa, reclutamiento, botones circulares, overlays y animaciones.
- Mapa interactivo con zoom/drag y modal fullscreen.
- Feedback visual: daño flotante, críticos, partículas, temporizador de boss, barras de vida y estados de compra/equipamiento.

### Calidad

- ESLint 9 flat config, Prettier, `eslint-plugin-jsx-a11y`, Husky y lint-staged.
- CI preparada para lint, typecheck, tests y build.
- ErrorBoundary global para evitar pantallas en blanco.
- Guardado en `localStorage` con migraciones y autosave debounced.

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

Copia `.env.example` a `.env.local`. Todas las variables deben llevar el prefijo `VITE_` para exponerse al cliente; sus tipos viven en `src/vite-env.d.ts`.

### Calidad de código

- **Pre-commit hook** (Husky + lint-staged): cada commit pasa ESLint y Prettier automáticamente sobre los archivos staged.
- **CI**: GitHub Actions corre `lint`, `typecheck`, `test:run` y `build` en cada push/PR a `main`.
- **Reglas activas**: TS strict, `react-hooks/recommended`, `react-refresh`, `jsx-a11y/recommended`, Prettier como árbitro final.

### Modo dev (cheats)

En desarrollo aparecen tres botones extra en la cabecera (no se renderizan en producción):

- **⚙ Unlock all** — desbloquea todas las ubicaciones del mapa.
- **⏭ Complete zone** — completa la zona actual (kills al máximo, boss + semi-boss derrotados, misiones aceptadas reclamables, siguiente zona desbloqueada).
- **★ Complete game** — simula una partida completada al 100% (bosses, items, compañeros, misiones, oro).

## 📋 Añadir contenido

Cada tipo de contenido vive en `src/data/`. Por ejemplo, un nuevo enemigo:

```ts
// src/data/enemies.ts
orco_guardia: {
  id: 'orco_guardia',
  name: 'Orco Guardia',
  hp: 220,
  gold: 42,
  xp: 28,
  enemyType: 'orco',
},
```

Un nuevo objeto con bonus situacional:

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

Y una nueva zona de combate con semi-jefe y jefe:

```ts
// src/data/locations.ts
{
  id: 'eregion',
  name: 'Eregion',
  desc: 'Las tierras de los herreros élficos',
  enemies: ['huargo', 'trasgo'],
  killsNeeded: 80,
  semiBoss: 'capitan_orco',
  boss: 'troll_caverna',
  semiBossAt: 40,            // opcional, por defecto floor(killsNeeded/2)
  bossAt: 80,                // opcional, por defecto killsNeeded
  semiBossTimeLimit: 30,     // opcional, por defecto 30s
  bossTimeLimit: 60,         // opcional, por defecto 60s
  pos: [54.0, 32.5],
  background: '/backgrounds/eregion.jpg',
},
```

Y una nueva misión de tipo `reach` que se recoge en la zona anterior:

```ts
// src/data/quests.ts
{
  id: 'q13',
  name: 'Pasar por Eregion',
  desc: 'Alcanza Eregion',
  type: 'reach',
  loc: 'eregion',            // destino objetivo
  pickupLoc: 'rivendel',     // donde aparece el "!" en el panel
  need: 1,
  reward: { gold: 500, mithril: 25 },
},
```

El motor se encarga de añadirla al mapa, espawnar enemigos, mostrar el `!` en la zona correcta, gestionar los desafíos de semi-jefe/jefe, desbloquear la siguiente zona y reclamar la misión cuando proceda.

Para más detalle sobre convenciones (estructura de carpetas, dónde poner hooks, cómo nombrar ids, reglas de accesibilidad…), ver [`AGENTS.md`](./AGENTS.md).

## 🧪 Testing

Los tests del motor están en `src/engine/__tests__/` y cubren:

- Fórmulas de daño, XP, level-up, coste de subida de compañeros y bonus de equipo por tipo de enemigo.
- Reducer de combate (daño al enemigo, recompensas, transición a siguiente).
- Lógica de progresión (desbloqueo de zonas, completion de misiones `reach`, gating por compañeros).
- Integridad de contenido: referencias válidas entre `locations`, `enemies`, `quests`, `shop` y `companions`.

```bash
pnpm test:run
```

## 🗺️ Roadmap

- [ ] Sprites pixel art para enemigos y compañeros restantes
- [ ] Sonidos al pegar / críticos / jefe (Howler.js)
- [ ] Extraer `BattlePanel` en subcomponentes (`RecruitPanel`, `RestShopPanel`, `EncounterActions`) para seguir la convención de un componente por archivo
- [ ] Responsive layout para tablet/móvil
- [ ] Simulador de balance/TTK por zona para ajustar economía y tiempos de boss
- [ ] Internacionalización (es / en) con `i18next`
- [ ] Modo PWA instalable + offline
- [ ] Migración a IndexedDB con versionado de saves
- [ ] Storybook para los paneles
- [ ] Deploy en Cloudflare con preview por PR

## 📝 Licencia

MIT — proyecto personal con fines de aprendizaje, sin afiliación con Middle-earth Enterprises ni Warner Bros.
