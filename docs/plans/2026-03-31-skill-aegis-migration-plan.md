# Skill AegisName Migration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace EN display names with aegisNames as canonical skill keys across the entire calculator, displaying PT-BR names in the UI.

**Architecture:** A `SKILL_REGISTRY` maps aegisName → {en, ptbr}. All skill references (item.json, job files, constants, calculator) migrate from EN strings to aegisNames. An Angular pipe translates aegis → PT-BR for display. Supabase data is migrated with a permanent backwards-compat fallback.

**Tech Stack:** Angular 16, TypeScript, Node.js scripts, Supabase, rAthena skill_db.yml, GRF skillinfolist.lub

**Spec:** `docs/plans/2026-03-31-skill-aegis-migration-design.md`

---

## Task 0: Generate the Skill Registry Data

The registry is the foundation — everything else depends on it. This task creates the mapping aegisName → EN + PT-BR for all ~657 skills used in the calculator.

**Files:**
- Create: `scripts/generate-skill-registry.mjs`
- Create: `src/app/constants/skill-registry-data.json` (intermediate, generated)
- Source: `C:/Users/Marcel/rag/snapshots/grf-extracted/skillinfolist_decompiled.lua` (aegis → PT-BR)
- Source: `C:/Users/Marcel/rag/snapshots/grf-extracted/skill_db_rathena.yml` (aegis → EN)
- Source: `src/app/constants/skill-name.ts` (current EN names used in calc)
- Source: `scripts/skill-name-map.json` (PT-BR → EN bridge, 316 entries)

### Matching Strategy

The script uses 4 passes to match calc EN names to aegisNames:

1. **rAthena exact match:** EN name === rAthena Description (covers ~431 skills)
2. **GRF PT-BR bridge:** EN → PT-BR (via skill-name-map.json) → aegis (via GRF) (covers ~50 more)
3. **Fuzzy rAthena match:** normalize both sides (lowercase, remove spaces/punctuation) and compare (covers ~100 more)
4. **Manual overrides:** a hardcoded map for known mismatches and calc-internal skills (covers the rest)

The 16 internal skills (prefixed with `_`) are calc-custom and need invented aegisNames like `_CALC_3FAITH`, `_CALC_BIOLO_MONSTER_LIST`, etc.

- [ ] **Step 1: Create the generator script**

Write `scripts/generate-skill-registry.mjs` that:
1. Parses `skillinfolist_decompiled.lua` → Map<aegis, ptbr>
2. Parses `skill_db_rathena.yml` → Map<aegis, en>
3. Reads `skill-name.ts` → list of EN names the calc uses
4. Runs the 4-pass matching
5. For each calc EN name, outputs `{ aegis, en, ptbr }`
6. Logs unmatched skills to console
7. Writes `skill-registry-data.json`

- [ ] **Step 2: Run the script and review unmatched**

```bash
node scripts/generate-skill-registry.mjs
```

Review the unmatched list. For each, manually find the correct aegisName (using Divine Pride or grep in the rAthena YAML). Add to the manual overrides map in the script. Re-run until 0 unmatched.

- [ ] **Step 3: Verify coverage**

```bash
node -e "const d = require('./src/app/constants/skill-registry-data.json'); console.log('Entries:', Object.keys(d).length); const missing = Object.values(d).filter(e => !e.ptbr || !e.en); console.log('Missing ptbr/en:', missing.length);"
```

Expected: ~657 entries, 0 missing.

- [ ] **Step 4: Commit**

```bash
git add scripts/generate-skill-registry.mjs src/app/constants/skill-registry-data.json
git commit -m "feat: add skill registry generator with aegis→EN→PT-BR mappings"
```

---

## Task 1: Create the Skill Registry Module

**Files:**
- Create: `src/app/constants/skill-registry.ts`
- Test: `src/app/constants/skill-registry.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `src/app/constants/skill-registry.spec.ts`:

```ts
import { SKILL_REGISTRY, aegisByEN, aegisByPTBR, SKILL_AEGIS } from './skill-registry';

