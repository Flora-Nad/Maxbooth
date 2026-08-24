/* drive.js FINAL (1/2) */
(function(){
window.GD={token:null,rootId:null};
if(!document.getElementById('tabfix')){
document.head.insertAdjacentHTML('beforeend',
'<style id="tabfix">.op-tab{color:var(--bg)}'+
'.op-tab.on{color:var(--ink)}</style>');
}
function injectCloudUI(){
var tabs=document.querySelector('.op-tabs');
if(tabs&&!document.getElementById('tabCloud')){
var t=document.createElement('button');
t.id='tabCloud';t.className='op-tab';
t.textContent='CLOUD';
t.addEventListener('click',function(){
$$('.op-tab').forEach(function(x){
x.classList.remove('on');});
t.classList.add('on');
$$('.op-pane').forEach(function(p){
p.classList.remove('on');});
var pc=$('#paneCloud');
if(pc){pc.classList.add('on');}
if(window.renderSessionList){
renderSessionList();}
});
tabs.appendChild(t);
}
var panel=$('#opPanel');
if(panel&&!document.getElementById('paneCloud')){
var p=document.createElement('div');
p.id='paneCloud';p.className='op-pane';
p.innerHTML=cloudHTML();
var save=$('#opSave');
panel.insertBefore(p,save);
$('#gdClient').value=settings.gdClient||'';
$('#gdConnect').addEventListener('click',connect);
}
}
function cloudHTML(){
return '<div class="mt-5 space-y-3">'+
'<p class="font-mono text-xs font-bold '+
'tracking-widest opacity-60">☁️ GOOGLE DRIVE</p>'+
'<div><p class="font-mono text-[10px] font-bold '+
'tracking-widest opacity-50 mb-1.5">OAUTH '+
'CLIENT ID</p>'+
'<input id="gdClient" class="op-input '+
'font-mono text-xs" placeholder="xxxx.apps.'+
'googleusercontent.com"></div>'+
'<button id="gdConnect" class="btn btn-press '+
'w-full py-3 rounded-xl border-[3px] '+
'border-[var(--ink)] font-bold '+
'bg-[var(--accent2)] '+
'shadow-[3px_3px_0_var(--ink)]">🔐 Hubungkan '+
'Google</button>'+
'<p id="gdStatus" class="font-mono text-[10px] '+
'opacity-60">Belum terhubung.</p>'+
'<div class="pt-3 border-t-2 border-dashed" '+
'style="border-color:var(--soft)">'+
'<p class="font-mono text-[10px] font-bold '+
'tracking-widest opacity-50 mb-2">🔗 LINK SESI '+
'(jika QR terlewat)</p>'+
'<div id="gdSessions" class="space-y-2">'+
'</div></div>'+
'<p class="font-mono text-[9px] opacity-50 '+
'leading-relaxed">Foto+video tiap sesi '+
'auto-upload ke Drive kamu. QR customer '+
'otomatis menjadi link unduhan asli.</p></div>';
}
function connect(){
var cid=($('#gdClient').value||'').trim();
if(!cid){showToast('⚠ Isi OAuth Client ID dulu');
return;}
settings.gdClient=cid;saveSettings();
var redir=location.origin+location.pathname;
var scope='https://www.googleapis.com/auth/drive.file';
var url='https://accounts.google.com/o/oauth2/v2/auth'+
'?client_id='+encodeURIComponent(cid)+
'&redirect_uri='+encodeURIComponent(redir)+
'&response_type=token'+
'&scope='+encodeURIComponent(scope)+
'&prompt=select_account';
showToast('⏳ Mengalihkan ke login Google…');
location.href=url;
}
function parseTokenFromUrl(){
var m=location.hash.match(/access_token=([^&]+)/);
if(!m){return;}
GD.token=decodeURIComponent(m[1]);
try{localStorage.setItem('gd_token',GD.token);
localStorage.setItem('gd_exp',
String(Date.now()+3500*1000));}catch(e){}
try{history.replaceState(null,'',
location.pathname+location.search);}catch(e){}
var st=$('#gdStatus');
if(st){st.textContent='✅ Terhubung ke Google Drive.';}
showToast('✅ Google Drive terhubung!');
ensureRoot().then(function(){
if(window.renderSessionList){renderSessionList();}
}).catch(function(){});
}
function restoreToken(){
try{
var t=localStorage.getItem('gd_token');
var x=parseInt(
localStorage.getItem('gd_exp')||'0',10);
if(t&&x>Date.now()){
GD.token=t;
var st=$('#gdStatus');
if(st){st.textContent='✅ Terhubung ke Google Drive.';}
ensureRoot().catch(function(){});
}
}catch(e){}
}
async function api(path,opts){
opts=opts||{};
opts.headers=Object.assign(
{Authorization:'Bearer '+GD.token},
opts.headers||{});
var r=await fetch(
'https://www.googleapis.com/drive/v3/'+path,opts);
if(!r.ok){throw new Error('DRIVE_'+r.status);}
return r.json();
}
async function ensureRoot(){
if(GD.rootId){return GD.rootId;}
if(settings.gdRoot){
GD.rootId=settings.gdRoot;return GD.rootId;}
var qstr="name='Boothin Cloud' and mimeType="+
"'application/vnd.google-apps.folder' "+
"and trashed=false";
var q=await api('files?q='+encodeURIComponent(qstr)+
'&fields=files(id)');
if(q.files&&q.files.length){
GD.rootId=q.files[0].id;}
else{
var f=await api('',{method:'POST',
headers:{'Content-Type':'application/json'},
body:JSON.stringify({name:'Boothin Cloud',
mimeType:'application/vnd.google-apps.folder'})});
GD.rootId=f.id;
}
settings.gdRoot=GD.rootId;saveSettings();
return GD.rootId;
}
async function makeFolder(name,parent){
return api('',{method:'POST',
headers:{'Content-Type':'application/json'},
body:JSON.stringify({name:name,
mimeType:'application/vnd.google-apps.folder',
parents:[parent]})});
}
async function uploadBlob(name,mime,blob,parent){
var form=new FormData();
var meta=JSON.stringify({name:name,
mimeType:mime,parents:[parent]});
form.append('metadata',
new Blob([meta],{type:'application/json'}));
form.append('file',blob);
var r=await fetch(
'https://www.googleapis.com/upload/drive/v3/files'+
'?fields=id,webViewLink',
{method:'POST',
headers:{Authorization:'Bearer '+GD.token},
body:form});
if(!r.ok){throw new Error('DRIVE_'+r.status);}
return r.json();
}
async function makePublic(id){
await fetch(
'https://www.googleapis.com/drive/v3/files/'+id+
'/permissions',
{method:'POST',
headers:{Authorization:'Bearer '+GD.token,
'Content-Type':'application/json'},
body:JSON.stringify({role:'reader',
type:'anyone'})});
}
window.GD.api=api;
window.GD.ensureRoot=ensureRoot;
window.GD.makeFolder=makeFolder;
window.GD.uploadBlob=uploadBlob;
window.GD.makePublic=makePublic;
injectCloudUI();
parseTokenFromUrl();
restoreToken();
new MutationObserver(function(){
if($('#opPanel').classList.contains('open')){
injectCloudUI();}
}).observe($('#opPanel'),
{attributes:true,attributeFilter:['class']});
})();
/* drive.js FINAL (2/2) */
(function(){
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
var st2=$('#gdStatus');
if(st2){st2.textContent='✅ Upload sesi '+code+' berhasil.';}
showToast('✅ Link unduhan siap — QR customer aktif!');
}catch(e){
console.warn(e);
var is401=String(e).indexOf('401')>=0;
if(is401){
try{localStorage.removeItem('gd_token');}catch(e2){}
}
var msg=is401?
'🔐 Sesi Google habis — hubungkan ulang':
'⚠ Upload gagal: '+e;
var st=$('#gdStatus');
if(st){st.textContent=msg;}
showToast(msg);
}
}
var pending=null;var doneCodes={};
var prev=$('#screen-preview'),share=$('#screen-share');
new MutationObserver(function(){
if(prev.classList.contains('active')){
pending={
strip:($('#previewStrip')?
$('#previewStrip').src:''),
video:($('#gifStrip')&&!$('#gifStrip')
.classList.contains('hidden'))?
$('#gifStrip').src:''};
}
}).observe(prev,{attributes:true,
attributeFilter:['class']});
new MutationObserver(function(){
if(share.classList.contains('active')&&
pending&&GD.token){
var code=($('#galleryCode')?
$('#galleryCode').textContent:'').trim();
if(code&&!doneCodes[code]){
doneCodes[code]=true;
startUpload(code,pending);
}
}
}).observe(share,{attributes:true,
attributeFilter:['class']});
})();
