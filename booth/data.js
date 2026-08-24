/* data.js v3 bersih */
function rupiah(n){
return 'Rp '+Number(n).toLocaleString('id-ID');
}
function lighten(hex,amt){
amt=amt||0.45;
var h=hex.replace('#','');
var r=parseInt(h.slice(0,2),16);
var g=parseInt(h.slice(2,4),16);
var b=parseInt(h.slice(4,6),16);
function f(c){
c=Math.round(c+(255-c)*amt);
return c.toString(16).padStart(2,'0');
}
return '#'+f(r)+f(g)+f(b);
}
function mulberry32(a){
return function(){
a|=0;a=a+0x6D2B79F5|0;
var t=Math.imul(a^a>>>15,1|a);
t=t+Math.imul(t^t>>>7,61|t)^t;
return((t^t>>>14)>>>0)/4294967296;
};
}
function rr(c,x,y,w,h,r){
c.beginPath();c.moveTo(x+r,y);
c.arcTo(x+w,y,x+w,y+h,r);
c.arcTo(x+w,y+h,x,y+h,r);
c.arcTo(x,y+h,x,y,r);
c.arcTo(x,y,x+w,y,r);
c.closePath();c.fill();
}
function star(c,x,y,r,fill,stroke){
c.save();c.translate(x,y);c.beginPath();
for(var i=0;i<16;i++){
var rad=i%2?r*0.45:r;
var a=Math.PI*i/8;
c.lineTo(Math.cos(a)*rad,Math.sin(a)*rad);
}
c.closePath();c.fillStyle=fill;c.fill();
c.lineWidth=2.5;c.strokeStyle=stroke;
c.stroke();c.restore();
}
function flower(c,x,y,r,col){
c.save();c.translate(x,y);
for(var k=0;k<5;k++){
var a=Math.PI*2*k/5;
c.fillStyle=col;c.beginPath();
c.arc(Math.cos(a)*r*0.75,
Math.sin(a)*r*0.75,r*0.55,0,7);
c.fill();
}
c.fillStyle='#FFC53D';c.beginPath();
c.arc(0,0,r*0.4,0,7);c.fill();c.restore();
}
var THEMES={
klasik:{label:'Klasik',bg:'#FAF5EC',
surface:'#FFFCF4',ink:'#1C1917',
accent:'#FF4B2B',accent2:'#FFC53D',
pattern:'dots',
shadow:'8px 8px 0 rgba(28,25,23,1)'},
neon:{label:'Neon',bg:'#0B0A1A',
surface:'#181533',ink:'#F4F2FF',
accent:'#00E5A0',accent2:'#FF3DAE',
pattern:'grid',
shadow:'0 0 26px rgba(0,229,160,.4)'},
pastel:{label:'Pastel',bg:'#FDF3F8',
surface:'#FFFFFF',ink:'#4B3A4E',
accent:'#F472B6',accent2:'#C4B5FD',
pattern:'petals',
shadow:'8px 8px 0 rgba(196,181,253,.95)'},
bold:{label:'Bold',bg:'#FFF600',
surface:'#FFFFFF',ink:'#121212',
accent:'#121212',accent2:'#FF2E63',
pattern:'stripes',
shadow:'8px 8px 0 rgba(18,18,18,1)'},
ocean:{label:'Ocean',bg:'#EFFBFC',
surface:'#FFFFFF',ink:'#0E3A40',
accent:'#06B6D4',accent2:'#FBBF24',
pattern:'waves',
shadow:'8px 8px 0 rgba(6,182,212,.85)'},
sakura:{label:'Sakura',bg:'#FFF5F6',
surface:'#FFFFFF',ink:'#5C2A3A',
accent:'#FB7185',accent2:'#FDA4AF',
pattern:'petals',
shadow:'8px 8px 0 rgba(251,113,133,.85)'}
};
var settings={
themeKey:'klasik',accent:null,
brand:'Boothin',logo:null,price:15000,
poses:3,filter:'none',frame:'klasik',
customFrames:[],
payment:{mode:'static',staticQris:null,
verification:'timer',timerSeconds:15,
midtrans:{merchantId:'',clientId:'',
serverKey:'',environment:'sandbox'}}
};
function currentTheme(){
var base={};
var t=THEMES[settings.themeKey];
for(var k in t){base[k]=t[k];}
if(settings.accent){
base.accent=settings.accent;
base.accent2=lighten(settings.accent);
}
return base;
}
function saveSettings(){
try{localStorage.setItem('boothin-kiosk',
JSON.stringify(settings));}catch(e){}
}
function loadSettings(){
try{
var s=JSON.parse(
localStorage.getItem('boothin-kiosk'));
if(s){
var pay=s.payment;
if(s.payment){delete s.payment;}
Object.assign(settings,s);
if(pay){Object.assign(settings.payment,pay);}
if(!settings.customFrames){
settings.customFrames=[];}
}
}catch(e){}
}
var FILTERS={none:'Normal',mono:'Monokrom',
warm:'Hangat',cool:'Adem',retro:'Retro',
vivid:'Vivid',film:'Film',pop:'Pop'};
var FILTER_CSS={none:'none',
mono:'grayscale(1) contrast(1.08)',
warm:'sepia(.35) saturate(1.35) brightness(1.05)',
cool:'saturate(1.15) hue-rotate(10deg) brightness(1.05)',
retro:'sepia(.5) contrast(1.12) brightness(.96) saturate(1.25)',
vivid:'saturate(1.7) contrast(1.12)',
film:'sepia(.2) contrast(1.05) saturate(.9)',
pop:'saturate(1.9) contrast(1.25) brightness(1.05)'};
var FRAMES={
klasik:{label:'Klasik',icon:'⬜',
textColors:function(){
return{main:'#1C1917',sub:'#666'};},
font:'800 26px "Bricolage Grotesque",sans-serif',
bg:function(c,W,H){
c.fillStyle='#FFFFFF';c.fillRect(0,0,W,H);},
fg:function(c,W,H,L,R){
c.strokeStyle='rgba(0,0,0,.15)';c.lineWidth=1;
R.forEach(function(r){
c.strokeRect(r.x+.5,r.y+.5,r.w,r.h);});}
},
retro:{label:'Retro Film',icon:'🎞️',
textColors:function(){
return{main:'#F5E9D0',sub:'#D99A2B'};},
font:'700 20px "Space Mono",monospace',
bg:function(c,W,H){
c.fillStyle='#161311';c.fillRect(0,0,W,H);},
fg:function(c,W,H,L,R){
c.fillStyle='#F5E9D0';
for(var y=16;y<H-24;y+=36){
rr(c,4,y,9,18,3);rr(c,W-13,y,9,18,3);}
c.strokeStyle='rgba(245,233,208,.4)';
c.lineWidth=1;
R.forEach(function(r){
c.strokeRect(r.x+.5,r.y+.5,r.w,r.h);});}
},
pop:{label:'Pop Art',icon:'💥',
textColors:function(){
return{main:'#FFFFFF',
sub:'rgba(255,255,255,.8)'};},
font:'800 26px "Bricolage Grotesque",sans-serif',
bg:function(c,W,H,L,R){
var t=currentTheme();
c.fillStyle=t.accent;c.fillRect(0,0,W,H);
c.fillStyle='rgba(255,255,255,.22)';
for(var x=9;x<W;x+=22){
for(var y=9;y<H;y+=22){
c.beginPath();c.arc(x,y,2.4,0,7);c.fill();}}
if(R){R.forEach(function(r){
c.fillStyle='#FFFFFF';
c.fillRect(r.x-6,r.y-6,r.w+12,r.h+12);
c.strokeStyle=t.ink;c.lineWidth=3;
c.strokeRect(r.x-6,r.y-6,r.w+12,r.h+12);});}
},
fg:function(c,W,H,L){
var t=currentTheme();
star(c,W-40,L.pad+6,26,t.accent2,t.ink);}
},
bunga:{label:'Bunga',icon:'🌸',
textColors:function(){
var t=currentTheme();
return{main:t.ink,sub:t.ink+'AA'};},
font:'800 26px "Bricolage Grotesque",sans-serif',
bg:function(c,W,H,L){
var t=currentTheme();
c.fillStyle=lighten(t.accent2,0.72);
c.fillRect(0,0,W,H);
flower(c,26,26,15,t.accent);
flower(c,W-26,26,13,t.accent2);
flower(c,24,H-L.foot+8,12,t.accent2);
flower(c,W-24,H-L.foot+8,14,t.accent);
c.fillStyle=t.accent+'55';
for(var i=0;i<12;i++){
c.beginPath();
c.ellipse(30+((i*97)%(W-60)),
46+((i*173)%(H-150)),3,1.8,i,0,7);
c.fill();}
},
fg:function(){}
},
neonf:{label:'Neon',icon:'✨',
textColors:function(){
var t=currentTheme();
return{main:t.accent,sub:t.accent2};},
font:'700 20px "Space Mono",monospace',
bg:function(c,W,H){
c.fillStyle='#0B0A1A';c.fillRect(0,0,W,H);},
fg:function(c,W,H,L,R){
var t=currentTheme();
c.save();c.shadowColor=t.accent;
c.shadowBlur=14;c.strokeStyle=t.accent;
c.lineWidth=3;
R.forEach(function(r){
c.strokeRect(r.x-4,r.y-4,r.w+8,r.h+8);});
c.strokeRect(8,8,W-16,H-16);c.restore();}
},
pesta:{label:'Pesta',icon:'🎉',
textColors:function(){
return{main:'#1C1917',sub:'#888'};},
font:'800 26px "Bricolage Grotesque",sans-serif',
bg:function(c,W,H){
c.fillStyle='#FFFFFF';c.fillRect(0,0,W,H);
var rnd=mulberry32(42);
var cols=['#FF4B2B','#FFC53D','#06B6D4',
'#22C55E','#F472B6'];
for(var i=0;i<95;i++){
var x=rnd()*W,y=rnd()*H;
c.fillStyle=cols[i%5];
c.save();c.translate(x,y);
c.rotate(rnd()*3.14);
if(i%2){c.fillRect(-4,-2,8,4);}
else{c.beginPath();c.arc(0,0,3,0,7);c.fill();}
c.restore();}
},
fg:function(){}
}
};
function stripLayout(n){
var W=400,pad=16,gap=10;
var fw=W-pad*2;
var fh=Math.round(fw*0.75);
var foot=84;
var H=pad+n*fh+(n-1)*gap+foot+pad;
return{W:W,H:H,pad:pad,gap:gap,
fw:fw,fh:fh,foot:foot};
}
function drawStrip(ctx,W,H,L,frames,key){
var rects=frames.map(function(f,i){
return{x:L.pad,y:L.pad+i*(L.fh+L.gap),
w:L.fw,h:L.fh};});
var ty=L.pad+frames.length*L.fh+
(frames.length-1)*L.gap;
var ds=new Date().toLocaleDateString('id-ID',
{day:'numeric',month:'short',year:'numeric'});
if(key&&key.indexOf('custom:')===0){
var id=key.slice(7);
var meta=null;
(settings.customFrames||[]).forEach(function(f){
if(f.id===id){meta=f;}});
var img=frameCache[id];
if(img&&meta&&meta.type==='bg'){
ctx.drawImage(img,0,0,W,H);
}else{
ctx.fillStyle='#FFFFFF';ctx.fillRect(0,0,W,H);}
frames.forEach(function(f,i){
ctx.drawImage(f,rects[i].x,rects[i].y,
L.fw,L.fh);});
if(img&&meta&&meta.type==='overlay'){
ctx.drawImage(img,0,0,W,H);}
ctx.fillStyle='#1C1917';ctx.textAlign='center';
ctx.font='800 26px "Bricolage Grotesque",sans-serif';
ctx.fillText(settings.brand.toUpperCase(),
W/2,ty+40);
ctx.font='700 12px "Space Mono",monospace';
ctx.fillStyle='#666';
ctx.fillText(ds+' • EP-80ECO 80MM',W/2,ty+64);
return;
}
var F=FRAMES[key]||FRAMES.klasik;
F.bg(ctx,W,H,L,rects);
frames.forEach(function(f,i){
ctx.drawImage(f,rects[i].x,rects[i].y,
L.fw,L.fh);});
F.fg(ctx,W,H,L,rects);
var col=F.textColors();
ctx.fillStyle=col.main;ctx.textAlign='center';
ctx.font=F.font;
ctx.fillText(settings.brand.toUpperCase(),
W/2,ty+40);
ctx.font='700 12px "Space Mono",monospace';
ctx.fillStyle=col.sub;
ctx.fillText(ds+' • EP-80ECO 80MM',W/2,ty+64);
}
function renderStrip(frames,key,scale){
scale=scale||1;
var L=stripLayout(frames.length);
var cv=document.createElement('canvas');
cv.width=L.W*scale;cv.height=L.H*scale;
var ctx=cv.getContext('2d');
ctx.scale(scale,scale);
drawStrip(ctx,L.W,L.H,L,frames,key);
return cv;
}
function composeStrip(frames){
return renderStrip(frames,settings.frame,1);
}
function placeholderFrames(){
var emojis=['😜','✌️','🥳','😎'];
var t=currentTheme();
var out=[];
for(var i=0;i<settings.poses;i++){
var c=document.createElement('canvas');
c.width=480;c.height=360;
var ctx=c.getContext('2d');
var g=ctx.createLinearGradient(0,0,480,360);
g.addColorStop(0,t.accent);
g.addColorStop(1,t.accent2);
ctx.fillStyle=g;ctx.fillRect(0,0,480,360);
ctx.textAlign='center';
ctx.textBaseline='middle';
ctx.font='120px serif';
ctx.fillText(emojis[i%4],240,190);
out.push(c);
}
return out;
}
function idbOpen(){
return new Promise(function(res,rej){
var q=indexedDB.open('boothin-db',1);
q.onupgradeneeded=function(e){
var db=e.target.result;
if(!db.objectStoreNames.contains('frames')){
db.createObjectStore('frames',{keyPath:'id'});}
};
q.onsuccess=function(e){res(e.target.result);};
q.onerror=function(e){rej(e.target.error);};
});
}
async function idbPut(rec){
var db=await idbOpen();
return new Promise(function(res,rej){
var tx=db.transaction('frames','readwrite');
tx.objectStore('frames').put(rec);
tx.oncomplete=res;
tx.onerror=function(e){rej(e.target.error);};
});
}
async function idbDelete(id){
var db=await idbOpen();
return new Promise(function(res,rej){
var tx=db.transaction('frames','readwrite');
tx.objectStore('frames').delete(id);
tx.oncomplete=res;
tx.onerror=function(e){rej(e.target.error);};
});
}
async function idbAll(){
try{
var db=await idbOpen();
return await new Promise(function(res,rej){
var q=db.transaction('frames','readonly')
.objectStore('frames').getAll();
q.onsuccess=function(){res(q.result||[]);};
q.onerror=function(e){rej(e.target.error);};
});
}catch(e){return[];}
}
var frameCache={};
function frameImgLoad(id,dataUrl){
return new Promise(function(res){
var img=new Image();
img.onload=function(){frameCache[id]=img;res(img);};
img.onerror=function(){res(null);};
img.src=dataUrl;
});
}
async function loadCustomFrames(){
var recs=await idbAll();
for(var i=0;i<recs.length;i++){
await frameImgLoad(recs[i].id,recs[i].dataUrl);
}
}
async function addCustomFrame(file,type){
var raw=await new Promise(function(res,rej){
var rd=new FileReader();
rd.onload=function(){res(rd.result);};
rd.onerror=rej;
rd.readAsDataURL(file);
});
var img=await new Promise(function(res){
var i2=new Image();
i2.onload=function(){res(i2);};
i2.onerror=function(){res(null);};
i2.src=raw;
});
var png=raw;
if(img){
var TW=800;
var sc=Math.min(1,TW/img.width);
var cw=Math.max(1,Math.round(img.width*sc));
var ch=Math.max(1,Math.round(img.height*sc));
var cv=document.createElement('canvas');
cv.width=cw;cv.height=ch;
cv.getContext('2d').drawImage(img,0,0,cw,ch);
png=cv.toDataURL('image/png');
}
var id='cf-'+Date.now().toString(36);
var rec={id:id,
name:(file.name||'frame').replace(/\.[^.]+$/,''),
type:type,dataUrl:png,createdAt:Date.now()};
await idbPut(rec);
if(!settings.customFrames){
settings.customFrames=[];}
settings.customFrames.push(
{id:id,name:rec.name,type:type});
await frameImgLoad(id,png);
return rec;
}
async function deleteCustomFrame(id){
try{await idbDelete(id);}catch(e){}
delete frameCache[id];
settings.customFrames=
(settings.customFrames||[]).filter(
function(f){return f.id!==id;});
if(settings.frame==='custom:'+id){
settings.frame='klasik';}
}
