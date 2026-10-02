const KEY="toolzy-state-v1";
const defaults={favorites:[],recent:[],theme:"system"};
export function loadState(){try{return {...defaults,...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{return {...defaults}}}
export function saveState(s){localStorage.setItem(KEY,JSON.stringify(s))}
export function toggleFavorite(id){const s=loadState();s.favorites=s.favorites.includes(id)?s.favorites.filter(x=>x!==id):[...s.favorites,id];saveState(s);return s}
export function addRecent(id){const s=loadState();s.recent=[id,...s.recent.filter(x=>x!==id)].slice(0,12);saveState(s);return s}
export function setTheme(theme){const s=loadState();s.theme=theme;saveState(s);applyTheme(theme)}
export function applyTheme(theme=loadState().theme){document.documentElement.dataset.theme=theme}
