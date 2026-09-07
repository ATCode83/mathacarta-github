import {cleanText, phraseQuery, paperUrl, isLikelyAuthor} from './core.js';
const $ = id => document.getElementById(id);
let generation = 0;
function resetResults() {
  generation++;
  $('papers').replaceChildren();
  $('status').textContent = 'Ready to explore.';
  $('search').disabled = false;
}
function selectedMode(){return $('mode').value==='auto'?(isLikelyAuthor($('query').value)?'author':'phrase'):$('mode').value;}
$('mode').addEventListener('change',()=>{resetResults();links();});
function links() {
  const query = cleanText($('query').value);
  $('arxivLink').hidden = !query;
  $('arxivLink').href = `https://arxiv.org/search/?${new URLSearchParams({query, searchtype:selectedMode()==='author'?'author':'all'})}`;
}
function loadSelection(selection) {
  if (!selection?.text) return;
  resetResults();
  $('statement').value = selection.text;
  $('query').value = selection.text.slice(0,250);
  links();
}
chrome.storage.session.get('selection').then(({selection}) => loadSelection(selection));
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'session' && changes.selection?.newValue) loadSelection(changes.selection.newValue);
});
$('query').addEventListener('input', () => {resetResults(); links();});
$('statement').addEventListener('input', () => {resetResults(); links();});
$('search').addEventListener('click', async () => {
  const query = $('query').value;
  const mode = selectedMode();
  try {phraseQuery(query);} catch (error) {$('status').textContent = error.message; return;}
  const request = ++generation;
  $('search').disabled = true;
  $('papers').replaceChildren();
  $('status').textContent = mode === 'author' ? 'Searching arXiv papers by author…' : 'Searching arXiv titles and abstracts…';
  links();
  try {
    const response = await chrome.runtime.sendMessage({type:'SEARCH_ARXIV',query,mode});
    if (request !== generation) return;
    if (!response?.ok) throw new Error(response?.error || 'The extension worker did not respond. Reload the extension.');
    const doc = new DOMParser().parseFromString(response.xml, 'text/xml');
    if (doc.querySelector('parsererror')) throw new Error('Could not read the arXiv response.');
    const entries = [...doc.getElementsByTagNameNS('*','entry')];
    const field = (node,name) => node.getElementsByTagNameNS('*',name)[0]?.textContent?.trim() || '';
    if (entries.some(entry => field(entry,'id').includes('/api/errors'))) throw new Error('arXiv rejected this query. Try a shorter theorem name.');
    const rawTotal = field(doc,'totalResults');
    if (!/^\d+$/.test(rawTotal)) throw new Error('arXiv did not supply a result count.');
    const total = Number(rawTotal);
    $('status').textContent = `${total.toLocaleString()} ${mode === 'author' ? 'author' : 'title/abstract'} query matches. ${response.cached ? 'Cached' : 'Retrieved'} ${new Date(response.at).toLocaleString()}.${total === 0 ? ' Try an alternative spelling or shorter phrase.' : ''}`;
    for (const entry of entries) {
      const url = paperUrl(field(entry,'id'));
      if (!url) continue;
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer';
      a.textContent = cleanText(field(entry,'title'));
      const p = document.createElement('p');
      p.textContent = cleanText(field(entry,'summary')).slice(0,320) + '…';
      const authors=document.createElement('p');authors.textContent='Authors: '+[...entry.getElementsByTagNameNS('*','author')].map(a=>field(a,'name')).join(', ');li.append(a,authors,p); $('papers').append(li);
    }
  } catch (error) {
    if (request === generation) $('status').textContent = `Search unavailable: ${error.message}`;
  } finally {
    if (request === generation) $('search').disabled = false;
  }
});
$('clear').addEventListener('click', async () => {
  // Let any request complete before clearing, so it cannot repopulate the cache afterward.
  if ($('search').disabled) {$('status').textContent = 'Wait for the search to finish, then clear local data.';return;}
  await chrome.storage.local.remove('arxivCache');
  await chrome.storage.session.remove('selection');
  $('statement').value = $('query').value = '';
  resetResults(); links();
  $('status').textContent = 'Local selection and cached results cleared.';
});

// The toolbar panel remains available as a manual fallback and popup toggle.
chrome.storage.local.get("highlightEnabled").then(data => {$("autoHighlight").checked = data.highlightEnabled !== false;});
$("autoHighlight").addEventListener("change", () => chrome.storage.local.set({highlightEnabled: $("autoHighlight").checked}));

$('openPdf').addEventListener('click',()=>chrome.tabs.create({url:chrome.runtime.getURL('reader.html')}));

$('readCurrentPdf').addEventListener('click',async()=>{
  try {
    const [tab]=await chrome.tabs.query({active:true,currentWindow:true});
    if(!tab?.url)throw new Error('Cannot read this tab address. Paste the PDF URL into the reader instead.');
    const url=new URL(tab.url);
    if(url.protocol==='file:'){
      await chrome.tabs.create({url:chrome.runtime.getURL('reader.html')+'?local=1'});return;
    }
    if(!['https:','http:'].includes(url.protocol))throw new Error('Open an online PDF first, or use Open PDF reader to choose a local file.');
    await chrome.tabs.create({url:chrome.runtime.getURL('reader.html')+'#'+encodeURIComponent(url.href)});
  }catch(error){$('pdfStatus').textContent=error.message;}
});
