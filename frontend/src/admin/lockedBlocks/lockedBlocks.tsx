import { __ } from '@wordpress/i18n'

import { SHOW_PRO_FEATURES } from '../upgrade/showProFeatures'
import { type LockedBlock } from './types'

/**
 * GutenStyle Pro blocks, listed in the free plugin's Global Styles with a PRO tag. Opening one shows
 * what Pro styles and an upgrade link. Add a block here when Pro adds it.
 * A function, not a module-level array: top-level __() calls would keep this file in the Pro build.
 */
export const lockedBlocks = (): LockedBlock[] => !SHOW_PRO_FEATURES ? [] : [
  {
    description: __('Body text, links and drop caps for every paragraph.', 'guten-style'),
    features: [
      __('Text color, size, line height and weight.', 'guten-style'),
      __('Link color, hover color and underline.', 'guten-style'),
      __('Drop cap color, size and weight.', 'guten-style'),
      __('9 presets, for example Readable, Editorial and Bold drop cap.', 'guten-style')
    ],
    group: 'text',
    label: __('Paragraph', 'guten-style'),
    tag: 'p',
    type: 'paragraph'
  },
  {
    description: __('Large quotes with borders, background and citation.', 'guten-style'),
    features: [
      __('Text size, style, weight and alignment.', 'guten-style'),
      __('Background, padding, corners and borders.', 'guten-style'),
      __('Citation color, size and case.', 'guten-style'),
      __('9 presets, for example Classic, Boxed and Elegant.', 'guten-style')
    ],
    group: 'text',
    label: __('Pullquote', 'guten-style'),
    tag: 'figure',
    type: 'pullquote'
  },
  {
    description: __('Code boxes: colors, font, padding and long lines.', 'guten-style'),
    features: [
      __('Background, text color, font and size.', 'guten-style'),
      __('Padding, corners and border.', 'guten-style'),
      __('Wrap or scroll long lines, maximum height and tab size.', 'guten-style'),
      __('9 presets, for example Dark, Terminal and Scroll box.', 'guten-style')
    ],
    group: 'text',
    label: __('Code', 'guten-style'),
    tag: 'pre',
    type: 'code'
  },
  {
    description: __('Preformatted text: colors, font, padding and long lines.', 'guten-style'),
    features: [
      __('Background, text color, font and size.', 'guten-style'),
      __('Padding, corners and border.', 'guten-style'),
      __('Wrap or scroll long lines, maximum height and tab size.', 'guten-style'),
      __('9 presets, for example Paper, Soft and Typewriter.', 'guten-style')
    ],
    group: 'text',
    label: __('Preformatted', 'guten-style'),
    tag: 'pre',
    type: 'preformatted'
  },
  {
    description: __('Poems and lyrics: font, line spacing, box and border.', 'guten-style'),
    features: [
      __('Body, serif or typewriter font.', 'guten-style'),
      __('Text size, style, line height and alignment.', 'guten-style'),
      __('Background, padding, corners and border.', 'guten-style'),
      __('9 presets, for example Poem, Paper and Dark.', 'guten-style')
    ],
    group: 'text',
    label: __('Verse', 'guten-style'),
    tag: 'pre',
    type: 'verse'
  },
  {
    description: __('Lines between sections: color, thickness, style, width and spacing.', 'guten-style'),
    features: [
      __('Solid, dashed, dotted or double lines.', 'guten-style'),
      __('Width, alignment, opacity and space around the line.', 'guten-style'),
      __('Size and spacing of the dots style.', 'guten-style'),
      __('9 presets, for example Subtle, Accent and Big dots.', 'guten-style')
    ],
    group: 'design',
    label: __('Separator', 'guten-style'),
    tag: 'hr',
    type: 'separator'
  },
  {
    description: __('Boxes around groups of blocks: background, padding, border and shadow.', 'guten-style'),
    features: [
      __('Background, text color, padding and corners.', 'guten-style'),
      __('Border, shadow and a shadow on hover.', 'guten-style'),
      __('Space between the blocks in the group.', 'guten-style'),
      __('9 presets, for example Card, Elevated and Spacious.', 'guten-style')
    ],
    group: 'design',
    label: __('Group', 'guten-style'),
    tag: 'div',
    type: 'group'
  },
  {
    description: __('Column layouts: space between, column boxes and dividers.', 'guten-style'),
    features: [
      __('Space between columns and rows, and vertical alignment.', 'guten-style'),
      __('Background, padding, border and shadow for each column.', 'guten-style'),
      __('Lines between columns.', 'guten-style'),
      __('9 presets, for example Cards, Panel and Divided.', 'guten-style')
    ],
    group: 'design',
    label: __('Columns', 'guten-style'),
    tag: 'div',
    type: 'columns'
  },
  {
    description: __('Media next to text: box, content padding and media corners.', 'guten-style'),
    features: [
      __('Background, text color, corners, border and shadow.', 'guten-style'),
      __('Content padding and vertical alignment.', 'guten-style'),
      __('Media corners and shadow.', 'guten-style'),
      __('9 presets, for example Card, Elevated and Floating media.', 'guten-style')
    ],
    group: 'media',
    label: __('Media & Text', 'guten-style'),
    tag: 'div',
    type: 'media-text'
  },
  {
    description: __('Image grids: space between images, corners, borders, hover effects and captions.', 'guten-style'),
    features: [
      __('Space between images.', 'guten-style'),
      __('Image corners, border and shadow.', 'guten-style'),
      __('Zoom or lift on hover, black and white or sepia.', 'guten-style'),
      __('9 presets, for example Rounded, Zoom on hover and Captioned.', 'guten-style')
    ],
    group: 'media',
    label: __('Gallery', 'guten-style'),
    tag: 'figure',
    type: 'gallery'
  },
  {
    description: __('Large sections with a background picture: height, corners, padding and picture effects.', 'guten-style'),
    features: [
      __('Minimum height, padding, corners, border and shadow.', 'guten-style'),
      __('Text color and content width.', 'guten-style'),
      __('Black and white, blur or zoom on hover for the picture.', 'guten-style'),
      __('9 presets, for example Tall, Card and Soft blur.', 'guten-style')
    ],
    group: 'media',
    label: __('Cover', 'guten-style'),
    tag: 'div',
    type: 'cover'
  },
  {
    description: __('Download links: box, link and download button.', 'guten-style'),
    features: [
      __('Button next to the name, or name left and button right.', 'guten-style'),
      __('Box background, padding, corners and border.', 'guten-style'),
      __('Button colors, hover color, corners, size and border.', 'guten-style'),
      __('9 presets, for example Pill button, Card and Outline button.', 'guten-style')
    ],
    group: 'media',
    label: __('File', 'guten-style'),
    tag: 'div',
    type: 'file'
  }
]
