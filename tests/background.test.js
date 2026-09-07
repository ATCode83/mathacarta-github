import {test} from 'node:test';
import assert from 'node:assert/strict';
function storage() {
  const values={};
  return {values, async get(keys){return Object.fromEntries((Array.isArray(keys)?keys:[keys]).map(k=>[k,values[k]]));}, async set(data){Object.assign(values,data);}};
}
test('background selection, cache and failed-request handling',async()=>{
  const local=storage(),session=storage();let click,message,installed,opened,fetches=0;
  globalThis.chrome={runtime:{id:'test-id',onInstalled:{addListener(fn){installed=fn;}},onMessage:{addListener(fn){message=fn;}}},storage:{local,session},contextMenus:{removeAll(fn){fn();},create(){},onClicked:{addListener(fn){click=fn;}}},sidePanel:{async setPanelBehavior(){},async open(options){opened=options;}}};
  const originalFetch=globalThis.fetch;
  globalThis.fetch=async()=>{fetches++;return {ok:true,async text(){return '<feed></feed>';}};};
  try{
    await import('../extension/background.js');installed();
    click({menuItemId:'mathacarta',selectionText:' theorem\ntext '},{id:1,windowId:7});
    assert.deepEqual(opened,{windowId:7});assert.equal(session.values.selection.text,'theorem text');
    const request=query=>new Promise(resolve=>message({type:'SEARCH_ARXIV',query},{id:'test-id'},resolve));
    const first=await request('tree');assert.equal(first.ok,true);assert.equal(first.cached,false);
    const second=await request('tree');assert.equal(second.cached,true);assert.equal(fetches,1);
    local.values.lastArxivRequest=0;
    globalThis.fetch=async()=>{fetches++;return {ok:false,status:429,headers:{get(){return '60';}}};};
    const failed=await request('another theorem');assert.equal(failed.ok,false);assert.match(failed.error,/429/);
    assert.ok(local.values.arxivBackoffUntil > Date.now()+59000);
    const before=fetches;
    const blocked=await request('third topic');assert.equal(blocked.ok,false);assert.equal(fetches,before);
    assert.equal((await request('tree')).cached,true);
    assert.equal(message({type:'CHECK_REFERENCE',query:'citation'},{id:'test-id'},()=>{}),undefined);
    assert.equal(message({type:'SEARCH_ARXIV',query:'tree'},{id:'foreign'},()=>{}),undefined);
  }finally{globalThis.fetch=originalFetch;delete globalThis.chrome;}
});
