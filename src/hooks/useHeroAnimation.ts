import { useEffect, useRef } from "react";
import gsap from "gsap";

interface UseHeroAnimationOptions {
  delay?: number;
}

/**
 * Animates hero section children with a staggered entrance using GSAP.
 * Target elements should have the `.hero-item` class.
 */
export function useHeroAnimation({ delay = 0.1 }: UseHeroAnimationOptions = {}) {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay });

      tl.fromTo(
        ".hero-item",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
        }
      );

      tl.fromTo(
        ".hero-badge",
        { opacity: 0, scale: 0.85 },
        { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.4)" },
        "<0.1"
      );
    }, heroRef);

    return () => ctx.revert();
  }, [delay]);

  return heroRef;
}
