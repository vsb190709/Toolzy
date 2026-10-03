import { bindTextTool, style } from "./helpers.js";
export function mount(root,t){style();bindTextTool(root,t.name,t.description,v=>{JSON.parse(v);return "Valid JSON ✓";},'Paste JSON to validate…');}