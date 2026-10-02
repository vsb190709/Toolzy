const currencies = [
  ["USD","United States Dollar"],["EUR","Euro"],["GBP","British Pound Sterling"],["INR","Indian Rupee"],
  ["JPY","Japanese Yen"],["AUD","Australian Dollar"],["CAD","Canadian Dollar"],["CHF","Swiss Franc"],
  ["CNY","Chinese Yuan Renminbi"],["SGD","Singapore Dollar"],["AED","United Arab Emirates Dirham"],
  ["HKD","Hong Kong Dollar"],["NZD","New Zealand Dollar"],["SEK","Swedish Krona"],["NOK","Norwegian Krone"],
  ["DKK","Danish Krone"],["ZAR","South African Rand"],["BRL","Brazilian Real"],["MXN","Mexican Peso"],
  ["KRW","South Korean Won"],["THB","Thai Baht"],["PLN","Polish Zloty"],["TRY","Turkish Lira"],
  ["SAR","Saudi Riyal"],["ILS","Israeli New Shekel"],["CZK","Czech Koruna"],["HUF","Hungarian Forint"]
];
const nameOf=code=>currencies.find(x=>x[0]===code)?.[1]||code;
const options=()=>currencies.map(([code,name])=>`<option value="${code}">${name}</option>`).join("");

export function mount(el){
  el.innerHTML=`
    <div class="tool-form currency-tool">
      <div class="form-grid one">
        <label class="field"><span>Amount</span><input id="amount" type="number" value="100" min="0" step="any" inputmode="decimal"></label>
      </div>
      <div class="currency-pair">
        <label class="field"><span>From</span><select id="from">${options()}</select></label>
        <button class="swap-button" id="swap" aria-label="Swap currencies">swap_horiz</button>
        <label class="field"><span>To</span><select id="to">${options()}</select></label>
      </div>
      <button class="primary wide" id="convert">Convert currency</button>
      <div class="result-card" id="result-card" aria-live="polite">
        <span class="result-label">Converted amount</span>
        <strong id="out">Enter an amount and convert.</strong>
        <span class="result-meta" id="rate"></span>
      </div>
      <p class="tool-note" id="status">Current reference rates are fetched from Frankfurter when you convert.</p>
    </div>`;
  const q=s=>el.querySelector(s);
  q("#from").value="USD"; q("#to").value="INR";
  const getRate=async(a,b)=>{
    const r=await fetch(`https://api.frankfurter.dev/v2/rate/${encodeURIComponent(a)}/${encodeURIComponent(b)}`);
    if(!r.ok) throw Error("Rate service unavailable");
    return await r.json();
  };
  const convert=async()=>{
    const amount=Number(q("#amount").value),from=q("#from").value,to=q("#to").value;
    if(!Number.isFinite(amount)){q("#out").textContent="Enter a valid amount.";return}
    if(from===to){q("#out").textContent=`${amount.toLocaleString()} ${nameOf(to)}`;q("#rate").textContent=`1 ${nameOf(from)} = 1 ${nameOf(to)}`;return}
    q("#out").textContent="Fetching current rate…";q("#rate").textContent="";
    try{
      const data=await getRate(from,to), result=amount*data.rate;
      q("#out").textContent=`${result.toLocaleString(undefined,{maximumFractionDigits:6})} ${nameOf(to)}`;
      q("#rate").textContent=`1 ${nameOf(from)} = ${Number(data.rate).toLocaleString(undefined,{maximumFractionDigits:6})} ${nameOf(to)} · ${data.date||"latest reference rate"}`;
      q("#status").textContent="Reference rates by Frankfurter. Internet connection required for fresh rates.";
    }catch(e){
      q("#out").textContent="Couldn’t load the current exchange rate.";
      q("#rate").textContent="Check your connection and try again.";
    }
  };
  q("#convert").onclick=convert;
  q("#swap").onclick=()=>{const a=q("#from").value;q("#from").value=q("#to").value;q("#to").value=a;convert()};
}