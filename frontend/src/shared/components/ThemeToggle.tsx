import { __ } from '@wordpress/i18n'

import { useUiTheme } from '../theme'

/** Switches the GutenStyle screens between the light and dark look. */
export default function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useUiTheme()
  const next = theme === 'dark' ? 'light' : 'dark'
  const label = next === 'light' ? __('Use light theme', 'guten-style') : __('Use dark theme', 'guten-style')

  return (
    <button
      aria-label={label}
      className={`gs-theme-toggle${className ? ` ${className}` : ''}`}
      onClick={() => setTheme(next)}
      title={label}
      type="button"
    >
      <svg aria-hidden viewBox="0 0 24 24">
        {theme === 'dark' ? (
          <>
            <circle cx="12" cy="12" fill="none" r="4" stroke="currentColor" strokeWidth="2" />
            <path
              d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="2"
            />
          </>
        ) : (
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" />
        )}
      </svg>
    </button>
  )
}
