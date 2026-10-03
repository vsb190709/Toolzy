import { categories, tools, products, getCategory, getTool, toolsForCategory } from "./registry.js?v=23";
import { route, navigate } from "./router.js";
import { loadState, toggleFavorite, addRecent, applyTheme } from "./storage.js";

import { icon, art } from "./icons.js";

export function renderApp(){
  document.querySelector("#app").innerHTML=`
    <div class="shell">
      <header class="topbar">
        <button class="brand" data-nav="/">${icon("build")}<span>Toolzy</span></button>
        <label class="search"><span class="sr-only">Search tools</span><input id="search" placeholder="Search tools…" autocomplete="off"></label>
        <button class="theme-btn" id="themeBtn" aria-label="Toggle theme">☾</button>
      </header>
      <div class="layout">
        <aside class="sidebar" aria-label="Categories">
          <button data-nav="/" class="nav-item">${icon("home")} Home</button>
          ${categories.map(c=>`<button data-nav="/${c.id}" class="nav-item">${icon(c.icon)} ${c.name}</button>`).join("")}
        </aside>
        <main id="main" tabindex="-1"></main>
      <div class="footer-credit"><button data-nav="/credits">Credits & open source</button></div></div>
      <nav class="bottom-nav" aria-label="Mobile navigation">
        <button data-nav="/">${icon("home")}<span>Home</span></button>
        <button data-nav="/basic">${icon("build")}<span>Basic</span></button>
        <button data-nav="/calculators">${icon("calculator")}<span>Calculate</span></button>
        <button data-nav="/pdf">${icon("pdf")}<span>PDF</span></button>
      </nav>
    </div>`;
  document.querySelectorAll("[data-nav]").forEach(b=>b.onclick=()=>navigate(b.dataset.nav));
  document.querySelector("#themeBtn").onclick=()=>{
    const cur=document.documentElement.dataset.theme||"light";
    const next=cur==="dark"?"light":"dark";
    document.documentElement.dataset.theme=next;
    const state=loadState();
    state.theme=next;
    localStorage.setItem("toolzy-state-v1", JSON.stringify(state));
    document.querySelector("#themeBtn").innerHTML=icon(next==="dark"?"light_mode":"dark_mode");
    document.querySelector("#themeBtn").setAttribute("aria-label", next==="dark"?"Switch to light mode":"Switch to dark mode");
  };
  const search=document.querySelector("#search");
  search.oninput=()=>renderSearch(search.value);
  applyTheme();
  const initialTheme=document.documentElement.dataset.theme||"light";
  document.querySelector("#themeBtn").innerHTML=icon(initialTheme==="dark"?"light_mode":"dark_mode");
  document.querySelector("#themeBtn").setAttribute("aria-label", initialTheme==="dark"?"Switch to light mode":"Switch to dark mode");
}

function card(t){
 return `<button class="tool-card" data-tool="${t.id}">
   <div class="tool-icon">${icon(t.icon, t.name)}</div><div><h3>${t.name}</h3><p>${t.description}</p></div>
 </button>`;
}

function developerCard(t){
 return `<button class="tool-card" data-tool="${t.id}" aria-label="${escapeHtml(t.name)}">
   <span class="tool-icon">${icon(t.icon)}</span>
   <span class="tool-card-copy">
     <h3>${escapeHtml(t.name)}</h3>
     <p>${escapeHtml(t.description)}</p>
   </span>
   <span class="tool-card-arrow" aria-hidden="true">${icon("arrow")}</span>
 </button>`;
}

function utilitiesCard(t){
 return `<button class="tool-card utilities-card" data-tool="${t.id}" aria-label="${escapeHtml(t.name)}">
   <span class="tool-icon">${icon(t.icon)}</span>
   <span class="tool-card-copy"><h3>${escapeHtml(t.name)}</h3><p>${escapeHtml(t.description)}</p></span>
   <span class="tool-card-arrow" aria-hidden="true">${icon("arrow")}</span>
 </button>`;
}

function renderSearch(q){
 const main=document.querySelector("#main");
 if(main?._toolCleanup){try{main._toolCleanup()}catch{} main._toolCleanup=null;}
 if(!q.trim()){renderRoute(route());return}
 const x=q.toLowerCase();
 const found=tools.filter(t=>(t.name+" "+t.description+" "+t.category).toLowerCase().includes(x));
 main.innerHTML=`<div class="page-head"><p class="eyebrow">Search</p><h1>Results for “${escapeHtml(q)}”</h1></div><div class="tool-grid">${found.map(card).join("")||"<div class='empty'>No tools found yet.</div>"}</div>`;
 bindToolCards();
}

