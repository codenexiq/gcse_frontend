import { SVG } from "@svgdotjs/svg.js";

// Angle diagrams drawn with SVG.js. Everything here only builds plain SVG text (shapes and text, no scripts), which is
// exactly what the quiz upload accepts. It runs in the browser (it needs `document`).

export type Field =
  | { key: string; label: string; kind: "text"; value: string; hint?: string }
  | { key: string; label: string; kind: "select"; value: string; options: { value: string; label: string }[] };

export interface DiagramType {
  id: string;
  name: string;
  about: string;
  fields: Field[];
  draw: (values: Record<string, string>) => string;
}

const INK = "#1c1917";
const BLUE = "#1d5df0";
const rad = (d: number) => (d * Math.PI) / 180;
const pt = (cx: number, cy: number, r: number, deg: number): [number, number] => [cx + r * Math.cos(rad(deg)), cy - r * Math.sin(rad(deg))];
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/** "54" becomes "54°"; anything else ("x", "2x + 10") is shown as typed. */
const show = (s: string) => {
  const t = s.trim();
  return /^\d+(\.\d+)?$/.test(t) ? `${t}°` : t;
};
const size = (s: string) => (/^\d+(\.\d+)?$/.test(s.trim()) ? Number(s) : null);

function canvas(w: number, h: number) {
  const draw = SVG().size(w, h).viewbox(0, 0, w, h);
  draw.rect(w, h).fill("#ffffff");
  return draw;
}
type Canvas = ReturnType<typeof canvas>;

const label = (d: Canvas, text: string, x: number, y: number) => {
  if (!text.trim()) return;
  // plain() keeps the text exactly as typed (no markup), and anchoring in the SVG itself needs no measuring.
  d.plain(text).attr({ x, y, "text-anchor": "middle", "dominant-baseline": "central", "font-size": 16, "font-family": "Arial, sans-serif", fill: INK });
};
const seg = (d: Canvas, a: [number, number], b: [number, number]) => d.line(a[0], a[1], b[0], b[1]).stroke({ width: 2, color: INK });

/** An arc of radius r from angle a to angle b (degrees, anticlockwise from the right), centred on (cx, cy). */
function arc(d: Canvas, cx: number, cy: number, r: number, a: number, b: number) {
  const [x1, y1] = pt(cx, cy, r, a), [x2, y2] = pt(cx, cy, r, b);
  d.path(`M ${x1} ${y1} A ${r} ${r} 0 ${Math.abs(b - a) > 180 ? 1 : 0} 0 ${x2} ${y2}`).fill("none").stroke({ width: 1.5, color: BLUE });
}

/** An arc with its label just outside it. */
function sector(d: Canvas, cx: number, cy: number, r: number, a: number, b: number, text: string) {
  arc(d, cx, cy, r, a, b);
  label(d, text, ...pt(cx, cy, r + 18, (a + b) / 2));
}

const straightLine: DiagramType = {
  id: "straight",
  name: "Angles on a straight line",
  about: "A line with a ray standing on it. Good for “angles on a straight line add up to 180°”.",
  fields: [
    { key: "size", label: "Angle on the right, as drawn (degrees)", kind: "text", value: "54", hint: "A number from 15 to 165" },
    { key: "right", label: "Label on the right", kind: "text", value: "54" },
    { key: "left", label: "Label on the left", kind: "text", value: "x" },
  ],
  draw: (v) => {
    const deg = clamp(size(v.size) ?? 60, 15, 165);
    const d = canvas(320, 180), cx = 160, cy = 140;
    seg(d, [20, cy], [300, cy]);
    seg(d, [cx, cy], pt(cx, cy, 115, deg));
    sector(d, cx, cy, 34, 0, deg, show(v.right));
    sector(d, cx, cy, 34, deg, 180, show(v.left));
    return d.svg();
  },
};

const triangle: DiagramType = {
  id: "triangle",
  name: "Triangle",
  about: "A triangle with its three angles labelled. Good for “angles in a triangle add up to 180°”.",
  fields: [
    { key: "a", label: "Bottom-left angle", kind: "text", value: "50", hint: "A number draws it to that size; a letter such as x takes what is left" },
    { key: "b", label: "Bottom-right angle", kind: "text", value: "60" },
    { key: "c", label: "Top angle", kind: "text", value: "x" },
  ],
  draw: (v) => {
    // Sizes to draw: known ones as given, the unknown ones share what is left of 180.
    const known = [size(v.a), size(v.b), size(v.c)];
    const left = Math.max(180 - known.reduce<number>((s, n) => s + (n ?? 0), 0), 30);
    const unknown = known.filter((n) => n === null).length || 1;
    const [A, B] = known.map((n) => clamp(n ?? left / unknown, 20, 120));
    const d = canvas(340, 240), P: [number, number] = [40, 210], Q: [number, number] = [300, 210];
    const len = (260 * Math.sin(rad(B))) / Math.sin(rad(A + B));
    const R: [number, number] = [P[0] + len * Math.cos(rad(A)), P[1] - len * Math.sin(rad(A))];
    d.polygon([P, Q, R]).fill("none").stroke({ width: 2, color: INK });
    label(d, show(v.a), P[0] + 44, P[1] - 12);
    label(d, show(v.b), Q[0] - 44, Q[1] - 12);
    label(d, show(v.c), R[0], R[1] + 30);
    return d.svg();
  },
};

