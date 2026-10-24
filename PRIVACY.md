# Privacy Policy

Emote Importer collects no personal data and sends nothing to its authors or to any analytics, advertising, or tracking service.

## Slack session token

To add a custom emoji, the extension reads your Slack session token from the workspace's emoji page and sends it to that same Slack workspace with the upload request, the same way Slack's own Add Custom Emoji dialog does. The token is held in memory only for that request. It is never stored, logged, or sent anywhere else.

## Stored data

- Your settings, which emote sites to search and which Twitch channel IDs to include, are saved in your browser's extension storage and synced by your browser if you have sync turned on.
- The list of featured emotes is cached in local extension storage for one hour.

Neither leaves your browser except through your browser's own sync.

## Network requests

The extension only talks to:

- Your Slack workspace, to add the emoji you choose.
- 7TV (`7tv.io`, `cdn.7tv.app`) and BetterTTV (`api.betterttv.net`, `cdn.betterttv.net`), to search emotes and download the images you import.

Requests to these services are subject to their own privacy policies.

## Contact

Questions or concerns: https://github.com/TrogonStack/emote-importer-browser-extension/issues
