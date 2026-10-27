/* ═══════════════════════════════════════════════════════════════════════
   EXCEL अभिलेख — एक पटक फाइल बनाउनुहोस्, त्यसपछि आफैं थपिन्छ
   ───────────────────────────────────────────────────────────────────────
   • चोरी (chori) र मिटर बदली (meter) — **छुट्टाछुट्टै टेम्प्लेट, छुट्टै लिंक
     गरिएको फाइल, छुट्टै रेकर्ड भण्डार**। मिटर बदलीको डेटा कहिल्यै विद्युत
     चोरी प्रतिवेदन (Energy_Theft_Report_Template.xlsx) मा मिसिँदैन —
     आफ्नै छुट्टै फाइल (Meter_Badali_Report_Template.xlsx → "METER BADALI"
     पाना) मा जान्छ।
   • पहिलो "Save to Excel": कम्प्युटरमा कहाँ राख्ने सोध्छ → खाली टेम्प्लेटबाट
     नयाँ फाइल बनाउँछ र त्यही पहिलो रेकर्ड भर्छ (पुराना सबै रेकर्ड मेटिन्छन् —
     फाइल सफा शून्यबाट सुरु हुन्छ)।
   • त्यसपछि हरेक "Save to Excel": फेरि केही नसोधी त्यही फाइलमा आफैं थपिन्छ।
   • चोरी : मिति हेरेर सही महिनाको पानामा पर्छ (2082/04/xx → SHRAWAN,
     2082/05/xx → BHADRA …); S.N. आफैं क्रमैसँग बढ्छ।
   • मिटर बदली : सधैं "METER BADALI" एउटै पानामा (महिना छुट्याइँदैन)।
   • फाइल हरेक पटक सफा टेम्प्लेटबाट पूरै पुनर्लेखन हुन्छ — त्यसैले दोहोरो
     पंक्ति कहिल्यै पर्दैन र सूत्र/ढाँचा सधैं सग्लो रहन्छ।
   • लिंक IndexedDB मा रहन्छ, पेज रिफ्रेस भए पनि सम्झन्छ।
   • FSA नभएको ब्राउजर (मोबाइल/Safari): हरेक Save मा अद्यावधिक फाइल डाउनलोड।
   ═══════════════════════════════════════════════════════════════════════ */
