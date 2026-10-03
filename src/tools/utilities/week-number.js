import {style,qs} from './helpers.js';
function isoWeek(date){
 const d=new Date(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate()));d.setUTCDate(d.getUTCDate()+4-(d.getUTCDay()||7));
 const yearStart=new Date(Date.UTC(d.getUTCFullYear(),0,1));return Math.ceil((((d-yearStart)/86400000)+1)/7);
}
export function mount(root){
 style();
 root.innerHTML='<section class="ut-page"><div class="ut-card"><div class="ut-head"><div class="ut-head-icon">view_week</div><div><h2>Week Number</h2><p>Get ISO week, day-of-year and weekday for a date.</p></div></div><label class="ut-field"><span>Date</span><input data-date type="date"></label><div class="ut-actions"><button class="primary" data-go>Inspect date</button></div><div class="ut-grid" data-out></div></div></section>';
 const d=qs(root,'[data-date]');d.valueAsDate=new Date();
 qs(root,'[data-go]').onclick=()=>{const x=new Date(d.value+'T00:00:00'),start=new Date(x.getFullYear(),0,1),day=Math.floor((x-start)/86400000)+1;qs(root,'[data-out]').innerHTML='<div class="ut-stat"><span>ISO week</span><strong>Week '+isoWeek(x)+'</strong></div><div class="ut-stat"><span>Day of year</span><strong>'+day+'</strong></div><div class="ut-stat"><span>Weekday</span><strong>'+x.toLocaleDateString(undefined,{weekday:'long'})+'</strong></div>'};qs(root,'[data-go]').click()
}