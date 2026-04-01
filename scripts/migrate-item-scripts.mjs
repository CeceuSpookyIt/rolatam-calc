#!/usr/bin/env node
/**
 * migrate-item-scripts.mjs
 *
 * Migrates skill references in item.json from EN names to aegisNames.
 * - Keys: skill name (with optional prefix) → aegis (with prefix)
 * - Values: LEARN_SKILL[X==N], LEARN_SKILL2[X==N], ACTIVE_SKILL[X], level:X
 *
 * Usage:
 *   node scripts/migrate-item-scripts.mjs --dry-run   # preview changes
 *   node scripts/migrate-item-scripts.mjs              # apply changes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const ITEM_JSON = path.join(ROOT, 'src/assets/demo/data/item.json');
const REGISTRY_JSON = path.join(ROOT, 'src/app/constants/skill-registry-data.json');

const dryRun = process.argv.includes('--dry-run');

// ─── Extra item.json EN names → aegis (names used in item.json that differ from skill-name.ts) ──
const ITEM_EXTRA_MAP = {
  // rAthena description names (different from calc EN)
  'Asura Strike': 'MO_EXTREMITYFIST',
  'Triple Attack': 'MO_TRIPLEATTACK',
  'Raging Trifecta Blow': 'MO_TRIPLEATTACK',
  'Raging Quadruple Blow': 'MO_CHAINCOMBO',
  'Raging Thrust': 'MO_COMBOFINISH',
  'Dragon Combo': 'SR_DRAGONCOMBO',
  'Blast Mine': 'HT_BLASTMINE',
  'Bomb': 'AM_DEMONSTRATION',
  'Cannon Spear': 'LG_CANNONSPEAR',
  'Dragon Training': 'RK_DRAGONTRAINING',
  'Dragon Water Breath': 'RK_DRAGONBREATH_WATER',
  'Earthquake': 'NPC_EARTHQUAKE',
  'Echo Song': 'MI_ECHOSONG',
  'Falling Star': 'SJ_FALLINGSTAR',
  'Fatal Menace': 'GC_VENOMPRESSURE',
  'Fire Insignia': 'SO_FIRE_INSIGNIA',
  'Fire Wall': 'MG_FIREWALL',
  'Freezing Spear': 'NJ_HYOUSYOURAKU',
  'Fresh Shrimp': 'SU_FRESHSHRIMP',
  'Gatling Fever': 'GS_GATLINGFEVER',
  'Grooming': 'SU_GROOMING',
  'Harmonize': 'MI_HARMONIZE',
  'Heat Barrel': 'RL_HEAT_BARREL',
  'Ice Launcher': 'SO_ICE_LAUNCHER',
  'Improvised Song': 'WM_RANDOMIZESPELL',
  'Knuckle Boost': 'NC_BOOSTKNUCKLE',
  'Lightning Bolt': 'MG_LIGHTNINGBOLT',
  'Lover Symphony': 'WA_SYMPHONY_OF_LOVER',
  'Lucifer Morocc': 'DK_LUCIFERMOROCC',
  'Lunar Eclipse': 'SKE_RISING_MOON',
  'Lunar Heat': 'SJ_FULLMOONKICK',
  "Martyr's Reckoning": 'PA_SACRIFICE',
  'Metallic Sound': 'WM_METALICSOUND',
  'Moon Kick': 'SJ_NEWMOONKICK',
  'Ninja Aura': 'NJ_NINPOU',
  'Power Swing': 'NC_POWERSWING',
  'Raid': 'RG_RAID',
  'Rapid Smiting': 'IG_GRAND_JUDGEMENT',
  'Shockwave Trap': 'HT_SHOCKWAVE',
  'Shrimp Party': 'SU_BUNCHOFSHRIMP',
  'Sling Item': 'SU_SLINGITEM',
  'Solar Kick': 'SJ_PROMINENCEKICK',
  'Spirit of Savage': 'SU_SVG_SPIRIT',
  'Sprit Of Savage': 'SU_SVG_SPIRIT',
  'Steel Body': 'MO_STEELBODY',
  'Suicidal Destruction': 'SR_TIGERCANNON',
  "Thor's Hammer": 'RL_HAMMER_OF_GOD',
  'Throw Shuriken': 'NJ_SYURIKEN',
  'Throw Spirit Charm': 'KO_HAPPOKUNAI',
  'Tracking': 'GS_TRACKING',
  'Tuna Party': 'SU_TUNAPARTY',
  'Vanishing Point': 'LG_BANISHINGPOINT',
  'Water Escape Technique': 'NJ_SUITON',
  'Windmill Rush': 'MI_RUSH_WINDMILL',
  'Wounding Shot': 'RL_QD_SHOT',
  'Burst Attack': 'SR_DRAGONCOMBO',
  // Not real skills, but used in LEARN_SKILL conditions — map anyway
  'Guillotine Cross': '_CALC_GUILLOTINE_CROSS',  // class reference, not skill
  'Soul Reaper': '_CALC_SOUL_REAPER',             // class reference
  // LATAM-specific
  'Melodia de Morfeu': 'WM_LULLABY_DEEPSLEEP',
  // 4th class / unreleased
  'Aerial Assault': 'WH_GALESTORM',
  'Chop Chop': 'SHC_ETERNAL_SLASH',
  'Crazy Vines': 'BO_CRAZY_VINES',
  'Edge Protection': 'IG_REBOUND_SHIELD',
  'Frenzy Fang': 'ABC_FROM_THE_ABYSS',
  'Hela Flames': 'CD_PETITIO',
  'Ice Coffin': 'EM_ICE_COFFIN',
  "Loki's Punishment": 'ABC_STRIP_SHADOW',
  'Nerthus Punishment': 'CD_FRAMEN',
  'Proton Cannon': 'MT_A_MACHINE',
  'Resonance': 'WM_REVERBERATION',
  'Retaliation': 'LG_RAYOFGENESIS',
  'Rune Explosion': 'RK_IGNITIONBREAK',
  'Runic Explosion': 'RK_IGNITIONBREAK',
  'Star Rain': 'SJ_FALLINGSTAR',
  // Tarou Card — item ref, not skill
  'Tarou Card': '_CALC_TAROU_CARD',
};

// ─── Load registry and build maps ───────────────────────────────────
const registry = JSON.parse(fs.readFileSync(REGISTRY_JSON, 'utf-8'));

const enToAegis = new Map();
const ptbrToAegis = new Map();
for (const [aegis, entry] of Object.entries(registry)) {
  enToAegis.set(entry.en, aegis);
  if (!ptbrToAegis.has(entry.ptbr)) {
    ptbrToAegis.set(entry.ptbr, aegis);
  }
}

// ─── Known prefixes for skill keys ──────────────────────────────────
// Double-underscore prefixes
const DOUBLE_PREFIXES = ['cd__', 'vct__', 'fct__', 'fix_vct__', 'acd__', 'autocast__', 'dmg__'];
// Single-underscore prefix
const SINGLE_PREFIX = 'flat_';

// ─── Non-skill keys to skip ─────────────────────────────────────────
const STAT_KEYS = new Set([
  'atk', 'matk', 'atkPercent', 'matkPercent', 'aspd', 'aspdPercent',
  'vct', 'acd', 'fct', 'range', 'melee', 'criDmg', 'criDmgPercent',
  'str', 'agi', 'vit', 'int', 'dex', 'luk',
  'def', 'mdef', 'flee', 'hit', 'cri',
  'hp', 'sp', 'hpPercent', 'spPercent',
  'weight', 'baseAtk', 'baseMAtk', 'hardDef', 'hardMdef', 'perfectDodge',
  'pAtk', 'sMatk', 'res', 'mRes', 'trait_str', 'trait_agi', 'trait_vit',
  'trait_int', 'trait_dex', 'trait_luk', 'trait_pow', 'trait_sta', 'trait_wis',
  'trait_spl', 'trait_con', 'trait_crt',
  'pow', 'sta', 'wis', 'spl', 'con', 'crt',
  'hpRecovery', 'spRecovery', 'healPercent',
  'class', 'classAll', 'weapon_atk', 'weapon_matk',
  'arrow_atk', 'arrow_matk', 'arrow_element',
  'shield_def', 'shield_mdef',
  'x_bow_atk', 'x_dagger_atk', 'x_axe_atk', 'x_mace_atk', 'x_book_atk',
  'x_katar_atk', 'x_knuckle_atk', 'x_revolver_atk', 'x_gatling_atk',
  'x_rifle_atk', 'x_shotgun_atk', 'x_grenade_atk', 'x_whip_atk',
  'x_instrument_atk', 'x_huuma_atk', 'x_sword_atk', 'x_spear_atk',
  'x_twohandsword_atk', 'x_twohandspear_atk', 'x_staff_atk',
  'x_rod_atk', 'x_twohandstaff_atk', 'x_twohandrod_atk',
  'x_fist_atk', 'x_shuriken_atk', 'x_kunai_atk',
  'whip_cri',
  'basicAtk',
  // Extra stat keys found in item.json but not in initial list
  'allRes', 'allStat', 'allStatus', 'atk2', 'matk2', 'hp2', 'sp2',
  'bowDmg', 'bowRange', 'fctPercent', 'heal', 'healRecovery', 'healingPlus',
  'hitPercent', 'ignore_size_penalty', 'lDmg', 'perfectHit',
  'res_element_earth', 'res_element_fire', 'res_element_water', 'res_element_wind',
  'softDef', 'softMdef', 'x_atk', 'x_hp', 'x_matk', 'x_sp',
]);

// Keys starting with these are non-skill stats
const STAT_PREFIXES = [
  'p_', 'm_', 'p_my_', 'm_my_',
  'p_pene_', 'm_pene_',
  'propertyAtk', 'bonus_',
];

function isStatKey(key) {
  if (STAT_KEYS.has(key)) return true;
  for (const prefix of STAT_PREFIXES) {
    if (key.startsWith(prefix)) return true;
  }
  // chance__ keys are stat modifiers, not skills
  if (key.startsWith('chance__')) return true;
  // Card reference keys (contain __Card)
  if (key.includes('__Card')) return true;
  return false;
}

// ─── Translate a skill name to aegis ────────────────────────────────
function translateSkill(name) {
  return enToAegis.get(name) || ptbrToAegis.get(name) || ITEM_EXTRA_MAP[name] || null;
}

// ─── Migrate a script key ───────────────────────────────────────────
function migrateKey(key) {
  // Check double prefixes first (longer match wins)
  for (const prefix of DOUBLE_PREFIXES) {
    if (key.startsWith(prefix)) {
      const skillPart = key.slice(prefix.length);
      const aegis = translateSkill(skillPart);
      if (aegis) return { newKey: prefix + aegis, changed: true };
      return { newKey: key, changed: false, unmapped: skillPart };
    }
  }

  // Check single prefix
  if (key.startsWith(SINGLE_PREFIX)) {
    const skillPart = key.slice(SINGLE_PREFIX.length);
    const aegis = translateSkill(skillPart);
    if (aegis) return { newKey: SINGLE_PREFIX + aegis, changed: true };
    return { newKey: key, changed: false, unmapped: skillPart };
  }

  // Bare skill name (no prefix)
  if (isStatKey(key)) return { newKey: key, changed: false };

  const aegis = translateSkill(key);
  if (aegis) return { newKey: aegis, changed: true };

  // Unknown key — could be a skill we don't have in registry, or a stat
  return { newKey: key, changed: false, unmapped: key };
}

// ─── Migrate skill references inside value strings ──────────────────
function migrateValue(val) {
  if (typeof val !== 'string') return { newVal: val, changed: false };

  let newVal = val;
  let changed = false;
  const unmapped = [];

  // LEARN_SKILL[SkillName==N] and LEARN_SKILL2[SkillName==N]
  newVal = newVal.replace(/LEARN_SKILL2?\[([^\]]+?)==(\d+)\]/g, (match, skillName, level) => {
    const aegis = translateSkill(skillName);
    if (aegis) { changed = true; return match.replace(skillName, aegis); }
    unmapped.push(skillName);
    return match;
  });

  // ACTIVE_SKILL[SkillName]
  newVal = newVal.replace(/ACTIVE_SKILL\[([^\]]+)\]/g, (match, skillName) => {
    const aegis = translateSkill(skillName);
    if (aegis) { changed = true; return `ACTIVE_SKILL[${aegis}]`; }
    unmapped.push(skillName);
    return match;
  });

  // level:SkillName (followed by === or ---)
  newVal = newVal.replace(/level:([A-Za-z][A-Za-z0-9 '-]+?)(?=[\d(=\-])/g, (match, skillName) => {
    const trimmed = skillName.trim();
    const aegis = translateSkill(trimmed);
    if (aegis) { changed = true; return `level:${aegis}`; }
    // Could be "level:110===5" (level number, not skill) — don't flag
    if (/^\d+$/.test(trimmed)) return match;
    unmapped.push(trimmed);
    return match;
  });

  return { newVal, changed, unmapped: unmapped.length > 0 ? unmapped : undefined };
}

// ─── Main ───────────────────────────────────────────────────────────
function main() {
  console.log(`Loading item.json...`);
  const items = JSON.parse(fs.readFileSync(ITEM_JSON, 'utf-8'));
  const itemIds = Object.keys(items);
  console.log(`  ${itemIds.length} items`);

  let keysChanged = 0;
  let valuesChanged = 0;
  let itemsModified = 0;
  const unmappedSkills = new Set();
  const changes = [];

  for (const itemId of itemIds) {
    const item = items[itemId];
    if (!item.script || typeof item.script !== 'object') continue;

    const oldScript = item.script;
    const newScript = {};
    let modified = false;

    for (const [key, values] of Object.entries(oldScript)) {
      // Migrate key
      const { newKey, changed: keyChanged, unmapped: keyUnmapped } = migrateKey(key);
      if (keyChanged) {
        keysChanged++;
        modified = true;
        changes.push(`KEY: "${key}" → "${newKey}" (item ${itemId})`);
      }
      if (keyUnmapped) unmappedSkills.add(keyUnmapped);

      // Migrate values
      const newValues = [];
      for (const val of values) {
        const { newVal, changed: valChanged, unmapped: valUnmapped } = migrateValue(val);
        if (valChanged) {
          valuesChanged++;
          modified = true;
          changes.push(`VAL: "${val}" → "${newVal}" (item ${itemId}, key ${newKey})`);
        }
        if (valUnmapped) valUnmapped.forEach(s => unmappedSkills.add(s));
        newValues.push(newVal);
      }

      newScript[newKey] = newValues;
    }

    if (modified) {
      itemsModified++;
      items[itemId].script = newScript;
    }
  }

  console.log(`\nResults:`);
  console.log(`  Keys migrated:    ${keysChanged}`);
  console.log(`  Values migrated:  ${valuesChanged}`);
  console.log(`  Items modified:   ${itemsModified}`);

  if (unmappedSkills.size > 0) {
    console.log(`\n⚠ Unmapped skills (${unmappedSkills.size}):`);
    for (const s of [...unmappedSkills].sort()) {
      console.log(`  - "${s}"`);
    }
  }

  if (dryRun) {
    console.log(`\n─── DRY RUN: changes preview (first 50) ───`);
    for (const c of changes.slice(0, 50)) {
      console.log(`  ${c}`);
    }
    if (changes.length > 50) console.log(`  ... and ${changes.length - 50} more`);
    console.log(`\n⚠ DRY RUN — no files written.`);
  } else {
    fs.writeFileSync(ITEM_JSON, JSON.stringify(items, null, 2) + '\n', 'utf-8');
    console.log(`\n✅ Written to ${ITEM_JSON}`);
  }
}

main();
