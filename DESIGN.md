---
name: ProfitPath
description: A monochrome-luxe trading journal for tracking options trades with precision and quiet confidence.
colors:
  ink-black: "#0A0A0B"
  charcoal-surface: "#141416"
  charcoal-card: "#1A1A1D"
  charcoal-elevated: "#222225"
  hairline-border: "#2A2A2E"
  hairline-border-subtle: "#1F1F22"
  hairline-border-accent: "#3A3A3E"
  ivory-text: "#F5F5F5"
  smoke-text: "#8B8B8E"
  ash-text: "#5A5A5D"
  aged-brass: "#C9A962"
  aged-brass-light: "#D4B87A"
  aged-brass-dim: "#8B7444"
  olive-ledger: "#C9A962"
  olive-ledger-bg: "rgba(201, 169, 98, 0.12)"
  muted-wine: "#8B4049"
  muted-wine-bg: "rgba(139, 64, 73, 0.12)"
  chart-line: "#C9A962"
  chart-grid: "#2A2A2E"
  chart-axis: "#5A5A5D"
typography:
  display:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  stat:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "2.5rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.03em"
  body:
    fontFamily: "IBM Plex Mono, SF Mono, monospace"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0.01em"
  data:
    fontFamily: "IBM Plex Mono, SF Mono, monospace"
    fontWeight: 500
    letterSpacing: "-0.02em"
  label:
    fontFamily: "IBM Plex Mono, SF Mono, monospace"
    fontSize: "0.7rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.1em"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "50%"
spacing:
  unit: "8px"
  unit-compact: "6px"
components:
  button-primary:
    backgroundColor: "linear-gradient(135deg, {colors.aged-brass} 0%, {colors.aged-brass-light} 50%, {colors.aged-brass} 100%)"
    textColor: "{colors.ink-black}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ivory-text}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  card:
    backgroundColor: "{colors.charcoal-card}"
    textColor: "{colors.ivory-text}"
    rounded: "{rounded.lg}"
    padding: "20px"
  input:
    backgroundColor: "{colors.charcoal-surface}"
    textColor: "{colors.ivory-text}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "14px 16px"
  badge-win:
    backgroundColor: "{colors.olive-ledger-bg}"
    textColor: "{colors.olive-ledger}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "4px 10px"
  badge-loss:
    backgroundColor: "{colors.muted-wine-bg}"
    textColor: "{colors.muted-wine}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "4px 10px"
---

# Design System: ProfitPath

## Overview

**Creative North Star: "Monochrome Luxe"**

ProfitPath reads like a private trading ledger, not a consumer fintech app: a near-black (or warm-cream, in light mode) canvas, disciplined mono/serif type, and exactly one accent color spent sparingly. Cormorant Garamond gives large numbers and headings an editorial, almost old-money weight; IBM Plex Mono keeps every trade, label, and data point feeling precise and tabular, like ledger entries. Aged Brass gold is the only color that speaks at full volume, everything else (win green, loss wine) sits in muted, desaturated tones so wins and losses register as facts, not alarms.

The system is restrained and precise by design: buttons, cards, and inputs are flat and quiet at rest, and gold or shadow only appears as a deliberate response to hover or focus. Nothing animates or glows without a reason. A subtle noise-texture overlay and soft glass blur keep the flatness from feeling sterile.

**Key Characteristics:**
- Near-monochrome base (charcoal/ink in dark, warm cream in light) with a single gold accent used deliberately, not decoratively.
- Cormorant Garamond for display/stat numbers, IBM Plex Mono for everything else, including body copy.
- Flat at rest; depth and gold only appear on hover, focus, or as a status signal.
- Win/loss colors are muted and desaturated, never neon-bright.

## Colors

The palette is near-monochrome with one deliberate accent; win and loss colors are desaturated so they read as calm data, not alerts.

### Primary
- **Aged Brass** (`#C9A962` dark / `#9E7C3C` light): the only accent color in the system. Used for the logo mark, active nav state, focus rings, primary buttons, hover borders on cards, and chart lines. Appears as a gradient (`aged-brass` → `aged-brass-light` → `aged-brass`) on primary buttons only.

