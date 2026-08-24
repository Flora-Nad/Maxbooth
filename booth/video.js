/* ═══ video.js v4 — rekaman sesi + galeri operator ═══ */
(function(){
const supported=(typeof MediaRecorder!=='undefined');
let vidMode=settings.gif===true&&supported;
const btnP=$('#modePhoto'),btnG=$('#modeGif');
function paint(){if(!btnP||!btnG)return;btnP.classList.toggle('on',!vidMode);btnG.classList.toggle('on',vidMode);}
if(btnP)btnP.addEventListener('click',()=>{vidMode=false;settings.gif=false;saveSettings();paint();showToast('📷 Mode foto saja');});
if(btnG)btnG.addEventListener('click',()=>{if(!supported){showToast('⚠ Perangkat tidak mendukung rekam video');return;}vidMode=true;settings.gif=true;saveSettings();paint();showToast('🎬 Mode video aktif — sesi akan direkam!');});
paint();

/* ── penyimpanan video (khusus operator) ── */
function vdb(){return new Promise((res,rej)=>{const q=indexedDB.open('boothin-videos',1);q.onupgradeneeded=e=>{const db=e.target.result;if(!db.objectStoreNames.contains('videos'))db.createObjectStore('videos',{keyPath:'id'});};q.onsuccess=e=>res(e.target.result);q.onerror=e=>rej(e.target.error);});}
async function vPut(rec){const db=await vdb();return new Promise((res,rej)=>{const tx=db.transaction('videos','readwrite');tx.objectStore('videos').put(rec);tx.oncomplete=res;tx.onerror=e=>rej(e.target.error);});}
async function vAll(){try{const db=await vdb();return await new Promise((res,rej)=>{const q=db.transaction('videos','readonly').objectStore('videos').getAll();q.onsuccess=()=>res(q.result||[]);q.onerror=e=>rej(e.target.error);});}catch(e){return[];}}
async function vDel(id){const db=await vdb();return new Promise((res,rej)=>{const tx=db.transaction('videos','readwrite');tx.objectStore('videos').delete(id);tx.oncomplete=res;tx.onerror=e=>rej(e.target.error);});}
async function trimVideos(){const all=await vAll();if(all.length>20){all.sort((a,b)=>a.createdAt-b.createdAt);for(const v of all.slice(0,all.length-20)){try{await vDel(v.id);}catch(e){}}}}

let recorder=null,chunks=[],vidUrl=null,retry=null;
function pickMime(){const c=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm','video/mp4'];for(const m of c){try{if(MediaRecorder.isTypeSupported(m))return m;}catch(e){}}return '';}
function startRec(){
  if(!vidMode||recorder||!state.stream)return;
  if(!$('#screen-capture').classList.contains('active'))return;
  try{chunks=[];const mime=pickMime();recorder=mime?new MediaRecorder(state.stream,{mimeType:mime}):new MediaRecorder(state.stream);recorder.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data);};recorder.start(300);}catch(e){recorder=null;}
}
function stopRec(){
  if(retry){clearInterval(retry);retry=null;}
  if(!recorder)return;const r=recorder;recorder=null;
  r.onstop=async()=>{try{
    const blob=new Blob(chunks,{type:r.mimeType||'video/webm'});chunks=[];
    if(blob.size<2000)return;
    const id='vid-'+Date.now().toString(36);
    try{await vPut({id,createdAt:Date.now(),mime:r.mimeType||'video/webm',blob});trimVideos();renderVideoList();}catch(e){}
    if(vidUrl)URL.revokeObjectURL(vidUrl);
    vidUrl=URL.createObjectURL(blob);
    showVideo();
  }catch(e){}};
  try{r.stop();}catch(e){}
}
function showVideo(){
  const v=$('#gifStrip');if(!v||!vidUrl)return;
  v.src=vidUrl;v.muted=true;v.loop=true;v.playsInline=true;v.classList.remove('hidden');v.play().catch(()=>{});
  const gc=$('#gifCap');if(gc)gc.classList.remove('hidden');
  showToast('🎬 Video strip siap!');
}
const cap=$('#screen-capture');
new MutationObserver(()=>{
  if(cap.classList.contains('active')){
    startRec();
    if(!recorder&&vidMode&&!retry){retry=setInterval(()=>{startRec();if(recorder&&retry){clearInterval(retry);retry=null;}},300);}
  } else stopRec();
}).observe(cap,{attributes:true,attributeFilter:['class']});
const _stopCam=window.stopCamera;window.stopCamera=function(){stopRec();return _stopCam();};
const _startCam=window.startCamera;window.startCamera=async function(){const r=await _startCam();startRec();return r;};

/* ── UI operator (disuntikkan otomatis ke tab FRAME) ── */
function injectOpUI(){
  const pane=$('#paneFrame');if(!pane||$('#opVidBox'))return;
  const box=document.createElement('div');box.id='opVidBox';box.className='mt-6 pt-4 border-t-2 border-dashed';box.style.borderColor='var(--soft)';
  box.innerHTML='<p class="font-mono text-xs font-bold tracking-widest opacity-60 mb-2">🎬 REKAMAN SESI (OPERATOR)</p><div id="opVidList" class="space-y-2"></div><p class="font-mono text-[9px] opacity-50 mt-2">Video tersimpan offline di perangkat — maks 20 terakhir. Nya­ngkut link customer & sinkron Drive menyusul.</p>';
  pane.appendChild(box);
}
async function renderVideoList(){
  injectOpUI();
  const list=$('#opVidList');if(!list)return;list.innerHTML='';
  const all=await vAll();all.sort((a,b)=>b.createdAt-a.createdAt);
  if(!all.length){list.innerHTML='<p class="font-mono text-[10px] opacity-50 text-center py-1">Belum ada rekaman.</p>';return;}
  all.forEach(v=>{
    const row=document.createElement('div');row.className='fs-item';
    const d=new Date(v.createdAt);
    row.innerHTML='<div class="flex-1 min-w-0"><p class="font-bold text-xs truncate">🎬 '+d.toLocaleString('id-ID',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})+'</p><span class="fs-tag">'+Math.round(v.blob.size/1024)+' KB • LOKAL</span></div><button class="fs-delete" style="background:var(--accent2)" title="Unduh">⬇</button><button class="fs-delete" title="Hapus">🗑</button>';
    const btns=row.querySelectorAll('.fs-delete');
    btns[0].addEventListener('click',()=>{const u=URL.createObjectURL(v.blob);const a=document.createElement('a');a.href=u;a.download='boothin-'+v.id+'.webm';a.click();setTimeout(()=>URL.revokeObjectURL(u),5000);showToast('⬇ Video diunduh (operator)');});
    btns[1].addEventListener('click',async()=>{await vDel(v.id);renderVideoList();showToast('🗑 Rekaman dihapus');});
    list.appendChild(row);
  });
}
new MutationObserver(()=>{if($('#opPanel').classList.contains('open'))renderVideoList();}).observe($('#opPanel'),{attributes:true,attributeFilter:['class']});
})();