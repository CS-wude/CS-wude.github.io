import assert from 'node:assert/strict';
import test from 'node:test';
import { enhanceSelect } from '../select-menu.js';

// A small DOM adapter lets the real control's events run in Node without dependencies.
class Element extends EventTarget {
  constructor(ownerDocument) {
    super();
    this.ownerDocument = ownerDocument;
    this.children = [];
    this.attributes = new Map();
    this.classes = new Set();
    this.classList = { toggle: (name, on) => on ? this.classes.add(name) : this.classes.delete(name) };
    this.style = {};
  }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  removeAttribute(name) { this.attributes.delete(name); }
  append(...nodes) { nodes.forEach(node => { node.parentElement = this; this.children.push(node); }); }
  after(node) { this.nextElementSibling = node; }
  contains(node) { return this === node || this.children.some(child => child.contains(node)); }
  focus() { this.ownerDocument.activeElement = this; }
  scrollIntoView() {}
  getBoundingClientRect() { return {top: 200, bottom: 246}; }
  get selectedIndex() { return this.options.findIndex(option => option.value === this.value); }
}

function fixture(options = ['全部分类', '技能创作', '文档处理']) {
  const doc = new EventTarget();
  doc.defaultView = {innerHeight: 800, Event};
  doc.createElement = () => new Element(doc);
  const select = new Element(doc);
  select.id = 'category';
  select.labels = [{id: 'category-label'}];
  select.options = options.map((label, index) => ({label, value: index === 0 ? 'all' : label}));
  select.value = 'all';
  const menu = enhanceSelect(select);
  const [trigger, list] = select.nextElementSibling.children;
  const key = key => {
    const event = new Event('keydown', {cancelable: true});
    Object.defineProperty(event, 'key', {value: key});
    trigger.dispatchEvent(event);
    return event;
  };
  return {doc, select, menu, trigger, list, key};
}

test('custom select keeps one committed value and dispatches the existing filter change', () => {
  const {select, trigger, list, doc} = fixture();
  let changes = 0;
  select.addEventListener('change', () => changes++);
  assert.equal(select.hidden, true);
  assert.equal(trigger.getAttribute('role'), 'combobox');
  assert.equal(trigger.getAttribute('aria-expanded'), 'false');
  trigger.dispatchEvent(new Event('click'));
  list.children[2].dispatchEvent(new Event('click'));
  assert.equal(select.value, '文档处理');
  assert.equal(trigger.children[0].textContent, '文档处理');
  assert.equal(changes, 1);
  assert.equal(trigger.getAttribute('aria-expanded'), 'false');
  assert.equal(doc.activeElement, trigger);
});

test('keyboard exploration and Escape leave the committed selection unchanged', () => {
  const {select, trigger, list, key} = fixture();
  key('ArrowDown');
  key('ArrowDown');
  assert.equal(trigger.getAttribute('aria-activedescendant'), list.children[1].id);
  assert.equal(select.value, 'all');
  key('Escape');
  assert.equal(select.value, 'all');
  assert.equal(trigger.getAttribute('aria-expanded'), 'false');
  assert.equal(trigger.getAttribute('aria-activedescendant'), null);
});

test('Home/End, Enter and Tab commit choices while preserving normal Tab navigation', () => {
  const {select, key} = fixture();
  key('End');
  key('Enter');
  assert.equal(select.value, '文档处理');
  key('Home');
  const tab = key('Tab');
  assert.equal(select.value, 'all');
  assert.equal(tab.defaultPrevented, false);
});

test('typing finds an option and outside interaction dismisses without committing a draft', () => {
  const {select, trigger, key, doc} = fixture(['全部来源', '外部来源', 'WUDE 维护']);
  key('w');
  key('Enter');
  assert.equal(select.value, 'WUDE 维护');
  key('Home');
  doc.dispatchEvent(new Event('pointerdown'));
  assert.equal(trigger.getAttribute('aria-expanded'), 'false');
  assert.equal(select.value, 'WUDE 维护');
});

test('reset/deep-link synchronization updates the label and closes an open menu', () => {
  const {select, trigger, list, menu, key} = fixture();
  key('ArrowDown');
  select.value = '文档处理';
  menu.sync();
  assert.equal(trigger.children[0].textContent, '文档处理');
  assert.equal(list.children[2].getAttribute('aria-selected'), 'true');
  assert.equal(trigger.getAttribute('aria-expanded'), 'false');
  select.value = 'all';
  menu.sync();
  assert.equal(trigger.children[0].textContent, '全部分类');
});
