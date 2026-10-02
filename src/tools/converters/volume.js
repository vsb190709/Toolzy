const units={ "L":["Liter",1],"mL":["Milliliter",0.001],"m³":["Cubic meter",1000],"cm³":["Cubic centimeter",0.001],"US gal":["US gallon",3.785411784],"US qt":["US quart",0.946352946],"US pt":["US pint",0.473176473],"US cup":["US cup",0.2365882365] };
export function mount(el){
  el.innerHTML=`<div class="tool-form converter-modern">
    <div class="form-grid one">
      <label class="field"><span>Value</span><input id="v" type="number" value="1" step="any" inputmode="decimal"></label>
    </div>
    <div class="converter-pair">
      <label class="field"><span>From</span><select id="f"><option value="L">Liter (L)</option><option value="mL">Milliliter (mL)</option><option value="m³">Cubic meter (m³)</option><option value="cm³">Cubic centimeter (cm³)</option><option value="US gal">US gallon (US gal)</option><option value="US qt">US quart (US qt)</option><option value="US pt">US pint (US pt)</option><option value="US cup">US cup (US cup)</option></select></label>
      <button class="swap-button" id="swap" aria-label="Swap units">swap_horiz</button>
      <label class="field"><span>To</span><select id="t"><option value="L">Liter (L)</option><option value="mL">Milliliter (mL)</option><option value="m³">Cubic meter (m³)</option><option value="cm³">Cubic centimeter (cm³)</option><option value="US gal">US gallon (US gal)</option><option value="US qt">US quart (US qt)</option><option value="US pt">US pint (US pt)</option><option value="US cup">US cup (US cup)</option></select></label>
    </div>
    <button class="primary wide" id="go">Convert</button>
    <div class="result-card" aria-live="polite">
      <span class="result-label">Converted value</span>
      <strong id="out">Enter a value and convert.</strong>
      <span class="result-meta" id="meta">Choose the units you want to compare.</span>
    </div>
  </div>`;
  const q=s=>el.querySelector(s);
  const from=q("#f"),to=q("#t");
  to.selectedIndex=1;
  const fmt=n=>n.toLocaleString(undefined,{maximumFractionDigits:10});
  function convert(){
    const v=Number(q("#v").value);
    if(!Number.isFinite(v)){q("#out").textContent="Enter a valid number.";q("#meta").textContent="";return}
    const a=units[from.value],b=units[to.value],result=v*a[1]/b[1];
    q("#out").textContent=`${fmt(result)} ${b[0]}`;
    q("#meta").textContent=`${fmt(v)} ${a[0]} = ${fmt(result)} ${b[0]}`;
  }
  q("#go").onclick=convert;
  q("#swap").onclick=()=>{const a=from.value;from.value=to.value;to.value=a;convert()};
  q("#v").addEventListener("keydown",e=>{if(e.key==="Enter")convert()});
}