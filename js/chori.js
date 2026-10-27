/* ═══════════════════════════════════════════════════════════════════════
   MODULE 2 — विद्युत चोरी (Chori)
   ═══════════════════════════════════════════════════════════════════════ */
window.Chori=(function(S){
'use strict';
const {bsToday,pad2,toNep,MNE,MONTHS,fmt,round2,parseBSDate,wireAddress,printEl,addDocTools}=S;
let R;const el=id=>R.querySelector('#'+id);
const T=window.NBTariff;

const D_BANDS=T.chori.domesticBands;
const D_AMP_COL=T.chori.domesticAmpCol;
const DOM=T.chori.domestic;
function bsMonthSeason(m){return (m>=3&&m<=7)?'wet':'dry';}
const ND=T.chori.nonDomestic;
function calcDomesticParts(units,ampKey){units=Math.max(0,Math.round(units));const[scCol,rateCol]=D_AMP_COL[ampKey]||D_AMP_COL.d5;if(units===0)return{sc:D_BANDS[0][scCol],e:0};if(ampKey==='d5'&&units<=20)return{sc:D_BANDS[0][scCol],e:0};let energy=0,scHigh=D_BANDS[0][scCol];for(const band of D_BANDS){const[bMin,bMax]=band;if(units<bMin)break;const lo=bMin===0?1:bMin,hi=Math.min(units,bMax),n=hi-lo+1;if(n<=0)continue;let rate=band[rateCol];if(ampKey==='d5'&&bMin===0&&units>20)rate=3.00;energy+=n*rate;scHigh=band[scCol];}return{sc:scHigh,e:round2(energy)};}
function calcDomestic(units,ampKey){const p=calcDomesticParts(units,ampKey);return round2(p.sc+p.e);}
function calcThreePhaseDom(units,catKey,bsMonth){const cat=ND[catKey];const rate=bsMonthSeason(bsMonth||1)==='wet'?cat.rate_wet:cat.rate_dry;units=Math.max(0,Math.round(units));return round2(cat.sc+units*rate);}
function calcNonDomestic(units,catKey,kva){const cat=ND[catKey];units=Math.max(0,Math.round(units));if(cat.flatMonthly)return cat.sc;const fixed=cat.demand?cat.sc*(kva||0):cat.sc;return round2(fixed+units*cat.rate);}
function calcTariff(units,cat,kva,bsMonth){if(DOM.includes(cat))return calcDomestic(units,cat);if(cat==='d3lv_10'||cat==='d3lv_hi')return calcThreePhaseDom(units,cat,bsMonth);if(ND[cat])return calcNonDomestic(units,cat,kva);return calcNonDomestic(units,'com',kva);}
/* mPower ले 12 अंकको आई.डी. दिन्छ — अगाडिका शून्य हटाउने (000000033605 → 33605) */
function trimId(v){v=String(v||'').trim();const t=v.replace(/^0+/,'');return t||v;}
function isDomesticCat(cat){return DOM.includes(cat)||cat==='d3lv_10'||cat==='d3lv_hi';}
/* मू.अ.कर — विद्युत चोरीमा जरिवाना रकममा मात्र लाग्छ */
const FINE_VAT_RATE=0.13;
const FEES=T.chori.fees;
const APPL=[
 {name:'बत्ती (CFL/LED)',watt:15,qty:8,res:{df:0.5,lf:0.7,hrs:5,days:365},com:{df:0.5,lf:0.7,hrs:8,days:300}},
 {name:'पकाउने हिटर',watt:1000,qty:0,res:{df:1,lf:0.75,hrs:2,days:365},com:{df:1,lf:0.75,hrs:6,days:300}},
 {name:'हटप्लेट',watt:1000,qty:0,res:{df:1,lf:0.5,hrs:2,days:365},com:{df:1,lf:0.5,hrs:4,days:300}},
 {name:'इन्डक्सन चुलो',watt:2000,qty:0,res:{df:1,lf:0.75,hrs:2,days:365},com:{df:1,lf:0.75,hrs:6,days:300}},
 {name:'ओभन',watt:1000,qty:0,res:{df:1,lf:0.5,hrs:1,days:365},com:{df:1,lf:0.5,hrs:4,days:300}},
 {name:'राइस कुकर / केटल',watt:1000,qty:0,res:{df:1,lf:0.5,hrs:2,days:365},com:{df:1,lf:0.5,hrs:4,days:300}},
 {name:'मिक्सर / ग्राइन्डर',watt:500,qty:0,res:{df:1,lf:0.5,hrs:0.5,days:365},com:{df:1,lf:0.5,hrs:2,days:300}},
 {name:'रुम हिटर',watt:1000,qty:0,res:{df:1,lf:0.75,hrs:3,days:90},com:{df:1,lf:0.75,hrs:6,days:75}},
 {name:'वाटर हिटर / गिजर',watt:1000,qty:0,res:{df:1,lf:0.75,hrs:1,days:150},com:{df:1,lf:0.75,hrs:4,days:125}},
 {name:'पंखा',watt:80,qty:3,res:{df:0.8,lf:0.8,hrs:10,days:150},com:{df:0.8,lf:0.8,hrs:8,days:125}},
 {name:'कुलर (एयर कुलर)',watt:200,qty:0,res:{df:1,lf:0.8,hrs:8,days:120},com:{df:1,lf:0.8,hrs:8,days:120}},
 {name:'पम्पसेट / घरेलु खानेपानी',watt:750,qty:1,res:{df:1,lf:0.8,hrs:1,days:365},com:{df:1,lf:0.8,hrs:4,days:300}},
 {name:'टेलिभिजन',watt:100,qty:1,res:{df:1,lf:1,hrs:4,days:365},com:{df:1,lf:1,hrs:6,days:300}},
 {name:'लुगा सिउने मेसिन',watt:200,qty:0,res:{df:1,lf:0.8,hrs:1,days:365},com:{df:1,lf:0.8,hrs:6,days:300}},
 {name:'फ्रिज / डिप फ्रिज',watt:200,qty:1,res:{df:1,lf:0.6,hrs:12,days:365},com:{df:1,lf:0.6,hrs:12,days:300}},
 {name:'इन्भर्टर (चार्जिङ)',watt:300,qty:0,res:{df:1,lf:0.7,hrs:4,days:365},com:{df:1,lf:0.7,hrs:6,days:300}},
 {name:'झालर बत्ती (सजावटी)',watt:40,qty:0,res:{df:1,lf:1,hrs:4,days:60},com:{df:1,lf:1,hrs:6,days:60}},
 {name:'प्रोजेक्टर',watt:300,qty:0,res:{df:1,lf:1,hrs:1,days:365},com:{df:1,lf:1,hrs:4,days:300}},
 {name:'आइरन / ग्राइन्डर / टोस्टर',watt:1000,qty:0,res:{df:1,lf:0.4,hrs:1,days:365},com:{df:1,lf:0.4,hrs:8,days:300}},
 {name:'एयर कन्डिसन (चिसो+तातो)',watt:1500,qty:0,res:{df:1,lf:0.6,hrs:3,days:240},com:{df:1,lf:0.6,hrs:8,days:200}},
 {name:'एयर कन्डिसन (चिसो मात्र)',watt:1500,qty:0,res:{df:1,lf:0.6,hrs:3,days:150},com:{df:1,lf:0.6,hrs:8,days:125}},
 {name:'कम्प्युटर',watt:250,qty:0,res:{df:1,lf:1,hrs:2,days:365},com:{df:1,lf:1,hrs:8,days:300}},
 {name:'फोटोकपी मेसिन',watt:500,qty:0,res:{df:1,lf:0.8,hrs:1,days:365},com:{df:1,lf:0.8,hrs:2,days:300}},
 {name:'वेल्डिङ मेसिन',watt:3000,qty:0,res:{df:0.8,lf:0.5,hrs:1,days:180},com:{df:0.8,lf:0.5,hrs:4,days:150}},
 {name:'मिल मोटर / मेसिनरी',watt:5000,qty:0,res:{df:0.8,lf:0.6,hrs:2,days:300},com:{df:0.8,lf:0.6,hrs:6,days:300}},
 {name:'ई.भी. स्कुटी चार्जर',watt:500,qty:0,res:{df:1,lf:0.8,hrs:4,days:365},com:{df:1,lf:0.8,hrs:6,days:300}},
 {name:'ई.भी. कार चार्जर',watt:3300,qty:0,res:{df:1,lf:0.7,hrs:4,days:365},com:{df:1,lf:0.7,hrs:6,days:300}},
 {name:'अन्य',watt:100,qty:0,res:{df:1,lf:0.7,hrs:4,days:365},com:{df:1,lf:0.7,hrs:6,days:300}}
];
const THEFTS={hook:{n:'Direct Hooking — हुकिङ / सिधा तार',desc:'हुकिङ गरी अनाधिकृत रूपमा विद्युत उपभोग गरेको',seized:'विद्युतीय सामान',ret:'सामान फिर्ताको'},bypass:{n:'Meter Bypass — मिटर बाइपास',desc:'मिटर बाइपास गरी अनाधिकृत रूपमा विद्युत उपभोग गरेको',seized:'मिटर',ret:'मिटर फिर्ताको'},tapping:{n:'Cable Tapping — केबल टपिङ',desc:'केबल टपिङ गरी अनाधिकृत रूपमा विद्युत उपभोग गरेको',seized:'मिटर',ret:'मिटर फिर्ताको'}};
const CATS=T.chori.categories;

let useMode='res',estMethod='load',theftType='hook',extras=[],MPOWER_ROWS=[];

function monthOpts(sel){return MONTHS.map((m,i)=>`<option value="${i}" ${i===sel?'selected':''}>${m}</option>`).join('');}
function catOpts(){return CATS.map(g=>`<optgroup label="${g[0]}">${g[1].map(o=>`<option value="${o[0]}">${o[1]}</option>`).join('')}</optgroup>`).join('');}

function template(){
return `
<div class="nb-container">
  <div class="nb-steps">
    <button type="button" class="nb-step on" data-step="1">1. ग्राहक विवरण</button>
    <button type="button" class="nb-step" data-step="2">2. मूल्याङ्कन र कुल जम्मा</button>
    <button type="button" class="nb-step" data-step="3">3. मूल्याङ्कन तालिका र मेमो</button>
  </div>
  <div class="nb-card on" data-card="1">
    <div class="sk-ch"><span class="sk-ch-t">ग्राहकको विवरण — विद्युत चोरी</span></div>
    <div class="sk-cb">
      <div class="nb-mp">
        <label class="nb-mp-label">mPower डेटा पेस्ट <small>(ग्राहक विवरण + बिलिङ इतिहास — स्वतः भरिन्छ)</small></label>
        <textarea id="nb-mp-paste" class="nb-mp-paste" rows="4" placeholder="Consumer Meter Reading Report यहाँ पेस्ट गर्नुहोस्..."></textarea>
        <div class="nb-mp-actions">
          <button type="button" class="sk-btn sk-bp" id="nb-mp-parse">स्वत: भर्नुहोस्</button>
          <button type="button" class="sk-btn sk-bg" id="nb-mp-clear">खाली गर्नुहोस्</button>
          <span id="nb-mp-status" class="nb-mp-status"></span>
        </div>
      </div>
      <div class="sk-form-grid">
        <div class="sk-f"><label>चोरीको प्रकार</label><select id="nb-theft">${Object.entries(THEFTS).map(([k,c])=>`<option value="${k}">${c.n}</option>`).join('')}</select></div>
        <div class="sk-f"><label>ग्राहकको नाम</label><input id="nb-naam" type="text" placeholder="पूरा नाम"></div>
        <div class="sk-f" id="nb-cno-f"><label>ग्राहक नं.</label><input id="nb-cno" type="text" placeholder="009.13.024"></div>
        <div class="sk-f" id="nb-cid-f"><label>आई.डि.नं.</label><input id="nb-cid" type="text" placeholder="33605"></div>
        <div class="sk-f" id="nb-meter-f"><label>मिटर नं.</label><input id="nb-meter" type="text" placeholder="GEN_22510"></div>
        <div class="sk-f"><label>वितरण केन्द्र</label><input id="nb-center" type="text" value="तौलिहवा वितरण केन्द्र"></div>
        <div class="sk-f" id="nb-cat-f"><label>उपभोक्ता वर्ग</label><select id="nb-cat">${catOpts()}</select></div>
        <div class="sk-f" id="nb-amps-f"><label>क्षमता (Amps)</label><input id="nb-amps" type="number" value="5" min="1"></div>
        <div class="sk-f"><label>फोरमेन / पेश गर्नेको नाम</label><input id="nb-foreman" type="text" placeholder="नाम"></div>
        <div class="sk-f"><label style="display:flex;gap:8px;align-items:center;font-weight:600"><input type="checkbox" id="nb-repeat" style="width:auto;flex:0"> पुनः सोही कसूर (दोहोरिएको)</label><small style="color:#94a3b8">ऐन 11(2): क्षतिपूर्ति 200%; नभए 11(1): 100%</small></div>
      </div>
      <div id="nb-hook-note" class="nb-addr-box" style="display:none;border-left:3px solid var(--blue-2)">
        <div class="nb-hint"><b>हुकिङ:</b> सिधा तार जोडी चोरी गर्नेको ग्राहक कनेक्सन हुँदैन — त्यसैले ग्राहक नं. / आई.डी. / मिटर / वर्ग सोधिँदैन। मूल्याङ्कन <b>गृहस्थ 5 एम्पियर (एकल फेज)</b> दर सरह हुन्छ र जडित लोड अनुसूची–5 बाट लिइन्छ।</div>
      </div>
      <div class="nb-addr-box">
        <div class="nb-addr-label">ठेगाना</div>
        <div class="nb-addr-grid">
          <div class="sk-f"><label>नगरपालिका<select id="nb-addr-muni"><option value="">— छान्नुहोस् —</option></select></label></div>
          <div class="sk-f"><label>वडा नं.<select id="nb-addr-ward" disabled><option value="">— पहिले नगरपालिका —</option></select></label></div>
        </div>
        <div class="sk-f" style="margin-top:10px"><label>टोल / ठाउँ<select id="nb-addr-place" disabled><option value="">— पहिले वडा —</option></select></label></div>
        <div id="nb-addr-custom-wrap" style="display:none;margin-top:8px"><div class="sk-f"><label>नयाँ टोल / ठाउँ<input type="text" id="nb-addr-custom" placeholder="टोल / ठाउँको नाम..."></label></div></div>
        <div class="nb-addr-preview" id="nb-addr-preview">ठेगाना छान्नुहोस्...</div>
        <div style="margin-top:6px;display:flex;gap:8px">
          <button type="button" class="sk-btn sk-bg" id="nb-addr-toggle-custom" style="font-size:12px;padding:3px 10px">+ नयाँ टोल थप्नुहोस्</button>
          <button type="button" class="sk-btn sk-bg" id="nb-addr-cancel-custom" style="font-size:12px;padding:3px 10px;display:none">रद्द</button>
        </div>
      </div>
      <input type="hidden" id="nb-addr">
      <div class="nb-nav"><button type="button" class="sk-btn sk-bp nb-next" data-to="2">अगाडि →</button></div>
    </div>
  </div>
  <div class="nb-card" data-card="2">
    <div class="sk-ch"><span class="sk-ch-t">निरीक्षण मिति, अवधि, मूल्याङ्कन र कुल जम्मा</span></div>
    <div class="sk-cb">
      <div class="nb-addr-box">
        <div class="nb-addr-label">युनिट अनुमान विधि — अनुसूची–5 / नियम 8</div>
        <div class="sk-tg">
          <button type="button" class="sk-btn sk-bg on" data-method="load" id="nb-m-load">लोड विधि (अनुसूची–5)</button>
          <button type="button" class="sk-btn sk-bg" data-method="avg" id="nb-m-avg">औसत विधि (नियम 8)</button>
        </div>
      </div>
      <div id="nb-load-panel">
        <div class="nb-sec-label">जडित विद्युतीय उपकरण (अनुसूची–5) — युनिट = (वाट/1000) × संख्या × डि.फ्या. × लो.फ्या. × घण्टा/दिन × दिन/वर्ष</div>
        <div class="sk-tg" style="margin:8px 0">
          <button type="button" class="sk-btn sk-bg on" data-use="res" id="nb-u-res">सामान्य प्रयोग (घरेलु)</button>
          <button type="button" class="sk-btn sk-bg" data-use="com" id="nb-u-com">व्यावसायिक प्रयोग</button>
        </div>
        <table class="nb-tbl">
          <thead><tr><th style="width:34px">क्र.सं.</th><th style="min-width:150px">विवरण</th><th>संख्या</th><th>वाट</th><th>जम्मा वाट</th><th>डि.फ्या.</th><th>लो.फ्या.</th><th>घण्टा/दिन</th><th>दिन/वर्ष</th><th>खपत युनिट</th><th style="width:34px"></th></tr></thead>
          <tbody id="nb-abody"></tbody>
          <tfoot>
            <tr class="total"><td colspan="9" style="text-align:right">जम्मा वार्षिक खपत युनिट</td><td class="num" id="nb-annual">0.000</td><td></td></tr>
            <tr class="total"><td colspan="9" style="text-align:right">जम्मा मासिक खपत युनिट (वार्षिक ÷ 12)</td><td class="num" id="nb-monthly">0</td><td></td></tr>
          </tfoot>
        </table>
        <div style="margin-top:8px"><button type="button" class="sk-btn sk-bg" id="nb-addappl">+ उपकरण थप्नुहोस्</button></div>
      </div>
      <div id="nb-avg-panel" style="display:none">
        <div class="nb-sec-label">विगत 3 सामान्य महिनाको खपत — औसत नै मासिक मूल्याङ्कित युनिट हुन्छ (नियम 8)</div>
        <table class="nb-tbl" style="max-width:480px">
          <thead><tr><th>क्र.सं.</th><th>मिति (साल/महिना)</th><th>युनिट</th></tr></thead>
          <tbody>
            <tr><td>1</td><td><input id="nb-ad1" placeholder="2082/05"></td><td><input id="nb-au1" type="number" min="0" value=""></td></tr>
            <tr><td>2</td><td><input id="nb-ad2" placeholder="2082/06"></td><td><input id="nb-au2" type="number" min="0" value=""></td></tr>
            <tr><td>3</td><td><input id="nb-ad3" placeholder="2082/07"></td><td><input id="nb-au3" type="number" min="0" value=""></td></tr>
          </tbody>
          <tfoot><tr class="total"><td colspan="2" style="text-align:right">मासिक औसत युनिट</td><td class="num" id="nb-avgres">0</td></tr></tfoot>
        </table>
      </div>
      <div class="nb-addr-box">
        <div class="nb-addr-label">निरीक्षण मिति र गणना अवधि — यसैबाट पछाडिका महिना बन्छन्</div>
        <div class="sk-form-grid">
          <div class="sk-f"><label>निरीक्षण मिति (वि.सं.)</label><input id="nb-insp" type="text" placeholder="YYYY-MM-DD"></div>
          <div class="sk-f"><label>गणना अवधि</label><select id="nb-period"><option value="12">12 महिना</option><option value="6">6 महिना</option><option value="3">3 महिना</option></select></div>
        </div>
        <div style="margin-top:10px;display:flex;gap:10px;align-items:center;flex-wrap:wrap">
          <button type="button" class="sk-btn sk-bp" id="nb-genrows">अवधिका महिनाहरू थप्नुहोस्</button>
          <span id="nb-gen-status" class="nb-mp-status"></span>
        </div>
      </div>
      <div class="nb-sec-label">क्षतिपूर्ति मूल्याङ्कन तालिका — चोरी अवधि</div>
      <table class="nb-tbl">
        <thead><tr><th style="width:70px">वर्ष</th><th style="width:90px">महिना</th><th>बिल युनिट</th><th>बिल रकम (रु.)</th><th>मूल्याङ्कित युनिट</th><th>मूल्याङ्कित रकम (रु.)</th><th>चुहावट युनिट</th><th>क्षतिपूर्ति रकम (रु.)</th><th style="width:34px"></th></tr></thead>
        <tbody id="nb-ebody"></tbody>
        <tfoot><tr class="total"><td colspan="2">जम्मा</td><td id="nb-sbu" class="num">0</td><td id="nb-sba" class="num">0.00</td><td id="nb-seu" class="num">0</td><td id="nb-sea" class="num">0.00</td><td id="nb-scu" class="num">0</td><td id="nb-ska" class="num">0.00</td><td></td></tr></tfoot>
      </table>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button type="button" class="sk-btn sk-bg" id="nb-addrow">+ महिना थप्नुहोस्</button>
        <button type="button" class="sk-btn sk-bp" id="nb-calc">गणना गर्नुहोस्</button>
      </div>
      <div class="nb-hint">चोरी अवधिमा बिल भएको युनिट "बिल युनिट" मा राख्नुहोस् (हुकिङमा सामान्यतया 0) — बिल रकम स्ल्याब दर अनुसार स्वतः आउँछ। चुहावट युनिट = मूल्याङ्कित − बिल; क्षतिपूर्ति = मूल्याङ्कित रकम − बिल रकम।</div>
      <div class="nb-stats">
        <div class="nb-stat"><div class="l">मासिक मूल्याङ्कित युनिट</div><div class="v" id="nb-st-mu">0</div></div>
        <div class="nb-stat diff"><div class="l">कुल चुहावट युनिट</div><div class="v" id="nb-st-cu">0</div></div>
        <div class="nb-stat diff"><div class="l">क्षतिपूर्ति रकम</div><div class="v" id="nb-st-ka">रु. 0.00</div></div>
      </div>
      <div class="nb-addr-box">
        <div class="nb-addr-label">भुक्तानी गर्नुपर्ने रकम — सम्पादन योग्य</div>
        <div class="nb-totrows">
          <div class="nb-totrow"><span>1. क्षतिपूर्ति रकम (रु.)</span><input id="nb-f-comp" type="number" step="0.01" value="0"></div>
          <div class="nb-totrow"><span>2. जरिवाना % <small style="font-weight:400">(ऐन 11)</small></span><input id="nb-f-finepct" type="number" step="1" value="100"></div>
          <div class="nb-totrow"><span>3. जरिवाना रकम (रु.)</span><input id="nb-f-fine" readonly></div>
          <div class="nb-totrow"><span>4. जरिवानामा 13% भ्याट (रु.)</span><input id="nb-f-fine-vat" readonly></div>
        </div>
        <div class="nb-sec-label" style="margin:12px 0 6px">सेवा शुल्क</div>
        <div class="nb-totrows" id="nb-fee-rows"></div>
        <div class="nb-sec-label" style="margin:12px 0 6px">अन्य (Other) <button type="button" class="sk-btn sk-bg" id="nb-add-extra" style="font-size:12px;padding:2px 10px;margin-left:8px">+ थप्नुहोस्</button></div>
        <div id="nb-extra-rows" style="display:flex;flex-direction:column;gap:8px"></div>
        <div class="nb-totrows" style="margin-top:12px">
          <div class="nb-totrow"><span>सेवा शुल्क + अन्य जम्मा (रु.)</span><input id="nb-f-vatable" readonly></div>
          <div class="nb-totrow final"><span>कुल जम्मा (क्षतिपूर्ति + जरिवाना + 13% भ्याट + शुल्क) (रु.)</span><input id="nb-f-grand" readonly></div>
        </div>
        <div class="nb-hint" style="margin-top:8px">मू.अ.कर <b>जरिवाना रकममा मात्र</b> 13% का दरले लाग्छ। मासिक मूल्याङ्कन तालिकाको महसुल, क्षतिपूर्ति रकम, सेवा शुल्क र अन्य दस्तुरमा भ्याट लाग्दैन।</div>
      </div>
      <div class="nb-nav">
        <button type="button" class="sk-btn sk-bg nb-back" data-to="1">← पछाडि</button>
        <button type="button" class="sk-btn sk-bp nb-next" data-to="3">पूर्वावलोकन →</button>
      </div>
    </div>
  </div>
  <div class="nb-card" data-card="3">
    <div class="sk-ch"><span class="sk-ch-t">पूर्वावलोकन — मूल्याङ्कन तालिका र मेमो</span></div>
    <div class="sk-cb">
      <div class="sk-form-grid">
        <div class="sk-f"><label>तयार गर्ने</label><input id="nb-sig-prep" placeholder="नाम"></div>
        <div class="sk-f"><label>सिफारिस / अनुसन्धान अधिकारी</label><input id="nb-sig-sifaris" placeholder="नाम"></div>
        <div class="sk-f"><label>स्वीकृत गर्ने</label><input id="nb-sig-approve" placeholder="नाम"></div>
        <div class="sk-f"><label>मेमो मिति</label><input id="nb-memo-date" placeholder="YYYY-MM-DD"></div>
        <div class="sk-f"><label>लाई (कार्यालय प्रमुख)</label><input id="nb-memo-head" value="कार्यालय प्रमुख ज्यू"></div>
      </div>
      <div style="text-align:right"><button type="button" class="sk-btn sk-bp" id="nb-refresh">पूर्वावलोकन ताजा गर्नुहोस्</button></div>
      <div class="nb-sec-label">1. मेमो</div>
      <div class="nb-doc" id="nb-print-memo">
        <div class="nb-doc-head"><div class="o">नेपाल विद्युत प्राधिकरण</div><div class="c" id="pm-center">तौलिहवा वितरण केन्द्र</div><div class="nb-memo-title">मेमो</div></div>
        <div class="nb-memo-fromto"><span>लाई : <span id="pm-head"></span></span><span>बाट : मिटर सिकायत फाँट</span></div>
        <div class="nb-memo-subj">विषय : चुहावट सम्बन्धमा ।</div>
        <div class="nb-memo-body" id="pm-body"></div>
        <div class="nb-memo-line">चुहावट युनिट : <span id="pm-units"></span> युनिट ।</div>
        <div class="nb-memo-line">चुहावट बापतको जम्मा रकम : रु. <span id="pm-comp"></span> मात्र ।</div>
        <div class="nb-memo-line">जरिवाना तथा 13% भ्याट समेत जम्मा रकम (भ्याट सहित) : रु. <span id="pm-total"></span> मात्र ।</div>
        <div class="nb-memo-aaya"><b>श्री आय फाँट :</b> निज ग्राहकको आइ.डी.मा माथि उल्लेखित युनिट र उक्त युनिट बापतको रकम पोष्टिङ्ग गराईदिनुहुन अनुरोध छ ।</div>
        <div class="nb-sig-row" style="justify-content:flex-end">
          <div class="nb-sig"><div class="ln">तयार गर्ने<br><span id="pm-prep"></span></div></div>
        </div>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px;align-items:center">
        <button type="button" class="sk-btn sk-bn" id="nb-print-memo-btn">मेमो प्रिन्ट</button>
      </div>
      <div class="nb-sec-label" style="margin-top:8px">2. मूल्याङ्कन प्रतिवेदन</div>
      <div class="nb-doc" id="nb-print-eval">
        <div class="nb-doc-head"><div class="o">नेपाल विद्युत प्राधिकरण</div><div class="c" id="pe-center">तौलिहवा वितरण केन्द्र</div><div class="nb-memo-title" style="font-size:15px">विद्युत शक्तिको अनाधिकृत उपयोगको मूल्याङ्कन प्रतिवेदन</div></div>
        <div id="pe-body"></div>
        <div class="nb-sig-row">
          <div class="nb-sig"><div class="ln">तयार गर्ने</div></div>
          <div class="nb-sig"><div class="ln">सिफारिस गर्ने</div></div>
          <div class="nb-sig"><div class="ln">स्वीकृत गर्ने</div></div>
        </div>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px"><button type="button" class="sk-btn sk-bn" id="nb-print-eval-btn">प्रतिवेदन प्रिन्ट</button></div>
      <div class="nb-nav">
        <button type="button" class="sk-btn sk-bg nb-back" data-to="2">← सच्याउनुहोस्</button>
        <button type="button" class="sk-btn sk-bp" id="nb-reset-btn">नयाँ केस</button>
      </div>
    </div>
  </div>
</div>`;
}

function nbStep(n){R.querySelectorAll('.nb-step').forEach((s,i)=>s.classList.toggle('on',i+1===n));R.querySelectorAll('.nb-card').forEach((c,i)=>c.classList.toggle('on',i+1===n));if(n===2)recalc();if(n===3)nbPreview();window.scrollTo(0,0);}
function applyTheft(){
 theftType=el('nb-theft').value;const hook=theftType==='hook';
 ['nb-cno-f','nb-cid-f','nb-meter-f','nb-cat-f','nb-amps-f'].forEach(id=>el(id).style.display=hook?'none':'');
 el('nb-hook-note').style.display=hook?'':'none';
 if(hook){el('nb-cat').value='d5';el('nb-amps').value=5;['nb-cno','nb-cid','nb-meter'].forEach(id=>el(id).value='');if(estMethod==='avg')setMethod('load');el('nb-m-avg').style.display='none';}else el('nb-m-avg').style.display='';
 recalc(true);
}
function syncCatAmps(){const c=el('nb-cat').value;const map={d5:5,d15:15,d30:30,d60:60};if(map[c])el('nb-amps').value=map[c];}
function currentCat(){return theftType==='hook'?'d5':el('nb-cat').value;}
function currentKva(){const a=+el('nb-amps').value||5;return a*230/1000;}
function setMethod(m){estMethod=m;el('nb-m-load').classList.toggle('on',m==='load');el('nb-m-avg').classList.toggle('on',m==='avg');el('nb-load-panel').style.display=m==='load'?'':'none';el('nb-avg-panel').style.display=m==='avg'?'':'none';recalc();}
function setUseMode(u){useMode=u;el('nb-u-res').classList.toggle('on',u==='res');el('nb-u-com').classList.toggle('on',u==='com');R.querySelectorAll('#nb-abody tr').forEach(tr=>{const idx=+tr.querySelector('.an').value;const p=APPL[idx][u];tr.querySelector('.adf').value=p.df;tr.querySelector('.alf').value=p.lf;tr.querySelector('.ah').value=p.hrs;tr.querySelector('.ad').value=p.days;});recalc();}
function buildFeeRows(){
 const active=['line_cut','line_join','reading_seal','box_seal_office','terminal_seal'];const box=el('nb-fee-rows');box.innerHTML='';
 Object.entries(FEES).forEach(([k,f])=>{const on=active.includes(k);const row=document.createElement('div');row.className='nb-totrow';
  row.innerHTML=`<span><label style="font-weight:600;display:flex;gap:6px;align-items:center"><input type="checkbox" class="fee-on" data-k="${k}" ${on?'checked':''} style="width:auto"> ${f.label}</label></span><input type="number" step="0.01" class="fee-amt" data-k="${k}" value="${f.amount.toFixed(2)}">`;
  box.appendChild(row);});
 box.querySelectorAll('.fee-on,.fee-amt').forEach(i=>i.addEventListener('input',()=>recalc()));
}
function renderExtras(){
 const box=el('nb-extra-rows');box.innerHTML='';
 extras.forEach((ex,i)=>{const row=document.createElement('div');row.className='nb-extra-row';
  row.innerHTML=`<input class="lbl" placeholder="विवरण (जस्तै: ढुवानी)" value="${(ex.label||'').replace(/"/g,'&quot;')}"><input class="amt" type="number" step="0.01" value="${ex.amount}"><button type="button" class="nb-x">✕</button>`;
  row.querySelector('.lbl').addEventListener('input',e=>{extras[i].label=e.target.value;});
  row.querySelector('.amt').addEventListener('input',e=>{extras[i].amount=+e.target.value||0;recalc();});
  row.querySelector('.nb-x').addEventListener('click',()=>{extras.splice(i,1);renderExtras();recalc();});
  box.appendChild(row);});
}
/* ═══ स्वीकृत लोड — meter-badali/chhutbill मोड्युलकै भरपर्दो पार्सर (लेबल लाइनमा भर पर्दैन) ═══ */
const AMPS=[5,15,30,60];
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
function nbMpStatus(msg,kind){const e=el('nb-mp-status');e.textContent=msg||'';e.style.color=kind==='warn'?'#d97706':kind==='err'?'#dc2626':'#16a34a';}
function nbParseMpower(){
 const raw=el('nb-mp-paste').value||'';if(!raw.trim()){nbMpStatus('पेस्ट बक्स खाली छ।','warn');return;}
 const lines=raw.split(/\r?\n|\t/).map(l=>l.trim()).filter(l=>l);
 // ── ग्राहकको नाम/आइ.डि./ग्राहक नं. — मिटर बदली/छुट बिल मोड्युलकै भरपर्दो ढाँचा (एक्सेल लेबल लाइनमा भर पर्दैन) ──
 const rowM=raw.match(/(.+?)\s+(\d{12})\s+(\d{3}\.\d{2}\.\d{3}[A-Z]{0,4})\s+(\S+)/);
 let name='',cid='',cno='';
 if(rowM){name=rowM[1].replace(/^(Mr|Mrs|Miss)\.?\s*/i,'').trim();cid=rowM[2];cno=rowM[3];}
 else{
  cid=(raw.match(/\b\d{12}\b/)||[])[0]||'';
  cno=(raw.match(/\b\d{3}\.\d{2}\.\d{3}[A-Z]{0,4}\b/)||[])[0]||'';
  const m=raw.match(/([A-Z][A-Z\s]+?)\s+\d{12}/);
  if(m)name=m[1].trim();
 }
 // ── मिटर नम्बर — लेबलपछि ──
 let meter=(raw.match(/meter\s*no\.?\s*[:\-]?\s*[\r\n]*\s*([A-Za-z0-9\-]+)/i)||[])[1]||'';
 // ── वर्गीकरण पाठ (DOMESTIC/COMMERCIAL/INDUSTRIAL) — पूरै पेस्टमा जहाँसुकै भए पनि भेट्टाउने ──
 const catTxt=(raw.match(/\b(NON[- ]?COMMERCIAL|DOMESTIC|COMMERCIAL|INDUSTRIAL)\b[^\r\n]*/i)||[])[0]||'';
 // ── स्वीकृत लोड — छुट्टै "Load" मानबाट ──
 const amp=parseLoad(raw);
 // ── पुरानो लेबल-आधारित पार्सर — माथिको नियमित अभिव्यक्तिले नभेट्टाएको जानकारी (जस्तै तारिफ/मिटर) परिपूरण गर्न ──
 const LABELS={consumername:'name',consumerid:'cid',consumerno:'cno',meterno:'meter',category:'cat',tarrifcode:'tariff',tariffcode:'tariff',load:'load',meterdigitmf:'_skip',meterdigit:'_skip',status:'_status'};
 const norm=s=>(s||'').toLowerCase().replace(/[.,\s]/g,'');const isLabel=s=>Object.prototype.hasOwnProperty.call(LABELS,norm(s));
 const found={};
 for(let i=0;i<lines.length;i++){if(!isLabel(lines[i]))continue;if(norm(lines[i])==='status')break;const labelRun=[];let j=i;while(j<lines.length&&isLabel(lines[j])&&norm(lines[j])!=='status'){labelRun.push(LABELS[norm(lines[j])]);j++;}const values=[];let k=j;while(k<lines.length&&values.length<labelRun.length){if(norm(lines[k])==='status')break;values.push(lines[k]);k++;}labelRun.forEach((key,idx)=>{if(key==='_skip'||key==='_status')return;if(found[key]===undefined&&values[idx]!==undefined)found[key]=values[idx];});i=k-1;}
 if(!name&&found.name)name=found.name.replace(/^Mr\.\s*/i,'').trim();
 if(!cid&&found.cid)cid=found.cid.trim();
 if(!cno&&found.cno)cno=found.cno.trim();
 if(!meter&&found.meter)meter=found.meter.trim();
 const cat=catTxt||(found.cat||'').trim();
 // ── मासिक खपत/स्थिति (STATUS) पङ्क्तिहरू ──
 const statusIdx=lines.findIndex(l=>l.toLowerCase()==='status');const rows=[];
 if(statusIdx>=0){const dl=lines.slice(statusIdx+1);for(let i=0;i<=dl.length-6;i+=6){const yr=parseInt(dl[i]),mo=parseInt(dl[i+1]),prev=parseInt(dl[i+2]),units=parseInt(dl[i+4]),st=dl[i+5]||'Normal';if(yr>=2070&&yr<=2090&&mo>=1&&mo<=12&&!isNaN(prev)&&!isNaN(units))rows.push({yr,mo,units,status:st.trim()});}}
 const gotInfo=!!(name||cid||cno||meter);
 if(!rows.length&&!gotInfo){nbMpStatus('ग्राहक विवरण फेला परेन — पेस्ट जाँच्नुहोस्।','err');return;}
 MPOWER_ROWS=rows;
 if(name)el('nb-naam').value=name;
 if(theftType!=='hook'){
  if(cid)el('nb-cid').value=trimId(cid);
  if(cno)el('nb-cno').value=cno;
  const c=cat.toLowerCase();
  if(/domestic/i.test(c)&&!/non/.test(c)){
   if(amp===60)el('nb-cat').value='d60';else if(amp===30)el('nb-cat').value='d30';else if(amp===15)el('nb-cat').value='d15';else el('nb-cat').value='d5';
  }else if(/commercial/i.test(c))el('nb-cat').value='com';else if(/industrial/i.test(c))el('nb-cat').value='ind_sml';
  if(amp>0)el('nb-amps').value=amp;else syncCatAmps();
 }
 if(meter)el('nb-meter').value=meter;
 nbMpStatus(rows.length?`पार्स सफल — ${rows.length} महिनाको डेटा फेला परे।`:'ग्राहक विवरण भरियो ✓','ok');
}
function applOpts(sel){return APPL.map((a,i)=>`<option value="${i}" ${i===sel?'selected':''}>${a.name}</option>`).join('');}
function addApplRow(idx,qty){
 idx=idx??APPL.length-1;const a=APPL[idx],p=a[useMode];const tr=document.createElement('tr');
 tr.innerHTML=`<td class="asn"></td><td><select class="an">${applOpts(idx)}</select></td><td><input class="aq" type="number" min="0" value="${qty??a.qty}"></td><td><input class="aw" type="number" min="0" value="${a.watt}"></td><td class="num atw">0</td><td><input class="adf" type="number" min="0" step="0.05" value="${p.df}"></td><td><input class="alf" type="number" min="0" step="0.05" value="${p.lf}"></td><td><input class="ah" type="number" min="0" step="0.25" value="${p.hrs}"></td><td><input class="ad" type="number" min="0" value="${p.days}"></td><td class="num au">0.000</td><td><button type="button" class="nb-x">✕</button></td>`;
 el('nb-abody').appendChild(tr);
 tr.querySelector('.an').addEventListener('change',()=>{const i2=+tr.querySelector('.an').value,a2=APPL[i2],p2=a2[useMode];tr.querySelector('.aw').value=a2.watt;tr.querySelector('.adf').value=p2.df;tr.querySelector('.alf').value=p2.lf;tr.querySelector('.ah').value=p2.hrs;tr.querySelector('.ad').value=p2.days;recalc();});
 ['.aq','.aw','.adf','.alf','.ah','.ad'].forEach(cl=>tr.querySelector(cl).addEventListener('input',()=>recalc()));
 tr.querySelector('.nb-x').addEventListener('click',()=>{tr.remove();recalc();});
}
function seedApplRows(){APPL.forEach((a,i)=>{if(a.qty>0)addApplRow(i,a.qty);});}
function genStatus(msg,kind){const e=el('nb-gen-status');e.textContent=msg||'';e.style.color=kind==='warn'?'#d97706':kind==='err'?'#dc2626':'#16a34a';}
function genRows(){
 const insp=parseBSDate(el('nb-insp').value);if(!insp){genStatus('निरीक्षण मिति (YYYY-MM-DD) राख्नुहोस्।','warn');return;}
 const n=+el('nb-period').value||12;let baseY=insp.y,baseM=insp.m;const all=[];let y=baseY,m=baseM;
 for(let i=0;i<n;i++){all.push([y,m]);m--;if(m<1){m=12;y--;}}all.reverse();
 const clamped=all;
 genStatus('');
 const old={};R.querySelectorAll('#nb-ebody tr').forEach(tr=>{old[tr.dataset.yr+'-'+tr.dataset.mo]={bu:tr.querySelector('.bu').value};});
 const mp={};MPOWER_ROWS.forEach(r=>mp[r.yr+'-'+r.mo]=r);
 el('nb-ebody').innerHTML='';
 clamped.forEach(([yr,mo])=>{addEvalRow(yr,mo);const tr=el('nb-ebody').lastElementChild;const prev=old[yr+'-'+mo];if(prev)tr.querySelector('.bu').value=prev.bu;else if(mp[yr+'-'+mo]&&theftType!=='hook')tr.querySelector('.bu').value=mp[yr+'-'+mo].units;});
 recalc();
}
function addEvalRow(year,month){
 const t=bsToday();const tr=document.createElement('tr');tr.dataset.yr=year??t.y;tr.dataset.mo=(month??t.m);
 tr.innerHTML=`<td class="yrc">${toNep(year??t.y)}</td><td class="moc">${MNE[month??t.m]}</td><td><input class="bu" type="number" min="0" value="0"></td><td class="num ba">—</td><td class="num eu">—</td><td class="num ea">—</td><td class="num cu">—</td><td class="num ka">—</td><td><button type="button" class="nb-x">✕</button></td>`;
 el('nb-ebody').appendChild(tr);
 tr.querySelector('.bu').addEventListener('input',()=>recalc());
 tr.querySelector('.nb-x').addEventListener('click',()=>{tr.remove();recalc();});
}
function monthlyUnits(){
 if(estMethod==='avg'){const u1=+el('nb-au1').value||0,u2=+el('nb-au2').value||0,u3=+el('nb-au3').value||0;const n=[u1,u2,u3].filter(x=>x>0).length||3;const avg=Math.round((u1+u2+u3)/n);el('nb-avgres').textContent=toNep(avg);return avg;}
 let annual=0;R.querySelectorAll('#nb-abody tr').forEach((tr,i)=>{tr.querySelector('.asn').textContent=toNep(i+1);const q=+tr.querySelector('.aq').value||0,w=+tr.querySelector('.aw').value||0,df=+tr.querySelector('.adf').value||0,lf=+tr.querySelector('.alf').value||0,h=+tr.querySelector('.ah').value||0,d=+tr.querySelector('.ad').value||0;tr.querySelector('.atw').textContent=toNep(q*w);const u=(w/1000)*q*df*lf*h*d;tr.querySelector('.au').textContent=toNep(u.toFixed(3));annual+=u;});
 el('nb-annual').textContent=toNep(annual.toFixed(3));const monthly=Math.round(annual/12);el('nb-monthly').textContent=toNep(monthly);return monthly;
}
let LAST=null;
function recalc(unitsChanged){
 const cat=currentCat(),kva=currentKva();const mu=monthlyUnits();
 let sBU=0,sBA=0,sEU=0,sEA=0,sCU=0,sKA=0;const months=[];
 R.querySelectorAll('#nb-ebody tr').forEach(tr=>{
  const yr=+tr.dataset.yr,mo=+tr.dataset.mo;const bu=+tr.querySelector('.bu').value||0;
  const ba=round2(calcTariff(bu,cat,kva,mo)),eu=mu,ea=round2(calcTariff(eu,cat,kva,mo)),cu=Math.max(0,eu-bu),ka=round2(Math.max(0,ea-ba));
  tr.querySelector('.ba').textContent=fmt(ba);tr.querySelector('.eu').textContent=toNep(eu);tr.querySelector('.ea').textContent=fmt(ea);tr.querySelector('.cu').textContent=toNep(cu);tr.querySelector('.ka').textContent=fmt(ka);
  months.push({yr,mo,bu,br:ba,eu,er:ea,lu:cu,lr:ka});sBU+=bu;sBA+=ba;sEU+=eu;sEA+=ea;sCU+=cu;sKA+=ka;
 });
 el('nb-sbu').textContent=toNep(sBU);el('nb-sba').textContent=fmt(sBA);el('nb-seu').textContent=toNep(sEU);el('nb-sea').textContent=fmt(sEA);el('nb-scu').textContent=toNep(sCU);el('nb-ska').textContent=fmt(sKA);
 const compAuto=Math.max(1000,Math.round(sKA));
 if(unitsChanged||!el('nb-f-comp').value||+el('nb-f-comp').value===0)el('nb-f-comp').value=compAuto;
 const comp=Math.round(+el('nb-f-comp').value||0);
 if(el('nb-repeat').checked)el('nb-f-finepct').value=200;
 const finePct=+el('nb-f-finepct').value||0;const fine=Math.round(comp*finePct/100);el('nb-f-fine').value=fmt(fine);
 let feeItems=[];
 R.querySelectorAll('#nb-fee-rows .fee-on').forEach(chk=>{if(chk.checked){const k=chk.dataset.k;const amt=+R.querySelector(`.fee-amt[data-k="${k}"]`).value||0;feeItems.push({label:FEES[k].label,amount:amt});}});
 extras.forEach(ex=>{if((ex.label&&ex.label.trim())||ex.amount)feeItems.push({label:(ex.label||'अन्य').trim()||'अन्य',amount:+ex.amount||0});});
 const feeSub=round2(feeItems.reduce((s,i)=>s+i.amount,0));
 // ── मू.अ.कर : जरिवाना रकममा मात्र 13% ──
 const fineVat=round2(fine*FINE_VAT_RATE);
 const grand=round2(comp+fine+fineVat+feeSub);
 el('nb-f-fine-vat').value=fmt(fineVat);
 el('nb-f-vatable').value=fmt(feeSub);
 el('nb-f-grand').value=fmt(grand);
 el('nb-st-mu').textContent=toNep(mu)+' युनिट';el('nb-st-cu').textContent=toNep(sCU)+' युनिट';el('nb-st-ka').textContent='रु. '+toNep(fmt(comp));
 LAST={cat,kva,mu,months,sBU,sBA,sEU,sEA,sCU,sKA,comp,finePct,fine,fineVat,feeItems,feeSub,grand};return LAST;
}
function nbPreview(){
 const t=recalc();const v=id=>el(id).value.trim()||'............';const th=THEFTS[theftType];
 const center=el('nb-center').value.trim()||'वितरण केन्द्र';const insp=el('nb-insp').value.trim()||'—';
 const prep=v('nb-sig-prep'),sifaris=v('nb-sig-sifaris'),approve=v('nb-sig-approve');
 el('pm-center').textContent=center;el('pm-head').textContent=el('nb-memo-head').value.trim()||'कार्यालय प्रमुख ज्यू';
 el('pm-body').innerHTML=`उपरोक्त सम्बन्धमा यस वितरण केन्द्र अन्तर्गत पर्ने प्राधिकरणको विधिवत ग्राहक श्री <b>${v('nb-naam')}</b>`+(theftType==='hook'?'':` (आइ.डी. नं. <b>${toNep(v('nb-cid'))}</b>)`)+` को घरमा चुहावट नियन्त्रण टोलीले निरीक्षण गर्ने क्रममा <b>${th.desc}</b> फेला पारेकोले उक्त ग्राहकको ${th.seized} जफत गरी कार्यालयमा ल्याइएको व्यहोरा अनुरोध छ । निज ग्राहकलाई विद्युत शक्तिको अनाधिकृत उपभोग गरेको कसुरमा विद्युत चोरी नियन्त्रण ऐन, 2058 को दफा 7 अनुसार चुहावटमा कारवाही गरी ${estMethod==='load'?'लोडको आधारमा युनिट एभ्रेज गरी सो':'विगत महिनाहरूको खपतको आधारमा युनिट एभ्रेज गरी सो'} बापतको रकम तिराई नियमानुसार ${th.ret} लागी स्वीकृती दिनुहुन श्रीमान्‌लाई अनुरोध गर्दछु ।`;
 el('pm-units').textContent=toNep(t.sCU);el('pm-comp').textContent=toNep(fmt(t.comp));el('pm-total').textContent=toNep(fmt(t.grand));el('pm-prep').textContent=prep;
 el('pe-center').textContent=center;
 const activeA=[...R.querySelectorAll('#nb-abody tr')].map((tr,i)=>({name:APPL[+tr.querySelector('.an').value].name,q:+tr.querySelector('.aq').value||0,w:+tr.querySelector('.aw').value||0,df:tr.querySelector('.adf').value,lf:tr.querySelector('.alf').value,h:tr.querySelector('.ah').value,d:tr.querySelector('.ad').value,u:tr.querySelector('.au').textContent})).filter(a=>a.q>0&&a.w>0);
 let unitMethodHtml='';
 if(estMethod==='avg'){
  unitMethodHtml=`<p style="font-size:12px;color:#555;margin:6px 0">वि.चो.नि.नियमावली, 2059 को नियम 8 अनुसार 3 महिनाको औसत खपतको आधारमा ।</p><table class="nb-doc-tbl" style="max-width:340px"><thead><tr><th>क्र.सं.</th><th>मिति</th><th>युनिट</th></tr></thead><tbody><tr><td>1</td><td>${toNep(v('nb-ad1'))}</td><td class="num">${toNep(el('nb-au1').value||0)}</td></tr><tr><td>2</td><td>${toNep(v('nb-ad2'))}</td><td class="num">${toNep(el('nb-au2').value||0)}</td></tr><tr><td>3</td><td>${toNep(v('nb-ad3'))}</td><td class="num">${toNep(el('nb-au3').value||0)}</td></tr><tr class="total"><td colspan="2">मासिक औसत युनिट</td><td class="num">${toNep(t.mu)}</td></tr></tbody></table>`;
 }else{
  const rows=activeA.map((a,i)=>`<tr><td>${toNep(i+1)}</td><td class="lb">${a.name}</td><td class="num">${toNep((a.w*a.q/1000).toFixed(3))}</td><td class="num">${toNep(a.df)}</td><td class="num">${toNep(a.lf)}</td><td class="num">${toNep(a.h)}</td><td class="num">${toNep(a.d)}</td><td class="num">${toNep(a.u)}</td></tr>`).join('');
  unitMethodHtml=`<p style="font-size:12px;color:#555;margin:6px 0">खपत युनिट = kW × DF × LF × घण्टा/दिन × दिन/वर्ष &nbsp;(${useMode==='res'?'सामान्य':'व्यावसायिक'} प्रयोग)</p><table class="nb-doc-tbl"><thead><tr><th>#</th><th>उपकरण</th><th>kW</th><th>DF</th><th>LF</th><th>hrs</th><th>days</th><th>U/वर्ष</th></tr></thead><tbody>${rows||'<tr><td colspan="8">—</td></tr>'}<tr class="total"><td colspan="7">जम्मा वार्षिक युनिट</td><td class="num">${el('nb-annual').textContent}</td></tr><tr class="total"><td colspan="7">मासिक अनुमान (÷ 12)</td><td class="num">${toNep(t.mu)}</td></tr></tbody></table>`;
 }
 const evalRows=t.months.map(m=>`<tr><td>${toNep(m.yr)}</td><td class="lb">${MNE[m.mo]}</td><td class="num">${toNep(m.bu)}</td><td class="num">${toNep(fmt(m.br))}</td><td class="num">${toNep(m.eu)}</td><td class="num">${toNep(fmt(m.er))}</td><td class="num">${toNep(m.lu)}</td><td class="num">${toNep(fmt(m.lr))}</td></tr>`).join('');
 const feeRows=t.feeItems.map((f,i)=>`<div class="r"><span>${toNep(i+4)}. ${f.label}</span><span class="a">${toNep(fmt(f.amount))}</span></div>`).join('');
 el('pe-body').innerHTML=`
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 24px;font-size:13px;margin:10px 0 14px;border:1px solid #94a3b8;padding:12px 16px;border-radius:6px;background:#eff6ff">
   <div><b>ग्राहकको नाम :</b> ${v('nb-naam')}</div><div><b>ठेगाना :</b> ${v('nb-addr')}</div>
   ${theftType==='hook'?'':`<div><b>ग्राहक नं. :</b> ${toNep(v('nb-cno'))}</div><div><b>आई.डी. :</b> ${toNep(v('nb-cid'))}</div><div><b>स्वीकृत क्षमता :</b> ${toNep(el('nb-amps').value)} Amps</div>`}
   <div><b>निरीक्षण मिति :</b> ${toNep(insp.replace(/-/g,'/'))}</div><div><b>गणना अवधि :</b> ${toNep(el('nb-period').value)} महिना</div></div>
  <div style="font-weight:700;margin:10px 0 4px">1. कसुर गरेको अवस्था</div><p style="font-size:13px;margin:0 0 10px">&nbsp;&nbsp;${th.desc} ।</p>
  <div style="font-weight:700;margin:10px 0 4px">2. कानुनी आधार</div><p style="font-size:13px;margin:0 0 10px">&nbsp;&nbsp;वि.चो.नि.ऐन, 2058 को दफा 7 अनुसार विद्युत शक्तिको अनाधिकृत उपभोग गरेको${el('nb-repeat').checked?' — पुनः कसूर (दफा 11(2)) अनुसार क्षतिपूर्ति 200%':''} ।</p>
  <div style="font-weight:700;margin:10px 0 4px">3. लोड / युनिट मूल्याङ्कन</div>${unitMethodHtml}
  <div style="font-weight:700;margin:14px 0 4px">4. क्षतिपूर्ति मूल्याङ्कन तालिका</div>
  <table class="nb-doc-tbl"><thead><tr><th>वर्ष</th><th>महिना</th><th>बिल U</th><th>बिल रू.</th><th>मू.U</th><th>मू.रू.</th><th>चुहावट</th><th>क्षतिपूर्ति</th></tr></thead><tbody>${evalRows}
  <tr class="total"><td colspan="2">जम्मा</td><td class="num">${toNep(t.sBU)}</td><td class="num">${toNep(fmt(t.sBA))}</td><td class="num">${toNep(t.sEU)}</td><td class="num">${toNep(fmt(t.sEA))}</td><td class="num">${toNep(t.sCU)}</td><td class="num">${toNep(fmt(t.sKA))}</td></tr></tbody></table>
  <div style="font-weight:700;margin:14px 0 4px">5. भुक्तानी गर्नुपर्ने रकम</div>
  <div class="nb-fee-list">
   <div class="r"><span>1. क्षतिपूर्ति रकम रू.</span><span class="a">${toNep(fmt(t.comp))}</span></div>
   <div class="r"><span>2. जरिवाना (${toNep(t.finePct)}%) रू.</span><span class="a">${toNep(fmt(t.fine))}</span></div>
   <div class="r"><span>3. जरिवानामा 13% भ्याट रू.</span><span class="a">${toNep(fmt(t.fineVat))}</span></div>
   ${feeRows}
   <div class="r"><span>सेवा शुल्क + अन्य जम्मा रू.</span><span class="a">${toNep(fmt(t.feeSub))}</span></div>
   <div class="r final"><span>कुल जम्मा रकम रू.</span><span class="a">${toNep(fmt(t.grand))}</span></div></div>`;
}
/* ═══ Excel डाउनलोड — मूल्याङ्कन प्रतिवेदन (प्रिन्ट हुने फारामकै ढाँचा) ═══
   प्रिन्ट पानाकै शीर्षक, ग्राहक विवरण, बुँदा 1–5 (कसुर, कानुनी आधार, लोड/युनिट
   मूल्याङ्कन, क्षतिपूर्ति तालिका, भुक्तानी रकम) र सही पंक्ति उही क्रममा जान्छ ।
   रकम/युनिट Excel मा वास्तविक संख्या भई जान्छन् । */
async function downloadEvalExcel(){
 const ExcelJS=window.ExcelJS;
 if(!ExcelJS){alert('Excel लाइब्रेरी लोड भएन।');return;}
 const t=recalc();
 const v=id=>{const e=el(id);const s=e?String(e.value||'').trim():'';return s||'............';};
 const th=THEFTS[theftType];
 const hook=theftType==='hook';
 const center=el('nb-center').value.trim()||'वितरण केन्द्र';
 const insp=(el('nb-insp').value.trim()||'—').replace(/-/g,'/');

 const wb=new ExcelJS.Workbook();wb.creator='विद्युत चोरी';
 const ws=wb.addWorksheet('मूल्याङ्कन प्रतिवेदन',{
  views:[{showGridLines:false}],
  pageSetup:{paperSize:9,orientation:'portrait',fitToPage:true,fitToWidth:1,fitToHeight:0,
             margins:{left:0.45,right:0.45,top:0.5,bottom:0.4,header:0.25,footer:0.25}}
 });
 const NC=8;
 ws.columns=[{width:7},{width:20},{width:11},{width:12},{width:11},{width:12},{width:11},{width:13}];
 const thin={style:'thin',color:{argb:'FF9AA4B2'}};
 const allB={top:thin,left:thin,bottom:thin,right:thin};
 const HEAD='FFEFF3F8', TOTF='FFE8F0E8';
 let r=1;
 const paint=(c1,c2,fill,bord)=>{for(let x=c1;x<=c2;x++){const c=ws.getCell(r,x);if(fill)c.fill={type:'pattern',pattern:'solid',fgColor:{argb:fill}};if(bord)c.border=allB;}};
 const cellT=(c1,c2,val,o={})=>{
  if(c2>c1)ws.mergeCells(r,c1,r,c2);
  const c=ws.getCell(r,c1);c.value=val;
  c.font={bold:!!o.bold,size:o.size||10};
  c.alignment={horizontal:o.align||'left',vertical:'middle',wrapText:true};
  paint(c1,c2,o.fill,o.border!==false);
  return c;
 };
 const cellN=(col,val,o={})=>{
  const c=ws.getCell(r,col);c.value=Number(val)||0;
  c.numFmt=o.int?'#,##0':(o.dec3?'#,##0.000':'#,##0.00');
  c.font={bold:!!o.bold,size:10};
  c.alignment={horizontal:'right',vertical:'middle'};
  paint(col,col,o.fill,true);
  return c;
 };
 const head=labels=>{labels.forEach((txt,i)=>{const c=ws.getCell(r,i+1);c.value=txt;c.font={bold:true,size:9};c.alignment={horizontal:'center',vertical:'middle',wrapText:true};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:HEAD}};c.border=allB;});r++;};
 const sec=txt=>{cellT(1,NC,txt,{bold:true,border:false});r++;};
 const para=txt=>{cellT(1,NC,txt,{border:false});r++;};

 // ─ शीर्षक ─
 cellT(1,NC,'नेपाल विद्युत प्राधिकरण',{bold:true,size:15,align:'center',border:false});r++;
 cellT(1,NC,center,{bold:true,size:12,align:'center',border:false});r++;
 cellT(1,NC,'विद्युत शक्तिको अनाधिकृत उपयोगको मूल्याङ्कन प्रतिवेदन',{bold:true,size:12,align:'center',border:false});r++;
 r++;

 // ─ ग्राहक विवरण ─
 const kv=(l1,v1,l2,v2)=>{
  cellT(1,2,l1,{bold:true});cellT(3,4,v1);
  cellT(5,6,l2,{bold:true});cellT(7,NC,v2);
  r++;
 };
 kv('ग्राहकको नाम :',v('nb-naam'),'ठेगाना :',v('nb-addr'));
 if(!hook){
  kv('ग्राहक नं. :',toNep(v('nb-cno')),'आई.डी. :',toNep(v('nb-cid')));
  kv('स्वीकृत क्षमता :',toNep(el('nb-amps').value)+' Amps','','');
 }
 kv('निरीक्षण मिति :',toNep(insp),'गणना अवधि :',toNep(el('nb-period').value)+' महिना');
 r++;

 // ─ 1. कसुर गरेको अवस्था ─
 sec('1. कसुर गरेको अवस्था');
 para(th.desc+' ।');
 r++;

 // ─ 2. कानुनी आधार ─
 sec('2. कानुनी आधार');
 para('वि.चो.नि.ऐन, 2058 को दफा 7 अनुसार विद्युत शक्तिको अनाधिकृत उपभोग गरेको'+(el('nb-repeat').checked?' — पुनः कसूर (दफा 11(2)) अनुसार क्षतिपूर्ति 200%':'')+' ।');
 r++;

 // ─ 3. लोड / युनिट मूल्याङ्कन ─
 sec('3. लोड / युनिट मूल्याङ्कन');
 if(estMethod==='avg'){
  para('वि.चो.नि.नियमावली, 2059 को नियम 8 अनुसार 3 महिनाको औसत खपतको आधारमा ।');
  head(['क्र.सं.','मिति','युनिट','','','','','']);
  [['nb-ad1','nb-au1'],['nb-ad2','nb-au2'],['nb-ad3','nb-au3']].forEach((ids,i)=>{
   cellT(1,1,i+1,{align:'center'});cellT(2,2,toNep(v(ids[0])));cellN(3,el(ids[1]).value||0,{int:true});
   cellT(4,NC,'',{});r++;
  });
  cellT(1,2,'मासिक औसत युनिट',{bold:true,fill:HEAD});cellN(3,t.mu,{int:true,bold:true,fill:HEAD});cellT(4,NC,'',{fill:HEAD});r++;
 }else{
  para('खपत युनिट = kW × DF × LF × घण्टा/दिन × दिन/वर्ष  ('+(useMode==='res'?'सामान्य':'व्यावसायिक')+' प्रयोग)');
  head(['क्र.सं.','उपकरण','kW','DF','LF','घण्टा/दिन','दिन/वर्ष','युनिट/वर्ष']);
  let sn=0;
  R.querySelectorAll('#nb-abody tr').forEach(tr=>{
   const q=+tr.querySelector('.aq').value||0,wt=+tr.querySelector('.aw').value||0;
   if(!(q>0&&wt>0))return;
   sn++;
   cellT(1,1,sn,{align:'center'});
   cellT(2,2,APPL[+tr.querySelector('.an').value].name);
   cellN(3,wt*q/1000,{dec3:true});
   cellN(4,tr.querySelector('.adf').value||0);
   cellN(5,tr.querySelector('.alf').value||0);
   cellN(6,tr.querySelector('.ah').value||0);
   cellN(7,tr.querySelector('.ad').value||0,{int:true});
   cellN(8,String(tr.querySelector('.au').textContent).replace(/,/g,''),{dec3:true});
   r++;
  });
  if(!sn){cellT(1,NC,'—',{align:'center'});r++;}
  cellT(1,7,'जम्मा वार्षिक युनिट',{bold:true,align:'right',fill:HEAD});
  cellN(8,String(el('nb-annual').textContent).replace(/,/g,''),{dec3:true,bold:true,fill:HEAD});r++;
  cellT(1,7,'मासिक अनुमान (÷ 12)',{bold:true,align:'right',fill:HEAD});
  cellN(8,t.mu,{int:true,bold:true,fill:HEAD});r++;
 }
 r++;

 // ─ 4. क्षतिपूर्ति मूल्याङ्कन तालिका ─
 sec('4. क्षतिपूर्ति मूल्याङ्कन तालिका');
 head(['वर्ष','महिना','बिल युनिट','बिल रु.','मू. युनिट','मू. रु.','चुहावट युनिट','क्षतिपूर्ति रु.']);
 t.months.forEach(m=>{
  cellT(1,1,String(m.yr),{align:'center'});
  cellT(2,2,MNE[m.mo]);
  cellN(3,m.bu,{int:true});cellN(4,m.br);
  cellN(5,m.eu,{int:true});cellN(6,m.er);
  cellN(7,m.lu,{int:true});cellN(8,m.lr,{bold:true});
  r++;
 });
 cellT(1,2,'जम्मा',{bold:true,align:'center',fill:HEAD});
 cellN(3,t.sBU,{int:true,bold:true,fill:HEAD});cellN(4,t.sBA,{bold:true,fill:HEAD});
 cellN(5,t.sEU,{int:true,bold:true,fill:HEAD});cellN(6,t.sEA,{bold:true,fill:HEAD});
 cellN(7,t.sCU,{int:true,bold:true,fill:HEAD});cellN(8,t.sKA,{bold:true,fill:HEAD});
 r++;r++;

 // ─ 5. भुक्तानी गर्नुपर्ने रकम ─
 sec('5. भुक्तानी गर्नुपर्ने रकम');
 const fee=(label,amount,final)=>{
  cellT(1,6,label,{bold:!!final,fill:final?TOTF:null});
  cellN(7,amount,{bold:!!final,fill:final?TOTF:null});
  cellT(8,NC,'',{fill:final?TOTF:null});
  r++;
 };
 fee('1. क्षतिपूर्ति रकम रु.',t.comp);
 fee('2. जरिवाना ('+toNep(t.finePct)+'%) रु.',t.fine);
 fee('3. जरिवानामा 13% भ्याट रु.',t.fineVat);
 t.feeItems.forEach((f,i)=>fee((i+4)+'. '+f.label+' रु.',f.amount));
 fee('सेवा शुल्क + अन्य जम्मा रु.',t.feeSub);
 fee('कुल जम्मा रकम (भ्याट सहित) रु.',t.grand,true);
 r+=3;

 // ─ सही पंक्ति ─
 [['तयार गर्ने',1,3],['सिफारिस गर्ने',4,5],['स्वीकृत गर्ने',6,8]].forEach(s=>{
  ws.mergeCells(r,s[1],r,s[2]);
  const c=ws.getCell(r,s[1]);c.value=s[0];c.font={size:10};c.alignment={horizontal:'center'};
 });

 const buf=await wb.xlsx.writeBuffer();
 const who=(el('nb-cno').value.trim()||el('nb-naam').value.trim()||'ग्राहक').replace(/[\\/:*?"<>|]/g,'_');
 const blob=new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
 const url=URL.createObjectURL(blob);
 const a=document.createElement('a');a.href=url;a.download='विद्युत_चोरी_प्रतिवेदन_'+who+'.xlsx';
 document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),3000);
}

