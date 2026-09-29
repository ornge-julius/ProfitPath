import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Gives a modal dialog standard behavior: Escape closes it, Tab is trapped
 * inside it, focus moves in on open and returns to the trigger on close.
 */
export const useModalA11y = (isOpen, onClose, containerRef) => {
  const previouslyFocusedRef = useRef(null);
  // Callers rarely memoize onClose; reading it through a ref keeps the effect
  // below from re-running (and re-stealing focus) on every parent re-render.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return undefined;

    previouslyFocusedRef.current = document.activeElement;

    const container = containerRef.current;
    const focusables = container?.querySelectorAll(FOCUSABLE_SELECTOR);
    (focusables?.[0] ?? container)?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }

      if (e.key !== 'Tab' || !container) return;

      const focusable = Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocusedRef.current?.focus?.();
    };
  }, [isOpen, containerRef]);
};
