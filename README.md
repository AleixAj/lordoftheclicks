# Lord of the Clicks

> Un clicker incremental ambientado en _El Señor de los Anillos_. Recorre la Tierra Media, derrota orcos, trolls y nazgûls, y desbloquea la Comunidad del Anillo.

[![CI](https://img.shields.io/badge/CI-passing-brightgreen)](./.github/workflows/ci.yml)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Zustand](https://img.shields.io/badge/Zustand-5-FF6B35)](https://github.com/pmndrs/zustand)
[![Vitest](https://img.shields.io/badge/Vitest-3-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#-licencia)

---

## ✨ Características

- 🗺️ **Mapa interactivo** de la Tierra Media con pan, zoom (rueda + drag), centrado animado entre ubicaciones y herramienta de coordenadas en dev.
- ⚔️ **Combate por click** con animaciones, críticos, partículas de oro y barra de vida en tiempo real.
- 🧙 **La Comunidad del Anillo** como compañeros que generan DPS pasivo y se pueden subir de nivel.
- 🛡️ **Equipo épico** (Andúril, Cota de Mithril, Palantír…) comprable según la zona alcanzada.
- 📜 **Sistema de misiones** con tres tipos: `kills_at`, `boss` y `reach`.
- 💾 **Guardado automático** en `localStorage`, debounced a 500 ms.
- 🎨 **Fondos por localización** y temática visual coherente (Comarca, Bree…).
- ♿ **Accesible**: todos los elementos interactivos son `<button>` semánticos con `aria-label` y `focus-visible`.

## 🛠️ Stack

| Capa             | Herramienta                                                              |
| ---------------- | ------------------------------------------------------------------------ |
| Build / dev      | **Vite 6** con HMR                                                       |
| Lenguaje         | **TypeScript 5.7** (strict, `noUnusedLocals`, `noUnusedParameters`)      |
| UI               | **React 19**                                                             |
| Estado           | **Zustand 5** (store global + selectors)                                 |
| Estilos          | **Tailwind 4** + **CSS Modules** para temas visuales custom              |
| Tests            | **Vitest 3** + **Testing Library** + jsdom                               |
| Linting          | **ESLint 9** (flat) + **typescript-eslint** + **jsx-a11y** + **Prettier** |
| Pre-commit       | **Husky** + **lint-staged**                                              |
| Observabilidad   | Abstracción `logger` lista para enchufar Sentry/Datadog                  |
| CI               | **GitHub Actions** (lint + typecheck + test + build)                     |
| Package manager  | **pnpm 11**                                                              |

## 🏗️ Arquitectura

```
src/
├── types/game.ts              # Modelo de dominio (Location, Enemy, GameState…)
├── data/                      # Contenido estático del juego
│   ├── locations.ts           #   24 zonas en orden cronológico LOTR
│   ├── enemies.ts             #   35 enemigos + 10 jefes
│   ├── companions.ts          #   16 miembros de La Comunidad
│   ├── shop.ts                #   armas, armaduras y accesorios
│   └── quests.ts              #   misiones desbloqueables
├── engine/                    # Lógica del juego (puro TS, sin React)
│   ├── formulas.ts            #   xp/nivel, DPS, daño click
│   ├── combat.ts              #   dealDamage (reducer puro testable)
│   ├── progression.ts         #   desbloqueo de zonas, compañeros, misiones
│   ├── spawn.ts               #   generación de enemigos y jefes
│   ├── persistence.ts         #   save/load en localStorage
│   ├── store.ts               #   Zustand store (datos + actions)
│   └── __tests__/             #   tests unitarios del motor
├── hooks/                     # Hooks reutilizables
│   ├── useGameLoop.ts         #   monta el tick de DPS y el auto-save
│   └── useMapInteraction.ts   #   pan / zoom / drag del mapa
├── components/                # Componentes React (TSX)
│   ├── App.tsx                #   Layout principal (header + 3 columnas)
│   ├── ErrorBoundary.tsx      #   Captura crashes y renderiza fallback
│   ├── BattlePanel.tsx        #   Combate por click
│   ├── MapPanel.tsx           #   Mapa interactivo (consume useMapInteraction)
│   ├── CompanionsPanel.tsx    #   Lista de héroes y subida de nivel
│   ├── EquipmentPanel.tsx     #   Slots de arma/armadura/accesorio
│   ├── QuestsPanel.tsx        #   Progreso y reclamo de misiones
│   ├── ShopPanel.tsx          #   Tienda filtrada por zonas visitadas
│   ├── CurrencyBar.tsx        #   Oro, mithril, XP y kills
│   └── Panel.tsx              #   Marco de pergamino reutilizable
├── styles/                    # CSS Modules para los temas custom
│   ├── battle.module.css      #   Escena de combate, animaciones, HP bar
│   ├── map.module.css         #   Mapa, marcadores, ruta
│   └── panel.module.css       #   Marco de pergamino reutilizable
├── lib/                       # Utilidades transversales
│   └── logger.ts              #   Logger abstraído (preparado para Sentry)
├── test/setup.ts              # Setup global de Vitest
├── main.tsx                   # Entry point (StrictMode + ErrorBoundary)
└── index.css                  # Tailwind v4 + tema CSS vars
```

### Decisiones de diseño

- **Motor puro**: `combat.ts`, `progression.ts`, `formulas.ts` y `spawn.ts` son funciones puras sin dependencias de React, fácilmente testables. El store de Zustand sólo expone datos + actions.
- **Side-effects en hooks**: el tick de DPS y el auto-save viven en `useGameLoop`, no a nivel de módulo. Compatible con HMR, SSR y unit-testable.
- **`useMapInteraction`**: toda la lógica de pan/zoom/drag/wheel del mapa (>150 líneas) está fuera del componente — el `MapPanel` queda como vista.
- **Tailwind para layout, CSS Modules para temas**: utilidades rápidas para grids/spacings y CSS aislado para los efectos visuales custom (pergamino, batalla, mapa).
- **Datos como código**: añadir una zona, un enemigo o una misión es editar un `.ts` con autocompletado.
- **Estado serializable**: `GameState` es un POJO. El save/load en `localStorage` es trivial y resistente a refactors.
- **Accesibilidad por defecto**: `eslint-plugin-jsx-a11y` bloquea el lint si se introduce un elemento interactivo sin semántica adecuada.

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

En desarrollo aparecen dos botones extra en la cabecera (no se renderizan en producción):

- **⚙ Unlock all** — desbloquea todas las ubicaciones.
- **★ Complete game** — simula una partida completada al 100% (bosses, items, compañeros, oro).

## 📋 Añadir contenido

Cada tipo de contenido vive en `src/data/`. Por ejemplo, una nueva zona:

```ts
// src/data/locations.ts
{
  id: 'eregion',
  name: 'Eregion',
  desc: 'Las tierras de los herreros élficos',
  enemies: ['warg', 'trasgo'],
  killsNeeded: 80,
  pos: [54.0, 32.5],
  background: '/backgrounds/eregion.jpg',
},
```

El motor se encarga de añadirla al mapa, espawnar enemigos, desbloquear la siguiente zona y actualizar las misiones tipo `reach`.

Para más detalle sobre convenciones (estructura de carpetas, dónde poner hooks, cómo nombrar ids, reglas de accesibilidad…), ver [`AGENTS.md`](./AGENTS.md).

## 🧪 Testing

Los tests del motor están en `src/engine/__tests__/` y cubren:

- Fórmulas de daño, XP, level-up y coste de subida de compañeros.
- Reducer de combate (daño al enemigo, recompensas, spawn siguiente).
- Lógica de progresión (desbloqueo de zonas, completion de misiones).

```bash
pnpm test:run
```

## 🗺️ Roadmap

- [ ] Sprites pixel art para enemigos y compañeros
- [ ] Sonidos al pegar / críticos / jefe (Howler.js)
- [ ] Internacionalización (es / en) con `i18next`
- [ ] Modo PWA instalable + offline
- [ ] Migración a IndexedDB con versionado de saves
- [ ] Storybook para los paneles
- [ ] Deploy en Cloudflare con preview por PR

## 📝 Licencia

MIT — proyecto personal con fines de aprendizaje, sin afiliación con Middle-earth Enterprises ni Warner Bros.
