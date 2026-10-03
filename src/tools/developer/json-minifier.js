import { bindTextTool, style, formatJson } from "./helpers.js";
export function mount(root,t){style();bindTextTool(root,t.name,t.description,v=>formatJson(v,0),'Paste JSON to minify…');}