/* ═══════════════════════════════════════════════════════════════════════
   HUB / ROUTER + साइडबार नेभिगेसन + घडी + सेशन पुनर्स्थापन
   ───────────────────────────────────────────────────────────────────────
   • साइडबार सधैं देखिन्छ — जुनसुकै module मा सिधै जान सकिन्छ।
   • गृहपृष्ठमा कार्यविधि कार्डहरू (module हरू पनि यही #app मा mount हुन्छन्)।
   • माथिको घडी हरेक सेकेन्ड अपडेट + बि.सं. मिति (NBShared बाट)।
   • अधिक्षेप सेशन: लाइट गएको/ब्राउजर बन्द भएको — आखिरी गणनामा फर्किन सकिन्छ
   ═══════════════════════════════════════════════════════════════════════ */
(function(){
'use strict';
const S = window.NBShared;
const app     = document.getElementById('app');
const sideNav = document.getElementById('side-nav');
const title   = document.getElementById('page-title');
const sub     = document.getElementById('page-sub');

const MODULES = {
  meter:{
    title:'मिटर बदली', sub:'Meter Replacement',
    lead:'बन्द / जलेको / डिस्प्ले आउट — एभ्रेज मूल्याङ्कन',
    desc:'मिटर बन्द, फुटेको, डिस्प्ले आउट वा बढी खपत — एभ्रेज मूल्याङ्कन गरी मेमो र अनुसूची तालिका तयार।',
    mount:()=>window.MeterBadali.mount(app),
  },
  chori:{
    title:'विद्युत चोरी', sub:'Theft Evaluation',
    lead:'ऐन 2058 — क्षतिपूर्ति, जरिवाना र दस्तुर',
    desc:'हुकिङ, बाइपास वा केबल टपिङ — ऐन अनुसार क्षतिपूर्ति, जरिवाना र दस्तुर गणना गरी मेमो र प्रतिवेदन।',
    mount:()=>window.Chori.mount(app),
  },
  chhutbill:{
    title:'छुट बिल टिप्पणी', sub:'Missed Billing',
    lead:'वर्ग परिवर्तन वा दर फरकको महसुल गणना',
    desc:'लागू मिति अनुसार विनियमावली छनोट गरी महसुल फरक, गणना विवरण र टिप्पणी तयार।',
    mount:()=>window.ChhutBill.mount(app),
  },
};
const ORDER = ['meter','chori','chhutbill'];

/* ── घडी (हरेक सेकेन्ड) ── */
function tick(){
  const now = new Date();
  const t = document.getElementById('clk-time');
  const d = document.getElementById('clk-date');
  const b = document.getElementById('clk-bs');
  if(t) t.textContent = now.toLocaleTimeString('en-GB');
  if(d) d.textContent = now.toLocaleDateString('en-GB',
        {weekday:'long', day:'numeric', month:'long', year:'numeric'});
  if(b && S && S.bsToday){
    const bs = S.bsToday();
    b.textContent = 'बि.सं. ' + S.toNep(bs.y + '-' + S.pad2(bs.m) + '-' + S.pad2(bs.d));
  }
}

/* ── सेशन पुनर्स्थापन (मोड्युल-विशेष, सानो चिप) ── */
const AUTOSAVE_KEYS={meter:'nb_meterbadali_autosave_v1',chori:'nb_chori_autosave_v1',chhutbill:'nb_chhutbill_autosave_v1'};
function hasAutosave(which){return !!S.loadJSON(AUTOSAVE_KEYS[which]);}
function restoreChipHTML(which){
  return `<div class="nb-restore-chip" id="nb-restore-chip">
    <span class="ic">↺</span>
    <span class="tx"><b>अघिल्लो अधूरा काम पुनः लोड गरियो</b> — गणना जहाँ छोडिएको थियो त्यहीँबाट जारी छ।</span>
    <button type="button" id="nb-restore-fresh">नयाँ केस सुरु गर्नुहोस्</button>
  </div>`;
}
function injectRestoreChip(which){
  if(!hasAutosave(which))return;
  const wrap=document.createElement('div');
  wrap.innerHTML=restoreChipHTML(which);
  const chip=wrap.firstElementChild;
  app.insertBefore(chip,app.firstChild);
  const btn=document.getElementById('nb-restore-fresh');
  if(btn)btn.addEventListener('click',()=>{
    S.clearJSON(AUTOSAVE_KEYS[which]);
    go(which);
  });
}

/* ── गृहपृष्ठ ── */
function hubHTML(){
  const card = k => {
    const m = MODULES[k];
    return '<button class="hub-tile ' + k + '" data-go="' + k + '">' +
      '<span class="rule"></span>' +
      '<span class="t">' + m.title + '</span>' +
      '<span class="sub">' + m.sub + '</span>' +
      '<span class="desc">' + m.desc + '</span>' +
      (m.tag ? '<span class="tag"><i></i>' + m.tag + '</span>' : '') +
    '</button>';
  };
  return '<section class="hub">' +
    '<div class="hub-head">' +
      '<div>' +
        '<h2>कुन कार्यविधिमा काम गर्ने?</h2>' +
        '<p>कुनै एक छान्नुहोस् — गणना, मेमो र अनुसूची तालिका सबै यहीँ।</p>' +
      '</div>' +
    '</div>' +
    '<div class="hub-grid">' + ORDER.map(card).join('') + '</div>' +
  '</section>';
}

/* ── router ── */
function setActive(which){
  sideNav.querySelectorAll('button').forEach(b =>
    b.classList.toggle('active', b.dataset.go === which));
}
function hub(){
  app.className = 'app-wrap';
  app.innerHTML = hubHTML();
  app.querySelectorAll('[data-go]').forEach(t =>
    t.addEventListener('click', () => go(t.dataset.go)));
  title.textContent = 'Meter Shikayat Department';
  sub.textContent   = 'नेपाल विद्युत प्राधिकरण • तौलिहवा वितरण केन्द्र';
  setActive('hub');
  window.scrollTo(0,0);
}
function go(which){
  if(which === 'hub' || !MODULES[which]) return hub();
  const m = MODULES[which];
  app.className = 'app-wrap';
  m.mount(app);
  if(AUTOSAVE_KEYS[which]) injectRestoreChip(which);
  title.textContent = m.title;
  sub.textContent   = m.lead;
  setActive(which);
  window.scrollTo(0,0);
}

sideNav.querySelectorAll('button').forEach(b =>
  b.addEventListener('click', () => go(b.dataset.go)));

tick(); setInterval(tick, 1000);
hub();
})();
