import {style,qs,copy} from './helpers.js';
const hex=n=>n.toString(16).padStart(2,'0').toUpperCase();
export function mount(root){
 style();
 root.innerHTML='<section class="ut-page"><div class="ut-card"><div class="ut-head"><div class="ut-head-icon">palette</div><div><h2>Random Color</h2><p>Generate a color, preview contrast, and copy its CSS value.</p></div></div><div class="ut-swatch" data-swatch>#6750A4</div><div class="ut-actions"><button class="primary" data-go>New color</button><button class="secondary" data-copy>Copy HEX</button></div><div class="ut-grid" data-meta></div></div></section>';
 let value='#6750A4';
 function draw(){const s=qs(root,'[data-swatch]');s.style.background=value;const rgb=value.match(/[A-F\\d]{2}/gi).map(x=>parseInt(x,16));const y=(.2126*(rgb[0]/255)+.7152*(rgb[1]/255)+.0722*(rgb[2]/255));s.style.color=y>.55?'#17151A':'#FFFFFF';s.textContent=value;qs(root,'[data-meta]').innerHTML='<div class="ut-stat"><span>RGB</span><strong>'+rgb.join(', ')+'</strong></div><div class="ut-stat"><span>CSS</span><strong>'+value+'</strong></div>'}
 qs(root,'[data-go]').onclick=()=>{const a=new Uint8Array(3);crypto.getRandomValues(a);value='#'+hex(a[0])+hex(a[1])+hex(a[2]);draw()};qs(root,'[data-copy]').onclick=()=>copy(value);draw();
}