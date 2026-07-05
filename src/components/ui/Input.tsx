import { type InputHTMLAttributes, forwardRef } from "react";
import { clsx } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={clsx(
        "h-11 w-full rounded-lg border border-beige-300 bg-cream-50 px-4 text-sm text-charcoal-800 placeholder:text-charcoal-400 focus:border-sage-500 focus:outline-none",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
