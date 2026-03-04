# Edda Biolab Equipment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add 66 Edda Biolab items (41 weapons, 12 diadems, 13 memory enchants) to the RO LATAM calculator.

**Architecture:** Data-only addition — all 66 items go into `src/assets/demo/data/item.json`. A Node.js script fetches base stats from Divine Pride API, then bonus scripts are mapped manually per class. No TypeScript code changes needed (the calculator auto-discovers items from JSON).

**Tech Stack:** Node.js script for data import, Angular/Karma for unit tests, playwright-cli for e2e validation.

**Design doc:** `docs/plans/2026-03-03-edda-biolab-design.md`

---

### Task 1: Create the import script skeleton

**Files:**
- Create: `scripts/add-edda-biolab.mjs`

**Step 1: Write the script with all 66 item IDs**

Create `scripts/add-edda-biolab.mjs` that:
- Defines all item IDs in 3 arrays: `weaponIds`, `diademIds`, `memoryEnchantIds`
- Fetches each item from Divine Pride API: `https://www.divine-pride.net/api/database/Item/{id}?apiKey=KEY`
- Maps the API response to the calculator's `ItemModel` structure
- Writes results to a temp file `scripts/edda-biolab-items.json` for review

```javascript
import { readFileSync, writeFileSync } from 'fs';

const API_KEY = ''; // fill from project memory or env
const BASE_URL = 'https://www.divine-pride.net/api/database/Item';

const weaponIds = [
  21051, 21052, 32023,              // Rune Knight
  32024, 32025, 32350,              // Royal Guard
  2055, 2056, 26158,                // Warlock
  28633, 26160, 26159,              // Sorcerer
  16092, 1333, 28138,               // Mechanic
  16094, 16093, 32351,              // Geneticist
  2057, 26161, 16095,               // Archbishop
  1865, 1866, 16096,                // Shura
  18185, 18186, 18187,              // Ranger
  26213, 26212, 18188,              // Wanderer
  32108, 32107,                     // Minstrel
  18184, 28767, 28768,              // Shadow Chaser
  28765, 28042, 28044, 28766,       // Guillotine Cross
];

const diademIds = [
  400078, 400079, 400094, 400095,
  400098, 400099, 400116, 400117,
  400118, 400119, 400120, 400121,
];

const memoryEnchantIds = [
  29594, 29595, 29596, 29598, 29599, 29600,
  29601, 29602, 29603, 29604, 29605, 29606, 29607,
];

// itemSubTypeId mapping for the calculator
const WEAPON_SUBTYPES = {
  'Dagger':              256,
  'Sword':               257,
  'Two-handed Sword':    258,
  'Spear':               259,
  'Two-handed Spear':    260,
  'Mace':                262,
  'Rod':                 265,
  'Two-handed Staff':    268,
  'Bow':                 269,
  'Knuckle':             270,
  'Musical Instrument':  271,
  'Whip':                272,
  'Katar':               274,
};

async function fetchItem(id) {
  const res = await fetch(`${BASE_URL}/${id}?apiKey=${API_KEY}`);
  if (!res.ok) throw new Error(`Failed to fetch ${id}: ${res.status}`);
  return res.json();
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const allIds = [...weaponIds, ...diademIds, ...memoryEnchantIds];
  const results = {};

  for (const id of allIds) {
    console.log(`Fetching ${id}...`);
    try {
      const data = await fetchItem(id);
      results[id] = data;
    } catch (e) {
      console.error(`Error fetching ${id}:`, e.message);
    }
    await sleep(300); // rate limit
  }

  writeFileSync('scripts/edda-biolab-raw.json', JSON.stringify(results, null, 2));
  console.log(`Fetched ${Object.keys(results).length} items`);
}

main();
```

**Step 2: Run the script**

Run: `node scripts/add-edda-biolab.mjs`
Expected: `scripts/edda-biolab-raw.json` created with 66 item entries

**Step 3: Commit**

```bash
git add scripts/add-edda-biolab.mjs
git commit -m "feat: add Edda Biolab import script skeleton"
```

