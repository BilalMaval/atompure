import { type HTMLAttributes } from "react";
import { clsx } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full bg-sage-100 px-3 py-1 text-xs font-medium text-sage-700",
        className
      )}
      {...props}
    />
  );
}
