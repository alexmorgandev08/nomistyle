import { useState } from "react";
import { __, _n, sprintf } from "@wordpress/i18n";

import BlockIcon from "../shared/components/BlockIcon";
import { type BlockGroup, blockTypes, getBlock } from "../shared/schema";
import { countValues } from "../shared/values";
import { type Config } from "./data";
import { lockedBlocks } from "./lockedBlocks";
import ProBadge from "./upgrade/ProBadge";

const GROUPS: { id: BlockGroup; label: string }[] = [
  { id: "text", label: __("Text", "guten-style") },
  { id: "media", label: __("Media", "guten-style") },
  { id: "design", label: __("Design", "guten-style") },
];

interface BlockRailProps {
  active: string;
  config: Config;
  onSelect: (type: string) => void;
  /** Post type labels GutenStyle applies to, for the footer. */
  appliesTo: string;
}

interface RailEntry {
  group: BlockGroup;
  label: string;
  /** A GutenStyle Pro block shown in the free plugin. */
  locked: boolean;
  type: string;
}

/** Blocks this build styles, then the Pro blocks it only lists (free build). */
const railEntries = (): RailEntry[] => [
  ...blockTypes.flatMap((type) => {
    const block = getBlock(type);
    return block ? [{ group: block.group, label: block.label, locked: false, type }] : [];
  }),
  ...lockedBlocks().map((block) => ({ group: block.group, label: block.label, locked: true, type: block.type })),
];

/** The admin block list: search, grouped like the block inserter, with the change count per block. */
export default function BlockRail({
  active,
  appliesTo,
  config,
  onSelect,
}: BlockRailProps) {
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();
  const entries = railEntries();
  const matches = entries.filter(
    (entry) => !query || entry.type.includes(query) || entry.label.toLowerCase().includes(query),
  );

  return (
    <nav aria-label={__("Blocks", "guten-style")} className="gs-global__rail">
      <div className="gs-rail__top">
        <div className="gs-rail__head">
          <span className="gs-rail__title">{__("Blocks", "guten-style")}</span>
          <span className="gs-rail__total">
            {sprintf(
              /* translators: %d: number of blocks */
              _n("%d block", "%d blocks", entries.length, "guten-style"),
              entries.length,
            )}
          </span>
        </div>
        <div className="gs-rail__search">
          <svg aria-hidden viewBox="0 0 24 24">
            <circle
              cx="11"
              cy="11"
              fill="none"
              r="7"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="m20 20-3.5-3.5"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="2"
            />
          </svg>
          <input
            aria-label={__("Search blocks", "guten-style")}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={__("Search blocks", "guten-style")}
            type="search"
            value={search}
          />
        </div>
      </div>

      <div className="gs-rail__groups">
        {matches.length === 0 && (
          <p className="gs-rail__empty">
            {__("No blocks match your search.", "guten-style")}
          </p>
        )}

        {GROUPS.map((group) => {
          const groupEntries = matches.filter((entry) => entry.group === group.id);
          if (groupEntries.length === 0) return null;
          return (
            <div className="gs-rail__group" key={group.id}>
              <p className="gs-rail__group-title">{group.label}</p>
              {groupEntries.map(({ label, locked, type }) => {
                const count = countValues(config.styles[type]);
                const changes =
                  count > 0
                    ? sprintf(
                        /* translators: %d: number of customized settings */
                        _n("%d change", "%d changes", count, "guten-style"),
                        count,
                      )
                    : __("Theme default", "guten-style");
                return (
                  <button
                    aria-current={type === active ? "page" : undefined}
                    className={`gs-block-item${type === active ? " is-active" : ""}`}
                    key={type}
                    onClick={() => onSelect(type)}
                    type="button"
                  >
                    <span className="gs-block-item__icon">
                      <BlockIcon type={type} />
                    </span>
                    <span className="gs-block-item__text">
                      <span className="gs-block-item__name">{label}</span>
                      <span className="gs-block-item__meta">{locked ? <ProBadge /> : changes}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      <p className="gs-global__scope">
        <span>{__("Applies to", "guten-style")}</span>
        <strong>{appliesTo}</strong>
        <a href="#/settings">{__("Change", "guten-style")}</a>
      </p>
    </nav>
  );
}
