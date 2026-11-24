import { useEffect, useRef, useState } from "react";

/**
 * ScrollReveal: Animates child elements into view as the user scrolls.
 *
 * @param {string} direction - "up" | "down" | "left" | "right" | "zoom" | "none"
 * @param {number} delay - Animation delay in milliseconds (default 0)
 * @param {number} duration - Transition duration in milliseconds (default 600)
 * @param {number} distance - Initial offset in pixels (default 24)
 * @param {number} threshold - Intersection threshold (default 0.15)
 * @param {boolean} once - Only trigger animation once (default true)
 * @param {string} className - Additional CSS classes
 */
export default function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  duration = 600,
  distance = 28,
  threshold = 0.12,
  once = true,
  className = "",
  as: Component = "div",
  ...props
}) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    // Check for reduced motion preference
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(entry.target);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );

    const currentEl = elementRef.current;
    if (currentEl) {
      observer.observe(currentEl);
    }

    return () => {
      if (currentEl) {
        observer.unobserve(currentEl);
      }
    };
  }, [threshold, once]);

  // Compute transform offset based on direction
  const getTransform = () => {
    if (isVisible) return "none";
    switch (direction) {
      case "up":
        return `translate3d(0, ${distance}px, 0)`;
      case "down":
        return `translate3d(0, -${distance}px, 0)`;
      case "left":
        return `translate3d(${distance}px, 0, 0)`;
      case "right":
        return `translate3d(-${distance}px, 0, 0)`;
      case "zoom":
        return "scale(0.94)";
      case "none":
      default:
        return "none";
    }
  };

  return (
    <Component
      ref={elementRef}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transitionProperty: "opacity, transform",
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        transitionDelay: `${delay}ms`,
        willChange: "opacity, transform",
      }}
      {...props}
    >
      {children}
    </Component>
  );
}
