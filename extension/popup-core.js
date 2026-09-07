// Loaded before highlight.js in Chrome's isolated content-script world.
globalThis.MathaCartaPopupCore = (() => {
  const normalize = value => String(value ?? '').replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim();
  function isLikelyAuthor(value) {
    const words = normalize(value).normalize('NFC').split(' ');
    const excluded = /^(theorem|conjecture|lemma|hypothesis|principle|law|formula|equation|problem|identity|inequality|criterion|property)$/i;
    return words.length >= 2 && words.length <= 5 &&
      words.every(word => /^(?:\p{Lu}[\p{L}\p{M}'’-]*|\p{Lu}\.|van|von|de|del|der|da|dos)$/u.test(word)) &&
      !words.some(word => excluded.test(word));
  }
  function position(rect, width, height, viewportWidth, viewportHeight) {
    const left = Math.max(8, Math.min(rect.left, viewportWidth - width - 8));
    let top = rect.bottom + 9;
    if (top + height > viewportHeight - 8) top = Math.max(8, rect.top - height - 9);
    return {left, top};
  }
  function safePaper(raw) {
    try { const u = new URL(raw); return ['http:','https:'].includes(u.protocol) && ['arxiv.org','export.arxiv.org'].includes(u.hostname) && u.pathname.startsWith('/abs/') ? `https://arxiv.org${u.pathname}` : null; } catch {return null;}
  }
  function parseFeed(xml, Parser = DOMParser) {
    const doc = new Parser().parseFromString(xml, 'text/xml');
    if (doc.querySelector('parsererror')) throw new Error('arXiv returned unreadable results.');
    const field = (node, key) => node.getElementsByTagNameNS('*',key)[0]?.textContent?.trim() || '';
    const entries = [...doc.getElementsByTagNameNS('*','entry')];
    if (entries.some(e => field(e,'id').includes('/api/errors'))) throw new Error('arXiv rejected this phrase. Try editing the search.');
    const total = field(doc,'totalResults');
    if (!/^\d+$/.test(total)) throw new Error('arXiv did not supply a count.');
    return {total:Number(total), papers: entries.map(e => ({url:safePaper(field(e,'id')), title:normalize(field(e,'title')), authors:[...e.getElementsByTagNameNS('*','author')].map(a=>normalize(field(a,'name')))})).filter(e=>e.url)};
  }
  return {normalize, isLikelyAuthor, position, safePaper, parseFeed};
})();
