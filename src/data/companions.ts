import type { Companion } from '@/types/game';

/**
 * Companions follow the Peter Jackson trilogy.
 * Most unlock at `isRest: true` locations — those are the safe stops where
 * allies join the Fellowship. Bárbol is the only exception: he is bound to
 * Fangorn (combat) since there is no other lore-faithful place for him.
 */
export const COMPANIONS: readonly Companion[] = [
  { id: 'frodo', name: 'Frodo', title: 'Portador del Anillo', baseDps: 1.8, unlockAt: 'comarca', color: '#5b8abf' },
  { id: 'sam', name: 'Sam', title: 'El Valiente', baseDps: 2.2, unlockAt: 'comarca', color: '#6b9a4a' },
  { id: 'merry', name: 'Merry', title: 'Caballero de Rohan', baseDps: 1.6, unlockAt: 'comarca', color: '#b8963a' },
  { id: 'pippin', name: 'Pippin', title: 'Guardia de la Ciudadela', baseDps: 1.6, unlockAt: 'comarca', color: '#c9843a' },
  { id: 'aragorn', name: 'Aragorn', title: 'Trancos', baseDps: 8, unlockAt: 'bree', color: '#5a7a5a' },
  { id: 'gandalf', name: 'Gandalf', title: 'El Gris', baseDps: 9, unlockAt: 'rivendel', color: '#9a9aaa' },
  { id: 'arwen', name: 'Arwen', title: 'Estrella de la Tarde', baseDps: 7, unlockAt: 'rivendel', color: '#c8d8e8' },
  { id: 'legolas', name: 'Legolas', title: 'Príncipe del Bosque Negro', baseDps: 7.5, unlockAt: 'rivendel', color: '#7ab89a' },
  { id: 'gimli', name: 'Gimli', title: 'Hijo de Glóin', baseDps: 7.8, unlockAt: 'rivendel', color: '#a86a3a' },
  { id: 'boromir', name: 'Boromir', title: 'Capitán de Gondor', baseDps: 8.2, unlockAt: 'rivendel', color: '#8a8a9a' },
  { id: 'galadriel', name: 'Galadriel', title: 'Dama de Lórien', baseDps: 14, unlockAt: 'lothlorien', color: '#c8b8e0' },
  { id: 'barbol', name: 'Bárbol', title: 'Pastor de Árboles', baseDps: 10, unlockAt: 'fangorn', color: '#5a7040' },
  { id: 'theoden', name: 'Théoden', title: 'Rey de Rohan', baseDps: 11, unlockAt: 'edoras', color: '#c4a040' },
  { id: 'eomer', name: 'Éomer', title: 'Mariscal de la Marca', baseDps: 13, unlockAt: 'edoras', color: '#a08830' },
  { id: 'eowyn', name: 'Éowyn', title: 'Dama de Rohan', baseDps: 14, unlockAt: 'edoras', color: '#d4b870' },
  { id: 'gandalf_blanco', name: 'Gandalf', title: 'El Blanco', baseDps: 16, unlockAt: 'edoras', color: '#f0f0f0' },
  { id: 'faramir', name: 'Faramir', title: 'Capitán de Ithilien', baseDps: 12, unlockAt: 'ithilien', color: '#7080a0' },
  { id: 'rey_aragorn', name: 'Aragorn', title: 'Rey de Gondor', baseDps: 15, unlockAt: 'minas_tirith', color: '#5a7a5a' },
];
