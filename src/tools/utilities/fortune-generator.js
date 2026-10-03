import {style,qs,esc,shuffle} from './helpers.js';
const fortunes=['Absolutely.','Not today.','Ask again soon.','You already know the answer.','Give it a shot.','Probably!','Take the bold route.','Wait for a clearer sign.','Yes, with patience.','Try a different angle.','The odds look friendly.','Trust the process.'];
export function mount(root){
 style();
 root.innerHTML='<section class="ut-page"><div class="ut-card ut-center"><div class="ut-head"><div class="ut-head-icon">auto_awesome</div><div><h2>Fortune Generator</h2><p>Ask a question, then reveal a playful random answer.</p></div></div><label class="ut-field" style="width:100%;text-align:left"><span>Your question</span><input data-q placeholder="Should I start that project?"></label><div class="ut-game"><div class="ut-big" data-out>?</div><button class="primary" data-go>Reveal fortune</button></div></div></section>';
 qs(root,'[data-go]').onclick=()=>{const q=qs(root,'[data-q]').value.trim();qs(root,'[data-out]').textContent=shuffle(fortunes)[0];if(q)qs(root,'[data-go]').textContent='Ask again'};
}