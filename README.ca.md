# Lord of the Clicks

<p>
  <a href="README.md"><img src="docs/readme/lang-es.svg" alt="Español" width="170"></a>
  <a href="README.en.md"><img src="docs/readme/lang-en.svg" alt="English" width="170"></a>
  <img src="docs/readme/lang-ca-active.svg" alt="Català" width="170">
</p>

> Clicker incremental ambientat a _El Senyor dels Anells_. Va néixer com un
> projecte personal per combinar dues coses que m'agraden: els jocs
> incrementals i construir interfícies amb un bon detall visual. La idea és
> recórrer la Terra Mitjana, desbloquejar zones, reclutar companys, millorar
> l'equip i enfrontar-se a semicaps i caps amb temporitzador.
>
> Tot i que l'origen és lúdic, l'he tractat com una app frontend completa:
> domini separat de React, TypeScript estricte, estat global amb Zustand,
> responsive real, tests de lògica, accessibilitat i desplegament a Cloudflare.

[![CI](https://img.shields.io/badge/CI-passing-brightgreen)](./.github/workflows/ci.yml)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Zustand](https://img.shields.io/badge/Zustand-5-FF6B35)](https://github.com/pmndrs/zustand)
[![Vitest](https://img.shields.io/badge/Vitest-3-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#-llicència)

---

## Per què aquest projecte

Volia fer un joc petit però amb prou profunditat perquè m'obligués a resoldre
problemes reals de producte: economia, progressió, desament, migracions,
responsive, contingut dirigit per dades i una UI que no es trenqués al mòbil.

El resultat no pretén ser una demo aïllada ni una landing de portfolio, sinó un
projecte jugable que vaig iterant a poc a poc. Tot i així, el codi deixa veure
diverses decisions que m'interessen com a desenvolupador frontend:

- **Separar les regles del joc i la UI.** La lògica important viu a
  `src/engine/` com a TypeScript pur; React s'encarrega de representar l'estat
  i llançar accions.
- **Construir amb dades.** Zones, enemics, companys, equip, missions i
  millores viuen a `src/data/`; afegir contingut no requereix tocar la UI.
- **Cuidar el responsive de debò.** A l'escriptori hi ha tres columnes; al
  mòbil el focus es redueix al combat, amb calaixos laterals i controls
  compactes.
- **Fer l'estat persistent i migrable.** El desament fa servir claus
  versionades i migracions per adaptar els canvis de model sense trencar
  partides.
- **Provar el que pot trencar el joc.** Hi ha tests per a fórmules, combat,
  progrés, store, contingut i el game loop.

Per provar-lo en local:

```bash
pnpm install && pnpm dev   # http://localhost:5173
```

## ✨ Característiques

### Jugabilitat

- 🗺️ **Mapa interactiu** de la Terra Mitjana amb pan/zoom (roda del ratolí
  a l'escriptori, arrossegament tàctil al mòbil), centrat animat, mode
  pantalla completa i una insígnia `!` informativa sobre les zones amb
  missions per recollir. Optimitzat escrivint `translate3d` directament
  al DOM durant l'arrossegament, sense passar per React.
- ⚔️ **Combat per clic** amb animacions, partícules d'or, barra de
  vida, sprite d'enemic per zona i números de dany flotants.
- 👹 **Caps i semicaps amb temps limitat** (30 s per defecte,
  configurable). Si el temporitzador arriba a 0, perds i tornes al pool
  normal amb un toast persistent de derrota (es tanca amb la `×`); amb la
  `✕` flotant pots **abandonar manualment** sense penalització.
  Durant un enfrontament es pot canviar de semicap a cap (o a l'inrevés)
  sense abandonar: substitueix la lluita. La comprovació del deadline
  s'executa tant a `useGameLoop` com a l'interval del `BattlePanel`, per no
  dependre d'un únic interval global.
- 🧩 **Tipus d'enemic i equip situacional**: els objectes apliquen
  multiplicadors percentuals contra orcs, Uruk-hai, espectres, trolls,
  bèsties, Mordor, natura, humans o criatures antigues. Alguns
  enemics icònics (l'Ull de Sauron, l'Anell) són intencionadament sense
  tipus. Bonificacions visibles com a **xips de colors** (`BonusVsChips`).
  A més de `bonusVs`, els objectes poden declarar `goldPct` per sumar
  un percentatge extra d'or per baixa mentre estan equipats
  (acumulable amb les millores de la Forja).
- 🪙 **Forja de Rivendell**: arbre de millores permanents que es desbloqueja
  en visitar Rivendell. **14 nodes en 5 cadenes** (dany, riquesa, saviesa,
  temps i companys) amb prerequisits visualitzats amb línies SVG,
  disseny en diamant, compra amb clic/doble clic, reinici amb
  confirmació dins del joc i reemborsament complet de mithril.
- 🧙 **Reclutament de la Comunitat** a les zones de descans, amb
  retrats en color un cop desbloquejats i condicions de cap derrotat per a
  herois icònics (p. ex. el Rei dels Morts).
- 🏪 **Botigues locals** a les zones de descans amb el commutador
  **"Reclutar / Tienda"** (Reclutar / Botiga). A les zones de combat amb
  `hasShop` (p. ex. Fangorn) el commutador passa a ser **"Combate /
  Reclutar"** (Combat / Reclutar) i la segona pestanya mostra el
  reclutament del company únic de la zona (Barbarbre).
- 🛡️ **Equip èpic** (Fibló, Hadhafang, la destral de Gimli, la cota de
  mithril, la Llum de Galadriel, el Palantír…) amb bonificacions
  d'especialització.
- ⏱️ **Armadures com a temps**: el `def` de les armadures no suma DPS,
  sinó que **afegeix segons al temporitzador de semicap/cap** (`+1s` cada
  5 punts).
- 📈 **Límit de nivell dels companys segons el progrés**: evita farmejar
  l'inici del joc per trivialitzar el final.
- 📜 **24 missions descobribles** (`reach` / `kills_at` / `boss`) amb
  insígnia `!`; les missions `reach` es reparteixen a la zona _anterior_ i
  es compten en **visitar físicament** la zona objectiu, no en
  desbloquejar-la per condició (separació explícita entre `visitedLocs` i
  `unlockedLocs` per evitar autocompletats accidentals).
- 💾 **Desament automàtic** a `localStorage`, amb debounce de 500 ms i
  **migració entre versions del desament** (`SAVE_KEY` versionada,
  actualment `v11`; la migració v10→v11 reconstrueix `visitedLocs` a partir
  de `locIdx` per sanejar missions `reach` completades per error). En
  recarregar, els jugadors amb una partida en curs se salten la benvinguda
  i el game loop arrenca a l'instant (també es resincronitza en tornar de
  la bfcache o canviar de pestanya, i així s'evita el "DPS passiu
  congelat"). El botó de reiniciar la partida esborra totes dues claus i
  torna a la pantalla de benvinguda després d'un modal de confirmació dins
  del joc.
- 📤 **Exportar / importar partida** des del menú **Ajustes**
  (Configuració): el desament es serialitza en un `.txt` codificat en
  **Base64** (`SaveBackupFile` amb `app`, `fileVersion`, `saveKey` i
  `state`). En importar, se'n valida l'estructura abans d'escriure a
  `localStorage` i es recarrega la pàgina; el desament automàtic continua
  sent la via principal, això és només una còpia de seguretat opcional.
- ✨ **Halos de colors configurables** per a cada company i enemic.

### UI / responsive

- 🖥️ **Escriptori**: tres columnes (Comunitat + Equip · Batalla + Mapa ·
  Missions + Botiga).
- 📱 **Tauleta i mòbil**: focus en el `BattlePanel`, el mapa passa a ser
  una franja inferior i els panells laterals es converteixen en calaixos
  mútuament excloents.
- 📐 **Compactació selectiva segons el viewport**: `CurrencyBar` redueix
  les icones i canvia "Nivel 50" → "Lvl 50"; "Comprar · 950 oro" → "950 G";
  "+45% ORC" → "+45% O" quan la graella és densa.
- 🎨 **Fons per localització** amb **precàrrega intel·ligent** (zona
  actual + adjacents desbloquejades), `Image.decoding = 'async'` i memòria
  cau d'URL ja demanades perquè viatjar al mòbil no mostri un flaix
  negre. Temàtica visual coherent: tipografia **Ringbearer** per al
  títol principal, Aniron/Cinzel per a la resta, paleta daurada i de
  pergamí, i fons de pàgina en gris neutre.
- ♿ **Accessibilitat**: elements interactius `<button>` semàntics amb
  `aria-label`, tooltips, `focus-visible` coherent i
  `eslint-plugin-jsx-a11y` bloquejant el lint a la CI.
- 🧱 **Error boundary global** que captura els errors sense perdre el
  desament.

## 🛠️ Stack

| Capa              | Eina                                                                      |
| ----------------- | ------------------------------------------------------------------------- |
| Build / dev       | **Vite 6** amb HMR                                                        |
| Llenguatge        | **TypeScript 5.7** (strict, `noUnusedLocals`, `noUnusedParameters`)       |
| UI                | **React 19**                                                              |
| Estat             | **Zustand 5** (store global + selectors)                                  |
| Estils            | **Tailwind 4** + **CSS Modules** per a temes visuals personalitzats       |
| Tests             | **Vitest 3** + **Testing Library** + jsdom                                |
| Linting           | **ESLint 9** (flat) + **typescript-eslint** + **jsx-a11y** + **Prettier** |
| Pre-commit        | **Husky** + **lint-staged**                                               |
| Observabilitat    | Abstracció `logger` preparada per connectar Sentry/Datadog                |
| CI                | **GitHub Actions** (lint + typecheck + test + build)                      |
| Desplegament      | **Cloudflare Pages / Workers** (`wrangler` opcional)                      |
| Gestor de paquets | **pnpm 11**                                                               |

## 🏗️ Arquitectura

```
src/
├── types/game.ts              # Model de domini (Location, Enemy, Quest, Companion, GameState, UpgradeDefinition…)
├── data/                      # Contingut del joc (data-as-code)
│   ├── locations.ts           #   30 zones que segueixen la trilogia de Peter Jackson
│   ├── enemies.ts             #   pool de mobs + semicaps + caps per zona (amb glow opcional)
│   ├── companions.ts          #    20 membres de la Comunitat (cost, retrat, glow, condicions)
│   ├── shop.ts                #   armes, armadures i accessoris per zona
│   ├── quests.ts              #   24 missions de tipus kills_at / boss / reach
│   ├── upgrades.ts            #   arbre de millores de la Forja (5 cadenes, 14 nodes)
│   └── index.ts               #   barrel exports
├── engine/                    # Lògica de joc pura (TS sense React)
│   ├── formulas.ts            #   xp/nivell, DPS, dany per clic, bonificació per tipus, armorFightTimeBonusS, upgradeCost
│   ├── combat.ts              #   dealDamage (reducer pur i testable)
│   ├── progression.ts         #   desbloqueig de zones, condicions, missions reach (visitedLocs), límit de nivell, fightTimeLimitForFight
│   ├── spawn.ts               #   generació d'enemics / semicaps / caps
│   ├── persistence.ts         #   save/load + migracions per SAVE_KEY versionada (v10 → v11)
│   ├── store.ts               #   store de Zustand (dades + actions: startBossFight, buyUpgrade, resetUpgrades…)
│   └── __tests__/             #   tests unitaris del motor (engine + content + store)
├── hooks/                     # Hooks reutilitzables
│   ├── useGameLoop.ts         #   tick de DPS, desament automàtic, deadline de la lluita contra caps, resync en visibility/pageshow
│   ├── __tests__/             #   tests del game loop (deadline + activació)
│   └── useMapInteraction.ts   #   pan / zoom / arrossegament (ratolí + tàctil) del mapa amb translate3d + rAF
├── components/                # Components React (TSX, un component per fitxer)
│   ├── ErrorBoundary.tsx      #   captura els errors i renderitza un fallback
│   ├── BattlePanel.tsx        #   combat; subcomponents interns: FloatingActions, EncounterChip, …
│   ├── ForgeModal.tsx         #   modal de l'arbre de millores (diamants + connexions SVG + modal de confirmació)
│   ├── ConfirmDialog.tsx      #   modal de confirmació reutilitzable (accions destructives, Esc / backdrop)
│   ├── BonusVsChips.tsx       #   xips de colors per tipus (variants full / mini)
│   ├── MapPanel.tsx           #   contenidor amb títol = nom de la zona actual + mode ampliat
│   ├── MapView.tsx            #   viewport del mapa (consumeix useMapInteraction)
│   ├── MapMarker.tsx          #   marcador memoitzat + insígnia "!" informativa
│   ├── MapPaths.tsx           #   rutes SVG entre zones desbloquejades
│   ├── Modal.tsx              #   modal genèric (mapa ampliat)
│   ├── CompanionsPanel.tsx    #   llista d'herois, pujada de nivell, límit segons el progrés
│   ├── EquipmentPanel.tsx     #   ranures d'arma/armadura/accessori amb BonusVsChips
│   ├── QuestsPanel.tsx        #   missions acceptades + reclamació
│   ├── ShopPanel.tsx          #   botiga global filtrada per zones visitades
│   ├── CurrencyBar.tsx        #   or, mithril, XP, baixes + botó de la Forja (amb estat bloquejat/desbloquejat)
│   ├── ForgeButton.tsx        #   botó reutilitzable de la Forja (escriptori a CurrencyBar, mòbil a mobileActions)
│   └── Panel.tsx              #   marc de pergamí reutilitzable amb títol centrat
├── styles/                    # CSS Modules per a temes personalitzats
│   ├── app.module.css         #   layout responsive + calaixos
│   ├── battle.module.css      #   escena de combat, semicaps/caps, reclutament, botiga local, toast de la Forja
│   ├── currency.module.css    #   currency bar full / mini, botó de la Forja amb highlight/locked
│   ├── forge.module.css       #   modal de la Forja: nodes en diamant, línies SVG, modal de confirmació
│   ├── map.module.css         #   mapa, marcadors, ruta, barra d'eines
│   └── panel.module.css       #   marc de pergamí + targetes
├── lib/                       # Utilitats transversals
│   ├── equipmentText.ts       #   etiquetes/icones/colors de tipus, getBonusVsEntries, formatItemStatLine
│   └── logger.ts              #   logger abstret (preparat per a Sentry/Datadog)
├── test/setup.ts              # Configuració global de Vitest
├── App.tsx                    # layout principal, calaixos laterals al mòbil, trucs de desenvolupament
├── main.tsx                   # Punt d'entrada (StrictMode + ErrorBoundary)
└── index.css                  # Tailwind v4 + tema amb variables CSS + @font-face Ringbearer/Aniron
```

### Decisions de disseny (per què cada cosa és on és)

- **Motor pur, store prim, components sense lògica.** `combat.ts`,
  `progression.ts`, `formulas.ts` i `spawn.ts` són funcions pures sense
  dependències de React. El store de Zustand només exposa dades +
  actions. Els components no calculen regles de joc, només les
  consumeixen. Això permet provar el domini sense muntar res i migrar la
  UI sense tocar la lògica.
- **Efectes secundaris en hooks, mai a nivell de mòdul.** El tick de DPS,
  el desament automàtic i el deadline de les lluites contra caps viuen a
  `useGameLoop`, que a més es resincronitza amb `visibilitychange` i
  `pageshow` perquè el DPS passiu no es quedi congelat després de canviar
  de pestanya o tornar de la bfcache. El pan/zoom/arrossegament del mapa
  viu a `useMapInteraction`. Compatible amb HMR i SSR, i testable amb
  tests unitaris.
- **`useMapInteraction` aplica `translate3d` directament al DOM amb `rAF`**
  durant l'arrossegament per mantenir 60 fps amb la imatge pesada del mapa
  i evitar re-renders de React a cada `pointermove`.
- **Tailwind per al layout, CSS Modules per als temes personalitzats.**
  Utilitats ràpides per a graelles i espaiats, i CSS aïllat per a l'escena
  de combat, el mapa, els retrats amb vinyetatge, la currency bar, els
  calaixos, el modal de la Forja, etc. Sense styled-components, sense
  emotion i sense inline styles massius.
- **Dades com a codi i autocompletat.** Afegir contingut és editar un
  `.ts` amb tipus complets. Cada zona declara `semiBoss`, `boss`,
  `semiBossAt`, `bossAt`, `semiBossTimeLimit`, `bossTimeLimit`,
  `unlockGate`, `hasShop`, `background`, etc. Un test d'integritat
  detecta referències trencades entre `locations`, `enemies`, `quests`,
  `shop` i `companions`.
- **Equip situacional amb una UI coherent.** `calcEnemyTypeMultiplier`,
  `calcClickDamageAgainstEnemy` i `calcDpsAgainstEnemy` apliquen els
  multiplicadors per tipus. `BonusVsChips` + `getBonusVsEntries`
  renderitzen les bonificacions com a xips de colors a la botiga i a
  l'equipament.
- **Límit de nivell dels companys.** `companionLevelCapForLocation(locIdx)`
  defineix trams creixents. El store rebutja `levelUpCompanion` per
  sobre del límit; el panell mostra "MAX" amb un tooltip. Tests dedicats.
- **Lluita contra caps: fail vs abandon.** `failBossFight` es dispara des
  de `useGameLoop` (i, com a xarxa de seguretat, des del mateix
  `BattlePanel`) quan expira el deadline, i mostra un toast persistent
  "¡Has perdido!" ("Has perdut!") que el jugador tanca manualment amb la
  `×`. `abandonBossFight` és l'acció explícita (silenciosa) de l'usuari.
  `startBossFight` amb un tier diferent **substitueix** l'enfrontament.
- **Missions dirigides per dades.** Les missions `reach` declaren
  `pickupLoc` ≠ `loc`, perquè la zona anterior "doni" la missió sense
  bloquejar l'avanç.
- **Estat serialitzable + migracions.** `GameState` és un POJO.
  `persistence.ts` fa servir una `SAVE_KEY` versionada i aplica migracions
  en carregar desaments antics (p. ex. introduir `forgeUnlocked`/`forgeSeen`
  sense trencar partides existents). També saneja partides en estats
  estranys (semicap/cap en pantalla sense `bossFight`, nivells de
  companys corruptes) fent aparèixer de nou un mob del pool i normalitzant
  el `level`. La migració **v10 → v11** il·lustra l'estratègia: es detecta
  el desament antic, es reconstrueix `visitedLocs` a partir de `locIdx` (el
  mapa és lineal, així que totes les zones anteriors a l'actual s'han
  visitat) i es reinicia el `questProgress` de les missions `reach` encara
  no reclamades, conservant les completades per no trencar partides.
- **`visitedLocs` vs `unlockedLocs`.** Distinció explícita en el domini:
  una zona pot estar **desbloquejada** (accessible al mapa, p. ex. en
  reclutar Frodo + Sam) sense estar **visitada** (haver-hi viatjat). Les
  missions `reach` consulten `visitedLocs`; els components
  (`QuestsPanel`, `combat.ts`, `applyPostMutations`) fan servir la mateixa
  font. Un test a `store.test.ts` blinda el cas per evitar
  autocompletats en desbloquejar condicions.
- **Forja desbloquejable amb onboarding.** El botó comença bloquejat
  (gris + `disabled` + `aria-disabled`). En visitar Rivendell per
  primera vegada es desbloqueja, es dispara un toast persistent
  ("¡Forja desbloqueada!", "Forja desbloquejada!") i el botó batega amb una
  lluïssor daurada. El realçat s'apaga en obrir la Forja per primera
  vegada. Estat al store + UI guiada per flags (`forgeUnlocked`,
  `forgeSeen`, `forgeUnlockFlash`).
- **Confirmacions dins del joc, no `window.confirm`.** Les accions
  destructives (reiniciar l'arbre de la Forja, reiniciar la partida) obren
  un modal estilitzat (`ConfirmDialog` reutilitzable + el confirm intern
  de la Forja) amb `Esc`, tancament en clicar el fons i `autoFocus` al
  botó de confirmar. Res de diàlegs natius del navegador.
- **Accessibilitat per defecte.** `eslint-plugin-jsx-a11y` fa fallar el
  lint si s'introdueix un element interactiu sense semàntica. Sempre
  `<button>`, mai `<div onClick>`. Icones decoratives amb `aria-hidden`.
  Imatges amb `alt`.
- **Responsive amb HTML semàntic estable.** `app.module.css` defineix la
  graella d'escriptori i passa a una sola columna amb calaixos a
  `max-width: 1180px`. Els panells compacten els textos substituint spans
  `data-form="full"` per `data-form="mini"` mitjançant media queries,
  mantenint el mateix HTML en totes dues mides (millor per als tests i
  l'a11y).

## Lectura tècnica del projecte

### Arquitectura frontend

- Components amb una responsabilitat acotada i comunicació a través del
  store.
- Zustand amb **selectors granulars** per evitar re-renders innecessaris.
- Domini desacoblat de React: executable fora del navegador i testable
  sense muntar components.
- Efectes secundaris aïllats en hooks (`useGameLoop`, `useMapInteraction`),
  no en mòduls globals.

### TypeScript

- `strict` activat, amb `noUnusedLocals` i `noUnusedParameters`.
- Tipus de domini explícits (`EnemyType`, `BossFightState`, `Quest`,
  `Location`, `ShopItem`, `Companion`, `UpgradeDefinition`).
- `Partial<Record<…>>` quan correspon, amb guards explícits en
  iterar per satisfer el compilador sense `as` ni `!`.
- Tests d'integritat per detectar referències trencades entre els fitxers
  de dades.

### UI/UX

- Layout d'escriptori de 3 columnes que passa a 1 columna amb calaixos
  mútuament excloents al mòbil i la tauleta.
- CSS Modules per a peces visuals personalitzades (combat, mapa,
  reclutament, calaixos, currency bar, modal de la Forja) i Tailwind per al
  layout.
- Mapa interactiu amb arrossegament (ratolí + tàctil), zoom i modal a
  pantalla completa.
- Feedback visual: dany flotant, crítics, partícules, temporitzador de
  cap, barres de vida, halos de colors, hover només sobre la imatge i
  toasts persistents per a les fites de progrés.

### Qualitat

- ESLint 9 flat config, Prettier, `eslint-plugin-jsx-a11y`, Husky i
  lint-staged.
- La CI executa **lint + typecheck + test + build** a cada push/PR a
  `main`.
- `ErrorBoundary` global per evitar pantalles en blanc.
- Desament a `localStorage` amb migracions i desament automàtic amb
  debounce.
- **43 tests de Vitest** en 6 fitxers que cobreixen combat, fórmules,
  progressió, store, game loop i contingut.

### Coses que encara vull millorar

No el considero "acabat". Algunes parts funcionen bé però tenen marge de
millora:

- `BattlePanel.tsx` concentra massa codi (combat, reclutament,
  botiga local i xips d'enfrontament). Vull extreure'n subcomponents per
  reduir-ne la mida i facilitar els tests.
- Falten tests d'interacció visual amb Testing Library per al mapa, els
  calaixos, els modals i el flux de reclutament.
- L'equilibri econòmic s'ajusta a mà; seria útil un simulador de TTK i
  de recompenses per zona.
- Hi ha sprites temporals i placeholders; vull substituir-los per un art
  més coherent.
- La persistència a `localStorage` és suficient per a l'abast actual, però
  IndexedDB hi encaixaria millor si el desament creixés o afegís més
  metadades.
- El projecte és en castellà; una i18n ES/EN faria més mantenible el codi
  dels textos.

## 🚀 Desenvolupament

Requereix **Node 20+** i **pnpm 11+**.

```bash
pnpm install
pnpm dev          # http://localhost:5173 amb HMR
pnpm build        # bundle de producció a dist/
pnpm preview      # serveix dist/
pnpm test         # vitest en mode watch
pnpm test:run     # vitest una vegada (el que executa la CI)
pnpm lint         # ESLint + jsx-a11y
pnpm lint:fix     # ESLint amb autofix
pnpm typecheck    # tsc --noEmit
pnpm format       # Prettier
```

### Variables d'entorn

Copia `.env.example` a `.env.local`. Totes les variables han de portar el
prefix `VITE_` per exposar-se al client; els seus tipus viuen a
`src/vite-env.d.ts`.

### Qualitat del codi

- **Pre-commit** (Husky + lint-staged): cada commit passa ESLint i
  Prettier automàticament sobre els fitxers staged.
- **CI**: GitHub Actions executa `lint`, `typecheck`, `test:run` i `build`
  a cada push/PR a `main`.
- **Regles actives**: TS strict, `react-hooks/recommended`,
  `react-refresh`, `jsx-a11y/recommended`, i Prettier com a àrbitre final.

### Menú Ajustes i trucs de desenvolupament

A la capçalera hi ha el botó **Ajustes** (Configuració) (icona d'engranatge
SVG; al mòbil només la icona). Desplega un menú amb dos blocs:

**Sempre disponibles**

- **📥 Descargar partida** (Descarregar la partida) — exporta el desament
  actual com a `.txt` en Base64.
- **📤 Importar partida** (Importar una partida) — obre un selector de
  fitxers i substitueix el desament després de validar-ne el format.

**Només en desenvolupament** (no es renderitzen en producció):

- **⚙ Desbloquear todas las zonas** (Desbloquejar totes les zones) —
  desbloqueja totes les ubicacions del mapa i la Forja, i a més deixa el
  semicap i el cap accessibles a cada zona (se salta la condició de
  baixes i marca d'entrada els semicaps com a derrotats, sense tocar
  `bossDefeated`).
- **⛀ +1.000.000 oro y mithril** (+1.000.000 d'or i mithril) — afegeix 1M
  d'or i 1M de mithril al moneder.
- **⏭ Completar zona actual** (Completar la zona actual) — completa la zona
  actual (baixes al màxim, cap + semicap derrotats, zona següent
  desbloquejada).
- **★ Completar juego entero** (Completar el joc sencer) — simula una
  partida completada al 100 %, deixant els herois a nivell 1 i sense equip
  equipat per poder provar sense un DPS passiu exagerat.
- **↺ Reiniciar partida** (Reiniciar la partida) — esborra el desament i
  torna a la pantalla de benvinguda després d'un modal de confirmació dins
  del joc (`ConfirmDialog`).

## 📋 Afegir contingut

Cada tipus de contingut viu a `src/data/`. L'`enemyType` s'assigna al
mapa `ENEMY_TYPES` del mateix `enemies.ts`:

```ts
// src/data/enemies.ts
// 1) Declara el tipus (omet-lo per a enemics sense debilitat, com l'Ull de Sauron)
const ENEMY_TYPES: Record<string, EnemyType> = {
  guard_orc: 'orco',
  // …
};

// 2) Afegeix la def (id en anglès snake_case, name visible en castellà)
guard_orc: {
  id: 'guard_orc',
  name: 'Orco Guardia',
  hp: 220,
  gold: 42,
  xp: 28,
},
```

Un objecte amb bonificació situacional (es renderitza com a xips de colors
amb `BonusVsChips`):

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

Un accessori sense dany directe però amb `goldPct` (efecte passiu
d'economia, acumulable amb les millores de la Forja):

```ts
// src/data/shop.ts
{
  id: 'pipa_fumar',
  name: 'Pipa de Fumar',
  bonus: 0,
  cost: 60,
  loc: 'comarca',
  desc: 'Hierba de la Comarca, calma y concentración',
  goldPct: 0.05,         // +5% d'or per baixa mentre estigui equipat
},
```

Una zona de combat amb semicap i cap:

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
  semiBossAt: 40,            // opcional, per defecte floor(killsNeeded/2)
  bossAt: 80,                // opcional, per defecte killsNeeded
  semiBossTimeLimit: 30,     // opcional, per defecte 30 s
  bossTimeLimit: 30,         // opcional, per defecte 30 s
  pos: [54.0, 32.5],
  background: '/backgrounds/eregion.jpg',
},
```

Un company condicionat a un cap:

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
  portraitGlow: 24,            // halo turquesa intens
  portraitGlowColor: '102, 217, 217',
},
```

Un node de l'arbre de la Forja:

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
  requires: { golpe_elfico: 2 },   // condició per prerequisit
  position: { x: 24, y: 68 },      // % sobre l'arbre de fons
  branch: 'wealth',
},
```

> **Límit de nivell:** si insereixes una zona al mig de la llista, els
> índexs es desplacen i has d'ajustar `COMPANION_LEVEL_CAPS` a
> `src/engine/progression.ts` (i els seus tests) perquè cada tram continuï
> coincidint amb la zona correcta.

Una missió `reach` recollida a la zona anterior:

```ts
// src/data/quests.ts
{
  id: 'q13',
  name: 'Pasar por Eregion',
  desc: 'Alcanza Eregion',
  type: 'reach',
  loc: 'eregion',            // destinació objectiu
  pickupLoc: 'rivendel',     // on apareix el "!"
  need: 1,
  reward: { gold: 500, mithril: 25 },
},
```

Per a les convencions (estructura, noms, on posar els hooks, regles
d'accessibilitat…), consulta [`AGENTS.md`](./AGENTS.md). Per a idees i
backlog, consulta [`IDEAS.md`](./IDEAS.md).

## 🧪 Tests

43 tests de Vitest repartits entre el motor i els hooks:

- **`engine/__tests__/formulas.test.ts`** — dany, XP, pujada de nivell,
  cost de pujar de nivell els companys, bonificació per tipus, bonificació
  d'armadura al temporitzador (`armorFightTimeBonusS`), cost de les
  millores de la Forja i `applyRewardMultiplier` amb el `goldPct` dels
  objectes equipats (p. ex. la Pipa de Fumar, una pipa de fumar).
- **`engine/__tests__/combat.test.ts`** — reducer de combat (dany a
  l'enemic, recompenses, transició, drop de mithril per tier).
- **`engine/__tests__/progression.test.ts`** — desbloqueig de zones,
  compleció de missions `reach` (via `visitedLocs`), condicions per
  companys, límit de nivell per zona, `fightTimeLimitForFight`.
- **`engine/__tests__/store.test.ts`** — accions del store de Zustand
  sobre un estat real: compra de millores, condicions per `requires`/
  `maxRank`, i el cas de regressió "reclutar Frodo + Sam no completa la
  missió del Bosc Vell fins que no hi has viatjat". També cobreix els
  trucs: `completeAll` (totes les zones desbloquejades i visitades, herois
  a nivell 1 i sense equip equipat) i `unlockAll` (cada zona amb semicap/
  cap queda jugable immediatament sense marcar automàticament el cap com a
  derrotat).
- **`engine/__tests__/content.test.ts`** — integritat: referències
  vàlides entre `locations`, `enemies`, `quests`, `shop`, `companions`
  i `upgrades`; cada `enemyType` és dins del conjunt permès.
- **`hooks/__tests__/useGameLoop.test.ts`** — el loop acaba la lluita
  quan expira el deadline i no avança quan està inactiu (pantalla de
  benvinguda).

```bash
pnpm test:run
```

## ☁️ Desplegament (Cloudflare)

| Camp                       | Valor                            |
| -------------------------- | -------------------------------- |
| **Build command**          | `pnpm run build`                 |
| **Build output directory** | `dist`                           |
| **Node.js version**        | `22` (`.node-version` a l'arrel) |

El projecte fa servir **pnpm 11** (`packageManager` a `package.json`). Si
Cloudflare no el detecta sol, afegeix **`PNPM_VERSION`** = `11.1.2`.

### Opció A — Cloudflare Pages (recomanada per a aquesta SPA)

Deixa el **deploy command buit**. Pages publica `dist/` després del build;
no cal Wrangler.

### Opció B — Workers + assets estàtics

Si desplegues amb Wrangler, **no** facis servir `npx wrangler deploy`
(descarrega wrangler sobre la marxa i torna a instal·lar les dependències
amb scripts bloquejats). Fes servir:

| Camp               | Valor             |
| ------------------ | ----------------- |
| **Deploy command** | `pnpm run deploy` |

`wrangler.jsonc` ja és al repositori (SPA a `dist/`). `wrangler` és a
`devDependencies` i `pnpm-workspace.yaml` aprova `esbuild`, `sharp` i
`workerd`.

> **Errors habituals de pnpm a la CI:** `packages field missing` → falta
> `packages: ['.']` a `pnpm-workspace.yaml`. `ERR_PNPM_IGNORED_BUILDS`
> → afegeix el paquet a `allowBuilds` (p. ex. `esbuild`, `sharp`,
> `workerd`).

Rutes de la SPA:

- **Workers (`pnpm run deploy`)**: fes servir
  `not_found_handling: "single-page-application"` a `wrangler.jsonc`.
  **No** afegeixis `public/_redirects`: Cloudflare detecta un bucle
  infinit si hi són tots dos (`Invalid _redirects configuration`, codi
  `100324`).
- **Pages (sense Wrangler)**: crea `public/_redirects` amb una sola línia
  `/*    /index.html   200` per al fallback de la SPA. No facis servir
  aquest fitxer si desplegues amb Workers.

## 🗺️ Full de ruta

- [x] Layout responsive per a tauleta/mòbil (calaixos, compactació de la UI,
      arrossegament tàctil al mapa).
- [x] Sistema de halos de colors configurables per company/enemic.
- [x] Armadures com a bonificació de temps en semicaps/caps.
- [x] Desplegament a Cloudflare Pages.
- [x] **Forja de Rivendell**: arbre de millores permanents amb mithril,
      desbloquejable visitant Rivendell, amb reinici i reemborsament.
- [ ] Bestiari / còdex (consulta `IDEAS.md`).
- [ ] Sprites pixel art per als enemics i companys que falten.
- [ ] Sons en colpejar / crítics / caps (Howler.js).
- [ ] Extreure els subcomponents de `BattlePanel` a fitxers propis
      (`RecruitPanel`, `RestShopPanel`, `EncounterActions`).
- [ ] Simulador d'equilibri/TTK per zona per ajustar l'economia i els
      temps dels caps.
- [ ] Internacionalització (es / en) amb `i18next`.
- [ ] Mode PWA instal·lable + offline.
- [ ] Migració a IndexedDB amb versionat dels desaments.
- [ ] Storybook per als panells.
- [ ] Preview per PR a Cloudflare.

## 📝 Llicència

MIT — projecte personal amb finalitats d'aprenentatge, sense cap afiliació
amb Middle-earth Enterprises ni Warner Bros.
