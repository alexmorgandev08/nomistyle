import { __ } from '@wordpress/i18n'

import { SHOW_PRO_FEATURES } from '../upgrade/showProFeatures'
import { type LockedBlock } from './types'

/**
 * Block Style Pro blocks, listed in the free plugin's Global Styles with a PRO tag. Opening one shows
 * what Pro styles and an upgrade link. Add a block here when Pro adds it.
 * A function, not a module-level array: top-level __() calls would keep this file in the Pro build.
 */
export const lockedBlocks = (): LockedBlock[] => !SHOW_PRO_FEATURES ? [] : [
  {
    description: __('Body text, links and drop caps for every paragraph.', 'blockstyle'),
    features: [
      __('Text color, size, line height and weight.', 'blockstyle'),
      __('Link color, hover color and underline.', 'blockstyle'),
      __('Drop cap color, size and weight.', 'blockstyle'),
      __('9 presets, for example Readable, Editorial and Bold drop cap.', 'blockstyle')
    ],
    group: 'text',
    label: __('Paragraph', 'blockstyle'),
    tag: 'p',
    type: 'paragraph'
  },
  {
    description: __('Large quotes with borders, background and citation.', 'blockstyle'),
    features: [
      __('Text size, style, weight and alignment.', 'blockstyle'),
      __('Background, padding, corners and borders.', 'blockstyle'),
      __('Citation color, size and case.', 'blockstyle'),
      __('9 presets, for example Classic, Boxed and Elegant.', 'blockstyle')
    ],
    group: 'text',
    label: __('Pullquote', 'blockstyle'),
    tag: 'figure',
    type: 'pullquote'
  },
  {
    description: __('Code boxes: colors, font, padding and long lines.', 'blockstyle'),
    features: [
      __('Background, text color, font and size.', 'blockstyle'),
      __('Padding, corners and border.', 'blockstyle'),
      __('Wrap or scroll long lines, maximum height and tab size.', 'blockstyle'),
      __('9 presets, for example Dark, Terminal and Scroll box.', 'blockstyle')
    ],
    group: 'text',
    label: __('Code', 'blockstyle'),
    tag: 'pre',
    type: 'code'
  },
  {
    description: __('Preformatted text: colors, font, padding and long lines.', 'blockstyle'),
    features: [
      __('Background, text color, font and size.', 'blockstyle'),
      __('Padding, corners and border.', 'blockstyle'),
      __('Wrap or scroll long lines, maximum height and tab size.', 'blockstyle'),
      __('9 presets, for example Paper, Soft and Typewriter.', 'blockstyle')
    ],
    group: 'text',
    label: __('Preformatted', 'blockstyle'),
    tag: 'pre',
    type: 'preformatted'
  },
  {
    description: __('Poems and lyrics: font, line spacing, box and border.', 'blockstyle'),
    features: [
      __('Body, serif or typewriter font.', 'blockstyle'),
      __('Text size, style, line height and alignment.', 'blockstyle'),
      __('Background, padding, corners and border.', 'blockstyle'),
      __('9 presets, for example Poem, Paper and Dark.', 'blockstyle')
    ],
    group: 'text',
    label: __('Verse', 'blockstyle'),
    tag: 'pre',
    type: 'verse'
  },
  {
    description: __('Lines between sections: color, thickness, style, width and spacing.', 'blockstyle'),
    features: [
      __('Solid, dashed, dotted or double lines.', 'blockstyle'),
      __('Width, alignment, opacity and space around the line.', 'blockstyle'),
      __('Size and spacing of the dots style.', 'blockstyle'),
      __('9 presets, for example Subtle, Accent and Big dots.', 'blockstyle')
    ],
    group: 'design',
    label: __('Separator', 'blockstyle'),
    tag: 'hr',
    type: 'separator'
  },
  {
    description: __('Boxes around groups of blocks: background, padding, border and shadow.', 'blockstyle'),
    features: [
      __('Background, text color, padding and corners.', 'blockstyle'),
      __('Border, shadow and a shadow on hover.', 'blockstyle'),
      __('Space between the blocks in the group.', 'blockstyle'),
      __('9 presets, for example Card, Elevated and Spacious.', 'blockstyle')
    ],
    group: 'design',
    label: __('Group', 'blockstyle'),
    tag: 'div',
    type: 'group'
  },
  {
    description: __('Column layouts: space between, column boxes and dividers.', 'blockstyle'),
    features: [
      __('Space between columns and rows, and vertical alignment.', 'blockstyle'),
      __('Background, padding, border and shadow for each column.', 'blockstyle'),
      __('Lines between columns.', 'blockstyle'),
      __('9 presets, for example Cards, Panel and Divided.', 'blockstyle')
    ],
    group: 'design',
    label: __('Columns', 'blockstyle'),
    tag: 'div',
    type: 'columns'
  },
  {
    description: __('Media next to text: box, content padding and media corners.', 'blockstyle'),
    features: [
      __('Background, text color, corners, border and shadow.', 'blockstyle'),
      __('Content padding and vertical alignment.', 'blockstyle'),
      __('Media corners and shadow.', 'blockstyle'),
      __('9 presets, for example Card, Elevated and Floating media.', 'blockstyle')
    ],
    group: 'media',
    label: __('Media & Text', 'blockstyle'),
    tag: 'div',
    type: 'media-text'
  },
  {
    description: __('Image grids: space between images, corners, borders, hover effects and captions.', 'blockstyle'),
    features: [
      __('Space between images.', 'blockstyle'),
      __('Image corners, border and shadow.', 'blockstyle'),
      __('Zoom or lift on hover, black and white or sepia.', 'blockstyle'),
      __('9 presets, for example Rounded, Zoom on hover and Captioned.', 'blockstyle')
    ],
    group: 'media',
    label: __('Gallery', 'blockstyle'),
    tag: 'figure',
    type: 'gallery'
  },
  {
    description: __('Large sections with a background picture: height, corners, padding and picture effects.', 'blockstyle'),
    features: [
      __('Minimum height, padding, corners, border and shadow.', 'blockstyle'),
      __('Text color and content width.', 'blockstyle'),
      __('Black and white, blur or zoom on hover for the picture.', 'blockstyle'),
      __('9 presets, for example Tall, Card and Soft blur.', 'blockstyle')
    ],
    group: 'media',
    label: __('Cover', 'blockstyle'),
    tag: 'div',
    type: 'cover'
  },
  {
    description: __('Download links: box, link and download button.', 'blockstyle'),
    features: [
      __('Button next to the name, or name left and button right.', 'blockstyle'),
      __('Box background, padding, corners and border.', 'blockstyle'),
      __('Button colors, hover color, corners, size and border.', 'blockstyle'),
      __('9 presets, for example Pill button, Card and Outline button.', 'blockstyle')
    ],
    group: 'media',
    label: __('File', 'blockstyle'),
    tag: 'div',
    type: 'file'
  }
]