describe('SKILL_REGISTRY', () => {
  it('should have entries', () => {
    expect(Object.keys(SKILL_REGISTRY).length).toBeGreaterThan(600);
  });

  it('should have no empty en or ptbr values', () => {
    for (const [aegis, entry] of Object.entries(SKILL_REGISTRY)) {
      expect(entry.en).toBeTruthy(`${aegis} has empty en`);
      expect(entry.ptbr).toBeTruthy(`${aegis} has empty ptbr`);
    }
  });

  it('aegisByEN should reverse-map all entries', () => {
    for (const [aegis, entry] of Object.entries(SKILL_REGISTRY)) {
      expect(aegisByEN.get(entry.en)).toBe(aegis, `EN "${entry.en}" should map to ${aegis}`);
    }
  });

  it('aegisByPTBR should reverse-map all entries', () => {
    for (const [aegis, entry] of Object.entries(SKILL_REGISTRY)) {
      expect(aegisByPTBR.get(entry.ptbr)).toBeTruthy(`PT-BR "${entry.ptbr}" should map to an aegis`);
    }
  });

  it('should have uppercase aegis keys', () => {
    for (const aegis of Object.keys(SKILL_REGISTRY)) {
      expect(aegis).toBe(aegis.toUpperCase(), `${aegis} should be uppercase`);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- --include='**/skill-registry.spec.ts'
```

Expected: FAIL — module not found.

- [ ] **Step 3: Write the registry module**

Create `src/app/constants/skill-registry.ts`:

```ts
import registryData from './skill-registry-data.json';

export interface SkillEntry {
  en: string;
  ptbr: string;
}

export const SKILL_REGISTRY: Record<string, SkillEntry> = registryData;

export type SKILL_AEGIS = keyof typeof SKILL_REGISTRY;

export const aegisByEN = new Map<string, string>();
export const aegisByPTBR = new Map<string, string>();

for (const [aegis, entry] of Object.entries(SKILL_REGISTRY)) {
  aegisByEN.set(entry.en, aegis);
  if (!aegisByPTBR.has(entry.ptbr)) {
    aegisByPTBR.set(entry.ptbr, aegis);
  }
}
```

Note: `tsconfig.json` may need `"resolveJsonModule": true` if not already set.

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- --include='**/skill-registry.spec.ts'
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/constants/skill-registry.ts src/app/constants/skill-registry.spec.ts
git commit -m "feat: add SKILL_REGISTRY with aegis↔EN↔PT-BR mappings"
```

---

## Task 2: Create the SkillName Pipe

**Files:**
- Create: `src/app/pipes/skill-name.pipe.ts`
- Test: `src/app/pipes/skill-name.pipe.spec.ts`
- Modify: the shared module or `app.module.ts` where pipes are declared

- [ ] **Step 1: Write the failing test**

Create `src/app/pipes/skill-name.pipe.spec.ts`:

```ts
import { SkillNamePipe } from './skill-name.pipe';

describe('SkillNamePipe', () => {
  const pipe = new SkillNamePipe();

  it('should translate aegis to PT-BR', () => {
    expect(pipe.transform('AB_ADORAMUS')).toBe('Adoramus');
  });

  it('should return aegis as-is if not in registry', () => {
    expect(pipe.transform('UNKNOWN_SKILL')).toBe('UNKNOWN_SKILL');
  });

  it('should handle empty/null gracefully', () => {
    expect(pipe.transform('')).toBe('');
    expect(pipe.transform(null as any)).toBe('');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Write the pipe**

Create `src/app/pipes/skill-name.pipe.ts`:

```ts
import { Pipe, PipeTransform } from '@angular/core';
import { SKILL_REGISTRY } from '../constants/skill-registry';

@Pipe({ name: 'skillName' })
export class SkillNamePipe implements PipeTransform {
  transform(aegis: string): string {
    if (!aegis) return '';
    return SKILL_REGISTRY[aegis]?.ptbr || aegis;
  }
}
```

Register the pipe in the appropriate module (check where other pipes are declared in the project).

- [ ] **Step 4: Run test to verify it passes**

- [ ] **Step 5: Commit**

```bash
git add src/app/pipes/
git commit -m "feat: add SkillNamePipe for aegis→PT-BR translation in templates"
```

---

## Task 3: Create the Item Script Migration Script

This is the script that migrates all skill references in `item.json` from EN names to aegisNames.

**Files:**
- Create: `scripts/migrate-item-scripts.mjs`
- Modify: `src/assets/demo/data/item.json` (output)

- [ ] **Step 1: Write the migration script**

Create `scripts/migrate-item-scripts.mjs` that:

1. Loads `skill-registry-data.json` and builds `enToAegis` + `ptbrToAegis` maps
2. Loads `item.json`
3. For each item's `script` object:
   - **Keys:** strips known prefixes (`cd__`, `vct__`, `fct__`, `fix_vct__`, `acd__`, `autocast__`, `dmg__`, `flat_`), translates the skill part via `enToAegis` (fallback `ptbrToAegis`), rebuilds the key with prefix + aegis
   - **Skips** keys that are: stat names (from a known set), `chance__*` keys, `basicAtk`
   - **Values:** for each string in the value array, replaces skill names inside `LEARN_SKILL[SkillName==N]`, `LEARN_SKILL2[SkillName==N]`, `ACTIVE_SKILL[SkillName]`, `level:SkillName`
   - Does NOT touch `EQUIP[...]`, `REFINE[...]`, `SUM[...]`, `POS_SPECIFIC[...]`
4. Generates a diff report to stdout: `MIGRATED: old_key → new_key (item ID)`
5. Logs unmapped skills as errors
6. Writes migrated `item.json`

Stat names to skip (non-skill keys): maintain the full set from the agent analysis (`atk`, `matk`, `atkPercent`, `matkPercent`, `aspd`, `aspdPercent`, `vct`, `acd`, `fct`, `range`, `melee`, `criDmg`, `str`, `agi`, `vit`, `int`, `dex`, `luk`, `def`, `mdef`, `flee`, `hit`, `cri`, `hp`, `sp`, `hpPercent`, `spPercent`, `weight`, `baseAtk`, `baseMAtk`, `hardDef`, `hardMdef`, `perfectDodge`, all `p_*`, all `m_*`, etc.)

- [ ] **Step 2: Run in dry-run mode, review diff report**

```bash
node scripts/migrate-item-scripts.mjs --dry-run | head -100
```

Review: are the translations correct? Any unmapped skills?

- [ ] **Step 3: Run for real**

```bash
node scripts/migrate-item-scripts.mjs
```

- [ ] **Step 4: Spot-check migrated items**

```bash
node -e "const items = JSON.parse(require('fs').readFileSync('src/assets/demo/data/item.json','utf-8')); console.log(JSON.stringify(items['24491'].script, null, 2));"
```

Expected: `{ "atk": [...], "matk": [...], "p_my_element_holy": [...], "m_pene_race_all": ["EQUIP[Escudo Sombrio de Arcebispo]===40", ...] }` — stat keys unchanged, skill keys migrated to aegis, EQUIP values untouched.

- [ ] **Step 5: Commit**

```bash
git add scripts/migrate-item-scripts.mjs src/assets/demo/data/item.json
git commit -m "feat: migrate item.json skill references from EN names to aegisNames"
```

---

## Task 4: Migrate skill-name.ts

**Files:**
- Modify: `src/app/constants/skill-name.ts`

- [ ] **Step 1: Write a migration script for skill-name.ts**

Create an inline script that reads the current `ACTIVE_PASSIVE_SKILL_NAMES` and `OFFENSIVE_SKILL_NAMES`, maps each EN name to aegis via the registry, and outputs the new arrays.

- [ ] **Step 2: Replace the arrays**

Replace both arrays with aegisName values. Update the `SKILL_NAME` type to reference the new values. Keep the same array names for minimal downstream breakage.

```ts
// Before
export const OFFENSIVE_SKILL_NAMES = ['Acid Bomb', 'Adoramus', ...] as const;
export type SKILL_NAME = ...;

// After
export const OFFENSIVE_SKILL_NAMES = ['GN_ACIDDEMONSTRATION', 'AB_ADORAMUS', ...] as const;
export type SKILL_NAME = (typeof ACTIVE_PASSIVE_SKILL_NAMES)[number] | (typeof OFFENSIVE_SKILL_NAMES)[number];
```

**Note:** After this step, TypeScript will show errors everywhere skill names are used as string literals (job files, constants, etc.). This is expected — they get fixed in subsequent tasks.

- [ ] **Step 3: Commit**

```bash
git add src/app/constants/skill-name.ts
git commit -m "refactor: migrate skill-name.ts arrays to aegisNames"
```

---

## Task 5: Migrate Job Files

The largest task by file count (~36 job files + ~30 shared skill files + job-buffs + autocast registry + edp).

**Files:**
- Modify: all files in `src/app/jobs/*.ts`
- Modify: all files in `src/app/constants/share-passive-skills/*.ts`
- Modify: all files in `src/app/constants/share-active-skills/*.ts`
- Modify: `src/app/constants/job-buffs.ts`
- Modify: `src/app/constants/autocast-skill-registry.ts` (if exists)
- Modify: `src/app/utils/is-skill-can-edp.ts`

- [ ] **Step 1: Create a job file migration script**

Create `scripts/migrate-job-files.mjs` that:

1. Loads the registry (`aegisByEN` map)
2. For each `.ts` file in `src/app/jobs/`, `src/app/constants/share-passive-skills/`, `src/app/constants/share-active-skills/`:
   - Replaces `name: 'EN Name'` → `name: 'AEGIS_NAME'`
   - Replaces `value: 'EN Name==N'` → `value: 'AEGIS_NAME==N'`
   - Replaces `values: ['[prefix] EN Name==N']` → `values: ['[prefix] AEGIS_NAME==N']` (preserving prefixes in brackets)
   - Replaces `label: 'EN Name LvN'` → `label: 'PT-BR Name LvN'` (using registry ptbr)
   - Replaces `label: 'EN Name'` (without level) → `label: 'PT-BR Name'`
   - Replaces `learnLv('EN Name')` → `learnLv('AEGIS_NAME')`
   - Replaces `isSkillActive('EN Name')` → `isSkillActive('AEGIS_NAME')`
   - Replaces `activeSkillLv('EN Name')` → `activeSkillLv('AEGIS_NAME')`
   - Replaces `skillName === 'EN Name'` → `skillName === 'AEGIS_NAME'`
3. For `job-buffs.ts`, `autocast-skill-registry.ts`, `is-skill-can-edp.ts`: same name/key migration
4. **Does NOT change the order of entries in any array** (preset indices are positional)
5. Logs every replacement and any unmatched strings
6. Writes files back

- [ ] **Step 2: Run the migration script**

```bash
node scripts/migrate-job-files.mjs
```

Review the log output. Check that:
- No arrays were reordered
- All label strings now use PT-BR
- All `name` and `value` strings use aegisNames
- All `learnLv()`/`isSkillActive()`/`activeSkillLv()` calls use aegisNames

- [ ] **Step 3: Handle ro-calculator.component.ts manually**

The `'Special Pharmacy'` reference at `ro-calculator.component.ts`:
```ts
// Before
const p = mapPhamacy[rawModel?.skillBuffMap['Special Pharmacy']];
// After
const p = mapPhamacy[rawModel?.skillBuffMap['GN_S_PHARMACY']];
```

- [ ] **Step 4: Handle damage-calculator.ts manually**

```ts
// Before
if (skillName === 'Fist Spell') ...
// After
if (skillName === 'WL_FISTSPELL') ...
```

(Keep `skillName === 'basicAtk'` unchanged — it's not a real skill.)

- [ ] **Step 5: TypeScript compile check**

```bash
npx ng build 2>&1 | head -50
```

If there are type errors, fix the remaining string literals that the script missed.

- [ ] **Step 6: Commit**

```bash
git add src/app/jobs/ src/app/constants/ src/app/layout/ src/app/utils/is-skill-can-edp.ts
git commit -m "refactor: migrate all job files and constants to aegisNames"
```

---

## Task 6: Migrate Templates and UI Display

**Files:**
- Modify: `src/app/layout/pages/ro-calculator/ro-calculator.component.ts` (offensiveSkills label)
- Modify: `src/app/layout/pages/ro-calculator/ro-calculator.component.html`
- Modify: `src/app/layout/pages/ro-calculator/battle-dmg-summary/battle-dmg-summary.component.html`
- Modify: `src/app/layout/pages/shared-preset/shared-preset.component.html`
- Register pipe in the appropriate module

- [ ] **Step 1: Register the pipe in the module**

Find where pipes are declared (likely `RoCalculatorModule` or a shared module). Add `SkillNamePipe` to declarations and exports.

- [ ] **Step 2: Update offensiveSkills dropdown**

In `ro-calculator.component.ts`, where `offensiveSkills` is built:

```ts
// Before
offensiveSkills = names.map(name => ({ label: name, value: name }));

// After
import { SKILL_REGISTRY } from '../../../constants/skill-registry';
offensiveSkills = names.map(name => ({
  label: SKILL_REGISTRY[name]?.ptbr || name,
  value: name
}));
```

- [ ] **Step 3: Update templates with pipe**

`battle-dmg-summary.component.html`:
```html
<!-- Before -->
<span>{{ ac.skillName }}</span>
<!-- After -->
<span>{{ ac.skillName | skillName }}</span>
```

`shared-preset.component.html`:
```html
<!-- Before -->
{{ build.skillName || '-' }}
<!-- After -->
{{ build.skillName | skillName || '-' }}
```

`ro-calculator.component.html` line ~2078:
```html
<!-- Before -->
<div>{{ model.selectedAtkSkill || '-' }}</div>
<!-- After — needs helper to extract aegis and translate -->
<div>{{ getSelectedSkillDisplay() }}</div>
```

Add helper method:
```ts
getSelectedSkillDisplay(): string {
  if (!this.model.selectedAtkSkill) return '-';
  const aegis = this.model.selectedAtkSkill.split('==')[0];
  return SKILL_REGISTRY[aegis]?.ptbr || aegis;
}
```

- [ ] **Step 4: Update skillMultiplierTable display**

In `setSkillTable()` or the template that renders it, apply the pipe to the skill name:
```html
{{ entry.name | skillName }}
```

- [ ] **Step 5: Run tests and build**

```bash
npm test
npx ng build
```

- [ ] **Step 6: Commit**

```bash
git add src/app/
git commit -m "feat: display PT-BR skill names in UI via SkillNamePipe"
```

---

## Task 7: Migrate Spec Files

**Files:**
- Modify: `src/app/constants/skill-registry.spec.ts` (already created)
- Modify: `src/app/layout/pages/ro-calculator/calculator.spec.ts`
- Modify: any other spec files referencing skill names

- [ ] **Step 1: Find all spec files with skill name references**

```bash
grep -rl "Ignition Break\|Arrow Vulcan\|Adoramus\|Metalic Sound" src/app --include="*.spec.ts"
```

- [ ] **Step 2: Migrate each spec file**

Replace EN names with aegisNames in test assertions and setup data.

- [ ] **Step 3: Run all tests**

```bash
npm test
```

Expected: 104+ tests, ALL PASS.

- [ ] **Step 4: Commit**

```bash
git add src/app/
git commit -m "test: migrate spec files to use aegisNames"
```

---

## Task 8: Final Validation

- [ ] **Step 1: Full build**

```bash
MSYS_NO_PATHCONV=1 npx ng build --base-href /rolatam-calc/
```

Must succeed with zero errors.

- [ ] **Step 2: Full test suite**

```bash
npm test
```

All tests pass.

- [ ] **Step 3: Dev server smoke test**

```bash
npm start
```

Open http://localhost:4200. Verify:
- Skill dropdown shows PT-BR names
- Selecting a skill and equipping items shows correct damage
- Skill multiplier table shows PT-BR names
- Item search by skill works

- [ ] **Step 4: Commit and push**

```bash
git add -A
git commit -m "feat: complete skill aegisName migration (code + data)"
git push myfork main
```

---

## Plan 2: Supabase Migration (separate session)

> **Do NOT execute Plan 2 until Plan 1 is deployed and verified working in production.**

### Task 9: Backup Supabase Tables

- [ ] Export `presets` and `shared_builds` tables to JSON backup files

### Task 10: Create Supabase Migration Script

- [ ] Write `scripts/migrate-supabase-skills.mjs` that migrates `selectedAtkSkill`, `skillBuffMap`, `activeSkillMap`, `passiveSkillMap` in both `presets` and `shared_builds` tables
- [ ] Ensure idempotency (skip entries already using aegisNames)

### Task 11: Add Backwards-Compat Fallback in Load

- [ ] In preset/build load code, add fallback: if `selectedAtkSkill` contains an EN name, translate via `aegisByEN` before looking up
- [ ] Same for `skillBuffMap`, `activeSkillMap`, `passiveSkillMap` keys

### Task 12: Run Migration and Deploy

- [ ] Run Supabase migration script
- [ ] Clear ranking cache
- [ ] Verify builds load correctly

### Task 13: Update `update-latam-client` Skill

- [ ] Update the skill to generate aegisNames in item scripts for future client updates
