import {style,qs,esc} from './helpers.js';
export function mount(root){
 style();
 root.innerHTML='<section class="ut-page"><div class="ut-card"><div class="ut-head"><div class="ut-head-icon">keyboard</div><div><h2>Keyboard Tester</h2><p>Press keys to see their names, code and recent sequence.</p></div></div><div class="ut-big" data-main>Press a key</div><div class="ut-grid" data-out></div><div class="ut-output" data-log>Waiting…</div></div></section>';
 const down=new Set(),log=[];
 function onKey(e){e.preventDefault();down.add(e.code);log.unshift(e.key+' · '+e.code);log.splice(10);qs(root,'[data-main]').textContent=e.key||e.code;qs(root,'[data-out]').innerHTML='<div class="ut-stat"><span>Code</span><strong>'+esc(e.code)+'</strong></div><div class="ut-stat"><span>Location</span><strong>'+e.location+'</strong></div><div class="ut-stat"><span>Modifiers</span><strong>'+['Ctrl:'+e.ctrlKey,'Alt:'+e.altKey,'Shift:'+e.shiftKey,'Meta:'+e.metaKey].join(' ')+'</strong></div>';qs(root,'[data-log]').textContent=log.join('\\n')}
 function up(e){down.delete(e.code)}
 addEventListener('keydown',onKey);addEventListener('keyup',up);root._cleanup=()=>{removeEventListener('keydown',onKey);removeEventListener('keyup',up)}
}