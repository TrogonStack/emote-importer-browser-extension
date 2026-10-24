import type { EmoteCode } from "@/types/emote";
import type { SlackEmojiName } from "@/types/slack-emoji-name";
import { SLACK_EMOJI_NAME_PATTERN } from "@/constants/slack";

export function parseSlackEmojiName(value: string): SlackEmojiName | undefined {
  const normalized = value.trim().toLowerCase();
  return SLACK_EMOJI_NAME_PATTERN.test(normalized) ? (normalized as SlackEmojiName) : undefined;
}

export function slackEmojiNameFromEmoteCode(code: EmoteCode): SlackEmojiName | undefined {
  const slug = code
    .toLowerCase()
    .replaceAll(/[^a-z0-9_-]+/g, "_")
    .replaceAll(/^_+|_+$/g, "")
    .slice(0, 100);
  return parseSlackEmojiName(slug);
}
