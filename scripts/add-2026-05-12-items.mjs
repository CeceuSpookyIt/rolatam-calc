/**
 * Add 36 high-confidence Shadow gear items from the 2026-05-12 LATAM client update.
 * Run: node scripts/add-2026-05-12-items.mjs
 *
 * Strategy: add minimal entries with proper scripts. Then run parse-latam-items.mjs
 * to backfill PT-BR name/description from the client snapshot.
 *
 * 12 themed sets, 3 pieces each:
 *   - Onda de Choque (RK_SONICWAVE)          24440 24441 24442
 *   - Certeiro (RA_AIMEDBOLT)                24455 24456 24457
 *   - Metralhadora (NC_VULCANARM)            24470 24471 24472
 *   - Pancada (SR_KNUCKLEARROW)              24482 24483 24484
 *   - Judex (AB_JUDEX)                       24494 24495 24496
 *   - Ressonância (WM_REVERBERATION)         24509 24510 24511
 *   - Escarlate (WL_CRIMSONROCK)             24518 24519 24520
 *   - Fatal (SC_FATALMENACE)                 24530 24531 24532
 *   - Retaliação (GC_COUNTERSLASH)           24542 24543 24544
 *   - Psíquica (SO_PSYCHIC_WAVE)             24554 24555 24556
 *   - Carrinho (GN_CART_TORNADO)             24560 24561 24562
 *   - Destino (LG_OVERBRAND)                 24572 24573 24574
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ITEM_JSON_PATH = resolve(__dirname, '../src/assets/demo/data/item.json');

// Shadow gear pos templates
const ARMOR_BASE = { itemTypeId: 2, itemSubTypeId: 526, location: 'Armor' };
const SHIELD_BASE = { itemTypeId: 2, itemSubTypeId: 527, location: 'Shield' };
const SHOES_BASE = { itemTypeId: 2, itemSubTypeId: 528, location: 'Shoes' };
const WEAPON_BASE = { itemTypeId: 10, itemSubTypeId: 280, location: 'Weapon' };
const ACC_L_BASE = { itemTypeId: 10, itemSubTypeId: 530, location: 'AccessoryLeft' };
const ACC_R_BASE = { itemTypeId: 10, itemSubTypeId: 529, location: 'AccessoryRight' };

const COMMON = {
  unidName: '',
  resName: '',
  description: '',
  slots: 0,
  itemLevel: null,
  attack: null,
  defense: null,
  weight: 0,
  requiredLevel: 99,
  compositionPos: null,
};

/**
 * Pattern A: skill-themed set (3 pieces: armor+shield+shoes) with `range` shield.
 *   armor    : skill +5%, +2% per 2 refines, +1% per refine when set with shoes
 *   shield   : range +3% / +3% at +7 / +4% at +9; +1% skill per refine when set with armor+shoes;
 *              p_pene_race_all 40% + 1% per refine when set with manopla
 *   shoes    : hp +10/refine only
 */
function patternA({ ids, classes, skill, armorName, shieldName, shoesName, manoplaName }) {
  return [
    {
      id: ids[0], name: armorName, ...ARMOR_BASE, usableClass: classes,
      script: {
        hp: ['10'],
        [skill]: [
          '5',
          '2---2',
          `EQUIP[${shieldName}&&${shoesName}]REFINE[shadowShield,shadowBoot,shadowArmor==1]---1`,
        ],
      },
    },
    {
      id: ids[1], name: shieldName, ...SHIELD_BASE, usableClass: classes,
      script: {
        hp: ['10'],
        range: ['3', '7===3', '9===4'],
        [skill]: [
          `EQUIP[${armorName}&&${shoesName}]REFINE[shadowShield,shadowBoot,shadowArmor==1]---1`,
        ],
        p_pene_race_all: [
          `EQUIP[${manoplaName}]40`,
          `EQUIP[${manoplaName}]REFINE[shadowWeapon,shadowShield==1]---1`,
        ],
      },
    },
    {
      id: ids[2], name: shoesName, ...SHOES_BASE, usableClass: classes,
      script: { hp: ['10'] },
    },
  ];
}

