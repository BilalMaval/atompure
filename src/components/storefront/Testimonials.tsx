"use client";

import { Text } from "@/components/ui/Typography";

// Illustrative testimonials for layout/launch purposes — swap in real,
// verified customer reviews before going live.
const TESTIMONIALS = [
  { name: "Ayesha Khan", rating: 5, quote: "My hair feels noticeably stronger after a few weeks of using the hair oil." },
  { name: "Hamza Tariq", rating: 5, quote: "Finally a whitening powder that doesn't feel harsh on my gums. Love the mint." },
  { name: "Sana Malik", rating: 5, quote: "The mustard oil tastes so much more authentic than anything I've bought before." },
  { name: "Bilal Ahmed", rating: 4, quote: "Clean ingredients and it actually works. My skin feels less irritated now." },
  { name: "Fatima Raza", rating: 5, quote: "Ordered for my whole family — everyone's switched over for good." },
  { name: "Usman Sheikh", rating: 5, quote: "Fast delivery and the packaging feels premium. Will reorder for sure." },
  { name: "Mahnoor Iqbal", rating: 5, quote: "I was skeptical about natural teeth whitening but this genuinely works." },
  { name: "Ahmed Siddiqui", rating: 4, quote: "Pure mustard oil taste reminds me of my grandmother's cooking." },
  { name: "Zara Yousaf", rating: 5, quote: "My scalp feels healthier and there's noticeably less hair fall." },
];

function StarRow({ rating }: { rating: number }) {
  return (
    <div aria-hidden className="text-sage-600">
      {"★".repeat(rating)}
      <span className="text-beige-300">{"★".repeat(5 - rating)}</span>
    </div>
  );
}

function TestimonialCard({ name, rating, quote }: (typeof TESTIMONIALS)[number]) {
  return (
    <figure className="mx-3 flex w-80 flex-shrink-0 flex-col gap-4 rounded-2xl border border-beige-200 bg-cream-50 p-6">
      <StarRow rating={rating} />
      <blockquote>
        <Text className="text-charcoal-700">&ldquo;{quote}&rdquo;</Text>
      </blockquote>
      <figcaption className="text-sm font-medium text-sage-700">{name}</figcaption>
    </figure>
  );
}

export function Testimonials() {
  const loop = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <div className="group overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
      <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused] motion-reduce:animate-none">
        {loop.map((testimonial, i) => (
          <TestimonialCard key={`${testimonial.name}-${i}`} {...testimonial} />
        ))}
      </div>
    </div>
  );
}
