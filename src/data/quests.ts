import type { Quest } from '@/types/game';

/**
 * `reach` quests are picked up at the PREVIOUS zone (`pickupLoc`) so the
 * "!" badge serves as an in-world hint: "next, head to X". The objective
 * (`loc`) is the actual destination and is auto-credited the moment the
 * player unlocks it.
 *
 * `kills_at` and `boss` quests default `pickupLoc` to `loc` (the same zone
 * where the objective is performed).
 */
export const QUESTS: readonly Quest[] = [
  {
    id: 'q1',
    name: 'Dejar la Comarca',
    desc: 'Adéntrate en el Bosque Viejo',
    type: 'reach',
    loc: 'bosque_viejo',
    pickupLoc: 'comarca',
    need: 1,
    reward: { gold: 80 },
  },
  {
    id: 'q2',
    name: 'El Bosque Embrujado',
    desc: 'Elimina 35 enemigos en el Bosque Viejo',
    type: 'kills_at',
    loc: 'bosque_viejo',
    need: 35,
    reward: { gold: 120 },
  },
  {
    id: 'q3',
    name: 'El Pony Pisador',
    desc: 'Llega a Bree y conoce a Trancos',
    type: 'reach',
    loc: 'bree',
    pickupLoc: 'bosque_viejo',
    need: 1,
    reward: { gold: 220 },
  },
  {
    id: 'q4',
    name: 'Huir de los Espectros',
    desc: 'Alcanza Rivendel',
    type: 'reach',
    loc: 'rivendel',
    pickupLoc: 'cima_vientos',
    need: 1,
    reward: { gold: 350 },
  },
  {
    id: 'q5',
    name: 'Las Minas Oscuras',
    desc: 'Elimina 150 enemigos en la Tumba de Balin',
    type: 'kills_at',
    loc: 'moria_balin',
    need: 150,
    reward: { gold: 650 },
  },
  {
    id: 'q6',
    name: 'La Caída de Lurtz',
    desc: 'Derrota a Lurtz en Amon Hen',
    type: 'boss',
    loc: 'amon_hen',
    need: 1,
    reward: { gold: 420 },
  },
  {
    id: 'q7',
    name: 'El Bosque de los Ents',
    desc: 'Recluta a Bárbol en Fangorn',
    type: 'reach',
    loc: 'fangorn',
    pickupLoc: 'amon_hen',
    need: 1,
    reward: { gold: 480 },
  },
  {
    id: 'q8',
    name: 'Batalla del Abismo',
    desc: 'Elimina 220 enemigos en el Abismo',
    type: 'kills_at',
    loc: 'abismo_helm',
    need: 220,
    reward: { gold: 950 },
  },
  {
    id: 'q9',
    name: 'El Juramento Roto',
    desc: 'Derrota al Rey de los Muertos',
    type: 'boss',
    loc: 'paso_de_los_muertos',
    need: 1,
    reward: { gold: 1100 },
  },
  {
    id: 'q10',
    name: 'La Torre Blanca',
    desc: 'Alcanza Minas Tirith',
    type: 'reach',
    loc: 'minas_tirith',
    pickupLoc: 'pelennor',
    need: 1,
    reward: { gold: 1200 },
  },
  {
    id: 'q11',
    name: 'Campos de Gloria',
    desc: 'Derrota al Rey Brujo en Pelennor',
    type: 'boss',
    loc: 'pelennor',
    need: 1,
    reward: { gold: 1800 },
  },
  {
    id: 'q12',
    name: 'Destruir el Anillo',
    desc: 'Alcanza el Monte del Destino',
    type: 'reach',
    loc: 'monte_destino',
    pickupLoc: 'gorgoroth',
    need: 1,
    reward: { gold: 5000 },
  },
];
