/* video.js v4 bersih */
(function(){
var supported=(typeof MediaRecorder!=='undefined');
var vidMode=settings.gif===true&&supported;
var btnP=$('#modePhoto'),btnG=$('#modeGif');
function paint(){
if(!btnP||!btnG){return;}
btnP.classList.toggle('on',!vidMode);
btnG.classList.toggle('on',vidMode);
}
if(btnP){btnP.addEventListener('click',function(){
vidMode=false;settings.gif=false;
saveSettings();paint();
showToast('📷 Mode foto saja');});}
if(btnG){btnG.addEventListener('click',function(){
if(!supported){showToast('⚠ Perangkat tidak mendukung rekam video');return;}
vidMode=true;settings.gif=true;
saveSettings();paint();
showToast('🎬 Mode video aktif!');});}
paint();
function vdb(){
return new Promise(function(res,rej){
var q=indexedDB.open('boothin-videos',1);
q.onupgradeneeded=function(e){
var db=e.target.result;
if(!db.objectStoreNames.contains('videos')){
db.createObjectStore('videos',{keyPath:'id'});}
};
q.onsuccess=function(e){res(e.target.result);};
q.onerror=function(e){rej(e.target.error);};
});
}
async function vPut(rec){
var db=await vdb();
return new Promise(function(res,rej){
var tx=db.transaction('videos','readwrite');
tx.objectStore('videos').put(rec);
tx.oncomplete=res;
tx.onerror=function(e){rej(e.target.error);};
});
}
async function vAll(){
try{
var db=await vdb();
return await new Promise(function(res,rej){
var q=db.transaction('videos','readonly')
.objectStore('videos').getAll();
q.onsuccess=function(){res(q.result||[]);};
q.onerror=function(e){rej(e.target.error);};
});
}catch(e){return[];}
}
async function vDel(id){
var db=await vdb();
return new Promise(function(res,rej){
var tx=db.transaction('videos','readwrite');
tx.objectStore('videos').delete(id);
tx.oncomplete=res;
tx.onerror=function(e){rej(e.target.error);};
});
}
async function trimVideos(){
var all=await vAll();
if(all.length>20){
all.sort(function(a,b){
return a.createdAt-b.createdAt;});
for(var i=0;i<all.length-20;i++){
try{await vDel(all[i].id);}catch(e){}
}
}
}
var recorder=null,chunks=[],vidUrl=null,retry=null;
function pickMime(){
var c=['video/webm;codecs=vp9',
'video/webm;codecs=vp8','video/webm','video/mp4'];
for(var i=0;i<c.length;i++){
try{if(MediaRecorder.isTypeSupported(c[i])){
return c[i];}}catch(e){}
}
return '';
}
function startRec(){
if(!vidMode||recorder||!state.stream){return;}
if(!$('#screen-capture').classList
.contains('active')){return;}
try{
chunks=[];
var mime=pickMime();
recorder=mime?new MediaRecorder(state.stream,
{mimeType:mime}):new MediaRecorder(state.stream);
recorder.ondataavailable=function(e){
if(e.data&&e.data.size){chunks.push(e.data);}
};
recorder.start(300);
}catch(e){recorder=null;}
}
function stopRec(){
if(retry){clearInterval(retry);retry=null;}
if(!recorder){return;}
var r=recorder;recorder=null;
r.onstop=async function(){
try{
var blob=new Blob(chunks,
{type:r.mimeType||'video/webm'});
chunks=[];
if(blob.size<2000){return;}
var id='vid-'+Date.now().toString(36);
try{
await vPut({id:id,createdAt:Date.now(),
mime:r.mimeType||'video/webm',blob:blob});
trimVideos();renderVideoList();
}catch(e){}
if(vidUrl){URL.revokeObjectURL(vidUrl);}
vidUrl=URL.createObjectURL(blob);
showVideo();
}catch(e){}
};
try{r.stop();}catch(e){}
}
function showVideo(){
var v=$('#gifStrip');
if(!v||!vidUrl){return;}
v.src=vidUrl;v.muted=true;v.loop=true;
v.playsInline=true;
v.classList.remove('hidden');
v.play().catch(function(){});
var gc=$('#gifCap');
if(gc){gc.classList.remove('hidden');}
showToast('🎬 Video strip siap!');
}
var cap=$('#screen-capture');
new MutationObserver(function(){
if(cap.classList.contains('active')){
startRec();
if(!recorder&&vidMode&&!retry){
retry=setInterval(function(){
startRec();
if(recorder&&retry){
clearInterval(retry);retry=null;}
},300);}
}else{stopRec();}
}).observe(cap,{attributes:true,
attributeFilter:['class']});
var _stopCam=window.stopCamera;
window.stopCamera=function(){
stopRec();return _stopCam();};
var _startCam=window.startCamera;
window.startCamera=async function(){
var r=await _startCam();startRec();return r;};
function injectOpUI(){
var pane=$('#paneFrame');
if(!pane||$('#opVidBox')){return;}
var box=document.createElement('div');
box.id='opVidBox';
box.className='mt-6 pt-4 border-t-2 border-dashed';
box.style.borderColor='var(--soft)';
box.innerHTML='<p class="font-mono text-xs '+
'font-bold tracking-widest opacity-60 mb-2">'+
'🎬 REKAMAN SESI (OPERATOR)</p>'+
'<div id="opVidList" class="space-y-2"></div>'+
'<p class="font-mono text-[9px] opacity-50 mt-2">'+
'Video tersimpan offline — maks 20 terakhir.</p>';
pane.appendChild(box);
}
async function renderVideoList(){
injectOpUI();
var list=$('#opVidList');
if(!list){return;}
list.innerHTML='';
var all=await vAll();
all.sort(function(a,b){
return b.createdAt-a.createdAt;});
if(!all.length){
list.innerHTML='<p class="font-mono text-[10px] '+
'opacity-50 text-center py-1">Belum ada '+
'rekaman.</p>';
return;
}
all.forEach(function(v){
var row=document.createElement('div');
row.className='fs-item';
var d=new Date(v.createdAt);
row.innerHTML='<div class="flex-1 min-w-0">'+
'<p class="font-bold text-xs truncate">🎬 '+
d.toLocaleString('id-ID',{day:'numeric',
month:'short',hour:'2-digit',minute:'2-digit'})+
'</p><span class="fs-tag">'+
Math.round(v.blob.size/1024)+
' KB • LOKAL</span></div>'+
'<button class="fs-delete" '+
'style="background:var(--accent2)" '+
'title="Unduh">⬇</button>'+
'<button class="fs-delete" title="Hapus">🗑</button>';
var btns=row.querySelectorAll('.fs-delete');
btns[0].addEventListener('click',function(){
var u=URL.createObjectURL(v.blob);
var a=document.createElement('a');
a.href=u;
a.download='boothin-'+v.id+'.webm';
a.click();
setTimeout(function(){
URL.revokeObjectURL(u);},5000);
showToast('⬇ Video diunduh (operator)');});
btns[1].addEventListener('click',
async function(){
await vDel(v.id);renderVideoList();
showToast('🗑 Rekaman dihapus');});
list.appendChild(row);
});
}
new MutationObserver(function(){
if($('#opPanel').classList.contains('open')){
renderVideoList();}
}).observe($('#opPanel'),{attributes:true,
attributeFilter:['class']});
})();
