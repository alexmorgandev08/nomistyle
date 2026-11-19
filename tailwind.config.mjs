/**
 * Tailwind 3.4 for the admin app (frontend/src/admin/tailwind.css). The editor bundle does not use it.
 * - preflight off: wp-admin and antd keep their own base styles.
 * - important scoped to the Block Style admin page body class (added in Views/Layout.php), so
 *   utilities beat wp-admin CSS without leaking to other screens.
 * - dark: the Block Style UI is dark unless `.gs-ui` also has `.is-light` (see shared/theme.ts).
 *
 * @type {import('tailwindcss').Config}
 */
export default {
  // Only the admin app uses utilities; shared code holds CSS words (block, fixed…) that must not match.
  content: ['./frontend/src/admin/**/*.tsx'],
  // JS words in the source (array.filter, resize events, `if (!block)`) that are also utility names.
  blocklist: ['!block', 'filter', 'resize'],
  corePlugins: {
    preflight: false
  },
  darkMode: ['variant', '&:is(.gs-ui:not(.is-light) *)'],
  important: 'body.blockstyle-page',
  plugins: [],
  theme: {
    borderRadius: {
      DEFAULT: '0.5625rem',
      full: '999px',
      lg: '0.8125rem',
      md: '0.6875rem',
      none: '0',
      sm: '0.375rem'
    },
    extend: {}
  }
}
