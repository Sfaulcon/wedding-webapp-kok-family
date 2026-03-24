/**
 * Input validation and sanitization helpers.
 */

/** Valid invite token: alphanumeric, 4-32 chars (matches typical generated tokens) */
const TOKEN_REGEX = /^[a-zA-Z0-9]{4,32}$/;

/** Max lengths for user input */
export const LIMITS = {
  song_title: 200,
  artist: 150,
  dietary_requirements: 500,
} as const;

export function isValidToken(token: unknown): token is string {
  return typeof token === "string" && TOKEN_REGEX.test(token);
}

export function sanitizeString(value: unknown, maxLength: number): string {
  if (value == null) return "";
  const s = String(value).trim();
  return s.slice(0, maxLength);
}
