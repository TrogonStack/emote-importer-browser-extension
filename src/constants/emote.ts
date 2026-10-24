import type { EmoteProviderId } from "@/types/emote";

export const EMOTE_PAGE_SIZE = 60;

export const EMOTE_IMAGE_HOSTS: ReadonlySet<string> = new Set(["cdn.7tv.app", "cdn.betterttv.net"]);

export const EMOTE_SEARCH_QUERY_MIN_LENGTH = { "7tv": 1, bttv: 3 } as const satisfies Record<
  EmoteProviderId,
  number
>;

export const EMOTE_FILE_EXTENSIONS: Record<string, string> = {
  "image/gif": "gif",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export const EMOTE_CACHE_TTL_MS = 60 * 60 * 1000;

export const EMOTE_PROVIDER_LABELS: Record<EmoteProviderId, string> = {
  "7tv": "7TV",
  bttv: "BetterTTV",
};

export const EMOTE_PROVIDERS: readonly EmoteProviderId[] = ["7tv", "bttv"];
