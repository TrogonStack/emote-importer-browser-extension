import { useEffect, useState } from "react";

import type { Emote } from "@/types/emote";
import type { SlackEmojiName } from "@/types/slack-emoji-name";
import { parseSlackEmojiName, slackEmojiNameFromEmoteCode } from "@/helpers/slack-emoji-name";
import { Button } from "@/components/button";
import { TextInput } from "@/components/text-input";
import { EmotePreview } from "./emote-preview";
import { importEmote as importEmoteAsEmoji } from "./slack-page";
import { toastStore } from "./toast-store";
import { IMPORTED_NOTICE_MS } from "@/app/content/constants/timing";

type ImportStatus =
  | { kind: "idle" }
  | { kind: "importing" }
  | { kind: "imported"; name: SlackEmojiName }
  | { kind: "failed" };

type Props = {
  readonly emote: Emote;
  readonly providerLabel: string;
};

export function EmoteTile(props: Props) {
  const { emote, providerLabel } = props;
  const [nameInput, setNameInput] = useState(() => slackEmojiNameFromEmoteCode(emote.code) ?? "");
  const [status, setStatus] = useState<ImportStatus>({ kind: "idle" });
  const name = parseSlackEmojiName(nameInput);

  useEffect(() => {
    if (status.kind !== "imported") return;
    const timer = setTimeout(() => setStatus({ kind: "idle" }), IMPORTED_NOTICE_MS);
    return () => clearTimeout(timer);
  }, [status]);

  async function importEmote() {
    if (!name) return;
    setStatus({ kind: "importing" });
    try {
      await importEmoteAsEmoji(emote, name);
      setStatus({ kind: "imported", name });
    } catch (error) {
      setStatus({ kind: "failed" });
      toastStore.show(`:${name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return (
    <li
      className={`flex flex-col items-center gap-1 rounded-lg border p-2 text-center ${
        status.kind === "imported"
          ? "border-emerald-600"
          : status.kind === "failed"
            ? "border-rose-600 dark:border-rose-400"
            : "border-zinc-300 dark:border-zinc-700"
      }`}
    >
      <EmotePreview emote={emote} />
      <span
        className="max-w-full truncate font-semibold"
        title={`${emote.code} (${providerLabel})`}
      >
        {emote.code}
      </span>
      <span className="text-[11px] text-zinc-600 dark:text-zinc-400">{providerLabel}</span>
      <TextInput
        className="w-full"
        value={nameInput}
        onChange={(e) => setNameInput(e.target.value)}
        aria-label={`Slack name for ${emote.code}`}
        aria-invalid={!name}
        disabled={status.kind === "importing"}
      />
      {status.kind === "imported" ? (
        <span className="text-xs text-emerald-700 dark:text-emerald-400">
          Imported :{status.name}:
        </span>
      ) : (
        <Button onClick={() => void importEmote()} disabled={!name || status.kind === "importing"}>
          {status.kind === "importing" ? "Importing…" : "Import"}
        </Button>
      )}
    </li>
  );
}
