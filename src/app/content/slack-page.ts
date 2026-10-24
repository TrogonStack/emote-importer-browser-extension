import { addEmoji, type EmojiUpload } from "@/services/slack";
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
