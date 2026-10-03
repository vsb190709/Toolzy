import {style,qs,esc} from './helpers.js';
export function mount(root){
 style();
 root.innerHTML='<section class="ut-page"><div class="ut-card"><div class="ut-head"><div class="ut-head-icon">monitor</div><div><h2>Screen Info</h2><p>Inspect orientation, available area and display characteristics.</p></div></div><div class="ut-grid" data-out></div></div></section>';
 function draw(){const s=screen;const rows=[['Screen size',s.width+' × '+s.height],['Available area',s.availWidth+' × '+s.availHeight],['Viewport',innerWidth+' × '+innerHeight],['Pixel ratio',devicePixelRatio+'×'],['Orientation',s.orientation?.type||'Unknown'],['Color depth',s.colorDepth+' bit'],['Refresh rate','Not exposed reliably by standard browser APIs']];qs(root,'[data-out]').innerHTML=rows.map(x=>'<div class="ut-stat"><span>'+esc(x[0])+'</span><strong>'+esc(x[1])+'</strong></div>').join('')}
 draw();addEventListener('resize',draw);root._cleanup=()=>removeEventListener('resize',draw)
}