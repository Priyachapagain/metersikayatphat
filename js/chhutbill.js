window.ChhutBill=(function(S){
'use strict';
const T=window.NBTariff;

// ─── Geography data (same as मिटर जाँच app) ────────────────────────────────
const MUNI_DATA={
 'KA.BA.NA.PA':{1:['AANANDABAG','BAHADURGANGCHOK','BAIRIYA','GAUDICHOK','GAYATOL','HADBAJAR','KALIKATOL','MALTOL','MASJIT TOL','NAYATOL','SHIVMANDIRTOL','SIBMANDIRTOL'],2:['BARGADAWA','LAMTIYA','SAGARTOL','SAURAHA'],3:['BHIKSHCHHUCHO','BIRTA','DHANAURATOL','SIKOTAWA','CHHOTKITAULIHAWA'],4:['DALPUR','MALPARA','PIPRAHAWA'],5:['GOTIHAWA','KUDAN','SIPPURA'],6:['BELASAPUR','BELASPUR','GOBARI','TILAURI'],7:['DHAMAULI','DHARAMPANIYA'],8:['DOHANI'],10:['PIPARA','KATUWA','NAGAWA'],11:['JAHADI'],12:['BITHUWA','PIPRAHAWA','SAURAHA','SEMRAUTI']},
 'BA.NA.PA':{1:['BAIRIYA'],2:['LAKHANPARA','PIPARA','RAJPUR'],3:['BHAKTAULI','THATI'],4:['DARKHASTA','DUNGAHAWA','GAJEHADA','JITPUR','SIDDIPUR'],5:['AMRAIYA','JHANDA','KOPAWA'],6:['DHANEWAR','GONARI','THATI'],8:['BORDGAU','CHAPPARGAU','MORMI'],9:['JINUWA'],10:['MECHKURI'],11:['BHADSADAWA','BHJADDIHAWA','CHETIYA','GHARBUDHIYA']},
 'BU.NA.PA':{1:['MAHENDRAKOT','SEMARAJHARA','BASANTAPUR','CHANGHAT','PATHTHARKOT','TIKKAR'],2:['BAKDERIYA','BHADDIHAWA','GORUSINGE','PURENA','JAYNAGAR','PARWANIPUR'],3:['GHANCHAURA','RAMNAGAR'],4:['BUDDI'],5:['RAJPUR'],6:['MAHUWA'],7:['MANPUR'],8:['HARIHARPUR'],9:['BARKULPUR'],10:['DHANKAULI']},
 'SUDDODHAN':{1:['DOHANI','PATARIYA'],2:['ASUHARENA'],3:['LABANI','ASUHARENA'],4:['BITHUWA','ASUHARENA'],5:['JAYANAGARA','TADANAGAR'],6:['BIMIHA'],8:['BASKHOR','KHORIYA','MADHUNAGAR']},
 'YASHODHARA':{1:['VANKATWA','PAKADI','SIHOKHOR','TITIRKHA'],2:['BHADEHAR'],3:['BASANTAPUR'],4:['PARSOIYA','SEMARI'],6:['BHAISAIYA','RAMAWAPUR','RANGAPUR','BHAGAWANPUR'],8:['BASKHOR','KHORIYA','MADHUNAGAR']},
 'MAYADEVI':{1:['BAROHIYA','BARAHI','BARROIYA','PAKADI','PICHURKHI'],2:['MANKHORIYA'],3:['ABHIRAW','ASUHARENA','BARGADAWA','KHAIRATI'],4:['BASANTAPUR','BULADIHAWA','CHAKALCHAUDA','PIPARA'],5:['SISAWA'],6:['GAURIGANG','SERAHAWA','CHAKARCHAUDA'],7:['KARMAHAWA','LALPUR','SERAIYA'],8:['BARKUL'],9:['BITHUWA']}
};

// ─── BS auto-date ────────────────────────────────────────────────────────
const BS_MONTHS={2080:[31,32,31,32,31,30,30,30,29,29,30,30],2081:[31,31,32,32,31,30,30,30,29,30,30,30],2082:[31,31,31,32,31,31,30,29,30,29,30,30],2083:[31,31,32,31,31,30,30,30,29,30,30,30],2084:[31,31,32,31,31,30,30,30,29,30,30,30],2085:[31,32,31,32,31,30,30,30,29,30,30,30],2086:[31,32,31,32,31,30,30,30,29,30,30,30],2087:[31,32,31,32,31,30,30,30,29,30,30,30],2088:[30,31,32,32,30,31,30,30,29,30,30,30],2089:[30,31,32,32,31,30,30,30,29,30,30,30],2090:[30,32,31,32,31,30,30,30,29,30,30,30]};
const BS_EPOCH_YEAR=2083, BS_EPOCH_AD=Date.UTC(2026,3,14), ONE_DAY=86400000;
function adToBs(ms){let diff=Math.round((ms-BS_EPOCH_AD)/ONE_DAY),y=BS_EPOCH_YEAR,m=0,d=1;
 if(diff>=0){while(diff>0){const row=BS_MONTHS[y];if(!row)break;const left=row[m]-d;
  if(diff<=left){d+=diff;diff=0}else{diff-=(left+1);m++;d=1;if(m>11){m=0;y++}}}}
 else{while(diff<0){m--;if(m<0){m=11;y--}const row=BS_MONTHS[y];if(!row)break;diff+=row[m];if(diff>=0){d=diff+1;diff=0}}}
 return{y:y,m:m+1,d:d};}
function bsToday(){const n=new Date();return adToBs(Date.UTC(n.getFullYear(),n.getMonth(),n.getDate()));}
const pad2=n=>String(n).padStart(2,'0');
/* अंक — सबै फाराम/प्रतिवेदनमा अंग्रेजी अंक (0-9) */
const DEV='०१२३४५६७८९';
const toNep=s=>String(s==null?'':s).replace(/[०-९]/g,d=>DEV.indexOf(d));
const MONTHS=['बैशाख','जेठ','असार','साउन','भदौ','असोज','कात्तिक','मंसिर','पुस','माघ','फागुन','चैत'];
const isWet=m=>(m>=2&&m<=6); // असार–कात्तिक
const isTod3=m=>(m<=7); // बैशाख–मंसिर : 3 ब्यान्ड; पुस–चैत : 2 ब्यान्ड

// ─── तारिफ रिजिम (लागू मिति अनुसार विनियमावली छनोट) ─────────────────────────
// महिना अनुक्रम: 0 बैशाख … 3 साउन … 8 पुस … 11 चैत
//  • विनियमावली 2078 : पुस 1, 2078 (2078/09/01) देखि
//  • विनियमावली 2077 : साउन 1, 2077 (2077/04/01) देखि पुस 2078 अघिसम्म
//  • विनियमावली 2073 : सो अघिका महिनाहरूका लागि
function regimeFor(y,mIdx){
 const idx=(+y)*12+(+mIdx);
 if(idx>=2078*12+8)return '2078';
 if(idx>=2077*12+3)return '2077';
 return '2073';
}
function regimeLabel(reg){return reg==='2078'?'2078':reg==='2077'?'2077':'2073';}

// ─── Nepali amount in words (अक्षरुपी) ───────────────────────────────────
const NEPW=['शून्य','एक','दुई','तीन','चार','पाँच','छ','सात','आठ','नौ','दश','एघार','बाह्र','तेह्र','चौध','पन्ध्र','सोह्र','सत्र','अठार','उन्नाइस','बीस','एक्काइस','बाइस','तेइस','चौबीस','पच्चीस','छब्बीस','सत्ताइस','अठ्ठाइस','उनन्तीस','तीस','एकतीस','बत्तीस','तेत्तीस','चौँतीस','पैँतीस','छत्तीस','सैँतीस','अठतीस','उनन्चालीस','चालीस','एकचालीस','बयालीस','त्रिचालीस','चवालीस','पैँतालीस','छयालीस','सतचालीस','अठचालीस','उनन्चास','पचास','एकाउन्न','बाउन्न','त्रिपन्न','चवन्न','पचपन्न','छपन्न','सन्ताउन्न','अन्ठाउन्न','उनन्साठी','साठी','एकसट्ठी','बयसट्ठी','त्रिसट्ठी','चौंसट्ठी','पैंसट्ठी','छयसट्ठी','सतसट्ठी','अठसट्ठी','उनन्सत्तरी','सत्तरी','एकहत्तर','बहत्तर','त्रिहत्तर','चौहत्तर','पचहत्तर','छयहत्तर','सतहत्तर','अठहत्तर','उनासी','असी','एकासी','बयासी','त्रियासी','चौरासी','पचासी','छयासी','सतासी','अठासी','उनान्नब्बे','नब्बे','एकानब्बे','बयानब्बे','त्रियानब्बे','चौरानब्बे','पन्चानब्बे','छयानब्बे','सन्तानब्बे','अन्ठानब्बे','उनान्सय'];
function nepWordsInt(n){
 n=Math.floor(Math.abs(n));
 if(n===0)return NEPW[0];
 let parts=[];
 const crore=Math.floor(n/10000000);n%=10000000;
 const lakh=Math.floor(n/100000);n%=100000;
 const thou=Math.floor(n/1000);n%=1000;
 const hund=Math.floor(n/100);n%=100;
 if(crore)parts.push(nepWordsInt(crore)+' करोड');
 if(lakh)parts.push(NEPW[lakh]+' लाख');
 if(thou)parts.push(NEPW[thou]+' हजार');
 if(hund)parts.push(NEPW[hund]+' सय');
 if(n)parts.push(NEPW[n]);
 return parts.join(' ');
}
function nepAmountWords(amt){
 amt=Math.round(amt*100)/100;
 const rup=Math.floor(amt),pai=Math.round((amt-rup)*100);
 let s=nepWordsInt(rup)+' रुपैयाँ';
 if(pai>0)s+=' '+NEPW[pai]+' पैसा';
 return s+' मात्र';
}

// ─── अनुसूची–29: छुट बिल स्वीकृत गर्ने अधिकार ─────────────────────────────
const AUTH=[
 {k:'op67', label:'कार्यालय प्रमुख (तह 6 र 7)',        sal:'कार्यालय प्रमुख',            limit:10000,  lw:'दश हजार रुपैयाँ'},
 {k:'op89', label:'कार्यालय प्रमुख (तह 8 र 9)',        sal:'कार्यालय प्रमुख',            limit:25000,  lw:'पच्चीस हजार रुपैयाँ'},
 {k:'dp10', label:'डिभिजन/प्रादेशिक प्रमुख (तह 10)',    sal:'डिभिजन/प्रादेशिक प्रमुख',    limit:50000,  lw:'पचास हजार रुपैयाँ'},
 {k:'dp11', label:'डिभिजन/प्रादेशिक प्रमुख (तह 11)',    sal:'डिभिजन/प्रादेशिक प्रमुख',    limit:100000, lw:'एक लाख रुपैयाँ'},
 {k:'ded',  label:'उपकार्यकारी निर्देशक',               sal:'उपकार्यकारी निर्देशक',       limit:500000, lw:'पाँच लाख रुपैयाँ'},
 {k:'cao',  label:'मुख्य प्रशासकीय अधिकृत',             sal:'मुख्य प्रशासकीय अधिकृत',     limit:Infinity,lw:'आवश्यकता अनुसार'}
];
function authFor(amount){
 for(const a of AUTH)if(amount<=a.limit)return a;
 return AUTH[AUTH.length-1];
}

// ─── Tariff base: विद्युत महसुल संकलन विनियमावली 2078, अनुसूची–1 ────────────
// CATS = 2078 आधार तालिका। 2077 र 2073 का फरक पर्ने दरहरू तल override बाट लागू हुन्छन्।
const CATS=T.chhutbill.cats;

// ─── रिजिम अनुसार override (2078 आधारभन्दा फरक पर्ने महलहरू मात्र) ───────────
// d=डिमाण्ड दर, e=इनर्जी दर, pk/op/ot=TOD पिक/अफपिक/अन्य
const OVERRIDES=T.chhutbill.overrides;
// छानिएको रिजिमको प्रभावकारी वर्ग तालिका (आधार + override)
function cat(k,reg){return Object.assign({},CATS[k],(OVERRIDES[reg]&&OVERRIDES[reg][k])||{});}

// ─── ग्राहस्थ सिंगल फेज स्ल्याब — रिजिम अनुसार (न्यूनतम + इनर्जी छुट्टै) ───────
// ग्राहस्थ 3 फेज (LV/MV) — रिजिम अनुसार
const DOM={
 '2078':{
  sp(units,amp){
   units=Math.max(0,Math.round(units));amp=+amp;
   const minM={5:[30,50,50,75,100,150],15:[50,75,75,100,125,175],30:[75,100,100,125,150,200],60:[125,125,125,150,200,250]};
   const first={5:3,15:4,30:5,60:6};
   let b;if(units<=20)b=0;else if(units<=30)b=1;else if(units<=50)b=2;else if(units<=100)b=3;else if(units<=250)b=4;else b=5;
   let e=0;
   if(amp===5){if(units>20)e+=20*3;}else e+=Math.min(units,20)*first[amp];
   if(units>20)e+=(Math.min(units,30)-20)*6.5;
   if(units>30)e+=(Math.min(units,50)-30)*8;
   if(units>50)e+=(Math.min(units,250)-50)*9.5;
   if(units>250)e+=(units-250)*11;
   return{min:minM[amp][b],e:e};
  },
  d3lv(units,mIdx,kva){const min=(kva>0&&kva<=10)?1100:1800;const e=units*(isWet(mIdx)?10.50:11.50);return{d:min,e:e};},
  d3mv(units,mIdx){const e=units*(isWet(mIdx)?10.50:11.00);return{d:10000,e:e};}
 },
 '2077':{
  sp(units,amp){
   units=Math.max(0,Math.round(units));amp=+amp;
   const minM={5:[30,50,50,75,100,125,150,175],15:[50,75,75,100,125,150,175,200],30:[75,100,100,125,150,175,200,225],60:[125,125,125,150,200,200,250,275]};
   const first={5:3,15:4,30:5,60:6};
   let b;if(units<=20)b=0;else if(units<=30)b=1;else if(units<=50)b=2;else if(units<=100)b=3;else if(units<=150)b=4;else if(units<=250)b=5;else if(units<=400)b=6;else b=7;
   let e=0;
   if(amp===5){if(units<=10)e+=0;else if(units<=20)e+=units*3;else e+=20*3;}
   else e+=Math.min(units,20)*first[amp];
   if(units>20)e+=(Math.min(units,30)-20)*6.5;
   if(units>30)e+=(Math.min(units,50)-30)*8;
   if(units>50)e+=(Math.min(units,150)-50)*9.5;
   if(units>150)e+=(Math.min(units,250)-150)*10;
   if(units>250)e+=(Math.min(units,400)-250)*11;
   if(units>400)e+=(units-400)*12;
   return{min:minM[amp][b],e:e};
  },
  d3lv(units,mIdx,kva){const min=(kva>0&&kva<=10)?1100:1800;const e=units*(units<=400?11.50:12.00);return{d:min,e:e};},
  d3mv(units,mIdx){const e=units*(units<=1000?11.00:12.00);return{d:10000,e:e};}
 },
 '2073':{
  sp(units,amp){
   units=Math.max(0,Math.round(units));amp=+amp;
   const minM={5:[30,50,75,100,125,150,175],15:[50,75,100,125,150,175,200],30:[75,100,125,150,175,200,225],60:[125,150,175,200,225,250,275]};
   const first={5:3,15:4,30:5,60:6};
   let b;if(units<=20)b=0;else if(units<=30)b=1;else if(units<=50)b=2;else if(units<=150)b=3;else if(units<=250)b=4;else if(units<=400)b=5;else b=6;
   let e=0;
   e+=Math.min(units,20)*first[amp];
   if(units>20)e+=(Math.min(units,30)-20)*7;
   if(units>30)e+=(Math.min(units,50)-30)*8.5;
   if(units>50)e+=(Math.min(units,150)-50)*10;
   if(units>150)e+=(Math.min(units,250)-150)*11;
   if(units>250)e+=(Math.min(units,400)-250)*12;
   if(units>400)e+=(units-400)*13;
   return{min:minM[amp][b],e:e};
  },
  d3lv(units,mIdx,kva){const min=(kva>0&&kva<=10)?1100:1800;const e=units*(units<=400?12.50:13.50);return{d:min,e:e};},
  d3mv(units,mIdx){const e=units*(units<=1000?11.00:units<=2000?12.00:13.00);return{d:10000,e:e};}
 }
};

// विनियम 6(2): डिमाण्ड शुल्क स्वीकृत लोडको 80% ले
// tod = {p:पिक, o:अफ पिक, t:अन्य} युनिट — TOD वर्गका लागि
// reg = '2078' | '2077' | '2073' (लागू विनियमावली)
// डिमाण्ड/न्यूनतम र इनर्जी छुट्टाछुट्टै फर्काउने
const round2=n=>Math.round((Number(n)||0)*100)/100;
function catIsDomestic(catk,reg){const c=cat(catk,reg);return c.type==='slab'||c.type==='dom3lv'||c.type==='dom3mv';}
function billParts(catk,units,mIdx,amp,kva,tod,reg){
 reg=reg||'2078';
 const c=cat(catk,reg);
 if(c.type==='slab'){const p=DOM[reg].sp(units,amp);return{d:p.min,e:p.e,t:p.min+p.e};}
 if(c.type==='dom3lv'){const p=DOM[reg].d3lv(units,mIdx,kva);return{d:p.d,e:p.e,t:p.d+p.e};}
 if(c.type==='dom3mv'){const p=DOM[reg].d3mv(units,mIdx);return{d:p.d,e:p.e,t:p.d+p.e};}
 if(c.type==='tod'){
  const t=tod||{p:0,o:0,t:Math.max(0,units||0)};
  const e=isTod3(mIdx)?(t.p*c.pk+t.o*c.op+t.t*c.ot):(t.p*c.pk+(t.o+t.t)*c.ot);
  const d=(kva*0.8)*c.d;
  return{d:d,e:e,t:d+e};
 }
 const d=(kva*0.8)*c.d,e=units*c.e;
 return{d:d,e:e,t:d+e};
}
function billFor(catk,units,mIdx,amp,kva,tod,reg){return billParts(catk,units,mIdx,amp,kva,tod,reg).t;}
const fmt=n=>n.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});

