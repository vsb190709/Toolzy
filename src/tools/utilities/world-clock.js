import {style,qs,esc} from './helpers.js';
const cities=[
  ['Local','Asia/Kolkata'],['London','Europe/London'],['New York','America/New_York'],['Los Angeles','America/Los_Angeles'],
  ['Tokyo','Asia/Tokyo'],['Singapore','Asia/Singapore'],['Dubai','Asia/Dubai'],['Sydney','Australia/Sydney']
];
export function mount(root){
 style();
 root.innerHTML='<section class="ut-page"><div class="ut-card"><div class="ut-head"><div class="ut-head-icon">schedule</div><div><h2>World Clock</h2><p>Live clocks for popular cities. Times update every second.</p></div></div><div class="ut-grid" data-clocks></div></div></section>';
 const fmtTime=new Intl.DateTimeFormat(undefined,{hour:'2-digit',minute:'2-digit',second:'2-digit'});
 const fmtDate=new Intl.DateTimeFormat(undefined,{weekday:'short',month:'short',day:'numeric'});
 function draw(){
   const now=new Date();
   qs(root,'[data-clocks]').innerHTML=cities.map(([city,tz])=>{
     const time=new Intl.DateTimeFormat(undefined,{timeZone:tz,hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(now);
     const date=new Intl.DateTimeFormat(undefined,{timeZone:tz,weekday:'short',month:'short',day:'numeric'}).format(now);
     const zone=new Intl.DateTimeFormat(undefined,{timeZone:tz,timeZoneName:'short'}).formatToParts(now).find(x=>x.type==='timeZoneName')?.value||tz;
     return '<article class="ut-stat"><span>'+esc(city)+' · '+esc(zone)+'</span><strong>'+esc(time)+'</strong><span>'+esc(date)+'</span></article>';
   }).join('');
 }
 draw();const id=setInterval(draw,1000);root._cleanup=()=>clearInterval(id);
}