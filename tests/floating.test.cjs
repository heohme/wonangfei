// Browser lifecycle and privacy checks for the H5-only floating view.
// No business timer, storage migration or salary implementation is duplicated here.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

class Events {
  constructor() { this.listeners = new Map(); this.asyncErrors=[]; }
  addEventListener(type, fn) { const list=this.listeners.get(type)||[]; list.push(fn); this.listeners.set(type,list); }
  removeEventListener(type, fn) { this.listeners.set(type,(this.listeners.get(type)||[]).filter(item=>item!==fn)); }
  dispatchEvent(event) {
    if(typeof event==='string')event={type:event};
    if(!event.target)event.target=this;
    event.currentTarget=this;
    event.preventDefault=event.preventDefault||function(){this.defaultPrevented=true;};
    for(const fn of [...(this.listeners.get(event.type)||[])]){const result=fn.call(this,event);if(result&&typeof result.catch==='function')result.catch(error=>this.asyncErrors.push(error));}
    if(typeof this['on'+event.type]==='function')this['on'+event.type](event);
    if(event.bubbles&&this.parentNode)this.parentNode.dispatchEvent(event);
    return !event.defaultPrevented;
  }
}

class Element extends Events {
  constructor(tag, doc) {
    super();this.tagName=tag.toUpperCase();this.ownerDocument=doc;this.children=[];
    this.attributes={};this.dataset={};this.style={setProperty(k,v){this[k]=v;},removeProperty(k){delete this[k];}};
    this.hidden=false;this.disabled=false;this._text='';this._html='';this.className='';
    this.classList={
      add:(...names)=>{this.className=[...new Set(this.className.split(/\s+/).filter(Boolean).concat(names))].join(' ');},
      remove:(...names)=>{this.className=this.className.split(/\s+/).filter(n=>!names.includes(n)).join(' ');},
      contains:name=>this.className.split(/\s+/).includes(name),
      toggle:(name,force)=>{const next=force===undefined?!this.classList.contains(name):force;if(next)this.classList.add(name);else this.classList.remove(name);return next;}
    };
  }
  get id(){return this.attributes.id||'';}
  set id(value){this.attributes.id=String(value);}
  get textContent(){return this._text+this._html.replace(/<[^>]*>/g,'')+this.children.map(n=>n.textContent).join('');}
  set textContent(value){this._text=String(value);this._html='';this.children=[];}
  get innerHTML(){return this._html+this._text+this.children.map(n=>n.outerHTML).join('');}
  set innerHTML(value){this._html=String(value);this._text='';this.children=[];}
  get outerHTML(){return '<'+this.tagName.toLowerCase()+Object.entries(this.attributes).map(([k,v])=>' '+k+'="'+v+'"').join('')+'>'+this.innerHTML+'</'+this.tagName.toLowerCase()+'>';}
  setAttribute(k,v){this.attributes[k]=String(v);if(k==='class')this.className=String(v);if(k==='hidden')this.hidden=true;if(k.startsWith('data-'))this.dataset[k.slice(5).replace(/-([a-z])/g,(_,x)=>x.toUpperCase())]=String(v);}
  getAttribute(k){return this.attributes[k]===undefined?null:this.attributes[k];}
  removeAttribute(k){delete this.attributes[k];if(k==='hidden')this.hidden=false;}
  appendChild(el){if(el.parentNode)el.parentNode.removeChild(el);el.parentNode=this;this.children.push(el);return el;}
  append(...nodes){for(const n of nodes)this.appendChild(typeof n==='string'?this.ownerDocument.createTextNode(n):n);}
  removeChild(el){this.children=this.children.filter(n=>n!==el);el.parentNode=null;return el;}
  replaceChildren(...nodes){this.children=[];this._text='';this._html='';this.append(...nodes);}
  remove(){if(this.parentNode)this.parentNode.removeChild(this);}
  contains(el){return this===el||this.children.some(n=>n.contains(el));}
  querySelectorAll(selector){return flatten(this).slice(1).filter(el=>matches(el,selector));}
  querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
  click(){if(!this.disabled)this.dispatchEvent({type:'click',target:this,bubbles:true});}
  focus(){this.ownerDocument.activeElement=this;}
}

function flatten(el){return [el,...el.children.flatMap(flatten)];}
function matches(el,selector){
  if(selector.includes(','))return selector.split(',').some(s=>matches(el,s.trim()));
  if(selector.startsWith('#'))return el.id===selector.slice(1);
  if(selector.startsWith('.'))return el.classList.contains(selector.slice(1));
  const attr=selector.match(/^([\w-]+)?\[([\w-]+)(?:=["']?([^"'\]]+)["']?)?\]$/);
  if(attr)return (!attr[1]||el.tagName===attr[1].toUpperCase())&&el.getAttribute(attr[2])!==null&&(attr[3]===undefined||el.getAttribute(attr[2])===attr[3]);
  return el.tagName===selector.toUpperCase();
}

