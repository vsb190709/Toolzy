import {icon} from "../../core/icons.js";
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, c => ({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
}[c]));

const qs = (root, selector) => {
  if (!root || typeof root.querySelector !== "function") {
    throw new TypeError("Tool mount root is not a DOM element.");
  }
  return root.querySelector(selector);
};

const qsa = (root, selector) => [...root.querySelectorAll(selector)];

const copy = async (text) => {
  try { await navigator.clipboard.writeText(String(text ?? "")); return true; }
  catch { return false; }
};

const shell = (title, desc, body) => `
  <section class="dev-tool">
    <div class="dev-panel">
      <header class="dev-heading">
        <div class="dev-heading-icon" aria-hidden="true">${icon("code")}</div>
        <div class="dev-heading-copy">
          <div class="dev-kicker">Developer tool</div>
          <h2>${esc(title)}</h2>
          <p>${esc(desc)}</p>
        </div>
      </header>
      <div class="dev-content">${body}</div>
    </div>
  </section>`;

const textareaPair = (left = "Paste input…", right = "Result") => `
  <div class="dev-grid">
    <label class="dev-field">
      <span>Input</span>
      <textarea data-input placeholder="${esc(left)}"></textarea>
    </label>
    <label class="dev-field">
      <span>${esc(right)}</span>
      <pre data-output class="dev-output"></pre>
    </label>
  </div>
  <div class="dev-actions">
    <button class="primary" data-run>Run</button>
    <button class="secondary" data-copy>Copy output</button>
    <button class="secondary" data-clear>Clear</button>
  </div>`;

const setOutput = (root, value, ok = true) => {
  const out = qs(root, "[data-output]");
  out.textContent = String(value ?? "");
  out.classList.toggle("is-error", !ok);
  out.classList.toggle("is-ok", ok);
};

const bindTextTool = (root, title, desc, fn, placeholder = "Paste input…") => {
  root.innerHTML = shell(title, desc, textareaPair(placeholder));
  qs(root, "[data-run]").onclick = async () => {
    try { setOutput(root, await fn(qs(root, "[data-input]").value), true); }
    catch (e) { setOutput(root, e?.message || String(e), false); }
  };
  qs(root, "[data-copy]").onclick = () => copy(qs(root, "[data-output]").textContent);
  qs(root, "[data-clear]").onclick = () => {
    qs(root, "[data-input]").value = "";
    setOutput(root, "");
  };
};

const style = () => {
  if (document.getElementById("toolzy-developer-ui")) return;
  const s = document.createElement("style");
  s.id = "toolzy-developer-ui";
  s.textContent = `
    .dev-tool{display:grid;gap:18px}
    .dev-panel{overflow:hidden;background:var(--surface-container);border:1px solid var(--outline-variant);border-radius:28px;box-shadow:var(--shadow-1)}
    .dev-heading{display:flex;align-items:center;gap:15px;padding:22px 24px 18px;border-bottom:1px solid var(--outline-variant);background:var(--surface-1)}
    .dev-heading-icon{width:48px;height:48px;flex:none;display:grid;place-items:center;border-radius:15px;background:var(--primary-container);color:var(--on-primary-container)}
    .dev-heading-icon .material-symbols-rounded{font-size:24px}
    .dev-heading-copy{min-width:0}
    .dev-kicker{font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--primary)}
    .dev-heading h2{margin:3px 0 4px;font-size:clamp(22px,3vw,30px);line-height:1.2}
    .dev-heading p{margin:0;color:var(--on-surface-variant);font-size:14px}
    .dev-content{padding:24px}
    .dev-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}
    .dev-field{display:grid;gap:8px;font-weight:700;font-size:13px}
    .dev-field>span{color:var(--on-surface-variant);font-size:12px;font-weight:800}
    .dev-field textarea,.dev-input,.dev-select{width:100%;box-sizing:border-box;border:1px solid var(--outline);border-radius:16px;padding:13px 14px;background:var(--surface);color:var(--on-surface);outline:none;font:inherit;transition:border-color .16s,box-shadow .16s,background .16s}
    .dev-field textarea{min-height:290px;resize:vertical;font:500 14px/1.55 ui-monospace,SFMono-Regular,Consolas,monospace}
    .dev-field textarea:hover,.dev-input:hover,.dev-select:hover{background:var(--surface-2)}
    .dev-field textarea:focus,.dev-input:focus,.dev-select:focus{border-color:var(--primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 14%,transparent);background:var(--surface)}
    .dev-output{min-height:260px;margin:0;white-space:pre-wrap;overflow:auto;border:1px solid var(--outline);border-radius:16px;padding:13px 14px;background:var(--surface);color:var(--on-surface);font:500 14px/1.55 ui-monospace,SFMono-Regular,Consolas,monospace}
    .dev-output:empty::before{content:"Your result will appear here";color:var(--on-surface-variant);opacity:.7}
    .dev-output.is-error{border-color:var(--error);background:var(--error-container);color:var(--on-error-container)}
    .dev-actions,.dev-row{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:16px}
    .dev-actions .primary,.dev-actions .secondary{min-height:44px}
    .dev-row>*{flex:1 1 180px}
    .dev-card-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:12px;margin-top:16px}
    .dev-card{padding:16px;border:1px solid var(--outline-variant);border-radius:18px;background:var(--surface-1)}
    .dev-card strong{display:block;margin-bottom:6px;color:var(--on-surface)}
    .dev-card span{color:var(--on-surface-variant);overflow-wrap:anywhere}
    .dev-muted{color:var(--on-surface-variant)}
    .dev-preview{min-height:280px;padding:18px;border:1px solid var(--outline);border-radius:18px;overflow:auto;background:var(--surface)}
    @media(max-width:760px){
      .dev-panel{border-radius:22px}
      .dev-heading{padding:18px 18px 16px}
      .dev-heading-icon{width:44px;height:44px;border-radius:14px}
      .dev-heading-icon .material-symbols-rounded{font-size:22px}
      .dev-content{padding:18px}
      .dev-grid{grid-template-columns:1fr}
      .dev-field textarea{min-height:220px}
      .dev-output{min-height:210px}
      .dev-actions>*{flex:1 1 calc(50% - 10px)}
    }
  `;
  document.head.appendChild(s);
};

