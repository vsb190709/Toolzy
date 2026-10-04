export function mount(el){
  el.innerHTML=`
    <section class="tool-form graph-tool graph-pro">
      <div class="graph-pro-head">
        <div>
          <p class="eyebrow">Calculator · Graphing</p>
          <h2>Function Grapher</h2>
          <p class="tool-note">Plot functions, change the viewing window and inspect the curve on an interactive coordinate plane.</p>
        </div>
        <div class="graph-status" id="status">Ready</div>
      </div>

      <div class="graph-editor">
        <div class="equation-field field">
          <span>Function</span>
          <div class="equation-input">
            <span>y =</span>
            <input id="expr" value="x^2 - 4" spellcheck="false" autocomplete="off" aria-label="Function expression">
          </div>
        </div>
        <div class="graph-actions">
          <button class="primary" id="plot">Plot</button>
          <button class="secondary" id="reset">Reset</button>
        </div>
      </div>

      <div class="graph-presets" aria-label="Examples">
        <button data-e="x^2" class="chip">x²</button>
        <button data-e="x^3" class="chip">x³</button>
        <button data-e="sin(x)" class="chip">sin(x)</button>
        <button data-e="cos(x)" class="chip">cos(x)</button>
        <button data-e="tan(x)" class="chip">tan(x)</button>
        <button data-e="2*x+3" class="chip">2x + 3</button>
        <button data-e="sqrt(x)" class="chip">√x</button>
        <button data-e="abs(x)" class="chip">|x|</button>
      </div>

      <div class="graph-canvas-wrap graph-pro-canvas">
        <canvas id="canvas" aria-label="Function graph"></canvas>
        <div class="graph-overlay" id="overlay" hidden></div>
      </div>

      <div class="graph-controls">
        <label class="field"><span>Minimum X</span><input id="xmin" type="number" value="-10" step="1"></label>
        <label class="field"><span>Maximum X</span><input id="xmax" type="number" value="10" step="1"></label>
        <label class="field"><span>Minimum Y</span><input id="ymin" type="number" value="" step="1" placeholder="Auto"></label>
        <label class="field"><span>Maximum Y</span><input id="ymax" type="number" value="" step="1" placeholder="Auto"></label>
      </div>

      <div class="graph-options">
        <label class="graph-check"><input id="grid" type="checkbox" checked><span>Grid</span></label>
        <label class="graph-check"><input id="axes" type="checkbox" checked><span>Axes</span></label>
        <label class="graph-check"><input id="labels" type="checkbox" checked><span>Axis labels</span></label>
        <button class="secondary" id="zoom-in">Zoom in</button>
        <button class="secondary" id="zoom-out">Zoom out</button>
      </div>

      <div class="result-card compact">
        <span class="result-label">Graph</span>
        <strong id="out">y = x² - 4</strong>
        <p class="result-meta" id="range">Window: x −10 to 10 · y auto</p>
      </div>
    </section>`;

  const q=s=>el.querySelector(s);
  const canvas=q("#canvas"),ctx=canvas.getContext("2d");
  const rootStyle=()=>getComputedStyle(document.documentElement);
  const color=name=>rootStyle().getPropertyValue(name).trim();
  const state={xmin:-10,xmax:10,ymin:null,ymax:null};

  function compile(raw){
    let s=raw.trim().toLowerCase().replaceAll("π","pi").replace(/\^/g,"**");
    s=s.replace(/\bsin\(/g,"Math.sin(").replace(/\bcos\(/g,"Math.cos(")
      .replace(/\btan\(/g,"Math.tan(").replace(/\bsqrt\(/g,"Math.sqrt(")
      .replace(/\babs\(/g,"Math.abs(").replace(/\blog\(/g,"Math.log(")
      .replace(/\blog10\(/g,"Math.log10(").replace(/\bexp\(/g,"Math.exp(")
      .replace(/\bpi\b/g,"Math.PI").replace(/\be\b/g,"Math.E");
    s=s.replace(/(\d|x)\s*(?=x|\()/g,"$1*");
    if(!/^[0-9x+\-*/().,\sA-Za-z*]+$/.test(s)) throw Error("Unsupported characters in function.");
    return new Function("x",`return (${s})`);
  }

  function draw(){
    const raw=q("#expr").value.trim();
    const xmin=Number(q("#xmin").value),xmax=Number(q("#xmax").value);
    if(!(xmax>xmin)) throw Error("Maximum X must be greater than minimum X.");
    const fn=compile(raw);
    const w=Math.max(820,canvas.clientWidth||820),h=500,dpr=devicePixelRatio||1;
    canvas.width=w*dpr;canvas.height=h*dpr;canvas.style.height=h+"px";
    ctx.setTransform(dpr,0,0,dpr,0,0);

    const sampled=[];
    for(let i=0;i<=2400;i++){
      const x=xmin+(xmax-xmin)*i/2400;
      let y;
      try{y=fn(x)}catch{y=NaN}
      sampled.push([x,Number.isFinite(y)&&Math.abs(y)<1e9?y:NaN]);
    }
    const finite=sampled.filter(p=>Number.isFinite(p[1]));
    if(!finite.length) throw Error("No plottable points in this range.");

    let ymin=Number(q("#ymin").value),ymax=Number(q("#ymax").value);
    if(!Number.isFinite(ymin)||!Number.isFinite(ymax)){
      const values=finite.map(p=>p[1]).sort((a,b)=>a-b);
      const lo=values[Math.floor(values.length*.02)],hi=values[Math.floor(values.length*.98)];
      const span=Math.max(1,hi-lo);
      ymin=lo-span*.12;ymax=hi+span*.12;
    }
    if(!(ymax>ymin)) throw Error("Maximum Y must be greater than minimum Y.");

    const X=x=>(x-xmin)/(xmax-xmin)*w;
    const Y=y=>h-(y-ymin)/(ymax-ymin)*h;
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle=color("--surface-container-low")||"#f7f2fa";ctx.fillRect(0,0,w,h);

    const grid=color("--outline-variant")||"#cac4d0";
    if(q("#grid").checked){
      ctx.strokeStyle=grid;ctx.lineWidth=1;
      const xStep=niceStep((xmax-xmin)/10),yStep=niceStep((ymax-ymin)/8);
      for(let x=Math.ceil(xmin/xStep)*xStep;x<=xmax;x+=xStep){const px=X(x);ctx.beginPath();ctx.moveTo(px,0);ctx.lineTo(px,h);ctx.stroke()}
      for(let y=Math.ceil(ymin/yStep)*yStep;y<=ymax;y+=yStep){const py=Y(y);ctx.beginPath();ctx.moveTo(0,py);ctx.lineTo(w,py);ctx.stroke()}
    }

    if(q("#axes").checked){
      ctx.strokeStyle=color("--on-surface-variant")||"#49454f";ctx.lineWidth=1.5;
      if(xmin<=0&&xmax>=0){ctx.beginPath();ctx.moveTo(X(0),0);ctx.lineTo(X(0),h);ctx.stroke()}
      if(ymin<=0&&ymax>=0){ctx.beginPath();ctx.moveTo(0,Y(0));ctx.lineTo(w,Y(0));ctx.stroke()}
    }

    if(q("#labels").checked){
      ctx.fillStyle=color("--on-surface-variant")||"#49454f";ctx.font="12px system-ui";
      const xStep=niceStep((xmax-xmin)/8),yStep=niceStep((ymax-ymin)/6);
      if(ymin<=0&&ymax>=0) for(let x=Math.ceil(xmin/xStep)*xStep;x<=xmax;x+=xStep){if(Math.abs(x)<1e-10)continue;ctx.fillText(formatNum(x),X(x)+4,Y(0)-7)}
      if(xmin<=0&&xmax>=0) for(let y=Math.ceil(ymin/yStep)*yStep;y<=ymax;y+=yStep){if(Math.abs(y)<1e-10)continue;ctx.fillText(formatNum(y),X(0)+6,Y(y)-4)}
    }

    ctx.strokeStyle=color("--primary")||"#6750a4";ctx.lineWidth=3;ctx.lineJoin="round";ctx.lineCap="round";ctx.beginPath();
    let prev=null;
    for(const [x,y] of sampled){
      if(!Number.isFinite(y)){prev=null;continue}
      const px=X(x),py=Y(y);
      if(py<-h*2||py>h*3){prev=null;continue}
      if(!prev||Math.abs(py-prev[1])>h*.65)ctx.moveTo(px,py);else ctx.lineTo(px,py);
      prev=[px,py];
    }
    ctx.stroke();

    q("#out").textContent=`y = ${raw||"…"}`;
    q("#range").textContent=`Window: x ${formatNum(xmin)} to ${formatNum(xmax)} · y ${formatNum(ymin)} to ${formatNum(ymax)}`;
    q("#status").textContent="Plotted";
  }

  function niceStep(raw){
    const p=Math.pow(10,Math.floor(Math.log10(Math.max(raw,1e-9))));
    const n=raw/p;return (n<=1?1:n<=2?2:n<=5?5:10)*p;
  }
  function formatNum(n){return Number(n.toFixed(6)).toString()}
  function zoom(factor){
    const cx=(state.xmin+state.xmax)/2,cy=(state.ymin??0)+(state.ymax??0)/2;
    const span=(state.xmax-state.xmin)*factor;
    state.xmin=cx-span/2;state.xmax=cx+span/2;
    q("#xmin").value=state.xmin;q("#xmax").value=state.xmax;
    try{draw()}catch(e){q("#status").textContent=e.message}
  }
  function syncState(){
    state.xmin=Number(q("#xmin").value);state.xmax=Number(q("#xmax").value);
    state.ymin=q("#ymin").value===""?null:Number(q("#ymin").value);
    state.ymax=q("#ymax").value===""?null:Number(q("#ymax").value);
  }

  q("#plot").onclick=()=>{try{syncState();draw()}catch(e){q("#status").textContent=e.message}};
  q("#reset").onclick=()=>{q("#expr").value="x^2 - 4";q("#xmin").value=-10;q("#xmax").value=10;q("#ymin").value="";q("#ymax").value="";q("#grid").checked=true;q("#axes").checked=true;q("#labels").checked=true;syncState();draw()};
  q("#zoom-in").onclick=()=>{syncState();zoom(.75)};
  q("#zoom-out").onclick=()=>{syncState();zoom(1.35)};
  el.querySelectorAll(".chip").forEach(b=>b.onclick=()=>{q("#expr").value=b.dataset.e;try{syncState();draw()}catch(e){q("#status").textContent=e.message}});
  ["xmin","xmax","ymin","ymax","grid","axes","labels"].forEach(id=>q("#"+id).addEventListener("change",()=>{try{syncState();draw()}catch(e){q("#status").textContent=e.message}}));
  q("#expr").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();q("#plot").click()}});
  addEventListener("resize",()=>{try{syncState();draw()}catch{}});
  syncState();draw();
}