const aroundPoint: DiagramType = {
  id: "point",
  name: "Angles around a point",
  about: "Up to four angles meeting at a point. Good for “angles around a point add up to 360°”. Leave a label empty to use fewer.",
  fields: [
    { key: "a", label: "Angle 1", kind: "text", value: "110" },
    { key: "b", label: "Angle 2", kind: "text", value: "95" },
    { key: "c", label: "Angle 3", kind: "text", value: "x" },
    { key: "d", label: "Angle 4 (optional)", kind: "text", value: "" },
  ],
  draw: (v) => {
    const parts = [v.a, v.b, v.c, v.d].filter((s) => s.trim() !== "");
    const known = parts.map(size);
    const left = Math.max(360 - known.reduce<number>((s, n) => s + (n ?? 0), 0), 30);
    const unknown = known.filter((n) => n === null).length || 1;
    const spans = known.map((n) => clamp(n ?? left / unknown, 20, 300));
    const total = spans.reduce((s, n) => s + n, 0);
    const scale = total > 0 ? 360 / total : 1;
    const d = canvas(320, 260), cx = 160, cy = 130;
    let at = 20;
    const edges = [at];
    spans.forEach((span, i) => {
      const next = at + span * scale;
      sector(d, cx, cy, 34, at, next, show(parts[i]));
      at = next;
      edges.push(at);
    });
    for (const e of edges.slice(0, -1)) seg(d, [cx, cy], pt(cx, cy, 105, e));
    return d.svg();
  },
};

const QUADRANTS = [
  { value: "ur", label: "Top right" },
  { value: "ul", label: "Top left" },
  { value: "dl", label: "Bottom left" },
  { value: "dr", label: "Bottom right" },
];
const LINES = [
  { value: "upper", label: "Upper line" },
  { value: "lower", label: "Lower line" },
];

const parallel: DiagramType = {
  id: "parallel",
  name: "Parallel lines",
  about: "Two parallel lines cut by a straight line. Mark any two angles, for alternate, corresponding or co-interior angles.",
  fields: [
    { key: "size", label: "Slope of the crossing line, as drawn (degrees)", kind: "text", value: "65", hint: "A number from 30 to 150" },
    { key: "at1", label: "First angle: on the", kind: "select", value: "upper", options: LINES },
    { key: "q1", label: "First angle: position", kind: "select", value: "dl", options: QUADRANTS },
    { key: "l1", label: "First angle: label", kind: "text", value: "65" },
    { key: "at2", label: "Second angle: on the", kind: "select", value: "lower", options: LINES },
    { key: "q2", label: "Second angle: position", kind: "select", value: "ur", options: QUADRANTS },
    { key: "l2", label: "Second angle: label", kind: "text", value: "x" },
  ],
  draw: (v) => {
    const deg = clamp(size(v.size) ?? 65, 30, 150);
    const d = canvas(360, 240), yU = 80, yL = 170, cx = 180;
    const shift = (yL - yU) / 2 / Math.tan(rad(deg));
    const U: [number, number] = [cx + shift, yU], L: [number, number] = [cx - shift, yL];
    for (const y of [yU, yL]) {
      seg(d, [30, y], [330, y]);
      // The little arrow heads that mean "parallel".
      d.polyline([[310, y - 6], [320, y], [310, y + 6]]).fill("none").stroke({ width: 1.5, color: INK });
    }
    seg(d, pt(L[0], L[1], -45, deg), pt(U[0], U[1], 45, deg));
    const span = (q: string): [number, number] => (q === "ur" ? [0, deg] : q === "ul" ? [deg, 180] : q === "dl" ? [180, deg + 180] : [deg + 180, 360]);
    for (const [at, q, text] of [[v.at1, v.q1, v.l1], [v.at2, v.q2, v.l2]] as const) {
      const c = at === "lower" ? L : U;
      const [a, b] = span(q);
      sector(d, c[0], c[1], 30, a, b, show(text));
    }
    return d.svg();
  },
};

export const DIAGRAM_TYPES: DiagramType[] = [straightLine, triangle, aroundPoint, parallel];

export const defaultValues = (type: DiagramType) => Object.fromEntries(type.fields.map((f) => [f.key, f.value]));

/** A picture the browser can show in an <img>, the same way the quiz page shows diagrams. */
export const svgDataUrl = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
