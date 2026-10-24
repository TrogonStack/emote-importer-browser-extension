# Store listing

Text and settings for the Chrome Web Store and Firefox Add-ons listings. Screenshots live in [screenshots](screenshots). The store icon is [icon-128.png](../src/assets/icons/icon-128.png).

## Category

- Chrome Web Store: Productivity, Communication
- Language: English
- Mature content: No

## URLs

- Homepage: https://github.com/TrogonStack/emote-importer-browser-extension
- Support: https://github.com/TrogonStack/emote-importer-browser-extension/issues
- Privacy policy: https://github.com/TrogonStack/emote-importer-browser-extension/blob/main/PRIVACY.md

## Description

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
