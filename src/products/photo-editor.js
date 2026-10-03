function icon(name){return `<span class="material-symbols-rounded">${name}</span>`}
let root,canvas,ctx;
let layers=[],active=-1,history=[],future=[],tool="move",zoom=1;
let adjustments={exposure:0,brightness:0,contrast:0,highlights:0,shadows:0,whites:0,blacks:0,temperature:0,tint:0,vibrance:0,saturation:0,hue:0,sharpness:0,clarity:0,blur:0,grayscale:0,sepia:0,vignette:0,grain:0};
let transform={rotation:0,flipX:false,flipY:false};
let brush={size:35,opacity:1,color:"#ffffff",hardness:1};
let drag=null,cropRect=null,beforeMode=false;
const esc=v=>String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const uid=()=>Math.random().toString(36).slice(2,10);
const fmt=v=>Number(v).toFixed(Number(v)%1?1:0);
const deepState=()=>JSON.stringify({layers:layers.map(l=>({id:l.id,type:l.type,name:l.name,src:l.src,x:l.x,y:l.y,w:l.w,h:l.h,scale:l.scale,rotation:l.rotation,opacity:l.opacity,visible:l.visible,blend:l.blend,text:l.text,color:l.color,font:l.font,canvasData:l.canvasData||null})),adjustments,transform});
function saveHistory(){history.push(deepState());if(history.length>40)history.shift();future=[];updateHistory()}
function stateRestore(raw){const s=JSON.parse(raw);layers=s.layers;adjustments=s.adjustments;transform=s.transform;layers.forEach(l=>{if(l.src){const im=new Image();im.onload=()=>{l.img=im;draw()};im.src=l.src}if(l.canvasData){const im=new Image();im.onload=()=>{l.img=im;draw()};im.src=l.canvasData}});draw();renderLayers();syncAll();updateHistory()}
function undo(){if(!history.length)return;future.push(deepState());stateRestore(history.pop())}
function redo(){if(!future.length)return;history.push(deepState());stateRestore(future.pop())}
function fitCanvas(w,h){const max=1800,s=Math.min(1,max/Math.max(w,h));canvas.width=Math.max(1,Math.round(w*s));canvas.height=Math.max(1,Math.round(h*s))}
function makeImageLayer(file,img){return{id:uid(),type:"image",name:file?.name||"Image",src:file?URL.createObjectURL(file):"",img,x:canvas.width/2,y:canvas.height/2,w:img.naturalWidth,h:img.naturalHeight,scale:Math.min(1,1200/Math.max(img.naturalWidth,img.naturalHeight)),rotation:0,opacity:1,visible:true,blend:"source-over"}}
function makeRasterLayer(name="Paint layer"){const c=document.createElement("canvas");c.width=canvas.width;c.height=canvas.height;return{id:uid(),type:"paint",name,canvas:c,img:c,x:canvas.width/2,y:canvas.height/2,w:c.width,h:c.height,scale:1,rotation:0,opacity:1,visible:true,blend:"source-over"}}
function draw(){
 if(!canvas)return;
 ctx.save();ctx.clearRect(0,0,canvas.width,canvas.height);
 const checker=16;for(let y=0;y<canvas.height;y+=checker)for(let x=0;x<canvas.width;x+=checker){ctx.fillStyle=((x/checker+y/checker)%2)?"#d7d4da":"#eeeaf0";ctx.fillRect(x,y,checker,checker)}
 if(!beforeMode){
  ctx.translate(canvas.width/2,canvas.height/2);ctx.rotate(transform.rotation*Math.PI/180);ctx.scale(transform.flipX?-1:1,transform.flipY?-1:1);ctx.translate(-canvas.width/2,-canvas.height/2);
 }
 for(const l of layers){if(!l.visible||!l.img)continue;ctx.save();ctx.globalAlpha=l.opacity;ctx.globalCompositeOperation=l.blend||"source-over";
  ctx.translate(l.x,l.y);ctx.rotate((l.rotation||0)*Math.PI/180);ctx.scale(l.scale,l.scale);
  ctx.filter=beforeMode?"none":`brightness(${100+adjustments.brightness+adjustments.exposure*1.4}%) contrast(${100+adjustments.contrast+adjustments.clarity/2}%) saturate(${100+adjustments.saturation+adjustments.vibrance/1.4}%) hue-rotate(${adjustments.hue+adjustments.temperature/3}deg) blur(${adjustments.blur}px) grayscale(${adjustments.grayscale}%) sepia(${adjustments.sepia}%)`;
  ctx.drawImage(l.img,-l.w/2,-l.h/2,l.w,l.h);ctx.restore()}
 ctx.restore();
 if(cropRect&&tool==="crop"){ctx.save();ctx.strokeStyle="#fff";ctx.setLineDash([7,5]);ctx.lineWidth=2;ctx.strokeRect(cropRect.x,cropRect.y,cropRect.w,cropRect.h);ctx.fillStyle="rgba(0,0,0,.4)";ctx.fillRect(0,0,canvas.width,cropRect.y);ctx.fillRect(0,cropRect.y+cropRect.h,canvas.width,canvas.height-cropRect.y-cropRect.h);ctx.fillRect(0,cropRect.y,cropRect.x,cropRect.h);ctx.fillRect(cropRect.x+cropRect.w,cropRect.y,canvas.width-cropRect.x-cropRect.w,cropRect.h);ctx.restore()}
 root.querySelector("[data-photo-size]").textContent=canvas.width+" × "+canvas.height;
}
function renderLayers(){
 const el=root.querySelector("[data-layers]");
 el.innerHTML=layers.length?layers.map((l,i)=>`<div class="ps-layer ${i===active?"active":""}" data-layer="${i}"><button class="ps-eye" data-eye="${i}">${l.visible?"visibility":"visibility_off"}</button><span class="ps-thumb">${l.type==="text"?"T":l.type==="paint"?"✎":"▧"}</span><button class="ps-layer-name">${esc(l.name)}</button><span class="ps-layer-kind">${l.type}</span></div>`).join(""):'<div class="ps-empty">No layers yet</div>';
 el.querySelectorAll("[data-layer]").forEach(row=>{row.onclick=e=>{const i=+row.dataset.layer;if(e.target.closest("[data-eye]")){layers[i].visible=!layers[i].visible;draw();renderLayers();return}active=i;renderLayers();syncAll()};});
}
function syncAll(){
 const l=layers[active];
 const set=(q,v)=>{const x=root.querySelector(q);if(x){x.value=v;const o=x.closest("label")?.querySelector("output");if(o)o.textContent=fmt(v)}};
 Object.entries(adjustments).forEach(([k,v])=>set(`[data-adj="${k}"]`,v));
 if(l){set("[data-layer-opacity]",Math.round(l.opacity*100));const b=root.querySelector("[data-blend]");if(b)b.value=l.blend||"source-over"}
 const t=root.querySelector("[data-tool-label]");if(t)t.textContent=tool[0].toUpperCase()+tool.slice(1);
}
function updateHistory(){if(!root)return;root.querySelector("[data-undo]").disabled=!history.length;root.querySelector("[data-redo]").disabled=!future.length}
function addImage(file){if(!file)return;saveHistory();const im=new Image();im.onload=()=>{if(!layers.length)fitCanvas(im.naturalWidth,im.naturalHeight);const l=makeImageLayer(file,im);l.scale=Math.min(1,canvas.width/im.naturalWidth,canvas.height/im.naturalHeight);layers.push(l);active=layers.length-1;root.querySelector("[data-empty]").hidden=true;draw();renderLayers();syncAll()};im.src=URL.createObjectURL(file)}
function addText(){if(!canvas.width)return;saveHistory();const text=prompt("Text","Toolzy");if(text===null)return;const size=Number(prompt("Font size (px)","64"))||64;const c=document.createElement("canvas");c.width=Math.max(500,text.length*size);c.height=size*1.8;const x=c.getContext("2d");x.font=`700 ${size}px system-ui`;x.fillStyle="#ffffff";x.textAlign="center";x.textBaseline="middle";x.fillText(text,c.width/2,c.height/2);layers.push({id:uid(),type:"text",name:"Text — "+text.slice(0,18),text,img:c,x:canvas.width/2,y:canvas.height/2,w:c.width,h:c.height,scale:1,rotation:0,opacity:1,visible:true,blend:"source-over",color:"#fff",font:`700 ${size}px system-ui`,canvasData:c.toDataURL()});active=layers.length-1;draw();renderLayers()}
function addShape(){saveHistory();const c=document.createElement("canvas");c.width=600;c.height=400;const x=c.getContext("2d");x.fillStyle=prompt("Shape color","#8b6bd6")||"#8b6bd6";x.roundRect(15,15,570,370,35);x.fill();layers.push({id:uid(),type:"shape",name:"Shape",img:c,x:canvas.width/2,y:canvas.height/2,w:600,h:400,scale:.7,rotation:0,opacity:1,visible:true,blend:"source-over",canvasData:c.toDataURL()});active=layers.length-1;draw();renderLayers()}
function duplicate(){if(active<0)return;saveHistory();const l=layers[active];const copy={...l,id:uid(),name:l.name+" copy",x:l.x+20,y:l.y+20};if(l.img){const c=document.createElement("canvas");c.width=l.img.width;c.height=l.img.height;c.getContext("2d").drawImage(l.img,0,0);copy.img=c;copy.canvasData=c.toDataURL()}layers.splice(active+1,0,copy);active++;draw();renderLayers()}
function deleteLayer(){if(active<0)return;saveHistory();layers.splice(active,1);active=clamp(active-1,-1,layers.length-1);draw();renderLayers()}
function moveLayer(dir){if(active<0)return;const n=active+dir;if(n<0||n>=layers.length)return;saveHistory();[layers[active],layers[n]]=[layers[n],layers[active]];active=n;draw();renderLayers()}
function addPaintLayer(){saveHistory();layers.push(makeRasterLayer());active=layers.length-1;draw();renderLayers()}
function applyPreset(name){
 saveHistory();const p={cinematic:{exposure:.2,contrast:18,highlights:-18,shadows:20,vibrance:28,saturation:-5,temperature:8},vintage:{contrast:-8,saturation:-12,sepia:18,grain:18,vignette:25},bw:{grayscale:100,contrast:18,highlights:-10,shadows:12},punch:{contrast:25,clarity:25,vibrance:35,saturation:8},portrait:{exposure:.15,contrast:4,highlights:-20,shadows:18,temperature:5,saturation:3}}[name];if(p)adjustments={...adjustments,...p};draw();syncAll()}
