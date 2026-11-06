// Test the presentation controller independently from salary, reminders and storage.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

class Events {
  constructor() { this.listeners = {}; }
  addEventListener(type, fn, options) {
    const capture = options === true || !!(options && options.capture);
    (this.listeners[type] || (this.listeners[type] = [])).push({fn, capture});
  }
  removeEventListener(type, fn, options) {
    const capture = options === true || !!(options && options.capture);
    this.listeners[type] = (this.listeners[type] || []).filter(item => item.fn !== fn || item.capture !== capture);
  }
  emit(type, properties = {}) {
    const event = {type, target: this, ...properties, preventDefault() { this.defaultPrevented = true; }, stopPropagation() { this.stopped = true; }};
    for (const item of [...(this.listeners[type] || [])]) item.fn(event);
    return event;
  }
  count() { return Object.values(this.listeners).reduce((sum, list) => sum + list.length, 0); }
}
class Element extends Events {
  constructor(tag, doc) {
    super(); this.tagName = tag.toUpperCase(); this.ownerDocument = doc; this.children = [];
    this.attributes = {}; this.style = {}; this.className = ''; this.hidden = false; this._text = '';
    this.rect = {left: 20, top: 40, right: 86, bottom: 102, width: 66, height: 62};
    this.offsetHeight = 160; this.scrollCalls = 0;
    this.classList = {
      contains: name => this.className.split(/\s+/).includes(name),
      add: name => { if (!this.classList.contains(name)) this.className += ' ' + name; },
      remove: name => { this.className = this.className.split(/\s+/).filter(item => item !== name).join(' '); }
    };
  }
  set id(value) { this.attributes.id = value; }
  get id() { return this.attributes.id || ''; }
  set textContent(value) { this._text = String(value); this.children = []; }
  get textContent() { return this._text + this.children.map(child => child.textContent).join(''); }
  get isConnected() { return this === this.ownerDocument.documentElement || !!(this.parentNode && this.parentNode.isConnected); }
  setAttribute(key, value) { this.attributes[key] = String(value); }
  getAttribute(key) { return this.attributes[key] === undefined ? null : this.attributes[key]; }
  removeAttribute(key) { delete this.attributes[key]; }
  appendChild(node) { node.parentNode = this; this.children.push(node); return node; }
  contains(node) { return this === node || this.children.some(child => child.contains(node)); }
  getBoundingClientRect() { return this.rect; }
  getClientRects() {
    for (let node = this; node; node = node.parentNode) if (node.hidden) return [];
    return [this.rect];
  }
  scrollIntoView() { this.scrollCalls++; }
  focus() { this.ownerDocument.activeElement = this; this.ownerDocument.emit('focusin', {target: this}); }
  click() {
    const event = {type: 'click', target: this, preventDefault() { this.defaultPrevented = true; }, stopPropagation() { this.stopped = true; }};
    const ancestors = []; for (let node = this; node; node = node.parentNode) ancestors.unshift(node);
    for (const node of ancestors) {
      for (const item of node.listeners.click || []) if (item.capture) item.fn(event);
      if (event.stopped) return event;
    }
    for (const node of ancestors.reverse()) {
      for (const item of node.listeners.click || []) if (!item.capture) item.fn(event);
      if (event.stopped) break;
    }
    return event;
  }
}
function flatten(node) { return [node, ...node.children.flatMap(flatten)]; }
class Document extends Events {
  constructor() {
    super(); this.documentElement = new Element('html', this); this.body = new Element('body', this);
    this.documentElement.appendChild(this.body); this.activeElement = this.body;
  }
  createElement(tag) { return new Element(tag, this); }
  getElementById(id) { return flatten(this.documentElement).find(node => node.id === id) || null; }
  querySelector(tag) { return flatten(this.documentElement).find(node => node.tagName === tag.toUpperCase()) || null; }
}
const source = fs.readFileSync(path.join(__dirname, '../dist/guide.js'), 'utf8');
function harness(options = {}) {
  const doc = new Document(), win = new Events(), scheduled = new Map();
  let serial = 0, storageWrites = 0, modeClicks = 0;
  const main = doc.createElement('main'); doc.body.appendChild(main);
  const left = doc.createElement('button'); left.id = 'view-toggle'; main.appendChild(left);
  const right = doc.createElement('button'); right.id = 'time-toggle'; main.appendChild(right);
  right.rect = {left: 304, top: 40, right: 370, bottom: 102, width: 66, height: 62};
  [left, right].forEach(node => node.addEventListener('click', () => modeClicks++));
  const oldFocus = doc.createElement('button'); oldFocus.id = 'previous-focus'; main.appendChild(oldFocus); oldFocus.focus();
  const schedule = fn => { const id = ++serial; scheduled.set(id, fn); return id; };
  Object.assign(win, {document: doc, innerWidth: 390, innerHeight: 844, setTimeout: schedule, clearTimeout: id => scheduled.delete(id),
    requestAnimationFrame: options.noRAF ? undefined : schedule, cancelAnimationFrame: id => scheduled.delete(id)});
  win.window = win;
  vm.runInNewContext(source, {window: win, document: doc, Math, console, localStorage: {setItem() { storageWrites++; }}}, {filename: 'guide.js'});
  return {doc, win, main, left, right, oldFocus, scheduled, api: win.WNFGuide,
    get writes() { return storageWrites; }, get modeClicks() { return modeClicks; },
    el(id) { const node = doc.getElementById(id); assert(node, 'missing #' + id); return node; },
    flush() { for (const [id, fn] of [...scheduled]) { scheduled.delete(id); fn(); } },
    key(key, shiftKey = false) { return doc.emit('keydown', {key, shiftKey}); }
  };
}
let checks = 0;
function test(name, fn) { try { fn(); checks++; } catch (error) { error.message = name + ': ' + error.message; throw error; } }

