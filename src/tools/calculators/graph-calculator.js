export function mount(el){
  el.innerHTML=`
    <div class="tool-form graph-tool">
      <div class="graph-topbar">
        <div class="equation-field field"><span>Function</span><div class="equation-input"><span>y =</span><input id="expr" value="x^2 - 4" spellcheck="false" autocomplete="off"></div></div>
        <button class="primary" id="plot">Plot graph</button>
      </div>
      <div class="graph-presets" aria-label="Examples">
        <button data-e="x^2" class="chip">x²</button><button data-e="sin(x)" class="chip">sin(x)</button><button data-e="cos(x)" class="chip">cos(x)</button><button data-e="2*x+3" class="chip">2x + 3</button><button data-e="sqrt(x)" class="chip">√x</button>
      </div>
      <div class="graph-canvas-wrap"><canvas id="canvas"></canvas></div>
      <div class="graph-controls">
        <label class="field"><span>Minimum X</span><input id="xmin" type="number" value="-10" step="1"></label>
        <label class="field"><span>Maximum X</span><input id="xmax" type="number" value="10" step="1"></label>
        <button class="secondary" id="reset">Reset view</button>
      </div>
      <div class="result-card compact"><span class="result-label">Graph</span><strong id="out">Ready to plot.</strong></div>
    </div>`;
  const q=s=>el.querySelector(s), canvas=q("#canvas"), ctx=canvas.getContext("2d");
  function compile(raw){
    let s=raw.trim().toLowerCase().replaceAll("π","pi").replace(/\^/g,"**");
    s=s.replace(/\bsin\(/g,"Math.sin(").replace(/\bcos\(/g,"Math.cos(").replace(/\btan\(/g,"Math.tan(").replace(/\bsqrt\(/g,"Math.sqrt(").replace(/\babs\(/g,"Math.abs(").replace(/\blog\(/g,"Math.log(").replace(/\bexp\(/g,"Math.exp(").replace(/\bpi\b/g,"Math.PI").replace(/\be\b/g,"Math.E");
    if(!/^[0-9x+\-*/().,\sA-Za-z*]+$/.test(s)) throw Error("Unsupported characters in function.");
    return new Function("x",`return (${s})`);
  }
  function draw(){
    let fn=compile(q("#expr").value), xmin=Number(q("#xmin").value), xmax=Number(q("#xmax").value);
    if(!(xmax>xmin)) throw Error("Maximum X must be greater than minimum X.");
    const w=Math.max(760,canvas.clientWidth||760),h=470,dpr=devicePixelRatio||1;canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
    const pts=[];for(let i=0;i<=1400;i++){const x=xmin+(xmax-xmin)*i/1400;let y;try{y=fn(x)}catch{y=NaN}if(Number.isFinite(y)&&Math.abs(y)<1e6)pts.push([x,y]);}
    if(!pts.length) throw Error("No plottable points in this range.");
    const maxY=Math.max(1,...pts.map(p=>Math.abs(p[1]))), ymin=-maxY*1.1,ymax=maxY*1.1;
    const X=x=>(x-xmin)/(xmax-xmin)*w, Y=y=>h-(y-ymin)/(ymax-ymin)*h;
    ctx.clearRect(0,0,w,h);ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue("--surface-container-low")||"#f7f2fa";ctx.fillRect(0,0,w,h);
    ctx.strokeStyle=getComputedStyle(document.documentElement).getPropertyValue("--outline-variant")||"#cac4d0";ctx.lineWidth=1;
    for(let i=0;i<=10;i++){const gx=i*w/10,gy=i*h/10;ctx.beginPath();ctx.moveTo(gx,0);ctx.lineTo(gx,h);ctx.moveTo(0,gy);ctx.lineTo(w,gy);ctx.stroke();}
    const axis=getComputedStyle(document.documentElement).getPropertyValue("--on-surface-variant")||"#49454f";ctx.strokeStyle=axis;ctx.lineWidth=1.5;
    if(xmin<=0&&xmax>=0){ctx.beginPath();ctx.moveTo(X(0),0);ctx.lineTo(X(0),h);ctx.stroke();}
    if(ymin<=0&&ymax>=0){ctx.beginPath();ctx.moveTo(0,Y(0));ctx.lineTo(w,Y(0));ctx.stroke();}
    ctx.strokeStyle=getComputedStyle(document.documentElement).getPropertyValue("--primary")||"#6750a4";ctx.lineWidth=3;ctx.lineJoin="round";ctx.lineCap="round";ctx.beginPath();let prev=null;
    for(const [x,y] of pts){const px=X(x),py=Y(y);if(py< -1000||py>h+1000){prev=null;continue}if(!prev||Math.abs(py-prev[1])>h*.9){ctx.moveTo(px,py)}else ctx.lineTo(px,py);prev=[px,py];}ctx.stroke();
    q("#out").textContent=`y = ${q("#expr").value} · x from ${xmin} to ${xmax}`;
  }
  q("#plot").onclick=()=>{try{draw()}catch(e){q("#out").textContent=e.message}};
  q("#reset").onclick=()=>{q("#xmin").value=-10;q("#xmax").value=10;draw()};
  el.querySelectorAll(".chip").forEach(b=>b.onclick=()=>{q("#expr").value=b.dataset.e;draw()});
  addEventListener("resize",()=>{try{draw()}catch{}});draw();
}