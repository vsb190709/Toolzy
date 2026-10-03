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
      <div class="dev-heading">
        <div class="dev-kicker">Developer tool</div>
        <h2>${esc(title)}</h2>
        <p>${esc(desc)}</p>
      </div>
      ${body}
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
    .dev-tool{display:grid;gap:16px}
    .dev-panel{background:var(--surface,#fff);border:1px solid var(--border,#ddd);border-radius:24px;padding:20px;box-shadow:0 2px 10px rgba(0,0,0,.05)}
    .dev-heading{margin-bottom:18px}.dev-kicker{font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;opacity:.65}
    .dev-heading h2{margin:4px 0 4px;font-size:clamp(24px,4vw,34px)}.dev-heading p{margin:0;opacity:.72}
    .dev-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.dev-field{display:grid;gap:8px;font-weight:700;font-size:13px}
    .dev-field>span{opacity:.75}.dev-field textarea,.dev-input,.dev-select{width:100%;box-sizing:border-box;border:1px solid var(--border,#ddd);border-radius:16px;padding:13px 14px;background:var(--surface-container,#f7f7f7);color:inherit;outline:none;font:inherit}
    .dev-field textarea{min-height:280px;resize:vertical;font:500 14px/1.55 ui-monospace,SFMono-Regular,Consolas,monospace}
    .dev-field textarea:focus,.dev-input:focus,.dev-select:focus{border-color:var(--primary,#6750a4);box-shadow:0 0 0 3px color-mix(in srgb,var(--primary,#6750a4) 16%,transparent)}
    .dev-output{min-height:250px;margin:0;white-space:pre-wrap;overflow:auto;border:1px solid var(--border,#ddd);border-radius:16px;padding:13px 14px;background:var(--surface-container,#f7f7f7);font:500 14px/1.55 ui-monospace,SFMono-Regular,Consolas,monospace}
    .dev-output.is-error{border-color:#c84b4b}.dev-output.is-ok{border-color:#4b9a68}
    .dev-actions,.dev-row{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:14px}.dev-row>*{flex:1 1 180px}
    .dev-card-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px;margin-top:14px}
    .dev-card{padding:14px;border:1px solid var(--border,#ddd);border-radius:16px;background:var(--surface-container,#f7f7f7)}
    .dev-card strong{display:block;margin-bottom:5px}.dev-muted{opacity:.7}.dev-preview{min-height:280px;padding:18px;border:1px solid var(--border,#ddd);border-radius:16px;overflow:auto;background:var(--surface,#fff)}
    @media(max-width:760px){.dev-grid{grid-template-columns:1fr}.dev-panel{padding:15px;border-radius:20px}}
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