/* ═══ सत्र स्वतः-सुरक्षण — गल्तिले ब्याक/ट्याब बन्द भएमा अन्तिम सम्पादन फर्किन्छ ═══ */
const AUTOSAVE_KEY='nb_chori_autosave_v1';
let saveTimer=null;
function fieldIds(){return['nb-mp-paste','nb-theft','nb-naam','nb-cno','nb-cid','nb-meter','nb-center','nb-cat','nb-amps','nb-foreman','nb-repeat','nb-insp','nb-period','nb-ad1','nb-ad2','nb-ad3','nb-au1','nb-au2','nb-au3','nb-f-comp','nb-f-finepct','nb-sig-prep','nb-sig-sifaris','nb-sig-approve','nb-memo-date','nb-memo-head'];}
function collectState(){
 const fields={};fieldIds().forEach(id=>{const n=el(id);if(!n)return;fields[id]=n.type==='checkbox'?n.checked:n.value;});
 const fees=[...R.querySelectorAll('#nb-fee-rows .fee-on')].map(chk=>({k:chk.dataset.k,on:chk.checked,amt:+R.querySelector(`.fee-amt[data-k="${chk.dataset.k}"]`).value||0}));
 const appl=[...R.querySelectorAll('#nb-abody tr')].map(tr=>({idx:+tr.querySelector('.an').value,qty:+tr.querySelector('.aq').value||0,watt:+tr.querySelector('.aw').value||0,df:+tr.querySelector('.adf').value||0,lf:+tr.querySelector('.alf').value||0,hrs:+tr.querySelector('.ah').value||0,days:+tr.querySelector('.ad').value||0}));
 const evalRows=[...R.querySelectorAll('#nb-ebody tr')].map(tr=>({yr:+tr.dataset.yr,mo:+tr.dataset.mo,bu:+tr.querySelector('.bu').value||0}));
 const muni=el('nb-addr-muni'),ward=el('nb-addr-ward'),place=el('nb-addr-place'),custom=el('nb-addr-custom'),customWrap=el('nb-addr-custom-wrap');
 const addr={muni:muni?muni.value:'',ward:ward?ward.value:'',place:place?place.value:'',custom:custom?custom.value:'',isCustom:!!(customWrap&&customWrap.style.display==='block')};
 const stepBtn=R.querySelector('.nb-step.on');
 return{fields,fees,appl,evalRows,addr,useMode,estMethod,theftType,extras:extras.map(e=>({label:e.label,amount:e.amount})),mpower:MPOWER_ROWS,step:stepBtn?+stepBtn.dataset.step:1};
}
function scheduleSave(){clearTimeout(saveTimer);saveTimer=setTimeout(()=>{if(R.dataset.nbModule!=='chori')return;S.saveJSON(AUTOSAVE_KEY,collectState());},400);}
function applyState(s){
 if(!s)return;
 if(s.fields&&s.fields['nb-theft']!==undefined)el('nb-theft').value=s.fields['nb-theft'];
 applyTheft();
 if(s.useMode)setUseMode(s.useMode);
 if(s.estMethod)setMethod(s.estMethod);
 if(s.appl){el('nb-abody').innerHTML='';s.appl.forEach(r=>{addApplRow(r.idx,r.qty);const tr=el('nb-abody').lastElementChild;tr.querySelector('.aw').value=r.watt;tr.querySelector('.adf').value=r.df;tr.querySelector('.alf').value=r.lf;tr.querySelector('.ah').value=r.hrs;tr.querySelector('.ad').value=r.days;});}
 if(s.fields)Object.keys(s.fields).forEach(id=>{if(id==='nb-theft')return;const n=el(id);if(!n)return;if(n.type==='checkbox')n.checked=!!s.fields[id];else n.value=s.fields[id];});
 extras=(s.extras||[]).map(e=>({label:e.label||'',amount:+e.amount||0}));renderExtras();
 if(s.fees)s.fees.forEach(f=>{const chk=R.querySelector(`.fee-on[data-k="${f.k}"]`),amt=R.querySelector(`.fee-amt[data-k="${f.k}"]`);if(chk)chk.checked=f.on;if(amt)amt.value=f.amt;});
 if(s.evalRows){el('nb-ebody').innerHTML='';s.evalRows.forEach(r=>{addEvalRow(r.yr,r.mo);const tr=el('nb-ebody').lastElementChild;tr.querySelector('.bu').value=r.bu;});}
 MPOWER_ROWS=s.mpower||[];
 if(s.addr&&s.addr.muni){
  const muni=el('nb-addr-muni'),ward=el('nb-addr-ward'),place=el('nb-addr-place'),custom=el('nb-addr-custom'),toggle=el('nb-addr-toggle-custom');
  muni.value=s.addr.muni;muni.dispatchEvent(new Event('change'));
  if(s.addr.ward){ward.value=s.addr.ward;ward.dispatchEvent(new Event('change'));
   if(s.addr.isCustom){toggle.click();custom.value=s.addr.custom;custom.dispatchEvent(new Event('input'));}
   else if(s.addr.place){place.value=s.addr.place;place.dispatchEvent(new Event('change'));}
  }
 }
 recalc(true);
}
function mount(root){
 R=root;R.dataset.nbModule='chori';R.innerHTML=template();useMode='res';estMethod='load';theftType='hook';extras=[];MPOWER_ROWS=[];
 R.querySelectorAll('.nb-step').forEach(b=>b.addEventListener('click',()=>nbStep(+b.dataset.step)));
 R.querySelectorAll('.nb-next').forEach(b=>b.addEventListener('click',()=>nbStep(+b.dataset.to)));
 R.querySelectorAll('.nb-back').forEach(b=>b.addEventListener('click',()=>nbStep(+b.dataset.to)));
 el('nb-mp-parse').addEventListener('click',nbParseMpower);
 el('nb-mp-clear').addEventListener('click',()=>{el('nb-mp-paste').value='';nbMpStatus('');});
 el('nb-theft').addEventListener('change',applyTheft);
 el('nb-cat').addEventListener('change',()=>{syncCatAmps();recalc(true);});
 el('nb-amps').addEventListener('input',()=>recalc(true));
 el('nb-repeat').addEventListener('change',()=>recalc());
 el('nb-m-load').addEventListener('click',()=>setMethod('load'));
 el('nb-m-avg').addEventListener('click',()=>setMethod('avg'));
 el('nb-u-res').addEventListener('click',()=>setUseMode('res'));
 el('nb-u-com').addEventListener('click',()=>setUseMode('com'));
 ['nb-au1','nb-au2','nb-au3'].forEach(id=>el(id).addEventListener('input',()=>recalc(true)));
 el('nb-f-comp').addEventListener('input',()=>recalc());
 el('nb-f-finepct').addEventListener('input',()=>recalc());
 el('nb-add-extra').addEventListener('click',()=>{extras.push({label:'',amount:0});renderExtras();recalc();});
 el('nb-addappl').addEventListener('click',()=>{addApplRow();recalc(true);});
 el('nb-addrow').addEventListener('click',()=>{addEvalRow();recalc();});
 el('nb-calc').addEventListener('click',()=>recalc());
 el('nb-genrows').addEventListener('click',genRows);
 el('nb-refresh').addEventListener('click',()=>nbPreview());
 el('nb-print-eval-btn').addEventListener('click',()=>printEl(el('nb-print-eval')));
 el('nb-print-memo-btn').addEventListener('click',()=>printEl(el('nb-print-memo')));
 addDocTools(R,'nb-print-memo','nb-print-memo-btn','विद्युत_चोरी_मेमो','word');
 // Save to Excel → प्रिन्ट हुने प्रतिवेदनकै ढाँचामा निर्यात
 addDocTools(R,'nb-print-eval','nb-print-eval-btn','विद्युत_चोरी_प्रतिवेदन','excel',()=>downloadEvalExcel());
 el('nb-reset-btn').addEventListener('click',()=>{S.clearJSON(AUTOSAVE_KEY);mount(R);});
 wireAddress(R,{muni:'nb-addr-muni',ward:'nb-addr-ward',place:'nb-addr-place',custom:'nb-addr-custom',customWrap:'nb-addr-custom-wrap',toggle:'nb-addr-toggle-custom',cancel:'nb-addr-cancel-custom',preview:'nb-addr-preview',hidden:'nb-addr'});
 buildFeeRows();seedApplRows();applyTheft();
 const t=bsToday();el('nb-insp').value=t.y+'-'+pad2(t.m)+'-'+pad2(t.d);if(!el('nb-memo-date').value)el('nb-memo-date').value=t.y+'-'+pad2(t.m)+'-'+pad2(t.d);
 if(!root.dataset.nbAutosaveWiredChori){root.dataset.nbAutosaveWiredChori='1';root.addEventListener('input',scheduleSave);root.addEventListener('change',scheduleSave);root.addEventListener('click',scheduleSave);
  root.addEventListener('keydown',e=>{
   if(e.key!=='Enter')return;
   const t=e.target;
   // भार-आधारित तालिका (nb-abody) — क्रमशः qty/watt/df/lf/hrs/days — Enter ले अर्को हारमा उही स्तम्भमा
   const loadCls=['aq','aw','adf','alf','ah','ad'].find(c=>t.classList.contains(c));
   if(loadCls){
    e.preventDefault();
    const tr=t.closest('tr'),next=tr&&tr.nextElementSibling;
    if(next){const n=next.querySelector('.'+loadCls);if(n){n.focus();n.select();}}
    return;
   }
   // मासिक खपत (nb-ebody) युनिट स्तम्भ
   if(t.classList.contains('bu')){
    e.preventDefault();
    const tr=t.closest('tr'),next=tr&&tr.nextElementSibling;
    if(next){const n=next.querySelector('.bu');if(n){n.focus();n.select();}}
    return;
   }
   // औसत 3 महिना (nb-au1 → nb-au2 → nb-au3)
   const avgChain={'nb-au1':'nb-au2','nb-au2':'nb-au3'};
   if(avgChain[t.id]){
    e.preventDefault();
    const n=el(avgChain[t.id]);if(n){n.focus();n.select();}
   }
  });
 }
 const saved=S.loadJSON(AUTOSAVE_KEY);
 if(saved){applyState(saved);nbStep(saved.step||1);}
 else{genRows();nbStep(1);}
 // Excel सुरक्षन बटन (Energy Theft Report — Desktop)
 if(window.LocalExcelSave)window.LocalExcelSave.addSaveButton(R,'chori');
}

/* ═══ अभिलेख (Excel) का लागि रेकर्ड ═══ */
const REASON_EN={hook:'DIRECT HOOKING',bypass:'METER BYPASS',tapping:'CABLE TAPPING'};
function snapshot(){
 const t=recalc();
 const v=id=>{const e=el(id);return e?String(e.value||'').trim():'';};
 return{
  date:v('nb-insp'),name:v('nb-naam'),cid:v('nb-cid'),cno:v('nb-cno'),
  address:v('nb-addr'),
  unit:Math.round(t.sCU||0),
  amount:round2(t.comp||0),
  amt100:round2((t.fine||0)+(t.fineVat||0)),
  others:round2(t.feeSub||0),
  reason:REASON_EN[theftType]||'METER BYPASS',
  remark:''
 };
}

return {mount,recalc,snapshot};
})(window.NBShared);
