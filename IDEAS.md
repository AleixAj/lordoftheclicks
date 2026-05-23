# Ideas / Backlog

Documento vivo con ideas para el juego. Apunta aquí cualquier propuesta nueva
antes de implementarla, aunque luego se descarte. Una vez implementada, mueve
la entrada a la sección "Hecho" o bórrala si ya está en la build.

## Prioridad recomendada

La mejor primera línea de trabajo parece ser reforzar la progresión a largo
plazo y dar más uso al mithril. El `ShopPanel` actual duplica la tienda interna
de cada ciudad, así que el slot derecho del layout desktop puede convertirse en
un panel permanente con valor propio.

### Panel derecho: Forja + Códice

Panel "Forja de Khazad" a la derecha con dos o tres pestañas:

- **Mejoras**: nodos comprables con mithril, persistentes y globales.
- **Bestiario**: colección de enemigos revelados al derrotarlos.
- **Hazañas**: logros con pequeñas recompensas reclamables.

Por qué encaja: el mithril deja de ser figurante, el bestiario aprovecha
contenido ya existente sin añadir gameplay complejo y las hazañas dan objetivos
intermedios entre zonas.

### Primer MVP sugerido

1. Añadir `upgrades: Record<UpgradeId, number>` al estado.
2. Crear `UPGRADES` en `src/data/` con coste, rango máximo y descripción.
3. Aplicar bonos en fórmulas ya existentes.
4. Sustituir el panel derecho por un componente con pestañas simples.
5. Añadir después `enemiesSeen` y una pestaña de bestiario.

## Progresión y metajuego

### Forja de Khazad: mejoras permanentes con mithril

Árbol de nodos comprables con mithril que dan bonos persistentes globales:

- `+5%` oro por kill (5 rangos).
- `+10%` daño click (5 rangos).
- `+5s` al timer de semi/jefe (3 rangos).
- `+1` nivel cap de compañeros (3 rangos).
- `+5%` chance crítico (3 rangos).
- `+5%` XP ganada (5 rangos).
- `+5%` reducción de coste de compañeros (3 rangos).
- `+1%` probabilidad de drop extra de mithril (3 rangos).

Reusa: `mithril`, `calcClickDamage`, `fightTimeLimitForFight`,
`companionLevelCapForLocation`.

Añade: `upgrades: Record<UpgradeId, number>` con el rango actual y aplicar
los multiplicadores donde corresponda. Soft cap por rango.

### Modo prestigio: Nuevo viaje

Al terminar la campaña, opción de reiniciar y conservar puntos de "experiencia
ancestral" canjeables en el árbol de la Forja. Da una segunda capa de
progresión y replay value.

Variantes:

- **Nuevo viaje normal**: reinicia oro, zona y equipo; conserva logros,
  bestiario y bonus ancestrales.
- **Nuevo viaje heroico**: enemigos más duros, mejores recompensas.
- **Nuevo viaje de sombra**: añade jefes sombra y reglas especiales.

### Misiones y contratos

Más objetivos paralelos para evitar que todo sea "matar hasta desbloquear":

- **Contratos de taberna**: derrota X enemigos de un tipo en una zona.
- **Caza de élite**: aparece un enemigo único con timer y recompensa extra.
- **Entrega urgente**: viaja a una zona concreta y gana X combates allí.
- **Defensa de ciudad**: oleadas cortas con recompensa de mithril.
- **Juramentos de compañero**: pequeñas cadenas para desbloquear skins o bonus.

### Logros / Hazañas

Lista de hitos con icono y recompensa (oro o mithril). Ejemplos:

- "Vence 100 orcos".
- "Recluta a todos los elfos".
- "Termina la aventura sin perder ningún jefe".
- "Compra todas las espadas élficas".
- "Llega al nivel 50".
- "Derrota un jefe con menos de 3 segundos restantes".
- "Gana 1 millón de oro total".
- "Completa una zona usando solo daño de compañeros".

Datos: `totalKills`, `bossDefeated`, `companions`, `level`, `owned`.

Añade un array `ACHIEVEMENTS` con `id`, `condition(state)`, `reward` y un
estado `achievementsClaimed`. Reclamar paga la recompensa.