---

### Task 2: Build the item transformer

**Files:**
- Modify: `scripts/add-edda-biolab.mjs`

**Step 1: Add transform function for weapons**

Add a `transformWeapon(raw)` function that maps Divine Pride API response to calculator `ItemModel`:

```javascript
function transformWeapon(raw) {
  const subTypeName = raw.itemSubTypeId; // will need mapping
  return {
    id: raw.id,
    aegisName: raw.name.replace(/\s/g, '_').replace(/[[\]]/g, ''),
    name: raw.name,
    unidName: subTypeName,
    resName: '',
    description: raw.description || '',
    slots: raw.slots || 0,
    itemTypeId: 1,  // WEAPON
    itemSubTypeId: WEAPON_SUBTYPES[subTypeName] || null,
    itemLevel: raw.itemLevel || 4,
    attack: raw.attack || null,
    defense: null,
    weight: raw.weight || 0,
    requiredLevel: raw.requiredLevel || 170,
    location: null,
    compositionPos: null,
    usableClass: [], // fill manually per class
    script: {},      // fill manually per weapon
  };
}
```

**Step 2: Add transform function for diadems**

```javascript
function transformDiadem(raw) {
  return {
    id: raw.id,
    aegisName: raw.name.replace(/\s/g, '_').replace(/[[\]]/g, ''),
    name: raw.name,
    unidName: 'Headgear',
    resName: '',
    description: raw.description || '',
    slots: raw.slots || 1,
    itemTypeId: 2,  // ARMOR
    itemSubTypeId: 0,
    itemLevel: 1,
    attack: null,
    defense: raw.defense || 10,
    weight: raw.weight || 10,
    requiredLevel: raw.requiredLevel || 170,
    location: null,
    compositionPos: 256,  // upper headgear
    usableClass: [], // fill manually per class
    script: {},      // fill manually per diadem
  };
}
```

**Step 3: Add transform function for memory enchants**

```javascript
function transformMemoryEnchant(raw) {
  return {
    id: raw.id,
    aegisName: raw.name.replace(/\s/g, '_').replace(/['\u2019]/g, ''),
    name: raw.name,
    unidName: 'Card',
    resName: '',
    description: raw.description || '',
    slots: 0,
    itemTypeId: 6,  // CARD
    itemSubTypeId: null,
    itemLevel: null,
    attack: null,
    defense: null,
    weight: 0,
    requiredLevel: 1,
    location: null,
    compositionPos: 2,   // weapon card slot
    usableClass: [],     // fill manually per class
    script: {},          // fill manually per enchant
  };
}
```

**Step 4: Commit**

```bash
git add scripts/add-edda-biolab.mjs
git commit -m "feat: add item transform functions for Edda Biolab"
```

---

### Task 3: Add Rune Knight weapons with scripts

**Files:**
- Modify: `scripts/add-edda-biolab.mjs` (add weapon data with bonus scripts)

**Reference:** Fetch each weapon from Divine Pride to get exact bonuses:
- `https://www.divine-pride.net/database/item/21051` (Volar)
- `https://www.divine-pride.net/database/item/21052` (Vernan)
- `https://www.divine-pride.net/database/item/32023` (Argen Blanco)

**Step 1: Add Rune Knight weapon entries with complete scripts**

Use skill names from `src/app/constants/skill-name.ts`. Verified names:
- `'Bowling Bash'`, `'Ignition Break'`, `'Clashing Spiral'`, `'Sonic Wave'`, `'Brandish Spear'`, `'Hundred Spears'`

Valid class name: `"RuneKnight"` (from `src/app/jobs/_class-name.ts`)

Example entry for Volar:
```json
{
  "id": 21051,
  "aegisName": "Volar",
  "name": "Volar [2]",
  "unidName": "Two-handed Sword",
  "resName": "",
  "description": "",
  "slots": 2,
  "itemTypeId": 1,
  "itemSubTypeId": 258,
  "itemLevel": 4,
  "attack": 280,
  "defense": null,
  "weight": 280,
  "requiredLevel": 170,
  "location": null,
  "compositionPos": null,
  "usableClass": ["RuneKnight"],
  "script": {
    "Bowling Bash": ["30", "11===20"],
    "atk": ["1---4"],
    "cd__Ignition Break": ["9===1"],
    "cd__Bowling Bash": ["9===1"]
  }
}
```

