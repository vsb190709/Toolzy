import {style,qs,copy} from './helpers.js';
const rand=()=>Math.floor(Math.random()*360);
export function mount(root){
 style();
 root.innerHTML='<section class="ut-page"><div class="ut-card"><div class="ut-head"><div class="ut-head-icon">gradient</div><div><h2>Gradient Generator</h2><p>Make a CSS linear gradient and copy the ready-to-use value.</p></div></div><div class="ut-grid"><label class="ut-field"><span>Color 1</span><input data-a type="color" value="#6750A4"></label><label class="ut-field"><span>Color 2</span><input data-b type="color" value="#D0BCFF"></label><label class="ut-field"><span>Angle</span><input data-angle type="number" min="0" max="360" value="135"></label></div><div class="ut-swatch" data-preview></div><div class="ut-actions"><button class="primary" data-random>Randomize</button><button data-copy>Copy CSS</button></div><div class="ut-output" data-out></div></div></section>';
 let css='';
 function draw(){css='linear-gradient('+Number(qs(root,'[data-angle]').value||135)+'deg, '+qs(root,'[data-a]').value+', '+qs(root,'[data-b]').value+')';qs(root,'[data-preview]').style.background=css;qs(root,'[data-out]').textContent=css}
 qs(root,'[data-random]').onclick=()=>{qs(root,'[data-angle]').value=rand();qs(root,'[data-a]').value='#'+Math.floor(Math.random()*16777215).toString(16).padStart(6,'0');qs(root,'[data-b]').value='#'+Math.floor(Math.random()*16777215).toString(16).padStart(6,'0');draw()};root.querySelectorAll('input').forEach(x=>x.oninput=draw);qs(root,'[data-copy]').onclick=()=>copy(css);draw();
}