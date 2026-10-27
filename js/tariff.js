/* ═══════════════════════════════════════════════════════════════════════
   NBTariff — विद्युत महसुल दर तालिका (SINGLE SOURCE OF TRUTH)
   ───────────────────────────────────────────────────────────────────────
   नेपाल विद्युत प्राधिकरणको महसुल दर परिवर्तन हुँदा **यही फाइल मात्र**
   अद्यावधिक गर्नुहोस् — कुनै module (चोरी / मिटर बदली / छुट बिल) को कोड
   छुनु पर्दैन। सबै दर, सेवा शुल्क र वर्ग यहाँबाट पढिन्छन्।

   खण्डहरू:
     • VAT           — मू.अ.कर नियम (निर्देशिका 2083: 50 युनिट छुट / 5% / 13% / B2B)
     • chori         — विद्युत चोरी module का दर (डोमेस्टिक स्ल्याब, गैर-घरेलु,
                       सेवा शुल्क, वर्ग सूची)
     • meterBadali   — मिटर बदली module को युनिट-मूल्यांकन स्ल्याब र मिटर मूल्य
     • chhutbill     — छुट बिल module का वर्ग + रिजिम (2078/2077/2073) override

   ⚠️  नयाँ दर हाल्दा संरचना (key, बनावट) उही राख्नुहोस्; संख्या मात्र बदल्नुहोस्।
   ═══════════════════════════════════════════════════════════════════════ */
