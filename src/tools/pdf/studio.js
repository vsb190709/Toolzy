import { icon } from "../../core/icons.js";
import { navigate } from "../../core/router.js";

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
  let sourceName="document.pdf";
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
  let textEditor=null;
  let thumbObserver=null;

  root.innerHTML=`
  <section class="pdf-studio pdf-studio-137">
<aside class="pdf-app-rail" aria-label="PDF tools">
  <button class="pdf-rail-brand" id="pdf-rail-home" title="Back to Toolzy">${icon("pdf")}</button>
  <button class="pdf-rail-item" data-pdf-panel="compress" title="Compress">${icon("compress")}<span>Compress</span></button>
  <button class="pdf-rail-item" data-pdf-panel="convert" title="Convert">${icon("swap")}<span>Convert</span></button>
  <button class="pdf-rail-item" data-pdf-panel="organize" title="Organize">${icon("layers")}<span>Organize</span></button>
  <button class="pdf-rail-item active" data-pdf-panel="edit" title="Edit">${icon("pencil")}<span>Edit</span></button>
  <button class="pdf-rail-item" data-pdf-panel="sign" title="Sign">${icon("edit")}<span>Sign</span></button>
  <button class="pdf-rail-item" data-pdf-panel="ai" title="AI PDF">${icon("auto_awesome")}<span>AI PDF</span></button>
  <span class="pdf-rail-spacer"></span>
  <button class="pdf-rail-item" data-pdf-panel="more" title="More">${icon("more")}<span>More</span></button>
</aside>
    <header class="pdf-studio-bar">
      <div class="pdf-studio-brand">
        <button class="pdf-exit" id="pdf-exit" title="Back to Toolzy">${icon("arrow-left")}</button>
        <span class="pdf-studio-icon">${icon("picture_as_pdf")}</span>
        <div class="pdf-studio-brand-copy">
          <div class="pdf-studio-brand-row"><strong>PDF Studio</strong><span class="pdf-137-badge">1.37</span></div>
          <small id="pdf-document-name">No document open</small>
        </div>
      </div>
      <div class="pdf-studio-actions">
        <button class="secondary pdf-top-btn" id="pdf-undo" disabled title="Undo">${icon("undo")}<span>Undo</span></button>
        <button class="secondary pdf-top-btn" id="pdf-redo" disabled title="Redo">${icon("redo")}<span>Redo</span></button>
        <label class="secondary pdf-open">${icon("upload")}<span>Open</span><input id="pdf-file" type="file" accept="application/pdf,.pdf" hidden></label>
        <button class="pdf-top-icon" id="pdf-cloud" title="Local document status">${icon("cloud")}</button>
        <button class="secondary pdf-share" id="pdf-share" title="Share PDF">${icon("share")}<span>Share</span></button>
        <button class="primary pdf-save" id="pdf-save" disabled>${icon("download")}<span>Download</span></button>
        <button class="pdf-finish" id="pdf-finish" title="Finish editing">${icon("check")}<span>Finish</span>${icon("arrow-right")}</button>
      </div>
    </header>

    <div class="pdf-studio-137-layout">
      <aside class="pdf-pages-panel">
        <div class="pdf-panel-head pdf-pages-head">
          <div><strong>Pages</strong><small id="pdf-page-count">—</small></div>
          <button class="icon-btn" id="pdf-page-more" disabled title="Page actions">${icon("more")}</button>
        </div>
        <div class="pdf-page-actions">
          <button class="secondary compact" id="pdf-add-page" disabled>${icon("add")} Add</button>
          <button class="secondary compact" id="pdf-duplicate-page" disabled>${icon("copy")} Duplicate</button>
        </div>
        <div class="pdf-thumb-list" id="pdf-thumb-list">
          <div class="pdf-empty-small">${icon("picture_as_pdf")}<strong>No PDF loaded</strong><span>Open a PDF to manage its pages</span></div>
        </div>
        <div class="pdf-panel-bottom">
          <button class="icon-btn" id="pdf-move-left" disabled title="Move page left">${icon("arrow-left")}</button>
          <button class="icon-btn" id="pdf-move-right" disabled title="Move page right">${icon("arrow")}</button>
          <button class="icon-btn danger-icon" id="pdf-delete-page" disabled title="Delete page">${icon("trash")}</button>
        </div>
      </aside>

      <section class="pdf-workspace">
        <div class="pdf-edit-toolbar">
          <div class="pdf-tool-strip" role="toolbar" aria-label="PDF editing tools">
            <button class="pdf-mode active" data-pdf-tool="select" title="Select and move annotations">${icon("pencil")}<span>Select</span></button>
            <button class="pdf-mode" data-pdf-tool="text" title="Click the page and type">${icon("text")}<span>Edit Text</span></button>
            <button class="pdf-mode" data-pdf-tool="highlight" title="Drag across an area to highlight">${icon("highlight")}<span>Highlight</span></button>
            <button class="pdf-mode" data-pdf-tool="rectangle" title="Draw a rectangle">${icon("rectangle")}<span>Shape</span></button>
            <button class="pdf-mode" data-pdf-tool="draw" title="Draw freehand">${icon("draw")}<span>Draw</span></button>
          </div>
          <div class="pdf-tool-strip pdf-view-tools">
            <button class="icon-btn" id="pdf-zoom-out" disabled title="Zoom out">${icon("zoom_out")}</button>
            <span id="pdf-zoom-label">100%</span>
            <button class="icon-btn" id="pdf-zoom-in" disabled title="Zoom in">${icon("zoom_in")}</button>
            <button class="secondary compact" id="pdf-fit" disabled>${icon("aspect_ratio")}<span>Fit</span></button>
            <button class="icon-btn" id="pdf-rotate" disabled title="Rotate current page">${icon("refresh")}</button>
          </div>
        </div>

        <div class="pdf-page-nav">
          <div class="pdf-page-nav-main">
            <button class="icon-btn" id="pdf-prev" title="Previous page" disabled>${icon("arrow-left")}</button>
            <label class="pdf-page-control"><input id="pdf-page" type="number" min="1" value="1" disabled><span>/ <b id="pdf-pages">—</b></span></label>
            <button class="icon-btn" id="pdf-next" title="Next page" disabled>${icon("arrow")}</button>
          </div>
          <div class="pdf-page-status" id="pdf-page-status">Open a PDF to begin</div>
          <div class="pdf-page-nav-actions">
            <button class="secondary compact" id="pdf-insert-text" disabled>${icon("add")} Insert text</button>
          </div>
        </div>

        <div id="pdf-stage" class="pdf-stage">
          <div class="pdf-welcome">
            <div class="pdf-welcome-icon">${icon("picture_as_pdf")}</div>
            <p class="eyebrow">TOOLZY · PDF STUDIO</p>
            <h2>Bring a PDF into the workspace.</h2>
            <p>Type directly on the page, mark it up, rearrange pages and export the edited document.</p>
            <label class="primary pdf-open pdf-welcome-open">${icon("upload")} Choose PDF<input id="pdf-file-empty" type="file" accept="application/pdf,.pdf" hidden></label>
            <div class="pdf-welcome-pills"><span>${icon("text")} Type</span><span>${icon("highlight")} Mark up</span><span>${icon("layers")} Manage pages</span><span>${icon("download")} Export</span></div>
          </div>
        </div>
      </section>

      <aside class="pdf-properties">
        <div class="pdf-properties-head">
          <div><p class="eyebrow">PDF Studio</p><h2>Inspector</h2></div>
          <span class="pdf-live-badge">LOCAL</span>
        </div>

        <section class="pdf-prop-card pdf-text-card">
          <div class="pdf-prop-title"><div><strong>Text</strong><span id="pdf-text-help">Select Text or click the page</span></div></div>
          <label class="pdf-field"><span>Content</span><textarea id="pdf-edit-text" rows="4" placeholder="Select a text annotation"></textarea></label>
          <div class="pdf-fields-2">
            <label class="pdf-field"><span>Size</span><input id="pdf-text-size" type="number" min="8" max="96" value="18"></label>
            <label class="pdf-field"><span>Color</span><input id="pdf-color" type="color" value="#6750A4"></label>
          </div>
          <div class="pdf-fields-2">
            <label class="pdf-field"><span>Font</span>
              <select id="pdf-font">
                <option value="Helvetica">Helvetica</option>
                <option value="TimesRoman">Times Roman</option>
                <option value="Courier">Courier</option>
              </select>
            </label>
            <label class="pdf-field"><span>Style</span>
              <select id="pdf-font-style">
                <option value="regular">Regular</option>
                <option value="bold">Bold</option>
                <option value="italic">Italic</option>
                <option value="boldItalic">Bold italic</option>
              </select>
            </label>
          </div>
          <div class="pdf-text-actions">
            <button class="secondary pdf-wide" id="pdf-add-text" disabled>${icon("add")} New text box</button>
          </div>
          <div class="pdf-inline-tip">${icon("info")} Click Text, click the page and type. Ctrl/Cmd + Enter saves the box; Esc cancels it.</div>
        </section>

        <section class="pdf-prop-card">
          <div class="pdf-prop-title"><div><strong>Selection</strong><span id="pdf-selection-label">Nothing selected</span></div></div>
          <div id="pdf-selection-empty" class="pdf-selection-empty">${icon("pencil")}<span>Use Select to move or edit an annotation.</span></div>
          <div id="pdf-selection-controls" class="pdf-selection-controls" hidden>
            <button class="secondary pdf-wide" id="pdf-delete-annotation">${icon("trash")} Delete selected</button>
          </div>
        </section>

        <section class="pdf-prop-card">
          <div class="pdf-prop-title"><div><strong>Page</strong><span>current</span></div></div>
          <div class="pdf-page-stat"><span>Page</span><strong id="pdf-current-number">—</strong></div>
          <div class="pdf-page-stat"><span>Annotations</span><strong id="pdf-annotation-count">0</strong></div>
          <button class="secondary pdf-wide" id="pdf-rotate-page" disabled>${icon("refresh")} Rotate page 90°</button>
        </section>

        <section class="pdf-prop-card pdf-help-card">
          <div class="pdf-help-row"><span class="pdf-help-key">${icon("text")}</span><div><strong>Text tool</strong><p>Click the document, type, then press Done.</p></div></div>
          <div class="pdf-help-row"><span class="pdf-help-key">${icon("pencil")}</span><div><strong>Select tool</strong><p>Drag an annotation to move it. Double-click text to edit.</p></div></div>
          <div class="pdf-help-row"><span class="pdf-help-key">⌘</span><div><strong>Undo / Redo</strong><p>Use the top controls to step through edits.</p></div></div>
        </section>
      </aside>
    </div>
  </section>`;

  const $=s=>root.querySelector(s);
  $("#pdf-exit").addEventListener("click",()=>navigate("/"));
  $("#pdf-rail-home")?.addEventListener("click",()=>navigate("/"));
  $("#pdf-finish")?.addEventListener("click",()=>navigate("/"));
  $("#pdf-cloud")?.addEventListener("click",()=>{pageStatus.textContent=sourceBytes?"PDF is kept locally in this browser.":"No PDF is open.";});
  $("#pdf-properties-close")?.addEventListener("click",()=>{root.classList.remove("pdf-has-selection");});
  $("#pdf-share")?.addEventListener("click",async()=>{
    if(navigator.share){try{await navigator.share({title:sourceName,text:"PDF edited in Toolzy PDF Studio"});return;}catch{}}
    pageStatus.textContent="Sharing is available when the browser supports it.";
  });
  root.querySelectorAll("[data-pdf-panel]").forEach(btn=>btn.addEventListener("click",()=>{
    root.querySelectorAll("[data-pdf-panel]").forEach(x=>x.classList.remove("active"));
    btn.classList.add("active");
    const name=btn.dataset.pdfPanel;
    pageStatus.textContent=name==="edit"?"Editing tools ready":`${name[0].toUpperCase()+name.slice(1)} tools are next in PDF Studio.`;
  }));

  const fileInput=$("#pdf-file");
  const emptyInput=$("#pdf-file-empty");
  const stage=$("#pdf-stage");
  const thumbList=$("#pdf-thumb-list");
  const pageInput=$("#pdf-page");
  const pagesLabel=$("#pdf-pages");
  const countLabel=$("#pdf-page-count");
  const pageStatus=$("#pdf-page-status");
  const documentName=$("#pdf-document-name");
  const currentNumber=$("#pdf-current-number");
  const annCount=$("#pdf-annotation-count");
  const selectionLabel=$("#pdf-selection-label");
  const selectionEmpty=$("#pdf-selection-empty");
  const selectionControls=$("#pdf-selection-controls");
  const editText=$("#pdf-edit-text");
  const textSize=$("#pdf-text-size");
  const colorInput=$("#pdf-color");
  const fontInput=$("#pdf-font");
  const fontStyleInput=$("#pdf-font-style");
  const undoBtn=$("#pdf-undo");
  const redoBtn=$("#pdf-redo");
  const saveBtn=$("#pdf-save");
  const zoomLabel=$("#pdf-zoom-label");

  const controls=[
    $("#pdf-prev"),$("#pdf-next"),$("#pdf-zoom-out"),$("#pdf-zoom-in"),$("#pdf-fit"),
    $("#pdf-rotate"),pageInput,$("#pdf-add-page"),$("#pdf-duplicate-page"),
    $("#pdf-move-left"),$("#pdf-move-right"),$("#pdf-delete-page"),$("#pdf-insert-text"),
    $("#pdf-add-text"),$("#pdf-rotate-page"),saveBtn,$("#pdf-page-more")
  ];

  const clone=v=>JSON.parse(JSON.stringify(v));
  const snapshot=()=>({pages:clone(pages),annotations:clone(annotations),pageIndex});
  function restore(s){
    pages=clone(s.pages);annotations=clone(s.annotations);
    pageIndex=Math.max(0,Math.min(s.pageIndex,pages.length-1));
    selectedIndex=-1;
  }
  function pushHistory(){
    history.push(snapshot());
    if(history.length>50)history.shift();
    redoStack=[];
    updateHistory();
  }
  function updateHistory(){undoBtn.disabled=!history.length;redoBtn.disabled=!redoStack.length;}
  function ready(){return !!pdfDoc&&pages.length>0;}

  function annotationBounds(a){
    if(a.type==="draw"&&a.points?.length){
      const xs=a.points.map(p=>p.x),ys=a.points.map(p=>p.y);
      return {x:Math.min(...xs),y:Math.min(...ys),w:Math.max(...xs)-Math.min(...xs),h:Math.max(...ys)-Math.min(...ys)};
    }
    return {x:a.x,y:a.y,w:a.w||.12,h:a.h||.04};
  }

  function colorAsCss(value){return value||"#6750A4";}

  function updateControls(){
    const on=ready();
    controls.forEach(el=>{if(el)el.disabled=!on;});
    undoBtn.disabled=!history.length;
    redoBtn.disabled=!redoStack.length;
    if(!on){
      countLabel.textContent="—";pagesLabel.textContent="—";pageStatus.textContent="Open a PDF to begin";
      currentNumber.textContent="—";annCount.textContent="0";
      return;
    }
    pageInput.max=pages.length;
    pageInput.value=pageIndex+1;
    pagesLabel.textContent=pages.length;
    countLabel.textContent=pages.length;
    pageStatus.textContent=`Page ${pageIndex+1} · ${pages[pageIndex].srcIndex<0?"Blank page":"PDF page"}`;
    currentNumber.textContent=pageIndex+1;
    annCount.textContent=(annotations[pageIndex]||[]).length;
    documentName.textContent=sourceName;
    $("#pdf-move-left").disabled=pageIndex===0;
    $("#pdf-move-right").disabled=pageIndex===pages.length-1;
    $("#pdf-delete-page").disabled=pages.length<=1;
    $("#pdf-zoom-out").disabled=scale<=.5;
    $("#pdf-zoom-in").disabled=scale>=3;
    zoomLabel.textContent=`${Math.round(scale*100)}%`;
    $("#pdf-insert-text").disabled=false;
    $("#pdf-add-text").disabled=false;
    $("#pdf-rotate-page").disabled=false;
    $("#pdf-page-more").disabled=false;
    saveBtn.disabled=false;
    root.querySelectorAll(".pdf-thumb").forEach((el,i)=>el.classList.toggle("active",i===pageIndex));
    updateHistory();
    syncSelectionPanel();
  }

  function setTool(tool){
    activeTool=tool;
    root.querySelectorAll("[data-pdf-tool]").forEach(b=>b.classList.toggle("active",b.dataset.pdfTool===tool));
    stage.dataset.pdfTool=tool;
    stage.classList.toggle("pdf-tool-text",tool==="text");
    stage.classList.toggle("pdf-tool-draw",tool==="draw"||tool==="highlight"||tool==="rectangle");
  }

  function getPageWrap(){
    return stage.querySelector(".pdf-canvas-wrap");
  }

  function getStagePoint(event){
    const wrap=getPageWrap();
    if(!wrap)return null;
    const rect=wrap.getBoundingClientRect();
    return {
      x:Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width)),
      y:Math.max(0,Math.min(1,(event.clientY-rect.top)/rect.height))
    };
  }

  function same(a,b){return JSON.stringify(a)===JSON.stringify(b);}

  function syncSelectionPanel(){
    const a=ready()?(annotations[pageIndex]||[])[selectedIndex]:null;
    const has=!!a;
    root.classList.toggle("pdf-has-selection",has);
    selectionEmpty.hidden=has;
    selectionControls.hidden=!has;
    selectionLabel.textContent=has?`${a.type}`:"Nothing selected";
    editText.disabled=!has||a.type!=="text";
    textSize.disabled=!has||a.type!=="text";
    colorInput.disabled=!has;
    fontInput.disabled=!has||a.type!=="text";
    fontStyleInput.disabled=!has||a.type!=="text";
    if(a?.type==="text"){
      editText.value=a.text||"";
      textSize.value=a.size||18;
      colorInput.value=a.color||"#6750A4";
      fontInput.value=a.font||"Helvetica";
      fontStyleInput.value=a.fontStyle||"regular";
    }else{
      editText.value="";
      $("#pdf-text-help").textContent=has?"Text settings appear for text annotations":"Select Text or click the page";
    }
    renderAnnotations();
  }

  function renderAnnotations(){
    const overlay=stage.querySelector(".pdf-annotation-layer");
    if(!overlay)return;
    overlay.replaceChildren();
    const list=annotations[pageIndex]||[];
    list.forEach((a,i)=>{
      const b=annotationBounds(a);
      if(a.type==="draw"){
        const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");
        svg.classList.add("pdf-anno-draw");
        svg.setAttribute("viewBox","0 0 100 100");
        svg.dataset.anno=String(i);
        const path=document.createElementNS("http://www.w3.org/2000/svg","path");
        path.setAttribute("d",a.points.map((p,j)=>`${j?"L":"M"} ${p.x*100} ${p.y*100}`).join(" "));
        path.setAttribute("fill","none");
        path.setAttribute("stroke",colorAsCss(a.color));
        path.setAttribute("stroke-width","0.42");
        path.setAttribute("stroke-linecap","round");
        path.setAttribute("stroke-linejoin","round");
        svg.appendChild(path);
        svg.style.pointerEvents=activeTool==="select"?"auto":"none";
        svg.addEventListener("pointerdown",e=>beginAnnotationDrag(e,i));
        if(i===selectedIndex)svg.classList.add("selected");
        overlay.appendChild(svg);
        return;
      }
      const el=document.createElement("div");
      el.className=`pdf-annotation pdf-annotation-${a.type}`;
      el.dataset.anno=String(i);
      el.style.left=`${b.x*100}%`;
      el.style.top=`${b.y*100}%`;
      el.style.width=`${Math.max(.012,b.w||.02)*100}%`;
      el.style.height=`${Math.max(.018,b.h||.03)*100}%`;
      el.style.setProperty("--anno-color",colorAsCss(a.color));
      if(a.type==="text"){
        el.textContent=a.text||"";
        el.style.color=colorAsCss(a.color);
        el.style.fontSize=`${Math.max(8,a.size||18)}px`;
        el.style.fontFamily=cssFontFamily(a.font);
        el.style.fontWeight=a.fontStyle==="bold"||a.fontStyle==="boldItalic"?"700":"400";
        el.style.fontStyle=a.fontStyle==="italic"||a.fontStyle==="boldItalic"?"italic":"normal";
        el.style.whiteSpace="pre-wrap";
      }else if(a.type==="highlight"){
        el.style.background=colorAsCss(a.color);
        el.style.opacity=".28";
      }else if(a.type==="rectangle"){
        el.style.border=`2px solid ${colorAsCss(a.color)}`;
      }
      if(i===selectedIndex)el.classList.add("selected");
      if(activeTool==="select")el.addEventListener("pointerdown",e=>beginAnnotationDrag(e,i));
      if(a.type==="text"&&activeTool==="select")el.addEventListener("dblclick",e=>{e.stopPropagation();startTextEditor(a.x,a.y,i);});
      overlay.appendChild(el);
    });
  }

  function cssFontFamily(font){
    if(font==="TimesRoman")return "Times New Roman, Times, serif";
    if(font==="Courier")return "Courier New, Courier, monospace";
    return "Arial, Helvetica, sans-serif";
  }

  function beginAnnotationDrag(event,index){
    if(activeTool!=="select")return;
    if(textEditor)commitTextEditor();
    event.stopPropagation();
    event.preventDefault();
    selectedIndex=index;
    syncSelectionPanel();
    const start=getStagePoint(event);
    if(!start)return;
    dragState={index,start,original:snapshot()};
    const target=event.currentTarget;
    try{target.setPointerCapture(event.pointerId)}catch{}
  }

  stage.addEventListener("pointermove",event=>{
    if(!dragState)return;
    const p=getStagePoint(event);if(!p)return;
    const a=annotations[pageIndex]?.[dragState.index];if(!a)return;
    const dx=p.x-dragState.start.x,dy=p.y-dragState.start.y;
    if(a.type==="draw"){
      a.points=a.points.map(pt=>({x:Math.max(0,Math.min(1,pt.x+dx)),y:Math.max(0,Math.min(1,pt.y+dy))}));
      dragState.start=p;
    }else{
      a.x=Math.max(0,Math.min(1-(a.w||.02),a.x+dx));
      a.y=Math.max(0,Math.min(1-(a.h||.02),a.y+dy));
      dragState.start=p;
    }
    renderAnnotations();
    syncSelectionPanelLight();
  });
  stage.addEventListener("pointerup",()=>{
    if(!dragState)return;
    const changed=!same(dragState.original.annotations,annotations);
    if(changed){history.push(dragState.original);if(history.length>50)history.shift();redoStack=[];}
    dragState=null;updateControls();
  });
  stage.addEventListener("pointercancel",()=>{dragState=null;renderAnnotations();});

  function syncSelectionPanelLight(){
    const a=annotations[pageIndex]?.[selectedIndex];
    if(a?.type==="text"){
      editText.value=a.text||"";textSize.value=a.size||18;colorInput.value=a.color||"#6750A4";
      fontInput.value=a.font||"Helvetica";fontStyleInput.value=a.fontStyle||"regular";
    }
  }

  function refreshStage(){
    renderAnnotations();
    updateControls();
  }

  function startTextEditor(x=.5,y=.5,index=-1){
    if(!ready())return;
    if(textEditor)commitTextEditor();
    const isExisting=index>=0;
    const original=isExisting?clone(annotations[pageIndex][index]):null;
    const draft={
      x:Math.max(0,Math.min(.78,x)),
      y:Math.max(0,Math.min(.92,y)),
      w:isExisting?annotations[pageIndex][index].w:.28,
      h:isExisting?annotations[pageIndex][index].h:.08,
      text:isExisting?annotations[pageIndex][index].text:"",
      size:isExisting?annotations[pageIndex][index].size:Number(textSize.value)||18,
      color:isExisting?annotations[pageIndex][index].color:colorInput.value,
      font:isExisting?annotations[pageIndex][index].font:fontInput.value,
      fontStyle:isExisting?annotations[pageIndex][index].fontStyle:fontStyleInput.value
    };
    const overlay=stage.querySelector(".pdf-annotation-layer");
    if(!overlay)return;
    const editor=document.createElement("div");
    editor.className="pdf-text-editor";
    editor.style.left=`${draft.x*100}%`;
    editor.style.top=`${draft.y*100}%`;
    editor.style.width=`${Math.max(.18,draft.w)*100}%`;
    editor.style.minHeight="54px";
    editor.innerHTML=`
      <textarea aria-label="PDF text editor" placeholder="Type here…"></textarea>
      <div class="pdf-text-editor-actions">
        <button type="button" class="secondary compact" data-editor-cancel>${icon("close")} Cancel</button>
        <button type="button" class="primary compact" data-editor-done>${icon("check")} Done</button>
      </div>`;
    const textarea=editor.querySelector("textarea");
    textarea.value=draft.text;
    textarea.style.fontSize=`${draft.size}px`;
    textarea.style.fontFamily=cssFontFamily(draft.font);
    textarea.style.fontWeight=draft.fontStyle==="bold"||draft.fontStyle==="boldItalic"?"700":"400";
    textarea.style.fontStyle=draft.fontStyle==="italic"||draft.fontStyle==="boldItalic"?"italic":"normal";
    textarea.style.color=draft.color;
    overlay.appendChild(editor);
    textEditor={editor,textarea,index,original,draft};
    textarea.addEventListener("input",()=>{
      draft.text=textarea.value;
      draft.h=Math.max(.06,Math.min(.4,.055+(textarea.scrollHeight/(getPageWrap()?.getBoundingClientRect().height||800))));
      textarea.style.height="auto";textarea.style.height=`${Math.max(54,textarea.scrollHeight)}px`;
    });
    const updateDraftFromPanel=()=>{
      draft.size=Math.max(8,Math.min(96,Number(textSize.value)||18));
      draft.color=colorInput.value;draft.font=fontInput.value;draft.fontStyle=fontStyleInput.value;
      textarea.style.fontSize=`${draft.size}px`;textarea.style.color=draft.color;textarea.style.fontFamily=cssFontFamily(draft.font);
      textarea.style.fontWeight=draft.fontStyle==="bold"||draft.fontStyle==="boldItalic"?"700":"400";
      textarea.style.fontStyle=draft.fontStyle==="italic"||draft.fontStyle==="boldItalic"?"italic":"normal";
    };
    editor.querySelector("[data-editor-done]").onclick=()=>commitTextEditor();
    editor.querySelector("[data-editor-cancel]").onclick=()=>cancelTextEditor();
    textarea.addEventListener("keydown",e=>{
      if(e.key==="Escape"){e.preventDefault();cancelTextEditor();return;}
      if((e.ctrlKey||e.metaKey)&&e.key==="Enter"){e.preventDefault();commitTextEditor();}
    });
    setTimeout(()=>{textarea.focus();textarea.setSelectionRange(textarea.value.length,textarea.value.length);},0);
    updateDraftFromPanel();
  }

  function commitTextEditor(){
    if(!textEditor)return;
    const t=textEditor;
    const text=t.textarea.value.trimEnd();
    if(!text.trim()){cancelTextEditor();return;}
    const next={type:"text",text,size:t.draft.size,color:t.draft.color,font:t.draft.font,fontStyle:t.draft.fontStyle,x:t.draft.x,y:t.draft.y,w:Math.max(.12,t.draft.w),h:Math.max(.055,t.draft.h)};
    if(t.index>=0){
      if(!same(annotations[pageIndex][t.index],next)){
        history.push(snapshot());if(history.length>50)history.shift();redoStack=[];
        annotations[pageIndex][t.index]=next;selectedIndex=t.index;
      }
    }else{
      pushHistory();
      annotations[pageIndex].push(next);
      selectedIndex=annotations[pageIndex].length-1;
    }
    t.editor.remove();textEditor=null;
    setTool("select");
    refreshStage();
  }

  function cancelTextEditor(){
    if(!textEditor)return;
    textEditor.editor.remove();textEditor=null;
    renderAnnotations();updateControls();
  }

  function handleOutsideEditor(event){
    if(!textEditor)return;
    if(event.target.closest(".pdf-text-editor"))return;
    commitTextEditor();
  }

  stage.addEventListener("pointerdown",event=>{
    if(textEditor){
      handleOutsideEditor(event);
      if(textEditor)return;
    }
    if(!ready())return;
    const point=getStagePoint(event);
    if(!point)return;
    if(activeTool==="select"){
      if(event.target.closest(".pdf-annotation"))return;
      selectedIndex=-1;syncSelectionPanel();return;
    }
    if(activeTool==="text"){
      if(event.target.closest(".pdf-annotation-text"))return;
      startTextEditor(point.x,point.y);
      return;
    }
    if(activeTool==="draw"||activeTool==="highlight"||activeTool==="rectangle"){
      dragState={tool:activeTool,start:point,end:point,points:[point]};
      try{getPageWrap()?.setPointerCapture(event.pointerId)}catch{}
    }
  });

  stage.addEventListener("pointermove",event=>{
    if(!dragState||!dragState.tool)return;
    const p=getStagePoint(event);if(!p)return;
    dragState.end=p;dragState.points.push(p);
    const overlay=stage.querySelector(".pdf-annotation-layer");if(!overlay)return;
    renderAnnotations();
    const list=annotations[pageIndex]||[];
    const temp=[];
    if(dragState.tool==="draw")temp.push({type:"draw",points:dragState.points,color:colorInput.value});
    else{
      const x=Math.min(dragState.start.x,p.x),y=Math.min(dragState.start.y,p.y),w=Math.abs(p.x-dragState.start.x),h=Math.abs(p.y-dragState.start.y);
      temp.push({type:dragState.tool,type:dragState.tool,x,y,w,h,color:colorInput.value});
    }
    annotations[pageIndex]=[...list,...temp];
    renderAnnotations();
    annotations[pageIndex]=list;
  });

  function finishDraw(){
    if(!dragState||!dragState.tool)return;
    const state=dragState;dragState=null;
    if(state.tool==="draw"){
      if(state.points.length<2){renderAnnotations();return;}
      pushHistory();
      annotations[pageIndex].push({type:"draw",points:state.points,color:colorInput.value});
    }else{
      const x=Math.min(state.start.x,state.end.x),y=Math.min(state.start.y,state.end.y),w=Math.abs(state.end.x-state.start.x),h=Math.abs(state.end.y-state.start.y);
      if(w<.01||h<.01){renderAnnotations();return;}
      pushHistory();
      annotations[pageIndex].push({type:state.tool,x,y,w,h,color:colorInput.value});
    }
    selectedIndex=annotations[pageIndex].length-1;
    setTool("select");
    refreshStage();
  }
  stage.addEventListener("pointerup",finishDraw);
  stage.addEventListener("pointercancel",()=>{dragState=null;renderAnnotations();});

  function lazyRenderThumbnails(){
    if(thumbObserver)thumbObserver.disconnect();
    thumbObserver=new IntersectionObserver(entries=>{
      for(const entry of entries){
        if(!entry.isIntersecting)continue;
        const button=entry.target;
        if(button.dataset.ready==="1")continue;
        renderThumbnail(Number(button.dataset.page)).catch(()=>{});
        button.dataset.ready="1";
        thumbObserver.unobserve(button);
      }
    },{root:thumbList,rootMargin:"320px"});
    thumbList.querySelectorAll(".pdf-thumb").forEach(b=>thumbObserver.observe(b));
  }

  async function renderThumbnail(i){
    const item=pages[i];if(!item)return;
    const button=thumbList.querySelector(`.pdf-thumb[data-page="${i}"]`);
    const canvas=button?.querySelector("canvas");if(!canvas)return;
    if(item.srcIndex<0){
      canvas.width=70;canvas.height=96;
      const ctx=canvas.getContext("2d");ctx.fillStyle="#fff";ctx.fillRect(0,0,70,96);ctx.strokeStyle="#d0ccd4";ctx.strokeRect(.5,.5,69,95);
      return;
    }
    const page=await pdfDoc.getPage(item.srcIndex+1);
    const max=88;
    const raw=page.getViewport({scale:1,rotation:item.rotation});
    const factor=max/Math.max(raw.width,raw.height);
    const viewport=page.getViewport({scale:factor,rotation:item.rotation});
    canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
    await page.render({canvasContext:canvas.getContext("2d",{alpha:false}),viewport}).promise;
  }

  async function makeThumbnails(){
    if(thumbObserver)thumbObserver.disconnect();
    thumbList.innerHTML="";
    for(let i=0;i<pages.length;i++){
      const button=document.createElement("button");
      button.className="pdf-thumb";
      button.dataset.page=i;
      button.setAttribute("aria-label",`Page ${i+1}`);
      const frame=document.createElement("span");frame.className="pdf-thumb-frame";
      const canvas=document.createElement("canvas");canvas.className="pdf-thumb-canvas";
      canvas.width=70;canvas.height=96;
      const label=document.createElement("span");label.textContent=i+1;
      frame.appendChild(canvas);button.append(frame,label);
      button.addEventListener("click",()=>{if(textEditor)commitTextEditor();pageIndex=i;selectedIndex=-1;renderPage();});
      thumbList.appendChild(button);
    }
    lazyRenderThumbnails();
    updateControls();
    for(const idx of [0,pageIndex]){
      if(idx>=0&&idx<pages.length){
        const b=thumbList.querySelector(`.pdf-thumb[data-page="${idx}"]`);
        if(b&&b.dataset.ready!=="1"){b.dataset.ready="1";renderThumbnail(idx).catch(()=>{});}
      }
    }
  }

  async function renderPage(){
    if(!ready()||destroyed)return;
    if(textEditor)commitTextEditor();
    if(rendering){pendingRender=true;return;}
    rendering=true;
    try{
      const item=pages[pageIndex];
      const wrap=document.createElement("div");
      wrap.className="pdf-canvas-wrap";
      let width=595,height=842;
      const dpr=Math.min(window.devicePixelRatio||1,2);
      const canvas=document.createElement("canvas");
      canvas.className="pdf-canvas";
      if(item.srcIndex>=0){
        const page=await pdfDoc.getPage(item.srcIndex+1);
        const viewport=page.getViewport({scale,rotation:item.rotation});
        width=viewport.width;height=viewport.height;
        canvas.width=Math.ceil(width*dpr);canvas.height=Math.ceil(height*dpr);
        canvas.style.width=`${width}px`;canvas.style.height=`${height}px`;
        const ctx=canvas.getContext("2d",{alpha:false});
        const overlay=document.createElement("div");overlay.className="pdf-annotation-layer";overlay.style.width=`${width}px`;overlay.style.height=`${height}px`;
        wrap.style.width=`${width}px`;wrap.style.height=`${height}px`;
        wrap.append(canvas,overlay);stage.replaceChildren(wrap);
        await page.render({canvasContext:ctx,viewport,transform:dpr!==1?[dpr,0,0,dpr,0,0]:null}).promise;
      }else{
        width=595*scale;height=842*scale;
        canvas.width=Math.ceil(width*dpr);canvas.height=Math.ceil(height*dpr);
        canvas.style.width=`${width}px`;canvas.style.height=`${height}px`;
        const ctx=canvas.getContext("2d",{alpha:false});ctx.fillStyle="#fff";ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.strokeStyle="#ddd";ctx.strokeRect(1,1,canvas.width-2,canvas.height-2);
        const overlay=document.createElement("div");overlay.className="pdf-annotation-layer";overlay.style.width=`${width}px`;overlay.style.height=`${height}px`;
        wrap.style.width=`${width}px`;wrap.style.height=`${height}px`;
        wrap.append(canvas,overlay);stage.replaceChildren(wrap);
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

  async function openFile(file){
    if(!file)return;
    if(file.type!=="application/pdf"&&!/\.pdf$/i.test(file.name)){
      stage.innerHTML=`<div class="pdf-error">${icon("info")}<h3>That isn't a PDF</h3><p>Please choose a PDF document.</p></div>`;return;
    }
    try{
      const pdfjs=await loadPdfJs();
      if(textEditor)commitTextEditor();
      sourceBytes=new Uint8Array(await file.arrayBuffer());
      pdfDoc=await pdfjs.getDocument({data:sourceBytes}).promise;
      sourceName=file.name||"document.pdf";
      pages=Array.from({length:pdfDoc.numPages},(_,i)=>({srcIndex:i,rotation:0}));
      annotations=Array.from({length:pdfDoc.numPages},()=>[]);
      pageIndex=0;scale=1;selectedIndex=-1;history=[];redoStack=[];
      setTool("select");
      await makeThumbnails();
      await renderPage();
      updateControls();
    }catch(error){
      pdfDoc=null;sourceBytes=null;pages=[];annotations=[];
      stage.innerHTML=`<div class="pdf-error">${icon("info")}<h3>PDF couldn't be opened</h3><p>${escapeHtml(error?.message||String(error))}</p></div>`;
      updateControls();
    }
  }

  function mutateSelected(mutator){
    if(selectedIndex<0)return;
    const a=annotations[pageIndex]?.[selectedIndex];if(!a)return;
    const before=snapshot();
    mutator(a);
    if(same(before.annotations,annotations))return;
    history.push(before);if(history.length>50)history.shift();redoStack=[];
    refreshStage();
  }

  let panelTextBefore=null;
  editText.addEventListener("focus",()=>{
    const a=annotations[pageIndex]?.[selectedIndex];
    panelTextBefore=a?.type==="text"?snapshot():null;
  });
  editText.addEventListener("input",()=>{
    const a=annotations[pageIndex]?.[selectedIndex];if(!a||a.type!=="text")return;
    a.text=editText.value;
    renderAnnotations();
    syncSelectionPanelLight();
  });
  editText.addEventListener("blur",()=>{
    if(!panelTextBefore)return;
    if(!same(panelTextBefore.annotations,annotations)){
      history.push(panelTextBefore);
      if(history.length>50)history.shift();
      redoStack=[];
    }
    panelTextBefore=null;
    updateHistory();
  });
  textSize.addEventListener("change",()=>mutateSelected(a=>{if(a.type==="text")a.size=Math.max(8,Math.min(96,Number(textSize.value)||18));}));
  colorInput.addEventListener("change",()=>{
    const a=annotations[pageIndex]?.[selectedIndex];if(!a)return;
    mutateSelected(x=>x.color=colorInput.value);
  });
  fontInput.addEventListener("change",()=>mutateSelected(a=>{if(a.type==="text")a.font=fontInput.value;}));
  fontStyleInput.addEventListener("change",()=>mutateSelected(a=>{if(a.type==="text")a.fontStyle=fontStyleInput.value;}));

  $("#pdf-add-text").addEventListener("click",()=>startTextEditor(.36,.38));
  $("#pdf-insert-text").addEventListener("click",()=>startTextEditor(.36,.38));

  $("#pdf-delete-annotation").addEventListener("click",()=>{
    if(selectedIndex<0)return;
    pushHistory();
    annotations[pageIndex].splice(selectedIndex,1);
    selectedIndex=-1;
    refreshStage();
  });

  document.addEventListener("keydown",e=>{
    if(destroyed)return;
    if((e.key==="Delete"||e.key==="Backspace")&&selectedIndex>=0&&!textEditor&&document.activeElement?.tagName!=="INPUT"&&document.activeElement?.tagName!=="TEXTAREA"){
      $("#pdf-delete-annotation").click();
    }
  });

  root.querySelectorAll("[data-pdf-tool]").forEach(b=>b.addEventListener("click",()=>{
    if(textEditor)commitTextEditor();
    setTool(b.dataset.pdfTool);
  }));

  $("#pdf-prev").onclick=()=>{if(pageIndex>0){if(textEditor)commitTextEditor();pageIndex--;selectedIndex=-1;renderPage();}};
  $("#pdf-next").onclick=()=>{if(pageIndex<pages.length-1){if(textEditor)commitTextEditor();pageIndex++;selectedIndex=-1;renderPage();}};
  pageInput.onchange=()=>{const n=Math.max(1,Math.min(pages.length,Number(pageInput.value)||1));if(textEditor)commitTextEditor();pageIndex=n-1;selectedIndex=-1;renderPage();};

  $("#pdf-zoom-out").onclick=()=>{scale=Math.max(.5,Math.round((scale-.1)*10)/10);renderPage();};
  $("#pdf-zoom-in").onclick=()=>{scale=Math.min(3,Math.round((scale+.1)*10)/10);renderPage();};
  $("#pdf-fit").onclick=async()=>{
    if(!ready())return;
    const item=pages[pageIndex];
    if(item.srcIndex<0){scale=1;return renderPage();}
    const page=await pdfDoc.getPage(item.srcIndex+1);
    const viewport=page.getViewport({scale:1,rotation:item.rotation});
    scale=Math.max(.5,Math.min(2.5,(stage.clientWidth-72)/viewport.width));
    renderPage();
  };

  const rotateCurrent=()=>{
    if(!ready())return;
    pushHistory();pages[pageIndex].rotation=(pages[pageIndex].rotation+90)%360;selectedIndex=-1;
    makeThumbnails();renderPage();
  };
  $("#pdf-rotate").onclick=rotateCurrent;
  $("#pdf-rotate-page").onclick=rotateCurrent;

  $("#pdf-add-page").onclick=()=>{
    pushHistory();pages.splice(pageIndex+1,0,{srcIndex:-1,rotation:0});annotations.splice(pageIndex+1,0,[]);pageIndex++;selectedIndex=-1;makeThumbnails();renderPage();
  };
  $("#pdf-duplicate-page").onclick=()=>{
    pushHistory();pages.splice(pageIndex+1,0,clone(pages[pageIndex]));annotations.splice(pageIndex+1,0,clone(annotations[pageIndex]));pageIndex++;selectedIndex=-1;makeThumbnails();renderPage();
  };
  $("#pdf-delete-page").onclick=()=>{
    if(pages.length<=1)return;
    pushHistory();pages.splice(pageIndex,1);annotations.splice(pageIndex,1);pageIndex=Math.min(pageIndex,pages.length-1);selectedIndex=-1;makeThumbnails();renderPage();
  };
  $("#pdf-move-left").onclick=()=>{
    if(pageIndex<=0)return;
    pushHistory();
    [pages[pageIndex-1],pages[pageIndex]]=[pages[pageIndex],pages[pageIndex-1]];
    [annotations[pageIndex-1],annotations[pageIndex]]=[annotations[pageIndex],annotations[pageIndex-1]];
    pageIndex--;selectedIndex=-1;makeThumbnails();renderPage();
  };
  $("#pdf-move-right").onclick=()=>{
    if(pageIndex>=pages.length-1)return;
    pushHistory();
    [pages[pageIndex+1],pages[pageIndex]]=[pages[pageIndex],pages[pageIndex+1]];
    [annotations[pageIndex+1],annotations[pageIndex]]=[annotations[pageIndex],annotations[pageIndex+1]];
    pageIndex++;selectedIndex=-1;makeThumbnails();renderPage();
  };

  undoBtn.onclick=()=>{
    if(!history.length)return;
    if(textEditor)commitTextEditor();
    const cur=snapshot();const prev=history.pop();redoStack.push(cur);restore(prev);makeThumbnails();renderPage();updateHistory();
  };
  redoBtn.onclick=()=>{
    if(!redoStack.length)return;
    if(textEditor)commitTextEditor();
    const cur=snapshot();const next=redoStack.pop();history.push(cur);restore(next);makeThumbnails();renderPage();updateHistory();
  };

  async function exportPdf(){
    if(!ready()||!sourceBytes)return;
    const old=saveBtn.innerHTML;
    saveBtn.disabled=true;saveBtn.innerHTML=`${icon("refresh")}<span>Exporting…</span>`;
    try{
      const {PDFDocument,rgb,degrees,StandardFonts}=await loadPdfLib();
      const src=await PDFDocument.load(sourceBytes);
      const out=await PDFDocument.create();
      const fontCache=new Map();
      const getFont=async(a)=>{
        const base=a.font||"Helvetica",style=a.fontStyle||"regular";
        const key=base+"|"+style;
        if(fontCache.has(key))return fontCache.get(key);
        let standard;
        if(base==="TimesRoman") standard=style==="bold"?StandardFonts.TimesRomanBold:style==="italic"?StandardFonts.TimesRomanItalic:style==="boldItalic"?StandardFonts.TimesRomanBoldItalic:StandardFonts.TimesRoman;
        else if(base==="Courier") standard=style==="bold"?StandardFonts.CourierBold:style==="italic"?StandardFonts.CourierOblique:style==="boldItalic"?StandardFonts.CourierBoldOblique:StandardFonts.Courier;
        else standard=style==="bold"?StandardFonts.HelveticaBold:style==="italic"?StandardFonts.HelveticaOblique:style==="boldItalic"?StandardFonts.HelveticaBoldOblique:StandardFonts.Helvetica;
        const f=await out.embedFont(standard);fontCache.set(key,f);return f;
      };

      for(let i=0;i<pages.length;i++){
        const item=pages[i];
        let outPage,baseW=595,baseH=842,sourceRotation=0;
        if(item.srcIndex>=0){
          const sourcePage=src.getPage(item.srcIndex);
          const size=sourcePage.getSize();
          baseW=size.width;baseH=size.height;sourceRotation=sourcePage.getRotation().angle||0;
          outPage=(await out.copyPages(src,[item.srcIndex]))[0];out.addPage(outPage);
          outPage.setRotation(degrees((sourceRotation+item.rotation)%360));
        }else outPage=out.addPage([baseW,baseH]);

        const displayRotation=(sourceRotation+item.rotation)%360;
        const displayW=displayRotation===90||displayRotation===270?baseH:baseW;
        const displayH=displayRotation===90||displayRotation===270?baseW:baseH;

        const invPoint=(nx,ny)=>{
          const dx=nx*displayW,dy=ny*displayH;
          if(displayRotation===90)return {x:dy,y:baseH-dx};
          if(displayRotation===180)return {x:baseW-dx,y:baseH-dy};
          if(displayRotation===270)return {x:baseW-dy,y:dx};
          return {x:dx,y:dy};
        };
        const pdfColor=a=>rgb(...Object.values(hexToRgb(a.color)));

        for(const a of annotations[i]||[]){
          if(a.type==="draw"){
            for(let j=1;j<a.points.length;j++){
              const p1=invPoint(a.points[j-1].x,a.points[j-1].y),p2=invPoint(a.points[j].x,a.points[j].y);
              outPage.drawLine({start:{x:p1.x,y:baseH-p1.y},end:{x:p2.x,y:baseH-p2.y},thickness:2,color:pdfColor(a)});
            }
          }else if(a.type==="text"){
            const p=invPoint(a.x,a.y);
            const font=await getFont(a);
            const size=Math.max(8,Math.min(96,a.size||18));
            const lines=String(a.text||"").split(/\r?\n/);
            const lineHeight=size*1.18;
            const startY=baseH-p.y-size;
            lines.forEach((line,lineIndex)=>{
              outPage.drawText(line,{x:p.x,y:startY-lineIndex*lineHeight,size,font,color:pdfColor(a)});
            });
          }else{
            const p1=invPoint(a.x,a.y),p2=invPoint(a.x+a.w,a.y+a.h);
            const x=Math.min(p1.x,p2.x),yTop=Math.min(p1.y,p2.y),w=Math.abs(p2.x-p1.x),h=Math.abs(p2.y-p1.y);
            if(a.type==="highlight")outPage.drawRectangle({x,y:baseH-yTop-h,width:w,height:h,color:pdfColor(a),opacity:.25});
            if(a.type==="rectangle")outPage.drawRectangle({x,y:baseH-yTop-h,width:w,height:h,borderColor:pdfColor(a),borderWidth:2});
          }
        }
      }

      const bytes=await out.save();
      const blob=new Blob([bytes],{type:"application/pdf"});
      const url=URL.createObjectURL(blob);
      const a=document.createElement("a");
      a.href=url;a.download=safePdfName(sourceName);document.body.appendChild(a);a.click();a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),1500);
      pageStatus.textContent=`Saved · ${pages.length} pages`;
    }catch(error){
      console.error("PDF export failed:",error);
      pageStatus.textContent="Export failed";
    }finally{
      saveBtn.innerHTML=old;saveBtn.disabled=!ready();updateControls();
    }
  }

  fileInput.addEventListener("change",()=>openFile(fileInput.files?.[0]));
  emptyInput.addEventListener("change",()=>openFile(emptyInput.files?.[0]));
  saveBtn.onclick=exportPdf;
  $("#pdf-page-more").onclick=()=>pageStatus.textContent="Use Add, Duplicate or Delete for page actions.";
  setTool("select");
  updateControls();

  root._cleanup=()=>{
    destroyed=true;
    if(textEditor)cancelTextEditor();
    if(thumbObserver)thumbObserver.disconnect();
    pdfDoc=null;sourceBytes=null;pages=[];annotations=[];history=[];redoStack=[];
  };
}

function safePdfName(name){
  const base=String(name||"document.pdf").replace(/\.pdf$/i,"").replace(/[^a-z0-9._-]+/gi,"-").replace(/-+/g,"-").replace(/^-|-$/g,"");
  return (base||"document")+"-edited.pdf";
}

function hexToRgb(hex){
  const h=String(hex||"#6750A4").replace("#","");
  const normalized=h.length===3?h.split("").map(x=>x+x).join(""):h.padEnd(6,"0");
  const n=parseInt(normalized,16);
  return {r:((n>>16)&255)/255,g:((n>>8)&255)/255,b:(n&255)/255};
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}
