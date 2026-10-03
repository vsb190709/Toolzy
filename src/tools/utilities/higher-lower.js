import {style,qs,randInt} from './helpers.js';
export function mount(root){
 style();
 root.innerHTML='<section class="ut-page"><div class="ut-card ut-center"><div class="ut-head"><div class="ut-head-icon">swap_vert</div><div><h2>Higher or Lower</h2><p>Guess whether the next number will be higher or lower.</p></div></div><div class="ut-game"><div class="ut-pill">Streak <span data-streak>0</span></div><div class="ut-big" data-num>50</div><div class="ut-choice-grid"><button class="ut-choice" data-higher>Higher ↑</button><button class="ut-choice" data-lower>Lower ↓</button></div><div class="ut-output" data-out>Choose a side.</div></div></div></section>';
 let current=50,streak=0;
 function guess(side){const next=randInt(1,100),correct=side==='higher'?next>current:next<current;if(next===current){qs(root,'[data-out]').textContent='Same number! It does not count — try again.';return}streak=correct?streak+1:0;current=next;qs(root,'[data-num]').textContent=next;qs(root,'[data-streak]').textContent=streak;qs(root,'[data-out]').textContent=correct?'Correct! Keep going.':'Wrong guess — streak reset.'}
 qs(root,'[data-higher]').onclick=()=>guess('higher');qs(root,'[data-lower]').onclick=()=>guess('lower')
}