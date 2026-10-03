import {style,qs,shuffle,esc} from './helpers.js';
export function mount(root){
 style();
 root.innerHTML='<section class="ut-page"><div class="ut-card"><div class="ut-head"><div class="ut-head-icon">shuffle</div><div><h2>Shuffle List</h2><p>Randomize a list fairly while keeping every item.</p></div></div><label class="ut-field"><span>Items</span><textarea data-in placeholder="Alice\nBob\nCharlie\nDiana"></textarea></label><div class="ut-actions"><button class="primary" data-go>Shuffle</button><button data-copy>Copy result</button></div><div class="ut-output" data-out>Ready.</div></div></section>';
 const input=qs(root,'[data-in]'),out=qs(root,'[data-out]');let last='';
 qs(root,'[data-go]').onclick=()=>{const a=input.value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);if(!a.length){out.textContent='Add at least one item.';return}last=shuffle(a).join('\n');out.textContent=last};
 qs(root,'[data-copy]').onclick=()=>{navigator.clipboard?.writeText(last)};
}