/** What the server asks of a new password (it checks again, so this is only to help). Empty text = fine. */
export function passwordProblem(password: string): string {
  if (password.length < 10) return "The password needs at least 10 characters.";
  if (password.length > 72) return "The password can have 72 characters at most.";
  if (!/[a-z]/.test(password)) return "The password needs a lowercase letter.";
  if (!/[A-Z]/.test(password)) return "The password needs an uppercase letter.";
  if (!/[0-9]/.test(password)) return "The password needs a number.";
  return "";
}

/** A strong random password of 14 characters (upper case, lower case and digits, no look-alike letters). */
export function generatePassword(): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const digits = "23456789";
  const all = upper + lower + digits;
  const random = (max: number) => {
    // Rejection sampling keeps every letter equally likely.
    const limit = Math.floor(0x100000000 / max) * max;
    const buf = new Uint32Array(1);
    do crypto.getRandomValues(buf);
    while (buf[0] >= limit);
    return buf[0] % max;
  };
  const pick = (set: string) => set[random(set.length)];
  const chars = [pick(upper), pick(lower), pick(digits)];
  while (chars.length < 14) chars.push(pick(all));
  for (let i = chars.length - 1; i > 0; i--) {
    const j = random(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}
