"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { getGsap, prefersReducedMotion } from "@/lib/animation/gsap";

interface RevealProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Stagger child elements (direct children of the wrapper) instead of animating as one block. */
  stagger?: boolean;
  y?: number;
  delay?: number;
}

export function Reveal({ children, className, style, stagger = false, y = 24, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) return;

    const { gsap, ScrollTrigger } = getGsap();
    const targets = stagger ? Array.from(el.children) : el;

    gsap.set(targets, { opacity: 0, y });

    const animation = gsap.to(targets, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      delay,
      ease: "power2.out",
      stagger: stagger ? 0.1 : 0,
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        once: true,
      },
    });

    return () => {
      animation.scrollTrigger?.kill();
      animation.kill();
      ScrollTrigger.refresh();
    };
  }, [stagger, y, delay]);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
