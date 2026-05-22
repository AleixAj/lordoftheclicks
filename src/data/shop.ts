import type { ShopItem } from '@/types/game';

export const SHOP_WEAPONS: readonly ShopItem[] = [
  { id: 'daga_elfica', name: 'Daga Élfica', dmg: 3, cost: 40, loc: 'comarca' },
  { id: 'dardo', name: 'Dardo', dmg: 8, cost: 120, loc: 'bree', desc: 'La espada de Bilbo' },
  { id: 'glamdring', name: 'Glamdring', dmg: 18, cost: 450, loc: 'rivendel', desc: 'Martillo de Enemigos' },
  { id: 'anduril', name: 'Andúril', dmg: 28, cost: 950, loc: 'rivendel', desc: 'La Llama del Oeste' },
  { id: 'arco_galad', name: 'Arco Galadhrim', dmg: 22, cost: 780, loc: 'lothlorien' },
  { id: 'hacha_gimli', name: 'Hacha de Gimli', dmg: 25, cost: 850, loc: 'moria' },
  { id: 'herugrim', name: 'Herugrim', dmg: 32, cost: 1350, loc: 'edoras', desc: 'Espada de Théoden' },
  { id: 'narsil', name: 'Narsil Reforjada', dmg: 48, cost: 2800, loc: 'minas_tirith' },
  { id: 'sting', name: 'Sting', dmg: 40, cost: 2200, loc: 'monte_destino', desc: 'La daga que brilla cerca de orcos' },
];

export const SHOP_ARMOR: readonly ShopItem[] = [
  { id: 'capa_elfica', name: 'Capa Élfica', def: 4, cost: 65, loc: 'lothlorien' },
  {
    id: 'mithril_coat',
    name: 'Cota de Mithril',
    def: 18,
    cost: 1450,
    loc: 'moria',
    desc: 'Ligera como pluma, dura como escama de dragón',
  },
  { id: 'armadura_rohan', name: 'Armadura de Rohan', def: 12, cost: 920, loc: 'edoras' },
  { id: 'armadura_gondor', name: 'Armadura de Gondor', def: 15, cost: 1250, loc: 'minas_tirith' },
  { id: 'armadura_negra', name: 'Armadura de los Muertos', def: 24, cost: 3200, loc: 'minas_morgul' },
];

export const SHOP_ACCESS: readonly ShopItem[] = [
  { id: 'phial', name: 'Luz de Galadriel', bonus: 8, cost: 380, loc: 'lothlorien', desc: 'Luz en la oscuridad' },
  { id: 'evenstar', name: 'Estrella de la Tarde', bonus: 12, cost: 950, loc: 'rivendel' },
  { id: 'palantir', name: 'Palantír', bonus: 18, cost: 2100, loc: 'isengard' },
  { id: 'lembas', name: 'Lembas', bonus: 15, cost: 1350, loc: 'lothlorien', desc: 'Pan élfico que restaura energía' },
];
