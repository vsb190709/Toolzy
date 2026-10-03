import { style, qs, copy, esc } from "./helpers.js";

const clamp=(n,min=0,max=1)=>Math.min(max,Math.max(min,n));

function hsvToRgb(h,s,v){
  const c=v*s, x=c*(1-Math.abs((h/60)%2-1)), m=v-c;
  let r=0,g=0,b=0;
  if(h<60){r=c;g=x;}
  else if(h<120){r=x;g=c;}
  else if(h<180){g=c;b=x;}
  else if(h<240){g=x;b=c;}
  else if(h<300){r=x;b=c;}
  else {r=c;b=x;}
  return [Math.round((r+m)*255),Math.round((g+m)*255),Math.round((b+m)*255)];
}

function rgbToHsv(r,g,b){
  r/=255;g/=255;b/=255;
  const max=Math.max(r,g,b), min=Math.min(r,g,b), d=max-min;
  let h=0;
  if(d){
    if(max===r) h=60*((g-b)/d%6);
    else if(max===g) h=60*((b-r)/d+2);
    else h=60*((r-g)/d+4);
  }
  if(h<0)h+=360;
  return [h,max===0?0:d/max,max];
}

function rgbToHsl(r,g,b){
  r/=255;g/=255;b/=255;
  const max=Math.max(r,g,b), min=Math.min(r,g,b), d=max-min;
  let h=0,s=0,l=(max+min)/2;
  if(d){
    s=d/(1-Math.abs(2*l-1));
    switch(max){
      case r:h=((g-b)/d)%6;break;
      case g:h=(b-r)/d+2;break;
      default:h=(r-g)/d+4;
    }
    h*=60;if(h<0)h+=360;
  }
  return [h,s*100,l*100];
}

function rgbToCmyk(r,g,b){
  const k=1-Math.max(r,g,b)/255;
  if(k>=0.999999)return [0,0,0,100];
  const d=1-k;
  return [(1-r/255-k/d)*100,(1-g/255-k/d)*100,(1-b/255-k/d)*100,k*100];
}

const rgbToHex=([r,g,b])=>"#"+[r,g,b].map(v=>Math.round(v).toString(16).padStart(2,"0")).join("").toUpperCase();

function parseHex(value){
  const raw=value.trim().replace(/^#/,"");
  if(!/^[0-9a-f]{3}([0-9a-f]{3})?$/i.test(raw)) throw new Error("Enter a valid HEX color, like #6750A4.");
  const full=raw.length===3?raw.split("").map(x=>x+x).join(""):raw;
  return [parseInt(full.slice(0,2),16),parseInt(full.slice(2,4),16),parseInt(full.slice(4,6),16)];
}

function luminance([r,g,b]){
  const f=v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)};
  return .2126*f(r)+.7152*f(g)+.0722*f(b);
}

function contrastText(rgb){return luminance(rgb)>0.46?"#17151A":"#FFFFFF"}

