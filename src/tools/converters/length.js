const units={ "m":["Meter",1],"km":["Kilometer",1000],"cm":["Centimeter",0.01],"mm":["Millimeter",0.001],"mi":["Mile",1609.344],"yd":["Yard",0.9144],"ft":["Foot",0.3048],"in":["Inch",0.0254] };
export function mount(el){
  el.innerHTML=`<div class="tool-form converter-modern">
    <div class="form-grid one">
      <label class="field"><span>Value</span><input id="v" type="number" value="1" step="any" inputmode="decimal"></label>
    </div>
    <div class="converter-pair">
      <label class="field"><span>From</span><select id="f"><option value="m">Meter (m)</option><option value="km">Kilometer (km)</option><option value="cm">Centimeter (cm)</option><option value="mm">Millimeter (mm)</option><option value="mi">Mile (mi)</option><option value="yd">Yard (yd)</option><option value="ft">Foot (ft)</option><option value="in">Inch (in)</option></select></label>
      <button class="swap-button" id="swap" aria-label="Swap units">swap_horiz</button>
      <label class="field"><span>To</span><select id="t"><option value="m">Meter (m)</option><option value="km">Kilometer (km)</option><option value="cm">Centimeter (cm)</option><option value="mm">Millimeter (mm)</option><option value="mi">Mile (mi)</option><option value="yd">Yard (yd)</option><option value="ft">Foot (ft)</option><option value="in">Inch (in)</option></select></label>
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