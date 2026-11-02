/** The short line shown when a message is quoted: its text, or its file, or a note that it was deleted. */
export function quoteText(body: string | null, fileName: string | null, deleted: boolean, max = 100): string {
  if (deleted) return "This message was deleted";
  const text = (body ?? "").replace(/\s+/g, " ").trim();
  if (text) return text.length > max ? `${text.slice(0, max)}...` : text;
  return fileName ? `File: ${fileName}` : "Message";
}