const injectStyle=()=>{
  if(document.getElementById("toolzy-color-ui"))return;
  const s=document.createElement("style");
  s.id="toolzy-color-ui";
  s.textContent=`
    .color-tool{display:grid;gap:16px}
    .color-picker-card{border:1px solid var(--outline-variant);border-radius:24px;background:var(--surface-1);overflow:hidden}
    .color-picker-top{display:grid;grid-template-columns:260px minmax(0,1fr);gap:24px;padding:24px}
    .color-wheel-wrap{display:grid;gap:14px;place-items:center}
    .color-wheel{
      position:relative;width:230px;height:230px;border-radius:50%;
      background:conic-gradient(from -90deg,#ff0000,#ffff00,#00ff00,#00ffff,#0000ff,#ff00ff,#ff0000);
      box-shadow:inset 0 0 0 14px var(--surface-1),0 0 0 1px var(--outline-variant);
      cursor:crosshair;touch-action:none;
    }
    .color-wheel::after{
      content:"";position:absolute;inset:24px;border-radius:50%;background:var(--surface-1);
      box-shadow:0 2px 8px rgba(0,0,0,.12);
    }
    .color-wheel-knob{
      position:absolute;z-index:2;width:22px;height:22px;border-radius:50%;
      border:3px solid #fff;box-shadow:0 1px 5px rgba(0,0,0,.35);transform:translate(-50%,-50%);pointer-events:none;
    }
    .color-wheel-center{
      position:absolute;z-index:3;inset:0;display:grid;place-items:center;pointer-events:none;
      font-size:12px;font-weight:800;color:var(--on-surface-variant);
    }
    .color-sv-area{
      position:relative;min-height:300px;border-radius:20px;overflow:hidden;border:1px solid var(--outline-variant);
      background:linear-gradient(to bottom,#0000,#000),linear-gradient(to right,#fff,var(--picker-hue,#6750A4));
      cursor:crosshair;touch-action:none;
    }
    .color-sv-knob{position:absolute;width:20px;height:20px;border-radius:50%;border:3px solid #fff;box-shadow:0 1px 5px rgba(0,0,0,.4);transform:translate(-50%,-50%);pointer-events:none}
    .color-controls{display:grid;gap:14px;padding:0 24px 24px}
    .color-hex-row{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:end}
    .color-control-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center}
    .color-field{display:grid;gap:7px}
    .color-field>span{font-size:12px;font-weight:800;color:var(--on-surface-variant)}
    .color-field input{
      min-height:50px;width:100%;padding:12px 14px;border:1px solid var(--outline);border-radius:14px;
      background:var(--surface);color:var(--on-surface);font:600 15px ui-monospace,SFMono-Regular,Consolas,monospace;
    }
    .color-range{width:100%;accent-color:var(--primary)}
    .color-actions{display:flex;flex-wrap:wrap;gap:9px}
    .color-preview{min-height:94px;margin:0 24px 24px;padding:18px;border:1px solid var(--outline-variant);border-radius:20px;display:flex;align-items:flex-end;justify-content:space-between;gap:14px}
    .color-preview-label{font-size:12px;font-weight:800;opacity:.78}
    .color-preview-value{font:800 18px ui-monospace,SFMono-Regular,Consolas,monospace}
    .color-values{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;padding:0 24px 24px}
    .color-value{
      display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;
      padding:13px 14px;border:1px solid var(--outline-variant);border-radius:16px;background:var(--surface-2)
    }
    .color-value-copy{min-width:0}
    .color-value-label{display:block;font-size:11px;font-weight:800;color:var(--on-surface-variant);margin-bottom:4px;letter-spacing:.05em;text-transform:uppercase}
    .color-value-text{display:block;font:600 14px ui-monospace,SFMono-Regular,Consolas,monospace;overflow-wrap:anywhere}
    .color-copy{
      width:40px;height:40px;border-radius:50%;display:grid;place-items:center;padding:0!important;
      border:1px solid var(--outline-variant)!important;background:var(--surface)!important;color:var(--on-surface)!important
    }
    .color-copy:hover{background:var(--primary-container)!important;color:var(--on-primary-container)!important}
    .color-copy .material-symbols-rounded{font-size:19px}
    @media(max-width:760px){
      .color-picker-top{grid-template-columns:1fr;padding:18px;gap:18px}
      .color-wheel{width:200px;height:200px}
      .color-sv-area{min-height:250px}
      .color-controls{padding:0 18px 18px}
      .color-values{grid-template-columns:1fr;padding:0 18px 18px}
      .color-preview{margin:0 18px 18px;min-height:86px}
    }
  `;
  document.head.appendChild(s);
};

