(() => {
  const core = globalThis.MathaCartaPopupCore;
  let enabled = true, timer, host, shadow, anchor, serial = 0, running = false, pending = null;
  chrome.storage.local.get('highlightEnabled').then(data => {enabled = data.highlightEnabled !== false;});
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.highlightEnabled) {
      enabled = changes.highlightEnabled.newValue !== false;
      if (!enabled) close();
    }
  });
  const el = (tag, text, parent) => {const n=document.createElement(tag);if(text !== undefined)n.textContent=text;if(parent)parent.append(n);return n;};
  function close() {clearTimeout(timer);serial++;pending=null;host?.remove();host=null;shadow=null;}
  function place() {
    if (!host || !anchor) return;
    const box=host.getBoundingClientRect();
    const p=core.position(anchor,box.width,box.height,innerWidth,innerHeight);
    host.style.setProperty('left',`${p.left}px`,'important');host.style.setProperty('top',`${p.top}px`,'important');
  }
  function link(label,url,parent) {const a=el('a',label,parent);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;}
  function show(text,rect,selectedMode='auto') {
    close();anchor=rect;
    const request=++serial;
    host=document.createElement('div');
    host.style.cssText='all:initial!important;position:fixed!important;z-index:2147483647!important;display:block!important;width:min(380px,calc(100vw - 16px))!important;';
    shadow=host.attachShadow({mode:'closed'});
    const style=el('style',undefined,shadow);
    style.textContent=`:host{color-scheme:light}*{box-sizing:border-box}article{font:13px/1.5 system-ui,sans-serif;color:#333;background:#fff;border:1px solid #c9c9c9;border-radius:4px;box-shadow:0 8px 32px #0003;max-height:min(520px,calc(100vh - 16px));overflow:auto;text-align:left}header{background:#b31b1b;color:white;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0}header strong{font:23px Georgia,serif}.body{padding:14px 16px}button{font:inherit;cursor:pointer;border:1px solid #bbb;border-radius:3px;background:#f2f2f2;color:#333;padding:5px 9px}header button{background:transparent;color:white;border:0;font-size:22px;line-height:1}p{margin:9px 0}h3{font-size:14px;margin:14px 0 6px}a{color:#1b4f9c;text-decoration:underline;overflow-wrap:anywhere}ol{padding-left:22px;margin:8px 0}li{margin:7px 0}.hint{font-size:11px;color:#666}.query{font-weight:600;overflow-wrap:anywhere}.badge{font-weight:650;white-space:nowrap}details{margin:10px 0}summary{cursor:pointer}input{font:inherit;width:100%;padding:6px;margin:8px 0;border:1px solid #aaa;border-radius:3px}button:focus-visible,a:focus-visible,input:focus-visible,summary:focus-visible{outline:2px solid #1b4f9c;outline-offset:2px}`;
    const article=el('article',undefined,shadow);article.setAttribute('role','dialog');article.setAttribute('aria-label','MathaCarta arXiv search');
    const header=el('header',undefined,article);el('strong','MathaCarta ✦',header);
    const x=el('button','×',header);x.setAttribute('aria-label','Close MathaCarta');x.onclick=close;
    const body=el('div',undefined,article);body.className='body';
    el('p',text,body).className='query';
    const count=el('h3','Ready to search arXiv.',body);count.setAttribute('role','status');count.setAttribute('aria-live','polite');
    const mode=selectedMode==='auto'?(core.isLikelyAuthor(text)?'author':'phrase'):selectedMode;
    const selector=el('select',undefined,body);selector.setAttribute('aria-label','Search type');
    for(const [value,label] of [['author','Author'],['phrase','Theorem / topic']]){const option=el('option',label,selector);option.value=value;}
    selector.value=mode;selector.onchange=()=>show(text,anchor,selector.value);
    el('p',mode==='author'?'Author-field matches • up to 10 links shown. Shared names may refer to different people.':'Title/abstract query • up to 10 links shown',body).className='hint';
    el('h3','Articles',body);
    const list=el('ol',undefined,body);
    link('See search on arXiv ↗',`https://arxiv.org/search/?${new URLSearchParams({query:text,searchtype:mode==='author'?'author':'all'})}`,body);
    const edit=el('details',undefined,body);el('summary','Edit search phrase',edit);
    const form=el('form',undefined,edit);const input=el('input',undefined,form);input.value=text;input.maxLength=500;input.setAttribute('aria-label','Search phrase');
    el('button','Search again',form).type='submit';
    form.onsubmit=event=>{event.preventDefault();const next=core.normalize(input.value);if(next)show(next,anchor,mode);};
    el('p','Highlighted text is automatically sent to arXiv. Pause automatic search in the toolbar panel. Esc closes this box.',body).className='hint';
    document.documentElement.append(host);place();
    count.textContent='No. of arXiv articles: searching…';
    pending={text,mode,request,count,list};drain();
    place();
  }
  async function drain() {
    if(running || !pending)return;
    running=true;const job=pending;pending=null;
    try {
      const response=await chrome.runtime.sendMessage({type:'SEARCH_ARXIV',query:job.text,mode:job.mode});
      if(job.request!==serial || !host)return;
      if(!response?.ok)throw new Error(response?.error || 'Reload this webpage after reloading the extension.');
      const result=core.parseFeed(response.xml);
      job.count.textContent=`No. of arXiv articles${job.mode==='author'?' by author':''}: ${result.total.toLocaleString()}`;
      result.papers.forEach(p=>{const li=el('li',undefined,job.list);link(p.title,p.url,li);el('p','Authors: '+p.authors.join(', '),li).className='hint';});
      if(result.total===0)el('li','No matches for this search. Try another spelling under Edit search phrase.',job.list);
      const date=el('p',`${response.cached?'Cached':'Retrieved'} ${new Date(response.at).toLocaleString()}`,job.list.parentNode);date.className='hint';
      place();

    } catch(error) {
      if(job.request===serial && host){job.count.textContent='No. of arXiv articles: unavailable';el('li',error.message,job.list);place();}
    } finally {running=false;drain();}
  }
  function schedule(event) {
    if(!enabled || !event.isTrusted || event.composedPath().includes(host))return;
    if(event.type==='keyup' && !['Shift','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
    const target=event.target;
    if(target instanceof Element && (target.closest('input,textarea,select') || target.isContentEditable))return;
    clearTimeout(timer);
    // Invalidate a previous response as soon as a new selection gesture ends.
    close();
    timer=setTimeout(()=>{
      const selection=window.getSelection();
      if(!selection || selection.isCollapsed || !selection.rangeCount)return;
      const node=selection.anchorNode?.parentElement;
      if(node?.closest('input,textarea,select') || node?.isContentEditable)return;
      const text=core.normalize(selection.toString());
      if(text.length<3 || text.length>500)return;
      const rect=selection.getRangeAt(0).getBoundingClientRect();
      if(!rect.width && !rect.height)return;
      show(text,{left:rect.left,top:rect.top,bottom:rect.bottom});
    },650);
  }
  document.addEventListener('mouseup',schedule);
  document.addEventListener('keyup',schedule);
  document.addEventListener('keydown',event=>{if(event.key==='Escape')close();});
  document.addEventListener('mousedown',event=>{if(host && !event.composedPath().includes(host))close();});
  window.addEventListener('resize',close);
  document.addEventListener('scroll',event=>{if(host && !event.composedPath().includes(host))close();},true);
})();
