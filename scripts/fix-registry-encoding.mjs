#!/usr/bin/env node
/**
 * Fix Latin-1 decimal escapes in skill-registry-data.json PT-BR strings.
 * Parses the JSON, fixes each ptbr value, re-serializes.
 */
import fs from 'fs';

const filePath = 'src/app/constants/skill-registry-data.json';
const registry = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

const escapeRe = /\\(\d{2,3})/g;

function fixStr(str) {
  return str.replace(escapeRe, (match, numStr) => {
    const code = parseInt(numStr, 10);
    if (code >= 128 && code <= 255) return String.fromCharCode(code);
    return match;
  });
}

let fixed = 0;
for (const [aegis, entry] of Object.entries(registry)) {
  const newPtbr = fixStr(entry.ptbr);
  if (newPtbr !== entry.ptbr) {
    entry.ptbr = newPtbr;
    fixed++;
  }
  const newEn = fixStr(entry.en);
  if (newEn !== entry.en) {
    entry.en = newEn;
    fixed++;
  }
}

fs.writeFileSync(filePath, JSON.stringify(registry, null, 2) + '\n', 'utf-8');
console.log(`Fixed ${fixed} strings`);

// Verify
const d = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
for (const k of ['RK_IGNITIONBREAK', 'WM_METALICSOUND', 'RL_HAMMER_OF_GOD', 'SJ_PROMINENCEKICK', 'CR_ACIDDEMONSTRATION']) {
  console.log(`${k}: ${d[k]?.ptbr}`);
}
