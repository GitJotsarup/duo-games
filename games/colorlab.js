/* Couple Color Lab - 2 players, personal colour analysis for a couple planning wedding outfits. Plugin for Duo Games.
   Each partner analyses themselves on their OWN device (own webcam): white-balance calibration, skin measurement
   (CIELAB, ITA, hue angle), a short quiz and virtual draping (head-to-head drapes). The partner watches small snapshots
   of every drape pair and votes too (weighted 0.5). Results map to a 12-season system; once both are done the couple
   gets "Our Colours": overlapping palette and coordinated looks per wedding function, all built around HIS neela dastar.
   Sync: the host owns a small versioned meta state (phase, who wears the dastar, turban shade, progress, results,
   stars, finish flags) and broadcasts snapshots; the guest sends sequenced actions. Draping snapshots travel peer to
   peer as tiny JPEGs, one pair at a time (never a stream). window.COLORLAB_FAKE = synthetic camera + instant timers. */
(function(){
'use strict';

var KEY='duo_colorlab_v1';
var DEF_TURBAN='#1c2f8f';
var NEELA=[['Royal navy','#1c2f8f'],['Deep navy','#14215e'],['Ink neela','#101a45'],['Sikh blue','#1f3fa6'],['Royal blue','#2346b0'],['Bright neela','#2d5bd8']];

/* =================== colour math =================== */
function clamp(v,a,b){return v<a?a:v>b?b:v}
function hex2rgb(h){h=String(h||'').replace('#','');if(h.length===3)h=h.replace(/(.)/g,'$1$1');var n=parseInt(h,16)||0;return [n>>16&255,n>>8&255,n&255]}
function rgb2hex(r){return '#'+r.map(function(v){var s=clamp(Math.round(v),0,255).toString(16);return s.length<2?'0'+s:s}).join('')}
function isHex(h){return typeof h==='string'&&/^#[0-9a-f]{6}$/i.test(h)}
function lin(c){c/=255;return c<=0.04045?c/12.92:Math.pow((c+0.055)/1.055,2.4)}
function delin(c){c=clamp(c,0,1);return (c<=0.0031308?12.92*c:1.055*Math.pow(c,1/2.4)-0.055)*255}
function rgb2lab(rgb){
  var R=lin(rgb[0]),G=lin(rgb[1]),B=lin(rgb[2]);
  var X=(0.4124564*R+0.3575761*G+0.1804375*B)/0.95047,Y=0.2126729*R+0.7151522*G+0.0721750*B,Z=(0.0193339*R+0.1191920*G+0.9503041*B)/1.08883;
  var f=function(t){return t>0.008856?Math.cbrt(t):7.787*t+16/116};
  var fx=f(X),fy=f(Y),fz=f(Z);
  return [116*fy-16,500*(fx-fy),200*(fy-fz)];
}
function lab2linear(lab){
  var fy=(lab[0]+16)/116,fx=fy+lab[1]/500,fz=fy-lab[2]/200;
  var fi=function(t){var t3=t*t*t;return t3>0.008856?t3:(t-16/116)/7.787};
  var X=fi(fx)*0.95047,Y=fi(fy),Z=fi(fz)*1.08883;
  return [3.2404542*X-1.5371385*Y-0.4985314*Z,-0.9692660*X+1.8760108*Y+0.0415560*Z,0.0556434*X-0.2040259*Y+1.0572252*Z];
}
function lab2rgb(lab){return lab2linear(lab).map(delin)}
function inGamut(lab){return lab2linear(lab).every(function(c){return c>=-0.0005&&c<=1.0005})}
function lch2lab(L,C,h){var r=h*Math.PI/180;return [L,C*Math.cos(r),C*Math.sin(r)]}
function lchHex(L,C,h){var c=C;while(c>0&&!inGamut(lch2lab(L,c,h)))c-=0.5;return rgb2hex(lab2rgb(lch2lab(L,Math.max(0,c),h)))}
var labCache={};
function hexLab(h){return labCache[h]||(labCache[h]=rgb2lab(hex2rgb(h)))}
function toLab(x){return typeof x==='string'?hexLab(x):x}
function dE(a,b){a=toLab(a);b=toLab(b);return Math.sqrt((a[0]-b[0])*(a[0]-b[0])+(a[1]-b[1])*(a[1]-b[1])+(a[2]-b[2])*(a[2]-b[2]))}
function lch(x){var l=toLab(x);return {L:l[0],C:Math.sqrt(l[1]*l[1]+l[2]*l[2]),h:(Math.atan2(l[2],l[1])*180/Math.PI+360)%360}}
function hueDiff(a,b){var d=Math.abs(a-b)%360;return d>180?360-d:d}
/* Individual Typology Angle (Chardon / Del Bino): depth of skin tone */
function ita(lab){var b=Math.max(0.5,lab[2]);return Math.atan((lab[0]-50)/b)*180/Math.PI}
function itaCat(v){return v>55?'Very light':v>41?'Light':v>28?'Medium':v>10?'Tan':v>-30?'Deep':'Very deep'}
function hueCue(h){return h>=60?'golden / warm-leaning':h>=51?'neutral':'rosy / cool-leaning'}
/* white balance: von Kries gains in linear light so the paper reads as neutral ~92% white */
var WB_TARGET=235;
function wbGains(paper){var t=lin(WB_TARGET);return paper.map(function(c){return clamp(t/Math.max(1e-4,lin(Math.max(1,c))),0.3,4)})}
function applyGains(rgb,g){return rgb.map(function(c,i){return delin(lin(c)*g[i])})}
function paperOk(p){var m=(p[0]+p[1]+p[2])/3,mx=Math.max(p[0],p[1],p[2]),mn=Math.min(p[0],p[1],p[2]);return m>90&&(mx-mn)/m<0.38}
function median(a){if(!a.length)return 0;var s=a.slice().sort(function(x,y){return x-y}),m=s.length>>1;return s.length%2?s[m]:(s[m-1]+s[m])/2}
/* robust skin colour: drop non-skin-ish pixels, reject highlights (top 12% luma) and shadows (bottom 18%), median per channel */
function robustSkin(px){
  var c=px.filter(function(p){return p[0]>25&&p[0]>=p[2]*0.92&&p[0]<254});
  if(c.length<20)c=px.slice();
  var Y=c.map(function(p){return 0.299*p[0]+0.587*p[1]+0.114*p[2]}).sort(function(a,b){return a-b});
  var lo=Y[Math.floor(Y.length*0.18)]||0,hi=Y[Math.min(Y.length-1,Math.floor(Y.length*0.88))]||255;
  var k=c.filter(function(p){var y=0.299*p[0]+0.587*p[1]+0.114*p[2];return y>=lo&&y<=hi});
  if(!k.length)k=c;
  return {rgb:[0,1,2].map(function(i){return median(k.map(function(p){return p[i]}))}),n:px.length,kept:k.length};
}
function medianRgb(px){return [0,1,2].map(function(i){return median(px.map(function(p){return p[i]}))})}
/* foundation shade free text: only a trailing undertone letter (or a "3Y07"-style middle letter) is read */
var UT={W:['warm',1,0],Y:['yellow / golden',1,0],O:['olive',0.3,-0.4],N:['neutral',0,0],C:['cool',-1,0],R:['red',-0.5,0],P:['pink',-1,0]};
function parseFoundation(t){
  t=String(t||'').trim();if(!t)return null;
  var m=t.match(/([WCNOYRP])\s*$/i)||t.match(/\b\d([WCNOYRP])\d{2}\b/i);
  if(!m)return {text:t.slice(0,40),letter:null};
  var L=m[1].toUpperCase();return {text:t.slice(0,40),letter:L,label:UT[L][0]};
}

/* =================== analysis model =================== */
var QUIZ=[
 {id:'vein',q:'Veins on your inner wrist (in daylight) look…',o:[['green','Greenish'],['blue','Blue / purple'],['mix','A mix / can’t tell']]},
 {id:'jewel',q:'Which jewellery makes your skin look better?',o:[['gold','Gold'],['silver','Silver'],['both','Both equally']]},
 {id:'white',q:'Held under your chin, which looks better?',o:[['white','Pure white'],['cream','Cream / ivory'],['both','Both / unsure']]},
 {id:'sun',q:'In strong sun you usually…',o:[['tan','Tan easily, rarely burn'],['both','Burn a bit, then tan'],['burn','Burn easily, rarely tan']]},
 {id:'hair',q:'Natural hair colour',o:[['black','Black'],['dkbrown','Dark brown'],['brown','Medium brown'],['ltbrown','Light brown'],['blonde','Golden blonde'],['auburn','Auburn / red'],['grey','Grey / silver']]},
 {id:'eye',q:'Eye colour',o:[['dark','Black / dark brown'],['brown','Brown'],['hazel','Hazel / amber'],['green','Green'],['blue','Blue'],['grey','Grey']]}
];
var QV={vein:{green:{W:1},blue:{W:-1},mix:{W:0}},jewel:{gold:{W:1},silver:{W:-1},both:{W:0}},
 white:{white:{W:-0.8,C:0.3},cream:{W:0.8,C:-0.2},both:{W:0}},sun:{tan:{W:0.4,D:0.3},both:{},burn:{W:-0.4,D:-0.4}},
 hair:{black:{D:0.8},dkbrown:{D:0.5},brown:{D:0},ltbrown:{D:-0.5,C:-0.3},blonde:{W:0.5,D:-0.8},auburn:{W:1},grey:{W:-0.5,C:-0.3}},
 eye:{dark:{D:0.5,C:0.2},brown:{D:0.2},hazel:{W:0.5,C:-0.3},green:{W:0.2,C:0.2},blue:{W:-0.5,C:0.5},grey:{W:-0.3,C:-0.5}}};
var HAIRL={black:12,dkbrown:22,brown:35,ltbrown:50,blonde:70,auburn:40,grey:65};
/* draping pairs: each option carries a (warmth, depth, clarity) vector */
var PAIRS=[
 {id:'t1',title:'Warm vs cool',a:{n:'Warm gold-peach',h:'#f2b07a',v:[1,0,0]},b:{n:'Cool silver-pink',h:'#e6b3cb',v:[-1,0,0]}},
 {id:'t2',title:'Warm red vs cool red',a:{n:'Tomato / sindoori red',h:'#e0452b',v:[1,0,0]},b:{n:'Blue-red / crimson',h:'#c3123f',v:[-1,0,0]}},
 {id:'t3',title:'Gold vs silver',a:{n:'Gold lamé',h:'#d4a937',v:[1,0,0]},b:{n:'Silver lamé',h:'#c4c8cf',v:[-1,0,0]}},
 {id:'d1',title:'Light vs deep',a:{n:'Ivory blush',h:'#f3e2d3',v:[0,-1,0]},b:{n:'Deep wine',h:'#4b1528',v:[0,1,0]}},
 {id:'d2',title:'Light vs deep (blue)',a:{n:'Powder blue',h:'#b7cde8',v:[0,-1,0]},b:{n:'Navy',h:'#1b2a59',v:[0,1,0]}},
 {id:'c1',title:'Clear vs soft',a:{n:'Bright rani pink',h:'#e0157f',v:[0,0,1]},b:{n:'Dusty rose',h:'#c19aa0',v:[0,0,-1]}},
 {id:'c2',title:'Clear vs soft (green)',a:{n:'Emerald',h:'#009b5a',v:[0,0,1]},b:{n:'Sage',h:'#9fae8e',v:[0,0,-1]}},
 {id:'s1',title:'Spring vs Autumn',a:{n:'Coral (Spring)',h:'#ff7f5c',v:[0.6,-0.6,0.6]},b:{n:'Rust (Autumn)',h:'#a8462a',v:[0.6,0.6,-0.6]}},
 {id:'s2',title:'Summer vs Winter',a:{n:'Lavender (Summer)',h:'#b9a5d8',v:[-0.6,-0.6,-0.6]},b:{n:'Royal purple (Winter)',h:'#5a189a',v:[-0.6,0.6,0.6]}}
];
var AX=['W','D','C'];
function addSrc(out,ax,label,val,w){if(w>0&&isFinite(val))out[ax].push({label:label,val:clamp(val,-1,1),w:w})}
/* profile: {meas:{lab,ita,hue,q}, quiz:{id:val}, found:{letter}, votes:{pid:'a'|'b'|'='}, pvotes:{pid:..}} */
function computeAxes(p){
  var src={W:[],D:[],C:[]},m=p.meas,q=p.quiz||{};
  if(m&&m.lab){
    var qq=m.q==null?1:m.q;
    addSrc(src,'W','Skin hue angle '+Math.round(m.hue)+'°',(m.hue-55)/9,0.9*qq);
    addSrc(src,'D','Skin depth ITA '+Math.round(m.ita)+'°',(30-m.ita)/32,1.6*qq);
    var cs=Math.sqrt(m.lab[1]*m.lab[1]+m.lab[2]*m.lab[2]);
    addSrc(src,'C','Skin chroma '+cs.toFixed(0),(cs-19)/8,0.3*qq);
  }
  AX.forEach(function(ax){
    var s=0,n=0,lab=[];
    QUIZ.forEach(function(qd){var a=q[qd.id];if(!a||!QV[qd.id][a])return;var v=QV[qd.id][a][ax];if(v===undefined)return;s+=v;n++;lab.push(qd.id+': '+a)});
    if(n)addSrc(src,ax,'Quiz ('+lab.join(', ')+')',s/n,(ax==='W'?1.1:0.6)*Math.min(1,n/3));
  });
  if(q.hair&&HAIRL[q.hair]!==undefined){
    var sl=m&&m.lab?m.lab[0]:60,con=Math.abs(sl-HAIRL[q.hair]);
    addSrc(src,'C','Hair-to-skin contrast '+Math.round(con),(con-32)/22,0.8);
  }
  if(p.found&&p.found.letter&&UT[p.found.letter]){
    var u=UT[p.found.letter];
    addSrc(src,'W','Foundation undertone '+p.found.letter+' ('+u[0]+')',u[1],1.2);
    if(u[2])addSrc(src,'C','Foundation undertone '+p.found.letter,u[2],0.5);
  }
  var votes=p.votes||{},pv=p.pvotes||{};
  AX.forEach(function(ax,ai){
    var num=0,den=0,pairsAx=0,voted=0;
    PAIRS.forEach(function(pr){
      var d=(pr.a.v[ai]-pr.b.v[ai])/2;if(!d)return;pairsAx++;
      [[votes[pr.id],1],[pv[pr.id],0.5]].forEach(function(x,k){
        var v=x[0];if(v!=='a'&&v!=='b')return;if(!k)voted++;
        num+=x[1]*(v==='a'?d:-d);den+=x[1]*Math.abs(d);
      });
    });
    if(den>0)addSrc(src,ax,'Draping ('+voted+'/'+pairsAx+' pairs'+(Object.keys(pv).length?', incl. partner votes':'')+')',num/den,(ax==='W'?1.8:ax==='D'?1.2:1.6)*Math.max(0.35,voted/pairsAx));
  });
  var axes={};
  AX.forEach(function(ax){var s=0,w=0;src[ax].forEach(function(x){s+=x.val*x.w;w+=x.w});axes[ax]=w?s/w:0});
  return {axes:axes,src:src};
}
var SEASONS=[
 {id:'light-spring',name:'Light Spring',fam:'Spring',p:[0.5,-1,0.3],L:[70,88],C:[32,50],opp:'deep-winter',desc:'Delicate, warm and fresh. Light, clear, sunny shades (peach, warm pink, aqua, butter yellow) make you glow; very dark or dusty colours overpower you.'},
 {id:'true-spring',name:'True Spring',fam:'Spring',p:[1,-0.3,0.5],L:[58,80],C:[48,70],opp:'true-summer',desc:'Golden and lively. Warm, clear colours such as coral, marigold, leaf green and turquoise light you up; cool greys and icy tones drain you.'},
 {id:'bright-spring',name:'Bright Spring',fam:'Spring',p:[0.4,0,1],L:[50,74],C:[62,88],opp:'soft-summer',desc:'Vivid and sparkling, warm-leaning. Saturated, clear colours (hot coral, parrot green, bright turquoise) suit you; muted, dusty shades look flat.'},
 {id:'light-summer',name:'Light Summer',fam:'Summer',p:[-0.5,-1,-0.3],L:[70,88],C:[18,34],opp:'deep-autumn',desc:'Soft, cool and airy. Powder blue, lavender, rose pink and soft mint are your friends; heavy dark or orange tones overwhelm you.'},
 {id:'true-summer',name:'True Summer',fam:'Summer',p:[-1,-0.3,-0.5],L:[52,74],C:[22,38],opp:'true-spring',desc:'Cool and gentle. Blue-based, slightly muted colours (rose, raspberry, slate blue, soft teal) flatter you; golden and orange shades look sallow.'},
 {id:'soft-summer',name:'Soft Summer',fam:'Summer',p:[-0.4,0.1,-1],L:[45,68],C:[14,28],opp:'bright-spring',desc:'Muted, cool-leaning and elegant. Dusty rose, mauve, grey-blue and sage blend beautifully with you; neon and very bright colours shout over you.'},
 {id:'soft-autumn',name:'Soft Autumn',fam:'Autumn',p:[0.4,0.1,-1],L:[45,68],C:[18,32],opp:'bright-winter',desc:'Muted, warm-leaning and earthy. Camel, dusty peach, olive and soft teal harmonise with you; stark black-and-white and icy brights are harsh.'},
 {id:'true-autumn',name:'True Autumn',fam:'Autumn',p:[1,0.4,-0.5],L:[36,62],C:[34,56],opp:'true-winter',desc:'Rich, warm and golden. Rust, mustard, olive, teal and warm reds are made for you; cool pinks and silvery pastels wash you out.'},
 {id:'deep-autumn',name:'Deep Autumn',fam:'Autumn',p:[0.5,1,-0.3],L:[22,48],C:[30,52],opp:'light-summer',desc:'Deep, warm and intense. Maroon, chocolate, bottle green, burnt orange and antique gold are stunning on you; pale pastels look weak.'},
 {id:'deep-winter',name:'Deep Winter',fam:'Winter',p:[-0.5,1,0.3],L:[18,46],C:[34,62],opp:'light-spring',desc:'Deep, cool and striking. Black-cherry, emerald, royal purple and true red suit you; light warm pastels and beige fade you.'},
 {id:'true-winter',name:'True Winter',fam:'Winter',p:[-1,0.4,0.5],L:[28,58],C:[52,80],opp:'true-autumn',desc:'Cool, crisp and high-contrast. Blue-red, fuchsia, royal blue and pure white are your power colours; earthy oranges and mustard look muddy.'},
 {id:'bright-winter',name:'Bright Winter',fam:'Winter',p:[-0.4,0,1],L:[40,68],C:[64,92],opp:'soft-autumn',desc:'Vivid, cool-leaning and dazzling. Electric fuchsia, emerald, cobalt and icy brights love you; dusty, muted shades dull you.'}
];
var SBY={};SEASONS.forEach(function(s){SBY[s.id]=s});
function classify(p){
  var ax=computeAxes(p),a=ax.axes;
  var ranked=SEASONS.map(function(s){
    var dw=a.W-s.p[0],dd=a.D-s.p[1],dc=a.C-s.p[2];
    return {id:s.id,dist:Math.sqrt(1.2*dw*dw+dd*dd+dc*dc)};
  }).sort(function(x,y){return x.dist-y.dist});
  var m=p.meas,mq=m&&m.lab?(m.q==null?1:m.q):0;
  var qn=Object.keys(p.quiz||{}).filter(function(k){return QV[k]&&QV[k][p.quiz[k]]}).length;
  var dv=PAIRS.filter(function(pr){var v=(p.votes||{})[pr.id];return v==='a'||v==='b'}).length;
  var pvn=PAIRS.filter(function(pr){var v=(p.pvotes||{})[pr.id];return v==='a'||v==='b'}).length;
  var comp=0.3*mq+0.2*qn/QUIZ.length+0.4*dv/PAIRS.length+0.1*pvn/PAIRS.length;
  var margin=ranked[1].dist-ranked[0].dist;
  var conf=clamp(0.22+margin*1.1+0.45*comp,0.15,0.92);
  return {axes:a,src:ax.src,ranked:ranked,season:ranked[0].id,conf:conf,comp:comp};
}
/* palettes: generated in CIE LCh from each season's lightness & chroma ranges, warm or cool hue families */
var WARM_FAM=[['red',40,0.35],['salmon pink',28,0.8],['coral',50,0.62],['orange',62,0.45],['gold',82,0.55],['yellow',96,0.85],['olive',108,0.25],['green',135,0.45],['teal',185,0.35],['turquoise',205,0.7],['warm blue',272,0.4],['violet',322,0.45]];
var COOL_FAM=[['blue-red',22,0.4],['raspberry',0,0.45],['fuchsia',340,0.55],['rose pink',8,0.85],['plum',320,0.25],['violet',305,0.6],['royal blue',295,0.35],['icy blue',255,0.85],['teal',200,0.4],['emerald',158,0.4],['mint',175,0.85],['lemon',100,0.9]];
function seasonPalette(s){
  var fam=s.p[0]>=0?WARM_FAM:COOL_FAM,out=[];
  fam.forEach(function(f){
    [-0.22,0.22].forEach(function(off,i){
      var t=clamp(f[2]+off,0,1),L=s.L[0]+(s.L[1]-s.L[0])*t,C=s.C[0]+(s.C[1]-s.C[0])*(i?0.35:0.8);
      var hx=lchHex(L,C,f[1]+(i?4:-4)),tries=0;
      while(out.some(function(o){return dE(o,hx)<6})&&tries<6){tries++;hx=lchHex(clamp(L+(i?5:-5)*tries,8,96),C,f[1]+tries*6)}
      out.push(hx);
    });
  });
  return out;
}
function seasonNeutrals(s){
  var Ls=[s.L[1]+8,s.L[1]-6,(s.L[0]+s.L[1])/2,s.L[0]+2,s.L[0]-10,s.L[0]-20].map(function(v){return clamp(v,10,97)});
  var spec=s.p[0]>=0?[[85,9],[80,15],[70,26],[62,22],[55,16],[90,13]]:[[270,2],[265,3],[25,9],[260,4],[285,22],[280,2]];
  var out=[];
  spec.forEach(function(x,i){var hx=lchHex(Ls[i],x[1]*(s.C[0]<25?0.8:1),x[0]);if(out.indexOf(hx)<0)out.push(hx)});
  return out;
}
function seasonAvoid(s){
  var o=SBY[s.opp],own=seasonPalette(s).concat(seasonNeutrals(s)),cand=seasonPalette(o).concat(seasonNeutrals(o));
  var th=24,ok=[];
  while(th>=8){ok=cand.filter(function(c){return own.every(function(x){return dE(c,x)>th})});if(ok.length>=8)break;th-=4}
  if(ok.length<8)ok=cand.slice();
  var out=[];for(var i=0;i<8;i++)out.push(ok[Math.floor(i*ok.length/8)]);
  return out.filter(function(c,i){return out.indexOf(c)===i});
}
function metalFor(W){return W>0.25?'gold':W<-0.25?'silver':'rose gold'}
var METAL_HEX={gold:'#d4af37',silver:'#c0c2c9','rose gold':'#c98b7f'};
/* pick 8 standouts (spread across the palette, preferring mid/high chroma) */
function bestOf(pal){var out=[];for(var i=0;i<pal.length&&out.length<8;i+=3)out.push(pal[i]);return out}
function buildResult(p){
  var c=classify(p),s=SBY[c.season],pal=seasonPalette(s);
  var why=[];
  var axName={W:['Cool','Warm'],D:['Light','Deep'],C:['Soft','Clear']};
  AX.forEach(function(ax){
    var v=c.axes[ax],lean=Math.abs(v)<0.15?'neutral':(v>0?axName[ax][1]:axName[ax][0]).toLowerCase();
    var top=c.src[ax].slice().sort(function(a,b){return b.w*Math.abs(b.val)-a.w*Math.abs(a.val)}).slice(0,3)
      .map(function(x){return x.label+' '+(x.val>=0?'+':'')+x.val.toFixed(2)}).join('; ');
    why.push(axName[ax][0]+'↔'+axName[ax][1]+': '+(v>=0?'+':'')+v.toFixed(2)+' ('+lean+')'+(top?' — '+top:''));
  });
  return {season:s.id,name:s.name,fam:s.fam,palette:pal,best:bestOf(pal),avoid:seasonAvoid(s),neutrals:seasonNeutrals(s),
    metal:metalFor(c.axes.W),conf:Math.round(c.conf*100),axes:{W:+c.axes.W.toFixed(3),D:+c.axes.D.toFixed(3),C:+c.axes.C.toFixed(3)},
    alt:c.ranked.slice(1,3).map(function(r){return r.id}),why:why,
    skin:p.meas&&p.meas.rgb?rgb2hex(p.meas.rgb):'#c99a78'};
}
function cleanHexes(a,max){return Array.isArray(a)?a.filter(isHex).slice(0,max).map(function(h){return h.toLowerCase()}):[]}
function cleanRes(r){
  if(!r||typeof r!=='object'||!SBY[r.season])return null;
  var s=SBY[r.season],pal=cleanHexes(r.palette,24);
  return {season:s.id,name:s.name,fam:s.fam,palette:pal.length>=12?pal:seasonPalette(s),best:(function(b){return b.length?b:bestOf(seasonPalette(s))})(cleanHexes(r.best,12)),
    avoid:(function(b){return b.length?b:seasonAvoid(s)})(cleanHexes(r.avoid,8)),neutrals:(function(b){return b.length?b:seasonNeutrals(s)})(cleanHexes(r.neutrals,8)),
    metal:METAL_HEX[r.metal]?r.metal:'gold',conf:clamp(+r.conf||50,0,100),axes:r.axes&&typeof r.axes==='object'?{W:+r.axes.W||0,D:+r.axes.D||0,C:+r.axes.C||0}:{W:0,D:0,C:0},
    alt:Array.isArray(r.alt)?r.alt.filter(function(x){return SBY[x]}).slice(0,2):[],why:Array.isArray(r.why)?r.why.slice(0,4).map(function(x){return String(x).slice(0,300)}):[],
    skin:isHex(r.skin)?r.skin:'#c99a78'};
}

/* =================== colour names =================== */
var NAMES=[['Ivory','#fffff0'],['Cream','#f5ecd7'],['Champagne','#f1ddb4'],['Beige','#d9c3a5'],['Camel','#c19a6b'],['Caramel','#a8743a'],['Chocolate','#5a3a22'],['Espresso','#3b2618'],['Taupe','#8b7d74'],['Rose taupe','#9a7f7f'],['Soft white','#f4f1ea'],['Optic white','#ffffff'],['Silver grey','#bfc3c8'],['Dove grey','#9a9ea4'],['Charcoal','#3a3d42'],['Black','#121212'],['Warm grey','#8f877d'],
['Sindoori red','#d1301f'],['Tomato red','#e5482e'],['Classic red','#c0141f'],['Crimson','#b5123a'],['Blue-red','#c4103f'],['Cherry','#a10f2b'],['Maroon','#6b1020'],['Wine','#5a1630'],['Burgundy','#721d34'],['Brick','#a94430'],['Rust','#ad4a26'],['Terracotta','#c4653e'],
['Rani pink','#e0218a'],['Fuchsia','#e3007d'],['Hot pink','#ff4fa0'],['Raspberry','#c2185b'],['Rose pink','#e88aa8'],['Blush','#f4c2c2'],['Dusty rose','#c4929b'],['Mauve','#a8798f'],['Baby pink','#f7cfdc'],['Salmon pink','#f6a08a'],['Coral','#ff6f5e'],['Peach','#ffb48a'],['Apricot','#f8b878'],
['Kesari','#f18a1c'],['Marigold','#f5a623'],['Tangerine','#ff8a3d'],['Haldi yellow','#f2b705'],['Mustard','#c9a227'],['Gold','#d4af37'],['Antique gold','#b08d3c'],['Lemon','#f5e663'],['Butter','#f8e7a1'],['Burnt orange','#c0581f'],
['Mehndi green','#6b7f2a'],['Olive','#707b35'],['Moss','#7a8a3d'],['Sage','#9fae8e'],['Mint','#a8e6c9'],['Pistachio','#b6d68a'],['Parrot green','#4fbf3a'],['Emerald','#009b5a'],['Bottle green','#0c5a3c'],['Pine','#1f5c4a'],['Jade','#3fa385'],
['Teal','#00808a'],['Peacock','#007c91'],['Turquoise','#30c5c5'],['Aqua','#7fd8d6'],['Powder blue','#b7cde8'],['Sky blue','#7fb2e5'],['Cornflower','#6488d8'],['Periwinkle','#9aa6e3'],['Firozi','#2bb3c0'],['Royal blue','#2346b0'],['Cobalt','#1f4fd1'],['Navy','#1b2a59'],['Ink blue','#14214a'],['Denim','#4f6d9a'],['Slate blue','#5b7fa3'],
['Lavender','#b9a5d8'],['Lilac','#c8a2d6'],['Orchid','#b565b8'],['Plum','#6e2a5e'],['Aubergine','#3f1d3c'],['Royal purple','#5a189a'],['Violet','#7a3fc4'],['Amethyst','#8e5bb5'],['Magenta','#c2007a'],['Rose gold','#c98b7f'],['Silver','#c0c2c9']];
function cname(h){var b=null,bd=1e9;NAMES.forEach(function(n){var d=dE(h,n[1]);if(d<bd){bd=d;b=n[0]}});return b}

/* =================== couple: overlap + coordinated looks =================== */
function overlapPalette(a,b){
  var out=[],pairs=[];
  a.palette.forEach(function(x){var m=1e9,bb=null;b.palette.forEach(function(y){var d=dE(x,y);if(d<m){m=d;bb=y}});pairs.push([x,bb,m])});
  pairs.sort(function(p,q){return p[2]-q[2]});
  pairs.forEach(function(p){
    if(out.length>=12)return;
    if(p[2]>22&&out.length>=6)return;
    var la=hexLab(p[0]),lb=hexLab(p[1]),mid=rgb2hex(lab2rgb([(la[0]+lb[0])/2,(la[1]+lb[1])/2,(la[2]+lb[2])/2]));
    if(out.every(function(o){return dE(o,mid)>8}))out.push(mid);
  });
  return out;
}
var FUNCS=[
 {id:'ak',name:'Anand Karaj',icon:'🙏',note:'Daytime at the Gurdwara: modest, luminous and traditional.'},
 {id:'mehndi',name:'Mehndi',icon:'🌿',note:'Playful and bright: haldi yellows, mehndi greens, marigold.'},
 {id:'sangeet',name:'Sangeet / night',icon:'🌙',note:'Jewel tones and shimmer under night lights.'},
 {id:'reception',name:'Reception',icon:'✨',note:'Elegant: champagne pastels or rich deep tones.'}
];
var TRAD_HER={ak:['#b3001b','#6b1020','#e0218a','#f4b6c2','#ffb48a','#ff6f5e','#c4103f','#d1301f'],mehndi:['#f2b705','#4fbf3a','#6b7f2a','#f18a1c','#f5a623','#a8e6c9','#e0218a'],
 sangeet:['#009b5a','#5a189a','#5a1630','#007c91','#c2185b','#14214a','#6e2a5e'],reception:['#f1ddb4','#f4c2c2','#fffff0','#5a1630','#0c5a3c','#b9a5d8','#bfc3c8']};
var GROOM={ak:['#fffff0','#f5ecd7','#f1ddb4','#d9c3a5','#d4af37'],mehndi:['#f8e7a1','#fffff0','#a8e6c9','#f5ecd7','#b6d68a'],
 sangeet:['#121212','#3a3d42','#5a1630','#0c5a3c','#f1ddb4'],reception:['#3a3d42','#fffff0','#f1ddb4','#121212','#8b7d74']};
var AK_FAV=[['Classic red','#b3001b'],['Maroon','#6b1020'],['Rani pink','#e0218a'],['Blush pink','#f4b6c2'],['Peach','#ffb48a'],['Coral','#ff6f5e'],['Blue-red','#c4103f'],['Sindoori red','#d1301f']];
var SCHEME={complementary:['Complementary','Blue meets its opposite (orange, gold, peach): the dastar pops.',22],analogous:['Analogous','Neighbouring blues, teals and violets: calm and regal.',16],
 triadic:['Triadic','Blue + red + yellow family: festive and balanced.',18],split:['Split-complementary','Coral-to-gold side of blue’s opposite: lively but easy.',18],
 neutral:['Neutral base','Ivory, champagne or charcoal lets the neela lead.',14]};
function fit(c,res){var m=1e9;res.palette.concat(res.neutrals).forEach(function(x){var d=dE(c,x);if(d<m)m=d});return Math.max(0,30-m)}
function stars(c,res){var f=30-fit(c,res);return f<8?5:f<13?4:f<19?3:f<26?2:1}
function schemeOf(c,turban){
  var a=lch(c),t=lch(turban);if(a.C<12)return 'neutral';
  var d=hueDiff(a.h,t.h);
  return d<40?'analogous':d>=150?'complementary':d>=135?'split':(d>=100&&d<135)?'triadic':null;
}
function harm(c,turban){var s=schemeOf(c,turban);return s?SCHEME[s][2]:0}
function contrastOK(c,turban){var a=hexLab(c),t=hexLab(turban);return dE(c,turban)>=28||Math.abs(a[0]-t[0])>=25}
function fnBonus(fn,her,his){
  var a=lch(her),b=lch(his),s=0;
  if(fn==='ak'){if((a.h>=345||a.h<=70)&&a.C>25)s+=25;if(b.L>70&&b.C<35)s+=12}
  else if(fn==='mehndi'){if(a.h>=70&&a.h<=170&&a.C>30)s+=22;if(a.L>55)s+=5;if(b.L>60)s+=6}
  else if(fn==='sangeet'){if(a.L<52&&a.C>30)s+=22;if(b.L<45)s+=8}
  else if(fn==='reception'){if((a.L>72&&a.C<40)||a.L<40)s+=18;if(b.C<20)s+=10}
  return s;
}
function uniq(a){var o=[];a.forEach(function(x){if(isHex(x)&&o.every(function(y){return dE(x,y)>3}))o.push(x.toLowerCase())});return o}
function coupleLooks(him,her,turban){
  turban=isHex(turban)?turban.toLowerCase():DEF_TURBAN;
  var ov=overlapPalette(him,her),metal=her.metal,usedHis={},usedHer={},usedAcc={};
  var fns=FUNCS.map(function(f){
    var herC=uniq(her.palette.concat(TRAD_HER[f.id].filter(function(c){return stars(c,her)>=3}))),
        hisC=uniq(his(f.id));
    function his(id){return him.palette.concat(him.neutrals,GROOM[id].filter(function(c){return stars(c,him)>=2}))}
    var combos=[];
    herC.forEach(function(h){
      if(dE(h,turban)<14)return; /* never put her in the dastar colour itself */
      var hf=fit(h,her)*1.2+harm(h,turban);
      hisC.forEach(function(g){
        if(!contrastOK(g,turban))return; /* his outfit must let the dastar stand out */
        if(dE(g,h)<15)return;
        var sc=hf+fit(g,him)+0.6*harm(g,turban)+fnBonus(f.id,h,g);
        combos.push({her:h,his:g,sc:sc,scheme:schemeOf(h,turban)||schemeOf(g,turban)||'neutral'});
      });
    });
    /* variety across functions: penalise outfit colours already proposed for an earlier function */
    combos.forEach(function(c){c.adj=c.sc-9*(usedHis[c.his]||0)-7*(usedHer[c.her]||0)});
    combos.sort(function(a,b){return b.adj-a.adj||(a.her<b.her?-1:1)});
    var pick=[],used={};
    [true,false].forEach(function(strict){
      combos.forEach(function(c){
        if(pick.length>=3)return;
        if(strict&&used[c.scheme])return;
        if(pick.some(function(p){return dE(p.her,c.her)<14||(strict?dE(p.his,c.his)<10:(p.his===c.his&&dE(p.her,c.her)<25))}))return;
        pick.push(c);used[c.scheme]=1;
      });
    });
    pick.forEach(function(c){usedHis[c.his]=(usedHis[c.his]||0)+1;usedHer[c.her]=(usedHer[c.her]||0)+1});
    var usedAccFn={};
    var looks=pick.map(function(c){
      var accC=uniq(ov.concat([METAL_HEX.gold,METAL_HEX.silver,METAL_HEX['rose gold']],her.best,him.best)),best=null,bs=-1e9;
      accC.forEach(function(a){
        if(dE(a,c.her)<18||dE(a,c.his)<12||dE(a,turban)<10)return;
        var s=(ov.indexOf(a)>=0?12:0)+0.5*harm(a,turban)+(a===METAL_HEX[metal]?6:0)+((f.id==='ak'||f.id==='reception')&&a===METAL_HEX.gold&&metal==='gold'?8:0)+fit(a,her)*0.3-10*(usedAccFn[a]||0)-4*(usedAcc[a]||0);
        if(s>bs){bs=s;best=a}
      });
      best=best||METAL_HEX[metal];usedAccFn[best]=(usedAccFn[best]||0)+1;usedAcc[best]=(usedAcc[best]||0)+1;
      return {id:f.id+':'+c.her+'/'+c.his+'/'+best,fn:f.id,scheme:c.scheme,her:c.her,his:c.his,acc:best,turban:turban,metal:metal,
        neela:harm(c.her,turban)>=14&&contrastOK(c.his,turban),score:Math.round(c.sc),
        names:{her:cname(c.her),his:cname(c.his),acc:cname(best),turban:cname(turban)}};
    });
    return {id:f.id,name:f.name,icon:f.icon,note:f.note,looks:looks};
  });
  var trad=AK_FAV.map(function(x){return {name:x[0],hex:x[1],stars:stars(x[1],her)}});
  return {overlap:ov,fns:fns,trad:trad};
}

/* =================== synthetic camera (test mode / manual avatar) =================== */
var FAKE={host:{skin:[150,100,70],cast:[1.07,1,0.84]},guest:{skin:[230,192,182],cast:[0.94,1,1.1]}};
function drawSynth(g,w,h,o){
  var cast=o.cast,cs=function(c,k){return c.map(function(v,i){return clamp(v*(k||1)*(cast?cast[i]:1),0,255)})};
  var col=function(c,k){return 'rgb('+cs(c,k).map(Math.round).join(',')+')'};
  var bg=g.createLinearGradient(0,0,0,h);bg.addColorStop(0,col([168,172,176]));bg.addColorStop(1,col([128,132,138]));g.fillStyle=bg;g.fillRect(0,0,w,h);
  var cx=w*0.5,cy=h*0.4,rx=w*0.15,ry=h*0.25,sk=o.skin;
  g.fillStyle=col([96,100,112]);g.beginPath();g.ellipse(cx,h*1.02,w*0.42,h*0.3,0,0,7);g.fill();
  g.fillStyle=col(sk,0.86);g.fillRect(cx-w*0.06,cy+ry*0.6,w*0.12,h*0.18);
  if(!o.turban){g.fillStyle=col([34,24,20]);g.beginPath();g.ellipse(cx,cy-h*0.03,rx*1.12,ry*1.02,0,0,7);g.fill()}
  var fg=g.createRadialGradient(cx-rx*0.15,cy-ry*0.1,rx*0.1,cx,cy,rx*1.15);fg.addColorStop(0,col(sk,1.06));fg.addColorStop(0.65,col(sk,1));fg.addColorStop(1,col(sk,0.8));
  g.fillStyle=fg;g.beginPath();g.ellipse(cx,cy,rx,ry,0,0,7);g.fill();
  if(o.turban){var t=hex2rgb(o.turban);g.fillStyle=col(t);g.beginPath();g.ellipse(cx,cy-ry*0.72,rx*1.22,ry*0.62,0,Math.PI,2*Math.PI);g.lineTo(cx+rx*1.22,cy-ry*0.55);g.quadraticCurveTo(cx,cy-ry*0.82,cx-rx*1.22,cy-ry*0.55);g.fill();
    g.strokeStyle=col(t,1.35);g.lineWidth=3;g.beginPath();g.moveTo(cx-rx*0.9,cy-ry*0.9);g.quadraticCurveTo(cx,cy-ry*1.2,cx+rx*0.95,cy-ry*1.05);g.stroke()}
  else{g.fillStyle=col([34,24,20]);g.beginPath();g.ellipse(cx,cy-ry*0.82,rx*0.95,ry*0.3,0,0,7);g.fill()}
  [-1,1].forEach(function(s){g.fillStyle=col([245,245,240]);g.beginPath();g.ellipse(cx+s*rx*0.38,cy-ry*0.1,rx*0.16,ry*0.05,0,0,7);g.fill();
    g.fillStyle=col([40,28,22]);g.beginPath();g.arc(cx+s*rx*0.38,cy-ry*0.1,ry*0.04,0,7);g.fill()});
  g.fillStyle=col([168,84,84]);g.beginPath();g.ellipse(cx,cy+ry*0.5,rx*0.28,ry*0.07,0,0,7);g.fill();
  if(o.paper){var b=CAL_BOX;g.fillStyle=col([230,230,228]);g.fillRect(b[0]*w,b[1]*h,(b[2]-b[0])*w,(b[3]-b[1])*h)}
}
var CAL_BOX=[0.33,0.5,0.67,0.88];
var FACE={cx:0.5,cy:0.4,rx:0.15,ry:0.25};
var PATCHES=[[0.5-0.065,0.4+0.055,0.032,0.05],[0.5+0.065,0.4+0.055,0.032,0.05],[0.5,0.4-0.085,0.045,0.022]];
var SKIN_SCALE=['#f6e1d3','#efcfb8','#e8bf9f','#d9a77f','#c99064','#b57a4f','#9c6540','#845234','#6c4129','#55311f','#3f2418','#2d1a12'];

/* =================== styles =================== */
var CSS=[
'.cl{--a:#3d5afe;--a2:#ff6fa5;--sf:#ffb347;--glow:rgba(61,90,254,.35);max-width:820px;margin:0 auto;padding:4px 0 34px;font-family:inherit}',
'.cl *{box-sizing:border-box}',
'.cl button{font:inherit;font-weight:700;border:0;border-radius:14px;cursor:pointer;transition:transform .12s,filter .12s,box-shadow .15s;margin:0}',
'.cl button:hover:not(:disabled){transform:translateY(-2px);filter:brightness(1.08)}',
'.cl button:disabled{opacity:.35;cursor:default}',
'.cl-hdr{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px}',
'.cl-title{font-weight:800;font-size:1.45rem;background:linear-gradient(90deg,#8ea2ff,#ff8fb8,#ffc56b);-webkit-background-clip:text;background-clip:text;color:transparent}',
'.cl-pills{display:flex;gap:6px;flex-wrap:wrap}',
'.cl-pill{font-size:.8rem;font-weight:700;color:var(--dim);background:rgba(255,255,255,.07);border:1px solid var(--line);border-radius:999px;padding:4px 11px}',
'.cl-pill b{color:var(--ink)}',
'.cl-box{background:linear-gradient(150deg,var(--card2),var(--card));border:1px solid var(--line);border-radius:22px;padding:20px;margin:12px 0;box-shadow:var(--shadow);animation:clpop .25s}',
'.cl-box h2{margin:.1em 0 .3em;font-size:1.35rem}',
'.cl h3{margin:16px 0 8px;font-size:.78rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#c9d0ff}',
'.cl-sub{color:var(--dim);font-size:.94rem;line-height:1.45;margin:6px 0}',
'.cl-note{font-size:.84rem;color:#ffd9a8;background:rgba(255,179,71,.09);border:1px solid rgba(255,179,71,.25);border-radius:12px;padding:8px 12px;margin:10px 0;line-height:1.4}',
'.cl-rail{display:grid;grid-template-columns:repeat(6,1fr);gap:4px;margin:4px 0 10px}',
'.cl-rail div{text-align:center;font-size:.7rem;font-weight:700;color:var(--dim)}',
'.cl-rail div::before{content:"";display:block;height:5px;border-radius:5px;background:rgba(255,255,255,.1);margin-bottom:4px}',
'.cl-rail .done::before{background:linear-gradient(90deg,var(--a),var(--a2))}.cl-rail .cur{color:var(--ink)}.cl-rail .cur::before{background:var(--sf);box-shadow:0 0 10px var(--sf)}',
'.cl-big{display:block;width:100%;padding:15px;font-size:1.06rem;color:#fff;background:linear-gradient(135deg,var(--a),#7a5cff 55%,var(--a2));box-shadow:0 10px 26px var(--glow);margin-top:14px!important}',
'.cl-btn{padding:10px 16px;color:#1a1033;background:linear-gradient(135deg,#ffe08a,#ffb347)}',
'.cl-ghost{padding:9px 14px;background:rgba(255,255,255,.07)!important;color:var(--ink)!important;border:1px solid var(--line)!important;box-shadow:none}',
'.cl-row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}.cl-row>.grow{flex:1}',
'.cl-chips{display:flex;flex-wrap:wrap;gap:8px}',
'.cl-chip{padding:8px 14px;border-radius:999px;border:1.5px solid var(--line)!important;background:rgba(255,255,255,.06);color:var(--ink);font-size:.9rem}',
'.cl-chip.on{background:linear-gradient(135deg,var(--a),var(--a2));border-color:transparent!important;color:#fff;box-shadow:0 6px 18px var(--glow)}',
'.cl-tips{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;margin:10px 0}',
'.cl-tip{display:flex;gap:10px;align-items:flex-start;background:rgba(255,255,255,.05);border:1px solid var(--line);border-radius:14px;padding:10px 12px;font-size:.9rem;line-height:1.35}',
'.cl-tip i{font-style:normal;font-size:1.4rem}',
'.cl-stage{position:relative;border-radius:18px;overflow:hidden;border:1px solid var(--line);background:#000;box-shadow:0 12px 30px rgba(0,0,0,.45)}',
'.cl-stage canvas{display:block;width:100%;height:auto}',
'.cl-stage .lab{position:absolute;left:10px;top:10px;font-size:.78rem;font-weight:800;background:rgba(0,0,0,.55);border-radius:999px;padding:4px 10px}',
'.cl-sw{display:inline-block;width:34px;height:34px;border-radius:10px;border:1px solid rgba(255,255,255,.2);vertical-align:middle;box-shadow:inset 0 0 0 1px rgba(0,0,0,.15)}',
'.cl-swatches{display:grid;grid-template-columns:repeat(auto-fill,minmax(54px,1fr));gap:7px}',
'.cl-swatches>div{position:relative;aspect-ratio:1;border-radius:12px;border:1px solid rgba(255,255,255,.15);box-shadow:0 4px 10px rgba(0,0,0,.25)}',
'.cl-swatches>div small{position:absolute;left:0;right:0;bottom:-1px;font-size:.58rem;font-weight:700;text-align:center;color:#fff;text-shadow:0 1px 3px #000;line-height:1.1;padding:2px}',
'.cl-swatches.av>div::after{content:"";position:absolute;inset:0;background:linear-gradient(to top right,transparent 47%,rgba(255,255,255,.85) 48%,rgba(255,255,255,.85) 52%,transparent 53%)}',
'.cl-swatches.sm{grid-template-columns:repeat(auto-fill,minmax(30px,1fr));gap:4px}.cl-swatches.sm>div{border-radius:7px}',
'.cl-pick{display:flex;gap:8px;flex-wrap:wrap;align-items:center}',
'.cl-pick button{width:44px;height:44px;border-radius:50%;padding:0;border:3px solid transparent!important;box-shadow:0 4px 12px rgba(0,0,0,.35)}',
'.cl-pick button.on{border-color:#fff!important;box-shadow:0 0 0 3px var(--a),0 4px 14px rgba(0,0,0,.4)}',
'.cl-pick input[type=color]{width:48px;height:44px;padding:2px;border-radius:12px;margin:0;cursor:pointer}',
'.cl-kv{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px;margin:10px 0}',
'.cl-kv>div{background:rgba(255,255,255,.05);border:1px solid var(--line);border-radius:12px;padding:8px 10px;font-size:.8rem;color:var(--dim)}',
'.cl-kv b{display:block;color:var(--ink);font-size:1.02rem}',
'.cl-q{margin:12px 0}.cl-q>div:first-child{font-weight:700;margin-bottom:6px}',
'.cl-inp{width:100%;padding:11px 14px;font:inherit;border-radius:12px;border:1.5px solid var(--line);background:rgba(8,8,24,.6);color:var(--ink);outline:none;margin:6px 0}',
'.cl-vs{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:10px 0}',
'.cl-vs figure{margin:0;position:relative;border-radius:14px;overflow:hidden;border:2px solid var(--line);background:#111}',
'.cl-vs figure.on{border-color:#fff;box-shadow:0 0 0 3px var(--a)}',
'.cl-vs img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover}',
'.cl-vs figcaption{position:absolute;left:0;right:0;bottom:0;padding:5px 8px;font-size:.78rem;font-weight:700;background:linear-gradient(transparent,rgba(0,0,0,.75))}',
'.cl-vs .ph{aspect-ratio:4/3;display:flex;align-items:center;justify-content:center;color:var(--dim);font-size:.85rem}',
'.cl-vote{display:grid;grid-template-columns:1fr auto 1fr;gap:8px;margin-top:10px}',
'.cl-vote button{padding:13px 10px;color:#fff;background:linear-gradient(135deg,#5b6cff,#3d5afe)}',
'.cl-vote button.b{background:linear-gradient(135deg,#ff8db0,#ff4d84)}',
'.cl-cues{font-size:.82rem;color:var(--dim);line-height:1.4;margin-top:8px}',
'.cl-pv{border:1.5px solid rgba(255,111,165,.5);background:linear-gradient(150deg,rgba(255,111,165,.14),rgba(61,90,254,.1))}',
'.cl-hero{position:relative;overflow:hidden;border-radius:20px;padding:22px;color:#fff;text-align:center}',
'.cl-hero h2{font-size:2rem;margin:.1em 0;text-shadow:0 2px 14px rgba(0,0,0,.4)}',
'.cl-hero p{margin:6px auto;max-width:560px;line-height:1.45;text-shadow:0 1px 6px rgba(0,0,0,.45)}',
'.cl-meter{height:10px;background:rgba(255,255,255,.12);border-radius:999px;overflow:hidden;margin:6px 0}',
'.cl-meter i{display:block;height:100%;background:linear-gradient(90deg,var(--sf),var(--a2))}',
'.cl-axis{display:grid;grid-template-columns:62px 1fr 62px;gap:8px;align-items:center;font-size:.78rem;color:var(--dim);margin:6px 0}',
'.cl-axis .bar{position:relative;height:10px;border-radius:999px;background:linear-gradient(90deg,var(--l),var(--r))}',
'.cl-axis .bar i{position:absolute;top:-4px;width:18px;height:18px;margin-left:-9px;border-radius:50%;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.5)}',
'.cl-why{font-size:.82rem;color:var(--dim);line-height:1.5;padding-left:18px;margin:6px 0}',
'.cl-looks{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px}',
'.cl-look{position:relative;background:rgba(255,255,255,.05);border:1px solid var(--line);border-radius:18px;padding:12px;transition:box-shadow .15s}',
'.cl-look.starred{border-color:var(--sf);box-shadow:0 0 0 1.5px var(--sf),0 0 24px rgba(255,179,71,.25)}',
'.cl-look svg{display:block;width:100%;height:auto;background:radial-gradient(circle at 50% 30%,rgba(255,255,255,.1),rgba(255,255,255,.02));border-radius:12px}',
'.cl-look .st{position:absolute;top:10px;right:10px;width:38px;height:38px;border-radius:50%;padding:0;font-size:1.15rem;background:rgba(0,0,0,.4);color:#fff;border:1px solid var(--line)!important}',
'.cl-look .st.on{background:linear-gradient(135deg,#ffe08a,#ffb347);color:#3a2400}',
'.cl-look ul{list-style:none;padding:0;margin:8px 0 0;font-size:.8rem;color:var(--dim)}',
'.cl-look li{display:flex;align-items:center;gap:7px;margin:3px 0}.cl-look li i{display:inline-block;width:14px;height:14px;border-radius:4px;border:1px solid rgba(255,255,255,.25)}',
'.cl-look li b{color:var(--ink);font-weight:700}',
'.cl-badge{display:inline-block;font-size:.7rem;font-weight:800;border-radius:999px;padding:3px 9px;margin:6px 6px 0 0;background:rgba(61,90,254,.25);border:1px solid rgba(120,140,255,.6);color:#dfe4ff}',
'.cl-badge.sch{background:rgba(255,179,71,.15);border-color:rgba(255,179,71,.5);color:#ffe2b8}',
'.cl-two{display:grid;grid-template-columns:1fr 1fr;gap:12px}',
'.cl-mini{border-radius:16px;padding:12px;background:rgba(255,255,255,.05);border:1px solid var(--line)}',
'.cl-mini h4{margin:0 0 4px}',
'.cl-trad{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}',
'.cl-trad>div{display:flex;gap:8px;align-items:center;font-size:.85rem;background:rgba(255,255,255,.05);border-radius:12px;padding:6px 8px}',
'.cl-trad small{color:var(--sf);letter-spacing:.05em}',
'.cl-wait{text-align:center;padding:26px 10px;color:var(--dim)}',
'.cl-wait div:first-child{font-size:2.6rem;animation:clbeat 1.4s infinite}',
'@keyframes clpop{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}',
'@keyframes clbeat{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}',
'@media(max-width:560px){.cl-two{grid-template-columns:1fr}.cl-rail div{font-size:.6rem}.cl-hero h2{font-size:1.6rem}}'
].join('\n');

/* =================== UI =================== */
var STEPS=[['tips','Setup'],['calib','White balance'],['measure','Skin'],['quiz','Quiz'],['drape','Draping'],['result','Result']];
var STEP_LABEL={lobby:'In the lobby',tips:'Getting set up',calib:'White balance',measure:'Measuring skin',quiz:'Quiz',drape:'Draping',result:'Reviewing result',wait:'Done ✔'};
function rid(){return Math.random().toString(36).slice(2,10)}
function loadSaved(){try{var s=JSON.parse(localStorage.getItem(KEY)||'null');if(!s||typeof s!=='object')return null;return s}catch(e){return null}}

function GAME_START(ctx){
  var me=ctx.me,isHost=!!ctx.isHost,partner=me==='host'?'guest':'host',names=ctx.names||{};
  var nm=function(r){return names[r]||(r==='host'?'Host':'Guest')};
  var root=ctx.root;root.innerHTML='';
  var st=document.createElement('style');st.textContent=CSS;root.appendChild(st);
  var wrap=document.createElement('div');wrap.className='cl';root.appendChild(wrap);
  var video=document.createElement('video');video.muted=true;video.setAttribute('playsinline','');video.autoplay=true;video.style.display='none';root.appendChild(video);
  var stage=document.createElement('canvas');stage.width=640;stage.height=480;
  var dead=false,ended=false,timers=[],raf=0,stream=null;
  var saved=loadSaved();

  /* ---- shared meta (host owns S) ---- */
  var S=isHost?{phase:'lobby',him:'host',turban:DEF_TURBAN,prog:{host:{st:'lobby'},guest:{st:'lobby'}},res:{host:null,guest:null},stars:[],fin:{host:null,guest:null},run:0}:null;
  var V=S,Q=0,lastQ=-1,seq=0,lastSeq=0,hiTimer=null;
  /* ---- local analysis state ---- */
  var L;function freshLocal(){L={run:V?V.run:0,step:'tips',mode:null,gains:[1,1,1],paperRaw:null,wb:null,meas:null,manualSkin:null,found:'',quiz:{},pi:0,show:'a',auto:true,swapT:0,
    votes:{},pvotes:{},snaps:{},nonce:rid(),sent:{},measuring:0,res:null,camBusy:false,camErr:''}}
  freshLocal();
  var pend={},pendOrder=[],partnerNonce=null; /* partner's drape pairs waiting for my vote */

  function el(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e}
  function btn(label,cls,act,fn,v){var b=el('button',cls||'',label);b.type='button';if(act)b.setAttribute('data-act',act);if(v!=null)b.setAttribute('data-v',v);b.onclick=function(){if(!dead)fn()};return b}
  function later(f,ms){var t=setTimeout(function(){timers.splice(timers.indexOf(t),1);if(!dead)f()},ms);timers.push(t)}
  function fake(){return !!window.COLORLAB_FAKE}
  function isHim(r){return V&&V.him===(r||me)}

  /* ---- networking ---- */
  function act(a){if(isHost){if(apply('host',a))bcast()}else ctx.send({k:'a',s:++seq,a:a})}
  function bcast(){Q++;ctx.send({k:'s',q:Q,v:S});onState()}
  function apply(role,a){
    if(!a||typeof a!=='object')return false;
    var k=a.a,ph=S.phase;
    if(k==='start'){if(ph!=='lobby')return false;S.phase='solo';S.run++;S.res={host:null,guest:null};S.fin={host:null,guest:null};S.stars=[];S.prog={host:{st:'tips'},guest:{st:'tips'}};return true}
    if(k==='view'){
      if(ph!=='lobby')return false;var sv=a.saved;if(!sv||typeof sv!=='object')return false;
      var h=cleanRes(sv.host),g=cleanRes(sv.guest);if(!h||!g)return false;
      S.res={host:h,guest:g};if(isHex(sv.turban))S.turban=sv.turban.toLowerCase();if(sv.him==='host'||sv.him==='guest')S.him=sv.him;
      S.stars=sv.couple&&Array.isArray(sv.couple.starred)?sv.couple.starred.filter(function(x){return typeof x==='string'&&x.length<120}).slice(0,40):[];
      S.phase='couple';S.run++;S.fin={host:null,guest:null};S.prog={host:{st:'wait'},guest:{st:'wait'}};return true;
    }
    if(k==='him'){if(ph==='over'||(a.v!=='host'&&a.v!=='guest')||S.him===a.v)return false;S.him=a.v;return true}
    if(k==='turban'){if(ph==='over'||!isHex(a.v)||S.turban===a.v.toLowerCase())return false;S.turban=a.v.toLowerCase();return true}
    if(k==='prog'){if(ph!=='solo'||(a.run|0)!==S.run)return false;var p={st:STEP_LABEL[a.st]?a.st:'tips',i:clamp(a.i|0,0,PAIRS.length),n:PAIRS.length};
      if(JSON.stringify(p)===JSON.stringify(S.prog[role]))return false;S.prog[role]=p;return true}
    if(k==='result'){if(ph!=='solo'||(a.run|0)!==S.run)return false;var r=cleanRes(a.res);if(!r)return false;S.res[role]=r;S.prog[role]={st:'wait'};
      if(S.res.host&&S.res.guest){S.phase='couple';S.fin={host:null,guest:null}}return true}
    if(k==='star'){if(ph!=='couple'||typeof a.id!=='string'||a.id.length>120)return false;var i=S.stars.indexOf(a.id);if(i>=0)S.stars.splice(i,1);else if(S.stars.length<40)S.stars.push(a.id);return true}
    if(k==='fin'){if((ph!=='solo'&&ph!=='couple')||S.fin[role]||(a.v!=='finish'&&a.v!=='later'))return false;S.fin[role]=a.v;if(S.fin.host&&S.fin.guest)S.phase='over';return true}
    return false;
  }
  function onState(){
    if(dead)return;
    if(V.run!==L.run){var keepMode=L.mode;freshLocal();L.mode=keepMode&&keepMode!=='manual'?keepMode:null;pend={};pendOrder=[];partnerNonce=null}
    persist();
    render();
    if(V.phase==='over'&&!ended){
      ended=true;stopCam();
      var h=V.res.host,g=V.res.guest;
      ctx.end(h&&g?'Our colours are ready 🎨':'Saved for later 🎨',h&&g?nm('host')+': '+h.name+' · '+nm('guest')+': '+g.name+'. Your report is saved on this device.':'Come back any time to finish your colour analysis.');
    }
  }
  function reportProg(){if(V&&V.phase==='solo')act({a:'prog',run:V.run,st:L.step,i:L.pi})}

  /* ---- persistence ---- */
  function lite(r){return r?{season:r.season,name:r.name,palette:r.palette,best:r.best,avoid:r.avoid,metal:r.metal,neutrals:r.neutrals,skin:r.skin,conf:r.conf,axes:r.axes,alt:r.alt,why:r.why}:null}
  function persist(){
    if(!V||!(V.res.host||V.res.guest))return;
    var cl=V.res.host&&V.res.guest?couple():null;
    var obj={host:lite(V.res.host),guest:lite(V.res.guest),couple:{looks:cl?[].concat.apply([],cl.fns.map(function(f){return f.looks.map(function(l){return {id:l.id,fn:l.fn,scheme:l.scheme,turban:l.turban,his:l.his,her:l.her,accent:l.acc,metal:l.metal,neela:l.neela}})})):[],starred:V.stars.slice()},
      turban:V.turban,him:V.him,names:{host:nm('host'),guest:nm('guest')},savedAt:Date.now()};
    try{localStorage.setItem(KEY,JSON.stringify(obj));saved=obj}catch(e){}
  }
  var cCache={k:null,v:null};
  function couple(){
    var him=V.res[V.him],her=V.res[V.him==='host'?'guest':'host'];if(!him||!her)return null;
    var k=V.turban+'|'+V.him+'|'+him.season+'|'+her.season+'|'+him.palette.join()+'|'+her.palette.join();
    if(cCache.k!==k){cCache.k=k;cCache.v=coupleLooks(him,her,V.turban)}
    return cCache.v;
  }

  /* ---- camera / source ---- */
  function startCam(){
    if(L.camBusy)return;
    if(fake()){L.mode='fake';setStep('calib');return}
    if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){L.camErr='This browser has no camera access.';toManual();return}
    L.camBusy=true;render();
    navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:640},height:{ideal:480}},audio:false}).then(function(s){
      if(dead){s.getTracks().forEach(function(t){t.stop()});return}
      stream=s;video.srcObject=s;var pl=video.play();if(pl&&pl.catch)pl.catch(function(){});
      L.camBusy=false;L.mode='cam';setStep('calib');
    }).catch(function(e){L.camBusy=false;L.camErr=(e&&e.name==='NotAllowedError')?'Camera permission was denied.':'No camera could be opened.';ctx.toast('Camera unavailable: switching to manual mode');toManual()});
  }
  function stopCam(){if(stream){stream.getTracks().forEach(function(t){t.stop()});stream=null}try{video.srcObject=null}catch(e){}}
  function toManual(){L.mode='manual';L.gains=[1,1,1];L.wb={skipped:true,manual:true};L.meas=null;setStep('measure')}
  function camReady(){return L.mode!=='cam'||video.readyState>=2}
  function drawSource(g,w,h,mirror,paper){
    g.save();if(mirror){g.translate(w,0);g.scale(-1,1)}
    if(L.mode==='cam'&&video.readyState>=2){
      var vw=video.videoWidth||640,vh=video.videoHeight||480,sc=Math.max(w/vw,h/vh),dw=vw*sc,dh=vh*sc;
      g.drawImage(video,(w-dw)/2,(h-dh)/2,dw,dh);
    }else if(L.mode==='cam'){g.fillStyle='#111';g.fillRect(0,0,w,h)}
    else{
      var sk=L.mode==='manual'?(L.manualSkin?hex2rgb(L.manualSkin):[201,154,120]):FAKE[me].skin;
      drawSynth(g,w,h,{skin:sk,cast:L.mode==='fake'?FAKE[me].cast:null,paper:!!paper&&L.mode==='fake',turban:isHim()&&L.mode!=='cam'?V.turban:null});
    }
    g.restore();
  }
  function drapePath(g,w,h){g.beginPath();g.moveTo(0,h*0.69);g.lineTo(w*0.3,h*0.72);g.quadraticCurveTo(w*0.5,h*0.9,w*0.7,h*0.72);g.lineTo(w,h*0.69);g.lineTo(w,h);g.lineTo(0,h);g.closePath()}
  function drawDrape(g,w,h,hex){
    var gr=g.createLinearGradient(0,h*0.68,0,h);gr.addColorStop(0,hex);gr.addColorStop(1,hex);
    g.fillStyle=gr;drapePath(g,w,h);g.fill();
    g.save();drapePath(g,w,h);g.clip();g.globalAlpha=0.12;g.strokeStyle='#fff';g.lineWidth=2;
    for(var x=-w;x<w*2;x+=w/9){g.beginPath();g.moveTo(x,h*0.7);g.quadraticCurveTo(x+w*0.05,h*0.85,x-w*0.03,h);g.stroke()}g.restore();
    var fw=Math.round(w*0.03);g.strokeStyle=hex;g.lineWidth=fw;g.strokeRect(fw/2,fw/2,w-fw,h-fw);
  }
  function grab(w,h,paper){var c=document.createElement('canvas');c.width=w;c.height=h;var g=c.getContext('2d',{willReadFrequently:true});drawSource(g,w,h,false,paper);return g.getImageData(0,0,w,h)}
  function pixIn(img,test){var d=img.data,w=img.width,h=img.height,out=[];for(var y=0;y<h;y+=2)for(var x=0;x<w;x+=2){if(test(x/w,y/h)){var i=(y*w+x)*4;out.push([d[i],d[i+1],d[i+2]])}}return out}
  function inPatch(fx,fy){return PATCHES.some(function(p){var dx=(fx-p[0])/p[2],dy=(fy-p[1])/p[3];return dx*dx+dy*dy<=1})}
  function snapshot(hex){
    var c=document.createElement('canvas');c.width=320;c.height=240;var g=c.getContext('2d');
    drawSource(g,320,240,true,false);drawDrape(g,320,240,hex);
    try{return c.toDataURL('image/jpeg',0.72)}catch(e){return ''}
  }
  function drawStage(){
    if(!stage.isConnected)return;
    var g=stage.getContext('2d'),w=stage.width,h=stage.height;
    drawSource(g,w,h,true,L.step==='calib');
    g.save();
    if(L.step==='calib'){
      var b=CAL_BOX;g.strokeStyle='#ffe08a';g.lineWidth=4;g.setLineDash([12,8]);g.strokeRect(b[0]*w,b[1]*h,(b[2]-b[0])*w,(b[3]-b[1])*h);g.setLineDash([]);
      g.fillStyle='rgba(0,0,0,.55)';g.fillRect(b[0]*w,b[1]*h-30,(b[2]-b[0])*w,26);g.fillStyle='#ffe08a';g.font='700 17px sans-serif';g.textAlign='center';g.fillText('Hold white paper here',w/2,b[1]*h-11);
    }else if(L.step==='measure'&&L.mode!=='manual'){
      g.strokeStyle=L.measuring?'#4ade80':'#fff';g.lineWidth=4;g.setLineDash([14,10]);g.beginPath();g.ellipse(FACE.cx*w,FACE.cy*h,FACE.rx*w,FACE.ry*h,0,0,7);g.stroke();g.setLineDash([]);
      g.strokeStyle='rgba(255,224,138,.9)';g.lineWidth=2;PATCHES.forEach(function(p){g.beginPath();g.ellipse(p[0]*w,p[1]*h,p[2]*w,p[3]*h,0,0,7);g.stroke()});
      if(L.measuring){g.fillStyle='rgba(74,222,128,.9)';g.fillRect(0,h-8,w*Math.min(1,L.measuring/20),8)}
    }else if(L.step==='drape'){
      var pr=PAIRS[L.pi];if(pr)drawDrape(g,w,h,L.show==='a'?pr.a.h:pr.b.h);
    }
    g.restore();
  }
  function tick(t){
    raf=requestAnimationFrame(tick);
    if(dead||!stage.isConnected)return;
    if(L.step==='drape'&&L.auto&&!fake()&&t-L.swapT>1700){
      L.swapT=t;L.show=L.show==='a'?'b':'a';
      wrap.querySelectorAll('[data-act="show"]').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-v')===L.show)});
      wrap.querySelectorAll('.cl-vs figure').forEach(function(f){f.classList.toggle('on',f.getAttribute('data-v')===L.show)});
      var lb=wrap.querySelector('.cl-stage .lab');if(lb)lb.textContent=lbl();
    }
    drawStage();
  }
  function lbl(){var pr=PAIRS[L.pi];return pr?(L.show==='a'?'A · '+pr.a.n:'B · '+pr.b.n):''}
  if(typeof requestAnimationFrame==='function')raf=requestAnimationFrame(tick);

  /* ---- steps ---- */
  function setStep(s){L.step=s;if(s==='drape')L.swapT=0;reportProg();render();if(s==='drape')sendPair(L.pi)}
  function captureWB(){
    if(!camReady())return ctx.toast('Camera is still starting…');
    var img=grab(160,120,true),b=CAL_BOX;
    var px=pixIn(img,function(x,y){return x>b[0]+0.02&&x<b[2]-0.02&&y>b[1]+0.02&&y<b[3]-0.02});
    var raw=medianRgb(px),ok=paperOk(raw),g=wbGains(raw);
    var after=applyGains(raw,g);
    var c=document.createElement('canvas');c.width=160;c.height=120;var cg=c.getContext('2d');var im2=cg.createImageData(160,120);
    for(var i=0;i<img.data.length;i+=4){var o=applyGains([img.data[i],img.data[i+1],img.data[i+2]],g);im2.data[i]=o[0];im2.data[i+1]=o[1];im2.data[i+2]=o[2];im2.data[i+3]=255}
    var c0=document.createElement('canvas');c0.width=160;c0.height=120;c0.getContext('2d').putImageData(img,0,0);cg.putImageData(im2,0,0);
    L.paperRaw=raw;L.gains=g;L.wb={ok:ok,raw:rgb2hex(raw),after:rgb2hex(after),before:c0.toDataURL('image/jpeg',0.7),corr:c.toDataURL('image/jpeg',0.7)};
    if(!ok)ctx.toast('That doesn’t look like plain white paper. Try again, or continue anyway.');
    render();
  }
  function skipWB(){L.gains=[1,1,1];L.wb={skipped:true};setStep('measure')}
  function finishMeasure(px){
    var r=robustSkin(px),cor=applyGains(r.rgb,L.gains),lab=rgb2lab(cor),lc=lch(lab),it=ita(lab);
    var q=L.mode==='cam'?(L.wb&&L.wb.ok?1:0.55):L.mode==='fake'?1:0.5;
    L.meas={raw:r.rgb,rgb:cor,lab:lab,ita:it,hue:lc.h,q:q,kept:r.kept,n:r.n};L.measuring=0;render();
  }
  function measure(){
    if(L.measuring)return;
    if(!camReady())return ctx.toast('Camera is still starting…');
    if(fake()){finishMeasure(pixIn(grab(320,240),inPatch));return}
    var all=[];L.measuring=1;render();
    (function frame(){
      if(dead||L.step!=='measure'){L.measuring=0;return}
      all=all.concat(pixIn(grab(320,240),inPatch));L.measuring++;
      if(L.measuring>20)finishMeasure(all);else later(frame,100);
    })();
  }
  function pickSkin(hx){L.manualSkin=hx;var lab=hexLab(hx),lc=lch(lab);L.meas={raw:hex2rgb(hx),rgb:hex2rgb(hx),lab:lab,ita:ita(lab),hue:lc.h,q:0.5,manual:true};render()}
  function profile(){return {meas:L.meas,quiz:L.quiz,found:parseFoundation(L.found),votes:L.votes,pvotes:L.pvotes}}
  function sendPair(i){
    var pr=PAIRS[i];if(!pr)return;var key=L.nonce+pr.id;if(L.sent[key])return;
    if(!camReady()){later(function(){if(L.step==='drape'&&L.pi===i)sendPair(i)},300);return}
    L.sent[key]=1;var a=snapshot(pr.a.h),b=snapshot(pr.b.h);L.snaps[pr.id]={a:a,b:b};
    var fs=wrap.querySelectorAll('.cl-vs figure[data-v]');if(fs.length===2&&L.step==='drape'&&PAIRS[L.pi]===pr)render();
    ctx.send({k:'pair',n:L.nonce,pid:pr.id,i:i,tot:PAIRS.length,title:pr.title,la:pr.a.n,lb:pr.b.n,a:a,b:b});
  }
  function retake(){var pr=PAIRS[L.pi];if(!pr)return;delete L.sent[L.nonce+pr.id];sendPair(L.pi);render()}
  function vote(v){
    var pr=PAIRS[L.pi];if(!pr||L.step!=='drape')return;
    L.votes[pr.id]=v;
    if(L.pi+1<PAIRS.length){L.pi++;L.show='a';setStep('drape')}else setStep('result');
  }
  function redrape(){L.votes={};L.pvotes={};L.snaps={};L.nonce=rid();L.sent={};L.pi=0;L.show='a';setStep('drape')}
  function saveResult(){if(V.phase!=='solo')return;var r=buildResult(profile());L.res=r;act({a:'result',run:V.run,res:r});L.step='wait';render()}
  function useSaved(){var r=cleanRes(saved&&saved[me]);if(!r||V.phase!=='solo')return;L.res=r;act({a:'result',run:V.run,res:r});L.step='wait';render()}
  function pvote(key,v){var p=pend[key];if(!p||p.voted)return;p.voted=v;ctx.send({k:'pv',n:p.n,pid:p.pid,v:v});render()}

  /* ---- rendering helpers ---- */
  function swatches(list,cls,named){var d=el('div','cl-swatches'+(cls?' '+cls:''));list.forEach(function(h){var s=el('div');s.style.background=h;s.title=cname(h)+' '+h;if(named)s.appendChild(el('small',null,cname(h)));d.appendChild(s)});return d}
  function sw(h){var s=el('span','cl-sw');s.style.background=h;s.title=h;return s}
  function turbanPicker(parent){
    var row=el('div','cl-pick');
    NEELA.forEach(function(n){var b=btn('','',"turban",function(){act({a:'turban',v:n[1]})},n[1]);b.style.background=n[1];b.title=n[0];if(V.turban===n[1])b.classList.add('on');row.appendChild(b)});
    var ci=document.createElement('input');ci.type='color';ci.value=V.turban;ci.setAttribute('data-name','turbanc');ci.title='Custom shade';
    ci.addEventListener('change',function(){if(isHex(ci.value))act({a:'turban',v:ci.value})});row.appendChild(ci);
    row.appendChild(el('span','cl-sub',cname(V.turban)+' '+V.turban));
    parent.appendChild(row);
  }
  function rail(){var r=el('div','cl-rail'),idx=STEPS.findIndex(function(s){return s[0]===L.step});if(L.step==='wait')idx=6;
    STEPS.forEach(function(s,i){r.appendChild(el('div',i<idx?'done':i===idx?'cur':'',s[1]))});return r}
  function progText(r){var p=V.prog[r]||{};if(V.res[r])return 'Done ✔ ('+V.res[r].name+')';var s=STEP_LABEL[p.st]||'…';if(p.st==='drape')s+=' '+(Math.min(p.i+1,PAIRS.length))+'/'+PAIRS.length;return s}
  function stageBox(label){var s=el('div','cl-stage');s.appendChild(stage);if(label)s.appendChild(el('div','lab',label));return s}

  function renderPartnerVote(){
    var keys=pendOrder.filter(function(k){return pend[k]&&!pend[k].voted&&pend[k].n===partnerNonce});
    if(!keys.length||V.phase==='over')return;
    var p=pend[keys[0]],b=el('div','cl-box cl-pv');
    b.appendChild(el('h2',null,'💞 '+nm(partner)+'’s drape '+(p.i+1)+'/'+p.tot+': '+p.title));
    b.appendChild(el('p','cl-sub','Which one makes '+nm(partner)+'’s face look brighter and healthier? Your vote counts half as much as theirs.'+(keys.length>1?' ('+keys.length+' waiting)':'')));
    var vs=el('div','cl-vs');
    [['a',p.a,p.la],['b',p.b,p.lb]].forEach(function(x){var f=el('figure');if(x[1]){var im=el('img');im.src=x[1];im.alt=x[2];f.appendChild(im)}else f.appendChild(el('div','ph','No image'));f.appendChild(el('figcaption',null,x[0].toUpperCase()+' · '+x[2]));vs.appendChild(f)});
    b.appendChild(vs);
    var vt=el('div','cl-vote');
    vt.appendChild(btn('A looks better','','pvote',function(){pvote(keys[0],'a')},'a'));
    vt.appendChild(btn('Can’t tell','cl-ghost','pvote',function(){pvote(keys[0],'=')},'='));
    vt.appendChild(btn('B looks better','b','pvote',function(){pvote(keys[0],'b')},'b'));
    b.appendChild(vt);wrap.appendChild(b);
  }
  function renderLobby(){
    var b=el('div','cl-box');
    b.appendChild(el('h2',null,'Find the colours that make you both glow'));
    b.appendChild(el('p','cl-sub','A real personal colour analysis, done together. Each of you uses your own phone or laptop camera: we balance the light with a sheet of white paper, measure your skin tone, ask a few quick questions, then run virtual draping (the classic method) while your partner votes along. At the end you get your season, palettes and coordinated wedding looks that work with the neela dastar.'));
    b.appendChild(el('div','cl-note','Honest note: camera colour depends heavily on lighting. Treat this as a well-informed guide, not a professional in-person consultation.'));
    b.appendChild(el('h3',null,'Who wears the neela dastar?'));
    var ch=el('div','cl-chips');['host','guest'].forEach(function(r){var c=btn((r===me?'Me ('+nm(r)+')':nm(r)),'cl-chip'+(V.him===r?' on':''),'him',function(){act({a:'him',v:r})},r);ch.appendChild(c)});b.appendChild(ch);
    b.appendChild(el('h3',null,'Dastar shade (neela)'));turbanPicker(b);
    b.appendChild(el('p','cl-sub','Every recommendation is checked against this exact blue: his outfit must let the dastar stand out, and her colours should harmonise with it.'));
    if(saved&&cleanRes(saved.host)&&cleanRes(saved.guest)){
      var sv=el('div','cl-mini');sv.style.marginTop='14px';
      sv.appendChild(el('h4',null,'💾 Saved results found on this device'));
      sv.appendChild(el('p','cl-sub',(saved.names?saved.names.host:'Host')+': '+cleanRes(saved.host).name+' · '+(saved.names?saved.names.guest:'Guest')+': '+cleanRes(saved.guest).name));
      var r=el('div','cl-row');r.appendChild(btn('View saved results','cl-btn','view',function(){act({a:'view',saved:saved})}));sv.appendChild(r);b.appendChild(sv);
    }
    b.appendChild(btn(saved&&saved.host&&saved.guest?'Redo our analysis':'Start our colour analysis','cl-big','start',function(){act({a:'start'})}));
    wrap.appendChild(b);
  }
  function renderTips(b){
    b.appendChild(el('h2',null,'1 · Set up for true colour'));
    var t=el('div','cl-tips');
    [['🪟','Daylight, facing a window. No direct sun, overhead yellow bulbs or coloured walls behind you.'],['🚫','No makeup, filters or beauty mode. Turn off any camera "enhance" setting.'],
     ['💇','Hair pulled back from the face, glasses off if you can.'],['👕','Plain white, grey or black top so it doesn’t reflect colour onto your face.'],
     ['📄','Have a sheet of plain white printer paper ready.'],isHim()?['👳','Wear your neela dastar during draping so every drape is judged next to it.']:['💍','Take off coloured jewellery for now; we test metals later.']]
      .forEach(function(x){var d=el('div','cl-tip');d.appendChild(el('i',null,x[0]));d.appendChild(el('span',null,x[1]));t.appendChild(d)});
    b.appendChild(t);
    if(L.camErr)b.appendChild(el('div','cl-note',L.camErr+' You can still do everything in manual mode.'));
    b.appendChild(el('p','cl-sub','Your camera stays on your device: only small still snapshots of the drape pairs are sent to '+nm(partner)+' so they can vote.'));
    var go=btn(L.camBusy?'Starting camera…':'I’m ready: turn on my camera','cl-big','cam',startCam);go.disabled=L.camBusy;b.appendChild(go);
    var r=el('div','cl-row');r.style.marginTop='10px';
    r.appendChild(btn('No camera: use manual mode','cl-ghost','manual',toManual));
    if(cleanRes(saved&&saved[me]))r.appendChild(btn('Use my saved result ('+cleanRes(saved[me]).name+')','cl-ghost','usesaved',useSaved));
    b.appendChild(r);
  }
  function renderCalib(b){
    b.appendChild(el('h2',null,'2 · White balance'));
    b.appendChild(el('p','cl-sub','Hold a plain white sheet of paper inside the yellow box, flat and facing the window, then capture. We work out how much your light tints things (warm bulbs, blue shade) and cancel it before measuring.'));
    b.appendChild(stageBox(L.mode==='fake'?'Test camera':'Live'));
    var r=el('div','cl-row');r.style.marginTop='10px';
    r.appendChild(btn(L.wb&&L.wb.raw?'Retake white paper':'Capture white paper','cl-btn','wb',captureWB));
    r.appendChild(btn('Skip (no paper)','cl-ghost','wbskip',skipWB));
    b.appendChild(r);
    if(L.wb&&L.wb.raw){
      var vs=el('div','cl-vs');
      [['Before',L.wb.before,L.wb.raw],['After correction',L.wb.corr,L.wb.after]].forEach(function(x){var f=el('figure');var im=el('img');im.src=x[1];f.appendChild(im);f.appendChild(el('figcaption',null,x[0]+' · paper '+x[2]));vs.appendChild(f)});
      b.appendChild(vs);
      var kv=el('div','cl-kv');
      [['Paper read as',L.wb.raw],['Corrected to',L.wb.after],['Gains R/G/B',L.gains.map(function(g){return g.toFixed(2)}).join(' / ')],['Check',L.wb.ok?'Looks like white paper ✔':'Not neutral enough']].forEach(function(x){var d=el('div',null,x[0]);d.appendChild(el('b',null,x[1]));kv.appendChild(d)});
      b.appendChild(kv);
    }
    var nx=btn('Next: measure my skin','cl-big','next',function(){setStep('measure')});nx.disabled=!(L.wb&&L.wb.raw);b.appendChild(nx);
  }
  function renderMeasure(b){
    b.appendChild(el('h2',null,'3 · Skin measurement'));
    if(L.mode==='manual'){
      b.appendChild(el('p','cl-sub','Manual mode: pick the swatch closest to your bare skin on the inside of your arm or jaw, in daylight.'));
      var pk=el('div','cl-pick');SKIN_SCALE.forEach(function(h){var x=btn('','','skin',function(){pickSkin(h)},h);x.style.background=h;if(L.manualSkin===h)x.classList.add('on');pk.appendChild(x)});b.appendChild(pk);
    }else{
      b.appendChild(el('p','cl-sub','Fit your face inside the oval, look straight at the camera and keep still. We sample your cheeks and forehead for about 2 seconds, reject shine and shadow, take the median and correct it with your white balance.'));
      b.appendChild(stageBox(L.measuring?'Measuring… hold still':'Face in the oval'));
      var m=btn(L.measuring?'Measuring…':L.meas?'Measure again':'Measure my skin (2 s)','cl-btn','measure',measure);m.disabled=!!L.measuring;m.style.marginTop='10px';b.appendChild(m);
    }
    var ms=L.meas;
    if(ms){
      var kv=el('div','cl-kv');
      var sd=el('div',null,'Skin (corrected)');var sb=el('b');sb.appendChild(sw(rgb2hex(ms.rgb)));sb.appendChild(document.createTextNode(' '+rgb2hex(ms.rgb)));sd.appendChild(sb);kv.appendChild(sd);
      [['L* a* b*',ms.lab.map(function(v){return v.toFixed(1)}).join(' / ')],['ITA° (depth)',ms.ita.toFixed(1)+'° · '+itaCat(ms.ita)],['Hue angle',ms.hue.toFixed(1)+'°'],['Undertone cue',hueCue(ms.hue)]]
        .forEach(function(x){var d=el('div',null,x[0]);d.appendChild(el('b',null,x[1]));kv.appendChild(d)});
      b.appendChild(kv);
      b.appendChild(el('p','cl-sub','Undertone from a camera is only a cue: the quiz and draping refine it.'));
    }
    b.appendChild(el('h3',null,'Know your foundation shade? (optional)'));
    var inp=el('input','cl-inp');inp.placeholder="e.g. Fenty 330W, Sephora Color IQ 3Y07";inp.maxLength=40;inp.value=L.found;inp.setAttribute('data-name','found');
    var pf=el('div','cl-sub');
    function upd(){var p=parseFoundation(L.found);pf.textContent=!p?'We only read the undertone letter (W, C, N, O, Y, R, P) if your shade ends with one. We don’t look up brand databases.':p.letter?'Read undertone: '+p.letter+' ('+p.label+'). This refines warmth.':'No undertone letter found, which is fine. We’ll rely on the other tests.'}
    inp.addEventListener('input',function(){L.found=inp.value;upd()});upd();
    b.appendChild(inp);b.appendChild(pf);
    var nx=btn('Next: quick questions','cl-big','next',function(){setStep('quiz')});nx.disabled=!ms;b.appendChild(nx);
  }
  function renderQuiz(b){
    b.appendChild(el('h2',null,'4 · Quick questions'));
    b.appendChild(el('p','cl-sub','Answer what you know, skip what you don’t. Check veins and jewellery in daylight.'));
    QUIZ.forEach(function(q){
      var d=el('div','cl-q');d.appendChild(el('div',null,q.q));
      var ch=el('div','cl-chips');
      q.o.forEach(function(o){var c=btn(o[1],'cl-chip'+(L.quiz[q.id]===o[0]?' on':''),'quiz',function(){if(L.quiz[q.id]===o[0])delete L.quiz[q.id];else L.quiz[q.id]=o[0];render()},o[0]);c.setAttribute('data-q',q.id);ch.appendChild(c)});
      d.appendChild(ch);b.appendChild(d);
    });
    b.appendChild(btn('Next: virtual draping','cl-big','next',function(){L.pi=0;L.show='a';setStep('drape')}));
  }
  function renderDrape(b){
    var pr=PAIRS[L.pi];
    b.appendChild(el('h2',null,'5 · Draping '+(L.pi+1)+'/'+PAIRS.length+': '+pr.title));
    b.appendChild(el('p','cl-sub','Look at your FACE, not the fabric. The better colour makes skin look even and clear, softens shadows under the eyes, makes your eyes pop and never makes you look yellow, grey or tired.'));
    b.appendChild(stageBox(lbl()));
    var tg=el('div','cl-chips');tg.style.marginTop='10px';
    ['a','b'].forEach(function(v){tg.appendChild(btn('Show '+v.toUpperCase()+': '+pr[v].n,'cl-chip'+(L.show===v?' on':''),'show',function(){L.show=v;L.auto=false;render()},v))});
    if(!fake())tg.appendChild(btn(L.auto?'⏸ Auto-switch on':'▶ Auto-switch','cl-chip'+(L.auto?' on':''),'auto',function(){L.auto=!L.auto;render()}));
    b.appendChild(tg);
    var sn=L.snaps[pr.id],vs=el('div','cl-vs');
    ['a','b'].forEach(function(v){var f=el('figure',L.show===v?'on':'');f.setAttribute('data-v',v);if(sn&&sn[v]){var im=el('img');im.src=sn[v];f.appendChild(im)}else f.appendChild(el('div','ph','snapshot…'));f.appendChild(el('figcaption',null,v.toUpperCase()+' · '+pr[v].n));vs.appendChild(f)});
    b.appendChild(vs);
    var pvc=Object.keys(L.pvotes).length;
    b.appendChild(el('p','cl-sub','Snapshots sent to '+nm(partner)+' to vote. Partner votes so far: '+pvc+'.'+(L.pvotes[pr.id]?' '+nm(partner)+' picked '+(L.pvotes[pr.id]==='='?'"can’t tell"':L.pvotes[pr.id].toUpperCase())+' here.':'')));
    var vt=el('div','cl-vote');
    vt.appendChild(btn('A is better','','vote',function(){vote('a')},'a'));
    vt.appendChild(btn('Can’t tell','cl-ghost','vote',function(){vote('=')},'='));
    vt.appendChild(btn('B is better','b','vote',function(){vote('b')},'b'));
    b.appendChild(vt);
    var r=el('div','cl-row');r.style.marginTop='10px';
    var bk=btn('← Previous pair','cl-ghost','back',function(){L.pi=Math.max(0,L.pi-1);L.show='a';setStep('drape')});bk.disabled=!L.pi;r.appendChild(bk);
    r.appendChild(btn('Retake snapshots','cl-ghost','retake',retake));
    b.appendChild(r);
  }
  function seasonGrad(res){var p=res.palette;return 'linear-gradient(135deg,'+p[0]+','+p[6]+' 35%,'+p[12]+' 65%,'+p[18]+')'}
  function resultCard(parent,res,mine){
    var s=SBY[res.season];
    var h=el('div','cl-hero');h.style.background=seasonGrad(res);
    h.appendChild(el('div',null,mine?'Your season':'Season'));h.appendChild(el('h2',null,res.name));h.appendChild(el('p',null,s.desc));parent.appendChild(h);
    var cf=el('div');cf.style.marginTop='12px';
    cf.appendChild(el('div','cl-sub','Confidence: '+res.conf+'% ('+(res.conf>=70?'high':res.conf>=45?'medium':'low')+')'+(res.alt.length?' · also close: '+res.alt.map(function(a){return SBY[a].name}).join(', '):'')));
    var mt=el('div','cl-meter'),mi=el('i');mi.style.width=res.conf+'%';mt.appendChild(mi);cf.appendChild(mt);parent.appendChild(cf);
    [['W','Cool','Warm','#9fb4ff','#ffb35c'],['D','Light','Deep','#f3e6da','#3a1f1a'],['C','Soft','Clear','#a8a19a','#ff2d87']].forEach(function(x){
      var a=el('div','cl-axis');a.appendChild(el('span',null,x[1]));var br=el('div','bar');br.style.setProperty('--l',x[3]);br.style.setProperty('--r',x[4]);
      var dot=el('i');dot.style.left=((clamp(res.axes[x[0]],-1,1)+1)*50)+'%';br.appendChild(dot);a.appendChild(br);var rs=el('span',null,x[2]);rs.style.textAlign='right';a.appendChild(rs);parent.appendChild(a);
    });
    if(res.why&&res.why.length){var ul=el('ul','cl-why');res.why.forEach(function(w){ul.appendChild(el('li',null,w))});parent.appendChild(ul)}
    parent.appendChild(el('h3',null,'Best colours (24)'));parent.appendChild(swatches(res.palette,'',true));
    parent.appendChild(el('h3',null,'Signature shades'));parent.appendChild(swatches(res.best,'sm'));
    parent.appendChild(el('h3',null,'Best neutrals'));parent.appendChild(swatches(res.neutrals,'',true));
    parent.appendChild(el('h3',null,'Colours to avoid near your face'));parent.appendChild(swatches(res.avoid,'av',true));
    var mt2=el('div','cl-row');mt2.style.marginTop='12px';mt2.appendChild(sw(METAL_HEX[res.metal]));mt2.appendChild(el('span',null,'Best metal: '+res.metal+(res.metal==='rose gold'?' (you can wear both gold and silver; rose gold bridges them)':'')));parent.appendChild(mt2);
  }
  function renderResult(b){
    var res=buildResult(profile());L.res=res;
    b.appendChild(el('h2',null,'6 · Your result'));
    resultCard(b,res,true);
    var pvc=Object.keys(L.pvotes).length;
    b.appendChild(el('div','cl-note','Partner votes included: '+pvc+'/'+PAIRS.length+(pvc<PAIRS.length?' (this updates live as '+nm(partner)+' votes)':'')+'. Lighting affects results: this is a guide, not a professional consultation.'));
    b.appendChild(btn('Save my result & share with '+nm(partner),'cl-big','save',saveResult));
    var r=el('div','cl-row');r.style.marginTop='10px';r.appendChild(btn('Redo draping','cl-ghost','redrape',redrape));r.appendChild(btn('Change quiz answers','cl-ghost','requiz',function(){setStep('quiz')}));b.appendChild(r);
  }
  function renderWait(b){
    var w=el('div','cl-wait');w.appendChild(el('div',null,'🎨'));
    w.appendChild(el('h2',null,'Saved! Waiting for '+nm(partner)));
    w.appendChild(el('p',null,nm(partner)+': '+progText(partner)));
    b.appendChild(w);
    var r=V.res[me]||L.res;if(r){var m=el('div','cl-mini');m.appendChild(el('h4',null,'You: '+r.name));m.appendChild(swatches(r.palette,'sm'));b.appendChild(m)}
  }
  function renderSolo(){
    var b=el('div','cl-box');b.appendChild(rail());
    ({tips:renderTips,calib:renderCalib,measure:renderMeasure,quiz:renderQuiz,drape:renderDrape,result:renderResult,wait:renderWait}[L.step]||renderTips)(b);
    wrap.appendChild(b);
    var f=el('div','cl-row');f.style.justifyContent='center';
    var lt=btn(V.fin[me]?'Waiting for '+nm(partner)+'…':'Done for now','cl-ghost','later',function(){act({a:'fin',v:'later'})});lt.disabled=!!V.fin[me];f.appendChild(lt);wrap.appendChild(f);
  }
  function figure(l,skinHim,skinHer){
    var M=METAL_HEX[l.metal]||METAL_HEX.gold,ns='http://www.w3.org/2000/svg';
    var s='<svg xmlns="'+ns+'" viewBox="0 0 200 150" role="img" aria-label="Outfit mock">'+
     '<g transform="translate(18,6)">'+
      '<path d="M14 140 L20 66 Q40 54 60 66 L66 140 Z" fill="'+l.his+'" stroke="rgba(0,0,0,.25)"/>'+
      '<path d="M40 64 L40 140" stroke="rgba(0,0,0,.18)" stroke-width="1.5"/>'+
      '<path d="M28 64 Q34 100 30 138" stroke="'+l.acc+'" stroke-width="6" fill="none" stroke-linecap="round"/>'+
      '<rect x="34" y="46" width="12" height="14" fill="'+skinHim+'"/>'+
      '<ellipse cx="40" cy="36" rx="13" ry="15" fill="'+skinHim+'"/>'+
      '<path d="M40 52 Q30 50 28 40 Q40 56 52 40 Q50 50 40 52 Z" fill="#2a1d18"/>'+
      '<path d="M24 34 Q22 8 40 6 Q58 8 56 34 Q52 22 40 23 Q28 22 24 34 Z" fill="'+l.turban+'" stroke="rgba(255,255,255,.25)"/>'+
      '<path d="M27 25 Q40 12 54 20 M26 30 Q40 18 55 27" stroke="rgba(255,255,255,.22)" fill="none"/>'+
      '<circle cx="15" cy="122" r="4" fill="none" stroke="#b9bcc4" stroke-width="2.4"/>'+
     '</g>'+
     '<g transform="translate(108,6)">'+
      '<ellipse cx="40" cy="38" rx="16" ry="19" fill="#2a1d18"/>'+
      '<path d="M22 74 L6 142 Q40 150 74 142 L58 74 Z" fill="'+l.her+'" stroke="rgba(0,0,0,.25)"/>'+
      '<path d="M10 128 Q40 138 70 128" stroke="'+M+'" stroke-width="2.5" fill="none"/>'+
      '<path d="M25 56 Q40 50 55 56 L58 76 L22 76 Z" fill="'+l.her+'" stroke="rgba(0,0,0,.3)"/>'+
      '<rect x="35" y="46" width="10" height="12" fill="'+skinHer+'"/>'+
      '<ellipse cx="40" cy="36" rx="12" ry="14" fill="'+skinHer+'"/>'+
      '<path d="M32 54 Q40 62 48 54" stroke="'+M+'" stroke-width="2.4" fill="none"/>'+
      '<circle cx="40" cy="25" r="2.4" fill="'+M+'"/>'+
      '<path d="M22 40 Q22 10 40 10 Q58 10 58 40 L66 120 Q62 126 58 118 L52 52 Q40 44 28 52 L24 104 Q20 110 16 104 Z" fill="'+l.acc+'" opacity=".88"/>'+
     '</g></svg>';
    var d=el('div');d.innerHTML=s;return d.firstChild;
  }
  function lookCard(l){
    var on=V.stars.indexOf(l.id)>=0,c=el('div','cl-look'+(on?' starred':''));
    var him=V.res[V.him],her=V.res[V.him==='host'?'guest':'host'];
    c.appendChild(figure(l,him.skin,her.skin));
    var s=btn(on?'★':'☆','st'+(on?' on':''),'star',function(){act({a:'star',id:l.id})});s.setAttribute('data-id',l.id);s.title=on?'Unstar':'Star this look';c.appendChild(s);
    var bd=el('div');if(l.neela)bd.appendChild(el('span','cl-badge','💙 Neela-friendly'));bd.appendChild(el('span','cl-badge sch',SCHEME[l.scheme][0]));c.appendChild(bd);
    var ul=el('ul');
    [[l.turban,nm(V.him)+'’s dastar',l.names.turban],[l.his,nm(V.him)+'’s outfit',l.names.his],[l.her,nm(V.him==='host'?'guest':'host')+'’s outfit',l.names.her],[l.acc,'Accent / dupatta',l.names.acc],[METAL_HEX[l.metal],'Jewellery',l.metal+' (his kara stays steel)']]
      .forEach(function(x){var li=el('li');var i=el('i');i.style.background=x[0];li.appendChild(i);li.appendChild(document.createTextNode(x[1]+': '));li.appendChild(el('b',null,x[2]));ul.appendChild(li)});
    c.appendChild(ul);
    c.appendChild(el('div','cl-sub',SCHEME[l.scheme][1])).style.fontSize='.78rem';
    return c;
  }
  function reportData(){
    var cl=couple(),hn=V.him,sn=hn==='host'?'guest':'host';
    return {cl:cl,him:{name:nm(hn),r:V.res[hn]},her:{name:nm(sn),r:V.res[sn]}};
  }
  function reportTxt(){
    var d=reportData(),o=['COUPLE COLOR LAB - our colour report',d.him.name+' & '+d.her.name,new Date().toDateString(),'','Lighting affects results: this is a guide, not a professional consultation.',''];
    [d.him,d.her].forEach(function(p){var r=p.r;o.push('== '+p.name+': '+r.name+' (confidence '+r.conf+'%) ==',SBY[r.season].desc,'Best colours: '+r.palette.map(function(h){return cname(h)+' '+h}).join(', '),'Best neutrals: '+r.neutrals.join(', '),'Avoid: '+r.avoid.join(', '),'Metal: '+r.metal,'')});
    o.push('Dastar (neela): '+cname(V.turban)+' '+V.turban,'Our overlap colours: '+d.cl.overlap.map(function(h){return cname(h)+' '+h}).join(', '),'');
    d.cl.fns.forEach(function(f){o.push('== '+f.name+' ==');f.looks.forEach(function(l,i){o.push((i+1)+'. '+(V.stars.indexOf(l.id)>=0?'[STARRED] ':'')+SCHEME[l.scheme][0]+(l.neela?' (Neela-friendly)':'')+': '+d.him.name+' '+l.names.his+' '+l.his+' with '+l.names.turban+' dastar; '+d.her.name+' '+l.names.her+' '+l.her+'; accent '+l.names.acc+' '+l.acc+'; jewellery '+l.metal)});o.push('')});
    o.push('Anand Karaj favourites for '+d.her.name+': '+d.cl.trad.map(function(t){return t.name+' '+'*'.repeat(t.stars)}).join(', '));
    return o.join('\n')+'\n';
  }
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function reportHtml(){
    var d=reportData(),sws=function(a){return '<div class="s">'+a.map(function(h){return '<span style="background:'+h+'" title="'+esc(cname(h))+'"><i>'+esc(cname(h))+'</i></span>'}).join('')+'</div>'};
    var h='<!doctype html><html><head><meta charset="utf-8"><title>Our colour report</title><style>body{font-family:system-ui,Segoe UI,sans-serif;max-width:860px;margin:24px auto;padding:0 16px;color:#222}h1{color:#1c2f8f}.s{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 14px}.s span{width:64px;height:64px;border-radius:10px;position:relative;box-shadow:0 1px 4px rgba(0,0,0,.25)}.s i{position:absolute;bottom:2px;left:2px;right:2px;font-size:9px;font-style:normal;color:#fff;text-shadow:0 1px 2px #000}.card{border:1px solid #ddd;border-radius:14px;padding:14px;margin:12px 0}.look{display:inline-block;width:250px;vertical-align:top;margin:6px;border:1px solid #eee;border-radius:12px;padding:10px}.note{background:#fff6e5;border-radius:10px;padding:8px 12px}</style></head><body>';
    h+='<h1>Couple Color Lab</h1><p>'+esc(d.him.name)+' &amp; '+esc(d.her.name)+' · '+new Date().toDateString()+'</p><p class="note">Lighting affects results: this is a guide, not a professional consultation.</p>';
    [d.him,d.her].forEach(function(p){var r=p.r;h+='<div class="card"><h2>'+esc(p.name)+': '+esc(r.name)+'</h2><p>'+esc(SBY[r.season].desc)+'</p><p>Confidence '+r.conf+'% · Metal: '+esc(r.metal)+'</p><b>Best colours</b>'+sws(r.palette)+'<b>Best neutrals</b>'+sws(r.neutrals)+'<b>Avoid</b>'+sws(r.avoid)+'</div>'});
    h+='<div class="card"><h2>Our colours</h2><p>Dastar: '+esc(cname(V.turban))+' '+V.turban+'</p>'+sws(d.cl.overlap)+'</div>';
    d.cl.fns.forEach(function(f){h+='<div class="card"><h2>'+f.icon+' '+esc(f.name)+'</h2><p>'+esc(f.note)+'</p>';f.looks.forEach(function(l){h+='<div class="look">'+(V.stars.indexOf(l.id)>=0?'⭐ ':'')+'<b>'+esc(SCHEME[l.scheme][0])+'</b>'+(l.neela?' · Neela-friendly':'')+sws([l.turban,l.his,l.her,l.acc])+'<small>Dastar '+esc(l.names.turban)+' · '+esc(d.him.name)+': '+esc(l.names.his)+' · '+esc(d.her.name)+': '+esc(l.names.her)+' · accent '+esc(l.names.acc)+' · '+esc(l.metal)+'</small></div>'});h+='</div>'});
    h+='<div class="card"><h2>Anand Karaj favourites for '+esc(d.her.name)+'</h2>'+d.cl.trad.map(function(t){return '<span style="display:inline-block;margin:4px 10px"><span style="display:inline-block;width:18px;height:18px;border-radius:4px;vertical-align:middle;background:'+t.hex+'"></span> '+esc(t.name)+' '+'★'.repeat(t.stars)+'☆'.repeat(5-t.stars)+'</span>'}).join('')+'</div>';
    return h+'</body></html>';
  }
  function download(name,mime,text){try{var bl=new Blob([text],{type:mime}),a=document.createElement('a');a.href=URL.createObjectURL(bl);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},800)}catch(e){ctx.toast('Download failed')}}
  function renderCouple(){
    var cl=couple(),hn=V.him,sn=hn==='host'?'guest':'host';
    var b=el('div','cl-box');
    var h=el('div','cl-hero');h.style.background='linear-gradient(135deg,'+V.turban+','+(cl.overlap[0]||'#7a5cff')+' 55%,'+(cl.overlap[1]||'#ff6fa5')+')';
    h.appendChild(el('h2',null,'Our Colours 🎨'));h.appendChild(el('p',null,nm('host')+' & '+nm('guest')+': two seasons, one celebration, built around '+nm(hn)+'’s neela dastar.'));b.appendChild(h);
    var two=el('div','cl-two');two.style.marginTop='12px';
    [hn,sn].forEach(function(r){var res=V.res[r],m=el('div','cl-mini');m.appendChild(el('h4',null,(r===me?'You':nm(r))+': '+res.name));
      m.appendChild(el('div','cl-sub',res.conf+'% confidence · '+res.metal));m.appendChild(swatches(res.palette,'sm'));
      var det=document.createElement('details');var su=document.createElement('summary');su.textContent='Full result';su.style.cursor='pointer';det.appendChild(su);resultCard(det,res,r===me);m.appendChild(det);two.appendChild(m)});
    b.appendChild(two);
    b.appendChild(el('h3',null,'Dastar shade'));turbanPicker(b);
    b.appendChild(el('h3',null,'Colours that flatter you both'));
    b.appendChild(cl.overlap.length?swatches(cl.overlap,'',true):el('p','cl-sub','Your palettes barely overlap, which is great for contrast: coordinate rather than match.'));
    wrap.appendChild(b);
    cl.fns.forEach(function(f){
      var fb=el('div','cl-box');fb.appendChild(el('h2',null,f.icon+' '+f.name));fb.appendChild(el('p','cl-sub',f.note));
      var g=el('div','cl-looks');f.looks.forEach(function(l){g.appendChild(lookCard(l))});fb.appendChild(g);
      if(f.id==='ak'){
        fb.appendChild(el('h3',null,'Anand Karaj favourites, scored for '+nm(sn)));
        var t=el('div','cl-trad');cl.trad.forEach(function(x){var d=el('div');d.appendChild(sw(x.hex));var sp=el('span');sp.appendChild(document.createTextNode(x.name+' '));sp.appendChild(el('small',null,'★'.repeat(x.stars)+'☆'.repeat(5-x.stars)));d.appendChild(sp);t.appendChild(d)});fb.appendChild(t);
      }
      wrap.appendChild(fb);
    });
    var e=el('div','cl-box');
    e.appendChild(el('div','cl-note','Starred looks: '+V.stars.length+'. Results are saved on both devices. Lighting affects results: this is a guide, not a professional consultation; try fabric swatches in daylight before you buy.'));
    var r=el('div','cl-row');
    r.appendChild(btn('⬇ Download our colour report','cl-btn','dlhtml',function(){download('our-colour-report.html','text/html',reportHtml())}));
    r.appendChild(btn('Text version','cl-ghost','dltxt',function(){download('our-colour-report.txt','text/plain',reportTxt())}));
    e.appendChild(r);
    var fin=btn(V.fin[me]?'Waiting for '+nm(partner)+' to finish…':'Finish','cl-big','fin',function(){act({a:'fin',v:'finish'})});fin.disabled=!!V.fin[me]||V.phase==='over';e.appendChild(fin);
    if(V.fin[partner]&&!V.fin[me])e.appendChild(el('p','cl-sub',nm(partner)+' has finished.'));
    wrap.appendChild(e);
  }
  function render(){
    if(dead)return;
    var ae=document.activeElement,keep=null,s0=0,s1=0;
    if(ae&&ae.getAttribute&&wrap.contains(ae)&&ae.getAttribute('data-name')){keep=ae.getAttribute('data-name');try{s0=ae.selectionStart;s1=ae.selectionEnd}catch(e){}}
    wrap.innerHTML='';
    if(!V){wrap.appendChild(el('div','cl-wait','Connecting…'));wrap.setAttribute('data-phase','connecting');return}
    var ph=V.phase;
    wrap.setAttribute('data-phase',ph);wrap.setAttribute('data-step',ph==='solo'?L.step:'');
    var hd=el('div','cl-hdr');hd.appendChild(el('div','cl-title','🎨 Couple Color Lab'));
    var pills=el('div','cl-pills');
    if(ph==='solo'){var p1=el('span','cl-pill');p1.appendChild(document.createTextNode(nm(partner)+': '));p1.appendChild(el('b',null,progText(partner)));pills.appendChild(p1)}
    var tp=el('span','cl-pill');var tsw=sw(V.turban);tsw.style.width='14px';tsw.style.height='14px';tsw.style.borderRadius='4px';tsw.style.marginRight='6px';tp.appendChild(tsw);tp.appendChild(document.createTextNode('Dastar'));pills.appendChild(tp);
    hd.appendChild(pills);wrap.appendChild(hd);
    if(ph==='solo'||ph==='couple')renderPartnerVote();
    if(ph==='lobby')renderLobby();
    else if(ph==='solo')renderSolo();
    else if(ph==='couple'||(ph==='over'&&V.res.host&&V.res.guest))renderCouple();
    else{var w=el('div','cl-box cl-wait');w.appendChild(el('div',null,'💙'));w.appendChild(el('h2',null,'Saved for later'));w.appendChild(el('p',null,'Your progress and any finished results are saved on this device.'));wrap.appendChild(w)}
    if(keep){var inp=wrap.querySelector('[data-name="'+keep+'"]');if(inp){try{inp.focus({preventScroll:true});if(inp.setSelectionRange)inp.setSelectionRange(s0,s1)}catch(e){}}}
  }

  /* ---- incoming ---- */
  function onMsg(d){
    if(dead||!d||typeof d!=='object')return;
    if(d.k==='pair'){
      if(typeof d.n!=='string'||typeof d.pid!=='string')return;
      var pr=PAIRS.filter(function(p){return p.id===d.pid})[0];if(!pr)return;
      var img=function(x){return typeof x==='string'&&/^data:image\/(jpeg|png);base64,/.test(x)&&x.length<200000?x:''};
      if(d.n!==partnerNonce){partnerNonce=d.n;Object.keys(pend).forEach(function(k){if(pend[k].n!==d.n)delete pend[k]});pendOrder=pendOrder.filter(function(k){return pend[k]})}
      var key=d.n+':'+d.pid,old=pend[key];
      pend[key]={n:d.n,pid:d.pid,i:PAIRS.indexOf(pr),tot:PAIRS.length,title:pr.title,la:pr.a.n,lb:pr.b.n,a:img(d.a),b:img(d.b),voted:old?old.voted:null};
      if(pendOrder.indexOf(key)<0)pendOrder.push(key);
      if(pendOrder.length>PAIRS.length*2){var rm=pendOrder.shift();delete pend[rm]}
      render();return;
    }
    if(d.k==='pv'){
      if(d.n!==L.nonce||['a','b','='].indexOf(d.v)<0||!PAIRS.some(function(p){return p.id===d.pid}))return;
      if(L.pvotes[d.pid]===d.v)return;
      L.pvotes[d.pid]=d.v;if(L.step==='drape'||L.step==='result')render();return;
    }
    if(isHost){
      if(d.k==='a'){if(typeof d.s!=='number'||d.s<=lastSeq)return;lastSeq=d.s;if(apply('guest',d.a))bcast()}
      else if(d.k==='hi'){bcast()}
    }else if(d.k==='s'){
      if(typeof d.q!=='number'||d.q<=lastQ||!d.v)return;
      lastQ=d.q;V=d.v;
      if(hiTimer){clearInterval(hiTimer);hiTimer=null}
      onState();
    }
  }

  render();
  if(isHost)bcast();
  else{ctx.send({k:'hi'});hiTimer=setInterval(function(){if(dead||V){clearInterval(hiTimer);hiTimer=null;return}ctx.send({k:'hi'})},2000)}
  return {
    onMsg:onMsg,
    destroy:function(){dead=true;stopCam();if(raf&&typeof cancelAnimationFrame==='function')cancelAnimationFrame(raf);timers.forEach(clearTimeout);timers=[];if(hiTimer){clearInterval(hiTimer);hiTimer=null}}
  };
}

registerGame({
  id:'colorlab',icon:'🎨',name:'Couple Color Lab',
  blurb:'Personal colour analysis for your wedding: white-balance, skin measurement and virtual draping on each phone, then coordinated looks that work with his neela dastar.',
  start:GAME_START,
  _t:{hex2rgb:hex2rgb,rgb2hex:rgb2hex,rgb2lab:rgb2lab,lab2rgb:lab2rgb,lchHex:lchHex,dE:dE,lch:lch,ita:ita,itaCat:itaCat,wbGains:wbGains,applyGains:applyGains,paperOk:paperOk,
    robustSkin:robustSkin,parseFoundation:parseFoundation,computeAxes:computeAxes,classify:classify,buildResult:buildResult,cleanRes:cleanRes,SEASONS:SEASONS,PAIRS:PAIRS,QUIZ:QUIZ,
    seasonPalette:seasonPalette,seasonAvoid:seasonAvoid,seasonNeutrals:seasonNeutrals,overlapPalette:overlapPalette,coupleLooks:coupleLooks,contrastOK:contrastOK,schemeOf:schemeOf,cname:cname,FAKE:FAKE,DEF_TURBAN:DEF_TURBAN}
});
})();