function renderValues(root,rgb){
  const [h,sV,v]=rgbToHsv(...rgb), [hslH,hslS,hslL]=rgbToHsl(...rgb), cmyk=rgbToCmyk(...rgb);
  const values=[
    ["HEX",rgbToHex(rgb)],
    ["RGB",`rgb(${rgb.join(", ")})`],
    ["HSL",`hsl(${Math.round(hslH)}°, ${Math.round(hslS)}%, ${Math.round(hslL)}%)`],
    ["HSV",`hsv(${Math.round(h)}°, ${Math.round(sV*100)}%, ${Math.round(v*100)}%)`],
    ["CMYK",`${Math.round(cmyk[0])}%, ${Math.round(cmyk[1])}%, ${Math.round(cmyk[2])}%, ${Math.round(cmyk[3])}%`]
  ];
  qs(root,"[data-values]").innerHTML=values.map(([k,val])=>`
    <div class="color-value">
      <div class="color-value-copy"><span class="color-value-label">${k}</span><span class="color-value-text">${esc(val)}</span></div>
      <button class="color-copy" data-copy-value="${esc(val)}" aria-label="Copy ${k}"><span class="material-symbols-rounded">content_copy</span></button>
    </div>`).join("");
  root.querySelectorAll("[data-copy-value]").forEach(btn=>btn.onclick=async()=>{
    const ok=await copy(btn.dataset.copyValue), old=btn.innerHTML;
    btn.innerHTML=`<span class="material-symbols-rounded">${ok?"check":"close"}</span>`;
    setTimeout(()=>btn.innerHTML=old,900);
  });
}