// ─── दर विवरण (रिजिम सापेक्ष) ───────────────────────────────────────────
// टिप्पणीमा देखाउने वर्णनात्मक दर
function rateDesc(k,reg){
 reg=reg||'2078';const c=cat(k,reg);
 if(c.type==='slab')return 'अनुसूची–1 बमोजिम ग्राहस्थ स्ल्याब दर';
 if(c.type==='dom3lv')return 'ग्राहस्थ 3 फेज (एल.टी.) न्यूनतम + '+rateShort(k,reg)+' प्रति युनिट';
 if(c.type==='dom3mv')return 'ग्राहस्थ 3 फेज (एम.टी.) न्यूनतम + '+rateShort(k,reg)+' प्रति युनिट';
 if(c.type==='tod')return 'डिमाण्ड '+toNep(c.d.toFixed(2))+' + पिक '+toNep(c.pk.toFixed(2))+' / अफ पिक '+toNep(c.op.toFixed(2))+' / अन्य '+toNep(c.ot.toFixed(2));
 return 'डिमाण्ड '+toNep(c.d.toFixed(2))+' + इनर्जी '+toNep(c.e.toFixed(2));
}
// छोटो दर (हेडर हिन्ट) — स्ल्याबमा खाली
function rateShort(k,reg){
 reg=reg||'2078';const c=cat(k,reg);
 if(c.type==='slab')return '';
 if(c.type==='dom3lv')return reg==='2078'?'10.50–11.50':reg==='2077'?'11.50–12.00':'12.50–13.50';
 if(c.type==='dom3mv')return reg==='2078'?'10.50–11.00':reg==='2077'?'11.00–12.00':'11.00–13.00';
 if(c.type==='tod')return (c.d?'डि. '+toNep(c.d)+' + ':'')+'पिक '+toNep(c.pk.toFixed(2))+' / अ.पि. '+toNep(c.op.toFixed(2))+' / अन्य '+toNep(c.ot.toFixed(2));
 return (c.d?'डि. '+toNep(c.d)+' + ':'')+toNep(c.e.toFixed(2));
}
/* ─── दर छुट्टाछुट्टै : डिमाण्ड र इनर्जी ───────────────────────────────
   ग्राहस्थ (स्ल्याब) मा प्रति-युनिट एउटै दर हुँदैन — अनुसूची–1 को स्ल्याब
   अनुसार बदलिन्छ — त्यसैले त्यहाँ अंक देखाइँदैन, 'स्ल्याब' मात्र लेखिन्छ।  */
function rateSplit(k,reg,m){
  reg = reg || '2078';
  const c = cat(k,reg);
  const slab = (c.type === 'slab' || c.type === 'dom3lv' || c.type === 'dom3mv');
  return {
    dRate: c.d || 0,                        // डिमाण्ड दर (प्रति kVA)
    eRate: (c.type === 'flat') ? c.e : 0,   // इनर्जी दर (प्रति युनिट)
    tod  : (c.type === 'tod') ? c : null,
    slab                                     // ग्राहस्थ स्ल्याब — दर देखाइँदैन
  };
}

/* ─── कक्षभित्रै गणना देखाउने: रकम + सानो अक्षरमा "आधार × दर" ───────────
   80% गणनामा लागू छ तर लेखिँदैन — त्यसैले आधार सिधै बिल हुने kVA मा
   देखाइन्छ (30 kVA स्वीकृत → 24 × 55.00 = 1,320.00)। मिल्दो र सफा।     */
function cellCalc(amount, base, rate, unit, slab){
  const amt = `<b>${toNep(fmt(amount))}</b>`;
  if(slab || !rate || !base) return amt;                 // स्ल्याब वा दर नभएको
  const b = Number.isInteger(+base) ? String(base)
          : (+base).toFixed(2).replace(/\.00$/,'');    // 24 kVA, 24.5 kVA
  return amt + `<div class="cw-rate">${toNep(b)} ${unit} × ${toNep(fmt(rate))}</div>`;
}

// गणना विवरणमा देखाउने ठ्याक्कै लागू दर (रिजिम + महिना सापेक्ष)
function rateExact(k,reg,m,units,nd,ne){
 reg=reg||'2078';const c=cat(k,reg);
 if(c.type==='tod'){
  const d=c.d?('डि.'+toNep(c.d.toFixed(2))+' + '):'';
  return d+(isTod3(m)
   ?('पिक '+toNep(c.pk.toFixed(2))+'/अ.पि.'+toNep(c.op.toFixed(2))+'/अन्य '+toNep(c.ot.toFixed(2)))
   :('पिक '+toNep(c.pk.toFixed(2))+'/अन्य '+toNep(c.ot.toFixed(2))));
 }
 if(c.type==='flat'){
  return (c.d?('डि.'+toNep(c.d.toFixed(2))+' + '):'')+'इनर्जी '+toNep(c.e.toFixed(2))+'/यु.';
 }
 // ग्राहस्थ (slab/dom3lv/dom3mv): न्यूनतम + प्रभावकारी प्रति-युनिट इनर्जी
 const eff=units>0?(ne/units):0;
 return 'न्यून.'+toNep(fmt(nd))+' + इनर्जी ~'+toNep(eff.toFixed(2))+'/यु.';
}

// ─── Template ────────────────────────────────────────────────────────────
function catOpts(sel){return Object.entries(CATS).map(([k,v])=>`<option value="${k}" ${k===sel?'selected':''}>${v.n}</option>`).join('');}
function monthOpts(sel){return MONTHS.map((m,i)=>`<option value="${i}" ${i===sel?'selected':''}>${m}</option>`).join('');}
function authOpts(){return AUTH.map(a=>`<option value="${a.k}">${a.label} — ${a.limit===Infinity?'आवश्यकता अनुसार':'रु. '+toNep(a.limit.toLocaleString('en-IN'))+' सम्म'}</option>`).join('');}

