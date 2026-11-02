/**
 * Makes a PDF file of the monthly progress report inside the browser and saves it straight to the computer
 * (no print window). The report is drawn as it looks on screen, on A4 pages.
 */

const PAGE_WIDTH_MM = 210;
const PAGE_HEIGHT_MM = 297;
const MARGIN_MM = 10;
/** The report is drawn at this width, whatever the size of the screen, so the PDF always looks the same. */
const DRAW_WIDTH_PX = 820;

/**
 * Where to cut a tall picture into pages, in pixels from the top. A page is cut at the end of a block (a heading with its text
 * stays together) whenever one fits; a block taller than a page, or one that would leave the page mostly empty, is cut at the page edge.
 * `boundaries` are the places where a block ends. Returns the cut positions (not including 0 and the total).
 */
export function pickPageBreaks(boundaries: number[], total: number, pageHeight: number): number[] {
  const sorted = [...new Set(boundaries.filter((b) => b > 0 && b < total))].sort((a, b) => a - b);
  const breaks: number[] = [];
  let start = 0;
  while (total - start > pageHeight + 0.5) {
    const limit = start + pageHeight;
    let best = -1;
    for (const b of sorted) {
      if (b <= start + 1) continue;
      if (b > limit) break;
      best = b;
    }
    const cut = best > start + pageHeight * 0.35 ? best : limit;
    breaks.push(cut);
    start = cut;
  }
  return breaks;
}

/** "Monthly report - Sara Khan - October 2026.pdf", safe to use as a file name. */
export function reportFileName(studentName: string, month: string): string {
  const clean = (text: string) => text.replace(/[\\/:*?"<>|\u0000-\u001f]/g, "").replace(/\s+/g, " ").trim();
  const parts = ["Monthly report", clean(studentName), clean(month)].filter(Boolean);
  return `${parts.join(" - ")}.pdf`.slice(0, 150);
}

/** Draws the report element on A4 pages and returns the PDF. */
export async function buildReportPdf(source: HTMLElement): Promise<Blob> {
  // The two libraries are only loaded when someone asks for a PDF.
  const [{ toCanvas }, { jsPDF }] = await Promise.all([import("html-to-image"), import("jspdf")]);
  if (document.fonts?.ready) await document.fonts.ready;

  // A copy at a fixed width, out of sight, so the screen size and what is scrolled do not change the result.
  const copy = source.cloneNode(true) as HTMLElement;
  copy.removeAttribute("id");
  // The copy itself stays in normal flow (the picture would inherit an offset and come out blank); only its holder is moved out of sight.
  copy.style.cssText = `width:${DRAW_WIDTH_PX}px;max-width:none;margin:0;`;
  const holder = document.createElement("div");
  holder.setAttribute("aria-hidden", "true");
  holder.style.cssText = "position:fixed;left:-10000px;top:0;pointer-events:none;";
  holder.appendChild(copy);
  document.body.appendChild(holder);
  try {
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    const total = copy.offsetHeight;
    const top = copy.getBoundingClientRect().top;

    // Where blocks end: the header, and every block of the report body (but never right after a heading, which belongs to what follows).
    const blocks = Array.from(copy.children).flatMap((child) => (child.tagName === "HEADER" ? [child] : Array.from(child.children)));
    const boundaries = blocks.filter((b) => b.tagName !== "H3").map((b) => b.getBoundingClientRect().bottom - top);

    const canvas = await toCanvas(copy, { pixelRatio: 2, backgroundColor: "#ffffff", cacheBust: true });
    const scale = canvas.width / DRAW_WIDTH_PX;
    const contentWidthMm = PAGE_WIDTH_MM - 2 * MARGIN_MM;
    const mmPerPx = contentWidthMm / DRAW_WIDTH_PX;
    const pageHeightPx = (PAGE_HEIGHT_MM - 2 * MARGIN_MM) / mmPerPx;

    const cuts = [0, ...pickPageBreaks(boundaries, total, pageHeightPx), total];
    const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait", compress: true });
    for (let i = 0; i < cuts.length - 1; i++) {
      const from = cuts[i];
      const to = cuts[i + 1];
      const slice = document.createElement("canvas");
      slice.width = canvas.width;
      slice.height = Math.max(1, Math.round((to - from) * scale));
      const ctx = slice.getContext("2d");
      if (!ctx) throw new Error("Your browser could not prepare the PDF.");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, slice.width, slice.height);
      ctx.drawImage(canvas, 0, Math.round(from * scale), canvas.width, slice.height, 0, 0, slice.width, slice.height);
      if (i > 0) pdf.addPage();
      pdf.addImage(slice.toDataURL("image/jpeg", 0.95), "JPEG", MARGIN_MM, MARGIN_MM, contentWidthMm, (to - from) * mmPerPx, undefined, "FAST");
    }
    return pdf.output("blob");
  } finally {
    holder.remove();
  }
}

/** Makes the PDF of the report on this page and downloads it at once. */
export async function downloadReportPdf(fileName: string, elementId = "monthly-report-print"): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) throw new Error("The report is not on the screen.");
  const blob = await buildReportPdf(element);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Give the browser a moment to start the download before the address is released.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
