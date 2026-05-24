import type { Enemy, EnemyId, EnemyType } from '@/types/game';

const ENEMY_TYPES: Record<string, EnemyType> = {
  // Bosque Viejo
  conejo: 'bestia',
  ciervo: 'bestia',
  espectro_bosque: 'espectro',
  nazgul_jinete: 'espectro',

  // Cima de los Vientos
  bandido: 'humano',
  lobo_alfa: 'bestia',
  khamul: 'espectro',
  rey_brujo_amon: 'espectro',

  // Caradhras
  lobo_montana: 'bestia',
  oso_polar: 'bestia',
  aguila: 'bestia',
  bandada_crebain: 'bestia',
  tormenta_caradhras: 'naturaleza',

  // Moria
  orco_moria: 'orco',
  orco_arquero_moria: 'orco',
  orco_mayor: 'orco',
  troll_caverna: 'troll',
  balrog: 'criatura_antigua',

  // Río Anduin
  piranas_anduin: 'bestia',
  pez_maligno: 'bestia',
  serpiente_agua: 'bestia',
  kraken_anduin: 'bestia',
  hydra: 'bestia',

  // Amon Hen
  urukhai: 'uruk_hai',
  urukhai_frenetico: 'uruk_hai',
  capitan_amon: 'uruk_hai',
  lurtz: 'uruk_hai',

  // Fangorn
  orco_isengard: 'orco',
  lobo_mayor: 'bestia',
  urukhai_cazador: 'uruk_hai',

  // Camino al Abismo de Helm
  jinete_huargo: 'bestia',
  huargo_alfa: 'bestia',
  sharku: 'orco',

  // Abismo de Helm
  orco_escalador: 'orco',
  capitan_uruk: 'uruk_hai',
  ugthak: 'uruk_hai',

  // Isengard
  urukhai_elite: 'uruk_hai',
  lengua_serpiente: 'humano',
  saruman: 'humano',

  // Senderos de los Muertos
  guerrero_muerto: 'espectro',
  espectro_juramentado: 'espectro',
  heraldo_muertos: 'espectro',
  rey_muerto: 'espectro',

  // Pelargir
  corsario: 'humano',
  esclavista: 'humano',
  maestre_corsario: 'humano',
  capitan_corsario: 'humano',

  // Osgiliath
  orco_mordor: 'mordor',
  orco_arquero_mordor: 'mordor',
  capitan_orco: 'mordor',
  nazgul_alado: 'espectro',

  // Puertas de Minas Tirith
  troll_batalla: 'troll',
  troll_caverna_armadura: 'troll',
  ariete_lobo: 'troll',

  // Pelennor
  haradrim: 'humano',
  haradrim_explorador: 'humano',
  mumakil: 'bestia',
  rey_brujo: 'espectro',

  // Minas Morgul
  orco_morgul: 'mordor',
  orco_arquero_morgul: 'mordor',
  dragon_nazgul: 'bestia',
  gothmog: 'mordor',

  // Guarida de Shelob
  arana_pequena: 'bestia',
  telarana: 'naturaleza',
  arana_grande: 'bestia',
  shelob: 'bestia',

  // Cirith Ungol
  gorbag: 'orco',
  shagrat: 'uruk_hai',

  // Puerta Negra
  troll_mordor: 'troll',
  orco_caverna_armadura: 'mordor',
  boca_de_sauron: 'mordor',

  // Gorgoroth
  orco_elite: 'mordor',
  troll_elite_mordor: 'troll',

  // Monte del Destino
  gollum_final: 'humano',
  // ============================================================
  // Definidos pero NO asignados a ninguna zona.
  // Mantenidos como reserva para futuras zonas o variantes.
  // ============================================================
  huargo: 'bestia',
  nazgul_explorador: 'espectro',
  avalancha: 'naturaleza',
  orco_nevado: 'orco',
  bestia_anduin: 'bestia',
  muerto_juramentado: 'espectro',
  nazgul_buscador: 'espectro',
  nazgul: 'espectro',
  nazgul_alado_lider: 'espectro',
  guardian_torre: 'mordor',
  oriental: 'humano',
  fuego_montana: 'naturaleza',
  black_serpent: 'humano',
  manada_huargos: 'bestia',
};

