const DEFAULT_PRAYERS=[
  {name:'Fajr',time:'05:00'},
  {name:'Dhuhr',time:'12:30'},
  {name:'Asr',time:'15:45'},
  {name:'Maghrib',time:'18:30'},
  {name:'Isha',time:'20:00'}
];

let prayers = JSON.parse(localStorage.getItem("prayers")) || DEFAULT_PRAYERS;

function secsUntil(t){
  const now=new Date();
  const [h,m]=t.split(":").map(Number);
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

function render(){
  const grid=document.getElementById("prayer-grid");
  grid.innerHTML="";

  let min=Infinity, index=0;

  prayers.forEach((p,i)=>{
    let sec=secsUntil(p.time);

    if(sec<min){min=sec;index=i;}

    const card=document.createElement("div");
    card.className="prayer-card";

    card.innerHTML=`
      <h3>${p.name}</h3>
      <p>${p.time}</p>
      <div class="countdown-row ${sec<=180?"urgent":""}">
        ${format(sec)}
      </div>
    `;

    grid.appendChild(card);
  });

  document.getElementById("next-prayer-name").textContent=prayers[index].name;
  document.getElementById("next-prayer-countdown").textContent=format(min);
}

function toggleFasting(){
  alert("Fasting toggle works (extend logic if needed)");
}

function saveFasting(){
  console.log("Saved fasting time");
}

setInterval(render,1000);
render();