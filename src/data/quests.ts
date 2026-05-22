import type { Quest } from '@/types/game';

export const QUESTS: readonly Quest[] = [
  { id: 'q1', name: 'Dejar la Comarca', desc: 'Adéntrate en el Bosque Viejo', type: 'reach', loc: 'bosque_viejo', need: 1, reward: { gold: 80, mithril: 3 } },
  { id: 'q2', name: 'El Bosque Embrujado', desc: 'Elimina 35 enemigos en el Bosque Viejo', type: 'kills_at', loc: 'bosque_viejo', need: 35, reward: { gold: 120 } },
  { id: 'q3', name: 'El Pony Pisador', desc: 'Llega a Bree y conoce a Trancos', type: 'reach', loc: 'bree', need: 1, reward: { gold: 220 } },
  { id: 'q4', name: 'Huir de los Espectros', desc: 'Alcanza Rivendel', type: 'reach', loc: 'rivendel', need: 1, reward: { gold: 350, mithril: 15 } },
  { id: 'q5', name: 'Las Minas Oscuras', desc: 'Elimina 150 enemigos en Moria', type: 'kills_at', loc: 'moria', need: 150, reward: { gold: 650, mithril: 35 } },
  { id: 'q6', name: 'La Caída de Lurtz', desc: 'Derrota a Lurtz en Amon Hen', type: 'boss', loc: 'amon_hen', need: 1, reward: { gold: 420, mithril: 22 } },
  { id: 'q7', name: 'El Bosque de los Ents', desc: 'Recluta a Bárbol en Fangorn', type: 'reach', loc: 'fangorn', need: 1, reward: { gold: 480 } },
  { id: 'q8', name: 'Batalla del Abismo', desc: 'Elimina 220 enemigos en el Abismo', type: 'kills_at', loc: 'abismo_helm', need: 220, reward: { gold: 950, mithril: 45 } },
  { id: 'q9', name: 'El Juramento Roto', desc: 'Derrota al Rey de los Muertos', type: 'boss', loc: 'paso_de_los_muertos', need: 1, reward: { gold: 1100, mithril: 55 } },
  { id: 'q10', name: 'La Torre Blanca', desc: 'Alcanza Minas Tirith', type: 'reach', loc: 'minas_tirith', need: 1, reward: { gold: 1200, mithril: 60 } },
  { id: 'q11', name: 'Campos de Gloria', desc: 'Derrota al Rey Brujo en Pelennor', type: 'boss', loc: 'pelennor', need: 1, reward: { gold: 1800, mithril: 90 } },
  { id: 'q12', name: 'Destruir el Anillo', desc: 'Alcanza el Monte del Destino', type: 'reach', loc: 'monte_destino', need: 1, reward: { gold: 5000, mithril: 250 } },
];