function template(){
return `
<div class="nb-container">
  <div class="nb-steps">
    <button type="button" class="nb-step on" data-step="1">1. ग्राहक विवरण</button>
    <button type="button" class="nb-step" data-step="2">2. वर्ग र खपत गणना</button>
    <button type="button" class="nb-step" data-step="3">3. गणना विवरण र टिप्पणी</button>
  </div>

  <div class="nb-card on" data-card="1">
    <div class="sk-ch"><span class="sk-ch-t">ग्राहकको विवरण</span></div>
    <div class="sk-cb">
      <div class="nb-mp">
        <label class="nb-mp-label">mPower डेटा पेस्ट <small>(ग्राहक विवरण भाग — स्वतः भरिन्छ)</small></label>
        <textarea id="nb-mp-paste" class="nb-mp-paste" rows="4" placeholder="Consumer Meter Reading Report (वा ग्राहक विवरण भाग) यहाँ पेस्ट गर्नुहोस्..."></textarea>
        <div class="nb-mp-actions">
          <button type="button" class="sk-btn sk-bp" id="nb-mp-parse">स्वत: भर्नुहोस्</button>
          <button type="button" class="sk-btn sk-bg" id="nb-mp-clear">खाली गर्नुहोस्</button>
          <span id="nb-mp-status" class="nb-mp-status"></span>
        </div>
      </div>
      <div class="sk-form-grid">
        <div class="sk-f"><label>ग्राहकको नाम</label><input id="nb-naam" type="text" placeholder="पूरा नाम"></div>
        <div class="sk-f"><label>ग्राहक नं.</label><input id="nb-cno" type="text" placeholder="006.19.038"></div>
        <div class="sk-f"><label>आई.डि.नं.</label><input id="nb-cid" type="text" placeholder="000000012345"></div>
        <div class="sk-f"><label>मिटर नं.</label><input id="nb-meter" type="text" placeholder="मिटर नम्बर"></div>
        <div class="sk-f"><label>टेलिफोन नं.</label><input id="nb-mob" type="tel" placeholder="98XXXXXXXX"></div>
        <div class="sk-f"><label>मिति <small style="font-weight:400;color:#94a3b8">(आजको मिति — स्वतः भरिन्छ)</small></label><input id="nb-miti" type="text" placeholder="YYYY-MM-DD"></div>
      </div>
      <div class="nb-addr-section">
        <div class="nb-addr-label">ठेगाना</div>
        <div class="nb-addr-box">
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
      </div>
      <input type="hidden" id="nb-addr">
      <div class="nb-nav">
        <button type="button" class="sk-btn sk-bp nb-next" data-to="2">अगाडि →</button>
      </div>
    </div>
  </div>

  <div class="nb-card" data-card="2">
    <div class="sk-ch"><span class="sk-ch-t">वर्ग परिवर्तन र छुट बिल गणना</span></div>
    <div class="sk-cb">
      <div class="nb-cat-grid">
        <div class="nb-catbox old">
          <h4>पहिले बिलिङ भएको वर्ग (साविक)<span class="nb-seg-tag" id="nb-oldseg-tag" style="display:none"> — आधार (पहिलो) खण्ड</span></h4>
          <div class="sk-form-grid">
            <div class="sk-f"><label>वर्ग</label><select id="nb-oldcat">${catOpts('irr_lv')}</select></div>
            <div class="sk-f" id="nb-oldamp-w" style="display:none"><label>एम्पियर (सिंगल फेज)</label>
              <select id="nb-oldamp"><option value="5">5 एम्पियर</option><option value="15" selected>15 एम्पियर</option><option value="30">30 एम्पियर</option><option value="60">60 एम्पियर</option></select></div>
            <div class="sk-f" id="nb-oldkva-w"><label>स्वीकृत लोड (के.भी.ए.)</label><input id="nb-oldkva" type="number" min="0" step="0.1" value="0"></div>
          </div>
        </div>
        <div class="nb-catbox new">
          <h4>कायम हुनुपर्ने (सही) वर्ग<span class="nb-seg-tag" id="nb-newseg-tag" style="display:none"> — आधार (पहिलो) खण्ड</span></h4>
          <div class="sk-form-grid">
            <div class="sk-f"><label>वर्ग</label><select id="nb-newcat">${catOpts('dom_sp')}</select></div>
            <div class="sk-f" id="nb-newamp-w"><label>एम्पियर (सिंगल फेज)</label>
              <select id="nb-newamp"><option value="5">5 एम्पियर</option><option value="15" selected>15 एम्पियर</option><option value="30">30 एम्पियर</option><option value="60">60 एम्पियर</option></select></div>
            <div class="sk-f" id="nb-newkva-w" style="display:none"><label>स्वीकृत लोड (के.भी.ए.)</label><input id="nb-newkva" type="number" min="0" step="0.1" value="4"></div>
          </div>
          <label class="nb-loss" id="nb-newloss-w" style="display:none"><input type="checkbox" id="nb-newloss"> ट्रान्सफर्मर लस बापत डिमाण्ड र इनर्जी शुल्कमा <b>+3%</b> थप (विनियम 6(4)/(5))</label>
          <div class="nb-hint">विनियम 6(2) बमोजिम डिमाण्ड शुल्क स्वीकृत लोडको <b>80%</b> ले स्वतः गणना हुन्छ — यहाँ पूरा स्वीकृत लोड मात्र राख्नुहोस्।</div>
        </div>
      </div>

      <div class="nb-seg-box" id="nb-seg-box">
        <label class="nb-loss" style="margin:0"><input type="checkbox" id="nb-segon"> अवधिभित्र <b>क्षमता वृद्धि / वर्ग परिवर्तन</b> भएको छ — समय-खण्ड (time frame) मा विभाजन गरी गणना गर्नुहोस्</label>
        <div id="nb-seg-wrap" style="display:none;margin-top:10px">
          <div class="nb-addr-label" style="margin-bottom:8px">थप खण्डहरू — प्रत्येक खण्डमा राखिएको मिति <b>देखि</b> सोही खण्डको वर्ग/क्षमता लागू हुन्छ; सो अघिका महिनामा माथिको <b>आधार (पहिलो) खण्ड</b> लागू हुन्छ।</div>
          <table class="nb-tbl nb-seg-tbl">
            <thead><tr>
              <th style="width:82px">देखि — वर्ष</th><th style="width:104px">देखि — महिना</th>
              <th>साविक वर्ग</th><th style="width:118px">साविक क्षमता</th>
              <th>कायम हुने वर्ग</th><th style="width:118px">कायम क्षमता</th><th style="width:36px"></th>
            </tr></thead>
            <tbody id="nb-segbody"></tbody>
          </table>
          <div style="margin-top:8px"><button type="button" class="sk-btn sk-bg" id="nb-addseg">+ खण्ड थप्नुहोस्</button></div>
          <div class="nb-hint" style="margin-top:8px">उदाहरण : ग्राहकले सुरुमा <b>घरायसी 5 एम्पियर</b> लिई पछि <b>क्षमता वृद्धि गरी 15 एम्पियर</b> बनाएको भए — माथिको आधार खण्डमा 5 एम्पियर राखी, यहाँ क्षमता वृद्धि लागू भएको वर्ष/महिनाको खण्ड थपी 15 एम्पियर छान्नुहोस्। प्रत्येक महिनाको महसुल सोही महिनामा लागू हुने खण्डको वर्ग/क्षमता र सोही समयको विनियमावली अनुसार गणना हुन्छ।</div>
        </div>
      </div>

      <div class="nb-sec-label">अवधि र मासिक खपत (युनिट)</div>
      <div class="nb-regnote">प्रत्येक महिनाको महसुल सोही महिनामा लागू <b>विद्युत महसुल संकलन विनियमावली</b> अनुसार स्वतः गणना हुन्छ — <b>पुस 1, 2078</b> देखिका महिनामा वि.सं. <b>2078</b>, साउन 1, 2077 देखि पुस 2078 अघिसम्म वि.सं. <b>2077</b>, र सो अघि वि.सं. <b>2073</b> को दर लागू हुन्छ।</div>
      <div class="nb-addr-box" style="margin-bottom:4px">
        <div class="nb-addr-label" style="margin-bottom:10px">अवधि छान्नुहोस् — देखि / सम्म (महिनाहरू स्वतः थपिन्छन्)</div>
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
          <th style="width:84px">वर्ष (वि.सं.)</th><th style="width:110px">महिना</th><th>खपत युनिट <span id="nb-todhead" style="display:none;font-weight:400">(पिक / अफ पिक / अन्य)</span></th>
          <th>साविक वर्गको महसुल (रु.)<br><span id="nb-oldrate" style="font-weight:400;font-size:10.5px;color:#64748b"></span></th><th>कायम हुने वर्गको महसुल (रु.)<br><span id="nb-newrate" style="font-weight:400;font-size:10.5px;color:#64748b"></span></th><th>फरक / छुट रकम (रु.)</th><th style="width:36px"></th>
        </tr></thead>
        <tbody id="nb-mbody"></tbody>
        <tfoot><tr class="total"><td colspan="2">जम्मा</td><td id="nb-tu" class="num">0</td><td id="nb-to" class="num">0.00</td><td id="nb-tn" class="num">0.00</td><td id="nb-td" class="num">0.00</td><td></td></tr></tfoot>
      </table>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button type="button" class="sk-btn sk-bg" id="nb-addrow">+ महिना थप्नुहोस्</button>
        <button type="button" class="sk-btn sk-bp" id="nb-calc">गणना गर्नुहोस्</button>
      </div>
      <div class="nb-hint">साविक वर्गको महसुल स्वतः गणना हुन्छ; बिलमा फरक रकम भए सो कोठामा सच्याउन सकिन्छ — फरक रकम स्वतः अद्यावधिक हुन्छ। टि.ओ.डी. वर्ग छानिएमा पिक (साँझ 5–राति 11), अफ पिक (राति 11–बिहान 5) र अन्य समयका युनिट छुट्टाछुट्टै राख्नुहोस् — जम्मा युनिट स्वतः जोडिन्छ। पुस–चैत महिनामा अफ पिक दर लागू नहुने भएकोले अफ पिक युनिट "अन्य समय" दरमै गणना हुन्छ। <b>एकल रिडिङ भएमा</b> ब्यान्डका कोठा खाली छोडी जम्मा युनिट मात्र राख्नुहोस् — सबै युनिट "अन्य समय" दरमा र डिमाण्ड शुल्क स्वीकृत लोडको 80% ले गणना हुन्छ।</div>

      <div class="nb-stats">
        <div class="nb-stat"><div class="l">जम्मा खपत</div><div class="v" id="nb-su">0 युनिट</div></div>
        <div class="nb-stat"><div class="l">साविक वर्गबाट बुझाएको</div><div class="v" id="nb-so">रु. 0.00</div></div>
        <div class="nb-stat"><div class="l">कायम हुने वर्गको महसुल</div><div class="v" id="nb-sn">रु. 0.00</div></div>
        <div class="nb-stat diff"><div class="l">असुल गर्नुपर्ने छुट रकम</div><div class="v" id="nb-sd">रु. 0.00</div></div>
        <div class="nb-stat" id="nb-stat-vat" style="display:none"><div class="l">भ्याट (भदौ 1, 2083 पछि)</div><div class="v" id="nb-svat">रु. 0.00</div></div>
        <div class="nb-stat ok"><div class="l">कुल जम्मा</div><div class="v" id="nb-sgrand">रु. 0.00</div></div>
      </div>

      <div class="nb-auth-box">
        <div class="nb-addr-label">छुट बिल स्वीकृत गर्ने अधिकारी (विद्युत वितरण विनियमावली, 2069 — अनुसूची–29)</div>
        <div class="sk-f" style="margin-top:6px"><select id="nb-auth">${authOpts()}</select></div>
        <div class="nb-auth-note" id="nb-auth-note">छुट रकम अनुसार अधिकारी स्वतः छानिन्छ — आवश्यक परे परिवर्तन गर्न सकिन्छ।</div>
      </div>

      <div class="nb-nav">
        <button type="button" class="sk-btn sk-bg nb-back" data-to="1">← पछाडि</button>
        <button type="button" class="sk-btn sk-bp nb-next" data-to="3">पूर्वावलोकन →</button>
      </div>
    </div>
  </div>

  <div class="nb-card" data-card="3">
    <div class="sk-ch"><span class="sk-ch-t">पूर्वावलोकन — छुट बिल गणना र टिप्पणी</span></div>
    <div class="sk-cb">

      <!-- ═══ 1. छुट बिल गणना (छुट्टै पाना — सरल ढाँचा) ═══ -->
      <div class="nb-sec-label">1. छुट बिल गणना विवरण</div>
      <div class="nb-doc" id="nb-print-calc">
        <div class="nb-calc-head">
          <div class="o">नेपाल विद्युत प्राधिकरण</div>
          <div class="c">तौलिहवा वितरण केन्द्र</div>
          <div class="t">छुट बिल गणना</div>
        </div>
        <div class="nb-calc-meta" id="nb-calc-meta"></div>
        <div id="nb-calc-body"></div>
        <div class="nb-sig-row">
          <div class="nb-sig"><div class="ln">तयार गर्ने</div></div>
          <div class="nb-sig"><div class="ln">जाँच गर्ने</div></div>
          <div class="nb-sig"><div class="ln">प्रमाणित गर्ने</div></div>
        </div>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button type="button" class="sk-btn sk-bn" id="nb-print-calc-btn">गणना विवरण प्रिन्ट (Landscape)</button>
      </div>

      <!-- ═══ 2. टिप्पणी / आदेश (छुट्टै पाना — PDF ढाँचा) ═══ -->
      <div class="nb-sec-label" style="margin-top:8px">2. टिप्पणी / आदेश</div>
      <div class="nb-doc" id="nb-print-tippani">
        <div class="nb-tip-head">
          <div class="o">नेपाल विद्युत प्राधिकरण</div>
          <div class="c">तौलिहवा वितरण केन्द्र</div>
          <div class="k">(टिप्पणी / आदेश)</div>
        </div>
        <div class="nb-tip-to">
          <div>श्रीमान् <span id="nb-tip-sal">कार्यालय प्रमुख</span>ज्यू,</div>
          <div>मिति : <span id="nb-tip-miti"></span></div>
        </div>
        <div class="nb-tip-subj">विषय : छुट बिलिङ सम्बन्धमा ।</div>
        <div id="nb-tip-body"></div>
        <div class="nb-sig-row nb-sig-wrap">
          <div class="nb-sig"><div class="ln">पेश गर्ने</div></div>
          <div class="nb-sig"><div class="ln">सिफारिस गर्ने</div></div>
          <div class="nb-sig"><div class="ln">सदर गर्ने</div></div>
        </div>
      </div>
      <div class="nb-nav">
        <button type="button" class="sk-btn sk-bg nb-back" data-to="2">← सच्याउनुहोस्</button>
        <div style="display:flex;gap:8px">
          <button type="button" class="sk-btn sk-bn" id="nb-print-tip-btn">टिप्पणी प्रिन्ट</button>
          <button type="button" class="sk-btn sk-bp" id="nb-reset-btn">नयाँ टिप्पणी</button>
        </div>
      </div>
    </div>
  </div>
</div>`;
}

// ─── Init ────────────────────────────────────────────────────────────────
let authManual=false;
let ROOT=null;

