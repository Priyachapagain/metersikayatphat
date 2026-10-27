/* ═══════════════════════════════════════════════════════════════════════
   MODULE — मिटर बदली फाराम (छिटो, बिलिङ/मूल्याङ्कन नभएको साधारण मिटर बदली)
   ───────────────────────────────────────────────────────────────────────
   "मिटर बदली" module (meter-badali.js) ले क्षतिपूर्ति/एभ्रेज मूल्याङ्कन गरी
   रकम निकाल्छ — त्यो प्रक्रिया लामो हुन्छ (3 चरण)। धेरै मिटर बदलीमा भने
   रकम मूल्याङ्कन गर्नुपर्दैन, केवल आधिकारिक "मिटर बदली बारे" फाराम
   (पुरानो/नयाँ मिटर तुलना तालिका) भरेर पेश गर्नुपर्छ — यही module त्यसैको
   लागि हो : एक पेजमा ग्राहक + मिटर विवरण भरेर सिधै फाराम प्रिन्ट/Word/Excel।
   Excel मा उही "METER BADALI" पानामा (type:'meter') दर्ता हुन्छ, तर
   रकम-सम्बन्धी स्तम्भहरू 0 रहन्छन् (किनकि यहाँ मूल्याङ्कन हुँदैन)।
   ═══════════════════════════════════════════════════════════════════════ */
