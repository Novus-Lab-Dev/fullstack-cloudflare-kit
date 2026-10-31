# [Brand Name] — Brand Guidelines Book

> A single source of truth for identity and product design.
> **Part 1** is for partners, press, and anyone using the brand externally.
> **Part 2** is for product and design teams building the UI.
> Edit tokens in one place, keep every section following the same anatomy:
> _Description → Visual examples → Do / Don't → Reference values → Downloads._

---

## Table of Contents

1. [Introduction / Brand Story](#1-introduction--brand-story)
2. [Logo](#2-logo)
3. [Logo Usage](#3-logo-usage)
4. [Brand Assets](#4-brand-assets)
5. [Color Palette](#5-color-palette)
6. [Typography](#6-typography)
7. [Photography & Illustration](#7-photography--illustration)
8. [Brand Voice & Messaging](#8-brand-voice--messaging)
9. [Best Practices](#9-best-practices)
10. [Design Tokens](#10-design-tokens)
11. [Shape (Radii)](#11-shape-radii)
12. [Elevation (Shadows)](#12-elevation-shadows)
13. [Components — Buttons](#13-components--buttons)
14. [Typography Classes](#14-typography-classes)
15. [Surfaces & Backgrounds](#15-surfaces--backgrounds)
16. [Iconography](#16-iconography)
17. [Package Components](#17-package-components)
18. [Getting Started (Developers)](#18-getting-started-developers)

---

# Part 1 — Brand Identity

## 1. Introduction / Brand Story

One paragraph on what the brand stands for and who it serves.

- **Brand essence:** [three words that describe the brand]
- **Mission:** [why the brand exists]
- **Naming:** [meaning behind the name and its parts]
- **Mark symbolism:** [what the logo symbol represents and how its elements relate to the product story]

---

## 2. Logo

### 2.1 Anatomy

Describe the construction of the mark and wordmark.

| Element | Description |
| --- | --- |
| Mark / Icon | [what it depicts, geometry, story] |
| Wordmark | [letter casing, typeface, per-part weights] |
| Lockup | [how mark and wordmark combine, spacing/tracking] |

### 2.2 Variants

| Variant | Usage |
| --- | --- |
| Full lockup (dark) | Default on light backgrounds |
| Full lockup (light) | On dark / photo backgrounds |
| Mark only | Avatars, favicons, small spaces |
| App icon | [platform] stores and home screen |
| Monochrome | Print, embossing, single-color contexts |

---

## 3. Logo Usage

### 3.1 Clear Space and Minimum Size

- **Clear space:** keep a margin of [_N_] × [reference unit, e.g., "the mark's leaf width"] around the logo.
- **Minimum size (lockup):** [_N_] px on screen / [_N_] mm in print.
- **Minimum size (icon/favicon):** [_N_] px / [_N_] mm.

### 3.2 Color Backgrounds

| Background | Logo version |
| --- | --- |
| Light (brand neutral) | [primary/dark logo] |
| Dark | [light logo] |
| Brand primary | [specified variant] |
| Photography | [specified variant + overlay guidance] |

### 3.3 Incorrect Usage

- ❌ Stretching or squeezing (never change aspect ratio)
- ❌ Rotating or skewing
- ❌ Recoloring outside approved variants
- ❌ Adding shadows, glows, outlines, or effects
- ❌ Placing on low-contrast backgrounds
- ❌ Rearranging the lockup or swapping fonts

---

## 4. Brand Assets

Official downloadable files. Keep names and formats consistent.

| Asset | File | Format |
| --- | --- | --- |
| Logo — [variant] | `[brand]-logo.svg` | SVG |
| Logo — [variant] | `[brand]-logo-[color].svg` | SVG |
| Mark — [variant] | `[brand]-mark-[color].svg` | SVG |
| App icon | `[brand]-app-icon.svg` | SVG + PNG@[sizes] |
| Full pack | `[brand]-brand-assets.zip` | ZIP |

**Rules**

- Always use official files — never rebuild the logo from screenshots.
- For tokens, components, and implementation, see [Part 2](#part-2--design-system).

---

## 5. Color Palette

### 5.1 Core Colors

| Swatch | Name | Hex | RGB | CMYK | Usage |
| --- | --- | --- | --- | --- | --- |
| ■ | [Ink / Primary text] | `#______` | _, _, _ | _, _, _, _ | Text, icons, logo on light |
| ■ | [Milk / Base surface] | `#______` | _, _, _ | _, _, _, _ | Page background, text on dark |
| ■ | [Brand primary] | `#______` | _, _, _ | _, _, _, _ | Logo accent, primary buttons |
| ■ | [Brand dark] | `#______` | _, _, _ | _, _, _, _ | Dark surfaces, small primary text |
| ■ | [Accent / Highlight] | `#______` | _, _, _ | _, _, _, _ | Highlights, gradients |

### 5.2 Pop / Support Colors

| Swatch | Name | Hex | RGB | CMYK | Usage |
| --- | --- | --- | --- | --- | --- |
| ■ | [Pop 1] | `#______` | _, _, _ | _, _, _, _ | One per view |
| ■ | [Pop 2] | `#______` | _, _, _ | _, _, _, _ | One per view |
| ■ | [Pop 3] | `#______` | _, _, _ | _, _, _, _ | One per view |
| ■ | [Tint / wash] | `#______` | _, _, _ | _, _, _, _ | Gradient stop, soft base |
| ■ | [Deep tone] | `#______` | _, _, _ | _, _, _, _ | [Support-color] text on light |
| ■ | [Night / Footer] | `#______` | _, _, _ | _, _, _, _ | Footer, dark cards |

### 5.3 Color Distribution

> [Primary leads. Pops play.] One guiding sentence for the palette.

| Role | Share |
| --- | --- |
| Neutral background | ~[_N_%] |
| Text / ink | ~[_N_%] |
| Brand primary | ~[_N_%] |
| Pop accents | ~[_N_%] |

**Rule:** use at most **one pop color per view**; let the neutral carry the rest.

---

## 6. Typography

### 6.1 Typefaces

| Role | Typeface | Fallback / Script pairing | Notes |
| --- | --- | --- | --- |
| Primary (headlines, body, UI) | [Font name] | [Script font] for [language] | [source: Google Fonts link] |
| Display (optional) | [Font name] | — | [when to use] |
| Mono (code) | [Font name] | — | [when to use] |

- When two languages appear together, keep the **same weight** for both fonts.
- Weight scale: 300 Light · 400 Regular · 500 Medium · 600 Semi Bold · 700 Bold · 800 Extra Bold · 900 Black

### 6.2 Web Embed

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=[PrimaryFont]:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
```

---

## 7. Photography & Illustration

- **Style:** [real photos / illustrated / mixed], [mood: saturated, cheerful, calm…]
- **Backdrops:** [colored backdrops using palette — list allowed colors]
- **Subjects:** [what to show: people using the product, products in context…]
- **Do:** [authentic imagery, natural light, brand-colored props]
- **Don't:** [stock clichés, heavy filters, off-palette backgrounds, low resolution]

---

## 8. Brand Voice & Messaging

- **Tone:** [plain, warm, confident — pick 3]
- **Vocabulary:** say status in plain words — "[example phrase]", not "[jargon phrase]"
- **Never:** [apologies overload, passive voice, technical jargon for users]
- **Bilingual rule:** [write both languages, match weight and tone]
- **Message hierarchy:** [lead with the product benefit, not the logo]

---

## 9. Best Practices

> [_N_ habits that keep [Brand Name] looking like [Brand Name]]

| # | Habit | Rule |
| --- | --- | --- |
| 01 | Lead with the product | The logo supports; it never shouts |
| 02 | One pop per view | [Primary] leads, one accent plays |
| 03 | [Show [key UI element] always] | [e.g., payment method is visible] |
| 04 | Write both languages | [Script A] and [Script B], same weight |
| 05 | Respect clear space | Keep [unit] around the logo |
| 06 | Use real photos | [Saturated, cheerful, colored backdrops] |
| 07 | Say status in plain words | "[example]", not "[example]" |
| 08 | Design for the phone first | Test every screen on a small device |

---

# Part 2 — Design System

> Everything from `[package-name]`: semantic theme, type classes, radii, shadows, buttons, and [framework] primitives.
> Edit `design-tokens.[ext]`, run `generate`. Logo downloads live in [§4 Brand Assets](#4-brand-assets).

## 10. Design Tokens

### 10.1 Token Quick Reference

| Token | Value | Maps to |
| --- | --- | --- |
| `--[brand]-ink` | `#______` | `--foreground` |
| `--[brand]-milk` | `#______` | `--background` |
| `--[brand]-primary` | `#______` | `--primary` |
| `--[brand]-accent` | `#______` | `--accent` |
| `--[brand]-[name]` | `#______` | `[semantic variable]` |

### 10.2 Semantic Theme

The styles sheet maps palette colors onto [UI kit, e.g., shadcn] variables (`bg-background`, `text-primary`, …). Raw palette is exposed as brand utilities.

| Semantic role | Variable | Palette color |
| --- | --- | --- |
| background | `--background` | [color] |
| foreground | `--foreground` | [color] |
| card | `--card` | [color] |
| primary | `--primary` | [color] |
| secondary | `--secondary` | [mix / formula] |
| muted | `--muted` | [mix / formula] |
| accent | `--accent` | [color] |
| destructive | `--destructive` | [color] |

### 10.3 Brand Utilities

```
bg-brand-[name]   text-brand-[name]   border-brand-[name]
```

### 10.4 Installation

```css
@import "tailwindcss";
@import "[package-name]/styles.css";
```

---

## 11. Shape (Radii)

Utility prefix: `rounded-brand-*`

| Token | Class | Value | Usage |
| --- | --- | --- | --- |
| sm | `rounded-brand-sm` | [_N_]rem | Inputs, chips |
| md | `rounded-brand-md` | [_N_]rem | Cards, buttons |
| lg | `rounded-brand-lg` | [_N_]rem | Panels, modals |
| xl | `rounded-brand-xl` | [_N_]rem | Hero surfaces |
| full | `rounded-full` | 9999px | Avatars, pills |
| icon | `[brand]-icon-tile` | [_N_%] | App icon tile |

---

## 12. Elevation (Shadows)

[Ink]-tinted soft and card shadows.

| Token | Class | Value | Usage |
| --- | --- | --- | --- |
| soft | `shadow-brand-soft` | `0 [_N]px [_N]px rgb([ink] / 0.[__])` | Hero, floating elements |
| card | `shadow-brand-card` | `0 [_N]px [_N]px rgb([ink] / 0.[__])` | Cards, sheets |

---

## 13. Components — Buttons

[Style note, e.g., "Polaris-style bevels"]. Add a size modifier to the base class: `--[medium|compact]`.

| Variant | Base class | Usage |
| --- | --- | --- |
| Primary | `[brand]-btn-primary` | Main call to action (one per view) |
| Dark | `[brand]-btn-dark` | [secondary emphasis] |
| Secondary | `[brand]-btn-secondary` | Supporting actions |
| Outline | `[brand]-btn-outline` | Neutral / informational |
| Ghost | `[brand]-btn-ghost` | Dismiss, skip |
| Destructive | `[brand]-btn-destructive` | Dangerous actions |
| Plain | `[brand]-btn-plain` | Inline / third-party links |

**Sizes:** `--medium` (default) · `--compact` (dense UI)

**Pairing:** [primary + one secondary max; never two primaries side by side]

```html
<a class="[brand]-btn-primary">[Call to action]</a>
<a class="[brand]-btn-primary [brand]-btn-primary--medium">[Sign up]</a>
<a class="[brand]-btn-primary [brand]-btn-primary--compact">[Compact]</a>
```

---

## 14. Typography Classes

Classes: `[brand]-display … [brand]-caption`

| Role | Class | Size / Line-height · Weight · Tracking | Example |
| --- | --- | --- | --- |
| display | `[brand]-display` | [_N_ / _N_] · [800] · [-_N_%] | [Headline text] |
| heading | `[brand]-heading` | [_N_ / _N_] · [700] · [-_N_%] | [Section title] |
| subhead | `[brand]-subhead` | [_N_ / _N_] · [600] | [Subheading] |
| body | `[brand]-body` | [_N_ / _N_] · [400] | [Body copy sentence] |
| caption | `[brand]-caption` | [_N_ / _N_] · [500] | [Label / meta] |

---

## 15. Surfaces & Backgrounds

[Component name, e.g., `BrandBackground`] variants — pass [flag, e.g., `withMark`] for a [watermark] effect.

| Variant | Name | Description |
| --- | --- | --- |
| Stripes | `stripes` | [angled brand stripes] |
| [Glow] | `[name]Glow` | [radial accent glow] |
| [Pop] | `[name]Pop` | [high-contrast pop surface] |
| [Mist] | `[name]Mist` | [soft tinted wash] |
| [Sweep] | `[name]Sweep` | [gradient sweep] |
| Bubbles / Ripples / Dots | `bubbles` `ripples` `dots` | [patterned textures] |
| Fluted | `fluted` / `fluted[Color]` | [corrugated pattern] |

---

## 16. Iconography

### 16.1 Icon Styles

- **3D / dimensional icons** — transparent [_N_]px PNGs. Use where an item needs a face (navigation, feature entry points).
- **Flat line icons** — use for small actions inside buttons and menus.

### 16.2 Sizes

20 px · 24 px · 32 px · 48 px (source at [_N_]px)

### 16.3 Do / Don't

| Do | Don't |
| --- | --- |
| Navigation and feature entry points | Recoloring or stretching |
| One icon per item, unboxed | Mixing 3D and flat icons in a row |
| Grey out locked/disabled items | Inline in buttons or text |
| | Anything below [_N_] px |

### 16.4 Icon Library

[list of icon names — badge, bag, bell, box, card, cart, chart, … ]

---

## 17. Package Components

Import from `[package-name]`. [Mark fills with `currentColor`.]

| Component | Description |
| --- | --- |
| `[Brand]Logo` | Full lockup |
| `[Brand]Mark` | Icon only |
| `[Brand]AppIcon` | App icon tile |
| `BrandBackground` | Surface variants from [§15](#15-surfaces--backgrounds) |
| `colors` | Token object for programmatic use |

```ts
import {
  BrandBackground,
  [Brand]AppIcon,
  [Brand]Logo,
  [Brand]Mark,
  colors,
} from "[package-name]";
```

---

## 18. Getting Started (Developers)

1. Install: `bun add [package-name]` (or `npm i [package-name]`)
2. Import styles: see [§10.4](#104-installation)
3. Load fonts: see [§6.2](#62-web-embed)
4. Edit tokens in `design-tokens.[ext]`, then run `generate`
5. Reference components from `[package-name]`; don't fork palette values locally

---

## Appendix — Section Page Anatomy (for the Figma book)

Every chapter page in the Figma book follows this fixed layout:

1. **Chapter number + title** (display type)
2. **One-line description** (subhead type)
3. **Visual example grid** (swatches, logo variants, component states)
4. **Do / Don't row** (✅ / ❌ thumbnails with captions)
5. **Reference table** (values: hex / RGB / CMYK / CSS var / class name)
6. **Download or code snippet** block (where applicable)
