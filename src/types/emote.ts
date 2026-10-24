import type { Brand } from "./brand";

export type EmoteId = Brand<string, "EmoteId">;
export type EmoteCode = Brand<string, "EmoteCode">;
export type EmoteImageUrl = Brand<string, "EmoteImageUrl">;
export type TwitchUserId = Brand<string, "TwitchUserId">;

export type EmoteProviderId = "7tv" | "bttv";

export type Emote = {
  readonly id: EmoteId;
  readonly code: EmoteCode;
  readonly previewUrl: EmoteImageUrl;
  readonly uploadCandidates: readonly EmoteImageUrl[];
  readonly provider: EmoteProviderId;
  readonly animated: boolean;
};

export type EmoteSearchQuery = Brand<string, "EmoteSearchQuery">;

export type EmotePageCursor = Brand<string, "EmotePageCursor">;

export type EmotePage = {
  readonly emotes: readonly Emote[];
  readonly nextCursor: EmotePageCursor | undefined;
};
