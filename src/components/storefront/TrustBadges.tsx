const BADGES = [
  { label: "100% Organic", icon: "🌿" },
  { label: "Cruelty-Free", icon: "🐇" },
  { label: "No Parabens", icon: "🚫" },
  { label: "Small Batches", icon: "✦" },
  { label: "Made in Pakistan", icon: "📍" },
];

export function TrustBadges() {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
      {BADGES.map((badge) => (
        <div
          key={badge.label}
          className="flex flex-col items-center gap-3 rounded-3xl border border-beige-200 bg-cream-50 p-8 text-center transition-transform hover:-translate-y-1"
        >
          <span className="text-4xl" aria-hidden>
            {badge.icon}
          </span>
          <span className="font-display text-lg font-medium text-charcoal-800">
            {badge.label}
          </span>
        </div>
      ))}
    </div>
  );
}
