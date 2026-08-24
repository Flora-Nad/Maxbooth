/* media.js v2 bersih */
(function(){
function mdb(){
return new Promise(function(res,rej){
var q=indexedDB.open('boothin-media',1);
q.onupgradeneeded=function(e){
var db=e.target.result;
if(!db.objectStoreNames.contains('media')){
db.createObjectStore('media',{keyPath:'id'});}
};
q.onsuccess=function(e){res(e.target.result);};
q.onerror=function(e){rej(e.target.error);};
});
}
async function mGet(){
try{
var db=await mdb();
return await new Promise(function(res,rej){
var q=db.transaction('media','readonly')
.objectStore('media').get('idle');
q.onsuccess=function(){res(q.result||null);};
q.onerror=function(e){rej(e.target.error);};
});
}catch(e){return null;}
}
async function mPut(rec){
var db=await mdb();
return new Promise(function(res,rej){
var tx=db.transaction('media','readwrite');
tx.objectStore('media').put(rec);
tx.oncomplete=res;
tx.onerror=function(e){rej(e.target.error);};
});
}
async function mDel(){
var db=await mdb();
return new Promise(function(res,rej){
var tx=db.transaction('media','readwrite');
tx.objectStore('media').delete('idle');
tx.oncomplete=res;
tx.onerror=function(e){rej(e.target.error);};
});
}
function extType(name){
var n=(name||'').toLowerCase();
if(n.indexOf('.mp4')>-1||n.indexOf('.webm')>-1||
n.indexOf('.mov')>-1||n.indexOf('.m4v')>-1){
return 'video/mp4';}
if(n.indexOf('.jpg')>-1||n.indexOf('.jpeg')>-1||
n.indexOf('.png')>-1||n.indexOf('.webp')>-1){
return 'image/x';}
return '';
}
var mediaUrl=null;
function showDefault(){
var v=$('#atVideo'),im=$('#atImage');
var btn=$('#btnCam'),def=$('#atDefault');
v.classList.add('hidden');
im.classList.add('hidden');
btn.classList.add('hidden');
def.classList.remove('hidden');
}
async function applyMedia(){
var rec=await mGet();
var v=$('#atVideo'),im=$('#atImage');
var btn=$('#btnCam'),def=$('#atDefault');
if(mediaUrl){URL.revokeObjectURL(mediaUrl);
mediaUrl=null;}
if(!rec){showDefault();return;}
mediaUrl=URL.createObjectURL(rec.blob);
var isVid=(rec.type||'').indexOf('video')===0;
def.classList.add('hidden');
btn.classList.remove('hidden');
if(isVid){
im.classList.add('hidden');
v.classList.remove('hidden');
v.muted=true;v.setAttribute('muted','');
v.setAttribute('playsinline','');
v.onerror=function(){
showToast('⚠ Video tidak didukung — '+
'gunakan MP4 (H.264)');
v.pause();showDefault();
};
v.addEventListener('canplay',function(){
v.play().catch(function(){});
},{once:true});
v.src=mediaUrl;
v.play().catch(function(){});
}else{
v.classList.add('hidden');v.pause();
im.classList.remove('hidden');
im.src=mediaUrl;
}
}
var at=$('#screen-attract');
new MutationObserver(function(){
var v=$('#atVideo');
if(!v){return;}
if(at.classList.contains('active')&&
!v.classList.contains('hidden')){
v.play().catch(function(){});
}else{v.pause();}
}).observe(at,{attributes:true,
attributeFilter:['class']});
var bc=$('#btnCam');
if(bc){bc.addEventListener('click',function(){
go('setup');});}
function injectMediaUI(){
var pane=$('#paneUmum');
if(!pane||$('#mediaBox')){return;}
var box=document.createElement('div');
box.id='mediaBox';
box.className='mt-5 pt-4 border-t-2 border-dashed';
box.style.borderColor='var(--soft)';
box.innerHTML='<p class="font-mono text-xs '+
'font-bold tracking-widest opacity-60 mb-2">'+
'🎬 MEDIA IDLE (LAYAR AWAL)</p>'+
'<input id="mdFile" type="file" '+
'accept="image/*,video/*" '+
'class="op-input !p-2 text-xs">'+
'<p id="mdStatus" class="font-mono text-[10px] '+
'opacity-60 mt-2">Belum ada media — pakai '+
'tampilan default.</p>'+
'<button id="mdDel" class="btn btn-press w-full '+
'mt-2 py-2 rounded-xl border-[3px] '+
'border-[var(--ink)] font-bold text-sm '+
'bg-[var(--surface)] '+
'shadow-[3px_3px_0_var(--ink)]">'+
'🗑 Hapus Media (kembali default)</button>'+
'<p class="font-mono text-[9px] opacity-50 mt-2">'+
'Video: MP4 H.264 / WebM, maks 60MB. '+
'Gambar: JPG/PNG. Tersimpan offline.</p>';
pane.appendChild(box);
$('#mdFile').addEventListener('change',
async function(e){
var f=e.target.files[0];
e.target.value='';
if(!f){return;}
if(f.size>60*1024*1024){
showToast('⚠ Maksimal 60MB');return;}
var type=f.type||extType(f.name);
if(!type){
showToast('⚠ Format tidak dikenali');return;}
showToast('⏳ Menyimpan media…');
try{
await mPut({id:'idle',type:type,blob:f});
await applyMedia();updateMdStatus();
showToast('✅ Media idle terpasang!');
}catch(err){
showToast('⚠ Gagal menyimpan media');}
});
$('#mdDel').addEventListener('click',
async function(){
await mDel();await applyMedia();
updateMdStatus();
showToast('🗑 Media dihapus — kembali default');});
updateMdStatus();
}
async function updateMdStatus(){
var st=$('#mdStatus');
if(!st){return;}
var rec=await mGet();
if(rec){
var kind=(rec.type||'').indexOf('video')===0?
'video':'gambar';
var mb=Math.round(rec.blob.size/1024/1024*10)/10;
st.textContent='✅ Media aktif: '+kind+
' ('+mb+' MB)';
}else{
st.textContent='Belum ada media — pakai '+
'tampilan default.';}
}
new MutationObserver(function(){
if($('#opPanel').classList.contains('open')){
injectMediaUI();}
}).observe($('#opPanel'),{attributes:true,
attributeFilter:['class']});
injectMediaUI();
applyMedia();
})();
