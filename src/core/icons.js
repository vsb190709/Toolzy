// Toolzy — Google Material Symbols Rounded
const aliases = {
  home:"home",
  build:"build",
  gear:"settings",
  settings:"settings",
  text:"text_fields",
  calculator:"calculate",
  show_chart:"show_chart",
  currency_exchange:"currency_exchange",
  show_chart:"show_chart",
  percent:"percent",
  swap:"swap_horiz",
  code:"code",
  image:"image",
  pdf:"picture_as_pdf",
  folder:"folder",
  lock:"lock",
  search:"search",
  back:"arrow_back",
  "arrow-left":"arrow_back",
  arrow:"arrow_forward",
  "arrow-right":"arrow_forward",
  percent:"percent",
  calendar:"calendar_month",
  clock:"schedule",
  star:"star",
  check:"check",
  close:"close",
  download:"download",
  upload:"upload",
  pencil:"edit",
  edit:"edit",
  dice:"casino",
  robot:"smart_toy",
  palette:"palette",
  scroll:"article",
  package:"inventory_2",
  "shield-cross":"shield",
  shield:"shield",
  at:"alternate_email",
  link:"link",
  broom:"cleaning_services",
  id:"badge",
  trash:"delete",
  menu:"menu",
  dark_mode:"dark_mode",
  light_mode:"light_mode"
};

function esc(value){
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

export function icon(name,label=""){
  const glyph = aliases[name] || name;
  const aria = label
    ? ` aria-label="${esc(label)}" role="img"`
    : ' aria-hidden="true"';
  return `<span class="material-symbols-rounded"${aria}>${esc(glyph)}</span>`;
}

export function art(name,label="",extra=""){
  return `<span class="material-art ${esc(extra)}" aria-hidden="true">${icon(name,label)}</span>`;
}
