const CLOCK_SVG='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
const EDIT_SVG='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5z"/></svg>';
const CHECK_SVG='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>';

const DEFAULT_PRAYERS=[
  {name:'subh',arabic:'الفجر',time:'05:00'},
  {name:'Dhuhur',arabic:'الظهر',time:'12:30'},
  {name:'Aswir',arabic:'العصر',time:'15:45'},
  {name:'Maghrib',arabic:'المغرب',time:'18:30'},
  {name:'Isha',arabic:'العشاء',time:'20:00'}
];
const URGENCY=180;

function load(key,def){try{const v=localStorage.getItem(key);return v?JSON.parse(v):def}catch{return def}}
function save(key,val){localStorage.setItem(key,JSON.stringify(val))}

let prayers=load('qalb-prayer-times',DEFAULT_PRAYERS);
let fasting=load('qalb-fasting-schedule',{suhoorTime:'04:30',iftarTime:'18:35',enabled:false});

function secsUntil(t){const now=new Date(),p=t.split(':').map(Number),d=new Date(now);d.setHours(p[0],p[1],0,0);if(d<=now)d.setDate(d.getDate()+1);return Math.max(0,Math.floor((d-now)/1000))}
function fmt(s){const h=Math.floor(s/3600),m=Math.floor(s%3600/60),sec=s%60;return[h,m,sec].map(v=>String(v).padStart(2,'0')).join(':')}

function renderCards(){
  const grid=document.getElementById('prayer-grid');
  grid.innerHTML='';
  const cds=prayers.map(p=>secsUntil(p.time));
  let minI=0,minV=Infinity;
  cds.forEach((c,i)=>{if(c>0&&c<minV){minV=c;minI=i}});

  document.getElementById('next-prayer-name').textContent=prayers[minI].name;
  document.getElementById('next-prayer-countdown').textContent=fmt(cds[minI]);

  prayers.forEach((p,i)=>{
    const isNext=i===minI, urgent=cds[i]>0&&cds[i]<=URGENCY;
    const card=document.createElement('div');
    card.className='prayer-card'+(isNext?' is-next':'');
    card.innerHTML=`
      <span class="arabic">${p.arabic}</span>
      <div class="top-row">
        <span class="name">${p.name}</span>
        ${isNext?'<span class="next-badge">Next</span>':''}
      </div>
      <div class="time-row">
        ${CLOCK_SVG}
        <span class="time-display" id="td-${i}">${p.time}</span>
        <button class="edit-btn" id="eb-${i}" onclick="startEdit(${i})">${EDIT_SVG}</button>
      </div>
      <div class="countdown-row${urgent?' urgent':''}">
        <span class="dot"></span>
        <span id="cd-${i}">${fmt(cds[i])}</span>
      </div>`;
    grid.appendChild(card);
  });
}

function startEdit(i){
  const row=document.getElementById('td-'+i).parentElement;
  const btn=document.getElementById('eb-'+i);
  const disp=document.getElementById('td-'+i);
  disp.outerHTML=`<input type="time" class="time-input" id="ti-${i}" value="${prayers[i].time}">`;
  btn.innerHTML=CHECK_SVG;btn.onclick=()=>saveEdit(i);
}
function saveEdit(i){
  const inp=document.getElementById('ti-'+i);
  if(inp)prayers[i].time=inp.value;
  save('qalb-prayer-times',prayers);renderCards();
}

function toggleFasting(){
  fasting.enabled=!fasting.enabled;saveFasting();updateFastingUI();
}
function saveFasting(){
  fasting.suhoorTime=document.getElementById('suhoor-time').value;
  fasting.iftarTime=document.getElementById('iftar-time').value;
  save('qalb-fasting-schedule',fasting);
}
function updateFastingUI(){
  const btn=document.getElementById('fasting-toggle');
  const ss=document.getElementById('suhoor-slot'),is=document.getElementById('iftar-slot');
  const si=document.getElementById('suhoor-time'),ii=document.getElementById('iftar-time');
  si.value=fasting.suhoorTime;ii.value=fasting.iftarTime;
  if(fasting.enabled){
    btn.className='toggle-btn active';btn.querySelector('span').textContent='Active';
    ss.classList.remove('disabled');is.classList.remove('disabled');
    si.disabled=false;ii.disabled=false;
  }else{
    btn.className='toggle-btn inactive';btn.querySelector('span').textContent='Inactive';
    ss.classList.add('disabled');is.classList.add('disabled');
    si.disabled=true;ii.disabled=true;
    document.getElementById('suhoor-countdown').textContent='';
    document.getElementById('iftar-countdown').textContent='';
  }
}

function tick(){
  const cds=prayers.map(p=>secsUntil(p.time));
  let minI=0,minV=Infinity;
  cds.forEach((c,i)=>{if(c>0&&c<minV){minV=c;minI=i}});
  document.getElementById('next-prayer-name').textContent=prayers[minI].name;
  document.getElementById('next-prayer-countdown').textContent=fmt(cds[minI]);
  cds.forEach((c,i)=>{
    const el=document.getElementById('cd-'+i);
    if(el){el.textContent=fmt(c);
      const row=el.parentElement;
      const urgent=c>0&&c<=URGENCY;
      row.className='countdown-row'+(urgent?' urgent':'');
      row.querySelector('.dot').style.background=urgent?'var(--destructive)':'var(--success)';
    }
  });
  if(fasting.enabled){
    document.getElementById('suhoor-countdown').textContent=fmt(secsUntil(fasting.suhoorTime));
    document.getElementById('iftar-countdown').textContent=fmt(secsUntil(fasting.iftarTime));
  }
}

renderCards();updateFastingUI();tick();setInterval(tick,1000);
