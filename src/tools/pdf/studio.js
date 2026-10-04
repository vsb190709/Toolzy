import { icon } from "../../core/icons.js";

const PDFJS_VERSION = "4.10.38";
const PDFLIB_VERSION = "1.17.1";
let pdfjsPromise;
let pdfLibPromise;

async function loadPdfJs(){
  if(!pdfjsPromise){
    pdfjsPromise = import(`https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.min.mjs`).then(pdfjs=>{
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.mjs`;
      return pdfjs;
    });
  }
  return pdfjsPromise;
}

async function loadPdfLib(){
  if(!pdfLibPromise) pdfLibPromise = import(`https://cdn.jsdelivr.net/npm/pdf-lib@${PDFLIB_VERSION}/+esm`);
  return pdfLibPromise;
}

export async function mount(root){
  let pdfDoc=null;
  let sourceBytes=null;
  let pages=[];
  let annotations=[];
  let pageIndex=0;
  let scale=1;
  let activeTool="select";
  let selectedIndex=-1;
  let rendering=false;
  let pendingRender=false;
  let destroyed=false;
  let history=[];
  let redoStack=[];
  let dragState=null;

  root.innerHTML=`
  <section class="pdf-studio pdf-studio-137">
    <header class="pdf-studio-bar">
      <div class="pdf-studio-title">
        <span class="pdf-studio-icon">${icon("picture_as_pdf")}</span>
        <div><strong>PDF Studio</strong><small>1.37 Editing & Pages</small></div>
      </div>
      <div class="pdf-studio-actions">
        <button class="secondary pdf-top-btn" id="pdf-undo" disabled title="Undo">${icon("undo")}<span>Undo</span></button>
        <button class="secondary pdf-top-btn" id="pdf-redo" disabled title="Redo">${icon("redo")}<span>Redo</span></button>
        <label class="primary pdf-open">${icon("upload")}<span>Open PDF</span><input id="pdf-file" type="file" accept="application/pdf,.pdf" hidden></label>
        <button class="primary pdf-save" id="pdf-save" disabled>${icon("download")}<span>Save PDF</span></button>
      </div>
    </header>

    <div class="pdf-studio-layout pdf-studio-137-layout">
      <aside class="pdf-thumbnails pdf-pages-panel">
        <div class="pdf-panel-head"><strong>Pages</strong><span id="pdf-page-count">—</span></div>
        <div class="pdf-page-actions">
          <button class="secondary compact" id="pdf-add-page" disabled title="Add blank page">${icon("add")} Add</button>
          <button class="secondary compact" id="pdf-duplicate-page" disabled title="Duplicate page">${icon("copy")} Duplicate</button>
        </div>
        <div id="pdf-thumb-list" class="pdf-thumb-list">
          <div class="pdf-empty-small">${icon("picture_as_pdf")}<span>Open a PDF to start editing</span></div>
        </div>
        <div class="pdf-panel-bottom">
          <button class="icon-btn" id="pdf-move-left" disabled title="Move page left">${icon("arrow-left")}</button>
          <button class="icon-btn" id="pdf-move-right" disabled title="Move page right">${icon("arrow")}</button>
          <button class="icon-btn danger-icon" id="pdf-delete-page" disabled title="Delete page">${icon("trash")}</button>
        </div>
      </aside>

      <section class="pdf-workspace">
        <div class="pdf-toolbar pdf-edit-toolbar">
          <div class="pdf-tool-group">
            <button class="pdf-mode active" data-pdf-tool="select">${icon("pencil")}<span>Select</span></button>
            <button class="pdf-mode" data-pdf-tool="text">${icon("text")}<span>Text</span></button>
            <button class="pdf-mode" data-pdf-tool="highlight">${icon("highlight")}<span>Highlight</span></button>
            <button class="pdf-mode" data-pdf-tool="rectangle">${icon("rectangle")}<span>Shape</span></button>
            <button class="pdf-mode" data-pdf-tool="draw">${icon("draw")}<span>Draw</span></button>
          </div>
          <div class="pdf-tool-group">
            <button class="icon-btn" id="pdf-zoom-out" title="Zoom out" disabled>${icon("zoom_out")}</button>
            <span id="pdf-zoom-label">100%</span>
            <button class="icon-btn" id="pdf-zoom-in" title="Zoom in" disabled>${icon("zoom_in")}</button>
            <button class="secondary compact" id="pdf-fit" disabled>${icon("aspect_ratio")}<span>Fit</span></button>
            <button class="icon-btn" id="pdf-rotate" title="Rotate page" disabled>${icon("refresh")}</button>
          </div>
        </div>

        <div class="pdf-page-nav">
          <button class="icon-btn" id="pdf-prev" title="Previous page" disabled>${icon("arrow-left")}</button>
          <label class="pdf-page-control"><input id="pdf-page" type="number" min="1" value="1" disabled><span>/ <b id="pdf-pages">—</b></span></label>
          <button class="icon-btn" id="pdf-next" title="Next page" disabled>${icon("arrow")}</button>
          <span class="pdf-page-name" id="pdf-page-status">Open a PDF</span>
        </div>

        <div id="pdf-stage" class="pdf-stage">
          <div class="pdf-welcome">
            <div class="pdf-welcome-icon">${icon("picture_as_pdf")}</div>
            <h2>Open a PDF</h2>
            <p>Annotate, rearrange and export your PDF directly in the browser.</p>
            <label class="primary pdf-open">${icon("upload")} Choose PDF<input id="pdf-file-empty" type="file" accept="application/pdf,.pdf" hidden></label>
            <div class="pdf-welcome-pills"><span>Text</span><span>Highlight</span><span>Draw</span><span>Pages</span></div>
          </div>
        </div>
      </section>

      <aside class="pdf-properties">
        <div class="pdf-properties-head"><div><p class="eyebrow">PDF Studio</p><h2>Edit</h2></div><span class="pdf-live-badge">LIVE</span></div>

        <section class="pdf-prop-card">
          <div class="pdf-prop-title"><strong>Quick add</strong><span>on-page tools</span></div>
          <label class="pdf-field"><span>Text</span><input id="pdf-text-value" type="text" placeholder="Type text to place"></label>
          <div class="pdf-fields-2">
            <label class="pdf-field"><span>Size</span><input id="pdf-text-size" type="number" min="8" max="72" value="18"></label>
            <label class="pdf-field"><span>Color</span><input id="pdf-color" type="color" value="#6750A4"></label>
          </div>
          <button class="secondary pdf-wide" id="pdf-add-text" disabled>${icon("add")} Add text at center</button>
        </section>

        <section class="pdf-prop-card">
          <div class="pdf-prop-title"><strong>Selected item</strong><span id="pdf-selection-label">Nothing selected</span></div>
          <div id="pdf-selection-empty" class="pdf-selection-empty">${icon("pencil")}<span>Select an annotation on the page to manage it.</span></div>
          <div id="pdf-selection-controls" class="pdf-selection-controls" hidden>
            <button class="secondary pdf-wide" id="pdf-delete-annotation">${icon("trash")} Delete annotation</button>
          </div>
        </section>

        <section class="pdf-prop-card">
          <div class="pdf-prop-title"><strong>Page</strong><span>current</span></div>
          <div class="pdf-page-stat"><span>Page</span><strong id="pdf-current-number">—</strong></div>
          <div class="pdf-page-stat"><span>Annotations</span><strong id="pdf-annotation-count">0</strong></div>
          <button class="secondary pdf-wide" id="pdf-rotate-page" disabled>${icon("refresh")} Rotate page 90°</button>
        </section>

        <section class="pdf-prop-card pdf-tip-card">
          <div class="pdf-tip-icon">${icon("info")}</div>
          <div><strong>Tip</strong><p>Choose a tool, then draw or click directly on the document. Everything stays local until you save.</p></div>
        </section>
      </aside>
    </div>
  </section>`;

  const $=s=>root.querySelector(s);
  const fileInput=$("#pdf-file");
  const emptyInput=$("#pdf-file-empty");
  const stage=$("#pdf-stage");
  const thumbList=$("#pdf-thumb-list");
  const pageInput=$("#pdf-page");
  const pagesLabel=$("#pdf-pages");
  const countLabel=$("#pdf-page-count");
  const pageStatus=$("#pdf-page-status");
  const currentNumber=$("#pdf-current-number");
  const annCount=$("#pdf-annotation-count");
  const selectionLabel=$("#pdf-selection-label");
  const selectionEmpty=$("#pdf-selection-empty");
  const selectionControls=$("#pdf-selection-controls");
  const colorInput=$("#pdf-color");
  const textValue=$("#pdf-text-value");
  const textSize=$("#pdf-text-size");
  const undoBtn=$("#pdf-undo");
  const redoBtn=$("#pdf-redo");
  const saveBtn=$("#pdf-save");
  const controls=[
    $("#pdf-prev"),$("#pdf-next"),$("#pdf-zoom-out"),$("#pdf-zoom-in"),$("#pdf-fit"),
    $("#pdf-rotate"),pageInput,$("#pdf-add-page"),$("#pdf-duplicate-page"),
    $("#pdf-move-left"),$("#pdf-move-right"),$("#pdf-delete-page"),$("#pdf-add-text"),$("#pdf-rotate-page"),saveBtn
  ];

  const clone=v=>JSON.parse(JSON.stringify(v));
  function snapshot(){return {pages:clone(pages),annotations:clone(annotations),pageIndex};}
  function restore(s){
    pages=clone(s.pages);annotations=clone(s.annotations);pageIndex=Math.max(0,Math.min(s.pageIndex,pages.length-1));
    selectedIndex=-1;
  }
  function pushHistory(){history.push(snapshot()); if(history.length>50)history.shift(); redoStack=[]; updateHistory();}
  function updateHistory(){undoBtn.disabled=!history.length;redoBtn.disabled=!redoStack.length;}

  function ready(){
    return !!pdfDoc && pages.length>0;
  }

  function updateControls(){
    const on=ready();
    controls.forEach(el=>{if(el)el.disabled=!on;});
    if(!on){
      countLabel.textContent="—";pagesLabel.textContent="—";pageStatus.textContent="Open a PDF";currentNumber.textContent="—";annCount.textContent="0";
      return;
    }
    pageInput.max=pages.length;
    pageInput.value=pageIndex+1;
    pagesLabel.textContent=pages.length;
    countLabel.textContent=pages.length;
    pageStatus.textContent=`Page ${pageIndex+1} · ${pages[pageIndex].srcIndex<0?"Blank page":"PDF page"}`;
    currentNumber.textContent=pageIndex+1;
    annCount.textContent=annotations[pageIndex]?.length||0;
    $("#pdf-move-left").disabled=pageIndex===0;
    $("#pdf-move-right").disabled=pageIndex===pages.length-1;
    $("#pdf-delete-page").disabled=pages.length<=1;
    $("#pdf-zoom-out").disabled=scale<=.5;
    $("#pdf-zoom-in").disabled=scale>=3;
    $("#pdf-add-text").disabled=false;
    saveBtn.disabled=false;
    $("#pdf-rotate-page").disabled=false;
    root.querySelectorAll(".pdf-thumb").forEach((el,i)=>el.classList.toggle("active",i===pageIndex));
    updateHistory();
    renderSelectionPanel();
  }

  function setTool(tool){
    activeTool=tool;
    root.querySelectorAll("[data-pdf-tool]").forEach(b=>b.classList.toggle("active",b.dataset.pdfTool===tool));
    stage.classList.toggle("pdf-tool-select",tool==="select");
    stage.classList.toggle("pdf-tool-draw",tool!=="select");
  }

  function getStagePoint(event){
    const wrap=stage.querySelector(".pdf-canvas-wrap");
    if(!wrap)return null;
    const r=wrap.getBoundingClientRect();
    const x=Math.max(0,Math.min(1,(event.clientX-r.left)/r.width));
    const y=Math.max(0,Math.min(1,(event.clientY-r.top)/r.height));
    return {x,y};
  }

  function annotationBounds(a){
    if(a.type==="draw" && a.points.length){
      const xs=a.points.map(p=>p.x),ys=a.points.map(p=>p.y);
      return {x:Math.min(...xs),y:Math.min(...ys),w:Math.max(...xs)-Math.min(...xs),h:Math.max(...ys)-Math.min(...ys)};
    }
    return {x:a.x,y:a.y,w:a.w||0,h:a.h||0};
  }

  function renderAnnotations(){
    const overlay=stage.querySelector(".pdf-annotation-layer");
    if(!overlay)return;
    overlay.innerHTML="";
    const list=annotations[pageIndex]||[];
    list.forEach((a,i)=>{
      const b=annotationBounds(a);
      if(a.type==="draw"){
        const svg=document.createElement("svg");
        svg.className="pdf-anno-draw";
        svg.setAttribute("viewBox","0 0 100 100");
        const path=document.createElementNS("http://www.w3.org/2000/svg","path");
        path.setAttribute("d",a.points.map((p,j)=>`${j?"L":"M"} ${p.x*100} ${p.y*100}`).join(" "));
        path.setAttribute("fill","none");
        path.setAttribute("stroke",a.color);
        path.setAttribute("stroke-width","0.45");
        path.setAttribute("stroke-linecap","round");
        path.setAttribute("stroke-linejoin","round");
        svg.appendChild(path);overlay.appendChild(svg);
      }else{
        const el=document.createElement("div");
        el.className=`pdf-annotation pdf-annotation-${a.type}`;
        el.dataset.anno=String(i);
        el.style.left=`${b.x*100}%`;el.style.top=`${b.y*100}%`;
        el.style.width=`${Math.max(b.w,.01)*100}%`;el.style.height=`${Math.max(b.h,.01)*100}%`;
        if(a.type==="text"){
          el.textContent=a.text;
          el.style.color=a.color;el.style.fontSize=`${Math.max(8,a.size||18)}px`;
        }else if(a.type==="highlight"){
          el.style.background=a.color;el.style.opacity=".28";
        }else if(a.type==="rectangle"){
          el.style.border=`2px solid ${a.color}`;
        }
        if(i===selectedIndex)el.classList.add("selected");
        overlay.appendChild(el);
      }
    });
  }

  function renderSelectionPanel(){
    const a=(annotations[pageIndex]||[])[selectedIndex];
    const has=!!a;
    selectionEmpty.hidden=has;selectionControls.hidden=!has;
    selectionLabel.textContent=has?`${a.type}`: "Nothing selected";
  }

  async function renderPage(){
    if(!ready()||destroyed)return;
    if(rendering){pendingRender=true;return;}
    rendering=true;
    try{
      const item=pages[pageIndex];
      let width=595,height=842;
      let canvas=document.createElement("canvas");
      canvas.className="pdf-canvas";
      if(item.srcIndex>=0){
        const page=await pdfDoc.getPage(item.srcIndex+1);
        const base=page.getViewport({scale:1,rotation:item.rotation});
        scale=Math.max(.5,Math.min(3,scale));
        const viewport=page.getViewport({scale,rotation:item.rotation});
        width=viewport.width;height=viewport.height;
        canvas.width=Math.ceil(width*window.devicePixelRatio);
        canvas.height=Math.ceil(height*window.devicePixelRatio);
        canvas.style.width=`${width}px`;canvas.style.height=`${height}px`;
        const wrap=document.createElement("div");wrap.className="pdf-canvas-wrap";wrap.style.width=`${width}px`;wrap.style.height=`${height}px`;
        wrap.appendChild(canvas);
        const overlay=document.createElement("div");overlay.className="pdf-annotation-layer";overlay.style.width=`${width}px`;overlay.style.height=`${height}px`;
        wrap.appendChild(overlay);stage.replaceChildren(wrap);
        const ctx=canvas.getContext("2d",{alpha:false});
        const dpr=Math.min(window.devicePixelRatio||1,2);
        canvas.width=Math.ceil(viewport.width*dpr);canvas.height=Math.ceil(viewport.height*dpr);
        await page.render({canvasContext:ctx,viewport,transform:dpr!==1?[dpr,0,0,dpr,0,0]:null}).promise;
      }else{
        width=595*scale;height=842*scale;
        canvas.width=Math.ceil(width*window.devicePixelRatio);canvas.height=Math.ceil(height*window.devicePixelRatio);
        canvas.style.width=`${width}px`;canvas.style.height=`${height}px`;
        const wrap=document.createElement("div");wrap.className="pdf-canvas-wrap pdf-blank-page";wrap.style.width=`${width}px`;wrap.style.height=`${height}px`;
        wrap.appendChild(canvas);const overlay=document.createElement("div");overlay.className="pdf-annotation-layer";overlay.style.width=`${width}px`;overlay.style.height=`${height}px`;wrap.appendChild(overlay);stage.replaceChildren(wrap);
        const ctx=canvas.getContext("2d");ctx.fillStyle="#fff";ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.strokeStyle="#ddd";ctx.strokeRect(0,0,canvas.width-1,canvas.height-1);
      }
      renderAnnotations();
      stage.scrollTop=0;stage.scrollLeft=0;
      updateControls();
    }catch(error){
      stage.innerHTML=`<div class="pdf-error">${icon("info")}<h3>Page couldn't render</h3><p>${escapeHtml(error?.message||String(error))}</p></div>`;
    }finally{
      rendering=false;
      if(pendingRender){pendingRender=false;renderPage();}
    }
  }

  async function makeThumbnails(){
    thumbList.innerHTML="";
    for(let i=0;i<pages.length;i++){
      if(destroyed)return;
      const item=pages[i];
      const button=document.createElement("button");
      button.className="pdf-thumb";button.dataset.page=i;button.setAttribute("aria-label",`Page ${i+1}`);
      const frame=document.createElement("span");frame.className="pdf-thumb-frame";
      const canvas=document.createElement("canvas");
      const size=86;
      if(item.srcIndex>=0){
        const page=await pdfDoc.getPage(item.srcIndex+1);
        const viewport=page.getViewport({scale:size/Math.max(page.view[2]-page.view[0],page.view[3]-page.view[1]),rotation:item.rotation});
        canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
        await page.render({canvasContext:canvas.getContext("2d",{alpha:false}),viewport}).promise;
      }else{
        canvas.width=60;canvas.height=82;const ctx=canvas.getContext("2d");ctx.fillStyle="#fff";ctx.fillRect(0,0,60,82);ctx.strokeStyle="#ddd";ctx.strokeRect(0,0,59,81);
      }
      frame.appendChild(canvas);
      const label=document.createElement("span");label.textContent=i+1;
      button.append(frame,label);
      button.addEventListener("click",()=>{pageIndex=i;selectedIndex=-1;renderPage();});
      thumbList.appendChild(button);
    }
    updateControls();
  }

  async function openFile(file){
    if(!file)return;
    if(file.type!=="application/pdf"&&!/\.pdf$/i.test(file.name)){
      stage.innerHTML=`<div class="pdf-error">${icon("info")}<h3>That isn't a PDF</h3><p>Please choose a PDF document.</p></div>`;return;
    }
    try{
      const pdfjs=await loadPdfJs();
      sourceBytes=new Uint8Array(await file.arrayBuffer());
      pdfDoc=await pdfjs.getDocument({data:sourceBytes}).promise;
      pages=Array.from({length:pdfDoc.numPages},(_,i)=>({srcIndex:i,rotation:0}));
      annotations=Array.from({length:pdfDoc.numPages},()=>[]);
      pageIndex=0;scale=1;history=[];redoStack=[];selectedIndex=-1;
      await makeThumbnails();await renderPage();updateControls();
    }catch(error){
      pdfDoc=null;sourceBytes=null;pages=[];annotations=[];
      stage.innerHTML=`<div class="pdf-error">${icon("info")}<h3>PDF couldn't be opened</h3><p>${escapeHtml(error?.message||String(error))}</p></div>`;
      updateControls();
    }
  }

  function addTextAt(x=.5,y=.5){
    const text=textValue.value.trim()||"Toolzy";
    const size=Math.max(8,Math.min(72,Number(textSize.value)||18));
    pushHistory();
    annotations[pageIndex].push({type:"text",text,size,color:colorInput.value,x:Math.max(0,Math.min(.9,x)),y:Math.max(0,Math.min(.96,y)),w:Math.min(.9,Math.max(.08,text.length*.012)),h:.035});
    selectedIndex=annotations[pageIndex].length-1;
    renderAnnotations();updateControls();
  }

  function commitDrag(state){
    if(!state)return;
    const x=Math.min(state.start.x,state.end.x),y=Math.min(state.start.y,state.end.y);
    const w=Math.abs(state.end.x-state.start.x),h=Math.abs(state.end.y-state.start.y);
    if(state.type!=="draw" && (w<.005||h<.005))return;
    pushHistory();
    if(state.type==="draw"){
      if(state.points.length<2)return;
      annotations[pageIndex].push({type:"draw",points:state.points,color:colorInput.value});
    }else{
      annotations[pageIndex].push({type:state.type,x,y,w,h,color:colorInput.value});
    }
    selectedIndex=annotations[pageIndex].length-1;
    renderAnnotations();updateControls();
  }

  stage.addEventListener("pointerdown",e=>{
    if(!ready())return;
    const p=getStagePoint(e);if(!p)return;
    const wrap=stage.querySelector(".pdf-canvas-wrap");wrap?.setPointerCapture?.(e.pointerId);
    if(activeTool==="select"){
      let hit=-1;
      for(let i=annotations[pageIndex].length-1;i>=0;i--){
        const b=annotationBounds(annotations[pageIndex][i]);
        if(p.x>=b.x-.01&&p.x<=b.x+b.w+.01&&p.y>=b.y-.01&&p.y<=b.y+b.h+.01){hit=i;break;}
      }
      selectedIndex=hit;renderAnnotations();renderSelectionPanel();return;
    }
    if(activeTool==="text"){addTextAt(p.x,p.y);return;}
    dragState={type:activeTool,start:p,end:p,points:[p]};
  });
  stage.addEventListener("pointermove",e=>{
    if(!dragState)return;
    const p=getStagePoint(e);if(!p)return;
    dragState.end=p;dragState.points.push(p);
    const overlay=stage.querySelector(".pdf-annotation-layer");if(!overlay)return;
    renderAnnotations();
    if(dragState.type==="draw"){
      const temp={type:"draw",points:dragState.points,color:colorInput.value};
      const old=annotations[pageIndex];annotations[pageIndex]=[...old,temp];renderAnnotations();annotations[pageIndex]=old;
    }else{
      const x=Math.min(dragState.start.x,p.x),y=Math.min(dragState.start.y,p.y),w=Math.abs(p.x-dragState.start.x),h=Math.abs(p.y-dragState.start.y);
      const old=annotations[pageIndex];annotations[pageIndex]=[...old,{type:dragState.type,x,y,w,h,color:colorInput.value}];renderAnnotations();annotations[pageIndex]=old;
    }
  });
  stage.addEventListener("pointerup",()=>{
    if(!dragState)return;const state=dragState;dragState=null;commitDrag(state);
  });
  stage.addEventListener("pointercancel",()=>{dragState=null;renderAnnotations();});

  root.querySelectorAll("[data-pdf-tool]").forEach(b=>b.addEventListener("click",()=>setTool(b.dataset.pdfTool)));
  $("#pdf-add-text").addEventListener("click",()=>addTextAt(.5,.5));
  $("#pdf-delete-annotation").addEventListener("click",()=>{
    if(selectedIndex<0)return;pushHistory();annotations[pageIndex].splice(selectedIndex,1);selectedIndex=-1;renderAnnotations();updateControls();
  });
  document.addEventListener("keydown",e=>{
    if(destroyed)return;
    if((e.key==="Delete"||e.key==="Backspace")&&selectedIndex>=0&&document.activeElement?.tagName!=="INPUT"&&document.activeElement?.tagName!=="TEXTAREA") $("#pdf-delete-annotation").click();
  });

  $("#pdf-prev").onclick=()=>{if(pageIndex>0){pageIndex--;selectedIndex=-1;renderPage();}};
  $("#pdf-next").onclick=()=>{if(pageIndex<pages.length-1){pageIndex++;selectedIndex=-1;renderPage();}};
  pageInput.onchange=()=>{const n=Math.max(1,Math.min(pages.length,Number(pageInput.value)||1));pageIndex=n-1;selectedIndex=-1;renderPage();};
  $("#pdf-zoom-out").onclick=()=>{scale=Math.max(.5,Math.round((scale-.1)*10)/10);renderPage();};
  $("#pdf-zoom-in").onclick=()=>{scale=Math.min(3,Math.round((scale+.1)*10)/10);renderPage();};
  $("#pdf-fit").onclick=async()=>{
    const item=pages[pageIndex];if(item.srcIndex<0){scale=1;return renderPage();}
    const page=await pdfDoc.getPage(item.srcIndex+1);const viewport=page.getViewport({scale:1,rotation:item.rotation});
    scale=Math.max(.5,Math.min(2.5,(stage.clientWidth-56)/viewport.width));renderPage();
  };
  const rotateCurrent=()=>{pushHistory();pages[pageIndex].rotation=(pages[pageIndex].rotation+90)%360;selectedIndex=-1;renderPage();makeThumbnails();};
  $("#pdf-rotate").onclick=rotateCurrent;$("#pdf-rotate-page").onclick=rotateCurrent;

  $("#pdf-add-page").onclick=()=>{pushHistory();pages.splice(pageIndex+1,0,{srcIndex:-1,rotation:0});annotations.splice(pageIndex+1,0,[]);pageIndex++;selectedIndex=-1;makeThumbnails();renderPage();};
  $("#pdf-duplicate-page").onclick=()=>{pushHistory();pages.splice(pageIndex+1,0,clone(pages[pageIndex]));annotations.splice(pageIndex+1,0,clone(annotations[pageIndex]));pageIndex++;selectedIndex=-1;makeThumbnails();renderPage();};
  $("#pdf-delete-page").onclick=()=>{
    if(pages.length<=1)return;pushHistory();pages.splice(pageIndex,1);annotations.splice(pageIndex,1);pageIndex=Math.min(pageIndex,pages.length-1);selectedIndex=-1;makeThumbnails();renderPage();
  };
  $("#pdf-move-left").onclick=()=>{
    if(pageIndex<=0)return;pushHistory();[pages[pageIndex-1],pages[pageIndex]]=[pages[pageIndex],pages[pageIndex-1]];[annotations[pageIndex-1],annotations[pageIndex]]=[annotations[pageIndex],annotations[pageIndex-1]];pageIndex--;selectedIndex=-1;makeThumbnails();renderPage();
  };
  $("#pdf-move-right").onclick=()=>{
    if(pageIndex>=pages.length-1)return;pushHistory();[pages[pageIndex+1],pages[pageIndex]]=[pages[pageIndex],pages[pageIndex+1]];[annotations[pageIndex+1],annotations[pageIndex]]=[annotations[pageIndex],annotations[pageIndex+1]];pageIndex++;selectedIndex=-1;makeThumbnails();renderPage();
  };
  undoBtn.onclick=()=>{const cur=snapshot();const prev=history.pop();redoStack.push(cur);restore(prev);makeThumbnails();renderPage();updateHistory();};
  redoBtn.onclick=()=>{const cur=snapshot();const next=redoStack.pop();history.push(cur);restore(next);makeThumbnails();renderPage();updateHistory();};

  async function exportPdf(){
    if(!ready()||!sourceBytes)return;
    const old=saveBtn.innerHTML;saveBtn.disabled=true;saveBtn.innerHTML=`${icon("refresh")} Exporting…`;
    try{
      const [{PDFDocument,rgb,degrees,StandardFonts}]=[await loadPdfLib()];
      const src=await PDFDocument.load(sourceBytes);
      const out=await PDFDocument.create();
      const font=await out.embedFont(StandardFonts.Helvetica);
      for(let i=0;i<pages.length;i++){
        const item=pages[i];
        let outPage;
        let sourcePageInfo=null;
        if(item.srcIndex>=0){
          const sourcePage=src.getPage(item.srcIndex);
          sourcePageInfo={width:sourcePage.getSize().width,height:sourcePage.getSize().height,rotation:sourcePage.getRotation().angle};
          const copied=await out.copyPages(src,[item.srcIndex]);
          outPage=copied[0];out.addPage(outPage);
          const finalRotation=((sourcePageInfo.rotation||0)+item.rotation)%360;
          outPage.setRotation(degrees(finalRotation));
        }else{
          outPage=out.addPage([595,842]);sourcePageInfo={width:595,height:842,rotation:0};
        }
        const baseW=sourcePageInfo.width,baseH=sourcePageInfo.height;
        const displayRotation=((sourcePageInfo.rotation||0)+item.rotation)%360;
        const invPoint=(nx,ny)=>{
          const wd=(displayRotation===90||displayRotation===270)?baseH:baseW;
          const hd=(displayRotation===90||displayRotation===270)?baseW:baseH;
          const x=nx*wd,y=ny*hd;
          if(displayRotation===90)return {x:y,y:baseH-x};
          if(displayRotation===180)return {x:baseW-x,y:baseH-y};
          if(displayRotation===270)return {x:baseW-y,y:x};
          return {x,y};
        };
        for(const a of annotations[i]||[]){
          if(a.type==="draw"){
            for(let j=1;j<a.points.length;j++){
              const p1=invPoint(a.points[j-1].x,a.points[j-1].y),p2=invPoint(a.points[j].x,a.points[j].y);
              outPage.drawLine({start:{x:p1.x,y:baseH-p1.y},end:{x:p2.x,y:baseH-p2.y},thickness:2,color:hexToRgb(a.color)});
            }
          }else if(a.type==="text"){
            const p=invPoint(a.x,a.y);const size=Math.max(8,Math.min(72,a.size||18));
            outPage.drawText(a.text,{x:p.x,y:baseH-invPoint(a.x,a.y+a.h).y-size*.15,size,font,color:hexToRgb(a.color)});
          }else{
            const p1=invPoint(a.x,a.y),p2=invPoint(a.x+a.w,a.y+a.h);
            const x=Math.min(p1.x,p2.x),yTop=Math.min(p1.y,p2.y),w=Math.abs(p2.x-p1.x),h=Math.abs(p2.y-p1.y);
            if(a.type==="highlight")outPage.drawRectangle({x,y:baseH-yTop-h,width:w,height:h,color:hexToRgb(a.color),opacity:.25});
            if(a.type==="rectangle")outPage.drawRectangle({x,y:baseH-yTop-h,width:w,height:h,borderColor:hexToRgb(a.color),borderWidth:2});
          }
        }
      }
      const bytes=await out.save();
      const blob=new Blob([bytes],{type:"application/pdf"});
      const url=URL.createObjectURL(blob);
      const a=document.createElement("a");a.href=url;a.download="toolzy-edited.pdf";document.body.appendChild(a);a.click();a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),1500);
      pageStatus.textContent=`Exported · ${pages.length} pages`;
    }catch(error){
      pageStatus.textContent="Export failed";console.error("PDF export failed:",error);
    }finally{saveBtn.innerHTML=old;saveBtn.disabled=!ready();updateControls();}
  }
  saveBtn.onclick=exportPdf;
  fileInput.addEventListener("change",()=>openFile(fileInput.files?.[0]));
  emptyInput.addEventListener("change",()=>openFile(emptyInput.files?.[0]));
  setTool("select");
  updateControls();

  root._cleanup=()=>{destroyed=true;pdfDoc=null;sourceBytes=null;pages=[];annotations=[];history=[];redoStack=[];};
}

function hexToRgb(hex){
  const h=String(hex||"#6750A4").replace("#","");
  const n=parseInt(h.length===3?h.split("").map(x=>x+x).join(""):h,16);
  return {red:((n>>16)&255)/255,green:((n>>8)&255)/255,blue:(n&255)/255};
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
