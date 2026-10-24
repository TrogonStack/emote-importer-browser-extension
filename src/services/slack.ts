import type { Brand } from "@/types/brand";
import type { SlackEmojiName } from "@/types/slack-emoji-name";
import {
  SLACK_API_TOKEN_PATTERN,
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

export async function addEmoji(upload: EmojiUpload): Promise<void> {
  const { name, file } = upload;
  const form = new FormData();
  form.set("token", readApiToken());
  form.set("name", name);
  form.set("mode", "data");
  form.set("image", file);
  const response = await fetch(new URL("/api/emoji.add", location.origin), {
    method: "POST",
    body: form,
    credentials: "include",
  });
  if (!response.ok) throw new Error(`Slack request failed (${response.status})`);
  const body = (await response.json()) as SlackApiResponse;
  if (!body.ok) throw new SlackApiError(body.error ?? "unknown_error");
}
