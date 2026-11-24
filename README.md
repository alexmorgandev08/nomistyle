# Nomi Style

The design system for Gutenberg content. Gutenberg handles the content; Nomi Style handles the styling.

Style core blocks site-wide, per post, or per block, with visual controls and no CSS.

## MVP scope

| Area | What ships |
| --- | --- |
| Blocks | Table, Heading (H2–H4), List (incl. nested), Quote, Details / Accordion, Button, Image |
| Levels | Global → Post override → Block override (later wins) |
| Scope | Choose post types; exclude individual posts |
| Presets | 4–7 per block (34 total), applied as a starting point; a Presets page lists them all |
| Responsive | Tablet / mobile values for size and spacing controls, using WordPress core's breakpoints; tables can stack rows on small screens |
| Force Style | Marks Nomi Style declarations `!important` when a theme wins |
| Preview | Global Styles preview renders sample blocks through the active theme |

Every block in the spec's Free list is covered. Design tokens, Style Inspector, Style Health, import/export,
custom presets and copy/paste styles are later (Pro) work.

## How it works

```
schema/blocks.json            single source of truth: controls, CSS targets, presets
        │
        ├── backend/app/Styles/        PHP: sanitize values, generate CSS, settings, post meta, scope
        │     └── Frontend/StyleRenderer.php   adds classes at render time, prints CSS
        └── frontend/src/shared/       TS: same CSS generator + shared controls
              ├── admin/                Nomi Style → Global Styles / Settings screen
              └── editor/               block sidebar panel, post panel, live canvas CSS
```

- **Storage**: global settings in the `GUTEN_STYLE_config` option; post overrides in `_guten_style`
  post meta (JSON); per-post opt-out in `_guten_style_disabled`; block overrides in the block's
  `gutenStyle` attribute. Saved post markup is never modified.
- **Front end**: supported blocks inside an in-scope post's content get `gs gs-{type}`,
  `gs-p-{postId}` and `gs-b-{hash}` classes. CSS is printed in that order (global, post, block), each
  level with an equal or more specific selector, so later levels win.
- **Schema selectors**: `&` is the block root (`&[open] > summary`); anything else is a descendant
  (`thead th`). Option CSS can use `{key|fallback}` placeholders that read other values. Controls with
  `quick` (a number) appear first in the "Quick styles" tab in that order; `mediaOnly` controls can only be
  set per screen size (e.g. the table's "stack rows" layout).
- **Parity**: the PHP and TypeScript generators must produce identical CSS. Both test suites check
  `tests/fixtures/css-cases.json`. After changing the generator or the schema, run
  `php scripts/generate-css-fixtures.php`, review the diff, and run both test suites.

## Development

Requires PHP 8.2+, Node 20+, pnpm, WordPress 6.6+.

```bash
composer install
pnpm install
pnpm build        # type-check + build assets/admin.* and assets/editor.*
pnpm dev          # rebuild on change
pnpm zip          # production zip → dist/nomistyle-<version>.zip
```

`pnpm zip` builds fresh assets, copies only the runtime files (`nomistyle.php`, `backend/`, `schema/`,
`assets/`) into `build/`, runs `composer install --no-dev` there (your working `vendor/` is untouched),
zips it, and fails if anything required is missing or a dev file (`.env`, `frontend/`, `tests/`, PHPUnit)
slipped in. Use `pnpm zip --skip-build` to reuse the current `assets/`. The version comes from the plugin
header in `nomistyle.php`.

The editor bundle does not include React or `@wordpress/*`; it uses the copies WordPress already loads,
because Gutenberg needs a single React. The admin bundle ships its own React 19, antd 6, React Router and
TanStack Query, and loads only `@wordpress/i18n`, `api-fetch` and `dom-ready` from WordPress
(see `vite.config.ts`).

### Tests

```bash
composer test     # PHPUnit: sanitizer + CSS generator fixtures
pnpm test         # Vitest: TS generator against the same fixtures
```

### REST API

Namespace `nomistyle/v1`, `manage_options` required:

- `GET|POST /config`: global styles, post types, Force Style
- `GET|POST /exclusions`: list posts, or `{ id, excluded }` to exclude or include one

## License

GPL-2.0-or-later