export function renderRoute(r){
 const main=document.querySelector("#main"); if(!main)return;
 if(main._toolCleanup){try{main._toolCleanup()}catch{} main._toolCleanup=null;}
 if(r.length===0)return renderHome();
 if(r.length===1 && r[0]==="credits")return renderCredits();
 if(r.length===1 && products.some(p=>p.id===r[0]))return renderProduct(r[0]);
 if(r.length===1 && getCategory(r[0]))return renderCategory(r[0]);
 if(r.length===2 && getCategory(r[0]) && getTool(r[1]))return renderTool(r[1]);
 renderNotFound();
}

function renderHome(){
 const state=loadState();
 const recent=state.recent.map(getTool).filter(Boolean);
 document.title="Toolzy — All-in-one toolbox";
 const heroArt = art("build","Toolzy toolbox");
 const categoryArt = {basic:"build",text:"text",calculators:"calculator",converters:"swap",developer:"code",utilities:"handyman",security:"lock"};
 document.querySelector("#main").innerHTML=`
   <section class="hero">
     <div class="hero-copy">
       <p class="eyebrow">TOOLZY · YOUR TOOLBOX</p>
       <h1>Everything useful.<br><span>One toolbox.</span></h1>
       <p>Fast browser tools for text, numbers, files, code, images and everyday tasks — built to stay simple.</p>
       <div class="hero-actions">
         <button class="primary hero-primary" data-nav="/basic">${icon("build")} Explore tools</button>
         
       </div>
     </div>
     <div class="hero-art">${heroArt}</div>
   </section>
   ${recent.length?`<section><div class="section-title"><h2>Recently used</h2></div><div class="tool-grid">${recent.map(card).join("")}</div></section>`:""}
   <section>
     <div class="section-title"><h2>Explore categories</h2><p>Everything has a place.</p></div>
     <div class="category-grid">${categories.map((c,i)=>`<button class="category-card category-${c.id}" data-nav="/${c.id}">
       <div class="category-art">${art(categoryArt[c.id]||"sparkle-star",c.name)}</div>
       <div><h3>${c.name}</h3><p>${c.description}</p><span class="category-link">Open ${icon("arrow-left")}</span></div>
     </button>`).join("")}</div>
   </section>
   <section><div class="section-title"><h2>Toolzy products</h2><p>More than a toolbox.</p></div><div class="product-grid">${products.map(p=>`<button class="product-card product-${p.id}" data-nav="/${p.id}"><div class="product-card-icon">${icon(p.icon)}</div><div><p class="eyebrow">Toolzy product</p><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.description)}</p><span class="product-link">${p.status==="planned"?"Coming next":"Open"} ${icon("arrow-left")}</span></div></button>`).join("")}</div></section>
   <section><div class="section-title"><h2>Available now</h2><p>${tools.length} tools live</p></div><div class="tool-grid">${tools.map(card).join("")}</div></section><section class="home-bottom"><button class="secondary credits-bottom" data-nav="/credits">${icon("star")} Credits & open source</button></section>`;
 bindNav();bindToolCards();
}