class Document extends Events {
  constructor(){super();this.documentElement=new Element('html',this);this.head=new Element('head',this);this.body=new Element('body',this);this.documentElement.append(this.head,this.body);this.hidden=false;this.visibilityState='visible';this.title='窝囊费';this.styleSheets=[];this.currentScript={src:'https://example.test/floating.js'};this.baseURI='https://example.test/';}
  createElement(tag){return new Element(tag,this);}
  createElementNS(ns,tag){return this.createElement(tag);}
  createTextNode(text){const n=new Element('#text',this);n.textContent=text;return n;}
  getElementById(id){return flatten(this.documentElement).find(el=>el.id===id)||null;}
  querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
  querySelectorAll(selector){return flatten(this.documentElement).filter(el=>matches(el,selector));}
}

function visible(el){for(let n=el;n;n=n.parentNode)if(n.hidden||n.style.display==='none')return false;return true;}
const flush=async()=>{for(let i=0;i<6;i++)await Promise.resolve();};
const source=fs.readFileSync(path.join(__dirname,'../h5/floating.js'),'utf8');

function harness(options={}) {
  const timers=new Map();let timerId=0;const clock={now:Date.UTC(2026,10,5,6)};
  function setIntervalFake(fn){const id=++timerId;timers.set(id,fn);return id;}
  function clearIntervalFake(id){timers.delete(id);}
  const doc=new Document(),entry=doc.createElement('button');entry.id='floating-open';entry.hidden=true;doc.body.append(entry);
  const queries=[],messages=[];let requests=0,storageWrites=0,snapshotCalls=0,toggles=0;
  const model={configured:true,demo:false,masked:false,amount:321.98,goal:{name:'小耳机',kind:'earbuds',progress:.75,art:'<svg viewBox="0 0 280 250"><rect width="100" height="50"/></svg>'}};
  function createChild(){
    const win=new Events();win.document=new Document();win.document.defaultView=win;win.closed=false;win.focusCalls=0;
    win.close=function(){if(this.closed)return;this.closed=true;this.dispatchEvent({type:'pagehide'});};
    win.focus=()=>{win.focusCalls++;};
    win.setInterval=setIntervalFake;win.clearInterval=clearIntervalFake;
    win.setTimeout=setIntervalFake;win.clearTimeout=clearIntervalFake;
    return win;
  }
  let child=createChild();
  let resolveRequest;
  const pending=new Promise(resolve=>{resolveRequest=resolve;});
  const context=new Events();
  Object.assign(context,{document:doc,console,URL,Promise,Math,Number,String,Boolean,Object,Array,Error,TypeError,HTMLElement:Element,
    navigator:{userAgent:'Desktop test browser',maxTouchPoints:0},location:{href:'https://example.test/',origin:'https://example.test'},isSecureContext:true,
    innerWidth:1200,innerHeight:900,setInterval:setIntervalFake,clearInterval:clearIntervalFake,setTimeout:setIntervalFake,clearTimeout:clearIntervalFake,
    matchMedia(query){queries.push(query);return {matches:options.desktop!==false,media:query,addEventListener(){},removeEventListener(){},addListener(){},removeListener(){}};},
    localStorage:{setItem(){storageWrites++;},getItem(){return null;}},focus(){context.focusCalls=(context.focusCalls||0)+1;},
    getComputedStyle(){return {getPropertyValue(){return '';}};},
    Date:class extends Date {constructor(...args){super(...(args.length?args:[clock.now]));}static now(){return clock.now;}}
  });
  context.window=context;context.globalThis=context;doc.defaultView=context;
  if(options.support!==false)context.documentPictureInPicture={window:null,requestWindow(){requests++;if(child.closed)child=createChild();if(options.reject)return Promise.reject(new Error('NotAllowedError'));return options.pending?pending:Promise.resolve(child);}};
  vm.runInNewContext(source,context,{filename:'floating.js'});
  const bridge={getSnapshot(){snapshotCalls++;if(model.failSnapshot)throw new Error('Snapshot unavailable');const snap={configured:model.configured,demo:model.demo,masked:model.masked,goal:{...model.goal}};if(!model.masked)snap.amount=options.timestampAmount?(clock.now-Date.UTC(2026,10,5,6))/1000:model.amount;return snap;},togglePrivacy(){toggles++;model.masked=!model.masked;context.WNFFloating.sync();},message(text){messages.push(text);}};
  Object.assign(model,options.model||{});
  context.WNFFloating.connect(bridge);
  return {context,doc,entry,model,messages,queries,timers,clock,
    get child(){return child;},
    get requests(){return requests;},get storageWrites(){return storageWrites;},get snapshotCalls(){return snapshotCalls;},get toggles(){return toggles;},
    async open(){entry.click();await flush();},resolve(){resolveRequest(child);},tick(ms){clock.now+=ms;for(const fn of [...timers.values()])fn();},
    get text(){return child.document.body.textContent;},el(id){const el=child.document.getElementById(id);assert(el,'missing floating element '+id);return el;}
  };
}

