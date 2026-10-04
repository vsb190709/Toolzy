import fs from "node:fs";
import path from "node:path";
import {execFileSync} from "node:child_process";
import {pathToFileURL} from "node:url";

const root=process.cwd();
const errors=[];
const fail=(msg)=>errors.push(msg);
const walk=(dir)=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{
  const p=path.join(dir,e.name);
  return e.isDirectory()?walk(p):[p];
});
const jsFiles=walk(path.join(root,"src")).filter(p=>p.endsWith(".js"));

for(const file of jsFiles){
  try{execFileSync(process.execPath,["--check",file],{stdio:["ignore","pipe","pipe"]})}
  catch(e){fail("Syntax error: "+path.relative(root,file)+"\n"+String(e.stderr||e.stdout||e))}
}

const registryUrl=pathToFileURL(path.join(root,"src/core/registry.js")).href;
const registry=await import(registryUrl);
const categories=registry.categories;
const tools=registry.tools;
const categoryIds=new Set();
for(const c of categories){
  if(categoryIds.has(c.id)) fail("Duplicate category id: "+c.id);
  categoryIds.add(c.id);
}
const toolIds=new Set();
for(const t of tools){
  if(toolIds.has(t.id)) fail("Duplicate tool id: "+t.id);
  toolIds.add(t.id);
  if(!categoryIds.has(t.category)) fail("Unknown category for "+t.id+": "+t.category);
  const c=categories.find(x=>x.id===t.category);
  if(t.subcategory && !c?.subcategories?.some(s=>s.id===t.subcategory))
    fail("Unknown subcategory for "+t.id+": "+t.subcategory);
  const moduleUrl=new URL(t.module,pathToFileURL(path.join(root,"src/core/registry.js")));
  const modulePath=moduleUrl.pathname;
  if(!fs.existsSync(modulePath)) fail("Missing module for "+t.id+": "+t.module);
  else {
    try{
      const mod=await import(moduleUrl.href);
      if(typeof mod.mount!=="function") fail("No mount() export: "+t.id);
    }catch(e){fail("Module import failed: "+t.id+" -> "+e.message)}
  }
}

const iconSource=fs.readFileSync(path.join(root,"src/core/icons.js"),"utf8");
const aliasKeys=new Set([...iconSource.matchAll(/^\s*(?:"([^"]+)"|([A-Za-z0-9_-]+))\s*:/gm)].map(m=>m[1]||m[2]));
const iconNames=[...categories.map(c=>c.icon),...categories.flatMap(c=>(c.subcategories||[]).map(s=>s.icon)),...tools.map(t=>t.icon)];
for(const name of iconNames) if(!aliasKeys.has(name)) fail("Missing icon alias: "+name);

for(const file of walk(path.join(root,"src")).filter(p=>p.endsWith(".js"))){
  const rel=path.relative(root,file);
  const text=fs.readFileSync(file,"utf8");
  if(file!==path.join(root,"src/core/icons.js") && /class=["']material-symbols-rounded["'][^>]*>[^<]+</.test(text))
    fail("Raw Material Symbols ligature markup outside icons.js: "+rel);
  if(/innerHTML\s*=\s*'[^;]*\$\{(?:icon|art)\(/s.test(text))
    fail("Single-quoted innerHTML contains interpolation: "+rel);
}
const mustMatch=[
  ["index.html",/main\.css\?v=35/],
  ["index.html",/app\.js\?v=35/],
  ["404.html",/main\.css\?v=35/],
  ["404.html",/app\.js\?v=35/],
  ["src/core/app.js",/v1\.35/],
  ["src/core/pwa.js",/build=35/],
  ["sw.js",/toolzy-shell-v35/],
  ["sw.js",/main\.css\?v=35/],
  ["sw.js",/registry\.js\?v=35/]
];
for(const [file,re] of mustMatch){
  const text=fs.readFileSync(path.join(root,file),"utf8");
  if(!re.test(text)) fail("Release version mismatch: "+file);
}
const stale=/\?(?:v=3[0-4])\b|\bv1\.(?:3[0-4])\b|\bbuild=3[0-4]\b|toolzy-shell-v3[0-4]\b/;
for(const file of [...walk(root)].filter(p=>/\.(?:js|html|css|webmanifest)$/.test(p))){
  const text=fs.readFileSync(file,"utf8");
  if(stale.test(text)) fail("Stale pre-1.35 cache/version reference: "+path.relative(root,file));
}

if(errors.length){
  console.error("\nToolzy 1.35 QA FAILED\n");
  console.error(errors.join("\n\n"));
  process.exit(1);
}
console.log("Toolzy 1.35 QA PASS");
console.log("JavaScript files checked:",jsFiles.length);
console.log("Registry tools checked:",tools.length);
console.log("Modules imported:",tools.length);
console.log("Categories checked:",categories.length);
