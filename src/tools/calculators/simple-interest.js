export function mount(el) {
  el.innerHTML = `
    <div class="tool-form">
      <label>Principal <input id="p" type="number" value="10000"></label>
      <label>Rate (% per year) <input id="r" type="number" value="5"></label>
      <label>Time (years) <input id="t" type="number" value="2"></label>
      <button class="primary" id="go">Calculate</button>
      <output id="out"></output>
    </div>`;
  const q = s => el.querySelector(s);
  q("#go").onclick = () => {
    const p=+q("#p").value, r=+q("#r").value, t=+q("#t").value;
    const interest=p*r*t/100;
    q("#out").textContent=`Interest: ${interest.toFixed(2)} · Total: ${(p+interest).toFixed(2)}`;
  };
}
