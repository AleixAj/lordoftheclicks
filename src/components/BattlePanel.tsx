import { useMemo, type CSSProperties } from 'react';
import { useGameStore } from '@/engine/store';
import { calcDps } from '@/engine/formulas';
import { COMPANIONS, ENEMIES, LOCATIONS } from '@/data';
import { Panel } from './Panel';
import styles from '@/styles/battle.module.css';

const DEFAULT_ENEMY_SPRITE = '/orc.png';

export function BattlePanel() {
  const state = useGameStore((s) => s.state);
  const dmgNums = useGameStore((s) => s.dmgNums);
  const shaking = useGameStore((s) => s.shaking);
  const deadAnim = useGameStore((s) => s.deadAnim);
  const goldBurst = useGameStore((s) => s.goldBurst);
  const clickEnemy = useGameStore((s) => s.clickEnemy);

  const loc = LOCATIONS[state.locIdx];
  const enemy = state.enemy;
  const kills = state.locKills[loc?.id ?? ''] ?? 0;
  const needed = loc?.killsNeeded ?? 0;
  const dps = useMemo(
    () => calcDps({ companions: state.companions, equipped: state.equipped }),
    [state.companions, state.equipped],
  );
  const bg = loc?.background;

  return (
    <Panel
      className="flex-1"
      title={loc?.name ?? '???'}
      headerExtra={
        <span className="text-[11px] opacity-70 font-[Crimson_Pro] normal-case tracking-normal">
          {loc?.desc}
        </span>
      }
      bodyClassName="p-0"
    >
      <div
        className={`${styles.scene} ${bg ? styles.bg : ''}`}
        style={
          bg
            ? {
                backgroundImage: `url(${bg})`,
                ...(loc?.backgroundPosition
                  ? { backgroundPosition: loc.backgroundPosition }
                  : null),
                ...(loc?.backgroundSize ? { backgroundSize: loc.backgroundSize } : null),
              }
            : undefined
        }
      >
        <div className={styles.stats}>
          <span>
            Daño click<b>{state.clickDmg}</b>
          </span>
          <span>
            DPS<b>{dps.toFixed(1)}</b>
          </span>
          {needed > 0 && (
            <span>
              Enemigos
              <b>
                {kills}/{needed}
              </b>
            </span>
          )}
        </div>

        {loc?.isRest ? (
          <div className={styles.statePanel}>
            <div className={styles.stateInner}>
              <div className={styles.stateTitle}>Refugio seguro</div>
              <div className={styles.stateDesc}>
                {(() => {
                  const unlockedHere = (loc.companions ?? [])
                    .map((id) => COMPANIONS.find((c) => c.id === id)?.name)
                    .filter(Boolean)
                    .join(', ');
                  if (unlockedHere) {
                    return `Se ha unido a la Comunidad: ${unlockedHere}. Sube de nivel a tus compañeros y equípate antes de continuar.`;
                  }
                  return 'Aprovecha para subir de nivel a la Comunidad y equiparte en la tienda.';
                })()}
              </div>
            </div>
          </div>
        ) : enemy ? (
          <div className={styles.area}>
            <div className={`${styles.name} ${enemy.isBoss ? styles.boss : ''}`}>
              {enemy.isBoss && <span className={styles.bossTag}>★ JEFE ★</span>}
              {enemy.name}
            </div>

            <button
              type="button"
              className={`${styles.frame} ${shaking ? styles.shake : ''} ${deadAnim ? styles.dead : ''}`}
              onClick={clickEnemy}
              aria-label={`Atacar a ${enemy.name}`}
            >
              {enemy.isBoss && <div className={styles.bossGlow} />}
              <img
                src={ENEMIES[enemy.id]?.sprite ?? DEFAULT_ENEMY_SPRITE}
                alt={enemy.name}
                className={styles.sprite}
                draggable={false}
              />
              {dmgNums.map((d) => (
                <div
                  key={d.id}
                  className={`${styles.dmgNumber} ${d.crit ? styles.crit : ''}`}
                  style={{ left: `${d.x}%`, top: `${d.y}%` }}
                >
                  {d.crit ? '¡' : ''}
                  {Math.round(d.value)}
                  {d.crit ? '!' : ''}
                </div>
              ))}
              {goldBurst && (
                <div className={styles.goldBurst} aria-hidden="true">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className={styles.goldParticle}
                      style={
                        {
                          '--angle': `${i * 45}deg`,
                          '--dist': `${60 + Math.random() * 40}px`,
                          animationDelay: `${Math.random() * 0.1}s`,
                        } as CSSProperties
                      }
                    />
                  ))}
                </div>
              )}
            </button>

            <div className={styles.hpBar}>
              <div
                className={styles.hpFill}
                style={{ width: `${Math.max(0, (enemy.hp / enemy.maxHp) * 100)}%` }}
              />
              <div className={styles.hpText}>
                {Math.max(0, Math.ceil(enemy.hp))} / {enemy.maxHp}
              </div>
            </div>

            <div className={styles.hint}>¡Haz click para atacar!</div>
          </div>
        ) : (
          <div className={styles.statePanel}>
            <div className={styles.stateInner}>
              <div className={styles.stateTitle}>Zona despejada</div>
              <div className={styles.stateDesc}>
                Has limpiado {loc?.name ?? 'la zona'}. Avanza al siguiente punto en el mapa.
              </div>
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
}
