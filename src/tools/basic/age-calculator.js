export function mount(el){
 el.innerHTML=`<div class="tool-form"><label>Date of birth <input id="dob" type="date"></label><button class="primary" id="go">Calculate age</button><output id="out"></output></div>`;
 const dob=el.querySelector('#dob'),out=el.querySelector('#out');
 const now=new Date(); dob.value=`${now.getFullYear()-18}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
 el.querySelector('#go').onclick=()=>{const d=new Date(dob.value+'T00:00:00');if(!dob.value||Number.isNaN(d.getTime()))return out.textContent='Enter a valid date.';if(d>now)return out.textContent='Date of birth cannot be in the future.';let y=now.getFullYear()-d.getFullYear(),m=now.getMonth()-d.getMonth(),day=now.getDate()-d.getDate();if(day<0){m--;day+=new Date(now.getFullYear(),now.getMonth(),0).getDate()}if(m<0){y--;m+=12}out.textContent=`${y} years, ${m} months, ${day} days`;};
}