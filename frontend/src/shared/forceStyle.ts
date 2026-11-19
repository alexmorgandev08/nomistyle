/**
 * Whether a block type's CSS is marked !important (Settings › Force Style). Same rule as
 * StyleCss::isForced() in PHP: one switch for every block type. Block Style Pro replaces this module.
 */
export const isForced = (_type: string, forceStyle: boolean, _pro: Record<string, unknown> | undefined): boolean => forceStyle
