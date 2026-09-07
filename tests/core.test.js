import {test} from 'node:test';
import assert from 'node:assert/strict';
import {cleanText,phraseQuery,authorQuery,isLikelyAuthor,apiUrl,paperUrl} from '../extension/core.js';
test('normalizes selected whitespace',()=> assert.equal(cleanText(' a\n b '),'a b'));
test('rejects an empty query',()=> assert.throws(()=>phraseQuery('   ')));
test('quotes are not allowed to break search syntax',()=> assert.equal(phraseQuery('x" OR au:y'), 'ti:"x OR au:y" OR abs:"x OR au:y"'));
test('encodes mathematical symbols without changing the query',()=> assert.equal(new URL(apiUrl('A & B')).searchParams.get('search_query'), 'ti:"A & B" OR abs:"A & B"'));
test('only accepts arXiv abstract links',()=> {assert.equal(paperUrl('http://arxiv.org/abs/1234.5678v2'),'https://arxiv.org/abs/1234.5678v2'); assert.equal(paperUrl('javascript:alert(1)'),null);assert.equal(paperUrl('https://evil.example/abs/123'),null);});
test('detects highlighted author names but not theorem phrases',()=> {assert.equal(isLikelyAuthor('Andrew Wiles'),true);assert.equal(isLikelyAuthor('Maryam Mirzakhani'),true);assert.equal(isLikelyAuthor("Fermat's Last Theorem"),false);assert.equal(isLikelyAuthor('Pythagorean theorem'),false);});
test('builds an arXiv author query',()=> {assert.equal(authorQuery('Andrew Wiles'),'au:"Andrew Wiles"');assert.equal(new URL(apiUrl('Andrew Wiles',undefined,'author')).searchParams.get('search_query'),'au:"Andrew Wiles"');});
test('Unicode author routing uses author field for totals and yearly counts',()=>{
 for(const name of ['Béla Bollobás','Be\u0301la Bolloba\u0301s','Paul Erdős','László Lovász','J. P. Serre']){
  assert.equal(isLikelyAuthor(name),true,name);
  for(const year of [undefined,2025]){
   const query=new URL(apiUrl(name,year,'author')).searchParams.get('search_query');
   assert.match(query,/au:/);assert.doesNotMatch(query,/ti:|abs:/);
  }
 }
 assert.equal(isLikelyAuthor('Bollobás Theorem'),false);
});
