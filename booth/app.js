const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let toastTimer=null;
function showToast(m){const t=$('#toast');t.textContent=m;t.classList.add('toast-on');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('toast-on'),2600);}
let sessionTimers=[];
function later(fn,ms){const id=setTimeout(fn,ms);sessionTimers.push(id);return id;}
function clearSessionTimers(){sessionTimers.forEach(clearTimeout);sessionTimers=[];}
function applyTheme(t){const r=document.documentElement.style;r.setProperty('--bg',t.bg);r.setProperty('--surface',t.surface);r.setProperty('--ink',t.ink);r.setProperty('--accent',t.accent);r.setProperty('--accent2',t.accent2);r.setProperty('--shadow',t.shadow);r.setProperty('--soft',t.ink+'22');document.body.dataset.pattern=t.pattern;if($('#frameGrid')&&$('#frameGrid').children.length)buildFrameGrid();}
function refreshBrandUI(){$('#atBrand').innerHTML=settings.brand+'<span style="color:var(--accent)">.</span>';const box=$('#atLogoBox');box.innerHTML=settings.logo?`<img src="${settings.logo}" class="w-full h-full object-cover">`:'📸';$('#atPrice').textContent=rupiah(settings.price);$('#atPoses').textContent=settings.poses+' pose';$('#atPayMode').textContent=settings.payment.mode==='midtrans'?'Dinamis':'Statis';}
const state={screen:'attract',stream:null,camOK:false,busy:false,frames:[],mirror:true};
function go(name){clearSessionTimers();$$('.screen').forEach(s=>s.classList.remove('active'));$('#screen-'+name).classList.add('active');state.screen=name;if(name==='setup'){state.mirror=settings.mirror!==false;startCamera();applyPreviewFilter();applyMirror();buildFrameGrid();}else if(name!=='capture')stopCamera();}
function applyMirror(){const on=state.mirror;$('#setupVideo').classList.toggle('mirror',on);$('#captureVideo').classList.toggle('mirror',on);$('#mirrorOn').classList.toggle('on',on);$('#mirrorOff').classList.toggle('on',!on);}
async function startCamera(){try{if(!navigator.mediaDevices?.getUserMedia)throw 0;state.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:1280}},audio:false});state.camOK=true;['setupVideo','captureVideo'].forEach(id=>{const v=$('#'+id);v.srcObject=state.stream;v.play().catch(()=>{});});$('#setupVideo').classList.remove('hidden');$('#setupSim').classList.add('hidden');$('#setupNoCam').classList.add('hidden');$('#captureSim').classList.add('hidden');$('#camBadge').textContent='📷 LIVE';$('#camBadge').style.background='var(--accent2)';}catch(e){state.camOK=false;$('#setupVideo').classList.add('hidden');$('#setupNoCam').classList.remove('hidden');$('#captureSim').classList.remove('hidden');$('#setupSim').src=makeSimFrame(0).toDataURL();$('#setupSim').classList.remove('hidden');$('#camBadge').textContent='🎭 SIMULASI';$('#camBadge').style.background='var(--surface)';}}
function stopCamera(){if(state.stream){state.stream.getTracks().forEach(t=>t.stop());state.stream=null;}}
function snapFrame(){const v=$('#captureVideo'),FW=480,FH=360;const c=document.createElement('canvas');c.width=FW;c.height=FH;const ctx=c.getContext('2d');const vw=v.videoWidth||1280,vh=v.videoHeight||720,tr=FW/FH;let sw,sh,sx,sy;if(vw/vh>tr){sh=vh;sw=vh*tr;sx=(vw-sw)/2;sy=0}else{sw=vw;sh=vw/tr;sx=0;sy=(vh-sh)/2}ctx.filter=FILTER_CSS[settings.filter];if(state.mirror){ctx.translate(FW,0);ctx.scale(-1,1);}ctx.drawImage(v,sx,sy,sw,sh,0,0,FW,FH);return c;}
function makeSimFrame(i){const t=currentTheme(),FW=480,FH=360;const c=document.createElement('canvas');c.width=FW;c.height=FH;const ctx=c.getContext('2d');const g=ctx.createLinearGradient(0,0,FW,FH);g.addColorStop(0,t.accent);g.addColorStop(1,t.accent2);ctx.fillStyle=g;ctx.fillRect(0,0,FW,FH);for(let d=0;d<42;d++){ctx.fillStyle=['rgba(255,255,255,.85)','rgba(0,0,0,.25)','rgba(255,255,255,.5)'][d%3];ctx.beginPath();ctx.arc(Math.random()*FW,Math.random()*FH,2+Math.random()*4,0,Math.PI*2);ctx.fill();}const faces=[['😜','😎',''],['','😆',''],['🥳','😜',''],['😎','','🤪']][i%4];const spots=[[120,160],[240,130],[360,170]];ctx.textAlign='center';ctx.textBaseline='middle';faces.forEach((f,k)=>{ctx.save();ctx.translate(spots[k][0],spots[k][1]);ctx.rotate((k-1)*.12);ctx.font='92px serif';ctx.fillText(f,0,0);ctx.restore();});ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(14,FH-38,128,26);ctx.fillStyle='#fff';ctx.font='700 13px "Space Mono",monospace';ctx.textAlign='left';ctx.fillText('SIMULASI '+(i+1)+'/'+settings.poses,22,FH-24);return c;}
function buildFrameGrid(){
  const g=$('#frameGrid');g.innerHTML='';
  const mk=(key,label,icon)=>{const b=document.createElement('button');b.className='frame-card btn border-[3px] border-[var(--ink)] rounded-xl p-1.5 bg-[var(--surface)]'+(key===settings.frame?' on':'');const prev=renderStrip(placeholderFrames(),key,.24);prev.className='w-full rounded-md pointer-events-none';b.appendChild(prev);const lab=document.createElement('p');lab.className='text-[11px] font-bold mt-1 truncate pointer-events-none';lab.textContent=icon+' '+label;b.appendChild(lab);b.addEventListener('click',()=>{settings.frame=key;$$('.frame-card').forEach(x=>x.classList.remove('on'));b.classList.add('on');showToast('🖼 Frame '+label+' dipilih!');});g.appendChild(b);};
  Object.keys(FRAMES).forEach(k=>mk(k,FRAMES[k].label,FRAMES[k].icon));
  (settings.customFrames||[]).forEach(cf=>mk('custom:'+cf.id,cf.name,cf.type==='bg'?'🖼':'✨'));
}
function buildFilterGrid(){const g=$('#filterGrid');g.innerHTML='';Object.entries(FILTERS).forEach(([k,label])=>{const b=document.createElement('button');b.className='chip-f btn border-[3px] border-[var(--ink)] rounded-xl py-3 font-bold text-sm bg-[var(--surface)]'+(k===settings.filter?' on':'');b.textContent=label;b.addEventListener('click',()=>{settings.filter=k;$$('.chip-f').forEach(x=>x.classList.remove('on'));b.classList.add('on');applyPreviewFilter();});g.appendChild(b);});}
function applyPreviewFilter(){const css=FILTER_CSS[settings.filter];$('#setupVideo').style.filter=css;$('#captureVideo').style.filter=css;$('#setupSim').style.filter=css;}
function buildMidtransPayload(){const m=settings.payment.midtrans;const orderId='MB-'+Date.now().toString(36).toUpperCase();return 'MIDTRANS-QRIS|'+(m.merchantId||'MERCHANT')+'|'+orderId+'|'+settings.price+'|'+m.environment;}
function setPayStatus(html){$('#payStatus').innerHTML=html;}
function startPayment(){
  go('payment');
  $('#payPrice').textContent=rupiah(settings.price);
  $('#payDone').classList.add('hidden');$('#payDoneStatic').classList.add('hidden');$('#payConfirmBtn').classList.add('hidden');
  const pm=settings.payment.mode;
  if(pm==='midtrans'){
    const env=settings.payment.midtrans.environment;
    $('#payModeTag').textContent='⚡ QRIS DINAMIS — MIDTRANS'+(env==='sandbox'?' (SANDBOX)':'');
    $('#paySimBadge').textContent='SIMULASI WEBHOOK';
    $('#payDynamicWrap').classList.remove('hidden');$('#payStaticWrap').classList.add('hidden');
    try{new QRious({element:$('#qrCanvas'),value:buildMidtransPayload(),size:230,background:'#fff',foreground:'#111',level:'M'});}catch(e){}
    setPayStatus('<span class="w-2.5 h-2.5 rounded-full blink" style="background:var(--accent2)"></span> Menunggu pembayaran (webhook)…');
    later(()=>paymentSuccess(),6000);
  } else {
    $('#payModeTag').textContent='🖼 QRIS STATIS';
    $('#paySimBadge').textContent='MODE LITE';
    $('#payStaticWrap').classList.remove('hidden');$('#payDynamicWrap').classList.add('hidden');
    if(settings.payment.staticQris){$('#payStaticImg').src=settings.payment.staticQris;$('#payStaticImg').classList.remove('hidden');$('#payStaticPlaceholder').classList.add('hidden');}
    else{$('#payStaticImg').classList.add('hidden');$('#payStaticPlaceholder').classList.remove('hidden');}
    if(settings.payment.verification==='manual'){$('#payConfirmBtn').classList.remove('hidden');setPayStatus('📲 Scan & bayar, lalu tekan tombol di bawah');}
    else{let left=settings.payment.timerSeconds;setPayStatus('⏱ Verifikasi otomatis dalam <b id="payTimer">'+left+'</b> dtk…');later(function tick(){left--;const el=$('#payTimer');if(el)el.textContent=Math.max(left,0);if(left<=0){paymentSuccess();return;}later(tick,1000);},1000);}
  }
}
function paymentSuccess(){if(settings.payment.mode==='midtrans')$('#payDone').classList.remove('hidden');else $('#payDoneStatic').classList.remove('hidden');setPayStatus('✅ Pembayaran terkonfirmasi');later(()=>go('setup'),1100);}
$('#btnStart').addEventListener('click',startPayment);
$('#btnCancelPay').addEventListener('click',()=>go('attract'));
$('#payConfirmBtn').addEventListener('click',()=>paymentSuccess());
$('#mirrorOn').addEventListener('click',()=>{state.mirror=true;applyMirror();});
$('#mirrorOff').addEventListener('click',()=>{state.mirror=false;applyMirror();});
$('#btnBackPay').addEventListener('click',()=>go('attract'));
$('#btnBeginCapture').addEventListener('click',()=>{go('capture');runCapture();});
$('#btnChangeStyle').addEventListener('click',()=>go('setup'));
function renderDots(){const d=$('#dots');d.innerHTML='';for(let i=0;i<settings.poses;i++){const s=document.createElement('span');s.className='w-3.5 h-3.5 rounded-full border-2 border-white/70 bg-white/25';d.appendChild(s);}}
function markDot(i){const d=$('#dots').children[i];if(d){d.className='w-3.5 h-3.5 rounded-full border-2 border-white';d.style.background='var(--accent2)';}}
function showCount(n){const w=$('#cdWrap'),num=$('#cdNum');w.classList.remove('hidden');num.textContent=n;num.classList.remove('count-pop');void num.offsetWidth;num.classList.add('count-pop');}
function doFlash(){const f=$('#flash');f.classList.remove('flash-on');void f.offsetWidth;f.classList.add('flash-on');}
async function runCapture(){
  if(state.busy)return;state.busy=true;state.frames=[];renderDots();
  const hints=['Bersiap… 👀','Gaya terbaikmu! ✌️','Satu lagi! 🎉','Terakhir! 😄'];
  for(let i=0;i<settings.poses;i++){$('#poseTag').textContent='Pose '+(i+1)+'/'+settings.poses;$('#captureHint').textContent=hints[i%hints.length];for(let n=3;n>=1;n--){showCount(n);await sleep(780);}doFlash();await sleep(170);state.frames.push(state.camOK?snapFrame():makeSimFrame(i));markDot(i);await sleep(430);}
  $('#cdWrap').classList.add('hidden');
  $('#previewStrip').src=composeStrip(state.frames).toDataURL('image/png');
  $('#frameCaption').textContent='Frame '+(settings.frame.startsWith('custom:')?((settings.customFrames||[]).find(f=>'custom:'+f.id===settings.frame)||{}).name||'Custom':FRAMES[settings.frame].label)+' • Filter '+FILTERS[settings.filter];
  state.busy=false;go('preview');
                      }