let checks=0;
async function test(name,fn){try{await fn();checks++;}catch(error){error.message=name+': '+error.message;throw error;}}
(async()=>{
  await test('supported desktop entry',async()=>{const h=harness();assert(visible(h.entry));assert(h.queries.some(q=>q.includes('650px')));assert(h.queries.some(q=>q.includes('hover')));assert(h.queries.some(q=>q.includes('pointer')));assert(!h.context.WNFFloating.isOpen());assert.equal(h.requests,0);});
  await test('unsupported API is not advertised',async()=>{const h=harness({support:false});assert(!visible(h.entry));await h.open();assert.equal(h.requests,0);});
  await test('mobile and coarse input keep current layout',async()=>{const h=harness({desktop:false});assert(!visible(h.entry));await h.open();assert.equal(h.requests,0);});
  await test('unconfigured data cannot open a counter',async()=>{const h=harness({model:{configured:false}});await h.open();assert.equal(h.requests,0);assert(!h.context.WNFFloating.isOpen());});
  await test('accelerated demo is not an everyday floating counter',async()=>{const h=harness({model:{demo:true}});await h.open();assert.equal(h.requests,0);assert(!h.context.WNFFloating.isOpen());});
  await test('one click opens a read-only amount view',async()=>{const h=harness();await h.open();assert.equal(h.requests,1);assert(h.context.WNFFloating.isOpen());assert.match(h.el('floating-amount').textContent,/321\.98/);assert.equal(h.storageWrites,0);});
  await test('duplicate click reuses one window',async()=>{const h=harness();await h.open();await h.open();assert.equal(h.requests,1);assert(h.context.WNFFloating.isOpen());});
  await test('pending open cannot create concurrent windows',async()=>{const h=harness({pending:true});h.entry.click();h.entry.click();await flush();assert.equal(h.requests,1);h.resolve();await flush();assert(h.context.WNFFloating.isOpen());});
  await test('request failure is visible and recoverable',async()=>{const options={reject:true},h=harness(options);await h.open();assert(!h.context.WNFFloating.isOpen());assert(h.messages.length);options.reject=false;await h.open();assert.equal(h.requests,2);assert(h.context.WNFFloating.isOpen());});
  await test('privacy immediately removes the previous amount',async()=>{const h=harness();await h.open();h.model.masked=true;h.context.WNFFloating.sync();assert(!h.text.includes('321.98'));assert(!h.el('floating-amount').textContent.includes('321.98'));assert.equal(h.el('floating-goal-name').textContent,'小耳机');assert.match(h.el('floating-percent').textContent,/75/);});
  await test('initial private view never needs an amount field',async()=>{const h=harness({model:{masked:true}});await h.open();assert(!h.text.includes('321.98'));assert.match(h.el('floating-percent').textContent,/75/);});
  await test('floating privacy control uses the single app state',async()=>{const h=harness();await h.open();h.el('floating-privacy').click();await flush();assert(h.model.masked);assert.equal(h.toggles,1);assert(!h.text.includes('321.98'));h.el('floating-privacy').click();await flush();assert(!h.model.masked);assert.match(h.el('floating-amount').textContent,/321\.98/);});
  await test('parent edits update the chosen goal without a second window',async()=>{const h=harness({model:{masked:true}});await h.open();h.model.goal={...h.model.goal,name:'周末旅行',progress:.5};h.context.WNFFloating.sync();assert.equal(h.el('floating-goal-name').textContent,'周末旅行');assert.match(h.el('floating-percent').textContent,/50/);assert.equal(h.requests,1);assert.equal(h.storageWrites,0);});
  await test('visible floating view keeps refreshing while parent is hidden',async()=>{const h=harness({timestampAmount:true});await h.open();h.doc.hidden=true;h.doc.visibilityState='hidden';h.doc.dispatchEvent({type:'visibilitychange'});const before=h.snapshotCalls;h.tick(1000);assert(h.snapshotCalls>before);assert.match(h.el('floating-amount').textContent,/1\.00/);});
  await test('a delayed tick uses the current timestamp rather than tick count',async()=>{const h=harness({timestampAmount:true});await h.open();h.tick(600000);assert.match(h.el('floating-amount').textContent,/600\.00/);assert.equal(h.storageWrites,0);});
  await test('closing only tears down the view',async()=>{const h=harness();await h.open();const original=JSON.stringify(h.model);assert(h.timers.size>0);h.context.WNFFloating.close();assert(!h.context.WNFFloating.isOpen());assert.equal(h.timers.size,0);assert.equal(JSON.stringify(h.model),original);assert.equal(h.storageWrites,0);});
  await test('browser window close also clears the refresh timer',async()=>{const h=harness();await h.open();h.child.close();assert(!h.context.WNFFloating.isOpen());assert.equal(h.timers.size,0);});
  await test('reopening restores current progress without resetting data',async()=>{const h=harness();await h.open();h.context.WNFFloating.close();h.model.amount=456.78;await h.open();assert.equal(h.requests,2);assert(h.context.WNFFloating.isOpen());assert.match(h.el('floating-amount').textContent,/456\.78/);assert.equal(h.storageWrites,0);});
  await test('return button focuses the source without financial mutation',async()=>{const h=harness();await h.open();const original=JSON.stringify(h.model);h.el('floating-return').click();assert((h.context.focusCalls||0)>0);assert.equal(JSON.stringify(h.model),original);assert.equal(h.storageWrites,0);});
  await test('source pagehide closes the floating view and removes its timer',async()=>{const h=harness();await h.open();h.context.dispatchEvent({type:'pagehide'});assert(!h.context.WNFFloating.isOpen());assert(h.child.closed);assert.equal(h.timers.size,0);assert.equal(h.storageWrites,0);});
  await test('a cancelled pending request cannot reopen a departed page',async()=>{const h=harness({pending:true});h.entry.click();h.context.WNFFloating.close();h.resolve();await flush();assert(h.child.closed);assert(!h.context.WNFFloating.isOpen());assert.equal(h.timers.size,0);});
  await test('entering demo after opening closes the real-data view',async()=>{const h=harness();await h.open();h.model.demo=true;h.context.WNFFloating.sync();assert(!h.context.WNFFloating.isOpen());assert.equal(h.timers.size,0);assert(!h.text.includes('321.98'));});
  await test('unconfigured data after opening closes the view',async()=>{const h=harness();await h.open();h.model.configured=false;h.context.WNFFloating.sync();assert(!h.context.WNFFloating.isOpen());assert.equal(h.timers.size,0);});
  await test('late events from an old window cannot tear down the new one',async()=>{const h=harness();await h.open();const old=h.child;h.context.WNFFloating.close();await h.open();old.dispatchEvent({type:'pagehide'});assert(h.context.WNFFloating.isOpen());assert.equal(h.timers.size,1);});
  await test('a snapshot failure clears financial text and can recover',async()=>{const h=harness();await h.open();h.model.failSnapshot=true;h.context.WNFFloating.sync();assert(!h.text.includes('321.98'));assert(!h.el('floating-amount').textContent);h.model.failSnapshot=false;h.model.masked=true;h.context.WNFFloating.sync();assert.equal(h.el('floating-goal-name').textContent,'小耳机');assert(!h.text.includes('321.98'));});
  await test('progress remains bounded for stale or invalid target values',async()=>{const h=harness({model:{masked:true}});await h.open();h.model.goal.progress=3;h.context.WNFFloating.sync();assert.match(h.el('floating-percent').textContent,/^100/);h.model.goal.progress=-1;h.context.WNFFloating.sync();assert.match(h.el('floating-percent').textContent,/^0/);h.model.goal.progress=NaN;h.context.WNFFloating.sync();assert(!h.el('floating-percent').textContent.includes('NaN'));});
  await test('the child references its own same-origin stylesheet',async()=>{const h=harness();await h.open();const link=h.child.document.querySelector('link');assert(link);assert.match(link.href,/^https:\/\/example\.test\/floating\.css(?:\?|$)/);});
  await test('an initial snapshot failure is reported without an unhandled rejection',async()=>{const h=harness({model:{failSnapshot:true}});await h.open();assert.equal(h.entry.asyncErrors.length,0);assert.equal(h.requests,0);assert(h.messages.length);h.model.failSnapshot=false;await h.open();assert(h.context.WNFFloating.isOpen());});
  console.log(checks+' H5 floating lifecycle / privacy / read-only refresh checks passed');
})().catch(error=>{console.error(error);process.exitCode=1;});
