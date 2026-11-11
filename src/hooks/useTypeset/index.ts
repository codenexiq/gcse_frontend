"use client";

import { useEffect, type RefObject } from "react";

interface MathJaxWindow {
  MathJax?: { typesetPromise?: (els: Element[]) => Promise<void>; typesetClear?: (els: Element[]) => void };
  ecTypeset?: () => void;
}

/** Draws maths written between dollar signs (such as $x^2$) inside the element, now and whenever `deps` change. */
export function useTypeset(ref: RefObject<HTMLElement | null>, deps: unknown[]) {
  useEffect(() => {
    const run = () => {
      const el = ref.current;
      const mj = (window as unknown as MathJaxWindow).MathJax;
      if (!el || !mj?.typesetPromise) return;
      try {
        mj.typesetClear?.([el]);
      } catch {
        // nothing to clear yet
      }
      mj.typesetPromise([el]).catch(() => {});
    };
    run();
    // MathJax loads after the page: draw again when it is ready.
    (window as unknown as MathJaxWindow).ecTypeset = run;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
