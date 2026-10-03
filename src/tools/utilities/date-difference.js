import {style,qs} from './helpers.js';
const day=86400000;
export function mount(root){
 style();
 root.innerHTML='<section class="ut-page"><div class="ut-card"><div class="ut-head"><div class="ut-head-icon">date_range</div><div><h2>Date Difference</h2><p>See the exact calendar span between two dates.</p></div></div><div class="ut-grid"><label class="ut-field"><span>Start date</span><input data-a type="date"></label><label class="ut-field"><span>End date</span><input data-b type="date"></label></div><div class="ut-actions"><button class="primary" data-go>Calculate</button><button class="secondary" data-swap>Swap</button></div><div class="ut-grid" data-stats></div></div></section>';
 const a=qs(root,'[data-a]'),b=qs(root,'[data-b]');const now=new Date();a.valueAsDate=now;b.valueAsDate=new Date(now.getTime()+7*day);
 function calc(){
   const da=new Date(a.value+'T00:00:00'),db=new Date(b.value+'T00:00:00');if(Number.isNaN(da)||Number.isNaN(db))return;
   const signed=Math.round((db-da)/day),abs=Math.abs(signed),weeks=Math.floor(abs/7),days=abs%7;
   qs(root,'[data-stats]').innerHTML='<div class="ut-stat"><span>Difference</span><strong>'+signed+' days</strong></div><div class="ut-stat"><span>Breakdown</span><strong>'+weeks+' weeks '+days+' days</strong></div><div class="ut-stat"><span>Direction</span><strong>'+ (signed>0?'End is later':signed<0?'End is earlier':'Same day') +'</strong></div>';
 }
 qs(root,'[data-go]').onclick=calc;qs(root,'[data-swap]').onclick=()=>{[a.value,b.value]=[b.value,a.value];calc()};calc();
}