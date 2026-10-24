import { TOAST_LIFETIME_MS } from "@/app/content/constants/timing";

type Listener = () => void;

export type Toast = {
  readonly id: number;
  readonly message: string;
};

let toasts: readonly Toast[] = [];
let nextId = 0;
const listeners = new Set<Listener>();

function publish(next: readonly Toast[]): void {
  toasts = next;
  for (const listener of listeners) listener();
}

function dismiss(id: number): void {
  return publish(toasts.filter((toast) => toast.id !== id));
}

export const toastStore = {
  current: (): readonly Toast[] => toasts,
  show: (message: string): void => {
    const id = nextId++;
    publish([...toasts, { id, message }]);
    setTimeout(() => dismiss(id), TOAST_LIFETIME_MS);
  },
  dismiss,
  subscribe: (listener: Listener): (() => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
