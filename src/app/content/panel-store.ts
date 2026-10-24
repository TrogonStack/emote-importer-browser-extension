type Listener = () => void;

let open = false;
const listeners = new Set<Listener>();

export const importPanel = {
  isOpen: (): boolean => open,
  setOpen: (next: boolean): void => {
    open = next;
    for (const listener of listeners) listener();
  },
  subscribe: (listener: Listener): (() => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
