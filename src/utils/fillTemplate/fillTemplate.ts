/** Replaces {name} markers in a sentence, e.g. fillTemplate("Your {level} test", { level: "GCSE" }). Unknown markers stay as they are. */
export function fillTemplate(text: string, values: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (marker, key: string) => (key in values ? String(values[key]) : marker));
}
