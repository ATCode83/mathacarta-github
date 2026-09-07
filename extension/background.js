import {apiUrl, cleanText} from './core.js';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({id:'mathacarta-pdf',title:'Open in MathaCarta PDF reader',contexts:['page','link']});
    chrome.contextMenus.create({id: 'mathacarta', title: 'Search with MathaCarta', contexts: ['selection']});
  });
  chrome.sidePanel.setPanelBehavior({openPanelOnActionClick: true}).catch(console.error);
});
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if(info.menuItemId==='mathacarta-pdf'){
    chrome.tabs.create({url:chrome.runtime.getURL('reader.html')+'#'+encodeURIComponent(info.linkUrl || info.pageUrl || '')});return;
  }
  if (info.menuItemId !== 'mathacarta' || !tab?.id) return;
  // Open immediately, while Chrome still recognizes the user gesture.
  chrome.sidePanel.open({windowId: tab.windowId}).catch(console.error);
  chrome.storage.session.set({selection: {text: cleanText(info.selectionText), capturedAt: Date.now()}}).catch(console.error);
});

// A single promise chain prevents concurrent requests within this installation.
let queue = Promise.resolve();
async function search(query, mode) {
  const url = apiUrl(query, undefined, mode);
  const {arxivCache = {}, lastArxivRequest = 0, arxivBackoffUntil = 0, arxivFailures = 0} = await chrome.storage.local.get(['arxivCache', 'lastArxivRequest', 'arxivBackoffUntil', 'arxivFailures']);
  const cached = arxivCache[url];
  if (cached && Date.now() - cached.at < 86400000) return {...cached, cached: true};
  if (Date.now() < arxivBackoffUntil) throw new Error('arXiv is temporarily busy. Try again in '+Math.ceil((arxivBackoffUntil-Date.now())/1000)+' seconds.');
  const delay = Math.max(0, 3100 - (Date.now() - lastArxivRequest));
  if (delay) await new Promise(resolve => setTimeout(resolve, delay));
  await chrome.storage.local.set({lastArxivRequest: Date.now()});
  const response = await fetch(url, {signal: AbortSignal.timeout(15000)});
  if (response.status === 429 || response.status === 503) {
    const retryAfter = response.headers?.get('Retry-After');
    const retryMs = retryAfter ? (/^\d+$/.test(retryAfter) ? Number(retryAfter)*1000 : Date.parse(retryAfter)-Date.now()) : 0;
    const waitMs = Math.max(30000, Number.isFinite(retryMs)?retryMs:0, Math.min(300000, 30000 * 2 ** Math.min(arxivFailures,4)));
    await chrome.storage.local.set({arxivBackoffUntil:Date.now()+waitMs,arxivFailures:arxivFailures+1});
    throw new Error('arXiv returned HTTP '+response.status+'. Searches are paused for '+Math.ceil(waitMs/1000)+' seconds. Please try again afterward.');
  }
  if (!response.ok) throw new Error(`arXiv returned HTTP ${response.status}. Wait a moment and retry, or use the search link.`);
  const xml = await response.text();
  if (!xml.includes('<feed')) throw new Error('arXiv did not return a results feed. Please try again later.');
  const result = {xml, at: Date.now()};
  arxivCache[url] = result;
  const trimmed = Object.fromEntries(Object.entries(arxivCache).sort((a,b) => b[1].at-a[1].at).slice(0, 20));
  await chrome.storage.local.set({arxivCache: trimmed,arxivBackoffUntil:0,arxivFailures:0});
  return {...result, cached: false};
}
chrome.runtime.onMessage.addListener((message, sender, reply) => {
  if (sender.id !== chrome.runtime.id) return;
  if (message?.type !== 'SEARCH_ARXIV') return;
  const job = queue.then(() => search(message.query, message.mode));
  queue = job.catch(() => {});
  job.then(result => reply({ok: true, ...result})).catch(error => reply({ok: false, error: error.message}));
  return true;
});
