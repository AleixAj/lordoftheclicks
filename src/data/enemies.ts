import type { Enemy, EnemyId, EnemyType } from '@/types/game';

const ENEMY_TYPES: Record<string, EnemyType> = {
  // Bosque Viejo
  toad: 'bestia',
  cat: 'bestia',
  forest_specter: 'espectro',
  nazgul_rider: 'espectro',

  // Cima de los Vientos
  bandit: 'humano',
  alpha_wolf: 'bestia',
  khamul: 'espectro',
  witch_king_amon: 'espectro',

  // Caradhras
  mountain_wolf: 'bestia',
  ice_golem: 'naturaleza',
  crebain_flock: 'bestia',
  caradhras_storm: 'naturaleza',

  // Moria
  moria_orc: 'orco',
  moria_orc_archer: 'orco',
  great_orc: 'orco',
  cave_troll: 'troll',
  balrog: 'criatura_antigua',

  // Río Anduin
  anduin_piranhas: 'bestia',
  water_serpent: 'bestia',
  anduin_kraken: 'bestia',
  hydra: 'bestia',

  // Amon Hen
  uruk_hai_warrior: 'uruk_hai',
  uruk_hai_berserker: 'uruk_hai',
  amon_hen_captain: 'uruk_hai',
  lurtz: 'uruk_hai',

  // Fangorn
  fangorn_spider: 'bestia',
  fangorn_scorpion: 'bestia',
  snaga: 'orco',
  grishnakh: 'orco',

  // Camino al Abismo de Helm
  warg_rider: 'orco',
  warg: 'bestia',
  alpha_warg: 'bestia',
  sharku: 'orco',

  // Abismo de Helm
  helm_uruk_warrior: 'uruk_hai',
  helm_uruk_berserker: 'uruk_hai',
  uruk_hai_captain: 'uruk_hai',
  ugthak: 'uruk_hai',

  // Isengard
  uruk_hai_elite: 'uruk_hai',
  isengard_orc: 'orco',
  wormtongue: 'humano',
  saruman: 'humano',

  // Senderos de los Muertos
  dead_warrior: 'espectro',
  sworn_specter: 'espectro',
  dead_herald: 'espectro',
  dead_king: 'espectro',

  // Pelargir
  corsair: 'humano',
  slaver: 'humano',
  master_corsair: 'humano',
  corsair_captain: 'humano',

  // Osgiliath
  mordor_orc: 'mordor',
  mordor_orc_archer: 'mordor',
  orc_captain: 'mordor',
  winged_nazgul: 'espectro',

  // Puertas de Minas Tirith
  battle_troll: 'troll',
  armored_troll: 'troll',
  wolf_ram: 'troll',

  // Pelennor
  haradrim: 'humano',
  haradrim_scout: 'humano',
  mumakil: 'bestia',
  witch_king: 'espectro',

  // Minas Morgul
  morgul_orc: 'mordor',
  morgul_orc_archer: 'mordor',
  nazgul_dragon: 'bestia',
  gothmog: 'mordor',

  // Guarida de Shelob
  small_spider: 'bestia',
  web: 'naturaleza',
  great_spider: 'bestia',
  shelob: 'bestia',

  // Cirith Ungol
  gorbag: 'orco',
  shagrat: 'uruk_hai',

  // Puerta Negra
  mordor_troll: 'troll',
  armored_cave_orc: 'mordor',
  mouth_of_sauron: 'mordor',

  // Gorgoroth
  elite_orc: 'mordor',
  mordor_elite_troll: 'troll',

  // Monte del Destino
  gollum: 'humano',
  // ============================================================
  // Definidos pero NO asignados a ninguna zona.
  // Mantenidos como reserva para futuras zonas o variantes.
  // ============================================================
  nazgul_scout: 'espectro',
  avalanche: 'naturaleza',
  snowy_orc: 'orco',
  anduin_beast: 'bestia',
  sworn_dead: 'espectro',
  nazgul_seeker: 'espectro',
  nazgul: 'espectro',
  winged_nazgul_leader: 'espectro',
  tower_guardian: 'mordor',
  easterling: 'humano',
  mountain_fire: 'naturaleza',
  black_serpent: 'humano',
  warg_pack: 'bestia',
};

