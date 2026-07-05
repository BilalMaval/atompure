import { type HTMLAttributes } from "react";
import { clsx } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-beige-200 bg-cream-50 p-6 shadow-sm",
        className
      )}
      {...props}
    />
  );
}