const button = (label, cls="secondary", attrs="") => `<button class="${cls}" ${attrs}>${esc(label)}</button>`;

const formatJson = (s, space=2) => JSON.stringify(JSON.parse(s), null, space);

const csvParse = (s) => {
  const rows=[]; let row=[], cell="", quoted=false;
  for(let i=0;i<s.length;i++){
    const c=s[i];
    if(c === '"'){
      if(quoted && s[i+1] === '"'){cell+='"';i++;} else quoted=!quoted;
    } else if(c === "," && !quoted){row.push(cell);cell="";}
    else if((c === "\n" || c === "\r") && !quoted){
      if(c === "\r" && s[i+1] === "\n") i++;
      row.push(cell); if(row.some(v=>v!=="")) rows.push(row);
      row=[];cell="";
    } else cell+=c;
  }
  row.push(cell); if(row.some(v=>v!=="")) rows.push(row);
  return rows;
};

const csvString = rows => rows.map(row => row.map(v => {
  const s=String(v ?? ""); return /[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s;
}).join(",")).join("\n");

const bytesToHex = b => [...b].map(x=>x.toString(16).padStart(2,"0")).join("");

const randomBytes = n => { const a=new Uint8Array(n); crypto.getRandomValues(a); return a; };

const uuidV4 = () => {
  const a=randomBytes(16); a[6]=(a[6]&15)|64; a[8]=(a[8]&63)|128;
  const h=[...a].map(x=>x.toString(16).padStart(2,"0"));
  return `${h.slice(0,4).join("")}-${h.slice(4,6).join("")}-${h.slice(6,8).join("")}-${h.slice(8,10).join("")}-${h.slice(10).join("")}`;
};

const digest = async (algorithm, text) => {
  const b = await crypto.subtle.digest(algorithm, new TextEncoder().encode(text));
  return bytesToHex(new Uint8Array(b));
};

const hmac = async (algorithm, key, text) => {
  const k=await crypto.subtle.importKey("raw",new TextEncoder().encode(key),{name:"HMAC",hash:algorithm},false,["sign"]);
  const b=await crypto.subtle.sign("HMAC",k,new TextEncoder().encode(text));
  return bytesToHex(new Uint8Array(b));
};

export { esc, qs, qsa, copy, shell, textareaPair, setOutput, bindTextTool, style, button,
  formatJson, csvParse, csvString, bytesToHex, randomBytes, uuidV4, digest, hmac };
