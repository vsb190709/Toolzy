export function mount(el){
 el.innerHTML=`<div class="tool-form"><label>Percentage <input id="pct" type="number" value="20"></label><label>Number <input id="num" type="number" value="500"></label><button class="primary" id="go">Calculate</button><output id="out"></output></div>`;
 el.querySelector("#go").onclick=()=>el.querySelector("#out").textContent=(Number(el.querySelector("#pct").value)*Number(el.querySelector("#num").value)/100).toLocaleString();
}
