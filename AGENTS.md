# Convenciones del proyecto

Documento corto para que cualquier desarrollador (humano o IA) que toque este repo
sepa dónde poner las cosas y cómo trabajar. Si añades algo que no encaja en
ningún sitio, **primero documenta la convención aquí** y luego implementa.

## Stack

- **Vite 6** + **React 19** + **TypeScript 5.7** (strict).
- **Zustand 5** para estado global (`src/engine/store.ts`).
- **Tailwind 4** para utilidades. **CSS Modules** para temas visuales custom (mapa, batalla, paneles).
- **Vitest 3** + **Testing Library** para tests.
- **ESLint 9** flat config + **Prettier** + `eslint-plugin-jsx-a11y`.
- **Husky** + **lint-staged** corren `eslint --fix` y `prettier --write` en pre-commit.
- Gestor de paquetes: **pnpm**.

## Estructura de carpetas

```
src/
├── types/            Modelos de dominio (interfaces TS puras).
├── data/             Contenido del juego. Editar aquí para añadir zonas, enemigos, items.
├── engine/           Lógica pura del juego (sin React).
│   ├── formulas.ts   Cálculos (xp, dps, daño…). Funciones puras.
│   ├── combat.ts     Reducers de combate.
│   ├── progression.ts Desbloqueo de zonas/compañeros/misiones.
│   ├── persistence.ts Save/load.
│   ├── spawn.ts      Generación de enemigos.
│   └── store.ts      Zustand store (orquesta los reducers).
├── hooks/            Hooks reutilizables (sin lógica de presentación).
├── components/       Componentes React. Un componente por archivo, en PascalCase.
├── styles/           CSS Modules (.module.css) para temas visuales.
├── lib/              Utilidades transversales (logger, http, formatters…).
└── test/             Setup global de tests.
```

## Reglas

### Estado y lógica de juego

- **Toda la lógica del juego vive en `src/engine/`** y debe ser pura: nada de
  `Math.random()` sin inyectar como dep, nada de `window`, nada de React.
- Los componentes nunca mutan el estado directamente; siempre vía actions del
  store.
- Si necesitas un efecto del tipo "cada X ms haz Y", crea un hook en
  `src/hooks/` (ver `useGameLoop.ts`). **No** llames a `setInterval` a nivel de
  módulo.
- Side-effects de React (subscriptions, timers, listeners) van **siempre**
  dentro de `useEffect`.

### Datos / contenido

- Añadir una zona, enemigo, compañero, ítem o misión =
  editar el `.ts` correspondiente en `src/data/`. El sistema se encarga del resto.
- Los `id` son strings en `snake_case` (`comarca`, `troll_caverna`, `q5`).
- Las coordenadas del mapa se miden en porcentaje [0–100] sobre la imagen del mapa.
  La herramienta "coord badge" (visible en el mapa en dev) ayuda a obtenerlas.

### Componentes

- Un componente por archivo, exportación nombrada (no `export default`).
- Si un componente pasa de ~250 líneas, **extrae** un hook (`useXxx`) o
  un sub-componente.
- La lógica de pan/zoom/drag/wheel está en `src/hooks/useMapInteraction.ts`.
  Si tocas el mapa, edita ahí, no en `MapPanel.tsx`.

### Estilos

- **Tailwind** para layout, espaciado, colores básicos.
- **CSS Modules** para animaciones, temas visuales custom (escena de batalla,
  marcadores del mapa, marco de pergamino).
- Variables CSS de tema viven en `src/index.css` bajo `@theme`.
- Nunca añadir clases globales sin discutirlo: rompen el aislamiento.

### Tests

- El motor (`src/engine/`) tiene tests unitarios obligatorios en
  `src/engine/__tests__/`. Si añades una fórmula o un reducer, añade un test.
- Para componentes complejos con lógica de interacción, escribe un test de
  Testing Library en `src/components/__tests__/`.
- `pnpm test:run` debe pasar antes de mergear.

### Logger

- Usar `logger` de `src/lib/logger.ts` en vez de `console.*` directamente.
  Está preparado para enchufar Sentry/Datadog sin tocar call sites.

### Env vars

- Prefijo `VITE_` obligatorio para que se expongan al cliente.
- Declarar el tipo en `src/vite-env.d.ts` (`ImportMetaEnv`).
- Añadir entrada en `.env.example` (sin valor sensible).

### Accesibilidad

- `eslint-plugin-jsx-a11y` está activo. Errores bloquean el lint.
- Cualquier elemento interactivo debe ser `<button>` o `<a>`, no `<div onClick>`.
- Imágenes con `alt`. Iconos decorativos con `aria-hidden="true"`.

### Git

- Pre-commit hook con `lint-staged`: ejecuta ESLint + Prettier en lo staged.
- Commits idealmente en estilo Conventional Commits (`feat:`, `fix:`, `chore:`…).

## Comandos

```bash
pnpm dev          # dev server con HMR
pnpm build        # bundle de producción
pnpm preview      # sirve dist/
pnpm test         # vitest watch
pnpm test:run     # vitest una vez (para CI)
pnpm lint         # ESLint
pnpm typecheck    # tsc --noEmit
pnpm format       # Prettier
```

## Decisiones que NO se cambian sin discutir

- Motor desacoplado de React.
- Zustand como única fuente de estado global del juego.
- TypeScript estricto siempre activado.
- Tailwind + CSS Modules (no styled-components, no emotion, no inline styles
  masivos).
