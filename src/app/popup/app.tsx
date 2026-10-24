import { type FormEvent, useEffect, useState } from "react";

import { EMOTE_PROVIDERS, EMOTE_PROVIDER_LABELS } from "@/constants/emote";
import { parseTwitchUserId } from "@/helpers/emote";
import { sendRequest } from "@/helpers/messages";
import type { Settings } from "@/types/settings";
import { loadSettings, saveSettings } from "@/storages/sync/settings";
import { Button } from "@/components/button";
import { TextInput } from "@/components/text-input";

export function App() {
  const [settings, setSettings] = useState<Settings>();
  const [emoteCount, setEmoteCount] = useState<number>();
  const [channelInput, setChannelInput] = useState("");

  useEffect(() => {
    void loadSettings().then(setSettings);
    void sendRequest({ type: "emotes/get" }).then((r) => setEmoteCount(r.emotes.length));
  }, []);

  if (!settings) return <p className="p-4">Loading…</p>;

  function update(next: Settings) {
    setSettings(next);
    void saveSettings(next);
  }

  function addChannel(event: FormEvent, current: Settings) {
    event.preventDefault();
    const id = parseTwitchUserId(channelInput);
    if (!id || current.twitchChannels.includes(id)) return;
    update({ ...current, twitchChannels: [...current.twitchChannels, id] });
    setChannelInput("");
  }

  async function refresh() {
    setEmoteCount(undefined);
    const response = await sendRequest({ type: "emotes/refresh" });
    setEmoteCount(response.emotes.length);
  }

  return (
    <main className="flex flex-col gap-3 p-4">
      <h1 className="text-lg font-semibold">Emote Importer</h1>

      <fieldset className="flex flex-col gap-2 rounded-lg border border-zinc-300 p-3 dark:border-zinc-700">
        <legend className="px-1 font-medium">Search sites</legend>
        {EMOTE_PROVIDERS.map((id) => (
          <label key={id} className="flex items-center gap-2">
            <input
              type="checkbox"
              className="accent-emerald-700"
              checked={settings.providers[id]}
              onChange={(e) =>
                update({
                  ...settings,
                  providers: { ...settings.providers, [id]: e.target.checked },
                })
              }
            />
            {EMOTE_PROVIDER_LABELS[id]}
          </label>
        ))}
      </fieldset>

      <fieldset className="flex flex-col gap-2 rounded-lg border border-zinc-300 p-3 dark:border-zinc-700">
        <legend className="px-1 font-medium">Twitch channels (user ID)</legend>
        <form onSubmit={(event) => addChannel(event, settings)} className="flex items-center gap-2">
          <TextInput
            className="flex-1"
            value={channelInput}
            onChange={(e) => setChannelInput(e.target.value)}
            inputMode="numeric"
            placeholder="e.g. 71092938"
          />
          <Button type="submit">Add</Button>
        </form>
        <ul className="flex flex-col gap-1">
          {settings.twitchChannels.map((id) => (
            <li key={id} className="flex items-center gap-2">
              <code className="flex-1">{id}</code>
              <Button
                variant="ghost"
                onClick={() =>
                  update({
                    ...settings,
                    twitchChannels: settings.twitchChannels.filter((c) => c !== id),
                  })
                }
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      </fieldset>

      <footer className="flex items-center justify-between gap-2">
        <span className="text-zinc-600 dark:text-zinc-400">
          {emoteCount === undefined ? "Loading emotes…" : `${emoteCount} emotes loaded`}
        </span>
        <Button variant="ghost" onClick={() => void refresh()}>
          Refresh
        </Button>
      </footer>
    </main>
  );
}
