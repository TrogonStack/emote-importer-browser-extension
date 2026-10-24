import { DEFAULT_SETTINGS } from "@/constants/settings";
import { SETTINGS_STORAGE_KEY } from "@/constants/storage";
import type { Settings } from "@/types/settings";

export async function loadSettings(): Promise<Settings> {
  const stored = await chrome.storage.sync.get(SETTINGS_STORAGE_KEY);
  return {
    ...DEFAULT_SETTINGS,
    ...(stored[SETTINGS_STORAGE_KEY] as Partial<Settings> | undefined),
  };
}

export function saveSettings(settings: Settings): Promise<void> {
  return chrome.storage.sync.set({ [SETTINGS_STORAGE_KEY]: settings });
}

export function onSettingsChanged(listener: () => void): void {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "sync" && SETTINGS_STORAGE_KEY in changes) listener();
  });
}
