import {getDocument,GlobalWorkerOptions,TextLayer} from './vendor/pdfjs/build/pdf.mjs';
GlobalWorkerOptions.workerSrc=chrome.runtime.getURL('vendor/pdfjs/build/pdf.worker.mjs');
const $=id=>document.getElementById(id);
let pdf=null,loading=null,busy=false,epoch=0;
function controls(){for(const id of ['page','zoom'])$(id).disabled=busy||!pdf;$('prev').disabled=busy||!pdf||Number($('page').value)<=1;$('next').disabled=busy||!pdf||Number($('page').value)>=pdf.numPages;}
async function render(){
 if(!pdf||busy)return;busy=true;controls();const current=epoch;
 try{
  const n=Math.max(1,Math.min(pdf.numPages,Number($('page').value)||1));$('page').value=n;
  const page=await pdf.getPage(n);if(current!==epoch)return;
  const viewport=page.getViewport({scale:Number($('zoom').value)});
  const box=document.createElement('div');box.className='pdfPage';box.style.width=viewport.width+'px';box.style.height=viewport.height+'px';box.style.setProperty('--scale-factor',viewport.scale);box.style.setProperty('--total-scale-factor',viewport.scale);
  const canvas=document.createElement('canvas');const ratio=Math.min(devicePixelRatio||1,2);canvas.width=Math.ceil(viewport.width*ratio);canvas.height=Math.ceil(viewport.height*ratio);canvas.style.width=viewport.width+'px';canvas.style.height=viewport.height+'px';box.append(canvas);
  const layer=document.createElement('div');layer.className='textLayer';box.append(layer);$('pages').replaceChildren(box);
  await page.render({canvasContext:canvas.getContext('2d'),viewport,transform:[ratio,0,0,ratio,0,0]}).promise;
  const text=await page.getTextContent();await new TextLayer({textContentSource:text,container:layer,viewport}).render();
  if(current===epoch)$('status').textContent=text.items.some(x=>x.str?.trim())?'Highlight a name or topic to automatically search arXiv.':'This page has no selectable text. Scanned pages need OCR, which is not included.';
 }catch(e){if(current===epoch)$('status').textContent='Could not display this page: '+e.message;}
 finally{if(current===epoch){busy=false;controls();}}
}
async function open(data){
 const current=++epoch;busy=true;pdf=null;controls();$('pages').replaceChildren();$('total').textContent='/ 0';$('status').textContent='Loading PDF…';
 try{
  if(loading)await loading.destroy();
  if(current!==epoch)return;
  loading=getDocument({data,isEvalSupported:false,cMapUrl:chrome.runtime.getURL('vendor/pdfjs/cmaps/'),cMapPacked:true,standardFontDataUrl:chrome.runtime.getURL('vendor/pdfjs/standard_fonts/'),wasmUrl:chrome.runtime.getURL('vendor/pdfjs/wasm/')});
  pdf=await loading.promise;if(current!==epoch)return;
  $('total').textContent='/ '+pdf.numPages;$('page').max=pdf.numPages;$('page').value=1;busy=false;await render();
 }catch(e){if(current===epoch){$('status').textContent='Could not open PDF: '+e.message;busy=false;controls();}}
}
$('file').onchange=async()=>{const f=$('file').files[0];if(f)await open(new Uint8Array(await f.arrayBuffer()));};
async function openRemote(requestPermission=true){
 try{
  const url=new URL($('url').value);if(!['https:','http:'].includes(url.protocol))throw Error('Use an HTTP or HTTPS PDF address.');
  const permission={origins:[url.origin+'/*']};
  const allowed=requestPermission?await chrome.permissions.request(permission):await chrome.permissions.contains(permission);if(!allowed)throw Error('Access was not granted. Download the PDF and open the local file instead.');
  $('status').textContent='Downloading PDF…';const response=await fetch(url.href,{credentials:'omit',signal:AbortSignal.timeout(60000)});if(!response.ok)throw Error('HTTP '+response.status);
  await open(new Uint8Array(await response.arrayBuffer()));
 }catch(e){$('status').textContent='Could not fetch PDF: '+e.message+' You can also download it and use Open local PDF.';}
}
$('remote').onsubmit=event=>{event.preventDefault();openRemote();};
$('prev').onclick=()=>{$('page').value=Number($('page').value)-1;render();};$('next').onclick=()=>{$('page').value=Number($('page').value)+1;render();};$('page').onchange=render;$('zoom').onchange=render;
chrome.storage.local.get('highlightEnabled').then(x=>$('auto').checked=x.highlightEnabled!==false);$('auto').onchange=()=>chrome.storage.local.set({highlightEnabled:$('auto').checked});
async function loadFromTab(){
 try{
  if(new URLSearchParams(location.search).has('local')){$('status').textContent='Choose this PDF using Open local PDF above.';return;}
  if(!location.hash)return;
  const url=new URL(decodeURIComponent(location.hash.slice(1)));
  if(!['https:','http:'].includes(url.protocol))throw Error('Use Open local PDF for this document.');
  $('url').value=url.href;
  if(await chrome.permissions.contains({origins:[url.origin+'/*']}))await openRemote(false);
  else $('status').textContent='Your PDF address is ready. Click Open URL to grant access and enter reading mode.';
 }catch(error){$('status').textContent=error.message;}
}
loadFromTab();
