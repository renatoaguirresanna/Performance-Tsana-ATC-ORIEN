/** Lowercase, trim, collapse whitespace, and strip accents so similar
 * queries ("BCP Nutrición" vs "bcp nutricion") group together for the
 * admin keyword-frequency ranking. */
export function normalizeQuery(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}
