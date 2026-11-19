=== Block Style ===
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

Block Style gives core blocks a consistent design without writing CSS. Set a style once and every matching block on your site follows it, including the posts you already published.

Gutenberg handles your content. Block Style handles how it looks.

= Restyle existing content without editing it =

Block Style never changes your saved posts. It adds its styles when a page is shown. Change a table style once, and thousands of existing tables update with it.

= Supported blocks =

* Table: header, cells, borders, row stripes, hover color, and stacked rows on small screens.
* Heading: size, weight, color and spacing for H2, H3 and H4.
* List: markers, spacing, nested lists and boxed lists.
* Quote: boxes, borders, quote icon and citation.
* Details / Accordion: header, icon, open state and content.
* Button: colors, shape, text and hover style.
* Image: frames, corners, shadows and captions.

= Three levels of control =

1. Global: one style for every block of a type, in Block Style → Global Styles.
2. Post: change the style for one post, in the editor's post sidebar.
3. Block: change one block, in the block sidebar.

A later level always wins, so a single post or block can look different when it needs to.

= Features =

* 63 ready-made presets, 9 for each block. Apply one, then adjust it.
* Live preview that shows sample blocks in your active theme.
* Tablet and mobile font sizes for headings, and a stacked table layout on small screens.
* Uses the breakpoints of your theme and WordPress, or your own breakpoints from Settings → Responsive.
* Hover styles for colors and shadows.
* Readability check that warns about low color contrast. Click Fix to correct the problem.
* Choose which post types Block Style applies to, and exclude single posts.
* Force Style: gives Block Style priority when your theme overrides it.
* Light and dark admin theme.

= Block editor =

* Use the ⋯ menu in the Block Style panel to copy, paste or reset a style, or to edit the global style.
* Show style source: see if a value comes from the global, post or block style.
* Turn post styles and block styles on or off, and choose the roles that can edit styles.
* Show the theme.json colors of your theme in the color pickers.

= Tools =

* Overrides: see every post that has its own post style or block styles. Open the post, or remove its overrides. Block Style saves a revision of the post first.

= Advanced settings =

* CSS output: load the global styles from a cached file or as inline CSS.
* Load CSS only for the blocks used on the page.
* Content area selector: limit the styles to the content area of your theme.
* Regenerate CSS, reset everything, and delete all data when you uninstall the plugin.

= Privacy =

Block Style does not collect data, does not track you and does not connect to external services. Your settings stay in your WordPress database.

== Installation ==

1. In your WordPress admin, go to Plugins → Add New Plugin and search for "Block Style".
2. Click Install Now, then Activate.
3. Go to Block Style → Settings and select the post types to style.
4. Go to Block Style → Global Styles, pick a block and choose a preset or set your own values.
5. Click Save changes.

To install manually, upload the `blockstyle` folder to `/wp-content/plugins/` and activate the plugin on the Plugins screen.

== Frequently Asked Questions ==

= Does Block Style change my existing posts? =

No. Your content stays exactly as written. Block Style only adds styles to the supported blocks, in the post types you choose.

= What happens if I deactivate the plugin? =

Your blocks show your theme's default design again. Your content does not change, because Block Style never edits it.

= Does it work with my theme? =

Block Style works with block themes, classic themes and hybrid themes. If your theme's CSS wins over a Block Style setting, turn on Force Style in Block Style → Settings.

= Can one post look different from the rest? =

Yes. Open the post in the editor and change its style in the Block Style panel of the post sidebar. You can also style a single block from the block sidebar.

= Can I turn Block Style off for one post? =

Yes. Turn it off in the post sidebar in the editor, or add the post under Block Style → Settings → Excluded content.

= Does Block Style replace Global Styles in the Site Editor? =

No. It works next to them. Block Style adds styling options for content blocks, per post and per block styles, and support for classic and hybrid themes.

= Where is the source code? =

The readable source of the JavaScript and CSS is in the `frontend/src` folder of the plugin, next to the built files in `assets`. Build it with `pnpm install` and `pnpm build`.

The full source code and build tools are also public on GitHub: [github.com/alexmorgandev08/blockstyle](https://github.com/alexmorgandev08/blockstyle).

== Changelog ==

= 0.0.1 =
* First release.
* Styles for the Table, Heading, List, Quote, Details / Accordion, Button and Image blocks.
* Global, post and block style levels.
* 63 presets, live preview, tablet and mobile heading sizes, hover styles and a readability check with Fix.
* Post type selection, post exclusions and Force Style.
* Overrides tool, editor ⋯ menu, CSS output options and custom breakpoints.

== Upgrade Notice ==

= 0.0.1 =
First release.

== Credits ==

* The admin screens use the Archivo typeface by Omnibus-Type, licensed under the SIL Open Font License 1.1. The license is included in `assets/fonts/OFL.txt`.
