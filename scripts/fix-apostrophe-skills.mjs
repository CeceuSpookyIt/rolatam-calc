#!/usr/bin/env node
/**
 * Fix apostrophe-containing skill names and remaining EN names
 * that the main migration script missed.
 */

import fs from 'fs';
import path from 'path';

const ROOT = 'D:/rag/tong-calc-ro';
const registry = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/app/constants/skill-registry-data.json'), 'utf-8'));

// Build ptbr lookup
const aegisToPtbr = new Map();
for (const [aegis, entry] of Object.entries(registry)) {
  aegisToPtbr.set(aegis, entry.ptbr);
}

// Skills to fix: EN name → aegis
const FIXES = {
  "Bragi's Poem": 'BA_POEMBRAGI',
  "Frigg's Song": 'WM_FRIGG_SONG',
  "Lerad's Dew": 'WM_LERADS_DEW',
  "Odin's Power": 'ALL_ODINS_POWER',
  "Owl's Eye": 'AC_OWL',
  "Vulture's Eye": 'AC_VULTURE',
  "God's Hammer": 'RL_HAMMER_OF_GOD',
  "Rich's Coin": 'RL_RICHS_COIN',
  "Heaven's Drive": 'WZ_HEAVENDRIVE',
  "Hell's Drive": 'HN_HELLS_DRIVE',
  'Cold Bolt': 'MG_COLDBOLT',
  'Fire Bolt': 'MG_FIREBOLT',
  'Lightening Bolt': 'MG_LIGHTNINGBOLT',
  'Earth Spike': 'WZ_EARTHSPIKE',
  'Kiling Cloud': 'SO_CLOUD_KILL',
  'Fatal Manace': 'GC_VENOMPRESSURE',
};

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findTsFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...findTsFiles(full));
    else if (entry.name.endsWith('.ts')) results.push(full);
  }
  return results;
}

const dirs = ['src/app/jobs', 'src/app/constants', 'src/app/layout', 'src/app/utils'];
const files = dirs.flatMap(d => findTsFiles(path.join(ROOT, d)));
let totalFixed = 0;
let totalReplacements = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  const original = content;
  let fileReplacements = 0;

  for (const [en, aegis] of Object.entries(FIXES)) {
    const ptbr = aegisToPtbr.get(aegis) || en;
    const esc = escapeRegex(en);

    // name: "EN Name" or name: 'EN Name'
    const nameRe = new RegExp(`name: ["']${esc}["']`, 'g');
    content = content.replace(nameRe, () => { fileReplacements++; return `name: '${aegis}'`; });

    // value: "EN Name..." or value: 'EN Name...'
    const valueReD = new RegExp(`value: "${esc}([^"]*)"`, 'g');
    content = content.replace(valueReD, (_, suffix) => { fileReplacements++; return `value: '${aegis}${suffix}'`; });
    const valueReS = new RegExp(`value: '${esc}([^']*)'`, 'g');
    content = content.replace(valueReS, (_, suffix) => { fileReplacements++; return `value: '${aegis}${suffix}'`; });

    // label: "EN Name..." or label: 'EN Name...'
    const labelReD = new RegExp(`label: "${esc}([^"]*)"`, 'g');
    content = content.replace(labelReD, (_, suffix) => { fileReplacements++; return `label: '${ptbr}${suffix}'`; });
    const labelReS = new RegExp(`label: '${esc}([^']*)'`, 'g');
    content = content.replace(labelReS, (_, suffix) => { fileReplacements++; return `label: '${ptbr}${suffix}'`; });

    // Record keys: "EN Name": or 'EN Name':
    const keyReD = new RegExp(`"${esc}":`, 'g');
    content = content.replace(keyReD, () => { fileReplacements++; return `'${aegis}':`; });
    const keyReS = new RegExp(`'${esc}':`, 'g');
    content = content.replace(keyReS, () => { fileReplacements++; return `'${aegis}':`; });

    // Function calls: learnLv, isSkillActive, activeSkillLv
    for (const fn of ['learnLv', 'isSkillActive', 'activeSkillLv']) {
      const fnReD = new RegExp(`${fn}\\("${esc}"\\)`, 'g');
      content = content.replace(fnReD, () => { fileReplacements++; return `${fn}('${aegis}')`; });
      const fnReS = new RegExp(`${fn}\\('${esc}'\\)`, 'g');
      content = content.replace(fnReS, () => { fileReplacements++; return `${fn}('${aegis}')`; });
    }

    // skillName === "EN Name" or skillName === 'EN Name'
    const cmpReD = new RegExp(`=== "${esc}"`, 'g');
    content = content.replace(cmpReD, () => { fileReplacements++; return `=== '${aegis}'`; });
    const cmpReS = new RegExp(`=== '${esc}'`, 'g');
    content = content.replace(cmpReS, () => { fileReplacements++; return `=== '${aegis}'`; });
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf-8');
    totalFixed++;
    totalReplacements += fileReplacements;
    console.log(`  ✓ ${path.relative(ROOT, file)} — ${fileReplacements} replacements`);
  }
}

console.log(`\nFixed: ${totalFixed} files, ${totalReplacements} replacements`);
