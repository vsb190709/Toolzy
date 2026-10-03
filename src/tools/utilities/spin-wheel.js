import {style,qs,shuffle,esc} from './helpers.js';
export function mount(root){
 style();
 root.innerHTML='<section class="ut-page"><div class="ut-card ut-center"><div class="ut-head"><div class="ut-head-icon">casino</div><div><h2>Spin the Wheel</h2><p>Paste choices and let Toolzy pick one with a dramatic spin.</p></div></div><label class="ut-field" style="width:100%;text-align:left"><span>Choices</span><textarea data-in placeholder="Pizza\nBurger\nPasta\nTacos"></textarea></label><div style="position:relative;padding-top:10px"><span class="ut-pointer"></span><div class="ut-wheel" data-wheel></div></div><div class="ut-actions"><button class="primary" data-spin>Spin!</button><button data-copy>Copy winner</button></div><div class="ut-output" data-out>Ready.</div></div></section>';
 const wheel=qs(root,'[data-wheel]'),out=qs(root,'[data-out]');let winner='';
 function rebuild(){
   const a=qs(root,'[data-in]').value.split(/\\r?\\n/).map(x=>x.trim()).filter(Boolean).slice(0,24);if(!a.length){wheel.style.background='var(--surface-2)';return}
   const step=360/a.length,stops=a.map((_,i)=>'hsl('+(i*360/a.length)+' 70% 68%) '+(i*step)+'deg '+((i+1)*step)+'deg').join(',');
   wheel.style.background='conic-gradient('+stops+')';
 }
 qs(root,'[data-in]').oninput=rebuild;
 qs(root,'[data-spin]').onclick=()=>{const a=qs(root,'[data-in]').value.split(/\\r?\\n/).map(x=>x.trim()).filter(Boolean).slice(0,24);if(!a.length){out.textContent='Add at least two choices.';return}winner=shuffle(a)[0];const angle=1080+Math.floor(Math.random()*360);wheel.animate([{transform:'rotate(0deg)'},{transform:'rotate('+angle+'deg)'}],{duration:1800,easing:'cubic-bezier(.16,.75,.25,1)'}).onfinish=()=>{out.innerHTML='<strong>Winner: '+esc(winner)+'</strong>'}};
 qs(root,'[data-copy]').onclick=()=>navigator.clipboard?.writeText(winner);rebuild();
}