# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**rolatam-calc** is an Angular 16 calculator for Ragnarok Online (LATAM). It computes character damage/DPS across all job classes, manages equipment builds, and supports presets via Supabase backend.

- **Live**: https://calcro.claudinhos.org/ (old URL `https://ceceuspookyit.github.io/rolatam-calc/` 301-redirects here)
- **Backend**: Supabase (auth, presets, shared builds, ranking)
- **UI Library**: PrimeNG 16 + PrimeFlex

## Commands

```bash
npm start                # Dev server on port 4200 (HMR enabled)
npm test                 # Karma + Jasmine tests (ChromeHeadless)
npm run lint             # ESLint with auto-fix
npm run build            # Production build → dist/sakai-ng/
```

Production build for deploy:
```bash
MSYS_NO_PATHCONV=1 npx ng build --base-href /
```

## Git Remotes

- `origin` = upstream (turugrura/tong-calc-ro) — **read-only, never push here**
- `myfork` = user's fork (CeceuSpookyIt/rolatam-calc) — push here
- Deploy is automatic via GitHub Actions on push to `main` on `myfork`

## Architecture

### Routing (HashLocationStrategy)

All routes use `#/` prefix. Lazy-loaded modules:
- `/` → `RoCalculatorModule` — main calculator
- `/shared-presets` → `SharedPresetModule` — browse/import other users' builds
- `/preset-summary` → `PresetSummaryModule` — item ranking
- `/login` → `AuthModule` — OAuth callback handler

### Core Calculation Pipeline

1. **Calculator** (`src/app/layout/pages/ro-calculator/calculator.ts`) — Main engine managing `MainModel` (full character state: stats, equipment, skills, buffs). Methods: `setCharacter()`, `setEquipItem()`, `calcDamage()`.
2. **DamageCalculator** (`damage-calculator.ts`) — Physical/magical damage formulas, element/race modifiers, defense penetration.
3. **CharacterBase** (`src/app/jobs/CharacterBase.ts`) — Abstract base for 30+ job classes. Each job defines `JobBonusTable`, skill lists, ASPD tables.

### Data Layer

- **RoService** — Loads game data (`item.json`, `monster.json`, `hp_sp_table.json`) with `shareReplay(1)` caching.
- **AuthService** — Google OAuth via Supabase PKCE flow. State via `ReplaySubject`. Events: `loggedInEvent$`, `profileEventObs$`.
- **PresetService** / **SharedBuildService** — Supabase CRUD for presets and shared builds.
- **ApiServiceModule** — Provides `AuthService`, `PresetService`, `SharedBuildService` app-wide.

### State Management

No global store. Local component state + RxJS Subjects in singleton services.

## Item Script System

Items in `src/assets/demo/data/item.json` (object keyed by item ID, ~7.7 MB). Bonuses stored in `script` field as `Record<string, any[]>`:

```
"atk": ["10"]                     — +10% ATK
"str": ["5"]                      — +5 STR
"Arrow Vulcan": ["200"]           — +200% skill damage
"atk": ["EQUIP[Item Name]===30"]  — conditional set bonus
"cd__Skill Name": ["0.2"]         — cooldown reduction
"vct__Skill Name": ["5"]          — variable cast time reduction
"fct__Skill Name": ["1"]          — fixed cast time
"p_pene_race_dragon": ["10"]      — penetration vs race
```

Prefixes with `__`: `acd`, `cd`, `chance`, `dmg`, `fct`, `fix_vct`, `vct`. Full reference in `memory/script-system.md`.

## Key File Paths

| File | Purpose |
|------|---------|
| `src/app/layout/pages/ro-calculator/calculator.ts` | Core calculation engine |
| `src/app/layout/pages/ro-calculator/damage-calculator.ts` | Damage formulas |
| `src/app/layout/pages/ro-calculator/ro-calculator.component.ts` | Main UI (~2500 lines) |
| `src/app/jobs/CharacterBase.ts` | Job base class |
| `src/app/jobs/_class-list.ts` | Job registry |
| `src/app/models/main.model.ts` | Character state model |
| `src/app/models/item.model.ts` | Item interface |
| `src/app/constants/skill-name.ts` | Skill name constants |
| `src/app/utils/can-used-by-class.ts` | Class restriction checks |
| `src/assets/demo/data/item.json` | Item database |
| `src/assets/demo/data/monster.json` | Monster database |

## Adding a New Job Class

1. Create `src/app/jobs/NewJob.ts` extending `CharacterBase`
2. Define `JobBonusTable`, `initialStatusPoint`, skill lists
3. Register in `src/app/jobs/_class-list.ts`

## Conventions

- User communication in Portuguese (BR)
- Base href must be `/` for production builds (app is served from the root of `calcro.claudinhos.org`)
- Prettier: single quotes, trailing commas, print width 170 (240 for ASPD/data tables)
- TypeScript strict mode is off; `strictTemplates` is on for Angular templates

## Deployment

Custom domain `calcro.claudinhos.org` on GitHub Pages, fronted by Cloudflare DNS-only. Migration done on 2026-04-25 (see `docs/plans/2026-04-24-calcro-domain-migration-*.md`).

**Do not regress any of the following. Each is required for the site to work:**

- **`src/CNAME`** contains `calcro.claudinhos.org`. The `assets` array in `angular.json` (`projects.sakai-ng.architect.build.options.assets`) includes `{ "glob": "CNAME", "input": "src/", "output": "/" }` so the file is copied to `dist/sakai-ng/CNAME` on every build. Removing either side breaks the custom domain on the next deploy.
- **`.github/workflows/deploy.yml`** runs `ng build --base-href /`. Reverting to `/rolatam-calc/` breaks all asset paths.
- **GitHub Pages settings** must stay at `build_type: workflow`. If it flips to `legacy`, GitHub serves stale content from the `gh-pages` branch (which still exists and holds the pre-migration build) instead of the workflow artifact. Verify with `gh api /repos/CeceuSpookyIt/rolatam-calc/pages --jq .build_type`.
- **Cloudflare DNS** zone `claudinhos.org` has a CNAME record `calcro` → `ceceuspookyit.github.io`, **DNS-only** (gray cloud). Enabling the proxy can break Let's Encrypt cert renewal on GitHub Pages.
- **Supabase Auth → URL Configuration → Redirect URLs** must include `https://calcro.claudinhos.org/**`. Removing it breaks Google OAuth on the new domain. Old entry `https://ceceuspookyit.github.io/rolatam-calc/**` is also kept active for OAuth flows landing on the 301 redirect.

**Routing**: app uses `HashLocationStrategy` (`#/` routes). This is intentional. GitHub Pages is static-only, so path-based routing would require a 404.html fallback hack. Hash routing also preserves shared preset URLs across the domain migration (browsers preserve the fragment during 301).

## Translation Policy

- **Items already in the LATAM game client** → use the official name from the client (already in `item.json`)
- **Items NOT yet in the LATAM client** (e.g. upcoming patches) → use the **English name** from Divine Pride (`divine-pride.net/api/database/Item/{id}`)
- **Skills** → same rule: official LATAM client name if available, otherwise English from Divine Pride
- **Never invent free translations** — if no official PT-BR name exists, keep it in English
- When the LATAM client updates with new content, re-import the official names to replace English placeholders
- Divine Pride API key: stored in project memory (not committed)
