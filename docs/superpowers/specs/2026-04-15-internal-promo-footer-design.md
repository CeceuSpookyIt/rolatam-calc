# Internal Promo Footer — Design Document

**Date:** 2026-04-15
**Goal:** Replace the minimal "by PrimeNG" footer with a rotating promotional banner that cross-promotes the Instanceiro tool and the Claudinhos guild to RO LATAM Calculator users.

## Context

The calculator serves the same audience as two other projects owned by the same team:

- **Instanceiro** (`instanceiro.vercel.app`) — instance cooldown and MVP respawn tracker for RO LATAM. Next.js + Supabase. Already live.
- **Guild Claudinhos** — Brazilian guild on the Nidhogg server. Branding/visibility only.

Google AdSense was ruled out (no custom domain, GitHub Pages subdomain rejected). Instead of third-party ads, the team opted for internal cross-promotion using a hardcoded footer banner.

## Behavior

- **1 slot** in the footer area, replacing the current `<app-footer>` component.
- **Random rotation**: each page load picks one of the two promos with equal probability (50/50 via `Math.random()`).
- **Label**: each promo displays a subtle "outros projetos da casa" tag for transparency.
- **Not dismissible**: no X button, no localStorage tracking. The banner is always present.
- **No animation**: renders immediately with the page.

## Content

### Promo 1 — Instanceiro

| Field | Value |
|-------|-------|
| Logo | `src/assets/images/promo/instanceiro.svg` (shield+clock, copper/amber) |
| Title | Instanceiro |
| Description | Trackeie o cooldown das suas instâncias e o respawn dos MVPs do RO LATAM em tempo real. |
| CTA | "Acessar →" → `https://instanceiro.vercel.app?utm_source=rocalc&utm_medium=promo-footer` |
| Background | Subtle copper gradient: `rgba(200,121,65,0.08)` → `rgba(232,166,101,0.04)` |
| Title color | Amber `#E8A665` |
| CTA button | Solid copper `#C87941`, dark text |
| Hover | Background lightens slightly, `cursor: pointer` on entire banner row |

### Promo 2 — Guild Claudinhos

| Field | Value |
|-------|-------|
| Logo | `src/assets/images/promo/claudinhos.png` (hood+orb, ~128x128) |
| Title | Guild Claudinhos |
| Description | A guild da turma que faz essa calc — servidor Nidhogg. |
| CTA | None (pure branding selo) |
| Background | Subtle purple gradient: `rgba(168,85,247,0.10)` → `rgba(250,204,21,0.04)` |
| Title color | Gold `#FACC15` |
| Hover | Default cursor, no highlight (not clickable) |

### Shared Elements

- **Label tag**: "outros projetos da casa" — small uppercase badge, `rgba(255,255,255,0.06)` background, `#6c7079` text.
- **Footer baseline**: "© 2026 — RO LATAM Calculator" below the promo slot.
- **Logo container**: 44x44px, `border-radius: 6px`, `overflow: hidden`, `object-fit: contain`.

## Architecture

### New Component: `PromoFooterComponent`

- **Selector**: `<app-promo-footer>`
- **Module**: declared in `AppLayoutModule`
- **Template**: separate `.html` file (follows project convention) — single `div` with conditional rendering based on selected promo index
- **Logic**:
  - `promos: PromoItem[]` — hardcoded array of 2 entries
  - `selectedPromo: PromoItem` — assigned in `ngOnInit()` via `Math.floor(Math.random() * promos.length)`
  - `PromoItem` interface: `{ id, title, description, logoSrc, ctaLabel?, ctaUrl?, bgClass, titleColorClass, isClickable }`
- **Styles**: component-scoped CSS
  - Banner row with flexbox (logo | copy | CTA)
  - Gradient backgrounds per promo via `[ngStyle]` or CSS class per promo ID
  - Hover state only for `isClickable` promos (Instanceiro)
  - Footer baseline row below

### Asset Files

| File | Source | Notes |
|------|--------|-------|
| `src/assets/images/promo/instanceiro.svg` | `d:/rag/instance-tracker/public/app-icon.svg` | viewBox adjusted to `"20 47 472 472"` for visual centering |
| `src/assets/images/promo/claudinhos.png` | `C:/Users/Marcel/Downloads/Generated Image March 10, 2026 - 1_58PM.png` | Resize to 128x128 |

### Files Changed

| File | Change |
|------|--------|
| `src/app/layout/promo-footer/promo-footer.component.ts` | **New** — component with template and logic |
| `src/app/layout/promo-footer/promo-footer.component.css` | **New** — banner styles, hover, gradient backgrounds |
| `src/app/layout/app.layout.module.ts` | Register `PromoFooterComponent` in declarations |
| `src/app/layout/app.layout.component.html` | Replace `<app-footer>` with `<app-promo-footer>` |
| `src/assets/images/promo/instanceiro.svg` | **New** — logo asset |
| `src/assets/images/promo/claudinhos.png` | **New** — logo asset (128x128) |

### What Happens to `<app-footer>`

The existing `AppFooterComponent` and its template (`app.footer.component.html`) remain in the codebase but are no longer referenced in the layout. They can be removed in a follow-up cleanup if desired.

## Enhancements Included

1. **Hover highlight** (#4) — Instanceiro banner row gets `background` transition + `cursor: pointer` on hover. Claudinhos stays inert.
2. **UTM parameter** (#6) — Instanceiro CTA links to `instanceiro.vercel.app?utm_source=rocalc&utm_medium=promo-footer`. Enables tracking referrals via Vercel Analytics on the Instanceiro side (external dependency, not part of this implementation).

## Out of Scope

- Mobile responsiveness for the banner (can be added later)
- Banner dismiss button / localStorage persistence
- Fade-in animation
- Click tracking / analytics infrastructure on the calculator
- Backend / CMS / Supabase for ad management
- A/B testing or weighted rotation
- Installing Vercel Analytics on the Instanceiro project (separate task)
- Landing page `/claudinhos` within the calculator
- Modifying the Claudinhos ad to include a CTA (future: may link to Discord or info dialog)

## External Dependency

For the UTM tracking to provide value, `@vercel/analytics` needs to be installed on the Instanceiro project (`d:/rag/instance-tracker`). This is a separate 1-line change:

```tsx
// instance-tracker/src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
// add <Analytics /> to the JSX
```

This is NOT part of the current implementation scope but is noted here for completeness.