### Reputación por región

Cada región puede tener una reputación propia que sube al matar enemigos,
completar misiones o derrotar jefes. Desbloquea descuentos, compañeros locales,
diálogos y mejoras temáticas.

Ejemplos:

- **La Comarca**: más oro offline y buffs de comida.
- **Rivendel**: mejoras de crítico y conocimiento de enemigos.
- **Rohan**: bonus de DPS de compañeros.
- **Gondor**: más resistencia contra jefes y mejores recompensas de defensa.

## Combate y mecánicas activas

### Críticos

Añadir `critChance` y `critMultiplier` al estado / fórmulas. Click y DPS
pueden devolver crítico (ahora mismo solo `clickEnemy` muestra un número
flotante; falta una "rama" crítica con color/icono distinto). Items y mejoras
(Forja) pueden subir las dos stats.

### Combos por click rápido

Encadenar clicks dentro de una ventana corta (< 600ms) acumula un multiplicador
temporal que decae al soltar (`+1%` por click, máximo `+50%`, decae `-2%` por
segundo sin click). Incentiva click activo.

### Habilidades activas con cooldown

Habilidades grandes con cooldown largo (30–120s):

- **"¡Por Frodo!"** (Sam): `+200%` click 6s.
- **Luz de Galadriel**: aturde 5s, daño x3 a espectros.
- **Aliento de Théoden**: doble DPS 10s.
- **Disparo de Legolas**: golpe instantáneo al enemigo actual.
- **Furia de Gimli**: cada click golpea dos veces durante 8s.
- **Estandarte de Gondor**: reduce el daño recibido por presión del timer.

Disponibles cuando recluta al compañero correspondiente. Botón flotante en la
zona de click.

### Estados de combate

Añadir efectos temporales que alteren las decisiones:

- **Sangrado**: daño por segundo durante unos segundos.
- **Aturdido**: el timer de jefe se pausa brevemente.
- **Marcado**: el enemigo recibe más daño crítico.
- **Inspirado**: aumenta DPS de compañeros.
- **Miedo**: reduce daño click hasta derrotar al enemigo.

### Enemigos con mecánicas propias

Algunos enemigos pueden romper la rutina de click:

- **Escudo pesado**: recibe menos daño hasta romper una barra secundaria.
- **Invocador**: cura o refuerza al enemigo si no se derrota rápido.
- **Acechador**: aparece y desaparece, premiando clicks precisos.
- **Berserker**: menos HP, pero timer más corto.
- **Portador de botín**: huye si no lo matas en pocos segundos.

### Rachas de victoria

Encadenar kills sin perder contra jefes aumenta un bonus pequeño de oro o XP.
Perder contra un jefe reinicia la racha. Puede mostrarse como "Esperanza de la
Compañía".

### Auto-click limitado

Modo auto-click con cap de 5 cps durante 30s mediante habilidad, item o mejora
temporal. Debe ser limitado para no borrar el valor del click activo.

## Compañeros, equipo y reliquias

### Anillos de Poder / Reliquias

Botín único al derrotar un jefe. Equipable en un nuevo slot "Reliquia" con un
efecto especial por anillo:

- **Anillo de Galadriel** (Lothlórien): `+2%` crítico por cada elfo reclutado.
- **Anillo de Nenya**: revive una vez si pierdes contra un jefe.
- **Palantir** (Isengard): muestra el tipo del enemigo antes de aparecer.
- **Cuerno de Boromir**: el primer click de cada combate hace `×5`.
- **Frasco de Galadriel**: bonus fuerte contra espectros y enemigos oscuros.
- **Capa élfica**: aumenta oro en zonas desbloqueadas hace poco.
- **Pipa de la Comarca**: mejora recompensas offline.

Reusa: `bossDefeated` (gate de drop), `equipped`.

Añade: cuarto slot a `EquippedItems`, lógica por id en `formulas.ts` y mapeo
"boss → reliquia" en `locations.ts` o tabla propia.

### Afinidades de compañeros

Bonos si ciertos compañeros están reclutados o subidos de nivel:

