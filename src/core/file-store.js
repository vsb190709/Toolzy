const DB_NAME="toolzy-files-v1";
const STORE="files";
let dbPromise;
function db(){
  if(dbPromise)return dbPromise;
  dbPromise=new Promise((resolve,reject)=>{
    const r=indexedDB.open(DB_NAME,1);
    r.onupgradeneeded=()=>r.result.createObjectStore(STORE,{keyPath:"id",autoIncrement:true});
    r.onsuccess=()=>resolve(r.result);
    r.onerror=()=>reject(r.error);
  });
  return dbPromise;
}
export async function putFiles(files){
  if(!files.length)return[];
  const d=await db();
  return new Promise((resolve,reject)=>{
    const tx=d.transaction(STORE,"readwrite"),s=tx.objectStore(STORE),ids=[];
    for(const file of files){
      const q=s.add({name:file.name,type:file.type||"",size:file.size,lastModified:file.lastModified||Date.now(),blob:file});
      q.onsuccess=()=>ids.push(q.result);
    }
    tx.oncomplete=()=>resolve(ids);
    tx.onerror=()=>reject(tx.error);
  });
}
export async function getFiles(){
  const d=await db();
  return new Promise((resolve,reject)=>{
    const q=d.transaction(STORE,"readonly").objectStore(STORE).getAll();
    q.onsuccess=()=>resolve(q.result||[]);
    q.onerror=()=>reject(q.error);
  });
}
export async function removeFile(id){
  const d=await db();
  return new Promise((resolve,reject)=>{
    const tx=d.transaction(STORE,"readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete=resolve;
    tx.onerror=()=>reject(tx.error);
  });
}
export async function clearFiles(){
  const d=await db();
  return new Promise((resolve,reject)=>{
    const tx=d.transaction(STORE,"readwrite");
    tx.objectStore(STORE).clear();
    tx.oncomplete=resolve;
    tx.onerror=()=>reject(tx.error);
  });
}
export async function workspaceSummary(){
  const rows=await getFiles();
  return {count:rows.length,bytes:rows.reduce((n,r)=>n+r.size,0)};
}
