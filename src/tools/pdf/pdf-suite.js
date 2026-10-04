import { icon } from "../../core/icons.js";
import { navigate } from "../../core/router.js";

const PDFJS_VERSION = "4.10.38";
const PDFLIB_VERSION = "1.17.1";
let pdfjsPromise, pdfLibPromise;

const META = {
  "compress-pdf": ["Compress PDF","Reduce file size with a browser-first compression workflow.","compress-pdf"],
  "pdf-converter": ["PDF Converter","Convert documents and PDFs between supported formats.","pdf-converter"],
  "pdf-ocr": ["PDF OCR","Recognize scanned pages for searchable and editable workflows.","text"],
  "pdf-a": ["PDF to PDF/A","Prepare an archival PDF workflow.","verified"],
  "pdf-to-jpg": ["PDF to JPG","Turn PDF pages into JPG images.","image"],
  "pdf-to-png": ["PDF to PNG","Turn PDF pages into PNG images.","image"],
  "jpg-to-pdf": ["JPG to PDF","Combine images into a PDF.","image"],
  "pdf-to-word": ["PDF to Word","Convert PDF content into an editable Word workflow.","description"],
  "pdf-to-excel": ["PDF to Excel","Extract PDF table content into an Excel workflow.","table"],
  "pdf-to-ppt": ["PDF to PPT","Convert PDF pages into a presentation workflow.","description"],
  "word-to-pdf": ["Word to PDF","Create PDFs from Word documents.","description"],
  "excel-to-pdf": ["Excel to PDF","Create PDFs from spreadsheets.","table"],
  "ppt-to-pdf": ["PPT to PDF","Create PDFs from presentations.","description"],
  "odt-to-pdf": ["ODT to PDF","Create PDFs from OpenDocument text.","description"],
  "ods-to-pdf": ["ODS to PDF","Create PDFs from OpenDocument spreadsheets.","table"],
  "odp-to-pdf": ["ODP to PDF","Create PDFs from OpenDocument presentations.","description"],
  "txt-to-pdf": ["TXT to PDF","Turn plain text into a PDF.","text"],
  "rtf-to-pdf": ["RTF to PDF","Convert rich text into PDF.","text"],
  "hwp-to-pdf": ["HWP to PDF","Convert HWP documents into PDF.","description"],
  "html-to-pdf": ["HTML to PDF","Create PDFs from HTML workflows.","language"],
  "epub-to-pdf": ["EPUB to PDF","Convert ebooks into PDF workflows.","description"],
  "zip-to-pdf": ["ZIP to PDF","Convert supported document bundles into PDF workflows.","folder"],
  "csv-to-pdf": ["CSV to PDF","Create printable PDF reports from CSV data.","table"],
  "pages-to-pdf": ["Pages to PDF","Convert Apple Pages documents into PDF workflows.","description"],
  "merge-pdf": ["Merge PDF","Combine multiple PDF files into one.","layers"],
  "split-pdf": ["Split PDF","Extract page ranges into new PDF files.","content_copy"],
  "rotate-pdf": ["Rotate PDF","Rotate all pages or selected pages.","refresh"],
  "delete-pdf-pages": ["Delete PDF Pages","Remove unwanted pages.","trash"],
  "extract-pdf-pages": ["Extract PDF Pages","Create a new PDF from selected pages.","file"],
  "organize-pdf": ["Organize PDF","Reorder, duplicate, delete and rotate pages.","layers"],
  "edit-pdf": ["Edit PDF","Edit text, images, shapes, annotations and pages.","edit"],
  "pdf-annotator": ["PDF Annotator","Highlight, draw, add text, shapes and markup.","pencil"],
  "pdf-reader": ["PDF Reader","Read, navigate, zoom and print PDFs.","picture_as_pdf"],
  "number-pages": ["Number Pages","Add page numbers automatically.","123"],
  "crop-pdf": ["Crop PDF","Crop page boundaries and margins.","aspect_ratio"],
  "redact-pdf": ["Redact PDF","Remove sensitive content from documents.","shield"],
  "watermark-pdf": ["Watermark PDF","Place a text watermark across pages.","pattern"],
  "pdf-form-filler": ["PDF Form Filler","Fill common PDF forms and fields.","checklist"],
  "share-pdf": ["Share PDF","Share or hand off the current PDF.","share"],
  "sign-pdf": ["Sign PDF","Create and place an electronic signature.","edit"],
  "request-signatures": ["Request Signatures","Prepare a signature-request workflow.","share"],
  "unlock-pdf": ["Unlock PDF","Work with password-protected PDFs when authorized.","lock"],
  "protect-pdf": ["Protect PDF","Protect a PDF with a password.","lock"],
  "flatten-pdf": ["Flatten PDF","Flatten forms and annotations into static pages.","layers"],
  "ai-pdf-assistant": ["AI PDF Assistant","AI-powered document assistance.","auto_awesome"],
  "chat-with-pdf": ["Chat with PDF","Ask questions about your PDF.","psychology"],
  "ai-pdf-summarizer": ["AI PDF Summarizer","Summarize long documents quickly.","summarize"],
  "translate-pdf": ["Translate PDF","Translate document content.","language"],
  "ai-question-generator": ["AI Question Generator","Generate questions from PDF content.","psychology"],
  "pdf-scanner": ["PDF Scanner","Capture pages with a phone camera and create a PDF.","image"]
};

