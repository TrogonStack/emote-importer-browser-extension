import type { Emote } from "@/types/emote";
import { EMOTE_CACHE_TTL_MS } from "@/constants/emote";
import { EMOTE_CACHE_STORAGE_KEY } from "@/constants/storage";

export type EmoteCache = {
  readonly fetchedAt: number;
  readonly emotes: readonly Emote[];
};

export function isFresh(cache: EmoteCache, now = Date.now()): boolean {
  return now - cache.fetchedAt < EMOTE_CACHE_TTL_MS;
}

export async function readEmoteCache(): Promise<EmoteCache | undefined> {
  const stored = await chrome.storage.local.get(EMOTE_CACHE_STORAGE_KEY);
  return stored[EMOTE_CACHE_STORAGE_KEY] as EmoteCache | undefined;
}

export function writeEmoteCache(emotes: readonly Emote[]): Promise<void> {
  return chrome.storage.local.set({
    [EMOTE_CACHE_STORAGE_KEY]: { fetchedAt: Date.now(), emotes } satisfies EmoteCache,
  });
}

export function onEmoteCacheChanged(listener: (cache: EmoteCache) => void): () => void {
  function handler(changes: Record<string, chrome.storage.StorageChange>, area: string) {
    const next = changes[EMOTE_CACHE_STORAGE_KEY]?.newValue as EmoteCache | undefined;
    if (area === "local" && next) listener(next);
  }
  chrome.storage.onChanged.addListener(handler);
  return () => chrome.storage.onChanged.removeListener(handler);
}