window.LocalExcelSave=(function(S){
'use strict';
const pad2=S.pad2;

/* ── प्रकार (kind) अनुसार छुट्टाछुट्टै सेटिङ — 'chori' | 'meter' ── */
const KINDS={
 chori:{
  recordsKey:'nb_excel_records_v1',
  handleMeta:'nb_local_excel_handle_v1',
  idbKey:'report',
  templateUrl:'assets/Energy_Theft_Report_Template.xlsx',
  suggestedName:'Energy_Theft_Report.xlsx',
 },
 meter:{
  recordsKey:'nb_excel_records_v1_meter',
  handleMeta:'nb_local_excel_handle_v1_meter',
  idbKey:'report_meter',
  templateUrl:'assets/Meter_Badali_Report_Template.xlsx',
  suggestedName:'Meter_Badali_Report.xlsx',
 },
 chhutbill:{
  recordsKey:'nb_excel_records_v1_chhutbill',
  handleMeta:'nb_local_excel_handle_v1_chhutbill',
  idbKey:'report_chhutbill',
  templateUrl:'assets/Chhut_Bill_Report_Template.xlsx',
  suggestedName:'Chhut_Bill_Report.xlsx',
 },
};
/* kind-अनुसार runtime अवस्था (fileHandle आदि) — दुवै प्रकार सँगसँगै, स्वतन्त्र रूपमा चल्छन् */
const RT={};
function rt(kind){if(!RT[kind])RT[kind]={fileHandle:null,syncing:false,syncQueued:false};return RT[kind];}

/* चोरी टेम्प्लेटका मासिक पाना (डेटा पंक्ति 6 देखि) */
const MONTH_SHEETS=['','BAISAKH','JESTHA','ASAAD','SHRAWAN','BHADRA','ASOJ',
                     'KARTIK','MANGSIR','POUSH','MAGH','FALGUN','CHAITRA'];
/* मिटर बदली टेम्प्लेटका मासिक पाना (डेटा पंक्ति 8 देखि — header 5–6 मा) */
const MB_MONTH_SHEETS=['','BAISHAKH','JESTH','ASAR','SHRAWAN','BHADRA','ASHOJ',
                     'KARTIK','MANSIR','POUSH','MAGH','FALGUN','CHAITRA'];
const MB_NEP=['','बैशाख','जेठ','असार','साउन','भदौ','असोज','कार्तिक','मंसिर','पुष','माघ','फाल्गुन','चैत्र'];
const START_ROW={chori:6,meter:8,chhutbill:11};

function hasAccess(){return typeof window.showSaveFilePicker!=='undefined';}

/* ── IndexedDB: फाइल-ह्यान्डल सम्झने (एउटै store, kind-अनुसार फरक-फरक key) ── */
const IDB_NAME='nb_excel_handles', IDB_STORE='handles';
function idbOpen(){
 return new Promise((res,rej)=>{
  const req=indexedDB.open(IDB_NAME,1);
  req.onupgradeneeded=()=>{req.result.createObjectStore(IDB_STORE);};
  req.onsuccess=()=>res(req.result);
  req.onerror=()=>rej(req.error);
 });
}
async function idbPut(kind,v){
 try{const db=await idbOpen();
  await new Promise((res,rej)=>{const tx=db.transaction(IDB_STORE,'readwrite');
   tx.objectStore(IDB_STORE).put(v,KINDS[kind].idbKey);tx.oncomplete=res;tx.onerror=()=>rej(tx.error);});
 }catch(e){}
}
async function idbGet(kind){
 try{const db=await idbOpen();
  return await new Promise((res,rej)=>{const tx=db.transaction(IDB_STORE,'readonly');
   const r=tx.objectStore(IDB_STORE).get(KINDS[kind].idbKey);
   r.onsuccess=()=>res(r.result||null);r.onerror=()=>rej(r.error);});
 }catch(e){return null;}
}
async function idbClear(kind){
 try{const db=await idbOpen();
  await new Promise((res,rej)=>{const tx=db.transaction(IDB_STORE,'readwrite');
   tx.objectStore(IDB_STORE).delete(KINDS[kind].idbKey);tx.oncomplete=res;tx.onerror=()=>rej(tx.error);});
 }catch(e){}
}

/* अघि लिंक गरिएको फाइल चुपचाप फिर्ता ल्याउने */
async function tryRestoreHandle(kind){
 const S_=rt(kind);
 if(S_.fileHandle)return true;
 if(!hasAccess())return false;
 const h=await idbGet(kind);
 if(!h)return false;
 try{
  let p=await h.queryPermission({mode:'readwrite'});
  if(p!=='granted')p=await h.requestPermission({mode:'readwrite'});
  if(p!=='granted')return false;
  S_.fileHandle=h;return true;
 }catch(e){return false;}
}

/* ── मिति ── */
function dateParts(v){
 const s=String(v||'').trim();
 const m=s.match(/^(\d{4})\D(\d{1,2})(?:\D(\d{1,2}))?/);
 if(!m)return null;
 return {y:+m[1],m:+m[2],d:m[3]?+m[3]:1};
}
function slashDate(v){
 const p=dateParts(v);
 if(!p)return String(v||'');
 return p.y+'/'+pad2(p.m)+'/'+pad2(p.d);
}

/* ── रेकर्ड भण्डार (kind-अनुसार छुट्टै सूची) ── */
function loadRecords(kind){const r=S.loadJSON(KINDS[kind].recordsKey);return Array.isArray(r)?r:[];}
function saveRecords(kind,l){S.saveJSON(KINDS[kind].recordsKey,l);}
function recordCount(kind){return loadRecords(kind).length;}
function clearRecords(kind){S.saveJSON(KINDS[kind].recordsKey,[]);}

function recSig(r){
 return [r.type,slashDate(r.date),(r.name||'').trim().toUpperCase(),
         (r.cid||'').toString().trim(),r.unit||0,r.amount||0].join('|');
}
function addRecord(kind,rec){
 const list=loadRecords(kind);
 const sig=recSig(rec);
 if(list.some(x=>recSig(x)===sig))return {dup:true,count:list.length};
 rec.savedAt=new Date().toISOString();
 list.push(rec);saveRecords(kind,list);
 return {dup:false,count:list.length};
}

/* ── पंक्ति लेख्ने ──
   chori   → मासिक पाना (SHRAWAN...): A-I = S.N./DATE/NAME/ID/THEFT UNIT/THEFT AMOUNT/100% AMOUNT/OTHERS/REASON
   meter   → मासिक पाना (BAISHAKH…CHAITRA), पंक्ति 8 देखि, टेम्प्लेटकै A–Q ढाँचा:
     A S.N. · B DATE OF METER CHANGE · C CONSUMER NAME · D ID · E ADDRESS ·
     F METER TYPE (1Ф/3Ф) · G OLD METER Sr.No · H OLD METER LAST READING ·
     I NEW METER Sr.No · J NEW METER INITIAL READING · K RECOVERED UNIT ·
     L RECOVERED AMOUNT · M 100% COMPENSATION · N CAUSE OF METER CHANGE ·
     O PAID OR UNPAID · P ANIYEMITTA · Q REMARK */
function fillRow(ws,rowNo,sn,rec){
 const row=ws.getRow(rowNo);
 if(rec.type==='chhutbill'){
  row.getCell(1).value=sn;
  row.getCell(2).value=slashDate(rec.date)||'';
  row.getCell(3).value=rec.name||'';
  row.getCell(4).value=rec.cid||'';
  row.getCell(5).value=rec.cno||'';
  row.getCell(6).value=rec.meterType||'Single Phase';
  row.getCell(7).value=rec.oldCat||'';
  row.getCell(8).value=rec.newCat||'';
  row.getCell(9).value=rec.unit||0;
  row.getCell(10).value=rec.amount||0;
  row.getCell(11).value=rec.remark||'';
  row.commit&&row.commit();
  return;
 }
 row.getCell(1).value=sn;
 row.getCell(2).value=slashDate(rec.date)||'';
 row.getCell(3).value=rec.name||'';
 row.getCell(4).value=rec.cid||'';
 if(rec.type==='meter'){
  row.getCell(5).value=rec.address||'';
  row.getCell(6).value=rec.phase||'1';
  row.getCell(7).value=rec.oldMeter||'';
  row.getCell(8).value=rec.lastReading||0;
  row.getCell(9).value=rec.newMeter||'';
  row.getCell(10).value=rec.initReading||0;
  row.getCell(11).value=rec.unit||0;
  row.getCell(12).value=rec.amount||0;
  row.getCell(13).value=rec.comp100||0;
  row.getCell(14).value=rec.cause||'';
  row.getCell(15).value=rec.paid||'';
  row.getCell(16).value=rec.aniyemitta||'';
  row.getCell(17).value=rec.remark||'';
 }else{
  row.getCell(5).value=rec.unit||0;
  row.getCell(6).value=rec.amount||0;
  row.getCell(7).value=rec.amt100||0;
  row.getCell(8).value=rec.others||0;
  row.getCell(9).value=rec.reason||'';
 }
 row.commit&&row.commit();
}

/* सफा टेम्प्लेट (kind-अनुसार फरक फाइल) + त्यही kind का सबै रेकर्ड → पूरा प्रतिवेदन */
async function buildReportBuffer(kind){
 const ExcelJS=window.ExcelJS;
 if(!ExcelJS)throw new Error('ExcelJS लोड भएन');
 const cfg=KINDS[kind];
 const resp=await fetch(cfg.templateUrl);
 if(!resp.ok)throw new Error('टेम्प्लेट भेटिएन ('+resp.status+')');
 const wb=new ExcelJS.Workbook();
 await wb.xlsx.load(await resp.arrayBuffer());

 const list=loadRecords(kind).slice().sort((a,b)=>
   slashDate(a.date).localeCompare(slashDate(b.date)));

 const nextRow={},nextSn={};
 const start=START_ROW[kind]||6;
 const sheets=kind==='meter'?MB_MONTH_SHEETS:MONTH_SHEETS;
 list.forEach(rec=>{
  let ws=null;
  if(kind==='chhutbill'){
   ws=wb.getWorksheet('CHHUT BILL');
  }else{
   const p=dateParts(rec.date);
   if(p&&sheets[p.m])ws=wb.getWorksheet(sheets[p.m]);
  }
  if(!ws)ws=wb.worksheets[0];
  if(!ws)return;
  const k=ws.name;
  if(nextRow[k]===undefined){nextRow[k]=start;nextSn[k]=1;}
  fillRow(ws,nextRow[k],nextSn[k],rec);
  nextRow[k]++;nextSn[k]++;
 });
 return {buf:await wb.xlsx.writeBuffer(),count:list.length};
}

function downloadBuf(buf,name){
 const blob=new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
 const url=URL.createObjectURL(blob);
 const a=document.createElement('a');
 a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),4000);
}