### Neutral
- **Ink Black** (`#0A0A0B` dark / warm cream `#FAF8F5` light): base page background.
- **Charcoal Surface** (`#141416` dark / `#F5F2ED` light): secondary surface (table headers, filter bars, input backgrounds).
- **Charcoal Card** (`#1A1A1D` dark / `#FFFFFF` light): elevated card/modal background.
- **Charcoal Elevated** (`#222225` dark / `#EFEBE5` light): highest elevation surface (icon chips, hover states).
- **Hairline Border** (`#2A2A2E` dark / `#E5E0D8` light): the default 1px border on cards, inputs, and dividers. Never heavier than 1px.
- **Ivory Text** (`#F5F5F5` dark / `#1A1A1D` light): primary text and headings.
- **Smoke Text** (`#8B8B8E` dark / `#5A5A5D` light): secondary text.
- **Ash Text** (`#5A5A5D` dark / `#8B8B8E` light): muted/tertiary text, stat labels.

### Semantic (win / loss)
- **Olive Ledger** — light mode uses true olive green (`#6B8E23`); dark mode reuses Aged Brass gold (`#C9A962`) instead of a separate green, so gold does double duty as "profit" in dark mode.
- **Muted Wine** (`#8B4049` dark / `#A04050` light): losses. Always a desaturated wine/burgundy, never a bright red.
- Both semantic colors always pair with a soft ~12% opacity background tint of themselves (`*-bg` tokens), used behind badges, icon chips, and status bars.

### Named Rules
**The One Accent Rule.** Aged Brass gold is the only saturated color allowed outside win/loss semantics. If a new UI element wants a color, the answer is gold, a neutral, or a win/loss tone. Never introduce a fourth hue.

**The Gold-Is-Profit Rule.** In dark mode, "win" reuses the gold accent rather than green, gold reads simultaneously as brand and as profit. Light mode is the only place true olive green appears.

## Typography

**Display Font:** Cormorant Garamond (with Georgia, serif fallback)
**Body/Label/Data Font:** IBM Plex Mono (with SF Mono, monospace fallback)

**Character:** An editorial serif for the numbers that matter most, paired with a clean technical mono for everything you'd expect to see in a ledger or terminal. The pairing reads as "old-money meets trading desk."

### Hierarchy
- **Display** (weight 500, `1.5rem`–`4rem` depending on context, line-height 1.2, letter-spacing -0.02em): page and section headings (`h1`–`h6`), always Cormorant Garamond.
- **Stat** (weight 400, `2.5rem`, line-height 1, letter-spacing -0.03em): the large number in a metric card (net profit, balance). Drops to `2rem` at ≤640px.
- **Body** (weight 400, `1rem`, line-height 1.6, letter-spacing 0.01em): default page copy, always IBM Plex Mono, not a sans-serif.
- **Data** (weight 500, tabular numerals via `font-feature-settings: 'tnum' 1'`): trade values, prices, table cells, anything meant to align in a column.
- **Label** (weight 500, `0.7rem`, letter-spacing 0.1em, uppercase): stat labels, table headers, badges, form field labels.

### Named Rules
**The Ledger-Alignment Rule.** Any numeric value that could appear in a list or table uses `data-value`/tabular numerals so digits align vertically, columns of numbers must line up like a real ledger.

## Layout

Content is centered in a `max-w-6xl` (1152px) column with `px-6`/`px-8` side padding. The header is fixed and glass-blurred at the top (`h-20`, shifts down when the demo-mode banner is showing); primary navigation lives in a fixed, floating bottom dock instead of a sidebar, keeping the main content column full-width on desktop and thumb-reachable on mobile.

Spacing follows an 8px base unit (`--space-unit`), which contracts to 6px at the `≤640px` breakpoint alongside a drop in stat-value size (`2.5rem` → `2rem`). Cards and charts use consistent internal padding (20–24px) regardless of viewport; density reduces via smaller type and tighter gaps, not smaller padding.

## Elevation & Depth

The system is flat by default. Cards, inputs, and buttons carry no shadow at rest, depth is conveyed through a 1px hairline border and a very slightly lighter background per elevation step (page → surface → card → elevated). Shadows exist but are reserved as a hover/focus response, not an ambient resting state.

### Shadow Vocabulary
- **`luxe-sm`** (`0 1px 3px rgba(0,0,0,0.08)` light / `0 1px 2px rgba(0,0,0,0.4)` dark): resting shadow on primary buttons only.
- **`luxe-md`** (`0 4px 12px rgba(0,0,0,0.1)` light / `...,0.5)` dark): hover state for cards and buttons.
- **`luxe-lg`** (`0 8px 24px rgba(0,0,0,0.12)` light / `...,0.6)` dark): modals and the floating bottom dock.
- **`glow`** (`0 0 40px rgba(158,124,60,0.15)`): an ambient gold glow added only alongside `luxe-md` on primary-button hover, never used alone.

