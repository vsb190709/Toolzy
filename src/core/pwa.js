function appBase(){
  const p=location.pathname;
  return p==="/toolzy" || p.startsWith("/toolzy/") ? "/toolzy/" : "/";
}
export function registerServiceWorker(){
  if("serviceWorker" in navigator){
    const base=appBase();
    navigator.serviceWorker.register(base+"sw.js?build=34", {updateViaCache:"none"}).catch(()=>{});
  }
}