/* ═══ सत्र स्वतः-सुरक्षण — गल्तिले ब्याक/ट्याब बन्द भएमा पनि अन्तिम सम्पादन फर्किन्छ ═══ */
const AUTOSAVE_KEY='nb_chhutbill_autosave_v1';
let saveTimer=null;
function fieldIds(){return['nb-mp-paste','nb-naam','nb-cno','nb-cid','nb-meter','nb-mob','nb-miti','nb-oldcat','nb-oldamp','nb-oldkva','nb-newcat','nb-newamp','nb-newkva','nb-newloss','nb-segon','nb-fy','nb-fm','nb-ty','nb-tm','nb-auth'];}
function collectState(){
 const g=id=>document.getElementById(id);
 const fields={};fieldIds().forEach(id=>{const n=g(id);if(!n)return;fields[id]=n.type==='checkbox'?n.checked:n.value;});
 const rows=[...document.querySelectorAll('#nb-mbody tr')].map(tr=>({yr:tr.querySelector('.yr').value,mo:+tr.querySelector('.mo').value,un:tr.querySelector('.un').value,ob:tr.querySelector('.ob').value,tp:tr.querySelector('.tp').value,tf:tr.querySelector('.tf').value,tt:tr.querySelector('.tt').value}));
 const muni=g('nb-addr-muni'),ward=g('nb-addr-ward'),place=g('nb-addr-place'),custom=g('nb-addr-custom'),customWrap=g('nb-addr-custom-wrap');
 const addr={muni:muni?muni.value:'',ward:ward?ward.value:'',place:place?place.value:'',custom:custom?custom.value:'',isCustom:!!(customWrap&&customWrap.style.display==='block')};
 const segs=[...document.querySelectorAll('#nb-segbody tr')].map(tr=>({
  y:tr.querySelector('.sy').value,m:+tr.querySelector('.sm').value,
  oCat:tr.querySelector('.soc').value,oAmp:tr.querySelector('.soa').value,oKva:tr.querySelector('.sok').value,
  nCat:tr.querySelector('.snc').value,nAmp:tr.querySelector('.sna').value,nKva:tr.querySelector('.snk').value}));
 const stepBtn=document.querySelector('.nb-step.on');
 return{fields,rows,segs,addr,authManual,step:stepBtn?+stepBtn.dataset.step:1};
}
function scheduleSave(){clearTimeout(saveTimer);saveTimer=setTimeout(()=>{if(!ROOT||ROOT.dataset.nbModule!=='chhutbill')return;S.saveJSON(AUTOSAVE_KEY,collectState());},400);}
function applyState(s){
 if(!s)return;
 const g=id=>document.getElementById(id);
 if(s.fields)Object.keys(s.fields).forEach(id=>{const n=g(id);if(!n)return;if(n.type==='checkbox')n.checked=!!s.fields[id];else n.value=s.fields[id];});
 authManual=!!s.authManual;
 document.getElementById('nb-segbody').innerHTML='';
 if(s.segs&&s.segs.length)s.segs.forEach(g=>addSeg(g));
 syncSegBox();
 syncCap();
 if(s.rows){g('nb-mbody').innerHTML='';s.rows.forEach(r=>{addRow(r.yr,r.mo);const tr=g('nb-mbody').lastElementChild;tr.querySelector('.un').value=r.un;tr.querySelector('.ob').value=r.ob;if(r.tp!==undefined)tr.querySelector('.tp').value=r.tp;if(r.tf!==undefined)tr.querySelector('.tf').value=r.tf;if(r.tt!==undefined)tr.querySelector('.tt').value=r.tt;});}
 if(s.addr&&s.addr.muni){
  const muni=g('nb-addr-muni'),ward=g('nb-addr-ward'),place=g('nb-addr-place'),custom=g('nb-addr-custom'),toggle=g('nb-addr-toggle-custom');
  muni.value=s.addr.muni;muni.dispatchEvent(new Event('change'));
  if(s.addr.ward){ward.value=s.addr.ward;ward.dispatchEvent(new Event('change'));
   if(s.addr.isCustom){toggle.click();custom.value=s.addr.custom;custom.dispatchEvent(new Event('input'));}
   else if(s.addr.place){place.value=s.addr.place;place.dispatchEvent(new Event('change'));}
  }
 }
 recalc(true);
}

function init(){
 document.querySelectorAll('.nb-step').forEach(b=>b.addEventListener('click',()=>nbStep(+b.dataset.step)));
 document.querySelectorAll('.nb-next').forEach(b=>b.addEventListener('click',()=>nbStep(+b.dataset.to)));
 document.querySelectorAll('.nb-back').forEach(b=>b.addEventListener('click',()=>nbStep(+b.dataset.to)));

 document.getElementById('nb-mp-parse').addEventListener('click',nbParseMpower);
 document.getElementById('nb-mp-clear').addEventListener('click',()=>{document.getElementById('nb-mp-paste').value='';nbMpStatus('');});

 document.getElementById('nb-oldcat').addEventListener('change',()=>{syncCap();recalc();});
 document.getElementById('nb-newcat').addEventListener('change',()=>{
  const k=document.getElementById('nb-newcat').value,c=CATS[k];
  if(c.type==='tod'&&!k.endsWith('_lv'))document.getElementById('nb-newloss').checked=true; // MT TOD: +3% स्वतः
  syncCap();recalc();
 });
 ['nb-oldamp','nb-newamp','nb-oldkva','nb-newkva'].forEach(id=>document.getElementById(id).addEventListener('input',()=>recalc()));
 document.getElementById('nb-newloss').addEventListener('change',()=>recalc());

 document.getElementById('nb-segon').addEventListener('change',()=>{syncSegBox();syncCap();recalc();});
 document.getElementById('nb-addseg').addEventListener('click',()=>{addSeg();syncCap();recalc();});

 document.getElementById('nb-addrow').addEventListener('click',()=>addRow());
 document.getElementById('nb-calc').addEventListener('click',()=>recalc());
 document.getElementById('nb-genrows').addEventListener('click',genRows);
 document.getElementById('nb-auth').addEventListener('change',()=>{authManual=true;updateAuthNote();});

 // देखि/सम्म defaults: पछिल्ला 3 महिना
 const fm=document.getElementById('nb-fm'),tm=document.getElementById('nb-tm');
 fm.innerHTML=monthOpts(0);tm.innerHTML=monthOpts(0);
 const t0=bsToday();
 let sm=t0.m-1-3,sy=t0.y;while(sm<0){sm+=12;sy--;}
 let em=t0.m-1-1,ey=t0.y;while(em<0){em+=12;ey--;}
 document.getElementById('nb-fy').value=sy;fm.value=sm;
 document.getElementById('nb-ty').value=ey;tm.value=em;

 document.getElementById('nb-print-calc-btn').addEventListener('click',()=>nbPrintEl('nb-print-calc',true));
 document.getElementById('nb-print-tip-btn').addEventListener('click',()=>nbPrintEl('nb-print-tippani'));
 S.addDocTools(document,'nb-print-tippani','nb-print-tip-btn','टिप्पणी','word');
 // Save to Excel → प्रिन्ट हुने फारामकै ढाँचामा निर्यात (सामान्य तालिका डम्प होइन)
 S.addDocTools(document,'nb-print-calc','nb-print-calc-btn','गणना_विवरण','excel',()=>downloadCalcExcel());
 document.getElementById('nb-reset-btn').addEventListener('click',nbReset);

 nbWireAddress();
 nbAutoFill();
 genRows();
 syncSegBox();syncCap();recalc();
 if(!ROOT.dataset.nbAutosaveWiredChhutbill){ROOT.dataset.nbAutosaveWiredChhutbill='1';ROOT.addEventListener('input',scheduleSave);ROOT.addEventListener('change',scheduleSave);ROOT.addEventListener('click',scheduleSave);
  ROOT.addEventListener('keydown',e=>{
   if(e.key!=='Enter'||!e.target.classList.contains('un'))return;
   e.preventDefault();
   const tr=e.target.closest('tr'),next=tr&&tr.nextElementSibling;
   if(next){const n=next.querySelector('.un');if(n){n.focus();n.select();}}
  });
 }
 const saved=S.loadJSON(AUTOSAVE_KEY);
 if(saved){applyState(saved);nbStep(saved.step||1);}
 else{nbStep(1);}
}

function nbAutoFill(){
 const t=bsToday();const el=document.getElementById('nb-miti');
 if(el&&!el.value)el.value=t.y+'-'+pad2(t.m)+'-'+pad2(t.d);
}
function nbStep(n){
 document.querySelectorAll('.nb-step').forEach((s,i)=>s.classList.toggle('on',i+1===n));
 document.querySelectorAll('.nb-card').forEach((c,i)=>c.classList.toggle('on',i+1===n));
 if(n===3)nbPreview();
 window.scrollTo(0,0);
}

// ─── Address picker ──────────────────────────────────────────────────────
let nbAddrState={muni:'',ward:'',place:'',custom:'',isCustom:false};
function nbUpdateAddrPreview(){
 const{muni,ward,place,custom,isCustom}=nbAddrState;
 const muniDisp=S.formatMuniDisplay?S.formatMuniDisplay(muni):muni;
 const munWard=ward?(muniDisp+' -'+ward):muniDisp;
 const parts=[munWard,isCustom?custom:place].filter(Boolean);
 document.getElementById('nb-addr-preview').textContent=parts.join(', ')||'ठेगाना छान्नुहोस्...';
 document.getElementById('nb-addr').value=parts.length?parts.join(', '):'';
}
function nbWireAddress(){
 const muniSel=document.getElementById('nb-addr-muni');
 Object.keys(MUNI_DATA).forEach(m=>{const o=document.createElement('option');o.value=m;o.textContent=m;muniSel.appendChild(o);});
 muniSel.addEventListener('change',()=>{
  const muni=muniSel.value;nbAddrState={muni,ward:'',place:'',custom:'',isCustom:false};
  const wardSel=document.getElementById('nb-addr-ward'),placeSel=document.getElementById('nb-addr-place');
  wardSel.innerHTML='<option value="">— वडा छान्नुहोस् —</option>';
  placeSel.innerHTML='<option value="">— पहिले वडा —</option>';placeSel.disabled=true;
  if(muni&&MUNI_DATA[muni]){wardSel.disabled=false;
   const max=Math.max.apply(null,Object.keys(MUNI_DATA[muni]).map(Number));
   for(let w=1;w<=max;w++){const o=document.createElement('option');o.value=w;o.textContent='वडा नं. '+w;wardSel.appendChild(o);}
  }else wardSel.disabled=true;
  nbHideCustom();nbUpdateAddrPreview();
 });
 document.getElementById('nb-addr-ward').addEventListener('change',()=>{
  const muni=muniSel.value,ward=document.getElementById('nb-addr-ward').value;
  Object.assign(nbAddrState,{ward,place:'',custom:'',isCustom:false});
  const placeSel=document.getElementById('nb-addr-place');
  placeSel.innerHTML='<option value="">— टोल —</option>';
  if(muni&&ward){placeSel.disabled=false;
   ((MUNI_DATA[muni]&&MUNI_DATA[muni][ward])||[]).forEach(pl=>{const o=document.createElement('option');o.value=pl;o.textContent=pl;placeSel.appendChild(o);});
   const oth=document.createElement('option');oth.value='__other__';oth.textContent='— अन्य (नयाँ) —';placeSel.appendChild(oth);
  }else placeSel.disabled=true;
  nbHideCustom();nbUpdateAddrPreview();
 });
 document.getElementById('nb-addr-place').addEventListener('change',()=>{
  const val=document.getElementById('nb-addr-place').value;
  if(val==='__other__'){nbAddrState.place='';nbAddrState.isCustom=true;nbShowCustom();}
  else{nbAddrState.place=val;nbAddrState.isCustom=false;nbHideCustom();}
  nbUpdateAddrPreview();
 });
 document.getElementById('nb-addr-custom').addEventListener('input',e=>{nbAddrState.custom=e.target.value.trim();nbUpdateAddrPreview();});
 document.getElementById('nb-addr-toggle-custom').addEventListener('click',()=>{
  nbAddrState.isCustom=true;nbShowCustom();document.getElementById('nb-addr-place').value='';nbAddrState.place='';nbUpdateAddrPreview();
 });
 document.getElementById('nb-addr-cancel-custom').addEventListener('click',()=>{nbHideCustom();nbUpdateAddrPreview();});
}
function nbShowCustom(){
 document.getElementById('nb-addr-custom-wrap').style.display='block';
 document.getElementById('nb-addr-toggle-custom').style.display='none';
 document.getElementById('nb-addr-cancel-custom').style.display='inline-block';
 document.getElementById('nb-addr-custom').focus();
}
function nbHideCustom(){
 document.getElementById('nb-addr-custom-wrap').style.display='none';
 document.getElementById('nb-addr-toggle-custom').style.display='inline-block';
 document.getElementById('nb-addr-cancel-custom').style.display='none';
 document.getElementById('nb-addr-custom').value='';
 nbAddrState.custom='';nbAddrState.isCustom=false;
}
function nbMpStatus(msg,kind){
 const el=document.getElementById('nb-mp-status');
 el.textContent=msg||'';
 el.style.color=kind==='warn'?'#d97706':kind==='err'?'#dc2626':'#16a34a';
}
// ─── mPower parser ───────────────────────────────────────────────────────
function nbParseMpower(){
 const raw=document.getElementById('nb-mp-paste').value||'';
 if(!raw.trim()){nbMpStatus('पेस्ट बक्स खाली छ।','warn');return;}
 const set=(id,v)=>{const e=document.getElementById(id);if(e&&v)e.value=v;};
 const row=raw.match(/(.+?)\s+(\d{12})\s+(\d{3}\.\d{2}\.\d{3}[A-Z]{0,4})\s+(\S+)/);
 let name='',cid='',cno='';
 if(row){name=row[1].replace(/^(Mr|Mrs|Miss)\.?\s*/i,'').trim();cid=row[2];cno=row[3];}
 else{
  cid=(raw.match(/\b\d{12}\b/)||[])[0]||'';
  cno=(raw.match(/\b\d{3}\.\d{2}\.\d{3}[A-Z]{0,4}\b/)||[])[0]||'';
  const m=raw.match(/([A-Z][A-Z\s]+?)\s+\d{12}/);
  if(m)name=m[1].trim();
 }
 if(!name&&!cid&&!cno){nbMpStatus('ग्राहक विवरण फेला परेन — पेस्ट जाँच्नुहोस्।','err');return;}
 set('nb-naam',name);set('nb-cid',cid);set('nb-cno',cno);
 nbMpStatus('ग्राहक विवरण भरियो ✓','ok');
}

