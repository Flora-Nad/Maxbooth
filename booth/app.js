/* app.js FINAL (1/2) */
function $(s){return document.querySelector(s);}
function $$(s){return document.querySelectorAll(s);}
function sleep(ms){
return new Promise(function(r){setTimeout(r,ms);});
}
var toastTimer=null;
function showToast(m){
var t=$('#toast');
if(!t){return;}
t.textContent=m;t.classList.add('toast-on');
clearTimeout(toastTimer);
toastTimer=setTimeout(function(){
t.classList.remove('toast-on');},2600);
}
var sessionTimers=[];
function later(fn,ms){
var id=setTimeout(fn,ms);
sessionTimers.push(id);return id;
}
function clearSessionTimers(){
sessionTimers.forEach(clearTimeout);
sessionTimers=[];
}
function applyTheme(t){
var r=document.documentElement.style;
r.setProperty('--bg',t.bg);
r.setProperty('--surface',t.surface);
r.setProperty('--ink',t.ink);
r.setProperty('--accent',t.accent);
r.setProperty('--accent2',t.accent2);
r.setProperty('--shadow',t.shadow);
r.setProperty('--soft',t.ink+'22');
document.body.dataset.pattern=t.pattern;
var fg=$('#frameGrid');
if(fg&&fg.children.length){buildFrameGrid();}
}
function refreshBrandUI(){
$('#atBrand').innerHTML=settings.brand+
'<span style="color:var(--accent)">.</span>';
var box=$('#atLogoBox');
box.innerHTML=settings.logo?
'<img src="'+settings.logo+
'" class="w-full h-full object-cover">':'📸';
$('#atPrice').textContent=rupiah(settings.price);
$('#atPoses').textContent=settings.poses+' pose';
$('#atPayMode').textContent='DI TEMPAT';
}
var state={screen:'attract',stream:null,
camOK:false,busy:false,frames:[],mirror:true};
function go(name){
clearSessionTimers();
$$('.screen').forEach(function(s){
s.classList.remove('active');});
$('#screen-'+name).classList.add('active');
state.screen=name;
var capUI=(name==='capture');
var ot=$('#opToggle'),sb=$('#statusBadge');
if(ot){ot.classList.toggle('hidden',capUI);}
if(sb){sb.classList.toggle('hidden',capUI);}
if(name==='setup'){
state.mirror=settings.mirror!==false;
startCamera();applyPreviewFilter();
applyMirror();buildFrameGrid();
}else if(name!=='capture'){stopCamera();}
}
function applyMirror(){
var on=state.mirror;
$('#setupVideo').classList.toggle('mirror',on);
$('#captureVideo').classList.toggle('mirror',on);
$('#mirrorOn').classList.toggle('on',on);
$('#mirrorOff').classList.toggle('on',!on);
}
async function startCamera(){
try{
if(!navigator.mediaDevices||
!navigator.mediaDevices.getUserMedia){throw 0;}
state.stream=await navigator.mediaDevices
.getUserMedia({video:{facingMode:'user',
width:{ideal:1280}},audio:false});
state.camOK=true;
['setupVideo','captureVideo'].forEach(function(id){
var v=$('#'+id);
v.srcObject=state.stream;
v.play().catch(function(){});});
$('#setupVideo').classList.remove('hidden');
$('#setupSim').classList.add('hidden');
$('#setupNoCam').classList.add('hidden');
$('#captureSim').classList.add('hidden');
$('#camBadge').textContent='📷 LIVE';
$('#camBadge').style.background='var(--accent2)';
}catch(e){
state.camOK=false;
$('#setupVideo').classList.add('hidden');
$('#setupNoCam').classList.remove('hidden');
$('#captureSim').classList.remove('hidden');
$('#setupSim').src=makeSimFrame(0).toDataURL();
$('#setupSim').classList.remove('hidden');
$('#camBadge').textContent='🎭 SIMULASI';
$('#camBadge').style.background='var(--surface)';
}
}
function stopCamera(){
if(state.stream){
state.stream.getTracks().forEach(function(t){
t.stop();});
state.stream=null;}
}
function snapFrame(){
var v=$('#captureVideo'),FW=480,FH=360;
var c=document.createElement('canvas');
c.width=FW;c.height=FH;
var ctx=c.getContext('2d');
var vw=v.videoWidth||1280;
var vh=v.videoHeight||720;
var tr=FW/FH;
var sw,sh,sx,sy;
if(vw/vh>tr){sh=vh;sw=vh*tr;
sx=(vw-sw)/2;sy=0;}
else{sw=vw;sh=vw/tr;sx=0;sy=(vh-sh)/2;}
ctx.filter=FILTER_CSS[settings.filter];
if(state.mirror){
ctx.translate(FW,0);ctx.scale(-1,1);}
ctx.drawImage(v,sx,sy,sw,sh,0,0,FW,FH);
return c;
}
function makeSimFrame(i){
var t=currentTheme(),FW=480,FH=360;
var c=document.createElement('canvas');
c.width=FW;c.height=FH;
var ctx=c.getContext('2d');
var g=ctx.createLinearGradient(0,0,FW,FH);
g.addColorStop(0,t.accent);
g.addColorStop(1,t.accent2);
ctx.fillStyle=g;ctx.fillRect(0,0,FW,FH);
for(var d=0;d<42;d++){
ctx.fillStyle=['rgba(255,255,255,.85)',
'rgba(0,0,0,.25)',
'rgba(255,255,255,.5)'][d%3];
ctx.beginPath();
ctx.arc(Math.random()*FW,Math.random()*FH,
2+Math.random()*4,0,Math.PI*2);
ctx.fill();}
var faces=[['😜','😎',''],['','😆',''],
['🥳','',''],['😎','','']][i%4];
var spots=[[120,160],[240,130],[360,170]];
ctx.textAlign='center';ctx.textBaseline='middle';
faces.forEach(function(f,k){
ctx.save();
ctx.translate(spots[k][0],spots[k][1]);
ctx.rotate((k-1)*0.12);
ctx.font='92px serif';
ctx.fillText(f,0,0);ctx.restore();});
ctx.fillStyle='rgba(0,0,0,.6)';
ctx.fillRect(14,FH-38,128,26);
ctx.fillStyle='#fff';
ctx.font='700 13px "Space Mono",monospace';
ctx.textAlign='left';
ctx.fillText('SIMULASI '+(i+1)+'/'+
settings.poses,22,FH-24);
return c;
}
function buildFrameGrid(){
var g=$('#frameGrid');g.innerHTML='';
function mk(key,label,icon){
var b=document.createElement('button');
b.className='frame-card btn border-[3px] '+
'border-[var(--ink)] rounded-xl p-1.5 '+
'bg-[var(--surface)]'+
(key===settings.frame?' on':'');
var prev=renderStrip(placeholderFrames(),key,0.24);
prev.className='w-full rounded-md pointer-events-none';
b.appendChild(prev);
var lab=document.createElement('p');
lab.className='text-[11px] font-bold mt-1 '+
'truncate pointer-events-none';
lab.textContent=icon+' '+label;
b.appendChild(lab);
b.addEventListener('click',function(){
settings.frame=key;
$$('.frame-card').forEach(function(x){
x.classList.remove('on');});
b.classList.add('on');
showToast('🖼 Frame '+label+' dipilih!');});
g.appendChild(b);
}
Object.keys(FRAMES).forEach(function(k){
mk(k,FRAMES[k].label,FRAMES[k].icon);});
(settings.customFrames||[]).forEach(function(cf){
mk('custom:'+cf.id,cf.name,'✨');});
}
function buildFilterGrid(){
var g=$('#filterGrid');g.innerHTML='';
Object.entries(FILTERS).forEach(function(en){
var k=en[0],label=en[1];
var b=document.createElement('button');
b.className='chip-f btn border-[3px] '+
'border-[var(--ink)] rounded-xl py-3 '+
'font-bold text-sm bg-[var(--surface)]'+
(k===settings.filter?' on':'');
b.textContent=label;
b.addEventListener('click',function(){
settings.filter=k;
$$('.chip-f').forEach(function(x){
x.classList.remove('on');});
b.classList.add('on');applyPreviewFilter();});
g.appendChild(b);
});
}
function applyPreviewFilter(){
var css=FILTER_CSS[settings.filter];
$('#setupVideo').style.filter=css;
$('#captureVideo').style.filter=css;
$('#setupSim').style.filter=css;
}
function renderShots(){
var d=$('#shotsStrip');d.innerHTML='';
for(var i=0;i<settings.poses;i++){
var s=document.createElement('div');
s.className='w-14 h-14 sm:w-16 sm:h-16 '+
'rounded-xl border-2 border-white/60 '+
'bg-white/15 overflow-hidden';
d.appendChild(s);}
}
function markShot(i,frame){
var d=$('#shotsStrip');
var slot=d.children[i];
if(!slot){return;}
slot.innerHTML='';
var img=document.createElement('img');
img.className='w-full h-full object-cover';
img.src=frame.toDataURL('image/jpeg',0.6);
slot.appendChild(img);
slot.style.borderColor='#fff';
}
function showCount(n){
var w=$('#cdWrap'),num=$('#cdNum');
w.classList.remove('hidden');
num.textContent=n;
num.classList.remove('count-pop');
void num.offsetWidth;
num.classList.add('count-pop');
}
function doFlash(){
var f=$('#flash');
f.classList.remove('flash-on');
void f.offsetWidth;
f.classList.add('flash-on');
}
async function runCapture(){
if(state.busy){return;}
state.busy=true;state.frames=[];
renderShots();
var hints=['Bersiap… 👀','Gaya terbaikmu! ✌️',
'Satu lagi! 🎉','Terakhir! 😄'];
for(var i=0;i<settings.poses;i++){
$('#poseTag').textContent=
'Pose '+(i+1)+'/'+settings.poses;
$('#captureHint').textContent=
hints[i%hints.length];
for(var n=3;n>=1;n--){
showCount(n);await sleep(780);}
doFlash();await sleep(170);
state.frames.push(state.camOK?
snapFrame():makeSimFrame(i));
markShot(i,state.frames[state.frames.length-1]);
await sleep(430);
}
$('#cdWrap').classList.add('hidden');
$('#previewStrip').src=
composeStrip(state.frames).toDataURL('image/png');
var fname='Klasik';
if(settings.frame.indexOf('custom:')===0){
var cid2=settings.frame.slice(7);
(settings.customFrames||[]).forEach(function(f){
if(f.id===cid2){fname=f.name;}});
}else if(FRAMES[settings.frame]){
fname=FRAMES[settings.frame].label;}
$('#frameCaption').textContent='Frame '+fname+
' • Filter '+FILTERS[settings.filter];
state.busy=false;
go('preview');
}
/* app.js FINAL (2/2) */
$('#btnStart').addEventListener('click',
function(){go('setup');});
$('#btnRetake').addEventListener('click',
async function(){
showToast('🔄 Retake — silakan foto ulang!');
go('capture');
if(!state.stream){
await startCamera();applyMirror();}
runCapture();
});
$('#btnPrint').addEventListener('click',
function(){
go('print');
var img=$('#printStripImg');
img.src=$('#previewStrip').src;
img.classList.remove('print-anim');
void img.offsetWidth;
img.classList.add('print-anim');
var bar=$('#printBar');var p=5;
bar.style.width='5%';
$('#printTitle').textContent=
'Mencetak strip kamu…';
$('#printStatus').textContent=
'Mengirim data ke EP-80ECO via Bluetooth…';
var iv=setInterval(function(){
p=Math.min(p+7,100);
bar.style.width=p+'%';
if(p>=60){$('#printStatus').textContent=
'Mencetak di kertas thermal 80mm…';}
if(p>=100){
clearInterval(iv);
$('#printTitle').textContent='Strip siap! ✂️';
$('#printStatus').textContent=
'Ambil fotonya di slot printer.';
later(function(){go('share');setupShare();},1400);
}},260);
});
function setupShare(){
var code=Math.random().toString(36)
.slice(2,6).toUpperCase();
$('#galleryCode').textContent=code;
var cap=$('#galleryCode').parentNode;
cap.id='shareCapLine';
cap.textContent='Kode sesi: '+code;
try{new QRious({element:$('#shareQr'),
value:location.origin+'/booth/?s='+code,
size:200,background:'#fff',
foreground:'#111',level:'M'});}catch(e){}
var left=20;
$('#shareCount').textContent=left;
later(function tick(){
left--;
$('#shareCount').textContent=Math.max(left,0);
if(left<=0){finishSession();return;}
later(tick,1000);},1000);
}
$$('.shareOpt').forEach(function(b){
b.addEventListener('click',function(){
showToast(b.dataset.k==='wa'?
'💬 Link galeri dikirim via WhatsApp (simulasi).':
'✉️ Link galeri dikirim via email (simulasi).');});
});
$('#btnFinish').addEventListener('click',finishSession);
function finishSession(){
stopCamera();state.frames=[];
go('attract');
showToast('👋 Sampai jumpa! Terima kasih sudah berfoto.');
}
function buildThemeGrid(){
var g=$('#themeGrid');g.innerHTML='';
Object.entries(THEMES).forEach(function(en){
var k=en[0],t=en[1];
var b=document.createElement('button');
b.className='theme-dot btn'+
(k===settings.themeKey&&!settings.accent?
' on':'');
b.title=t.label;
b.innerHTML='<span class="absolute inset-0" '+
'style="background:'+t.bg+'"></span>'+
'<span class="absolute left-1 top-1 w-3 h-3 '+
'rounded-full" style="background:'+t.accent+
'"></span><span class="absolute left-1 bottom-1 '+
'w-3 h-3 rounded-full" style="background:'+
t.accent2+'"></span>'+
'<span class="absolute inset-x-0 bottom-0 '+
'text-[9px] font-bold py-0.5" style="background:'+
t.ink+';color:'+t.bg+'">'+t.label+'</span>';
b.addEventListener('click',function(){
settings.themeKey=k;settings.accent=null;
applyTheme(currentTheme());buildThemeGrid();});
g.appendChild(b);
});
}
var fsType='overlay';
function fsInit(){
var bB=$('#fsTypeBg'),bO=$('#fsTypeOverlay');
if(bB){bB.style.display='none';}
fsType='overlay';
if(bO){bO.addEventListener('click',function(){
fsType='overlay';bO.classList.add('on');});}
var drop=$('#fsDrop');
if(drop){
drop.addEventListener('click',function(){
$('#fsFile').click();});
['dragover','dragenter'].forEach(function(ev){
drop.addEventListener(ev,function(e){
e.preventDefault();
drop.classList.add('drag');});});
['dragleave','drop'].forEach(function(ev){
drop.addEventListener(ev,function(e){
e.preventDefault();
drop.classList.remove('drag');});});
drop.addEventListener('drop',function(e){
var f=e.dataTransfer&&e.dataTransfer.files&&
e.dataTransfer.files[0];
if(f){handleFsFile(f);}});}
var ff=$('#fsFile');
if(ff){ff.addEventListener('change',function(e){
var f=e.target.files[0];
if(f){handleFsFile(f);}
e.target.value='';});}
}
async function handleFsFile(f){
if(f.type.indexOf('image/')!==0){
showToast('⚠️ File harus berupa gambar');return;}
showToast('⏳ Menyimpan frame…');
try{
var rec=await addCustomFrame(f,fsType);
saveSettings();buildFrameGrid();renderFsList();
showToast('✅ Frame "'+rec.name+
'" tersimpan offline!');
}catch(e){showToast('⚠️ Gagal menyimpan frame');}
}
async function renderFsList(){
var list=$('#fsList');
if(!list){return;}
list.innerHTML='';
var recs=await idbAll();
$('#fsCount').textContent=recs.length;
if(!recs.length){
list.innerHTML='<p class="font-mono text-[10px] '+
'opacity-50 text-center py-2">Belum ada frame '+
'custom.</p>';return;}
recs.forEach(function(r){
var row=document.createElement('div');
row.className='fs-item';
row.innerHTML='<img class="fs-thumb '+
(r.type==='overlay'?'fs-thumb-overlay':'')+
'" src="'+r.dataUrl+'" alt="">'+
'<div class="flex-1 min-w-0">'+
'<p class="font-bold text-xs truncate">'+
r.name+'</p><span class="fs-tag">OVERLAY • '+
'LOKAL</span></div>'+
'<button class="fs-delete" title="Hapus">🗑</button>';
row.querySelector('.fs-delete')
.addEventListener('click',async function(){
await deleteCustomFrame(r.id);
saveSettings();buildFrameGrid();renderFsList();
showToast('🗑 Frame dihapus');});
list.appendChild(row);
});
}
function updateNetBadge(){
var on=navigator.onLine;
var b=$('#statusBadge');
if(!b){return;}
b.classList.toggle('offline',!on);
b.classList.toggle('online',on);
$('#statusText').textContent=
on?'ONLINE':'OFFLINE';
}
window.addEventListener('online',function(){
updateNetBadge();
showToast('🟢 Koneksi kembali — online');});
window.addEventListener('offline',function(){
updateNetBadge();
showToast('🔴 Offline — frame lokal tetap aktif');});
$$('.op-tab').forEach(function(t){
t.addEventListener('click',function(){
$$('.op-tab').forEach(function(x){
x.classList.remove('on');});
t.classList.add('on');
$$('.op-pane').forEach(function(p){
p.classList.remove('on');});
var p=$('#'+t.dataset.pane);
if(p){p.classList.add('on');}
});
});
function togglePayModeUI(){
var m=settings.payment.mode;
var a=$('#pmStatic'),b=$('#pmMidtrans');
if(a){a.classList.toggle('on',m==='static');}
if(b){b.classList.toggle('on',m==='midtrans');}
}
function renderPaymentControls(){
togglePayModeUI();
var mi=$('#opMerchantId');
if(mi){mi.value=
settings.payment.midtrans.merchantId;}
}
$('#opToggle').addEventListener('click',function(){
$('#opPanel').classList.add('open');
buildThemeGrid();renderPaymentControls();
renderFsList();
$('#opBrand').value=settings.brand;
$('#opPrice').value=settings.price;
$('#opPoses').value=settings.poses;
var om=$('#opMirror');
if(om){om.value=
settings.mirror!==false?'1':'0';}
if(settings.accent){
$('#opColor').value=settings.accent;}
});
$('#opClose').addEventListener('click',function(){
$('#opPanel').classList.remove('open');});
$('#opApplyColor').addEventListener('click',function(){
settings.accent=$('#opColor').value;
applyTheme(currentTheme());buildThemeGrid();
showToast('🎨 Warna utama diterapkan!');});
$('#opLogo').addEventListener('change',function(e){
var f=e.target.files[0];
if(!f){return;}
var rd=new FileReader();
rd.onload=function(){
settings.logo=rd.result;
refreshBrandUI();
showToast('🖼 Logo dipasang!');};
rd.readAsDataURL(f);
});
$('#opSave').addEventListener('click',function(){
settings.brand=$('#opBrand').value.trim()||'Boothin';
settings.price=Math.max(1000,
parseInt($('#opPrice').value)||15000);
settings.poses=parseInt($('#opPoses').value)||3;
var om=$('#opMirror');
if(om){settings.mirror=om.value==='1';}
saveSettings();refreshBrandUI();
$('#opPanel').classList.remove('open');
showToast('💾 Pengaturan tersimpan & diterapkan!');
});
loadSettings();
settings.payment.mode='static';
if(settings.mirror===undefined){
settings.mirror=true;}
state.mirror=settings.mirror!==false;
var pmM=$('#pmMidtrans');
if(pmM){pmM.style.display='none';}
var tb=document.querySelector(
'.op-tab[data-pane="paneBayar"]');
if(tb){tb.style.display='none';}
var pb=$('#paneBayar');
if(pb){pb.style.display='none';}
var bs=$('#btnStart');
if(bs){bs.innerHTML='📷 Mulai Foto';}
applyTheme(currentTheme());
refreshBrandUI();
buildFilterGrid();
fsInit();
updateNetBadge();
loadCustomFrames().then(function(){
buildFrameGrid();renderFsList();
}).catch(function(){
buildFrameGrid();renderFsList();
});
if(document.fonts&&document.fonts.load){
document.fonts.load('800 26px "Bricolage Grotesque"');
document.fonts.load('700 12px "Space Mono"');
}