/* लिंक गरिएको फाइलमा पूरै लेख्ने (आफैं — क्लिक चाहिँदैन, डाउनलोड हुँदैन) */
async function syncToFile(kind){
 const S_=rt(kind);
 if(S_.syncing){S_.syncQueued=true;return {ok:true,queued:true};}
 S_.syncing=true;
 try{
  if(!S_.fileHandle)return {ok:false,err:'फाइल लिंक भएको छैन',noHandle:true};

  // अनुमति: पहिले query — पहिले नै दिइएको भए फेरि नसोध्ने (हरेक Save मा
  // requestPermission गर्दा बारम्बार प्रम्प्ट आउँथ्यो)
  let perm=await S_.fileHandle.queryPermission({mode:'readwrite'});
  if(perm!=='granted')perm=await S_.fileHandle.requestPermission({mode:'readwrite'});
  if(perm!=='granted')return {ok:false,err:'फाइल लेख्ने अनुमति दिइएन'};

  const {buf,count}=await buildReportBuffer(kind);
  const w=await S_.fileHandle.createWritable();
  await w.write(buf);await w.close();
  return {ok:true,count:count,name:S_.fileHandle.name};
 }catch(e){
  console.error('sync error:',e);
  return {ok:false,err:e.name+' — '+e.message};
 }finally{
  S_.syncing=false;
  if(S_.syncQueued){S_.syncQueued=false;syncToFile(kind);}
 }
}

