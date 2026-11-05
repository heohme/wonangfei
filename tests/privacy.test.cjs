const assert=require('assert');require('../dist/calc.js');const C=globalThis.WNF;
let a=C.anchor([],694,10000);assert.equal(a.name,'AirPods Pro');assert.equal(a.progress,.5);
a=C.anchor([],14999,30000);assert.equal(a.kind,'phone');assert.equal(a.progress,1);
a=C.anchor([{name:'我的相机',price:2000}],1000,30000);assert.equal(a.name,'我的相机');assert.equal(a.kind,'gift');assert.equal(a.progress,.5);
a=C.anchor([{name:'已买到',price:100,bought:true}],794,10000);assert.equal(a.progress,.5);
assert.equal(C.anchor([],100000,30000).progress,1);assert.equal(C.anchor([],-100,10000).progress,0);
console.log('10 privacy anchor checks passed');

// Increasing earnings must increase the exact progress, including subpixel changes.
assert(C.anchor([],694.01,10000).progress>C.anchor([],694,10000).progress);
assert.equal(C.anchor([],10,10000,'coffee').progress,.5);
assert.equal(C.anchor([],14999,10000,'phone').progress,1);
const wishes=[{id:'a',name:'目标一',price:100},{id:'b',name:'目标二',price:200}];
assert.equal(C.anchor(wishes,150,10000,'wish:b').progress,.25);
assert.equal(C.anchor(wishes,150,10000,'missing').id,'wish:a');
assert.equal(C.anchorOptions(wishes).length,C.catalog.length+5);
assert.equal(C.anchorOptions([{id:'x',bought:true}]).length,C.catalog.length+3);
assert.equal(C.anchor(wishes,10,10000,'coffee').id,'coffee');
console.log('8 progress growth / product switching checks passed');

assert.equal(C.catalog.length,16);assert.equal(new Set(C.catalog.map(x=>x.id)).size,16);
for(const item of C.catalog){assert(item.price>0);assert.equal(C.anchor([],item.price/2,10000,item.id).progress,.5);assert.equal(C.anchor([],item.price/2,10000,item.id).reference.url,item.url);assert(item.terms);assert(/^https:\/\/www\.smzdm\.com\/p\/\d+\/$/.test(item.url));}
assert(!C.catalog.some(x=>/纸巾|抽纸|洗衣液|洗洁精|生抽|会员/.test(x.name)));
assert.equal(C.catalog.filter(x=>x.category==='小小奖励').length,5);
assert.equal(C.anchor([{id:'x',name:'自己的愿望',price:100}],50,10000).reference,null);
console.log('87 curated catalog / source / progress / privacy checks passed');
