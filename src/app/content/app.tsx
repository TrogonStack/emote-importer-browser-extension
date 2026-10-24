import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

import {
  type Emote,
  type EmotePageCursor,
  type EmoteProviderId,
  type EmoteSearchQuery,
} from "@/types/emote";
import {
  EMOTE_PROVIDERS,
  EMOTE_PROVIDER_LABELS,
  EMOTE_SEARCH_QUERY_MIN_LENGTH,
} from "@/constants/emote";
import { NAMESPACE } from "@/constants/namespace";
import { emoteKey, parseEmoteSearchQuery } from "@/helpers/emote";
import { onEmoteCacheChanged } from "@/storages/local/emote-cache";
import { sendRequest } from "@/helpers/messages";
import { loadSettings } from "@/storages/sync/settings";
import { Button } from "@/components/button";
import { TextInput } from "@/components/text-input";
import { EmoteTile } from "./emote-tile";
import { importPanel } from "./panel-store";
import { toastStore } from "./toast-store";
import { LOAD_MORE_THRESHOLD_PX } from "@/app/content/constants/layout";
import { SEARCH_DEBOUNCE_MS } from "@/app/content/constants/timing";

type PagedEmotes = {
  readonly query: EmoteSearchQuery | undefined;
  readonly emotes: readonly Emote[];
  readonly nextCursor: EmotePageCursor | undefined;
  readonly loadingMore: boolean;
  readonly error: string | undefined;
};

type PagedState =
  | { kind: "loading" }
  | { kind: "done"; results: PagedEmotes; loadMore: () => void };

function appendUnique(current: readonly Emote[], next: readonly Emote[]): Emote[] {
  const seen = new Set(current.map(emoteKey));
  return [...current, ...next.filter((emote) => !seen.has(emoteKey(emote)))];
}

function useEnabledProviders(): readonly EmoteProviderId[] {
  const [providers, setProviders] = useState<readonly EmoteProviderId[]>(EMOTE_PROVIDERS);
  useEffect(() => {
    void loadSettings().then((settings) =>
      setProviders(EMOTE_PROVIDERS.filter((provider) => settings.providers[provider])),
    );
  }, []);
  return providers;
}

function useFeaturedEmotes(): readonly Emote[] {
  const [emotes, setEmotes] = useState<readonly Emote[]>([]);
  useEffect(() => {
    void sendRequest({ type: "emotes/get" }).then((r) => setEmotes(r.emotes));
    return onEmoteCacheChanged((cache) => setEmotes(cache.emotes));
  }, []);
  return emotes;
}

type PagedEmotesProps = {
  readonly provider: EmoteProviderId;
  readonly query: EmoteSearchQuery | undefined;
};

function usePagedEmotes(props: PagedEmotesProps): PagedState {
  const { provider, query } = props;
  const [results, setResults] = useState<PagedEmotes>();

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(
      () => {
        sendRequest({ type: "emotes/page", provider, query, cursor: undefined }).then(
          (page) => {
            if (cancelled) return;
            setResults({
              query,
              emotes: page.emotes,
              nextCursor: page.nextCursor,
              loadingMore: false,
              error: undefined,
            });
          },
          (error: unknown) => {
            if (cancelled) return;
            setResults({
              query,
              emotes: [],
              nextCursor: undefined,
              loadingMore: false,
              error: String(error),
            });
          },
        );
      },
      query ? SEARCH_DEBOUNCE_MS : 0,
    );
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [provider, query]);

  const loadMore = useCallback(() => {
    if (!results?.nextCursor || results.loadingMore) return;
    const { query: resultsQuery, nextCursor: cursor } = results;
    function update(change: (current: PagedEmotes) => PagedEmotes) {
      return setResults((current) =>
        current && current.query === resultsQuery ? change(current) : current,
      );
    }
    update((current) => ({ ...current, loadingMore: true, error: undefined }));
    sendRequest({ type: "emotes/page", provider, query: resultsQuery, cursor }).then(
      (page) =>
        update((current) => ({
          ...current,
          emotes: appendUnique(current.emotes, page.emotes),
          nextCursor: page.nextCursor,
          loadingMore: false,
        })),
      (error: unknown) =>
        update((current) => ({ ...current, loadingMore: false, error: String(error) })),
    );
  }, [provider, results]);

  if (!results || results.query !== query) return { kind: "loading" };
  return { kind: "done", results, loadMore };
}