**Step 2: Repeat for Vernan (21052) and Argen Blanco (32023)**

Fetch bonuses from Divine Pride, map to script keys using the table in the design doc.

**Step 3: Add items to item.json**

Add merge logic at the end of the script:
```javascript
const itemFile = 'src/assets/demo/data/item.json';
const items = JSON.parse(readFileSync(itemFile, 'utf-8'));
for (const [id, item] of Object.entries(newItems)) {
  items[id] = item;
}
writeFileSync(itemFile, JSON.stringify(items, null, 2), 'utf-8');
```

**Step 4: Run and verify**

Run: `node scripts/add-edda-biolab.mjs`
Verify: `node -e "const i=require('./src/assets/demo/data/item.json'); [21051,21052,32023].forEach(id => console.log(id, i[id]?.name || 'MISSING'))"`
Expected: All 3 items found with correct names.

**Step 5: Commit**

```bash
git add scripts/add-edda-biolab.mjs src/assets/demo/data/item.json
git commit -m "feat: add Rune Knight Edda Biolab weapons"
```

---

### Task 4: Add Royal Guard weapons with scripts

Same pattern as Task 3 for:
- Harve (32024) — Spear, `itemSubTypeId: 259`
- Fortridge (32025) — Spear, `itemSubTypeId: 259`
- Farthezan (32350) — Mace, `itemSubTypeId: 262`

**Class name:** `"RoyalGuard"`

**Relevant skills:** `'Rapid Smiting'`, `'Shield Press'`, `'Cannon Spear'`, `'Gloria Domini'`, `'Genesis Ray'`

**Steps:** Fetch from Divine Pride → map scripts → add to item.json → verify → commit.

```bash
git commit -m "feat: add Royal Guard Edda Biolab weapons"
```

---

### Task 5: Add Warlock weapons with scripts

- Bastão Milagroso (2055) — Two-handed Staff, `itemSubTypeId: 268`
- Gravitação (2056) — Two-handed Staff, `itemSubTypeId: 268`
- Varinha de Rosas Cálidas (26158) — Rod, `itemSubTypeId: 265`

**Class name:** `"Warlock"`

**Relevant skills:** `'Soul Strike'`, `'Soul Expansion'`, `'Napalm Vulcan'`, `'Gravitational Field'`, `'Comet'`, `'Earth Strain'`

**Important:** Element magic bonuses use `m_my_element_ghost`, `m_my_element_fire`, etc.

```bash
git commit -m "feat: add Warlock Edda Biolab weapons"
```

---

### Task 6: Add Sorcerer weapons with scripts

- Lançarin (28633), Castigo Diamante (26160), Lança Psíquica (26159) — Rod, `itemSubTypeId: 265`

**Class name:** `"Sorcerer"`

**Relevant skills:** `'Varetyr Spear'`, `'Diamond Dust'`, `'Fire Bolt'`, `'Cold Bolt'`, `'Lightning Bolt'`

```bash
git commit -m "feat: add Sorcerer Edda Biolab weapons"
```

---

### Task 7: Add Mechanic weapons with scripts

- Bate-Estacas Motorizado (16092), Ferramenta Dourada (1333), Chave Maxi (28138) — Mace, `itemSubTypeId: 262`

**Class name:** `"Mechanic"`

**Relevant skills:** `'Arm Cannon'`, `'Knuckle Boost'`

```bash
git commit -m "feat: add Mechanic Edda Biolab weapons"
```

---

### Task 8: Add Geneticist weapons with scripts

- Caduceu (16094), Injetor Acoplável (16093), Estal (32351) — Mace, `itemSubTypeId: 262`

**Class name:** `"Genetic"`

**Relevant skills:** `'Cart Cannon'`, `'Acid Demonstration'`, `'Hell Plant'`

