import { EMOTE_IMAGE_HOSTS, EMOTE_SEARCH_QUERY_MIN_LENGTH } from "@/constants/emote";
import type {
  Emote,
  EmoteCode,
  EmoteImageUrl,
  EmoteProviderId,
  EmoteSearchQuery,
  TwitchUserId,
} from "@/types/emote";

export function emoteKey(emote: Emote): string {
  return `${emote.provider}:${emote.id}`;
}

export function mergeEmotes(...lists: ReadonlyArray<readonly Emote[]>): Emote[] {
  const byCode = new Map<EmoteCode, Emote>();
  for (const list of lists) {
    for (const emote of list) {
      byCode.set(emote.code, emote);
    }
  }
  return [...byCode.values()];
}

export function toEmoteImageUrl(value: string): EmoteImageUrl {
  const url = new URL(value);
  if (url.protocol !== "https:" || !EMOTE_IMAGE_HOSTS.has(url.hostname)) {
    throw new Error(`Unsupported emote image URL: ${value}`);
  }
  return url.toString() as EmoteImageUrl;
}

export function parseTwitchUserId(value: string): TwitchUserId | undefined {
  const trimmed = value.trim();
  return /^\d+$/.test(trimmed) ? (trimmed as TwitchUserId) : undefined;
}

export function parseEmoteSearchQuery(
  value: string,
  provider: EmoteProviderId,
): EmoteSearchQuery | undefined {
  const trimmed = value.trim();
  return trimmed.length >= EMOTE_SEARCH_QUERY_MIN_LENGTH[provider]
    ? (trimmed as EmoteSearchQuery)
    : undefined;
}
