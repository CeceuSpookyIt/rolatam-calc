/**
 * fetch-subset2.mjs
 * Adds costume stones II, sentiment stones (as materials), headgears, and remaining items.
 */
import { readFileSync, writeFileSync } from 'fs';

const API_KEY = '78ce39ae8c2f15f269d1a8f542b76ffb';
const ITEM_JSON = 'src/assets/demo/data/item.json';
const POST_UPDATE = 'C:/Users/Marcel/rag/snapshots/post-update/iteminfo_new_decompiled.lua';

// All missing IDs from subset 2 + 3
const IDS = [
  // Costume Stones II (12)
  310257,310258,310259,310260,310261,310262,310263,310264,310265,310266,310267,310268,
  // Costume Stone II crafting materials (12)
  1000296,1000297,1000298,1000299,1000300,1000301,1000302,1000303,1000304,1000305,1000306,1000307,
  // Sentiment stones (60) - materials, no combat stats
  310197,310198,310199,310200,310201,310202,310203,310204,310205,310206,
  310207,310208,310209,310210,310211,310212,310213,310214,310215,310216,
  310217,310218,310219,310220,310221,310222,310223,310224,310225,310226,
  310227,310228,310229,310230,310231,310232,310233,310234,310235,310236,
  310237,310238,310239,310240,310241,310242,310243,310244,310245,310246,
  310247,310248,310249,310250,310251,310252,310253,310254,310255,310256,
  // Sentiment fragments (12)
  1000243,1000244,1000245,1000255,1000256,1000257,1000258,1000259,1000260,1000261,1000262,1000263,
  // Headgears with stats
  19439, 19472, 22750, 410612, 410613, 410614,
  // Visuals/boxes (subset 3)
  400183,400205,400206,400207,400208,400209,400210,400211,400212,
  420067, 480472,
  31576, 31693,
  23925, 23992, 23993, 23994,
  25139, 25786, 25787, 25864, 25865, 25866, 25867,
  29146,
  100314, 100951, 100958, 100960, 100972, 100978, 100989,
  106914, 106915, 106916, 106917, 106918, 106919, 106920, 106921, 106922, 106923, 106930, 106931,
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
  let addedCount = 0;
  let failedIds = [];

  for (const id of IDS) {
    if (items[id]) continue;

    const dp = await fetchItem(id);
    if (!dp) {
      console.log(`  ${id}: FAILED`);
      failedIds.push(id);
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

    if (dp.itemTypeId === 6) entry.cardPrefix = dp.cardPrefix || '';

    items[id] = entry;
    addedCount++;
    console.log(`  ${id}: ${name} (${dp.aegisName})`);
    await new Promise((r) => setTimeout(r, 150));
  }

  writeFileSync(ITEM_JSON, JSON.stringify(items, null, 2), 'utf-8');
  console.log(`\nAdded: ${addedCount} items`);
  if (failedIds.length) console.log(`Failed: ${failedIds.join(', ')}`);
}

main();
