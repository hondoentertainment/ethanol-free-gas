"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accessible dialog behavior for a container element:
 * - Traps Tab focus within the container
 * - Closes on Escape
 * - Moves focus into the dialog on open and restores it to the trigger on close
 *
 * Usage:
 *   const ref = useFocusTrap<HTMLDivElement>(open, onClose);
 *   return open ? <div ref={ref} role="dialog" aria-modal="true">…</div> : null;
 */
export function useFocusTrap<T extends HTMLElement>(
  active: boolean,
  onClose: () => void
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!active) return;

    const node = ref.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    function focusFirst() {
      if (!node) return;
      const focusable = node.querySelectorAll<HTMLElement>(FOCUSABLE);
      (focusable[0] ?? node).focus();
    }

    // Defer so the element is mounted/painted before focusing.
    const raf = requestAnimationFrame(focusFirst);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !node) return;

      const focusable = Array.from(
        node.querySelectorAll<HTMLElement>(FOCUSABLE)
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeEl = document.activeElement;

      if (event.shiftKey && activeEl === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && activeEl === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", handleKeyDown, true);
      // Restore focus to whatever opened the dialog.
      if (previouslyFocused && typeof previouslyFocused.focus === "function") {
        previouslyFocused.focus();
      }
    };
  }, [active, onClose]);

  return ref;
}
