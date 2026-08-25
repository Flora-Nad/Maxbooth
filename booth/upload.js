// upload.js v2 - polling uploader + diagnosis
(function(){
if(window.__boothUploadJs){return;}
window.__boothUploadJs=1;
function sdb(){
return new Promise(function(res,rej){
var q=indexedDB.open('boothin-sessions',1);
q.onupgradeneeded=function(e){
var db=e.target.result;
if(!db.objectStoreNames.contains('sessions')){
db.createObjectStore('sessions',{keyPath:'code'});}
};
q.onsuccess=function(e){res(e.target.result);};
q.onerror=function(e){rej(e.target.error);};
});
}
async function sPut(rec){
var db=await sdb();
return new Promise(function(res,rej){
var tx=db.transaction('sessions','readwrite');
tx.objectStore('sessions').put(rec);
tx.oncomplete=res;
tx.onerror=function(e){rej(e.target.error);};
});
}
async function sAll(){
try{
var db=await sdb();
return await new Promise(function(res,rej){
var q=db.transaction('sessions','readonly')
.objectStore('sessions').getAll();
q.onsuccess=function(){res(q.result||[]);};
q.onerror=function(e){rej(e.target.error);};
});
}catch(e){return[];}
}
async function sDel(code){
var db=await sdb();
return new Promise(function(res,rej){
var tx=db.transaction('sessions','readwrite');
tx.objectStore('sessions').delete(code);
tx.oncomplete=res;
tx.onerror=function(e){rej(e.target.error);};
});
}
async function trimSessions(){
var all=await sAll();
if(all.length>30){
all.sort(function(a,b){
return a.createdAt-b.createdAt;});
for(var i=0;i<all.length-30;i++){
try{await sDel(all[i].code);}catch(e){}
}
}
}
function copyText(t){
if(navigator.clipboard&&navigator.clipboard.writeText){
return navigator.clipboard.writeText(t);}
return new Promise(function(res){
var ta=document.createElement('textarea');
ta.value=t;document.body.appendChild(ta);
ta.select();document.execCommand('copy');
ta.remove();res();
});
}
function setLast(msg){
try{localStorage.setItem('gd_last',msg);}catch(e){}
var st=$('#gdStatus');
if(st){st.textContent=msg;}
}
async function renderSessionList(){
var list=$('#gdSessions');
if(!list){return;}
list.innerHTML='';
var all=await sAll();
all.sort(function(a,b){
return b.createdAt-a.createdAt;});
if(!all.length){
list.innerHTML='<p class="font-mono text-[10px] '+
'opacity-50 text-center py-1">Belum ada sesi '+
'upload.</p>';
return;
}
all.slice(0,10).forEach(function(s){
var d=new Date(s.createdAt);
var row=document.createElement('div');
row.className='fs-item';
row.innerHTML='<div class="flex-1 min-w-0">'+
'<p class="font-bold text-xs truncate">🔗 Sesi '+
s.code+'</p><span class="fs-tag">'+
d.toLocaleString('id-ID',{day:'numeric',
month:'short',hour:'2-digit',minute:'2-digit'})+
' • '+(s.videoLink?'FOTO+VIDEO':'FOTO')+
'</span></div>'+
'<button class="fs-delete" '+
'style="background:var(--accent2)" '+
'title="Salin link">📋</button>';
row.querySelector('.fs-delete')
.addEventListener('click',function(){
copyText(s.folderLink).then(function(){
showToast('📋 Link sesi disalin — '+
'kirim ke customer!');});
});
list.appendChild(row);
});
}
window.renderSessionList=renderSessionList;
async function startUpload(code,p){
showToast('☁️ Mengunggah foto+video ke Drive…');
try{
var root=await GD.ensureRoot();
var fol=await GD.makeFolder('Sesi '+code,root);
await GD.makePublic(fol.id);
var stripLink=null;
if(p.strip){
var b=await (await fetch(p.strip)).blob();
var f=await GD.uploadBlob(
'strip-'+code+'.png','image/png',b,fol.id);
await GD.makePublic(f.id);
stripLink=f.webViewLink;
}
var videoLink=null;
if(p.video){
var vb=await (await fetch(p.video)).blob();
if(vb.size>1000){
var v=await GD.uploadBlob(
'video-'+code+'.webm','video/webm',vb,fol.id);
await GD.makePublic(v.id);
videoLink=v.webViewLink;
}
}
var rec={code:code,createdAt:Date.now(),
folderLink:fol.webViewLink,
stripLink:stripLink,videoLink:videoLink};
await sPut(rec);trimSessions();renderSessionList();
try{
new QRious({element:$('#shareQr'),
value:rec.folderLink,size:200,
background:'#fff',foreground:'#111',level:'M'});
}catch(e){}
var cap=$('#shareCapLine');
if(cap){cap.textContent='☁️ Scan untuk unduh '+
'foto+video sesi '+code;}
setLast('✅ Upload sesi '+code+' berhasil.');
showToast('✅ Link unduhan siap — QR customer aktif!');
}catch(e){
console.warn(e);
var is401=String(e).indexOf('401')>=0;
if(is401){
try{localStorage.removeItem('gd_token');}catch(e2){}
}
var msg=is401?
'🔐 Sesi Google habis — tekan Hubungkan Google':
'⚠ Upload gagal: '+e;
setLast(msg);
showToast(msg);
}
}
var doneCodes={};
setInterval(function(){
var share=$('#screen-share');
if(!share){return;}
if(!share.classList.contains('active')){return;}
if(!window.GD||!GD.token){return;}
var code=($('#galleryCode')?
$('#galleryCode').textContent:'').trim();
if(!code||doneCodes[code]){return;}
doneCodes[code]=1;
var strip=($('#previewStrip')?
$('#previewStrip').src:'');
var vid=($('#gifStrip')&&
!$('#gifStrip').classList.contains('hidden'))?
$('#gifStrip').src:'';
startUpload(code,{strip:strip,video:vid});
},800);
function showLast(){
var last=null;
try{last=localStorage.getItem('gd_last');}catch(e){}
if(last){
var st=$('#gdStatus');
if(st){st.textContent=last;}
}
if(window.renderSessionList){renderSessionList();}
}
new MutationObserver(function(){
if($('#opPanel').classList.contains('open')){
showLast();}
}).observe($('#opPanel'),{attributes:true,
attributeFilter:['class']});
showLast();
})();
