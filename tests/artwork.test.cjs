// Verify observable artwork selection and redraw behavior without browser or npm dependencies.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'dist/app.js'), 'utf8');
const art = fs.readFileSync(path.join(root, 'dist/product-art.js'), 'utf8');
const calc = fs.readFileSync(path.join(root, 'dist/calc.js'), 'utf8');

class Element {
  constructor() { this.attributes = {}; this.style = {}; this.textContent = ''; this.hidden = false; this.writes = 0; this.html = ''; this.classList = {toggle() {}}; }
  getAttribute(name) { return this.attributes[name] === undefined ? null : this.attributes[name]; }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  get innerHTML() { return this.html; }
  set innerHTML(value) { this.html = value; this.writes++; }
}
const elements = new Map();
function $(id) { if (!elements.has(id)) elements.set(id, new Element()); return elements.get(id); }
const context = {console, document: {body: new Element()}, $, demo: false,
  state: {displayMode: 'private', wishes: [], incomePeriod: 'month', settings: {mode: 'all'}},
  current: () => new Date(2026, 10, 6, 10), renderOffer() {}};
context.window = context;
vm.createContext(context);
vm.runInContext(calc, context, {filename: 'calc.js'});
vm.runInContext(art, context, {filename: 'product-art.js'});
const Art = context.WNFArt;
const catalog = context.WNF.catalog;
const byId = new Map(catalog.map(item => [item.id, item]));
let assertions = 0;
function check(condition, message) { assert(condition, message); assertions++; }

