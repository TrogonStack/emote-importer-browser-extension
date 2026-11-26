import {
  type Emote,
  type EmoteCode,
  type EmoteId,
  type EmotePage,
  type EmotePageCursor,
  type EmoteSearchQuery,
  type TwitchUserId,
} from "@/types/emote";
import { toEmoteImageUrl } from "@/helpers/emote";
import {
  BETTERTTV_API_URL,
  BETTERTTV_CDN_URL,
  BETTERTTV_TOP_CURSOR_PREFIX,
  BETTERTTV_TOP_SCAN_PAGE_SIZE,
  BETTERTTV_TOP_SCAN_PAGES,
  BETTERTTV_UPLOAD_FORMATS,
  BETTERTTV_UPLOAD_SIZES,
} from "@/constants/betterttv";

type BttvEmote = {
  id: string;
  code: string;
  animated: boolean;
};

type BttvUser = {
  channelEmotes: BttvEmote[];
  sharedEmotes: BttvEmote[];
};

function toEmote(raw: BttvEmote): Emote {
  return {
    id: raw.id as EmoteId,
    code: raw.code as EmoteCode,
    previewUrl: toEmoteImageUrl(`${BETTERTTV_CDN_URL}/${raw.id}/2x.webp`),
    uploadCandidates: BETTERTTV_UPLOAD_FORMATS.flatMap((extension) =>
      BETTERTTV_UPLOAD_SIZES.map((size) =>
        toEmoteImageUrl(`${BETTERTTV_CDN_URL}/${raw.id}/${size}${extension}`),
      ),
    ),
    provider: "bttv",
    animated: raw.animated,
  };
}

class BttvRequestError extends Error {
  constructor(
    readonly status: number,
    url: string,
  ) {
    super(`BetterTTV request failed (${status}): ${url}`);
  }
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new BttvRequestError(response.status, url);
  return (await response.json()) as T;
}

export async function fetchBttvGlobal(): Promise<Emote[]> {
  return (await fetchJson<BttvEmote[]>(`${BETTERTTV_API_URL}/cached/emotes/global`)).map(toEmote);
}

export async function fetchBttvChannel(userId: TwitchUserId): Promise<Emote[]> {
  const user = await fetchJson<BttvUser>(`${BETTERTTV_API_URL}/cached/users/twitch/${userId}`);
  return [...user.channelEmotes, ...user.sharedEmotes].map(toEmote);
}

type BttvTopEntry = {
  id: string;
  emote: BttvEmote;
};

async function fetchBttvTop(
  cursor: EmotePageCursor | undefined,
  limit: number,
): Promise<EmotePage> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set("before", cursor);
  const entries = await fetchJson<BttvTopEntry[]>(
    `${BETTERTTV_API_URL}/emotes/shared/top?${params}`,
  );
  const last = entries.at(-1);
  return {
    emotes: entries.map((entry) => toEmote(entry.emote)),
    nextCursor: last ? (last.id as EmotePageCursor) : undefined,
  };
}

async function searchBttvApi(
  query: EmoteSearchQuery,
  cursor: EmotePageCursor | undefined,
  limit: number,
): Promise<EmotePage> {
  const offset = cursor ? Number(cursor) : 0;
  const params = new URLSearchParams({ query, offset: String(offset), limit: String(limit) });
  const emotes = await fetchJson<BttvEmote[]>(
    `${BETTERTTV_API_URL}/emotes/shared/search?${params}`,
  );
  return {
    emotes: emotes.map(toEmote),
    nextCursor: emotes.length > 0 ? (String(offset + limit) as EmotePageCursor) : undefined,
  };
}

export function matchesBttvQuery(code: string, query: EmoteSearchQuery): boolean {
  return code.toLowerCase().includes(query.toLowerCase());
}

async function searchBttvTop(
  query: EmoteSearchQuery,
  cursor: EmotePageCursor | undefined,
  limit: number,
): Promise<EmotePage> {
  const emotes: Emote[] = [];
  let before = cursor?.slice(BETTERTTV_TOP_CURSOR_PREFIX.length) as EmotePageCursor | undefined;
  for (let scanned = 0; scanned < BETTERTTV_TOP_SCAN_PAGES; scanned++) {
    const page = await fetchBttvTop(before, BETTERTTV_TOP_SCAN_PAGE_SIZE);
    emotes.push(...page.emotes.filter((emote) => matchesBttvQuery(emote.code, query)));
    before = page.emotes.length < BETTERTTV_TOP_SCAN_PAGE_SIZE ? undefined : page.nextCursor;
    if (before === undefined || emotes.length >= limit) break;
  }
  return {
    emotes,
    nextCursor: before && (`${BETTERTTV_TOP_CURSOR_PREFIX}${before}` as EmotePageCursor),
  };
}

// BetterTTV's search endpoint requires a logged-in account (401 otherwise),
// so search falls back to filtering the public top emotes by name.
async function searchBttv(
  query: EmoteSearchQuery,
  cursor: EmotePageCursor | undefined,
  limit: number,
): Promise<EmotePage> {
  if (cursor?.startsWith(BETTERTTV_TOP_CURSOR_PREFIX)) return searchBttvTop(query, cursor, limit);
  try {
    return await searchBttvApi(query, cursor, limit);
  } catch (error) {
    if (!(error instanceof BttvRequestError) || (error.status !== 401 && error.status !== 403)) {
      throw error;
    }
    return searchBttvTop(query, undefined, limit);
  }
}

export function fetchBttvPage(
  query: EmoteSearchQuery | undefined,
  cursor: EmotePageCursor | undefined,
  limit: number,
): Promise<EmotePage> {
  return query ? searchBttv(query, cursor, limit) : fetchBttvTop(cursor, limit);
}