$('#btnRetake').addEventListener('click',()=>{showToast('🔄 Retake gratis — silakan foto ulang!');go('capture');runCapture();});
$('#btnPrint').addEventListener('click',()=>{
  go('print');
  const img=$('#printStripImg');img.src=$('#previewStrip').src;img.classList.remove('print-anim');void img.offsetWidth;img.classList.add('print-anim');
  const bar=$('#printBar');let p=5;bar.style.width='5%';
  $('#printTitle').textContent='Mencetak strip kamu…';$('#printStatus').textContent='Mengirim data ke EP-80ECO via Bluetooth…';
  const iv=setInterval(()=>{p=Math.min(p+7,100);bar.style.width=p+'%';if(p>=60)$('#printStatus').textContent='Mencetak di kertas thermal 80mm…';if(p>=100){clearInterval(iv);$('#printTitle').textContent='Strip siap! ✂️';$('#printStatus').textContent='Ambil fotonya di slot printer.';later(()=>{go('share');setupShare();},1400);}},260);
});
function setupShare(){const code=Math.random().toString(36).slice(2,6).toUpperCase();$('#galleryCode').textContent=code;try{new QRious({element:$('#shareQr'),value:'https://boothin.id/g/'+code,size:200,background:'#fff',foreground:'#111',level:'M'});}catch(e){}let left=20;$('#shareCount').textContent=left;later(function tick(){left--;$('#shareCount').textContent=Math.max(left,0);if(left<=0){finishSession();return;}later(tick,1000);},1000);}
$$('.shareOpt').forEach(b=>b.addEventListener('click',()=>{showToast(b.dataset.k==='wa'?'💬 Link galeri dikirim via WhatsApp (simulasi).':'✉️ Link galeri dikirim via email (simulasi).');}));
$('#btnFinish').addEventListener('click',finishSession);
function finishSession(){stopCamera();state.frames=[];go('attract');showToast('👋 Sampai jumpa! Terima kasih sudah berfoto.');}
function buildThemeGrid(){const g=$('#themeGrid');g.innerHTML='';Object.entries(THEMES).forEach(([k,t])=>{const b=document.createElement('button');b.className='theme-dot btn'+(k===settings.themeKey&&!settings.accent?' on':'');b.title=t.label;b.innerHTML=`<span class="absolute inset-0" style="background:${t.bg}"></span><span class="absolute left-1 top-1 w-3 h-3 rounded-full" style="background:${t.accent}"></span><span class="absolute left-1 bottom-1 w-3 h-3 rounded-full" style="background:${t.accent2}"></span><span class="absolute inset-x-0 bottom-0 text-[9px] font-bold py-0.5" style="background:${t.ink};color:${t.bg}">${t.label}</span>`;b.addEventListener('click',()=>{settings.themeKey=k;settings.accent=null;applyTheme(currentTheme());buildThemeGrid();});g.appendChild(b);});}