function genStatus(msg,kind){
 const el=document.getElementById('nb-gen-status');
 el.textContent=msg||'';
 el.style.color=kind==='warn'?'#d97706':kind==='err'?'#dc2626':'#16a34a';
}
// देखि–सम्म अवधिका सबै महिनाका पङ्क्तिहरू स्वतः थप्ने
function genRows(){
 const fy=+document.getElementById('nb-fy').value,fm=+document.getElementById('nb-fm').value;
 const ty=+document.getElementById('nb-ty').value,tm=+document.getElementById('nb-tm').value;
 if(!fy||!ty){genStatus('वर्ष राख्नुहोस्।','warn');return;}
 const start=fy*12+fm,end=ty*12+tm;
 if(end<start){genStatus('"सम्म" मिति "देखि" भन्दा पहिले हुन सक्दैन।','err');return;}
 genStatus('');
 const old={};
 document.querySelectorAll('#nb-mbody tr').forEach(tr=>{
  const key=tr.querySelector('.yr').value+'-'+tr.querySelector('.mo').value;
  old[key]={un:tr.querySelector('.un').value,ob:tr.querySelector('.ob').value,
   tp:tr.querySelector('.tp').value,tf:tr.querySelector('.tf').value,tt:tr.querySelector('.tt').value};
 });
 document.getElementById('nb-mbody').innerHTML='';
 for(let i=start;i<=end;i++){
  const y=Math.floor(i/12),m=i%12;
  addRow(y,m);
  const tr=document.getElementById('nb-mbody').lastElementChild;
  const prev=old[y+'-'+m];
  if(prev){tr.querySelector('.un').value=prev.un;tr.querySelector('.ob').value=prev.ob;
   tr.querySelector('.tp').value=prev.tp;tr.querySelector('.tf').value=prev.tf;tr.querySelector('.tt').value=prev.tt;}
 }
 recalc();
}
/* ═══ समय-खण्ड (time frame) — क्षमता वृद्धि / वर्ग परिवर्तन ═══
   ग्राहकले सुरुमा घरायसी 5 एम्पियर लिई पछि क्षमता वृद्धि गरी 15 एम्पियर बनाएको जस्ता
   अवस्थामा एउटै अवधिभित्र साविक/कायम वर्ग वा क्षमता फरक हुन्छ । त्यसैले अवधिलाई
   खण्डमा विभाजन गरी, प्रत्येक महिनामा सो मितिमा लागू हुने खण्डको वर्ग/क्षमता प्रयोग
   गरिन्छ । आधार (पहिलो) खण्ड = माथिको साविक/कायम बाकस; थप खण्ड = तालिकाका पङ्क्ति । */
function segOn(){const c=document.getElementById('nb-segon');return !!(c&&c.checked);}
function segRows(){return [...document.querySelectorAll('#nb-segbody tr')];}
function baseSeg(){
 return{idx:-Infinity,y:null,m:null,base:true,
  oCat:document.getElementById('nb-oldcat').value,
  oAmp:+document.getElementById('nb-oldamp').value||5,
  oKva:+document.getElementById('nb-oldkva').value||0,
  nCat:document.getElementById('nb-newcat').value,
  nAmp:+document.getElementById('nb-newamp').value||5,
  nKva:+document.getElementById('nb-newkva').value||0};
}
function segList(){
 const list=[baseSeg()];
 if(segOn())segRows().forEach(tr=>{
  const y=+tr.querySelector('.sy').value||0,m=+tr.querySelector('.sm').value||0;
  if(!y)return;
  list.push({idx:y*12+m,y:y,m:m,base:false,
   oCat:tr.querySelector('.soc').value,oAmp:+tr.querySelector('.soa').value||5,oKva:+tr.querySelector('.sok').value||0,
   nCat:tr.querySelector('.snc').value,nAmp:+tr.querySelector('.sna').value||5,nKva:+tr.querySelector('.snk').value||0});
 });
 list.sort((a,b)=>a.idx-b.idx);
 return list;
}
function segFor(list,yr,m){const i=yr*12+m;let s=list[0];for(const x of list)if(x.idx<=i)s=x;return s;}
// खण्डको क्षमता (एम्पियर वा kVA) लेख्ने
function segCapTxt(s,side){
 const k=s[side+'Cat'],c=CATS[k];
 if(!c)return'';
 if(c.type==='slab')return' '+toNep(s[side+'Amp'])+' एम्पि.';
 return s[side+'Kva']?(' '+toNep(s[side+'Kva'])+' kVA'):'';
}
function segShort(s,side){return CATS[s[side+'Cat']]?(CATS[s[side+'Cat']].n+segCapTxt(s,side)):'—';}
// खण्ड-सहित वर्गको पूरा विवरण (टिप्पणी/मेटामा देखाउन)
// — लगातार उही रहेका खण्ड दोहोर्‍याइँदैन (जस्तै साविक उही भई कायम मात्र बदलिएमा)
function segSpans(list,side){
 const out=[];
 list.forEach(s=>{
  const txt=segShort(s,side);
  if(out.length&&out[out.length-1].txt===txt)return;
  out.push({txt:txt,s:s});
 });
 return out;
}
function catSpanText(list,side){
 const sp=segSpans(list,side);
 if(!sp.length)return '—';
 if(sp.length===1)return sp[0].txt;
 return sp.map((p,i)=>{
  const from=(i===0||p.s.idx===-Infinity)?'सुरुदेखि':(toNep(p.s.y)+'/'+toNep(pad2(p.s.m+1))+' देखि');
  return from+' : '+p.txt;
 }).join(' ; ');
}
function ampOpts(sel){return[5,15,30,60].map(a=>`<option value="${a}" ${+a===+sel?'selected':''}>${toNep(a)} एम्पियर</option>`).join('');}
// खण्ड पङ्क्तिमा वर्ग अनुसार एम्पियर/kVA देखाउने
function syncSegRow(tr){
 const oc=CATS[tr.querySelector('.soc').value],nc=CATS[tr.querySelector('.snc').value];
 tr.querySelector('.soa').style.display=oc.type==='slab'?'':'none';
 tr.querySelector('.sok').style.display=oc.type==='slab'?'none':'';
 tr.querySelector('.sna').style.display=nc.type==='slab'?'':'none';
 tr.querySelector('.snk').style.display=nc.type==='slab'?'none':'';
}
function addSeg(d){
 d=d||{};
 const b=baseSeg(),t=bsToday();
 const tr=document.createElement('tr');
 tr.innerHTML=`<td><input class="sy" type="number" min="2000" max="2199" value="${d.y??t.y}"></td>
  <td><select class="sm">${monthOpts(d.m??0)}</select></td>
  <td><select class="soc">${catOpts(d.oCat??b.oCat)}</select></td>
  <td><select class="soa">${ampOpts(d.oAmp??b.oAmp)}</select><input class="sok" type="number" min="0" step="0.1" value="${d.oKva??b.oKva}"></td>
  <td><select class="snc">${catOpts(d.nCat??b.nCat)}</select></td>
  <td><select class="sna">${ampOpts(d.nAmp??b.nAmp)}</select><input class="snk" type="number" min="0" step="0.1" value="${d.nKva??b.nKva}"></td>
  <td><button type="button" class="nb-x">✕</button></td>`;
 document.getElementById('nb-segbody').appendChild(tr);
 syncSegRow(tr);
 ['.sy','.sm','.soc','.soa','.sok','.snc','.sna','.snk'].forEach(cl=>{
  const n=tr.querySelector(cl);
  n.addEventListener('change',()=>{syncSegRow(tr);syncCap();recalc();});
  n.addEventListener('input',()=>recalc());
 });
 tr.querySelector('.nb-x').addEventListener('click',()=>{tr.remove();syncCap();recalc();});
}
function syncSegBox(){
 const on=segOn();
 document.getElementById('nb-seg-wrap').style.display=on?'':'none';
 ['nb-oldseg-tag','nb-newseg-tag'].forEach(id=>{const e=document.getElementById(id);if(e)e.style.display=on?'':'none';});
 if(on&&!segRows().length)addSeg();
}

