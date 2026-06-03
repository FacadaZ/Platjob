import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Triggers a GSAP stagger reveal animation when elements enter the viewport.
 * Targets all `.will-reveal` children inside the container ref.
 */
export function useScrollReveal(once = true) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".will-reveal",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 85%",
            once,
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [once]);

  return containerRef;
}
