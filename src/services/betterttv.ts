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
import { BETTERTTV_API_URL, BETTERTTV_CDN_URL } from "@/constants/betterttv";

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
    uploadCandidates: ["3x", "2x", "1x"].map((size) =>
      toEmoteImageUrl(`${BETTERTTV_CDN_URL}/${raw.id}/${size}`),
    ),
    provider: "bttv",
    animated: raw.animated,
  };
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`BetterTTV request failed (${response.status}): ${url}`);
  }
  return (await response.json()) as T;
}

export async function fetchBttvGlobal(): Promise<Emote[]> {
  return (await fetchJson<BttvEmote[]>(`${BETTERTTV_API_URL}/cached/emotes/global`)).map(toEmote);
}

export async function fetchBttvChannel(userId: TwitchUserId): Promise<Emote[]> {
  const user = await fetchJson<BttvUser>(`${BETTERTTV_API_URL}/cached/users/twitch/${userId}`);
  return [...user.channelEmotes, ...user.sharedEmotes].map(toEmote);
}

async function searchBttv(
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

export function fetchBttvPage(
  query: EmoteSearchQuery | undefined,
  cursor: EmotePageCursor | undefined,
  limit: number,
): Promise<EmotePage> {
  return query ? searchBttv(query, cursor, limit) : fetchBttvTop(cursor, limit);
}
