import {style,qs,randInt} from './helpers.js';
export function mount(root){
 style();
 root.innerHTML='<section class="ut-page"><div class="ut-card ut-center"><div class="ut-head"><div class="ut-head-icon">psychology</div><div><h2>Memory Sequence</h2><p>Watch the sequence, then repeat it from memory.</p></div></div><div class="ut-grid-3" data-grid></div><div class="ut-output" data-out>Press Start.</div><button class="primary" data-start>Start round</button></div></section>';
 const grid=qs(root,'[data-grid]');let seq=[],index=0,accept=false,level=0;
 function make(){grid.innerHTML=Array.from({length:9},(_,i)=>'<button class="ut-choice" data-i="'+i+'">'+(i+1)+'</button>').join('');root.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>click(+b.dataset.i))}
 function wait(ms){return new Promise(r=>setTimeout(r,ms))}
 async function flash(){accept=false;for(const n of seq){const b=qs(root,'[data-i="'+n+'"]');b.classList.add('ut-success');await wait(300);b.classList.remove('ut-success');await wait(110)}accept=true;index=0;qs(root,'[data-out]').textContent='Your turn.'}
 function click(i){if(!accept)return;if(i!==seq[index]){qs(root,'[data-out]').textContent='Miss! Final level: '+level+'.';accept=false;return}index++;if(index===seq.length){accept=false;level++;seq.push(randInt(0,8));qs(root,'[data-out]').textContent='Correct! Level '+level;setTimeout(flash,450)}}
 qs(root,'[data-start]').onclick=()=>{level=1;seq=[randInt(0,8)];qs(root,'[data-out]').textContent='Watch…';flash()};make();
}