import {style,qs,esc,copy} from './helpers.js';
export function mount(root){
 style();
 root.innerHTML='<section class="ut-page"><div class="ut-card"><div class="ut-head"><div class="ut-head-icon">language</div><div><h2>Browser Info</h2><p>Inspect browser-provided information from your current session.</p></div></div><div class="ut-list" data-out></div><div class="ut-actions"><button data-copy>Copy details</button></div></div></section>';
 const nav=navigator,rows=[['User agent',nav.userAgent],['Language',nav.language],['Online',nav.onLine?'Yes':'No'],['Cookies enabled',nav.cookieEnabled?'Yes':'No'],['Platform',nav.platform||'Unavailable'],['Logical cores',String(nav.hardwareConcurrency||'Unavailable')],['Timezone',Intl.DateTimeFormat().resolvedOptions().timeZone]];
 qs(root,'[data-out]').innerHTML=rows.map(x=>'<div class="ut-row"><span>'+esc(x[0])+'</span><strong>'+esc(x[1])+'</strong></div>').join('');
 qs(root,'[data-copy]').onclick=()=>copy(rows.map(x=>x[0]+': '+x[1]).join('\\n'));
}