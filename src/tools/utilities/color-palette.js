import {style,qs,copy} from './helpers.js';
function rgbToHex(r,g,b){return '#'+[r,g,b].map(x=>Math.max(0,Math.min(255,Math.round(x))).toString(16).padStart(2,'0')).join('').toUpperCase()}
function hexRgb(hex){const h=hex.replace('#','');const x=h.length===3?h.split('').map(c=>c+c).join(''):h;return [parseInt(x.slice(0,2),16),parseInt(x.slice(2,4),16),parseInt(x.slice(4,6),16)]}
export function mount(root){
 style();
 root.innerHTML='<section class="ut-page"><div class="ut-card"><div class="ut-head"><div class="ut-head-icon">palette</div><div><h2>Color Palette</h2><p>Build a five-step light-to-dark palette from any HEX color.</p></div></div><div class="ut-grid"><label class="ut-field"><span>Base HEX</span><input data-hex value="#6750A4"></label><label class="ut-field"><span>Steps</span><input data-steps type="number" min="3" max="12" value="5"></label></div><div class="ut-actions"><button class="primary" data-go>Generate</button></div><div class="ut-color-row" data-out></div></div></section>';
 function draw(){const [r,g,b]=hexRgb(qs(root,'[data-hex]').value),n=Math.min(12,Math.max(3,Number(qs(root,'[data-steps]').value)||5));const list=[];for(let i=0;i<n;i++){const t=i/(n-1),f=.18+t*.72;list.push(rgbToHex(r+(255-r)*f,g+(255-g)*f,b+(255-b)*f))}qs(root,'[data-out]').innerHTML=list.map(x=>'<button class="ut-color-chip" title="Copy '+x+'" style="background:'+x+'" data-c="'+x+'"></button>').join('');root.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>copy(b.dataset.c))}
 qs(root,'[data-go]').onclick=draw;draw();
}