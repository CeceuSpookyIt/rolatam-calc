#!/usr/bin/env node

/**
 * Audit script for Automatic Module items.
 *
 * Reads item.json, finds all Auto_Module items, fetches their descriptions
 * from Divine Pride API, and caches results in module-descriptions-cache.json.
 *
 * Idempotent: only fetches descriptions not already in the cache.
 *
 * Usage: node scripts/audit-module-scripts.mjs
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ITEM_JSON_PATH = join(__dirname, '..', 'src', 'assets', 'demo', 'data', 'item.json');
const CACHE_PATH = join(__dirname, 'module-descriptions-cache.json');
const API_KEY = '78ce39ae8c2f15f269d1a8f542b76ffb';
const RATE_LIMIT_MS = 300;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchDescription(itemId) {
  const url = `https://www.divine-pride.net/api/database/Item/${itemId}?apiKey=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for item ${itemId}: ${res.statusText}`);
  }
  const data = await res.json();
  return data.description || '';
}

async function main() {
  // 1. Load items
  console.log('Loading item.json...');
  const items = JSON.parse(readFileSync(ITEM_JSON_PATH, 'utf-8'));

  // 2. Filter Auto_Module items
  const modules = Object.entries(items)
    .filter(([, item]) => item.aegisName && item.aegisName.startsWith('Auto_Module'))
    .map(([id, item]) => ({ id, aegisName: item.aegisName, name: item.name }));

  console.log(`Found ${modules.length} automatic modules.`);

  // 3. Load or initialize cache
  let cache = {};
  if (existsSync(CACHE_PATH)) {
    cache = JSON.parse(readFileSync(CACHE_PATH, 'utf-8'));
    console.log(`Cache loaded: ${Object.keys(cache).length} entries.`);
  } else {
    console.log('No cache file found, starting fresh.');
  }

  // 4. Determine which modules need fetching
  const toFetch = modules.filter((m) => !(m.id in cache));
  console.log(`Need to fetch: ${toFetch.length} / ${modules.length}`);

  // 5. Fetch missing descriptions
  let fetched = 0;
  for (const mod of toFetch) {
    try {
      console.log(`  Fetching ${mod.id} (${mod.aegisName})...`);
      const description = await fetchDescription(mod.id);
      cache[mod.id] = {
        aegisName: mod.aegisName,
        name: mod.name,
        description,
      };
      fetched++;
    } catch (err) {
      console.error(`  ERROR fetching ${mod.id}: ${err.message}`);
      cache[mod.id] = {
        aegisName: mod.aegisName,
        name: mod.name,
        description: null,
        error: err.message,
      };
    }

    // Rate limit
    if (toFetch.indexOf(mod) < toFetch.length - 1) {
      await sleep(RATE_LIMIT_MS);
    }
  }

  // 6. Save cache
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2), 'utf-8');
  console.log(`\nDone. Fetched ${fetched} new descriptions. Total cached: ${Object.keys(cache).length}.`);

  // =========================================================================
  // Task 2-4: Parse descriptions, compare with item scripts, generate report
  // =========================================================================

  console.log('\n=== PARSING DESCRIPTIONS & COMPARING ===\n');

  // --- Task 4: Skill name mapping (Divine Pride name → calculator name) ---
  // Map Divine Pride (iRO) skill names → calculator skill names.
  // Only add entries where the names genuinely differ between DP and the calc.
  const SKILL_NAME_MAP = {
    'Fatal Menace': 'Fatal Manace', // calc uses the typo variant
    'Shattering Storm': 'Shatter Storm', // calc shortens it
    'Eswoo': 'Eswhoo', // calc uses Eswhoo
    'Metallic Sound': 'Metalic Sound', // calc has single-l typo
    'Lightning Bolt': 'Lightening Bolt', // calc uses Lightening (typo preserved)
    'Dragon Water Breath': 'Dragon Water Breath', // keep as-is (module uses this form)
  };

  function mapSkillName(name) {
    return SKILL_NAME_MAP[name] || name;
  }

  // --- Task 2: Description parser ---

  function stripColorCodes(text) {
    return text.replace(/\^[0-9a-fA-F]{6}/g, '');
  }

  function extractEnchantBlock(description) {
    const clean = stripColorCodes(description);
    const lines = clean.split('\n');

    let inEnchant = false;
    const effectLines = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.includes('[Enchant Effect]')) {
        inEnchant = true;
        continue;
      }
      if (trimmed.includes('[Applicable Equipment]')) {
        break;
      }
      if (inEnchant && trimmed.length > 0) {
        effectLines.push(trimmed);
      }
    }
    return effectLines;
  }

  /**
   * Parse a single atomic effect string into { key, value } entries.
   * An "atomic" effect is one that doesn't contain multiple comma-separated effects.
   */
  function parseAtomicEffect(text, refineLevel) {
    const results = [];
    if (!text || !text.trim()) return results;

    text = text.trim().replace(/\.\s*$/, '').trim();

    function val(n) {
      return refineLevel ? `${refineLevel}===${n}` : n;
    }

    let m;

    // === STAT/GENERIC BONUSES (must be checked BEFORE skill damage patterns) ===

    // Melee/Long-ranged Physical damage +{N}%
    m = text.match(/^Melee\/Long-ranged Physical damage\s*\+(\d+(?:\.\d+)?)%$/i);
    if (m) { results.push({ key: 'melee', value: val(m[1]) }); results.push({ key: 'range', value: val(m[1]) }); return results; }

    // Melee Physical damage +{N}%
    m = text.match(/^Melee Physical damage\s*\+(\d+(?:\.\d+)?)%$/i);
    if (m) { results.push({ key: 'melee', value: val(m[1]) }); return results; }

    // Long-ranged Physical damage +{N}%
    m = text.match(/^Long-ranged Physical damage\s*\+(\d+(?:\.\d+)?)%$/i);
    if (m) { results.push({ key: 'range', value: val(m[1]) }); return results; }

    // All elemental Magic damage +{N}%
    m = text.match(/^[Aa]ll elemental Magic damage\s*\+(\d+(?:\.\d+)?)%$/i);
    if (m) { results.push({ key: 'm_element_all', value: val(m[1]) }); return results; }

    // Physical damage +{N}% on enemies of all sizes
    m = text.match(/^Physical damage\s*\+(\d+(?:\.\d+)?)%\s+on enemies of all sizes$/i);
    if (m) { results.push({ key: 'p_size_all', value: val(m[1]) }); return results; }

    // Critical damage +{N}%
    m = text.match(/^Critical damage\s*\+(\d+(?:\.\d+)?)%$/i);
    if (m) { results.push({ key: 'criDmg', value: val(m[1]) }); return results; }

    // Variable Cast Time -{N}%
    m = text.match(/^Variable Cast Time\s*-(\d+(?:\.\d+)?)%$/i);
    if (m) { results.push({ key: 'vct', value: val(m[1]) }); return results; }

    // Fixed Cast Time -{N} sec
    m = text.match(/^Fixed Cast Time\s*-(\d+(?:\.\d+)?)\s*sec$/i);
    if (m) { results.push({ key: 'fct', value: val(m[1]) }); return results; }

    // Post-skill delay / Post-attack delay -{N}%
    m = text.match(/^Post-(?:skill|attack) delay\s*-(\d+(?:\.\d+)?)%$/i);
    if (m) { results.push({ key: 'acd', value: val(m[1]) }); return results; }

    // increased ASPD (Post-attack delay -{N}%)
    m = text.match(/^increased ASPD\s*\(Post-attack delay\s*-(\d+(?:\.\d+)?)%\)$/i);
    if (m) { results.push({ key: 'acd', value: val(m[1]) }); return results; }

    // increased ASPD (ASPD +{N}%)
    m = text.match(/^increased ASPD\s*\(ASPD\s*\+(\d+(?:\.\d+)?)%\)$/i);
    if (m) { results.push({ key: 'aspdPercent', value: val(m[1]) }); return results; }

    // === SKILL-BASED PATTERNS ===

    // --- Skill damage with "and": "{S1} and {S2} damage +{N}%" ---
    m = text.match(/^(.+?)\s+and\s+(.+?)\s+damage\s*\+(\d+(?:\.\d+)?)%$/i);
    if (m) {
      results.push({ key: mapSkillName(m[1].trim()), value: val(m[3]) });
      results.push({ key: mapSkillName(m[2].trim()), value: val(m[3]) });
      return results;
    }

    // --- "Fire/Cold/Lightning Bolt damage +{N}%" (slash-separated shared suffix) ---
    m = text.match(/^([\w\s]+(?:\/[\w\s]+)+)\s+damage\s*\+(\d+(?:\.\d+)?)%$/i);
    if (m) {
      const skillPart = m[1].trim();
      const n = m[2];
      const parts = skillPart.split('/');
      const lastPart = parts[parts.length - 1].trim();
      const lastWords = lastPart.split(/\s+/);
      if (lastWords.length > 1) {
        const suffix = lastWords.slice(1).join(' ');
        for (let i = 0; i < parts.length - 1; i++) {
          results.push({ key: mapSkillName(`${parts[i].trim()} ${suffix}`), value: val(n) });
        }
        results.push({ key: mapSkillName(lastPart), value: val(n) });
      } else {
        for (const p of parts) {
          results.push({ key: mapSkillName(p.trim()), value: val(n) });
        }
      }
      return results;
    }

    // --- Single/multi-skill damage: "{S} damage +{N}%" or "{S1}, {S2} damage +{N}%" ---
    m = text.match(/^(.+?)\s+damage\s*\+(\d+(?:\.\d+)?)%$/i);
    if (m) {
      const skillPart = m[1].trim();
      const n = m[2];
      const skills = skillPart.split(',').map((s) => mapSkillName(s.trim()));
      for (const sk of skills) {
        results.push({ key: sk, value: val(n) });
      }
      return results;
    }

    // --- Cooldown: "{S1}, {S2} cooldown -{N} sec" ---
    m = text.match(/^(.+?)\s+cooldown\s*-(\d+(?:\.\d+)?)\s*sec$/i);
    if (m) {
      const skillPart = m[1].trim();
      const n = m[2];
      const skills = skillPart.includes(' and ')
        ? skillPart.split(' and ').map((s) => s.trim())
        : skillPart.split(',').map((s) => s.trim());
      for (const sk of skills) {
        results.push({ key: `cd__${mapSkillName(sk)}`, value: val(n) });
      }
      return results;
    }

    // DEF +{N}
    m = text.match(/^DEF\s*\+(\d+)$/i);
    if (m) { results.push({ key: 'def', value: val(m[1]) }); return results; }

    // MDEF +{N}
    m = text.match(/^MDEF\s*\+(\d+)$/i);
    if (m) { results.push({ key: 'mdef', value: val(m[1]) }); return results; }

    // ATK +{N}%
    m = text.match(/^ATK\s*\+(\d+(?:\.\d+)?)%$/i);
    if (m) { results.push({ key: 'atkPercent', value: val(m[1]) }); return results; }

    // ATK +{N} (flat)
    m = text.match(/^ATK\s*\+(\d+)$/i);
    if (m) { results.push({ key: 'atk', value: val(m[1]) }); return results; }

    // MATK +{N}%
    m = text.match(/^MATK\s*\+(\d+(?:\.\d+)?)%$/i);
    if (m) { results.push({ key: 'matkPercent', value: val(m[1]) }); return results; }

    // MATK +{N} (flat)
    m = text.match(/^MATK\s*\+(\d+)$/i);
    if (m) { results.push({ key: 'matk', value: val(m[1]) }); return results; }

    // ASPD +{N}%
    m = text.match(/^ASPD\s*\+(\d+(?:\.\d+)?)%$/i);
    if (m) { results.push({ key: 'aspdPercent', value: val(m[1]) }); return results; }

    // ASPD +{N}
    m = text.match(/^ASPD\s*\+(\d+)$/i);
    if (m) { results.push({ key: 'aspd', value: val(m[1]) }); return results; }

    // CRIT +{N}
    m = text.match(/^CRIT\s*\+(\d+)$/i);
    if (m) { results.push({ key: 'cri', value: val(m[1]) }); return results; }

    // HIT +{N}
    m = text.match(/^HIT\s*\+(\d+)$/i);
    if (m) { results.push({ key: 'hit', value: val(m[1]) }); return results; }

    // STR/AGI/VIT/INT/DEX/LUK +{N}
    m = text.match(/^(STR|AGI|VIT|INT|DEX|LUK)\s*\+(\d+)$/i);
    if (m) { results.push({ key: m[1].toLowerCase(), value: val(m[2]) }); return results; }

    // MaxHP +{N}%
    m = text.match(/^MaxHP\s*\+(\d+(?:\.\d+)?)%$/i);
    if (m) { results.push({ key: 'hpPercent', value: val(m[1]) }); return results; }

    return results;
  }

  /**
   * Split an effect line into atomic segments.
   *
   * The tricky part: commas can separate DIFFERENT effects on a single line,
   * but commas can also be part of skill name lists
   * (e.g. "Tuna Party, Tasty Shrimp Party cooldown -0.5 sec").
   *
   * Strategy: split on commas, then greedily try to parse each part as a standalone
   * effect. If a part doesn't parse standalone, merge it with the next part
   * (it's probably a skill name list for a damage/cooldown effect).
   */
  function splitLineIntoEffects(line) {
    const parts = line.split(/,\s*/);
    const segments = [];
    let i = 0;

    while (i < parts.length) {
      // Try parsing the current part standalone
      const standalone = parseAtomicEffect(parts[i], null);
      if (standalone.length > 0) {
        // This part is a standalone effect
        segments.push(parts[i]);
        i++;
      } else {
        // Not a standalone effect — accumulate parts until we get something parseable
        let merged = parts[i];
        let found = false;
        for (let j = i + 1; j < parts.length; j++) {
          merged += ', ' + parts[j];
          const mergedResult = parseAtomicEffect(merged, null);
          if (mergedResult.length > 0) {
            segments.push(merged);
            i = j + 1;
            found = true;
            break;
          }
        }
        if (!found) {
          // Could not parse even merged — push as-is for unparsed reporting
          segments.push(parts[i]);
          i++;
        }
      }
    }

    return segments;
  }

  function parseDescription(description) {
    if (!description) return {};

    const effectLines = extractEnchantBlock(description);
    const parsed = {}; // key → array of values

    function addParsed(key, value) {
      if (!parsed[key]) parsed[key] = [];
      parsed[key].push(value);
    }

    const unparsedLines = [];

    for (const line of effectLines) {
      let refineLevel = null;

      let effectText = line;
      // Check for refine condition
      const refineMatch = line.match(/^When refined to \+(\d+) or higher,\s*(.+)$/i);
      if (refineMatch) {
        refineLevel = refineMatch[1];
        effectText = refineMatch[2];
      }

      // Clean up (Additional) and trailing dots
      effectText = effectText.replace(/\(Additional\)/gi, '').replace(/\.\s*$/, '').trim();

      // Split into atomic effect segments
      const segments = splitLineIntoEffects(effectText);

      let anyParsed = false;
      for (const seg of segments) {
        const effects = parseAtomicEffect(seg, refineLevel);
        if (effects.length > 0) {
          anyParsed = true;
          for (const { key, value } of effects) {
            addParsed(key, value);
          }
        }
      }

      if (!anyParsed && effectText.trim()) {
        unparsedLines.push(line);
      }
    }

    return { parsed, unparsedLines };
  }

  // --- Task 3: Comparison logic ---

  function compareScripts(parsedEffects, currentScript) {
    const results = [];
    const currentKeys = new Set(Object.keys(currentScript || {}));
    const parsedKeys = new Set(Object.keys(parsedEffects));

    for (const key of parsedKeys) {
      if (!currentKeys.has(key)) {
        results.push({ type: 'MISSING', key, expected: parsedEffects[key], actual: null });
      } else {
        const expected = parsedEffects[key];
        const actual = currentScript[key];
        // Compare arrays
        const expStr = JSON.stringify(expected.sort());
        const actStr = JSON.stringify([...actual].sort());
        if (expStr === actStr) {
          results.push({ type: 'MATCH', key, expected, actual: [...actual] });
        } else {
          results.push({ type: 'MISMATCH', key, expected, actual: [...actual] });
        }
      }
    }

    for (const key of currentKeys) {
      if (!parsedKeys.has(key)) {
        results.push({ type: 'EXTRA', key, expected: null, actual: [...currentScript[key]] });
      }
    }

    return results;
  }

  // --- Run the audit ---

  let totalMissing = 0;
  let totalMismatch = 0;
  let totalExtra = 0;
  let totalMatch = 0;
  let totalUnparsed = 0;
  const allUnmappedSkills = new Set();
  const allParsedSkillNames = new Set();

  // Collect all skill names from ALL module scripts for cross-reference
  const allModuleSkillNames = new Set();
  for (const mod of modules) {
    const script = items[mod.id]?.script || {};
    for (const key of Object.keys(script)) {
      allModuleSkillNames.add(key);
    }
  }

  const issueModules = [];

  for (const mod of modules) {
    const cacheEntry = cache[mod.id];
    if (!cacheEntry || !cacheEntry.description) continue;

    const { parsed: parsedEffects, unparsedLines } = parseDescription(cacheEntry.description);
    const currentScript = items[mod.id]?.script || {};
    const comparison = compareScripts(parsedEffects, currentScript);

    // Track parsed skill names
    for (const key of Object.keys(parsedEffects)) {
      if (!key.includes('__') && !['def', 'mdef', 'atk', 'matk', 'atkPercent', 'matkPercent', 'aspd', 'aspdPercent', 'criDmg', 'cri', 'hit', 'str', 'agi', 'vit', 'int', 'dex', 'luk', 'hpPercent', 'range', 'melee', 'm_element_all', 'p_size_all', 'vct', 'fct', 'acd'].includes(key)) {
        allParsedSkillNames.add(key);
      }
      if (key.startsWith('cd__')) {
        allParsedSkillNames.add(key.replace('cd__', ''));
      }
    }

    const missing = comparison.filter((c) => c.type === 'MISSING');
    const mismatch = comparison.filter((c) => c.type === 'MISMATCH');
    const extra = comparison.filter((c) => c.type === 'EXTRA');
    const match = comparison.filter((c) => c.type === 'MATCH');

    totalMissing += missing.length;
    totalMismatch += mismatch.length;
    totalExtra += extra.length;
    totalMatch += match.length;
    totalUnparsed += unparsedLines.length;

    if (missing.length > 0 || mismatch.length > 0 || unparsedLines.length > 0) {
      issueModules.push({ mod, missing, mismatch, extra, match, unparsedLines });
    }
  }

  // Print report
  if (issueModules.length > 0) {
    console.log(`\n--- MODULES WITH ISSUES (${issueModules.length}) ---\n`);
    for (const { mod, missing, mismatch, extra, unparsedLines } of issueModules) {
      console.log(`[${mod.id}] ${mod.name} (${mod.aegisName})`);
      for (const m of missing) {
        console.log(`  MISSING:  ${m.key} = ${JSON.stringify(m.expected)}`);
      }
      for (const m of mismatch) {
        console.log(`  MISMATCH: ${m.key}`);
        console.log(`    expected: ${JSON.stringify(m.expected)}`);
        console.log(`    actual:   ${JSON.stringify(m.actual)}`);
      }
      for (const line of unparsedLines) {
        console.log(`  UNPARSED: "${line}"`);
      }
      console.log('');
    }
  } else {
    console.log('All modules match their descriptions. No issues found.');
  }

  // Check for skill names in parsed effects that don't appear in any module script
  const unmappedSkills = [];
  for (const skillName of allParsedSkillNames) {
    if (!allModuleSkillNames.has(skillName) && !allModuleSkillNames.has(`cd__${skillName}`)) {
      unmappedSkills.push(skillName);
    }
  }

  if (unmappedSkills.length > 0) {
    console.log('--- UNMAPPED SKILL NAMES (parsed from descriptions but not in any module script) ---');
    for (const name of unmappedSkills.sort()) {
      console.log(`  ${name}`);
    }
    console.log('');
  }

  // Summary
  console.log('=== SUMMARY ===');
  console.log(`Total modules audited: ${modules.filter((m) => cache[m.id]?.description).length}`);
  console.log(`Total keys matched:    ${totalMatch}`);
  console.log(`Total keys MISSING:    ${totalMissing}`);
  console.log(`Total keys MISMATCH:   ${totalMismatch}`);
  console.log(`Total keys EXTRA:      ${totalExtra}`);
  console.log(`Total unparsed lines:  ${totalUnparsed}`);
  console.log(`Modules with issues:   ${issueModules.length}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