// ─── Month rows + calculation ────────────────────────────────────────────
function newIsTod(){return segList().some(s=>CATS[s.nCat]&&CATS[s.nCat].type==='tod');}
function addRow(year,month){
 const t=bsToday();
 const showTod=newIsTod();
 const tr=document.createElement('tr');
 tr.innerHTML=`<td><input class="yr" value="${year??t.y}"></td>
  <td><select class="mo">${monthOpts(month??(t.m-1))}</select></td>
  <td><input class="un" type="number" min="0" value="">
   <div class="todw" style="display:${showTod?'grid':'none'}">
    <input class="tp" type="number" min="0" placeholder="पिक">
    <input class="tf" type="number" min="0" placeholder="अफ पिक">
    <input class="tt" type="number" min="0" placeholder="अन्य">
   </div></td>
  <td><input class="ob" type="number" step="0.01"></td>
  <td class="num nb">—</td><td class="num df">—</td>
  <td><button type="button" class="nb-x">✕</button></td>`;
 document.getElementById('nb-mbody').appendChild(tr);
 tr.querySelector('.un').addEventListener('input',()=>recalc());
 tr.querySelector('.mo').addEventListener('change',()=>recalc());
 tr.querySelector('.yr').addEventListener('input',()=>recalc());
 tr.querySelector('.ob').addEventListener('input',()=>recalc(true));
 ['.tp','.tf','.tt'].forEach(cl=>tr.querySelector(cl).addEventListener('input',()=>recalc()));
 tr.querySelector('.nb-x').addEventListener('click',()=>{tr.remove();recalc();});
}
function syncCap(){
 const o=CATS[document.getElementById('nb-oldcat').value],n=CATS[document.getElementById('nb-newcat').value];
 document.getElementById('nb-oldamp-w').style.display=o.type==='slab'?'':'none';
 document.getElementById('nb-oldkva-w').style.display=o.type==='slab'?'none':'';
 document.getElementById('nb-newamp-w').style.display=n.type==='slab'?'':'none';
 document.getElementById('nb-newkva-w').style.display=n.type==='slab'?'none':'';
 // +3% ट्रान्सफर्मर लस विकल्प: नयाँ वर्ग स्ल्याब (ग्राहस्थ सिंगल फेज) बाहेक देखाउने
 document.getElementById('nb-newloss-w').style.display=n.type==='slab'?'none':'flex';
 // TOD युनिट इनपुट देखाउने/लुकाउने — खण्ड (time frame) अनुसार महिना-पिच्छे
 const list=segList();
 const anyTod=list.some(s=>CATS[s.nCat]&&CATS[s.nCat].type==='tod');
 document.getElementById('nb-todhead').style.display=anyTod?'':'none';
 document.querySelectorAll('#nb-mbody tr').forEach(tr=>{
  const yr=+tr.querySelector('.yr').value||bsToday().y,mo=+tr.querySelector('.mo').value||0;
  const isTod=CATS[segFor(list,yr,mo).nCat].type==='tod';
  tr.querySelector('.todw').style.display=isTod?'grid':'none';
  if(!isTod)tr.querySelector('.un').readOnly=false;
 });
}
function updateAuthNote(){
 const a=AUTH.find(x=>x.k===document.getElementById('nb-auth').value);
 const note=document.getElementById('nb-auth-note');
 if(!a)return;
 note.textContent=a.limit===Infinity
   ?'अनुसूची–29 बमोजिम '+a.label+' ले आवश्यकता अनुसार छुट बिल स्वीकृत गर्न सक्ने।'
   :'अनुसूची–29 बमोजिम '+a.label+' ले एक पटकमा रु. '+toNep(a.limit.toLocaleString('en-IN'))+' सम्मको छुट बिल स्वीकृत गर्न सक्ने।';
}
function lossOn(){
 return document.getElementById('nb-newloss-w').style.display!=='none'&&document.getElementById('nb-newloss').checked;
}
// चेक/अनचेक अनुसार छानिएको वर्गको नाममा " + 3%" देखाउने/हटाउने
function updateNewCatLabel(){
 const sel=document.getElementById('nb-newcat');
 const on=lossOn();
 [...sel.options].forEach(o=>{o.textContent=CATS[o.value].n+(o.value===sel.value&&on?' + 3%':'');});
}
function recalc(keepOld){
 const SEGS=segList();
 const multiSeg=SEGS.length>1;
 let tU=0,tO=0,tN=0,tD=0,tND=0,tNE=0,tOD=0,tOE=0,tVat=0;
 const regSet={};
 document.querySelectorAll('#nb-mbody tr').forEach(tr=>{
  const m=+tr.querySelector('.mo').value;
  const yr=+tr.querySelector('.yr').value||bsToday().y;
  const reg=regimeFor(yr,m);
  regSet[reg]=1;
  tr.dataset.reg=reg;
  // सोही महिनामा लागू हुने खण्ड (क्षमता वृद्धि / वर्ग परिवर्तन)
  const sg=segFor(SEGS,yr,m);
  const oCat=sg.oCat,nCat=sg.nCat,oAmp=sg.oAmp,nAmp=sg.nAmp,oKva=sg.oKva,nKva=sg.nKva;
  const nIsTod=CATS[nCat].type==='tod';
  tr.dataset.ocat=oCat;tr.dataset.ncat=nCat;
  tr.dataset.okva=oKva;tr.dataset.nkva=nKva;
  tr.dataset.oamp=oAmp;tr.dataset.namp=nAmp;
  tr.querySelector('.todw').style.display=nIsTod?'grid':'none';
  const unInp=tr.querySelector('.un');
  let u,tod=null;
  if(nIsTod){
   const p=+tr.querySelector('.tp').value||0,o2=+tr.querySelector('.tf').value||0,t2=+tr.querySelector('.tt').value||0;
   if(tr.querySelector('.tp').value!==''||tr.querySelector('.tf').value!==''||tr.querySelector('.tt').value!==''){
    u=p+o2+t2;tod={p:p,o:o2,t:t2};
    unInp.value=u;unInp.readOnly=true;
   }else{
    u=+unInp.value||0;tod={p:0,o:0,t:u};unInp.readOnly=false;
   }
  }else{
   u=+unInp.value||0;unInp.readOnly=false;
  }
  // साविक वर्गको महसुल विभाजन (डिमाण्ड/इनर्जी) — रिजिम सापेक्ष
  const oparts=billParts(oCat,u,m,oAmp,oKva,tod,reg);
  tr.dataset.od=oparts.d.toFixed(2);tr.dataset.oe=oparts.e.toFixed(2);
  const obInp=tr.querySelector('.ob');
  let ob;
  if(keepOld&&obInp.value!==''){ob=+obInp.value;}
  else{ob=oparts.t;obInp.value=ob.toFixed(2);}
  // कायम वर्गको महसुल विभाजन — रिजिम सापेक्ष
  const parts=billParts(nCat,u,m,nAmp,nKva,tod,reg);
  const nb=parts.t,df=nb-ob;
  tr.dataset.nd=parts.d.toFixed(2);tr.dataset.ne=parts.e.toFixed(2);
  tr.querySelector('.nb').textContent=fmt(nb);
  tr.querySelector('.df').textContent=fmt(df);
  tU+=u;tO+=ob;tN+=nb;tD+=df;tND+=parts.d;tNE+=parts.e;tOD+=oparts.d;tOE+=oparts.e;
  // ── मू.अ.कर (निर्देशिका 2083 — भदौ 1, 2083 देखिका महिनाको छुट रकममा मात्र) ──
  //    घरायसी : मासिक 50 युनिटसम्म छुट, सो माथिको छुट रकममा 5% ; गैर-घरायसी : पूरै 13%
  let mVat=0;
  if(df>0 && T.VAT.appliesOn(yr,m+1)){
   const dom=catIsDomestic(nCat,reg);
   const vr=T.VAT.onConsumption({consumerType:dom?'domestic':'nonDomestic',units:u,chargeTotal:df,chargeAboveFreeUnits:df,bsYear:yr,bsMonth:m+1});
   mVat=vr.vat;
  }
  tr.dataset.vat=mVat.toFixed(2);
  tVat+=mVat;
 });
 // ट्रान्सफर्मर लस : जम्मा महसुल (रकम) को 3% मात्र एकमुष्ट थप
 const lossAmt=lossOn()?tN*0.03:0;
 const tN0=tN,tD0=tD;
 tN=tN0+lossAmt;tD=tN-tO;
 const vatTotal=round2(tVat);        // भदौ 1, 2083 पछिका महिनाको छुट रकममा मू.अ.कर
 const recovery=round2(tD);          // छुट रकम (भ्याट बाहेक — लस सहित)
 const grand=round2(tD+vatTotal);    // कुल जम्मा (भ्याट सहित)
 document.getElementById('nb-tu').textContent=tU;
 document.getElementById('nb-to').textContent=fmt(tO);
 document.getElementById('nb-tn').textContent=fmt(tN);
 document.getElementById('nb-td').textContent=fmt(tD);
 document.getElementById('nb-su').textContent=toNep(tU)+' युनिट';
 document.getElementById('nb-so').textContent='रु. '+toNep(fmt(tO));
 document.getElementById('nb-sn').textContent='रु. '+toNep(fmt(tN));
 document.getElementById('nb-sd').textContent='रु. '+toNep(fmt(tD));
 const vEl=document.getElementById('nb-svat');
 if(vEl)vEl.textContent='रु. '+toNep(fmt(vatTotal));
 const vStat=document.getElementById('nb-stat-vat');
 if(vStat)vStat.style.display=vatTotal>0?'':'none';
 const gEl=document.getElementById('nb-sgrand');
 if(gEl)gEl.textContent='रु. '+toNep(fmt(grand));
 const gLbl=gEl&&gEl.parentElement?gEl.parentElement.querySelector('.l'):null;
 if(gLbl)gLbl.textContent=vatTotal>0?'कुल जम्मा (भ्याट सहित)':'कुल जम्मा';
 // अधिकारी स्वतः छान्ने (म्यानुअल परिवर्तन नगरेसम्म)
 if(!authManual){
  const a=authFor(grand);
  document.getElementById('nb-auth').value=a.k;
 }
 updateAuthNote();
 updateNewCatLabel();
 LAST_TOT={unit:tU,diff:tD,grand:grand};
 // हेडर दर हिन्ट — रिजिम अनुसार फरक हुने भएकोले सोही अनुसार
 const regs=Object.keys(regSet).sort();
 const single=regs.length===1?regs[0]:null;
 const oCat0=SEGS[0].oCat,nCat0=SEGS[0].nCat;
 const oEl=document.getElementById('nb-oldrate'),nEl=document.getElementById('nb-newrate');
 if(multiSeg){
  oEl.textContent='खण्ड (क्षमता/वर्ग) अनुसार फरक — '+catSpanText(SEGS,'o');
  nEl.textContent='खण्ड (क्षमता/वर्ग) अनुसार फरक — '+catSpanText(SEGS,'n')+(lossOn()?' + 3% लस':'');
 }else if(single){
  const so=rateShort(oCat0,single),sn=rateShort(nCat0,single);
  oEl.textContent=(so?'दर: '+so:'')+' (वि.सं. '+regimeLabel(single)+')';
  nEl.textContent=(sn?'दर: '+sn:'')+' (वि.सं. '+regimeLabel(single)+')'+(lossOn()?' + 3% लस':'');
 }else{
  const suffix=(regs.length?' — वि.सं. '+regs.map(regimeLabel).join('/'):'');
  oEl.textContent='दर अवधि (विनियमावली) अनुसार फरक'+suffix;
  nEl.textContent='दर अवधि (विनियमावली) अनुसार फरक'+suffix+(lossOn()?' + 3% लस':'');
 }
 return{tU,tO,tN,tD,tN0,tD0,lossAmt,tND,tNE,tOD,tOE,grand,vatTotal,recovery,regimes:regs,segs:SEGS,multiSeg};
}
// ─── Preview: गणना विवरण (Landscape) + टिप्पणी ─────────────────────────────
function nbPreview(){
 const t=recalc();
 const naam=document.getElementById('nb-naam').value||'—';
 const cno=document.getElementById('nb-cno').value||'—';
 const cid=document.getElementById('nb-cid').value||'—';
 const meter=document.getElementById('nb-meter').value||'—';
 const addr=document.getElementById('nb-addr').value||'—';
 const miti=document.getElementById('nb-miti').value||'';
 const SEGS=t.segs||segList(),multiSeg=!!t.multiSeg;
 const oCat=SEGS[0].oCat,nCat=SEGS[0].nCat;   // आधार (पहिलो) खण्ड
 const regs=t.regimes.slice().sort();
 const regNames=regs.map(regimeLabel).join(' / ');
 const multiReg=regs.length>1;
 const repReg=regs.length?regs[regs.length-1]:'2078';

 // ═══ छुट बिल गणना (सरल पाना) ═══
 const meta=document.getElementById('nb-calc-meta');
 meta.innerHTML=
  `<div class="lb">ग्राहकको नाम :</div><div>${naam}</div><div class="lb">ग्राहक नं. :</div><div>${cno}</div>`+
  `<div class="lb">आई.डि.नं. :</div><div>${cid}</div><div class="lb">मिटर नं. :</div><div>${meter}</div>`+
  `<div class="lb">ठेगाना :</div><div class="full">${addr}</div>`+
  (multiSeg
    ?`<div class="lb">साविक वर्ग :</div><div class="full">${catSpanText(SEGS,'o')}</div>`+
     `<div class="lb">कायम वर्ग :</div><div class="full">${catSpanText(SEGS,'n')}${lossOn()?' + 3%':''}</div>`
    :`<div class="lb">साविक वर्ग :</div><div>${segShort(SEGS[0],'o')}</div><div class="lb">कायम वर्ग :</div><div>${segShort(SEGS[0],'n')}${lossOn()?' + 3%':''}</div>`)+
  `<div class="lb">लागू विनियमावली :</div><div class="full">सोही साल अनुसारको विद्युत महसुल संकलन विनियमावली अनुसार</div>`+
  `<div class="lb">मिति :</div><div>${toNep(miti)}</div>`;

 let rows='',sn=0;
 document.querySelectorAll('#nb-mbody tr').forEach(tr=>{
  const y=tr.querySelector('.yr').value;
  const mi=+tr.querySelector('.mo').value;
  const mn=MONTHS[mi];
  const un=+tr.querySelector('.un').value||0;
  const reg=tr.dataset.reg||'2078';
  const od=+tr.dataset.od||0,oe=+tr.dataset.oe||0;
  const nd=+tr.dataset.nd||0,ne=+tr.dataset.ne||0;
  const ob=+tr.querySelector('.ob').value||0;
  const nb=nd+ne, df=nb-ob;
  // सोही महिनामा लागू खण्डको वर्ग/क्षमता (क्षमता वृद्धि / वर्ग परिवर्तन भएको अवस्थामा)
  const rOCat=tr.dataset.ocat||oCat, rNCat=tr.dataset.ncat||nCat;
  const oKva=+tr.dataset.okva||0, nKva=+tr.dataset.nkva||0;
  const nIsTod=CATS[rNCat].type==='tod', oIsTod=CATS[rOCat].type==='tod';
  // ठ्याक्कै लागू दर (कायम वर्ग)
  let todNote='';
  if(nIsTod){
   const hasBands=(tr.querySelector('.tp').value!==''||tr.querySelector('.tf').value!==''||tr.querySelector('.tt').value!=='');
   if(hasBands){
    const p=toNep(tr.querySelector('.tp').value||'0'),f=toNep(tr.querySelector('.tf').value||'0'),o=toNep(tr.querySelector('.tt').value||'0');
    todNote='<span style="color:#475569">[पिक '+p+' / अ.पि. '+f+' / अन्य '+o+' यु.]</span>';
   }else todNote='<span style="color:#475569">[एकल रिडिङ]</span>';
  }
  sn++;
  // डिमाण्ड र इनर्जी छुट्टाछुट्टै फरक
  const dDem = nd - od, dEn = ne - oe;
  const oR = rateSplit(rOCat, reg, mi);         // साविक वर्गको दर
  const nR = rateSplit(rNCat, reg, mi);         // कायम वर्गको दर
  const oDbase = oKva * 0.8, nDbase = nKva * 0.8;   // बिल हुने डिमाण्ड (kVA)

  // TOD मा प्रति-युनिट एउटै दर हुँदैन — दर पंक्तिमा नलेखी रकम मात्र
  const oEcell = oIsTod ? `<b>${toNep(fmt(oe))}</b>`
                        : cellCalc(oe, un, oR.eRate, 'यु.', oR.slab);
  const nEcell = nIsTod ? `<b>${toNep(fmt(ne))}</b>` + (todNote ? `<div class="cw-rate">${todNote}</div>` : '')
                        : cellCalc(ne, un, nR.eRate, 'यु.', nR.slab);

  rows+=`<tr>
    <td>${toNep(sn)}</td>
    <td>${toNep(y)}/${toNep(pad2(mi+1))}${multiSeg?`<div class="cw-rate">${CATS[rOCat].n.split(' ')[0]}${CATS[rOCat].type==='slab'?' '+toNep(tr.dataset.oamp||'')+'A':''} → ${CATS[rNCat].n.split(' ')[0]}${CATS[rNCat].type==='slab'?' '+toNep(tr.dataset.namp||'')+'A':''}</div>`:''}</td>
    <td class="num">${toNep(un)}</td>

    <td class="num g1">${cellCalc(od, oDbase, oR.dRate, 'kVA', oR.slab)}</td>
    <td class="num g1">${cellCalc(nd, nDbase, nR.dRate, 'kVA', nR.slab)}</td>
    <td class="num g1 d">${toNep(fmt(dDem))}</td>

    <td class="num g2">${oEcell}</td>
    <td class="num g2">${nEcell}</td>
    <td class="num g2 d">${toNep(fmt(dEn))}</td>

    <td class="num">${toNep(fmt(ob))}</td>
    <td class="num">${toNep(fmt(nb))}</td>
    <td class="num d"><b>${toNep(fmt(df))}</b></td>
  </tr>`;
 });
 const withLoss=t.lossAmt>0;
 let lossRow='';
 if(withLoss){
  lossRow=`<tr>
    <td colspan="10" style="text-align:right">थप : ट्रान्सफर्मर लस बापत डिमाण्ड/इनर्जी शुल्कमा 3% (विनियम 6(4)/(5))</td>
    <td class="num">${toNep(fmt(t.lossAmt))}</td>
    <td class="num d">${toNep(fmt(t.lossAmt))}</td>
  </tr>`;
 }
 const grandRow=withLoss?`<tr class="total">
    <td colspan="2">कुल जम्मा (लस सहित)</td>
    <td class="num">${toNep(t.tU)}</td>
    <td class="num g1">${toNep(fmt(t.tOD))}</td>
    <td class="num g1">${toNep(fmt(t.tND))}</td>
    <td class="num g1 d">${toNep(fmt(t.tND - t.tOD))}</td>
    <td class="num g2">${toNep(fmt(t.tOE))}</td>
    <td class="num g2">${toNep(fmt(t.tNE))}</td>
    <td class="num g2 d">${toNep(fmt(t.tNE - t.tOE))}</td>
    <td class="num">${toNep(fmt(t.tO))}</td>
    <td class="num">${toNep(fmt(t.tN))}</td>
    <td class="num d"><b>${toNep(fmt(t.tD))}</b></td>
  </tr>`:'';
 // मू.अ.कर (भदौ 1, 2083 पछिका महिनाको छुट रकममा) + भ्याट सहित कुल जम्मा
 let vatRow='',grandVatRow='';
 if(t.vatTotal>0){
  vatRow=`<tr>
    <td colspan="10" style="text-align:right">थप : मू.अ.कर — भदौ 1, 2083 पछिका महिनाको छुट रकममा (घरायसी 5% / गैर-घरायसी 13%)</td>
    <td class="num"></td>
    <td class="num d">${toNep(fmt(t.vatTotal))}</td>
  </tr>`;
  grandVatRow=`<tr class="total">
    <td colspan="10" style="text-align:right">कुल जम्मा (भ्याट सहित)</td>
    <td class="num"></td>
    <td class="num d"><b>${toNep(fmt(t.grand))}</b></td>
  </tr>`;
 }
 
 document.getElementById('nb-calc-body').innerHTML=`
  <table class="nb-doc-tbl nb-ed-tbl">
    <thead>
      <tr>
        <th rowspan="2" style="width:30px">क्र.सं.</th>
        <th rowspan="2" style="width:88px">मिति</th>
        <th rowspan="2" style="width:52px">खपत<br>(युनिट)</th>
        <th colspan="3" class="grp g1">डिमाण्ड / न्यूनतम शुल्क (रु.)<br><span>DEMAND</span></th>
        <th colspan="3" class="grp g2">इनर्जी शुल्क (रु.)<br><span>ENERGY</span></th>
        <th colspan="3" class="grp">जम्मा महसुल (रु.)</th>
      </tr>
      <tr>
        <th class="g1">बिल भएको<br><span>BILLED</span></th>
        <th class="g1">बिल हुनुपर्ने<br><span>TO BE BILLED</span></th>
        <th class="g1 d">फरक</th>
        <th class="g2">बिल भएको<br><span>BILLED</span></th>
        <th class="g2">बिल हुनुपर्ने<br><span>TO BE BILLED</span></th>
        <th class="g2 d">फरक</th>
        <th>बिल भएको<br><span>BILLED</span></th>
        <th>बिल हुनुपर्ने<br><span>TO BE BILLED</span></th>
        <th class="d">फरक / छुट</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
      <tr class="total">
        <td colspan="2">जम्मा</td>
        <td class="num">${toNep(t.tU)}</td>
        <td class="num g1">${toNep(fmt(t.tOD))}</td>
        <td class="num g1">${toNep(fmt(t.tND))}</td>
        <td class="num g1 d">${toNep(fmt(t.tND - t.tOD))}</td>
        <td class="num g2">${toNep(fmt(t.tOE))}</td>
        <td class="num g2">${toNep(fmt(t.tNE))}</td>
        <td class="num g2 d">${toNep(fmt(t.tNE - t.tOE))}</td>
        <td class="num">${toNep(fmt(t.tO))}</td>
        <td class="num">${toNep(fmt(t.tN0))}</td>
        <td class="num d"><b>${toNep(fmt(t.tD0))}</b></td>
      </tr>
      ${lossRow}
      ${grandRow}
      ${vatRow}
      ${grandVatRow}
    </tbody>
  </table>
  <div class="nb-amt-words"><b>असुल गर्नुपर्ने रकम अक्षरुपी :</b> ${toNep(nepAmountWords(t.grand))}</div>`;

 // ═══ टिप्पणी / आदेश ═══
 const auth=AUTH.find(a=>a.k===document.getElementById('nb-auth').value)||authFor(t.grand);
 document.getElementById('nb-tip-sal').textContent=auth.sal;
 document.getElementById('nb-tip-miti').textContent=toNep(miti);

 // अवधि दायरा
 const trs=[...document.querySelectorAll('#nb-mbody tr')];
 let period='—';
 if(trs.length){
  const f=trs[0],l=trs[trs.length-1];
  const fs=toNep(f.querySelector('.yr').value)+' '+MONTHS[+f.querySelector('.mo').value];
  const ls=toNep(l.querySelector('.yr').value)+' '+MONTHS[+l.querySelector('.mo').value];
  period=trs.length===1?fs:(fs+' देखि '+ls+' सम्म');
 }
 const nMon=trs.length;
 const regClause=multiReg
   ?('उक्त अवधिका प्रत्येक महिनाको महसुल सोही महिनामा प्रचलित विद्युत महसुल संकलन विनियमावली (वि.सं. '+regNames+') बमोजिमको दरमा गणना गरिएको')
   :('उक्त अवधिको महसुल विद्युत महसुल संकलन विनियमावली, '+regNames+' बमोजिमको दरमा गणना गरिएको');
 const oRateTxt=(multiReg||multiSeg)?('सम्बन्धित विनियमावली (वि.सं. '+regNames+') बमोजिमको दर'):rateDesc(oCat,repReg);
 const nRateTxt=(multiReg||multiSeg)?('सम्बन्धित विनियमावली (वि.सं. '+regNames+') बमोजिमको दर'):rateDesc(nCat,repReg);
 // खण्ड (क्षमता वृद्धि / वर्ग परिवर्तन) भएको अवस्थाको कथन
 const oCatTxt=multiSeg?catSpanText(SEGS,'o'):segShort(SEGS[0],'o');
 const nCatTxt=multiSeg?catSpanText(SEGS,'n'):segShort(SEGS[0],'n');
 const segClause=multiSeg
   ?(' उक्त अवधिभित्र ग्राहकको क्षमता/वर्गमा परिवर्तन भएकोले अवधिलाई खण्डमा विभाजन गरी, प्रत्येक महिनामा सो मितिमा कायम रहेको वर्ग/क्षमता (साविक — '+oCatTxt+' ; कायम — '+nCatTxt+') अनुसार छुट्टाछुट्टै गणना गरिएको छ ।')
   :'';

 const b=[];
 b.push(`<div class="nb-tip-sec"><div class="b noind">उपरोक्त सम्बन्धमा यस तौलिहवा वितरण केन्द्र अन्तर्गत ग्राहक नं. <b>${cno}</b> (आई.डि.नं. <b>${cid}</b>), नाम <b>${naam}</b>, ठेगाना <b>${addr}</b> मा दर्ता रहेका ग्राहकको विद्युत महसुल बिलिङ सम्बन्धमा देहायबमोजिम टिप्पणी पेश गरिएको छ ।</div></div>`);

 b.push(`<div class="nb-tip-sec"><div class="h">1. विषयको पृष्ठभूमि</div><div class="b">उक्त ग्राहकलाई विद्युत महसुल बिलिङ गर्दा साविकमा <b>${oCatTxt}</b> को दरमा बिलिङ हुँदै आएकोमा, स्थलगत जाँच/अभिलेख अनुसार निजको विद्युत उपयोग <b>${nCatTxt}</b> मा पर्ने देखिएको । तसर्थ साविक वर्गमा भएको बिलिङ र कायम हुनुपर्ने सही वर्गको महसुल बीचको फरक रकम असुल गर्नुपर्ने भएकोले यो छुट बिलिङको टिप्पणी तयार गरिएको छ ।</div></div>`);

 b.push(`<div class="nb-tip-sec"><div class="h">2. गणना आधार</div><div class="b">${nMon?'यस अवधि ('+period+') का जम्मा '+toNep(nMon)+' महिनाको':'सम्बन्धित अवधिको'} खपत युनिटलाई आधार मानी, ${regClause} छ । साविक वर्ग (<b>${oCatTxt}</b>) मा ${oRateTxt} अनुसार र कायम हुनुपर्ने वर्ग (<b>${nCatTxt}</b>) मा ${nRateTxt} अनुसार महसुल गणना गरिएको छ ।${segClause} ${SEGS.every(x=>CATS[x.nCat].type==='slab')?'':'डिमाण्ड शुल्क विनियम 6(2) बमोजिम स्वीकृत लोडको 80% ले गणना गरिएको छ ।'} ${withLoss?'साथै विनियम 6(4)/(5) बमोजिम ट्रान्सफर्मर लस बापत डिमाण्ड तथा इनर्जी शुल्कमा 3% थप गरिएको छ ।':''} विस्तृत मासिक गणना संलग्न छुट बिल गणना विवरणमा उल्लेख गरिएको छ ।</div></div>`);

 const vatClause = t.vatTotal>0
   ? ` सो फरक रकममध्ये भदौ 1, 2083 पछिका महिनाको छुट रकममा "विद्युत सेवामा मू.अ.कर असुल गर्ने निर्देशिका, 2083" बमोजिम मू.अ.कर रु. <b>${toNep(fmt(t.vatTotal))}</b> (घरायसी 5% / गैर-घरायसी 13%) थप हुन आउँछ ।`
   : '';
 const grandLabel = t.vatTotal>0 ? ' (भ्याट सहित)' : '';
 b.push(`<div class="nb-tip-sec"><div class="h">3. असुल गर्नुपर्ने रकम</div><div class="b">माथिको गणना अनुसार साविक वर्गबाट बिलिङ भई बुझाइसकेको जम्मा रु. <b>${toNep(fmt(t.tO))}</b> र कायम हुनुपर्ने सही वर्गको जम्मा महसुल रु. <b>${toNep(fmt(t.tN))}</b> रहेकोमा, दुवैको फरक रकम रु. <b>${toNep(fmt(t.tD))}</b> हुन आउँछ ।${vatClause} यसरी संलग्न छुट बिल गणना विवरण बमोजिम निज ग्राहकबाट कुल असुल गर्नुपर्ने रकम${grandLabel} <b>रु. ${toNep(fmt(t.grand))}</b> (अक्षरुपी : ${toNep(nepAmountWords(t.grand))}) छुट बिलिङ मार्फत असुल गर्नुपर्ने देखिन्छ ।</div></div>`);

 b.push(`<div class="nb-tip-sec"><div class="h">4. अधिकार क्षेत्र</div><div class="b">विद्युत वितरण विनियमावली, 2069 को अनुसूची–29 बमोजिम ${auth.limit===Infinity?'<b>'+auth.label+'</b> ले आवश्यकता अनुसार छुट बिल स्वीकृत गर्न सक्ने भएकोले':'रु. '+toNep(auth.limit.toLocaleString('en-IN'))+' सम्मको छुट बिल <b>'+auth.label+'</b> ले स्वीकृत गर्न सक्ने भएकोले, प्रस्तुत रु. '+toNep(fmt(t.grand))+' सो सीमाभित्र पर्ने हुँदा'} यो टिप्पणी स्वीकृतिका लागि पेश गरिएको छ ।</div></div>`);

 b.push(`<div class="nb-tip-sec"><div class="h">5. अनुरोध / आदेश</div><div class="b">तसर्थ, माथि उल्लेखित जम्मा रकम <b>रु. ${toNep(fmt(t.grand))}</b> निज ग्राहक नं. ${cno} बाट छुट बिलिङ मार्फत असुल गर्न मिल्ने भएकोले सोही बमोजिम छुट बिल जारी गर्न/गराउन यो टिप्पणी स्वीकृतिका लागि सादर पेश गरिएको छ । स्वीकृत भएमा सोही अनुसार कार्यान्वयन गरिनेछ ।</div></div>`);

 // ── दुई पानामा बाँड्ने ──
 //   पाना 1 : पृष्ठभूमि + बुँदा 1, 2, 3, 4  — स्वाभाविक रूपमा बग्छ (खाली ठाउँ पारिँदैन)
 //   पाना 2 : बुँदा 5 (अनुरोध / आदेश) + सही ब्लक
 const p1 = b.slice(0,5).join('');     // intro + 1 + 2 + 3 + 4
 const p2 = b.slice(5).join('');       // 5
 document.getElementById('nb-tip-body').innerHTML =
   `<div class="nb-tip-p1">${p1}</div><div class="nb-tip-break">${p2}</div>`;
}