/**
 * Pattern B: skill-themed set with `p_size_all` shield (no `range`).
 * Some have `acd` set bonus (Pancada, Retaliação, Fatal, Destino), some don't (Carrinho).
 *
 * shoesExtra:
 *   - 'sizeAll' (Pancada, Retaliação, Carrinho): p_size_all 3%, +2% per 3 refines
 *   - 'skill5'  (Destino): skill +5%, acd -1% per 3 refines
 *   - 'none'   (Fatal): only hp +10/refine
 */
function patternB({ ids, classes, skill, armorName, shieldName, shoesName, manoplaName, shieldAcdSet, shoesExtra }) {
  const shieldScript = {
    hp: ['10'],
    p_size_all: ['3', '7===3', '9===4'],
    [skill]: [
      `EQUIP[${armorName}&&${shoesName}]REFINE[shadowShield,shadowBoot,shadowArmor==1]---1`,
    ],
    p_pene_race_all: [
      `EQUIP[${manoplaName}]40`,
      `EQUIP[${manoplaName}]REFINE[shadowWeapon,shadowShield==1]---1`,
    ],
  };
  if (shieldAcdSet) {
    shieldScript.acd = [
      `EQUIP[${armorName}&&${shoesName}]REFINE[shadowShield,shadowBoot,shadowArmor==2]---1`,
    ];
  }

  let shoesScript;
  if (shoesExtra === 'sizeAll') {
    shoesScript = { hp: ['10'], p_size_all: ['3', '3---2'] };
  } else if (shoesExtra === 'skill5') {
    shoesScript = { hp: ['10'], [skill]: ['5'], acd: ['3---1'] };
  } else {
    shoesScript = { hp: ['10'] };
  }

  return [
    {
      id: ids[0], name: armorName, ...ARMOR_BASE, usableClass: classes,
      script: {
        hp: ['10'],
        [skill]: ['5', '2---2'],
      },
    },
    {
      id: ids[1], name: shieldName, ...SHIELD_BASE, usableClass: classes,
      script: shieldScript,
    },
    {
      id: ids[2], name: shoesName, ...SHOES_BASE, usableClass: classes,
      script: shoesScript,
    },
  ];
}

/**
 * Pattern C: skill-themed magic set with `m_my_element_X` shield.
 *   armor    : skill +5%, +2% per refine (Escarlate, Psíquica) or +2% per 2 refines (Judex)
 *   shield   : m_my_element_X 3% / +3% at +7 / +4% at +9; +1% skill per refine when set with armor+shoes;
 *              m_pene_race_all 40% + 1% per refine when set with manopla
 *   shoes    : m_size_all 3% + 2% per 3 refines (Judex), or skill SP cost (Escarlate/Psíquica, not modeled)
 */
function patternC({ ids, classes, skill, armorName, shieldName, shoesName, manoplaName, element, armorRefineInterval, shoesExtra }) {
  let shoesScript;
  if (shoesExtra === 'mSizeAll') {
    shoesScript = { hp: ['10'], m_size_all: ['3', '3---2'] };
  } else {
    shoesScript = { hp: ['10'] };
  }

  return [
    {
      id: ids[0], name: armorName, ...ARMOR_BASE, usableClass: classes,
      script: {
        hp: ['10'],
        [skill]: ['5', `${armorRefineInterval}---2`],
      },
    },
    {
      id: ids[1], name: shieldName, ...SHIELD_BASE, usableClass: classes,
      script: {
        hp: ['10'],
        [`m_my_element_${element}`]: ['3', '7===3', '9===4'],
        [skill]: [
          `EQUIP[${armorName}&&${shoesName}]REFINE[shadowShield,shadowBoot,shadowArmor==1]---1`,
        ],
        m_pene_race_all: [
          `EQUIP[${manoplaName}]40`,
          `EQUIP[${manoplaName}]REFINE[shadowWeapon,shadowShield==1]---1`,
        ],
      },
    },
    {
      id: ids[2], name: shoesName, ...SHOES_BASE, usableClass: classes,
      script: shoesScript,
    },
  ];
}

