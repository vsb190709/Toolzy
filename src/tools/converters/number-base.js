const bases={2:"Binary",8:"Octal",10:"Decimal",16:"Hexadecimal"};
export function mount(el){
  el.innerHTML=`<div class="tool-form">
    <label class="field"><span>Number</span><input id="v" value="255" spellcheck="false" autocomplete="off"></label>
    <div class="converter-pair">
      <label class="field"><span>From base</span><select id="f">${Object.entries(bases).map(([k,n])=>`<option value="${k}">${n} (base ${k})</option>`).join("")}</select></label>
      <button class="swap-button" id="swap" aria-label="Swap bases">swap_horiz</button>
      <label class="field"><span>To base</span><select id="t">${Object.entries(bases).map(([k,n])=>`<option value="${k}">${n} (base ${k})</option>`).join("")}</select></label>
    </div>
    <button class="primary wide" id="go">Convert number</button>
    <div class="result-card" aria-live="polite"><span class="result-label">Converted number</span><strong id="out">Enter a number and convert.</strong><span class="result-meta" id="meta"></span></div>
  </div>`;
  const q=s=>el.querySelector(s),f=q("#f"),t=q("#t");f.value="10";t.value="16";
  function run(){const raw=q("#v").value.trim();const n=parseInt(raw,Number(f.value));if(!raw||Number.isNaN(n)){q("#out").textContent="Invalid number for the selected base.";q("#meta").textContent="";return}const result=n.toString(Number(t.value)).toUpperCase();q("#out").textContent=result;q("#meta").textContent=`${bases[f.value]} → ${bases[t.value]}`;}
  q("#go").onclick=run;q("#swap").onclick=()=>{const x=f.value;f.value=t.value;t.value=x;run()};
}