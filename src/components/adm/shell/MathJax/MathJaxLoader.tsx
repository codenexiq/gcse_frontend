"use client";

import { useEffect } from "react";

interface MathJaxWindow {
  MathJax?: unknown;
  ecTypeset?: () => void;
}

const SRC = "https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.2/es5/tex-svg.js";

/** Loads MathJax once (it then draws every $...$ the pages ask it to). Scripts in a layout do not run after in-app navigation, so this adds the script itself. */
export default function MathJaxLoader({ nonce }: { nonce?: string }) {
  useEffect(() => {
    const w = window as unknown as MathJaxWindow;
    if (w.MathJax || document.getElementById("mathjax-script")) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).MathJax = {
      tex: { inlineMath: [["$", "$"]], displayMath: [["$$", "$$"]] },
      svg: { fontCache: "global" },
      options: { skipHtmlTags: ["script", "noscript", "style", "textarea", "pre", "code", "select", "option", "input"] },
      startup: {
        typeset: false,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ready: () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mj = (window as any).MathJax;
          mj.startup.defaultReady();
          mj.startup.promise.then(() => w.ecTypeset?.());
        },
      },
    };
    const s = document.createElement("script");
    s.id = "mathjax-script";
    s.src = SRC;
    s.async = true;
    if (nonce) s.nonce = nonce;
    document.head.appendChild(s);
  }, [nonce]);
  return null;
}
