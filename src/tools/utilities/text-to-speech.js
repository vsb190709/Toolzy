import {style,qs} from './helpers.js';
export function mount(root){
 style();
 root.innerHTML='<section class="ut-page"><div class="ut-card"><div class="ut-head"><div class="ut-head-icon">volume_up</div><div><h2>Text to Speech</h2><p>Use your browser voice engine to read text aloud.</p></div></div><label class="ut-field"><span>Text</span><textarea data-text>Welcome to Toolzy!</textarea></label><div class="ut-grid"><label class="ut-field"><span>Voice</span><select data-voice></select></label><label class="ut-field"><span>Speed</span><input data-rate type="number" min="0.5" max="2" step="0.1" value="1"></label></div><div class="ut-actions"><button class="primary" data-speak>Speak</button><button data-pause>Pause</button><button data-stop>Stop</button></div><div class="ut-output" data-out></div></div></section>';
 const synth=window.speechSynthesis,voice=qs(root,'[data-voice]');
 function load(){voice.innerHTML=(synth?.getVoices?.()||[]).map((v,i)=>'<option value="'+i+'">'+v.name+' · '+v.lang+'</option>').join('')||'<option>No browser voices available</option>'}
 load();synth?.addEventListener?.('voiceschanged',load);
 qs(root,'[data-speak]').onclick=()=>{if(!synth){qs(root,'[data-out]').textContent='Speech synthesis is not supported.';return}synth.cancel();const u=new SpeechSynthesisUtterance(qs(root,'[data-text]').value),vs=synth.getVoices();u.voice=vs[Number(voice.value)]||null;u.rate=Number(qs(root,'[data-rate]').value)||1;synth.speak(u);qs(root,'[data-out]').textContent='Speaking…'};
 qs(root,'[data-pause]').onclick=()=>synth?.pause();qs(root,'[data-stop]').onclick=()=>{synth?.cancel();qs(root,'[data-out]').textContent='Stopped.'};root._cleanup=()=>synth?.removeEventListener?.('voiceschanged',load)
}