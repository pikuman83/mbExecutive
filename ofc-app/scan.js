// On-device playing-card detector (YOLOv8 exported to ONNX, run with onnxruntime-web).
// Nothing leaves the phone: the model is downloaded once from this site and cached.
(function(){
  const MODEL_URL = "model/cards.onnx";
  const SIZE = 640;
  // Class order baked into the model (Ultralytics export metadata).
  const NAMES = ["10C","10D","10H","10S","2C","2D","2H","2S","3C","3D","3H","3S","4C","4D","4H","4S","5C","5D","5H","5S",
    "6C","6D","6H","6S","7C","7D","7H","7S","8C","8D","8H","8S","9C","9D","9H","9S","AC","AD","AH","AS",
    "JC","JD","JH","JS","KC","KD","KH","KS","QC","QD","QH","QS"];
  const CONF = 0.35, IOU = 0.5;

  let sessionPromise = null;

  async function fetchWithProgress(url, onStatus){
    const res = await fetch(url);
    if(!res.ok) throw new Error("Couldn't download the card reader (" + res.status + ").");
    const total = +res.headers.get("content-length") || 0;
    if(!res.body || !total) return new Uint8Array(await res.arrayBuffer());
    const reader = res.body.getReader();
    const buf = new Uint8Array(total);
    let got = 0;
    for(;;){
      const {done, value} = await reader.read();
      if(done) break;
      buf.set(value, got); got += value.length;
      onStatus && onStatus(`Downloading card reader… ${Math.round(got/total*100)}% (one time, ${Math.round(total/1e6)} MB)`);
    }
    return buf;
  }

  function getSession(onStatus){
    if(!sessionPromise){
      sessionPromise = (async ()=>{
        if(!window.ort) throw new Error("The card reader failed to load. Reload the page and try again.");
        ort.env.wasm.wasmPaths = new URL("vendor/", document.baseURI).href;
        ort.env.wasm.numThreads = 1;
        const bytes = await fetchWithProgress(MODEL_URL, onStatus);
        onStatus && onStatus("Starting card reader…");
        return ort.InferenceSession.create(bytes, {executionProviders:["wasm"], graphOptimizationLevel:"all"});
      })();
      sessionPromise.catch(()=>{ sessionPromise = null; });
    }
    return sessionPromise;
  }

  async function loadBitmap(file){
    try{ return await createImageBitmap(file, {imageOrientation:"from-image"}); }
    catch(e){
      const url = URL.createObjectURL(file);
      try{
        const img = new Image(); img.src = url; await img.decode(); return img;
      } finally { setTimeout(()=>URL.revokeObjectURL(url), 1000); }
    }
  }

  function toTensor(bitmap){
    const w = bitmap.width, h = bitmap.height;
    const r = Math.min(SIZE/w, SIZE/h), nw = Math.round(w*r), nh = Math.round(h*r);
    const px = Math.floor((SIZE-nw)/2), py = Math.floor((SIZE-nh)/2);
    const c = document.createElement("canvas"); c.width = SIZE; c.height = SIZE;
    const g = c.getContext("2d", {willReadFrequently:true});
    g.fillStyle = "rgb(114,114,114)"; g.fillRect(0,0,SIZE,SIZE);
    g.imageSmoothingQuality = "high";
    g.drawImage(bitmap, px, py, nw, nh);
    const d = g.getImageData(0,0,SIZE,SIZE).data;
    const n = SIZE*SIZE, f = new Float32Array(3*n);
    for(let i=0;i<n;i++){ f[i]=d[i*4]/255; f[n+i]=d[i*4+1]/255; f[2*n+i]=d[i*4+2]/255; }
    return {tensor:new ort.Tensor("float32", f, [1,3,SIZE,SIZE]), r, px, py};
  }

  function decode(out, dims, r, px, py){
    // out: [1, 4+52, N]
    const nc = dims[1]-4, N = dims[2];
    const boxes = [];
    for(let j=0;j<N;j++){
      let best = 0, bc = -1;
      for(let c=0;c<nc;c++){ const s = out[(4+c)*N+j]; if(s>best){ best=s; bc=c; } }
      if(best < CONF) continue;
      const cx = out[j], cy = out[N+j], w = out[2*N+j], h = out[3*N+j];
      boxes.push({c:bc, s:best, x1:(cx-w/2-px)/r, y1:(cy-h/2-py)/r, x2:(cx+w/2-px)/r, y2:(cy+h/2-py)/r});
    }
    boxes.sort((a,b)=>b.s-a.s);
    const keep = [];
    for(const b of boxes){
      let ok = true;
      for(const k of keep){
        const iw = Math.max(0, Math.min(b.x2,k.x2)-Math.max(b.x1,k.x1));
        const ih = Math.max(0, Math.min(b.y2,k.y2)-Math.max(b.y1,k.y1));
        const inter = iw*ih, u = (b.x2-b.x1)*(b.y2-b.y1)+(k.x2-k.x1)*(k.y2-k.y1)-inter;
        if(u>0 && inter/u > IOU){ ok=false; break; }
      }
      if(ok) keep.push(b);
    }
    return keep;
  }

  // Convert "10H" / "QS" to the app's "Th" / "Qs".
  const toCode = n => (n.startsWith("10") ? "T" : n[0]) + n.slice(-1).toLowerCase();

  // One card is often found twice (both corner indices). Merge by card,
  // then split the cards into three rows by the two largest vertical gaps.
  function arrange(dets){
    const byCard = new Map();
    for(const d of dets){
      const code = toCode(NAMES[d.c]);
      const cx = (d.x1+d.x2)/2, cy = (d.y1+d.y2)/2;
      const e = byCard.get(code);
      if(!e) byCard.set(code, {code, s:d.s, xs:[cx], ys:[cy]});
      else { e.s = Math.max(e.s, d.s); e.xs.push(cx); e.ys.push(cy); }
    }
    const cards = [...byCard.values()].map(e=>({code:e.code, s:e.s,
      x:Math.min(...e.xs), y:e.ys.reduce((a,b)=>a+b,0)/e.ys.length}));
    cards.sort((a,b)=>a.y-b.y);
    let groups = [cards];
    if(cards.length >= 3){
      const gaps = [];
      for(let i=1;i<cards.length;i++) gaps.push({i, g:cards[i].y-cards[i-1].y});
      const cuts = gaps.sort((a,b)=>b.g-a.g).slice(0,2).map(g=>g.i).sort((a,b)=>a-b);
      groups = [cards.slice(0,cuts[0]), cards.slice(cuts[0],cuts[1]), cards.slice(cuts[1])];
    }
    // If one group is far too big for its row, prefer the 3/5/5 split by position.
    const sizes = groups.map(g=>g.length);
    if(cards.length===13 && (sizes[0]!==3 || sizes[1]!==5)) groups = [cards.slice(0,3), cards.slice(3,8), cards.slice(8)];
    const byX = g => g.slice().sort((a,b)=>a.x-b.x);
    const [top=[], middle=[], bottom=[]] = groups.map(byX);
    return {top:top.slice(0,3), middle:middle.slice(0,5), bottom:bottom.slice(0,5), all:cards,
      extra:[...top.slice(3), ...middle.slice(5), ...bottom.slice(5)]};
  }

  function draw(canvas, bitmap, dets){
    const maxW = 900, sc = Math.min(1, maxW/bitmap.width);
    canvas.width = Math.round(bitmap.width*sc); canvas.height = Math.round(bitmap.height*sc);
    const g = canvas.getContext("2d");
    g.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    g.lineWidth = 3; g.font = "bold 16px system-ui,sans-serif";
    for(const d of dets){
      const x = d.x1*sc, y = d.y1*sc, w = (d.x2-d.x1)*sc, h = (d.y2-d.y1)*sc;
      g.strokeStyle = "#E0B35A"; g.strokeRect(x,y,w,h);
      const label = toCode(NAMES[d.c]);
      const tw = g.measureText(label).width + 8;
      g.fillStyle = "#1E5B40"; g.fillRect(x, Math.max(0,y-20), tw, 20);
      g.fillStyle = "#fff"; g.fillText(label, x+4, Math.max(15,y-5));
    }
  }

  async function scan(file, {onStatus, canvas} = {}){
    const session = await getSession(onStatus);
    onStatus && onStatus("Reading cards…");
    const bitmap = await loadBitmap(file);
    const {tensor, r, px, py} = toTensor(bitmap);
    const t0 = performance.now();
    const out = await session.run({[session.inputNames[0]]: tensor});
    const o = out[session.outputNames[0]];
    const dets = decode(o.data, o.dims, r, px, py);
    if(canvas) draw(canvas, bitmap, dets);
    const res = arrange(dets);
    res.ms = Math.round(performance.now()-t0);
    return res;
  }

  window.CardScanner = {scan, arrange, toCode, NAMES};
})();
