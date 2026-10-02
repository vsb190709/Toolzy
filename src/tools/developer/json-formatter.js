export function mount(el){
 el.innerHTML=`<div class="tool-form"><textarea id="input" placeholder='{"hello":"world"}'></textarea><div class="actions"><button class="primary" id="format">Format</button><button id="minify">Minify</button></div><output id="out"></output></div>`;
 const input=el.querySelector("#input"),out=el.querySelector("#out");
 const run=(space)=>{try{out.textContent=JSON.stringify(JSON.parse(input.value),null,space)}catch(e){out.textContent="Invalid JSON: "+e.message}};
 el.querySelector("#format").onclick=()=>run(2);el.querySelector("#minify").onclick=()=>run(0);
}
