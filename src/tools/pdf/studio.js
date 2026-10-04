import { icon } from "../../core/icons.js";

const PDFJS_VERSION = "4.10.38";
let pdfjsPromise;

async function loadPdfJs(){
  if(!pdfjsPromise){
    pdfjsPromise = import(`https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.min.mjs`).then(pdfjs=>{
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.mjs`;
      return pdfjs;
    });
  }
  return pdfjsPromise;
}

export async function mount(root){
  let pdfDoc = null;
  let pageNumber = 1;
  let scale = 1;
  let rotation = 0;
  let rendering = false;
  let pendingPage = null;
  let destroyed = false;

  root.innerHTML = `
    <section class="pdf-studio">
      <header class="pdf-studio-bar">
        <div class="pdf-studio-title">
          <span class="pdf-studio-icon">${icon("picture_as_pdf")}</span>
          <div><strong>PDF Studio</strong><small>1.36 Foundation</small></div>
        </div>
        <div class="pdf-studio-actions">
          <label class="pdf-open primary">
            ${icon("upload")} Open PDF
            <input id="pdf-file" type="file" accept="application/pdf,.pdf" hidden>
          </label>
          <button class="secondary" id="pdf-print" disabled>${icon("description")} Print</button>
        </div>
      </header>

      <div class="pdf-studio-layout">
        <aside class="pdf-thumbnails" aria-label="PDF pages">
          <div class="pdf-panel-head"><strong>Pages</strong><span id="pdf-page-count">—</span></div>
          <div id="pdf-thumb-list" class="pdf-thumb-list">
            <div class="pdf-empty-small">${icon("picture_as_pdf")}<span>Open a PDF to see pages</span></div>
          </div>
        </aside>

        <section class="pdf-workspace">
          <div class="pdf-toolbar" role="toolbar" aria-label="PDF viewer controls">
            <div class="pdf-tool-group">
              <button class="icon-btn" id="pdf-prev" title="Previous page" disabled>${icon("arrow-left")}</button>
              <label class="pdf-page-control"><input id="pdf-page" type="number" min="1" value="1" disabled><span>/ <b id="pdf-pages">—</b></span></label>
              <button class="icon-btn" id="pdf-next" title="Next page" disabled>${icon("arrow")}</button>
            </div>
            <div class="pdf-tool-group">
              <button class="icon-btn" id="pdf-zoom-out" title="Zoom out" disabled>−</button>
              <span id="pdf-zoom-label">100%</span>
              <button class="icon-btn" id="pdf-zoom-in" title="Zoom in" disabled>+</button>
              <button class="secondary compact" id="pdf-fit" disabled>${icon("aspect_ratio")} Fit</button>
              <button class="icon-btn" id="pdf-rotate" title="Rotate page" disabled>${icon("refresh")}</button>
            </div>
          </div>
          <div id="pdf-stage" class="pdf-stage">
            <div class="pdf-welcome">
              <div class="pdf-welcome-icon">${icon("picture_as_pdf")}</div>
              <h2>Open a PDF</h2>
              <p>View pages, browse thumbnails, zoom and rotate. Your PDF stays in this browser session.</p>
              <label class="primary pdf-open">${icon("upload")} Choose PDF<input id="pdf-file-empty" type="file" accept="application/pdf,.pdf" hidden></label>
              <p class="pdf-note">PDF Studio 1.36 · viewer foundation</p>
            </div>
          </div>
        </section>
      </div>
    </section>`;

  const fileInput = root.querySelector("#pdf-file");
  const emptyInput = root.querySelector("#pdf-file-empty");
  const stage = root.querySelector("#pdf-stage");
  const thumbList = root.querySelector("#pdf-thumb-list");
  const pageInput = root.querySelector("#pdf-page");
  const pagesLabel = root.querySelector("#pdf-pages");
  const countLabel = root.querySelector("#pdf-page-count");
  const zoomLabel = root.querySelector("#pdf-zoom-label");
  const prevBtn = root.querySelector("#pdf-prev");
  const nextBtn = root.querySelector("#pdf-next");
  const zoomOut = root.querySelector("#pdf-zoom-out");
  const zoomIn = root.querySelector("#pdf-zoom-in");
  const fitBtn = root.querySelector("#pdf-fit");
  const rotateBtn = root.querySelector("#pdf-rotate");
  const printBtn = root.querySelector("#pdf-print");

  const controls = [pageInput,prevBtn,nextBtn,zoomOut,zoomIn,fitBtn,rotateBtn,printBtn];
  const setEnabled = on => controls.forEach(el => { el.disabled = !on; });

  function updateControls(){
    const ready = !!pdfDoc;
    setEnabled(ready);
    if(!ready)return;
    pageInput.value = pageNumber;
    pageInput.max = pdfDoc.numPages;
    pagesLabel.textContent = pdfDoc.numPages;
    countLabel.textContent = pdfDoc.numPages;
    prevBtn.disabled = pageNumber <= 1;
    nextBtn.disabled = pageNumber >= pdfDoc.numPages;
    zoomOut.disabled = scale <= .5;
    zoomIn.disabled = scale >= 3;
    zoomLabel.textContent = `${Math.round(scale*100)}%`;
    root.querySelectorAll(".pdf-thumb").forEach((el,i)=>el.classList.toggle("active",i+1===pageNumber));
  }

  async function renderPage(num){
    if(destroyed || !pdfDoc)return;
    if(rendering){ pendingPage = num; return; }
    rendering = true;
    try{
      const page = await pdfDoc.getPage(num);
      const viewport = page.getViewport({scale,rotation});
      const old = stage.querySelector(".pdf-canvas-wrap");
      if(old)old.remove();

      const wrap = document.createElement("div");
      wrap.className = "pdf-canvas-wrap";
      const canvas = document.createElement("canvas");
      canvas.className = "pdf-canvas";
      const ctx = canvas.getContext("2d",{alpha:false});
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.ceil(viewport.width*dpr);
      canvas.height = Math.ceil(viewport.height*dpr);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      wrap.appendChild(canvas);
      stage.appendChild(wrap);
      await page.render({canvasContext:ctx,viewport,transform:dpr!==1?[dpr,0,0,dpr,0,0]:null}).promise;
      stage.scrollTop = 0;
      stage.scrollLeft = 0;
    }catch(error){
      if(!destroyed) stage.innerHTML=`<div class="pdf-error">${icon("info")}<h3>Page couldn't render</h3><p>${escapeHtml(error?.message||String(error))}</p></div>`;
    }finally{
      rendering=false;
      if(pendingPage && pendingPage!==num){
        const next=pendingPage; pendingPage=null; renderPage(next);
      }else pendingPage=null;
    }
  }

  async function makeThumbnails(){
    thumbList.innerHTML="";
    for(let i=1;i<=pdfDoc.numPages;i++){
      if(destroyed) return;
      const page=await pdfDoc.getPage(i);
      const viewport=page.getViewport({scale:.22});
      const item=document.createElement("button");
      item.className="pdf-thumb";
      item.dataset.page=i;
      item.setAttribute("aria-label",`Page ${i}`);
      const canvas=document.createElement("canvas");
      const dpr=Math.min(window.devicePixelRatio||1,2);
      canvas.width=Math.ceil(viewport.width*dpr);
      canvas.height=Math.ceil(viewport.height*dpr);
      canvas.style.width=`${viewport.width}px`;
      canvas.style.height=`${viewport.height}px`;
      await page.render({canvasContext:canvas.getContext("2d",{alpha:false}),viewport,transform:dpr!==1?[dpr,0,0,dpr,0,0]:null}).promise;
      const label=document.createElement("span");
      label.textContent=i;
      item.append(canvas,label);
      item.onclick=()=>{pageNumber=i;rotation=0;renderPage(pageNumber);updateControls();};
      thumbList.appendChild(item);
    }
    updateControls();
  }

  async function openFile(file){
    if(!file)return;
    if(file.type!=="application/pdf" && !/\.pdf$/i.test(file.name)){
      stage.innerHTML=`<div class="pdf-error">${icon("info")}<h3>That isn't a PDF</h3><p>Please choose a PDF document.</p></div>`;
      return;
    }
    try{
      const pdfjs=await loadPdfJs();
      const data=new Uint8Array(await file.arrayBuffer());
      pdfDoc=await pdfjs.getDocument({data}).promise;
      pageNumber=1;scale=1;rotation=0;
      stage.innerHTML="";
      await makeThumbnails();
      await renderPage(1);
      updateControls();
    }catch(error){
      pdfDoc=null;
      stage.innerHTML=`<div class="pdf-error">${icon("info")}<h3>PDF couldn't be opened</h3><p>${escapeHtml(error?.message||String(error))}</p><button class="secondary" id="pdf-retry-open">${icon("upload")} Try another PDF</button></div>`;
      root.querySelector("#pdf-retry-open")?.addEventListener("click",()=>fileInput.click());
      updateControls();
    }
  }

  fileInput.addEventListener("change",()=>openFile(fileInput.files?.[0]));
  emptyInput.addEventListener("change",()=>openFile(emptyInput.files?.[0]));
  prevBtn.onclick=()=>{if(pageNumber>1){pageNumber--;rotation=0;renderPage(pageNumber);updateControls();}};
  nextBtn.onclick=()=>{if(pdfDoc && pageNumber<pdfDoc.numPages){pageNumber++;rotation=0;renderPage(pageNumber);updateControls();}};
  pageInput.onchange=()=>{if(!pdfDoc)return;const n=Math.max(1,Math.min(pdfDoc.numPages,Number(pageInput.value)||1));pageNumber=n;rotation=0;renderPage(n);updateControls();};
  zoomOut.onclick=()=>{scale=Math.max(.5,Math.round((scale-.1)*10)/10);renderPage(pageNumber);updateControls();};
  zoomIn.onclick=()=>{scale=Math.min(3,Math.round((scale+.1)*10)/10);renderPage(pageNumber);updateControls();};
  fitBtn.onclick=async()=>{
    if(!pdfDoc)return;
    const page=await pdfDoc.getPage(pageNumber);
    const viewport=page.getViewport({scale:1,rotation});
    const available=Math.max(320,stage.clientWidth-48);
    scale=Math.max(.5,Math.min(3,available/viewport.width));
    renderPage(pageNumber);updateControls();
  };
  rotateBtn.onclick=()=>{rotation=(rotation+90)%360;renderPage(pageNumber);updateControls();};
  printBtn.onclick=()=>window.print();

  root._cleanup=()=>{destroyed=true;pdfDoc=null;pendingPage=null;};
}

function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