```bash
git commit -m "feat: add Geneticist Edda Biolab weapons"
```

---

### Task 9: Add Archbishop weapons with scripts

- Adorare (2057) — Two-handed Staff, `itemSubTypeId: 268`
- Penitência (26161), Mangual Lucis (16095) — Mace, `itemSubTypeId: 262`

**Class name:** `"ArchBishop"`

**Relevant skills:** `'Adoramus'`, `'Judex'`, `'Magnus Exorcismus'`

```bash
git commit -m "feat: add Archbishop Edda Biolab weapons"
```

---

### Task 10: Add Shura weapons with scripts

- Cólera do Dragão (1865), Bandagens Divinas (1866), Pendulum (16096) — Knuckle, `itemSubTypeId: 270`

**Class name:** `"Sura"`

**Relevant skills:** `'Tiger Cannon'`, `'Hell Gate'` (NOT "Gates of Hell"), `'Rampage Blast'`, `'Fallen Empire'`

```bash
git commit -m "feat: add Shura Edda Biolab weapons"
```

---

### Task 11: Add Ranger weapons with scripts

- Estrela Afiada (18185), Arco Certeiro (18186), Tiro Rapina (18187) — Bow, `itemSubTypeId: 269`

**Class name:** `"Ranger"`

**Relevant skills:** `'Focused Arrow Strike'`, `'Arrow Storm'`, `'Aimed Bolt'`

```bash
git commit -m "feat: add Ranger Edda Biolab weapons"
```

---

### Task 12: Add Wanderer & Minstrel weapons with scripts

**Wanderer:**
- Fita Fru-Fru (26213), Chibata Coração (26212) — Whip, `itemSubTypeId: 272`
- Ventania (18188) — Bow, `itemSubTypeId: 269`

**Class name:** `"Wanderer"`

**Minstrel:**
- Viola (32108), Banjo Negro (32107) — Musical Instrument, `itemSubTypeId: 271`

**Class name:** `"Minstrel"`

**Relevant skills:** `'Severe Rainstorm'`, `'Metalic Sound'` (note: one L), `'Reverberation'`

```bash
git commit -m "feat: add Wanderer and Minstrel Edda Biolab weapons"
```

---

### Task 13: Add Shadow Chaser weapons with scripts

- Triarco (18184) — Bow, `itemSubTypeId: 269`
- Estripadora (28767), Adaga Platina (28768) — Dagger, `itemSubTypeId: 256`

**Class name:** `"ShadowChaser"`

**Relevant skills:** `'Triangle Shot'`, `'Soul Destroyer'`

```bash
git commit -m "feat: add Shadow Chaser Edda Biolab weapons"
```

---

### Task 14: Add Guillotine Cross weapons with scripts

- Navalha Carrasca (28765), Navalha Repente (28766) — Dagger, `itemSubTypeId: 256`
- Ceifo Cruzado (28042), Agudo Filo (28044) — Katar, `itemSubTypeId: 274`

**Class name:** `"GuillotineCross"`

**Relevant skills:** `'Cross Impact'`, `'Rolling Cutter'`, `'Counter Slash'`

```bash
git commit -m "feat: add Guillotine Cross Edda Biolab weapons"
```

---

### Task 15: Add all 12 diadems/crowns

**Files:**
- Modify: `scripts/add-edda-biolab.mjs`
- Modify: `src/assets/demo/data/item.json`

**Step 1: Fetch all 12 diadem details from Divine Pride**

IDs: 400078, 400079, 400094, 400095, 400098, 400099, 400116, 400117, 400118, 400119, 400120, 400121

**Step 2: Create entries for each diadem**

All share: `itemTypeId: 2`, `itemSubTypeId: 0`, `defense: 10`, `weight: 10`, `requiredLevel: 170`, `slots: 1`, `compositionPos: 256` (upper headgear).

