const units=[
  ["J","Joule",1],["kJ","Kilojoule",1000],["Wh","Watt-hour",3600],
  ["kWh","Kilowatt-hour",3600000],["cal","Calorie",4.184],["kcal","Kilocalorie",4184]
];
const optionHtml=()=>units.map(([code,name])=>`<option value="${code}">${name}</option>`).join("");
export function mount(el){
  el.innerHTML=`
    <div class="tool-form converter-modern">
      <div class="form-grid one">
        <label class="field"><span>Amount</span><input id="v" type="number" value="1" step="any" inputmode="decimal"></label>
      </div>
      <div class="converter-pair">
        <label class="field"><span>From</span><select id="f">${optionHtml()}</select></label>
        <button class="swap-button" id="swap" aria-label="Swap units">swap_horiz</button>
        <label class="field"><span>To</span><select id="t">${optionHtml()}</select></label>
      </div>
      <button class="primary wide" id="go">Convert</button>
      <div class="result-card" aria-live="polite">
        <span class="result-label">Converted amount</span>
        <strong id="out">Enter an amount and convert.</strong>
        <span class="result-meta" id="meta">1 Joule = 1 Joule</span>
      </div>
    </div>`;
  const q=s=>el.querySelector(s);
  q("#t").value="kJ";
  function convert(){
    const v=Number(q("#v").value), from=units.find(x=>x[0]===q("#f").value), to=units.find(x=>x[0]===q("#t").value);
    if(!Number.isFinite(v)){q("#out").textContent="Enter a valid number.";return}
    const result=v*from[2]/to[2];
    q("#out").textContent=`${result.toLocaleString(undefined,{maximumFractionDigits:10})} ${to[1]}`;
    q("#meta").textContent=`${v.toLocaleString()} ${from[1]} = ${result.toLocaleString(undefined,{maximumFractionDigits:10})} ${to[1]}`;
  }
  q("#go").onclick=convert;
  q("#swap").onclick=()=>{const a=q("#f").value;q("#f").value=q("#t").value;q("#t").value=a;convert()};
}