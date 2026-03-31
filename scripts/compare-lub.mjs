import { readFileSync } from 'fs';

function decodeLuaString(s) {
  const bytes = [];
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '\\' && i + 1 < s.length) {
      const next = s[i + 1];
      if (next >= '0' && next <= '9') {
        let numStr = next;
        if (i + 2 < s.length && s[i + 2] >= '0' && s[i + 2] <= '9') {
          numStr += s[i + 2];
          if (i + 3 < s.length && s[i + 3] >= '0' && s[i + 3] <= '9') numStr += s[i + 3];
        }
        bytes.push(parseInt(numStr));
        i += numStr.length;
      } else if (next === 'n') { bytes.push(10); i++; }
      else if (next === 't') { bytes.push(9); i++; }
      else if (next === '\\') { bytes.push(92); i++; }
      else if (next === '"') { bytes.push(34); i++; }
      else bytes.push(s.charCodeAt(i));
    } else {
      bytes.push(s.charCodeAt(i));
    }
  }
  return Buffer.from(bytes).toString('utf-8');
}

function parseIds(content) {
  const ids = new Map();
  const regex = /^\s*\[(\d+)\]\s*=\s*\{/gm;
  const starts = [];
  let m;
  while ((m = regex.exec(content)) !== null) {
    starts.push({ id: parseInt(m[1]), index: m.index });
  }
  for (let i = 0; i < starts.length; i++) {
    const { id, index: si } = starts[i];
    const ei = i + 1 < starts.length ? starts[i + 1].index : si + 5000;
    const block = content.substring(si, ei);
    const nameMatch = block.match(/(?<![un])identifiedDisplayName\s*=\s*"((?:[^"\\]|\\.)*)"/);
    const name = nameMatch ? decodeLuaString(nameMatch[1]) : '???';
    ids.set(id, { name, block });
  }
  return ids;
}

const oldContent = readFileSync('C:/Users/Marcel/rag/snapshots/pre-update/iteminfo_new_decompiled.lua', 'utf-8');
const newContent = readFileSync('C:/Users/Marcel/rag/snapshots/post-update/iteminfo_new_decompiled.lua', 'utf-8');

const oldIds = parseIds(oldContent);
const newIds = parseIds(newContent);

const added = [];
const modified = [];
const removed = [];

for (const [id, data] of newIds) {
  if (!oldIds.has(id)) {
    added.push({ id, name: data.name });
  } else if (oldIds.get(id).block !== data.block) {
    modified.push({ id, name: data.name, oldName: oldIds.get(id).name });
  }
}

for (const [id, data] of oldIds) {
  if (!newIds.has(id)) {
    removed.push({ id, name: data.name });
  }
}

console.log(`=== IDs NOVOS (${added.length}) ===`);
for (const a of added.sort((a, b) => a.id - b.id)) {
  console.log(`  ${a.id}: ${a.name}`);
}

console.log(`\n=== IDs MODIFICADOS (${modified.length}) ===`);
for (const m of modified.sort((a, b) => a.id - b.id)) {
  const nameChange = m.name !== m.oldName ? ` (era: ${m.oldName})` : '';
  console.log(`  ${m.id}: ${m.name}${nameChange}`);
}

console.log(`\n=== IDs REMOVIDOS (${removed.length}) ===`);
for (const r of removed.sort((a, b) => a.id - b.id)) {
  console.log(`  ${r.id}: ${r.name}`);
}