Each diadem has:
- Refine-scaling base bonuses (use `"2---X"` pattern for "per 2 refine levels")
- Threshold bonuses at +7, +9, +11 (use `"7===X"`, `"9===X"`, `"11===X"`)
- Set bonuses with 2-3 weapons from same class (use `"EQUIP[Weapon Name]..."` pattern)
- Per-weapon-refine scaling (use `"EQUIP[Weapon Name]REFINE[weapon==1]---X"`)

**Diadem → Class mapping:**

| ID | Name | usableClass |
|---|---|---|
| 400078 | Biolab Aries Crown [1] | `["RuneKnight"]` |
| 400079 | Biolab Libra Diadem [1] | `["RoyalGuard"]` |
| 400094 | Biolab Aquarius Crown [1] | `["Warlock"]` |
| 400095 | Biolab Aquarius Diadem [1] | `["Sorcerer"]` |
| 400098 | Biolab Taurus Crown [1] | `["Mechanic"]` |
| 400099 | Biolab Taurus Diadem [1] | `["Genetic"]` |
| 400116 | Biolab Virgo Diadem [1] | `["Ranger"]` |
| 400117 | Biolab Libra Crown [1] | `["ArchBishop"]` |
| 400118 | Biolab Cancer Diadem [1] | `["Sura"]` |
| 400119 | Biolab Lion Crown [1] | `["ShadowChaser"]` |
| 400120 | Biolab Capricorn Crown [1] | `["Minstrel", "Wanderer"]` |
| 400121 | Biolab Gemini Crown [1] | `["GuillotineCross"]` |

**Step 3: Map set bonus scripts**

Example for Biolab Libra Diadem (400079, Royal Guard):
```json
"script": {
  "atk": ["2---20"],
  "matk": ["2---20"],
  "aspdPercent": ["7===10"],
  "atkPercent": ["9===15"],
  "m_my_element_holy": ["9===15"],
  "p_size_all": ["11===10"],
  "m_size_all": ["11===10"],
  "fct": ["11===0.2"],
  "vct": ["EQUIP[Farthezan]===10"],
  "Gloria Domini": ["EQUIP[Farthezan]REFINE[weapon==1]---10"],
  "Genesis Ray": ["EQUIP[Farthezan]REFINE[weapon==1]---10"],
  "cd__Shield Press": ["EQUIP[Harve]===1"],
  "Shield Press": ["EQUIP[Harve]REFINE[weapon==1]---10"],
  "cd__Cannon Spear": ["EQUIP[Fortridge]===0.5"],
  "Cannon Spear": ["EQUIP[Fortridge]REFINE[weapon==1]---12"]
}
```

**Step 4: Add to item.json, verify, commit**

```bash
git add scripts/add-edda-biolab.mjs src/assets/demo/data/item.json
git commit -m "feat: add 12 Biolab diadem headgears"
```

---

### Task 16: Add all 13 memory enchants

**Files:**
- Modify: `scripts/add-edda-biolab.mjs`
- Modify: `src/assets/demo/data/item.json`

**Step 1: Fetch all 13 memory enchant details from Divine Pride**

IDs: 29594-29607 (skipping 29597)

**Step 2: Create entries for each enchant**

All share: `itemTypeId: 6` (CARD), `weight: 0`, `compositionPos: 2` (weapon slot), `slots: 0`.

Each memory enchant provides weapon-specific bonuses using `EQUIP[WeaponName]3---X` pattern (bonus per 3 refine levels of the equipped weapon).

**Example: Seyren's Memory (29594, Rune Knight)**
```json
{
  "id": 29594,
  "name": "Seyren's Memory",
  "itemTypeId": 6,
  "compositionPos": 2,
  "usableClass": ["RuneKnight"],
  "script": {
    "Bowling Bash": ["EQUIP[Volar]3---10"],
    "Ignition Break": ["EQUIP[Volar]3---5"],
    "Clashing Spiral": ["EQUIP[Vernan]3---10"],
    "Sonic Wave": ["EQUIP[Vernan]3---5"],
    "Brandish Spear": ["EQUIP[Argen Blanco]3---10"],
    "Hundred Spears": ["EQUIP[Argen Blanco]3---5"]
  }
}
```

