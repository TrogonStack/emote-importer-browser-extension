import { defineManifest } from "@crxjs/vite-plugin";

import pkg from "./package.json" with { type: "json" };

export type TargetBrowser = "chrome" | "firefox";

const BACKGROUND_ENTRY = "src/app/background/index.ts";

const ICONS = {
  16: "src/assets/icons/icon-16.png",
  32: "src/assets/icons/icon-32.png",
  48: "src/assets/icons/icon-48.png",
  128: "src/assets/icons/icon-128.png",
};

function background(browser: TargetBrowser) {
  return browser === "firefox"
    ? { scripts: [BACKGROUND_ENTRY] }
    : { service_worker: BACKGROUND_ENTRY, type: "module" as const };
}

function browserSpecificSettings(browser: TargetBrowser) {
  return browser === "firefox"
    ? {
        browser_specific_settings: {
          gecko: {
            id: "emote-importer@trogonstack",
            strict_min_version: "140.0",
            data_collection_permissions: { required: ["none" as const] },
          },
          gecko_android: {
            strict_min_version: "142.0",
          },
        },
      }
    : {};
}

export function createManifest(browser: TargetBrowser) {
  return defineManifest({
    manifest_version: 3,
    name: "Emote Importer",
    description: "Search 7TV and BetterTTV emotes and install them as Slack custom emoji.",
    version: pkg.version,
    icons: ICONS,
    action: {
      default_icon: ICONS,
      default_popup: "src/app/popup/index.html",
    },
    background: background(browser),
    content_scripts: [
      {
        matches: ["https://*.slack.com/customize/emoji*"],
        js: ["src/app/content/index.tsx"],
        run_at: "document_idle",
      },
    ],
    permissions: ["storage", "declarativeNetRequestWithHostAccess"],
    host_permissions: [
      "https://7tv.io/*",
      "https://cdn.7tv.app/*",
      "https://api.betterttv.net/*",
      "https://cdn.betterttv.net/*",
    ],
    ...browserSpecificSettings(browser),
  });
}
