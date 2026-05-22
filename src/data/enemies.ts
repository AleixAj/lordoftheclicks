import type { Enemy, EnemyId, EnemyType } from '@/types/game';

const ENEMY_TYPES: Record<string, EnemyType> = {
  arbol_viejo: 'naturaleza',
  espectro_bosque: 'espectro',
  rufian: 'humano',
  espia: 'humano',
  huargo: 'bestia',
  nazgul_explorador: 'espectro',
  lobo_montana: 'bestia',
  avalancha: 'naturaleza',
  orco_nevado: 'orco',
  trasgo: 'orco',
  trasgo_arquero: 'orco',
  piranas_anduin: 'bestia',
  pulpo_anduin: 'bestia',
  serpiente_agua: 'bestia',
  urukhai: 'uruk_hai',
  urukhai_frenetico: 'uruk_hai',
  orco_isengard: 'orco',
  jinete_huargo: 'bestia',
  orco_escalador: 'orco',
  urukhai_elite: 'uruk_hai',
  muerto_juramentado: 'espectro',
  guerrero_muerto: 'espectro',
  espectro_juramentado: 'espectro',
  corsario: 'humano',
  esclavista: 'humano',
  orco_mordor: 'mordor',
  nazgul_alado: 'espectro',
  troll_batalla: 'troll',
  haradrim: 'humano',
  haradrim_explorador: 'humano',
  troll_mordor: 'troll',
  orco_elite: 'mordor',
  oriental: 'humano',
  orco_morgul: 'mordor',
  nazgul: 'espectro',
  fuego_montana: 'naturaleza',
  lobo_alfa: 'bestia',
  espectro_mayor: 'espectro',
  orco_mayor: 'orco',
  bestia_anduin: 'bestia',
  capitan_amon: 'uruk_hai',
  lobo_mayor: 'bestia',
  huargo_alfa: 'bestia',
  uruk_antorcha: 'uruk_hai',
  lengua_serpiente: 'humano',
  heraldo_muertos: 'espectro',
  maestre_corsario: 'humano',
  capitan_asalto: 'mordor',
  ariete_lobo: 'troll',
  nazgul_alado_lider: 'espectro',
  guardian_torre: 'mordor',
  orco_caverna_armadura: 'mordor',
  troll_caverna: 'troll',
  mumakil: 'bestia',
  ojo_de_sauron: 'espiritual',
  gollum_final: 'humano',
  nazgul_jinete: 'espectro',
  bandada_crebain: 'bestia',
  rey_brujo_amon: 'espectro',
  tormenta_caradhras: 'naturaleza',
  balrog: 'criatura_antigua',
  kraken_anduin: 'bestia',
  lurtz: 'uruk_hai',
  urukhai_cazador: 'uruk_hai',
  manada_huargos: 'bestia',
  capitan_uruk: 'uruk_hai',
  saruman: 'humano',
  rey_muerto: 'espectro',
  capitan_corsario: 'humano',
  nazgul_buscador: 'espectro',
  troll_caverna_armadura: 'troll',
  rey_brujo: 'espectro',
  gothmog: 'mordor',
  shelob: 'bestia',
  boca_de_sauron: 'mordor',
  espiritu_de_sauron: 'espiritual',
  anillo: 'espiritual',
};