function renderProduct(id){
 const product=products.find(p=>p.id===id);
 if(!product)return renderNotFound();
 if(id==="files")return renderUniversalFiles();
 document.title=`${product.name} — Toolzy`;
 document.querySelector("#main").innerHTML=`
   <section class="product-hero">
     <div><p class="eyebrow">Toolzy · Product</p><h1>${escapeHtml(product.name)}</h1><p>${escapeHtml(product.description)}</p></div>
     <span class="product-status">${product.status==="planned"?"Coming next":"Available"}</span>
   </section>
   <section class="product-placeholder">
     <div class="product-placeholder-icon">${icon(product.icon)}</div>
     <h2>${product.name} is part of the Toolzy product suite.</h2>
     <p>This workspace is planned as a dedicated full-featured application, separate from the everyday Tools collection.</p>
   </section>`;
}
function renderUniversalFiles(){
 document.title="Universal File System — Toolzy";
 document.querySelector("#main").innerHTML=`
   <section class="ufs-hero">
     <div class="ufs-hero-main"><div class="ufs-hero-icon">${icon("folder_open")}</div><div>
       <p class="eyebrow">Toolzy · Product 8</p>
       <h1>Universal File System</h1>
       <p>Open local files, identify their format, preview supported types, and inspect useful metadata.</p>
       <div class="ufs-pills"><span>2K+ format target</span><span>Open & view</span><span>Metadata</span><span>Local-first</span></div>
     </div></div>
     <div class="ufs-hero-stat"><strong>2K+</strong><span>format target</span></div>
   </section>
   <section class="ufs-open-panel">
     <input data-ufs-input type="file" hidden>
     <button class="ufs-open-button" data-ufs-open>${icon("folder_open")} <span><strong>Open a file</strong><small>Choose any file from your device</small></span></button>
     <div class="ufs-drop-mini" data-ufs-drop>${icon("upload_file")} Drop a file here</div>
   </section>
   <section class="ufs-result" data-ufs-result hidden></section>
   <section class="ufs-format-panel">
     <div class="ufs-format-search"><span class="material-symbols-rounded">search</span><input data-format-search placeholder="Search supported extensions…" autocomplete="off"></div>
     <div class="ufs-format-results" data-format-results></div>
   </section>`;
 const root=document.querySelector("#main"), input=root.querySelector("[data-ufs-input]"), openBtn=root.querySelector("[data-ufs-open]"), drop=root.querySelector("[data-ufs-drop]"), result=root.querySelector("[data-ufs-result]"), search=root.querySelector("[data-format-search]"), formatsEl=root.querySelector("[data-format-results]");
 const formatMap={
  txt:["Plain Text","Text","text/plain"],md:["Markdown","Text","text/markdown"],json:["JSON","Data","application/json"],xml:["XML","Data","application/xml"],csv:["CSV","Spreadsheet","text/csv"],tsv:["TSV","Spreadsheet","text/tab-separated-values"],html:["HTML","Web","text/html"],htm:["HTML","Web","text/html"],css:["CSS","Source Code","text/css"],js:["JavaScript","Source Code","text/javascript"],ts:["TypeScript","Source Code","text/typescript"],py:["Python","Source Code","text/x-python"],java:["Java","Source Code","text/x-java"],c:["C Source","Source Code","text/x-c"],cpp:["C++ Source","Source Code","text/x-c++"],h:["C/C++ Header","Source Code","text/x-c"],hpp:["C++ Header","Source Code","text/x-c++"],cs:["C# Source","Source Code","text/plain"],php:["PHP Source","Source Code","text/x-php"],rb:["Ruby Source","Source Code","text/x-ruby"],go:["Go Source","Source Code","text/x-go"],rs:["Rust Source","Source Code","text/plain"],sql:["SQL","Source Code","application/sql"],sh:["Shell Script","Source Code","application/x-sh"],yaml:["YAML","Data","text/yaml"],yml:["YAML","Data","text/yaml"],toml:["TOML","Data","application/toml"],
  pdf:["Portable Document Format","Document","application/pdf"],doc:["Microsoft Word Document","Document","application/msword"],docx:["Microsoft Word Open XML","Document","application/vnd.openxmlformats-officedocument.wordprocessingml.document"],odt:["OpenDocument Text","Document","application/vnd.oasis.opendocument.text"],rtf:["Rich Text Format","Document","application/rtf"],pages:["Apple Pages","Document","application/octet-stream"],xls:["Microsoft Excel","Spreadsheet","application/vnd.ms-excel"],xlsx:["Excel Open XML","Spreadsheet","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],xlsm:["Excel Macro-Enabled Workbook","Spreadsheet","application/vnd.ms-excel.sheet.macroEnabled.12"],ods:["OpenDocument Spreadsheet","Spreadsheet","application/vnd.oasis.opendocument.spreadsheet"],ppt:["PowerPoint","Presentation","application/vnd.ms-powerpoint"],pptx:["PowerPoint Open XML","Presentation","application/vnd.openxmlformats-officedocument.presentationml.presentation"],odp:["OpenDocument Presentation","Presentation","application/vnd.oasis.opendocument.presentation"],
  jpg:["JPEG Image","Image","image/jpeg"],jpeg:["JPEG Image","Image","image/jpeg"],png:["PNG Image","Image","image/png"],gif:["GIF Image","Image","image/gif"],webp:["WebP Image","Image","image/webp"],avif:["AVIF Image","Image","image/avif"],bmp:["Bitmap Image","Image","image/bmp"],svg:["Scalable Vector Graphics","Image","image/svg+xml"],ico:["Icon File","Image","image/x-icon"],tif:["TIFF Image","Image","image/tiff"],tiff:["TIFF Image","Image","image/tiff"],heic:["High Efficiency Image","Image","image/heic"],heif:["High Efficiency Image","Image","image/heif"],psd:["Adobe Photoshop Document","Image","image/vnd.adobe.photoshop"],psb:["Photoshop Large Document","Image","image/vnd.adobe.photoshop"],xcf:["GIMP Image","Image","image/x-xcf"],jxl:["JPEG XL Image","Image","image/jxl"],
  mp3:["MP3 Audio","Audio","audio/mpeg"],wav:["WAVE Audio","Audio","audio/wav"],flac:["Free Lossless Audio","Audio","audio/flac"],ogg:["Ogg Audio","Audio","audio/ogg"],oga:["Ogg Audio","Audio","audio/ogg"],opus:["Opus Audio","Audio","audio/opus"],m4a:["MPEG-4 Audio","Audio","audio/mp4"],aac:["AAC Audio","Audio","audio/aac"],wma:["Windows Media Audio","Audio","audio/x-ms-wma"],aiff:["Audio Interchange File","Audio","audio/aiff"],
  mp4:["MPEG-4 Video","Video","video/mp4"],webm:["WebM Video","Video","video/webm"],mov:["QuickTime Movie","Video","video/quicktime"],mkv:["Matroska Video","Video","video/x-matroska"],avi:["Audio Video Interleave","Video","video/x-msvideo"],wmv:["Windows Media Video","Video","video/x-ms-wmv"],m4v:["MPEG-4 Video","Video","video/x-m4v"],mpeg:["MPEG Video","Video","video/mpeg"],mpg:["MPEG Video","Video","video/mpeg"],3gp:["3GPP Video","Video","video/3gpp"],flv:["Flash Video","Video","video/x-flv"],
  zip:["ZIP Archive","Archive","application/zip"],rar:["RAR Archive","Archive","application/vnd.rar"],7z:["7-Zip Archive","Archive","application/x-7z-compressed"],tar:["Tape Archive","Archive","application/x-tar"],gz:["GZip Compressed Archive","Archive","application/gzip"],bz2:["BZip2 Archive","Archive","application/x-bzip2"],xz:["XZ Compressed Archive","Archive","application/x-xz"],zst:["Zstandard Archive","Archive","application/zstd"],iso:["ISO Disc Image","Disk Image","application/x-iso9660-image"],
  otf:["OpenType Font","Font","font/otf"],ttf:["TrueType Font","Font","font/ttf"],woff:["Web Open Font Format","Font","font/woff"],woff2:["Web Open Font Format 2","Font","font/woff2"]
 };
 const extraExts="3fr arw cr2 cr3 crw dcr dng erf iiq kdc mef mos mrw nef nrw orf pef raf raw rw2 sr2 srf 3ga aax ac3 amr ape au caf dsf dss dts eac3 mka m4b m4r mpc ra wv 3g2 asf av1 avs dash dat divx dv f4v h264 hevc m2t m2ts m2v mj2 mjpeg mk3d mxf ogv rm rmvb swf ts vob vcd dxf dwg dgn step stp iges igs obj glb gltf fbx blend 3ds dae ply stl amf wrl vrml emf wmf eps exr hdr tga pcx ppm pgm pbm pnm jp2 j2k jpf jpx jpm j2c apng mng mpo dds tga xpm xbm pal pam dfont cur cdr pes dst emb abr ase ai indd inddx sketch fig afdesign afphoto numbers key kdb kdbx db sqlite sqlite3 mdb accdb parquet avro arrow msg eml mbox vcf ics epub mobi azw azw3 chm djvu cbz cbr tex latex bib log ini cfg conf env dat bin dll exe dmg pkg apk ipa deb rpm appimage wasm class jar war ear swf flv fnt fon cab lz lzh lzma z zipx ar sit sitx ace arc cpio rar5 tgz tbz tbz2 bz xz zst weba webm m2ts mts ts mxf r3d braw mxf nef crw".split(" ");
 const knownExts=Object.keys(formatMap);
 const allExts=[...new Set([...knownExts,...extraExts])].sort();
 function esc2(v){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
 function extOf(f){const n=f.name.toLowerCase();const p=n.lastIndexOf(".");return p>0?n.slice(p+1):""}
 function humanSize(n){const u=["B","KB","MB","GB","TB"];let i=0,x=n;while(x>=1024&&i<4){x/=1024;i++}return `${x.toFixed(i?2:0)} ${u[i]}`}
 function detect(f){
  const e=extOf(f), m=f.type||formatMap[e]?.[2]||"application/octet-stream", info=formatMap[e];
  let category=info?.[1]||"Unknown", name=info?.[0]||"Unknown / binary format";
  if(!info){
   if(m.startsWith("image/"))category="Image"; else if(m.startsWith("audio/"))category="Audio"; else if(m.startsWith("video/"))category="Video"; else if(m.startsWith("text/"))category="Text";
  }
  return {e,m,category,name,known:!!info};
 }
 function showFile(f){
  const d=detect(f), url=URL.createObjectURL(f);
  result.hidden=false;
  let preview="";
  if(d.m.startsWith("image/")||["svg"].includes(d.e))preview=`<img class="ufs-preview-image" src="${url}" alt="${esc2(f.name)}">`;
  else if(d.m.startsWith("video/"))preview=`<video class="ufs-preview-media" controls playsinline src="${url}"></video>`;
  else if(d.m.startsWith("audio/"))preview=`<audio class="ufs-preview-audio" controls src="${url}"></audio>`;
  else if(d.m==="application/pdf")preview=`<iframe class="ufs-preview-pdf" src="${url}" title="PDF preview"></iframe>`;
  else if(d.category==="Text"||d.m.startsWith("text/")||["json","xml","yaml","yml","toml","csv","tsv","md","log","ini","cfg","conf","js","ts","css","py","java","c","cpp","h","hpp","cs","php","rb","go","rs","sql","sh"].includes(d.e)){
   const reader=new FileReader();reader.onload=()=>{const pre=result.querySelector("[data-text-preview]");if(pre)pre.textContent=String(reader.result).slice(0,200000)};reader.readAsText(f);preview='<pre class="ufs-text-preview" data-text-preview>Reading file…</pre>';
  } else preview=`<div class="ufs-no-preview">${icon("visibility_off")}<strong>Preview not available in the browser</strong><span>The format was identified, and its metadata is shown below.</span></div>`;
  result.innerHTML=`
   <div class="ufs-file-head"><div class="ufs-file-type-icon">${icon(d.category==="Image"?"image":d.category==="Audio"?"music_note":d.category==="Video"?"movie":d.category==="Document"?"description":"insert_drive_file")}</div><div><p class="eyebrow">${esc2(d.category)}</p><h2>${esc2(f.name)}</h2><p>.${esc2(d.e||"no extension")} · ${esc2(d.name)}</p></div><button class="icon-btn" data-ufs-close aria-label="Close">${icon("close")}</button></div>
   <div class="ufs-preview-wrap">${preview}</div>
   <div class="ufs-metadata"><h3>Metadata</h3><div class="ufs-meta-grid">
    <div><span>Name</span><strong>${esc2(f.name)}</strong></div><div><span>Extension</span><strong>.${esc2(d.e||"none")}</strong></div>
    <div><span>Detected type</span><strong>${esc2(d.name)}</strong></div><div><span>MIME type</span><strong>${esc2(d.m)}</strong></div>
    <div><span>Category</span><strong>${esc2(d.category)}</strong></div><div><span>Size</span><strong>${humanSize(f.size)}</strong></div>
    <div><span>Last modified</span><strong>${new Date(f.lastModified).toLocaleString()}</strong></div><div><span>Browser preview</span><strong>${preview.startsWith("<div")?"Metadata only":"Available"}</strong></div>
   </div></div>`;
  result.querySelector("[data-ufs-close]").onclick=()=>{URL.revokeObjectURL(url);result.hidden=true;result.innerHTML=""};
 }
 openBtn.onclick=()=>input.click();
 drop.onclick=()=>input.click();
 input.onchange=()=>{if(input.files[0])showFile(input.files[0]);input.value=""};
 drop.ondragover=e=>{e.preventDefault();drop.classList.add("drag")};
 drop.ondragleave=()=>drop.classList.remove("drag");
 drop.ondrop=e=>{e.preventDefault();drop.classList.remove("drag");if(e.dataTransfer.files[0])showFile(e.dataTransfer.files[0])};
 function renderFormats(q=""){const x=q.trim().toLowerCase();const matches=allExts.filter(e=>!x||e.includes(x)||(formatMap[e]?.[0]||"").toLowerCase().includes(x)).slice(0,160);formatsEl.innerHTML=matches.map(e=>{const i=formatMap[e];return `<button class="ufs-extension" data-ext="${e}"><strong>.${e}</strong><span>${esc2(i?.[0]||"Recognized extension")}</span></button>`}).join("")||'<div class="ufs-empty">'+icon("search")+'<strong>No matching extension</strong></div>'}
 search.oninput=()=>renderFormats(search.value);renderFormats();
}
function renderCategory(id){
 const c=getCategory(id), list=toolsForCategory(id);
 document.title=`${c.name} Tools — Toolzy`;
 if(id==="utilities")return renderUtilitiesCategory(c,list);
 if(id==="security")return renderSecurityCategory(c,list);

 if(c.subcategories?.length){
   const groups=c.subcategories.map(sub=>{
     const items=list.filter(t=>t.subcategory===sub.id);
     if(!items.length)return "";
     return `<section class="developer-group">
       <div class="developer-section-head">
         <div class="developer-section-title">
           <span class="developer-section-icon">${icon(sub.icon)}</span>
           <div class="developer-section-copy">
             <p class="eyebrow">Developer</p>
             <h2>${sub.name}</h2>
             <p class="developer-section-desc">${developerSubDescription(sub.id)}</p>
           </div>
         </div>
         <span class="tool-count"><strong>${items.length}</strong> tools</span>
       </div>
       <div class="tool-grid developer-tool-grid">${items.map(developerCard).join("")}</div>
     </section>`;
   }).join("");

   document.querySelector("#main").innerHTML=`
     <section class="developer-header">
       <div class="developer-hero-main">
         <div class="developer-hero-icon">${icon("code")}</div>
         <div>
           <p class="eyebrow">Developer</p>
           <h1>Developer Tools</h1>
           <p class="developer-hero-desc">Practical tools for code, data, web work and everyday developer tasks.</p>
         </div>
       </div>
       <div class="developer-hero-meta">
         <div class="developer-stat">
           <strong>${list.length}</strong>
           <span>tools</span>
         </div>
         <div class="developer-stat">
           <strong>${c.subcategories.length}</strong>
           <span>categories</span>
         </div>
       </div>
     </section>
     <div class="developer-groups">${groups}</div>`;
 } else {
   document.querySelector("#main").innerHTML=`
     <div class="page-head">
       <div class="page-art-row">
         ${art(({basic:"build",text:"text",calculators:"calculator",converters:"swap",developer:"code",utilities:"handyman",image:"image",pdf:"pdf",documents:"folder",security:"lock"})[c.id]||"build", c.name)}
         <div><p class="eyebrow">${icon(c.icon)} ${c.name}</p><h1>${c.name} Tools</h1><p>${c.description}</p></div>
       </div>
     </div>
     <div class="tool-grid">${list.length?list.map(card).join(""):`<div class='planned'><strong>Planned</strong><p>More ${c.name.toLowerCase()} tools are coming in the next phases.</p></div>`}</div>`;
 }
 bindToolCards();
}

function renderUtilitiesCategory(c,list){
 const descriptions={
   time:"Clocks, dates and planning around time.",
   random:"Shuffle, generate and play with randomness.",
   planning:"Quick helpers for money, goals and everyday planning.",
   browser:"Inspect what your browser and device expose.",
   creative:"Color, emoji and browser-native creative helpers.",
   games:"Fast little games built for instant fun."
 };
 const groups=c.subcategories.map(sub=>{
   const items=list.filter(t=>t.subcategory===sub.id); if(!items.length)return "";
   return `<section class="utilities-group" id="utilities-${sub.id}">
     <div class="utilities-group-head">
       <div class="utilities-group-title"><span class="utilities-group-icon">${icon(sub.icon)}</span><div><p class="eyebrow">Utilities collection</p><h2>${sub.name}</h2><p>${descriptions[sub.id]||""}</p></div></div>
       <span class="tool-count"><strong>${items.length}</strong> tools</span>
     </div>
     <div class="tool-grid utilities-tool-grid">${items.map(utilitiesCard).join("")}</div>
   </section>`;
 }).join("");
 const jumps=c.subcategories.map(sub=>{
   const count=list.filter(t=>t.subcategory===sub.id).length;
   return `<button class="chip" data-utility-jump="${sub.id}">${icon(sub.icon)} ${sub.name} · ${count}</button>`;
 }).join("");
 document.querySelector("#main").innerHTML=`
   <section class="utilities-hero">
     <div class="utilities-hero-main">
       <div class="utilities-hero-icon">${icon("handyman")}</div>
       <div class="utilities-hero-copy">
         <p class="eyebrow">Toolzy · Utilities</p>
         <h1>Utilities that are<br><span>actually fun to use.</span></h1>
         <p>Forty browser-first helpers for time, planning, random picks, device checks, creativity and quick games.</p>
         <div class="utilities-hero-pills"><span>${list.length} tools</span><span>No sign-in</span><span>Browser-first</span></div>
       </div>
     </div>
     <div class="utilities-hero-orb" aria-hidden="true"><span>${icon("bolt")}</span><strong>GO</strong></div>
   </section>
   <div class="utilities-jumps" aria-label="Utility collections">${jumps}</div>
   <div class="utilities-groups">${groups}</div>`;
 const main=document.querySelector("#main");
 main.querySelectorAll("[data-utility-jump]").forEach(btn=>btn.onclick=()=>main.querySelector("#utilities-"+btn.dataset.utilityJump)?.scrollIntoView({behavior:"smooth",block:"start"}));
 bindToolCards();
}
function renderSecurityCategory(c,list){
 const descriptions={
   access:"Passwords, passphrases, backup codes and account authentication helpers.",
   integrity:"Hashes and integrity checks for text, files and web assets.",
   web:"Defensive header builders and web-policy inspection tools.",
   inspection:"Local inspection helpers for pasted URLs, code and secrets.",
   habits:"Simple security hygiene you can actually keep up with."
 };
 const groups=c.subcategories.map(sub=>{
   const items=list.filter(t=>t.subcategory===sub.id); if(!items.length)return "";
   return `<section class="security-group" id="security-${sub.id}">
     <div class="security-group-head">
       <div class="security-group-title"><span class="security-group-icon">${icon(sub.icon)}</span><div><p class="eyebrow">Security collection</p><h2>${sub.name}</h2><p>${descriptions[sub.id]||""}</p></div></div>
       <span class="security-count"><strong>${items.length}</strong> tools</span>
     </div>
     <div class="tool-grid security-tool-grid">${items.map(securityCard).join("")}</div>
   </section>`;
 }).join("");
 const jumps=c.subcategories.map(sub=>`<button class="chip" data-security-jump="${sub.id}">${icon(sub.icon)} ${sub.name} · ${list.filter(t=>t.subcategory===sub.id).length}</button>`).join("");
 document.querySelector("#main").innerHTML=`
   <section class="security-hero">
     <div class="security-hero-main"><div class="security-hero-icon">${icon("lock")}</div><div><p class="eyebrow">Toolzy · Security</p><h1>Security tools for<br><span>safer everyday work.</span></h1><p>Local-first utilities for passwords, integrity, web policies, inspection and good security habits.</p><div class="security-hero-pills"><span>${list.length} tools</span><span>Local-first</span><span>No sign-in</span></div></div></div>
     <div class="security-hero-orb"><span>${icon("shield")}</span><strong>LOCAL</strong></div>
   </section>
   <div class="security-jumps">${jumps}</div>
   <div class="security-groups">${groups}</div>`;
 const main=document.querySelector("#main");
 main.querySelectorAll("[data-security-jump]").forEach(b=>b.onclick=()=>main.querySelector("#security-"+b.dataset.securityJump)?.scrollIntoView({behavior:"smooth",block:"start"}));
 bindToolCards();
}

function securityCard(t){
 return `<button class="tool-card security-card" data-tool="${t.id}" aria-label="${escapeHtml(t.name)}">
   <span class="tool-icon">${icon(t.icon)}</span>
   <span class="tool-card-copy"><h3>${escapeHtml(t.name)}</h3><p>${escapeHtml(t.description)}</p></span>
   <span class="tool-card-arrow" aria-hidden="true">${icon("arrow")}</span>
 </button>`;
}

function developerSubDescription(id){
 const map={
   data:"JSON, XML, YAML, CSV and configuration formats.",
   encoding:"Encode and decode data for common developer workflows.",
   web:"URLs, headers, tokens, MIME types and browser data.",
   code:"Format, compare, test and transform source code.",
   identifiers:"Generate unique IDs and useful test data.",
   time:"Convert dates, timestamps and scheduling expressions.",
   hashing:"Create hashes, HMACs and checksums locally."
 };
 return map[id]||"Developer utilities for everyday work.";
}
async function renderTool(id){
 const t=getTool(id); if(!t)return renderNotFound();
 addRecent(id);document.title=`${t.name} — Toolzy`;
 const cat=getCategory(t.category);
 const sub=cat.subcategories?.find(s=>s.id===t.subcategory);
 const isDeveloper=t.category==="developer";
 document.querySelector("#main").innerHTML=isDeveloper ? `
   <div class="tool-page developer-tool-page">
     <button class="back" id="back">${icon("arrow-left")} Back to ${cat.name}</button>
     <header class="developer-tool-header">
       <div class="developer-tool-icon">${icon(t.icon)}</div>
       <div class="developer-tool-copy">
         <div class="developer-breadcrumb"><span>Developer</span><span aria-hidden="true">›</span><span>${sub?.name||"Tool"}</span></div>
         <h1>${escapeHtml(t.name)}</h1>
         <p>${escapeHtml(t.description)}</p>
       </div>
     </header>
     <div id="tool-mount" class="tool-mount">Loading tool…</div>
   </div>` : `
   <div class="tool-page">
     <button class="back" id="back">${icon("arrow-left")} Back</button>
     <p class="eyebrow">${icon(cat.icon)} ${cat.name}${t.subcategory?` · ${sub?.name||""}`:""}</p>
     <h1>${icon(t.icon)} ${escapeHtml(t.name)}</h1>
     <p>${escapeHtml(t.description)}</p>
     <div id="tool-mount" class="tool-mount">Loading tool…</div>
   </div>`;
 document.querySelector("#back").onclick=()=>navigate("/"+t.category);
 try{
   const mod=await import(t.module);
   if(typeof mod.mount!=="function")throw new Error("Tool module does not export mount().");
   const mountRoot=document.querySelector("#tool-mount");
   await mod.mount(mountRoot, t);
   document.querySelector("#main")._toolCleanup=typeof mountRoot._cleanup==="function"?mountRoot._cleanup:null;
 }catch(error){
   console.error("Tool load error:", error);
   document.querySelector("#tool-mount").innerHTML=`<section class="tool-error"><span class="material-symbols-rounded">error</span><h2>Tool couldn't load</h2><p>${escapeHtml(error?.message||String(error))}</p><button class="secondary" id="retry-tool">Try again</button></section>`;
   document.querySelector("#retry-tool").onclick=()=>renderTool(id);
 }
}
function renderCredits(){
 document.title="Credits — Toolzy";
 document.querySelector("#main").innerHTML=`
   <div class="page-head"><p class="eyebrow">${icon("star")} Open source</p><h1>Credits</h1><p>Toolzy is built with open-source resources and a modular browser-first architecture.</p></div>
   <div class="credits-grid">
     <section class="credit-card"><div class="credit-art">${art("robot","PxlKit")}</div><div><h2>PxlKit</h2><p>Colorful pixel artwork used throughout Toolzy's categories and interface.</p><a href="https://pxlkit.xyz" target="_blank" rel="noreferrer">pxlkit.xyz ${icon("arrow")}</a></div></section>
     <section class="credit-card"><div class="credit-art">${art("pixel-crown-sparkles","HackerNoon")}</div><div><h2>HackerNoon Pixel Icons</h2><p>Pixel icon resources used as part of Toolzy's visual system.</p><a href="https://github.com/hackernoon/pixel-icon-library" target="_blank" rel="noreferrer">Pixel Icon Library ${icon("arrow")}</a></div></section>
     <section class="credit-card"><div class="credit-art">${art("pencil","HackerNoon")}</div><div><h2>HackerNoon Font</h2><p>HackerNoon pixel typography is bundled locally for the Toolzy interface.</p><a href="https://brand.hackernoon.com/" target="_blank" rel="noreferrer">HackerNoon brand resources ${icon("arrow")}</a></div></section>
   </div>
   <div class="credits-note"><strong>Third-party resources</strong><p>Toolzy keeps attribution on this dedicated page while following the applicable licenses for bundled assets.</p></div>`;
}

function renderNotFound(){document.querySelector("#main").innerHTML=`<div class="empty"><h1>404</h1><p>This Toolzy page doesn't exist yet.</p><button class="primary" data-nav="/">Go home</button></div>`;bindNav()}
function bindNav(){document.querySelectorAll("[data-nav]").forEach(b=>b.onclick=()=>navigate(b.dataset.nav))}
function bindToolCards(){document.querySelectorAll("[data-tool]").forEach(b=>b.onclick=()=>{const t=getTool(b.dataset.tool);navigate("/"+t.category+"/"+t.id)})}
function escapeHtml(s){return s.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
