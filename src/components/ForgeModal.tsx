import { useEffect, useState } from 'react';
import { UPGRADES } from '@/data';
import { upgradeCost } from '@/engine/store';
import { upgradeEffectValue } from '@/engine/formulas';
import type { UpgradeDefinition, UpgradeId } from '@/types/game';
import styles from '@/styles/forge.module.css';

interface ForgeModalProps {
  open: boolean;
  mithril: number;
  upgrades: Record<UpgradeId, number>;
  onBuy: (upgradeId: UpgradeId) => void;
  onReset: () => void;
  onClose: () => void;
}

export function ForgeModal({ open, mithril, upgrades, onBuy, onReset, onClose }: ForgeModalProps) {
  const [selectedId, setSelectedId] = useState<UpgradeId>(UPGRADES[0]?.id ?? '');
  const [confirmReset, setConfirmReset] = useState(false);
  const selected = UPGRADES.find((upgrade) => upgrade.id === selectedId) ?? UPGRADES[0];
  const selectedRank = upgrades[selected.id] ?? 0;
  const selectedCost = upgradeCost(selected.id, selectedRank);
  const selectedLocked = isLocked(selected, upgrades);
  const selectedMaxed = selectedRank >= selected.maxRank;
  const canBuy = !selectedLocked && !selectedMaxed && mithril >= selectedCost;
  const hasAnyRank = UPGRADES.some((upgrade) => (upgrades[upgrade.id] ?? 0) > 0);
  const refundTotal = UPGRADES.reduce((sum, upgrade) => {
    const rank = upgrades[upgrade.id] ?? 0;
    let cost = 0;
    for (let r = 0; r < rank; r++) cost += upgradeCost(upgrade.id, r);
    return sum + cost;
  }, 0);

  // Esc closes the Forja. If the confirm dialog is open, Esc dismisses that
  // first so the player doesn't lose the modal entirely with one keypress.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (confirmReset) {
        setConfirmReset(false);
      } else {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, confirmReset, onClose]);

  if (!open) return null;

  const handleConfirmReset = () => {
    onReset();
    setConfirmReset(false);
  };

  return (
    <div className={styles.overlay} role="presentation">
      <button
        type="button"
        className={styles.overlayBackdrop}
        aria-label="Cerrar Forja"
        onClick={onClose}
      />
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="forge-title"
      >
        <button type="button" className={styles.close} onClick={onClose} aria-label="Cerrar Forja">
          ×
        </button>

        <header className={styles.hero}>
          <div className={styles.heroText}>
            <p className={styles.kicker}>{branchLabel(selected.branch)}</p>
            <h2 id="forge-title">{selected.name}</h2>
            <p>
              {selected.desc}
              {selectedRank > 0 && (
                <span className={styles.descTotal}>
                  {' '}
                  Total: {formatEffectTotal(selected.effect, upgrades)}
                </span>
              )}
            </p>
          </div>
          <div className={styles.summary} aria-label="Resumen de la mejora seleccionada">
            <span>
              <b>✚</b> {selectedRank}/{selected.maxRank}
            </span>
            <span>
              <b>ᛞ</b> {selectedMaxed ? 'MAX' : selectedCost.toLocaleString('es-ES')}
            </span>
            <span>
              <b>✦</b> {mithril.toLocaleString('es-ES')}
            </span>
          </div>
          {selectedLocked && (
            <div className={styles.warning}>Requiere {formatRequirements(selected, upgrades)}.</div>
          )}
          <button
            type="button"
            className={styles.buy}
            disabled={!canBuy}
            onClick={() => onBuy(selected.id)}
          >
            {selectedMaxed
              ? 'Mejora completada'
              : canBuy
                ? 'Forjar mejora'
                : 'Mithril insuficiente'}
          </button>
        </header>

        <div className={styles.tree} aria-label="Árbol de habilidades de la Forja">
          <img src="/gondor-tree.png" alt="" aria-hidden="true" className={styles.treeImage} />
          <svg
            className={styles.connections}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {UPGRADES.flatMap((upgrade) =>
              Object.entries(upgrade.requires ?? {}).map(([requiredId, requiredRank]) => {
                if (requiredRank === undefined) return null;
                const parent = UPGRADES.find((candidate) => candidate.id === requiredId);
                if (!parent) return null;
                const unlocked = (upgrades[requiredId] ?? 0) >= requiredRank;
                return (
                  <line
                    key={`${upgrade.id}-${requiredId}`}
                    x1={parent.position.x}
                    y1={parent.position.y}
                    x2={upgrade.position.x}
                    y2={upgrade.position.y}
                    className={`${styles.connectionLine} ${unlocked ? styles.connectionLineActive : ''}`}
                  />
                );
              }),
            )}
          </svg>
          {UPGRADES.map((upgrade) => {
            const rank = upgrades[upgrade.id] ?? 0;
            const locked = isLocked(upgrade, upgrades);
            const maxed = rank >= upgrade.maxRank;
            const cost = upgradeCost(upgrade.id, rank);
            const affordable = !locked && !maxed && mithril >= cost;
            return (
              <button
                key={upgrade.id}
                type="button"
                className={`${styles.node} ${styles[`branch_${upgrade.branch}`]} ${
                  selected.id === upgrade.id ? styles.nodeSelected : ''
                } ${locked ? styles.nodeLocked : ''} ${rank > 0 ? styles.nodeOwned : ''} ${
                  maxed ? styles.nodeMaxed : ''
                }`}
                style={{
                  left: `${upgrade.position.x}%`,
                  top: `${upgrade.position.y}%`,
                }}
                onClick={locked ? undefined : () => setSelectedId(upgrade.id)}
                onDoubleClick={
                  affordable
                    ? () => {
                        setSelectedId(upgrade.id);
                        onBuy(upgrade.id);
                      }
                    : undefined
                }
                disabled={locked}
                aria-pressed={selected.id === upgrade.id}
                aria-disabled={locked}
                title={
                  locked
                    ? `Bloqueado: requiere ${formatRequirements(upgrade, upgrades)}`
                    : `${upgrade.name}: rango ${rank}/${upgrade.maxRank}` +
                      (affordable ? ' (doble click para forjar)' : '')
                }
              >
                <span className={styles.nodeIcon}>{branchIcon(upgrade.branch)}</span>
                <strong>
                  {rank}/{upgrade.maxRank}
                </strong>
              </button>
            );
          })}
        </div>

        <footer className={styles.footer}>
          <button
            type="button"
            className={styles.resetBtn}
            onClick={() => hasAnyRank && setConfirmReset(true)}
            disabled={!hasAnyRank}
            title={
              hasAnyRank
                ? 'Reinicia todas las mejoras y recupera el mithril gastado'
                : 'No tienes mejoras forjadas'
            }
          >
            Reiniciar puntos
          </button>
        </footer>

        {confirmReset && (
          <div className={styles.confirmOverlay} role="presentation">
            <button
              type="button"
              className={styles.confirmBackdrop}
              aria-label="Cerrar confirmación"
              onClick={() => setConfirmReset(false)}
            />
            <div
              className={styles.confirmCard}
              role="dialog"
              aria-modal="true"
              aria-labelledby="forge-confirm-title"
            >
              <h3 id="forge-confirm-title" className={styles.confirmTitle}>
                Reiniciar la Forja
              </h3>
              <p className={styles.confirmText}>
                Vas a deshacer todas las mejoras forjadas. Recuperarás{' '}
                <strong>{refundTotal.toLocaleString('es-ES')} mithril</strong> y podrás
                redistribuirlos como prefieras.
              </p>
              <div className={styles.confirmActions}>
                <button type="button" className={styles.confirmAccept} onClick={handleConfirmReset}>
                  Reiniciar
                </button>
                <button
                  type="button"
                  className={styles.confirmCancel}
                  onClick={() => setConfirmReset(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function formatEffectTotal(
  effect: UpgradeDefinition['effect'],
  upgrades: Record<UpgradeId, number>,
): string {
  const total = upgradeEffectValue(upgrades, effect);
  switch (effect) {
    case 'click_damage_pct':
    case 'gold_pct':
    case 'xp_pct':
      return `${(total * 100).toFixed(0)}%`;
    case 'companion_cost_pct':
      return `${(total * 100).toFixed(0)}%`;
    case 'fight_time_s':
      return `+${total.toFixed(0)}s`;
    case 'companion_cap':
      return `+${total.toFixed(0)}`;
    case 'mithril_flat':
      return `+${total % 1 === 0 ? total.toFixed(0) : total.toFixed(1)}`;
    default:
      return `${total}`;
  }
}

function isLocked(upgrade: UpgradeDefinition, upgrades: Record<UpgradeId, number>) {
  return Object.entries(upgrade.requires ?? {}).some(
    ([id, rank]) => rank !== undefined && (upgrades[id] ?? 0) < rank,
  );
}

function formatRequirements(upgrade: UpgradeDefinition, upgrades: Record<UpgradeId, number>) {
  return Object.entries(upgrade.requires ?? {})
    .filter(([id, rank]) => rank !== undefined && (upgrades[id] ?? 0) < rank)
    .map(([id, rank]) => {
      const required = UPGRADES.find((candidate) => candidate.id === id);
      return `${required?.name ?? id} rango ${rank}`;
    })
    .join(', ');
}

function branchLabel(branch: UpgradeDefinition['branch']) {
  const labels: Record<UpgradeDefinition['branch'], string> = {
    core: 'Núcleo',
    damage: 'Daño',
    wealth: 'Riqueza',
    wisdom: 'Sabiduría',
    time: 'Tiempo',
    companions: 'Compañía',
    mithril: 'Mithril',
  };
  return labels[branch];
}

function branchIcon(branch: UpgradeDefinition['branch']) {
  const icons: Record<UpgradeDefinition['branch'], string> = {
    core: '✦',
    damage: '⚔',
    wealth: '✥',
    wisdom: 'ᚱ',
    time: '◷',
    companions: '♜',
    mithril: 'ᛞ',
  };
  return icons[branch];
}