/**
 * Pattern D: 3-accessory set (weapon manopla + left colar + right brinco).
 * Used by Certeiro (RA_AIMEDBOLT) and Ressonância (WM_REVERBERATION).
 *
 * Certeiro:
 *   manopla: ATK/MATK +1/refine; range +3% / +3% at +7 / +4% at +9; +1% skill per refine when set with colar+brinco;
 *            p_pene_race_all 40% + 1% per refine when set with existing shield
 *   colar  : skill +5%, +2% per 2 refines
 *   brinco : p_size_all 3% + 2% per 3 refines
 *
 * Ressonância:
 *   manopla: ATK/MATK +1/refine; m_my_element_neutral 3% / +3% +7 / +4% +9; skill flat +(soma÷2) when set with colar+brinco;
 *            m_pene_race_all 40% + 1% per refine when set with existing shield (Musa/Trovador)
 *   colar  : skill +5%, +2% per 2 refines
 *   brinco : hp +10/refine only (SP cost reduction not modeled)
 */
function certeiroSet() {
  const manopla = 'Manopla Sombria do Certeiro';
  const colar = 'Colar Sombrio do Certeiro';
  const brinco = 'Brinco Sombrio do Certeiro';
  const linkedShield = 'Escudo Sombrio de Sentinela';
  return [
    {
      id: 24455, name: manopla, ...WEAPON_BASE, usableClass: ['Ranger'],
      script: {
        atk: ['1---1'],
        matk: ['1---1'],
        range: ['3', '7===3', '9===4'],
        RA_AIMEDBOLT: [
          `EQUIP[${colar}&&${brinco}]REFINE[shadowWeapon,shadowPendant,shadowEarring==1]---1`,
        ],
        p_pene_race_all: [
          `EQUIP[${linkedShield}]40`,
          `EQUIP[${linkedShield}]REFINE[shadowWeapon,shadowShield==1]---1`,
        ],
      },
    },
    {
      id: 24456, name: colar, ...ACC_L_BASE, usableClass: ['Ranger'],
      script: {
        hp: ['10'],
        RA_AIMEDBOLT: ['5', '2---2'],
      },
    },
    {
      id: 24457, name: brinco, ...ACC_R_BASE, usableClass: ['Ranger'],
      script: {
        hp: ['10'],
        p_size_all: ['3', '3---2'],
      },
    },
  ];
}

function ressonanciaSet() {
  const manopla = 'Manopla Sombria da Ressonância';
  const colar = 'Colar Sombrio da Ressonância';
  const brinco = 'Brinco Sombrio da Ressonância';
  const linkedShieldA = 'Escudo Sombrio de Musa';
  const linkedShieldB = 'Escudo Sombrio de Trovador';
  return [
    {
      id: 24509, name: manopla, ...WEAPON_BASE, usableClass: ['Wanderer', 'Minstrel'],
      script: {
        atk: ['1---1'],
        matk: ['1---1'],
        m_my_element_neutral: ['3', '7===3', '9===4'],
        WM_REVERBERATION: [
          `EQUIP[${colar}&&${brinco}]REFINE[shadowWeapon,shadowPendant,shadowEarring==2]---1`,
        ],
        p_pene_race_all: [
          `EQUIP[${linkedShieldA}||${linkedShieldB}]40`,
          `EQUIP[${linkedShieldA}||${linkedShieldB}]REFINE[shadowWeapon,shadowShield==1]---1`,
        ],
        m_pene_race_all: [
          `EQUIP[${linkedShieldA}||${linkedShieldB}]40`,
          `EQUIP[${linkedShieldA}||${linkedShieldB}]REFINE[shadowWeapon,shadowShield==1]---1`,
        ],
      },
    },
    {
      id: 24510, name: colar, ...ACC_L_BASE, usableClass: ['Wanderer', 'Minstrel'],
      script: {
        hp: ['10'],
        WM_REVERBERATION: ['5', '2---2'],
      },
    },
    {
      id: 24511, name: brinco, ...ACC_R_BASE, usableClass: ['Wanderer', 'Minstrel'],
      script: { hp: ['10'] },
    },
  ];
}