const ENEMY_DEFS: Record<EnemyId, Omit<Enemy, 'enemyType'>> = {
  // ============================================================
  // Bosque Viejo
  // ============================================================
  conejo: {
    id: 'conejo',
    name: 'Conejo Salvaje',
    hp: 25,
    gold: 6,
    xp: 4,
    sprite: '/enemies/green-frog.gif',
  },
  ciervo: {
    id: 'ciervo',
    name: 'Ciervo',
    hp: 60,
    gold: 14,
    xp: 9,
    sprite: '/enemies/crazy-cat.gif',
  },
  espectro_bosque: {
    id: 'espectro_bosque',
    name: 'Espectro del Bosque',
    hp: 240,
    gold: 60,
    xp: 40,
    sprite: '/enemies/nazgul.gif',
  },
  nazgul_jinete: {
    id: 'nazgul_jinete',
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
  bandido: {
    id: 'bandido',
    name: 'Bandido',
    hp: 85,
    gold: 20,
    xp: 13,
    sprite: '/enemies/wolf-gif.gif',
  },
  lobo_alfa: {
    id: 'lobo_alfa',
    name: 'Lobo Alfa',
    hp: 180,
    gold: 45,
    xp: 30,
    sprite: '/enemies/wolf-gif.gif',
  },
  khamul: {
    id: 'khamul',
    name: 'Khamûl, el del Este',
    hp: 520,
    gold: 135,
    xp: 90,
    sprite: '/enemies/wolf-gif.gif',
  },
  rey_brujo_amon: {
    id: 'rey_brujo_amon',
    name: 'Rey Brujo · Forma de Sombra',
    hp: 1400,
    gold: 360,
    xp: 230,
    isBoss: true,
    sprite: '/enemies/uruk-berserker.png',
  },

  // ============================================================
  // Caradhras
  // ============================================================
  lobo_montana: {
    id: 'lobo_montana',
    name: 'Lobo de Montaña',
    hp: 160,
    gold: 35,
    xp: 22,
    sprite: '/enemies/ice-camaleon.gif',
  },
  oso_polar: {
    id: 'oso_polar',
    name: 'Oso Polar',
    hp: 280,
    gold: 55,
    xp: 35,
    sprite: '/enemies/golem.gif',
  },
  aguila: {
    id: 'aguila',
    name: 'Águila Salvaje',
    hp: 140,
    gold: 32,
    xp: 21,
    sprite: '/enemies/golem.gif',
  },
  bandada_crebain: {
    id: 'bandada_crebain',
    name: 'Bandada de Crebain',
    hp: 600,
    gold: 150,
    xp: 95,
    sprite: '/enemies/uruk-berserker.png',
  },
  tormenta_caradhras: {
    id: 'tormenta_caradhras',
    name: 'Tormenta de Caradhras',
    hp: 1000,
    gold: 250,
    xp: 165,
    isBoss: true,
    sprite: '/enemies/uruk-berserker.png',
  },

  // ============================================================
  // Moria (Tumba de Balin / Puente de Khazad-dûm)
  // ============================================================
  orco_moria: {
    id: 'orco_moria',
    name: 'Orco',
    hp: 95,
    gold: 22,
    xp: 15,
    sprite: '/enemies/orc-classic.gif',
  },
  orco_arquero_moria: {
    id: 'orco_arquero_moria',
    name: 'Orco Arquero',
    hp: 75,
    gold: 18,
    xp: 12,
    sprite: '/enemies/orc-classic.gif',
  },
  orco_mayor: {
    id: 'orco_mayor',
    name: 'Orco Mayor',
    hp: 380,
    gold: 95,
    xp: 60,
    sprite: '/enemies/orc-classic.gif',
  },
  troll_caverna: {
    id: 'troll_caverna',
    name: 'Troll de Caverna',
    hp: 700,
    gold: 170,
    xp: 110,
    sprite: '/enemies/orc-berserker.gif',
  },
  balrog: {
    id: 'balrog',
    name: 'Balrog de Morgoth',
    hp: 4500,
    gold: 1050,
    xp: 680,
    isBoss: true,
    sprite: '/enemies/orc-berserker.gif',
  },

  // ============================================================
  // Río Anduin
  // ============================================================
  piranas_anduin: {
    id: 'piranas_anduin',
    name: 'Pirañas del Anduin',
    hp: 130,
    gold: 30,
    xp: 18,
    sprite: '/enemies/fire-fish.gif',
  },
  pez_maligno: {
    id: 'pez_maligno',
    name: 'Pez Maligno',
    hp: 180,
    gold: 38,
    xp: 24,
    sprite: '/enemies/red-octopus.gif',
  },
  serpiente_agua: {
    id: 'serpiente_agua',
    name: 'Serpiente de Agua',
    hp: 165,
    gold: 36,
    xp: 22,
    sprite: '/enemies/elemental-agua.gif',
  },
  kraken_anduin: {
    id: 'kraken_anduin',
    name: 'Kraken del Anduin',
    hp: 1250,
    gold: 305,
    xp: 195,
    sprite: '/enemies/pulpo.gif',
  },
  hydra: {
    id: 'hydra',
    name: 'Hydra del Anduin',
    hp: 1500,
    gold: 360,
    xp: 230,
    isBoss: true,
    sprite: '/enemies/hydra.gif',
  },

  // ============================================================
  // Amon Hen
  // ============================================================
  urukhai: {
    id: 'urukhai',
    name: 'Uruk-hai',
    hp: 210,
    gold: 45,
    xp: 28,
    sprite: '/enemies/urukhai.png',
  },
  urukhai_frenetico: {
    id: 'urukhai_frenetico',
    name: 'Uruk-hai Frenético',
    hp: 310,
    gold: 68,
    xp: 42,
    sprite: '/enemies/urukhai.png',
  },
  capitan_amon: {
    id: 'capitan_amon',
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
  orco_isengard: {
    id: 'orco_isengard',
    name: 'Orco de Isengard',
    hp: 165,
    gold: 38,
    xp: 24,
    sprite: '/enemies/urukhai.png',
  },
  lobo_mayor: {
    id: 'lobo_mayor',
    name: 'Lobo Mayor de Fangorn',
    hp: 560,
    gold: 140,
    xp: 92,
    sprite: '/enemies/uruk-berserker.png',
  },
  urukhai_cazador: {
    id: 'urukhai_cazador',
    name: 'Uruk-hai Cazador',
    hp: 1600,
    gold: 390,
    xp: 250,
    isBoss: true,
    sprite: '/enemies/uruk-berserker.png',
  },

  // ============================================================
  // Camino al Abismo de Helm
  // ============================================================
  jinete_huargo: {
    id: 'jinete_huargo',
    name: 'Jinete de Huargo',
    hp: 280,
    gold: 62,
    xp: 38,
    sprite: '/enemies/urukhai.png',
  },
  huargo_alfa: {
    id: 'huargo_alfa',
    name: 'Huargo Alfa',
    hp: 620,
    gold: 155,
    xp: 100,
    sprite: '/enemies/uruk-berserker.png',
  },
  sharku: {
    id: 'sharku',
    name: 'Sharku, Líder de Huargos',
    hp: 1700,
    gold: 410,
    xp: 270,
    isBoss: true,
    sprite: '/enemies/uruk-berserker.png',
  },

  // ============================================================
  // Abismo de Helm
  // ============================================================
  orco_escalador: {
    id: 'orco_escalador',
    name: 'Orco Escalador',
    hp: 195,
    gold: 44,
    xp: 27,
    sprite: '/enemies/urukhai.png',
  },
  capitan_uruk: {
    id: 'capitan_uruk',
    name: 'Capitán Uruk-hai del Abismo',
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
  urukhai_elite: {
    id: 'urukhai_elite',
    name: 'Uruk-hai Élite',
    hp: 380,
    gold: 82,
    xp: 52,
    sprite: '/enemies/urukhai.png',
  },
  lengua_serpiente: {
    id: 'lengua_serpiente',
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
  guerrero_muerto: {
    id: 'guerrero_muerto',
    name: 'Guerrero del Sagrario',
    hp: 580,
    gold: 130,
    xp: 80,
    sprite: '/enemies/urukhai.png',
  },
  espectro_juramentado: {
    id: 'espectro_juramentado',
    name: 'Espectro Juramentado',
    hp: 360,
    gold: 78,
    xp: 50,
    sprite: '/enemies/urukhai.png',
  },
  heraldo_muertos: {
    id: 'heraldo_muertos',
    name: 'Heraldo de los Muertos',
    hp: 1080,
    gold: 265,
    xp: 175,
    sprite: '/enemies/uruk-berserker.png',
  },
  rey_muerto: {
    id: 'rey_muerto',
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
  corsario: {
    id: 'corsario',
    name: 'Corsario de Umbar',
    hp: 330,
    gold: 75,
    xp: 48,
    sprite: '/enemies/urukhai.png',
  },
  esclavista: {
    id: 'esclavista',
    name: 'Esclavista de Umbar',
    hp: 390,
    gold: 88,
    xp: 56,
    sprite: '/enemies/urukhai.png',
  },
  maestre_corsario: {
    id: 'maestre_corsario',
    name: 'Maestre Corsario',
    hp: 980,
    gold: 245,
    xp: 160,
    sprite: '/enemies/uruk-berserker.png',
  },
  capitan_corsario: {
    id: 'capitan_corsario',
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
  orco_mordor: {
    id: 'orco_mordor',
    name: 'Orco de Mordor',
    hp: 280,
    gold: 65,
    xp: 40,
    sprite: '/enemies/urukhai.png',
  },
  orco_arquero_mordor: {
    id: 'orco_arquero_mordor',
    name: 'Orco Arquero de Mordor',
    hp: 240,
    gold: 56,
    xp: 35,
    sprite: '/enemies/urukhai.png',
  },
  capitan_orco: {
    id: 'capitan_orco',
    name: 'Capitán Orco',
    hp: 880,
    gold: 220,
    xp: 145,
    sprite: '/enemies/uruk-berserker.png',
  },
  nazgul_alado: {
    id: 'nazgul_alado',
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
  troll_batalla: {
    id: 'troll_batalla',
    name: 'Troll de Batalla',
    hp: 920,
    gold: 195,
    xp: 115,
    sprite: '/enemies/urukhai.png',
  },
  troll_caverna_armadura: {
    id: 'troll_caverna_armadura',
    name: 'Troll con Armadura',
    hp: 1620,
    gold: 390,
    xp: 260,
    sprite: '/enemies/uruk-berserker.png',
  },
  ariete_lobo: {
    id: 'ariete_lobo',
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
  haradrim_explorador: {
    id: 'haradrim_explorador',
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
  rey_brujo: {
    id: 'rey_brujo',
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
  orco_morgul: {
    id: 'orco_morgul',
    name: 'Orco de Morgul',
    hp: 480,
    gold: 105,
    xp: 68,
    sprite: '/enemies/urukhai.png',
  },
  orco_arquero_morgul: {
    id: 'orco_arquero_morgul',
    name: 'Orco Arquero de Morgul',
    hp: 430,
    gold: 95,
    xp: 62,
    sprite: '/enemies/urukhai.png',
  },
  dragon_nazgul: {
    id: 'dragon_nazgul',
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
  arana_pequena: {
    id: 'arana_pequena',
    name: 'Araña Pequeña',
    hp: 320,
    gold: 75,
    xp: 48,
    sprite: '/enemies/urukhai.png',
  },
  telarana: {
    id: 'telarana',
    name: 'Telaraña',
    hp: 380,
    gold: 80,
    xp: 52,
    sprite: '/enemies/urukhai.png',
  },
  arana_grande: {
    id: 'arana_grande',
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
  troll_mordor: {
    id: 'troll_mordor',
    name: 'Troll de Mordor',
    hp: 1100,
    gold: 240,
    xp: 145,
    sprite: '/enemies/urukhai.png',
  },
  orco_caverna_armadura: {
    id: 'orco_caverna_armadura',
    name: 'Orco de Caverna con Armadura',
    hp: 1620,
    gold: 390,
    xp: 260,
    sprite: '/enemies/uruk-berserker.png',
  },
  boca_de_sauron: {
    id: 'boca_de_sauron',
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
  orco_elite: {
    id: 'orco_elite',
    name: 'Orco Élite de Mordor',
    hp: 520,
    gold: 115,
    xp: 72,
    sprite: '/enemies/urukhai.png',
  },
  troll_elite_mordor: {
    id: 'troll_elite_mordor',
    name: 'Troll Élite de Mordor',
    hp: 1400,
    gold: 310,
    xp: 190,
    sprite: '/enemies/urukhai.png',
  },
  ojo_de_sauron: {
    id: 'ojo_de_sauron',
    name: 'Ojo de Sauron',
    hp: 3000,
    gold: 850,
    xp: 560,
    sprite: '/enemies/uruk-berserker.png',
  },
  espiritu_de_sauron: {
    id: 'espiritu_de_sauron',
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
  gollum_final: {
    id: 'gollum_final',
    name: 'Gollum',
    hp: 1600,
    gold: 480,
    xp: 950,
    sprite: '/enemies/uruk-berserker.png',
  },
  anillo: {
    id: 'anillo',
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
  huargo: {
    id: 'huargo',
    name: 'Huargo',
    hp: 140,
    gold: 32,
    xp: 20,
    sprite: '/enemies/urukhai.png',
  },
  nazgul_explorador: {
    id: 'nazgul_explorador',
    name: 'Espectro del Anillo',
    hp: 220,
    gold: 48,
    xp: 30,
    sprite: '/enemies/urukhai.png',
  },
  avalancha: {
    id: 'avalancha',
    name: 'Avalancha',
    hp: 280,
    gold: 45,
    xp: 28,
    sprite: '/enemies/urukhai.png',
  },
  orco_nevado: {
    id: 'orco_nevado',
    name: 'Orco Nevado',
    hp: 180,
    gold: 38,
    xp: 24,
    sprite: '/enemies/urukhai.png',
  },
  bestia_anduin: {
    id: 'bestia_anduin',
    name: 'Bestia del Anduin',
    hp: 600,
    gold: 150,
    xp: 95,
    sprite: '/enemies/urukhai.png',
  },
  muerto_juramentado: {
    id: 'muerto_juramentado',
    name: 'Muerto Juramentado',
    hp: 420,
    gold: 95,
    xp: 60,
    sprite: '/enemies/urukhai.png',
  },
  nazgul_buscador: {
    id: 'nazgul_buscador',
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
  nazgul_alado_lider: {
    id: 'nazgul_alado_lider',
    name: 'Líder Nazgûl Alado',
    hp: 1320,
    gold: 320,
    xp: 215,
    sprite: '/enemies/urukhai.png',
  },
  guardian_torre: {
    id: 'guardian_torre',
    name: 'Guardián de la Torre',
    hp: 1540,
    gold: 370,
    xp: 245,
    sprite: '/enemies/urukhai.png',
  },
  oriental: {
    id: 'oriental',
    name: 'Oriental',
    hp: 380,
    gold: 88,
    xp: 55,
    sprite: '/enemies/urukhai.png',
  },
  fuego_montana: {
    id: 'fuego_montana',
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
  manada_huargos: {
    id: 'manada_huargos',
    name: 'Manada de Huargos',
    hp: 1500,
    gold: 360,
    xp: 235,
    isBoss: true,
    sprite: '/enemies/uruk-berserker.png',
  },
};

const BALANCED_ELITE_HP: Partial<Record<EnemyId, number>> = {
  espectro_bosque: 260,
  nazgul_jinete: 620,
  khamul: 720,
  rey_brujo_amon: 1500,
  bandada_crebain: 720,
  tormenta_caradhras: 1450,
  orco_mayor: 640,
  troll_caverna: 1250,
  balrog: 5200,
  kraken_anduin: 1600,
  hydra: 2450,
  capitan_amon: 1550,
  lurtz: 3150,
  lobo_mayor: 1400,
  urukhai_cazador: 3000,
  huargo_alfa: 1450,
  sharku: 3200,
  capitan_uruk: 2200,
  ugthak: 4300,
  lengua_serpiente: 2500,
  saruman: 5600,
  heraldo_muertos: 2650,
  rey_muerto: 5200,
  maestre_corsario: 2500,
  capitan_corsario: 5400,
  capitan_orco: 2400,
  nazgul_alado: 5200,
  troll_caverna_armadura: 3200,
  ariete_lobo: 5800,
  mumakil: 4200,
  rey_brujo: 7800,
  dragon_nazgul: 3800,
  gothmog: 7200,
  arana_grande: 4000,
  shelob: 7600,
  gorbag: 3900,
  shagrat: 8000,
  orco_caverna_armadura: 4300,
  boca_de_sauron: 8500,
  ojo_de_sauron: 5400,
  espiritu_de_sauron: 9800,
  gollum_final: 3600,
  anillo: 12000,
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
