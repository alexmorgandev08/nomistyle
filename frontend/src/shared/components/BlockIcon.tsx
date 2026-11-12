/**
 * Line icons for the supported blocks, drawn like the block editor's icons
 * (24px grid, 1.5px stroke) so each block is easy to recognise.
 * Kept local: `@wordpress/icons` has no script handle in WordPress, and the
 * build maps every `@wordpress/*` import to a `wp.*` global.
 */
interface IconPath {
  d: string;
  /** Solid shape instead of a line. */
  solid?: boolean;
}

const ICONS: Record<string, IconPath[]> = {
  // Pilcrow (¶)
  paragraph: [{ d: "M11.25 19V5.25M15.25 19V5.25M18.25 5.25H10.5C8.43 5.25 6.75 6.93 6.75 9C6.75 11.07 8.43 12.75 10.5 12.75H11.25" }],
  pullquote: [
    { d: "M4.75 5.75H19.25M4.75 18.25H19.25" },
    { d: "M8 9.5H10.75V12.25C10.75 13.5 10 14.5 8.5 14.75M13.25 9.5H16V12.25C16 13.5 15.25 14.5 13.75 14.75" },
  ],
  code: [{ d: "M9.25 7.75L5 12L9.25 16.25M14.75 7.75L19 12L14.75 16.25" }],
  preformatted: [{ d: "M4.75 6.75H14.75M8.75 12H19.25M4.75 17.25H12.25" }],
  verse: [{ d: "M4.75 6.75C7 6.75 7 8.25 9.25 8.25M4.75 12H14.75M8.75 17.25H19.25M14.75 6.75H19.25" }],
  separator: [{ d: "M4.75 12H19.25M8 7.75H16M8 16.25H16" }],
  group: [
    { d: "M6 4.75H18C18.69 4.75 19.25 5.31 19.25 6V18C19.25 18.69 18.69 19.25 18 19.25H6C5.31 19.25 4.75 18.69 4.75 18V6C4.75 5.31 5.31 4.75 6 4.75Z" },
    { d: "M8.25 8.25H15.75V11.25H8.25ZM8.25 13.75H15.75" },
  ],
  columns: [
    { d: "M6 4.75H18C18.69 4.75 19.25 5.31 19.25 6V18C19.25 18.69 18.69 19.25 18 19.25H6C5.31 19.25 4.75 18.69 4.75 18V6C4.75 5.31 5.31 4.75 6 4.75ZM12 4.75V19.25" },
  ],
  "media-text": [
    { d: "M4.75 6.75H11.25V17.25H4.75ZM14.25 9H19.25M14.25 12H19.25M14.25 15H17.75" },
  ],
  gallery: [
    { d: "M4.75 4.75H11V11H4.75ZM13 4.75H19.25V11H13ZM4.75 13H11V19.25H4.75ZM13 13H19.25V19.25H13Z" },
  ],
  cover: [
    { d: "M6 4.75H18C18.69 4.75 19.25 5.31 19.25 6V18C19.25 18.69 18.69 19.25 18 19.25H6C5.31 19.25 4.75 18.69 4.75 18V6C4.75 5.31 5.31 4.75 6 4.75Z" },
    { d: "M8.5 12H15.5M10 15H14" },
  ],
  file: [
    { d: "M13.25 4.75H7C6.31 4.75 5.75 5.31 5.75 6V18C5.75 18.69 6.31 19.25 7 19.25H17C17.69 19.25 18.25 18.69 18.25 18V9.75L13.25 4.75ZM13.25 4.75V9.75H18.25M12 12V16.5M9.75 14.25L12 16.5L14.25 14.25" },
  ],
  button: [
    {
      d: "M8 11.75H16M5 16.25H19C19.69 16.25 20.25 15.69 20.25 15V8.5C20.25 7.81 19.69 7.25 19 7.25H5C4.31 7.25 3.75 7.81 3.75 8.5V15C3.75 15.69 4.31 16.25 5 16.25Z",
    },
  ],
  details: [
    { d: "M4 17.5H20M4 12H20M10 6.5H20" },
    { d: "M4.75 8V5L6.75 6.5L4.75 8Z", solid: true },
  ],
  heading: [{ d: "M6.75 5V19M17.25 5V19M6.75 12H17.25" }],
  image: [
    {
      d: "M19.25 14.25L16 11L12 15L8.6 12.7L4.75 15.5M18 4.75H6C5.31 4.75 4.75 5.31 4.75 6V18C4.75 18.69 5.31 19.25 6 19.25H18C18.69 19.25 19.25 18.69 19.25 18V6C19.25 5.31 18.69 4.75 18 4.75Z",
    },
  ],
  list: [
    { d: "M10 6.5H20M10 12H20M10 17.5H20" },
    {
      d: "M5.5 7.75A1.25 1.25 0 1 0 5.5 5.25A1.25 1.25 0 0 0 5.5 7.75ZM5.5 13.25A1.25 1.25 0 1 0 5.5 10.75A1.25 1.25 0 0 0 5.5 13.25ZM5.5 18.75A1.25 1.25 0 1 0 5.5 16.25A1.25 1.25 0 0 0 5.5 18.75Z",
      solid: true,
    },
  ],
  quote: [
    {
      d: "M10 11.25V6.75H4.75V11.25H10ZM10 11.25V16C10 17.5 9.5 19 6 19M19 11.25V6.75H13.75V11.25H19ZM19 11.25V16C19 17.5 18.5 19 15 19",
    },
    { d: "M10 6.75V11.25H4.75V6.75H10Z", solid: true },
    { d: "M19 6.75V11.25H13.75V6.75H19Z", solid: true },
  ],
  table: [
    {
      d: "M19.25 12V6C19.25 5.31 18.69 4.75 18 4.75H6C5.31 4.75 4.75 5.31 4.75 6V18C4.75 18.69 5.31 19.25 6 19.25H18C18.69 19.25 19.25 18.69 19.25 18V12ZM19.25 12H4.75M12 4.75V19.25",
    },
  ],
};

/** A block's icon, or nothing for a block without one. Decorative: pair it with a text label. */
export default function BlockIcon({ type }: { type: string }) {
  const paths = ICONS[type];
  if (!paths) return null;

  return (
    <svg
      aria-hidden
      fill="none"
      focusable="false"
      stroke="currentColor"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
    >
      {paths.map((path) => (
        <path
          d={path.d}
          fill={path.solid ? "currentColor" : undefined}
          key={path.d}
          stroke={path.solid ? "none" : undefined}
        />
      ))}
    </svg>
  );
}
