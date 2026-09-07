import './popup-core.js';
// Shared, testable helpers. No network calls happen here.
export function cleanText(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, 4000);
}
export function phraseQuery(value) {
  const text = cleanText(value).replace(/["\\]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!text) throw new Error('Enter a theorem name or search phrase first.');
  return `ti:"${text}" OR abs:"${text}"`;
}
export function authorQuery(value) {
  const text = cleanText(value).replace(/["\\]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!text) throw new Error('Enter an author name first.');
  return `au:"${text}"`;
}
export const isLikelyAuthor = globalThis.MathaCartaPopupCore.isLikelyAuthor;
export function apiUrl(value, year, mode = 'phrase') {
  const url = new URL('https://export.arxiv.org/api/query');
  let query = mode === 'author' ? authorQuery(value) : phraseQuery(value);
  if (year !== undefined) {
    if (!Number.isInteger(year) || year < 1991 || year > new Date().getUTCFullYear()) throw new Error('Invalid article year.');
    query = `(${query}) AND submittedDate:[${year}01010000 TO ${year}12312359]`;
  }
  url.search = new URLSearchParams({search_query: query, start: '0', max_results: year === undefined ? '10' : '1', sortBy: 'relevance'});
  return url.href;
}
export function paperUrl(raw) {
  try {
    const url = new URL(raw);
    if (!['http:', 'https:'].includes(url.protocol) || !['arxiv.org', 'export.arxiv.org'].includes(url.hostname) || !url.pathname.startsWith('/abs/')) return null;
    return `https://arxiv.org${url.pathname}`;
  } catch { return null; }
}