const ENEMY_DEFS: Record<EnemyId, Omit<Enemy, 'enemyType'>> = {
  // ============================================================
  // POOL ENEMIES (normal mobs)
  // ============================================================

  // Bosque Viejo
  arbol_viejo: { id: 'arbol_viejo', name: 'Árbol Viejo', hp: 110, gold: 22, xp: 15 },
  espectro_bosque: { id: 'espectro_bosque', name: 'Espectro del Bosque', hp: 95, gold: 18, xp: 12 },

  // Cima de los Vientos
  rufian: { id: 'rufian', name: 'Rufián', hp: 65, gold: 15, xp: 10 },
  espia: { id: 'espia', name: 'Espía de Sauron', hp: 85, gold: 20, xp: 13 },
  huargo: { id: 'huargo', name: 'Huargo', hp: 140, gold: 32, xp: 20 },
  nazgul_explorador: {
    id: 'nazgul_explorador',
    name: 'Espectro del Anillo',
    hp: 220,
    gold: 48,
    xp: 30,
  },

  // Caradhras
  lobo_montana: { id: 'lobo_montana', name: 'Lobo de Montaña', hp: 160, gold: 35, xp: 22 },
  avalancha: { id: 'avalancha', name: 'Avalancha', hp: 280, gold: 45, xp: 28 },
  orco_nevado: { id: 'orco_nevado', name: 'Orco Nevado', hp: 180, gold: 38, xp: 24 },

  // Moria (Tumba de Balin / Puente de Khazad-dûm)
  trasgo: { id: 'trasgo', name: 'Trasgo', hp: 95, gold: 22, xp: 15 },
  trasgo_arquero: { id: 'trasgo_arquero', name: 'Trasgo Arquero', hp: 75, gold: 18, xp: 12 },

  // Río Anduin (sin orcos: la Comunidad aún no ha sido descubierta por los uruks)
  piranas_anduin: {
    id: 'piranas_anduin',
    name: 'Pirañas del Anduin',
    hp: 130,
    gold: 30,
    xp: 18,
  },
  pulpo_anduin: { id: 'pulpo_anduin', name: 'Pulpo del Anduin', hp: 180, gold: 38, xp: 24 },
  serpiente_agua: { id: 'serpiente_agua', name: 'Serpiente de Agua', hp: 165, gold: 36, xp: 22 },

  // Amon Hen
  urukhai: { id: 'urukhai', name: 'Uruk-hai', hp: 210, gold: 45, xp: 28 },
  urukhai_frenetico: {
    id: 'urukhai_frenetico',
    name: 'Uruk-hai Frenético',
    hp: 310,
    gold: 68,
    xp: 42,
  },

  // Fangorn / Isengard / Camino al Abismo
  orco_isengard: { id: 'orco_isengard', name: 'Orco de Isengard', hp: 165, gold: 38, xp: 24 },
  jinete_huargo: { id: 'jinete_huargo', name: 'Jinete de Huargo', hp: 280, gold: 62, xp: 38 },
  orco_escalador: { id: 'orco_escalador', name: 'Orco Escalador', hp: 195, gold: 44, xp: 27 },
  urukhai_elite: { id: 'urukhai_elite', name: 'Uruk-hai Élite', hp: 380, gold: 82, xp: 52 },

  // Senderos de los Muertos
  muerto_juramentado: {
    id: 'muerto_juramentado',
    name: 'Muerto Juramentado',
    hp: 420,
    gold: 95,
    xp: 60,
  },
  guerrero_muerto: {
    id: 'guerrero_muerto',
    name: 'Guerrero del Sagrario',
    hp: 580,
    gold: 130,
    xp: 80,
  },
  espectro_juramentado: {
    id: 'espectro_juramentado',
    name: 'Espectro Juramentado',
    hp: 360,
    gold: 78,
    xp: 50,
  },

  // Pelargir
  corsario: { id: 'corsario', name: 'Corsario de Umbar', hp: 330, gold: 75, xp: 48 },
  esclavista: { id: 'esclavista', name: 'Esclavista de Umbar', hp: 390, gold: 88, xp: 56 },

  // Gondor / Mordor
  orco_mordor: { id: 'orco_mordor', name: 'Orco de Mordor', hp: 280, gold: 65, xp: 40 },
  nazgul_alado: { id: 'nazgul_alado', name: 'Nazgûl Alado', hp: 680, gold: 145, xp: 88 },
  troll_batalla: { id: 'troll_batalla', name: 'Troll de Batalla', hp: 920, gold: 195, xp: 115 },
  haradrim: { id: 'haradrim', name: 'Haradrim', hp: 310, gold: 72, xp: 45 },
  haradrim_explorador: {
    id: 'haradrim_explorador',
    name: 'Explorador Haradrim',
    hp: 240,
    gold: 55,
    xp: 35,
  },
  troll_mordor: { id: 'troll_mordor', name: 'Troll de Mordor', hp: 1100, gold: 240, xp: 145 },
  orco_elite: { id: 'orco_elite', name: 'Orco Élite', hp: 520, gold: 115, xp: 72 },
  oriental: { id: 'oriental', name: 'Oriental', hp: 380, gold: 88, xp: 55 },
  orco_morgul: { id: 'orco_morgul', name: 'Orco de Morgul', hp: 480, gold: 105, xp: 68 },
  nazgul: { id: 'nazgul', name: 'Nazgûl', hp: 820, gold: 175, xp: 105 },
  fuego_montana: { id: 'fuego_montana', name: 'Fuego de la Montaña', hp: 650, gold: 130, xp: 80 },

  // ============================================================
  // SEMI-BOSSES (mid-zone champions)
  // Spawn around halfway through each combat zone. Tougher than
  // pool mobs, gentler than the zone boss.
  // ============================================================
  lobo_alfa: { id: 'lobo_alfa', name: 'Lobo Alfa', hp: 180, gold: 45, xp: 30 },
  espectro_mayor: { id: 'espectro_mayor', name: 'Espectro Mayor', hp: 460, gold: 120, xp: 78 },
  orco_mayor: { id: 'orco_mayor', name: 'Orco Mayor', hp: 380, gold: 95, xp: 60 },
  bestia_anduin: { id: 'bestia_anduin', name: 'Bestia del Anduin', hp: 600, gold: 150, xp: 95 },
  capitan_amon: { id: 'capitan_amon', name: 'Capitán Uruk-hai', hp: 780, gold: 195, xp: 125 },
  lobo_mayor: { id: 'lobo_mayor', name: 'Lobo Mayor de Fangorn', hp: 560, gold: 140, xp: 92 },
  huargo_alfa: { id: 'huargo_alfa', name: 'Huargo Alfa', hp: 620, gold: 155, xp: 100 },
  uruk_antorcha: {
    id: 'uruk_antorcha',
    name: 'Uruk-hai con Antorcha',
    hp: 700,
    gold: 175,
    xp: 115,
  },
  lengua_serpiente: {
    id: 'lengua_serpiente',
    name: 'Lengua de Serpiente',
    hp: 1380,
    gold: 340,
    xp: 220,
  },
  heraldo_muertos: {
    id: 'heraldo_muertos',
    name: 'Heraldo de los Muertos',
    hp: 1080,
    gold: 265,
    xp: 175,
  },
  maestre_corsario: {
    id: 'maestre_corsario',
    name: 'Maestre Corsario',
    hp: 980,
    gold: 245,
    xp: 160,
  },
  capitan_asalto: {
    id: 'capitan_asalto',
    name: 'Capitán Orco de Asalto',
    hp: 880,
    gold: 220,
    xp: 145,
  },
  ariete_lobo: { id: 'ariete_lobo', name: 'Ariete Lobo', hp: 1020, gold: 255, xp: 165 },
  nazgul_alado_lider: {
    id: 'nazgul_alado_lider',
    name: 'Líder Nazgûl Alado',
    hp: 1320,
    gold: 320,
    xp: 215,
  },
  guardian_torre: {
    id: 'guardian_torre',
    name: 'Guardián de la Torre',
    hp: 1540,
    gold: 370,
    xp: 245,
  },
  orco_caverna_armadura: {
    id: 'orco_caverna_armadura',
    name: 'Orco de Caverna con Armadura',
    hp: 1620,
    gold: 390,
    xp: 260,
  },

  // ============================================================
  // SHARED — used both as boss and semi-boss in different zones.
  // (Same template, the `tier` is decided at spawn time.)
  // ============================================================
  /** Boss of Moria · Tumba de Balin, semi-boss of Moria · Puente de Khazad-dûm. */
  troll_caverna: { id: 'troll_caverna', name: 'Troll de Caverna', hp: 700, gold: 170, xp: 110 },
  /** Boss of Pelennor (boss=Rey Brujo, this acts as the pelennor semi). */
  mumakil: { id: 'mumakil', name: 'Mûmakil', hp: 2400, gold: 540, xp: 350 },
  /** Semi-boss of Gorgoroth (was its previous boss). */
  ojo_de_sauron: {
    id: 'ojo_de_sauron',
    name: 'Ojo de Sauron',
    hp: 3000,
    gold: 850,
    xp: 560,
  },
  /** Semi-boss of Monte del Destino (was its previous boss). */
  gollum_final: {
    id: 'gollum_final',
    name: 'Gollum',
    hp: 1600,
    gold: 480,
    xp: 950,
  },

  // ============================================================
  // BOSSES (zone-final, isBoss: true)
  // ============================================================
  nazgul_jinete: {
    id: 'nazgul_jinete',
    name: 'Jinete Negro',
    hp: 380,
    gold: 95,
    xp: 60,
    isBoss: true,
  },
  bandada_crebain: {
    id: 'bandada_crebain',
    name: 'Bandada de Crebain',
    hp: 600,
    gold: 150,
    xp: 95,
    isBoss: true,
  },
  rey_brujo_amon: {
    id: 'rey_brujo_amon',
    name: 'Rey Brujo',
    hp: 1400,
    gold: 360,
    xp: 230,
    isBoss: true,
  },
  tormenta_caradhras: {
    id: 'tormenta_caradhras',
    name: 'Tormenta de Caradhras',
    hp: 1000,
    gold: 250,
    xp: 165,
    isBoss: true,
  },
  balrog: { id: 'balrog', name: 'Balrog de Morgoth', hp: 4500, gold: 1050, xp: 680, isBoss: true },
  kraken_anduin: {
    id: 'kraken_anduin',
    name: 'Kraken del Anduin',
    hp: 1250,
    gold: 305,
    xp: 195,
    isBoss: true,
  },
  lurtz: { id: 'lurtz', name: 'Lurtz', hp: 2200, gold: 520, xp: 340, isBoss: true },
  urukhai_cazador: {
    id: 'urukhai_cazador',
    name: 'Uruk-hai Cazador',
    hp: 1600,
    gold: 390,
    xp: 250,
    isBoss: true,
  },
  manada_huargos: {
    id: 'manada_huargos',
    name: 'Manada de Huargos',
    hp: 1500,
    gold: 360,
    xp: 235,
    isBoss: true,
  },
  capitan_uruk: {
    id: 'capitan_uruk',
    name: 'Capitán Uruk-hai',
    hp: 1900,
    gold: 450,
    xp: 295,
    isBoss: true,
  },
  saruman: { id: 'saruman', name: 'Saruman', hp: 3900, gold: 930, xp: 610, isBoss: true },
  rey_muerto: {
    id: 'rey_muerto',
    name: 'Rey de los Muertos',
    hp: 3000,
    gold: 770,
    xp: 510,
    isBoss: true,
  },
  capitan_corsario: {
    id: 'capitan_corsario',
    name: 'Capitán Corsario',
    hp: 2700,
    gold: 650,
    xp: 430,
    isBoss: true,
  },
  nazgul_buscador: {
    id: 'nazgul_buscador',
    name: 'Nazgûl Buscador',
    hp: 2400,
    gold: 580,
    xp: 380,
    isBoss: true,
  },
  troll_caverna_armadura: {
    id: 'troll_caverna_armadura',
    name: 'Troll de Caverna con Armadura',
    hp: 2800,
    gold: 670,
    xp: 440,
    isBoss: true,
  },
  rey_brujo: {
    id: 'rey_brujo',
    name: 'Rey Brujo de Angmar',
    hp: 5600,
    gold: 1500,
    xp: 980,
    isBoss: true,
  },
  gothmog: { id: 'gothmog', name: 'Gothmog', hp: 3700, gold: 900, xp: 590, isBoss: true },
  shelob: { id: 'shelob', name: 'Ella-Laraña', hp: 4200, gold: 1150, xp: 760, isBoss: true },
  boca_de_sauron: {
    id: 'boca_de_sauron',
    name: 'Boca de Sauron',
    hp: 4600,
    gold: 1080,
    xp: 720,
    isBoss: true,
  },
  espiritu_de_sauron: {
    id: 'espiritu_de_sauron',
    name: 'Espíritu de Sauron',
    hp: 6400,
    gold: 1800,
    xp: 1150,
    isBoss: true,
  },
  anillo: {
    id: 'anillo',
    name: 'El Anillo Único',
    hp: 6800,
    gold: 2000,
    xp: 2500,
    isBoss: true,
  },
};

export const ENEMIES: Record<EnemyId, Enemy> = Object.fromEntries(
  Object.entries(ENEMY_DEFS).map(([id, enemy]) => [
    id,
    {
      ...enemy,
      enemyType: ENEMY_TYPES[id] ?? 'orco',
    },
  ]),
) as Record<EnemyId, Enemy>;
