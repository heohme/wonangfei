const assert=require('assert');require('../dist/calc.js');const C=globalThis.WNF;
const base={salary:100000,workdays:21,calendarWorkdays:true,start:'09:00',end:'18:00',lunchStart:'12:00',lunchEnd:'13:00',paidLunch:false,days:[1,2,3,4,5],percent:100,initial:0,since:'2026-11-01'};
const work=Object.assign({},base,{mode:'work'}),all=Object.assign({},base,{mode:'all'}),end=new Date(2026,10,4,18);
assert.equal(C.snapshot(end,work).daily,C.snapshot(end,all).daily);
assert.equal(C.snapshot(end,work).today,100000/30);
assert.equal(C.snapshot(new Date(2026,10,4,12),all).today,100000/30/2);
assert.equal(C.snapshot(new Date(2026,10,4,13),work).today,C.snapshot(new Date(2026,10,4,12),work).today);
assert.equal(C.snapshot(new Date(2026,10,7,18),work).today,0);
for(const [year,month,days] of [[2026,0,31],[2026,1,28],[2028,1,29]]){
 const s=Object.assign({},base,{days:[0,1,2,3,4,5,6],since:year+'-'+String(month+1).padStart(2,'0')+'-01'});
 assert.equal(C.snapshot(new Date(year,month,4,18),s).today,100000/days);
}
const legacy=Object.assign({},work,{dailyBasis:'legacy'}),now=new Date(2026,10,4,18),checkpoint={amount:C.snapshot(now,legacy).total,raw:C.snapshot(now,work).total};assert.equal(C.balance(now,work,checkpoint).total,C.snapshot(now,legacy).total);
console.log('9 unified daily target / month length / migration checks passed');
