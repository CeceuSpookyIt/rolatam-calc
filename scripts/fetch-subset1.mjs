/**
 * fetch-subset1.mjs
 * Fetches subset 1 items from Divine Pride API and adds them to item.json.
 * Uses LATAM names from post-update snapshot.
 */
import { readFileSync, writeFileSync } from 'fs';

const API_KEY = '78ce39ae8c2f15f269d1a8f542b76ffb';
const ITEM_JSON = 'src/assets/demo/data/item.json';
const POST_UPDATE = 'C:/Users/Marcel/rag/snapshots/post-update/iteminfo_new_decompiled.lua';

const IDS = [
  300274, // Carta Ira de Thanatos
  490415, 490434, 490469, 490479, 490511, // Anéis de classe
  490044,490045,490046,490047,490048,490049,490050,490051,490052,490053,490054,490055, // Pecado
  490056,490057,490058,490059,490060,490061,490062,490063,490064,490065,490066,490067, // Radiantes
  24491,24492,24493, // Shadow Adoramus
  24515,24516,24517, // Shadow Abalo
  24527,24528,24529, // Shadow Desejo
  24566,24567,24568, // Shadow Esporo
  24581,24582,24583, // Shadow Criação
];

const luaContent = readFileSync(POST_UPDATE, 'utf-8');

function decodeLuaString(s) {
  const bytes = [];
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '\\' && i + 1 < s.length) {
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

function getLatamName(id) {
  const regex = new RegExp(`\\[${id}\\]\\s*=\\s*\\{[\\s\\S]*?identifiedDisplayName\\s*=\\s*"((?:[^"\\\\]|\\\\.)*)"`, 'm');
  const m = luaContent.match(regex);
  return m ? decodeLuaString(m[1]) : null;
}

async function fetchItem(id) {
  const url = `https://www.divine-pride.net/api/database/Item/${id}?apiKey=${API_KEY}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

async function main() {
  const items = JSON.parse(readFileSync(ITEM_JSON, 'utf-8'));
  const added = [];
  const failed = [];

  for (const id of IDS) {
    if (items[id]) {
      console.log(`  ${id}: already exists, skipping`);
      continue;
    }

    const dp = await fetchItem(id);
    if (!dp) {
      console.log(`  ${id}: FAILED`);
      failed.push(id);
      continue;
    }

    const latamName = getLatamName(id);
    const name = latamName || dp.name;

    const entry = {
      aegisName: dp.aegisName || `LATAM_${id}`,
      name: dp.slots > 0 ? `${name} [${dp.slots}]` : name,
      unidName: dp.unidName || dp.name,
      resName: dp.resName || '',
      description: '',
      slots: dp.slots || 0,
      itemTypeId: dp.itemTypeId,
      itemSubTypeId: dp.itemSubTypeId,
      itemLevel: dp.itemLevel || null,
      attack: dp.attack || null,
      matk: dp.matk || null,
      defense: dp.defense || null,
      weight: dp.weight || null,
      requiredLevel: dp.requiredLevel || null,
      location: dp.location || null,
      compositionPos: dp.compositionPos || null,
      usableClass: ['all'],
      script: {},
    };

    if (dp.itemTypeId === 6) {
      entry.cardPrefix = dp.cardPrefix || '';
    }

    items[id] = entry;
    added.push({ id, name, aegis: dp.aegisName });
    console.log(`  ${id}: ${name} (${dp.aegisName})`);

    await new Promise((r) => setTimeout(r, 200));
  }

  writeFileSync(ITEM_JSON, JSON.stringify(items, null, 2), 'utf-8');
  console.log(`\nAdded: ${added.length} items`);
  if (failed.length) console.log(`Failed: ${failed.join(', ')}`);
}

main();
