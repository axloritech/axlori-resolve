import { cx } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

export function buttonClasses(variant: Variant = "primary", size: Size = "md", full = false): string {
  return cx(
    "inline-flex select-none items-center justify-center gap-2 rounded-lg border font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
    size === "sm" && "h-9 px-3 text-sm",
    size === "md" && "h-10 px-4 text-sm",
    size === "lg" && "h-12 px-5 text-base",
    full && "w-full",
    variant === "primary" && "border-primary bg-primary text-white hover:bg-primary-hover active:bg-primary-active",
    variant === "secondary" && "border-line bg-card text-ink hover:bg-page",
    variant === "ghost" && "border-transparent bg-transparent text-ink hover:bg-page",
    variant === "danger" && "border-danger bg-danger text-white hover:bg-red-800"
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  full?: boolean;
  children: ReactNode;
}

export default function Button({ variant = "primary", size = "md", full, className, children, ...rest }: ButtonProps) {
  return (
    <button className={cx(buttonClasses(variant, size, full), className)} {...rest}>
      {children}
    </button>
  );
}