/* ═══ Frame Studio ═══ */
let fsType='overlay';
$('#fsTypeBg').addEventListener('click',()=>{fsType='bg';$('#fsTypeBg').classList.add('on');$('#fsTypeOverlay').classList.remove('on');});
$('#fsTypeOverlay').addEventListener('click',()=>{fsType='overlay';$('#fsTypeOverlay').classList.add('on');$('#fsTypeBg').classList.remove('on');});
$('#fsDrop').addEventListener('click',()=>$('#fsFile').click());
['dragover','dragenter'].forEach(ev=>$('#fsDrop').addEventListener(ev,e=>{e.preventDefault();$('#fsDrop').classList.add('drag');}));
['dragleave','drop'].forEach(ev=>$('#fsDrop').addEventListener(ev,e=>{e.preventDefault();$('#fsDrop').classList.remove('drag');}));
$('#fsDrop').addEventListener('drop',e=>{const f=e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files[0];if(f)handleFsFile(f);});
$('#fsFile').addEventListener('change',e=>{const f=e.target.files[0];if(f)handleFsFile(f);e.target.value='';});
async function handleFsFile(f){
  if(!f.type.startsWith('image/')){showToast('⚠️ File harus berupa gambar');return;}
  showToast('⏳ Menyimpan frame…');
  try{const rec=await addCustomFrame(f,fsType);saveSettings();buildFrameGrid();renderFsList();showToast('✅ Frame "'+rec.name+'" tersimpan offline!');}
  catch(e){showToast('⚠️ Gagal menyimpan frame');}
}
async function renderFsList(){
  const list=$('#fsList');list.innerHTML='';
  const recs=await idbAll();
  $('#fsCount').textContent=recs.length;
  if(!recs.length){list.innerHTML='<p class="font-mono text-[10px] opacity-50 text-center py-2">Belum ada frame custom.</p>';return;}
  recs.forEach(r=>{
    const row=document.createElement('div');row.className='fs-item';
    row.innerHTML=`<img class="fs-thumb ${r.type==='overlay'?'fs-thumb-overlay':''}" src="${r.dataUrl}" alt=""><div class="flex-1 min-w-0"><p class="font-bold text-xs truncate">${r.name}</p><span class="fs-tag">${r.type==='bg'?'LATAR':'OVERLAY'} • LOKAL</span></div><button class="fs-delete" title="Hapus">🗑</button>`;
    row.querySelector('.fs-delete').addEventListener('click',async()=>{await deleteCustomFrame(r.id);saveSettings();buildFrameGrid();renderFsList();showToast('🗑 Frame dihapus');});
    list.appendChild(row);
  });
}

