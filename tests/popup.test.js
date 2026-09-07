import {test} from 'node:test';
import assert from 'node:assert/strict';
import '../extension/popup-core.js';
const c=globalThis.MathaCartaPopupCore;
test('popup stays inside right and bottom edges',()=>{const p=c.position({left:980,top:680,bottom:700},380,420,1000,720);assert.ok(p.left+380<=992);assert.ok(p.top+420<=712);assert.ok(p.top>=8);});
test('popup recognizes author names',()=>{assert.equal(c.isLikelyAuthor('Andrew Wiles'),true);assert.equal(c.isLikelyAuthor('Fermat’s Last Theorem'),false);});
test('popup has a left margin on small screens',()=>assert.equal(c.position({left:0,top:0,bottom:10},300,200,320,640).left,8));
test('popup rejects executable or foreign article links',()=>{assert.equal(c.safePaper('javascript:alert(1)'),null);assert.equal(c.safePaper('https://evil.test/abs/x'),null);assert.equal(c.safePaper('http://arxiv.org/abs/1234.5'),'https://arxiv.org/abs/1234.5');});
