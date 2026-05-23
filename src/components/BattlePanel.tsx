import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useGameStore } from '@/engine/store';
import { calcActiveEnemyTypeBonusPct, calcDps } from '@/engine/formulas';
import {
  bossKillThreshold,
  fightTimeLimitForFight,
  semiBossKillThreshold,
} from '@/engine/progression';
import {
  COMPANIONS,
  ENEMIES,
  LOCATIONS,
  QUESTS,
  SHOP_ACCESS,
  SHOP_ARMOR,
  SHOP_WEAPONS,
} from '@/data';
import { Panel } from './Panel';
import styles from '@/styles/battle.module.css';
import panelStyles from '@/styles/panel.module.css';
import {
  ENEMY_TYPE_LABELS,
  ENEMY_TYPE_COLORS,
  SLOT_ICONS,
  SLOT_LABELS,
  STAT_LABELS,
  formatArmorStatLine,
} from '@/lib/equipmentText';
import type {
  Companion,
  CompanionState,
  EquipSlot,
  EquippedItems,
  ItemId,
  ShopItem,
} from '@/types/game';
import { BonusVsChips } from './BonusVsChips';

const DEFAULT_ENEMY_SPRITE = '/orc.png';
const DEFAULT_COMPANION_PORTRAIT = '/companions/gandalf.png';

