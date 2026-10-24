import { NAMESPACE } from "@/constants/namespace";
import {
  type Emote,
  type EmoteImageUrl,
  type EmotePage,
  type EmotePageCursor,
  type EmoteProviderId,
  type EmoteSearchQuery,
} from "@/types/emote";
import { EMOTE_PAGE_SIZE } from "@/constants/emote";
import { mergeEmotes, toEmoteImageUrl } from "@/helpers/emote";
import { isFresh, readEmoteCache, writeEmoteCache } from "@/storages/local/emote-cache";
import type { EmoteImageResponse, Envelope, Request } from "@/helpers/messages";
import { fetchBttvChannel, fetchBttvGlobal, fetchBttvPage } from "@/services/betterttv";
import { fetchSevenTvChannel, fetchSevenTvGlobal, fetchSevenTvPage } from "@/services/7tv";
import type { Settings } from "@/types/settings";
import { loadSettings, onSettingsChanged } from "@/storages/sync/settings";
import { BETTERTTV_REFERER_RULE_ID } from "@/constants/betterttv";

async function fetchAll(settings: Settings): Promise<Emote[]> {
  const jobs: Array<Promise<Emote[]>> = [];
  if (settings.providers.bttv) {
    jobs.push(fetchBttvGlobal(), ...settings.twitchChannels.map(fetchBttvChannel));
  }
  if (settings.providers["7tv"]) {
    jobs.push(fetchSevenTvGlobal(), ...settings.twitchChannels.map(fetchSevenTvChannel));
  }
  const results = await Promise.allSettled(jobs);
  const lists = results.flatMap((result) => {
    if (result.status === "fulfilled") return [result.value];
    console.warn(`[${NAMESPACE}] emote provider failed`, result.reason);
    return [];
  });
  return mergeEmotes(...lists);
}

let inflight: Promise<readonly Emote[]> | undefined;

function refresh(): Promise<readonly Emote[]> {
  inflight ??= (async () => {
    const emotes = await fetchAll(await loadSettings());
    await writeEmoteCache(emotes);
    return emotes;
  })().finally(() => {
    inflight = undefined;
  });
  return inflight;
}

async function getEmotes(): Promise<readonly Emote[]> {
  const cache = await readEmoteCache();
  return cache && isFresh(cache) ? cache.emotes : refresh();
}

function fetchPage(
  provider: EmoteProviderId,
  query: EmoteSearchQuery | undefined,
  cursor: EmotePageCursor | undefined,
): Promise<EmotePage> {
  return (provider === "7tv" ? fetchSevenTvPage : fetchBttvPage)(query, cursor, EMOTE_PAGE_SIZE);
}

function allowBttvSearch(): Promise<void> {
  return chrome.declarativeNetRequest.updateSessionRules({
    removeRuleIds: [BETTERTTV_REFERER_RULE_ID],
    addRules: [
      {
        id: BETTERTTV_REFERER_RULE_ID,
        action: {
          type: "modifyHeaders",
          requestHeaders: [
            { header: "referer", operation: "set", value: "https://betterttv.com/" },
          ],
        },
        condition: {
          requestDomains: ["api.betterttv.net"],
          initiatorDomains: [new URL(chrome.runtime.getURL("")).host],
        },
      },
    ],
  });
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

async function fetchImage(url: EmoteImageUrl): Promise<EmoteImageResponse> {
  const response = await fetch(toEmoteImageUrl(url));
  if (!response.ok) throw new Error(`Image request failed (${response.status}): ${url}`);
  const blob = await response.blob();
  return { mimeType: blob.type, base64: toBase64(new Uint8Array(await blob.arrayBuffer())) };
}

function handle(request: Request): Promise<unknown> {
  switch (request.type) {
    case "emotes/get":
      return getEmotes().then((emotes) => ({ emotes }));
    case "emotes/refresh":
      return refresh().then((emotes) => ({ emotes }));
    case "emotes/page":
      return fetchPage(request.provider, request.query, request.cursor);
    case "emote/image":
      return fetchImage(request.url);
  }
}

chrome.runtime.onMessage.addListener((request: Request, sender, sendResponse) => {
  if (sender.id !== chrome.runtime.id) return false;
  handle(request)
    .then((value) => sendResponse({ ok: true, value } satisfies Envelope<unknown>))
    .catch((error: unknown) => {
      console.error(`[${NAMESPACE}] request failed`, request.type, error);
      sendResponse({ ok: false, error: String(error) } satisfies Envelope<unknown>);
    });
  return true;
});

onSettingsChanged(() => void refresh());
void allowBttvSearch();
