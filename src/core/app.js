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
        <button class="theme-btn" id="themeBtn" aria-label="Toggle theme"></button>
      </header>
      <div class="layout">
        <aside class="sidebar" aria-label="Categories">
          <button data-nav="/" class="nav-item">${icon("home")} Home</button>
          ${categories.map(c=>`<button data-nav="/${c.id}" class="nav-item">${icon(c.icon)} ${c.name}</button>`).join("")}
        </aside>
        <main id="main" tabindex="-1"></main>
      </div>
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

function renderSearch(q){
 const main=document.querySelector("#main");
 if(!q.trim()){renderRoute(route());return}
 const x=q.toLowerCase();
 const found=tools.filter(t=>(t.name+" "+t.description+" "+t.category).toLowerCase().includes(x));
 main.innerHTML=`<div class="page-head"><p class="eyebrow">Tool search</p><h1>Results for “${escapeHtml(q)}”</h1><p>${found.length} ${found.length===1?"tool":"tools"} found</p></div><div class="tool-grid">${found.map(card).join("")||"<div class='empty'><strong>No tools found</strong><p>Try a different keyword or category.</p></div>"}</div>`;
 bindToolCards();
}

export function renderRoute(r){
 const main=document.querySelector("#main"); if(!main)return;
 updateActiveNav(r);
 if(r.length===0)return renderHome();

 if(r.length===1 && getCategory(r[0]))return renderCategory(r[0]);
 if(r.length===2 && getCategory(r[0]) && getTool(r[1]))return renderTool(r[1]);
 renderNotFound();
}

function renderHome(){
 const state=loadState();
 const recent=state.recent.map(getTool).filter(Boolean);
 document.title="Toolzy — All-in-one toolbox";
 
 const categoryArt = {basic:"gear",text:"pencil",calculators:"dice",converters:"arrow-right",developer:"robot",image:"palette",pdf:"scroll",documents:"package",security:"shield-cross"};
 document.querySelector("#main").innerHTML=`
   <section class="hero">
     <div class="hero-copy">
       <p class="eyebrow">TOOLZY · YOUR EVERYDAY TOOLBOX</p>
       <h1>Everything useful.<br><span>One toolbox.</span></h1>
       <p>Fast browser tools for text, numbers, files, code, images and everyday tasks — built to stay simple.</p>
       <div class="hero-actions">
         <button class="primary hero-primary" data-nav="/basic">${icon("build")} Explore tools</button>
         
       </div>
     </div>
     <div class="hero-art"><div class="hero-orb"><span class="hero-orb-icon">${icon("build")}</span></div><div class="hero-glow"></div></div>
   </section>
   ${recent.length?`<section><div class="section-title"><h2>Recently used</h2></div><div class="tool-grid">${recent.map(card).join("")}</div></section>`:""}
   <section>
     <div class="section-title"><h2>Explore categories</h2><p>Everything has a place.</p></div>
     <div class="category-grid">${categories.map((c,i)=>`<button class="category-card category-${c.id}" data-nav="/${c.id}">
       <div class="category-art">${icon(c.icon,c.name)}</div>
       <div><h3>${c.name}</h3><p>${c.description}</p><span class="category-link">Open ${icon("arrow-left")}</span></div>
     </button>`).join("")}</div>
   </section>
   <section><div class="section-title"><h2>Available now</h2><p>${tools.length} tools live</p></div><div class="tool-grid">${tools.map(card).join("")}</div></section>`;
 bindNav();bindToolCards();
}

function renderCategory(id){
 const c=getCategory(id), list=toolsForCategory(id);
 document.title=`${c.name} Tools — Toolzy`;
 document.querySelector("#main").innerHTML=`
   <div class="page-head"><div class="page-art-row"><div class="material-page-icon">${icon(c.icon,c.name)}</div><div><p class="eyebrow">${icon(c.icon)} ${c.name}</p><h1>${c.name} Tools</h1><p>${c.description}</p></div></div></div>
   <div class="tool-grid">${list.length?list.map(card).join(""):`<div class="planned"><strong>Planned</strong><p>More ${c.name.toLowerCase()} tools are coming in the next phases.</p></div>`}</div>`;
 bindToolCards();
}

async function renderTool(id){
 const t=getTool(id); if(!t)return renderNotFound();
 addRecent(id);document.title=`${t.name} — Toolzy`;
 document.querySelector("#main").innerHTML=`<div class="tool-page"><button class="back secondary" id="back">${icon("arrow_back")}<span>Back to ${escapeHtml(getCategory(t.category).name)}</span></button><div class="tool-heading"><div class="material-page-icon">${icon(t.icon,t.name)}</div><div><p class="eyebrow">${icon(getCategory(t.category).icon)} ${getCategory(t.category).name}</p><h1>${t.name}</h1><p>${t.description}</p></div></div><div id="tool-mount" class="tool-mount">Loading tool…</div></div>`;
 document.querySelector("#back").onclick=()=>navigate("/"+t.category);
 try {
   const mod=await import(t.module);
   if(!mod || typeof mod.mount!=="function") throw new Error("Tool module has no mount() function.");
   mod.mount(document.querySelector("#tool-mount"));
 } catch(err) {
   console.error("Toolzy tool load failed:", t.id, err);
   document.querySelector("#tool-mount").innerHTML=`<div class="empty"><strong>Could not load this tool.</strong><p>${escapeHtml(err?.message || "Unknown module error")}</p><button class="primary" id="retry-tool">Retry</button></div>`;
   document.querySelector("#retry-tool").onclick=()=>renderTool(t.id);
 }
}

function updateActiveNav(r){
  const current=r[0]||"";
  document.querySelectorAll(".nav-item,.bottom-nav button").forEach(b=>{
    const path=b.dataset.nav||"/";
    const active=current ? path===`/${current}` : path==="/";
    b.classList.toggle("active",active);
    if(active) b.setAttribute("aria-current","page"); else b.removeAttribute("aria-current");
  });
}

function renderNotFound(){document.querySelector("#main").innerHTML=`<div class="empty"><h1>404</h1><p>This Toolzy page doesn't exist yet.</p><button class="primary" data-nav="/">Go home</button></div>`;bindNav()}
function bindNav(){document.querySelectorAll("[data-nav]").forEach(b=>b.onclick=()=>navigate(b.dataset.nav))}
function bindToolCards(){document.querySelectorAll("[data-tool]").forEach(b=>b.onclick=()=>{const t=getTool(b.dataset.tool);navigate("/"+t.category+"/"+t.id)})}
function escapeHtml(s){return s.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
