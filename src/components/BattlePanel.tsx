import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useGameStore } from '@/engine/store';
import { calcActiveEnemyTypeBonusPct, calcDps } from '@/engine/formulas';
import { bossKillThreshold, fightTimeLimitS, semiBossKillThreshold } from '@/engine/progression';
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
import {
  ENEMY_TYPE_LABELS,
  ENEMY_TYPE_COLORS,
  SLOT_ICONS,
  SLOT_LABELS,
  STAT_LABELS,
} from '@/lib/equipmentText';
import type { Companion, CompanionState, EquipSlot, ItemId, ShopItem } from '@/types/game';
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
  const failBossFight = useGameStore((s) => s.failBossFight);
  const travelTo = useGameStore((s) => s.travelTo);
  const acceptQuests = useGameStore((s) => s.acceptQuests);

  const loc = LOCATIONS[state.locIdx];
  const enemy = state.enemy;
  const bossFight = state.bossFight;
  const kills = state.locKills[loc?.id ?? ''] ?? 0;
  const dps = useMemo(
    () => calcDps({ companions: state.companions, equipped: state.equipped }),
    [state.companions, state.equipped],
  );
  const activeEnemyBonusPct = enemy
    ? calcActiveEnemyTypeBonusPct(state.equipped, enemy.enemyType)
    : 0;
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

  // Rest-zone view toggle: "recruit" (default) vs "shop". Reset to recruit
  // every time the player travels to a different zone so they don't land
  // on a stale tab from the previous rest stop.
  const [restView, setRestView] = useState<'recruit' | 'shop'>('recruit');
  useEffect(() => {
    setRestView('recruit');
  }, [state.locIdx]);

  // Encounter gating (only meaningful for combat zones).
  const semiUnlocked = !!loc?.semiBoss;
  const bossUnlocked = !!loc?.boss;
  const semiKillsNeeded = loc ? semiBossKillThreshold(loc) : 0;
  const bossKillsNeeded = loc ? bossKillThreshold(loc) : 0;
  const semiDone = !!(loc && state.semiBossDefeated[loc.id]);
  const bossDone = !!(loc && state.bossDefeated[loc.id]);
  // Rematches allowed: `done` is purely a visual hint (a ✓ badge), it no
  // longer disables the button.
  const semiAvailable = semiUnlocked && kills >= semiKillsNeeded && !bossFight;
  const bossAvailable =
    bossUnlocked && (!semiUnlocked || semiDone) && kills >= bossKillsNeeded && !bossFight;

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
          {bossKillsNeeded > 0 && (
            <span>
              Enemigos
              <b>{kills}</b>
            </span>
          )}
        </div>

        {loc?.isRest && <RestModeToggle current={restView} onChange={setRestView} />}

        {loc?.isRest ? (
          restView === 'recruit' ? (
            <RecruitPanel locCompanionIds={loc.companions ?? []} />
          ) : (
            <RestShopPanel locId={loc.id} />
          )
        ) : hasPendingCompanionsHere && !bossFight ? (
          <RecruitPanel locCompanionIds={loc?.companions ?? []} />
        ) : enemy ? (
          <div className={styles.area}>
            <div
              className={`${styles.name} ${enemy.tier === 'boss' ? styles.boss : enemy.tier === 'semi' ? styles.semi : ''}`}
            >
              {enemy.name}
              <span
                className={styles.enemyTypePill}
                style={
                  {
                    '--enemy-type-bg': ENEMY_TYPE_COLORS[enemy.enemyType].bg,
                    '--enemy-type-border': ENEMY_TYPE_COLORS[enemy.enemyType].border,
                    '--enemy-type-text': ENEMY_TYPE_COLORS[enemy.enemyType].border,
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
            </div>

            <button
              type="button"
              className={`${styles.frame} ${shaking ? styles.shake : ''} ${deadAnim ? styles.dead : ''}`}
              onClick={clickEnemy}
              aria-label={`Atacar a ${enemy.name}`}
            >
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

            <div className={styles.hpWrap}>
              {enemy.tier === 'boss' && <div className={styles.bossTag}>★ JEFE ★</div>}
              {enemy.tier === 'semi' && <div className={styles.semiTag}>◆ SEMI-JEFE ◆</div>}

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

            {fightFailed && (
              <div className={styles.flash} role="status">
                El {fightFailed === 'boss' ? 'jefe' : 'semi-jefe'} ha escapado.
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

        {!loc?.isRest && (semiUnlocked || bossUnlocked) && (
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
            onStart={startBossFight}
            onAbandon={failBossFight}
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
  const recruitCompanion = useGameStore((s) => s.recruitCompanion);

  const roster = useMemo(
    () =>
      locCompanionIds
        .map((id) => COMPANIONS.find((c) => c.id === id))
        .filter((c): c is Companion => !!c),
    [locCompanionIds],
  );

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
      <div className={styles.recruitGrid} data-count={roster.length}>
        {roster.map((c) => (
          <RecruitCard
            key={c.id}
            companion={c}
            state={companions[c.id]}
            gold={gold}
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
  onRecruit: () => void;
}

function RecruitCard({ companion, state, gold, onRecruit }: RecruitCardProps) {
  const recruited = !!state?.unlocked;
  const free = companion.recruitCost === 0;
  const canAfford = gold >= companion.recruitCost;
  const portrait = companion.portrait ?? DEFAULT_COMPANION_PORTRAIT;
  const buyLabel = free
    ? 'Reclutar · Gratis'
    : `Reclutar · ${companion.recruitCost.toLocaleString('es-ES')} oro`;

  return (
    <div className={styles.recruitCard}>
      <div
        className={styles.recruitPortraitWrap}
        style={
          companion.portraitScale
            ? ({ '--portrait-scale': companion.portraitScale } as CSSProperties)
            : undefined
        }
      >
        <img
          src={portrait}
          alt=""
          aria-hidden="true"
          draggable={false}
          className={`${styles.recruitPortrait} ${recruited ? styles.recruitPortraitColor : styles.recruitPortraitSilhouette}`}
        />
        <div className={styles.recruitOverlay}>
          <div className={styles.recruitName}>{companion.name}</div>
          <div className={styles.recruitTitle}>{companion.title}</div>
          <div className={styles.recruitDps}>DPS: {companion.baseDps}</div>
        </div>
      </div>
      {recruited ? (
        <div className={styles.recruitOwned}>✓ En la Comunidad</div>
      ) : (
        <button
          type="button"
          className={`${styles.recruitBuy} ${!canAfford ? styles.recruitBuyPoor : ''}`}
          onClick={onRecruit}
          disabled={!canAfford}
          aria-label={`Reclutar a ${companion.name}${free ? ' gratis' : ` por ${companion.recruitCost} oro`}`}
        >
          {buyLabel}
        </button>
      )}
    </div>
  );
}

interface RestModeToggleProps {
  current: 'recruit' | 'shop';
  onChange: (next: 'recruit' | 'shop') => void;
}

/**
 * Two-pill toggle floating in the top-left of the rest scene. Switches the
 * panel body between the companion roster and the local merchant.
 */
function RestModeToggle({ current, onChange }: RestModeToggleProps) {
  return (
    <div className={styles.restToggle} role="tablist" aria-label="Modo del refugio">
      <button
        type="button"
        role="tab"
        aria-selected={current === 'recruit'}
        className={`${styles.restToggleBtn} ${current === 'recruit' ? styles.restToggleActive : ''}`}
        onClick={() => onChange('recruit')}
      >
        Reclutar
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
  const statValue =
    item.slot === 'weapon' ? item.dmg : item.slot === 'armor' ? item.def : item.bonus;
  const statLabel = STAT_LABELS[item.slot];
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
          <div className={styles.recruitDps}>
            +{statValue ?? 0} {statLabel}
          </div>
        </div>
      </div>
      <BonusVsChips
        item={item}
        className={styles.shopBonusChips}
        chipClassName={styles.shopBonusChip}
      />
      {ownedItem ? (
        equippedItem ? (
          <div className={styles.recruitOwned}>✓ Equipado</div>
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
          Comprar · {item.cost.toLocaleString('es-ES')} oro
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
          timeLimitS={fightTimeLimitS(loc, 'boss')}
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
          timeLimitS={fightTimeLimitS(loc, 'semi')}
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
