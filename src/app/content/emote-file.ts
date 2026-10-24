import { MAX_SLACK_UPLOAD_BYTES } from "@/constants/slack";
import type { Emote, EmoteImageUrl } from "@/types/emote";
import { sendRequest } from "@/helpers/messages";
import type { SlackEmojiName } from "@/types/slack-emoji-name";
import { EMOTE_FILE_EXTENSIONS } from "@/constants/emote";

async function fetchImageBlob(url: EmoteImageUrl): Promise<Blob> {
  const { mimeType, base64 } = await sendRequest({ type: "emote/image", url });
  const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
  return new Blob([bytes], { type: mimeType });
}

function toFile(blob: Blob, name: SlackEmojiName): File {
  return new File([blob], `${name}.${EMOTE_FILE_EXTENSIONS[blob.type] ?? "png"}`, {
    type: blob.type,
  });
}

export async function* fetchEmoteFiles(emote: Emote, name: SlackEmojiName): AsyncGenerator<File> {
  let smallest: Blob | undefined;
  let yielded = false;
  for (const url of emote.uploadCandidates) {
    const blob = await fetchImageBlob(url);
    if (blob.size <= MAX_SLACK_UPLOAD_BYTES) {
      yielded = true;
      yield toFile(blob, name);
    } else if (!smallest || blob.size < smallest.size) {
      smallest = blob;
    }
  }
  if (!yielded && smallest) yield toFile(smallest, name);
}

const previewObjectUrls = new Map<EmoteImageUrl, Promise<string>>();

export function loadPreviewObjectUrl(url: EmoteImageUrl): Promise<string> {
  let objectUrl = previewObjectUrls.get(url);
  if (!objectUrl) {
    objectUrl = fetchImageBlob(url).then((blob) => URL.createObjectURL(blob));
    objectUrl.catch(() => previewObjectUrls.delete(url));
    previewObjectUrls.set(url, objectUrl);
  }
  return objectUrl;
}