export function mount(root,t){
  style();injectStyle();
  root.innerHTML=`
    <section class="dev-tool color-tool">
      <div class="color-picker-card">
        <div class="dev-heading">
          <div class="dev-heading-icon" aria-hidden="true"><span class="material-symbols-rounded">palette</span></div>
          <div class="dev-heading-copy">
            <div class="dev-kicker">Developer tool</div>
            <h2>${esc(t.name)}</h2>
            <p>Pick a color visually or enter a HEX value.</p>
          </div>
        </div>

        <div class="color-picker-top">
          <div class="color-wheel-wrap">
            <div class="color-wheel" data-wheel aria-label="Color hue wheel" role="slider" aria-valuemin="0" aria-valuemax="360" aria-valuenow="262" tabindex="0">
              <span class="color-wheel-knob" data-wheel-knob></span>
              <span class="color-wheel-center">HUE</span>
            </div>
          </div>
          <div class="color-sv-area" data-sv aria-label="Saturation and brightness picker" role="group">
            <span class="color-sv-knob" data-sv-knob></span>
          </div>
        </div>

        <div class="color-controls">
          <div class="color-hex-row">
            <label class="color-field"><span>HEX color</span><input data-hex value="#6750A4" spellcheck="false" autocomplete="off" aria-label="HEX color"></label>
            <button class="secondary" data-apply>Apply</button>
          </div>
          <div class="color-control-row">
            <label class="color-field"><span>Fine hue</span><input class="color-range" data-hue type="range" min="0" max="360" value="262" aria-label="Hue"></label>
            <output data-hue-value>262°</output>
          </div>
          <div class="color-actions">
            <button class="primary" data-random><span class="material-symbols-rounded">shuffle</span> Random</button>
            <button class="secondary" data-native><span class="material-symbols-rounded">colorize</span> Native picker</button>
            <button class="secondary" data-reset><span class="material-symbols-rounded">restart_alt</span> Reset</button>
            <input data-native-input type="color" value="#6750A4" hidden>
          </div>
        </div>

        <div data-preview class="color-preview">
          <div><div class="color-preview-label">Current color</div><div class="color-preview-value" data-preview-value>#6750A4</div></div>
          <span class="color-preview-label">Pick, copy, done.</span>
        </div>

        <div class="color-values" data-values></div>
      </div>
    </section>`;

  let rgb=[103,80,164];
  let [h,s,v]=rgbToHsv(...rgb);

  const render=()=>{
    const hex=rgbToHex(rgb);
    qs(root,"[data-hex]").value=hex;
    qs(root,"[data-native-input]").value=hex;
    qs(root,"[data-hue]").value=Math.round(h);
    qs(root,"[data-hue-value]").textContent=`${Math.round(h)}°`;
    qs(root,"[data-wheel]").setAttribute("aria-valuenow",String(Math.round(h)));
    qs(root,"[data-sv]").style.setProperty("--picker-hue",`hsl(${h} 100% 50%)`);

    const wheel=qs(root,"[data-wheel]"), wr=wheel.getBoundingClientRect();
    const radius=Math.min(wr.width,wr.height)/2-22, angle=(h-90)*Math.PI/180;
    const knob=qs(root,"[data-wheel-knob]");
    knob.style.left=`${wr.width/2+Math.cos(angle)*radius}px`;
    knob.style.top=`${wr.height/2+Math.sin(angle)*radius}px`;
    knob.style.background=hex;

    qs(root,"[data-sv-knob]").style.left=`${s*100}%`;
    qs(root,"[data-sv-knob]").style.top=`${(1-v)*100}%`;

    const preview=qs(root,"[data-preview]");
    preview.style.background=hex;
    preview.style.color=contrastText(rgb);
    preview.querySelector("[data-preview-value]").textContent=hex;
    renderValues(root,rgb);
  };

  const updateFromHSV=()=>{rgb=hsvToRgb(h,s,v);render()};
  const updateWheel=(event)=>{
    const el=qs(root,"[data-wheel]"), r=el.getBoundingClientRect();
    const dx=event.clientX-(r.left+r.width/2), dy=event.clientY-(r.top+r.height/2);
    h=(Math.atan2(dy,dx)*180/Math.PI+90+360)%360;
    updateFromHSV();
  };
  const updateSV=(event)=>{
    const el=qs(root,"[data-sv]"), [x,y]=(()=>{
      const r=el.getBoundingClientRect();
      return [clamp((event.clientX-r.left)/r.width),clamp((event.clientY-r.top)/r.height)];
    })();
    s=x;v=1-y;updateFromHSV();
  };

  let wheelDrag=false,svDrag=false;
  const wheel=qs(root,"[data-wheel]"), sv=qs(root,"[data-sv]");
  wheel.addEventListener("pointerdown",e=>{wheelDrag=true;wheel.setPointerCapture(e.pointerId);updateWheel(e)});
  wheel.addEventListener("pointermove",e=>{if(wheelDrag)updateWheel(e)});
  wheel.addEventListener("pointerup",()=>wheelDrag=false);
  wheel.addEventListener("pointercancel",()=>wheelDrag=false);
  wheel.addEventListener("keydown",e=>{
    if(e.key==="ArrowRight"||e.key==="ArrowUp"){e.preventDefault();h=(h+1)%360;updateFromHSV();}
    if(e.key==="ArrowLeft"||e.key==="ArrowDown"){e.preventDefault();h=(h+359)%360;updateFromHSV();}
  });

  sv.addEventListener("pointerdown",e=>{svDrag=true;sv.setPointerCapture(e.pointerId);updateSV(e)});
  sv.addEventListener("pointermove",e=>{if(svDrag)updateSV(e)});
  sv.addEventListener("pointerup",()=>svDrag=false);
  sv.addEventListener("pointercancel",()=>svDrag=false);

  qs(root,"[data-hue]").oninput=e=>{h=+e.target.value;updateFromHSV()};
  qs(root,"[data-apply]").onclick=()=>{
    try{
      rgb=parseHex(qs(root,"[data-hex]").value);
      [h,s,v]=rgbToHsv(...rgb);
      render();
    }catch(e){
      const input=qs(root,"[data-hex]");
      input.setCustomValidity(e.message);
      input.reportValidity();
      input.focus();
      setTimeout(()=>input.setCustomValidity(""),1500);
    }
  };
  qs(root,"[data-hex]").addEventListener("keydown",e=>{if(e.key==="Enter")qs(root,"[data-apply]").click()});
  qs(root,"[data-random]").onclick=()=>{
    rgb=[...crypto.getRandomValues(new Uint8Array(3))];
    [h,s,v]=rgbToHsv(...rgb);
    render();
  };
  qs(root,"[data-native]").onclick=()=>qs(root,"[data-native-input]").click();
  qs(root,"[data-native-input]").oninput=e=>{
    rgb=parseHex(e.target.value);
    [h,s,v]=rgbToHsv(...rgb);
    render();
  };
  qs(root,"[data-reset]").onclick=()=>{
    rgb=[103,80,164];
    [h,s,v]=rgbToHsv(...rgb);
    render();
  };

  render();
}