/* ═══ Excel डाउनलोड — छुट बिल गणना (प्रिन्ट हुने फारामकै ढाँचा) ═══
   प्रिन्ट पानाकै शीर्षक, ग्राहक विवरण, 12 स्तम्भे तालिका (डिमाण्ड / इनर्जी / जम्मा),
   जोड–लस–मू.अ.कर पंक्ति, अक्षरुपी र सही पंक्ति उही क्रममा निर्यात हुन्छ ।
   रकम/युनिट Excel मा वास्तविक संख्या भई जान्छन् — पुनः जोड्न/छान्न मिल्ने । */
async function downloadCalcExcel(){
 const ExcelJS=window.ExcelJS;
 if(!ExcelJS){alert('Excel लाइब्रेरी लोड भएन।');return;}
 const t=recalc(true);                     // म्यानुअल \"बिल भएको\" रकम जस्ताको तस्तै राख्ने
 const g=id=>{const e=document.getElementById(id);return e?String(e.value||'').trim():'';};
 const naam=g('nb-naam')||'—', cno=g('nb-cno')||'—', cid=g('nb-cid')||'—';
 const meter=g('nb-meter')||'—', addr=g('nb-addr')||'—', miti=g('nb-miti')||'';
 const SEGS=t.segs||segList(), multiSeg=!!t.multiSeg;
 const oCatTxt=multiSeg?catSpanText(SEGS,'o'):segShort(SEGS[0],'o');
 const nCatTxt=(multiSeg?catSpanText(SEGS,'n'):segShort(SEGS[0],'n'))+(lossOn()?' + 3%':'');
 const regNames=(t.regimes||[]).slice().sort().map(regimeLabel).join(' / ');

 const wb=new ExcelJS.Workbook();wb.creator='छुट बिल टिप्पणी';
 const ws=wb.addWorksheet('छुट बिल गणना',{
  views:[{showGridLines:false}],
  pageSetup:{paperSize:9,orientation:'landscape',fitToPage:true,fitToWidth:1,fitToHeight:0,
             margins:{left:0.35,right:0.35,top:0.45,bottom:0.35,header:0.2,footer:0.2}}
 });
 const NC=12;
 ws.columns=[{width:6},{width:18},{width:9},{width:13},{width:13},{width:12},
             {width:13},{width:13},{width:12},{width:13},{width:13},{width:13}];
 const thin={style:'thin',color:{argb:'FF9AA4B2'}};
 const allB={top:thin,left:thin,bottom:thin,right:thin};
 const HEAD='FFEFF3F8', TOTF='FFE8F0E8';
 const paint=(c1,c2,fill,bord)=>{for(let x=c1;x<=c2;x++){const c=ws.getCell(r,x);if(fill)c.fill={type:'pattern',pattern:'solid',fgColor:{argb:fill}};if(bord)c.border=allB;}};
 let r=1;
 // पाठ खाना (मर्ज सहित)
 const cellT=(c1,c2,val,o={})=>{
  if(c2>c1)ws.mergeCells(r,c1,r,c2);
  const c=ws.getCell(r,c1);
  c.value=val;
  c.font={bold:!!o.bold,size:o.size||10,italic:!!o.italic};
  c.alignment={horizontal:o.align||'left',vertical:'middle',wrapText:o.wrap!==false};
  paint(c1,c2,o.fill,o.border!==false);
  return c;
 };
 // संख्या खाना
 const cellN=(col,val,o={})=>{
  const c=ws.getCell(r,col);
  c.value=Number(val)||0;
  c.numFmt=o.int?'#,##0':'#,##0.00';
  c.font={bold:!!o.bold,size:10};
  c.alignment={horizontal:'right',vertical:'middle'};
  paint(col,col,o.fill,true);
  return c;
 };

 // ─ शीर्षक ─
 cellT(1,NC,'नेपाल विद्युत प्राधिकरण',{bold:true,size:15,align:'center',border:false});r++;
 cellT(1,NC,'तौलिहवा वितरण केन्द्र',{bold:true,size:12,align:'center',border:false});r++;
 cellT(1,NC,'छुट बिल गणना',{bold:true,size:13,align:'center',border:false});r++;
 r++;

 // ─ ग्राहकको विवरण ─
 const kv=(l1,v1,l2,v2)=>{
  cellT(1,2,l1,{bold:true});cellT(3,6,v1);
  cellT(7,8,l2,{bold:true});cellT(9,NC,v2);
  r++;
 };
 const kvFull=(l,v)=>{cellT(1,2,l,{bold:true});cellT(3,NC,v);r++;};
 kv('ग्राहकको नाम :',naam,'ग्राहक नं. :',cno);
 kv('आई.डि.नं. :',cid,'मिटर नं. :',meter);
 kvFull('ठेगाना :',addr);
 if(multiSeg){kvFull('साविक वर्ग :',oCatTxt);kvFull('कायम वर्ग :',nCatTxt);}
 else kv('साविक वर्ग :',oCatTxt,'कायम वर्ग :',nCatTxt);
 kvFull('लागू विनियमावली :','सोही साल अनुसारको विद्युत महसुल संकलन विनियमावली अनुसार'+(regNames?' (वि.सं. '+regNames+')':''));
 kv('मिति :',toNep(miti),'','');
 r++;

 // ─ तालिका शीर्ष (दुई तह — प्रिन्ट फारामकै समूह) ─
 const vmerge=(col,txt)=>{ws.mergeCells(r,col,r+1,col);const c=ws.getCell(r,col);c.value=txt;c.font={bold:true,size:10};c.alignment={horizontal:'center',vertical:'middle',wrapText:true};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:HEAD}};c.border=allB;ws.getCell(r+1,col).border=allB;ws.getCell(r+1,col).fill={type:'pattern',pattern:'solid',fgColor:{argb:HEAD}};};
 const grp=(c1,c2,txt)=>{ws.mergeCells(r,c1,r,c2);const c=ws.getCell(r,c1);c.value=txt;c.font={bold:true,size:10};c.alignment={horizontal:'center',vertical:'middle',wrapText:true};paint(c1,c2,HEAD,true);};
 vmerge(1,'क्र.सं.');vmerge(2,'मिति');vmerge(3,'खपत (युनिट)');
 grp(4,6,'डिमाण्ड / न्यूनतम शुल्क (रु.) — DEMAND');
 grp(7,9,'इनर्जी शुल्क (रु.) — ENERGY');
 grp(10,12,'जम्मा महसुल (रु.)');
 r++;
 ['बिल भएको','बिल हुनुपर्ने','फरक','बिल भएको','बिल हुनुपर्ने','फरक','बिल भएको','बिल हुनुपर्ने','फरक / छुट']
  .forEach((txt,i)=>{const c=ws.getCell(r,4+i);c.value=txt;c.font={bold:true,size:9};c.alignment={horizontal:'center',vertical:'middle',wrapText:true};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:HEAD}};c.border=allB;});
 r++;

 // ─ मासिक पंक्ति ─
 let sn=0;
 document.querySelectorAll('#nb-mbody tr').forEach(tr=>{
  const y=tr.querySelector('.yr').value;
  const mi=+tr.querySelector('.mo').value;
  const un=+tr.querySelector('.un').value||0;
  const od=+tr.dataset.od||0, oe=+tr.dataset.oe||0;
  const nd=+tr.dataset.nd||0, ne=+tr.dataset.ne||0;
  const ob=+tr.querySelector('.ob').value||0;
  const nb=nd+ne, df=nb-ob;
  const rOCat=tr.dataset.ocat||SEGS[0].oCat, rNCat=tr.dataset.ncat||SEGS[0].nCat;
  // मिति खाना — खण्ड परिवर्तन र TOD ब्यान्ड भएमा तल सानो टिप्पणी
  let dtx=y+'/'+pad2(mi+1)+'  '+MONTHS[mi];
  if(multiSeg){
   dtx+='\n'+CATS[rOCat].n.split(' ')[0]+(CATS[rOCat].type==='slab'?' '+(tr.dataset.oamp||'')+'A':'')+
        ' → '+CATS[rNCat].n.split(' ')[0]+(CATS[rNCat].type==='slab'?' '+(tr.dataset.namp||'')+'A':'');
  }
  if(CATS[rNCat].type==='tod'){
   const p=tr.querySelector('.tp').value,f=tr.querySelector('.tf').value,o=tr.querySelector('.tt').value;
   dtx+='\n'+((p!==''||f!==''||o!=='')?('[पिक '+(p||0)+' / अ.पि. '+(f||0)+' / अन्य '+(o||0)+' यु.]'):'[एकल रिडिङ]');
  }
  sn++;
  cellT(1,1,sn,{align:'center'});
  cellT(2,2,dtx);
  cellN(3,un,{int:true});
  cellN(4,od);cellN(5,nd);cellN(6,nd-od);
  cellN(7,oe);cellN(8,ne);cellN(9,ne-oe);
  cellN(10,ob);cellN(11,nb);cellN(12,df,{bold:true});
  r++;
 });

 // ─ जम्मा ─
 cellT(1,2,'जम्मा',{bold:true,align:'center',fill:HEAD});
 cellN(3,t.tU,{int:true,bold:true,fill:HEAD});
 cellN(4,t.tOD,{bold:true,fill:HEAD});cellN(5,t.tND,{bold:true,fill:HEAD});cellN(6,t.tND-t.tOD,{bold:true,fill:HEAD});
 cellN(7,t.tOE,{bold:true,fill:HEAD});cellN(8,t.tNE,{bold:true,fill:HEAD});cellN(9,t.tNE-t.tOE,{bold:true,fill:HEAD});
 cellN(10,t.tO,{bold:true,fill:HEAD});cellN(11,t.tN0,{bold:true,fill:HEAD});cellN(12,t.tD0,{bold:true,fill:HEAD});
 r++;

 // ─ ट्रान्सफर्मर लस ─
 if(t.lossAmt>0){
  cellT(1,10,'थप : ट्रान्सफर्मर लस बापत डिमाण्ड/इनर्जी शुल्कमा 3% (विनियम 6(4)/(5))',{align:'right'});
  cellN(11,t.lossAmt);cellN(12,t.lossAmt,{bold:true});
  r++;
  cellT(1,2,'कुल जम्मा (लस सहित)',{bold:true,align:'center',fill:HEAD});
  cellN(3,t.tU,{int:true,bold:true,fill:HEAD});
  cellN(4,t.tOD,{bold:true,fill:HEAD});cellN(5,t.tND,{bold:true,fill:HEAD});cellN(6,t.tND-t.tOD,{bold:true,fill:HEAD});
  cellN(7,t.tOE,{bold:true,fill:HEAD});cellN(8,t.tNE,{bold:true,fill:HEAD});cellN(9,t.tNE-t.tOE,{bold:true,fill:HEAD});
  cellN(10,t.tO,{bold:true,fill:HEAD});cellN(11,t.tN,{bold:true,fill:HEAD});cellN(12,t.tD,{bold:true,fill:HEAD});
  r++;
 }

 // ─ मू.अ.कर + कुल जम्मा ─
 if(t.vatTotal>0){
  cellT(1,10,'थप : मू.अ.कर — भदौ 1, 2083 पछिका महिनाको छुट रकममा (घरायसी 5% / गैर-घरायसी 13%)',{align:'right'});
  cellT(11,11,'');cellN(12,t.vatTotal,{bold:true});
  r++;
  cellT(1,10,'कुल जम्मा (भ्याट सहित)',{bold:true,align:'right',fill:TOTF});
  cellT(11,11,'',{fill:TOTF});cellN(12,t.grand,{bold:true,fill:TOTF});
  r++;
 }
 r++;

 // ─ अक्षरुपी ─
 cellT(1,NC,'असुल गर्नुपर्ने रकम अक्षरुपी : '+toNep(nepAmountWords(t.grand)),{bold:true,border:false});
 r+=3;

 // ─ सही पंक्ति ─
 [['तयार गर्ने',1,4],['जाँच गर्ने',5,8],['प्रमाणित गर्ने',9,12]].forEach(s=>{
  ws.mergeCells(r,s[1],r,s[2]);
  const c=ws.getCell(r,s[1]);c.value=s[0];c.font={size:10};c.alignment={horizontal:'center'};
 });

 const buf=await wb.xlsx.writeBuffer();
 const who=(g('nb-cno')||g('nb-naam')||'ग्राहक').replace(/[\\/:*?"<>|]/g,'_');
 const blob=new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
 const url=URL.createObjectURL(blob);
 const a=document.createElement('a');a.href=url;a.download='छुट_बिल_गणना_'+who+'.xlsx';
 document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),3000);
}

