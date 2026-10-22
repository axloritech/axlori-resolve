"use client";

import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useState, type InputHTMLAttributes } from "react";

import { cx } from "@/lib/utils";

/**
 * Password field with an accessible show/hide toggle.
 * Forwards refs so it plugs directly into React Hook Form's register().
 */
const PasswordInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function PasswordInput({ className, id, ...rest }, ref) {
    const [visible, setVisible] = useState(false);

    return (
      <div className="relative">
        <input
          id={id}
          ref={ref}
          type={visible ? "text" : "password"}
          autoComplete={rest.autoComplete ?? "current-password"}
          className={cx(
            "h-10 w-full rounded-lg border border-line bg-card px-3 pr-10 text-sm text-ink placeholder:text-muted/70 transition-colors hover:border-slate-300 focus:border-primary disabled:cursor-not-allowed disabled:bg-page",
            className
          )}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          aria-controls={id}
          className="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg p-2 text-muted transition-colors hover:bg-page hover:text-ink"
        >
          {visible ? <EyeOff aria-hidden className="h-4 w-4" /> : <Eye aria-hidden className="h-4 w-4" />}
        </button>
      </div>
    );
  }
);

export default PasswordInput;
