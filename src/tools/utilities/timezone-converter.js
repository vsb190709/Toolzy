import {style,qs,esc} from './helpers.js';
const zones=['UTC','Asia/Kolkata','Europe/London','Europe/Berlin','Asia/Dubai','Asia/Singapore','Asia/Tokyo','Australia/Sydney','America/New_York','America/Chicago','America/Denver','America/Los_Angeles'];
function offsetMinutes(date,tz){
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(date);
 const get=k=>Number(parts.find(x=>x.type===k)?.value||0);
 return (Date.UTC(get('year'),get('month')-1,get('day'),get('hour'),get('minute'),get('second'))-date.getTime())/60000;
}
function zonedToUtc(value,tz){
 const p=value.split(/[-T:]/).map(Number);
 if(p.length<5)throw new Error('Choose a valid date and time.');
 const wall=Date.UTC(p[0],p[1]-1,p[2],p[3],p[4],0);
 let guess=new Date(wall);
 for(let i=0;i<3;i++)guess=new Date(wall-offsetMinutes(guess,tz)*60000);
 return guess;
}
export function mount(root){
 style();
 const opts=zones.map(z=>'<option value="'+z+'">'+z+'</option>').join('');
 root.innerHTML='<section class="ut-page"><div class="ut-card"><div class="ut-head"><div class="ut-head-icon">public</div><div><h2>Time Zone Converter</h2><p>Convert a wall-clock time between common time zones.</p></div></div><div class="ut-grid"><label class="ut-field"><span>Date & time</span><input data-date type="datetime-local"></label><label class="ut-field"><span>From</span><select data-from>'+opts+'</select></label><label class="ut-field"><span>To</span><select data-to>'+opts+'</select></label></div><div class="ut-actions"><button class="primary" data-go>Convert</button><button class="secondary" data-now>Use now</button></div><div class="ut-output" data-out></div></div></section>';
 const d=qs(root,'[data-date]');const now=new Date();d.value=new Date(now.getTime()-now.getTimezoneOffset()*60000).toISOString().slice(0,16);
 qs(root,'[data-from]').value='Asia/Kolkata';qs(root,'[data-to]').value='America/New_York';
 const convert=()=>{
   try{
     const instant=zonedToUtc(d.value,qs(root,'[data-from]').value);
     const to=qs(root,'[data-to]').value;
     const text=new Intl.DateTimeFormat(undefined,{timeZone:to,dateStyle:'full',timeStyle:'long'}).format(instant);
     qs(root,'[data-out]').textContent='Result: '+text+'\\nUTC: '+instant.toISOString();
   }catch(e){qs(root,'[data-out]').textContent=e.message}
 };
 qs(root,'[data-go]').onclick=convert;qs(root,'[data-now]').onclick=()=>{const n=new Date();d.value=new Date(n.getTime()-n.getTimezoneOffset()*60000).toISOString().slice(0,16);convert()};convert();
}