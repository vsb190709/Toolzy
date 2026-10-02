const units={
  deg:["Degree",Math.PI/180],
  rad:["Radian",1],
  grad:["Gradian",Math.PI/200],
  turn:["Turn",2*Math.PI]
};
const options=Object.entries(units).map(([k,[name]])=>`<option value="${k}">${name} (${k})</option>`).join("");
export function mount(el){
  el.innerHTML=`<div class="tool-form converter-modern">
    <label class="field"><span>Angle</span><input id="v" type="number" value="90" step="any"></label>
    <div class="converter-pair"><label class="field"><span>From</span><select id="f">${options}</select></label><button class="swap-button" id="swap" aria-label="Swap units">swap_horiz</button><label class="field"><span>To</span><select id="t">${options}</select></label></div>
    <button class="primary wide" id="go">Convert angle</button>
    <div class="result-card" aria-live="polite"><span class="result-label">Converted angle</span><strong id="out">Enter an angle and convert.</strong><span class="result-meta" id="meta"></span></div>
  </div>`;
  const q=s=>el.querySelector(s),f=q("#f"),t=q("#t");f.value="deg";t.value="rad";
  const fmt=n=>n.toLocaleString(undefined,{maximumFractionDigits:10});
  function run(){const v=Number(q("#v").value);if(!Number.isFinite(v)){q("#out").textContent="Enter a valid angle.";return}const r=v*units[f.value][1]/units[t.value][1];q("#out").textContent=`${fmt(r)} ${units[t.value][0]}`;q("#meta").textContent=`${fmt(v)} ${units[f.value][0]} = ${fmt(r)} ${units[t.value][0]}`}
  q("#go").onclick=run;q("#swap").onclick=()=>{const x=f.value;f.value=t.value;t.value=x;run()};
}