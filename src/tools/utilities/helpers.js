const CSS=[
'.ut-page{display:grid;gap:16px}',
'.ut-card{background:var(--surface-1);border:1px solid var(--outline-variant);border-radius:24px;padding:22px;box-shadow:var(--shadow-1)}',
'.ut-head{display:flex;align-items:center;gap:14px;margin-bottom:4px}',
'.ut-head-icon{width:48px;height:48px;border-radius:16px;background:var(--primary-container);color:var(--on-primary-container);display:grid;place-items:center;flex:none}',
'.ut-head h2{margin:0;font-size:22px}',
'.ut-head p{margin:3px 0 0;font-size:13px}',
'.ut-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}',
'.ut-grid-3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}',
'.ut-field{display:grid;gap:7px}',
'.ut-field>span{font-size:12px;font-weight:800;color:var(--on-surface-variant);letter-spacing:.02em}',
'.ut-field input,.ut-field select,.ut-field textarea{width:100%;min-height:50px;border:1px solid var(--outline);border-radius:14px;background:var(--surface);color:var(--on-surface);padding:12px 14px}',
'.ut-field textarea{min-height:170px;resize:vertical}',
'.ut-field input:focus,.ut-field select:focus,.ut-field textarea:focus{border-color:var(--primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 13%,transparent);outline:none}',
'.ut-actions{display:flex;flex-wrap:wrap;gap:9px;align-items:center}',
'.ut-output{min-height:58px;padding:15px 17px;border:1px solid var(--outline-variant);border-radius:18px;background:var(--surface-2);white-space:pre-wrap;overflow-wrap:anywhere}',
'.ut-big{font-size:clamp(34px,7vw,68px);font-weight:800;letter-spacing:-.04em;line-height:1;text-align:center}',
'.ut-center{display:grid;place-items:center;text-align:center}',
'.ut-stat{padding:15px;border:1px solid var(--outline-variant);border-radius:18px;background:var(--surface-2)}',
'.ut-stat strong{display:block;font-size:24px}',
'.ut-stat span{font-size:12px;color:var(--on-surface-variant)}',
'.ut-list{display:grid;gap:8px;max-height:360px;overflow:auto;padding-right:2px}',
'.ut-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 13px;border:1px solid var(--outline-variant);border-radius:14px;background:var(--surface)}',
'.ut-pill{display:inline-flex;align-items:center;gap:6px;padding:7px 11px;border-radius:999px;background:var(--primary-container);color:var(--on-primary-container);font-size:12px;font-weight:750}',
'.ut-divider{height:1px;background:var(--outline-variant);margin:2px 0}',
'.ut-note{margin:0;color:var(--on-surface-variant);font-size:13px;line-height:1.5}',
'.ut-success{background:var(--success-container)!important;color:var(--on-surface)!important}',
'.ut-error{background:var(--error-container)!important;color:var(--on-error-container)!important}',
'.ut-game{min-height:360px;display:grid;place-items:center;gap:18px}',
'.ut-choice-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;width:100%}',
'.ut-choice{min-height:74px;border:1px solid var(--outline-variant)!important;border-radius:20px!important;background:var(--surface)!important;font-weight:800!important;font-size:18px}',
'.ut-choice:hover{background:var(--primary-container)!important;color:var(--on-primary-container)!important}',
'.ut-swatch{border-radius:18px;min-height:110px;border:1px solid var(--outline-variant);display:flex;align-items:flex-end;padding:14px;font:800 15px ui-monospace,SFMono-Regular,Consolas,monospace}',
'.ut-calendar{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:5px}',
'.ut-calendar .day{aspect-ratio:1;display:grid;place-items:center;border-radius:12px;background:var(--surface-2);font-size:13px}',
'.ut-calendar .head{background:transparent;font-weight:800;color:var(--on-surface-variant)}',
'.ut-wheel{width:min(360px,80vw);aspect-ratio:1;border-radius:50%;border:10px solid var(--surface-1);box-shadow:0 6px 24px rgba(0,0,0,.16);position:relative;display:grid;place-items:center;overflow:hidden}',
'.ut-wheel:after{content:"";position:absolute;inset:44%;border-radius:50%;background:var(--surface);border:4px solid var(--primary);z-index:2}',
'.ut-pointer{width:0;height:0;border-left:14px solid transparent;border-right:14px solid transparent;border-bottom:26px solid var(--primary);position:absolute;top:-8px;left:50%;transform:translateX(-50%);z-index:4}',
'.ut-keygrid{display:grid;grid-template-columns:repeat(12,minmax(22px,1fr));gap:7px}',
'.ut-key{min-height:40px;padding:0!important;border-radius:10px!important;background:var(--surface)!important}',
'.ut-key.pressed{background:var(--primary-container)!important;color:var(--on-primary-container)!important;transform:translateY(1px)}',
'.ut-color-row{display:flex;flex-wrap:wrap;gap:8px}',
'.ut-color-chip{width:56px;height:56px;border-radius:16px;border:1px solid var(--outline-variant)}',
'.ut-bars{display:grid;gap:8px}',
'.ut-bar{height:12px;border-radius:999px;background:var(--surface-3);overflow:hidden}',
'.ut-bar>span{display:block;height:100%;border-radius:inherit;background:var(--primary);width:0}',
'@media(max-width:760px){.ut-grid,.ut-grid-3{grid-template-columns:1fr}.ut-card{padding:18px}.ut-choice-grid{grid-template-columns:1fr}.ut-calendar .day{border-radius:9px}.ut-keygrid{grid-template-columns:repeat(6,minmax(24px,1fr))}}'
].join('');
export function style(){
  if(document.getElementById('toolzy-utilities-ui'))return;
  const s=document.createElement('style');s.id='toolzy-utilities-ui';s.textContent=CSS;document.head.appendChild(s);
}
export function qs(root,sel){return root.querySelector(sel)}
export function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
export async function copy(text){
  try{await navigator.clipboard.writeText(String(text));return true}catch{return false}
}
export function randInt(min,max){
  const n=max-min+1;
  if(crypto?.getRandomValues){
    const a=new Uint32Array(1);crypto.getRandomValues(a);return min+(a[0]%n);
  }
  return min+Math.floor(Math.random()*n);
}
export function shuffle(arr){
  const a=arr.slice();
  for(let i=a.length-1;i>0;i--){const j=randInt(0,i);[a[i],a[j]]=[a[j],a[i]]}
  return a;
}
export function formatDuration(ms){
  const total=Math.max(0,Math.floor(ms/1000)),h=Math.floor(total/3600),m=Math.floor(total%3600/60),s=total%60;
  return [h,m,s].map((v,i)=>String(v).padStart(i===0?2:2,'0')).join(':');
}