// Build all entries
const entries = [];

// Onda de Choque (RK) — 24440-24442, physical with range
entries.push(...patternA({
  ids: [24440, 24441, 24442], classes: ['RuneKnight'], skill: 'RK_SONICWAVE',
  armorName: 'Malha Sombria da Onda de Choque',
  shieldName: 'Escudo Sombrio da Onda de Choque',
  shoesName: 'Greva Sombria da Onda de Choque',
  manoplaName: 'Manopla Sombria de Cavaleiro Rúnico',
}));

// Metralhadora (NC) — 24470-24472, physical with range
entries.push(...patternA({
  ids: [24470, 24471, 24472], classes: ['Mechanic'], skill: 'NC_VULCANARM',
  armorName: 'Malha Sombria da Metralhadora',
  shieldName: 'Escudo Sombrio da Metralhadora',
  shoesName: 'Greva Sombria da Metralhadora',
  manoplaName: 'Manopla Sombrio de Mecânico',
}));

// Pancada Corporal (SR) — 24482-24484, p_size_all + acd set bonus, shoes sizeAll
entries.push(...patternB({
  ids: [24482, 24483, 24484], classes: ['Sura'], skill: 'SR_KNUCKLEARROW',
  armorName: 'Malha Sombria Corporal',
  shieldName: 'Escudo Sombrio da Pancada',
  shoesName: 'Greva Sombria da Pancada',
  manoplaName: 'Manopla Sombrio de Shura',
  shieldAcdSet: true, shoesExtra: 'sizeAll',
}));

// Retaliação (GC) — 24542-24544, p_size_all + acd set bonus, shoes hp only
entries.push(...patternB({
  ids: [24542, 24543, 24544], classes: ['GuillotineCross'], skill: 'GC_COUNTERSLASH',
  armorName: 'Malha Sombria da Retaliação',
  shieldName: 'Escudo Sombrio da Retaliação',
  shoesName: 'Greva Sombria da Retaliação',
  manoplaName: 'Manopla Sombria de Sicário',
  shieldAcdSet: true, shoesExtra: 'none',
}));

// Tornado de Carrinho (GN) — 24560-24562, p_size_all (no acd set bonus), shoes hp only
entries.push(...patternB({
  ids: [24560, 24561, 24562], classes: ['Genetic'], skill: 'GN_CART_TORNADO',
  armorName: 'Malha Sombria do Carrinho',
  shieldName: 'Escudo Sombrio do Carrinho',
  shoesName: 'Greva Sombria do Carrinho',
  manoplaName: 'Manopla Sombria de Bioquímico',
  shieldAcdSet: false, shoesExtra: 'none',
}));

// Lança do Destino (LG) — 24572-24574, p_size_all + acd set bonus, shoes skill5+acd
entries.push(...patternB({
  ids: [24572, 24573, 24574], classes: ['RoyalGuard'], skill: 'LG_OVERBRAND',
  armorName: 'Malha Sombria do Destino',
  shieldName: 'Escudo Sombrio do Destino',
  shoesName: 'Greva Sombria do Destino',
  manoplaName: 'Manopla Sombria de Guardião Real',
  shieldAcdSet: true, shoesExtra: 'skill5',
}));

