import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { SKILLS } from '../data/skills.js';
import { filterSkills, normalizeFilters, renderSkills } from '../skills-render.js';

test('catalog has unique ids and public HTTPS destinations', () => {
  assert.ok(SKILLS.length >= 4);
  assert.equal(new Set(SKILLS.map(s => s.id)).size, SKILLS.length);
  for (const skill of SKILLS) {
    assert.equal(new URL(skill.url).protocol, 'https:');
    assert.ok(skill.description && skill.author && skill.category);
  }
});
test('search and category/source filters compose without changing source data', () => {
  const before = JSON.stringify(SKILLS);
  assert.deepEqual(filterSkills(SKILLS, {q:'PDF', category:'文档处理', source:'external'}).map(s=>s.id), ['pdf']);
  assert.equal(filterSkills(SKILLS, {q:'PDF',category:'开发与测试',source:'all'}).length, 0);
  assert.equal(filterSkills(SKILLS, {q:'  ANTHROPIC  ',category:'all',source:'external'}).length, 4);
  assert.equal(JSON.stringify(SKILLS), before);
});
test('unknown filters normalize and URL search strings remain plain text', () => {
  assert.deepEqual(normalizeFilters(new URLSearchParams('category=bad&source=bad&q=%3Cscript%3E')), {q:'<script>',category:'all',source:'all'});
  assert.equal(filterSkills(SKILLS, {q:'<script>',category:'all',source:'all'}).length,0);
});
test('rendered static cards escape content and reject unsafe URLs', () => {
  const card={...SKILLS[0],name:'<img onerror="x">',description:'A & B'};
  const html=renderSkills([card]);
  assert.ok(html.includes('&lt;img'));
  assert.ok(html.includes('A &amp; B'));
  assert.ok(!html.includes('<img'));
  assert.throws(()=>renderSkills([{...card,url:'javascript:alert(1)'}]),/HTTPS/);
  assert.equal((renderSkills(SKILLS).match(/data-skill-id=/g)||[]).length,SKILLS.length);
});
test('hub is discoverable from every page and builds static links', async () => {
  for (const page of ['index','projects','agent-tooling','notes','updates','about','skills']) {
    const html=await readFile(new URL('../'+page+'.html',import.meta.url),'utf8');
    assert.ok(html.includes('href="./skills.html"'),page);
  }
  const html=await readFile(new URL('../skills.html',import.meta.url),'utf8');
  assert.ok(html.includes('<!-- SKILL_CARDS -->'));
  assert.ok(html.includes('https://github.com/CS-wude/skillhub'));
});

test('typing all remains a search term and matches the same URL deep link', async () => {
  const listeners = new Map();
  const control = value => ({ value, hidden: false, addEventListener(type, fn) { listeners.set(this.value + type, fn); } });
  const search = control('');
  const category = control('all');
  const source = control('all');
  const count = {};
  const reset = control('reset');
  const empty = {};
  const fields = {'[name="q"]': search, '[name="category"]': category, '[name="source"]': source};
  const form = {querySelector: selector => fields[selector], addEventListener() {}};
  const elements = {'#skillFilters': form, '#skillCount': count, '#skillEmpty': empty, '#skillReset': reset, '#skillEmptyReset': control('empty')};
  const saved = new Map(['document', 'window', 'location', 'history'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  const location = new URL('https://example.com/skills.html');
  try {
    Object.assign(globalThis, {
      document: {querySelector: selector => elements[selector], querySelectorAll: () => []},
      window: {addEventListener() {}}, location,
      history: {replaceState(_state, _title, url) { location.href = url.href; }},
    });
    await import('../skills.js?search-all-regression');
    search.value = 'all';
    listeners.get('input')();
    assert.equal(location.searchParams.get('q'), 'all');
    assert.equal(count.textContent, '显示 0 / 4 个技能');
    assert.equal(reset.hidden, false);
  } finally {
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
});
