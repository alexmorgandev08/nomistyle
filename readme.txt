=== GutenStyle ===
Contributors: alexmorgandev
Tags: block styles, gutenberg, table, accordion, design
Requires at least: 6.6
Tested up to: 7.1
Requires PHP: 8.2
Stable tag: 0.0.1
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Style tables, headings, lists, quotes, accordions, buttons and images across your whole site, per post or per block. No CSS needed.

== Description ==

GutenStyle gives core blocks a consistent design without writing CSS. Set a style once and every matching block on your site follows it, including the posts you already published.

Gutenberg handles your content. GutenStyle handles how it looks.

= Restyle existing content without editing it =

GutenStyle never changes your saved posts. It adds its styles when a page is shown. Change a table style once, and thousands of existing tables update with it.

= Supported blocks =

* Table: header, cells, borders, row stripes, hover color, and stacked rows on small screens.
* Heading: size, weight, color and spacing for H2, H3 and H4.
* List: markers, spacing, nested lists and boxed lists.
* Quote: boxes, borders, quote icon and citation.
* Details / Accordion: header, icon, open state and content.
* Button: colors, shape, text and hover style.
* Image: frames, corners, shadows and captions.

= Three levels of control =

1. Global: one style for every block of a type, in GutenStyle → Global Styles.
2. Post: change the style for one post, in the editor's post sidebar.
3. Block: change one block, in the block sidebar.

A later level always wins, so a single post or block can look different when it needs to.

= Features =

* 34 ready-made presets to start from. Apply one, then adjust it.
* Live preview that shows sample blocks in your active theme.
* Separate values for desktop, tablet and mobile, using WordPress core's breakpoints.
* Hover styles for colors and shadows.
* Readability check that warns about low color contrast.
* Choose which post types GutenStyle applies to, and exclude single posts.
* Force Style: gives GutenStyle priority when your theme overrides it.
* Light and dark admin theme.

= Privacy =

GutenStyle does not collect data, does not track you and does not connect to external services. Your settings stay in your WordPress database.

== Installation ==

1. In your WordPress admin, go to Plugins → Add New Plugin and search for "GutenStyle".
2. Click Install Now, then Activate.
3. Go to GutenStyle → Settings and select the post types to style.
4. Go to GutenStyle → Global Styles, pick a block and choose a preset or set your own values.
5. Click Save changes.

To install manually, upload the `guten-style` folder to `/wp-content/plugins/` and activate the plugin on the Plugins screen.

== Frequently Asked Questions ==

= Does GutenStyle change my existing posts? =

No. Your content stays exactly as written. GutenStyle only adds styles to the supported blocks, in the post types you choose.

= What happens if I deactivate the plugin? =

Your blocks show your theme's default design again. Your content does not change, because GutenStyle never edits it.

= Does it work with my theme? =

GutenStyle works with block themes, classic themes and hybrid themes. If your theme's CSS wins over a GutenStyle setting, turn on Force Style in GutenStyle → Settings.

= Can one post look different from the rest? =

Yes. Open the post in the editor and change its style in the GutenStyle panel of the post sidebar. You can also style a single block from the block sidebar.

= Can I turn GutenStyle off for one post? =

Yes. Turn it off in the post sidebar in the editor, or add the post under GutenStyle → Settings → Excluded content.

= Does GutenStyle replace Global Styles in the Site Editor? =

No. It works next to them. GutenStyle adds styling options for content blocks, per post and per block styles, and support for classic and hybrid themes.

= Where is the source code? =

The readable source of the JavaScript and CSS is in the `frontend/src` folder of the plugin, next to the built files in `assets`. Build it with `pnpm install` and `pnpm build`.

== Changelog ==

= 0.0.1 =
* First release.
* Styles for the Table, Heading, List, Quote, Details / Accordion, Button and Image blocks.
* Global, post and block style levels.
* 34 presets, live preview, responsive values, hover styles and a readability check.
* Post type selection, post exclusions and Force Style.

== Upgrade Notice ==

= 0.0.1 =
First release.

== Credits ==

* The admin screens use the Archivo typeface by Omnibus-Type, licensed under the SIL Open Font License 1.1. The license is included in `assets/fonts/OFL.txt`.
