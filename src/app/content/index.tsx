import { NAMESPACE } from "@/constants/namespace";
import { StrictMode } from "react";
import { type Root, createRoot } from "react-dom/client";

import { ImportButton, ImportDialog } from "./app";
import { findOpenDialogButton } from "./slack-page";
import styles from "@/styles/content.css?inline";
import { CSS_PROPERTY_RULE_PATTERN, DARK_LUMINANCE_THRESHOLD } from "@/app/content/constants/theme";

function registerTailwindProperties(css: string): void {
  const properties = document.createElement("style");
  properties.textContent = css.match(CSS_PROPERTY_RULE_PATTERN)?.join("\n") ?? "";
  document.head.append(properties);
}

function isDark(element: Element): boolean {
  const [r = 255, g = 255, b = 255] = (
    getComputedStyle(element).backgroundColor.match(/\d+/g) ?? []
  ).map(Number);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < DARK_LUMINANCE_THRESHOLD;
}

type ShadowMount = {
  readonly host: HTMLElement;
  readonly root: Root;
};

function createShadowMount(tag: string, hostStyle: string, dark: boolean): ShadowMount {
  const host = document.createElement(tag);
  host.setAttribute("style", hostStyle);
  const shadow = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = styles;
  const mount = document.createElement("div");
  mount.className = `text-[13px] font-normal ${dark ? "dark" : ""}`;
  shadow.append(style, mount);
  return { host, root: createRoot(mount) };
}

let button: ShadowMount | undefined;

function syncButton(): void {
  if (button?.host.isConnected) return;
  button?.root.unmount();
  button = undefined;
  const addCustomEmoji = findOpenDialogButton();
  if (!addCustomEmoji) return;
  button = createShadowMount(
    `${NAMESPACE}-button`,
    "display:inline-block;margin-left:12px",
    isDark(document.body),
  );
  addCustomEmoji.before(button.host);
  button.root.render(
    <StrictMode>
      <ImportButton />
    </StrictMode>,
  );
}

registerTailwindProperties(styles);

const panel = createShadowMount(NAMESPACE, "", isDark(document.body));
document.body.append(panel.host);
panel.root.render(
  <StrictMode>
    <ImportDialog />
  </StrictMode>,
);

syncButton();
new MutationObserver(syncButton).observe(document.body, { childList: true, subtree: true });