- **Frodo + Sam**: más daño contra jefes.
- **Legolas + Gimli**: racha que alterna crítico y DPS.
- **Aragorn + Boromir**: bonus de Gondor y reducción de timer perdido.
- **Merry + Pippin**: más oro en zonas iniciales.

### Especializaciones de compañeros

Al llegar a cierto nivel, elegir una rama:

- **DPS puro**: más daño pasivo.
- **Apoyo**: buffs globales o reducción de costes.
- **Exploración**: mejora recompensas, drops o reputación.

La elección puede ser irreversible o reseteable con mithril.

### Equipo por sets

Además de piezas sueltas, crear sets con bonus por 2/3 piezas:

- **Set de Rivendel**: crítico y daño contra espectros.
- **Set de Rohan**: DPS de compañeros y oro por oleadas.
- **Set de Gondor**: mejor rendimiento en jefes.
- **Set de Mordor**: alto riesgo, más daño pero timers más duros.

### Mejoras de equipo

Permitir reforjar equipo con mithril o materiales:

- Subir rareza.
- Añadir una línea de bonus aleatoria.
- Cambiar bonus contra un tipo de enemigo.
- Convertir equipo obsoleto en fragmentos.

## Mundo, mapa y exploración

### Bestiario / Códice

Panel con todos los enemigos (normales, semi-jefes, jefes). Cada entrada
muestra retrato, tipo, debilidades y kills acumulados. Empiezan en silueta y se
revelan al primer kill.

- Reusa: `ENEMIES`, `ENEMY_TYPES`, sprites, `locKills`.
- Añade: `enemiesSeen: Record<EnemyId, number>` al estado e incrementar en
  `dealDamage` al morir.
- Beneficio: lore, progresión visual, enseña al jugador qué arma equipar contra
  cada tipo.

### Diario del Aventurero / Estadísticas + Lore

Panel informativo sin mecánica nueva:

- Oro total ganado.
- Daño total infligido.
- Crítico más alto.
- Tiempo jugado.
- Streak sin perder jefes.
- Zonas visitadas / jefes derrotados.
- Párrafo de lore desbloqueable por zona.
- Reliquias encontradas.
- Mejor tiempo por jefe.

Reusa contadores existentes. Añadir `totalGoldEarned`, `totalDamage`,
`biggestCrit`, `playtimeMs`, etc. al estado.

### Eventos aleatorios

Disparadores con baja probabilidad cada X kills/segundos:

- **Mensajero**: pop-up con una misión exprés temporal y recompensa jugosa.
- **Asalto**: durante 30s aparecen mobs élite con doble oro.
- **Festival en La Comarca**: `×2` oro 60s.
- **Caravana en peligro**: derrota oleadas para ganar equipo.
- **Niebla extraña**: enemigos ocultos, pero mayor drop de mithril.
- **Consejo de Elrond**: elige entre tres buffs temporales.

### Rutas alternativas

Permitir ramas opcionales en el mapa:

- Ruta norte por Bosque Negro y Erebor.
- Ruta de Rohan con oleadas de defensa.
- Ruta de Gondor con jefes más técnicos.
- Ruta oscura opcional hacia Dol Guldur antes de Mordor.

Las rutas pueden dar recompensas distintas sin bloquear la campaña principal.

### Puntos de interés del mapa

Además de ciudades/zonas de combate:

- Santuarios con buff de una hora.
- Ruinas con un cofre único.
- Campamentos para curar/reducir penalizaciones.
- Mercaderes raros con stock especial.
- Nodos de historia que desbloquean cartas de lore.

## Contenido nuevo

### Zonas adicionales

- **Cima de los Vientos** (Amon Sûl): entre Bree y Rivendel; jefe: Espectro
  del Anillo.
- **Erebor**: post-Lothlórien o ruta paralela; jefe: Smaug.
- **Bosque Negro**: ruta alternativa norte.
- **Dol Guldur**: fortaleza oscura; jefe: Nigromante.
- **Aglarond** (Cuevas de los Brillantes): recompensa de Gimli.
- **Edoras**: centro de Rohan; jefe: Traidor de la Marca.
- **Abismo de Helm**: zona defensiva de oleadas; jefe: General Uruk-hai.
- **Fangorn**: zona lenta con ents y eventos extraños.
- **Puertos Grises**: epílogo / zona de cierre.
- **Cirith Ungol**: tramo final con veneno y enemigos arácnidos.