/* ═══════════════════════════════════════════════════════════════════
   साप्ताहिक / मासिक / वार्षिक प्रतिवेदन
   ───────────────────────────────────────────────────────────────────
   टेम्प्लेटकै A–R ढाँचामा, तर छानिएको अवधिका रेकर्ड मात्र। नेपाली पात्रोमा
   महिनाको दिन गणना फरक-फरक (29–32) हुने भएकाले "हप्ता" गते अनुसार
   बाँडिन्छ : 1–7, 8–14, 15–21, 22–अन्त्य (हप्ता 4 मा बाँकी सबै)।
   ═══════════════════════════════════════════════════════════════════ */
const RPT_HDR=['S.N.','DATE OF METER CHANGE','CONSUMER NAME','ID','ADDRESS',
 'METER TYPE (1Ф/3Ф)','OLD METER Sr.No','OLD METER LAST READING',
 'NEW METER Sr.No','NEW METER INITIAL READING','RECOVERED UNIT',
 'RECOVERED AMOUNT','100% COMPENSATION','CAUSE OF METER CHANGE',
 'PAID OR UNPAID','ANIYEMITTA','REMARK'];
const RPT_COLS=17;
function weekOf(day){return day<=7?1:day<=14?2:day<=21?3:4;}
function recsInPeriod(kind,period,y,m,w){
 return loadRecords(kind).filter(r=>{
  const p=dateParts(r.date);if(!p)return false;
  if(+p.y!==+y)return false;
  if(period==='annual')return true;
  if(+p.m!==+m)return false;
  if(period==='monthly')return true;
  return weekOf(+p.d)===+w;                       // weekly
 }).sort((a,b)=>slashDate(a.date).localeCompare(slashDate(b.date)));
}
function periodTitle(period,y,m,w){
 if(period==='annual')return 'वार्षिक प्रतिवेदन — आ.व. '+y;
 if(period==='monthly')return 'मासिक प्रतिवेदन — '+MB_NEP[m]+' '+y;
 const rng=['1–7','8–14','15–21','22–मसान्त'][w-1]||'';
 return 'साप्ताहिक प्रतिवेदन — '+MB_NEP[m]+' '+y+' (गते '+rng+')';
}
async function buildPeriodReport(kind,period,y,m,w){
 const ExcelJS=window.ExcelJS;
 if(!ExcelJS)throw new Error('ExcelJS लोड भएन');
 const recs=recsInPeriod(kind,period,y,m,w);
 const wb=new ExcelJS.Workbook();
 const ws=wb.addWorksheet('REPORT');
 const title=periodTitle(period,y,m,w);

 ws.mergeCells(1,1,1,RPT_COLS);ws.getCell('A1').value='Nepal Electricity Authority';
 ws.mergeCells(2,1,2,RPT_COLS);ws.getCell('A2').value='Taulihawa Distribution Center';
 ws.mergeCells(3,1,3,RPT_COLS);ws.getCell('A3').value=title;
 [1,2,3].forEach(r=>{const c=ws.getCell(r,1);c.font={bold:true,size:r===3?12:14};
  c.alignment={horizontal:'center',vertical:'middle'};});

 const hdr=ws.getRow(5);
 RPT_HDR.forEach((h,i)=>{const c=hdr.getCell(i+1);c.value=h;
  c.font={bold:true};c.alignment={horizontal:'center',vertical:'middle',wrapText:true};
  c.border={top:{style:'thin'},left:{style:'thin'},bottom:{style:'thin'},right:{style:'thin'}};});
 hdr.height=38;

 let r=6,sn=1;
 recs.forEach(rec=>{fillRow(ws,r,sn,rec);
  for(let c=1;c<=RPT_COLS;c++)ws.getCell(r,c).border={top:{style:'thin'},left:{style:'thin'},bottom:{style:'thin'},right:{style:'thin'}};
  r++;sn++;});

 // जोड — संख्यात्मक स्तम्भ (K,L,M,Q)
 if(recs.length){
  const t=ws.getRow(r);
  t.getCell(1).value='जम्मा';t.getCell(1).font={bold:true};
  [11,12,13].forEach(c=>{
   t.getCell(c).value={formula:`SUM(${String.fromCharCode(64+c)}6:${String.fromCharCode(64+c)}${r-1})`};
   t.getCell(c).font={bold:true};});
  for(let c=1;c<=RPT_COLS;c++)ws.getCell(r,c).border={top:{style:'double'},left:{style:'thin'},bottom:{style:'thin'},right:{style:'thin'}};
 }else{
  ws.getCell(r,1).value='यस अवधिमा कुनै रेकर्ड छैन।';
 }

 const W=[6,14,22,10,20,10,14,14,14,14,12,14,14,18,12,12,26];
 ws.columns.forEach((c,i)=>{c.width=W[i]||14;});
 ws.views=[{state:'frozen',ySplit:5}];
 return {buf:await wb.xlsx.writeBuffer(),count:recs.length,title};
}
async function downloadPeriodReport(kind,period,y,m,w){
 const {buf,count,title}=await buildPeriodReport(kind,period,y,m,w);
 const tag=period==='annual'?('Annual_'+y)
   :period==='monthly'?('Monthly_'+MB_MONTH_SHEETS[m]+'_'+y)
   :('Weekly_'+MB_MONTH_SHEETS[m]+'_'+y+'_W'+w);
 downloadBuf(buf,'Meter_Badali_'+tag+'.xlsx');
 return {count,title};
}

