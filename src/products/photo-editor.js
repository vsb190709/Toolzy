let root,canvas,ctx;
let layers=[],active=-1,history=[],future=[];
let adjustments={brightness:0,contrast:0,saturation:0,hue:0,blur:0,grayscale:0,sepia:0};
let zoom=1,rotation=0,flipX=false,flipY=false;
let imageInput,textInput;
const esc=v=>String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const uid=()=>Math.random().toString(36).slice(2,10);
function snapshot(){return JSON.stringify({layers:layers.map(l=>({...l,img:null})),adjustments,rotation,flipX,flipY});}
function saveHistory(){history.push(snapshot());if(history.length>30)history.shift();future=[]}
function restore(s){const x=JSON.parse(s);layers=x.layers;adjustments=x.adjustments;rotation=x.rotation;flipX=x.flipX;flipY=x.flipY;layers.forEach(l=>{if(l.src){const im=new Image();im.onload=()=>{l.img=im;draw()};im.src=l.src}});draw();renderLayers()}
function imageLayer(file,img){
 return {id:uid(),type:"image",name:file?.name||"Image",src:file?URL.createObjectURL(file):"",img,x:canvas.width/2,y:canvas.height/2,w:img.naturalWidth,h:img.naturalHeight,scale:Math.min(1,900/Math.max(img.naturalWidth,img.naturalHeight)),rotation:0,opacity:1,visible:true,blend:"source-over"};
}
function fitCanvas(w,h){const max=1800;const s=Math.min(1,max/Math.max(w,h));canvas.width=Math.max(1,Math.round(w*s));canvas.height=Math.max(1,Math.round(h*s));}
function draw(){
 if(!canvas)return;
 ctx.save();ctx.clearRect(0,0,canvas.width,canvas.height);
 const bg=ctx.createLinearGradient(0,0,canvas.width,canvas.height);bg.addColorStop(0,"#25232b");bg.addColorStop(1,"#17161b");ctx.fillStyle=bg;ctx.fillRect(0,0,canvas.width,canvas.height);
 ctx.translate(canvas.width/2,canvas.height/2);ctx.rotate(rotation*Math.PI/180);ctx.scale(flipX?-1:1,flipY?-1:1);ctx.translate(-canvas.width/2,-canvas.height/2);
 for(const l of layers){if(!l.visible||!l.img)continue;ctx.save();ctx.globalAlpha=l.opacity;ctx.globalCompositeOperation=l.blend||"source-over";ctx.translate(l.x,l.y);ctx.rotate((l.rotation||0)*Math.PI/180);ctx.scale(l.scale,l.scale);ctx.filter=`brightness(${100+adjustments.brightness}%) contrast(${100+adjustments.contrast}%) saturate(${100+adjustments.saturation}%) hue-rotate(${adjustments.hue}deg) blur(${adjustments.blur}px) grayscale(${adjustments.grayscale}%) sepia(${adjustments.sepia}%)`;ctx.drawImage(l.img,-l.w/2,-l.h/2,l.w,l.h);ctx.restore()}
 ctx.restore();
 document.querySelector("[data-photo-size]").textContent=`${canvas.width} × ${canvas.height}`;
}
function renderLayers(){
 const el=root.querySelector("[data-layers]");
 el.innerHTML=layers.length?layers.map((l,i)=>`<button class="pe-layer ${i===active?"active":""}" data-layer="${i}"><span class="pe-layer-eye" data-eye="${i}">${l.visible?"visibility":"visibility_off"}</span><span class="pe-layer-thumb">${l.type==="text"?"T":"▧"}</span><span class="pe-layer-name">${esc(l.name)}</span><span class="pe-layer-opacity">${Math.round(l.opacity*100)}%</span></button>`).join(""):'<div class="pe-empty-layer">Add an image or text layer.</div>';
 el.querySelectorAll("[data-layer]").forEach(b=>b.onclick=e=>{const i=+b.dataset.layer;if(e.target.dataset.eye===String(i)){layers[i].visible=!layers[i].visible;draw();renderLayers();return}active=i;renderLayers();syncControls()});
}
function syncControls(){
 const l=layers[active];const set=(q,v)=>{const x=root.querySelector(q);if(x){x.value=v;const out=x.parentElement?.querySelector("output");if(out)out.textContent=v}};
 set('[data-adj="brightness"]',adjustments.brightness);set('[data-adj="contrast"]',adjustments.contrast);set('[data-adj="saturation"]',adjustments.saturation);set('[data-adj="hue"]',adjustments.hue);set('[data-adj="blur"]',adjustments.blur);set('[data-adj="grayscale"]',adjustments.grayscale);set('[data-adj="sepia"]',adjustments.sepia);
 if(l){set('[data-layer-opacity]',Math.round(l.opacity*100))}
}
function addImage(file){if(!file||!file.type.startsWith("image/"))return;saveHistory();const im=new Image();im.onload=()=>{if(!layers.length)fitCanvas(im.naturalWidth,im.naturalHeight);const l=imageLayer(file,im);l.x=canvas.width/2;l.y=canvas.height/2;layers.push(l);active=layers.length-1;draw();renderLayers();syncControls()};im.src=URL.createObjectURL(file)}
function addText(){saveHistory();const l={id:uid(),type:"text",name:"Text layer",text:"Your text",x:canvas.width/2,y:canvas.height/2,w:500,h:100,scale:1,rotation:0,opacity:1,visible:true,blend:"source-over",color:"#ffffff",font:"700 64px system-ui"};l.img=document.createElement("canvas");const c=l.img;c.width=800;c.height=180;const x=c.getContext("2d");x.font=l.font;x.fillStyle=l.color;x.textAlign="center";x.textBaseline="middle";x.fillText(l.text,400,90);l.w=c.width;l.h=c.height;layers.push(l);active=layers.length-1;draw();renderLayers()}
function deleteActive(){if(active<0)return;saveHistory();const l=layers.splice(active,1)[0];if(l.src)URL.revokeObjectURL(l.src);active=clamp(active-1,-1,layers.length-1);draw();renderLayers()}
function exportPNG(){const link=document.createElement("a");link.download="toolzy-photo.png";link.href=canvas.toDataURL("image/png",1);link.click()}
function rotate(){saveHistory();rotation=(rotation+90)%360;draw()}
function resetAdjust(){saveHistory();adjustments={brightness:0,contrast:0,saturation:0,hue:0,blur:0,grayscale:0,sepia:0};draw();syncControls()}
export function mountPhotoEditor(target){
 root=target;document.title="Photo Editor — Toolzy";
 root.innerHTML=`
 <section class="pe-shell">
  <header class="pe-top"><div class="pe-brand"><span class="pe-logo">✦</span><div><strong>Toolzy Photo</strong><small>Professional image workspace</small></div></div>
   <div class="pe-actions"><button data-open>${icon("folder_open")} Open</button><button data-add-text>T Text</button><button data-undo disabled>${icon("undo")} Undo</button><button data-redo disabled>${icon("redo")} Redo</button><button class="pe-export" data-export>${icon("download")} Export PNG</button><input data-image-input type="file" accept="image/*" hidden></div>
  </header>
  <div class="pe-body">
   <aside class="pe-tools"><button class="active" title="Edit">${icon("tune")}<span>Edit</span></button><button data-rotate title="Rotate">${icon("rotate_right")}<span>Rotate</span></button><button data-flipx title="Flip horizontal">${icon("flip")}<span>Flip</span></button><button data-flipy title="Flip vertical">${icon("flip")}<span>Mirror</span></button><button data-reset title="Reset adjustments">${icon("restart_alt")}<span>Reset</span></button></aside>
   <main class="pe-stage"><div class="pe-stagebar"><span data-photo-size>—</span><span>Local processing · No upload</span><label>Zoom <input data-zoom type="range" min=".25" max="2" step=".05" value="1"></label></div><div class="pe-canvas-wrap"><canvas data-canvas></canvas><div class="pe-empty-stage" data-empty><div class="pe-big-icon">${icon("add_photo_alternate")}</div><h2>Start creating</h2><p>Open a photo, then build your edit with adjustments and layers.</p><button class="pe-primary" data-stage-open>${icon("folder_open")} Open photo</button></div></div></main>
   <aside class="pe-panel">
    <section class="pe-panel-section"><div class="pe-section-title"><strong>Adjust</strong><span>Light & color</span></div>
     ${[['brightness','Brightness',-100,100,0],['contrast','Contrast',-100,100,0],['saturation','Saturation',-100,100,0],['hue','Hue',-180,180,0],['blur','Blur',0,20,0],['grayscale','B&W',0,100,0],['sepia','Sepia',0,100,0]].map(x=>`<label class="pe-slider"><span>${x[1]} <output>${x[4]}</output></span><input data-adj="${x[0]}" type="range" min="${x[2]}" max="${x[3]}" value="${x[4]}"></label>`).join("")}
    </section>
    <section class="pe-panel-section"><div class="pe-section-title"><strong>Layers</strong><span>${icon("layers")}</span></div><div data-layers></div><div class="pe-layer-actions"><button data-add-text>${icon("text_fields")} Add text</button><button data-delete>${icon("delete")} Delete</button></div></section>
   </aside>
  </div>
 </section>`;
 canvas=root.querySelector("[data-canvas]");ctx=canvas.getContext("2d");imageInput=root.querySelector("[data-image-input]");
 const open=()=>imageInput.click();root.querySelector("[data-open]").onclick=open;root.querySelector("[data-stage-open]").onclick=open;imageInput.onchange=()=>{if(imageInput.files[0]){addImage(imageInput.files[0]);root.querySelector("[data-empty]").hidden=true}imageInput.value=""};
 root.querySelectorAll("[data-add-text]").forEach(b=>b.onclick=()=>{if(canvas.width)addText()});
 root.querySelector("[data-delete]").onclick=deleteActive;root.querySelector("[data-export]").onclick=exportPNG;root.querySelector("[data-rotate]").onclick=rotate;root.querySelector("[data-flipx]").onclick=()=>{saveHistory();flipX=!flipX;draw()};root.querySelector("[data-flipy]").onclick=()=>{saveHistory();flipY=!flipY;draw()};root.querySelector("[data-reset]").onclick=resetAdjust;
 root.querySelector("[data-undo]").onclick=()=>{if(!history.length)return;future.push(snapshot());restore(history.pop());updateHistory()};
 root.querySelector("[data-redo]").onclick=()=>{if(!future.length)return;history.push(snapshot());restore(future.pop());updateHistory()};
 root.querySelector("[data-zoom]").oninput=e=>{zoom=+e.target.value;canvas.style.transform=`scale(${zoom})`};
 root.querySelectorAll("[data-adj]").forEach(input=>input.oninput=e=>{adjustments[e.target.dataset.adj]=+e.target.value;e.target.parentElement.querySelector("output").textContent=e.target.value;draw()});
 function updateHistory(){root.querySelector("[data-undo]").disabled=!history.length;root.querySelector("[data-redo]").disabled=!future.length}
 const ro=new ResizeObserver(()=>{if(canvas.width)draw()});ro.observe(root);
 renderLayers();draw();updateHistory();
}
function icon(name){return `<span class="material-symbols-rounded">${name}</span>`}
