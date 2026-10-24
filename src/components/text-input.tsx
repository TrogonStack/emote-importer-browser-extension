import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement>;

export function TextInput(props: Props) {
  const { className = "", ...rest } = props;
  return (
    <input
      className={`min-w-0 rounded-md border border-zinc-300 bg-transparent px-2 py-1.5 outline-none focus:border-emerald-600 aria-invalid:border-rose-600 dark:border-zinc-700 dark:aria-invalid:border-rose-400 ${className}`}
      {...rest}
    />
  );
}
