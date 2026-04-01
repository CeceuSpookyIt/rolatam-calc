#!/usr/bin/env node
/**
 * migrate-job-files.mjs
 *
 * Migrates skill references from EN display names to aegisNames in TypeScript files.
 * Also translates label fields from EN to PT-BR.
 *
 * Patterns replaced:
 *   name: 'EN Name'          → name: 'AEGIS_NAME'
 *   value: 'EN Name==N'      → value: 'AEGIS_NAME==N'
 *   value: 'EN Name Elem==N' → value: 'AEGIS_NAME Elem==N'  (element suffix preserved)
 *   values: ['[pfx] EN==N']  → values: ['[pfx] AEGIS_NAME==N']
 *   label: 'EN Name LvN'     → label: 'PT-BR Name LvN'
 *   label: '[pfx] EN LvN'    → label: '[pfx] PT-BR LvN'
 *   learnLv('EN Name')       → learnLv('AEGIS_NAME')
 *   isSkillActive('EN')      → isSkillActive('AEGIS_NAME')
 *   activeSkillLv('EN')      → activeSkillLv('AEGIS_NAME')
 *   skillName === 'EN'       → skillName === 'AEGIS_NAME'
 *   Record keys and name: in autocast-skill-registry.ts
 *
 * CRITICAL: Array order is NEVER changed — only string contents are replaced in-place.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import _glob from 'glob';
const globSync = _glob.sync;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ─── Load registry ───────────────────────────────────────────────────────────
const REGISTRY_JSON = path.join(ROOT, 'src/app/constants/skill-registry-data.json');
const registry = JSON.parse(fs.readFileSync(REGISTRY_JSON, 'utf-8'));

// Build EN → aegis map
const enToAegis = new Map();
const aegisToPtbr = new Map();
for (const [aegis, entry] of Object.entries(registry)) {
  enToAegis.set(entry.en, aegis);
  aegisToPtbr.set(aegis, entry.ptbr);
}

// Extra mappings for alternate EN names
const EXTRA = {
  'Acid Demonstration': 'CR_ACIDDEMONSTRATION',
  'Nature Friendly': 'WH_NATUREFRIENDLY',
  'Bio Cannibalize': 'AM_CANNIBALIZE',
  'Cart Remodeling': 'GN_REMODELING_CART',
  'Cross Wound': 'SHC_CROSS_SLASH',
  'Dance With Wug': 'WM_DANCE_WITH_WUG',
  'Dragon Training': 'RK_DRAGONTRAINING',
  'Concentration': 'LK_CONCENTRATION',
  'Intimidate': 'RG_INTIMIDATE',
  'Kiling Cloud': 'SO_CLOUD_KILL',
  'Knowledge of Sun Moon and Star': 'SG_KNOWLEDGE',
  'Madogear License': 'NC_MADOLICENCE',
  'Ninja Aura': 'NJ_NINPOU',
  'Vigor condensation': 'DK_VIGOR',
  'Wounding Shot': 'RL_QD_SHOT',
  'Burst Attack': 'SR_DRAGONCOMBO',
  'Cannon Spear': 'LG_CANNONSPEAR',
  'Dragon Combo': 'SR_DRAGONCOMBO',
  'Freezing Spear': 'NJ_HYOUSYOURAKU',
  'Knuckle Boost': 'NC_BOOSTKNUCKLE',
  'Power Swing': 'NC_POWERSWING',
  'Raid': 'RG_RAID',
  'Spirit of Savage': 'SU_SVG_SPIRIT',
  'Sprit Of Savage': 'SU_SVG_SPIRIT',
  'Suicidal Destruction': 'SR_TIGERCANNON',
  'Swift Trap': 'WH_SWIFTTRAP',
  'Flamen': 'CD_FRAMEN',
  'Rapid Smiting': 'IG_GRAND_JUDGEMENT',
  'Rock Down Arrow': 'AG_ROCK_DOWN',
  'Fist Spell': 'SO_SPELLFIST',
  'Special Pharmacy': 'GN_S_PHARMACY',
};
for (const [en, aegis] of Object.entries(EXTRA)) {
  if (!enToAegis.has(en)) enToAegis.set(en, aegis);
}

// Build EN → ptbr convenience map
const enToPtbr = new Map();
for (const [en, aegis] of enToAegis) {
  const ptbr = aegisToPtbr.get(aegis);
  if (ptbr) enToPtbr.set(en, ptbr);
}

// Sort EN names by length descending (longer first to avoid partial matches)
const sortedEN = [...enToAegis.keys()].sort((a, b) => b.length - a.length);

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Escape string for use in regex */
function escRE(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Check if a string looks like an aegisName (ALL_CAPS_WITH_UNDERSCORES, optionally with digits) */
function isAegisName(s) {
  return /^[A-Z][A-Z0-9_]+$/.test(s);
}

/** Check if a string starts with _ (internal name like _Meister_Rush) */
function isInternalName(s) {
  return s.startsWith('_');
}

// Known element suffixes that can appear after a skill name in value fields
const ELEMENT_SUFFIXES = ['Fire', 'Water', 'Wind', 'Earth', 'Holy', 'Shadow', 'Ghost', 'Undead', 'Poison', 'Neutral', 'Released Fire', 'Released Water', 'Released Wind', 'Released Earth'];

// ─── Collect target files ────────────────────────────────────────────────────
const targetDirs = [
  'src/app/jobs/',
  'src/app/constants/share-passive-skills/',
  'src/app/constants/share-active-skills/',
];

const extraFiles = [
  'src/app/constants/job-buffs.ts',
  'src/app/constants/autocast-skill-registry.ts',
  'src/app/utils/is-skill-can-edp.ts',
];

let allFiles = [];

for (const dir of targetDirs) {
  const fullDir = path.join(ROOT, dir);
  if (fs.existsSync(fullDir)) {
    const files = globSync('**/*.ts', { cwd: fullDir, absolute: false });
    allFiles.push(...files.map(f => path.join(fullDir, f)));
  }
}

for (const f of extraFiles) {
  const fullPath = path.join(ROOT, f);
  if (fs.existsSync(fullPath)) {
    allFiles.push(fullPath);
  } else {
    console.log(`⚠ File not found, skipping: ${f}`);
  }
}

console.log(`Found ${allFiles.length} files to process.\n`);

// ─── Stats ───────────────────────────────────────────────────────────────────
let totalReplacements = 0;
let filesModified = 0;
const unhandled = [];

// ─── Process each file ──────────────────────────────────────────────────────
for (const filePath of allFiles) {
  const relPath = path.relative(ROOT, filePath);
  const original = fs.readFileSync(filePath, 'utf-8');
  let content = original;
  let fileReplacements = 0;

  function logReplace(pattern, oldVal, newVal, line) {
    console.log(`  [${pattern}] "${oldVal}" → "${newVal}"`);
    fileReplacements++;
    totalReplacements++;
  }

  // ── Pattern A: name: 'EN Name' → name: 'AEGIS_NAME' ────────────────────
  // Also handles Record keys in autocast-skill-registry: 'EN Name': {
  for (const en of sortedEN) {
    const aegis = enToAegis.get(en);
    const escaped = escRE(en);

    // A1: name: 'EN Name'  (but NOT name: '_internal')
    const nameRe = new RegExp(`(name:\\s*')${escaped}(')`,'g');
    content = content.replace(nameRe, (match, pre, post) => {
      logReplace('name', en, aegis);
      return `${pre}${aegis}${post}`;
    });

    // A2: Record key in autocast registry: 'EN Name': {
    // Match:  'EN Name': {   or   'EN Name': {\n
    const recordKeyRe = new RegExp(`^(\\s*')${escaped}(':\\s*\\{)`, 'gm');
    content = content.replace(recordKeyRe, (match, pre, post) => {
      logReplace('record-key', en, aegis);
      return `${pre}${aegis}${post}`;
    });

    // A3: linkedSkill: 'EN Name'
    const linkedRe = new RegExp(`(linkedSkill:\\s*')${escaped}(')`,'g');
    content = content.replace(linkedRe, (match, pre, post) => {
      logReplace('linkedSkill', en, aegis);
      return `${pre}${aegis}${post}`;
    });
  }

  // ── Pattern B: value: 'EN Name==N' or value: 'EN Name Element==N' ──────
  // Also handles value: '[prefix] EN Name==N'
  // Regex: value: '([prefix] )?EN Name( Element)?==N'
  for (const en of sortedEN) {
    const aegis = enToAegis.get(en);
    const escaped = escRE(en);

    // value: 'EN Name==N'
    // value: '[Improved] EN Name==N'
    // value: 'EN Name Fire==N'
    const valueRe = new RegExp(
      `(value:\\s*'(?:\\[[^\\]]*\\]\\s*)?)${escaped}((?:\\s+(?:${ELEMENT_SUFFIXES.map(escRE).join('|')}))?==\\d+')`,
      'g'
    );
    content = content.replace(valueRe, (match, pre, post) => {
      logReplace('value', en, aegis);
      return `${pre}${aegis}${post}`;
    });
  }

  // ── Pattern C: values array items: '[prefix] EN Name==N' ───────────────
  for (const en of sortedEN) {
    const aegis = enToAegis.get(en);
    const escaped = escRE(en);

    // Inside values arrays: '..EN Name==N..'
    const valuesItemRe = new RegExp(
      `('(?:\\[[^\\]]*\\]\\s*)?)${escaped}((?:\\s+(?:${ELEMENT_SUFFIXES.map(escRE).join('|')}))?==\\d+')`,
      'g'
    );
    // Only apply within values: [...] context — but since we sorted by length desc
    // and value: patterns are already handled, we can apply broadly to catch values array items.
    // We need to be careful not to double-replace. Check if already an aegis name at that position.
    content = content.replace(valuesItemRe, (match, pre, post) => {
      // Skip if already replaced (aegis name)
      if (isAegisName(en)) return match;
      logReplace('values-item', en, aegis);
      return `${pre}${aegis}${post}`;
    });
  }

  // ── Pattern D: label translations (EN → PT-BR) ────────────────────────
  // label: 'EN Name LvN'        → label: 'PT-BR Name LvN'
  // label: '[prefix] EN LvN'    → label: '[prefix] PT-BR LvN'
  // label: 'EN Name'            → label: 'PT-BR Name'  (only if exact skill name)
  // label: 'EN Name (extra)'    → label: 'PT-BR Name (extra)' (preserve parenthetical)
  for (const en of sortedEN) {
    const ptbr = enToPtbr.get(en);
    if (!ptbr) continue;
    const escaped = escRE(en);

    // label: '([prefix] )?EN Name( LvN)?( (extra))?'
    const labelRe = new RegExp(
      `(label:\\s*'(?:\\[[^\\]]*\\]\\s*)?)${escaped}((?:\\s+Lv\\d+)?(?:\\s+\\([^)]*\\))?')`,
      'g'
    );
    content = content.replace(labelRe, (match, pre, post) => {
      // Don't replace if label is just 'Lv N' or '-'
      logReplace('label', en, ptbr);
      return `${pre}${ptbr}${post}`;
    });
  }

  // ── Pattern E: learnLv('EN Name') ─────────────────────────────────────
  for (const en of sortedEN) {
    const aegis = enToAegis.get(en);
    const escaped = escRE(en);

    const learnLvRe = new RegExp(`(learnLv\\(')${escaped}('\\))`, 'g');
    content = content.replace(learnLvRe, (match, pre, post) => {
      logReplace('learnLv', en, aegis);
      return `${pre}${aegis}${post}`;
    });
  }

  // ── Pattern F: isSkillActive('EN Name') ───────────────────────────────
  for (const en of sortedEN) {
    const aegis = enToAegis.get(en);
    const escaped = escRE(en);

    const isActiveRe = new RegExp(`(isSkillActive\\(')${escaped}('\\))`, 'g');
    content = content.replace(isActiveRe, (match, pre, post) => {
      logReplace('isSkillActive', en, aegis);
      return `${pre}${aegis}${post}`;
    });
  }

  // ── Pattern G: activeSkillLv('EN Name') ───────────────────────────────
  for (const en of sortedEN) {
    const aegis = enToAegis.get(en);
    const escaped = escRE(en);

    const activeSkillLvRe = new RegExp(`(activeSkillLv\\(')${escaped}('\\))`, 'g');
    content = content.replace(activeSkillLvRe, (match, pre, post) => {
      logReplace('activeSkillLv', en, aegis);
      return `${pre}${aegis}${post}`;
    });
  }

  // ── Pattern H: skillName === 'EN Name' ────────────────────────────────
  for (const en of sortedEN) {
    const aegis = enToAegis.get(en);
    const escaped = escRE(en);

    const skillNameRe = new RegExp(`(skillName\\s*===\\s*')${escaped}(')`, 'g');
    content = content.replace(skillNameRe, (match, pre, post) => {
      logReplace('skillName===', en, aegis);
      return `${pre}${aegis}${post}`;
    });
  }

  // ── Pattern I: is-skill-can-edp.ts — object keys: 'EN Name': false ───
  for (const en of sortedEN) {
    const aegis = enToAegis.get(en);
    const escaped = escRE(en);

    const objKeyRe = new RegExp(`^(\\s*')${escaped}(':\\s*false)`, 'gm');
    content = content.replace(objKeyRe, (match, pre, post) => {
      logReplace('obj-key', en, aegis);
      return `${pre}${aegis}${post}`;
    });
  }

  // ── Write back if changed ─────────────────────────────────────────────
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ ${relPath} — ${fileReplacements} replacements\n`);
    filesModified++;
  }
}

// ─── Post-migration: scan for remaining EN-like skill names ─────────────────
console.log('\n═══════════════════════════════════════════════════════════');
console.log('  SUMMARY');
console.log('═══════════════════════════════════════════════════════════');
console.log(`  Files processed: ${allFiles.length}`);
console.log(`  Files modified:  ${filesModified}`);
console.log(`  Total replacements: ${totalReplacements}`);
console.log('═══════════════════════════════════════════════════════════\n');

// Scan for potentially unhandled skill name strings
console.log('Scanning for potentially unhandled EN skill names...\n');

const SKIP_PATTERNS = [
  /^basicAtk$/,
  /^-$/,
  /^Lv\s*\d+$/,
  /^Yes$/,
  /^No$/,
  /^_/,           // internal names
  /^[A-Z][A-Z0-9_]+$/,  // already aegis
];

let unhandledCount = 0;
for (const filePath of allFiles) {
  const relPath = path.relative(ROOT, filePath);
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip imports and comments
    if (/^\s*import\s/.test(line)) continue;
    if (/^\s*\/\//.test(line)) continue;

    // Check for name: 'something' where something is an EN skill name
    const nameMatch = line.match(/name:\s*'([^']+)'/);
    if (nameMatch) {
      const val = nameMatch[1];
      if (!SKIP_PATTERNS.some(p => p.test(val)) && enToAegis.has(val)) {
        console.log(`  ⚠ UNHANDLED name: "${val}" at ${relPath}:${i + 1}`);
        unhandledCount++;
      }
    }

    // Check for learnLv/isSkillActive/activeSkillLv with EN names
    const funcMatch = line.match(/(?:learnLv|isSkillActive|activeSkillLv)\('([^']+)'\)/g);
    if (funcMatch) {
      for (const m of funcMatch) {
        const val = m.match(/'([^']+)'/)[1];
        if (!SKIP_PATTERNS.some(p => p.test(val)) && enToAegis.has(val)) {
          console.log(`  ⚠ UNHANDLED func arg: "${val}" at ${relPath}:${i + 1}`);
          unhandledCount++;
        }
      }
    }

    // Check for skillName === 'EN'
    const skillEqMatch = line.match(/skillName\s*===\s*'([^']+)'/g);
    if (skillEqMatch) {
      for (const m of skillEqMatch) {
        const val = m.match(/'([^']+)'/)[1];
        if (!SKIP_PATTERNS.some(p => p.test(val)) && enToAegis.has(val)) {
          console.log(`  ⚠ UNHANDLED skillName===: "${val}" at ${relPath}:${i + 1}`);
          unhandledCount++;
        }
      }
    }
  }
}

if (unhandledCount === 0) {
  console.log('  No unhandled EN skill names found — all clean!\n');
} else {
  console.log(`\n  ⚠ ${unhandledCount} potentially unhandled occurrences.\n`);
}
