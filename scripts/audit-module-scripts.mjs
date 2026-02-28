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
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
