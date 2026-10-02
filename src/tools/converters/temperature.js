const units={
  C:["Celsius",v=>v,v=>v],
  F:["Fahrenheit",v=>(v-32)*5/9,v=>v*9/5+32],
  K:["Kelvin",v=>v-273.15,v=>v+273.15]
};
const options=Object.entries(units).map(([k,[name]])=>`<option value="${k}">${name} (${k})</option>`).join("");
export function mount(el){
  el.innerHTML=`<div class="tool-form converter-modern">
    <label class="field"><span>Temperature</span><input id="v" type="number" value="25" step="any"></label>
    <div class="converter-pair">
      <label class="field"><span>From</span><select id="f">${options}</select></label>
      <button class="swap-button" id="swap" aria-label="Swap units">swap_horiz</button>
      <label class="field"><span>To</span><select id="t">${options}</select></label>
    </div>
    <button class="primary wide" id="go">Convert</button>
    <div class="result-card" aria-live="polite"><span class="result-label">Converted temperature</span><strong id="out">Enter a temperature and convert.</strong><span class="result-meta" id="meta"></span></div>
  </div>`;
  const q=s=>el.querySelector(s),f=q("#f"),t=q("#t");f.value="C";t.value="F";
  const fmt=n=>n.toLocaleString(undefined,{maximumFractionDigits:8});
  function convert(){const v=Number(q("#v").value);if(!Number.isFinite(v)){q("#out").textContent="Enter a valid number.";return}const c=units[f.value][1](v),r=units[t.value][2](c);q("#out").textContent=`${fmt(r)} ${units[t.value][0]}`;q("#meta").textContent=`${fmt(v)} ${units[f.value][0]} = ${fmt(r)} ${units[t.value][0]}`}
  q("#go").onclick=convert;q("#swap").onclick=()=>{const x=f.value;f.value=t.value;t.value=x;convert()};q("#v").onkeydown=e=>{if(e.key==="Enter")convert()};
}