const ENEMY_DEFS: Record<EnemyId, Omit<Enemy, 'enemyType'>> = {
  // ============================================================
  // Bosque Viejo
  // ============================================================
  toad: {
    id: 'toad',
    name: 'Sapo',
    hp: 25,
    gold: 6,
    xp: 4,
    sprite: '/enemies/green-frog.gif',
  },
  cat: {
    id: 'cat',
    name: 'Gato',
    hp: 60,
    gold: 14,
    xp: 9,
    sprite: '/enemies/crazy-cat.gif',
  },
  forest_specter: {
    id: 'forest_specter',
    name: 'Espectro del Bosque',
    hp: 240,
    gold: 60,
    xp: 40,
    sprite: '/enemies/forest-spectral.png',
  },
  nazgul_rider: {
    id: 'nazgul_rider',
    name: 'Jinete Negro',
    hp: 380,
    gold: 95,
    xp: 60,
    isBoss: true,
    sprite: '/enemies/nazgul.gif',
  },

  // ============================================================
  // Cima de los Vientos
  // ============================================================
  bandit: {
    id: 'bandit',
    name: 'Bandido',
    hp: 85,
    gold: 20,
    xp: 13,
    sprite: '/enemies/wolf-gif.gif',
  },
  alpha_wolf: {
    id: 'alpha_wolf',
    name: 'Lobo Alfa',
    hp: 180,
    gold: 45,
    xp: 30,
    sprite: '/enemies/wolf.png',
  },
  khamul: {
    id: 'khamul',
    name: 'Khamûl, el del Este',
    hp: 520,
    gold: 135,
    xp: 90,
    sprite: '/enemies/khamul.png',
  },
  witch_king_amon: {
    id: 'witch_king_amon',
    name: 'Rey Brujo · Forma de Sombra',
    hp: 1400,
    gold: 360,
    xp: 230,
    isBoss: true,
    sprite: '/enemies/witch-king-shadow3.png',
  },

  // ============================================================
  // Caradhras
  // ============================================================
  mountain_wolf: {
    id: 'mountain_wolf',
    name: 'Lobo de Montaña',
    hp: 160,
    gold: 35,
    xp: 22,
    sprite: '/enemies/wolf-gif.gif',
  },
  ice_golem: {
    id: 'ice_golem',
    name: 'Golem de Hielo',
    hp: 140,
    gold: 32,
    xp: 21,
    sprite: '/enemies/golem.gif',
  },
  crebain_flock: {
    id: 'crebain_flock',
    name: 'Bandada de Crebain',
    hp: 600,
    gold: 150,
    xp: 95,
    sprite: '/enemies/crebain.png',
  },
  caradhras_storm: {
    id: 'caradhras_storm',
    name: 'Tormenta de Caradhras',
    hp: 1000,
    gold: 250,
    xp: 165,
    isBoss: true,
    sprite: '/enemies/caradhras-storm.png',
  },

  // ============================================================
  // Moria (Tumba de Balin / Puente de Khazad-dûm)
  // ============================================================
  moria_orc: {
    id: 'moria_orc',
    name: 'Orco',
    hp: 95,
    gold: 22,
    xp: 15,
    sprite: '/enemies/orc-classic.gif',
  },
  moria_orc_archer: {
    id: 'moria_orc_archer',
    name: 'Orco Arquero',
    hp: 75,
    gold: 18,
    xp: 12,
    sprite: '/enemies/orc-classic.gif',
  },
  great_orc: {
    id: 'great_orc',
    name: 'Orco Mayor',
    hp: 380,
    gold: 95,
    xp: 60,
    sprite: '/enemies/orc-classic.gif',
  },
  cave_troll: {
    id: 'cave_troll',
    name: 'Troll',
    hp: 700,
    gold: 170,
    xp: 110,
    sprite: '/enemies/troll.gif',
  },
  balrog: {
    id: 'balrog',
    name: 'Balrog de Morgoth',
    hp: 4500,
    gold: 1050,
    xp: 680,
    isBoss: true,
    sprite: '/enemies/balrog.gif',
  },

  // ============================================================
  // Río Anduin
  // ============================================================
  anduin_piranhas: {
    id: 'anduin_piranhas',
    name: 'Pirañas del Anduin',
    hp: 130,
    gold: 30,
    xp: 18,
    sprite: '/enemies/fire-fish.gif',
  },
  water_serpent: {
    id: 'water_serpent',
    name: 'Serpiente de Agua',
    hp: 165,
    gold: 36,
    xp: 22,
    sprite: '/enemies/elemental-agua.gif',
  },
  anduin_kraken: {
    id: 'anduin_kraken',
    name: 'Kraken del Anduin',
    hp: 1250,
    gold: 305,
    xp: 195,
    sprite: '/enemies/kraken.png',
  },
  hydra: {
    id: 'hydra',
    name: 'Hydra del Anduin',
    hp: 1500,
    gold: 360,
    xp: 230,
    isBoss: true,
    sprite: '/enemies/hydra.png',
  },

  // ============================================================
  // Amon Hen
  // ============================================================
  uruk_hai_warrior: {
    id: 'uruk_hai_warrior',
    name: 'Uruk-hai',
    hp: 210,
    gold: 45,
    xp: 28,
    sprite: '/enemies/urukhai.png',
  },
  uruk_hai_berserker: {
    id: 'uruk_hai_berserker',
    name: 'Uruk-hai Berserker',
    hp: 310,
    gold: 68,
    xp: 42,
    sprite: '/enemies/urukhai.png',
  },
  amon_hen_captain: {
    id: 'amon_hen_captain',
    name: 'Capitán Uruk-hai',
    hp: 780,
    gold: 195,
    xp: 125,
    sprite: '/enemies/lurtz.png',
  },
  lurtz: {
    id: 'lurtz',
    name: 'Lurtz',
    hp: 2200,
    gold: 520,
    xp: 340,
    isBoss: true,
    sprite: '/enemies/lurtz.png',
  },

  // ============================================================
  // Fangorn
  // ============================================================
  fangorn_spider: {
    id: 'fangorn_spider',
    name: 'Araña de Fangorn',
    hp: 165,
    gold: 38,
    xp: 24,
    sprite: '/enemies/fangorn-spider.png',
  },
  fangorn_scorpion: {
    id: 'fangorn_scorpion',
    name: 'Escorpión de Fangorn',
    hp: 165,
    gold: 38,
    xp: 24,
    sprite: '/enemies/fangorn-scorpion.png',
  },
  snaga: {
    id: 'snaga',
    name: 'Snaga',
    hp: 560,
    gold: 140,
    xp: 92,
    sprite: '/enemies/snaga.png',
  },
  grishnakh: {
    id: 'grishnakh',
    name: 'Grishnákh',
    hp: 1600,
    gold: 390,
    xp: 250,
    isBoss: true,
    sprite: '/enemies/grishnakh.png',
  },

  // ============================================================
  // Camino al Abismo de Helm
  // ============================================================
  warg_rider: {
    id: 'warg_rider',
    name: 'Jinete Huargo',
    hp: 280,
    gold: 62,
    xp: 38,
    sprite: '/enemies/warg-rider.png',
  },
  warg: {
    id: 'warg',
    name: 'Huargo',
    hp: 250,
    gold: 58,
    xp: 35,
    sprite: '/enemies/warg2.png',
  },
  alpha_warg: {
    id: 'alpha_warg',
    name: 'Huargo Alfa',
    hp: 620,
    gold: 155,
    xp: 100,
    sprite: '/enemies/warg.png',
  },
  sharku: {
    id: 'sharku',
    name: 'Sharku, Líder de Huargos',
    hp: 1700,
    gold: 410,
    xp: 270,
    isBoss: true,
    sprite: '/enemies/sharku.png',
  },

  // ============================================================
  // Abismo de Helm
  // ============================================================
  helm_uruk_warrior: {
    id: 'helm_uruk_warrior',
    name: 'Uruk-hai',
    hp: 340,
    gold: 74,
    xp: 46,
    sprite: '/enemies/urukhai.png',
  },
  helm_uruk_berserker: {
    id: 'helm_uruk_berserker',
    name: 'Uruk-hai Berserker',
    hp: 470,
    gold: 100,
    xp: 62,
    sprite: '/enemies/urukhai.png',
  },
  uruk_hai_captain: {
    id: 'uruk_hai_captain',
    name: 'Capitán Uruk-hai',
    hp: 1150,
    gold: 285,
    xp: 185,
    sprite: '/enemies/uruk-berserker.png',
    spriteScale: 1.2,
  },
  ugthak: {
    id: 'ugthak',
    name: 'Ugthak, Capitán Uruk-hai',
    hp: 2100,
    gold: 500,
    xp: 325,
    isBoss: true,
    sprite: '/enemies/uruk-berserker.png',
    spriteScale: 1.2,
  },

  // ============================================================
  // Isengard
  // ============================================================
  uruk_hai_elite: {
    id: 'uruk_hai_elite',
    name: 'Uruk-hai Élite',
    hp: 380,
    gold: 82,
    xp: 52,
    sprite: '/enemies/urukhai.png',
  },
  isengard_orc: {
    id: 'isengard_orc',
    name: 'Orco de Isengard',
    hp: 360,
    gold: 78,
    xp: 50,
    sprite: '/enemies/urukhai.png',
  },
  wormtongue: {
    id: 'wormtongue',
    name: 'Gríma Lengua de Serpiente',
    hp: 1380,
    gold: 340,
    xp: 220,
    sprite: '/enemies/urukhai.png',
  },
  saruman: {
    id: 'saruman',
    name: 'Saruman',
    hp: 3900,
    gold: 930,
    xp: 610,
    isBoss: true,
    sprite: '/enemies/uruk-berserker.png',
  },

  // ============================================================
  // Senderos de los Muertos
  // ============================================================
  dead_warrior: {
    id: 'dead_warrior',
    name: 'Guerrero del Sagrario',
    hp: 580,
    gold: 130,
    xp: 80,
    sprite: '/enemies/urukhai.png',
  },
  sworn_specter: {
    id: 'sworn_specter',
    name: 'Espectro Juramentado',
    hp: 360,
    gold: 78,
    xp: 50,
    sprite: '/enemies/urukhai.png',
  },
  dead_herald: {
    id: 'dead_herald',
    name: 'Heraldo de los Muertos',
    hp: 1080,
    gold: 265,
    xp: 175,
    sprite: '/enemies/uruk-berserker.png',
  },
  dead_king: {
    id: 'dead_king',
    name: 'Rey de los Muertos',
    hp: 3000,
    gold: 770,
    xp: 510,
    isBoss: true,
    sprite: '/companions/king-dead.png',
    glow: 28,
    glowColor: '102, 217, 217',
  },

  // ============================================================
  // Pelargir
  // ============================================================
  corsair: {
    id: 'corsair',
    name: 'Corsario de Umbar',
    hp: 330,
    gold: 75,
    xp: 48,
    sprite: '/enemies/urukhai.png',
  },
  slaver: {
    id: 'slaver',
    name: 'Esclavista de Umbar',
    hp: 390,
    gold: 88,
    xp: 56,
    sprite: '/enemies/urukhai.png',
  },
  master_corsair: {
    id: 'master_corsair',
    name: 'Maestre Corsario',
    hp: 980,
    gold: 245,
    xp: 160,
    sprite: '/enemies/uruk-berserker.png',
  },
  corsair_captain: {
    id: 'corsair_captain',
    name: 'Capitán Corsario',
    hp: 2700,
    gold: 650,
    xp: 430,
    isBoss: true,
    sprite: '/enemies/uruk-berserker.png',
  },

  // ============================================================
  // Osgiliath
  // ============================================================
  mordor_orc: {
    id: 'mordor_orc',
    name: 'Orco de Mordor',
    hp: 280,
    gold: 65,
    xp: 40,
    sprite: '/enemies/urukhai.png',
  },
  mordor_orc_archer: {
    id: 'mordor_orc_archer',
    name: 'Orco Arquero de Mordor',
    hp: 240,
    gold: 56,
    xp: 35,
    sprite: '/enemies/urukhai.png',
  },
  orc_captain: {
    id: 'orc_captain',
    name: 'Capitán Orco',
    hp: 880,
    gold: 220,
    xp: 145,
    sprite: '/enemies/uruk-berserker.png',
  },
  winged_nazgul: {
    id: 'winged_nazgul',
    name: 'Nazgûl Alado',
    hp: 1700,
    gold: 420,
    xp: 275,
    isBoss: true,
    sprite: '/enemies/uruk-berserker.png',
  },

  // ============================================================
  // Puertas de Minas Tirith
  // ============================================================
  battle_troll: {
    id: 'battle_troll',
    name: 'Troll de Batalla',
    hp: 920,
    gold: 195,
    xp: 115,
    sprite: '/enemies/urukhai.png',
  },
  armored_troll: {
    id: 'armored_troll',
    name: 'Troll con Armadura',
    hp: 1620,
    gold: 390,
    xp: 260,
    sprite: '/enemies/uruk-berserker.png',
  },
  wolf_ram: {
    id: 'wolf_ram',
    name: 'Ariete Lobo',
    hp: 2400,
    gold: 580,
    xp: 380,
    isBoss: true,
    sprite: '/enemies/uruk-berserker.png',
  },

  // ============================================================
  // Pelennor
  // ============================================================
  haradrim: {
    id: 'haradrim',
    name: 'Haradrim',
    hp: 310,
    gold: 72,
    xp: 45,
    sprite: '/enemies/urukhai.png',
  },
  haradrim_scout: {
    id: 'haradrim_scout',
    name: 'Explorador Haradrim',
    hp: 240,
    gold: 55,
    xp: 35,
    sprite: '/enemies/urukhai.png',
  },
  mumakil: {
    id: 'mumakil',
    name: 'Mûmakil',
    hp: 2400,
    gold: 540,
    xp: 350,
    sprite: '/enemies/uruk-berserker.png',
  },
  witch_king: {
    id: 'witch_king',
    name: 'Rey Brujo de Angmar',
    hp: 5600,
    gold: 1500,
    xp: 980,
    isBoss: true,
    sprite: '/enemies/uruk-berserker.png',
  },

  // ============================================================
  // Minas Morgul
  // ============================================================
  morgul_orc: {
    id: 'morgul_orc',
    name: 'Orco de Morgul',
    hp: 480,
    gold: 105,
    xp: 68,
    sprite: '/enemies/urukhai.png',
  },
  morgul_orc_archer: {
    id: 'morgul_orc_archer',
    name: 'Orco Arquero de Morgul',
    hp: 430,
    gold: 95,
    xp: 62,
    sprite: '/enemies/urukhai.png',
  },
  nazgul_dragon: {
    id: 'nazgul_dragon',
    name: 'Dragón Nazgûl',
    hp: 1450,
    gold: 350,
    xp: 235,
    sprite: '/enemies/uruk-berserker.png',
  },
  gothmog: {
    id: 'gothmog',
    name: 'Gothmog',
    hp: 3700,
    gold: 900,
    xp: 590,
    isBoss: true,
    sprite: '/enemies/uruk-berserker.png',
  },

  // ============================================================
  // Guarida de Shelob
  // ============================================================
  small_spider: {
    id: 'small_spider',
    name: 'Araña Pequeña',
    hp: 320,
    gold: 75,
    xp: 48,
    sprite: '/enemies/urukhai.png',
  },
  web: {
    id: 'web',
    name: 'Telaraña',
    hp: 380,
    gold: 80,
    xp: 52,
    sprite: '/enemies/urukhai.png',
  },
  great_spider: {
    id: 'great_spider',
    name: 'Araña Grande',
    hp: 1800,
    gold: 440,
    xp: 290,
    sprite: '/enemies/uruk-berserker.png',
  },
  shelob: {
    id: 'shelob',
    name: 'Ella-Laraña',
    hp: 4200,
    gold: 1150,
    xp: 760,
    isBoss: true,
    sprite: '/enemies/uruk-berserker.png',
  },

  // ============================================================
  // Cirith Ungol
  // ============================================================
  gorbag: {
    id: 'gorbag',
    name: 'Gorbag, Capitán de Morgul',
    hp: 1700,
    gold: 410,
    xp: 270,
    sprite: '/enemies/uruk-berserker.png',
  },
  shagrat: {
    id: 'shagrat',
    name: 'Shagrat, Capitán de Cirith Ungol',
    hp: 4300,
    gold: 1100,
    xp: 730,
    isBoss: true,
    sprite: '/enemies/uruk-berserker.png',
  },

  // ============================================================
  // Puerta Negra
  // ============================================================
  mordor_troll: {
    id: 'mordor_troll',
    name: 'Troll de Mordor',
    hp: 1100,
    gold: 240,
    xp: 145,
    sprite: '/enemies/urukhai.png',
  },
  armored_cave_orc: {
    id: 'armored_cave_orc',
    name: 'Orco de Caverna con Armadura',
    hp: 1620,
    gold: 390,
    xp: 260,
    sprite: '/enemies/uruk-berserker.png',
  },
  mouth_of_sauron: {
    id: 'mouth_of_sauron',
    name: 'Boca de Sauron',
    hp: 4600,
    gold: 1080,
    xp: 720,
    isBoss: true,
    sprite: '/enemies/uruk-berserker.png',
  },

  // ============================================================
  // Gorgoroth
  // ============================================================
  elite_orc: {
    id: 'elite_orc',
    name: 'Orco Élite de Mordor',
    hp: 520,
    gold: 115,
    xp: 72,
    sprite: '/enemies/urukhai.png',
  },
  mordor_elite_troll: {
    id: 'mordor_elite_troll',
    name: 'Troll Élite de Mordor',
    hp: 1400,
    gold: 310,
    xp: 190,
    sprite: '/enemies/urukhai.png',
  },
  eye_of_sauron: {
    id: 'eye_of_sauron',
    name: 'Ojo de Sauron',
    hp: 3000,
    gold: 850,
    xp: 560,
    sprite: '/enemies/uruk-berserker.png',
  },
  sauron_spirit: {
    id: 'sauron_spirit',
    name: 'Espíritu de Sauron',
    hp: 6400,
    gold: 1800,
    xp: 1150,
    isBoss: true,
    sprite: '/enemies/uruk-berserker.png',
  },

  // ============================================================
  // Monte del Destino
  // ============================================================
  gollum: {
    id: 'gollum',
    name: 'Gollum',
    hp: 1600,
    gold: 480,
    xp: 950,
    sprite: '/enemies/uruk-berserker.png',
  },
  one_ring: {
    id: 'one_ring',
    name: 'El Anillo Único',
    hp: 6800,
    gold: 2000,
    xp: 2500,
    isBoss: true,
    sprite: '/enemies/uruk-berserker.png',
  },

  // ============================================================
  // Reserva (no asignados a ninguna zona)
  // Se mantienen aquí para reciclarlos en futuras zonas o variantes.
  // ============================================================
  nazgul_scout: {
    id: 'nazgul_scout',
    name: 'Espectro del Anillo',
    hp: 220,
    gold: 48,
    xp: 30,
    sprite: '/enemies/urukhai.png',
  },
  avalanche: {
    id: 'avalanche',
    name: 'Avalancha',
    hp: 280,
    gold: 45,
    xp: 28,
    sprite: '/enemies/urukhai.png',
  },
  snowy_orc: {
    id: 'snowy_orc',
    name: 'Orco Nevado',
    hp: 180,
    gold: 38,
    xp: 24,
    sprite: '/enemies/urukhai.png',
  },
  anduin_beast: {
    id: 'anduin_beast',
    name: 'Bestia del Anduin',
    hp: 600,
    gold: 150,
    xp: 95,
    sprite: '/enemies/urukhai.png',
  },
  sworn_dead: {
    id: 'sworn_dead',
    name: 'Muerto Juramentado',
    hp: 420,
    gold: 95,
    xp: 60,
    sprite: '/enemies/urukhai.png',
  },
  nazgul_seeker: {
    id: 'nazgul_seeker',
    name: 'Nazgûl Buscador',
    hp: 2400,
    gold: 580,
    xp: 380,
    isBoss: true,
    sprite: '/enemies/uruk-berserker.png',
  },
  nazgul: {
    id: 'nazgul',
    name: 'Nazgûl',
    hp: 820,
    gold: 175,
    xp: 105,
    sprite: '/enemies/urukhai.png',
  },
  winged_nazgul_leader: {
    id: 'winged_nazgul_leader',
    name: 'Líder Nazgûl Alado',
    hp: 1320,
    gold: 320,
    xp: 215,
    sprite: '/enemies/urukhai.png',
  },
  tower_guardian: {
    id: 'tower_guardian',
    name: 'Guardián de la Torre',
    hp: 1540,
    gold: 370,
    xp: 245,
    sprite: '/enemies/urukhai.png',
  },
  easterling: {
    id: 'easterling',
    name: 'Oriental',
    hp: 380,
    gold: 88,
    xp: 55,
    sprite: '/enemies/urukhai.png',
  },
  mountain_fire: {
    id: 'mountain_fire',
    name: 'Fuego de la Montaña',
    hp: 650,
    gold: 130,
    xp: 80,
    sprite: '/enemies/urukhai.png',
  },
  black_serpent: {
    id: 'black_serpent',
    name: 'Señor de la Serpiente Negra',
    hp: 2400,
    gold: 560,
    xp: 360,
    sprite: '/enemies/urukhai.png',
  },
  warg_pack: {
    id: 'warg_pack',
    name: 'Manada de Huargos',
    hp: 1500,
    gold: 360,
    xp: 235,
    isBoss: true,
    sprite: '/enemies/uruk-berserker.png',
  },
};

