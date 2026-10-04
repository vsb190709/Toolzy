import {style,qs,formatDuration} from './helpers.js';
export function mount(root){
 style();
 root.innerHTML='<section class="ut-page"><div class="ut-card"><div class="ut-head"><div class="ut-head-icon">${icon("schedule")}</div><div><h2>Countdown Timer</h2><p>Set a target moment and get a live countdown.</p></div></div><label class="ut-field"><span>Target date & time</span><input data-target type="datetime-local"></label><div class="ut-big" data-time>00:00:00</div><div class="ut-actions"><button class="primary" data-start>Start</button><button data-reset>Reset</button></div><div class="ut-output" data-status>Ready.</div></div></section>';
 const target=qs(root,'[data-target]');const t=new Date(Date.now()+25*60*1000);target.value=new Date(t.getTime()-t.getTimezoneOffset()*60000).toISOString().slice(0,16);
 const out=qs(root,'[data-time]'),status=qs(root,'[data-status]');let timer=null,paused=false,remaining=0;
 function draw(){const ms=paused?remaining:new Date(target.value).getTime()-Date.now();remaining=Math.max(0,ms);out.textContent=formatDuration(remaining);if(remaining<=0&&timer){clearInterval(timer);timer=null;paused=false;status.textContent='Time!';}}
 qs(root,'[data-start]').onclick=()=>{if(timer){clearInterval(timer);timer=null;paused=true;status.textContent='Paused.'}else{if(paused){paused=false}else remaining=new Date(target.value).getTime()-Date.now();timer=setInterval(draw,250);status.textContent='Running.'}draw()};
 qs(root,'[data-reset]').onclick=()=>{clearInterval(timer);timer=null;paused=false;const x=new Date(Date.now()+25*60*1000);target.value=new Date(x.getTime()-x.getTimezoneOffset()*60000).toISOString().slice(0,16);status.textContent='Ready.';draw()};
 draw();
}