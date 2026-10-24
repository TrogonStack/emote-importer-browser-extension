import type { EmoteProviderId, TwitchUserId } from "@/types/emote";

export type Settings = {
  readonly providers: Readonly<Record<EmoteProviderId, boolean>>;
  readonly twitchChannels: readonly TwitchUserId[];
};
