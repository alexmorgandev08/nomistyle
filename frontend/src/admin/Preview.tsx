import { Spin } from "antd";
import { useEffect, useRef, useState } from "react";
import { __, _n, sprintf } from "@wordpress/i18n";

import SegmentedControl from "../shared/components/SegmentedControl";
import { writeStyleElement } from "../shared/styleElement";
import { type Device } from "../shared/schema";
import { adminData } from "./data";
import { markSelection, SELECTION_CSS } from "./previewSelection";

const DEVICE_WIDTHS: Record<Device, string> = {
  desktop: "100%",
  mobile: "375px",
  tablet: "768px",
};

const DEVICE_OPTIONS: { label: string; value: Device }[] = [
  { label: __("Desktop", "guten-style"), value: "desktop" },
  { label: __("Tablet", "guten-style"), value: "tablet" },
  { label: __("Mobile", "guten-style"), value: "mobile" },
];

const STYLE_ELEMENT_ID = "gs-admin-preview-styles";
const UI_STYLE_ELEMENT_ID = "gs-admin-preview-ui";

interface PreviewProps {
  /** CSS of the selected block: injected into the frame and shown in the CSS view. */
  css: string;
  device: Device;
  /** Name of the selected block, for the breadcrumb and the label on the canvas. */
  label: string;
  onDeviceChange: (device: Device) => void;
  type: string;
}

/**
 * Shows the selected block's samples rendered by the active theme
 * (see PreviewPage.php), with the unsaved GutenStyle CSS injected.
 */
export default function Preview({
  css,
  device,
  label,
  onDeviceChange,
  type,
}: PreviewProps) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [showCss, setShowCss] = useState(false);

  const ruleCount =
    (css.match(/\{/g) ?? []).length - (css.match(/@media/g) ?? []).length;

  const badge = sprintf(
    /* translators: %s: block name */
    __("%s · Global", "guten-style"),
    label,
  );

  // Once loaded: selection styles, inert links, and keeping the label in place on resize.
  useEffect(() => {
    const doc = frame.current?.contentDocument;
    const win = frame.current?.contentWindow;
    if (!loaded || !doc?.head || !win) return undefined;

    writeStyleElement(doc, UI_STYLE_ELEMENT_ID, SELECTION_CSS);

    // Links in the samples must not navigate the preview away.
    const onClick = (event: MouseEvent) => {
      if ((event.target as Element | null)?.closest("a")) event.preventDefault();
    };
    const onResize = () => markSelection(doc);

    doc.addEventListener("click", onClick);
    win.addEventListener("resize", onResize);
    return () => {
      doc.removeEventListener("click", onClick);
      win.removeEventListener("resize", onResize);
    };
  }, [loaded]);

  useEffect(() => {
    const doc = frame.current?.contentDocument;
    if (!loaded || !doc?.head) return;

    doc.querySelectorAll<HTMLElement>("[data-gs-sample]").forEach((section) => {
      section.hidden = section.dataset.gsSample !== type;
    });

    writeStyleElement(doc, STYLE_ELEMENT_ID, css);
    markSelection(doc, type, badge);
  }, [badge, css, loaded, type]);

  return (
    <section aria-label={__("Preview", "guten-style")} className="gs-preview">
      <div className="gs-preview__toolbar">
        <p className="gs-preview__crumb">
          {__("Global Styles", "guten-style")}{" "}
          <span className="gs-preview__crumb-sep">/</span>{" "}
          <strong>{label}</strong>
        </p>
        <SegmentedControl
          label={__("Preview size", "guten-style")}
          onChange={(next) => next && onDeviceChange(next as Device)}
          options={DEVICE_OPTIONS}
          value={device}
        />
        <button
          aria-pressed={showCss}
          className="gs-preview__css-toggle"
          onClick={() => setShowCss((value) => !value)}
          type="button"
        >
          <svg aria-hidden viewBox="0 0 24 24">
            <path
              d="m16 18 6-6-6-6M8 6l-6 6 6 6"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
          {__("CSS", "guten-style")}
        </button>
      </div>
      <div className="gs-preview__stage">
        {!loaded && (
          <div className="gs-preview__loading">
            <Spin />
          </div>
        )}
        <iframe
          className="gs-preview__frame"
          onLoad={() => setLoaded(true)}
          ref={frame}
          src={adminData.previewUrl}
          style={{ width: DEVICE_WIDTHS[device] }}
          title={__("GutenStyle preview with your theme", "guten-style")}
        />
      </div>
      {showCss && (
        <div className="gs-preview__css">
          <div className="gs-preview__css-head">
            <span>{__("Generated CSS · Global layer", "guten-style")}</span>
            <span>
              {sprintf(
                /* translators: %d: number of CSS rules */
                _n("%d rule", "%d rules", ruleCount, "guten-style"),
                ruleCount,
              )}
            </span>
          </div>
          <pre
            aria-label={__("Generated CSS", "guten-style")}
            className="gs-preview__code"
            tabIndex={0}
          >
            {css ||
              __(
                "/* No styles set. The theme styles this block. */",
                "guten-style",
              )}
          </pre>
        </div>
      )}
    </section>
  );
}
