import {style,qs} from './helpers.js';
export function mount(root){
 style();
 root.innerHTML='<section class="ut-page"><div class="ut-card ut-center"><div class="ut-head"><div class="ut-head-icon">toll</div><div><h2>Coin Flip</h2><p>Flip one coin or run a batch of flips.</p></div></div><div class="ut-big" data-out>Heads</div><div class="ut-actions"><button class="primary" data-one>Flip</button><label class="ut-field" style="width:150px;text-align:left"><span>Batch</span><input data-n type="number" min="1" max="1000" value="1"></label><button data-batch>Run batch</button></div><div class="ut-output" data-stats>Ready.</div></div></section>';
 qs(root,'[data-one]').onclick=()=>{qs(root,'[data-out]').textContent=Math.random()<.5?'Heads':'Tails'};
 qs(root,'[data-batch]').onclick=()=>{const n=Math.min(1000,Math.max(1,Math.floor(Number(qs(root,'[data-n]').value)||1)));let h=0;for(let i=0;i<n;i++)if(Math.random()<.5)h++;qs(root,'[data-stats]').textContent='Heads: '+h+'\\nTails: '+(n-h)+'\\nHeads rate: '+(h/n*100).toFixed(1)+'%'};
}