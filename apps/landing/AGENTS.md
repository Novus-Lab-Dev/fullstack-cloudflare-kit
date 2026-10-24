# AGENTS.md — `apps/landing`

Guidance for AI agents (and humans) working in this landing package. Describe patterns here generically; concrete sections (e.g. `hero`) are examples of the convention, not the rule.

## Stack

- **Framework:** Astro (static output, no SSR adapter, no client framework).
- **Styling:** Tailwind CSS v4 via `@tailwindcss/vite`. Utilities live in `.astro` markup; `src/styles/` holds only the engine entry, design tokens and element defaults.
- **Types:** TypeScript strict (`astro/tsconfigs/strict`). Plain relative imports — no path aliases, matching `apps/api`.
- **Shared helpers:** plain exported functions (`classNames`), not classes — matching the landing package's function-first style.

## Commands

| Task | Command |
|---|---|
| Dev (workspace runner) | `bun dev` from the repo root → dekit starts `api` + `landing` |
| Dev (this package only) | `bun run dev` → `http://localhost:3000` |
| Build | `bun run build` |
| Preview build | `bun run preview` |

## Architecture map

```
src/
├── pages/                     # routes only: compose sections, no copy, no styling decisions
│   ├── index.astro
│   └── 404.astro
├── layouts/
│   └── Layout.astro           # document shell: head/meta, global.css, Header + main + Footer
├── components/
│   ├── layout/                # page chrome: Header, Footer
│   ├── ui/                    # primitives: Container, Section, Button
│   └── sections/              # {Section}.astro per section; {section}/ folder only for multi-component sections
│       ├── {Section}.astro    # copy + markup + utility classes
│       └── {section}/*.astro  # optional: a section split into several components
├── common/                    # shared, page-state-free infrastructure
│   ├── constants/             # site.config.ts (name, description, nav, CTAs) + index.ts re-exports
│   ├── helpers/               # classNames (utility-string composition)
│   └── interfaces/            # site contracts (NavItem, SocialLink)
├── styles/
│   ├── global.css             # entry: tailwind import + tokens + base
│   ├── tokens.css             # @theme: brand palette, font stack
│   └── base.css               # element defaults only (html/body, focus ring)
└── assets/                    # images imported by components
```

Layering rule: `page → section → ui primitive`. A page only orders sections; a section (`components/sections/`) owns its copy and markup; a primitive (`components/ui/`) owns reusable layout and variants. Sections never render `<html>`, and primitives never import a section.

## Styling rules

- **Utilities in markup.** Style `.astro` files with Tailwind utilities directly; do not add per-section CSS files or `<style>` blocks.
- **Tokens over literals.** Brand colors come from `bg-brand-*` / `text-brand-*` (defined in `tokens.css`); neutrals use the default `slate-*` scale. No hex values in markup.
- **Variants are maps, not inline ternaries.** Primitives declare `Record<NonNullable<Props["variant"]>, string>` maps and merge them with `classNames(...)`; add a variant to the map instead of branching in the template.
- **Overrides via `class` prop.** Every primitive accepts `class?: string`, merged last, so a section can nudge spacing without editing the primitive.
- **Promote, don't duplicate.** The same utility cluster repeated in three or more sections becomes a primitive (or an `@apply` rule in `base.css`); one-off tweaks stay in the section.
- **Mobile-first.** Base utilities target small screens; add `sm:` (40rem) and `lg:` (64rem) for larger layouts.
- `src/styles/global.css` stays an entry point (engine + tokens + base). It is imported once, by `Layout.astro`.

## Section convention (`src/components/sections/`)

A section is one self-contained component: copy, markup and utility classes in the same `.astro` file. There is no sibling content module — repeating items are a local `const` array in the component frontmatter.

File placement depends on how many components a section owns:

- **One component (default):** `sections/{Section}.astro` — e.g. `sections/Hero.astro`.
- **Several components:** `sections/{section}/` — e.g. `sections/pricing/Pricing.astro` + `sections/pricing/PricingCard.astro`. The section's public entry point keeps the PascalCase name; nothing outside the folder imports the internal helpers.

Start flat and only create a folder when a second component genuinely belongs to that section.

```astro
---
import Section from "../ui/Section.astro";

const features = [
    { title: "Queued delivery", description: "..." },
    { title: "Scoped access", description: "..." },
];
---
<Section id="features">
    <h2 class="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Everything around the send</h2>
    <ul class="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => <li>{feature.title}</li>)}
    </ul>
</Section>
```

- Copy lives only in the section that renders it — never in `pages/`, never in a shared data module.
- Text containing `{ … }` (code samples) stays in a frontmatter template string so Astro does not parse it as an expression.
- Anchor ids used by navigation (`#features`, `#how-it-works`, `#faq`, `#get-started`) are owned by the section component and referenced from `siteConfig.nav` / CTA content. Renaming an id means updating `src/common/constants/site.config.ts`.

### Registering a new section

1. Create `src/components/sections/{Section}.astro` (use a `{section}/` folder only when it needs several components).
2. Import and place it in `src/pages/index.astro` (order = visual order).
3. If it needs a nav entry, add it to `siteConfig.nav` and give the section root a matching `id`.

## UI primitives (`src/components/ui/`)

Keep the set small; add a primitive only when a second section needs the same layout.

| Component | Props | Notes |
|---|---|---|
| `Container` | `class?` | `mx-auto w-full max-w-6xl px-6` |
| `Section` | `id?`, `tone?: "default" \| "muted"`, `class?` | vertical rhythm + surface tone, wraps a `Container` |
| `Button` | `href`, `variant?: "primary" \| "secondary" \| "ghost"`, `size?: "md" \| "lg"`, `class?` | anchor styled as a button |

## Site-wide content (`src/common/constants/`)

`site.config.ts` is the single source of truth for the site name, tagline, description, canonical base URL, navigation, social links and the header CTA. `Layout` derives `<title>`, description, canonical and OG tags from it — pages pass only their own `title`/`description` overrides.

## Misc rules

- Naming: `.astro` components are PascalCase matching their section (`Hero.astro`, `Button.astro`); TypeScript modules are `dot.case` (`site.config.ts`, `hero.content.ts`, `class-names.helper.ts`) — matching the API package.
- Shared helpers are plain functions, not classes; nothing in `common/` may hold page state.
- `Astro.url`-derived values (canonical URLs) live in `Layout.astro` only, so pages stay free of metadata logic.
- Prefer editing a primitive or a token over adding a new one-off utility cluster to a section.

## Documentation

Astro guides worth consulting before related work:

- [Routing](https://docs.astro.build/en/guides/routing/)
- [Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Styling & Tailwind](https://docs.astro.build/en/guides/styling/)
- [Content collections](https://docs.astro.build/en/guides/content-collections/)
