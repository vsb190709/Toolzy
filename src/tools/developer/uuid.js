export function mount(el){
 el.innerHTML=`<div class="tool-form"><label>Count <input id="n" type="number" min="1" max="100" value="5"></label><button class="primary" id="go">Generate</button><textarea id="out" readonly></textarea></div>`;
 el.querySelector("#go").onclick=()=>{const n=Math.min(100,Math.max(1,Number(el.querySelector("#n").value)||1));el.querySelector("#out").value=Array.from({length:n},()=>crypto.randomUUID()).join("\n")};
}
