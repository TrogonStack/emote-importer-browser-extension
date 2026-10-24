# Firefox Add-ons

Answers for each step of submitting to [addons.mozilla.org](https://addons.mozilla.org/developers/). The [Chrome Web Store](chrome-web-store.md) listing uses the same text where the two stores ask the same question.

## Package

Build the upload and the source archive from a clean checkout of `main`:

```sh
mise install
pnpm install --frozen-lockfile
pnpm build:firefox
VERSION=$(node -p "require('./package.json').version")
(cd dist/firefox && zip -qrX ../emote-importer-firefox-$VERSION.zip .)
git archive --format=zip -o dist/emote-importer-source-$VERSION.zip HEAD
```

Upload `dist/emote-importer-firefox-<version>.zip`. Bump `version` in `package.json` before every new upload; Mozilla never accepts the same version twice.

### Compatibility

Tick Firefox only. The extension works on Slack's desktop emoji page, so Firefox for Android stays unticked.

### Validation warnings

The validator reports two "Unsafe assignment to innerHTML" warnings from React DOM, which is bundled into the extension. The extension source never uses `innerHTML` or `dangerouslySetInnerHTML`. The notes to reviewer explain this.

### Source code

Answer **Yes** to "Do You Need to Submit Source Code?", since Vite bundles the code, and upload `dist/emote-importer-source-<version>.zip`.

## Describe add-on

- Name: Emote Importer
- Summary: Search 7TV and BetterTTV emotes and install them as Slack custom emoji.
- This add-on is experimental: No
- Requires payment, non-free services or software, or additional hardware: No
- Categories: Social & Communication
- Support email: leave empty
- Support website: https://github.com/TrogonStack/emote-importer-browser-extension/issues
- License: Apache License 2.0
- This add-on has a Privacy Policy: Yes, paste the contents of [PRIVACY.md](../PRIVACY.md)

### Description

```text
Emote Importer brings Twitch emotes to your Slack workspace in one click.

It adds an "Import emotes" button to your workspace's emoji page. The panel that opens lets you browse popular 7TV and BetterTTV emotes or search for any of them. Clicking Import adds the emote as a Slack custom emoji right away, using your own Slack session, so everyone in the workspace can use it.

Slack normally makes you save each image, rename it, and upload it through a dialog, one emoji at a time. Emote Importer skips those steps, so a workspace can adopt the emotes its people already know from Twitch without the busywork.

How to use it:
1. Open your workspace's emoji page (https://<workspace>.slack.com/customize/emoji).
2. Click "Import emotes" next to "Add Custom Emoji".
3. Browse or search, pick the 7TV or BetterTTV tab, adjust the Slack name if you want, and click Import.

In the extension popup you can choose which sites to search and add Twitch channels by numeric user ID, so their emotes appear first.

You need permission to add custom emoji in your workspace. The extension talks only to Slack, 7TV, and BetterTTV. It collects no data and sends nothing anywhere else.

Emote Importer is not created by, affiliated with, or supported by Slack Technologies, LLC, 7TV, or BetterTTV. Emotes belong to their respective creators.

Source code: https://github.com/TrogonStack/emote-importer-browser-extension
```

### Notes to reviewer

```text
Build steps (source: https://github.com/TrogonStack/emote-importer-browser-extension):
1. Install mise (https://mise.jdx.dev), which pins Node and pnpm.
2. mise install && pnpm install --frozen-lockfile
3. pnpm build:firefox
Output: dist/firefox

The two "Unsafe assignment to innerHTML" warnings are inside React DOM (react-dom 19), bundled in assets/text-input-*.js. The extension source never uses innerHTML or dangerouslySetInnerHTML.

Testing requires a Slack workspace where you can add custom emoji. Open https://<workspace>.slack.com/customize/emoji, click "Import emotes" next to "Add Custom Emoji", and click Import on any emote. If an emote's Import button is disabled, its name is not a valid Slack emoji name; type a new one in the name field first. The emote appears in the workspace's custom emoji list.
```

## Data collection

The manifest declares `data_collection_permissions` as `none`. Mozilla counts data as collected when it leaves the extension for the developer or a third party, and the Slack session token only goes back to the same Slack workspace that issued it. If a reviewer reads it differently, declare `authenticationInfo` in `manifest.config.ts` instead.

## Manage listing

The submission flow does not ask for images, so add them afterwards from Manage Listing:

- Icon: [icon-128.png](../src/assets/icons/icon-128.png)
- Screenshots: every image in [screenshots](screenshots)

From Edit version, add release notes for each version.
