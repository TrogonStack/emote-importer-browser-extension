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
import { MAX_SLACK_UPLOAD_BYTES } from "@/constants/slack";
import { SEVEN_TV_API_URL, SEVEN_TV_POPULAR_QUERY, SEVEN_TV_SEARCH_QUERY } from "@/constants/7tv";

export type SevenTvFile = {
  name: string;
  format: string;
  size: number;
};

type SevenTvHost = {
  url: string;
  files: SevenTvFile[];
};

type SevenTvEmote = {
  id: string;
  name: string;
  data: { animated: boolean; host: SevenTvHost };
};

type SevenTvSearchItem = {
  id: string;
  name: string;
  animated: boolean;
  host: SevenTvHost;
};

type SevenTvEmoteSet = {
  emotes?: SevenTvEmote[] | null;
};

export function uploadFiles(files: readonly SevenTvFile[], animated: boolean): SevenTvFile[] {
  const format = animated ? "GIF" : "PNG";
  const largestFirst = files.filter((f) => f.format === format).toSorted((a, b) => b.size - a.size);
  const fitting = largestFirst.filter((f) => f.size <= MAX_SLACK_UPLOAD_BYTES);
  return fitting.length > 0 ? fitting : largestFirst.slice(-1);
}

function toEmote(item: SevenTvSearchItem): Emote {
  const { id, name, animated, host } = item;
  return {
    id: id as EmoteId,
    code: name as EmoteCode,
    previewUrl: toEmoteImageUrl(`https:${host.url}/2x.webp`),
    uploadCandidates: uploadFiles(host.files, animated).map((file) =>
      toEmoteImageUrl(`https:${host.url}/${file.name}`),
    ),
    provider: "7tv",
    animated,
  };
}

function fromSetEmote(raw: SevenTvEmote): Emote {
  return toEmote({ id: raw.id, name: raw.name, animated: raw.data.animated, host: raw.data.host });
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`7TV request failed (${response.status}): ${url}`);
  }
  return (await response.json()) as T;
}

export async function fetchSevenTvGlobal(): Promise<Emote[]> {
  const set = await fetchJson<SevenTvEmoteSet>(`${SEVEN_TV_API_URL}/emote-sets/global`);
  return (set.emotes ?? []).map(fromSetEmote);
}

export async function fetchSevenTvChannel(userId: TwitchUserId): Promise<Emote[]> {
  const user = await fetchJson<{ emote_set?: SevenTvEmoteSet | null }>(
    `${SEVEN_TV_API_URL}/users/twitch/${userId}`,
  );
  return (user.emote_set?.emotes ?? []).map(fromSetEmote);
}

type SevenTvSearchResponse = {
  data?: { emotes?: { items: SevenTvSearchItem[] } | null };
  errors?: Array<{ message: string }>;
};

export async function fetchSevenTvPage(
  query: EmoteSearchQuery | undefined,
  cursor: EmotePageCursor | undefined,
  limit: number,
): Promise<EmotePage> {
  const page = cursor ? Number(cursor) : 1;
  const request = query
    ? { query: SEVEN_TV_SEARCH_QUERY, variables: { query, page, limit } }
    : { query: SEVEN_TV_POPULAR_QUERY, variables: { page, limit } };
  const response = await fetch(`${SEVEN_TV_API_URL}/gql`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error(`7TV search failed (${response.status})`);
  const body = (await response.json()) as SevenTvSearchResponse;
  if (body.errors?.length) throw new Error(`7TV search failed: ${body.errors[0]?.message}`);
  const items = body.data?.emotes?.items ?? [];
  return {
    emotes: items.map(toEmote),
    nextCursor: items.length === limit ? (String(page + 1) as EmotePageCursor) : undefined,
  };
}
