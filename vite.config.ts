import { crx } from "@crxjs/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { type TargetBrowser, createManifest } from "./manifest.config.ts";

export default defineConfig(({ mode }) => {
  const browser: TargetBrowser = mode === "firefox" ? "firefox" : "chrome";
  return {
    plugins: [react(), tailwindcss(), crx({ manifest: createManifest(browser), browser })],
    resolve: {
      alias: { "@": "/src" },
    },
    build: {
      outDir: `dist/${browser}`,
    },
    server: {
      cors: { origin: [/chrome-extension:\/\//, /moz-extension:\/\//] },
    },
  };
});
