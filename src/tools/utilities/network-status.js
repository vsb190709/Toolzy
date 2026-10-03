import {style,qs,esc} from './helpers.js';
export function mount(root){
 style();
 root.innerHTML='<section class="ut-page"><div class="ut-card"><div class="ut-head"><div class="ut-head-icon">wifi</div><div><h2>Network Status</h2><p>Monitor online state and connection hints from the browser.</p></div></div><div class="ut-grid" data-out></div><div class="ut-actions"><button class="primary" data-refresh>Refresh</button></div></div></section>';
 function draw(){const c=navigator.connection||navigator.mozConnection||navigator.webkitConnection;const rows=[['Online',navigator.onLine?'Connected':'Offline'],['Connection',c?.effectiveType||'Unknown'],['Downlink',c?.downlink?c.downlink+' Mb/s':'Unavailable'],['RTT',c?.rtt?c.rtt+' ms':'Unavailable'],['Data saver',c?.saveData?'On':'Off']];qs(root,'[data-out]').innerHTML=rows.map(x=>'<div class="ut-stat"><span>'+esc(x[0])+'</span><strong>'+esc(x[1])+'</strong></div>').join('')}
 addEventListener('online',draw);addEventListener('offline',draw);qs(root,'[data-refresh]').onclick=draw;draw();root._cleanup=()=>{removeEventListener('online',draw);removeEventListener('offline',draw)}
}