function loadPdfJs(){
  if(!pdfjsPromise){
    pdfjsPromise=import("https://cdn.jsdelivr.net/npm/pdfjs-dist@"+PDFJS_VERSION+"/build/pdf.min.mjs").then(function(m){
      m.GlobalWorkerOptions.workerSrc="https://cdn.jsdelivr.net/npm/pdfjs-dist@"+PDFJS_VERSION+"/build/pdf.worker.min.mjs";
      return m;
    });
  }
  return pdfjsPromise;
}
function loadPdfLib(){
  if(!pdfLibPromise) pdfLibPromise=import("https://cdn.jsdelivr.net/npm/pdf-lib@"+PDFLIB_VERSION+"/+esm");
  return pdfLibPromise;
}
function esc(s){
  return String(s||"").replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c];});
}
function card(id){
  var m=META[id];
  return '<button class="pdf-suite-card" data-pdf-tool="'+id+'"><span class="pdf-suite-card-icon">'+icon(m[2]||"picture_as_pdf")+'</span><span><strong>'+esc(m[0])+'</strong><small>'+esc(m[1])+'</small></span>'+icon("arrow-right")+'</button>';
}
function group(title,ids){
  return '<section class="pdf-suite-group"><div class="pdf-suite-group-head"><h2>'+title+'</h2><span>'+ids.length+' tools</span></div><div class="pdf-suite-grid">'+ids.map(card).join("")+'</div></section>';
}
const GROUPS=[
  ["Compress",["compress-pdf"]],
  ["Convert",["pdf-converter","pdf-ocr","pdf-a","pdf-to-jpg","pdf-to-png","jpg-to-pdf","pdf-to-word","pdf-to-excel","pdf-to-ppt","word-to-pdf","excel-to-pdf","ppt-to-pdf","odt-to-pdf","ods-to-pdf","odp-to-pdf","txt-to-pdf","rtf-to-pdf","hwp-to-pdf","html-to-pdf","epub-to-pdf","zip-to-pdf","csv-to-pdf","pages-to-pdf"]],
  ["Organize",["merge-pdf","split-pdf","rotate-pdf","delete-pdf-pages","extract-pdf-pages","organize-pdf"]],
  ["Edit & Annotate",["edit-pdf","pdf-annotator","pdf-reader","number-pages","crop-pdf","redact-pdf","watermark-pdf","pdf-form-filler","share-pdf"]],
  ["Fill & Sign",["sign-pdf","request-signatures"]],
  ["Protect",["unlock-pdf","protect-pdf","flatten-pdf"]],
  ["AI PDF",["ai-pdf-assistant","chat-with-pdf","ai-pdf-summarizer","translate-pdf","ai-question-generator"]],
  ["Scan",["pdf-scanner"]]
];

