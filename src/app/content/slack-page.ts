import { addEmoji, isImageRejection, type EmojiUpload } from "@/services/slack";
import type { Emote } from "@/types/emote";
import type { SlackEmojiName } from "@/types/slack-emoji-name";
import { fetchEmoteFiles } from "./emote-file";
import { waitFor } from "@/helpers/wait-for";
import { SLACK_ACTIVE_SORT_HEADER_SELECTOR } from "@/constants/slack";

export function findOpenDialogButton(): HTMLButtonElement | undefined {
  return [...document.querySelectorAll("button")].find((button) =>
    /add custom emoji/i.test(button.textContent ?? ""),
  );
}

function sortDirection(header: Element): string | null | undefined {
  return header.querySelector('[type^="arrow-"]')?.getAttribute("type");
}

async function toggleSort(): Promise<void> {
  const header = document.querySelector<HTMLElement>(SLACK_ACTIVE_SORT_HEADER_SELECTOR);
  if (!header) return;
  const before = sortDirection(header);
  header.click();
  await waitFor(() => {
    const current = document.querySelector(SLACK_ACTIVE_SORT_HEADER_SELECTOR) ?? undefined;
    return current && sortDirection(current) !== before ? current : undefined;
  }, "the emoji list to re-sort");
}

async function refreshEmojiList(): Promise<void> {
  await toggleSort();
  await toggleSort();
}

let inFlight = 0;
let importedSinceRefresh = false;

export async function importEmoji(upload: EmojiUpload): Promise<void> {
  inFlight++;
  try {
    await addEmoji(upload);
    importedSinceRefresh = true;
  } finally {
    inFlight--;
    if (inFlight === 0 && importedSinceRefresh) {
      importedSinceRefresh = false;
      void refreshEmojiList().catch(() => undefined);
    }
  }
}

export async function importEmote(emote: Emote, name: SlackEmojiName): Promise<void> {
  let rejection: unknown = new Error("Emote has no uploadable image");
  for await (const file of fetchEmoteFiles(emote, name)) {
    try {
      await importEmoji({ name, file });
      return;
    } catch (error) {
      if (!isImageRejection(error)) throw error;
      rejection = error;
    }
  }
  throw rejection;
}
