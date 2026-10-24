import type { Brand } from "@/types/brand";
import type { SlackEmojiName } from "@/types/slack-emoji-name";
import type { SlackEmojiImageUrl } from "@/types/slack-emoji-image-url";
import {
  SLACK_API_TOKEN_PATTERN,
  SLACK_EMOJI_ALIAS_PREFIX,
  SLACK_ERROR_MESSAGES,
  SLACK_UPLOAD_FINAL_ERRORS,
} from "@/constants/slack";

type SlackApiToken = Brand<string, "SlackApiToken">;

function readApiToken(): SlackApiToken {
  for (const script of document.querySelectorAll("script:not([src])")) {
    const token = script.textContent?.match(SLACK_API_TOKEN_PATTERN)?.[1];
    if (token) return token as SlackApiToken;
  }
  throw new Error("Could not find Slack's session token on this page");
}

export type EmojiUpload = {
  readonly name: SlackEmojiName;
  readonly file: File;
};

type SlackApiResponse = {
  readonly ok: boolean;
  readonly error?: string;
};

type SlackEmojiListResponse = SlackApiResponse & {
  readonly emoji?: Readonly<Record<string, string>>;
};

export class SlackApiError extends Error {
  readonly code: string;

  constructor(code: string) {
    super(SLACK_ERROR_MESSAGES[code] ?? `Slack refused the upload (${code})`);
    this.code = code;
  }
}

export function isImageRejection(error: unknown): error is SlackApiError {
  return error instanceof SlackApiError && !SLACK_UPLOAD_FINAL_ERRORS.has(error.code);
}

async function callSlackApi<T extends SlackApiResponse>(
  method: string,
  fields: Readonly<Record<string, string | Blob>>,
): Promise<T> {
  const form = new FormData();
  form.set("token", readApiToken());
  for (const [key, value] of Object.entries(fields)) form.set(key, value);
  const response = await fetch(new URL(`/api/${method}`, location.origin), {
    method: "POST",
    body: form,
    credentials: "include",
  });
  if (!response.ok) throw new Error(`Slack request failed (${response.status})`);
  const body = (await response.json()) as T;
  if (!body.ok) throw new SlackApiError(body.error ?? "unknown_error");
  return body;
}

export async function addEmoji(upload: EmojiUpload): Promise<void> {
  const { name, file } = upload;
  await callSlackApi("emoji.add", { name, mode: "data", image: file });
}

export async function findCustomEmojiImage(
  name: SlackEmojiName,
): Promise<SlackEmojiImageUrl | undefined> {
  const body = await callSlackApi<SlackEmojiListResponse>("emoji.list", {});
  const emoji = body.emoji ?? {};
  const value = emoji[name];
  const target = value?.startsWith(SLACK_EMOJI_ALIAS_PREFIX)
    ? emoji[value.slice(SLACK_EMOJI_ALIAS_PREFIX.length)]
    : value;
  return target as SlackEmojiImageUrl | undefined;
}
