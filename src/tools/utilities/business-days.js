import {style,qs} from './helpers.js';
export function mount(root){
 style();
 root.innerHTML='<section class="ut-page"><div class="ut-card"><div class="ut-head"><div class="ut-head-icon">work_history</div><div><h2>Business Days Calculator</h2><p>Count weekdays between two dates, excluding weekends.</p></div></div><div class="ut-grid"><label class="ut-field"><span>Start</span><input data-a type="date"></label><label class="ut-field"><span>End</span><input data-b type="date"></label></div><div class="ut-actions"><button class="primary" data-go>Count days</button></div><div class="ut-grid" data-out></div></div></section>';
 const a=qs(root,'[data-a]'),b=qs(root,'[data-b]');const n=new Date();a.valueAsDate=n;b.valueAsDate=new Date(n.getTime()+30*86400000);
 function calc(){
   let d=new Date(a.value+'T00:00:00'),end=new Date(b.value+'T00:00:00');if(d>end)[d,end]=[end,d];
   let weekdays=0,total=0;while(d<=end){const w=d.getDay();total++;if(w!==0&&w!==6)weekdays++;d.setDate(d.getDate()+1)}
   qs(root,'[data-out]').innerHTML='<div class="ut-stat"><span>Calendar days</span><strong>'+total+'</strong></div><div class="ut-stat"><span>Weekdays</span><strong>'+weekdays+'</strong></div>';
 }
 qs(root,'[data-go]').onclick=calc;calc();
}