window.NBTariff=(function(){
'use strict';

/* ─────────────────────────────────────────────────────────────────────
   मूल्य अभिवृद्धि कर (VAT) — "विद्युत सेवामा मू.अ.कर असुल गर्ने निर्देशिका, 2083"
   लागू मिति : भदौ 1, 2083
   ───────────────────────────────────────────────────────────────────────
   पुरानो व्यवस्था : सम्पूर्ण भ्याट योग्य रकममा एकल 13% ।
   नयाँ व्यवस्था (भदौ 1, 2083 देखि) :
     • घरायसी / अन्तिम उपभोक्ता (प्राकृतिक व्यक्ति) → मासिक 50 युनिटसम्म पूर्ण छुट;
       50 युनिट माथिको महसुलमा मात्र 5% ।
     • गैर-घरायसी / अन्तिम उपभोक्ता नभएका (कार्यालय, उद्योग आदि) → 50 युनिट छुट छैन,
       सम्पूर्ण महसुलमा 13% (उद्योगले कर कट्टी दाबी गर्न सक्ने) ।
     • विद्युत व्यवसाय ↔ विद्युत व्यवसाय — B2B (उत्पादक→प्राधिकरण, सामुदायिक/लघु
       जलविद्युत→NEA) → पूर्ण छुट (0%) ।
     • सेवा शुल्क / मिटर मोल / सिल दस्तुर जस्ता वस्तु–सेवा बिक्रीमा भने सधैं 13% ।

   प्रयोग (module हरूले पछि यसै helper बाट भ्याट निकाल्ने) :
     VAT.onFees(रकम)                                → वस्तु/सेवामा 13%
     VAT.onConsumption({consumerType, units,
                        chargeTotal, chargeAboveFreeUnits})  → खपत महसुलमा भ्याट
     VAT.rateFor('domestic'|'nonDomestic'|'b2b')    → दर मात्र

   ⚠️  दर परिवर्तन हुँदा तलका संख्या मात्र बदल्नुहोस्; consumerType key उही राख्नुहोस् ।
   ───────────────────────────────────────────────────────────────────── */
const VAT=(function(){
 const standard      = 0.13;  // सामान्य दर — गैर-घरायसी महसुल र सेवा शुल्क/वस्तु-सेवा
 const finalConsumer = 0.05;  // अन्तिम/घरायसी उपभोक्ता — 50 युनिट माथिको महसुल
 const domesticFreeUnits = 50;    // घरायसी प्रति ग्राहक मासिक छुट युनिट
 const effectiveFrom     = '2083-05-01'; // भदौ 1, 2083 (दफा 1(2))
 const effYear = 2083, effMonth = 5;     // भदौ = 5 (1-आधारित)
 // निर्देशिका लागू हुनु अघिको महिनाको महसुलमा भ्याट — केन्द्रको पुरानो अभ्यास अनुसार 0 ।
 // (नीति फेरिए यही एक लाइन बदल्नुहोस्, जस्तै 0.13)
 const preDirectiveRate = 0;

 // महिना अनुक्रमणिका — वर्ष र 1-आधारित महिना (बैशाख=1 ... साउन=4 ... चैत=12)
 const _mIdx = (y,m1)=>(Number(y)||0)*12+((Number(m1)||1)-1);
 const _EFF  = _mIdx(effYear,effMonth);
 /* यो महिनामा निर्देशिका लागू हुन्छ ? — मिति नदिइएमा (null/0) हालको व्यवस्था नै मानिन्छ।
    ⚠️ महिना 1-आधारित दिनुहोस् : तालिकाको select 0-आधारित भए (mo+1) पठाउनुहोस्। */
 function appliesOn(bsYear,bsMonth1){ if(!bsYear)return true; return _mIdx(bsYear,bsMonth1)>=_EFF; }

 // उपभोक्ता वर्ग → भ्याट व्यवहार
 //   domestic    : घरायसी/अन्तिम (प्राकृतिक व्यक्ति) — 50 युनिट छुट, माथि 5%
 //   nonDomestic : गैर-घरायसी/अन्तिम नभएको — छुट छैन, सम्पूर्णमा 13%
 //   b2b         : विद्युत व्यवसाय ↔ विद्युत व्यवसाय — पूर्ण छुट
 const consumerTypes={
  domestic:    {rate:finalConsumer, freeUnits:domesticFreeUnits, label:'घरायसी / अन्तिम उपभोक्ता (प्राकृतिक व्यक्ति)'},
  nonDomestic: {rate:standard,      freeUnits:0,                 label:'गैर-घरायसी / अन्तिम उपभोक्ता नभएको'},
  b2b:         {rate:0,             freeUnits:0,                 label:'विद्युत व्यवसाय (B2B — पूर्ण छुट)'}
 };

 const _r2 = n => Math.round((Number(n)||0)*100)/100;

 // वस्तु/सेवा (सेवा शुल्क, मिटर मोल, सिल दस्तुर आदि) मा भ्याट — सधैं 13%
 function onFees(amount){ return _r2((Number(amount)||0)*standard); }

 // विद्युत महसुल (खपत) मा भ्याट — उपभोक्ता वर्ग अनुसार
 //   args : consumerType         'domestic' | 'nonDomestic' | 'b2b'
 //          units                कुल खपत युनिट (घरायसी 50 छुट जाँच्न)
 //          chargeTotal          कुल महसुल रकम (गैर-घरायसीको आधार)
 //          chargeAboveFreeUnits 50 युनिट माथिको महसुल रकम (घरायसीको आधार; नदिए chargeTotal)
 //   ret  : {rate, taxableAmount, vat, exemptUnits, exempt, note}
 function onConsumption(o){
  o=o||{};
  // 0 — निर्देशिका लागू हुनु अघिको महिना भए पुरानै व्यवस्था (महसुलमा भ्याट छैन)
  if(o.bsYear && !appliesOn(o.bsYear,o.bsMonth)){
   const base=(o.chargeTotal!=null?Number(o.chargeTotal):0)||0;
   return {rate:preDirectiveRate, taxableAmount:preDirectiveRate?_r2(base):0,
           vat:preDirectiveRate?_r2(base*preDirectiveRate):0, exemptUnits:0,
           exempt:!preDirectiveRate, preDirective:true,
           note:'भदौ 1, 2083 अघिको महिना — यो निर्देशिका लागू नहुने।'};
  }
  const ct    = consumerTypes[o.consumerType] || consumerTypes.nonDomestic;
  const units = Number(o.units)||0;
  const total = Number(o.chargeTotal)||0;
  const above = (o.chargeAboveFreeUnits!=null) ? (Number(o.chargeAboveFreeUnits)||0) : total;

  // B2B → पूर्ण छुट
  if(ct.rate===0)
   return {rate:0, taxableAmount:0, vat:0, exemptUnits:0, exempt:true,
           note:'विद्युत व्यवसाय ↔ विद्युत व्यवसाय (B2B) — मू.अ.कर पूर्ण छुट ।'};

  // घरायसी → मासिक 50 युनिटसम्म पूर्ण छुट
  if(ct.freeUnits>0 && units<=ct.freeUnits)
   return {rate:0, taxableAmount:0, vat:0, exemptUnits:units, exempt:true,
           note:'मासिक '+ct.freeUnits+' युनिटसम्म भएकाले मू.अ.कर छुट ।'};

  // घरायसी (50 माथि) → 50 माथिको महसुलमा मात्र; गैर-घरायसी → सम्पूर्ण महसुलमा
  const base = ct.freeUnits>0 ? above : total;
  return {rate:ct.rate, taxableAmount:_r2(base), vat:_r2(base*ct.rate),
          exemptUnits: ct.freeUnits>0 ? Math.min(units,ct.freeUnits) : 0, exempt:false,
          note: ct.freeUnits>0
           ? (ct.freeUnits+' युनिटसम्म छुट; माथिको महसुल रु. '+_r2(base)+' मा '+(ct.rate*100)+'% ।')
           : ('अन्तिम उपभोक्ता नभएकाले सम्पूर्ण महसुल रु. '+_r2(base)+' मा '+(ct.rate*100)+'% ।')};
 }

 // दर मात्र चाहिँदा
 function rateFor(consumerType){ return (consumerTypes[consumerType]||consumerTypes.nonDomestic).rate; }
 // महिना सापेक्ष दर — निर्देशिका अघिको महिनामा preDirectiveRate
 function rateForMonth(consumerType,bsYear,bsMonth1){
  return appliesOn(bsYear,bsMonth1) ? rateFor(consumerType) : preDirectiveRate;
 }

 return { standard, finalConsumer, domesticFreeUnits, effectiveFrom, effYear, effMonth,
          preDirectiveRate, appliesOn, rateForMonth,
          consumerTypes, onFees, onConsumption, rateFor };
})();

/* ─────────────────────────────────────────────────────────────────────
   विद्युत चोरी (Chori) — विद्युत महसुल संकलन विनियमावली, अनुसूची–1 (2078)
   ───────────────────────────────────────────────────────────────────── */
const chori={
 // घरेलु स्ल्याब — प्रत्येक पंक्ति: [युनिट_देखि, युनिट_सम्म,
 //   5A: सेवाशुल्क, दर,  15A: सेवाशुल्क, दर,  30A: सेवाशुल्क, दर,  60A: सेवाशुल्क, दर]
 domesticBands:[[0,20,30,0.00,50,4.00,75,5.00,125,6.00],[21,30,50,6.50,75,6.50,100,6.50,125,6.50],[31,50,50,8.00,75,8.00,100,8.00,125,8.00],[51,100,75,9.50,100,9.50,125,9.50,150,9.50],[101,250,100,9.50,125,9.50,150,9.50,200,9.50],[251,Infinity,150,11.00,175,11.00,200,11.00,250,11.00]],
 // माथिको प्रत्येक amp वर्गका लागि [सेवाशुल्क column, दर column] अनुक्रमांक
 domesticAmpCol:{d5:[2,3],d15:[4,5],d30:[6,7],d60:[8,9]},
 // घरेलु (एकल फेज) वर्ग keys
 domestic:['d5','d15','d30','d60'],
 // गैर-घरेलु / तीन-फेज / अन्य: sc=सेवा/डिमाण्ड शुल्क, rate=इनर्जी दर,
 //   demand:true भए sc लाई kVA ले गुणन; rate_wet/rate_dry=वर्षा/सुख्खा मौसम दर
 nonDomestic:{d3lv_10:{sc:1100,rate_wet:10.50,rate_dry:11.50},d3lv_hi:{sc:1800,rate_wet:10.50,rate_dry:11.50},ind_rur:{sc:60,rate:7.80,demand:true},ind_sml:{sc:110,rate:9.60,demand:true},com:{sc:325,rate:11.20,demand:true},ncom:{sc:215,rate:12.00,demand:true},irr:{sc:0,rate:2.25},strl:{sc:0,rate:7.30},strl_nm:{sc:2475,rate:0,flatMonthly:true},tmp:{sc:0,rate:19.80},nrh:{sc:350,rate:13.00,demand:true},ent:{sc:350,rate:14.00,demand:true},water_com:{sc:0,rate:4.20},water_oth:{sc:160,rate:7.20,demand:true},tx_pub:{sc:200,rate:5.75,demand:true},tx_oth:{sc:220,rate:8.90,demand:true},rel:{sc:0,rate:6.10}},
 // सेवा शुल्क (भ्याट योग्य) — label र पूर्वनिर्धारित रकम
 fees:{terminal_seal:{label:'टर्मिनल सिल',amount:400},box_seal_office:{label:'मिटर बक्स सिल (कार्यालयले)',amount:500},reading_seal:{label:'रिडिङ सिल',amount:1000},ctpt_seal:{label:'CT/PT सिल',amount:1000},line_cut:{label:'लाइन काट्ने',amount:250},line_join:{label:'लाइन जोड्ने',amount:500}},
 // ड्रपडाउन वर्ग समूह: [समूह नाम, [[key, देखिने नाम], ...]]
 categories:[['गृहस्थ — एकल फेज',[['d5','गृहस्थ 5A'],['d15','गृहस्थ 15A'],['d30','गृहस्थ 30A'],['d60','गृहस्थ 60A']]],['गृहस्थ — तीन फेज',[['d3lv_10','गृहस्थ 3Ph ≤10kVA'],['d3lv_hi','गृहस्थ 3Ph >10kVA']]],['औद्योगिक / व्यापारिक',[['ind_rur','औद्योगिक — ग्रामीण'],['ind_sml','औद्योगिक — साना'],['com','व्यापारिक'],['ncom','गैर-व्यापारिक'],['nrh','गैर-गृहस्थ'],['ent','मनोरञ्जन']]],['अन्य',[['irr','सिंचाई'],['water_com','खानेपानी सामुदायिक'],['water_oth','खानेपानी अन्य'],['tx_pub','यातायात सार्वजनिक'],['tx_oth','यातायात अन्य'],['strl','सडक बत्ती'],['rel','धार्मिक स्थल'],['tmp','अस्थायी']]]]
};

/* ─────────────────────────────────────────────────────────────────────
   मिटर बदली (Meter Badali) — बन्द/खराब अवधिको युनिट मूल्यांकन घरेलु स्ल्याब
   ───────────────────────────────────────────────────────────────────── */
const meterBadali={
 // सेवा (न्यूनतम) शुल्क म्याट्रिक्स — [≤20, ≤30, ≤50, ≤100, ≤250, >250] प्रति amp
 serviceMin:{5:[30,50,50,75,100,150],15:[50,75,75,100,125,175],30:[75,100,100,125,150,200],60:[125,125,125,150,200,250]},
 // पहिलो 20 युनिटको दर (amp अनुसार; 5A बाहेक)
 firstUnitRate:{5:3,15:4,30:5,60:6},
 // इनर्जी दर: 5A को >20 भाग, अनि 20–30 / 30–50 / 50–250 / >250 स्ल्याब
 energyRates:{d5Above20:3,b20_30:6.5,b30_50:8,b50_250:9.5,above250:11},
 // amp अनुसार पूर्वनिर्धारित मिटर मूल्य र सिल दस्तुर
 // मिटर मूल्य 5 / 15 / 30 एम्पियर सबैमा एउटै — रु. 1627.79 (13% भ्याट छुट्टै लाग्छ)
 meterDefaults:{'5':{price:1627.79,seal:600},'15':{price:1627.79,seal:600},'30':{price:1627.79,seal:600}}
};

/* ─────────────────────────────────────────────────────────────────────
   छुट बिल (ChhutBill) — regime-aware वर्ग तालिका + रिजिम override
   type: slab/dom3lv/dom3mv/flat/tod ; d=डिमाण्ड, e=इनर्जी, pk/op/ot=TOD पिक/अफपिक/अन्य
   ───────────────────────────────────────────────────────────────────── */
const CB_CATS={
 dom_sp:{n:'DOMESTIC — SINGLE PHASE (230 V)',type:'slab'},
 dom_3p_lv:{n:'DOMESTIC — THREE PHASE LV (400 V)',type:'dom3lv'},
 dom_3p_mv:{n:'DOMESTIC — THREE PHASE MT (33/11 KV)',type:'dom3mv'},
 ind_rural:{n:'LT INDUSTRIAL — RURAL & COTTAGE',type:'flat',d:60,e:7.80},
 ind_small:{n:'LT INDUSTRIAL — SMALL',type:'flat',d:110,e:9.60},
 comm_lv:{n:'LT COMMERCIAL',type:'flat',d:325,e:11.20},
 noncomm_lv:{n:'LT NON-COMMERCIAL',type:'flat',d:215,e:12.00},
 irr_lv:{n:'LT IRRIGATION',type:'flat',d:0,e:2.25},
 irr_33:{n:'MT IRRIGATION (33 KV)',type:'flat',d:0,e:2.50},
 irr_11:{n:'MT IRRIGATION (11 KV)',type:'flat',d:0,e:2.60},
 irr_tod_33:{n:'MT-TOD IRRIGATION (33 KV)',type:'tod',d:0,pk:6.30,op:2.00,ot:3.00},
 irr_tod_11:{n:'MT-TOD IRRIGATION (11 KV)',type:'tod',d:0,pk:6.40,op:2.00,ot:3.10},
 tod_ind_33:{n:'MT-TOD INDUSTRIAL (33 KV)',type:'tod',d:250,pk:10.20,op:5.25,ot:8.40},
 tod_comm_33:{n:'MT-TOD COMMERCIAL (33 KV)',type:'tod',d:315,pk:12.30,op:6.75,ot:10.80},
 tod_ncomm_33:{n:'MT-TOD NON-COMMERCIAL (33 KV)',type:'tod',d:240,pk:13.20,op:7.00,ot:12.00},
 tod_wc_33:{n:'MT-TOD WATER SUPPLY COMMUNITY (33 KV)',type:'tod',d:0,pk:6.20,op:3.10,ot:4.60},
 tod_wo_33:{n:'MT-TOD WATER SUPPLY OTHERS (33 KV)',type:'tod',d:150,pk:10.20,op:5.25,ot:8.40},
 tod_trp_33:{n:'MT-TOD TRANSPORT PUBLIC/CHARGING (33 KV)',type:'tod',d:230,pk:7.00,op:3.70,ot:5.50},
 tod_tro_33:{n:'MT-TOD TRANSPORT OTHERS (33 KV)',type:'tod',d:255,pk:9.35,op:3.70,ot:8.40},
 tod_str_33:{n:'MT-TOD STREET LIGHT (33 KV)',type:'tod',d:80,pk:8.40,op:3.50,ot:4.20},
 tod_ind_11:{n:'MT-TOD INDUSTRIAL (11 KV)',type:'tod',d:250,pk:10.50,op:5.40,ot:8.55},
 tod_comm_11:{n:'MT-TOD COMMERCIAL (11 KV)',type:'tod',d:315,pk:12.60,op:6.90,ot:11.10},
 tod_ncomm_11:{n:'MT-TOD NON-COMMERCIAL (11 KV)',type:'tod',d:240,pk:13.50,op:7.15,ot:12.25},
 tod_wc_11:{n:'MT-TOD WATER SUPPLY COMMUNITY (11 KV)',type:'tod',d:0,pk:6.30,op:3.40,ot:4.70},
 tod_wo_11:{n:'MT-TOD WATER SUPPLY OTHERS (11 KV)',type:'tod',d:150,pk:10.50,op:5.40,ot:8.50},
 tod_trp_11:{n:'MT-TOD TRANSPORT PUBLIC/CHARGING (11 KV)',type:'tod',d:230,pk:7.15,op:4.20,ot:5.60},
 tod_tro_11:{n:'MT-TOD TRANSPORT OTHERS (11 KV)',type:'tod',d:255,pk:9.65,op:4.20,ot:8.50},
 tod_str_11:{n:'MT-TOD STREET LIGHT (11 KV)',type:'tod',d:80,pk:8.80,op:3.75,ot:4.40},
 tod_relig_11:{n:'MT-TOD RELIGIOUS & SPIRITUAL (11 KV)',type:'tod',d:220,pk:11.30,op:5.15,ot:9.10},
 tod_temp_11:{n:'MT-TOD TEMPORARY CONNECTION (11 KV)',type:'tod',d:330,pk:14.40,op:6.60,ot:11.75},
 tod_trp_lv:{n:'LT-TOD TRANSPORT PUBLIC/CHARGING (230–400 V)',type:'tod',d:200,pk:7.25,op:4.30,ot:5.75},
 tod_tro_lv:{n:'LT-TOD TRANSPORT OTHERS (230–400 V)',type:'tod',d:220,pk:9.75,op:4.30,ot:8.60},
 water_c_lv:{n:'LT WATER SUPPLY — COMMUNITY',type:'flat',d:0,e:4.20},
 water_o_lv:{n:'LT WATER SUPPLY — OTHERS',type:'flat',d:160,e:7.20},
 tr_pub_lv:{n:'LT TRANSPORT — PUBLIC/CHARGING STATION',type:'flat',d:200,e:5.75},
 tr_oth_lv:{n:'LT TRANSPORT — OTHERS',type:'flat',d:220,e:8.90},
 relig_lv:{n:'LT RELIGIOUS & SPIRITUAL',type:'flat',d:0,e:6.10},
 street_m:{n:'STREET LIGHT — METERED',type:'flat',d:0,e:7.30},
 temp_lv:{n:'LT TEMPORARY CONNECTION',type:'flat',d:0,e:19.80},
 nongri_lv:{n:'LT NON-DOMESTIC',type:'flat',d:350,e:13.00},
 ent_lv:{n:'LT ENTERTAINMENT BUSINESS',type:'flat',d:350,e:14.00},
 ind_33:{n:'MT INDUSTRIAL (33 KV)',type:'flat',d:255,e:8.40},
 comm_33:{n:'MT COMMERCIAL (33 KV)',type:'flat',d:315,e:10.80},
 noncomm_33:{n:'MT NON-COMMERCIAL (33 KV)',type:'flat',d:240,e:11.40},
 nongri_33:{n:'MT NON-DOMESTIC (33 KV)',type:'flat',d:350,e:12.55},
 ent_33:{n:'MT ENTERTAINMENT BUSINESS (33 KV)',type:'flat',d:350,e:13.50},
 ind_11:{n:'MT INDUSTRIAL (11 KV)',type:'flat',d:255,e:8.60},
 comm_11:{n:'MT COMMERCIAL (11 KV)',type:'flat',d:315,e:11.10},
 noncomm_11:{n:'MT NON-COMMERCIAL (11 KV)',type:'flat',d:240,e:11.50},
 relig_11:{n:'MT RELIGIOUS & SPIRITUAL (11 KV)',type:'flat',d:220,e:9.90},
 temp_11:{n:'MT TEMPORARY CONNECTION (11 KV)',type:'flat',d:330,e:12.00},
 nongri_11:{n:'MT NON-DOMESTIC (11 KV)',type:'flat',d:350,e:12.90},
 ent_11:{n:'MT ENTERTAINMENT BUSINESS (11 KV)',type:'flat',d:350,e:13.90},
 ind_66:{n:'HT INDUSTRIAL (66 KV)',type:'flat',d:240,e:8.30},
 ind_132:{n:'HT INDUSTRIAL (132 KV)',type:'flat',d:230,e:8.20}
};

// रिजिम अनुसार override (2078 आधारभन्दा फरक पर्ने महल मात्र)
const OV_2077={
 ind_rural:{e:7.50},
 irr_lv:{e:4.30},
 irr_33:{e:4.80},
 irr_11:{e:4.90},
 irr_tod_33:{op:3.15,ot:4.70},
 irr_tod_11:{op:3.50,ot:4.75}
};
const OV_2073={
 ind_66:{e:7.50},
 ind_132:{d:240,e:7.50},
 irr_lv:{e:4.30},
 water_c_lv:{d:155,e:5.20},
 water_o_lv:{d:230},
 irr_33:{d:55,e:4.80},
 irr_11:{d:55,e:4.90},
 irr_tod_33:{d:55,op:3.15,ot:4.70},
 tod_wc_33:{d:220,pk:7.30,op:3.60,ot:5.90},
 tod_wo_33:{d:220},
 irr_tod_11:{d:55,op:3.50,ot:4.75},
 tod_wc_11:{d:220,pk:7.45,op:4.40,ot:6.90},
 tod_wo_11:{d:220}
};

const chhutbill={ cats:CB_CATS, overrides:{'2078':{},'2077':OV_2077,'2073':OV_2073} };

return { VAT, chori, meterBadali, chhutbill };
})();
