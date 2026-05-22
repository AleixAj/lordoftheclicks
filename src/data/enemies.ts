import type { Enemy, EnemyId } from '@/types/game';

export const ENEMIES: Record<EnemyId, Enemy> = {
  lobo: { id: 'lobo', name: 'Lobo', hp: 35, gold: 8, xp: 5 },
  bandido: { id: 'bandido', name: 'Bandido', hp: 48, gold: 12, xp: 8 },

  arbol_viejo: { id: 'arbol_viejo', name: 'Árbol Viejo', hp: 110, gold: 22, xp: 15 },
  espectro_bosque: { id: 'espectro_bosque', name: 'Espectro del Bosque', hp: 95, gold: 18, xp: 12 },

  barrow_wight: { id: 'barrow_wight', name: 'Espectro de Túmulo', hp: 130, gold: 28, xp: 18 },
  espectro_tumulo: { id: 'espectro_tumulo', name: 'Aparición del Túmulo', hp: 115, gold: 25, xp: 16 },

  rufian: { id: 'rufian', name: 'Rufián', hp: 65, gold: 15, xp: 10 },
  espia: { id: 'espia', name: 'Espía de Sauron', hp: 85, gold: 20, xp: 13 },

  warg: { id: 'warg', name: 'Huargo', hp: 140, gold: 32, xp: 20 },
  nazgul_scout: { id: 'nazgul_scout', name: 'Espectro del Anillo', hp: 220, gold: 48, xp: 30 },

  lobo_montana: { id: 'lobo_montana', name: 'Lobo de Montaña', hp: 160, gold: 35, xp: 22 },
  avalancha: { id: 'avalancha', name: 'Avalancha', hp: 280, gold: 45, xp: 28 },
  orco_nevado: { id: 'orco_nevado', name: 'Orco Nevado', hp: 180, gold: 38, xp: 24 },

  trasgo: { id: 'trasgo', name: 'Trasgo', hp: 95, gold: 22, xp: 15 },
  trasgo_arquero: { id: 'trasgo_arquero', name: 'Trasgo Arquero', hp: 75, gold: 18, xp: 12 },
  troll_caverna: { id: 'troll_caverna', name: 'Troll de Caverna', hp: 420, gold: 85, xp: 55 },

  orco_flota: { id: 'orco_flota', name: 'Orco Flotante', hp: 155, gold: 34, xp: 21 },

  urukhai: { id: 'urukhai', name: 'Uruk-hai', hp: 210, gold: 45, xp: 28 },
  urukhai_berserk: { id: 'urukhai_berserk', name: 'Uruk-hai Berserker', hp: 310, gold: 68, xp: 42 },
  orco_isengard: { id: 'orco_isengard', name: 'Orco de Isengard', hp: 165, gold: 38, xp: 24 },
  warg_rider: { id: 'warg_rider', name: 'Jinete de Huargo', hp: 280, gold: 62, xp: 38 },
  orco_escalador: { id: 'orco_escalador', name: 'Orco Escalador', hp: 195, gold: 44, xp: 27 },
  urukhai_elite: { id: 'urukhai_elite', name: 'Uruk-hai Élite', hp: 380, gold: 82, xp: 52 },

  orco_mordor: { id: 'orco_mordor', name: 'Orco de Mordor', hp: 280, gold: 65, xp: 40 },
  nazgul_alado: { id: 'nazgul_alado', name: 'Nazgûl Alado', hp: 680, gold: 145, xp: 88 },
  troll_batalla: { id: 'troll_batalla', name: 'Troll de Batalla', hp: 920, gold: 195, xp: 115 },
  mumakil: { id: 'mumakil', name: 'Mûmakil', hp: 1850, gold: 380, xp: 220 },
  haradrim: { id: 'haradrim', name: 'Haradrim', hp: 310, gold: 72, xp: 45 },
  haradrim_scout: { id: 'haradrim_scout', name: 'Explorador Haradrim', hp: 240, gold: 55, xp: 35 },
  troll_mordor: { id: 'troll_mordor', name: 'Troll de Mordor', hp: 1100, gold: 240, xp: 145 },
  orco_elite: { id: 'orco_elite', name: 'Orco Élite', hp: 520, gold: 115, xp: 72 },
  oriental: { id: 'oriental', name: 'Oriental', hp: 380, gold: 88, xp: 55 },
  orco_morgul: { id: 'orco_morgul', name: 'Orco de Morgul', hp: 480, gold: 105, xp: 68 },
  nazgul: { id: 'nazgul', name: 'Nazgûl', hp: 820, gold: 175, xp: 105 },
  fuego_montana: { id: 'fuego_montana', name: 'Fuego de la Montaña', hp: 650, gold: 130, xp: 80 },

  rey_de_los_tumulos: {
    id: 'rey_de_los_tumulos',
    name: 'Rey de los Túmulos',
    hp: 520,
    gold: 140,
    xp: 95,
    isBoss: true,
  },
  rey_brujo_amon: {
    id: 'rey_brujo_amon',
    name: 'Rey Brujo',
    hp: 850,
    gold: 220,
    xp: 140,
    isBoss: true,
  },
  balrog: { id: 'balrog', name: 'Balrog de Morgoth', hp: 2800, gold: 650, xp: 420, isBoss: true },
  lurtz: { id: 'lurtz', name: 'Lurtz', hp: 1350, gold: 320, xp: 210, isBoss: true },
  capitan_uruk: {
    id: 'capitan_uruk',
    name: 'Capitán Uruk-hai',
    hp: 1180,
    gold: 280,
    xp: 185,
    isBoss: true,
  },
  saruman: { id: 'saruman', name: 'Saruman', hp: 2450, gold: 580, xp: 380, isBoss: true },
  rey_brujo: {
    id: 'rey_brujo',
    name: 'Rey Brujo de Angmar',
    hp: 4200,
    gold: 950,
    xp: 620,
    isBoss: true,
  },
  rey_brujo_morgul: {
    id: 'rey_brujo_morgul',
    name: 'Señor de Minas Morgul',
    hp: 3600,
    gold: 820,
    xp: 540,
    isBoss: true,
  },
  shelob: { id: 'shelob', name: 'Ella-Laraña', hp: 2650, gold: 720, xp: 480, isBoss: true },
  gollum_final: { id: 'gollum_final', name: 'Gollum', hp: 1450, gold: 420, xp: 850, isBoss: true },
};
