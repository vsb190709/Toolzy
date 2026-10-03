import { categories, tools, getCategory, getTool, toolsForCategory } from "./registry.js";
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
    document.querySelector("#themeBtn").textContent=next==="dark"?"☀":"☾";
    document.querySelector("#themeBtn").setAttribute("aria-label", next==="dark"?"Switch to light mode":"Switch to dark mode");
  };
  const search=document.querySelector("#search");
  search.oninput=()=>renderSearch(search.value);
  applyTheme();
  const initialTheme=document.documentElement.dataset.theme||"light";
  document.querySelector("#themeBtn").textContent=initialTheme==="dark"?"☀":"☾";
  document.querySelector("#themeBtn").setAttribute("aria-label", initialTheme==="dark"?"Switch to light mode":"Switch to dark mode");
}

function card(t){
 return `<button class="tool-card" data-tool="${t.id}" aria-label="${escapeHtml(t.name)}">
   <span class="tool-icon">${icon(t.icon)}</span>
   <span class="tool-card-copy">
     <h3>${escapeHtml(t.name)}</h3>
     <p>${escapeHtml(t.description)}</p>
   </span>
   <span class="tool-card-arrow" aria-hidden="true">${icon("arrow")}</span>
 </button>`;
}

function renderSearch(q){
 const main=document.querySelector("#main");
 if(!q.trim()){renderRoute(route());return}
 const x=q.toLowerCase();
 const found=tools.filter(t=>(t.name+" "+t.description+" "+t.category).toLowerCase().includes(x));
 main.innerHTML=`<div class="page-head"><p class="eyebrow">Search</p><h1>Results for “${escapeHtml(q)}”</h1></div><div class="tool-grid">${found.map(card).join("")||"<div class='empty'>No tools found yet.</div>"}</div>`;
 bindToolCards();
}

export function renderRoute(r){
 const main=document.querySelector("#main"); if(!main)return;
 if(r.length===0)return renderHome();
 if(r.length===1 && r[0]==="credits")return renderCredits();
 if(r.length===1 && getCategory(r[0]))return renderCategory(r[0]);
 if(r.length===2 && getCategory(r[0]) && getTool(r[1]))return renderTool(r[1]);
 renderNotFound();
}

function renderHome(){
 const state=loadState();
 const recent=state.recent.map(getTool).filter(Boolean);
 document.title="Toolzy — All-in-one toolbox";
 const heroArt = art("build","Toolzy toolbox");
 const categoryArt = {basic:"build",text:"text",calculators:"calculator",converters:"swap",developer:"code",image:"image",pdf:"pdf",documents:"folder",security:"lock"};
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
   <section><div class="section-title"><h2>Available now</h2><p>${tools.length} tools live</p></div><div class="tool-grid">${tools.map(card).join("")}</div></section><section class="home-bottom"><button class="secondary credits-bottom" data-nav="/credits">${icon("star")} Credits & open source</button></section>`;
 bindNav();bindToolCards();
}

function renderCategory(id){
 const c=getCategory(id), list=toolsForCategory(id);
 document.title=`${c.name} Tools — Toolzy`;

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
       <div class="tool-grid developer-tool-grid">${items.map(card).join("")}</div>
     </section>`;
   }).join("");

   document.querySelector("#main").innerHTML=`
     <section class="developer-hero">
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
         ${art(({basic:"build",text:"text",calculators:"calculator",converters:"swap",developer:"code",image:"image",pdf:"pdf",documents:"folder",security:"lock"})[c.id]||"build", c.name)}
         <div><p class="eyebrow">${icon(c.icon)} ${c.name}</p><h1>${c.name} Tools</h1><p>${c.description}</p></div>
       </div>
     </div>
     <div class="tool-grid">${list.length?list.map(card).join(""):`<div class='planned'><strong>Planned</strong><p>More ${c.name.toLowerCase()} tools are coming in the next phases.</p></div>`}</div>`;
 }
 bindToolCards();
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
   await mod.mount(document.querySelector("#tool-mount"), t);
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
     <section class="credit-card"><div class="credit-art">${art("robot","PxlKit")}</div><div><h2>PxlKit</h2><p>Colorful pixel artwork used throughout Toolzy's categories and interface.</p><a href="https://pxlkit.xyz" target="_blank" rel="noreferrer">pxlkit.xyz ↗</a></div></section>
     <section class="credit-card"><div class="credit-art">${art("pixel-crown-sparkles","HackerNoon")}</div><div><h2>HackerNoon Pixel Icons</h2><p>Pixel icon resources used as part of Toolzy's visual system.</p><a href="https://github.com/hackernoon/pixel-icon-library" target="_blank" rel="noreferrer">Pixel Icon Library ↗</a></div></section>
     <section class="credit-card"><div class="credit-art">${art("pencil","HackerNoon")}</div><div><h2>HackerNoon Font</h2><p>HackerNoon pixel typography is bundled locally for the Toolzy interface.</p><a href="https://brand.hackernoon.com/" target="_blank" rel="noreferrer">HackerNoon brand resources ↗</a></div></section>
   </div>
   <div class="credits-note"><strong>Third-party resources</strong><p>Toolzy keeps attribution on this dedicated page while following the applicable licenses for bundled assets.</p></div>`;
}

function renderNotFound(){document.querySelector("#main").innerHTML=`<div class="empty"><h1>404</h1><p>This Toolzy page doesn't exist yet.</p><button class="primary" data-nav="/">Go home</button></div>`;bindNav()}
function bindNav(){document.querySelectorAll("[data-nav]").forEach(b=>b.onclick=()=>navigate(b.dataset.nav))}
function bindToolCards(){document.querySelectorAll("[data-tool]").forEach(b=>b.onclick=()=>{const t=getTool(b.dataset.tool);navigate("/"+t.category+"/"+t.id)})}
function escapeHtml(s){return s.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
