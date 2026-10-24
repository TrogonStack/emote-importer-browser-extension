export function waitFor<T>(
  probe: () => T | undefined,
  description: string,
  timeoutMs = 10_000,
): Promise<T> {
  return new Promise((resolve, reject) => {
    let observer: MutationObserver | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    function settle(): boolean {
      const value = probe();
      if (value === undefined) return false;
      observer?.disconnect();
      clearTimeout(timer);
      resolve(value);
      return true;
    }
    if (settle()) return;
    observer = new MutationObserver(settle);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    timer = setTimeout(() => {
      observer?.disconnect();
      reject(new Error(`Timed out waiting for ${description}`));
    }, timeoutMs);
  });
}
