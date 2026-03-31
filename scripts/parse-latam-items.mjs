/**
 * parse-latam-items.mjs
 *
 * Cruza item.json do tong-calc-ro com itemInfo.lua + iteminfo_new.lub do cliente LATAM.
 * - Filtra itens que não existem no LATAM
 * - Atualiza nomes para PT-BR (identifiedDisplayName)
 * - Atualiza descrições para PT-BR (identifiedDescriptionName)
 * - Gera item.json filtrado e item_original.json como backup
 *
 * Pré-requisito: decompile iteminfo_new.lub com unluac primeiro:
 *   java -jar unluac.jar D:/Gravity/Ragnarok/System/iteminfo_new.lub > iteminfo_new_decompiled.lua
 */

import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'fs';
import { resolve } from 'path';

// Paths
const ITEM_JSON_PATH = resolve('src/assets/demo/data/item.json');
const ITEM_ORIGINAL_PATH = resolve('src/assets/demo/data/item_original.json');
const ITEM_INFO_LUA_PATH = 'C:/Users/Marcel/rag/snapshots/post-update/itemInfo.lua';
const ITEM_INFO_NEW_PATH = 'C:/Users/Marcel/rag/snapshots/post-update/iteminfo_new_decompiled.lua';

const latamItems = new Map();    // ID → name
const latamDescs = new Map();    // ID → description (joined lines)

// ============================================================
// Source 1: Parse itemInfo.lua (latin1 encoding, [=[...]=] syntax)
// ============================================================
console.log('Parsing itemInfo.lua...');
const luaContent = readFileSync(ITEM_INFO_LUA_PATH, 'latin1');

const itemBlockRegex = /\[(\d+)\]\s*=\s*\{/g;
let match;
const blockStarts = [];

while ((match = itemBlockRegex.exec(luaContent)) !== null) {
  blockStarts.push({ id: parseInt(match[1]), index: match.index });
}

console.log(`  Found ${blockStarts.length} item entries`);

for (let i = 0; i < blockStarts.length; i++) {
  const { id, index: startIdx } = blockStarts[i];
  const endIdx = i + 1 < blockStarts.length ? blockStarts[i + 1].index : startIdx + 5000;
  const blockText = luaContent.substring(startIdx, endIdx);

  const nameMatch = blockText.match(/(?<![un])identifiedDisplayName\s*=\s*\[=*\[(.*?)\]=*\]/);
  if (nameMatch) {
    latamItems.set(id, nameMatch[1].trim());
  }

  const descMatch = blockText.match(/(?<![un])identifiedDescriptionName\s*=\s*\{([\s\S]*?)\},/);
  if (descMatch) {
    const lines = [];
    const lineRegex = /\[=*\[(.*?)\]=*\]/g;
    let lineMatch;
    while ((lineMatch = lineRegex.exec(descMatch[1])) !== null) {
      lines.push(lineMatch[1]);
    }
    if (lines.length > 0) {
      latamDescs.set(id, lines.join('\n'));
    }
  }
}

console.log(`  Extracted ${latamItems.size} names, ${latamDescs.size} descriptions`);

// ============================================================
// Source 2: Parse iteminfo_new_decompiled.lua (UTF-8, "..." syntax)
// This file has newer items and overrides itemInfo.lua entries.
// Strings use Lua escape sequences like \195\169 for UTF-8 bytes.
// ============================================================
console.log('\nParsing iteminfo_new_decompiled.lua...');

function decodeLuaString(s) {
  // Convert Lua \NNN decimal escape sequences to actual bytes, then decode as UTF-8
  const bytes = [];
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '\\' && i + 1 < s.length) {
      const next = s[i + 1];
      if (next >= '0' && next <= '9') {
        // Decimal escape \NNN (1-3 digits)
        let numStr = next;
        if (i + 2 < s.length && s[i + 2] >= '0' && s[i + 2] <= '9') {
          numStr += s[i + 2];
          if (i + 3 < s.length && s[i + 3] >= '0' && s[i + 3] <= '9') {
            numStr += s[i + 3];
          }
        }
        bytes.push(parseInt(numStr));
        i += numStr.length;
      } else if (next === 'n') {
        bytes.push(10); i++;
      } else if (next === 't') {
        bytes.push(9); i++;
      } else if (next === '\\') {
        bytes.push(92); i++;
      } else if (next === '"') {
        bytes.push(34); i++;
      } else {
        bytes.push(s.charCodeAt(i));
      }
    } else {
      bytes.push(s.charCodeAt(i));
    }
  }
  return Buffer.from(bytes).toString('utf-8');
}

