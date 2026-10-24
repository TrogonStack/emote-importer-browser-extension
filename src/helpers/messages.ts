import type {
  Emote,
  EmoteImageUrl,
  EmotePage,
  EmotePageCursor,
  EmoteProviderId,
  EmoteSearchQuery,
} from "@/types/emote";

export type Request =
  | { type: "emotes/get" }
  | { type: "emotes/refresh" }
  | {
      type: "emotes/page";
      provider: EmoteProviderId;
      query: EmoteSearchQuery | undefined;
      cursor: EmotePageCursor | undefined;
    }
  | { type: "emote/image"; url: EmoteImageUrl };

export type EmotesResponse = {
  readonly emotes: readonly Emote[];
};

export type EmoteImageResponse = {
  readonly mimeType: string;
  readonly base64: string;
};

export type ResponseFor<R extends Request> = R extends { type: "emote/image" }
  ? EmoteImageResponse
  : R extends { type: "emotes/page" }
    ? EmotePage
    : EmotesResponse;

export type Envelope<T> = { ok: true; value: T } | { ok: false; error: string };

export async function sendRequest<R extends Request>(request: R): Promise<ResponseFor<R>> {
  const envelope = await chrome.runtime.sendMessage<R, Envelope<ResponseFor<R>>>(request);
  if (!envelope.ok) throw new Error(envelope.error);
  return envelope.value;
}