check(Art && typeof Art.render === 'function' && typeof Art.ids === 'function' && typeof Art.has === 'function', 'model art API is available');
const ids = Array.from(Art.ids());
check(ids.length > 0 && ids.length === new Set(ids).size, 'registry lists unique stable product identifiers');
for (const id of ids) {
  check(byId.has(id), 'model art identifier must remain a catalog product: ' + id);
  const svg = Art.render(byId.get(id));
  check(typeof svg === 'string' && /^<svg\b/.test(svg) && /<\/svg>$/.test(svg), id + ' returns a complete SVG');
  check(/viewBox=["']0 0 280 250["']/.test(svg), id + ' uses the app clipping canvas');
  check(!/<script\b|<foreignObject\b|\bon\w+\s*=|(?:href|src)=["'](?:https?:|javascript:)/i.test(svg), id + ' is standalone static artwork');
  check(!/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-f]+);)/i.test(svg), id + ' brand text can be exported as standalone SVG XML');
  check(Art.has(id), id + ' is discoverable');
}
check(Art.render({id: 'wish:custom', kind: 'speaker', name: 'HomePod'}) === '', 'a custom wish is not silently represented as a branded SKU');
check(!Art.has('missing-product'), 'unknown IDs are not advertised');
check(Art.render({id: '__proto__', kind: 'camera'}) === '' && !Art.has('constructor'), 'object prototype keys cannot be mistaken for registered product art');

function geometry(svg) {
  return (svg.match(/<(?:path|rect|circle|ellipse|line|polygon|polyline)\b[^>]*>/g) || []).map(tag => {
    const name = tag.match(/^<(\w+)/)[1];
    const values = Array.from(tag.matchAll(/\b(d|x|y|x1|x2|y1|y2|width|height|rx|ry|cx|cy|r|points|transform)=["']([^"']*)["']/g)).map(match => match[1] + '=' + match[2]);
    return name + ':' + values.join(';');
  }).join('|');
}
const distinctGroups = [
  ['DJI cameras', ['zdm:185252215', 'official:dji-osmo-action-6', 'official:dji-ronin-4d-6k']],
  ['mirrorless bodies', ['zdm:185327542', 'zdm:184770144']],
  ['speaker silhouettes', ['official:apple-homepod-mini-2', 'official:apple-homepod-2', 'official:bo-beosound-a9-gold', 'official:bo-beosound-theatre']],
  ['portable JBL speakers', ['zdm:185297939', 'zdm:181090180']],
  ['DJI aircraft', ['official:dji-mini-5-pro', 'official:dji-flip-rc-2', 'official:dji-inspire-3']],
  ['earbud constructions', ['official:apple-airpods-5', 'official:apple-airpods-pro-3', 'zdm:184896912', 'zdm:184925040', 'zdm:185337312']],
  ['watch cases', ['official:apple-watch-se-3', 'official:apple-watch-series-12', 'official:apple-watch-ultra-4']],
  ['mouse shapes', ['zdm:185184612', 'zdm:185337589', 'zdm:185337480', 'zdm:184765742']],
  ['keyboard layouts', ['zdm:185429283', 'zdm:185430962', 'zdm:185444388', 'zdm:185361162']],
  ['LEGO builds', ['zdm:185467825', 'zdm:185467835', 'zdm:185278207', 'zdm:185279230']]
];
for (const [name, group] of distinctGroups) {
  for (const id of group) check(Art.has(id), name + ' has model art for ' + id);
  check(new Set(group.map(id => geometry(Art.render(byId.get(id))))).size === group.length, name + ' differ by geometry rather than label alone');
}
check(geometry(Art.render(byId.get('official:apple-mac-studio-m5-max'))) === geometry(Art.render(byId.get('official:apple-mac-studio-m5-ultra'))), 'real shared Mac Studio enclosures are not given invented geometry differences');

// Run the real presentation functions against a tiny DOM; no salary state is changed.
const functionStart = app.indexOf('function productSVG(');
const displayStart = app.indexOf('function renderDisplay(', functionStart);
assert(functionStart >= 0 && displayStart > functionStart);
vm.runInContext(app.slice(functionStart, displayStart), context);
const displayEnd = app.indexOf('\n', displayStart);
vm.runInContext(app.slice(displayStart, displayEnd), context);
let selected;
context.C = {anchor: () => selected, dailyTarget: () => 100};
function anchor(id, progress) { const item = byId.get(id); return {id, kind: item.kind, name: item.name, progress, own: false, reference: item}; }
const values = {total: 100};
const settings = {salary: 10000, mode: 'all'};
selected = anchor('zdm:185252215', 0.25);
context.renderDisplay(values, settings);
const first = $('product-art').innerHTML;
const firstWrites = $('product-art').writes;
const firstSvg = Art.render(byId.get(selected.id));
check(first.split(firstSvg).length === 3, 'gray and unlocked layers contain the exact same model drawing');
check($('product-fill').style.width === '25%', 'the existing unlock percentage still controls the color layer');
selected.progress = 0.5;
context.renderDisplay(values, settings);
check($('product-art').writes === firstWrites, 'a progress tick updates its mask without rebuilding the model');
check($('product-fill').style.width === '50%', 'progress continues after cached drawing');
selected = anchor('official:dji-osmo-action-6', 0.5);
context.renderDisplay(values, settings);
check($('product-art').innerHTML !== first, 'switching two camera SKUs changes the visible art');
check($('product-art').getAttribute('data-art') === selected.id, 'cache tracks the selected model ID');
check($('product-art').getAttribute('data-kind') === 'camera', 'category metadata remains available');
selected = {id: 'wish:mutable', kind: 'camera', name: '自己的相机', progress: 0.2, own: true, reference: null};
context.renderDisplay(values, settings);
const customCamera = $('product-art').innerHTML;
selected.kind = 'phone'; selected.name = '自己的手机';
context.renderDisplay(values, settings);
check($('product-art').innerHTML !== customCamera, 'editing a custom wish can change its category while retaining the wish ID');
const sourceBefore = JSON.stringify(context.state);
const custom = context.productSVG({id: 'wish:example', kind: 'camera', name: '自己的相机'});
check(/^<svg\b/.test(custom) && custom === context.categorySVG('camera'), 'custom wishes retain the generic category illustration');
check(context.productSVG('camera') === custom, 'legacy category-only callers still receive a drawing');
check(JSON.stringify(context.state) === sourceBefore, 'art rendering is read-only');

console.log(assertions + ' model artwork / same-category redraw / unlock compatibility checks passed');