const newLuaContent = readFileSync(ITEM_INFO_NEW_PATH, 'utf-8');

// Parse [ID] = { ... } blocks
const newBlockRegex = /^\s*\[(\d+)\]\s*=\s*\{/gm;
const newBlockStarts = [];
while ((match = newBlockRegex.exec(newLuaContent)) !== null) {
  newBlockStarts.push({ id: parseInt(match[1]), index: match.index });
}

console.log(`  Found ${newBlockStarts.length} item entries`);
let newNames = 0;
let newDescs = 0;

for (let i = 0; i < newBlockStarts.length; i++) {
  const { id, index: startIdx } = newBlockStarts[i];
  const endIdx = i + 1 < newBlockStarts.length ? newBlockStarts[i + 1].index : startIdx + 5000;
  const blockText = newLuaContent.substring(startIdx, endIdx);

  // identifiedDisplayName = "..."
  const nameMatch = blockText.match(/(?<![un])identifiedDisplayName\s*=\s*"((?:[^"\\]|\\.)*)"/);
  if (nameMatch) {
    latamItems.set(id, decodeLuaString(nameMatch[1]));
    newNames++;
  }

  // identifiedDescriptionName = { "line1", "line2", ... }
  const descMatch = blockText.match(/(?<![un])identifiedDescriptionName\s*=\s*\{([\s\S]*?)\}/);
  if (descMatch) {
    const lines = [];
    const lineRegex = /"((?:[^"\\]|\\.)*)"/g;
    let lineMatch;
    while ((lineMatch = lineRegex.exec(descMatch[1])) !== null) {
      lines.push(decodeLuaString(lineMatch[1]));
    }
    if (lines.length > 0) {
      latamDescs.set(id, lines.join('\n'));
      newDescs++;
    }
  }
}

console.log(`  Added/updated ${newNames} names, ${newDescs} descriptions`);
console.log(`\nTotal LATAM items: ${latamItems.size} names, ${latamDescs.size} descriptions`);

// ============================================================
// Load item.json and filter
// ============================================================
console.log('\nLoading item.json...');
const itemJsonRaw = readFileSync(ITEM_JSON_PATH, 'utf-8');
const itemJson = JSON.parse(itemJsonRaw);
const originalCount = Object.keys(itemJson).length;
console.log(`item.json has ${originalCount} items`);

const filtered = {};
let kept = 0;
let untouched = 0;
let renamed = 0;
let descUpdated = 0;

// ADDITIVE-ONLY: keep ALL existing items, only update those found in LATAM client
for (const [key, item] of Object.entries(itemJson)) {
  const id = parseInt(key);
  if (latamItems.has(id)) {
    const ptbrName = latamItems.get(id);
    if (ptbrName && ptbrName !== item.name) {
      item.name = ptbrName;
      renamed++;
    }
    // Add slot suffix [N] if item has slots and name doesn't already have it
    if (item.slots > 0 && !item.name.match(/\[\d+\]\s*$/)) {
      item.name = `${item.name} [${item.slots}]`;
    }
    const ptbrDesc = latamDescs.get(id);
    if (ptbrDesc) {
      item.description = ptbrDesc;
      descUpdated++;
    }
    filtered[key] = item;
    kept++;
  } else {
    // Item not in LATAM client — keep it anyway (may be from future patches)
    filtered[key] = item;
    untouched++;
  }
}

// ============================================================
// Fix EQUIP[] references: replace EN names with PT-BR names
// ============================================================
console.log('\nCorrigindo referências EQUIP[] nos scripts...');

// Build EN→PT-BR name map from original item.json names vs LATAM names
const enToPtbrMap = new Map();
for (const [key, item] of Object.entries(filtered)) {
  const id = parseInt(key);
  const originalItem = itemJson[key];
  // originalItem.name was already overwritten above, so we need the original EN name
  // We'll get it from item_original.json if it exists
}

