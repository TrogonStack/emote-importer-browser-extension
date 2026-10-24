import type { Variant } from "@/types/button";

export const BUTTON_VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "border-emerald-700 bg-emerald-700 text-white hover:bg-emerald-800 dark:border-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500",
  outline:
    "border-zinc-400 bg-transparent font-bold hover:bg-zinc-100 dark:border-zinc-500 dark:hover:bg-zinc-800",
  ghost: "border-transparent bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800",
};
