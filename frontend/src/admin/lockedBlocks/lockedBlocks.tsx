import { __ } from '@wordpress/i18n'

import { SHOW_PRO_FEATURES } from '../upgrade/showProFeatures'
import { type LockedBlock } from './types'

/**
 * Nomi Style Pro blocks, listed in the free plugin's Global Styles with a PRO tag. Opening one shows
 * what Pro styles and an upgrade link. Add a block here when Pro adds it.
 * A function, not a module-level array: top-level __() calls would keep this file in the Pro build.
 */
export const lockedBlocks = (): LockedBlock[] => !SHOW_PRO_FEATURES ? [] : [
  {
    description: __('Body text, links and drop caps for every paragraph.', 'nomistyle'),
    features: [
      __('Text color, size, line height and weight.', 'nomistyle'),
      __('Link color, hover color and underline.', 'nomistyle'),
      __('Drop cap color, size and weight.', 'nomistyle'),
      __('9 presets, for example Readable, Editorial and Bold drop cap.', 'nomistyle')
    ],
    group: 'text',
    label: __('Paragraph', 'nomistyle'),
    tag: 'p',
    type: 'paragraph'
  },
  {
    description: __('Large quotes with borders, background and citation.', 'nomistyle'),
    features: [
      __('Text size, style, weight and alignment.', 'nomistyle'),
      __('Background, padding, corners and borders.', 'nomistyle'),
      __('Citation color, size and case.', 'nomistyle'),
      __('9 presets, for example Classic, Boxed and Elegant.', 'nomistyle')
    ],
    group: 'text',
    label: __('Pullquote', 'nomistyle'),
    tag: 'figure',
    type: 'pullquote'
  },
  {
    description: __('Code boxes: colors, font, padding and long lines.', 'nomistyle'),
    features: [
      __('Background, text color, font and size.', 'nomistyle'),
      __('Padding, corners and border.', 'nomistyle'),
      __('Wrap or scroll long lines, maximum height and tab size.', 'nomistyle'),
      __('9 presets, for example Dark, Terminal and Scroll box.', 'nomistyle')
    ],
    group: 'text',
    label: __('Code', 'nomistyle'),
    tag: 'pre',
    type: 'code'
  },
  {
    description: __('Preformatted text: colors, font, padding and long lines.', 'nomistyle'),
    features: [
      __('Background, text color, font and size.', 'nomistyle'),
      __('Padding, corners and border.', 'nomistyle'),
      __('Wrap or scroll long lines, maximum height and tab size.', 'nomistyle'),
      __('9 presets, for example Paper, Soft and Typewriter.', 'nomistyle')
    ],
    group: 'text',
    label: __('Preformatted', 'nomistyle'),
    tag: 'pre',
    type: 'preformatted'
  },
  {
    description: __('Poems and lyrics: font, line spacing, box and border.', 'nomistyle'),
    features: [
      __('Body, serif or typewriter font.', 'nomistyle'),
      __('Text size, style, line height and alignment.', 'nomistyle'),
      __('Background, padding, corners and border.', 'nomistyle'),
      __('9 presets, for example Poem, Paper and Dark.', 'nomistyle')
    ],
    group: 'text',
    label: __('Verse', 'nomistyle'),
    tag: 'pre',
    type: 'verse'
  },
  {
    description: __('Lines between sections: color, thickness, style, width and spacing.', 'nomistyle'),
    features: [
      __('Solid, dashed, dotted or double lines.', 'nomistyle'),
      __('Width, alignment, opacity and space around the line.', 'nomistyle'),
      __('Size and spacing of the dots style.', 'nomistyle'),
      __('9 presets, for example Subtle, Accent and Big dots.', 'nomistyle')
    ],
    group: 'design',
    label: __('Separator', 'nomistyle'),
    tag: 'hr',
    type: 'separator'
  },
  {
    description: __('Boxes around groups of blocks: background, padding, border and shadow.', 'nomistyle'),
    features: [
      __('Background, text color, padding and corners.', 'nomistyle'),
      __('Border, shadow and a shadow on hover.', 'nomistyle'),
      __('Space between the blocks in the group.', 'nomistyle'),
      __('9 presets, for example Card, Elevated and Spacious.', 'nomistyle')
    ],
    group: 'design',
    label: __('Group', 'nomistyle'),
    tag: 'div',
    type: 'group'
  },
  {
    description: __('Column layouts: space between, column boxes and dividers.', 'nomistyle'),
    features: [
      __('Space between columns and rows, and vertical alignment.', 'nomistyle'),
      __('Background, padding, border and shadow for each column.', 'nomistyle'),
      __('Lines between columns.', 'nomistyle'),
      __('9 presets, for example Cards, Panel and Divided.', 'nomistyle')
    ],
    group: 'design',
    label: __('Columns', 'nomistyle'),
    tag: 'div',
    type: 'columns'
  },
  {
    description: __('Media next to text: box, content padding and media corners.', 'nomistyle'),
    features: [
      __('Background, text color, corners, border and shadow.', 'nomistyle'),
      __('Content padding and vertical alignment.', 'nomistyle'),
      __('Media corners and shadow.', 'nomistyle'),
      __('9 presets, for example Card, Elevated and Floating media.', 'nomistyle')
    ],
    group: 'media',
    label: __('Media & Text', 'nomistyle'),
    tag: 'div',
    type: 'media-text'
  },
  {
    description: __('Image grids: space between images, corners, borders, hover effects and captions.', 'nomistyle'),
    features: [
      __('Space between images.', 'nomistyle'),
      __('Image corners, border and shadow.', 'nomistyle'),
      __('Zoom or lift on hover, black and white or sepia.', 'nomistyle'),
      __('9 presets, for example Rounded, Zoom on hover and Captioned.', 'nomistyle')
    ],
    group: 'media',
    label: __('Gallery', 'nomistyle'),
    tag: 'figure',
    type: 'gallery'
  },
  {
    description: __('Large sections with a background picture: height, corners, padding and picture effects.', 'nomistyle'),
    features: [
      __('Minimum height, padding, corners, border and shadow.', 'nomistyle'),
      __('Text color and content width.', 'nomistyle'),
      __('Black and white, blur or zoom on hover for the picture.', 'nomistyle'),
      __('9 presets, for example Tall, Card and Soft blur.', 'nomistyle')
    ],
    group: 'media',
    label: __('Cover', 'nomistyle'),
    tag: 'div',
    type: 'cover'
  },
  {
    description: __('Download links: box, link and download button.', 'nomistyle'),
    features: [
      __('Button next to the name, or name left and button right.', 'nomistyle'),
      __('Box background, padding, corners and border.', 'nomistyle'),
      __('Button colors, hover color, corners, size and border.', 'nomistyle'),
      __('9 presets, for example Pill button, Card and Outline button.', 'nomistyle')
    ],
    group: 'media',
    label: __('File', 'nomistyle'),
    tag: 'div',
    type: 'file'
  }
]
