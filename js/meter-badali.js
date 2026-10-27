/* ═══════════════════════════════════════════════════════════════════════
   MODULE 1 — मिटर बदली (Meter Badali)
   ═══════════════════════════════════════════════════════════════════════ */
window.MeterBadali=(function(S){
'use strict';
const {bsToday,pad2,toNep,MONTHS,fmt,round2,VAT,parseBSDate,wireAddress,printEl,addDocTools}=S;
let R; // root element
const el=id=>R.querySelector('#'+id);
const T=window.NBTariff;

function domesticSPParts(units,amp){
 units=Math.max(0,Math.round(units));amp=+amp;
 const minM=T.meterBadali.serviceMin;
 const first=T.meterBadali.firstUnitRate;
 const er=T.meterBadali.energyRates;
 let b;if(units<=20)b=0;else if(units<=30)b=1;else if(units<=50)b=2;else if(units<=100)b=3;else if(units<=250)b=4;else b=5;
 let e=0;
 if(amp===5){if(units>20)e+=20*er.d5Above20;}else e+=Math.min(units,20)*first[amp];
 if(units>20)e+=(Math.min(units,30)-20)*er.b20_30;
 if(units>30)e+=(Math.min(units,50)-30)*er.b30_50;
 if(units>50)e+=(Math.min(units,250)-50)*er.b50_250;
 if(units>250)e+=(units-250)*er.above250;
 return{min:minM[amp][b],e:e};
}
function domesticSP(units,amp){const p=domesticSPParts(units,amp);return p.min+p.e;}
function unitAmt(u){u=Math.max(0,u);return domesticSP(u,+el('nb-amp').value);}
function loadText(){return toNep(el('nb-amp').value)+' एम्पियर';}

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
const METER_DEFAULTS=T.meterBadali.meterDefaults;
const CASES={
 banda:{n:'मिटर बन्द भएको',issue:'मिटर बन्द भएको (नचलेको)',mode:'avg'},
 futeko:{n:'मिटर फुटेको',issue:'मिटर फुटेको',mode:'avg'},
 display:{n:'डिस्प्ले आउट भएको',issue:'मिटरको डिस्प्ले आउट भएको',mode:'avg'},
 terminal:{n:'टर्मिनल प्वाइन्ट जलेको (अंक स्पष्ट)',issue:'मिटरको टर्मिनल प्वाइन्ट जलेको',mode:'anka'},
 jaleko:{n:'मिटर जलेको (अंक नदेखिने)',issue:'मिटर पोलेको / जलेको',mode:'avg'},
 badhi:{n:'बढी खपत भएको (मिटर परीक्षण)',issue:'बढी खपत भएको',mode:'anka'},
 anya:{n:'अन्य',issue:'अन्य',mode:'avg'}
};
const ISSUES=['मिटरको डिस्प्ले आउट भएको','मिटर बन्द भएको (नचलेको)','मिटर फुटेको','मिटरको टर्मिनल प्वाइन्ट जलेको','मिटर जाम भएको','मिटर पोलेको / जलेको','बढी खपत भएको','अन्य'];
/* एक्सेलको "CAUSE OF METER CHANGE" स्तम्भ (N) — प्रतिवेदनका सबै सूत्र यसैमा भर पर्छन्,
   त्यसैले टेम्प्लेटले चिन्ने अङ्ग्रेजी शब्दहरू मात्र। फारममा भने छापिँदैन। */
/* केसको प्रकार → एक्सेलको CAUSE (माथिको सूचीकै मान) */
const TESTRES=['मिटर ठीक रहेको तर ग्राहकले मिटर बदली गर्न चाहेको','मिटर छिटो (फास्ट) चलेको पाइएको','मिटर ढिलो (स्लो) चलेको पाइएको','मिटर ठीक रहेको'];
let useMode='res', estMethod='load';
/* ग्राहक वर्गीकरण अब फारममा देखिँदैन — mPower पेस्टबाट चुपचाप पत्ता लाग्छ र
   केवल मू.अ.कर वर्ग (घरायसी 5% / गैर-घरायसी 13%) तय गर्न प्रयोग हुन्छ ।
   पेस्टमा नभेटिए घरायसी मानिन्छ । */
let vatClass='DOMESTIC';

function monthOpts(sel){return MONTHS.map((m,i)=>`<option value="${i}" ${i===sel?'selected':''}>${m}</option>`).join('');}

function template(){
return `
<div class="nb-container">
  <div class="nb-steps">
    <button type="button" class="nb-step on" data-step="1">1. ग्राहक विवरण</button>
    <button type="button" class="nb-step" data-step="2">2. मूल्याङ्कन र कुल जम्मा</button>
    <button type="button" class="nb-step" data-step="3">3. मूल्याङ्कन तालिका र मेमो</button>
  </div>
  <div class="nb-card on" data-card="1">
    <div class="sk-ch"><span class="sk-ch-t">ग्राहकको विवरण — मिटर बदली</span></div>
    <div class="sk-cb">
      <div class="nb-mp">
        <label class="nb-mp-label">mPower डेटा पेस्ट <small>(ग्राहक विवरण भाग — स्वतः भरिन्छ)</small></label>
        <textarea id="nb-mp-paste" class="nb-mp-paste" rows="4" placeholder="Consumer Meter Reading Report यहाँ पेस्ट गर्नुहोस्..."></textarea>
        <div class="nb-mp-actions">
          <button type="button" class="sk-btn sk-bp" id="nb-mp-parse">स्वत: भर्नुहोस्</button>
          <button type="button" class="sk-btn sk-bg" id="nb-mp-clear">खाली गर्नुहोस्</button>
          <span id="nb-mp-status" class="nb-mp-status"></span>
        </div>
      </div>
      <div class="sk-form-grid">
        <div class="sk-f"><label>ग्राहकको नाम</label><input id="nb-naam" type="text" placeholder="पूरा नाम"></div>
        <div class="sk-f"><label>ग्राहक नं.</label><input id="nb-cno" type="text" placeholder="006.19.038"></div>
        <div class="sk-f"><label>आई.डि.नं.</label><input id="nb-cid" type="text" placeholder="33605"></div>
        <div class="sk-f"><label>टेलिफोन नं.</label><input id="nb-mob" type="tel" placeholder="98XXXXXXXX"></div>
        <div class="sk-f"><label>पुरानो मिटर नम्बर</label><input id="nb-meter" type="text" placeholder="पुरानो मिटर नम्बर"></div>
        <div class="sk-f"><label>मिति <small style="font-weight:400;color:#94a3b8">(आजको — स्वतः)</small></label><input id="nb-miti" type="text" placeholder="YYYY-MM-DD"></div>
        <div class="sk-f"><label>मिटर क्षमता (स्वीकृत लोड) <small style="font-weight:400;color:#94a3b8">(पेस्टको लोडबाट स्वतः)</small></label>
          <input id="nb-amp-disp" type="text" readonly>
          <input id="nb-amp" type="hidden" value="15"></div>
        <div class="sk-f"><label>केसको प्रकार</label>
          <select id="nb-case">${Object.entries(CASES).map(([k,c])=>`<option value="${k}" ${k==='display'?'selected':''}>${c.n}</option>`).join('')}</select></div>
        <div class="sk-f"><label>मिटरको समस्या</label>
          <select id="nb-issue">${ISSUES.map(i=>`<option>${i}</option>`).join('')}</select></div>
        <div class="sk-f" id="nb-issue-other-wrap" style="display:none"><label>समस्या खुलाउनुहोस् <small style="font-weight:400;color:#94a3b8">(अन्य भएमा)</small></label>
          <input id="nb-issue-other" type="text" placeholder="जस्तै : मिटरको सिसा फुटेको"></div>
        <div class="sk-f"><label>फोरमेन / पेश गर्नेको नाम</label><input id="nb-foreman" type="text" placeholder="नाम"></div>
      </div>
      <div class="nb-addr-box">
        <div class="nb-addr-label">ठेगाना</div>
        <div class="nb-addr-grid">
          <div class="sk-f"><label>नगरपालिका<select id="nb-addr-muni"><option value="">— छान्नुहोस् —</option></select></label></div>
          <div class="sk-f"><label>वडा नं.<select id="nb-addr-ward" disabled><option value="">— पहिले नगरपालिका —</option></select></label></div>
        </div>
        <div class="sk-f" style="margin-top:10px"><label>टोल / ठाउँ<select id="nb-addr-place" disabled><option value="">— पहिले वडा —</option></select></label></div>
        <div id="nb-addr-custom-wrap" style="display:none;margin-top:8px">
          <div class="sk-f"><label>नयाँ टोल / ठाउँ<input type="text" id="nb-addr-custom" placeholder="टोल / ठाउँको नाम..."></label></div>
        </div>
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
    <div class="sk-ch"><span class="sk-ch-t">मूल्याङ्कन विधि, तालिका र कुल जम्मा</span></div>
    <div class="sk-cb">
      <div id="nb-eval-wrap">
      <div class="nb-addr-box">
        <div class="nb-addr-label">मूल्याङ्कन विधि — मिटर बन्द अवधिको मासिक युनिट कसरी अनुमान गर्ने?</div>
        <div class="sk-tg">
          <button type="button" class="sk-btn sk-bg on" data-method="load" id="nb-m-load">लोडको आधारमा (अनुसूची–5)</button>
          <button type="button" class="sk-btn sk-bg" data-method="avg" id="nb-m-avg">विगत 3 महिनाको औसत</button>
        </div>
      </div>
      <div id="nb-load-panel">
        <div class="nb-sec-label">जडित विद्युतीय उपकरण (अनुसूची–5) — युनिट = (वाट/1000) × संख्या × डि.फ्या. × लो.फ्या. × घण्टा/दिन × दिन/वर्ष</div>
        <div class="sk-tg" style="margin:8px 0">
          <button type="button" class="sk-btn sk-bg on" data-use="res" id="nb-u-res">सामान्य प्रयोग (घरेलु)</button>
          <button type="button" class="sk-btn sk-bg" data-use="com" id="nb-u-com">व्यावसायिक प्रयोग</button>
        </div>
        <table class="nb-tbl">
          <thead><tr>
            <th style="width:34px">क्र.सं.</th><th style="min-width:150px">विवरण</th><th>संख्या</th><th>वाट</th><th>जम्मा वाट</th>
            <th>डि.फ्या.</th><th>लो.फ्या.</th><th>घण्टा/दिन</th><th>दिन/वर्ष</th><th>खपत युनिट</th><th style="width:34px"></th>
          </tr></thead>
          <tbody id="nb-abody"></tbody>
          <tfoot>
            <tr class="total"><td colspan="9" style="text-align:right">जम्मा वार्षिक खपत युनिट</td><td class="num" id="nb-annual">0.000</td><td></td></tr>
            <tr class="total"><td colspan="9" style="text-align:right">जम्मा मासिक खपत युनिट (वार्षिक ÷ 12)</td><td class="num" id="nb-monthly">0</td><td></td></tr>
          </tfoot>
        </table>
        <div style="margin-top:8px"><button type="button" class="sk-btn sk-bg" id="nb-addappl">+ उपकरण थप्नुहोस्</button></div>
      </div>
      <div id="nb-avg-panel" style="display:none">
        <div class="nb-sec-label">विगत 3 सामान्य महिनाको खपत — औसत नै मासिक मूल्याङ्कित युनिट हुन्छ</div>
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
      <div class="nb-sec-label">मूल्याङ्कन तालिका — मिटर बन्द अवधि</div>
      <div class="nb-addr-box" style="margin-bottom:4px">
        <div class="nb-addr-label" style="margin-bottom:10px">अवधि छान्नुहोस् — देखि / सम्म (महिनाहरू स्वतः थपिन्छन्; अन्तिम महिना आंशिक भए "दिन" कोठामा दिन राख्नुहोस्)</div>
        <div class="sk-form-grid">
          <div class="sk-f"><label>देखि — वर्ष (वि.सं.)</label><input id="nb-fy" type="number" min="2000" max="2199"></div>
          <div class="sk-f"><label>देखि — महिना</label><select id="nb-fm"></select></div>
          <div class="sk-f"><label>सम्म — वर्ष (वि.सं.)</label><input id="nb-ty" type="number" min="2000" max="2199"></div>
          <div class="sk-f"><label>सम्म — महिना</label><select id="nb-tm"></select></div>
        </div>
        <div style="margin-top:10px;display:flex;gap:10px;align-items:center;flex-wrap:wrap">
          <button type="button" class="sk-btn sk-bp" id="nb-genrows">अवधिका महिनाहरू थप्नुहोस्</button>
          <span id="nb-gen-status" class="nb-mp-status"></span>
        </div>
      </div>
      <table class="nb-tbl">
        <thead><tr>
          <th style="width:76px">वर्ष</th><th style="width:100px">महिना</th>
          <th>बिल युनिट</th><th>बिल रकम (रु.)</th>
          <th>मूल्याङ्कित युनिट</th><th>मूल्याङ्कित रकम (रु.)</th>
          <th>छुट युनिट</th><th>क्षतिपूर्ति रकम (रु.)</th><th id="nb-th-vat">भ्याट (रु.)</th><th style="width:70px">दिन</th><th style="width:34px"></th>
        </tr></thead>
        <tbody id="nb-ebody"></tbody>
      </table>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button type="button" class="sk-btn sk-bg" id="nb-addrow">+ महिना थप्नुहोस्</button>
        <button type="button" class="sk-btn sk-bp" id="nb-calc">गणना गर्नुहोस्</button>
      </div>
      <div class="nb-hint">मिटर बन्द अवधिमा बिल भएको युनिट (सामान्यतया 0) "बिल युनिट" मा राख्नुहोस् — बिल रकम स्ल्याब दर अनुसार स्वतः आउँछ। "दिन" खाली भए पूरा महिना; दिन राखेमा मूल्याङ्कित युनिट = मासिक युनिट × दिन ÷ 30।</div>
      </div>
      <div id="nb-last-panel" style="display:none">
        <div class="nb-addr-box">
          <div class="nb-addr-label">बढी खपत — मिटर परीक्षण र अन्तिम युनिट</div>
          <div class="sk-form-grid">
            <div class="sk-f"><label>मिटर परीक्षणको नतिजा</label>
              <select id="nb-testres">${TESTRES.map(x=>`<option>${x}</option>`).join('')}</select></div>
            <div class="sk-f nb-last-only"><label>मिटरमा रहेको अन्तिम युनिट</label><input id="nb-lastu" type="number" min="0" value="0"></div>
            <div class="sk-f nb-last-only"><label>अन्तिम युनिट बापतको रकम (रु.)</label><input id="nb-lasta" readonly></div>
          </div>
          <div class="nb-hint nb-last-only" style="margin-top:8px">बढी खपतको गुनासोमा मिटर खोली परीक्षण गरिन्छ — मिटरमा रहेको अन्तिम युनिट ग्राहकको आई.डी.मा पोष्टिङ गराई सो बापतको रकम र मिटर मूल्य तिराई नयाँ मिटर बदली गरिन्छ।</div>
        </div>
      </div>
      <div id="nb-anka-panel" style="display:none">
        <div class="nb-addr-box">
          <div class="nb-addr-label" id="nb-anka-title">टर्मिनल प्वाइन्ट जलेको — मिटरको अन्तिम अंक स्पष्ट देखिएको (स्टक युनिट पोष्टिङ)</div>
          <div class="nb-hint" style="margin:2px 0 10px">स्टक युनिट = मिटरमा रहेको अन्तिम युनिट − सिस्टममा पोष्टिङ भएको अन्तिम युनिट। मिटर/सिल/सेवामा 13% भ्याट लाग्छ; स्टक महसुलमा घरायसी दर अनुसार 50 युनिटसम्म छुट भई 50 युनिट माथिको महसुलमा मात्र 5% भ्याट लाग्छ (निर्देशिका 2083)।</div>
          <div class="nb-totrows">
            <div class="nb-totrow"><span>1. मिटरमा रहेको अन्तिम युनिट</span><input id="nb-ak-last" type="number" min="0" value="0"></div>
            <div class="nb-totrow"><span>2. सिस्टममा पोष्टिङ्ग भएको अन्तिम युनिट</span><input id="nb-ak-posted" type="number" min="0" value="0"></div>
            <div class="nb-totrow"><span>3. स्टक युनिट (1−2)</span><input id="nb-ak-stock" readonly></div>
            <div class="nb-totrow"><span>4. स्टक युनिट बापतको रकम (रु.)</span><input id="nb-ak-amt" type="number" step="0.01" value="0"></div>
            <div class="nb-totrow"><span id="nb-l-ak-vatable-stock">5. स्टक महसुल — 50 युनिट माथिको भाग (रु.)</span><input id="nb-ak-vatable-stock" readonly></div>
            <div class="nb-totrow"><span id="nb-l-ak-vat-stock">6. सो मा 5% भ्याट (रु.)</span><input id="nb-ak-vat-stock" readonly></div>
            <div class="nb-totrow"><span>7. स्टक रकम जम्मा — 5% भ्याट सहित (4+6) (रु.)</span><input id="nb-ak-stock-total" readonly></div>
            <div class="nb-totrow"><span id="nb-ak-meterlbl">8. नयाँ मिटर मूल्य (रु.)</span><input id="nb-ak-meter" type="number" step="0.01" value="0"></div>
            <div class="nb-totrow"><span>9. टर्मिनल बक्स सिल दस्तुर (रु.)</span><input id="nb-ak-seal" type="number" step="0.01" value="600"></div>
            <div class="nb-totrow"><span>10. सेवा दस्तुर (रु.)</span><input id="nb-ak-service" type="number" step="0.01" value="0"></div>
            <div class="nb-totrow"><span>11. मिटर/सिल/सेवा भ्याट योग्य रकम (8+9+10) (रु.)</span><input id="nb-ak-vatable-goods" readonly></div>
            <div class="nb-totrow"><span>12. सो मा 13% भ्याट (रु.)</span><input id="nb-ak-vat-goods" readonly></div>
            <div class="nb-totrow final"><span>13. कुल रकम — मिटर/सिल/सेवा + 13% भ्याट (11+12) (रु.)</span><input id="nb-ak-grand" readonly></div>
          </div>
        </div>
      </div>
      <div class="nb-stats">
        <div class="nb-stat" id="nb-stat-mu"><div class="l" id="nb-l-mu">मासिक मूल्याङ्कित युनिट</div><div class="v" id="nb-st-mu">0</div></div>
        <div class="nb-stat"><div class="l" id="nb-l-cu">जम्मा छुट (एभ्रेज) युनिट</div><div class="v" id="nb-st-cu">0</div></div>
        <div class="nb-stat diff"><div class="l" id="nb-l-ka">क्षतिपूर्ति रकम</div><div class="v" id="nb-st-ka">रु. 0.00</div></div>
      </div>
      <div class="nb-addr-box" id="nb-fees-box">
        <div class="nb-addr-label">कुल जम्मा</div>
        <div class="nb-totrows">
          <div class="nb-totrow"><span id="nb-l1">1. क्षतिपूर्ति रकम — भ्याट सहित (रु.)</span><input id="nb-f-ksh" readonly></div>
          <div class="nb-totrow"><span>2. मिटर बक्स र टर्मिनल सिल दस्तुर (रु.)</span><input id="nb-f-seal" type="number" step="0.01" value="600"></div>
          <div class="nb-totrow"><span id="nb-f-meterlbl">3. मिटर मोल (रु.)</span><input id="nb-f-meter" type="number" step="0.01" value="0"></div>
          <div class="nb-totrow"><span>4. अन्य दस्तुर (रु.)</span><input id="nb-f-other" type="number" step="0.01" value="0"></div>
          <div class="nb-totrow"><span>5. मिटर/सिल/अन्य भ्याट योग्य रकम (2+3+4) (रु.)</span><input id="nb-f-vatable" readonly></div>
          <div class="nb-totrow"><span>6. सो मा 13% भ्याट (रु.)</span><input id="nb-f-vat-goods" readonly></div>
          <div class="nb-totrow final"><span>7. कुल जम्मा (1+5+6) (रु.)</span><input id="nb-f-grand" readonly></div>
        </div>
        <div class="nb-hint" style="margin-top:8px">क्षतिपूर्ति महसुलको मू.अ.कर <b>माथिको मासिक तालिकाको “भ्याट” महलमा</b> महिना-अनुसार गणना हुन्छ — घरायसीमा 50 युनिटसम्म छुट भई माथिको महसुलमा 5%, गैर-घरायसीमा पहिलो युनिटदेखि सम्पूर्ण महसुलमा 13%। सिल दस्तुर, मिटर मोल र अन्य दस्तुरमा सधैं 13%। <b>निर्देशिका 2083 भदौ 1 देखि लागू</b> — सो अघिका महिनाको महसुलमा भ्याट लाग्दैन।</div>
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
      <div id="nb-terminal-wrap" style="display:none">
        <div class="nb-sec-label" id="nb-terminal-sec">1. टर्मिनल प्वाइन्ट जलेको — विवरण मेमो</div>
        <div class="nb-doc" id="nb-print-terminal">
          <div class="nb-tb-head"><div class="o">नेपाल विद्युत प्राधिकरण</div><div class="c">तौलिहवा वितरण केन्द्र</div><div class="m">मेमो</div></div>
          <div class="nb-tb-miti">मिति : <span id="tb-miti"></span></div>
          <div style="font-weight:700;font-size:13.5px;margin-bottom:4px">ग्राहकको विवरण :</div>
          <div class="nb-tb-cust">
            <div class="k">ग्राहकको नाम :</div><div id="tb-naam"></div>
            <div class="k">स्वीकृत क्षमता :</div><div id="tb-amp"></div>
            <div class="k">ग्राहक नम्बर :</div><div id="tb-cno"></div>
            <div class="k">ठेगाना :</div><div id="tb-addr"></div>
            <div class="k">आईडी नं. :</div><div id="tb-cid"></div>
            <div class="k">ग्राहक वर्गीकरण :</div><div id="tb-class"></div>
          </div>
          <table class="nb-tb-list"><tbody>
            <tr><td class="no">1</td><td class="lbl">मिटरमा रहेको अन्तिम युनिट :</td><td class="val" id="tb-last"></td></tr>
            <tr><td class="no">2</td><td class="lbl">सिस्टममा पोष्टिङ्ग भएको अन्तिम युनिट :</td><td class="val" id="tb-posted"></td></tr>
            <tr><td class="no">3</td><td class="lbl">स्टक युनिट :</td><td class="val" id="tb-stock"></td></tr>
            <tr><td class="no">4</td><td class="lbl">स्टक युनिट बापतको रकम रु. :</td><td class="val" id="tb-amt"></td></tr>
            <tr><td class="no">5</td><td class="lbl">स्टक महसुल 50 युनिट माथिको भाग रु. :</td><td class="val" id="tb-vatable-stock"></td></tr>
            <tr><td class="no">6</td><td class="lbl">सो मा 5% भ्याट रु. :</td><td class="val" id="tb-vat-stock"></td></tr>
            <tr><td class="no">7</td><td class="lbl">स्टक रकम जम्मा (5% भ्याट सहित) रु. :</td><td class="val" id="tb-stock-total"></td></tr>
            <tr><td class="no">8</td><td class="lbl" id="tb-meterlbl">सिंगल फेज मिटर मूल्य रु. :</td><td class="val" id="tb-meter"></td></tr>
            <tr><td class="no">9</td><td class="lbl">टर्मिनल + बक्स सिल दस्तुर :</td><td class="val" id="tb-seal"></td></tr>
            <tr><td class="no">10</td><td class="lbl">सेवा दस्तुर :</td><td class="val" id="tb-service"></td></tr>
            <tr><td class="no">11</td><td class="lbl">मिटर/सिल/सेवामा 13% भ्याट रु. :</td><td class="val" id="tb-vat-goods"></td></tr>
          </tbody></table>
          <div class="nb-tb-grand"><span>कुल रकम — मिटर/सिल/सेवा + 13% भ्याट</span><span class="box" id="tb-grand"></span></div>
          <div class="nb-sig-row">
            <div class="nb-sig"><div class="ln">तयार गर्ने</div></div>
            <div class="nb-sig"><div class="ln">सिफारिस गर्ने</div></div>
            <div class="nb-sig"><div class="ln">स्वीकृत गर्ने</div></div>
          </div>
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px"><button type="button" class="sk-btn sk-bn" id="nb-print-terminal-btn">टर्मिनल विवरण मेमो प्रिन्ट</button></div>
        <div class="nb-sec-label" style="margin-top:8px">2. मेमो</div>
        <div class="nb-doc" id="nb-print-terminal-memo">
          <div class="nb-doc-head"><div class="o">नेपाल विद्युत प्राधिकरण</div><div class="c">तौलिहवा वितरण केन्द्र</div><div class="nb-memo-title">मेमो</div></div>
          <div class="nb-memo-fromto"><span>लाई : कार्यालय प्रमुख ज्यू</span><span>बाट : मिटर सिकायत फाँट</span></div>
          <div class="nb-memo-subj">विषय : मिटर बदली सम्बन्धमा ।</div>
          <div class="nb-memo-body" id="ptm-body"></div>
          <div class="nb-memo-line"><span id="ptm-ul1">स्टक युनिट</span> : <span id="ptm-units"></span> युनिट ।</div>
          <div class="nb-memo-line"><span id="ptm-ul2">स्टक युनिट बापतको रकम (5% भ्याट सहित)</span> : रु. <span id="ptm-amt"></span> मात्र ।</div>
          <div class="nb-memo-aaya">श्री आय फाँट : निज ग्राहकको आइ.डी.मा माथि उल्लेखित युनिट र उक्त युनिट बापतको रकम पोष्टिङ्ग गराईदिनुहुन अनुरोध छ ।</div>
          <div class="nb-memo-sign"><div class="b">फोरमेन<br><span id="ptm-foreman"></span></div></div>
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px"><button type="button" class="sk-btn sk-bn" id="nb-print-terminal-memo-btn">टर्मिनल मेमो प्रिन्ट</button></div>
      </div>
      <div id="nb-eval-doc-wrap">
      <div class="nb-sec-label">1. मूल्याङ्कन तालिका</div>
      <div class="nb-doc" id="nb-print-eval">
        <div class="nb-doc-head"><div class="o">नेपाल विद्युत प्राधिकरण</div><div class="c">तौलिहवा वितरण केन्द्र</div></div>
        <div class="nb-doc-sub"><span>विषय : मूल्याङ्कन तालिका</span><span>मिति : <span id="pe-miti"></span></span></div>
        <div id="pe-body"></div>
        <div class="nb-sig-row">
          <div class="nb-sig"><div class="ln">तयार गर्ने</div></div>
          <div class="nb-sig"><div class="ln">सिफारिस गर्ने</div></div>
          <div class="nb-sig"><div class="ln">स्वीकृत गर्ने</div></div>
        </div>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end"><button type="button" class="sk-btn sk-bp" id="nb-excel-eval-btn">Excel डाउनलोड (फारामकै ढाँचा)</button><button type="button" class="sk-btn sk-bn" id="nb-print-eval-btn">मूल्याङ्कन तालिका प्रिन्ट</button></div>
      <div class="nb-sec-label" style="margin-top:8px">2. मेमो</div>
      <div class="nb-doc" id="nb-print-memo">
        <div class="nb-doc-head"><div class="o">नेपाल विद्युत प्राधिकरण</div><div class="c">तौलिहवा वितरण केन्द्र</div><div class="nb-memo-title">मेमो</div></div>
        <div class="nb-memo-fromto"><span>लाई : कार्यालय प्रमुख ज्यू</span><span>बाट : मिटर सिकायत फाँट</span></div>
        <div class="nb-memo-subj">विषय : मिटर बदली सम्बन्धमा ।</div>
        <div class="nb-memo-body" id="pm-body"></div>
        <div class="nb-memo-line"><span id="pm-ul1">एभ्रेज युनिट</span> : <span id="pm-units"></span> युनिट ।</div>
        <div class="nb-memo-line"><span id="pm-ul2">एभ्रेज युनिट बापतको रकम</span> : रु. <span id="pm-amt"></span> मात्र ।</div>
        <div class="nb-memo-aaya">श्री आय फाँट : निज ग्राहकको आइ.डी.मा माथि उल्लेखित युनिट र उक्त युनिट बापतको रकम पोष्टिङ्ग गराईदिनुहुन अनुरोध छ ।</div>
        <div class="nb-memo-sign"><div class="b">फोरमेन<br><span id="pm-foreman"></span></div></div>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px;align-items:center">
        <button type="button" class="sk-btn sk-bn" id="nb-print-memo-btn">मेमो प्रिन्ट</button>
      </div>
      </div>
      <div class="nb-nav">
        <button type="button" class="sk-btn sk-bg nb-back" data-to="2">← सच्याउनुहोस्</button>
        <button type="button" class="sk-btn sk-bp" id="nb-reset-btn">नयाँ केस</button>
      </div>
    </div>
  </div>
</div>`;
}

function nbStep(n){
 R.querySelectorAll('.nb-step').forEach((s,i)=>s.classList.toggle('on',i+1===n));
 R.querySelectorAll('.nb-card').forEach((c,i)=>c.classList.toggle('on',i+1===n));
 if(n===3)nbPreview();
 window.scrollTo(0,0);
}
/* mPower ले 12 अंकको आई.डी. दिन्छ — अगाडिका शून्य हटाउने (000000033605 → 33605) */
function trimId(v){v=String(v||'').trim();const t=v.replace(/^0+/,'');return t||v;}
const AMPS=[5,15,30,60];
/* ═══ स्वीकृत लोड (मिटर क्षमता) — पेस्टको "Load" मानबाट झिक्ने, वर्गीकरणबाट होइन ═══
   वर्गीकरण जस्तै DOMESTIC(16-30) हुन सक्छ जहाँ 16-30 भनेको युनिट स्ल्याब हो, एम्पियर होइन —
   त्यसैले लोड सधैं छुट्टै "Load" मानबाट लिइन्छ (जस्तै 15, 30 A) र क्षमता कोठामा राखिन्छ।
   क्रम : (1) "Load"/"Sanctioned Load" शब्दपछिको मान → (2) छुट्टै "NN A" टोकन।
   कोष्ठकभित्रको दायरा (16-30 आदि) एम्पियर मानिँदैन। */
function parseLoad(raw){
 raw=String(raw||'');
 // (1) संख्यापछि सीधै "AMP"/"AMPS" जोडिएको — mPower रिपोर्टको मुख्य ढाँचा (जस्तै "5 AMPS", "15 AMPS")
 let m=raw.match(/\b(\d{1,3}(?:\.\d+)?)\s*AMPS?\b/i);
 if(m&&AMPS.includes(+m[1]))return +m[1];
 // (2) वर्गीकरणको कोष्ठकभित्र (जस्तै DOMESTIC(5A))
 m=raw.match(/\((\d{1,3})\s*A\)/i);
 if(m&&AMPS.includes(+m[1]))return +m[1];
 // (3) "Load"/"Sanctioned Load" शब्दपछि — कोलन/ट्याब/नयाँ लाइन जेसुकै बीचमा भए पनि
 m=raw.match(/\b(?:sanctioned|connected|approved)?\s*load\s*\(?a?\)?\s*[:\-]?\s*[\r\n]*\s*(\d{1,3}(?:\.\d+)?)\s*(?:amp(?:s|ere)?|a)?\b/i);
 if(m&&AMPS.includes(+m[1]))return +m[1];
 // (4) लेबल एउटै लाइनमा मात्र र मान अर्को/त्यसपछिको लाइनमा (mPower ले प्राय: यसरी नै पेस्ट दिन्छ)
 const lines=raw.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
 for(let i=0;i<lines.length;i++){
  if(/^(?:sanctioned|connected|approved)?\s*load\s*\(?a?\)?\s*[:\-]?$/i.test(lines[i])){
   for(let j=i+1;j<Math.min(i+3,lines.length);j++){
    const mm=lines[j].match(/^(\d{1,3}(?:\.\d+)?)\s*(?:amp(?:s|ere)?|a)?$/i);
    if(mm&&AMPS.includes(+mm[1]))return +mm[1];
   }
  }
 }
 // (5) कोष्ठकभित्रको दायरा (जस्तै (16-30)) छाडेर, छुट्टै एम्पियर टोकन खोज्ने
 const cleaned=raw.replace(/\([^)]*\)/g,' ');
 m=cleaned.match(/\b(\d{1,3})\s*A\b/i);
 if(m&&AMPS.includes(+m[1]))return +m[1];
 return 0;
}
/* स्वीकृत लोड सेट गर्ने — लुकेको मान + पढ्ने-मात्र प्रदर्शन दुवै भर्ने */
function setLoad(a){
 a=+a||+el('nb-amp').value||15;
 el('nb-amp').value=a;
 const d=el('nb-amp-disp');if(d)d.value=toNep(a)+' एम्पियर';
}
/* वर्गीकरण अब लोड निर्धारण गर्दैन — केवल मू.अ.कर वर्ग (घरायसी 5% / गैर-घरायसी 13%) पुनर्गणना */
function syncFromClass(){
 recalc(true);
}
/* स्वीकृत लोड (पेस्टबाट) लागू भएपछि प्रदर्शन, मिटर मोल/सिल पूर्वनिर्धारित र गणना मिलाउने */
function syncLoad(){
 setLoad(el('nb-amp').value);
 applyMeterDefaults();
 recalc(true);
}
/* ═══ मू.अ.कर वर्ग (निर्देशिका 2083) ═══
   ग्राहक वर्गीकरण कोठाबाट तय हुन्छ :
     DOMESTIC…  → घरायसी : मासिक 50 युनिटसम्म छुट, माथिको इनर्जी महसुलमा 5%
     अन्य सबै   → गैर-घरायसी : छुट छैन, पहिलो युनिटदेखि सम्पूर्ण महसुलमा 13%
   (COMMERCIAL / INDUSTRIAL / NON-COMMERCIAL आदि लेखे स्वतः 13% मा जान्छ) */
function vatType(){
 const c=String(vatClass||'');
 return /DOMESTIC/i.test(c)||!c.trim() ? 'domestic' : 'nonDomestic';
}
function isVatDomestic(){return vatType()==='domestic';}
function currentCase(){return el('nb-case').value;}
/* मेमो/अनुसूचीमा छापिने समस्या — "अन्य" छानिएमा खुलाइएको व्यहोरा प्रयोग हुन्छ */
function issueText(){
 const sel=el('nb-issue')?el('nb-issue').value:'';
 if(sel==='अन्य'){
  const o=el('nb-issue-other');
  const t=o?o.value.trim():'';
  return t||'अन्य';
 }
 return sel;
}
/* "अन्य" छानिएमा मात्र खुलाउने कोठा देखाउने */
function syncIssueOther(){
 const w=el('nb-issue-other-wrap');
 if(w)w.style.display=(el('nb-issue').value==='अन्य')?'':'none';
}
function caseMode(){return CASES[currentCase()].mode;}
function applyCase(){
 const k=currentCase(),c=CASES[k];
 const iss=el('nb-issue');
 if([...iss.options].some(o=>o.value===c.issue))iss.value=c.issue;
 syncIssueOther();
 const mode=c.mode;
 el('nb-eval-wrap').style.display=mode==='avg'?'':'none';
 // बढी खपत : गणना टर्मिनल (anka) ढाँचामै, तर मिटर परीक्षणको नतिजा छान्ने कोठा देखाउने
 el('nb-last-panel').style.display=(mode==='last'||k==='badhi')?'':'none';
 R.querySelectorAll('.nb-last-only').forEach(n=>n.style.display=mode==='last'?'':'none');
 el('nb-anka-panel').style.display=mode==='anka'?'':'none';
 el('nb-anka-title').textContent=k==='badhi'?'बढी खपत (मिटर परीक्षण) — मिटरको अन्तिम अंक (स्टक युनिट पोष्टिङ)':'टर्मिनल प्वाइन्ट जलेको — मिटरको अन्तिम अंक स्पष्ट देखिएको (स्टक युनिट पोष्टिङ)';
 el('nb-fees-box').style.display=mode==='anka'?'none':'';
 el('nb-l-mu').textContent=mode==='last'?'मिटर परीक्षण':(mode==='anka'?'अन्तिम / पोष्टेड युनिट':'मासिक मूल्याङ्कित युनिट');
 // सामान्य (एभ्रेज) मोडमा यो कार्ड नदेखाउने — मूल्याङ्कित युनिट तालिकामै छ
 el('nb-stat-mu').style.display=(mode==='avg')?'none':'';
 el('nb-l-cu').textContent=mode==='last'?'अन्तिम युनिट':(mode==='anka'?'स्टक युनिट':'जम्मा छुट (एभ्रेज) युनिट');
 el('nb-l-ka').textContent=mode==='last'?'अन्तिम युनिट बापतको रकम':(mode==='anka'?'स्टक रकम (5% भ्याट सहित)':'क्षतिपूर्ति रकम (भ्याट सहित)');
 el('nb-l1').textContent=mode==='last'?'1. अन्तिम युनिट बापतको रकम (रु.)':'1. क्षतिपूर्ति रकम (रु.)';
 recalc(true);
}
function applyMeterDefaults(){
 const d=METER_DEFAULTS[el('nb-amp').value]||METER_DEFAULTS['5'];
 el('nb-f-meter').value=d.price.toFixed(2);el('nb-f-seal').value=d.seal.toFixed(2);
 el('nb-ak-meter').value=d.price.toFixed(2);el('nb-ak-seal').value=d.seal.toFixed(2);
}
function setMethod(m){estMethod=m;el('nb-m-load').classList.toggle('on',m==='load');el('nb-m-avg').classList.toggle('on',m==='avg');el('nb-load-panel').style.display=m==='load'?'':'none';el('nb-avg-panel').style.display=m==='avg'?'':'none';recalc();}
function setUseMode(u){useMode=u;el('nb-u-res').classList.toggle('on',u==='res');el('nb-u-com').classList.toggle('on',u==='com');
 R.querySelectorAll('#nb-abody tr').forEach(tr=>{const idx=+tr.querySelector('.an').value;const p=APPL[idx][u];tr.querySelector('.adf').value=p.df;tr.querySelector('.alf').value=p.lf;tr.querySelector('.ah').value=p.hrs;tr.querySelector('.ad').value=p.days;});recalc();}
function nbMpStatus(msg,kind){const e=el('nb-mp-status');e.textContent=msg||'';e.style.color=kind==='warn'?'#d97706':kind==='err'?'#dc2626':'#16a34a';}
function nbParseMpower(){
 const raw=el('nb-mp-paste').value||'';
 if(!raw.trim()){nbMpStatus('पेस्ट बक्स खाली छ।','warn');return;}
 const set=(id,v)=>{const e=el(id);if(e&&v)e.value=v;};
 // ── ग्राहक विवरण (छुट बिल module कै ढाँचा) ──
 const row=raw.match(/(.+?)\s+(\d{12})\s+(\d{3}\.\d{2}\.\d{3}[A-Z]{0,4})\s+(\S+)/);
 let name='',cid='',cno='';
 if(row){name=row[1].replace(/^(Mr|Mrs|Miss)\.?\s*/i,'').trim();cid=row[2];cno=row[3];}
 else{cid=(raw.match(/\b\d{12}\b/)||[])[0]||'';cno=(raw.match(/\b\d{3}\.\d{2}\.\d{3}[A-Z]{0,4}\b/)||[])[0]||'';const m=raw.match(/([A-Z][A-Z\s]+?)\s+\d{12}/);if(m)name=m[1].trim();}
 if(!name&&!cid&&!cno){nbMpStatus('ग्राहक विवरण फेला परेन — पेस्ट जाँच्नुहोस्।','err');return;}
 set('nb-naam',name);set('nb-cid',trimId(cid));set('nb-cno',cno);
 // ── ग्राहक वर्गीकरण — फारममा देखिँदैन, केवल मू.अ.कर वर्ग तय गर्न चुपचाप राखिन्छ ──
 //    (DOMESTIC → घरायसी 5% ; COMMERCIAL/INDUSTRIAL/NON-COMMERCIAL → गैर-घरायसी 13%)
 //    कोष्ठकभित्रको दायरा (जस्तै DOMESTIC(16-30)) युनिट स्ल्याब हो, एम्पियर होइन।
 const cls=((raw.match(/(DOMESTIC|COMMERCIAL|INDUSTRIAL|NON[- ]?COMMERCIAL)/i)||[])[0]||'').toUpperCase();
 vatClass=cls||'DOMESTIC';
 // ── स्वीकृत लोड — छुट्टै "Load" मानबाट (वर्गीकरणबाट होइन) ──
 const amp=parseLoad(raw);
 if(amp){el('nb-amp').value=amp;syncLoad();}
 syncFromClass();
 nbMpStatus('ग्राहक विवरण भरियो ✓'+(amp?(' — '+toNep(amp)+' एम्पियर'):''),'ok');
}
function applOpts(sel){return APPL.map((a,i)=>`<option value="${i}" ${i===sel?'selected':''}>${a.name}</option>`).join('');}
function addApplRow(idx,qty){
 idx=idx??APPL.length-1;const a=APPL[idx],p=a[useMode];
 const tr=document.createElement('tr');
 tr.innerHTML=`<td class="asn"></td>
  <td><select class="an">${applOpts(idx)}</select></td>
  <td><input class="aq" type="number" min="0" value="${qty??a.qty}"></td>
  <td><input class="aw" type="number" min="0" value="${a.watt}"></td>
  <td class="num atw">0</td>
  <td><input class="adf" type="number" min="0" step="0.05" value="${p.df}"></td>
  <td><input class="alf" type="number" min="0" step="0.05" value="${p.lf}"></td>
  <td><input class="ah" type="number" min="0" step="0.25" value="${p.hrs}"></td>
  <td><input class="ad" type="number" min="0" value="${p.days}"></td>
  <td class="num au">0.000</td>
  <td><button type="button" class="nb-x">✕</button></td>`;
 el('nb-abody').appendChild(tr);
 tr.querySelector('.an').addEventListener('change',()=>{const i2=+tr.querySelector('.an').value,a2=APPL[i2],p2=a2[useMode];tr.querySelector('.aw').value=a2.watt;tr.querySelector('.adf').value=p2.df;tr.querySelector('.alf').value=p2.lf;tr.querySelector('.ah').value=p2.hrs;tr.querySelector('.ad').value=p2.days;recalc();});
 ['.aq','.aw','.adf','.alf','.ah','.ad'].forEach(cl=>tr.querySelector(cl).addEventListener('input',()=>recalc()));
 tr.querySelector('.nb-x').addEventListener('click',()=>{tr.remove();recalc();});
}
function seedApplRows(){APPL.forEach((a,i)=>{if(a.qty>0)addApplRow(i,a.qty);});}
function genStatus(msg,kind){const e=el('nb-gen-status');e.textContent=msg||'';e.style.color=kind==='warn'?'#d97706':kind==='err'?'#dc2626':'#16a34a';}
function genRows(){
 const fy=+el('nb-fy').value,fm=+el('nb-fm').value,ty=+el('nb-ty').value,tm=+el('nb-tm').value;
 if(!fy||!ty){genStatus('वर्ष राख्नुहोस्।','warn');return;}
 const start=fy*12+fm,end=ty*12+tm;
 if(end<start){genStatus('"सम्म" मिति "देखि" भन्दा पहिले हुन सक्दैन।','err');return;}
 genStatus('');
 const old={};
 R.querySelectorAll('#nb-ebody tr').forEach(tr=>{const key=tr.querySelector('.yr').value+'-'+tr.querySelector('.mo').value;old[key]={bu:tr.querySelector('.bu').value,dy:tr.querySelector('.dy').value};});
 el('nb-ebody').innerHTML='';
 for(let i=start;i<=end;i++){const y=Math.floor(i/12),m=i%12;addEvalRow(y,m);const tr=el('nb-ebody').lastElementChild;const prev=old[y+'-'+m];if(prev){tr.querySelector('.bu').value=prev.bu;tr.querySelector('.dy').value=prev.dy;}}
 recalc();
}
function addEvalRow(year,month){
 const t=bsToday();const tr=document.createElement('tr');
 tr.innerHTML=`<td><input class="yr" value="${year??t.y}"></td>
  <td><select class="mo">${monthOpts(month??(t.m-1))}</select></td>
  <td><input class="bu" type="number" min="0" value="0"></td>
  <td class="num ba">—</td><td class="num eu">—</td><td class="num ea">—</td><td class="num cu">—</td><td class="num ka">—</td><td class="num vt">—</td>
  <td><input class="dy" type="number" min="0" max="32" placeholder="पूरा"></td>
  <td><button type="button" class="nb-x">✕</button></td>`;
 el('nb-ebody').appendChild(tr);
 ['.bu','.dy'].forEach(cl=>tr.querySelector(cl).addEventListener('input',()=>recalc()));
 tr.querySelector('.mo').addEventListener('change',()=>recalc());
 tr.querySelector('.nb-x').addEventListener('click',()=>{tr.remove();recalc();});
}
function monthlyUnits(){
 if(estMethod==='avg'){const u1=+el('nb-au1').value||0,u2=+el('nb-au2').value||0,u3=+el('nb-au3').value||0;const n=[u1,u2,u3].filter(x=>x>0).length||3;const avg=Math.round((u1+u2+u3)/(n||1));el('nb-avgres').textContent=toNep(avg);return avg;}
 let annual=0;
 R.querySelectorAll('#nb-abody tr').forEach((tr,i)=>{tr.querySelector('.asn').textContent=toNep(i+1);const q=+tr.querySelector('.aq').value||0,w=+tr.querySelector('.aw').value||0,df=+tr.querySelector('.adf').value||0,lf=+tr.querySelector('.alf').value||0,h=+tr.querySelector('.ah').value||0,d=+tr.querySelector('.ad').value||0;tr.querySelector('.atw').textContent=toNep(q*w);const u=(w/1000)*q*df*lf*h*d;tr.querySelector('.au').textContent=toNep(u.toFixed(3));annual+=u;});
 el('nb-annual').textContent=toNep(annual.toFixed(3));const monthly=Math.round(annual/12);el('nb-monthly').textContent=toNep(monthly);return monthly;
}
// मिटर परीक्षण / अंक जलेको मा महिना तालिका हुँदैन — मितिको महिना नै कर लाग्ने बिन्दु
function caseMonth(){const d=parseBSDate(el('nb-miti').value);return d?{y:d.y,m:d.m}:{y:0,m:0};}
function recalc(unitsChanged){
 const mode=caseMode();const last=mode==='last',anka=mode==='anka';
 let mu=0,sBU=0,sBA=0,sEU=0,sEA=0,sCU=0,sKA=0,sKAtax=0;
 if(anka){
  const lastU=+el('nb-ak-last').value||0,posted=+el('nb-ak-posted').value||0;
  // स्टक युनिट माइनस आए पनि 0 नबनाई जस्ताको तस्तै राख्ने; रकम पनि माइनसमै
  const stock=Math.round(lastU-posted);el('nb-ak-stock').value=stock;
  if(unitsChanged)el('nb-ak-amt').value=(stock>0?round2(unitAmt(stock)):(stock<0?-round2(unitAmt(-stock)):0)).toFixed(2);
  const amt=+el('nb-ak-amt').value||0,mtr2=+el('nb-ak-meter').value||0,seal2=+el('nb-ak-seal').value||0,svc=+el('nb-ak-service').value||0;
  const amp2=+el('nb-amp').value;
  // वस्तु/सेवा (मिटर+सिल+सेवा) → सधैं 13%
  // स्टक महसुल → घरायसी : 50 युनिटसम्म छुट, माथिको महसुलमा 5% ; गैर-घरायसी : पहिलो युनिटदेखि 13%
  const goodsBase2=round2(mtr2+seal2+svc);
  const _dom2=isVatDomestic();
  const stockAbove50=_dom2
   ? (stock>50?round2(Math.max(0,domesticSPParts(stock,amp2).e-domesticSPParts(50,amp2).e)):0)
   : round2(Math.max(0,amt));
  const goodsVat2=T.VAT.onFees(goodsBase2);
  const _cm=caseMonth();
  const stockVat2=T.VAT.onConsumption({consumerType:vatType(),units:Math.max(0,stock),chargeTotal:Math.max(0,amt),chargeAboveFreeUnits:stockAbove50,bsYear:_cm.y,bsMonth:_cm.m}).vat;
  const _kPct2=Math.round(T.VAT.rateFor(vatType())*100);
  el('nb-l-ak-vatable-stock').textContent=_dom2
   ? '5. स्टक महसुल — 50 युनिट माथिको भाग (रु.)'
   : '5. स्टक महसुल — सम्पूर्ण (छुट छैन) (रु.)';
  el('nb-l-ak-vat-stock').textContent='6. सो मा '+toNep(_kPct2)+'% भ्याट (रु.)';
  const vat2=round2(goodsVat2+stockVat2);
  const vatable2=round2(goodsBase2+stockAbove50);
  // भ्याट सहित कुल रकम = मिटर/सिल/सेवा (11) + सो को 13% भ्याट (12) मात्र ।
  // स्टक रकम (7) यहाँ जोडिँदैन — त्यो मेमो मार्फत ग्राहकको आइ.डी.मा पोष्टिङ्ग हुन्छ ।
  const grand2=round2(goodsBase2+goodsVat2);
  el('nb-ak-vatable-stock').value=stockAbove50.toFixed(2);el('nb-ak-vat-stock').value=stockVat2.toFixed(2);
  const stockTotal2=round2(amt+stockVat2);el('nb-ak-stock-total').value=stockTotal2.toFixed(2);
  el('nb-ak-vatable-goods').value=goodsBase2.toFixed(2);el('nb-ak-vat-goods').value=goodsVat2.toFixed(2);
  el('nb-ak-grand').value=grand2.toFixed(2);
  el('nb-st-mu').textContent=toNep(lastU)+' / '+toNep(posted);el('nb-st-cu').textContent=toNep(stock)+' युनिट';
  el('nb-st-ka').textContent='रु. '+toNep(fmt(stockTotal2));
  return{mu:0,sBU:0,sBA:0,sEU:0,sEA:0,sCU:stock,sKA:round2(amt),seal:seal2,mtr:mtr2,oth:svc,goodsBase:goodsBase2,goodsVat:goodsVat2,stockAbove50:stockAbove50,stockVat:stockVat2,stockTotal:stockTotal2,vatable:vatable2,vat:vat2,grand:grand2,last:false,anka:true,ankaLast:lastU,ankaPosted:posted};
 }
 const _amp=+el('nb-amp').value;
 const _dom=isVatDomestic();
 const _rate=T.VAT.rateFor(vatType());
 let sKAvat=0;
 // घरायसी : महिना-अनुसार पहिलो 50 युनिट छुट → 50 माथिको इनर्जी महसुल मात्र करयोग्य
 // गैर-घरायसी : छुट छैन → सम्पूर्ण क्षतिपूर्ति महसुल पहिलो युनिटदेखि करयोग्य
 const en50=u=>u>50?Math.max(0,domesticSPParts(u,_amp).e-domesticSPParts(50,_amp).e):0;
 if(last){const lu=+el('nb-lastu').value||0;const la=round2(unitAmt(lu));el('nb-lasta').value=la.toFixed(2);sCU=lu;sKA=la;const _cm=caseMonth();sKAtax=T.VAT.appliesOn(_cm.y,_cm.m)?round2(_dom?en50(lu):la):0;sKAvat=round2(sKAtax*_rate);}
 else{
  mu=monthlyUnits();
  R.querySelectorAll('#nb-ebody tr').forEach(tr=>{
   const bu=+tr.querySelector('.bu').value||0;const dyRaw=tr.querySelector('.dy').value;const dy=dyRaw===''?null:Math.max(0,parseInt(dyRaw)||0);
   let eu=mu;if(dy!=null)eu=Math.round(mu*dy/30);
   // 5A आंशिक दिन (दिन राखिएको) र युनिट ≤ 20 : महिना पूरा हुँदा 20 नाघ्ने मानी
   // न्यूनतम शुल्क (रु. 30) नलगाई युनिट × रु. 3 (5A को पहिलो 20 युनिट दर) मात्र
   const partialAmt=u=>(dy!=null&&_amp===5&&u<=20)?Math.max(0,Math.round(u))*T.meterBadali.energyRates.d5Above20:unitAmt(u);
   const ba=round2(partialAmt(bu)),ea=round2(partialAmt(eu)),cu=eu-bu,ka=round2(ea-ba); // माइनस आए पनि जस्ताको तस्तै
   tr.querySelector('.ba').textContent=fmt(ba);tr.querySelector('.eu').textContent=String(eu);tr.querySelector('.ea').textContent=fmt(ea);tr.querySelector('.cu').textContent=toNep(cu);tr.querySelector('.ka').textContent=fmt(ka);
   tr.dataset.eu=eu;tr.dataset.ba=ba.toFixed(2);tr.dataset.ea=ea.toFixed(2);tr.dataset.cu=cu;tr.dataset.ka=ka.toFixed(2);tr.dataset.dy=dy==null?'':dy;
   sBU+=bu;sBA+=ba;sEU+=eu;sEA+=ea;sCU+=cu;sKA+=ka;
   // ── सोही महिनाको मू.अ.कर (निर्देशिका 2083 — भदौ 1 देखि मात्र) ──
   //    घरायसी : 50 युनिट माथिको इनर्जी महसुलमा 5%
   //    गैर-घरायसी : पहिलो युनिटदेखि सम्पूर्ण क्षतिपूर्ति महसुलमा 13%
   const _y=+tr.querySelector('.yr').value||0,_m=(+tr.querySelector('.mo').value||0)+1;
   let mBase=0;
   if(T.VAT.appliesOn(_y,_m))mBase=_dom?Math.max(0,en50(eu)-en50(bu)):Math.max(0,ka);
   const mVat=round2(mBase*_rate);
   sKAtax+=mBase;sKAvat+=mVat;
   tr.querySelector('.vt').textContent=fmt(mVat);tr.dataset.vt=mVat.toFixed(2);
  });
 }
 // वस्तु/सेवा (सिल+मिटर मोल+अन्य) → सधैं 13%
 // क्षतिपूर्ति महसुल → घरायसी : 50 युनिट माथिको भागमा 5% ; गैर-घरायसी : पहिलो युनिटदेखि 13%
 const ksh=round2(sKA),kshTax=round2(sKAtax),seal=+el('nb-f-seal').value||0,mtr=+el('nb-f-meter').value||0,oth=+el('nb-f-other').value||0;
 const kRate=T.VAT.rateFor(vatType());
 const kVat=round2(sKAvat);                 // महिना-अनुसार जोडिएको महसुल भ्याट
 const kshWithVat=round2(ksh+kVat);         // क्षतिपूर्ति + सोको भ्याट (आइ.डी.मा पोष्टिङ्ग हुने)
 const goodsBase=round2(seal+mtr+oth),goodsVat=T.VAT.onFees(goodsBase);
 const vatable=goodsBase,vat=round2(goodsVat+kVat),grand=round2(kshWithVat+goodsBase+goodsVat);
 el('nb-th-vat').textContent='भ्याट '+toNep(Math.round(kRate*100))+'% (रु.)';
 el('nb-f-ksh').value=kshWithVat.toFixed(2);el('nb-f-vatable').value=goodsBase.toFixed(2);el('nb-f-vat-goods').value=goodsVat.toFixed(2);
 el('nb-f-grand').value=grand.toFixed(2);
 el('nb-st-mu').textContent=last?el('nb-testres').value.split(' ').slice(0,2).join(' '):toNep(mu)+' युनिट';
 el('nb-st-cu').textContent=toNep(sCU)+' युनिट';el('nb-st-ka').textContent='रु. '+toNep(fmt(kshWithVat));
 return{mu,sBU,sBA,sEU,sEA,sCU,sKA:ksh,kshWithVat,seal,mtr,oth,goodsBase,goodsVat,kshTax,kVat,vatable,vat,grand,last};
}
function monthLabel(tr){const y=tr.querySelector('.yr').value,m=+tr.querySelector('.mo').value;return toNep(y)+'/'+toNep(pad2(m+1));}
function nbPreview(){
 const t=recalc();const v=id=>el(id).value.trim()||'............';
 const miti=toNep(v('nb-miti').replace(/-/g,'/'));const amp=el('nb-amp').value;const issue=issueText();const ldTxt=loadText();
 const anka=t.anka;
 el('nb-terminal-wrap').style.display=anka?'':'none';el('nb-eval-doc-wrap').style.display=anka?'none':'';
 if(anka){
  const cls=String(vatClass||'').trim()||'DOMESTIC';
  el('tb-miti').textContent=miti;el('tb-naam').textContent=v('nb-naam');el('tb-cno').textContent=toNep(v('nb-cno'));el('tb-cid').textContent=toNep(v('nb-cid'));
  el('tb-amp').textContent=toNep(amp)+' AMPS';el('tb-addr').textContent=v('nb-addr');el('tb-class').textContent=cls;
  el('tb-last').textContent=toNep(el('nb-ak-last').value||0);el('tb-posted').textContent=toNep(el('nb-ak-posted').value||0);el('tb-stock').textContent=toNep(el('nb-ak-stock').value||0);
  el('tb-amt').textContent=toNep(fmt(el('nb-ak-amt').value||0));el('tb-meterlbl').textContent='सिंगल फेज '+toNep(amp)+' ए मिटर मूल्य रु. :';el('tb-meter').textContent=toNep(fmt(el('nb-ak-meter').value||0));
  el('tb-seal').textContent=toNep(fmt(el('nb-ak-seal').value||0));el('tb-service').textContent=toNep(fmt(el('nb-ak-service').value||0));el('tb-vat-goods').textContent=toNep(fmt(t.goodsVat));el('tb-vatable-stock').textContent=toNep(fmt(t.stockAbove50));el('tb-vat-stock').textContent=toNep(fmt(t.stockVat));el('tb-stock-total').textContent=toNep(fmt(t.stockTotal));el('tb-grand').textContent=toNep(fmt(t.grand));
  const tcons=`उपरोक्त सम्बन्धमा यस वितरण केन्द्र अन्तर्गत पर्ने ग्राहक श्री <b>${v('nb-naam')}</b> (आई.डी. नं. <b>${toNep(v('nb-cid'))}</b>, स्वीकृत लोड ${ldTxt})`;
  const isBadhi=currentCase()==='badhi';
  el('nb-terminal-sec').textContent=isBadhi?'1. बढी खपत (मिटर परीक्षण) — विवरण मेमो':'1. टर्मिनल प्वाइन्ट जलेको — विवरण मेमो';
  el('ptm-ul1').textContent=isBadhi?'अन्तिम महिनाको युनिट':'स्टक युनिट';
  el('ptm-ul2').textContent=isBadhi?'अन्तिम महिनाको युनिट बापतको रकम (भ्याट सहित)':'स्टक युनिट बापतको रकम (5% भ्याट सहित)';
  if(isBadhi){
   // बढी खपत : गणना टर्मिनल ढाँचामा, मेमोको व्यहोरा भने पहिलेकै (बढी खपत) जस्तै
   el('ptm-body').innerHTML=`${tcons} ले मिटरमा बढी खपत भएको भनी निवेदन दिनुभएको हुनाले निज ग्राहकको मिटर खोली कार्यालयमा ल्याइएको व्यहोरा अनुरोध गर्दछु । निज ग्राहकको मिटर कार्यालयमा ल्याई निरीक्षण तथा परीक्षण गर्दा ${el('nb-testres').value} हुनाले निजलाई मिटरमा रहेको अन्तिम युनिट पोष्टिङ गराई सो बापतको रकम र मिटर मूल्य तिराई नियमानुसार सशुल्क नयाँ मिटर बदलीको लागि स्वीकृति दिनुहुन श्रीमानलाई अनुरोध गर्दछु ।`;
  }else
  el('ptm-body').innerHTML=`${tcons} ले आफ्नो मिटरको टर्मिनल प्वाइन्ट जलेको भनी निवेदन दिनुभएको हुनाले निज ग्राहकको मिटर खोली कार्यालयमा ल्याइएको व्यहोरा अनुरोध गर्दछु । निज ग्राहकको मिटर कार्यालयमा ल्याई निरीक्षण गर्दा मिटरको टर्मिनल प्वाइन्ट जलेको तर मिटरको अन्तिम अंक स्पष्ट देखिएको हुनाले मिटरमा रहेको अन्तिम युनिट र सिस्टममा पोष्टिङ्ग भएको अन्तिम युनिटको फरक (स्टक युनिट) निज ग्राहकको आई.डी.मा पोष्टिङ्ग गराई सो बापतको रकम र मिटर मूल्य तिराई नियमानुसार सशुल्क नयाँ मिटर बदलीको लागि स्वीकृति दिनुहुन श्रीमानलाई अनुरोध गर्दछु ।`;
  el('ptm-units').textContent=toNep(t.sCU);el('ptm-amt').textContent=toNep(fmt(t.stockTotal!=null?t.stockTotal:t.sKA));el('ptm-foreman').textContent=v('nb-foreman');
  return;
 }
 el('pe-miti').textContent=miti;
 const last=t.last;const testres=el('nb-testres').value;let methodHtml='';
 if(last){
  methodHtml=`<div style="font-weight:700;margin:8px 0 2px">2. मिटर परीक्षण तथा अन्तिम युनिटको विवरण :</div>
  <table class="nb-doc-tbl" style="max-width:520px"><tbody>
   <tr><td class="lb" style="font-weight:700">गुनासोको व्यहोरा</td><td class="lb">बढी खपत भएको</td></tr>
   <tr><td class="lb" style="font-weight:700">मिटर परीक्षणको नतिजा</td><td class="lb">${testres}</td></tr>
   <tr><td class="lb" style="font-weight:700">मिटरमा रहेको अन्तिम युनिट</td><td class="num">${toNep(el('nb-lastu').value||0)}</td></tr>
   <tr><td class="lb" style="font-weight:700">अन्तिम युनिट बापतको रकम रु.</td><td class="num">${toNep(fmt(t.sKA))}</td></tr></tbody></table>`;
 }else if(estMethod==='load'){
  const rows=[...R.querySelectorAll('#nb-abody tr')].map((tr,i)=>`<tr><td>${toNep(i+1)}</td><td class="lb">${APPL[+tr.querySelector('.an').value].name}</td><td class="num">${toNep(tr.querySelector('.aq').value||0)}</td><td class="num">${toNep(tr.querySelector('.aw').value||0)}</td><td class="num">${tr.querySelector('.atw').textContent}</td><td class="num">${toNep(tr.querySelector('.adf').value)}</td><td class="num">${toNep(tr.querySelector('.alf').value)}</td><td class="num">${toNep(tr.querySelector('.ah').value)}</td><td class="num">${toNep(tr.querySelector('.ad').value)}</td><td class="num">${tr.querySelector('.au').textContent}</td></tr>`).join('');
  methodHtml=`<div style="font-weight:700;margin:8px 0 2px">2. ग्राहकको घरमा जडान भएको विद्युतीय उपकरणहरूको खपत (${useMode==='res'?'सामान्य':'व्यावसायिक'} प्रयोग — अनुसूची–5) :</div>
  <table class="nb-doc-tbl"><thead><tr><th>क्र.सं.</th><th>विवरण</th><th>संख्या</th><th>वाट</th><th>जम्मा वाट</th><th>डिमाण्ड फ्याक्टर</th><th>लोड फ्याक्टर</th><th>घण्टा/दिन</th><th>दिन/वर्ष</th><th>खपत युनिट</th></tr></thead><tbody>${rows}
  <tr class="total"><td colspan="9" style="text-align:right">जम्मा वार्षिक खपत युनिट</td><td class="num">${el('nb-annual').textContent}</td></tr>
  <tr class="total"><td colspan="9" style="text-align:right">जम्मा मासिक खपत युनिट</td><td class="num">${toNep(t.mu)}</td></tr></tbody></table>`;
 }else{
  methodHtml=`<div style="font-weight:700;margin:8px 0 2px">2. विगत 3 सामान्य महिनाको खपतको औसत :</div>
  <table class="nb-doc-tbl" style="max-width:340px"><thead><tr><th>क्र.सं.</th><th>मिति</th><th>युनिट</th></tr></thead><tbody>
   <tr><td>1</td><td>${toNep(v('nb-ad1'))}</td><td class="num">${toNep(el('nb-au1').value||0)}</td></tr>
   <tr><td>2</td><td>${toNep(v('nb-ad2'))}</td><td class="num">${toNep(el('nb-au2').value||0)}</td></tr>
   <tr><td>3</td><td>${toNep(v('nb-ad3'))}</td><td class="num">${toNep(el('nb-au3').value||0)}</td></tr>
   <tr class="total"><td colspan="2" style="text-align:right">मासिक औसत युनिट</td><td class="num">${toNep(t.mu)}</td></tr></tbody></table>`;
 }
 const evalRows=last?'':[...R.querySelectorAll('#nb-ebody tr')].map(tr=>{const dy=tr.dataset.dy;return `<tr><td>${monthLabel(tr)}</td><td class="num">${toNep(tr.querySelector('.bu').value||0)}</td><td class="num">${toNep(tr.dataset.ba||'0.00')}</td><td class="num">${toNep(tr.dataset.eu||0)}</td><td class="num">${toNep(tr.dataset.ea||'0.00')}</td><td class="num">${toNep(tr.dataset.cu||0)}</td><td class="num">${toNep(tr.dataset.ka||'0.00')}</td><td class="num">${toNep(tr.dataset.vt||'0.00')}</td><td>${dy!==''&&dy!=null?toNep(dy)+' दिनको':''}</td></tr>`;}).join('');
 const evalTableHtml=last?'':`<div style="font-weight:700;margin:8px 0 2px">3. मूल्याङ्कन तालिका :</div>
  <table class="nb-doc-tbl"><thead><tr><th>साल/महिना</th><th>बिल युनिट</th><th>बिल रकम</th><th>मूल्याङ्कित युनिट</th><th>मूल्याङ्कित रकम</th><th>छुट युनिट (4–2)</th><th>रकम फरक (5–3)</th><th>भ्याट</th><th>कैफियत</th></tr>
   <tr><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th></tr></thead><tbody>${evalRows}
   <tr class="total"><td>जम्मा</td><td class="num">${toNep(t.sBU)}</td><td class="num">${toNep(fmt(t.sBA))}</td><td class="num">${toNep(t.sEU)}</td><td class="num">${toNep(fmt(t.sEA))}</td><td class="num">${toNep(t.sCU)}</td><td class="num">${toNep(fmt(t.sKA))}</td><td class="num">${toNep(fmt(t.kVat))}</td><td></td></tr></tbody></table>`;
 const ldEn=amp+'A';
 el('pe-body').innerHTML=`
  <div style="font-weight:700">1. ग्राहकको विवरण :</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;column-gap:24px;font-size:13.5px;margin:4px 0 8px;align-items:start">
   <div style="display:grid;grid-template-columns:130px 1fr;row-gap:4px;column-gap:8px">
    <div style="font-weight:700">ग्राहकको नाम :</div><div>${v('nb-naam')}</div>
    <div style="font-weight:700">ग्राहक नं. :</div><div>${v('nb-cno')}</div>
    <div style="font-weight:700">आई.डि.नं. :</div><div>${v('nb-cid')}</div>
    <div style="font-weight:700">मिटरको अवस्था :</div><div>${issue}</div>
   </div>
   <div style="display:grid;grid-template-columns:130px 1fr;row-gap:4px;column-gap:8px">
    <div style="font-weight:700">स्वीकृत लोड :</div><div>${ldEn}</div>
    <div style="font-weight:700">ठेगाना :</div><div>${v('nb-addr')}</div>
   </div></div>
  ${methodHtml}${evalTableHtml}
  <div class="nb-fee-list">
   <div class="r"><span>1. ${last?'अन्तिम युनिट बापतको रकम':'क्षतिपूर्ति रकम'} — भ्याट सहित रु.</span><span class="a">${toNep(fmt(t.kshWithVat!=null?t.kshWithVat:t.sKA))}</span></div>
   <div class="r"><span>2. मिटर बक्स र टर्मिनल सिल दस्तुर रु.</span><span class="a">${toNep(fmt(t.seal))}</span></div>
   <div class="r"><span>3. मिटर मोल रु.</span><span class="a">${toNep(fmt(t.mtr))}</span></div>
   <div class="r"><span>4. अन्य दस्तुर रु.</span><span class="a">${toNep(fmt(t.oth))}</span></div>
   <div class="r"><span>5. मिटर/सिल/अन्य भ्याट योग्य रकम रु.</span><span class="a">${toNep(fmt(t.vatable))}</span></div>
   <div class="r"><span>6. सो मा 13% भ्याट रु.</span><span class="a">${toNep(fmt(t.goodsVat))}</span></div>
   <div class="r final"><span>7. कुल जम्मा (1+5+6) रु.</span><span class="a">${toNep(fmt(t.grand))}</span></div></div>`;
 const cons=`उपरोक्त सम्बन्धमा यस वितरण केन्द्र अन्तर्गत पर्ने ग्राहक श्री <b>${v('nb-naam')}</b> (आई.डी. नं. <b>${toNep(v('nb-cid'))}</b>, स्वीकृत लोड ${ldTxt})`;
 if(last){
  el('pm-body').innerHTML=`${cons} ले मिटरमा बढी खपत भएको भनी निवेदन दिनुभएको हुनाले निज ग्राहकको मिटर खोली कार्यालयमा ल्याइएको व्यहोरा अनुरोध गर्दछु । निज ग्राहकको मिटर कार्यालयमा ल्याई निरीक्षण तथा परीक्षण गर्दा ${testres} हुनाले निजलाई मिटरमा रहेको अन्तिम युनिट पोष्टिङ गराई सो बापतको रकम र मिटर मूल्य तिराई नियमानुसार सशुल्क नयाँ मिटर बदलीको लागि स्वीकृति दिनुहुन श्रीमानलाई अनुरोध गर्दछु ।`;
  el('pm-ul1').textContent='अन्तिम महिनाको युनिट';el('pm-ul2').textContent='अन्तिम महिनाको युनिट बापतको रकम (भ्याट सहित)';
 }else{
  const issShort=issue.replace(/^मिटरको\s+/,'').replace(/^मिटर\s+/,'');
  el('pm-body').innerHTML=`${cons} को मिटरको ${issShort} भनी निवेदन दिनुभएको हुनाले निज ग्राहकको मिटर खोली कार्यालयमा ल्याइएको व्यहोरा अनुरोध गर्दछु । निज ग्राहकको मिटर कार्यालयमा ल्याई निरीक्षण गर्दा ${issue} पाइएको हुनाले निज ग्राहकले प्रयोग गरेको ${estMethod==='load'?'लोडको आधारमा मिटर युनिट एभ्रेज गरी':'विगत महिनाहरूको खपतको आधारमा मिटर रिडिङ गर्न नमिलेको महिनाको युनिट एभ्रेज गरी'} सो वापतको रकम र मिटर मूल्य तिराई नियमानुसार सशुल्क नयाँ मिटर बदलीको लागि स्वीकृति दिनुहुन श्रीमानलाई अनुरोध गर्दछु ।`;
  el('pm-ul1').textContent=estMethod==='load'?'लोडको आधारमा एभ्रेज युनिट':'एभ्रेज युनिट';el('pm-ul2').textContent='एभ्रेज युनिट बापतको क्षतिपूर्ति रकम (भ्याट सहित)';
 }
 el('pm-units').textContent=toNep(t.sCU);el('pm-amt').textContent=toNep(fmt(t.kshWithVat!=null?t.kshWithVat:t.sKA));el('pm-foreman').textContent=v('nb-foreman');
}

/* ═══ सत्र स्वतः-सुरक्षण — गल्तिले ब्याक/ट्याब बन्द भएमा पनि अन्तिम सम्पादन फर्किन्छ ═══ */
const AUTOSAVE_KEY='nb_meterbadali_autosave_v1';
let saveTimer=null;
function fieldIds(){return['nb-mp-paste','nb-naam','nb-cno','nb-cid','nb-meter','nb-mob','nb-miti','nb-amp','nb-case','nb-issue','nb-issue-other','nb-foreman','nb-fy','nb-fm','nb-ty','nb-tm','nb-testres','nb-lastu','nb-ad1','nb-ad2','nb-ad3','nb-au1','nb-au2','nb-au3','nb-ak-last','nb-ak-posted','nb-ak-amt','nb-ak-meter','nb-ak-seal','nb-ak-service','nb-f-seal','nb-f-meter','nb-f-other'];}
function collectState(){
 const fields={};fieldIds().forEach(id=>{const n=el(id);if(!n)return;fields[id]=n.type==='checkbox'?n.checked:n.value;});
 const appl=[...R.querySelectorAll('#nb-abody tr')].map(tr=>({idx:+tr.querySelector('.an').value,qty:+tr.querySelector('.aq').value||0,watt:+tr.querySelector('.aw').value||0,df:+tr.querySelector('.adf').value||0,lf:+tr.querySelector('.alf').value||0,hrs:+tr.querySelector('.ah').value||0,days:+tr.querySelector('.ad').value||0}));
 const evalRows=[...R.querySelectorAll('#nb-ebody tr')].map(tr=>({yr:tr.querySelector('.yr').value,mo:+tr.querySelector('.mo').value,bu:+tr.querySelector('.bu').value||0,dy:tr.querySelector('.dy').value}));
 const muni=el('nb-addr-muni'),ward=el('nb-addr-ward'),place=el('nb-addr-place'),custom=el('nb-addr-custom'),customWrap=el('nb-addr-custom-wrap');
 const addr={muni:muni?muni.value:'',ward:ward?ward.value:'',place:place?place.value:'',custom:custom?custom.value:'',isCustom:!!(customWrap&&customWrap.style.display==='block')};
 const stepBtn=R.querySelector('.nb-step.on');
 return{fields,appl,evalRows,addr,useMode,estMethod,vatClass,step:stepBtn?+stepBtn.dataset.step:1};
}
function scheduleSave(){clearTimeout(saveTimer);saveTimer=setTimeout(()=>{if(R.dataset.nbModule!=='meter')return;S.saveJSON(AUTOSAVE_KEY,collectState());},400);}
function applyState(s){
 if(!s)return;
 if(s.vatClass)vatClass=s.vatClass;
 if(s.fields&&s.fields['nb-case']!==undefined)el('nb-case').value=s.fields['nb-case'];
 applyCase();
 if(s.useMode)setUseMode(s.useMode);
 if(s.estMethod)setMethod(s.estMethod);
 if(s.appl){el('nb-abody').innerHTML='';s.appl.forEach(r=>{addApplRow(r.idx,r.qty);const tr=el('nb-abody').lastElementChild;tr.querySelector('.aw').value=r.watt;tr.querySelector('.adf').value=r.df;tr.querySelector('.alf').value=r.lf;tr.querySelector('.ah').value=r.hrs;tr.querySelector('.ad').value=r.days;});}
 if(s.fields)Object.keys(s.fields).forEach(id=>{if(id==='nb-case')return;const n=el(id);if(!n)return;if(n.type==='checkbox')n.checked=!!s.fields[id];else n.value=s.fields[id];});
 syncIssueOther();
 if(s.evalRows){el('nb-ebody').innerHTML='';s.evalRows.forEach(r=>{addEvalRow(r.yr,r.mo);const tr=el('nb-ebody').lastElementChild;tr.querySelector('.bu').value=r.bu;if(r.dy!==undefined)tr.querySelector('.dy').value=r.dy;});}
 if(s.addr&&s.addr.muni){
  const muni=el('nb-addr-muni'),ward=el('nb-addr-ward'),place=el('nb-addr-place'),custom=el('nb-addr-custom'),toggle=el('nb-addr-toggle-custom');
  muni.value=s.addr.muni;muni.dispatchEvent(new Event('change'));
  if(s.addr.ward){ward.value=s.addr.ward;ward.dispatchEvent(new Event('change'));
   if(s.addr.isCustom){toggle.click();custom.value=s.addr.custom;custom.dispatchEvent(new Event('input'));}
   else if(s.addr.place){place.value=s.addr.place;place.dispatchEvent(new Event('change'));}
  }
 }
 setLoad(el('nb-amp').value);
 recalc(true);
}

/* ═══ Excel डाउनलोड — मूल्याङ्कन तालिका (PDF फारामकै ढाँचा, पूरा ग्राहक विवरण सहित) ═══
   यो विद्यमान अभिलेख/लेजरभन्दा अलग हो — प्रत्येक ग्राहकको एउटै पानामा फाराम जस्तै निर्यात हुन्छ। */
async function downloadEvalExcel(){
 const ExcelJS=window.ExcelJS;
 if(!ExcelJS){alert('Excel लाइब्रेरी लोड भएन।');return;}
 const t=recalc();
 const g=id=>{const e=el(id);return e?String(e.value||'').trim():'';};
 const NEP='०१२३४५६७८९';
 const toLat=s=>String(s==null?'':s).replace(/[०-९]/g,d=>NEP.indexOf(d));
 const num=s=>{const n=parseFloat(toLat(s).replace(/,/g,'').replace(/[^\d.\-]/g,''));return isNaN(n)?0:n;};
 const amp=el('nb-amp').value;
 const miti=(g('nb-miti')||'').replace(/-/g,'/');
 const issue=issueText();
 const isLast=!!t.last, isAnka=!!t.anka;

 const wb=new ExcelJS.Workbook();wb.creator='मिटर बदली';
 const ws=wb.addWorksheet('मूल्याङ्कन तालिका',{views:[{showGridLines:false}],pageSetup:{paperSize:9,orientation:'portrait',fitToPage:true,fitToWidth:1,fitToHeight:0,margins:{left:0.5,right:0.5,top:0.6,bottom:0.5,header:0.3,footer:0.3}}});
 const NC=10;
 ws.columns=[{width:16},{width:12},{width:9},{width:11},{width:11},{width:11},{width:11},{width:9},{width:9},{width:12}];
 const thin={style:'thin',color:{argb:'FF9AA4B2'}};
 const allB={top:thin,left:thin,bottom:thin,right:thin};
 const setB=c=>{c.border=allB;};
 let r=1;
 const mergeFull=(c1,c2,text,o={})=>{
  ws.mergeCells(r,c1,r,c2);
  const cell=ws.getCell(r,c1);cell.value=text;
  cell.font={bold:!!o.bold,size:o.size||11,italic:!!o.italic};
  cell.alignment={horizontal:o.align||'center',vertical:'middle',wrapText:true};
  if(o.fill)cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:o.fill}};
  if(o.border)for(let c=c1;c<=c2;c++)setB(ws.getCell(r,c));
  return cell;
 };
 const thead=cells=>{cells.forEach(cd=>{if(cd.c2>cd.c1)ws.mergeCells(r,cd.c1,r,cd.c2);const c=ws.getCell(r,cd.c1);c.value=cd.t;c.font={bold:true,size:10};c.alignment={horizontal:'center',vertical:'middle',wrapText:true};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFEFF3F8'}};for(let x=cd.c1;x<=cd.c2;x++)setB(ws.getCell(r,x));});r++;};
 const trow=(cells,o={})=>{cells.forEach(cd=>{if(cd.c2>cd.c1)ws.mergeCells(r,cd.c1,r,cd.c2);const c=ws.getCell(r,cd.c1);c.value=cd.num?(Number(cd.t)||0):cd.t;if(cd.num)c.numFmt=cd.int?'#,##0':'#,##0.00';c.font={bold:!!o.bold,size:10};c.alignment={horizontal:cd.align||(cd.num?'right':'left'),vertical:'middle',wrapText:true};if(o.fill)c.fill={type:'pattern',pattern:'solid',fgColor:{argb:o.fill}};for(let x=cd.c1;x<=cd.c2;x++)setB(ws.getCell(r,x));});r++;};
 const HEAD='FFEFF3F8';

 // ─ शीर्षक ─
 mergeFull(1,NC,'नेपाल विद्युत प्राधिकरण',{bold:true,size:15});r++;
 mergeFull(1,NC,'तौलिहवा वितरण केन्द्र',{bold:true,size:12});r++;
 mergeFull(1,6,'विषय : मूल्याङ्कन तालिका',{bold:true,align:'left'});
 mergeFull(7,NC,'मिति : '+(miti||'............'),{align:'right'});r++;
 r++;

 // ─ 1. ग्राहकको विवरण ─
 mergeFull(1,NC,'1. ग्राहकको विवरण :',{bold:true,align:'left'});r++;
 const kv=(l1,v1,l2,v2)=>{
  const a=ws.getCell(r,1);a.value=l1;a.font={bold:true};a.alignment={vertical:'middle',wrapText:true};
  mergeFull(2,5,v1,{align:'left'});
  const b=ws.getCell(r,6);b.value=l2;b.font={bold:true};b.alignment={vertical:'middle',wrapText:true};
  mergeFull(7,10,v2,{align:'left'});
  r++;
 };
 kv('ग्राहकको नाम :',g('nb-naam'),'स्वीकृत लोड :',amp+'A');
 kv('ग्राहक नं. :',g('nb-cno'),'ठेगाना :',g('nb-addr'));
 kv('आई.डि.नं. :',g('nb-cid'),'मिटरको अवस्था :',issue);
 r++;

 // ─ 2. विधि विवरण ─
 if(isAnka){
  mergeFull(1,NC,'2. टर्मिनल प्वाइन्ट / स्टक युनिट विवरण :',{bold:true,align:'left'});r++;
  trow([{t:'मिटरमा रहेको अन्तिम युनिट',c1:1,c2:5},{t:t.ankaLast||0,c1:6,c2:10,num:true,int:true}]);
  trow([{t:'सिस्टममा पोष्ट भएको युनिट',c1:1,c2:5},{t:t.ankaPosted||0,c1:6,c2:10,num:true,int:true}]);
  trow([{t:'स्टक युनिट',c1:1,c2:5},{t:t.sCU||0,c1:6,c2:10,num:true,int:true}]);
  trow([{t:'स्टक युनिट बापतको रकम (5% भ्याट सहित) रु.',c1:1,c2:5},{t:t.stockTotal||0,c1:6,c2:10,num:true}]);
 }else if(isLast){
  mergeFull(1,NC,'2. मिटर परीक्षण तथा अन्तिम युनिटको विवरण :',{bold:true,align:'left'});r++;
  trow([{t:'गुनासोको व्यहोरा',c1:1,c2:3},{t:'बढी खपत भएको',c1:4,c2:10}]);
  trow([{t:'मिटर परीक्षणको नतिजा',c1:1,c2:3},{t:g('nb-testres'),c1:4,c2:10}]);
  trow([{t:'मिटरमा रहेको अन्तिम युनिट',c1:1,c2:3},{t:+g('nb-lastu')||0,c1:4,c2:10,num:true,int:true}]);
  trow([{t:'अन्तिम युनिट बापतको रकम रु.',c1:1,c2:3},{t:t.sKA,c1:4,c2:10,num:true}]);
 }else if(estMethod==='load'){
  mergeFull(1,NC,'2. जडित विद्युतीय उपकरणको खपत (अनुसूची–5) :',{bold:true,align:'left'});r++;
  thead([{t:'क्र.सं.',c1:1,c2:1},{t:'विवरण',c1:2,c2:2},{t:'संख्या',c1:3,c2:3},{t:'वाट',c1:4,c2:4},{t:'जम्मा वाट',c1:5,c2:5},{t:'डिमाण्ड फ्या.',c1:6,c2:6},{t:'लोड फ्या.',c1:7,c2:7},{t:'घण्टा/दिन',c1:8,c2:8},{t:'दिन/वर्ष',c1:9,c2:9},{t:'खपत युनिट',c1:10,c2:10}]);
  [...R.querySelectorAll('#nb-abody tr')].forEach((tr,i)=>{
   trow([
    {t:i+1,c1:1,c2:1,num:true,int:true,align:'center'},
    {t:(APPL[+tr.querySelector('.an').value]||{}).name||'',c1:2,c2:2},
    {t:+tr.querySelector('.aq').value||0,c1:3,c2:3,num:true,int:true},
    {t:+tr.querySelector('.aw').value||0,c1:4,c2:4,num:true,int:true},
    {t:num(tr.querySelector('.atw').textContent),c1:5,c2:5,num:true,int:true},
    {t:+tr.querySelector('.adf').value||0,c1:6,c2:6,num:true},
    {t:+tr.querySelector('.alf').value||0,c1:7,c2:7,num:true},
    {t:+tr.querySelector('.ah').value||0,c1:8,c2:8,num:true},
    {t:+tr.querySelector('.ad').value||0,c1:9,c2:9,num:true,int:true},
    {t:num(tr.querySelector('.au').textContent),c1:10,c2:10,num:true}
   ]);
  });
  trow([{t:'जम्मा वार्षिक खपत युनिट',c1:1,c2:9,align:'right'},{t:num(el('nb-annual').textContent),c1:10,c2:10,num:true}],{bold:true,fill:HEAD});
  trow([{t:'जम्मा मासिक खपत युनिट',c1:1,c2:9,align:'right'},{t:t.mu,c1:10,c2:10,num:true,int:true}],{bold:true,fill:HEAD});
 }else{
  mergeFull(1,NC,'2. विगत 3 सामान्य महिनाको खपतको औसत :',{bold:true,align:'left'});r++;
  thead([{t:'क्र.सं.',c1:1,c2:1},{t:'मिति',c1:2,c2:5},{t:'युनिट',c1:6,c2:10}]);
  [['nb-ad1','nb-au1'],['nb-ad2','nb-au2'],['nb-ad3','nb-au3']].forEach((ids,i)=>{
   trow([{t:i+1,c1:1,c2:1,num:true,int:true,align:'center'},{t:g(ids[0]),c1:2,c2:5,align:'center'},{t:+g(ids[1])||0,c1:6,c2:10,num:true,int:true}]);
  });
  trow([{t:'मासिक औसत युनिट',c1:1,c2:5,align:'right'},{t:t.mu,c1:6,c2:10,num:true,int:true}],{bold:true,fill:HEAD});
 }
 r++;

 // ─ 3. मूल्याङ्कन तालिका ─
 if(!isAnka&&!isLast){
  mergeFull(1,NC,'3. मूल्याङ्कन तालिका :',{bold:true,align:'left'});r++;
  thead([{t:'साल/महिना',c1:1,c2:1},{t:'बिल युनिट',c1:2,c2:2},{t:'बिल रकम',c1:3,c2:3},{t:'मूल्याङ्कित युनिट',c1:4,c2:4},{t:'मूल्याङ्कित रकम',c1:5,c2:5},{t:'छुट युनिट',c1:6,c2:6},{t:'रकम फरक',c1:7,c2:7},{t:'भ्याट',c1:8,c2:8},{t:'कैफियत',c1:9,c2:10}]);
  [...R.querySelectorAll('#nb-ebody tr')].forEach(tr=>{
   const dy=tr.dataset.dy;
   trow([
    {t:toLat(tr.querySelector('.yr').value)+'/'+String((+tr.querySelector('.mo').value||0)+1).padStart(2,'0'),c1:1,c2:1,align:'center'},
    {t:+tr.querySelector('.bu').value||0,c1:2,c2:2,num:true,int:true},
    {t:+tr.dataset.ba||0,c1:3,c2:3,num:true},
    {t:+tr.dataset.eu||0,c1:4,c2:4,num:true,int:true},
    {t:+tr.dataset.ea||0,c1:5,c2:5,num:true},
    {t:+tr.dataset.cu||0,c1:6,c2:6,num:true,int:true},
    {t:+tr.dataset.ka||0,c1:7,c2:7,num:true},
    {t:+tr.dataset.vt||0,c1:8,c2:8,num:true},
    {t:(dy!==''&&dy!=null)?(dy+' दिनको'):'',c1:9,c2:10,align:'center'}
   ]);
  });
  trow([{t:'जम्मा',c1:1,c2:1,align:'center'},{t:t.sBU,c1:2,c2:2,num:true,int:true},{t:t.sBA,c1:3,c2:3,num:true},{t:t.sEU,c1:4,c2:4,num:true,int:true},{t:t.sEA,c1:5,c2:5,num:true},{t:t.sCU,c1:6,c2:6,num:true,int:true},{t:t.sKA,c1:7,c2:7,num:true},{t:t.kVat,c1:8,c2:8,num:true},{t:'',c1:9,c2:10}],{bold:true,fill:HEAD});
  r++;
 }

 // ─ कुल जम्मा ─
 mergeFull(1,NC,'कुल जम्मा :',{bold:true,align:'left'});r++;
 const fee=(label,amount,final)=>{
  ws.mergeCells(r,1,r,7);const l=ws.getCell(r,1);l.value=label;l.font={bold:!!final};l.alignment={horizontal:'left',vertical:'middle',wrapText:true};
  ws.mergeCells(r,8,r,10);const a=ws.getCell(r,8);a.value=Number(amount)||0;a.numFmt='#,##0.00';a.font={bold:!!final};a.alignment={horizontal:'right',vertical:'middle'};
  for(let c=1;c<=10;c++)setB(ws.getCell(r,c));
  if(final)for(let c=1;c<=10;c++)ws.getCell(r,c).fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFE8F0E8'}};
  r++;
 };
 const amt1=t.kshWithVat!=null?t.kshWithVat:(t.stockTotal!=null?t.stockTotal:t.sKA);
 fee('1. '+(isLast?'अन्तिम युनिट बापतको रकम':(isAnka?'स्टक रकम':'क्षतिपूर्ति रकम'))+' — भ्याट सहित रु.',amt1);
 fee('2. मिटर बक्स र टर्मिनल सिल दस्तुर रु.',t.seal);
 fee('3. मिटर मोल रु.',t.mtr);
 fee('4. अन्य दस्तुर रु.',t.oth);
 fee('5. मिटर/सिल/अन्य भ्याट योग्य रकम रु.',t.vatable);
 fee('6. सो मा 13% भ्याट रु.',t.goodsVat);
 fee('7. कुल जम्मा रु.',t.grand,true);
 r++;r++;

 // ─ सही पंक्ति ─
 [['तयार गर्ने',1,3],['जाँच गर्ने',4,6],['प्रमाणित गर्ने',7,10]].forEach(s=>{
  ws.mergeCells(r,s[1],r,s[2]);const c=ws.getCell(r,s[1]);c.value=s[0];c.alignment={horizontal:'center'};c.font={size:10};
 });

 const buf=await wb.xlsx.writeBuffer();
 const who=(g('nb-cno')||g('nb-naam')||'ग्राहक').replace(/[\\/:*?"<>|]/g,'_');
 const blob=new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
 const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='मूल्याङ्कन_तालिका_'+who+'.xlsx';document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),3000);
}

function mount(root){
 R=root;R.dataset.nbModule='meter';R.innerHTML=template();
 vatClass='DOMESTIC';   // नयाँ केस — पेस्टले फेरि तय गर्छ
 R.querySelectorAll('.nb-step').forEach(b=>b.addEventListener('click',()=>nbStep(+b.dataset.step)));
 R.querySelectorAll('.nb-next').forEach(b=>b.addEventListener('click',()=>nbStep(+b.dataset.to)));
 R.querySelectorAll('.nb-back').forEach(b=>b.addEventListener('click',()=>nbStep(+b.dataset.to)));
 el('nb-mp-parse').addEventListener('click',nbParseMpower);
 el('nb-mp-clear').addEventListener('click',()=>{el('nb-mp-paste').value='';nbMpStatus('');});
 el('nb-m-load').addEventListener('click',()=>setMethod('load'));
 el('nb-m-avg').addEventListener('click',()=>setMethod('avg'));
 el('nb-u-res').addEventListener('click',()=>setUseMode('res'));
 el('nb-u-com').addEventListener('click',()=>setUseMode('com'));
 ['nb-au1','nb-au2','nb-au3'].forEach(id=>el(id).addEventListener('input',()=>recalc()));

 ['nb-f-seal','nb-f-meter','nb-f-other'].forEach(id=>el(id).addEventListener('input',()=>recalc()));
 el('nb-case').addEventListener('change',()=>{applyCase();});
 el('nb-issue').addEventListener('change',syncIssueOther);
 // ग्राहक वर्गीकरणले मू.अ.कर दर (घरायसी 5% / गैर-घरायसी 13%) मात्र तय गर्छ — लोड होइन
 el('nb-lastu').addEventListener('input',()=>recalc());
 el('nb-testres').addEventListener('change',()=>recalc());
 ['nb-ak-last','nb-ak-posted'].forEach(id=>el(id).addEventListener('input',()=>recalc(true)));
 ['nb-ak-amt','nb-ak-meter','nb-ak-seal','nb-ak-service'].forEach(id=>el(id).addEventListener('input',()=>recalc()));
 el('nb-addappl').addEventListener('click',()=>addApplRow());
 el('nb-addrow').addEventListener('click',()=>addEvalRow());
 el('nb-calc').addEventListener('click',()=>recalc());
 el('nb-genrows').addEventListener('click',genRows);
 const fm=el('nb-fm'),tm=el('nb-tm');fm.innerHTML=monthOpts(0);tm.innerHTML=monthOpts(0);
 const t0=bsToday();let sm=t0.m-1-3,sy=t0.y;while(sm<0){sm+=12;sy--;}let em=t0.m-1,ey=t0.y;
 el('nb-fy').value=sy;fm.value=sm;el('nb-ty').value=ey;tm.value=em;
 el('nb-excel-eval-btn').addEventListener('click',()=>{try{nbPreview();downloadEvalExcel();}catch(e){alert('Excel बनाउन सकिएन : '+e.message);}});
 el('nb-print-eval-btn').addEventListener('click',()=>printEl(el('nb-print-eval')));
 el('nb-print-memo-btn').addEventListener('click',()=>printEl(el('nb-print-memo')));
 el('nb-print-terminal-btn').addEventListener('click',()=>printEl(el('nb-print-terminal')));
 el('nb-print-terminal-memo-btn').addEventListener('click',()=>printEl(el('nb-print-terminal-memo')));
 // सम्पादन बटन मात्र — Excel का लागि माथिको \"Excel डाउनलोड (फारामकै ढाँचा)\" प्रयोग हुन्छ
 addDocTools(R,'nb-print-eval','nb-print-eval-btn','मूल्याङ्कन_तालिका','none');
 addDocTools(R,'nb-print-memo','nb-print-memo-btn','मिटर_बदली_मेमो','word');
 addDocTools(R,'nb-print-terminal','nb-print-terminal-btn','टर्मिनल_विवरण','word');
 addDocTools(R,'nb-print-terminal-memo','nb-print-terminal-memo-btn','टर्मिनल_मेमो','word');
 el('nb-reset-btn').addEventListener('click',()=>{S.clearJSON(AUTOSAVE_KEY);mount(R);});
 wireAddress(R,{muni:'nb-addr-muni',ward:'nb-addr-ward',place:'nb-addr-place',custom:'nb-addr-custom',customWrap:'nb-addr-custom-wrap',toggle:'nb-addr-toggle-custom',cancel:'nb-addr-cancel-custom',preview:'nb-addr-preview',hidden:'nb-addr'});
 const t=bsToday();if(!el('nb-miti').value)el('nb-miti').value=t.y+'-'+pad2(t.m)+'-'+pad2(t.d);
 setLoad(el('nb-amp').value);applyMeterDefaults();syncFromClass();seedApplRows();genRows();applyCase();
 if(!root.dataset.nbAutosaveWiredMeter){root.dataset.nbAutosaveWiredMeter='1';root.addEventListener('input',scheduleSave);root.addEventListener('change',scheduleSave);root.addEventListener('click',scheduleSave);
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
 else{nbStep(1);}
}

return {mount,recalc};
})(window.NBShared);
