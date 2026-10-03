import {style,qs,esc} from './helpers.js';
export function mount(root){
 style();
 const now=new Date();
 root.innerHTML='<section class="ut-page"><div class="ut-card"><div class="ut-head"><div class="ut-head-icon">calendar_month</div><div><h2>Calendar Generator</h2><p>Generate any month with a clean print-friendly grid.</p></div></div><div class="ut-grid"><label class="ut-field"><span>Month</span><select data-month>'+Array.from({length:12},(_,i)=>'<option value="'+i+'">'+new Date(2000,i,1).toLocaleString(undefined,{month:'long'})+'</option>').join('')+'</select></label><label class="ut-field"><span>Year</span><input data-year type="number" min="1900" max="2100" value="'+now.getFullYear()+'"></label></div><div class="ut-actions"><button class="primary" data-go>Generate</button><button data-print>Print</button></div><div data-calendar></div></div></section>';
 qs(root,'[data-month]').value=String(now.getMonth());
 function draw(){
   const y=Number(qs(root,'[data-year]').value),m=Number(qs(root,'[data-month]').value),days=new Date(y,m+1,0).getDate(),first=new Date(y,m,1).getDay();
   let html='<div class="ut-calendar">'+['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(x=>'<div class="day head">'+x+'</div>').join('');
   for(let i=0;i<first;i++)html+='<div class="day"></div>';
   for(let d=1;d<=days;d++)html+='<div class="day">'+d+'</div>';
   html+='</div><p class="ut-note" style="margin-top:12px">'+esc(new Date(y,m,1).toLocaleString(undefined,{month:'long',year:'numeric'}))+'</p>';
   qs(root,'[data-calendar]').innerHTML=html;
 }
 qs(root,'[data-go]').onclick=draw;qs(root,'[data-print]').onclick=()=>window.print();draw();
}