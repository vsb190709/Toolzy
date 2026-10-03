import {style,qs} from './helpers.js';
const labels=[['Needs',50],['Wants',30],['Savings',20]];
export function mount(root){
 style();
 root.innerHTML='<section class="ut-page"><div class="ut-card"><div class="ut-head"><div class="ut-head-icon">account_balance_wallet</div><div><h2>Budget Split</h2><p>Split a monthly budget into simple spending buckets.</p></div></div><label class="ut-field"><span>Monthly budget</span><input data-total type="number" min="0" value="50000"></label><div class="ut-grid" data-out></div></div></section>';
 function draw(){const t=Math.max(0,Number(qs(root,'[data-total]').value)||0);qs(root,'[data-out]').innerHTML=labels.map(x=>'<div class="ut-stat"><span>'+x[0]+' · '+x[1]+'%</span><strong>'+(t*x[1]/100).toFixed(2)+'</strong></div>').join('')}
 qs(root,'[data-total]').oninput=draw;draw();
}