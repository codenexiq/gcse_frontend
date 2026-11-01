/** True when the caret at `pos` is between a pair of $ signs (an unescaped $ is a maths delimiter). */
function insideMaths(text: string, pos: number): boolean {
  let dollars = 0;
  for (let i = 0; i < pos; i++) {
    if (text[i] === "\\") i++;
    else if (text[i] === "$") dollars++;
  }
  return dollars % 2 === 1;
}

/**
 * Puts a LaTeX snippet into `text` at the selection. Outside maths it is wrapped in $...$ so it shows as maths.
 * The caret goes inside the first {} or () of the snippet, so the tutor can type straight away.
 */
export function insertMath(text: string, start: number, end: number, snippet: string): { text: string; caret: number } {
  const wrapped = !insideMaths(text, start);
  const piece = wrapped ? `$${snippet}$` : snippet;
  const inner = snippet.search(/\{\}|\(\)/);
  const caret = start + (wrapped ? 1 : 0) + (inner >= 0 ? inner + 1 : snippet.length);
  return { text: text.slice(0, start) + piece + text.slice(end), caret };
}