// Reload original names from item_original.json (backup with EN names)
let originalItemsForMap = {};
if (existsSync(ITEM_ORIGINAL_PATH)) {
  originalItemsForMap = JSON.parse(readFileSync(ITEM_ORIGINAL_PATH, 'utf-8'));
}

// Build the map: EN name (without slot suffix) → PT-BR name (without slot suffix)
function removeSlotSuffix(name) {
  return name.replace(/\s*\[\d+\]\s*$/, '').trim();
}

for (const [key, item] of Object.entries(filtered)) {
  const id = parseInt(key);
  const originalItem = originalItemsForMap[key];
  if (originalItem && originalItem.name !== item.name) {
    const enName = removeSlotSuffix(originalItem.name);
    const ptName = removeSlotSuffix(item.name);
    if (enName !== ptName) {
      enToPtbrMap.set(enName, ptName);
    }
  }
}

console.log(`  Mapa EN→PT-BR: ${enToPtbrMap.size} nomes`);

// Replace EQUIP[] references in all item scripts
let equipFixCount = 0;

function fixEquipReferences(value) {
  if (typeof value !== 'string' || !value.includes('EQUIP[')) return value;

  return value.replace(/EQUIP\[([^\]]+)\]/g, (fullMatch, content) => {
    // Content can have && and || separators
    const fixed = content.replace(/([^&|]+)/g, (namePart) => {
      const trimmed = namePart.trim();
      if (enToPtbrMap.has(trimmed)) {
        equipFixCount++;
        return enToPtbrMap.get(trimmed);
      }
      return trimmed;
    });
    return `EQUIP[${fixed}]`;
  });
}

function fixScriptObject(script) {
  if (!script || typeof script !== 'object') return;
  for (const [attr, values] of Object.entries(script)) {
    if (Array.isArray(values)) {
      for (let i = 0; i < values.length; i++) {
        values[i] = fixEquipReferences(values[i]);
      }
    }
  }
}

for (const item of Object.values(filtered)) {
  if (item.script) {
    fixScriptObject(item.script);
  }
}

console.log(`  Referências EQUIP[] corrigidas: ${equipFixCount}`);

// Also fix POS_SPECIFIC references (uses item names too)
let posFixCount = 0;
for (const item of Object.values(filtered)) {
  if (!item.script) continue;
  for (const values of Object.values(item.script)) {
    if (!Array.isArray(values)) continue;
    for (let i = 0; i < values.length; i++) {
      if (typeof values[i] === 'string' && values[i].includes('POS_SPECIFIC[')) {
        values[i] = values[i].replace(/POS_SPECIFIC\[([^\]]+)\]/g, (fullMatch, content) => {
          // Format: position==ItemName
          const parts = content.split('==');
          if (parts.length === 2) {
            const itemName = parts[1].trim();
            if (enToPtbrMap.has(itemName)) {
              posFixCount++;
              return `POS_SPECIFIC[${parts[0]}==${enToPtbrMap.get(itemName)}]`;
            }
          }
          return fullMatch;
        });
      }
    }
  }
}

if (posFixCount > 0) {
  console.log(`  Referências POS_SPECIFIC[] corrigidas: ${posFixCount}`);
}

// Report
console.log('\n=== Relatório ===');
console.log(`Itens no calculador original: ${originalCount}`);
console.log(`Itens atualizados (existem no LATAM): ${kept}`);
console.log(`Itens mantidos sem alteração (não no LATAM): ${untouched}`);
console.log(`Itens renomeados para PT-BR: ${renamed}`);
console.log(`Descrições atualizadas para PT-BR: ${descUpdated}`);

// Backup and save
if (!existsSync(ITEM_ORIGINAL_PATH)) {
  console.log('\nCriando backup: item_original.json');
  copyFileSync(ITEM_JSON_PATH, ITEM_ORIGINAL_PATH);
} else {
  console.log('\nBackup item_original.json já existe, mantendo.');
}

console.log('Salvando item.json filtrado...');
writeFileSync(ITEM_JSON_PATH, JSON.stringify(filtered, null, 2), 'utf-8');
console.log('Pronto!');
