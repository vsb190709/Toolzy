import {style,qs} from './helpers.js';
export function mount(root){
 style();
 root.innerHTML='<section class="ut-page"><div class="ut-card ut-center"><div class="ut-head"><div class="ut-head-icon">fullscreen</div><div><h2>Fullscreen Tester</h2><p>Enter and exit fullscreen to test browser support.</p></div></div><div class="ut-big" data-state>Windowed</div><div class="ut-actions"><button class="primary" data-enter>Enter fullscreen</button><button data-exit>Exit</button></div><div class="ut-output" data-out></div></div></section>';
 function draw(){qs(root,'[data-state]').textContent=document.fullscreenElement?'Fullscreen':'Windowed';qs(root,'[data-out]').textContent=document.fullscreenEnabled?'Fullscreen API available.':'Fullscreen API unavailable.'}
 qs(root,'[data-enter]').onclick=()=>root.querySelector('.ut-card').requestFullscreen?.();qs(root,'[data-exit]').onclick=()=>document.exitFullscreen?.();document.addEventListener('fullscreenchange',draw);draw();root._cleanup=()=>document.removeEventListener('fullscreenchange',draw);
}