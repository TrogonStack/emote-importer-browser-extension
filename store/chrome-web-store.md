# Chrome Web Store

Answers for each tab of the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole). The [Firefox Add-ons](firefox-add-ons.md) listing uses the same text where the two stores ask the same question.

## Package

Merging the release pull request publishes a [GitHub release](https://github.com/TrogonStack/emote-importer-browser-extension/releases) with `emote-importer-chrome-<version>.zip` attached, uploads that zip to this item, and submits it for review. Release Please sets the version, so every release is higher than the one already in the store.

The release workflow signs in as the publisher's linked service account, so nothing needs to be uploaded by hand. If the Chrome Web Store step fails, download the zip from the release and upload it from the Package tab instead. Changing the item's visibility in the dashboard requires one manual publish before the workflow can publish again.

Leave Verified CRX uploads off. Opting in requires signing every future upload with a private key that only the publisher holds.

## Store listing

- Category: Productivity, Communication
- Language: English
- Mature content: No
- Store icon: [icon-128.png](../src/assets/icons/icon-128.png)
- Screenshots: every image in [screenshots](screenshots), 1280x800
- Homepage: https://github.com/TrogonStack/emote-importer-browser-extension
- Support: https://github.com/TrogonStack/emote-importer-browser-extension/issues

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

## Privacy

### Single purpose

```text
Import 7TV and BetterTTV emotes into a Slack workspace as custom emoji, from the workspace's emoji customization page.
```

### storage justification

```text
Saves the user's settings (which emote sites to search and which Twitch channels to include) and caches the list of featured emotes for one hour so the import panel opens quickly without refetching it every time.
```

### declarativeNetRequestWithHostAccess justification

```text
The BetterTTV search API rejects requests without a BetterTTV referer. The extension adds one session rule that sets the Referer header to https://betterttv.com/ only on requests to api.betterttv.net that the extension itself initiates. No other request is modified.
```

### Host permission justification

```text
7tv.io, api.betterttv.net: search and list emotes. cdn.7tv.app, cdn.betterttv.net: download the emote images that the user chooses to import. *.slack.com/customize/emoji: the content script adds the "Import emotes" button and panel to the workspace's emoji page and uploads the chosen emote through the user's own Slack session. The extension runs nowhere else.
```

### Remote code

No. All JavaScript ships in the package. The extension only downloads emote images and JSON data.

### Data usage

Tick only **Authentication information**. Slack's own Add Custom Emoji dialog sends the page's session token in the `token` field of its `emoji.add` request, and the extension sends the same field, so it handles a credential even though the token only ever goes back to Slack.

Tick every certification:

- I do not sell or transfer user data to third parties, outside of the approved use cases
- I do not use or transfer user data for purposes that are unrelated to my item's single purpose
- I do not use or transfer user data to determine creditworthiness or for lending purposes

### Privacy policy URL

```text
https://github.com/TrogonStack/emote-importer-browser-extension/blob/main/PRIVACY.md
```

## Distribution

- Payments: Free of charge
- Visibility: Public, or Unlisted to try the store build before anyone can find it
- Regions: All regions

## Test instructions

```text
Requires a Slack workspace where you can add custom emoji. Open https://<workspace>.slack.com/customize/emoji, click "Import emotes" next to "Add Custom Emoji", and click Import on any emote. If an emote's Import button is disabled, its name is not a valid Slack emoji name; type a new one in the name field first. The emote appears in the workspace's custom emoji list.
```
