import type { ButtonHTMLAttributes } from "react";

import { BUTTON_VARIANT_CLASSES } from "@/constants/button";
import type { Variant } from "@/types/button";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  readonly variant?: Variant;
};

export function Button(props: Props) {
  const { variant = "primary", className = "", type = "button", ...rest } = props;
  return (
    <button
      type={type}
      className={`cursor-pointer rounded-md border px-2.5 py-1 disabled:cursor-default disabled:opacity-50 ${BUTTON_VARIANT_CLASSES[variant]} ${className}`}
      {...rest}
    />
  );
}