### Compañeros pendientes

- **Boromir** (Bree o Rivendel).
- **Glorfindel** (Rivendel).
- **Radagast** (Bosque Negro).
- **Imrahil** (Minas Tirith).
- **Beregond** (Minas Tirith).
- **Tom Bombadil** (evento secreto, NPC raro).
- **Éomer** (Rohan).
- **Éowyn** (Rohan o Minas Tirith).
- **Faramir** (Ithilien).
- **Barbol** (Fangorn).
- **Bardo** (Erebor / Lago).
- **Dáin** (Erebor).

### Variantes de enemigos

Mismo tipo, sprite distinto, stats escaladas:

- **Capitán orco**: orco con `×3` HP y `+50%` oro.
- **Uruk arquero**: dispara antes de que llegues, exige clicks rápidos.
- **Espectro real**: variante de espectro con drop de mithril.
- **Troll acorazado**: reduce daño hasta romper armadura.
- **Huargo alfa**: aumenta velocidad de aparición de enemigos.
- **Araña venenosa**: aplica un debuff temporal.
- **Corsario veterano**: más oro, más evasivo.
- **Nazgûl errante**: mini-jefe raro fuera de su zona.

### Jefes secretos / superjefes post-campaña

Tras terminar la aventura desbloqueas variantes "Sombra" de cada jefe (HP `×5`,
drops únicos: una reliquia exclusiva, mithril, fragmentos de Anillo).

Ideas:

- **Sombra del Balrog**: prueba de DPS sostenido.
- **Eco de Smaug**: mucho oro, alto riesgo.
- **Rey Brujo Desatado**: exige reliquia o compañero concreto.
- **Sauron, el Ojo Incansable**: superjefe final por fases.

### Coleccionables

Pequeñas metas que alimentan el códice:

- Fragmentos de mapas antiguos.
- Páginas del Libro Rojo.
- Runas de Khazad-dûm.
- Estandartes de cada región.
- Recuerdos de compañero.

## Economía, tienda e idle

### Tabernero itinerante / Pociones

Vendedor con stock rotativo cada X minutos. Pociones de un solo uso:

- **Lembas**: `+50%` click 60s.
- **Miruvor**: `-10s` al próximo timer de jefe.
- **Hierba de la Comarca**: `+25%` oro 90s.
- **Aceite élfico**: `+10%` crítico 45s.
- **Polvo de mithril**: duplica el próximo drop de mithril.

Y algún ítem raro caro de oferta puntual. Crea urgencia y motivos para volver
al juego después de un rato.

Reusa: `gold` y sistema de bonus.

Añade: contador de consumibles, temporizador de buffs activos y rotación de
stock con timestamp.

### Progreso offline

- Progreso offline limitado: al volver tras X minutos cerrados, otorgar oro/xp
  del DPS acumulado con un cap (ej. máx 2h, factor 0.5).
- Mostrar resumen al volver: "Tus compañeros derrotaron a 87 orcos mientras
  dormías".
- Mejoras de Forja que suben el cap offline.
- Eventos raros offline: "un mercader pasó por el campamento".

### Sumideros de oro

Cuando el oro sobre, añadir gastos opcionales:

- Donaciones a ciudades para reputación.
- Entrenamiento avanzado de compañeros.
- Reroll de tienda.
- Compra de pistas del bestiario.
- Decoración del campamento sin impacto fuerte en balance.

### Materiales secundarios

Además de oro y mithril:

- **Fragmentos de reliquia** para mejorar anillos.
- **Provisiones** para contratos y viajes.
- **Estandartes** como moneda de reputación regional.

Mantenerlos opcionales para no complicar demasiado el core.

## Interfaz y calidad de vida

- Tooltip en compañero con su contribución real al DPS, incluyendo bonus de
  equipo, mejoras y crítico esperado.
- Filtros en `CompanionsPanel`: por zona, por DPS, por estado.
- Botón "Subir al máximo" en cada compañero mientras haya oro disponible y no
  esté en `MAX`.
- Notificaciones toast: nueva zona desbloqueada, compañero reclutable, item
  disponible, jefe a tu alcance.