function useImportPanelOpen(): boolean {
  return useSyncExternalStore(importPanel.subscribe, importPanel.isOpen);
}

function useCloseOnEscape(props: { readonly active: boolean }): void {
  const { active } = props;
  useEffect(() => {
    if (!active) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      importPanel.setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [active]);
}

export function ImportButton() {
  return (
    <Button
      variant="outline"
      className="h-9 rounded-lg px-3 text-[15px]"
      aria-haspopup="dialog"
      onClick={() => importPanel.setOpen(true)}
    >
      Import emotes
    </Button>
  );
}

function Toasts() {
  const toasts = useSyncExternalStore(toastStore.subscribe, toastStore.current);
  if (toasts.length === 0) return null;
  return (
    <ol
      aria-live="polite"
      className="pointer-events-none absolute inset-x-0 bottom-4 flex flex-col items-center gap-2 px-4"
    >
      {toasts.map((toast) => (
        <li key={toast.id} role="alert" className="pointer-events-auto max-w-full">
          <button
            type="button"
            title="Click to dismiss"
            className="flex cursor-pointer items-start gap-2 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-left text-rose-950 shadow-lg motion-safe:animate-shake hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-50 dark:hover:bg-rose-900"
            onClick={() => toastStore.dismiss(toast.id)}
          >
            <span aria-hidden="true" className="font-bold text-rose-700 dark:text-rose-300">
              ⚠
            </span>
            <span>
              <strong>Import failed.</strong> {toast.message}
            </span>
            <span aria-hidden="true" className="text-rose-700 dark:text-rose-300">
              ✕
            </span>
          </button>
        </li>
      ))}
    </ol>
  );
}

function isNearBottom(element: Element): boolean {
  return (
    element.clientHeight > 0 &&
    element.scrollHeight - element.scrollTop - element.clientHeight <= LOAD_MORE_THRESHOLD_PX
  );
}

type LoadMoreOnScrollProps = {
  readonly list: HTMLElement | null;
  readonly onLoadMore: (() => void) | undefined;
};

function watchNearBottom(list: HTMLElement, onLoadMore: () => void): () => void {
  function check() {
    if (isNearBottom(list)) onLoadMore();
  }
  check();
  list.addEventListener("scroll", check, { passive: true });
  return () => list.removeEventListener("scroll", check);
}

function useLoadMoreOnScroll(props: LoadMoreOnScrollProps) {
  const { list, onLoadMore } = props;
  useEffect(() => {
    if (!list || !onLoadMore) return;
    return watchNearBottom(list, onLoadMore);
  }, [list, onLoadMore]);
}

function statusText(
  paged: PagedState,
  query: EmoteSearchQuery | undefined,
  input: string,
  provider: EmoteProviderId,
): string {
  if (!query && input.trim()) {
    return `${EMOTE_PROVIDER_LABELS[provider]} needs at least ${EMOTE_SEARCH_QUERY_MIN_LENGTH[provider]} characters to search`;
  }
  if (!query) return `Popular on ${EMOTE_PROVIDER_LABELS[provider]}`;
  if (paged.kind === "loading") return "Searching…";
  const { emotes, nextCursor } = paged.results;
  return `${emotes.length}${nextCursor ? "+" : ""} results`;
}

type ProviderResultsProps = {
  readonly provider: EmoteProviderId;
  readonly input: string;
  readonly featuredEmotes: readonly Emote[];
  readonly active: boolean;
};

function ProviderResults(props: ProviderResultsProps) {
  const { provider, input, featuredEmotes, active } = props;
  const query = parseEmoteSearchQuery(input, provider);
  const paged = usePagedEmotes({ provider, query });
  const [list, setList] = useState<HTMLUListElement | null>(null);
  const results = paged.kind === "done" ? paged.results : undefined;
  const loaded = results?.emotes ?? [];
  const emotes = query
    ? loaded
    : appendUnique(
        featuredEmotes.filter((emote) => emote.provider === provider),
        loaded,
      );
  const canLoadMore = active && results?.nextCursor !== undefined && !results.error;
  useLoadMoreOnScroll({
    list,
    onLoadMore: paged.kind === "done" && canLoadMore ? paged.loadMore : undefined,
  });

  return (
    <div
      role="tabpanel"
      id={`${NAMESPACE}-panel-${provider}`}
      aria-labelledby={`${NAMESPACE}-tab-${provider}`}
      className={active ? "flex min-h-0 flex-1 flex-col gap-3" : "hidden"}
    >
      <p className="text-zinc-600 dark:text-zinc-400">
        {statusText(paged, query, input, provider)}
      </p>
      <ul
        ref={setList}
        className="grid grid-cols-[repeat(auto-fill,minmax(136px,1fr))] gap-2 overflow-y-auto"
      >
        {emotes.map((emote) => (
          <EmoteTile
            key={emoteKey(emote)}
            emote={emote}
            providerLabel={EMOTE_PROVIDER_LABELS[emote.provider]}
          />
        ))}
      </ul>
      {results?.loadingMore && (
        <p className="text-center text-zinc-600 dark:text-zinc-400">Loading more…</p>
      )}
      {paged.kind === "done" && results?.error && (
        <p className="flex items-center justify-center gap-2 text-xs text-rose-700 dark:text-rose-300">
          {results.error}
          {results.nextCursor && (
            <Button variant="outline" onClick={paged.loadMore}>
              Try again
            </Button>
          )}
        </p>
      )}
    </div>
  );
}

function ImportPanel() {
  const [input, setInput] = useState("");
  const providers = useEnabledProviders();
  const [selected, setSelected] = useState<EmoteProviderId>();
  const featuredEmotes = useFeaturedEmotes();
  const active = selected && providers.includes(selected) ? selected : providers[0];

  return (
    <section
      role="dialog"
      aria-modal="true"
      aria-label="Import 7TV and BetterTTV emotes"
      className="relative flex h-[min(720px,calc(100vh-48px))] w-[min(720px,calc(100vw-48px))] flex-col gap-3 rounded-xl border border-zinc-300 bg-white p-5 text-zinc-900 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      onClick={(event) => event.stopPropagation()}
    >
      <header className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold">Import emotes</h2>
        <Button variant="ghost" onClick={() => importPanel.setOpen(false)} aria-label="Close">
          ✕
        </Button>
      </header>
      <TextInput
        type="search"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Search emotes"
        autoFocus
      />
      <div role="tablist" className="flex gap-1 border-b border-zinc-300 dark:border-zinc-700">
        {providers.map((provider) => (
          <button
            key={provider}
            type="button"
            role="tab"
            id={`${NAMESPACE}-tab-${provider}`}
            aria-controls={`${NAMESPACE}-panel-${provider}`}
            aria-selected={provider === active}
            className={`-mb-px cursor-pointer border-b-2 px-3 py-1.5 font-bold ${
              provider === active
                ? "border-emerald-700 text-zinc-900 dark:border-emerald-500 dark:text-zinc-100"
                : "border-transparent text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
            onClick={() => setSelected(provider)}
          >
            {EMOTE_PROVIDER_LABELS[provider]}
          </button>
        ))}
      </div>
      {providers.map((provider) => (
        <ProviderResults
          key={provider}
          provider={provider}
          input={input}
          featuredEmotes={featuredEmotes}
          active={provider === active}
        />
      ))}
      <Toasts />
    </section>
  );
}

export function ImportDialog() {
  const open = useImportPanelOpen();
  useCloseOnEscape({ active: open });
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/40"
      onClick={() => importPanel.setOpen(false)}
    >
      <ImportPanel />
    </div>
  );
}
