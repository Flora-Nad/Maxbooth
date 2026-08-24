/* ═══ media.js — media promosi layar idle (revisi #3) ═══ */
(function(){
function mdb(){return new Promise((res,rej)=>{const q=indexedDB.open('boothin-media',1);q.onupgradeneeded=e=>{const db=e.target.result;if(!db.objectStoreNames.contains('media'))db.createObjectStore('media',{keyPath:'id'});};q.onsuccess=e=>res(e.target.result);q.onerror=e=>rej(e.target.error);});}
async function mGet(){try{const db=await mdb();return await new Promise((res,rej)=>{const q=db.transaction('media','readonly').objectStore('media').get('idle');q.onsuccess=()=>res(q.result||null);q.onerror=e=>rej(e.target.error);});}catch(e){return null;}}
async function mPut(rec){const db=await mdb();return new Promise((res,rej)=>{const tx=db.transaction('media','readwrite');tx.objectStore('media').put(rec);tx.oncomplete=res;tx.onerror=e=>rej(e.target.error);});}
async function mDel(){const db=await mdb();return new Promise((res,rej)=>{const tx=db.transaction('media','readwrite');tx.objectStore('media').delete('idle');tx.oncomplete=res;tx.onerror=e=>rej(e.target.error);});}
let mediaUrl=null;
async function applyMedia(){
  const rec=await mGet();
  const v=$('#atVideo'),im=$('#atImage'),btn=$('#btnCam'),def=$('#atDefault');
  if(mediaUrl){URL.revokeObjectURL(mediaUrl);mediaUrl=null;}
  if(!rec){v.classList.add('hidden');im.classList.add('hidden');btn.classList.add('hidden');def.classList.remove('hidden');return;}
  mediaUrl=URL.createObjectURL(rec.blob);
  def.classList.add('hidden');btn.classList.remove('hidden');
  if(rec.type.indexOf('video')===0){im.classList.add('hidden');v.classList.remove('hidden');v.src=mediaUrl;v.play().catch(()=>{});}
  else{v.classList.add('hidden');v.pause();im.classList.remove('hidden');im.src=mediaUrl;}
}
const at=$('#screen-attract');
new MutationObserver(()=>{const v=$('#atVideo');if(!v)return;if(at.classList.contains('active')&&!v.classList.contains('hidden'))v.play().catch(()=>{});else v.pause();}).observe(at,{attributes:true,attributeFilter:['class']});
const bc=$('#btnCam');
if(bc)bc.addEventListener('click',()=>{startPayment();});
function injectMediaUI(){
  const pane=$('#paneUmum');
  if(!pane||$('#mediaBox'))return;
  const box=document.createElement('div');box.id='mediaBox';box.className='mt-5 pt-4 border-t-2 border-dashed';box.style.borderColor='var(--soft)';
  box.innerHTML='<p class="font-mono text-xs font-bold tracking-widest opacity-60 mb-2">🎬 MEDIA IDLE (LAYAR AWAL)</p><input id="mdFile" type="file" accept="image/*,video/*" class="op-input !p-2 text-xs"><p id="mdStatus" class="font-mono text-[10px] opacity-60 mt-2">Belum ada media — pakai tampilan default.</p><button id="mdDel" class="btn btn-press w-full mt-2 py-2 rounded-xl border-[3px] border-[var(--ink)] font-bold text-sm bg-[var(--surface)] shadow-[3px_3px_0_var(--ink)]">🗑 Hapus Media (kembali default)</button><p class="font-mono text-[9px] opacity-50 mt-2">Video/gambar promosi penyewa, tersimpan offline. Layar jadi bersih + 1 tombol kamera.</p>';
  pane.appendChild(box);
  $('#mdFile').addEventListener('change',async e=>{
    const f=e.target.files[0];e.target.value='';
    if(!f)return;
    if(f.size>60*1024*1024){showToast('⚠ Maksimal 60MB');return;}
    showToast('⏳ Menyimpan media…');
    try{await mPut({id:'idle',type:f.type,blob:f});await applyMedia();updateMdStatus();showToast('✅ Media idle terpasang!');}catch(err){showToast('⚠ Gagal menyimpan media');}
  });
  $('#mdDel').addEventListener('click',async()=>{await mDel();await applyMedia();updateMdStatus();showToast('🗑 Media dihapus — kembali default');});
  updateMdStatus();
}
async function updateMdStatus(){
  const st=$('#mdStatus');if(!st)return;
  const rec=await mGet();
  st.textContent=rec?('✅ Media aktif: '+(rec.type.indexOf('video')===0?'video':'gambar')+' ('+(Math.round(rec.blob.size/1024/1024*10)/10)+' MB)'):'Belum ada media — pakai tampilan default.';
}
new MutationObserver(()=>{if($('#opPanel').classList.contains('open'))injectMediaUI();}).observe($('#opPanel'),{attributes:true,attributeFilter:['class']});
injectMediaUI();
applyMedia();
})();