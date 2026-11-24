import { Button, ExternalLink, Notice, PanelBody } from "@wordpress/components";
import { useDispatch } from "@wordpress/data";
import { useState } from "@wordpress/element";
import { __, sprintf } from "@wordpress/i18n";

import PresetPicker from "../shared/components/PresetPicker";
import ReadabilityCheck from "../shared/components/ReadabilityCheck";
import SegmentedControl from "../shared/components/SegmentedControl";
import ThemeToggle from "../shared/components/ThemeToggle";
import StylePanel from "../shared/components/StylePanel";
import { getBlock, type StyleValues } from "../shared/schema";
import { deviceKeys } from "../shared/deviceKeys";
import { useSavedPresets } from "../shared/savedPresets";
import { defaultLevel, editableLevels, visiblePalette } from "../shared/settings";
import { themeClass, useUiTheme } from "../shared/theme";
import {
  countValues,
  knownValues,
  type Level,
  LEVEL_LABELS,
  mergeLevels,
  type StyleState,
  withStyles,
} from "../shared/values";
import { editorData, useEditorDevice, usePostContext } from "./context";
import { copyStyle, readCopiedStyle } from "./styleClipboard";
import { type TableRow } from "./tableHeader";
import { useDescribeStyleAction } from "./describeStyleAction";
import { useSavePresetAction } from "./savePresetAction";
import StyleMenu from "./StyleMenu";
import TableHeaderNotice from "./TableHeaderNotice";

interface BlockPanelProps {
  attributes: {
    body?: TableRow[];
    /** `force`: Nomi Style Pro's Style Inspector forced this block (its CSS is !important). */
    gutenStyle?: { force?: boolean; values?: unknown };
    head?: TableRow[];
  };
  setAttributes: (attributes: Record<string, unknown>) => void;
  type: string;
}

