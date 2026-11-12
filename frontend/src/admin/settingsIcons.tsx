import { type ReactNode } from 'react'

/** 24×24 line icons for the Settings tabs and rows. They follow the text color. */
const icon = (paths: ReactNode) => (
  <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" viewBox="0 0 24 24">
    {paths}
  </svg>
)

export const ScopeIcon = icon(
  <>
    <rect height="7" rx="1.5" width="7" x="3.5" y="3.5" />
    <rect height="7" rx="1.5" width="7" x="13.5" y="3.5" />
    <rect height="7" rx="1.5" width="7" x="3.5" y="13.5" />
    <rect height="7" rx="1.5" width="7" x="13.5" y="13.5" />
  </>
)

export const ExcludeIcon = icon(
  <>
    <circle cx="12" cy="12" r="8.5" />
    <path d="m6 18 12-12" />
  </>
)

export const ForceIcon = icon(<path d="M13 2.5 4.5 13.5H11l-1 8 8.5-11H12z" />)

export const DocumentsIcon = icon(
  <>
    <path d="M14 3.5H7a1.5 1.5 0 0 0-1.5 1.5v14A1.5 1.5 0 0 0 7 20.5h10a1.5 1.5 0 0 0 1.5-1.5V8z" />
    <path d="M14 3.5V8h4.5M9 13h6M9 16.5h4" />
  </>
)

export const SearchIcon = icon(
  <>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.4-4.4" />
  </>
)

export const InfoIcon = icon(
  <>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11v5M12 8h.01" />
  </>
)

export const ListIcon = icon(<path d="M9 6.5h11M9 12h11M9 17.5h11M4.5 6.5h.01M4.5 12h.01M4.5 17.5h.01" />)

export const FilterIcon = icon(<path d="M4 5.5h16l-6.2 7.3v5.4l-3.6 1.8v-7.2z" />)

export const BlocksIcon = icon(
  <>
    <rect height="6.5" rx="1.5" width="16" x="4" y="4" />
    <rect height="6.5" rx="1.5" width="7" x="4" y="13.5" />
    <rect height="6.5" rx="1.5" width="7" x="13" y="13.5" />
  </>
)

export const PuzzleIcon = icon(
  <path d="M9.5 4.5h3a1.5 1.5 0 0 1 3 0h3v4a1.5 1.5 0 0 1 0 3v4h-4a1.5 1.5 0 0 0-3 0h-3v-3a1.5 1.5 0 0 1 0-3v-5z" />
)

export const SparkIcon = icon(
  <path d="M12 3.5 13.6 9a2 2 0 0 0 1.4 1.4l5.5 1.6-5.5 1.6a2 2 0 0 0-1.4 1.4L12 20.5 10.4 15A2 2 0 0 0 9 13.6L3.5 12 9 10.4A2 2 0 0 0 10.4 9z" />
)

export const PlugIcon = icon(<path d="M9 3.5v4M15 3.5v4M6.5 7.5h11v3.5a5.5 5.5 0 0 1-11 0zM12 16.5v4" />)

export const TransferIcon = icon(<path d="M7 4.5v15M7 4.5 4 7.5M7 4.5l3 3M17 19.5v-15M17 19.5l-3-3M17 19.5l3-3" />)

export const KeyIcon = icon(
  <>
    <circle cx="8" cy="15" r="4" />
    <path d="m10.8 12.2 8.7-8.7M16.5 6.5l2.5 2.5M14 9l2 2" />
  </>
)

export const DevicesIcon = icon(
  <>
    <rect height="12" rx="1.5" width="14" x="2.5" y="4.5" />
    <path d="M6.5 19.5h6" />
    <rect height="11" rx="1.5" width="6" x="15.5" y="9" />
  </>
)

export const ScreenIcon = icon(
  <>
    <rect height="12" rx="1.5" width="18" x="3" y="4" />
    <path d="M8 20h8M12 16v4" />
  </>
)

export const LayersIcon = icon(<path d="m12 3.5 8.5 4.5-8.5 4.5L3.5 8zM3.5 12l8.5 4.5 8.5-4.5M3.5 16l8.5 4.5 8.5-4.5" />)

export const BlockIcon = icon(<rect height="15" rx="2" width="15" x="4.5" y="4.5" />)

export const UsersIcon = icon(
  <>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 19.5a6.5 6.5 0 0 1 13 0M16 4.8a3.5 3.5 0 0 1 0 6.4M18 13.6a6.5 6.5 0 0 1 3.5 5.9" />
  </>
)

export const PaletteIcon = icon(
  <>
    <path d="M12 3.5a8.5 8.5 0 0 0 0 17c1.4 0 2-1 1.4-2.2-.7-1.4.2-2.8 1.8-2.8h1.6a3.7 3.7 0 0 0 3.7-3.7c0-4.6-3.8-8.3-8.5-8.3z" />
    <circle cx="7.5" cy="11" r="1" />
    <circle cx="10.5" cy="7.5" r="1" />
    <circle cx="15" cy="8" r="1" />
  </>
)

export const ThemeIcon = icon(<path d="M4 20.5h16M6.5 17V8.5L12 4l5.5 4.5V17M10 17v-4.5h4V17" />)

export const CodeIcon = icon(<path d="m8.5 7-5 5 5 5M15.5 7l5 5-5 5M13.5 4.5l-3 15" />)

export const UsedBlocksIcon = icon(
  <>
    <rect height="15" rx="2" width="15" x="4.5" y="4.5" />
    <path d="m8.5 12 2.5 2.5 4.5-5" />
  </>
)

export const SelectorIcon = icon(<path d="M5 4.5H4.5v15H5M19 4.5h.5v15H19M9 9.5h6M9 14.5h4" />)

export const RefreshIcon = icon(<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3L19.5 9M19.5 4v5h-5" />)

export const ResetIcon = icon(<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3L4.5 9M4.5 4v5h5" />)

export const TrashIcon = icon(<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 12.5h9l1-12.5M10.5 11v5M13.5 11v5" />)

export const HistoryIcon = icon(
  <>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </>
)

export const AdvancedIcon = icon(
  <>
    <path d="M4.5 7h9M17.5 7h2M4.5 17h2M10.5 17h9" />
    <circle cx="15.5" cy="7" r="2" />
    <circle cx="8.5" cy="17" r="2" />
  </>
)


export const OverridesIcon = icon(
  <>
    <rect height="11" rx="1.5" width="11" x="3.5" y="3.5" />
    <rect height="11" rx="1.5" width="11" x="9.5" y="9.5" />
  </>
)

export const HealthIcon = icon(<path d="M3.5 12h4l2-5 4 10 2-5h5" />)

export const AccessibilityIcon = icon(
  <>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="7.75" r="1" />
    <path d="M7.5 10.5 12 11.5l4.5-1M12 11.5V14l-2 3.5M12 14l2 3.5" />
  </>
)
