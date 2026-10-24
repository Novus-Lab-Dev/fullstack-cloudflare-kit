# `apps/landing`

Marketing site for the SMS API, built with Astro and Tailwind CSS v4.

## Commands

```sh
bun run dev       # dev server on http://localhost:3000
bun run build     # static build to ./dist
bun run preview   # preview the production build
```

From the repo root, `bun dev` starts this app alongside `apps/api` via dekit.

## Structure

```text
src/
├── pages/                  # routes (compose sections)
├── layouts/Layout.astro    # document shell: meta, global.css, header + footer
├── sections/{section}/     # one folder per section: {Section}.astro + {section}.content.ts
├── components/
│   ├── layout/             # Header, Footer
│   └── ui/                 # Container, Section, Button
├── common/
│   ├── constants/          # site.config.ts (metadata, nav, CTAs)
│   ├── helpers/            # classNames
│   └── interfaces/         # content contracts
├── styles/
│   ├── global.css          # entry: tailwind + tokens + base
│   ├── tokens.css          # @theme brand palette, font stack
│   └── base.css            # element defaults
└── assets/                 # images
```

## Styling

Tailwind utilities live directly in the `.astro` markup; shared primitives (`Container`, `Section`, `Button`) hold variant maps merged through `classNames()` and accept a `class` prop for one-off overrides.

- Brand colors: `bg-brand-600`, `text-brand-700`, … (tokens in `src/styles/tokens.css`)
- Neutrals: Tailwind's `slate-*` scale
- `src/styles/global.css` is imported once by `Layout.astro` and stays an entry point — no per-section CSS files.

Copy lives in `sections/*/*.content.ts`; site metadata lives in `src/common/constants/site.config.ts`. See [AGENTS.md](./AGENTS.md) for the full conventions.
