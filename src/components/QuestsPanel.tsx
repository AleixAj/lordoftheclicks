import { QUESTS } from '@/data';
import { useGameStore } from '@/engine/store';
import styles from '@/styles/panel.module.css';
import { Panel } from './Panel';

export function QuestsPanel() {
  const state = useGameStore((s) => s.state);
  const claim = useGameStore((s) => s.claimQuest);

  const active = QUESTS.filter(
    (q) => state.questsAccepted.includes(q.id) && !state.questsDone.includes(q.id),
  );
  const done = QUESTS.filter((q) => state.questsDone.includes(q.id));

  return (
    <Panel
      className="flex-1"
      title="Misiones"
      headerExtra={
        <span className={`${styles.rewardBadge} normal-case tracking-normal`}>
          {done.length}/{QUESTS.length}
        </span>
      }
      bodyClassName={styles.scrollBody}
    >
      {active.length === 0 && (
        <div className={styles.emptyState}>
          Visita las zonas en el mapa y pulsa la <span className="font-bold text-[#8a5b12]">¡</span>{' '}
          amarilla para aceptar sus misiones.
        </div>
      )}

      {active.map((q) => {
        const prog = state.questProgress[q.id] ?? 0;
        const pct = Math.min(100, (prog / q.need) * 100);
        const complete = prog >= q.need;
        const reachOk = q.type === 'reach' && state.unlockedLocs.includes(q.loc);
        const actualComplete = complete || reachOk;
        const actualPct = actualComplete ? 100 : pct;

        return (
          <div
            key={q.id}
            className={`${styles.card} ${styles.cardStack} ${actualComplete ? styles.cardComplete : ''}`}
          >
            <div className="flex items-start gap-2">
              <div className={styles.content}>
                <div className={styles.itemName}>{q.name}</div>
                <div className={styles.meta}>{q.desc}</div>
              </div>
              <div className="flex flex-col items-end gap-0.5 shrink-0">
                <div className={styles.rewardBadge}>
                  {q.reward.gold ? (
                    <span className={styles.goldText}>+{q.reward.gold}g</span>
                  ) : null}
                  {q.reward.gold && q.reward.mithril ? ' ' : null}
                  {q.reward.mithril ? (
                    <span className={styles.mithrilText}>+{q.reward.mithril}m</span>
                  ) : null}
                </div>
                {actualComplete && !state.questsDone.includes(q.id) && (
                  <button type="button" className={styles.button} onClick={() => claim(q.id)}>
                    Reclamar
                  </button>
                )}
              </div>
            </div>
            <div className={styles.progress}>
              <div
                className={styles.progressFill}
                style={{
                  width: `${actualPct}%`,
                  background: actualComplete ? '#3a7a3a' : '#6a80a8',
                }}
              />
              <div className={styles.progressText}>
                {actualComplete ? '¡Completada!' : `${Math.floor(prog)}/${q.need}`}
              </div>
            </div>
          </div>
        );
      })}
      {done.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Completadas</div>
          {done.map((q) => (
            <div key={q.id} className={`${styles.card} ${styles.cardMuted}`}>
              <span className={styles.statusBadge}>Hecha</span>
              <span className={`${styles.meta} line-through`}>{q.name}</span>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