function rotate(){saveHistory();transform.rotation=(transform.rotation+90)%360;draw()}
function crop(){if(!cropRect||cropRect.w<10||cropRect.h<10)return;saveHistory();const sx=Math.max(0,cropRect.x),sy=Math.max(0,cropRect.y),sw=Math.min(canvas.width-sx,cropRect.w),sh=Math.min(canvas.height-sy,cropRect.h);const c=document.createElement("canvas");c.width=Math.round(sw);c.height=Math.round(sh);c.getContext("2d").drawImage(canvas,sx,sy,sw,sh,0,0,sw,sh);canvas.width=c.width;canvas.height=c.height;layers.forEach(l=>{l.x-=sx;l.y-=sy});cropRect=null;tool="move";draw();renderLayers()}
function exportImage(type){
 const out=document.createElement("canvas");out.width=canvas.width;out.height=canvas.height;const oc=out.getContext("2d");oc.drawImage(canvas,0,0);
 const a=document.createElement("a");const ext=type==="image/jpeg"?"jpg":type==="image/webp"?"webp":"png";a.download="toolzy-edit."+ext;a.href=out.toDataURL(type,.94);a.click()
}
function pointerPos(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height}}
function pointerDown(e){
 const p=pointerPos(e);drag={x:p.x,y:p.y,last:p};if(tool==="crop"){cropRect={x:p.x,y:p.y,w:0,h:0};draw();return}
 if((tool==="brush"||tool==="eraser")){if(active<0||layers[active]?.type!=="paint"){addPaintLayer()}paintAt(p);return}
 if(tool==="move"&&active>=0){drag.layerX=layers[active].x;drag.layerY=layers[active].y}
}
function pointerMove(e){if(!drag)return;const p=pointerPos(e);
 if(tool==="crop"){cropRect.x=Math.min(drag.x,p.x);cropRect.y=Math.min(drag.y,p.y);cropRect.w=Math.abs(p.x-drag.x);cropRect.h=Math.abs(p.y-drag.y);draw();return}
 if(tool==="brush"||tool==="eraser"){paintAt(p);drag.last=p;return}
 if(tool==="move"&&active>=0){layers[active].x=drag.layerX+(p.x-drag.x);layers[active].y=drag.layerY+(p.y-drag.y);draw()}
}
function pointerUp(){if(drag&&tool==="move"&&active>=0)saveHistory();drag=null}
function paintAt(p){const l=layers[active];if(!l||!l.img)return;const c=l.img.getContext("2d"),r=brush.size/2;c.save();c.globalAlpha=brush.opacity;c.globalCompositeOperation=tool==="eraser"?"destination-out":"source-over";c.fillStyle=brush.color;c.beginPath();c.arc(p.x-l.x+l.w/2,p.y-l.y+l.h/2,r,0,Math.PI*2);c.fill();c.restore();draw()}
function keyboard(e){if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="z"){e.preventDefault();e.shiftKey?redo():undo()}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="y"){e.preventDefault();redo()}if(e.key==="Delete")deleteLayer()}
export function mountPhotoEditor(target){
 root=target;document.title="Toolzy Photo Studio";
 root.innerHTML=`
 <section class="ps-app">
  <header class="ps-header"><div class="ps-brand"><div class="ps-mark">✦</div><div><strong>Toolzy Photo Studio</strong><small>Photoshop + Lightroom inspired workspace</small></div></div>
   <div class="ps-main-actions"><button data-new>${icon("add")} New</button><button data-open>${icon("folder_open")} Open</button><button data-save>${icon("save")} Save Project</button><button data-undo>${icon("undo")} Undo</button><button data-redo>${icon("redo")} Redo</button><button class="ps-export" data-export>${icon("download")} Export</button></div>
  </header>
  <div class="ps-menubar"><button>File</button><button>Edit</button><button>Image</button><button>Layer</button><button>Select</button><button>Filter</button><button>View</button><span class="ps-spacer"></span><button data-before>Before / After</button><span data-tool-label>Move</span></div>
  <div class="ps-workspace">
   <aside class="ps-leftbar">
    <button class="active" data-tool="move" title="Move">${icon("open_with")}<span>Move</span></button><button data-tool="crop" title="Crop">${icon("crop")}<span>Crop</span></button><button data-tool="brush" title="Brush">${icon("brush")}<span>Brush</span></button><button data-tool="eraser" title="Eraser">${icon("ink_eraser")}<span>Eraser</span></button><button data-add-text title="Text">${icon("text_fields")}<span>Text</span></button><button data-add-shape title="Shape">${icon("shapes")}<span>Shape</span></button><button data-add-layer title="New layer">${icon("layers")}<span>Layer</span></button>
   </aside>
   <main class="ps-center"><div class="ps-info"><span data-photo-size>—</span><span>RGB · Local processing</span><label>Zoom <input data-zoom type="range" min=".2" max="2.5" step=".05" value="1"></label></div><div class="ps-canvas-area"><canvas data-canvas></canvas><div class="ps-welcome" data-empty><div>${icon("photo_library")}</div><h2>Professional photo workspace</h2><p>Open a photo to start editing with layers, masks-style workflows, color grading and creative tools.</p><button data-stage-open>${icon("folder_open")} Open image</button></div></div></main>
   <aside class="ps-right">
    <section class="ps-panel"><div class="ps-tabs"><button class="active" data-tab="adjust">Adjust</button><button data-tab="color">Color</button><button data-tab="effects">Effects</button><button data-tab="presets">Presets</button></div>
     <div data-tabpanel="adjust">
      ${[['exposure','Exposure',-4,4,0,.01],['brightness','Brightness',-100,100,0,1],['contrast','Contrast',-100,100,0,1],['highlights','Highlights',-100,100,0,1],['shadows','Shadows',-100,100,0,1],['whites','Whites',-100,100,0,1],['blacks','Blacks',-100,100,0,1],['clarity','Clarity',-100,100,0,1],['sharpness','Sharpening',0,100,0,1]].map(x=>`<label class="ps-slider"><span>${x[1]} <output>${x[4]}</output></span><input data-adj="${x[0]}" type="range" min="${x[2]}" max="${x[3]}" step="${x[5]}" value="${x[4]}"></label>`).join("")}
     </div>
     <div data-tabpanel="color" hidden>${[['temperature','Temperature',-100,100,0],['tint','Tint',-100,100,0],['vibrance','Vibrance',-100,100,0],['saturation','Saturation',-100,100,0],['hue','Hue',-180,180,0]].map(x=>`<label class="ps-slider"><span>${x[1]} <output>0</output></span><input data-adj="${x[0]}" type="range" min="${x[2]}" max="${x[3]}" value="0"></label>`).join("")}<div class="ps-histogram"><span>HISTOGRAM</span><div>${Array.from({length:32},(_,i)=>`<i style="height:${15+(i*17)%65}%"></i>`).join("")}</div></div></div>
     <div data-tabpanel="effects" hidden>${[['blur','Blur',0,20,0],['grayscale','B&W',0,100,0],['sepia','Sepia',0,100,0],['vignette','Vignette',0,100,0],['grain','Grain',0,100,0]].map(x=>`<label class="ps-slider"><span>${x[1]} <output>0</output></span><input data-adj="${x[0]}" type="range" min="${x[2]}" max="${x[3]}" value="0"></label>`).join("")}</div>
     <div data-tabpanel="presets" hidden><div class="ps-presets">${["cinematic","punch","portrait","vintage","bw"].map(p=>`<button data-preset="${p}">${p}</button>`).join("")}</div></div>
    </section>
    <section class="ps-panel ps-layers-panel"><div class="ps-panel-title"><strong>Layers</strong><div><button data-dup title="Duplicate">${icon("content_copy")}</button><button data-up title="Bring forward">${icon("arrow_upward")}</button><button data-down title="Send backward">${icon("arrow_downward")}</button><button data-delete title="Delete">${icon("delete")}</button></div></div><div data-layers></div><div class="ps-layer-controls"><label>Opacity <output>100</output><input data-layer-opacity type="range" min="0" max="100" value="100"></label><select data-blend><option value="source-over">Normal</option><option value="multiply">Multiply</option><option value="screen">Screen</option><option value="overlay">Overlay</option><option value="darken">Darken</option><option value="lighten">Lighten</option><option value="color-dodge">Color Dodge</option><option value="color-burn">Color Burn</option><option value="soft-light">Soft Light</option><option value="hard-light">Hard Light</option></select></div></section>
    <section class="ps-panel ps-tool-panel"><div class="ps-panel-title"><strong>Tool Options</strong></div><label>Brush size <output data-brush-size>35</output><input data-brush-size-range type="range" min="1" max="300" value="35"></label><label>Brush opacity <output data-brush-opacity>100</output><input data-brush-opacity-range type="range" min="1" max="100" value="100"></label><label>Color <input data-brush-color type="color" value="#ffffff"></label></section>
   </aside>
  </div>
 </section>
 <input data-image-input type="file" accept="image/*" multiple hidden>
 <div class="ps-export-menu" data-export-menu hidden><button data-exp="image/png">PNG</button><button data-exp="image/jpeg">JPG</button><button data-exp="image/webp">WebP</button></div>`;
 canvas=root.querySelector("[data-canvas]");ctx=canvas.getContext("2d");const imageInput=root.querySelector("[data-image-input]");
 const open=()=>imageInput.click();root.querySelector("[data-open]").onclick=open;root.querySelector("[data-stage-open]").onclick=open;
 imageInput.onchange=()=>{[...imageInput.files].forEach(addImage);imageInput.value=""};
 root.querySelectorAll("[data-tool]").forEach(b=>b.onclick=()=>{tool=b.dataset.tool;root.querySelectorAll("[data-tool]").forEach(x=>x.classList.toggle("active",x===b));root.querySelector("[data-tool-label]").textContent=tool[0].toUpperCase()+tool.slice(1);draw()});
 root.querySelectorAll("[data-add-text]").forEach(b=>b.onclick=addText);root.querySelector("[data-add-shape]").onclick=addShape;root.querySelector("[data-add-layer]").onclick=addPaintLayer;
 root.querySelector("[data-dup]").onclick=duplicate;root.querySelector("[data-up]").onclick=()=>moveLayer(1);root.querySelector("[data-down]").onclick=()=>moveLayer(-1);root.querySelector("[data-delete]").onclick=deleteLayer;
 root.querySelector("[data-rotate]")?.addEventListener("click",rotate);
 root.querySelector("[data-undo]").onclick=undo;root.querySelector("[data-redo]").onclick=redo;
 root.querySelector("[data-new]").onclick=()=>{if(confirm("Start a new project?")){saveHistory();layers=[];active=-1;canvas.width=1200;canvas.height=800;root.querySelector("[data-empty]").hidden=false;draw();renderLayers()}};
 root.querySelector("[data-before]").onpointerdown=()=>{beforeMode=true;draw()};root.querySelector("[data-before]").onpointerup=()=>{beforeMode=false;draw()};
 root.querySelector("[data-zoom]").oninput=e=>{zoom=+e.target.value;canvas.style.transform=`scale(${zoom})`};
 root.querySelector("[data-layer-opacity]").oninput=e=>{if(active>=0){layers[active].opacity=+e.target.value/100;root.querySelector("[data-layer-opacity]").closest("label").querySelector("output").textContent=e.target.value;draw()}};
 root.querySelector("[data-blend]").onchange=e=>{if(active>=0){saveHistory();layers[active].blend=e.target.value;draw()}};
 root.querySelectorAll("[data-adj]").forEach(x=>x.oninput=e=>{adjustments[e.target.dataset.adj]=+e.target.value;e.target.parentElement.querySelector("output").textContent=e.target.value;draw()});
 root.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>{root.querySelectorAll("[data-tab]").forEach(x=>x.classList.toggle("active",x===b));root.querySelectorAll("[data-tabpanel]").forEach(x=>x.hidden=x.dataset.tabpanel!==b.dataset.tab)});
 root.querySelectorAll("[data-preset]").forEach(b=>b.onclick=()=>applyPreset(b.dataset.preset));
 root.querySelector("[data-brush-size-range]").oninput=e=>{brush.size=+e.target.value;root.querySelector("[data-brush-size]").textContent=e.target.value};
 root.querySelector("[data-brush-opacity-range]").oninput=e=>{brush.opacity=+e.target.value/100;root.querySelector("[data-brush-opacity]").textContent=e.target.value};
 root.querySelector("[data-brush-color]").oninput=e=>brush.color=e.target.value;
 root.querySelector("[data-export]").onclick=()=>root.querySelector("[data-export-menu]").hidden=!root.querySelector("[data-export-menu]").hidden;
 root.querySelectorAll("[data-exp]").forEach(b=>b.onclick=()=>{exportImage(b.dataset.exp);root.querySelector("[data-export-menu]").hidden=true});
 canvas.addEventListener("pointerdown",pointerDown);canvas.addEventListener("pointermove",pointerMove);window.addEventListener("pointerup",pointerUp);window.addEventListener("keydown",keyboard);
 const drop=root.querySelector(".ps-canvas-area");drop.ondragover=e=>e.preventDefault();drop.ondrop=e=>{e.preventDefault();[...e.dataTransfer.files].filter(f=>f.type.startsWith("image/")).forEach(addImage)};
 renderLayers();updateHistory();syncAll();
}