test('does not open or access storage on script load', () => {
  const h = harness(); assert(!h.api.isOpen()); assert.equal(h.doc.getElementById('coach-guide'), null); assert.equal(h.writes, 0);
});
test('creates a two-step accessible presentation', () => {
  const h = harness(); assert(h.api.start()); assert(h.api.isOpen()); assert(!h.el('coach-guide').hidden);
  assert.equal(h.el('coach-step').textContent, '1 / 2'); assert.match(h.el('coach-copy').textContent, /金额.*脱敏/);
  assert.equal(h.el('coach-title').parentNode.getAttribute('role'), 'dialog');
  assert.equal(h.doc.activeElement, h.el('coach-next')); assert.equal(h.main.getAttribute('aria-hidden'), 'true');
});
test('advance changes only the explanation and spotlight', () => {
  const h = harness(); let completed = 0; h.api.start(() => completed++);
  const root = h.el('coach-guide'); const spot = root.children.find(node => node.className === 'coach-spot');
  const firstLeft = spot.style.left; h.el('coach-next').click();
  assert.equal(h.el('coach-step').textContent, '2 / 2'); assert.match(h.el('coach-copy').textContent, /全天.*仅工作/);
  assert.equal(h.el('coach-next').textContent, '知道了'); assert.notEqual(spot.style.left, firstLeft);
  assert.equal(h.modeClicks, 0); assert.equal(h.writes, 0); assert.equal(completed, 0);
});
test('completion invokes the supplied callback exactly once', () => {
  const h = harness(); let completed = 0; h.api.start(() => completed++);
  h.el('coach-next').click(); h.el('coach-next').click(); h.el('coach-next').click(); h.el('coach-skip').click();
  assert.equal(completed, 1); assert(!h.api.isOpen()); assert(h.el('coach-guide').hidden);
});
test('skip and Escape are explicit completion paths', () => {
  for (const action of ['skip', 'escape']) {
    const h = harness(); let completed = 0; h.api.start(() => completed++);
    if (action === 'skip') h.el('coach-skip').click(); else { const event = h.key('Escape'); assert(event.defaultPrevented); assert(event.stopped); }
    h.key('Escape'); assert.equal(completed, 1); assert(!h.api.isOpen());
  }
});
test('programmatic close never marks the guide completed', () => {
  const h = harness(); let completed = 0; h.api.start(() => completed++); h.api.close(); h.api.close();
  assert.equal(completed, 0); assert(!h.api.isOpen()); assert.equal(h.doc.activeElement, h.oldFocus);
});
test('repeated start does not duplicate or reset an active guide', () => {
  const h = harness(); let original = 0, replacement = 0; h.api.start(() => original++); h.el('coach-next').click();
  const root = h.el('coach-guide'); assert.equal(h.api.start(() => replacement++), false);
  assert.equal(h.el('coach-step').textContent, '2 / 2'); assert.equal(h.el('coach-guide'), root);
  assert.equal(flatten(h.doc.documentElement).filter(node => node.id === 'coach-guide').length, 1);
  h.el('coach-next').click(); assert.equal(original, 1); assert.equal(replacement, 0);
});
test('reopen reuses markup and begins at the first explanation', () => {
  const h = harness(); h.api.start(); const root = h.el('coach-guide'); h.el('coach-next').click(); h.api.close();
  h.api.start(); assert.equal(h.el('coach-guide'), root); assert.equal(h.el('coach-step').textContent, '1 / 2');
});
test('spotlight and masks do not click real mode controls', () => {
  const h = harness(); h.api.start(); const root = h.el('coach-guide');
  for (const node of root.children.filter(node => node !== h.el('coach-title').parentNode)) assert(node.click().defaultPrevented);
  assert.equal(h.modeClicks, 0); assert.equal(h.writes, 0); assert(h.api.isOpen());
});
test('Tab cycles within the two guide actions', () => {
  const h = harness(); h.api.start();
  assert(h.key('Tab', true).defaultPrevented); assert.equal(h.doc.activeElement, h.el('coach-skip'));
  assert(h.key('Tab').defaultPrevented); assert.equal(h.doc.activeElement, h.el('coach-next'));
  h.left.focus(); assert.equal(h.doc.activeElement, h.el('coach-next')); assert.equal(h.modeClicks, 0);
});
test('closing restores background attributes and focus', () => {
  const h = harness(); h.main.setAttribute('aria-hidden', 'false'); h.main.classList.add('unrelated');
  h.api.start(); h.api.close(); assert.equal(h.main.getAttribute('aria-hidden'), 'false');
  assert(h.main.classList.contains('unrelated')); assert(!h.doc.body.classList.contains('coach-open'));
  assert.equal(h.doc.activeElement, h.oldFocus); assert.equal(h.doc.count(), 0); assert.equal(h.win.count(), 0);
});
test('an originally absent aria-hidden attribute stays absent', () => {
  const h = harness(); h.api.start(); h.api.close(); assert.equal(h.main.getAttribute('aria-hidden'), null);
});
test('hidden modal focus falls back to the currently highlighted control', () => {
  const h = harness(); h.api.start(); h.el('coach-next').click(); h.oldFocus.hidden = true;
  h.api.close(); assert.equal(h.doc.activeElement, h.right); assert.equal(h.modeClicks, 0);
});
test('detached modal focus falls back to a connected control', () => {
  const h = harness(); h.api.start(); h.main.children = h.main.children.filter(node => node !== h.oldFocus); h.oldFocus.parentNode = null;
  h.api.close(); assert.equal(h.doc.activeElement, h.left); assert.equal(h.modeClicks, 0);
});
test('resize and scroll reposition through a coalesced frame', () => {
  const h = harness(); h.api.start(); h.win.innerWidth = 430;
  h.left.rect = {...h.left.rect, left: 44, right: 110}; h.win.emit('resize'); h.doc.emit('scroll'); h.win.emit('resize');
  assert.equal(h.scheduled.size, 1); h.flush();
  const root = h.el('coach-guide'), spot = root.children.find(node => node.className === 'coach-spot');
  const top = root.children.find(node => node.className.includes('coach-mask-top'));
  assert.equal(spot.style.left, '37px'); assert.equal(top.style.width, '430px'); assert.equal(h.modeClicks, 0);
});
test('close cancels pending layout work and removes listeners', () => {
  const h = harness(); h.api.start(); h.win.emit('resize'); assert.equal(h.scheduled.size, 1);
  h.api.close(); assert.equal(h.scheduled.size, 0); assert.equal(h.doc.count(), 0); assert.equal(h.win.count(), 0);
  h.win.emit('resize'); h.doc.emit('scroll'); assert.equal(h.scheduled.size, 0);
});
test('layout also works without requestAnimationFrame', () => {
  const h = harness({noRAF: true}); h.api.start(); h.win.emit('resize'); assert.equal(h.scheduled.size, 1); h.flush(); assert(h.api.isOpen());
  h.win.emit('resize'); h.api.close(); assert.equal(h.scheduled.size, 0);
});
test('a missing initial target does not cover the page', () => {
  const h = harness(); h.left.id = 'not-a-target'; let completed = 0;
  assert.equal(h.api.start(() => completed++), false); assert(!h.api.isOpen()); assert.equal(completed, 0);
  assert.equal(h.main.getAttribute('aria-hidden'), null); assert.equal(h.doc.getElementById('coach-guide'), null);
});
test('a disappeared target closes safely without claiming completion', () => {
  const h = harness(); let completed = 0; h.api.start(() => completed++); h.right.id = 'not-a-target'; h.el('coach-next').click();
  assert(!h.api.isOpen()); assert.equal(completed, 0); assert.equal(h.doc.count(), 0);
});
test('a small viewport keeps the explanation within its bounds', () => {
  const h = harness(); h.win.innerWidth = 280; h.win.innerHeight = 270; h.api.start();
  const card = h.el('coach-title').parentNode;
  assert.equal(card.style.width, '248px'); assert(Number.parseFloat(card.style.left) >= 16);
  assert(Number.parseFloat(card.style.left) + Number.parseFloat(card.style.width) <= 264);
  assert(Number.parseFloat(card.style.top) >= 16); assert(Number.parseFloat(card.style.top) + card.offsetHeight <= 254);
});
console.log(checks + ' onboarding guide lifecycle / focus / read-only presentation checks passed');
