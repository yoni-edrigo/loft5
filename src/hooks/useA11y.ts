import { useEffect, useRef } from "react";

export function useA11yAnnouncement(
  message: string,
  priority: "polite" | "assertive" = "polite",
) {
  useEffect(() => {
    const announcement = document.createElement("div");
    announcement.setAttribute("aria-live", priority);
    announcement.setAttribute("aria-atomic", "true");
    announcement.className = "sr-only";
    announcement.textContent = message;

    document.body.appendChild(announcement);

    return () => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement);
      }
    };
  }, [message, priority]);
}

export function useA11yFocusTrap(enabled: boolean = true) {
  const containerRef = useRef<HTMLElement>(null);
  const focusableElementsRef = useRef<HTMLElement[]>([]);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;

    // Get all focusable elements
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    focusableElementsRef.current = Array.from(
      focusableElements,
    ) as HTMLElement[];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        const firstElement = focusableElementsRef.current[0];
        const lastElement =
          focusableElementsRef.current[focusableElementsRef.current.length - 1];

        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enabled]);

  return containerRef;
}

export function useA11ySkipLink() {
  useEffect(() => {
    const skipLink = document.createElement("a");
    skipLink.href = "#main-content";
    skipLink.textContent = "דלג לתוכן הראשי";
    skipLink.className =
      "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded z-50";

    document.body.insertBefore(skipLink, document.body.firstChild);

    return () => {
      if (document.body.contains(skipLink)) {
        document.body.removeChild(skipLink);
      }
    };
  }, []);
}
