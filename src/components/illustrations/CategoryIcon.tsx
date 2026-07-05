type CategoryIconVariant = "oil" | "oral" | "kitchen";

export function CategoryIcon({
  variant,
  className,
}: {
  variant: CategoryIconVariant;
  className?: string;
}) {
  if (variant === "oil") {
    return (
      <svg viewBox="0 0 100 100" fill="none" className={className} aria-hidden>
        <path
          d="M50 14c12 16 26 32 26 46a26 26 0 1 1-52 0c0-14 14-30 26-46Z"
          stroke="currentColor"
          strokeWidth="3"
          opacity="0.8"
        />
        <path
          d="M50 40c6 8 13 16 13 24a13 13 0 1 1-26 0c0-8 7-16 13-24Z"
          fill="currentColor"
          opacity="0.25"
        />
      </svg>
    );
  }

  if (variant === "oral") {
    return (
      <svg viewBox="0 0 100 100" fill="none" className={className} aria-hidden>
        <path
          d="M30 22c6-6 14-6 20 0 6-6 14-6 20 0 8 8 6 24 0 40-4 10-10 16-14 16-3 0-5-6-6-12-1 6-3 12-6 12-4 0-10-6-14-16-6-16-8-32 0-40Z"
          stroke="currentColor"
          strokeWidth="3"
          opacity="0.8"
        />
        <circle cx="50" cy="40" r="5" fill="currentColor" opacity="0.25" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 100 100" fill="none" className={className} aria-hidden>
      <ellipse
        cx="50"
        cy="55"
        rx="26"
        ry="32"
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.8"
      />
      <path
        d="M50 23c8 10 8 18 0 26-8-8-8-16 0-26Z"
        fill="currentColor"
        opacity="0.3"
      />
      <path d="M50 55v24" stroke="currentColor" strokeWidth="3" opacity="0.5" />
    </svg>
  );
}
