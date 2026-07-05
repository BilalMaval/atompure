import { type HTMLAttributes } from "react";
import { clsx } from "@/lib/utils";

export function Container({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx("mx-auto w-full max-w-[1920px] px-4 sm:px-8 lg:px-12", className)}
      {...props}
    />
  );
}
