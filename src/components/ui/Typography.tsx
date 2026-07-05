import { type HTMLAttributes } from "react";
import { clsx } from "@/lib/utils";

type HeadingLevel = 1 | 2 | 3 | 4;

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: HeadingLevel;
}

const headingSizes: Record<HeadingLevel, string> = {
  1: "text-4xl sm:text-5xl lg:text-6xl",
  2: "text-3xl sm:text-4xl",
  3: "text-2xl sm:text-3xl",
  4: "text-xl sm:text-2xl",
};

export function Heading({ level = 2, className, ...props }: HeadingProps) {
  const Tag = `h${level}` as const;
  return (
    <Tag
      className={clsx(
        "font-display font-medium tracking-tight text-charcoal-900",
        headingSizes[level],
        className
      )}
      {...props}
    />
  );
}

export function Text({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={clsx("text-base text-charcoal-600 leading-relaxed", className)}
      {...props}
    />
  );
}
