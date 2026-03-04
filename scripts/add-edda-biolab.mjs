/**
 * Add all 41 Edda Biolab weapons to item.json
 *
 * Data sourced from divine-pride.net for ATK, Weight, MATK,
 * and bonus effects. Names in PT-BR from LATAM client.
 */

import { readFileSync, writeFileSync } from 'fs';

const ITEM_JSON_PATH = new URL('../src/assets/demo/data/item.json', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');

const items = JSON.parse(readFileSync(ITEM_JSON_PATH, 'utf-8'));

// Weapon subtype IDs
const SUB = {
  Dagger: 256,
  Sword: 257,
  TwoHandSword: 258,
  Spear: 259,
  TwoHandSpear: 260,
  Mace: 262,
  Rod: 265,
  TwoHandStaff: 268,
  Bow: 269,
  Knuckle: 270,
  Instrument: 271,
  Whip: 272,
  Katar: 274,
};

function weapon(id, name, aegisName, subTypeId, atk, weight, usableClass, script) {
  return {
    id,
    aegisName,
    name: `${name} [2]`,
    unidName: '',
    resName: '',
    description: '',
    slots: 2,
    itemTypeId: 1,
    itemSubTypeId: subTypeId,
    itemLevel: 4,
    attack: atk,
    defense: null,
    weight,
    requiredLevel: 170,
    location: null,
    compositionPos: null,
    usableClass: [usableClass],
    script,
  };
}

// Special case: Repentance Slasher has 3 slots
function weapon3slots(id, name, aegisName, subTypeId, atk, weight, usableClass, script) {
  const w = weapon(id, name, aegisName, subTypeId, atk, weight, usableClass, script);
  w.name = `${name.replace(' [2]', '')} [3]`;
  w.slots = 3;
  return w;
}

const newWeapons = [
  // ==================== RUNE KNIGHT ====================

  // 21051: Volar [2] — Two-handed Sword
  // Bowling Bash +30%, ATK +4/refine, +9: CD -1s Ignition Break & Bowling Bash, +11: indestructible + Bowling Bash +20%
  weapon(21051, 'Volar', 'Volar', SUB.TwoHandSword, 280, 280, 'RuneKnight', {
    'Bowling Bash': ['30', '11===20'],
    atk: ['1---4'],
    'cd__Ignition Break': ['9===1'],
    'cd__Bowling Bash': ['9===1'],
  }),

  // 21052: Vernan [2] — Two-handed Sword
  // ATK +5%, Long-ranged +1%/refine, +9: Clashing Spiral & Sonic Wave +30%, +11: Sonic Wave CD -1.5s
  weapon(21052, 'Vernan', 'Vernan', SUB.TwoHandSword, 300, 650, 'RuneKnight', {
    atkPercent: ['5'],
    lDmg: ['1---1'],
    'Clashing Spiral': ['9===30'],
    'Sonic Wave': ['9===30'],
    'cd__Sonic Wave': ['11===1.5'],
  }),

  // 32023: Argen Blanco [2] — Two-handed Spear (actually one-hand spear per DP, but task says 260)
  // Brandish Spear +30%, ATK +4/refine, +9: Hundred Spears CD -1.5s, +11: Brandish Spear +20%
  weapon(32023, 'Argen Blanco', 'Argen_Blanco', SUB.TwoHandSpear, 200, 100, 'RuneKnight', {
    'Brandish Spear': ['30', '11===20'],
    atk: ['1---4'],
    'cd__Hundred Spears': ['9===1.5'],
  }),

  // ==================== ROYAL GUARD ====================

  // 32024: Harve [2] — Spear
  // Rapid Smiting +40%, Long-ranged +1%/refine, +9: Shield Press +30%, +11: Rapid Smiting +20% + Shield Press +20%
  weapon(32024, 'Harve', 'Harve', SUB.Spear, 210, 150, 'RoyalGuard', {
    'Rapid Smiting': ['40', '11===20'],
    lDmg: ['1---1'],
    'Shield Press': ['9===30', '11===20'],
  }),

  // 32025: Fortridge [2] — Spear
  // ATK +5%, Post-skill delay -1%/refine, +9: Cannon Spear +20%, +11: Over Brand +20%
  weapon(32025, 'Fortridge', 'Fortridge', SUB.Spear, 205, 170, 'RoyalGuard', {
    atkPercent: ['5'],
    acd: ['1---1'],
    'Cannon Spear': ['9===20'],
    'Over Brand': ['9===20', '11===20'],
  }),

  // 32350: Farthezan [2] — Mace
  // Gloria Domini +40%, VCT -1%/refine, +9: Genesis Ray +30%, +11: Gloria Domini +20% + Genesis Ray +20%
  weapon(32350, 'Farthezan', 'Farthezan', SUB.Mace, 130, 110, 'RoyalGuard', {
    matk: ['180'],
    'Gloria Domini': ['40', '11===20'],
    vct: ['1---1'],
    'Genesis Ray': ['9===30', '11===20'],
  }),

  // ==================== WARLOCK ====================

  // 2055: Bastão Milagroso [2] — Two-handed Staff
  // MATK 270, indestructible, Ghost magic +5%, MATK +4/refine
  // +9: Soul Strike, Napalm Vulcan, Soul Expansion +20%
  // +11: Soul Strike, Napalm Vulcan +30%
  weapon(2055, 'Bastão Milagroso', 'Staff_Of_Miracle', SUB.TwoHandStaff, 100, 120, 'Warlock', {
    matk: ['270', '1---4'],
    m_my_element_ghost: ['5'],
    'Soul Strike': ['9===20', '11===30'],
    'Napalm Vulcan': ['9===20', '11===30'],
    'Soul Expansion': ['9===20'],
  }),

  // 2056: Gravitação [2] — Two-handed Staff
  // MATK 280, Neutral magic +5%, MATK +4/refine, indestructible
  // +9: Gravitational Field & Drain Life +30%, +11: Gravitational Field CD -2s
  weapon(2056, 'Gravitação', 'Gravitation', SUB.TwoHandStaff, 110, 130, 'Warlock', {
    matk: ['280', '1---4'],
    m_my_element_neutral: ['5'],
    'Gravitational Field': ['9===30'],
    'Drain Life': ['9===30'],
    'cd__Gravitational Field': ['11===2'],
  }),

  // 26158: Varinha de Rosas Cálidas [2] — Rod
  // MATK 180, Fire +5%, Shadow +5%, MATK +4/refine
  // +9: Hell Inferno +30%, +11: Crimson Rock CD -1s
  weapon(26158, 'Varinha de Rosas Cálidas', 'Crimson_Rose_Stick', SUB.Rod, 100, 70, 'Warlock', {
    matk: ['180', '1---4'],
    m_my_element_fire: ['5'],
    m_my_element_shadow: ['5'],
    'Hell Inferno': ['9===30'],
    'cd__Crimson Rock': ['11===1'],
  }),

  // ==================== SORCERER ====================

  // 28633: Lançarin [2] — Rod
  // MATK 175, Fire/Cold/Lightning Bolt +20%, MATK +4/refine
  // +9: Fire/Cold/Lightning Bolt +30%, +11: Heaven's Drive +50%, Earth Spike +50%
  weapon(28633, 'Lançarin', 'Boltigin', SUB.Rod, 120, 80, 'Sorcerer', {
    matk: ['175', '1---4'],
    'Fire Bolt': ['20', '9===30'],
    'Cold Bolt': ['20', '9===30'],
    'Lightning Bolt': ['20', '9===30'],
    "Heaven's Drive": ['11===50'],
    'Earth Spike': ['11===50'],
  }),

  // 26160: Castigo Diamante [2] — Rod
  // MATK 180, Water +5%, Earth +5%, MATK +4/refine, indestructible
  // +9: Diamond Dust +30%, Earth Grave +30%, +11: Diamond Dust +20%, Earth Grave +20%
  weapon(26160, 'Castigo Diamante', 'Dust_Grave', SUB.Rod, 120, 80, 'Sorcerer', {
    matk: ['180', '1---4'],
    m_my_element_water: ['5'],
    m_my_element_earth: ['5'],
    'Diamond Dust': ['9===30', '11===20'],
    'Earth Grave': ['9===30', '11===20'],
  }),

  // 26159: Lança Psíquica [2] — Rod
  // MATK 180, Neutral/Wind +5%, MATK +4/refine, indestructible
  // +9: Psychic Wave +30%, +11: Varetyr Spear CD -2s
  weapon(26159, 'Lança Psíquica', 'Psychic_Spear_Rod', SUB.Rod, 120, 80, 'Sorcerer', {
    matk: ['180', '1---4'],
    m_my_element_neutral: ['5'],
    m_my_element_wind: ['5'],
    'Psychic Wave': ['9===30'],
    'cd__Varetyr Spear': ['11===2'],
  }),

  // ==================== MECHANIC ====================

  // 16092: Bate-Estacas Motorizado [2] — Mace
  // Vulcan Arm +10%, acd -1%/refine, indestructible
  // +9: Arm Cannon +15%, Knuckle Boost +15%, +11: Vulcan Arm +15%
  weapon(16092, 'Bate-Estacas Motorizado', 'Engine_Pilebunker', SUB.Mace, 450, 320, 'Mechanic', {
    'Vulcan Arm': ['10', '11===15'],
    acd: ['1---1'],
    'Arm Cannon': ['9===15'],
    'Knuckle Boost': ['9===15'],
  }),

  // 1333: Ferramenta Dourada [2] — Mace
  // ATK +5%, ATK +4/refine, indestructible
  // +9: Power Swing +20%, Axe Boomerang +20%, +11: Power Swing +15%, Axe Boomerang +15%
  weapon(1333, 'Ferramenta Dourada', 'Golden_Wrench', SUB.Mace, 220, 550, 'Mechanic', {
    atkPercent: ['5'],
    atk: ['1---4'],
    'Power Swing': ['9===20', '11===15'],
    'Axe Boomerang': ['9===20', '11===15'],
  }),

  // 28138: Chave Maxi [2] — Mace (actually Two-handed Axe per DP, but task says Mace 262)
  // ATK +4/refine, indestructible
  // +9: Axe Tornado CD -1s, Lava Flow CD -1s, +11: Axe Tornado +15%
  weapon(28138, 'Chave Maxi', 'Maxi_Spanner', SUB.Mace, 340, 450, 'Mechanic', {
    atk: ['1---4'],
    'cd__Axe Tornado': ['9===1'],
    'Axe Tornado': ['11===15'],
  }),

  // ==================== GENETICIST ====================

  // 16094: Caduceu [2] — Mace
  // Crazy Vines +20%, ATK +4/refine, indestructible
  // +9: Crazy Vines +30%, +11: Crazy Vines CD -2s
  weapon(16094, 'Caduceu', 'Gene_Rod', SUB.Mace, 195, 140, 'Genetic', {
    'Crazy Vines': ['20', '9===30'],
    atk: ['1---4'],
    'cd__Crazy Vines': ['11===2'],
  }),

  // 16093: Injetor Acoplável [2] — Mace
  // Long-ranged +10%, ATK +1%/refine, indestructible
  // +9: Cart Cannon +25%, +11: Long-ranged +15%
  weapon(16093, 'Injetor Acoplável', 'Coolant_Injection', SUB.Mace, 210, 140, 'Genetic', {
    lDmg: ['10', '11===15'],
    atkPercent: ['1---1'],
    'Cart Cannon': ['9===25'],
  }),

  // 32351: Estal [2] — Mace
  // ATK +4/refine, Spore Explosion CD -1s (base)
  // +9: Spore Explosion +30%, +11: Spore Explosion +20%
  weapon(32351, 'Estal', 'Estal', SUB.Mace, 195, 70, 'Genetic', {
    atk: ['1---4'],
    'cd__Spore Explosion': ['1'],
    'Spore Explosion': ['9===30', '11===20'],
  }),

  // ==================== ARCHBISHOP ====================

  // 2057: Adorare [2] — Two-handed Staff
  // MATK 240, Holy magic +5%, MATK +4/refine, indestructible
  // +9: Adoramus +30%, +11: p/m size all -25% (defensive, skip for calc)
  weapon(2057, 'Adorare', 'Adorare_Staff', SUB.TwoHandStaff, 100, 120, 'ArchBishop', {
    matk: ['240', '1---4'],
    m_my_element_holy: ['5'],
    'Adoramus': ['9===30'],
  }),

  // 26161: Penitência [2] — Rod (Mace per task, but it's a Rod/one-hand staff in DP)
  // MATK 175, Holy magic +5%, MATK +4/refine, indestructible
  // +9: Magnus Exorcismus +30%, Judex +30%, +11: Magnus Exorcismus +20%
  weapon(26161, 'Penitência', 'Penitentia', SUB.Mace, 100, 70, 'ArchBishop', {
    matk: ['175', '1---4'],
    m_my_element_holy: ['5'],
    'Magnus Exorcismus': ['9===30', '11===20'],
    'Judex': ['9===30'],
  }),

  // 16095: Mangual Lucis [2] — Mace
  // MATK 160, ASPD +1, MATK +4/refine, indestructible
  // +9: Duple Light +40%, +11: autocast Judex (not calc-relevant as autocast)
  weapon(16095, 'Mangual Lucis', 'Lucis_Flail', SUB.Mace, 180, 100, 'ArchBishop', {
    matk: ['160', '1---4'],
    aspd: ['1'],
    'Duple Light': ['9===40'],
  }),

  // ==================== SHURA ====================

  // 1865: Cólera do Dragão [2] — Knuckle
  // Raging Quadruple Blow +30%, ATK +4/refine
  // +9: Raging Thrust +50%, Chain Crush Combo +50%, +11: Chain Crush Combo +30%
  weapon(1865, 'Cólera do Dragão', 'Combo_Fist', SUB.Knuckle, 210, 70, 'Sura', {
    'Raging Quadruple Blow': ['30'],
    atk: ['1---4'],
    'Raging Thrust': ['9===50'],
    'Chain Crush Combo': ['9===50', '11===30'],
  }),

  // 1866: Bandagens Divinas [2] — Knuckle
  // Long-ranged +10%, ATK +4/refine
  // +9: Knuckle Arrow +40%, +11: acd -7%
  weapon(1866, 'Bandagens Divinas', 'Asura_Bandage', SUB.Knuckle, 220, 80, 'Sura', {
    lDmg: ['10'],
    atk: ['1---4'],
    'Knuckle Arrow': ['9===40'],
    acd: ['11===7'],
  }),

  // 16096: Pendulum [2] — Knuckle
  // VCT -10%, ATK +4/refine, indestructible
  // +9: Finger Offensive +50%, +11: ATK +10% (atkPercent)
  // Note: "Throw Spirit Sphere" = "Finger Offensive" in this codebase
  // Note: "Occult Impaction" not present in codebase skills — DP says both but we use Finger Offensive
  weapon(16096, 'Pendulum', 'Bright_Mace', SUB.Knuckle, 210, 130, 'Sura', {
    vct: ['10'],
    atk: ['1---4'],
    'Finger Offensive': ['9===50'],
    atkPercent: ['11===10'],
  }),

  // ==================== RANGER ====================

  // 18185: Estrela Afiada [2] — Bow
  // CRI +5, Critical damage +1%/refine
  // +9: Long-ranged +7%, +11: Focused Arrow Strike +10%
  weapon(18185, 'Estrela Afiada', 'Sharp_Star', SUB.Bow, 150, 150, 'Ranger', {
    cri: ['5'],
    criDmg: ['1---1'],
    lDmg: ['9===7'],
    'Focused Arrow Strike': ['11===10'],
  }),

  // 18186: Arco Certeiro [2] — Bow
  // acd -5%, acd -1%/refine
  // +9: Aimed Bolt +30%, +11: Aimed Bolt CD -1s + Aimed Bolt +15%
  weapon(18186, 'Arco Certeiro', 'Aiming_Bow', SUB.Bow, 210, 100, 'Ranger', {
    acd: ['5', '1---1'],
    'Aimed Bolt': ['9===30', '11===15'],
    'cd__Aimed Bolt': ['11===1'],
  }),

  // 18187: Tiro Rapina [2] — Bow
  // Long-ranged +10%, ATK +4/refine
  // +9: Arrow Storm +25%, +11: Arrow Storm CD -0.7s
  weapon(18187, 'Tiro Rapina', 'Falken_Shooter', SUB.Bow, 210, 100, 'Ranger', {
    lDmg: ['10'],
    atk: ['1---4'],
    'Arrow Storm': ['9===25'],
    'cd__Arrow Storm': ['11===0.7'],
  }),

  // ==================== WANDERER ====================

  // 26213: Fita Fru-Fru [2] — Whip
  // VCT -10%, Long-ranged +1%/refine
  // +9: Severe Rainstorm CD -1s, +11: (SP cost, not calc-relevant)
  weapon(26213, 'Fita Fru-Fru', 'Scarlet_Ribbon', SUB.Whip, 180, 120, 'Wanderer', {
    vct: ['10'],
    lDmg: ['1---1'],
    'cd__Severe Rainstorm': ['9===1'],
  }),

  // 26212: Chibata Coração [2] — Whip
  // MATK 190, Neutral magic +10%, MATK +4/refine
  // +9: Metalic Sound +30%, +11: Metalic Sound CD -2s
  weapon(26212, 'Chibata Coração', 'Heart_Whip', SUB.Whip, 100, 120, 'Wanderer', {
    matk: ['190', '1---4'],
    m_my_element_neutral: ['10'],
    'Metalic Sound': ['9===30'],
    'cd__Metalic Sound': ['11===2'],
  }),

  // 18188: Ventania [2] — Bow
  // Long-ranged +10%, Long-ranged +1%/refine
  // +9: Severe Rainstorm +30%, +11: Severe Rainstorm CD -2s
  weapon(18188, 'Ventania', 'Wind_Gale', SUB.Bow, 200, 100, 'Wanderer', {
    lDmg: ['10', '1---1'],
    'Severe Rainstorm': ['9===30'],
    'cd__Severe Rainstorm': ['11===2'],
  }),

  // ==================== MINSTREL ====================

  // 32108: Viola [2] — Musical Instrument
  // VCT -10%, Long-ranged +1%/refine, SP -20%
  // +9: Severe Rainstorm CD -1s, +11: (SP cost, not calc-relevant)
  weapon(32108, 'Viola', 'Antique_Cello', SUB.Instrument, 180, 120, 'Minstrel', {
    vct: ['10'],
    lDmg: ['1---1'],
    'cd__Severe Rainstorm': ['9===1'],
  }),

  // 32107: Banjo Negro [2] — Musical Instrument
  // MATK 190, Neutral magic +10%, MATK +4/refine
  // +9: Metalic Sound +30%, +11: Metalic Sound CD -2s
  weapon(32107, 'Banjo Negro', 'Black_Circle', SUB.Instrument, 100, 120, 'Minstrel', {
    matk: ['190', '1---4'],
    m_my_element_neutral: ['10'],
    'Metalic Sound': ['9===30'],
    'cd__Metalic Sound': ['11===2'],
  }),

  // ==================== SHADOW CHASER ====================

  // 18184: Triarco [2] — Bow
  // Long-ranged +10%, ATK +4/refine
  // +9: Triangle Shot +20%, +11: Triangle Shot +15%
  weapon(18184, 'Triarco', 'Rapid_Fire', SUB.Bow, 185, 150, 'ShadowChaser', {
    lDmg: ['10'],
    atk: ['1---4'],
    'Triangle Shot': ['9===20', '11===15'],
  }),

  // 28767: Estripadora [2] — Dagger
  // Back Stab +40%, ATK +4/refine
  // +9: Fatal Menace +30%, +11: (SP cost, not calc)
  weapon(28767, 'Estripadora', 'Jack_The_Knife', SUB.Dagger, 185, 90, 'ShadowChaser', {
    'Back Stab': ['40'],
    atk: ['1---4'],
    'Fatal Menace': ['9===30'],
  }),

  // 28768: Adaga Platina [2] — Dagger
  // MATK 170, MATK +5%, MATK +4/refine
  // +9: Fire/Water/Wind/Earth magic +15%, +11: (proc, not reliable for calc)
  weapon(28768, 'Adaga Platina', 'Platinum_Dagger', SUB.Dagger, 150, 150, 'ShadowChaser', {
    matk: ['170', '1---4'],
    matkPercent: ['5'],
    m_my_element_fire: ['9===15'],
    m_my_element_water: ['9===15'],
    m_my_element_wind: ['9===15'],
    m_my_element_earth: ['9===15'],
  }),

  // ==================== GUILLOTINE CROSS ====================

  // 28765: Navalha Carrasca [2] — Dagger (right hand)
  // When equipped with Navalha Repente:
  //   Meteor Assault +40%, Soul Destroyer +40%
  //   ATK +8 per 2 combined refines
  //   +16 combined: Cross Impact +20%, Counter Slash +20%
  //   +18 combined: ATK +12%
  //   +20 combined: Meteor Assault +20%, Soul Destroyer +20%
  // Standalone bonuses put on right-hand dagger (the "main" one)
  weapon(28765, 'Navalha Carrasca', 'Judgement_Slasher', SUB.Dagger, 195, 110, 'GuillotineCross', {
    'Meteor Assault': ['EQUIP[Navalha Repente]===40', 'EQUIP[Navalha Repente]REFINE[weapon,leftWeapon==20]===20'],
    'Soul Destroyer': ['EQUIP[Navalha Repente]===40', 'EQUIP[Navalha Repente]REFINE[weapon,leftWeapon==20]===20'],
    atk: ['EQUIP[Navalha Repente]REFINE[weapon,leftWeapon==1]---8'],
    'Cross Impact': ['EQUIP[Navalha Repente]REFINE[weapon,leftWeapon==16]===20'],
    'Counter Slash': ['EQUIP[Navalha Repente]REFINE[weapon,leftWeapon==16]===20'],
    atkPercent: ['EQUIP[Navalha Repente]REFINE[weapon,leftWeapon==18]===12'],
  }),

  // 28766: Navalha Repente [3] — Dagger (left hand, 3 slots)
  // No standalone bonuses — all bonuses come from the set with Navalha Carrasca
  {
    id: 28766,
    aegisName: 'Repentance_Slasher',
    name: 'Navalha Repente [3]',
    unidName: '',
    resName: '',
    description: '',
    slots: 3,
    itemTypeId: 1,
    itemSubTypeId: SUB.Dagger,
    itemLevel: 4,
    attack: 100,
    defense: null,
    weight: 70,
    requiredLevel: 170,
    location: null,
    compositionPos: null,
    usableClass: ['GuillotineCross'],
    script: {},
  },

  // 28042: Ceifo Cruzado [2] — Katar
  // ATK +5%, Long-ranged +1%/refine
  // +9: Rolling Cutter +30%, +11: Cross Ripper Slasher +20%
  weapon(28042, 'Ceifo Cruzado', 'Reaper_Cross', SUB.Katar, 250, 150, 'GuillotineCross', {
    atkPercent: ['5'],
    lDmg: ['1---1'],
    'Rolling Cutter': ['9===30'],
    'Cross Ripper Slasher': ['11===20'],
  }),

  // 28044: Agudo Filo [2] — Katar
  // Critical damage +5%, ATK +4/refine
  // +9: p_size_all +15%, +11: ATK +7%
  weapon(28044, 'Agudo Filo', 'Agudo_Filo', SUB.Katar, 270, 200, 'GuillotineCross', {
    criDmg: ['5'],
    atk: ['1---4'],
    p_size_all: ['9===15'],
    atkPercent: ['11===7'],
  }),
];

// Add all weapons
let added = 0;
let skipped = 0;

for (const w of newWeapons) {
  if (items[w.id]) {
    console.log(`SKIP: ${w.id} ${w.name} — already exists`);
    skipped++;
    continue;
  }
  items[w.id] = w;
  added++;
  console.log(`ADD: ${w.id} ${w.name}`);
}

writeFileSync(ITEM_JSON_PATH, JSON.stringify(items, null, 2), 'utf-8');

console.log(`\nDone: ${added} added, ${skipped} skipped. Total items: ${Object.keys(items).length}`);
