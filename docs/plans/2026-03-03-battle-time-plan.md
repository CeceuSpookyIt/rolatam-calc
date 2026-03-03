# Battle Time Calculation — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace `skillHitKill` with battle time (seconds) and add battle time to basic DPS section.

**Architecture:** Add `skillBattleTime` and `basicBattleTime` fields (number, in seconds) to damage summary models. Calculate as `HP / DPS`. Format display with a utility function (`12.5s` or `2m 30s`). Display inline in `battle-dmg-summary` template (not via `app-calc-value` since it's number-only). In the monster comparison table, display as raw seconds via the existing `| number` pipe.

**Tech Stack:** Angular 16, TypeScript

---

### Task 1: Create `formatBattleTime` utility function

**Files:**
- Create: `src/app/utils/format-battle-time.ts`
- Modify: `src/app/utils/index.ts` (add re-export)

**Step 1: Create the utility**

```typescript
// src/app/utils/format-battle-time.ts
export const formatBattleTime = (seconds: number): string => {
  if (!seconds || !isFinite(seconds) || seconds <= 0) return '—';
  if (seconds <= 60) return `${Math.round(seconds * 10) / 10}s`;
  const min = Math.floor(seconds / 60);
  const sec = Math.round(seconds % 60);
  return `${min}m ${sec}s`;
};
```

**Step 2: Add re-export in `src/app/utils/index.ts`**

Add line: `export * from './format-battle-time';`

**Step 3: Commit**

```bash
git add src/app/utils/format-battle-time.ts src/app/utils/index.ts
git commit -m "feat: add formatBattleTime utility function"
```

---

### Task 2: Update damage summary model

**Files:**
- Modify: `src/app/models/damage-summary.model.ts`

**Step 1: Replace `skillHitKill` with `skillBattleTime` and add `basicBattleTime`**

In `SkillDamageSummaryModel` (line 50):
- Change `skillHitKill: number;` → `skillBattleTime: number;`

In `BasicDamageSummaryModel` (after line 15, after `basicDps`):
- Add `basicBattleTime: number;`

**Step 2: Commit**

```bash
git add src/app/models/damage-summary.model.ts
git commit -m "feat: replace skillHitKill with battleTime fields in models"
```

---

### Task 3: Update damage calculator

**Files:**
- Modify: `src/app/layout/pages/ro-calculator/damage-calculator.ts`

**Step 1: Update the default skill summary (line 76)**

Change: `skillHitKill: 0,` → `skillBattleTime: 0,`

**Step 2: Update skill battle time calculation (lines 1383, 1412)**

At line 1383, change:
```typescript
const hitKill = Math.ceil(this.monster.data.hp / minDamage);
```
to:
```typescript
const skillBattleTime = skillDps > 0 ? Math.round((this.monster.data.hp / skillDps) * 10) / 10 : 0;
```

At line 1412, change:
```typescript
skillHitKill: hitKill,
```
to:
```typescript
skillBattleTime,
```

**Step 3: Add basic battle time calculation**

Find where `basicDps` is assigned to the `basicDmg` object (around line 1196). After `basicDps` is calculated, add:
```typescript
const basicBattleTime = basicDps > 0 ? Math.round((this.monster.data.hp / basicDps) * 10) / 10 : 0;
```

Add `basicBattleTime` to the returned `basicDmg` object.

**Step 4: Verify build compiles**

Run: `npm run build`

**Step 5: Commit**

```bash
git add src/app/layout/pages/ro-calculator/damage-calculator.ts
git commit -m "feat: calculate battleTime instead of hitKill"
```

---

### Task 4: Update monster comparison table column

**Files:**
- Modify: `src/app/layout/pages/ro-calculator/ro-calculator.component.ts` (line 661)

**Step 1: Update the column definition**

Change:
```typescript
{ field: 'skillHitKill', header: 'HitKill', default: true },
```
to:
```typescript
{ field: 'skillBattleTime', header: 'Tempo(s)', default: true },
```

**Step 2: Update the `cols` type (line 303)**

Add `'skillBattleTime'` to the union type if needed (it uses `keyof SkillDamageSummaryModel` which auto-updates).

**Step 3: Commit**

```bash
git add src/app/layout/pages/ro-calculator/ro-calculator.component.ts
git commit -m "feat: update monster table column from HitKill to Tempo"
```

---

### Task 5: Add battle time display in `battle-dmg-summary`

**Files:**
- Modify: `src/app/layout/pages/ro-calculator/battle-dmg-summary/battle-dmg-summary.component.ts`
- Modify: `src/app/layout/pages/ro-calculator/battle-dmg-summary/battle-dmg-summary.component.html`

**Step 1: Import `formatBattleTime` in the component TS**

Add import:
```typescript
import { formatBattleTime } from '../../../../utils/format-battle-time';
```

Add method to the component class:
```typescript
formatTime = formatBattleTime;
```

**Step 2: Add skill battle time display in the template**

After the skill DPS `app-calc-value` block (after line 320), add:
```html
<div class="col-12" [hidden]="totalSummary?.dmg?.isAutoSpell || !!totalSummary?.dmg?.requireTxt">
  <span>Tempo: </span>
  <span class="text-lg font-medium px-1 summary_highlight">{{ formatTime(totalSummary?.dmg?.skillBattleTime) }}</span>
  <span *ngIf="isEnableCompare && totalSummary2?.dmg" [hidden]="totalSummary?.dmg?.skillBattleTime === totalSummary2?.dmg?.skillBattleTime">
    <i class="pi pi-arrow-right vs_sign px-1"></i>
    <span class="text-lg font-medium px-1 summary_compare">{{ formatTime(totalSummary2?.dmg?.skillBattleTime) }}</span>
  </span>
</div>
```

**Step 3: Add basic battle time display in the template**

After the basic DPS `app-calc-value` block (after line 470), add:
```html
<div class="col-12">
  <span>Tempo: </span>
  <span class="text-lg font-medium px-1 summary_highlight">{{ formatTime(totalSummary?.dmg?.basicBattleTime) }}</span>
  <span *ngIf="isEnableCompare && totalSummary2?.dmg" [hidden]="totalSummary?.dmg?.basicBattleTime === totalSummary2?.dmg?.basicBattleTime">
    <i class="pi pi-arrow-right vs_sign px-1"></i>
    <span class="text-lg font-medium px-1 summary_compare">{{ formatTime(totalSummary2?.dmg?.basicBattleTime) }}</span>
  </span>
</div>
```

**Step 4: Verify build compiles**

Run: `npm run build`

**Step 5: Commit**

```bash
git add src/app/layout/pages/ro-calculator/battle-dmg-summary/
git commit -m "feat: display battle time in skill and basic DPS sections"
```

---

### Task 6: Visual verification

**Step 1: Start dev server**

Run: `npm start`

**Step 2: Open calculator and verify**

Using playwright-cli:
1. Open `http://localhost:4200`
2. Select a job class, equip a weapon, select a skill
3. Select a monster with known HP
4. Verify skill battle time appears below skill DPS
5. Verify basic battle time appears below basic DPS
6. Verify format: short times show as `Xs`, times > 60s show as `Xm Ys`
7. Verify monster comparison table shows `Tempo(s)` column with numeric seconds

**Step 3: Final commit if any fixes needed**
