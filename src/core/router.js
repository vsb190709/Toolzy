import { renderRoute } from "./app.js";

function basePath(){
  const marker = "/toolzy";
  const p = location.pathname;
  const i = p.indexOf(marker);
  return i === 0 ? marker : "";
}

function cleanPath(){
  const base = basePath();
  let p = location.pathname.replace(/\/+$/,"") || "/";
  if (base && p === base) return "/";
  if (base && p.startsWith(base + "/")) return p.slice(base.length);
  return p;
}

export function route(){
  return cleanPath().split("/").filter(Boolean);
}

export function navigate(path){
  const target = path.startsWith("/") ? path : "/" + path;
  const base = basePath();
  history.pushState({}, "", base + (target === "/" ? "/" : target));
  renderRoute(route());
}

export function startRouter(){
  addEventListener("popstate", () => renderRoute(route()));
  renderRoute(route());
}
