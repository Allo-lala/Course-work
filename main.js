let prayers=[];
let notifiedPrayer=null;

let fasting = JSON.parse(localStorage.getItem("fasting")) || {
  enabled:false,
  suhoor:"04:30",
  iftar:"18:35"
};

function fetchPrayerTimes(lat, lon){
  fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=2`)
  .then(res=>res.json())
  .then(data=>{
    const t=data.data.timings;

    prayers=[
      {name:"Fajr", time:t.Fajr},
      {name:"Dhuhr", time:t.Dhuhr},
      {name:"Asr", time:t.Asr},
      {name:"Maghrib", time:t.Maghrib},
      {name:"Isha", time:t.Isha}
    ];

    renderCards();
  });
}

navigator.geolocation.getCurrentPosition(pos=>{
  fetchPrayerTimes(pos.coords.latitude,pos.coords.longitude);
});

function secsUntil(t){
  const now=new Date();
  const [h,m]=t.split(":");
  const target=new Date();
  target.setHours(h,m,0);
  if(target<=now) target.setDate(target.getDate()+1);
  return Math.floor((target-now)/1000);
}

function format(s){
  let h=Math.floor(s/3600);
  let m=Math.floor((s%3600)/60);
  let sec=s%60;
  return [h,m,sec].map(v=>String(v).padStart(2,"0")).join(":");
}

function renderCards(){
  const grid=document.getElementById("prayer-grid");
  grid.innerHTML="";

  const cds=prayers.map(p=>secsUntil(p.time));

  let minI=0,minV=Infinity;
  cds.forEach((c,i)=>{if(c<minV){minV=c;minI=i}});

  prayers.forEach((p,i)=>{
    const card=document.createElement("div");
    card.className="prayer-card"+(i===minI?" is-next":"");

    card.innerHTML=`
      <h3>${p.name}</h3>
      ${i===minI?'<span class="next-badge">Next</span>':''}
      <p>${p.time}</p>
      <div id="cd-${i}">${format(cds[i])}</div>
    `;

    grid.appendChild(card);
  });
}

function tick(){
  if(prayers.length===0) return;

  const cds=prayers.map(p=>secsUntil(p.time));

  let minI=0,minV=Infinity;
  cds.forEach((c,i)=>{if(c<minV){minV=c;minI=i}});

  document.getElementById("next-prayer-name").textContent=prayers[minI].name;
  document.getElementById("next-prayer-countdown").textContent=format(minV);

  cds.forEach((c,i)=>{
    const el=document.getElementById("cd-"+i);
    if(el) el.textContent=format(c);
  });

  // 🔊 ADHAN
  if(minV===0 && notifiedPrayer!==minI){
    document.getElementById("adhan-audio").play();
    notifiedPrayer=minI;
  }

  updateFastingCountdowns();
}

setInterval(tick,1000);

/* FASTING */
function toggleFasting(){
  fasting.enabled=!fasting.enabled;
  localStorage.setItem("fasting",JSON.stringify(fasting));
  updateFastingUI();
}

function saveFasting(){
  fasting.suhoor=document.getElementById("suhoor-time").value;
  fasting.iftar=document.getElementById("iftar-time").value;
  localStorage.setItem("fasting",JSON.stringify(fasting));
}

function updateFastingUI(){
  const btn=document.getElementById("fasting-toggle");

  if(fasting.enabled){
    btn.className="toggle-btn active";
    btn.innerText="Active";
  } else {
    btn.className="toggle-btn inactive";
    btn.innerText="Inactive";
  }

  document.getElementById("suhoor-time").value=fasting.suhoor;
  document.getElementById("iftar-time").value=fasting.iftar;
}

function updateFastingCountdowns(){
  if(!fasting.enabled) return;

  document.getElementById("suhoor-countdown").textContent =
    format(secsUntil(fasting.suhoor));

  document.getElementById("iftar-countdown").textContent =
    format(secsUntil(fasting.iftar));
}

/* DARK MODE */
function toggleDarkMode(){
  document.body.classList.toggle("dark");
}