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

async function fetchLargestFittingBlob(candidates: readonly EmoteImageUrl[]): Promise<Blob> {
  const blobs = (await Promise.all(candidates.map(fetchImageBlob))).toSorted(
    (a, b) => b.size - a.size,
  );
  const picked = blobs.find((blob) => blob.size <= MAX_SLACK_UPLOAD_BYTES) ?? blobs.at(-1);
  if (!picked) throw new Error("Emote has no uploadable image");
  return picked;
}

export async function fetchEmoteFile(emote: Emote, name: SlackEmojiName): Promise<File> {
  const blob = await fetchLargestFittingBlob(emote.uploadCandidates);
  return new File([blob], `${name}.${EMOTE_FILE_EXTENSIONS[blob.type] ?? "png"}`, {
    type: blob.type,
  });
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