// ─── Print (single document, isolated) ───────────────────────────────────
function nbPrintEl(id,landscape){
 const src=document.getElementById(id);
 if(!src){window.print();return;}
 let wrap=document.getElementById('nb-print-wrap');
 if(wrap)wrap.remove();
 wrap=document.createElement('div');wrap.id='nb-print-wrap';
 const clone=src.cloneNode(true);
 clone.style.border='none';clone.style.boxShadow='none';
 wrap.appendChild(clone);
 document.body.appendChild(wrap);
 let styleTag=document.getElementById('nb-orient-style');
 if(styleTag)styleTag.remove();
 styleTag=document.createElement('style');styleTag.id='nb-orient-style';
 styleTag.textContent='@media print{@page{size:A4 '+(landscape?'landscape':'portrait')+';margin:'+(landscape?'8mm 8mm 7mm':'14mm 14mm 12mm')+'}}';
 document.head.appendChild(styleTag);
 document.body.classList.add('nb-printing');
 const cleanup=()=>{document.body.classList.remove('nb-printing');const w=document.getElementById('nb-print-wrap');if(w)w.remove();const st=document.getElementById('nb-orient-style');if(st)st.remove();window.removeEventListener('afterprint',cleanup);};
 window.addEventListener('afterprint',cleanup);
 setTimeout(()=>window.print(),60);
}
function nbReset(){
 if(!confirm('नयाँ टिप्पणीका लागि सबै विवरण खाली गर्ने?'))return;
 ['nb-naam','nb-cno','nb-cid','nb-meter','nb-mob','nb-addr','nb-mp-paste','nb-oldkva'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
 document.getElementById('nb-mbody').innerHTML='';
 document.getElementById('nb-segbody').innerHTML='';
 document.getElementById('nb-segon').checked=false;
 document.getElementById('nb-addr-muni').value='';
 document.getElementById('nb-addr-ward').innerHTML='<option value="">— पहिले नगरपालिका —</option>';
 document.getElementById('nb-addr-ward').disabled=true;
 document.getElementById('nb-addr-place').innerHTML='<option value="">— पहिले वडा —</option>';
 document.getElementById('nb-addr-place').disabled=true;
 nbHideCustom();nbAddrState={muni:'',ward:'',place:'',custom:'',isCustom:false};nbUpdateAddrPreview();
 authManual=false;
 S.clearJSON(AUTOSAVE_KEY);
 nbAutoFill();genRows();syncSegBox();syncCap();recalc();nbStep(1);
 nbMpStatus('');genStatus('');
}


// ─── Mount (module entry) ────────────────────────────────────────────────
function mount(root){
 ROOT=root;ROOT.dataset.nbModule='chhutbill';
 root.innerHTML=template();
 init();
 if(window.LocalExcelSave)window.LocalExcelSave.addSaveButton(root,'chhutbill',snapshot);
}
/* पछिल्लो गणनाको जोड — Excel अभिलेखका लागि */
let LAST_TOT={unit:0,diff:0,grand:0};
function snapshot(){
 const g=id=>{const n=document.getElementById(id);return n?String(n.value||'').trim():'';};
 // खण्ड (क्षमता वृद्धि / वर्ग परिवर्तन) भएमा सबै खण्डको वर्ग एकैसाथ अभिलेख हुन्छ
 const snapCat=side=>segSpans(segList(),side).map(p=>p.txt).join(' / ');
 recalc(true);
 return{
  date:g('nb-miti'),name:g('nb-naam'),cid:g('nb-cid'),cno:g('nb-cno'),
  meterType:'Single Phase',
  oldCat:snapCat('o'),newCat:snapCat('n'),
  unit:LAST_TOT.unit||0,
  amount:round2(LAST_TOT.grand||0),
  remark:'Category Change'
 };
}
return {mount,collectState,snapshot};
})(window.NBShared);
