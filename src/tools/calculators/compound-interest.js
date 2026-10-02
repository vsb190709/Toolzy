export function mount(el) {
  el.innerHTML=`<div class="tool-form"><label>Principal <input id="p" type="number" value="10000"></label><label>Annual rate (%) <input id="r" type="number" value="6"></label><label>Compounds per year <input id="n" type="number" value="12"></label><label>Years <input id="t" type="number" value="5"></label><button class="primary" id="go">Calculate</button><output id="out"></output></div>`;
  const q=s=>el.querySelector(s);
  q("#go").onclick=()=>{const p=+q("#p").value,r=+q("#r").value/100,n=+q("#n").value,t=+q("#t").value,a=p*Math.pow(1+r/n,n*t);q("#out").textContent=`Final: ${a.toFixed(2)} · Interest: ${(a-p).toFixed(2)}`};
}