/* स्पष्ट रूपमा मागिएमा मात्र डाउनलोड (FSA नभएको ब्राउजरका लागि) */
async function downloadReport(kind){
 const {buf,count}=await buildReportBuffer(kind);
 downloadBuf(buf,KINDS[kind].suggestedName);
 return count;
}

/* नयाँ फाइल बनाउने — क्लिकको तुरुन्तै picker (user gesture जोगाउन) */
async function createLinkedFile(kind){
 const cfg=KINDS[kind];
 const handle=await window.showSaveFilePicker({
  suggestedName:cfg.suggestedName,
  types:[{description:'Excel Files',accept:{'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':['.xlsx']}}],
 });
 rt(kind).fileHandle=handle;
 await idbPut(kind,handle);
 S.saveJSON(cfg.handleMeta,{name:handle.name,lastAccess:new Date().toISOString()});
 return handle;
}

/* सबै मेटाएर फेरि सुरु (kind-अनुसार, अर्को kind लाई असर पर्दैन) */
async function resetAll(kind){
 clearRecords(kind);
 rt(kind).fileHandle=null;
 await idbClear(kind);
 S.clearJSON(KINDS[kind].handleMeta);
}

/* पेज लोड हुनासाथ दुवै kind का अघिल्लो लिंक चुपचाप फिर्ता ल्याउने कोसिस — रिफ्रेस पछि
   पहिलो Save मै सिधै फाइलमा लेखियोस्, फेरि नसोधियोस् */