/* ═══ Status jaringan (online/offline) ═══ */
function updateNetBadge(){const on=navigator.onLine;const b=$('#statusBadge');if(!b)return;b.classList.toggle('offline',!on);b.classList.toggle('online',on);$('#statusText').textContent=on?'ONLINE':'OFFLINE';}
window.addEventListener('online',()=>{updateNetBadge();showToast('🟢 Koneksi kembali — online');});
window.addEventListener('offline',()=>{updateNetBadge();showToast('🔴 Offline — frame lokal tetap aktif');});

/* ═══ Tab panel operator ═══ */
$$('.op-tab').forEach(t=>t.addEventListener('click',()=>{$$('.op-tab').forEach(x=>x.classList.remove('on'));t.classList.add('on');$$('.op-pane').forEach(p=>p.classList.remove('on'));const p=$('#'+t.dataset.pane);if(p)p.classList.add('on');}));

/* ═══ UI mode pembayaran ═══ */
function togglePayModeUI(){const m=settings.payment.mode;$('#pmStatic').classList.toggle('on',m==='static');$('#pmMidtrans').classList.toggle('on',m==='midtrans');$('#optsStatic').classList.toggle('hidden',m!=='static');$('#optsMidtrans').classList.toggle('hidden',m!=='midtrans');}
function renderVerifUI(){const v=settings.payment.verification;$('#verifTimer').classList.toggle('on',v==='timer');$('#verifManual').classList.toggle('on',v==='manual');$('#timerOpts').classList.toggle('hidden',v!=='timer');}
function renderEnvUI(){const e=settings.payment.midtrans.environment;$('#envSandbox').classList.toggle('on',e==='sandbox');$('#envProd').classList.toggle('on',e==='production');}
function renderPaymentControls(){togglePayModeUI();renderVerifUI();renderEnvUI();$('#opMerchantId').value=settings.payment.midtrans.merchantId;$('#opClientId').value=settings.payment.midtrans.clientId;$('#opServerKey').value=settings.payment.midtrans.serverKey;$('#opTimerSec').value=settings.payment.timerSeconds;if(settings.payment.staticQris){$('#opQrisPreview').src=settings.payment.staticQris;$('#opQrisPreview').classList.remove('hidden');$('#opQrisEmpty').classList.add('hidden');}else{$('#opQrisPreview').classList.add('hidden');$('#opQrisEmpty').classList.remove('hidden');}}
$('#pmStatic').addEventListener('click',()=>{settings.payment.mode='static';togglePayModeUI();});
$('#pmMidtrans').addEventListener('click',()=>{settings.payment.mode='midtrans';togglePayModeUI();});
$('#verifTimer').addEventListener('click',()=>{settings.payment.verification='timer';renderVerifUI();});
$('#verifManual').addEventListener('click',()=>{settings.payment.verification='manual';renderVerifUI();});
$('#envSandbox').addEventListener('click',()=>{settings.payment.midtrans.environment='sandbox';renderEnvUI();});
$('#envProd').addEventListener('click',()=>{settings.payment.midtrans.environment='production';renderEnvUI();});
$('#opQrisFile').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{settings.payment.staticQris=rd.result;$('#opQrisPreview').src=rd.result;$('#opQrisPreview').classList.remove('hidden');$('#opQrisEmpty').classList.add('hidden');showToast('🖼 QRIS statis terpasang!');};rd.readAsDataURL(f);});
$('#opTestMt').addEventListener('click',()=>{const mid=$('#opMerchantId').value.trim();if(!mid){showToast('⚠️ Isi Merchant ID dulu');return;}showToast('🔌 Terhubung ke Midtrans ('+settings.payment.midtrans.environment+') — simulasi sukses');});
$('#opToggle').addEventListener('click',()=>{$('#opPanel').classList.add('open');buildThemeGrid();renderPaymentControls();renderFsList();$('#opBrand').value=settings.brand;$('#opPrice').value=settings.price;$('#opPoses').value=settings.poses;$('#opMirror').value=settings.mirror!==false?'1':'0';if(settings.accent)$('#opColor').value=settings.accent;});
$('#opClose').addEventListener('click',()=>$('#opPanel').classList.remove('open'));
$('#opApplyColor').addEventListener('click',()=>{settings.accent=$('#opColor').value;applyTheme(currentTheme());buildThemeGrid();showToast('🎨 Warna utama diterapkan — frame ikut berubah!');});
$('#opLogo').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{settings.logo=rd.result;refreshBrandUI();showToast('🖼 Logo dipasang!');};rd.readAsDataURL(f);});
$('#opSave').addEventListener('click',()=>{
  settings.brand=$('#opBrand').value.trim()||'Boothin';
  settings.price=Math.max(1000,parseInt($('#opPrice').value)||15000);
  settings.poses=parseInt($('#opPoses').value)||3;
  settings.mirror=$('#opMirror').value==='1';
  settings.payment.timerSeconds=Math.max(5,parseInt($('#opTimerSec').value)||15);
  settings.payment.midtrans.merchantId=$('#opMerchantId').value.trim();
  settings.payment.midtrans.clientId=$('#opClientId').value.trim();
  settings.payment.midtrans.serverKey=$('#opServerKey').value.trim();
  saveSettings();refreshBrandUI();
  $('#opPanel').classList.remove('open');
  showToast('💾 Pengaturan tersimpan & diterapkan!');
});

/* ═══ INIT ═══ */
loadSettings();
if(settings.mirror===undefined)settings.mirror=true;
state.mirror=settings.mirror!==false;
applyTheme(currentTheme());
refreshBrandUI();
buildFilterGrid();
updateNetBadge();
loadCustomFrames().then(()=>{buildFrameGrid();renderFsList();}).catch(()=>{buildFrameGrid();renderFsList();});
if(document.fonts&&document.fonts.load){document.fonts.load('800 26px "Bricolage Grotesque"');document.fonts.load('700 12px "Space Mono"');}
