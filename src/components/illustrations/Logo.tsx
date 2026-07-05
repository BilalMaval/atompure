import Image from "next/image";
import { clsx } from "@/lib/utils";

export function Logo({
  className,
  compact = false,
  invert = false,
  large = false,
  small = false,
}: {
  className?: string;
  compact?: boolean;
  invert?: boolean;
  large?: boolean;
  small?: boolean;
}) {
  const mark = (
    <Image
      src="/logo-mark.png"
      alt="Atom Pure"
      width={64}
      height={64}
      className={clsx(
        "h-11 w-11 flex-shrink-0 object-contain",
        small && "h-[42px] w-[42px]",
        large && "h-16 w-16",
        invert && "invert"
      )}
    />
  );

  if (compact) {
    return <span className={className}>{mark}</span>;
  }

  return (
    <div className={clsx("flex items-center gap-2.5", className)}>
      {mark}
      <span className="flex flex-col items-center leading-none">
        <span className={clsx("font-display tracking-tight", large ? "text-2xl" : "text-xl")}>
          ATOM
        </span>
        <span
          className={clsx(
            "-mt-0.5 font-medium tracking-[0.3em]",
            large ? "text-sm" : "text-xs"
          )}
        >
          PURE
        </span>
      </span>
    </div>
  );
}