### Named Rules
**The Flat-At-Rest Rule.** Nothing has a shadow until it's hovered, focused, or is a genuinely floating surface (modal, dock). A resting shadow on a static element is a bug, not a style choice.

## Shapes

Corners are moderate and consistent, never sharp, never fully rounded except true circles. Badges and small chips use `4px` (`sm`), buttons and inputs use `8px` (`md`), cards and charts use `12px` (`lg`), modals use `16px` (`xl`). Circular elements (avatars, the loading spinner, the tag-color dot) are the only fully-rounded shapes. Borders are always a single 1px hairline, doubling a border's weight is not part of this system's vocabulary.

## Components

### Buttons
- **Shape:** `8px` radius (`md`).
- **Primary:** gold gradient background (`aged-brass` → `aged-brass-light` → `aged-brass`), ink-black text, uppercase mono label, `12px 24px` padding, `luxe-sm` shadow at rest.
- **Hover / Focus:** `filter: brightness(1.1)`, shadow escalates to `luxe-md` + `glow`, lifts `1px` (`translateY(-1px)`); returns to baseline on active/press.
- **Secondary / Ghost:** transparent background, 1px hairline border, ivory text; on hover the border and text turn gold and the background gains a faint olive-ledger tint.

### Chips / Badges (Tags)
- **Style:** tag-colored 15%-opacity background, tag-colored text and 30%-opacity border, `4px` radius, a small solid dot in the tag's true color leads the label.
- **Removable variant:** swaps to a neutral elevated background with a hover-only border accent, used when a tag chip is filterable/removable rather than purely informational.
- **Win/Loss badges:** same shape, but colors are locked to the semantic olive-ledger/muted-wine tokens rather than a custom tag color.

### Cards / Containers
- **Corner Style:** `12px` radius.
- **Background:** `charcoal-card` (dark) / white (light), always with a 1px hairline border.
- **Shadow Strategy:** flat at rest; on hover, border brightens to `border-accent` and a thin gold gradient hairline fades in along the top edge (`::before`, opacity 0 → 0.4).
- **Internal Padding:** `20px` (metric cards), `24px` (chart containers).

### Inputs / Fields
- **Style:** `charcoal-surface` background, 1px hairline border, `8px` radius, `14px 16px` padding, mono type.
- **Focus:** border turns gold, plus a soft `3px` gold-tinted glow ring (`box-shadow: 0 0 0 3px rgba(gold, 0.1-0.15)`), no border-width change.

### Navigation
- **Header:** fixed, glass-blurred (`backdrop-blur-xl` over 90%-opacity background), 1px bottom hairline, logo in display serif with the "Path" half of the wordmark always gold.
- **Bottom Dock (signature component):** a floating, pill-shaped, macOS-style dock fixed to the bottom of the viewport. Items magnify on proximity (spring physics: mass 0.1, stiffness 150, damping 12); the active/selected item gets a solid gold fill instead of a border highlight. This is the primary navigation surface, there is no sidebar. Sized down slightly on mobile (48px → 42px base item) but stays the same interaction model, it is not swapped for a generic tab bar.

## Do's and Don'ts

### Do:
- **Do** treat gold as the only saturated accent; every other color is neutral or semantic (win/loss).
- **Do** keep numeric/tabular values in IBM Plex Mono with tabular numerals so they align in columns.
- **Do** keep shadows absent at rest and introduce them only on hover, focus, or for genuinely floating surfaces (modals, the dock).
- **Do** use the floating bottom dock as primary navigation; keep it thumb-reachable and don't bury it behind a hamburger menu on mobile.
- **Do** keep borders single-weight hairlines (1px) at every elevation level.

### Don't:
- **Don't** introduce a second saturated brand color alongside gold.
- **Don't** use a bright/saturated red or green for win/loss states; they must stay muted (wine / olive or gold-in-dark).
- **Don't** add a resting shadow to a static card, button, or input, shadows are earned by interaction or floating position.
- **Don't** replace the bottom dock with a conventional top tab bar or sidebar; it's a deliberate, named signature component.
- **Don't** set body copy in a sans-serif; body and data text stay in IBM Plex Mono, only headings and stat numbers use Cormorant Garamond.
