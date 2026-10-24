import { useEffect, useRef, useState } from "react";

import type { Emote } from "@/types/emote";
import { loadPreviewObjectUrl } from "./emote-file";

type Props = {
  readonly emote: Emote;
};

export function EmotePreview(props: Props) {
  const { emote } = props;
  const ref = useRef<HTMLDivElement>(null);
  const [src, setSrc] = useState<string>();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let cancelled = false;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      void loadPreviewObjectUrl(emote.previewUrl).then((url) => {
        if (!cancelled) setSrc(url);
      });
    });
    observer.observe(element);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [emote.previewUrl]);

  return (
    <div ref={ref} className="flex h-12 w-full items-center justify-center">
      {src && <img src={src} alt={emote.code} className="max-h-full max-w-full object-contain" />}
    </div>
  );
}
