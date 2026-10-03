import {style,qs} from './helpers.js';
function gcd(a,b){while(b){[a,b]=[b,a%b]}return Math.abs(a)}
export function mount(root){
 style();
 root.innerHTML='<section class="ut-page"><div class="ut-card"><div class="ut-head"><div class="ut-head-icon">aspect_ratio</div><div><h2>Aspect Ratio Helper</h2><p>Reduce dimensions and calculate a matching size.</p></div></div><div class="ut-grid"><label class="ut-field"><span>Width</span><input data-w type="number" min="1" value="1920"></label><label class="ut-field"><span>Height</span><input data-h type="number" min="1" value="1080"></label><label class="ut-field"><span>New width (optional)</span><input data-nw type="number" min="1" value="1280"></label></div><div class="ut-actions"><button class="primary" data-go>Calculate</button></div><div class="ut-grid" data-out></div></div></section>';
 qs(root,'[data-go]').onclick=()=>{const w=Number(qs(root,'[data-w]').value),h=Number(qs(root,'[data-h]').value),nw=Number(qs(root,'[data-nw]').value);if(!(w>0&&h>0&&nw>0)){qs(root,'[data-out]').textContent='Enter positive dimensions.';return}const g=gcd(Math.round(w),Math.round(h));qs(root,'[data-out]').innerHTML='<div class="ut-stat"><span>Reduced ratio</span><strong>'+w/g+':'+h/g+'</strong></div><div class="ut-stat"><span>Matching height</span><strong>'+(nw*h/w).toFixed(2)+'</strong></div>'};
 qs(root,'[data-go]').click()
}