export function BattlePanel() {
  const state = useGameStore((s) => s.state);
  const dmgNums = useGameStore((s) => s.dmgNums);
  const shaking = useGameStore((s) => s.shaking);
  const deadAnim = useGameStore((s) => s.deadAnim);
  const goldBurst = useGameStore((s) => s.goldBurst);
  const fightFailed = useGameStore((s) => s.fightFailed);
  const clickEnemy = useGameStore((s) => s.clickEnemy);
  const startBossFight = useGameStore((s) => s.startBossFight);
  const abandonBossFight = useGameStore((s) => s.abandonBossFight);
  const travelTo = useGameStore((s) => s.travelTo);
  const acceptQuests = useGameStore((s) => s.acceptQuests);

  const loc = LOCATIONS[state.locIdx];
  const enemy = state.enemy;
  const bossFight = state.bossFight;
  const kills = state.locKills[loc?.id ?? ''] ?? 0;
  const dps = useMemo(() => calcDps({ companions: state.companions }), [state.companions]);
  const activeEnemyBonusPct = enemy
    ? calcActiveEnemyTypeBonusPct(state.equipped, enemy.enemyType)
    : 0;
  const isEliteEnemy = enemy?.tier === 'boss' || enemy?.tier === 'semi';
  const hasPendingCompanionsHere = !!loc?.companions?.some((id) => !state.companions[id]?.unlocked);
  const bg = loc?.background;

  // Force a re-render every 250ms while a fight is active so the countdown bar
  // stays smooth even when DPS is 0 (which would otherwise skip state updates).
  const [, forceTick] = useState(0);
  useEffect(() => {
    if (!bossFight) return;
    const id = window.setInterval(() => forceTick((n) => n + 1), 250);
    return () => window.clearInterval(id);
  }, [bossFight]);

  // Zone view toggle: "recruit/combat" (default) vs "shop". Reset to the
  // default every time the player travels to a different zone so they don't
  // land on a stale tab from the previous location. Applies to rest stops
  // and to combat zones flagged with `hasShop` (e.g. Fangorn).
  const [restView, setRestView] = useState<'recruit' | 'shop'>('recruit');
  useEffect(() => {
    setRestView('recruit');
  }, [state.locIdx]);
  const showZoneToggle = !!(loc?.isRest || loc?.hasShop);

  // Encounter gating (only meaningful for combat zones).
  const semiUnlocked = !!loc?.semiBoss;
  const bossUnlocked = !!loc?.boss;
  const semiKillsNeeded = loc ? semiBossKillThreshold(loc) : 0;
  const bossKillsNeeded = loc ? bossKillThreshold(loc) : 0;
  const semiDone = !!(loc && state.semiBossDefeated[loc.id]);
  const bossDone = !!(loc && state.bossDefeated[loc.id]);
  // Rematches allowed: `done` is purely a visual hint (a ✓ badge), it no
  // longer disables the button. Availability is also independent from an
  // active boss fight — clicking the other tier swaps the encounter (see
  // `startBossFight` in the store).
  const semiAvailable = semiUnlocked && kills >= semiKillsNeeded;
  const bossAvailable = bossUnlocked && (!semiUnlocked || semiDone) && kills >= bossKillsNeeded;

  // Countdown computed on every render while the fight is active.
  const totalMs = bossFight ? bossFight.deadlineMs - bossFight.startedAt : 0;
  const remainingMs = bossFight ? Math.max(0, bossFight.deadlineMs - Date.now()) : 0;
  const remainingPct = totalMs > 0 ? (remainingMs / totalMs) * 100 : 0;
  const remainingSec = Math.ceil(remainingMs / 1000);
  const lowOnTime = remainingPct < 25;

  // Are there any pending quests anchored at the current zone? Drives the
  // floating "!" pickup button in the top-left corner of the scene.
  const pendingQuestsHere = useMemo(() => {
    if (!loc) return 0;
    const acc = new Set(state.questsAccepted);
    const done = new Set(state.questsDone);
    return QUESTS.filter(
      (q) => (q.pickupLoc ?? q.loc) === loc.id && !acc.has(q.id) && !done.has(q.id),
    ).length;
  }, [loc, state.questsAccepted, state.questsDone]);

  // Adjacent-zone navigation. Disabled while a boss fight is active so a
  // mis-click doesn't abandon the encounter.
  const prevIdx = state.locIdx - 1;
  const nextIdx = state.locIdx + 1;
  const prevLoc = prevIdx >= 0 ? LOCATIONS[prevIdx] : undefined;
  const nextLoc = nextIdx < LOCATIONS.length ? LOCATIONS[nextIdx] : undefined;
  const canPrev = !bossFight && !!prevLoc && state.unlockedLocs.includes(prevLoc.id);
  const canNext = !bossFight && !!nextLoc && state.unlockedLocs.includes(nextLoc.id);
  const renderEnemyTypePill = (className = '') => {
    if (!enemy || !enemy.enemyType) return null;
    const typeColors = ENEMY_TYPE_COLORS[enemy.enemyType];
    return (
      <span
        className={`${styles.enemyTypePill} ${className}`}
        style={
          {
            '--enemy-type-bg': typeColors.bg,
            '--enemy-type-border': typeColors.border,
            '--enemy-type-text': typeColors.border,
          } as CSSProperties
        }
        title={
          activeEnemyBonusPct > 0
            ? `Tu equipo le inflige +${activeEnemyBonusPct}% de daño`
            : undefined
        }
      >
        {ENEMY_TYPE_LABELS[enemy.enemyType]}
      </span>
    );
  };
  const renderHpBlock = (className = '') =>
    enemy ? (
      <div className={`${styles.hpWrap} ${className}`}>
        {!isEliteEnemy && enemy.tier === 'boss' && <div className={styles.bossTag}>★ JEFE ★</div>}
        {!isEliteEnemy && enemy.tier === 'semi' && (
          <div className={styles.semiTag}>◆ SEMI-JEFE ◆</div>
        )}

        <div className={styles.hpBar}>
          <div
            className={`${styles.hpFill} ${
              enemy.tier === 'boss'
                ? styles.hpFillBoss
                : enemy.tier === 'semi'
                  ? styles.hpFillSemi
                  : ''
            }`}
            style={{ width: `${Math.max(0, (enemy.hp / enemy.maxHp) * 100)}%` }}
          />
          <div className={styles.hpText}>
            {Math.max(0, Math.ceil(enemy.hp))} / {enemy.maxHp}
          </div>
          {bossFight && (
            <div
              className={`${styles.timerChip} ${lowOnTime ? styles.timerChipLow : ''}`}
              aria-live="polite"
              title={`Tiempo restante del ${bossFight.tier === 'boss' ? 'jefe' : 'semi-jefe'}`}
            >
              {remainingSec}s
            </div>
          )}
        </div>

        {bossFight && (
          <div
            className={`${styles.timerBar} ${lowOnTime ? styles.timerBarLow : ''}`}
            aria-hidden="true"
          >
            <div className={styles.timerFill} style={{ width: `${remainingPct}%` }} />
          </div>
        )}
      </div>
    ) : null;

  return (
    <Panel
      className="flex-1"
      title={loc?.name ?? '???'}
      headerExtra={loc?.desc ? <span className={panelStyles.headerDesc}>{loc.desc}</span> : null}
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
          {bossKillsNeeded > 0 && (
            <span>
              Enemigos
              <b>{kills}</b>
            </span>
          )}
        </div>

        <div className={styles.statsMobile} aria-label="DPS actual">
          DPS<b>{dps.toFixed(1)}</b>
        </div>

        {showZoneToggle && (
          <RestModeToggle
            current={restView}
            onChange={setRestView}
            firstLabel={loc?.isRest ? 'Reclutar' : 'Combate'}
          />
        )}

        {loc?.isRest ? (
          restView === 'recruit' ? (
            <RecruitPanel locCompanionIds={loc.companions ?? []} />
          ) : (
            <RestShopPanel locId={loc.id} />
          )
        ) : loc?.hasShop && restView === 'shop' ? (
          <RecruitPanel locCompanionIds={loc.companions ?? []} />
        ) : hasPendingCompanionsHere && !loc?.hasShop && !bossFight ? (
          <RecruitPanel locCompanionIds={loc?.companions ?? []} />
        ) : enemy ? (
          <div className={styles.area}>
            <button
              type="button"
              className={`${styles.frame} ${isEliteEnemy ? styles.eliteFrame : ''} ${shaking ? styles.shake : ''} ${deadAnim ? styles.dead : ''}`}
              onClick={clickEnemy}
              aria-label={`Atacar a ${enemy.name}`}
            >
              <img
                src={ENEMIES[enemy.id]?.sprite ?? DEFAULT_ENEMY_SPRITE}
                alt={enemy.name}
                className={`${styles.sprite} ${isEliteEnemy ? styles.eliteSprite : ''}`}
                draggable={false}
                style={(() => {
                  const tmpl = ENEMIES[enemy.id];
                  if (!tmpl?.glow) return undefined;
                  const alpha = Math.min(0.9, tmpl.glow * 0.04);
                  const rgb = tmpl.glowColor ?? '255, 255, 255';
                  return {
                    '--enemy-glow-blur': `${tmpl.glow}px`,
                    '--enemy-glow-color': `rgba(${rgb}, ${alpha.toFixed(2)})`,
                  } as CSSProperties;
                })()}
              />
              {isEliteEnemy && (
                <div className={styles.eliteOverlay} aria-hidden="true">
                  <div
                    className={`${styles.eliteTier} ${
                      enemy.tier === 'boss' ? styles.eliteTierBoss : styles.eliteTierSemi
                    }`}
                  >
                    {enemy.tier === 'boss' ? 'Jefe' : 'Semi-jefe'}
                  </div>
                  <div
                    className={`${styles.eliteName} ${
                      enemy.tier === 'boss' ? styles.boss : styles.semi
                    }`}
                  >
                    {enemy.name}
                  </div>
                  {renderEnemyTypePill(styles.eliteTypePill)}
                  {renderHpBlock(styles.eliteHpWrap)}
                </div>
              )}
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

            {!isEliteEnemy && (
              <div className={styles.name}>
                {enemy.name}
                {renderEnemyTypePill()}
              </div>
            )}

            {!isEliteEnemy && renderHpBlock()}

            {fightFailed && (
              <div className={styles.flash} role="status">
                ¡Has perdido! El {fightFailed === 'boss' ? 'jefe' : 'semi-jefe'} ha escapado.
              </div>
            )}
          </div>
        ) : loc && loc.enemies.length === 0 && (loc.semiBoss || loc.boss) ? (
          <div className={styles.statePanel}>
            <div className={styles.stateInner}>
              <div className={styles.stateTitle}>
                {loc.isFinal ? 'Asalto final' : 'Sin enemigos en el paso'}
              </div>
              <div className={styles.stateDesc}>
                {loc.isFinal
                  ? 'Solo el destino aguarda. Lanza el desafío cuando estés listo.'
                  : 'No hay tropas que enfrentar. Reta directamente al semi-jefe o al jefe.'}
              </div>
            </div>
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

        {loc && pendingQuestsHere > 0 && !bossFight && (
          <QuestPickup
            count={pendingQuestsHere}
            locName={loc.name}
            onClick={() => acceptQuests(loc.id)}
          />
        )}

        {!loc?.isRest &&
          !(loc?.hasShop && restView === 'shop') &&
          (semiUnlocked || bossUnlocked) && (
            <FloatingActions
              loc={loc}
              kills={kills}
              semiUnlocked={semiUnlocked}
              bossUnlocked={bossUnlocked}
              semiDone={semiDone}
              bossDone={bossDone}
              semiAvailable={semiAvailable}
              bossAvailable={bossAvailable}
              semiKillsNeeded={semiKillsNeeded}
              bossKillsNeeded={bossKillsNeeded}
              activeTier={bossFight?.tier ?? null}
              equipped={state.equipped}
              onStart={startBossFight}
              onAbandon={abandonBossFight}
            />
          )}

        <NavArrow
          direction="prev"
          loc={prevLoc}
          enabled={canPrev}
          inFight={!!bossFight}
          onClick={() => canPrev && travelTo(prevIdx)}
        />
        <NavArrow
          direction="next"
          loc={nextLoc}
          enabled={canNext}
          inFight={!!bossFight}
          onClick={() => canNext && travelTo(nextIdx)}
        />
      </div>
    </Panel>
  );
}

interface QuestPickupProps {
  count: number;
  locName: string;
  onClick: () => void;
}

/**
 * Top-left floating button to accept all pending quests of the current zone.
 * Visually mirrors the boss/semi pickups in the top-right corner.
 */
function QuestPickup({ count, locName, onClick }: QuestPickupProps) {
  const label =
    count === 1 ? `Aceptar misión de ${locName}` : `Aceptar ${count} misiones de ${locName}`;
  return (
    <div className={styles.questPickupWrap}>
      <button
        type="button"
        className={styles.questPickup}
        onClick={onClick}
        aria-label={label}
        title={label}
      >
        <span aria-hidden="true">!</span>
        {count > 1 && (
          <span className={styles.questPickupCount} aria-hidden="true">
            {count}
          </span>
        )}
      </button>
    </div>
  );
}

interface NavArrowProps {
  direction: 'prev' | 'next';
  loc: (typeof LOCATIONS)[number] | undefined;
  enabled: boolean;
  inFight: boolean;
  onClick: () => void;
}

interface RecruitPanelProps {
  locCompanionIds: readonly string[];
}

function RecruitPanel({ locCompanionIds }: RecruitPanelProps) {
  const gold = useGameStore((s) => s.state.gold);
  const companions = useGameStore((s) => s.state.companions);
  const bossDefeated = useGameStore((s) => s.state.bossDefeated);
  const recruitCompanion = useGameStore((s) => s.recruitCompanion);

  const roster = useMemo(
    () =>
      locCompanionIds
        .map((id) => COMPANIONS.find((c) => c.id === id))
        .filter((c): c is Companion => !!c),
    [locCompanionIds],
  );
  const rosterKey = locCompanionIds.join('-');

  if (roster.length === 0) {
    return (
      <div className={styles.statePanel}>
        <div className={styles.stateInner}>
          <div className={styles.stateTitle}>Refugio seguro</div>
          <div className={styles.stateDesc}>
            Aprovecha para subir de nivel a la Comunidad y equiparte en la tienda.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.recruitWrap}>
      <div className={styles.recruitGrid} data-count={roster.length} data-roster={rosterKey}>
        {roster.map((c) => (
          <RecruitCard
            key={c.id}
            companion={c}
            state={companions[c.id]}
            gold={gold}
            bossDefeated={bossDefeated}
            onRecruit={() => recruitCompanion(c.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface RecruitCardProps {
  companion: Companion;
  state: CompanionState | undefined;
  gold: number;
  bossDefeated: Record<string, boolean>;
  onRecruit: () => void;
}

function RecruitCard({ companion, state, gold, bossDefeated, onRecruit }: RecruitCardProps) {
  const recruited = !!state?.unlocked;
  const free = companion.recruitCost === 0;
  const canAfford = gold >= companion.recruitCost;
  const bossGate = companion.requireBossDefeated;
  const bossGateMet = !bossGate || !!bossDefeated[bossGate];
  const gatedLocName = bossGate
    ? (LOCATIONS.find((l) => l.id === bossGate)?.name ?? bossGate)
    : null;
  const canRecruit = canAfford && bossGateMet;
  const portrait = companion.portrait ?? DEFAULT_COMPANION_PORTRAIT;
  const recruitCostStr = companion.recruitCost.toLocaleString('es-ES');
  const buyLabelFull = !bossGateMet
    ? 'Vence al jefe primero'
    : free
      ? 'Reclutar · Gratis'
      : `Reclutar · ${recruitCostStr} oro`;
  const buyLabelMini = !bossGateMet ? 'Bloqueado' : free ? 'Gratis' : `${recruitCostStr} G`;
  const ariaLabel = !bossGateMet
    ? `Reclutar a ${companion.name} bloqueado: derrota antes al jefe de ${gatedLocName}`
    : `Reclutar a ${companion.name}${free ? ' gratis' : ` por ${companion.recruitCost} oro`}`;

  return (
    <div className={styles.recruitCard}>
      <div
        className={styles.recruitPortraitWrap}
        style={(() => {
          const vars: Record<string, string | number> = {};
          if (companion.portraitScale) vars['--portrait-scale'] = companion.portraitScale;
          if (companion.portraitOffsetY)
            vars['--portrait-offset-y'] = `${companion.portraitOffsetY}%`;
          if (recruited && companion.portraitGlow) {
            // Halo alpha scales linearly with blur, capped so even strong
            // glows stay readable on the card background.
            const alpha = Math.min(0.9, companion.portraitGlow * 0.04);
            const rgb = companion.portraitGlowColor ?? '255, 255, 255';
            vars['--portrait-glow-blur'] = `${companion.portraitGlow}px`;
            vars['--portrait-glow-color'] = `rgba(${rgb}, ${alpha.toFixed(2)})`;
          }
          return Object.keys(vars).length ? (vars as CSSProperties) : undefined;
        })()}
      >
        <img
          src={portrait}
          alt=""
          aria-hidden="true"
          draggable={false}
          className={`${styles.recruitPortrait} ${recruited ? styles.recruitPortraitColor : styles.recruitPortraitSilhouette}`}
        />
        <div className={styles.recruitOverlay}>
          {recruited && (
            <>
              <div className={styles.recruitName}>{companion.name}</div>
              <div className={styles.recruitTitle}>{companion.title}</div>
              <div className={styles.recruitDps}>DPS: {companion.baseDps}</div>
            </>
          )}
          {recruited ? (
            <div className={styles.recruitOwned}>
              <span data-form="full">✓ En la Comunidad</span>
              <span data-form="mini" aria-label="En la Comunidad">
                ✓
              </span>
            </div>
          ) : (
            <button
              type="button"
              className={`${styles.recruitBuy} ${!canRecruit ? styles.recruitBuyPoor : ''}`}
              onClick={onRecruit}
              disabled={!canRecruit}
              aria-label={ariaLabel}
              title={!bossGateMet ? `Derrota antes al jefe de ${gatedLocName}` : undefined}
            >
              <span data-form="full">{buyLabelFull}</span>
              <span data-form="mini">{buyLabelMini}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface RestModeToggleProps {
  current: 'recruit' | 'shop';
  onChange: (next: 'recruit' | 'shop') => void;
  /** Label for the non-shop tab. `Reclutar` in rest stops, `Combate` in combat zones with a merchant. */
  firstLabel?: string;
}

/**
 * Two-pill toggle floating in the top-left of the scene. Switches the panel
 * body between the companion/combat view and the local merchant.
 */
function RestModeToggle({ current, onChange, firstLabel = 'Reclutar' }: RestModeToggleProps) {
  return (
    <div className={styles.restToggle} role="tablist" aria-label="Modo de la zona">
      <button
        type="button"
        role="tab"
        aria-selected={current === 'recruit'}
        className={`${styles.restToggleBtn} ${current === 'recruit' ? styles.restToggleActive : ''}`}
        onClick={() => onChange('recruit')}
      >
        {firstLabel}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={current === 'shop'}
        className={`${styles.restToggleBtn} ${current === 'shop' ? styles.restToggleActive : ''}`}
        onClick={() => onChange('shop')}
      >
        Tienda
      </button>
    </div>
  );
}

type ShopItemWithSlot = ShopItem & { slot: EquipSlot };

interface RestShopPanelProps {
  locId: string;
}

/**
 * In-zone shop for rest stops. Renders cards mirroring the recruit panel
 * layout (same grid, vignette, overlay) but with item info. Each rest zone
 * only sells items whose `loc` matches the zone id.
 */
function RestShopPanel({ locId }: RestShopPanelProps) {
  const gold = useGameStore((s) => s.state.gold);
  const owned = useGameStore((s) => s.state.owned);
  const equipped = useGameStore((s) => s.state.equipped);
  const buyItem = useGameStore((s) => s.buyItem);
  const equipItem = useGameStore((s) => s.equipItem);

  const items = useMemo<ShopItemWithSlot[]>(() => {
    const all: ShopItemWithSlot[] = [
      ...SHOP_WEAPONS.map((i) => ({ ...i, slot: 'weapon' as const })),
      ...SHOP_ARMOR.map((i) => ({ ...i, slot: 'armor' as const })),
      ...SHOP_ACCESS.map((i) => ({ ...i, slot: 'accessory' as const })),
    ];
    return all.filter((i) => i.loc === locId);
  }, [locId]);

  if (items.length === 0) {
    return (
      <div className={styles.statePanel}>
        <div className={styles.stateInner}>
          <div className={styles.stateTitle}>Tienda cerrada</div>
          <div className={styles.stateDesc}>
            No hay mercader en este refugio. Explora otras zonas seguras para encontrar mercancía.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.recruitWrap}>
      <div className={styles.recruitGrid} data-count={items.length}>
        {items.map((item) => (
          <RestShopCard
            key={item.id}
            item={item}
            ownedItem={owned.includes(item.id)}
            equippedItem={equipped[item.slot] === item.id}
            gold={gold}
            onBuy={() => buyItem(item.slot, item.id as ItemId)}
            onEquip={() => equipItem(item.slot, item.id as ItemId)}
          />
        ))}
      </div>
    </div>
  );
}

interface RestShopCardProps {
  item: ShopItemWithSlot;
  ownedItem: boolean;
  equippedItem: boolean;
  gold: number;
  onBuy: () => void;
  onEquip: () => void;
}

function RestShopCard({ item, ownedItem, equippedItem, gold, onBuy, onEquip }: RestShopCardProps) {
  const afford = gold >= item.cost;
  const statLine =
    item.slot === 'armor'
      ? formatArmorStatLine(item.def)
      : `+${item.slot === 'weapon' ? item.dmg : item.bonus} ${STAT_LABELS[item.slot]}`;
  const icon = SLOT_ICONS[item.slot];
  const slotName = SLOT_LABELS[item.slot];
  const subtitle = item.desc ?? slotName;

  return (
    <div className={styles.recruitCard}>
      <div className={styles.recruitPortraitWrap}>
        <div
          className={`${styles.shopIcon} ${ownedItem ? styles.shopIconOwned : ''}`}
          aria-hidden="true"
        >
          {icon}
        </div>
        <div className={styles.recruitOverlay}>
          <div className={styles.recruitName}>{item.name}</div>
          <div className={styles.recruitTitle}>{subtitle}</div>
          <div className={styles.recruitDps}>{statLine}</div>
        </div>
      </div>
      <BonusVsChips
        item={item}
        className={styles.shopBonusChips}
        chipClassName={styles.shopBonusChip}
      />
      {ownedItem ? (
        equippedItem ? (
          <div className={styles.recruitOwned}>
            <span data-form="full">✓ Equipado</span>
            <span data-form="mini" aria-label="Equipado">
              ✓
            </span>
          </div>
        ) : (
          <button
            type="button"
            className={styles.recruitBuy}
            onClick={onEquip}
            aria-label={`Equipar ${item.name}`}
          >
            Equipar
          </button>
        )
      ) : (
        <button
          type="button"
          className={`${styles.recruitBuy} ${!afford ? styles.recruitBuyPoor : ''}`}
          onClick={onBuy}
          disabled={!afford}
          aria-label={`Comprar ${item.name} por ${item.cost} oro`}
        >
          <span data-form="full">Comprar · {item.cost.toLocaleString('es-ES')} oro</span>
          <span data-form="mini">{item.cost.toLocaleString('es-ES')} G</span>
        </button>
      )}
    </div>
  );
}

function NavArrow({ direction, loc, enabled, inFight, onClick }: NavArrowProps) {
  if (!loc) return null;
  const label = direction === 'prev' ? `Zona anterior: ${loc.name}` : `Zona siguiente: ${loc.name}`;
  const hint = !enabled
    ? inFight
      ? 'Termina el combate antes de viajar'
      : `${loc.name} aún no está desbloqueada`
    : direction === 'prev'
      ? `Volver a ${loc.name}`
      : `Avanzar a ${loc.name}`;

  return (
    <div className={`${styles.navWrap} ${styles[`nav_${direction}`]}`}>
      <button
        type="button"
        className={`${styles.navArrow} ${enabled ? '' : styles.navDisabled}`}
        onClick={onClick}
        disabled={!enabled}
        aria-label={label}
      >
        <span aria-hidden="true">{direction === 'prev' ? '‹' : '›'}</span>
      </button>
      <div className={styles.navTooltip} role="tooltip">
        {hint}
      </div>
    </div>
  );
}

interface FloatingActionsProps {
  loc: (typeof LOCATIONS)[number] | undefined;
  kills: number;
  semiUnlocked: boolean;
  bossUnlocked: boolean;
  semiDone: boolean;
  bossDone: boolean;
  semiAvailable: boolean;
  bossAvailable: boolean;
  semiKillsNeeded: number;
  bossKillsNeeded: number;
  activeTier: 'semi' | 'boss' | null;
  equipped: EquippedItems;
  onStart: (tier: 'semi' | 'boss') => void;
  onAbandon: () => void;
}

function FloatingActions({
  loc,
  kills,
  semiUnlocked,
  bossUnlocked,
  semiDone,
  bossDone,
  semiAvailable,
  bossAvailable,
  semiKillsNeeded,
  bossKillsNeeded,
  activeTier,
  equipped,
  onStart,
  onAbandon,
}: FloatingActionsProps) {
  if (!loc) return null;

  return (
    <div className={styles.actionsFloat}>
      {bossUnlocked && (
        <EncounterChip
          tier="boss"
          name={loc.boss ? (ENEMIES[loc.boss]?.name ?? 'Jefe') : 'Jefe'}
          done={bossDone}
          available={bossAvailable}
          kills={kills}
          needed={bossKillsNeeded}
          timeLimitS={fightTimeLimitForFight(loc, 'boss', equipped)}
          onClick={() => onStart('boss')}
          requireSemiFirst={semiUnlocked && !semiDone}
          isActive={activeTier === 'boss'}
          onAbandon={onAbandon}
        />
      )}
      {semiUnlocked && (
        <EncounterChip
          tier="semi"
          name={loc.semiBoss ? (ENEMIES[loc.semiBoss]?.name ?? 'Semi-jefe') : 'Semi-jefe'}
          done={semiDone}
          available={semiAvailable}
          kills={kills}
          needed={semiKillsNeeded}
          timeLimitS={fightTimeLimitForFight(loc, 'semi', equipped)}
          onClick={() => onStart('semi')}
          isActive={activeTier === 'semi'}
          onAbandon={onAbandon}
        />
      )}
    </div>
  );
}

interface EncounterChipProps {
  tier: 'semi' | 'boss';
  name: string;
  done: boolean;
  available: boolean;
  kills: number;
  needed: number;
  timeLimitS: number;
  requireSemiFirst?: boolean;
  isActive?: boolean;
  onClick: () => void;
  onAbandon: () => void;
}

function EncounterChip({
  tier,
  name,
  done,
  available,
  kills,
  needed,
  timeLimitS,
  requireSemiFirst = false,
  isActive = false,
  onClick,
  onAbandon,
}: EncounterChipProps) {
  const label = tier === 'boss' ? 'jefe' : 'semi-jefe';
  const iconSrc = tier === 'boss' ? '/boss.png' : '/semiboss.png';
  const tierClass = tier === 'boss' ? styles.encBoss : styles.encSemi;
  const stateClass = !available && !isActive ? styles.encLocked : '';

  if (isActive) {
    return (
      <div className={styles.encWrap}>
        <button
          type="button"
          className={`${styles.encChip} ${tierClass} ${styles.encActive}`}
          onClick={onAbandon}
          aria-label={`Abandonar combate contra ${label} ${name}`}
        >
          <img
            src={iconSrc}
            alt=""
            aria-hidden="true"
            className={styles.encIcon}
            draggable={false}
          />
          <span className={styles.encAbandonOverlay} aria-hidden="true">
            ✕
          </span>
        </button>
        <div className={styles.encTooltip} role="tooltip">
          <div className={styles.encTooltipTitle}>{name}</div>
          <div className={styles.encTooltipBody}>Abandonar combate</div>
        </div>
      </div>
    );
  }

  const tooltipTitle = name;
  let tooltipBody: string;
  let ariaContext: string;
  if (!available) {
    if (requireSemiFirst) {
      tooltipBody = 'Derrota antes al semi-jefe';
      ariaContext = `${label} ${name} bloqueado: derrota antes al semi-jefe`;
    } else {
      const remaining = Math.max(0, needed - kills);
      tooltipBody = `Derrota ${remaining} enemigo${remaining === 1 ? '' : 's'} más`;
      ariaContext = `${label} ${name} bloqueado: ${tooltipBody.toLowerCase()}`;
    }
  } else {
    tooltipBody = `${timeLimitS}s para vencerlo`;
    ariaContext = done
      ? `Re-desafiar al ${label} ${name}, ${timeLimitS} segundos`
      : `Desafiar al ${label} ${name}, ${timeLimitS} segundos`;
  }

  return (
    <div className={styles.encWrap}>
      <button
        type="button"
        className={`${styles.encChip} ${tierClass} ${stateClass}`}
        onClick={onClick}
        disabled={!available}
        aria-label={ariaContext}
      >
        <img src={iconSrc} alt="" aria-hidden="true" className={styles.encIcon} draggable={false} />
        {done && (
          <span className={styles.encDoneBadge} aria-hidden="true">
            ✓
          </span>
        )}
      </button>
      <div className={styles.encTooltip} role="tooltip">
        <div className={styles.encTooltipTitle}>{tooltipTitle}</div>
        <div className={styles.encTooltipBody}>{tooltipBody}</div>
      </div>
    </div>
  );
}
