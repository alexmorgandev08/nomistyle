import { __ } from "@wordpress/i18n";
import { Button } from "antd";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";

import ReadabilityCheck from "../shared/components/ReadabilityCheck";
import SegmentedControl from "../shared/components/SegmentedControl";
import StylePanel from "../shared/components/StylePanel";
import { generateCss } from "../shared/css";
import {
  blockTypes,
  type Device,
  getBlock,
  type StyleValues,
} from "../shared/schema";
import { deviceKeys } from "../shared/deviceKeys";
import { filterDeviceValues } from "../shared/deviceValues";
import { isForced } from "../shared/forceStyle";
import { mediaQueriesFor, visiblePalette } from "../shared/settings";
import { countValues, type StyleState, withStyles } from "../shared/values";
import BlockRail from "./BlockRail";
import { adminData, type Config } from "./data";
import { findLockedBlock } from "./lockedBlocks";
import LockedBlockView from "./lockedBlocks/LockedBlockView";
import PresetsSection from "./PresetsSection";
import Preview from "./Preview";

interface GlobalStylesProps {
  config: Config;
  onChange: (config: Config) => void;
}

/** Global Styles screen: block list | live preview | inspector, like the block editor. */
export default function GlobalStyles({ config, onChange }: GlobalStylesProps) {
  // The selected block is in the URL (#/styles/table), so the editor's "Edit global style" can open it.
  const { type } = useParams();
  const navigate = useNavigate();
  const locked = findLockedBlock(type);
  const active = locked ? locked.type : type && blockTypes.includes(type) ? type : blockTypes[0];
  const setActive = (next: string) => navigate(`/styles/${next}`, { replace: true });
  const [device, setDevice] = useState<Device>("desktop");
  const [state, setState] = useState<StyleState>("default");

  const block = getBlock(active);
  const values = config.styles[active] ?? {};
  const update = (next: StyleValues) =>
    onChange({ ...config, styles: withStyles(config.styles, active, next) });
  const appliesTo =
    adminData.postTypes
      .filter((postType) => config.postTypes.includes(postType.name))
      .map((postType) => postType.label)
      .join(", ") || __("nothing yet", "guten-style");

  // Tablet and mobile values that apply in this build (free: heading font sizes; Pro: every size).
  const activeDeviceKeys = deviceKeys(active, config.pro);

  const rail = (
    <BlockRail
      active={active}
      appliesTo={appliesTo}
      config={config}
      onSelect={setActive}
    />
  );

  if (locked) {
    return (
      <div className="gs-global">
        {rail}
        <LockedBlockView block={locked} />
      </div>
    );
  }

  if (!block) return null;

  return (
    <div className="gs-global">
      {rail}

      <Preview
        css={generateCss(
          active,
          filterDeviceValues(values, activeDeviceKeys),
          `.gs.gs-${active}`,
          isForced(active, config.forceStyle, config.pro),
          mediaQueriesFor(config.breakpoints, adminData.themeMediaQueries),
        )}
        device={device}
        label={block.label}
        onDeviceChange={setDevice}
        type={active}
      />

      <aside
        aria-label={__("Block styles", "guten-style")}
        className="gs-global__inspector"
      >
        <header className="gs-inspector__element">
          <code>
            &lt;{block.tag}&gt;{" "}
            <span className="gs-inspector__label">{block.label}</span>
          </code>
          <code className="gs-inspector__class">.wp-block-{active}</code>
        </header>

        <div className="gs-inspector__section gs-global__header">
          <div>
            <h2>{__("Global style", "guten-style")}</h2>
            <p>{block.description}</p>
          </div>
          {countValues(values) > 0 && (
            <Button
              className="shrink-0"
              color="danger"
              onClick={() => update({})}
              size="small"
              variant="text"
            >
              {__("Reset", "guten-style")}
            </Button>
          )}
        </div>

        <div className="gs-inspector__section">
          <div className="gs-row">
            <span className="gs-row__label">{__("State", "guten-style")}</span>
            <SegmentedControl
              block
              label={__("State", "guten-style")}
              onChange={(next) => next && setState(next as StyleState)}
              options={[
                { label: __("Default", "guten-style"), value: "default" },
                { label: __("Hover", "guten-style"), value: "hover" },
              ]}
              value={state}
            />
          </div>
        </div>

        {device === "desktop" && state === "default" && (
          <PresetsSection
            hasValues={countValues(values) > 0}
            label={block.label}
            onApply={update}
            type={active}
            values={values}
          />
        )}

        <ReadabilityCheck onFix={(changes) => update({ ...values, ...changes })} type={active} values={values} />

        <StylePanel
          device={device}
          deviceKeys={activeDeviceKeys}
          inherited={{}}
          inheritedFrom={() => undefined}
          onChange={update}
          palette={visiblePalette(adminData.palette, config.themeColors, adminData.brandColors)}
          state={state}
          type={active}
          values={values}
        />
      </aside>
    </div>
  );
}