export default function BlockPanel({
  attributes,
  setAttributes,
  type,
}: BlockPanelProps) {
  const block = getBlock(type);
  const context = usePostContext();
  // Follows the device preview in Gutenberg's toolbar; tablet and mobile edit responsive values.
  const device = useEditorDevice();
  // Settings › Block editor decides which levels (this post, this block) can be edited here.
  const levels = editableLevels(editorData.config.editor);
  const showSource = editorData.config.editor.showSource && levels.length > 1;
  const [source, setSource] = useState<Level>(() => defaultLevel(levels));
  const [state, setState] = useState<StyleState>("default");
  const [theme] = useUiTheme();
  // Read once per mount: selecting another block remounts this panel and reads it again.
  const [copied, setCopied] = useState(() => readCopiedStyle(type));
  // Saved presets and "Save as preset" (Nomi Style Pro; nothing in the free build).
  const savedPresets = useSavedPresets(type);
  const savePreset = useSavePresetAction({
    canSave: editorData.canEditStyles,
    onSave: savedPresets.save,
  });

  // Sets the level being edited (this block, or this post's style for the block type).
  const update = (values: StyleValues) => {
    if (source === "block") {
      setAttributes({
        // Keep other keys, such as the force flag.
        gutenStyle: countValues(values) > 0 ? { ...attributes.gutenStyle, values } : undefined,
      });
    } else {
      context.setPostStyles(withStyles(context.postStyles, type, values));
    }
  };

  // "Describe a style with AI" (Nomi Style Pro). Apply goes through the same update as presets.
  const describeStyle = useDescribeStyleAction({
    canApply: source !== "global",
    onApply: update,
    type,
  });
  const { createNotice } = useDispatch("core/notices") as {
    createNotice: (
      status: string,
      content: string,
      options: Record<string, unknown>,
    ) => void;
  };

  if (!block) return null;

  const blockLabel = block.label.split(" /")[0].toLowerCase();
  const globalValues = editorData.config.styles[type] ?? {};
  const postValues = context.postStyles[type] ?? {};
  const blockValues = knownValues(type, attributes.gutenStyle?.values);

  if (!context.inScope) {
    return (
      <PanelBody
        className={`gs-block-panel ${themeClass(theme)}`}
        title={__("Nomi Style", "nomistyle")}
      >
        <OutOfScopeNotice />
      </PanelBody>
    );
  }

  const effective = mergeLevels(globalValues, postValues, blockValues);
  const editing = source === "block" ? blockValues : postValues;
  const inherited =
    source === "block" ? mergeLevels(globalValues, postValues) : globalValues;
  const inheritedFrom = (key: string): Level | undefined => {
    if (source === "block" && postValues[key]) return "post";
    return globalValues[key] ? "global" : undefined;
  };


  const notify = (message: string, actions: { label: string; onClick: () => void }[] = []) =>
    createNotice("info", message, { actions, isDismissible: true, type: "snackbar" });

  // Actions of the ⋯ menu (StyleMenu).
  const globalStyleUrl = editorData.canManage
    ? editorData.settingsUrl.replace("#/settings", `#/styles/${type}`)
    : undefined;
  const resetLabel =
    source === "block"
      ? sprintf(
          /* translators: %s: block name */
          __("Reset this %s", "nomistyle"),
          blockLabel,
        )
      : __("Remove post style", "nomistyle");

  const copyCurrent = () => {
    copyStyle(type, editing);
    setCopied({ type, values: editing });
    notify(
      sprintf(
        /* translators: 1: number of settings, 2: block name */
        __("Copied %1$d settings from this %2$s.", "nomistyle"),
        countValues(editing),
        blockLabel,
      ),
    );
  };

  const pasteCopied = () => {
    if (!copied) return;
    update(copied.values);
    notify(__("Style pasted.", "nomistyle"));
  };

  const resetCurrent = () => {
    const previous = editing;
    update({});
    notify(
      source === "block"
        ? __("Block style reset.", "nomistyle")
        : __("Post style removed.", "nomistyle"),
      [{ label: __("Undo", "nomistyle"), onClick: () => update(previous) }],
    );
  };

  const help: Record<Level, string> = {
    block: sprintf(
      /* translators: %s: block name, e.g. "table" */
      __(
        "Edits apply to this one %s, on top of Global and this post.",
        "nomistyle",
      ),
      blockLabel,
    ),
    global: sprintf(
      /* translators: %s: block name, e.g. "table" */
      __(
        "Global styles apply to every %s where Nomi Style is on. Edit them in Nomi Style → Global Styles.",
        "nomistyle",
      ),
      blockLabel,
    ),
    post: sprintf(
      /* translators: 1: block name, 2: post type, e.g. "post" */
      __(
        "Edits apply to every %1$s in this %2$s, on top of Global.",
        "nomistyle",
      ),
      blockLabel,
      context.postTypeLabel.toLowerCase(),
    ),
  };

  return (
    <PanelBody
      className={`gs-block-panel ${themeClass(theme)}`}
      title={__("Nomi Style", "nomistyle")}
    >
      {savePreset.dialog}
      {describeStyle.dialog}
      {type === "table" && (
        <TableHeaderNotice
          body={attributes.body}
          effective={effective}
          head={attributes.head}
          setAttributes={setAttributes}
        />
      )}

      <div className="gs-panel-section">
        <div className="gs-panel-section__head">
          <span className="gs-panel-section__title">
            {__("Style source", "nomistyle")}
          </span>
          <ThemeToggle />
          <StyleMenu
            canCopyOrReset={source !== "global" && countValues(editing) > 0}
            canPaste={source !== "global" && copied !== null}
            extraActions={[...describeStyle.actions, ...savePreset.actionsFor(effective)]}
            globalStyleUrl={globalStyleUrl}
            onCopy={copyCurrent}
            onPaste={pasteCopied}
            onReset={resetCurrent}
            pasteHint={sprintf(
              /* translators: %s: block name */
              __("Copy a %s style first.", "nomistyle"),
              blockLabel,
            )}
            resetLabel={resetLabel}
          />
        </div>
        {showSource && (
          <SourceBar
            counts={{
              block: countValues(blockValues),
              global: countValues(globalValues),
              post: countValues(postValues),
            }}
            levels={levels}
            onChange={setSource}
            value={source}
          />
        )}
        <p className="gs-source-help">{help[source]}</p>
      </div>

      {source === "global" ? (
        <>
          {editorData.canManage && (
            <p>
              <ExternalLink href={globalStyleUrl ?? ""}>
                {__("Open Global Styles", "nomistyle")}
              </ExternalLink>
            </p>
          )}
          <ReadabilityCheck type={type} values={effective} />
        </>
      ) : (
        <>
          <div className="gs-panel-section gs-rows">
            <div className="gs-row">
              <span className="gs-row__label">
                {__("State", "nomistyle")}
              </span>
              <SegmentedControl
                block
                label={__("State", "nomistyle")}
                onChange={(next) => next && setState(next as StyleState)}
                options={STATE_OPTIONS}
                value={state}
              />
            </div>
          </div>

          {device === "desktop" && state === "default" && (
            <PresetPicker
              extraPresets={savedPresets.presets}
              hasValues={countValues(editing) > 0}
              onApply={update}
              type={type}
              values={editing}
            />
          )}

          <ReadabilityCheck
            onFix={(changes) => update({ ...editing, ...changes })}
            type={type}
            values={effective}
          />

          <StylePanel
            device={device}
            deviceKeys={deviceKeys(type, editorData.config.pro)}
            inherited={inherited}
            inheritedFrom={inheritedFrom}
            onChange={update}
            palette={visiblePalette(editorData.palette, editorData.config.themeColors, editorData.brandColors)}
            state={state}
            type={type}
            values={editing}
          />

        </>
      )}
    </PanelBody>
  );
}


