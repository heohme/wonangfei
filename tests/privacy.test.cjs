const assert=require('assert');require('../dist/calc.js');const C=globalThis.WNF;
let a=C.anchor([],694,10000);assert.equal(a.name,'AirPods Pro');assert.equal(a.progress,.5);
a=C.anchor([],14999,30000);assert.equal(a.kind,'phone');assert.equal(a.progress,1);
a=C.anchor([{name:'我的相机',price:2000}],1000,30000);assert.equal(a.name,'我的相机');assert.equal(a.kind,'gift');assert.equal(a.progress,.5);
a=C.anchor([{name:'已买到',price:100,bought:true}],794,10000);assert.equal(a.progress,.5);
assert.equal(C.anchor([],100000,30000).progress,1);assert.equal(C.anchor([],-100,10000).progress,0);
console.log('10 privacy anchor checks passed');