// Ofensiva Fatal (SC) — 24530-24532, p_size_all + acd set bonus (shield is "Manto" not "Escudo" but same slot)
// Note: 24531 description says "Manopla Sombria de Renegado" for the linked weapon
entries.push(...patternB({
  ids: [24530, 24531, 24532], classes: ['ShadowChaser'], skill: 'SC_FATALMENACE',
  armorName: 'Malha Sombria Fatal',
  shieldName: 'Escudo Sombrio Fatal',
  shoesName: 'Greva Sombria Fatal',
  manoplaName: 'Manopla Sombria de Renegado',
  shieldAcdSet: true, shoesExtra: 'none',
}));

// Judex (AB) — 24494-24496, magical Holy, shoes m_size_all
entries.push(...patternC({
  ids: [24494, 24495, 24496], classes: ['ArchBishop'], skill: 'AB_JUDEX',
  armorName: 'Malha Sombria de Judex',
  shieldName: 'Escudo Sombrio de Judex',
  shoesName: 'Greva Sombria de Judex',
  manoplaName: 'Manopla Sombrio de Arcebispo',
  element: 'holy', armorRefineInterval: 2, shoesExtra: 'mSizeAll',
}));

// Meteoro Escarlate (WL) — 24518-24520, magical Fire, armor refine interval 1 (every refine), shoes hp only
entries.push(...patternC({
  ids: [24518, 24519, 24520], classes: ['Warlock'], skill: 'WL_CRIMSONROCK',
  armorName: 'Malha Sombria Escarlate',
  shieldName: 'Escudo Sombrio Escarlate',
  shoesName: 'Greva Sombria Escarlate',
  manoplaName: 'Manopla Sombria de Arcano',
  element: 'fire', armorRefineInterval: 1, shoesExtra: 'none',
}));

// Onda Psíquica (SO) — 24554-24556, magical Neutral, armor refine interval 1, shoes hp only
entries.push(...patternC({
  ids: [24554, 24555, 24556], classes: ['Sorcerer'], skill: 'SO_PSYCHIC_WAVE',
  armorName: 'Malha Sombria Psíquica',
  shieldName: 'Escudo Sombrio Psíquico',
  shoesName: 'Greva Sombria Psíquica',
  manoplaName: 'Manopla Sombria de Feiticeiro',
  element: 'neutral', armorRefineInterval: 1, shoesExtra: 'none',
}));

// Disparo Certeiro (Ranger, 3-accessory) — 24455-24457
entries.push(...certeiroSet());

// Ressonância (Wanderer/Minstrel, 3-accessory) — 24509-24511
entries.push(...ressonanciaSet());

// Apply
const items = JSON.parse(readFileSync(ITEM_JSON_PATH, 'utf-8'));
let added = 0;
let skipped = 0;
for (const entry of entries) {
  const id = String(entry.id);
  if (items[id]) {
    console.log(`SKIP ${id} "${entry.name}" — already exists`);
    skipped++;
    continue;
  }
  items[id] = {
    id: entry.id,
    aegisName: `LATAM_${entry.id}`,
    name: entry.name,
    unidName: entry.name,
    resName: COMMON.resName,
    description: COMMON.description,
    slots: COMMON.slots,
    itemTypeId: entry.itemTypeId,
    itemSubTypeId: entry.itemSubTypeId,
    itemLevel: COMMON.itemLevel,
    attack: COMMON.attack,
    defense: COMMON.defense,
    weight: COMMON.weight,
    requiredLevel: COMMON.requiredLevel,
    location: entry.location,
    compositionPos: COMMON.compositionPos,
    usableClass: entry.usableClass,
    script: entry.script,
  };
  console.log(`ADD  ${id} "${entry.name}"`);
  added++;
}

writeFileSync(ITEM_JSON_PATH, JSON.stringify(items, null, 2), 'utf-8');
console.log(`\nDone: ${added} added, ${skipped} skipped.`);
