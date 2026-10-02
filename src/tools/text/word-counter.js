export function mount(el){
 el.innerHTML=`<div class="tool-form"><textarea id="text" placeholder="Type or paste text…"></textarea><div class="stats" id="out"></div></div>`;
 const text=el.querySelector("#text"),out=el.querySelector("#out");
 function update(){const s=text.value;const words=s.trim()?s.trim().split(/\s+/).length:0;out.textContent=`Words: ${words}  •  Characters: ${s.length}  •  Lines: ${s?s.split(/\n/).length:0}`;}
 text.oninput=update;update();
}
