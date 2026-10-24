# Contributing

## Set up

```sh
mise install
pnpm install
pnpm dev
```

Open `chrome://extensions`, enable Developer mode, choose **Load unpacked**, and select `dist/chrome/`. While `pnpm dev` runs, the popup and content script reload as you edit.

For Firefox, run `pnpm build:firefox`, open `about:debugging#/runtime/this-firefox`, choose **Load Temporary Add-on**, and select `dist/firefox/manifest.json`.

## Scripts

| Script               | Purpose                                   |
| -------------------- | ----------------------------------------- |
| `pnpm build`         | Type-check and build for Chrome           |
| `pnpm build:firefox` | Type-check and build for Firefox          |
| `pnpm check`         | Format check, lint, type-check, and tests |
| `pnpm fmt`           | Format with oxfmt                         |
| `pnpm lint`          | Lint with oxlint                          |
| `pnpm test`          | Run unit tests with vitest                |

Run `pnpm check` before opening a pull request; CI runs the same checks and both builds.

## Layout

The repository follows the Straw Hat [NodeJS directory structure](https://github.com/straw-hat-team/adr/tree/master/src/adrs/0541531435) and [React files and directories](https://github.com/straw-hat-team/adr/tree/master/src/adrs/5541831634) conventions.

- `src/app/background` service worker that searches and pages through emotes from each site and caches the featured set
- `src/app/content` import panel on Slack's emoji page that adds emoji through the workspace's own session
- `src/app/popup` settings popup
- `src/components` reusable React components
- `src/services` clients for 7TV, BetterTTV, and Slack
- `src/storages` extension storage, by storage area
- `src/types`, `src/constants`, `src/helpers`, `src/styles` shared code
- `tests/vitest` unit tests
- `store` listing text and images for the [Chrome Web Store](store/chrome-web-store.md) and [Firefox Add-ons](store/firefox-add-ons.md)
- `.config/mise/tasks` tasks that CI runs through `mise run`

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/), for example `fix(content): keep search results when switching tabs`, and sign off every commit with `git commit -s` to certify the [Developer Certificate of Origin](https://developercertificate.org/).
