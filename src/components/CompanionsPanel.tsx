import type { CSSProperties } from 'react';
import { COMPANIONS, LOCATIONS } from '@/data';
import { companionLevelCapForLocation } from '@/engine/progression';
import { companionUpgradeCost, useGameStore } from '@/engine/store';
import styles from '@/styles/panel.module.css';
import type { Companion } from '@/types/game';
import { Panel } from './Panel';

function portraitVars(c: Companion): CSSProperties | undefined {
  const f = c.portraitFocus;
  if (!f) return undefined;
  return {
    '--portrait-x': f.x !== undefined ? `${f.x}%` : undefined,
    '--portrait-y': f.y !== undefined ? `${f.y}%` : undefined,
    '--portrait-scale': f.scale !== undefined ? `${f.scale}` : undefined,
  } as CSSProperties;
}

export function CompanionsPanel() {
  const state = useGameStore((s) => s.state);
  const levelUp = useGameStore((s) => s.levelUpCompanion);

  const unlocked = COMPANIONS.filter((c) => state.companions[c.id]?.unlocked);
  const locked = COMPANIONS.filter((c) => !state.companions[c.id]?.unlocked);
  const levelCap = companionLevelCapForLocation(state.locIdx);

  return (
    <Panel
      className="flex-1"
      title="Reclutados"
      headerExtra={
        <span className={`${styles.rewardBadge} normal-case tracking-normal`}>
          {unlocked.length}/{COMPANIONS.length}
        </span>
      }
      bodyClassName={`${styles.scrollBody} ${styles.scrollBodyTight}`}
    >
      {unlocked.map((c) => {
        const cs = state.companions[c.id];
        const cost = companionUpgradeCost(cs.level);
        const atCap = cs.level >= levelCap;
        const canUpgrade = !atCap && state.gold >= cost;
        const dps = (c.baseDps * cs.level).toFixed(1);
        return (
          <div key={c.id} className={`${styles.card} ${styles.cardCompact}`}>
            <div className={`${styles.avatar} ${styles.avatarSm}`} style={{ background: c.color }}>
              {c.portrait ? (
                <img
                  src={c.portrait}
                  alt=""
                  aria-hidden="true"
                  className={styles.avatarImg}
                  style={portraitVars(c)}
                  draggable={false}
                />
              ) : (
                c.name[0]
              )}
            </div>
            <div className={styles.content}>
              <div className={styles.titleRow}>
                <div className={styles.itemName}>{c.name}</div>
                <span className={styles.levelBadge}>Nv. {cs.level}</span>
              </div>
              <div className={styles.meta}>{c.title}</div>
            </div>
            <div className={styles.actionGroup}>
              <span className={styles.infoChip} title="Daño por segundo">
                <span className={styles.infoChipLabel}>DPS</span>
                {dps}
              </span>
              <button
                type="button"
                className={`${styles.button} ${!canUpgrade ? styles.buttonDisabled : ''}`}
                onClick={() => canUpgrade && levelUp(c.id)}
                disabled={!canUpgrade}
                title={
                  atCap
                    ? `Cap actual: nivel ${levelCap}. Avanza en la aventura para entrenar más.`
                    : `Subir nivel: ${cost} oro`
                }
              >
                {atCap ? 'MAX' : `↑ ${cost}g`}
              </button>
            </div>
          </div>
        );
      })}
      {locked.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Por encontrar</div>
          {locked.map((c) => {
            const where = LOCATIONS.find((l) => l.id === c.unlockAt);
            return (
              <div
                key={c.id}
                className={`${styles.card} ${styles.cardCompact} ${styles.cardMuted}`}
              >
                <div className={`${styles.avatar} ${styles.avatarSm} ${styles.avatarLocked}`}>
                  ?
                </div>
                <div className={styles.content}>
                  <div className={styles.itemName}>Compañero desconocido</div>
                  <div className={`${styles.meta} ${styles.muted}`}>
                    Se une en {where?.name ?? 'un lugar por descubrir'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}
