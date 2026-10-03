import {style,qs,esc,copy} from './helpers.js';
export function mount(root){
 style();
 root.innerHTML='<section class="ut-page"><div class="ut-card"><div class="ut-head"><div class="ut-head-icon">devices</div><div><h2>Device Info</h2><p>See screen, pixel density, touch and viewport details.</p></div></div><div class="ut-list" data-out></div><div class="ut-actions"><button data-copy>Copy details</button></div></div></section>';
 function draw(){const s=screen,v=visualViewport,rows=[['Viewport',innerWidth+' × '+innerHeight],['Screen',s.width+' × '+s.height],['Pixel ratio',devicePixelRatio+'×'],['Touch points',String(navigator.maxTouchPoints||0)],['Orientation',s.orientation?.type||'unknown'],['Color depth',String(s.colorDepth)+' bit'],['Viewport scale',v?String(v.scale):'1']];qs(root,'[data-out]').innerHTML=rows.map(x=>'<div class="ut-row"><span>'+esc(x[0])+'</span><strong>'+esc(x[1])+'</strong></div>').join('');root._deviceText=rows.map(x=>x[0]+': '+x[1]).join('\\n')}
 draw();addEventListener('resize',draw);root._cleanup=()=>removeEventListener('resize',draw);qs(root,'[data-copy]').onclick=()=>copy(root._deviceText)
}