const STATE_OPTIONS = [
  { label: __("Default", "nomistyle"), value: "default" },
  { label: __("Hover", "nomistyle"), value: "hover" },
];

/** Which level edits are saved to, with how many settings each level has for this block. */
function SourceBar({
  counts,
  levels,
  onChange,
  value,
}: {
  counts: Record<Level, number>;
  levels: Level[];
  onChange: (level: Level) => void;
  value: Level;
}) {
  return (
    <div
      aria-label={__("Style source", "nomistyle")}
      className="gs-source-bar"
      role="radiogroup"
    >
      {levels.map((level) => (
        <button
          aria-checked={value === level}
          className={`gs-source-bar__item${value === level ? " is-active" : ""}`}
          key={level}
          onClick={() => onChange(level)}
          role="radio"
          type="button"
        >
          <span className="gs-source-bar__label">{LEVEL_LABELS[level]}</span>
          <span className="gs-source-bar__count">
            {counts[level] > 0
              ? sprintf(
                  /* translators: %d: number of settings */
                  __("%d set", "nomistyle"),
                  counts[level],
                )
              : __("None set", "nomistyle")}
          </span>
        </button>
      ))}
    </div>
  );
}

export function OutOfScopeNotice() {
  const { disabled, matchesConditions, postTypeLabel, setDisabled, typeEnabled } =
    usePostContext();

  if (!typeEnabled) {
    return (
      <Notice isDismissible={false} status="info">
        {sprintf(
          /* translators: %s: post type label */
          __("Nomi Style is not active for %s content.", "nomistyle"),
          postTypeLabel,
        )}{" "}
        {editorData.canManage && (
          <ExternalLink href={editorData.settingsUrl}>
            {__("Change where it applies", "nomistyle")}
          </ExternalLink>
        )}
      </Notice>
    );
  }

  if (!matchesConditions) {
    return (
      <Notice isDismissible={false} status="info">
        {__("This post does not match the conditions in Nomi Style settings.", "nomistyle")}{" "}
        {__("After you change its categories, tags or author, save the post and reload the editor.", "nomistyle")}{" "}
        {editorData.canManage && (
          <ExternalLink href={editorData.settingsUrl}>
            {__("Change where it applies", "nomistyle")}
          </ExternalLink>
        )}
      </Notice>
    );
  }

  if (disabled) {
    return (
      <Notice isDismissible={false} status="info">
        {__("Nomi Style is turned off for this post.", "nomistyle")}{" "}
        <Button onClick={() => setDisabled(false)} variant="link">
          {__("Turn it on", "nomistyle")}
        </Button>
      </Notice>
    );
  }

  return (
    <Notice isDismissible={false} status="warning">
      {__("Save the post once to start using Nomi Style on it.", "nomistyle")}
    </Notice>
  );
}
