#!/usr/bin/env node
/**
 * Fix Latin-1 octal escapes in .ts files.
 * Converts literal \NNN sequences (backslash + 3 digits) to proper UTF-8 characters.
 */

import fs from 'fs';
import path from 'path';

const ROOT = 'D:/rag/tong-calc-ro';

function findTsFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...findTsFiles(full));
    else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts')) results.push(full);
  }
  return results;
}

const dirs = [
  path.join(ROOT, 'src/app/jobs'),
  path.join(ROOT, 'src/app/constants'),
];

const files = dirs.flatMap(d => findTsFiles(d));
console.log(`Scanning ${files.length} .ts files...`);

const escapeRegex = /\\(\d{2,3})/g;
let totalFixed = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');

  if (!escapeRegex.test(content)) continue;
  escapeRegex.lastIndex = 0;

  const original = content;
  // Try as decimal first (GRF uses Latin-1 byte values as decimal),
  // fall back to octal interpretation
  content = content.replace(escapeRegex, (match, numStr) => {
    // First try decimal (e.g. \193 = char 193 = Á in Latin-1)
    const dec = parseInt(numStr, 10);
    if (dec >= 128 && dec <= 255) {
      return String.fromCharCode(dec);
    }
    // Then try octal (e.g. \237 = 159 decimal)
    const oct = parseInt(numStr, 8);
    if (oct >= 128 && oct <= 255) {
      return String.fromCharCode(oct);
    }
    return match;
  });

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf-8');
    const count = (original.match(/\\(\d{3})/g) || []).length;
    totalFixed++;
    console.log(`  ✓ ${path.relative(ROOT, file)} — ${count} escapes`);
  }
}

console.log(`\nFixed: ${totalFixed} files`);