window.MeterBadaliForm=(function(S){
'use strict';
const {bsToday,pad2,toNep,MONTHS,wireAddress,printEl,addDocTools,parseBSDate}=S;
let R;
const el=id=>R.querySelector('#'+id);

const AMPS=[5,15,30,60];
/* स्वीकृत लोड पेस्टबाट — लेबल/मानको बीचमा कोलन, ट्याब वा नयाँ लाइन जेसुकै भए पनि पत्ता लगाउने */
function parseLoad(raw){
 raw=String(raw||'');
 let m=raw.match(/\b(\d{1,3}(?:\.\d+)?)\s*AMPS?\b/i);
 if(m&&AMPS.includes(+m[1]))return +m[1];
 m=raw.match(/\((\d{1,3})\s*A\)/i);
 if(m&&AMPS.includes(+m[1]))return +m[1];
 m=raw.match(/\b(?:sanctioned|connected|approved)?\s*load\s*\(?a?\)?\s*[:\-]?\s*[\r\n]*\s*(\d{1,3}(?:\.\d+)?)\s*(?:amp(?:s|ere)?|a)?\b/i);
 if(m&&AMPS.includes(+m[1]))return +m[1];
 const lines=raw.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
 for(let i=0;i<lines.length;i++){
  if(/^(?:sanctioned|connected|approved)?\s*load\s*\(?a?\)?\s*[:\-]?$/i.test(lines[i])){
   for(let j=i+1;j<Math.min(i+3,lines.length);j++){
    const mm=lines[j].match(/^(\d{1,3}(?:\.\d+)?)\s*(?:amp(?:s|ere)?|a)?$/i);
    if(mm&&AMPS.includes(+mm[1]))return +mm[1];
   }
  }
 }
 const cleaned=raw.replace(/\([^)]*\)/g,' ');
 m=cleaned.match(/\b(\d{1,3})\s*A\b/i);
 if(m&&AMPS.includes(+m[1]))return +m[1];
 return 0;
}
const ISSUES=['मिटर जलेको (काम नलाग्ने भई)','मिटर बन्द भएको (नचलेको)','मिटरको डिस्प्ले आउट भएको','मिटर फुटेको','मिटरको टर्मिनल प्वाइन्ट जलेको','क्षमता वृद्धि गरि','बढी खपत भएको','अन्य'];
/* एक्सेलको "CAUSE OF METER CHANGE" स्तम्भ (N) — प्रतिवेदनका सबै सूत्र यसैमा भर पर्छन्,
   त्यसैले टेम्प्लेटले चिन्ने अङ्ग्रेजी शब्दहरू मात्र। फारममा भने छापिँदैन। */
const EXCEL_CAUSES=['STOPPED','DISPLAY OUT','BURNT','BROKEN','DIGITAL','OTHERS','THEFT'];
const ISSUE_TO_CAUSE={
 'मिटर जलेको (काम नलाग्ने भई)':'BURNT',
 'मिटर बन्द भएको (नचलेको)':'STOPPED',
 'मिटरको डिस्प्ले आउट भएको':'DISPLAY OUT',
 'मिटर फुटेको':'BROKEN',
 'मिटरको टर्मिनल प्वाइन्ट जलेको':'BURNT',
 'क्षमता वृद्धि गरि':'OTHERS',
 'बढी खपत भएको':'OTHERS',
 'अन्य':'OTHERS'};

function template(){
return `
<div class="nb-container">
  <div class="sk-ch"><span class="sk-ch-t">ग्राहक र मिटर विवरण — मिटर बदली फाराम</span></div>
  <div class="sk-cb">
    <div class="nb-mp">
      <label class="nb-mp-label">mPower डेटा पेस्ट <small>(ग्राहक विवरण भाग — स्वतः भरिन्छ)</small></label>
      <textarea id="mf-mp-paste" class="nb-mp-paste" rows="4" placeholder="Consumer Meter Reading Report यहाँ पेस्ट गर्नुहोस्..."></textarea>
      <div class="nb-mp-actions">
        <button type="button" class="sk-btn sk-bp" id="mf-mp-parse">स्वत: भर्नुहोस्</button>
        <button type="button" class="sk-btn sk-bg" id="mf-mp-clear">खाली गर्नुहोस्</button>
        <span id="mf-mp-status" class="nb-mp-status"></span>
      </div>
    </div>
    <div class="sk-form-grid">
      <div class="sk-f"><label>ग्राहकको नाम</label><input id="mf-naam" type="text" placeholder="पूरा नाम"></div>
      <div class="sk-f"><label>ग्राहक नं.</label><input id="mf-cno" type="text" placeholder="006.19.038"></div>
      <div class="sk-f"><label>आई.डि.नं.</label><input id="mf-cid" type="text" placeholder="33605"></div>
      <div class="sk-f"><label>रसिद नं. <small style="font-weight:400;color:#94a3b8">(कार्यालय कोड+वर्ष+महिना+गते मितिबाट स्वतः — क्रम संख्या हातै थप्नुहोस्)</small></label><input id="mf-rasid" type="text" placeholder="जस्तै : 183A830423"></div>
      <div class="sk-f"><label>मिति <small style="font-weight:400;color:#94a3b8">(आजको — स्वतः)</small></label><input id="mf-miti" type="text" placeholder="YYYY-MM-DD"></div>
      <div class="sk-f"><label>ग्राहक वर्गीकरण <small style="font-weight:400;color:#94a3b8">(पेस्टबाट)</small></label><input id="mf-class" type="text" placeholder="DOMESTIC(15A)"></div>
      <div class="sk-f"><label>स्वीकृत लोड (एम्पियर)</label><input id="mf-amp-disp" type="text" readonly><input id="mf-amp" type="hidden" value="15"></div>
      <div class="sk-f"><label>मिटर बदलीको कारण</label><select id="mf-issue">${ISSUES.map(i=>`<option>${i}</option>`).join('')}</select></div>
      <div class="sk-f" id="mf-issue-other-wrap" style="display:none"><label>खुलाउनुहोस्</label><input id="mf-issue-other" type="text" placeholder="जस्तै : मिटरको सिसा फुटेको"></div>
      <div class="sk-f"><label>बुझिलिने / लगत फाँट</label><input id="mf-received-by" type="text" placeholder="नाम"></div>
      <div class="sk-f"><label>CAUSE — एक्सेल अभिलेखको लागि <small style="font-weight:400;color:#94a3b8">(फारममा छापिँदैन; माथिको कारणबाट स्वतः, फरक भए फेर्नुहोस्)</small></label>
        <select id="mf-cause">${EXCEL_CAUSES.map(c=>`<option>${c}</option>`).join('')}</select></div>
    </div>
    <div class="nb-addr-box">
      <div class="nb-addr-label">ठेगाना</div>
      <div class="nb-addr-grid">
        <div class="sk-f"><label>नगरपालिका<select id="mf-addr-muni"><option value="">— छान्नुहोस् —</option></select></label></div>
        <div class="sk-f"><label>वडा नं.<select id="mf-addr-ward" disabled><option value="">— पहिले नगरपालिका —</option></select></label></div>
      </div>
      <div class="sk-f" style="margin-top:10px"><label>टोल / ठाउँ<select id="mf-addr-place" disabled><option value="">— पहिले वडा —</option></select></label></div>
      <div id="mf-addr-custom-wrap" style="display:none;margin-top:8px">
        <div class="sk-f"><label>नयाँ टोल / ठाउँ<input type="text" id="mf-addr-custom" placeholder="टोल / ठाउँको नाम..."></label></div>
      </div>
      <div class="nb-addr-preview" id="mf-addr-preview">ठेगाना छान्नुहोस्...</div>
      <div style="margin-top:6px;display:flex;gap:8px">
        <button type="button" class="sk-btn sk-bg" id="mf-addr-toggle-custom" style="font-size:12px;padding:3px 10px">+ नयाँ टोल थप्नुहोस्</button>
        <button type="button" class="sk-btn sk-bg" id="mf-addr-cancel-custom" style="font-size:12px;padding:3px 10px;display:none">रद्द</button>
      </div>
    </div>
    <input type="hidden" id="mf-addr">
  </div>
  <div class="sk-cb">
    <div class="nb-sec-label">पूर्वावलोकन — मिटर बदली बारे (फाराम) <small style="font-weight:400;color:#94a3b8">(तलको तालिकाका सबै कोठा सिधै सम्पादन गर्न मिल्छ)</small></div>
    <div class="nb-doc" id="mf-print-form">
      <div class="nb-doc-head"><div class="o">नेपाल विद्युत प्राधिकरण</div><div class="c">वितरण तथा ग्राहक सेवा</div><div class="c">तौलिहवा वितरण केन्द्र</div></div>
      <div style="font-weight:600;font-size:14px;margin:10px 0 2px">श्री मिटर रिडिङ तथा लगत फाँट,</div>
      <div class="nb-mb-hdr2">
        <div class="nb-mb-hdr2-l">मिति : <span id="mf-p-miti"></span></div>
        <div class="nb-mb-hdr2-r">
          <div>ग्राहक नं. : <span id="mf-p-cno"></span></div>
          <div>रसिद नं. : <span id="mf-p-rasid"></span></div>
          <div>आई.डी. : <span id="mf-p-cid"></span></div>
        </div>
      </div>
      <div class="nb-memo-subj">विषय : मिटर बदली बारे ।</div>
      <div class="nb-memo-body" id="mf-p-body"></div>
      <table class="nb-doc-tbl">
        <thead><tr><th style="text-align:left">विवरण</th><th>पुरानो मिटरको</th><th>नयाँ मिटरको</th></tr></thead>
        <tbody>
          <tr><td class="lb">1- कम्पनीको नाम</td><td><input class="nb-mb-input" id="mf-p-old-co" placeholder="जस्तै : GENUS"></td><td><input class="nb-mb-input" id="mf-p-new-co" placeholder="जस्तै : GENUS"></td></tr>
          <tr><td class="lb">2- मिटर नम्बर</td><td><input class="nb-mb-input" id="mf-p-old-no" placeholder="पुरानो मिटर नम्बर"></td><td><input class="nb-mb-input" id="mf-p-new-no" placeholder="नयाँ मिटर नम्बर"></td></tr>
          <tr><td class="lb">3- फेज</td><td><input class="nb-mb-input" id="mf-p-old-ph" value="1 फेज (1Φ)"></td><td><input class="nb-mb-input" id="mf-p-new-ph" value="1 फेज (1Φ)"></td></tr>
          <tr><td class="lb">4- भोल्ट</td><td><input class="nb-mb-input" id="mf-p-old-v" value="230V"></td><td><input class="nb-mb-input" id="mf-p-new-v" value="230V"></td></tr>
          <tr><td class="lb">5- एम्पियर</td><td><span class="nb-mb-cell"><input class="nb-mb-input nb-mb-input-sm" id="mf-p-old-a"> एम्पियर</span></td><td><span class="nb-mb-cell"><input class="nb-mb-input nb-mb-input-sm" id="mf-p-new-a"> एम्पियर</span></td></tr>
          <tr><td class="lb">6- चढेको मिटर अङ्क</td><td><span class="nb-mb-cell"><input class="nb-mb-input nb-mb-input-sm" id="mf-p-old-rd" value="0"> युनिट</span></td><td><span class="nb-mb-cell"><input class="nb-mb-input nb-mb-input-sm" id="mf-p-new-rd" value="0"> युनिट</span></td></tr>
          <tr><td class="lb">7- आ.पी.यु.</td><td><input class="nb-mb-input" id="mf-p-old-imp" value="3200"></td><td><input class="nb-mb-input" id="mf-p-new-imp" value="3200"></td></tr>
          <tr><td class="lb">8- पि.टि. तथा सी.टी. रेसियो</td><td><input class="nb-mb-input" id="mf-p-old-ptct" value="—"></td><td><input class="nb-mb-input" id="mf-p-new-ptct" value="—"></td></tr>
          <tr><td class="lb">9- गुणात्मक</td><td><input class="nb-mb-input" id="mf-p-old-mf" value="1"></td><td><input class="nb-mb-input" id="mf-p-new-mf" value="1"></td></tr>
          <tr><td class="lb">10- फ्युजको क्षमता</td><td><input class="nb-mb-input" id="mf-p-old-fuse" placeholder="जस्तै : 32A"></td><td><input class="nb-mb-input" id="mf-p-new-fuse" placeholder="जस्तै : 32A"></td></tr>
          <tr><td class="lb">11- रिडिङ सिल नम्बर</td><td><input class="nb-mb-input" id="mf-p-old-seal" placeholder="जस्तै : NEA1560"></td><td><input class="nb-mb-input" id="mf-p-new-seal" placeholder="जस्तै : NEA1539"></td></tr>
        </tbody>
      </table>
      <div class="nb-sig-row">
        <div class="nb-sig"><div class="ln">बुझिलिने<br><span id="mf-p-received"></span></div></div>
        <div class="nb-sig"><div class="ln">तयार गर्ने</div></div>
        <div class="nb-sig"><div class="ln">सिफारिस गर्ने</div></div>
        <div class="nb-sig"><div class="ln">सदर गर्ने</div></div>
      </div>
      <div class="nb-mb-notes">
        <div class="nb-mb-bodh">बोधार्थ :</div>
        <div>श्री स्टोर फाँट:- उपयुक्त पुरानो मिटर एक साथै पठाएको छ ।</div>
        <div>श्री आय फाँट:- हिसाब मिलान गर्नको लागि ।</div>
      </div>
    </div>
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px">
      <button type="button" class="sk-btn sk-bn" id="mf-print-form-btn">फाराम प्रिन्ट</button>
    </div>
    <div class="nb-nav">
      <button type="button" class="sk-btn sk-bp" id="mf-reset-btn">नयाँ केस</button>
    </div>
  </div>
</div>`;
}

/* ═══ mPower ले 12 अंकको आई.डी. दिन्छ — अगाडिका शून्य हटाउने ═══ */
function trimId(v){v=String(v||'').trim();const t=v.replace(/^0+/,'');return t||v;}
function ampFromClass(){
 const m=((el('mf-class')?el('mf-class').value:'')||'').match(/(\d{1,3})\s*A/i);
 const a=m?+m[1]:0;
 return AMPS.includes(a)?a:0;
}
function syncFromClass(){
 const a=ampFromClass();
 const cur=+el('mf-amp').value||15;
 const use=a||cur;
 el('mf-amp').value=use;
 const d=el('mf-amp-disp');
 if(d)d.value=a?toNep(a)+' एम्पियर':toNep(use)+' एम्पियर (अनुमानित — वर्गीकरणमा एम्पियर छैन)';
 maybeSuggestAmp();
 fillPreview();
}
/* तालिकाको "एम्पियर" कोठा — वर्गीकरणबाट सुझाव, तर खाली भएमा मात्र (हातैले भरे/सच्याए फेरि नछुने) */
function maybeSuggestAmp(){
 const use=el('mf-amp').value;
 [ 'mf-p-old-a','mf-p-new-a' ].forEach(id=>{
  const f=el(id);if(f&&!f.value.trim())f.value=use;
 });
}
function nbMpStatus(msg,kind){const e=el('mf-mp-status');e.textContent=msg||'';e.style.color=kind==='warn'?'#d97706':kind==='err'?'#dc2626':'#16a34a';}
function nbParseMpower(){
 const raw=el('mf-mp-paste').value||'';
 if(!raw.trim()){nbMpStatus('पेस्ट बक्स खाली छ।','warn');return;}
 const set=(id,v)=>{const e=el(id);if(e&&v)e.value=v;};
 const row=raw.match(/(.+?)\s+(\d{12})\s+(\d{3}\.\d{2}\.\d{3}[A-Z]{0,4})\s+(\S+)/);
 let name='',cid='',cno='';
 if(row){name=row[1].replace(/^(Mr|Mrs|Miss)\.?\s*/i,'').trim();cid=row[2];cno=row[3];}
 else{cid=(raw.match(/\b\d{12}\b/)||[])[0]||'';cno=(raw.match(/\b\d{3}\.\d{2}\.\d{3}[A-Z]{0,4}\b/)||[])[0]||'';const m=raw.match(/([A-Z][A-Z\s]+?)\s+\d{12}/);if(m)name=m[1].trim();}
 let cls=(raw.match(/(DOMESTIC|COMMERCIAL|INDUSTRIAL|NON[- ]?COMMERCIAL)\s*\(?\s*\d+\s*A?\s*\)?/i)||[])[0]||'';
 cls=cls.replace(/\s+/g,'').toUpperCase();
 const amp=parseLoad(raw);
 if(cls&&!/\d\s*A/i.test(cls)&&amp)cls=cls.replace(/\(?\)?$/,'')+'('+amp+'A)';
 if(!cls&&amp)cls='DOMESTIC('+amp+'A)';
 if(cls)set('mf-class',cls);
 if(!name&&!cid&&!cno&&!cls){nbMpStatus('ग्राहक विवरण फेला परेन — पेस्ट जाँच्नुहोस्।','err');return;}
 set('mf-naam',name);set('mf-cid',trimId(cid));set('mf-cno',cno);
 syncFromClass();
 const a=ampFromClass();
 nbMpStatus(cls?('भरियो ✓ — '+cls+(a?' · '+toNep(a)+' एम्पियर':' · एम्पियर फेला परेन, हातै राख्नुहोस्')):'ग्राहक विवरण भरियो ✓', cls&&a?'ok':'warn');
}
/* रसिद नं. ढाँचा : [कार्यालय कोड]+[वर्ष YY]+[महिना MM]+[गते DD] — बाँकी क्रम संख्या मितिबाट अनुमान गर्न मिल्दैन,
   त्यो हातैले थप्नुपर्छ। मिति भरिएपछि यो अंश मात्र सुझाव दिइन्छ — कोठा पहिल्यै भरिएको भए छुँदैन। */
const RASID_PREFIX='183A';
function rasidSuggestion(mitiVal){
 const d=parseBSDate(mitiVal);
 if(!d||!d.m||!d.d)return '';
 return RASID_PREFIX+String(d.y).slice(-2)+pad2(d.m)+pad2(d.d);
}
function maybeSuggestRasid(){
 const r=el('mf-rasid');if(!r||r.value.trim())return;
 const s=rasidSuggestion(el('mf-miti').value);
 if(s)r.value=s;
}
function syncIssueOther(){
 const w=el('mf-issue-other-wrap');
 if(w)w.style.display=(el('mf-issue').value==='अन्य')?'':'none';
 syncCause();
 fillPreview();
}
/* माथिको "मिटर बदलीको कारण" बाट एक्सेलको CAUSE स्वतः — तर प्रयोगकर्ताले
   आफैं फेरेपछि (touched) फेरि नछुने */
function syncCause(){
 const s=el('mf-cause');if(!s||s.dataset.touched==='1')return;
 const c=ISSUE_TO_CAUSE[el('mf-issue').value];
 if(c)s.value=c;
}
function issueText(){
 const sel=el('mf-issue')?el('mf-issue').value:'';
 if(sel==='अन्य'){const o=el('mf-issue-other');const t=o?o.value.trim():'';return t||'अन्य';}
 return sel;
}

/* ═══ "मिटर बदली बारे" फाराम — पुरानो/नयाँ तुलना तालिका भर्ने ═══ */
function fillPreview(){
 const v=id=>{const e=el(id);return e?(String(e.value||'').trim()||'............'):'............';};
 const miti=toNep((v('mf-miti')||'').replace(/-/g,'/'));
 const set=(id,val)=>{const e=el(id);if(e)e.textContent=val;};
 set('mf-p-miti',miti);set('mf-p-cno',toNep(v('mf-cno')));set('mf-p-cid',toNep(v('mf-cid')));set('mf-p-rasid',toNep(v('mf-rasid')));
 set('mf-p-body',`श्री ${v('mf-naam')} ठेगाना : ${v('mf-addr')} को मिटर ${issueText()} भई मिति ${miti} मा मिटर बदली गरिएकोले आवश्यक संशोधनको लागि अनुरोध छ ।`);
 const rb=el('mf-received-by');set('mf-p-received',rb&&rb.value.trim()?rb.value.trim():'');
}

/* ═══ सत्र स्वतः-सुरक्षण ═══ */
const AUTOSAVE_KEY='nb_meterform_autosave_v1';
let saveTimer=null;
function fieldIds(){return['mf-mp-paste','mf-naam','mf-cno','mf-cid','mf-rasid','mf-miti','mf-class','mf-amp','mf-issue','mf-issue-other','mf-received-by','mf-cause',
 'mf-p-old-co','mf-p-new-co','mf-p-old-no','mf-p-new-no','mf-p-old-ph','mf-p-new-ph','mf-p-old-v','mf-p-new-v','mf-p-old-a','mf-p-new-a',
 'mf-p-old-rd','mf-p-new-rd','mf-p-old-imp','mf-p-new-imp','mf-p-old-ptct','mf-p-new-ptct','mf-p-old-mf','mf-p-new-mf','mf-p-old-fuse','mf-p-new-fuse','mf-p-old-seal','mf-p-new-seal'];}
function collectState(){
 const fields={};fieldIds().forEach(id=>{const n=el(id);if(!n)return;fields[id]=n.value;});
 const muni=el('mf-addr-muni'),ward=el('mf-addr-ward'),place=el('mf-addr-place'),custom=el('mf-addr-custom'),customWrap=el('mf-addr-custom-wrap');
 const addr={muni:muni?muni.value:'',ward:ward?ward.value:'',place:place?place.value:'',custom:custom?custom.value:'',isCustom:!!(customWrap&&customWrap.style.display==='block')};
 return{fields,addr};
}
function scheduleSave(){clearTimeout(saveTimer);saveTimer=setTimeout(()=>{if(R.dataset.nbModule!=='meterform')return;S.saveJSON(AUTOSAVE_KEY,collectState());},400);}
function applyState(s){
 if(!s)return;
 if(s.fields)Object.keys(s.fields).forEach(id=>{const n=el(id);if(!n)return;n.value=s.fields[id];});
 syncIssueOther();
 if(s.addr&&s.addr.muni){
  const muni=el('mf-addr-muni'),ward=el('mf-addr-ward'),place=el('mf-addr-place'),custom=el('mf-addr-custom'),toggle=el('mf-addr-toggle-custom');
  muni.value=s.addr.muni;muni.dispatchEvent(new Event('change'));
  if(s.addr.ward){ward.value=s.addr.ward;ward.dispatchEvent(new Event('change'));
   if(s.addr.isCustom){toggle.click();custom.value=s.addr.custom;custom.dispatchEvent(new Event('input'));}
   else if(s.addr.place){place.value=s.addr.place;place.dispatchEvent(new Event('change'));}
  }
 }
 syncFromClass();fillPreview();
}

function mount(root,opts){
 opts=opts||{};
 R=root;R.dataset.nbModule='meterform';R.innerHTML=template();
 el('mf-mp-parse').addEventListener('click',nbParseMpower);
 el('mf-mp-clear').addEventListener('click',()=>{el('mf-mp-paste').value='';nbMpStatus('');});
 el('mf-class').addEventListener('input',syncFromClass);
 el('mf-issue').addEventListener('change',syncIssueOther);
 el('mf-cause').addEventListener('change',e=>{e.target.dataset.touched='1';});
 el('mf-print-form-btn').addEventListener('click',()=>printEl(el('mf-print-form')));
 addDocTools(R,'mf-print-form','mf-print-form-btn','मिटर_बदली_फाराम','word');
 el('mf-reset-btn').addEventListener('click',()=>{S.clearJSON(AUTOSAVE_KEY);mount(R,opts);});
 wireAddress(R,{muni:'mf-addr-muni',ward:'mf-addr-ward',place:'mf-addr-place',custom:'mf-addr-custom',customWrap:'mf-addr-custom-wrap',toggle:'mf-addr-toggle-custom',cancel:'mf-addr-cancel-custom',preview:'mf-addr-preview',hidden:'mf-addr'},fillPreview);
 const t=bsToday();if(!el('mf-miti').value)el('mf-miti').value=t.y+'-'+pad2(t.m)+'-'+pad2(t.d);
 el('mf-miti').addEventListener('input',maybeSuggestRasid);
 maybeSuggestRasid();
 if(!el('mf-class').value)el('mf-class').value='DOMESTIC(15A)';
 syncFromClass();syncIssueOther();
 if(!root.dataset.nbAutosaveWiredMeterForm){root.dataset.nbAutosaveWiredMeterForm='1';
  root.addEventListener('input',()=>{fillPreview();scheduleSave();});
  root.addEventListener('change',()=>{fillPreview();scheduleSave();});
 }
 const saved=S.loadJSON(AUTOSAVE_KEY);
 if(saved)applyState(saved);
 fillPreview();
 // अभिलेख ट्याबभित्र देखिँदा आफ्नै Save बटन चाहिँदैन — त्यहाँको "अभिलेखमा थप्नुहोस्" ले काम गर्छ
 if(!opts.embedded&&window.LocalExcelSave)window.LocalExcelSave.addSaveButton(R,'meter',snapshot);
}

/* ═══ अभिलेख (Excel) का लागि रेकर्ड — "METER BADALI" पानामै दर्ता हुन्छ, तर रकम स्तम्भ 0 ═══ */
function snapshot(){
 const v=id=>{const e=el(id);return e?String(e.value||'').trim():'';};
 return{
  date:v('mf-miti'),name:v('mf-naam'),cid:v('mf-cid'),cno:v('mf-cno'),
  address:v('mf-addr'),phase:'1',
  oldMeter:v('mf-p-old-no'),lastReading:+v('mf-p-old-rd')||0,
  newMeter:v('mf-p-new-no'),initReading:+v('mf-p-new-rd')||0,
  oldCompany:v('mf-p-old-co'),newCompany:v('mf-p-new-co'),
  oldSeal:v('mf-p-old-seal'),newSeal:v('mf-p-new-seal'),
  impkwh:v('mf-p-new-imp'),fuse:v('mf-p-new-fuse'),
  receivedBy:v('mf-received-by'),
  cause:v('mf-cause')||'OTHERS',paid:'UNPAID',aniyemitta:'',
  unit:0,amount:0,comp100:0,demandKva:0,demandAmt:0,
  meterPrice:0,sealFee:0,otherFee:0,vatTotal:0,grand:0,
  remark:issueText()
 };
}

return {mount,snapshot};
})(window.NBShared);