**Step 3: Repeat for all 13 enchants**

Each enchant targets 2-3 weapons of its class with 2 skills per weapon.

**Step 4: Add to item.json, verify, commit**

```bash
git add scripts/add-edda-biolab.mjs src/assets/demo/data/item.json
git commit -m "feat: add 13 Biolab memory enchants"
```

---

### Task 17: Run unit tests

**Step 1: Run the full test suite**

Run: `npm test`
Expected: All tests pass (no regressions from adding items to JSON)

**Step 2: If tests fail, fix issues**

Common issues:
- JSON syntax errors → fix in item.json
- Skill name mismatch → check `src/app/constants/skill-name.ts`
- Invalid class name → check `src/app/jobs/_class-name.ts`

**Step 3: Commit any fixes**

```bash
git commit -m "fix: resolve test issues from Edda Biolab items"
```

---

### Task 18: E2E validation with playwright-cli

**Prerequisite:** Dev server running (`npm start` on port 4200)

**Step 1: Start dev server**

Run: `npm start` (in background)
Wait for: `Angular Live Development Server is listening on localhost:4200`

**Step 2: Test Rune Knight weapons appear**

```bash
playwright-cli open http://localhost:4200
```

1. `snapshot` → find the class dropdown
2. Select "Rune Knight" class
3. `snapshot` → find weapon dropdown
4. Open weapon dropdown → verify "Volar [2]", "Vernan [2]", "Argen Blanco [2]" appear
5. Select "Volar [2]" → verify ATK 280 shows in stats
6. `screenshot` to capture state

**Step 3: Test Royal Guard with diadem set bonus**

1. Select "Royal Guard" class
2. Equip "Harve [2]" as weapon
3. Equip "Biolab Libra Diadem [1]" as headgear
4. `snapshot` → verify set bonus text or stat changes appear
5. Check that Shield Press damage bonus applies (should see combo effect)
6. `screenshot` to capture

**Step 4: Test Warlock with memory enchant**

1. Select "Warlock" class
2. Equip "Bastão Milagroso [2]" as weapon
3. Add "Kathryne's Memory" as weapon card
4. `snapshot` → verify enchant bonus appears
5. `screenshot` to capture

**Step 5: Spot-check remaining classes**

For each of these classes, verify at least 1 weapon appears in the dropdown:
- Sorcerer, Mechanic, Geneticist, Archbishop, Shura
- Ranger, Wanderer, Minstrel, Shadow Chaser, Guillotine Cross

**Step 6: Verify damage calculation works**

1. Select any class with Edda weapon equipped
2. Set refine to +11
3. Select a skill that the weapon boosts
4. Verify damage number is non-zero and reflects the weapon bonus
5. `screenshot` to capture

**Step 7: Commit screenshots as evidence**

```bash
git commit -m "test: e2e validation of Edda Biolab items"
```

---

### Task 19: Final commit and cleanup

**Step 1: Verify all 66 items exist in item.json**

```bash
node -e "
const items = require('./src/assets/demo/data/item.json');
const ids = [
  21051,21052,32023,32024,32025,32350,2055,2056,26158,
  28633,26160,26159,16092,1333,28138,16094,16093,32351,
  2057,26161,16095,1865,1866,16096,18185,18186,18187,
  26213,26212,18188,32108,32107,18184,28767,28768,
  28765,28042,28044,28766,
  400078,400079,400094,400095,400098,400099,
  400116,400117,400118,400119,400120,400121,
  29594,29595,29596,29598,29599,29600,
  29601,29602,29603,29604,29605,29606,29607
];
const missing = ids.filter(id => !items[id]);
console.log('Total:', ids.length, 'Missing:', missing.length);
if (missing.length) console.log('Missing IDs:', missing);
else console.log('All items present!');
"
```

Expected: `Total: 66 Missing: 0` and `All items present!`

**Step 2: Run tests one final time**

Run: `npm test`
Expected: All pass

**Step 3: Clean up temp files**

Remove `scripts/edda-biolab-raw.json` if it exists.