if(hasAccess()){
 setTimeout(()=>{Object.keys(KINDS).forEach(k=>tryRestoreHandle(k).catch(()=>{}));},0);
}

/* ── UI ──
   which : Excel मा लेखिने rec.type अनि कुन फाइल/टेम्प्लेट प्रयोग हुने — दुवैको आधार
           ('meter' → Meter_Badali_Report_Template.xlsx छुट्टै फाइल,
            'chori' → Energy_Theft_Report_Template.xlsx)
   snapshotFn : ऐच्छिक — दिइएमा यही प्रयोग हुन्छ (मिटर बदली फाराम यही दिन्छ);
                नदिए window.Chori.snapshot() */
function addSaveButton(root,which,snapshotFn){
 const kind=which;
 const cfg=KINDS[kind];
 if(!cfg)return;
 let anchor=root.querySelector('#nb-reset-btn')||root.querySelector('#mf-reset-btn');
 if(!anchor)anchor=root.querySelector('#nb-calc');
 if(!anchor)anchor=root.querySelector('.nb-sig-row');
 if(!anchor)anchor=root.querySelector('#nb-print-memo-btn')||root.querySelector('#mf-print-form-btn');
 if(!anchor||!anchor.parentElement)return;

 const old=root.querySelector('#nb-excel-tools');
 if(old)old.remove();

 const wrap=document.createElement('span');
 wrap.id='nb-excel-tools';
 wrap.style.cssText='display:inline-flex;gap:8px;align-items:center;flex-wrap:wrap';

 const btn=document.createElement('button');
 btn.type='button';btn.id='nb-local-excel-btn';btn.className='sk-btn sk-bg';
 btn.style.cssText='font-size:13px;font-weight:600;padding:8px 12px';

 const info=document.createElement('span');
 info.style.cssText='font-size:11px;color:var(--ink-3,#667);max-width:210px;line-height:1.3';

 function status(){
  const n=recordCount(kind);
  const meta=S.loadJSON(cfg.handleMeta);
  const fh=rt(kind).fileHandle;
  btn.textContent=(fh||!hasAccess())?'💾 Save to Excel':'📁 Excel फाइल बनाउनुहोस्';
  info.textContent=fh
    ? (meta&&meta.name?meta.name:'फाइल')+' • '+n+' रेकर्ड'
    : (hasAccess()?'पहिलो पटक: फाइल कहाँ राख्ने छान्नुहोस्':n+' रेकर्ड • हरेक Save मा डाउनलोड');
 }

 // लोड हुनासाथ अघिको लिंक फिर्ता ल्याउने
 tryRestoreHandle(kind).then(status);
 status();

 btn.addEventListener('click',async()=>{
  const rec=snapshotFn?snapshotFn():window.Chori.snapshot();
  if(!rec){alert('पहिले गणना गर्नुहोस्');return;}
  rec.type=kind;
  if(!rec.date){alert('मिति भर्नुहोस्।');return;}

  // पहिलो पटक: फाइल बनाउने — picker सबैभन्दा पहिले (कुनै await अघि)
  let firstTime=false;
  if(!rt(kind).fileHandle&&hasAccess()){
   if(!await tryRestoreHandle(kind)){
    try{
     await createLinkedFile(kind);
     firstTime=true;
    }catch(e){
     if(e.name==='AbortError')return;
     alert('फाइल बनाउन सकिएन: '+e.name+' — '+e.message);return;
    }
   }
  }

  btn.disabled=true;
  btn.textContent='⏳ लेख्दै...';

  // नयाँ फाइल = सफा सुरुवात: पुराना रेकर्ड मेटाएर यही पहिलो रेकर्ड मात्र
  if(firstTime)clearRecords(kind);
  const r=addRecord(kind,rec);

  if(rt(kind).fileHandle){
   const res=await syncToFile(kind);          // फाइलमै लेख्छ — डाउनलोड हुँदैन
   btn.textContent=res.ok
     ? (r.dup?'ℹ️ पहिले नै छ':'✅ Excel मा थपियो ('+recordCount(kind)+')')
     : '❌ त्रुटि';
   if(!res.ok)alert('Excel मा लेख्न सकिएन: '+res.err+
     '\n\n(फाइल Excel मा खुला छ भने बन्द गरेर फेरि प्रयास गर्नुहोस्)');
  }else{
   // FSA नभएको ब्राउजर — रेकर्ड मात्र राख्छ, डाउनलोड चाहिँदा तलको बटन
   btn.textContent=r.dup?'ℹ️ पहिले नै छ':'✅ सुरक्षित ('+recordCount(kind)+')';
  }
  setTimeout(()=>{btn.disabled=false;status();},1800);
 });

 // सबै मेटाउने (नयाँ फाइलबाट सुरु गर्न)
 const del=document.createElement('button');
 del.type='button';del.className='sk-btn sk-bg';
 del.textContent='🗑';del.title='सबै Excel रेकर्ड मेटाएर नयाँ फाइलबाट सुरु गर्ने';
 del.style.cssText='font-size:13px;padding:8px 10px';
 del.addEventListener('click',async()=>{
  if(!confirm('सबै '+recordCount(kind)+' Excel रेकर्ड मेटाएर नयाँ फाइलबाट सुरु गर्ने?\n\n(कम्प्युटरमा भइसकेको फाइल भने मेटिँदैन)'))return;
  await resetAll(kind);status();
  alert('मेटियो। अर्को "Save" मा नयाँ फाइल बनाउन सोधिनेछ।');
 });

 // डाउनलोड — FSA नभएको ब्राउजरमा मात्र (मागिएमा मात्र, आफैं कहिल्यै होइन)
 const dl=document.createElement('button');
 dl.type='button';dl.className='sk-btn sk-bg';
 dl.textContent='⬇ Excel';
 dl.title='सबै रेकर्डसहित प्रतिवेदन डाउनलोड गर्ने';
 dl.style.cssText='font-size:13px;padding:8px 10px';
 dl.addEventListener('click',async()=>{
  if(!recordCount(kind)){alert('कुनै रेकर्ड छैन।');return;}
  dl.disabled=true;const t=dl.textContent;dl.textContent='⏳';
  try{const n=await downloadReport(kind);alert('✅ '+n+' रेकर्डसहित डाउनलोड भयो।');}
  catch(e){alert('त्रुटि: '+e.message);}
  dl.textContent=t;dl.disabled=false;
 });

 wrap.appendChild(btn);
 if(!hasAccess())wrap.appendChild(dl);   // लिंक गर्न मिल्ने ब्राउजरमा चाहिँदैन
 wrap.appendChild(del);
 wrap.appendChild(info);
 anchor.parentElement.insertBefore(wrap,anchor);
 if(kind==='meter')addReportBar(wrap,kind);
}

