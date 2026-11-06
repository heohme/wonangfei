(function (root) {
  'use strict';
  // Original, offline vector studies. Shared geometry only where the real shell is shared.
  var C = {cream:'#f5eedf', light:'#e4ebd8', sage:'#c7d7b4', green:'#a7bd90', deep:'#647f59', lens:'#425b3d', tan:'#cfb991'};
  var models = {};
  function rect(x,y,w,h,r,fill,extra){return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+r+'" fill="'+(fill||C.sage)+'" '+(extra||'')+'/>';}
  function path(d,fill,extra){return '<path d="'+d+'" fill="'+(fill||'none')+'" '+(extra||'')+'/>';}
  function ellipse(x,y,rx,ry,fill,extra){return '<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" fill="'+(fill||C.sage)+'" '+(extra||'')+'/>';}
  function circle(x,y,r,fill,extra){return ellipse(x,y,r,r,fill,extra);}
  function text(x,y,value,size,fill){var label=String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');return '<text x="'+x+'" y="'+y+'" text-anchor="middle" font-family="Arial,PingFang SC,sans-serif" font-size="'+(size||12)+'" fill="'+(fill||C.deep)+'" stroke="none">'+label+'</text>';}
  function lens(x,y,r){return circle(x,y,r,C.deep)+circle(x,y,r*.75,C.lens)+circle(x,y,r*.48,C.green,'stroke="none"')+ellipse(x-r*.2,y-r*.23,r*.13,r*.1,C.light,'stroke="none" opacity=".8"');}
  function weave(x,y,r){var s='';for(var d=-r+12;d<r;d+=12){var length=Math.sqrt(r*r-d*d)-5;s+=path('M'+(x-length)+' '+(y+d)+'h'+(length*2),'none','stroke-width="1" opacity=".2"');s+=path('M'+(x+d)+' '+(y-length)+'v'+(length*2),'none','stroke-width="1" opacity=".2"');}return s;}
  function add(id,shape){models[id]=shape;}

  // Cameras: the silhouette, screen position, lens and grips identify the model.
  add('zdm:185252215',
    rect(120,91,40,126,12,C.sage)+rect(121,94,38,21,5,C.green)+
    path('M130 91V73h-22V53h17','none','stroke-width="8"')+
    rect(119,24,54,55,12,C.deep)+rect(127,31,38,39,8,C.light)+lens(146,50,13)+
    rect(97,113,88,51,7,C.deep)+rect(103,119,76,39,3,C.light)+path('M104 148l23-18 16 13 17-9 18 16',C.green,'stroke="none"')+
    circle(133,181,5,C.deep)+circle(150,181,4,C.tan)+path('M134 204h12','none','stroke-width="2"'));
  add('official:dji-osmo-action-6',
    path('M52 88l17-13h159v119l-17 15H52z',C.green)+rect(43,87,179,122,23,C.sage)+
    rect(57,111,62,61,7,C.deep)+rect(63,117,50,49,4,C.light)+path('M64 156l18-24 17 16 13-8v25H64',C.green,'stroke="none"')+
    rect(131,102,77,78,16,C.deep)+lens(170,141,30)+rect(74,80,28,7,3,C.deep)+
    circle(66,189,3,C.tan,'stroke="none"')+text(160,196,'ACTION',9));
  add('official:dji-ronin-4d-6k',
    path('M72 198l7-63h25l9 53m64 0 8-53h22l8 63','none','stroke-width="7"')+
    rect(68,113,110,70,10,C.sage)+path('M78 112v-16h81v16','none','stroke-width="7"')+
    rect(91,38,83,51,6,C.deep)+rect(97,44,71,39,2,C.light)+path('M127 90v20','none','stroke-width="7"')+
    rect(168,121,29,42,6,C.green)+path('M188 113h22v57h-19','none','stroke-width="8"')+
    ellipse(214,142,24,33,C.deep)+ellipse(219,142,18,26,C.lens)+ellipse(221,140,10,16,C.green)+
    rect(36,112,21,75,8,C.deep)+rect(234,111,19,76,8,C.deep)+path('M56 143h13m139-2h26','none','stroke-width="6"')+
    text(112,157,'RONIN 4D',10)+path('M86 176h65','none','stroke-width="2"'));
  add('zdm:185327542',
    rect(23,111,62,67,5,C.deep)+rect(29,117,50,55,2,C.light)+path('M32 159l13-16 11 7 19-22v41H32',C.green,'stroke="none"')+
    rect(80,98,161,103,18,C.deep)+rect(204,98,37,103,15,C.green)+rect(98,88,40,12,4,C.deep)+
    ellipse(131,88,31,13,C.light,'stroke-dasharray="2 4"')+lens(156,153,48)+
    circle(225,109,4,C.tan,'stroke="none"')+text(172,116,'SONY',10));
  add('zdm:184770144',
    rect(49,99,191,107,15,C.deep)+rect(49,99,191,32,12,C.light)+rect(213,126,27,75,9,C.green)+
    rect(63,89,33,12,3,C.deep)+rect(179,89,33,12,3,C.deep)+path('M70 90v9m8-9v9m8-9v9m101-9v9m8-9v9','none','stroke-width="1.5"')+
    lens(143,160,46)+circle(204,119,4,C.deep)+text(125,120,'FUJIFILM',9)+text(201,153,'X-M5',9));

  // Audio: sphere, cylinder, tripod disc, small brick and passive-radiator tube.
  add('official:apple-homepod-mini-2',
    ellipse(140,137,80,76,C.sage)+weave(140,137,70)+ellipse(140,77,45,16,C.light)+
    ellipse(140,76,33,10,C.cream,'stroke="none"')+path('M119 76h8m28 0h8m-4-4v8','none','stroke-width="1.8"')+
    path('M89 196q51 24 102 0','none','stroke-width="2" opacity=".35"'));
  add('official:apple-homepod-2',
    path('M73 76Q76 44 140 44t67 32v107q-3 37-67 37t-67-37z',C.sage)+
    ellipse(140,70,64,22,C.light)+ellipse(140,68,46,13,C.cream,'stroke="none"')+
    path('M116 68h9m29 0h9m-4-4v8','none','stroke-width="1.8"')+
    path('M82 94q58 17 116 0m-117 16q59 17 118 0m-118 16q59 17 118 0m-118 16q59 17 118 0m-118 16q59 17 118 0m-118 16q59 17 118 0m-111-80v100m19-96v102m20-100v104m20-104v102m19-106v100','none','stroke-width="1" opacity=".2"'));
  add('official:bo-beosound-a9-gold',
    path('M101 169l-21 56m99-56 21 56m-62-45 6 43','none','stroke="'+C.tan+'" stroke-width="8"')+
    circle(140,103,85,C.tan)+circle(140,103,79,C.sage)+weave(140,103,73)+text(140,147,'B&O',12));
  add('official:bo-beosound-theatre',
    path('M20 100q120-23 240 0l-21 72q-99 28-198 0z',C.light)+
    path('M28 108q112-13 224 0l-20 55q-92 21-184 0z',C.tan)+
    path('M79 107l6 62m12-63 4 66m13-67 2 68m13-69 1 70m13-70-1 70m14-69-2 68m15-67-4 65m18-64-6 61m-123-57 11 48m137-49-11 49','none','stroke="'+C.deep+'" stroke-width="3"')+
    path('M89 183h102l15 14H74z',C.green)+text(140,143,'B&O',11));
  add('zdm:185297939',
    path('M224 99q32-17 25 25l-22 24','none','stroke-width="8"')+
    rect(55,74,177,137,25,C.green)+rect(63,82,161,121,20,C.sage)+
    path('M76 107h135m-135 17h135m-135 17h135m-135 17h135m-135 17h135m-117-81v94m19-94v94m19-94v94m19-94v94m19-94v94m19-94v94','none','stroke-width="1" opacity=".23"')+
    rect(110,122,66,47,5,C.deep)+text(143,153,'JBL',23,C.cream)+path('M90 71h16m15 0h16m15 0h16','none','stroke-width="3"'));
  add('zdm:181090180',
    path('M53 133q-25-35-27-7-1 13 22 19','none','stroke-width="7"')+
    rect(44,94,181,109,47,C.sage)+ellipse(222,149,27,54,C.green)+ellipse(224,149,20,40,C.deep)+ellipse(224,149,13,27,C.sage)+
    path('M68 111h125m-132 15h133m-135 15h135m-135 15h135m-132 15h132m-120 15h118','none','stroke-width="1" opacity=".28"')+
    rect(105,128,55,37,4,C.deep)+text(132,154,'JBL',20,C.cream));

  function airpods(pro){var s=rect(63,136,154,80,31,C.sage)+path('M66 161h148','none','stroke-width="2"')+circle(140,183,2.5,C.deep,'stroke="none"');
    [0,1].forEach(function(i){var x=i?181:99,dir=i?1:-1;s+=rect(x-7,68,15,53,7,C.light)+ellipse(x,53,21,25,C.light);if(pro)s+=ellipse(x+dir*19,57,12,14,C.cream)+ellipse(x+dir*25,57,4,8,C.deep);else s+=ellipse(x+dir*10,44,9,11,C.deep);s+=path('M'+(x-3)+' 83v19','none','stroke-width="2" opacity=".35"');});return s;}
  add('official:apple-airpods-5',airpods(false));add('official:apple-airpods-pro-3',airpods(true));
  add('official:apple-airpods-max-2',
    path('M62 138v-24a78 78 0 0 1 156 0v24','none','stroke-width="14"')+
    path('M77 108a63 63 0 0 1 126 0','none','stroke="'+C.light+'" stroke-width="9"')+
    path('M75 115v32m130-32v32','none','stroke-width="5"')+rect(42,129,57,81,23,C.sage)+rect(181,129,57,81,23,C.sage)+
    rect(51,137,39,65,17,C.light)+rect(190,137,39,65,17,C.light)+rect(218,122,11,7,3,C.deep));
  add('zdm:184896912',
    path('M84 86v64q0 29 55 43m57-107v64q0 29-55 43v25','none','stroke-width="3"')+
    ellipse(78,66,15,24,C.sage,'transform="rotate(-28 78 66)"')+ellipse(68,47,10,9,C.deep)+
    ellipse(202,66,15,24,C.sage,'transform="rotate(28 202 66)"')+ellipse(212,47,10,9,C.deep)+
    rect(134,179,12,21,4,C.green)+rect(134,214,13,13,3,C.deep)+path('M140 214v-8','none','stroke="'+C.tan+'" stroke-width="4"'));
  add('zdm:184925040',
    rect(63,149,154,68,28,C.sage)+path('M67 168q72-17 146 0','none','stroke-width="2"')+
    ellipse(98,67,21,25,C.light)+circle(96,106,21,C.sage)+circle(96,106,12,C.cream)+path('M84 45q-22-13-20 16','none','stroke-width="6"')+
    ellipse(182,67,21,25,C.light)+circle(184,106,21,C.sage)+circle(184,106,12,C.cream)+path('M196 45q22-13 20 16','none','stroke-width="6"'));
  add('zdm:185337312',
    ellipse(140,177,85,43,C.deep)+path('M57 169q83 21 166 0','none','stroke="'+C.green+'" stroke-width="4"')+
    rect(89,59,16,67,8,C.deep)+ellipse(90,52,26,19,C.green)+ellipse(69,57,10,12,C.light)+
    rect(175,59,16,67,8,C.deep)+ellipse(190,52,26,19,C.green)+ellipse(211,57,10,12,C.light)+text(140,193,'iQOO',13,C.cream));

  // Prop guards and landing gear are structural differences, rather than new colours.
  function rotor(x,y,r,guard){return (guard?circle(x,y,r,C.light)+circle(x,y,r-6,C.cream):'')+ellipse(x,y,r-6,5,C.green,'transform="rotate(-22 '+x+' '+y+')"')+circle(x,y,4,C.deep);}
  add('official:dji-mini-5-pro',
    path('M115 119L67 91m98 28 48-28m-99 52-48 28m99-28 48 28','none','stroke-width="8"')+
    rotor(61,86,34,false)+rotor(219,86,34,false)+rotor(61,175,34,false)+rotor(219,175,34,false)+
    path('M120 74q20-10 40 0l14 56-15 43h-38l-15-43z',C.sage)+rect(122,89,36,12,5,C.deep)+
    path('M129 171v15h23v-15','none','stroke-width="5"')+rect(124,180,32,28,6,C.green)+lens(140,194,10));
  add('official:dji-flip-rc-2',
    path('M115 102L69 76m96 26 46-26m-96 66-46 26m96-26 46 26','none','stroke-width="10"')+
    rotor(65,74,42,true)+rotor(215,74,42,true)+rotor(65,169,42,true)+rotor(215,169,42,true)+
    rect(114,65,52,117,24,C.sage)+rect(122,81,36,19,8,C.deep)+rect(125,168,30,31,7,C.green)+lens(140,183,10));
  add('official:dji-inspire-3',
    path('M106 110L62 75l-20 73m132-38 44-35 20 73M49 142l-15 57m197-57 15 57M98 127l-53 17m137-17 53 17','none','stroke-width="9"')+
    rotor(51,69,36,false)+rotor(229,69,36,false)+rotor(35,147,30,false)+rotor(245,147,30,false)+
    path('M103 92q37-20 74 0l13 34-28 22h-44l-28-22z',C.deep)+path('M113 99q27-10 54 0l8 18h-70z',C.sage)+
    path('M139 148v24h-19v15','none','stroke-width="7"')+rect(112,175,58,44,13,C.green)+lens(142,197,19));

  function watch(type){var ultra=type==='ultra',se=type==='se',x=ultra?88:94,w=ultra?104:92,r=ultra?19:26;
    var s=rect(114,19,52,211,16,ultra?C.tan:C.sage)+rect(x,62,w,132,r,ultra?C.tan:C.light)+rect(x+(se?12:7),70,se?w-24:w-14,116,se?18:ultra?11:21,C.deep)+
      path('M140 91v38l23 13','none','stroke="'+C.light+'" stroke-width="4"')+circle(140,129,3,C.cream,'stroke="none"');
    if(ultra){s+=rect(190,95,13,62,6,C.tan)+circle(199,112,7,C.green)+rect(82,103,6,29,2,C.green);for(var y=27;y<61;y+=9)s+=path('M121 '+y+'h38','none','stroke-width="3"');for(var z=200;z<228;z+=9)s+=path('M121 '+z+'h38','none','stroke-width="3"');}
    else{s+=ellipse(x+w+3,102,se?5:4,se?8:7,C.green)+path('M'+(x+w+3)+' 124v20','none','stroke-width="3"');}return s;}
  add('official:apple-watch-se-3',watch('se'));add('official:apple-watch-series-12',watch('series'));add('official:apple-watch-ultra-4',watch('ultra'));

  function desktop(studio){return ellipse(140,studio?92:129,81,14,C.light)+rect(59,studio?91:128,162,studio?112:68,20,C.sage)+ellipse(140,studio?91:128,81,14,C.light)+
    rect(81,studio?165:169,16,5,2,C.deep)+rect(111,studio?165:169,16,5,2,C.deep)+
    (studio?rect(165,164,33,5,1,C.deep):circle(178,172,4,C.deep))+path('M74 '+(studio?124:150)+'h132','none','stroke-width="1" opacity=".25"');}
  add('zdm:184344568',desktop(false));add('official:apple-mac-studio-m5-max',desktop(true));add('official:apple-mac-studio-m5-ultra',desktop(true));
  function laptop(type){var pro=type==='pro',think=type==='think',s=rect(46,35,188,131,9,C.sage)+rect(54,43,172,114,5,C.deep)+
    path('M54 127q49-62 92-20t80-38v88H54',C.green,'stroke="none"')+path('M46 167h188l30 40q-124 10-248 0z',C.light)+
    path('M17 207h246v'+(pro?9:5)+'q-122 9-246 0z',C.sage)+rect(100,192,80,12,3,C.sage);
    if(!think)s+=rect(120,42,40,8,3,C.sage,'stroke="none"');
    var cols=think?15:12;for(var row=0;row<3;row++)for(var col=0;col<cols;col++)s+=rect(57+col*(think?11:13),174+row*5,think?8:10,3,1,C.deep,'stroke="none" opacity=".65"');
    if(pro)s+=path('M48 176v18m6-18v18m170-18v18m6-18v18','none','stroke-width="1" opacity=".5"');
    if(think)s+=text(209,151,'ThinkBook',7,C.light);return s;}
  add('zdm:185352056',laptop('air'));add('official:apple-macbook-pro-16-m5-pro',laptop('pro'));add('zdm:184970362',laptop('think'));
  add('official:apple-studio-display-xdr',
    rect(25,35,230,145,8,C.sage)+rect(33,43,214,127,3,C.deep)+path('M34 138q59-93 120-50t92-32v113H34',C.green,'stroke="none"')+
    path('M130 182v36h20v-36','none','stroke-width="7"')+path('M109 222h62','none','stroke-width="7"')+circle(140,39,1,C.deep,'stroke="none"'));
  add('official:apple-vision-pro-256',
    path('M54 102q-22-42 7-52h158q29 10 7 52','none','stroke="'+C.sage+'" stroke-width="13"')+
    path('M54 98q86-35 172 0l13 53q-1 32-33 33l-36-7-30 14-30-14-36 7q-32-1-33-33z',C.light)+
    path('M59 108q81-25 162 0l6 40q-1 24-25 22l-39-9-23 12-23-12-39 9q-25 1-25-22z',C.deep)+
    path('M74 120q66-17 132 0','none','stroke="'+C.green+'" stroke-width="7"')+circle(218,96,5,C.tan));

  // The older built-in catalogue also gets model silhouettes, not category clones.
  function mouse(type){var vertical=type==='lift',master=type==='master';if(vertical)return path('M92 197q-47-29-12-90l53-54q28-23 45 10l30 84q11 45-33 55z',C.sage)+path('M135 58q-19 75-11 138','none','stroke-width="3"')+path('M109 101l-13 24','none','stroke-width="6"')+path('M162 153l25-10','none','stroke-width="3"');
    var s=path(master?'M76 201q-25-8-12-44l16-35V95q1-49 62-49t64 49v78q0 42-70 42z':'M81 172V103q0-57 59-57t59 57v69q0 43-59 43t-59-43z',C.sage)+path('M'+(master?83:84)+' 125q56-12 111 0M140 53v70','none','stroke-width="2"')+rect(132,78,16,28,7,C.deep);
    if(type==='g102')s+=path('M140 46V16','none','stroke-width="3"');if(type==='g304')s+=path('M91 162q49-13 98 0','none','stroke-width="1.5"');if(master)s+=path('M80 146l-11 39 41 5','none','stroke-width="4"')+ellipse(86,134,5,13,C.deep);return s;}
  add('zdm:185184612',mouse('g102'));add('zdm:185337589',mouse('g304'));add('zdm:185337480',mouse('lift'));add('zdm:184765742',mouse('master'));
  function keyboard(type){var full=type==='full'||type==='compact-full',small=type==='mini',cols=full?19:small?14:16,rows=small?5:6,kw=full?10:12,w=cols*kw+18,x=(280-w)/2,y=80;
    var s=rect(x,y,w,rows*17+18,9,C.sage);for(var row=0;row<rows;row++)for(var col=0;col<cols;col++){if(!small&&row===0&&col===0)continue;if(full&&col===14&&type==='full')continue;s+=rect(x+9+col*kw,y+8+row*17,kw-3,12,2,row===0?C.green:C.light,'stroke-width=".9"');}
    s+=rect(x+w*.29,y+rows*17-5,w*.29,11,2,C.tan,'stroke-width="1"');if(type==='tkl')s+=circle(x+w-18,y+16,7,C.deep)+rect(x+w-53,y+8,21,14,2,C.deep);return s;}
  add('zdm:185429283',keyboard('tkl'));add('zdm:185430962',keyboard('mini'));add('zdm:185444388',keyboard('compact-full'));add('zdm:185361162',keyboard('full'));
  function tablet(ipad){return rect(ipad?74:68,22,ipad?132:144,205,13,C.sage)+rect(ipad?81:75,29,ipad?118:130,190,8,C.deep)+
    path('M'+(ipad?81:75)+' 160q38-89 81-56t'+(ipad?37:49)+'-18v130H'+(ipad?81:75)+'z',C.green,'stroke="none"')+
    (ipad?circle(78,124,1.5,C.deep,'stroke="none"'):rect(60,44,16,38,7,C.deep)+circle(68,55,4,C.light))+path('M131 212h18','none','stroke="'+C.light+'" stroke-width="2"');}
  add('zdm:185405553',tablet(true));add('zdm:185328685',tablet(false));
  function phone(xiaomi){return rect(77,14,126,216,24,C.light)+rect(84,21,112,202,19,C.sage)+
    (xiaomi?rect(90,29,100,73,15,C.deep)+circle(108,48,11,C.green)+circle(108,79,11,C.green)+circle(134,48,11,C.green)+rect(149,38,32,50,6,C.light)+path('M155 71l10-13 10 13',C.green,'stroke="none"'):
    rect(91,30,34,69,16,C.green)+circle(108,47,11,C.deep)+circle(108,81,11,C.deep)+circle(137,49,4,C.cream));}
  add('zdm:184635762',phone(false));add('zdm:185426312',phone(true));
  add('zdm:185271950',circle(111,84,48,C.sage)+circle(111,84,29,C.deep)+circle(111,84,19,C.cream)+rect(157,59,65,48,15,C.light)+path('M108 132v77q0 15 18 15h6q17 0 17-15v-95',C.sage)+path('M120 223v12','none','stroke-width="4"'));
  add('zdm:184074312',rect(108,22,111,158,15,C.light)+rect(118,35,91,49,7,C.sage)+path('M122 109h83m-83 10h83m-83 10h83','none','stroke-width="1" opacity=".3"')+ellipse(100,188,75,34,C.sage)+ellipse(100,179,75,32,C.light)+ellipse(100,164,20,9,C.green)+path('M53 193q47 17 94 0','none','stroke-width="2"'));
  add('zdm:185168997',rect(48,75,182,134,24,C.deep)+rect(58,86,162,110,18,C.sage)+lens(169,135,33)+path('M77 113h39m-39 14h39m-39 14h39m-39 14h39','none','stroke-width="2" opacity=".5"')+rect(69,68,142,8,3,C.light));
  add('zdm:185469467',rect(23,76,47,131,20,C.deep)+rect(70,76,140,131,5,C.sage)+rect(78,84,124,115,3,C.deep)+rect(210,76,47,131,20,C.green)+circle(48,112,10,C.light)+path('M39 158h18m-9-9v18','none','stroke="'+C.light+'" stroke-width="3"')+circle(232,161,10,C.light)+circle(228,108,3,C.deep)+circle(242,118,3,C.deep)+circle(228,128,3,C.deep));
  add('zdm:185471485',path('M103 29q37 13 74 0l-17 191H86q28-86 17-191z',C.light)+path('M119 34h40l-15 182h-36q19-93 11-182z',C.deep)+path('M87 139h71','none','stroke-width="3"')+ellipse(133,222,53,7,C.sage));
  function book(title,three){var s='';if(three){s+=path('M79 59h112v152H79z',C.green)+path('M89 49h112v152H89z',C.light);}s+=path('M68 43h121v173H68q-10-1-10-10V53q0-10 10-10z',C.sage)+path('M71 44v171M78 205h103','none','stroke-width="1.5"')+text(131,120,title,24)+path('M100 139h60','none','stroke-width="1"');return s;}
  add('zdm:183753932',book('三体',true));add('zdm:185426023',book('活着',false));
  add('zdm:183233319',rect(103,25,74,27,10,C.deep)+rect(97,49,86,174,25,C.sage)+path('M99 74h82m-80 17h78','none','stroke-width="2"')+rect(122,93,36,26,9,C.light)+path('M122 191h36','none','stroke-width="1.5"'));
  add('zdm:185451197',path('M101 37h78l-11 151h-56z',C.light)+rect(112,187,56,36,7,C.green)+path('M103 43h74m-54 12v10m9-10v10m9-10v10m9-10v10','none','stroke-width="1"')+ellipse(140,117,24,30,C.sage)+text(140,121,'Karité',9));
  add('zdm:185463904',rect(54,56,173,154,10,C.light)+path('M69 80h54l-9 95H78z',C.sage)+path('M145 80h54l-9 95h-36z',C.green)+rect(78,173,36,22,4,C.deep)+rect(154,173,36,22,4,C.deep)+text(140,74,'L’OCCITANE',12));
  add('zdm:185148462',ellipse(140,199,58,17,C.deep)+path('M87 73h106l-10 119q-43 17-86 0z',C.sage)+ellipse(140,72,55,16,C.light)+ellipse(140,72,40,8,C.green)+text(140,135,'永璞',18)+path('M117 151h46','none','stroke-width="1.5"'));
  add('zdm:185467262',path('M74 43h132l-7 178H81z',C.light)+path('M79 58h122m-119 148h116','none','stroke-width="1.4"')+path('M105 127l-8-25 26 10q17-9 34 0l25-10-8 25q10 48-35 48t-34-48z',C.sage)+circle(126,140,2,C.deep)+circle(154,140,2,C.deep)+path('M136 149h8','none','stroke-width="2"'));
  add('zdm:185329462',path('M87 31h107l-5 27 15 157H76L91 58z',C.sage)+path('M91 52h97M80 195h119','none','stroke-width="2"')+rect(102,94,77,74,4,C.light)+path('M130 112h19v17l8 10v14h-35v-14l8-10z',C.deep,'stroke="none"'));
  add('zdm:185442012',path('M40 100l15-9 172 29 14 17-14 63-16 9-172-29-12-16z',C.sage)+path('M56 92l-13 85m184-57-14 86','none','stroke-width="1.5"')+rect(92,120,90,51,5,C.light,'transform="rotate(10 137 145)"')+text(136,153,'脆脆鲨',16)+path('M88 60l72 13 12 30-72-13z',C.tan)+path('M97 68l65 12m-62-4 65 12','none','stroke-width="1"'));
  add('zdm:185418712',rect(61,64,157,141,8,C.light)+rect(73,83,133,107,5,C.deep)+path('M105 83v107m33-107v107m34-107v107M73 119h133M73 154h133','none','stroke="'+C.green+'" stroke-width="2"')+path('M62 180l43 25H62z',C.sage)+text(140,53,'100%',14));
  add('zdm:185329412',ellipse(140,78,75,22,C.light)+path('M68 81h144l-13 125q-59 25-118 0z',C.sage)+ellipse(140,80,75,19,C.light)+rect(91,118,98,50,8,C.cream)+text(140,151,'八喜',25));
  function coffeeMachine(espresso){return espresso?rect(79,39,137,169,14,C.sage)+rect(92,54,110,27,6,C.deep)+circle(147,67,9,C.light)+rect(96,103,104,67,5,C.deep)+path('M122 103v20h65','none','stroke-width="8"')+rect(126,135,48,35,7,C.cream)+path('M174 143q20 0 10 18h-10','none','stroke-width="3"')+rect(90,177,114,14,4,C.light):rect(76,39,125,27,11,C.sage)+rect(79,61,29,148,8,C.sage)+rect(104,62,91,40,6,C.deep)+path('M112 103h67v79q-33 25-67 0z',C.light)+path('M178 126q29-3 22 34-3 14-22 9','none','stroke-width="8"')+rect(77,202,134,13,5,C.sage);}
  add('zdm:185413312',coffeeMachine(false));add('zdm:185455213',coffeeMachine(true));
  function car(sports,x,y,scale){return '<g transform="translate('+x+' '+y+') scale('+scale+')">'+path(sports?'M17 74l31-27 78-10 55 21 28 8 6 38H10z':'M21 76l22-44h98l24 40 34 8 5 27H13z',C.sage)+path(sports?'M58 49l64-8 42 18H49z':'M50 39h39v34H35zm46 0h39l20 34H96z',C.light)+circle(50,102,21,C.deep)+circle(50,102,11,C.light)+circle(167,102,21,C.deep)+circle(167,102,11,C.light)+path('M24 84h167','none','stroke-width="1"')+'</g>';}
  add('zdm:185278207',car(false,23,82,1.1));
  add('zdm:185279230',car(true,43,22,.85)+car(true,4,108,1.04));
  add('zdm:185467825',path('M126 36h28l15 90 40 39-23 23-32-14-14 37-14-37-32 14-23-23 40-39z',C.sage)+rect(55,104,45,33,7,C.deep)+rect(180,104,45,33,7,C.deep)+rect(66,174,44,37,7,C.deep)+rect(170,174,44,37,7,C.deep)+rect(113,85,54,43,17,C.deep)+ellipse(140,105,11,15,C.light)+path('M95 179h90m-54-140 6 44h6l6-44','none','stroke-width="3"'));
  add('zdm:185467835',rect(68,48,27,165,3,C.green)+path('M70 57h25m-25 21h25m-25 21h25m-25 21h25m-25 21h25m-25 21h25','none','stroke-width="1"')+path('M136 202V64l15-29 15 29v138z',C.cream)+rect(136,108,30,79,4,C.tan)+path('M114 203V95l9-22 9 22v108zm57 0V95l9-22 9 22v108z',C.light)+path('M141 203l-14 17m24-17v17m12-17 14 17','none','stroke-width="7"')+rect(57,218,151,9,2,C.deep));

  function has(id){return typeof id==='string'&&Object.prototype.hasOwnProperty.call(models,id);}
  function render(product){
    if(!product||typeof product!=='object'||!has(product.id))return '';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 250" aria-hidden="true" data-model="'+product.id+'"><ellipse cx="140" cy="235" rx="91" ry="7" fill="#526949" opacity=".07"/><g stroke="#62765b" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">'+models[product.id]+'</g></svg>';
  }
  root.WNFArt={render:render,has:has,ids:function(){return Object.keys(models);}};
})(typeof window==='undefined'?globalThis:window);
