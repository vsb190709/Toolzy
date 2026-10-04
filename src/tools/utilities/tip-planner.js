import {style,qs} from './helpers.js';
import {icon} from '../../core/icons.js';
export function mount(root){
 style();
 root.innerHTML='<section class="ut-page"><div class="ut-card"><div class="ut-head"><div class="ut-head-icon">${icon("favorite")}</div><div><h2>Tip Planner</h2><p>Compare several tip percentages at a glance.</p></div></div><label class="ut-field"><span>Bill amount</span><input data-bill type="number" min="0" step="0.01" value="1000"></label><div class="ut-grid" data-out></div></div></section>';
 function draw(){const b=Math.max(0,Number(qs(root,'[data-bill]').value)||0);qs(root,'[data-out]').innerHTML=[5,10,15,18,20,25].map(p=>'<div class="ut-stat"><span>'+p+'% tip</span><strong>'+(b*(1+p/100)).toFixed(2)+'</strong></div>').join('')}
 qs(root,'[data-bill]').oninput=draw;draw();
}