/* ── साप्ताहिक / मासिक / वार्षिक प्रतिवेदन डाउनलोड पट्टी ── */
function addReportBar(afterEl,kind){
 const old=document.getElementById('nb-report-bar');if(old)old.remove();
 const bar=document.createElement('div');
 bar.id='nb-report-bar';
 bar.style.cssText='display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:10px;padding-top:10px;border-top:1px dashed #cbd5e1;width:100%';

 const lbl=document.createElement('span');
 lbl.textContent='प्रतिवेदन :';
 lbl.style.cssText='font-size:12px;font-weight:600;color:var(--ink-2,#456)';

 const mk=(html)=>{const s=document.createElement('select');
  s.className='sk-sel';s.innerHTML=html;
  s.style.cssText='font-size:12px;padding:5px 8px;border:1px solid #cbd5e1;border-radius:6px;background:#fff';
  return s;};

 const period=mk('<option value="weekly">साप्ताहिक</option><option value="monthly" selected>मासिक</option><option value="annual">वार्षिक</option>');
 const today=S.bsToday();
 let yrs='';for(let y=today.y+1;y>=today.y-5;y--)yrs+=`<option value="${y}" ${y===today.y?'selected':''}>${y}</option>`;
 const year=mk(yrs);
 let mos='';for(let i=1;i<=12;i++)mos+=`<option value="${i}" ${i===today.m?'selected':''}>${MB_NEP[i]}</option>`;
 const month=mk(mos);
 const week=mk('<option value="1">हप्ता 1 (1–7)</option><option value="2">हप्ता 2 (8–14)</option><option value="3">हप्ता 3 (15–21)</option><option value="4">हप्ता 4 (22–मसान्त)</option>');
 week.value=String(weekOf(today.d));

 const go=document.createElement('button');
 go.type='button';go.className='sk-btn sk-bn';
 go.textContent='⬇ प्रतिवेदन';
 go.style.cssText='font-size:12px;padding:6px 12px;font-weight:600';

 const note=document.createElement('span');
 note.style.cssText='font-size:11px;color:var(--ink-3,#667)';

 function syncVis(){
  const p=period.value;
  month.style.display=(p==='annual')?'none':'';
  week.style.display=(p==='weekly')?'':'none';
  const n=recsInPeriod(kind,p,year.value,month.value,week.value).length;
  note.textContent=n?(n+' रेकर्ड'):'यस अवधिमा रेकर्ड छैन';
  note.style.color=n?'#16a34a':'#d97706';
 }
 [period,year,month,week].forEach(s=>s.addEventListener('change',syncVis));
 syncVis();

 go.addEventListener('click',async()=>{
  go.disabled=true;const t=go.textContent;go.textContent='⏳ बन्दै...';
  try{
   const r=await downloadPeriodReport(kind,period.value,year.value,month.value,week.value);
   note.textContent=r.count?('✅ '+r.count+' रेकर्ड'):'⚠ खाली प्रतिवेदन';
  }catch(e){alert('प्रतिवेदन बनाउन सकिएन: '+e.message);}
  go.textContent=t;go.disabled=false;setTimeout(syncVis,2500);
 });

 [lbl,period,year,month,week,go,note].forEach(n=>bar.appendChild(n));
 afterEl.parentElement.insertBefore(bar,afterEl.nextSibling);
}

return {addRecord,loadRecords,saveRecords,recordCount,clearRecords,resetAll,
        buildReportBuffer,syncToFile,downloadReport,addSaveButton,hasAccess,
        buildPeriodReport,downloadPeriodReport,recsInPeriod};
})(window.NBShared);