export async function mount(root, options){
  var id=(options&&options.id)||"pdf-home";
  if(id==="pdf-home") return mountHome(root);
  if(["edit-pdf","pdf-annotator","pdf-reader","sign-pdf","pdf-form-filler","redact-pdf"].includes(id)){
    return import("./studio.js").then(function(studio){return studio.mount(root,{id:"pdf-editor"});});
  }
  return mountTool(root,id);
}
function mountHome(root){
  root.innerHTML='<section class="pdf-suite-home">'+
    '<div class="pdf-suite-hero">'+
      '<div><p class="eyebrow">TOOLZY · PDF STUDIO 1.38</p><h1>Everything you need to work with PDFs.</h1><p>Compress, convert, edit, organize, sign, protect and process PDFs from one focused workspace.</p>'+
      '<div class="pdf-suite-hero-actions"><button class="primary" data-launch="edit-pdf">'+icon("edit")+' Edit PDF</button><button class="secondary" data-launch="merge-pdf">'+icon("layers")+' Merge PDF</button></div></div>'+
      '<div class="pdf-suite-hero-mark">'+icon("picture_as_pdf")+'<strong>PDF</strong><span>STUDIO</span></div>'+
    '</div>'+
    '<div class="pdf-suite-search"><input id="pdf-suite-search" placeholder="Search PDF tools…" autocomplete="off">'+icon("search")+'</div>'+
    '<div id="pdf-suite-groups">'+GROUPS.map(function(g){return group(g[0],g[1]);}).join("")+'</div>'+
  '</section>';
  bindSuite(root);
}
function bindSuite(root){
  root.querySelectorAll("[data-pdf-tool]").forEach(function(b){b.onclick=function(){navigate("/pdf/"+b.dataset.pdfTool);};});
  root.querySelectorAll("[data-launch]").forEach(function(b){b.onclick=function(){navigate("/pdf/"+b.dataset.launch);};});
  var q=root.querySelector("#pdf-suite-search");
  q.oninput=function(){
    var v=q.value.toLowerCase().trim();
    root.querySelectorAll(".pdf-suite-card").forEach(function(c){c.hidden=!!v&&!c.textContent.toLowerCase().includes(v);});
    root.querySelectorAll(".pdf-suite-group").forEach(function(g){g.hidden=!g.querySelector(".pdf-suite-card:not([hidden])");});
  };
}
function mountEditor(root,id){
  root.innerHTML='<div class="pdf-38-launch"><div class="pdf-38-launch-icon">'+icon(id==="edit-pdf"?"edit":"pencil")+'</div><p class="eyebrow">PDF STUDIO 1.38</p><h1>'+esc(META[id][0])+'</h1><p>'+esc(META[id][1])+'</p><button class="primary" id="pdf-launch-editor">'+icon("open_in_new")+' Open PDF Studio</button></div>';
  root.querySelector("#pdf-launch-editor").onclick=function(){navigate("/pdf/editor");};
}
function mountTool(root,id){
  var m=META[id]||["PDF Tool","Work with your PDF.","picture_as_pdf"];
  root.innerHTML='<section class="pdf-util-page">'+
    '<div class="pdf-util-top"><button class="secondary" id="pdf-util-back">'+icon("arrow-left")+' PDF tools</button><div class="pdf-util-title"><span>'+icon(m[2])+'</span><div><p class="eyebrow">PDF STUDIO 1.38</p><h1>'+esc(m[0])+'</h1><p>'+esc(m[1])+'</p></div></div></div>'+
    '<div class="pdf-util-drop" id="pdf-util-drop"><input id="pdf-util-files" type="file" accept="'+acceptFor(id)+'" hidden multiple><div class="pdf-util-drop-icon">'+icon("upload")+'</div><h2>Choose files or drop them here</h2><p>Files are processed in your browser for this session.</p><button class="primary" id="pdf-util-choose">'+icon("upload")+' Choose files</button></div>'+
    '<div id="pdf-util-body"></div></section>';
  var input=root.querySelector("#pdf-util-files"), choose=root.querySelector("#pdf-util-choose"), drop=root.querySelector("#pdf-util-drop");
  root.querySelector("#pdf-util-back").onclick=function(){navigate("/pdf");};
  choose.onclick=function(){input.click();};
  input.onchange=function(){run(id,[].slice.call(input.files),root.querySelector("#pdf-util-body"));};
  drop.ondragover=function(e){e.preventDefault();drop.classList.add("dragging");};
  drop.ondragleave=function(){drop.classList.remove("dragging");};
  drop.ondrop=function(e){e.preventDefault();drop.classList.remove("dragging");run(id,[].slice.call(e.dataTransfer.files),root.querySelector("#pdf-util-body"));};
}
function acceptFor(id){
  return id==="jpg-to-pdf"?"image/*,.jpg,.jpeg,.png":id==="pdf-scanner"?"image/*": "application/pdf,.pdf";
}
async function run(id,files,body){
  if(!files.length)return;
  body.innerHTML='<div class="pdf-util-loading">'+icon("refresh")+' Working…</div>';
  try{
    if(id==="merge-pdf") return merge(files,body);
    if(id==="split-pdf") return extractLike(files[0],body,false,true);
    if(id==="delete-pdf-pages") return extractLike(files[0],body,true,false);
    if(id==="extract-pdf-pages") return extractLike(files[0],body,false,false);
    if(id==="rotate-pdf") return rotate(files[0],body);
    if(id==="organize-pdf") return organize(files[0],body);
    if(id==="pdf-to-jpg"||id==="pdf-to-png") return pdfImages(files[0],body,id==="pdf-to-jpg"?"image/jpeg":"image/png");
    if(id==="jpg-to-pdf") return imagePdf(files,body);
    if(id==="number-pages") return numberPages(files[0],body);
    if(id==="watermark-pdf") return watermark(files[0],body);
    if(id==="flatten-pdf") return flatten(files[0],body);
    if(id==="crop-pdf") return crop(files[0],body);
    if(id==="compress-pdf") return compress(files[0],body);
    if(id==="pdf-scanner") return imagePdf(files,body);
    if(id==="sign-pdf"||id==="pdf-form-filler"||id==="redact-pdf") return mountEditor(rootFor(body),id);
    body.innerHTML='<div class="pdf-service-note"><div>'+icon("info")+'</div><div><p class="eyebrow">1.38 PDF ENGINE</p><h2>'+esc((META[id]||["Feature"])[0])+'</h2><p>The Toolzy 1.38 interface and workflow are ready for this feature. Its dedicated processing engine requires a server-side or specialized document-format adapter; no fake conversion is presented as complete.</p><button class="secondary" id="pdf-service-back">'+icon("arrow-left")+' Back to PDF tools</button></div></div>';
    body.querySelector("#pdf-service-back").onclick=function(){navigate("/pdf");};
  }catch(e){body.innerHTML='<div class="pdf-service-note"><div>'+icon("info")+'</div><div><h2>Could not process PDF</h2><p>'+esc(e.message||String(e))+'</p></div></div>';}
}
function rootFor(body){return body.closest(".tool-page")||body.parentElement;}
async function getDoc(file){var m=await loadPdfJs(),data=new Uint8Array(await file.arrayBuffer()),doc=await m.getDocument({data:data}).promise;return {doc,data:data};}
function ui(body,fields,label){body.innerHTML='<div class="pdf-util-form">'+fields+'<button class="primary" id="pdf-util-run">'+icon("check")+' '+label+'</button></div>';return body.querySelector("#pdf-util-run");}
function parsePages(v,count){var out=[];String(v||"").split(",").forEach(function(t){var p=t.trim().split("-").map(Number),a=p[0],b=p[1]||p[0];if(!Number.isFinite(a))return;a=Math.max(1,Math.min(count,a));b=Math.max(a,Math.min(count,Number.isFinite(b)?b:a));for(var i=a;i<=b;i++)if(!out.includes(i))out.push(i);});return out.sort(function(a,b){return a-b;});}
function dl(bytes,name,mime){var u=URL.createObjectURL(new Blob([bytes],{type:mime||"application/pdf"})),a=document.createElement("a");a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u);},1500);}
async function exportPages(file,nums,name,mut){
  var P=await loadPdfLib(),x=await getDoc(file),src=await P.PDFDocument.load(x.data),out=await P.PDFDocument.create();
  for(var j=0;j<nums.length;j++){var pair=await out.copyPages(src,[nums[j]-1]),p=pair[0];if(mut)mut(p,nums[j]);out.addPage(p);}
  return out.save();
}
async function merge(files,body){
  var P=await loadPdfLib(),out=await P.PDFDocument.create();
  for(var f of files){var x=await getDoc(f),src=await P.PDFDocument.load(x.data),ps=await out.copyPages(src,src.getPageIndices());ps.forEach(function(p){out.addPage(p);});}
  body.innerHTML='<div class="pdf-util-result"><div><p class="eyebrow">READY</p><h2>'+files.length+' PDFs merged</h2><p>All selected pages are combined in file order.</p></div><button class="primary" id="pdf-dl">'+icon("download")+' Download</button></div>';
  body.querySelector("#pdf-dl").onclick=async function(){dl(await out.save(),"toolzy-merged.pdf");};
}
async function extractLike(file,body,del,split){
  var x=await getDoc(file),label=split?"Split ranges":"Pages",btn=ui(body,'<label class="pdf-util-field"><span>'+label+'</span><input id="pdf-pages-range" placeholder="1-3,5,8-10" value="1"></label>',split?"Create split PDF":del?"Delete pages":"Extract pages");
  btn.onclick=async function(){
    var pages=parsePages(body.querySelector("#pdf-pages-range").value,x.doc.numPages);
    var nums=del?Array.from({length:x.doc.numPages},function(_,i){return i+1;}).filter(function(n){return !pages.includes(n);}):pages;
    if(!nums.length)return;
    dl(await exportPages(file,nums,split?"toolzy-split.pdf":"toolzy-pages.pdf"),split?"toolzy-split.pdf":del?"toolzy-deleted-pages.pdf":"toolzy-extracted-pages.pdf");
  };
}
async function rotate(file,body){
  var btn=ui(body,'<label class="pdf-util-field"><span>Rotation</span><select id="pdf-angle"><option>90</option><option>180</option><option>270</option></select></label>',"Rotate PDF");
  btn.onclick=async function(){var P=await loadPdfLib(),a=Number(body.querySelector("#pdf-angle").value),x=await getDoc(file);var src=await P.PDFDocument.load(x.data),out=await P.PDFDocument.create();for(var i=0;i<src.getPageCount();i++){var cp=await out.copyPages(src,[i]);cp[0].setRotation(P.degrees((src.getPage(i).getRotation().angle+a)%360));out.addPage(cp[0]);}dl(await out.save(),"toolzy-rotated.pdf");};
}
async function organize(file,body){
  var x=await getDoc(file),order=Array.from({length:x.doc.numPages},function(_,i){return i;}),sel=0;
  body.innerHTML='<div class="pdf-organize-editor"><div id="pdf-order-list">'+order.map(function(n,i){return '<button class="pdf-order-row" data-pos="'+i+'"><b>'+(i+1)+'</b> Page '+(n+1)+'</button>';}).join("")+'</div><div class="pdf-organize-actions"><button class="secondary" id="pdf-up">↑ Up</button><button class="secondary" id="pdf-down">↓ Down</button><button class="primary" id="pdf-order-save">Export order</button></div></div>';
  function paint(){body.querySelectorAll(".pdf-order-row").forEach(function(b,i){b.classList.toggle("active",i===sel);b.innerHTML="<b>"+(i+1)+"</b> Page "+(order[i]+1);b.dataset.pos=i;});}
  body.querySelectorAll(".pdf-order-row").forEach(function(b){b.onclick=function(){sel=Number(b.dataset.pos);paint();};});
  body.querySelector("#pdf-up").onclick=function(){if(sel>0){[order[sel-1],order[sel]]=[order[sel],order[sel-1]];sel--;paint();}};
  body.querySelector("#pdf-down").onclick=function(){if(sel<order.length-1){[order[sel],order[sel+1]]=[order[sel+1],order[sel]];sel++;paint();}};
  body.querySelector("#pdf-order-save").onclick=async function(){var nums=order.map(function(i){return i+1;});dl(await exportPages(file,nums,"toolzy-organized.pdf"),"toolzy-organized.pdf");};
  paint();
}
async function pdfImages(file,body,mime){
  var x=await getDoc(file);body.innerHTML='<div class="pdf-image-grid">'+Array.from({length:x.doc.numPages},function(_,i){return '<button class="pdf-image-card" data-i="'+i+'">Page '+(i+1)+'<small>Render image</small></button>';}).join("")+'</div>';
  body.querySelectorAll(".pdf-image-card").forEach(function(b){b.onclick=async function(){var p=await x.doc.getPage(Number(b.dataset.i)+1),v=p.getViewport({scale:1.5}),c=document.createElement("canvas");c.width=Math.ceil(v.width);c.height=Math.ceil(v.height);await p.render({canvasContext:c.getContext("2d"),viewport:v}).promise;c.toBlob(function(blob){var u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download="page-"+(Number(b.dataset.i)+1)+(mime==="image/jpeg"?".jpg":".png");a.click();setTimeout(function(){URL.revokeObjectURL(u);},800);},mime,.92);};});
}
async function imagePdf(files,body){
  var P=await loadPdfLib(),out=await P.PDFDocument.create();
  for(var f of files){var bytes=new Uint8Array(await f.arrayBuffer()),img;try{img=await out.embedJpg(bytes);}catch(e){img=await out.embedPng(bytes);}var s=Math.min(595/img.width,842/img.height),p=out.addPage([595,842]);p.drawImage(img,{x:(595-img.width*s)/2,y:(842-img.height*s)/2,width:img.width*s,height:img.height*s});}
  body.innerHTML='<div class="pdf-util-result"><div><p class="eyebrow">READY</p><h2>PDF created</h2><p>'+files.length+' images are combined into one PDF.</p></div><button class="primary" id="pdf-dl">'+icon("download")+' Download PDF</button></div>';
  body.querySelector("#pdf-dl").onclick=async function(){dl(await out.save(),"toolzy-images.pdf");};
}
async function numberPages(file,body){
  var P=await loadPdfLib(),x=await getDoc(file),src=await P.PDFDocument.load(x.data),out=await P.PDFDocument.create(),font=await out.embedFont(P.StandardFonts.Helvetica);
  for(var i=0;i<src.getPageCount();i++){var cp=await out.copyPages(src,[i]),p=cp[0],s=p.getSize();p.drawText(String(i+1),{x:s.width/2-3,y:12,size:10,font:font,color:P.rgb(.35,.35,.35)});out.addPage(p);}
  body.innerHTML='<div class="pdf-util-result"><div><p class="eyebrow">READY</p><h2>Page numbers added</h2><p>'+src.getPageCount()+' pages numbered.</p></div><button class="primary" id="pdf-dl">'+icon("download")+' Download</button></div>';
  body.querySelector("#pdf-dl").onclick=async function(){dl(await out.save(),"toolzy-numbered.pdf");};
}
async function watermark(file,body){
  var btn=ui(body,'<label class="pdf-util-field"><span>Watermark text</span><input id="pdf-wm" value="CONFIDENTIAL"></label><label class="pdf-util-field"><span>Opacity</span><input id="pdf-wm-op" type="range" min=".05" max=".7" step=".05" value=".2"></label>',"Apply watermark");
  btn.onclick=async function(){var P=await loadPdfLib(),x=await getDoc(file),src=await P.PDFDocument.load(x.data),out=await P.PDFDocument.create(),font=await out.embedFont(P.StandardFonts.HelveticaBold),t=body.querySelector("#pdf-wm").value||"CONFIDENTIAL",op=Number(body.querySelector("#pdf-wm-op").value)||.2;for(var i=0;i<src.getPageCount();i++){var cp=await out.copyPages(src,[i]),p=cp[0],s=p.getSize();p.drawText(t,{x:s.width*.2,y:s.height*.45,size:42,font:font,color:P.rgb(.45,.25,.7),opacity:op,rotate:P.degrees(35)});out.addPage(p);}dl(await out.save(),"toolzy-watermarked.pdf");};
}
async function flatten(file,body){
  var P=await loadPdfLib(),x=await getDoc(file),out=await P.PDFDocument.create();
  for(var i=1;i<=x.doc.numPages;i++){var p=await x.doc.getPage(i),v=p.getViewport({scale:1.2}),c=document.createElement("canvas");c.width=Math.ceil(v.width);c.height=Math.ceil(v.height);await p.render({canvasContext:c.getContext("2d"),viewport:v}).promise;var arr=new Uint8Array(await new Promise(function(res){c.toBlob(async function(b){res(await b.arrayBuffer());},"image/jpeg",.8);})),img=await out.embedJpg(arr),pg=out.addPage([img.width,img.height]);pg.drawImage(img,{x:0,y:0,width:img.width,height:img.height});}
  body.innerHTML='<div class="pdf-util-result"><div><p class="eyebrow">READY</p><h2>PDF flattened</h2><p>Pages were rasterized into static images.</p></div><button class="primary" id="pdf-dl">'+icon("download")+' Download</button></div>';
  body.querySelector("#pdf-dl").onclick=async function(){dl(await out.save(),"toolzy-flattened.pdf");};
}
async function crop(file,body){
  var btn=ui(body,'<div class="pdf-fields-2"><label class="pdf-util-field"><span>Left</span><input id="pdf-l" type="number" value="20"></label><label class="pdf-util-field"><span>Right</span><input id="pdf-r" type="number" value="20"></label><label class="pdf-util-field"><span>Top</span><input id="pdf-t" type="number" value="20"></label><label class="pdf-util-field"><span>Bottom</span><input id="pdf-b" type="number" value="20"></label></div>',"Crop PDF");
  btn.onclick=async function(){var P=await loadPdfLib(),x=await getDoc(file),src=await P.PDFDocument.load(x.data),out=await P.PDFDocument.create(),l=+body.querySelector("#pdf-l").value||0,r=+body.querySelector("#pdf-r").value||0,t=+body.querySelector("#pdf-t").value||0,b=+body.querySelector("#pdf-b").value||0;for(var i=0;i<src.getPageCount();i++){var cp=await out.copyPages(src,[i]),p=cp[0],s=p.getSize();p.setCropBox(l,b,Math.max(1,s.width-l-r),Math.max(1,s.height-t-b));out.addPage(p);}dl(await out.save(),"toolzy-cropped.pdf");};
}
async function compress(file,body){
  body.innerHTML='<div class="pdf-tool-warning"><p class="eyebrow">BROWSER COMPRESSION</p><h2>Reduced-size PDF</h2><p>This browser-only mode rasterizes pages, which can reduce size but may remove selectable text. It is clearly labeled so the original is never overwritten.</p><button class="primary" id="pdf-compress-run">Compress PDF</button></div>';
  body.querySelector("#pdf-compress-run").onclick=async function(){var P=await loadPdfLib(),x=await getDoc(file),out=await P.PDFDocument.create();for(var i=1;i<=x.doc.numPages;i++){var p=await x.doc.getPage(i),v=p.getViewport({scale:.85}),c=document.createElement("canvas");c.width=Math.ceil(v.width);c.height=Math.ceil(v.height);await p.render({canvasContext:c.getContext("2d"),viewport:v}).promise;var arr=new Uint8Array(await new Promise(function(res){c.toBlob(async function(b){res(await b.arrayBuffer());},"image/jpeg",.65);})),img=await out.embedJpg(arr),pg=out.addPage([img.width,img.height]);pg.drawImage(img,{x:0,y:0,width:img.width,height:img.height});}dl(await out.save(),"toolzy-compressed.pdf");};
}