- Atajos teclado: `Space` clickea al enemigo, `1`/`2` lanza semi/boss, `M` abre
  mapa, `C`/`Q` abre drawers en mobile.
- Comparador rápido al hover de item en tienda: chip "+X dmg vs actual".
- Confirmación opcional antes de viajar a otra zona si estás en combate contra
  jefe.
- Buscador en tienda y compañeros.
- Ordenar equipo por DPS estimado, rareza, coste o bonus contra tipo.
- Indicador visual de "puedes vencer al jefe" basado en DPS estimado.
- Modo compacto para pantallas pequeñas.
- Panel de objetivos próximos: "sube X", "compra Y", "derrota Z".
- Historial corto de recompensas recientes.
- Opción para ocultar números flotantes si saturan la pantalla.
- Toggle para animaciones reducidas.

## Audio, feedback y presentación

- SFX por evento: click, kill, level up, jefe inicia, victoria, derrota.
- Música ambient por zona: Comarca calmada, Mordor tensa.
- Slider de volumen master + SFX/Música en ajustes.
- Vibración táctil ligera en mobile en click crítico.
- Efecto visual distinto para crítico, kill, drop raro y boss defeat.
- Transición de fondo al viajar entre zonas.
- Pequeñas líneas de voz/texto al reclutar compañero.
- Pantalla inicial con cinemática de intro ("Atrás quedó la Edad de Oro...")
  saltable.
- Texto narrado pre/post jefe (1 párrafo de lore).
- Cartas de relato al desbloquear cada zona, leíbles desde el Diario.

## Guardado, ajustes y portabilidad

- Export/import del save como JSON desde un menú "Ajustes".
- Slots de partida múltiples (3 saves).
- Cloud save opcional vía proveedor sencillo (Firebase / Supabase), más
  adelante.
- Aviso si el save importado viene de una versión antigua.
- Botón de reset con confirmación escrita.
- Ajustes de accesibilidad: reducir movimiento, alto contraste, tamaño de
  texto.
- Guardado automático con indicador discreto.

## Balance y progresión

- Auditoría de curva: tiempo medio por zona debería ir creciendo suavemente, no
  a saltos.
- Subir el drop de mithril, al menos hasta que haya un sumidero claro como la
  Forja.
- Re-evaluar la recompensa de misiones `reach`; ahora se completan al viajar y
  casi no se notan.
- Medir TTK estimado por zona con equipo medio.
- Evitar que un solo compañero domine todo el DPS.
- Hacer que los jefes sean picos memorables, no muros largos.
- Revisar la economía de equipos viejos para que no queden siempre inútiles.
- Crear una hoja de balance con HP, oro, XP, coste y DPS objetivo por zona.
- Añadir tests unitarios para fórmulas nuevas antes de tocar números masivos.

## Modos especiales

- **Modo Ironman**: una sola vida; perder contra un jefe reinicia desde La
  Comarca conservando logros.
- **Carrera al Monte Destino**: timer global, marca personal mejor tiempo desde
  cero.
- **El Anillo Tienta**: debuff acumulable por zona que da oro/xp extra pero
  penaliza algo (timer más corto, DPS reducido). Decisión moral.
- **Modo pacificador**: gana usando principalmente compañeros y misiones, con
  menos click activo.
- **Modo oleadas**: defensa infinita con ranking local.
- **Modo desafío diario**: semilla fija, reglas especiales y recompensa pequeña.

## Ideas técnicas

- Separar datos de upgrades, logros y reliquias en `src/data/`.
- Mantener fórmulas de combate en `src/engine/` y cubrirlas con tests.
- Evitar que componentes calculen bonus directamente; exponer selectores o
  funciones puras.
- Añadir migración de save antes de introducir campos como `upgrades`,
  `enemiesSeen` o `achievementsClaimed`.
- Crear helpers de formato para números grandes si la economía escala mucho.
- Considerar feature flags simples para mecánicas grandes en desarrollo.

## Hecho

(Mover aquí ideas implementadas si conviene conservar memoria de producto.)

## Otras ideas sueltas

(Apuntar aquí cualquier propuesta que no encaje todavía en una sección.)