const BALANCED_ELITE_HP: Partial<Record<EnemyId, number>> = {
  forest_specter: 260,
  nazgul_rider: 620,
  khamul: 720,
  witch_king_amon: 1500,
  crebain_flock: 720,
  caradhras_storm: 1450,
  great_orc: 640,
  cave_troll: 1250,
  balrog: 5200,
  anduin_kraken: 1600,
  hydra: 2450,
  amon_hen_captain: 1550,
  lurtz: 3150,
  snaga: 1400,
  grishnakh: 3000,
  alpha_warg: 1450,
  sharku: 3200,
  uruk_hai_captain: 2200,
  ugthak: 4300,
  wormtongue: 2500,
  saruman: 5600,
  dead_herald: 2650,
  dead_king: 5200,
  master_corsair: 2500,
  corsair_captain: 5400,
  orc_captain: 2400,
  winged_nazgul: 5200,
  armored_troll: 3200,
  wolf_ram: 5800,
  mumakil: 4200,
  witch_king: 7800,
  nazgul_dragon: 3800,
  gothmog: 7200,
  great_spider: 4000,
  shelob: 7600,
  gorbag: 3900,
  shagrat: 8000,
  armored_cave_orc: 4300,
  mouth_of_sauron: 8500,
  eye_of_sauron: 5400,
  sauron_spirit: 9800,
  gollum: 3600,
  one_ring: 12000,
};

export const ENEMIES: Record<EnemyId, Enemy> = Object.fromEntries(
  Object.entries(ENEMY_DEFS).map(([id, enemy]) => {
    const type = ENEMY_TYPES[id];
    return [
      id,
      {
        ...enemy,
        ...(BALANCED_ELITE_HP[id] ? { hp: BALANCED_ELITE_HP[id] } : {}),
        ...(type ? { enemyType: type } : {}),
      },
    ];
  }),
) as Record<EnemyId, Enemy>;
