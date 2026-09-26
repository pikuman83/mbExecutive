(function(){
  "use strict";
  const ROWS = [["top",3],["middle",5],["bottom",5]];
  const RANK_ORDER = [14,13,12,11,10,9,8,7,6,5,4,3,2];
  const SUITS = ["s","h","d","c"];
  const RANKS = {"2":2,"3":3,"4":4,"5":5,"6":6,"7":7,"8":8,"9":9,"T":10,"10":10,"J":11,"Q":12,"K":13,"A":14};
  const RCH = {10:"T",11:"J",12:"Q",13:"K",14:"A"};
  const RDISP = {10:"10",11:"J",12:"Q",13:"K",14:"A"};
  const PLURAL = {2:"2s",3:"3s",4:"4s",5:"5s",6:"6s",7:"7s",8:"8s",9:"9s",10:"Tens",11:"Jacks",12:"Queens",13:"Kings",14:"Aces"};
  const SINGLE = {2:"2",3:"3",4:"4",5:"5",6:"6",7:"7",8:"8",9:"9",10:"Ten",11:"Jack",12:"Queen",13:"King",14:"Ace"};
  const SUIT = {s:"♠",h:"♥",d:"♦",c:"♣"};
  const SUITIN = {"♠":"s","♥":"h","♦":"d","♣":"c",s:"s",h:"h",d:"d",c:"c"};
  const BOTTOM_ROY = {4:2,5:4,6:6,7:10,8:15};
  const MIDDLE_ROY = {3:2,4:4,5:8,6:12,7:20,8:30};
  const STORE = "ofc-app-v1";

  const ex = s => s.split(" ");
  const EXAMPLE = [
    {name:"Player 1", top:ex("Qs Qd 4c"), middle:ex("9h 9c 9d 4s 2h"), bottom:ex("Ah Kh 8h 6h 3h")},
    {name:"Player 2", top:ex("Jc 6s 3s"), middle:ex("8s 8d Ks Kd 3c"), bottom:ex("7c 7h 7s Tc Td")},
    {name:"Player 3", top:ex("Ac Kc 2d"), middle:ex("Jd Th 9s 8c 7d"), bottom:ex("5c 5d 5h 5s Jh")},
    {name:"Player 4", top:ex("Ad As 3d"), middle:ex("Js Ts 4h 4d 2c"), bottom:ex("Qh Qc 6c 6d 2s")}
  ];
  const fresh = () => ({count:4, example:true, progressive:false,
    players:EXAMPLE.map(p=>({...p, top:[...p.top], middle:[...p.middle], bottom:[...p.bottom], inFL:false})), tally:[]});

  let state = load() || fresh();
  let lastRound = null, lastHands = [];

  function load(){
    try{
      const s = JSON.parse(localStorage.getItem(STORE));
      if(s && Array.isArray(s.players) && s.players.length===4 && s.players.every(p=>Array.isArray(p.top))) return s;
    }catch(e){}
    return null;
  }
  function save(){ try{ localStorage.setItem(STORE, JSON.stringify(state)); }catch(e){} }

  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const sign = v => v>0 ? "+"+v : String(v);
  const cls = v => v>0 ? "pos" : v<0 ? "neg" : "";
  const pname = i => (state.players[i].name || "").trim() || ("Player "+(i+1));

  // ---------- cards ----------
  function parseCode(t){
    const m = String(t).trim().match(/^(10|[2-9tjqka])([shdc♠♥♦♣])$/i);
    if(!m) return null;
    return {r:RANKS[m[1].toUpperCase()], s:SUITIN[m[2].toLowerCase()] || SUITIN[m[2]]};
  }
  const key = c => (RCH[c.r]||c.r) + c.s;
  const normCode = t => { const c = parseCode(t); return c ? key(c) : null; };
  function cardHTML(code, extra){
    const c = parseCode(code);
    const red = c.s==="h"||c.s==="d";
    return `<span class="pc${red?" r":""}${extra||""}">${RDISP[c.r]||c.r}<small>${SUIT[c.s]}</small></span>`;
  }

  // ---------- evaluation ----------
  function evalHand(cards){
    const rs = cards.map(c=>c.r).sort((a,b)=>b-a);
    const cnt = {}; rs.forEach(r=>cnt[r]=(cnt[r]||0)+1);
    const groups = Object.entries(cnt).map(([r,c])=>[+r,c]).sort((a,b)=>b[1]-a[1]||b[0]-a[0]);
    const tb = groups.map(g=>g[0]);
    if(cards.length===3){
      if(groups[0][1]===3) return {cat:3,tb};
      if(groups[0][1]===2) return {cat:1,tb};
      return {cat:0,tb};
    }
    const flush = cards.every(c=>c.s===cards[0].s);
    let sh = 0;
    if(groups.length===5){
      if(rs[0]-rs[4]===4) sh = rs[0];
      else if(rs.join()==="14,5,4,3,2") sh = 5;
    }
    if(sh && flush) return {cat:8,tb:[sh]};
    if(groups[0][1]===4) return {cat:7,tb};
    if(groups[0][1]===3 && groups[1][1]===2) return {cat:6,tb};
    if(flush) return {cat:5,tb:rs};
    if(sh) return {cat:4,tb:[sh]};
    if(groups[0][1]===3) return {cat:3,tb};
    if(groups[0][1]===2 && groups[1][1]===2) return {cat:2,tb};
    if(groups[0][1]===2) return {cat:1,tb};
    return {cat:0,tb:rs};
  }
  function cmp(a,b){
    if(a.cat!==b.cat) return a.cat-b.cat;
    const n = Math.min(a.tb.length,b.tb.length);
    for(let i=0;i<n;i++) if(a.tb[i]!==b.tb[i]) return a.tb[i]-b.tb[i];
    return 0;
  }
  function handName(h){
    const t = h.tb;
    switch(h.cat){
      case 0: return SINGLE[t[0]] + " high";
      case 1: return "Pair of " + PLURAL[t[0]];
      case 2: return "Two pair, " + PLURAL[t[0]] + " & " + PLURAL[t[1]];
      case 3: return "Three " + PLURAL[t[0]];
      case 4: return "Straight to " + SINGLE[t[0]];
      case 5: return "Flush, " + SINGLE[t[0]] + " high";
      case 6: return "Full house, " + PLURAL[t[0]] + " over " + PLURAL[t[1]];
      case 7: return "Four " + PLURAL[t[0]];
      case 8: return t[0]===14 ? "Royal flush" : "Straight flush to " + SINGLE[t[0]];
    }
  }
  function royalty(row,h){
    if(row==="top"){
      if(h.cat===3) return h.tb[0]+8;
      if(h.cat===1 && h.tb[0]>=6) return h.tb[0]-5;
      return 0;
    }
    if(h.cat===8 && h.tb[0]===14) return row==="middle" ? 50 : 25;
    return (row==="middle" ? MIDDLE_ROY : BOTTOM_ROY)[h.cat] || 0;
  }
  // 0 = no Fantasyland next round, else cards dealt (13 when not progressive).
  function fantasyNext(inFL, info){
    if(!info.complete || info.foul) return 0;
    const {top,middle,bottom} = info.rows;
    if(inFL){
      const stays = top.cat===3 || middle.cat>=6 || bottom.cat>=7;
      return stays ? (state.progressive ? 14 : 13) : 0;
    }
    if(top.cat===3) return state.progressive ? 17 : 13;
    if(top.cat===1 && top.tb[0]>=12) return state.progressive ? top.tb[0]+2 : 13;
    return 0;
  }
  function versus(a,b){
    if(a.foul && b.foul) return {pts:0, roy:0, note:"both fouled"};
    if(a.foul) return {pts:-6-b.roy, roy:-b.roy, note:"fouled"};
    if(b.foul) return {pts:6+a.roy, roy:a.roy, note:"they fouled"};
    let w=0, l=0;
    for(const [row] of ROWS){ const c = cmp(a.rows[row], b.rows[row]); if(c>0) w++; else if(c<0) l++; }
    let rows = w-l, note = `rows ${w}-${l}`;
    if(w===3){ rows = 6; note = "scoop"; }
    if(l===3){ rows = -6; note = "scooped"; }
    const roy = a.roy-b.roy;
    return {pts:rows+roy, roy, note};
  }

  // ---------- player panels ----------
  function buildPlayers(){
    const host = $("players");
    host.innerHTML = "";
    for(let i=0;i<4;i++){
      const el = document.createElement("article");
      el.className = "player"; el.id = "player"+i;
      el.innerHTML = `
        <div class="phead">
          <input class="pname" id="name${i}" aria-label="Player name" maxlength="20">
          <button type="button" data-edit="${i}">Enter cards</button>
        </div>
        <label class="flrow" for="fl${i}"><input type="checkbox" id="fl${i}"> Playing Fantasyland this round</label>
        ${ROWS.map(([row,n])=>`
          <div class="prow" data-edit="${i}" data-row="${row}" role="button" tabindex="0" aria-label="Edit ${row} row">
            <span class="lbl">${row} · ${n}</span>
            <div class="detail" id="d${i}-${row}"></div>
          </div>`).join("")}
        <div class="pfoot" id="foot${i}"></div>`;
      host.appendChild(el);
      const nameIn = $("name"+i);
      nameIn.value = state.players[i].name;
      nameIn.addEventListener("input",()=>{ state.players[i].name = nameIn.value; save(); recompute(); });
      const flIn = $("fl"+i);
      flIn.checked = !!state.players[i].inFL;
      flIn.addEventListener("change",()=>{ state.players[i].inFL = flIn.checked; save(); recompute(); });
    }
    host.querySelectorAll("[data-edit]").forEach(el=>{
      const open = ()=>openSheet(+el.dataset.edit, el.dataset.row);
      el.addEventListener("click", open);
      el.addEventListener("keydown", e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); open(); } });
    });
  }
  function markEdited(){ if(state.example){ state.example = false; } }

  // ---------- core ----------
  function recompute(){
    const n = state.count;
    document.querySelectorAll("#countSeg button").forEach(b=>b.setAttribute("aria-pressed", String(+b.dataset.n===n)));
    $("exampleBanner").hidden = !state.example;
    $("progFL").checked = !!state.progressive;

    const seen = {};
    for(let i=0;i<n;i++) for(const [row] of ROWS) state.players[i][row].forEach(k=>seen[k]=(seen[k]||0)+1);
    const dupKeys = Object.keys(seen).filter(k=>seen[k]>1);

    const hands = [];
    for(let i=0;i<4;i++){
      const el = $("player"+i);
      el.hidden = i>=n;
      if(i>=n){ hands.push(null); continue; }
      const p = state.players[i];
      const info = {complete:true, rows:{}, roy:0, foul:false, fl:0, inFL:!!p.inFL};
      for(const [row,cnt] of ROWS){
        const codes = p[row];
        let html = `<span class="cards">${codes.map(k=>cardHTML(k, dupKeys.includes(k)?" dup":"")).join("")}${
          Array(Math.max(0,cnt-codes.length)).fill('<span class="pc empty"></span>').join("")}</span>`;
        if(codes.length===cnt){
          const h = evalHand(codes.map(parseCode));
          info.rows[row] = h;
          html += `<span class="hand">${handName(h)}</span>`;
        } else info.complete = false;
        $(`d${i}-${row}`).innerHTML = html;
      }
      if(info.complete){
        const {top,middle,bottom} = info.rows;
        info.foul = cmp(top,middle)>0 || cmp(middle,bottom)>0;
        for(const [row] of ROWS){
          const r = info.foul ? 0 : royalty(row, info.rows[row]);
          info.roy += r;
          if(r) $(`d${i}-${row}`).insertAdjacentHTML("beforeend", `<span class="chip roy">+${r}</span>`);
        }
        info.fl = fantasyNext(info.inFL, info);
      }
      el.classList.toggle("foul", info.foul);
      el.classList.toggle("infl", info.inFL);
      let f = "";
      const count = ROWS.reduce((a,[row])=>a+p[row].length,0);
      if(!info.complete) f = `<span class="chip">${count} of 13 cards</span>`;
      else if(info.foul){
        const why = cmp(info.rows.top,info.rows.middle)>0 ? "top beats middle" : "middle beats bottom";
        f = `<span class="chip bad">Fouled: ${why}</span><span class="muted">No royalties, scooped by every clean hand</span>`;
        if(info.inFL) f += `<span class="chip">Leaves Fantasyland</span>`;
      } else {
        f = `<span>Royalties <b>${info.roy}</b></span>`;
        if(info.fl) f += `<span class="chip fl">${info.inFL ? "Stays in Fantasyland" : "Fantasyland next round"}${state.progressive ? " · "+info.fl+" cards" : ""}</span>`;
        else if(info.inFL) f += `<span class="chip">Leaves Fantasyland</span>`;
      }
      $("foot"+i).innerHTML = f;
      hands.push(info);
    }
    lastHands = hands.slice(0,n);
    renderResults(lastHands, dupKeys);
  }

  function renderResults(hands, dupKeys){
    const out = $("resultBody"), btn = $("btnTally");
    const missing = hands.map((h,i)=>h.complete?null:pname(i)).filter(Boolean);
    if(missing.length || dupKeys.length){
      let msg = "";
      if(missing.length) msg += `<p>Waiting for complete hands from: <b>${missing.map(esc).join(", ")}</b>.</p>`;
      if(dupKeys.length) msg += `<p class="errs">The same card appears twice: ${dupKeys.join(", ")}. Check the cards outlined in red.</p>`;
      out.innerHTML = msg; btn.disabled = true; lastRound = null; return;
    }
    const n = hands.length, totals = Array(n).fill(0), M = [];
    for(let i=0;i<n;i++){ M[i]=[]; for(let j=0;j<n;j++){ if(i===j) continue; M[i][j] = versus(hands[i],hands[j]); totals[i]+=M[i][j].pts; } }
    lastRound = totals; btn.disabled = false;
    const order = [...Array(n).keys()].sort((a,b)=>totals[b]-totals[a]);
    let html = `<div class="totals">${order.map(i=>`<div class="tot"><div class="who">${esc(pname(i))}</div><div class="n ${cls(totals[i])}">${sign(totals[i])}</div></div>`).join("")}</div>`;
    html += `<div class="tablewrap"><table><thead><tr><th>Player ↓ vs →</th>${hands.map((_,j)=>`<th>${esc(pname(j))}</th>`).join("")}<th>Total</th></tr></thead><tbody>`;
    for(let i=0;i<n;i++){
      html += `<tr><td><b>${esc(pname(i))}</b></td>`;
      for(let j=0;j<n;j++){
        if(i===j){ html += `<td class="self">—</td>`; continue; }
        const v = M[i][j];
        const sub = v.note==="both fouled" ? v.note : `${v.note}${v.roy?` · roy ${sign(v.roy)}`:""}`;
        html += `<td><span class="n ${cls(v.pts)}">${sign(v.pts)}</span><span class="sub">${sub}</span></td>`;
      }
      html += `<td><span class="n ${cls(totals[i])}">${sign(totals[i])}</span></td></tr>`;
    }
    html += `</tbody></table></div><p class="muted" style="font-size:13px">Read across a row: what that player wins or loses against each opponent. Row points include the +3 scoop bonus; "roy" is the royalty difference.</p>`;
    out.innerHTML = html;
  }

  function renderTally(){
    const t = state.tally;
    $("tallySec").hidden = !t.length;
    if(!t.length) return;
    const n = Math.max(...t.map(r=>r.length));
    const sums = Array(n).fill(0);
    let html = `<table><thead><tr><th>Round</th>${[...Array(n).keys()].map(j=>`<th>${esc(pname(j))}</th>`).join("")}</tr></thead><tbody>`;
    t.forEach((r,k)=>{
      html += `<tr><td>${k+1}</td>${[...Array(n).keys()].map(j=>{ const v=r[j]; if(v==null) return `<td class="self">—</td>`; sums[j]+=v; return `<td class="${cls(v)}">${sign(v)}</td>`; }).join("")}</tr>`;
    });
    html += `<tr><td><b>Total</b></td>${sums.map(v=>`<td><span class="n ${cls(v)}">${sign(v)}</span></td>`).join("")}</tr></tbody></table>`;
    $("tallyBody").innerHTML = html;
  }

  // ---------- card picker sheet ----------
  let sheetPlayer = 0, active = {row:"top", idx:0};

  function firstEmpty(p){
    for(const [row,cnt] of ROWS) if(p[row].length<cnt) return {row, idx:p[row].length};
    return null;
  }
  function openSheet(i, row){
    sheetPlayer = i;
    const p = state.players[i];
    active = row && p[row].length<ROWS.find(r=>r[0]===row)[1] ? {row, idx:p[row].length} : (firstEmpty(p) || {row:"top", idx:3});
    $("scanArea").hidden = true;
    $("sheet").hidden = false;
    document.body.style.overflow = "hidden";
    renderSheet();
  }
  function closeSheet(){
    $("sheet").hidden = true;
    document.body.style.overflow = "";
    recompute();
  }
  function takenByOthers(){
    const s = new Set();
    for(let i=0;i<state.count;i++){ if(i===sheetPlayer) continue; for(const [row] of ROWS) state.players[i][row].forEach(k=>s.add(k)); }
    return s;
  }
  function renderSheet(){
    const p = state.players[sheetPlayer];
    $("sheetTitle").textContent = pname(sheetPlayer) + " · cards";
    let html = "";
    for(const [row,cnt] of ROWS){
      html += `<div class="srow"><span class="lbl">${row}</span><div class="slots">`;
      for(let k=0;k<cnt;k++){
        const code = p[row][k];
        const isActive = active && active.row===row && active.idx===k;
        if(code){
          const c = parseCode(code), red = c.s==="h"||c.s==="d";
          html += `<button type="button" class="slot${red?" r":""}${isActive?" active":""}" data-row="${row}" data-idx="${k}" aria-label="Remove ${code}">${RDISP[c.r]||c.r}<small>${SUIT[c.s]}</small></button>`;
        } else {
          html += `<button type="button" class="slot empty${isActive?" active":""}" data-row="${row}" data-idx="${k}" aria-label="Empty ${row} slot"></button>`;
        }
      }
      html += `</div></div>`;
    }
    $("sheetRows").innerHTML = html;
    const mine = new Set(ROWS.flatMap(([row])=>p[row]));
    const others = takenByOthers();
    let g = "";
    for(const s of SUITS) for(const r of RANK_ORDER){
      const code = (RCH[r]||r) + s, red = s==="h"||s==="d";
      const st = mine.has(code) ? " mine" : others.has(code) ? " taken" : "";
      g += `<button type="button" class="gc${red?" r":""}${st}" data-code="${code}" aria-label="${code}">${RDISP[r]||r}<small>${SUIT[s]}</small></button>`;
    }
    $("grid").innerHTML = g;
  }
  function removeCard(code){
    const p = state.players[sheetPlayer];
    for(const [row] of ROWS){
      const k = p[row].indexOf(code);
      if(k>=0){ p[row].splice(k,1); active = {row, idx:p[row].length}; return true; }
    }
    return false;
  }
  $("sheetRows").addEventListener("click", e=>{
    const b = e.target.closest(".slot"); if(!b) return;
    const p = state.players[sheetPlayer], row = b.dataset.row, idx = +b.dataset.idx;
    if(p[row][idx]){ p[row].splice(idx,1); active = {row, idx:p[row].length}; markEdited(); save(); }
    else active = {row, idx:p[row].length};
    renderSheet();
  });
  $("grid").addEventListener("click", e=>{
    const b = e.target.closest(".gc"); if(!b) return;
    const code = b.dataset.code, p = state.players[sheetPlayer];
    markEdited();
    if(removeCard(code)){ save(); renderSheet(); return; }
    if(b.classList.contains("taken")){
      // Another player holds it: move it here only if they tap twice (likely a scan mistake).
      if(b.dataset.confirm!=="1"){ b.dataset.confirm="1"; b.style.opacity=".6"; return; }
      for(let i=0;i<4;i++) if(i!==sheetPlayer) for(const [row] of ROWS){ const k = state.players[i][row].indexOf(code); if(k>=0) state.players[i][row].splice(k,1); }
    }
    let slot = active && p[active.row].length < ROWS.find(r=>r[0]===active.row)[1] ? active : firstEmpty(p);
    if(!slot) return;
    p[slot.row].push(code);
    active = firstEmpty(p);
    if(active && active.row!==slot.row && p[slot.row].length < ROWS.find(r=>r[0]===slot.row)[1]) active = {row:slot.row, idx:p[slot.row].length};
    save(); renderSheet();
  });
  $("sheetDone").addEventListener("click", closeSheet);
  $("sheetClear").addEventListener("click", ()=>{
    const p = state.players[sheetPlayer];
    for(const [row] of ROWS) p[row] = [];
    active = {row:"top", idx:0}; markEdited(); save(); renderSheet();
  });
  $("sheet").addEventListener("click", e=>{ if(e.target.id==="sheet") closeSheet(); });
  document.addEventListener("keydown", e=>{ if(e.key==="Escape" && !$("sheet").hidden) closeSheet(); });

  // ---------- scanner ----------
  $("scanInput").addEventListener("change", async e=>{
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if(!file) return;
    const st = $("scanStatus");
    $("scanArea").hidden = false;
    st.className = "status";
    st.textContent = "Loading card reader…";
    try{
      const res = await window.CardScanner.scan(file, {onStatus:t=>{ st.textContent = t; }, canvas:$("scanCanvas")});
      const p = state.players[sheetPlayer];
      const others = takenByOthers();
      const clash = [];
      for(const [row,cnt] of ROWS){
        p[row] = res[row].map(c=>c.code).filter(k=>{ if(others.has(k)){ clash.push(k); return false; } return true; }).slice(0,cnt);
      }
      // Cards that didn't fit their detected row go into any empty slot, for the player to move or fix.
      for(const c of res.extra){
        if(others.has(c.code)){ clash.push(c.code); continue; }
        const slot = firstEmpty(p); if(!slot) break;
        if(!ROWS.some(([row])=>p[row].includes(c.code))) p[slot.row].push(c.code);
      }
      markEdited(); save();
      active = firstEmpty(p);
      renderSheet();
      const found = ROWS.reduce((a,[row])=>a+p[row].length,0);
      let msg = `Found ${found} of 13 cards (${res.ms} ms). This reader is a beta and often misreads: compare every card with the photo and fix them by tapping.`;
      if(found<13) msg += ` Fill in the ${13-found} missing card${13-found>1?"s":""} from the grid.`;
      if(clash.length) msg += ` Skipped ${clash.join(", ")}: already used by another player.`;
      st.textContent = msg;
    }catch(err){
      st.className = "status err";
      st.textContent = (err && err.message) ? err.message : "The card reader couldn't run on this device. Use the grid instead.";
    }
  });

  // ---------- controls ----------
  $("countSeg").addEventListener("click", e=>{
    const b = e.target.closest("button"); if(!b) return;
    state.count = +b.dataset.n; save(); recompute();
  });
  $("progFL").addEventListener("change", e=>{ state.progressive = e.target.checked; save(); recompute(); });
  $("btnExample").addEventListener("click", ()=>{
    const f = fresh(); state.players = f.players; state.count = 4; state.example = true;
    save(); buildPlayers(); recompute();
  });
  function clearRound(nextFL){
    const wasExample = state.example;
    state.players.forEach((p,i)=>{
      p.top=[]; p.middle=[]; p.bottom=[];
      if(wasExample){ p.name="Player "+(i+1); p.inFL=false; }
      if(nextFL) p.inFL = !!nextFL[i];
    });
    state.example = false;
    save(); buildPlayers(); recompute();
  }
  $("btnClear").addEventListener("click", ()=>{ clearRound(null); $("roundNote").textContent = ""; });
  $("btnTally").addEventListener("click", ()=>{
    if(!lastRound) return;
    state.tally.push(lastRound.slice());
    const nextFL = lastHands.map(h=>h ? !!h.fl : false);
    clearRound(nextFL); renderTally();
    const names = nextFL.map((f,i)=>f?pname(i):null).filter(Boolean);
    $("roundNote").textContent = "Round saved." + (names.length ? " In Fantasyland this round: " + names.join(", ") + "." : "");
  });
  $("btnUndo").addEventListener("click", ()=>{ state.tally.pop(); save(); renderTally(); });
  let armed = false;
  $("btnResetTally").addEventListener("click", e=>{
    const b = e.currentTarget;
    if(!armed){ armed = true; b.textContent = "Tap again to reset"; setTimeout(()=>{ armed=false; b.textContent="Reset totals"; }, 3000); return; }
    armed = false; b.textContent = "Reset totals"; state.tally = []; save(); renderTally();
  });

  // ---------- paste from a Claude chat ----------
  const CHAT_PROMPT = `I'm sending photos of finished Open Face Chinese Poker hands, one photo per player, in order (first photo = Player 1). Each hand has 13 cards in three rows: TOP row 3 cards (farthest from the player), MIDDLE row 5 cards, BOTTOM row 5 cards (closest to the player). If a photo is rotated, the 3-card row is the top.
Read each card from its corner index. Don't guess from the card art.
Reply with ONLY one line per player in exactly this format, nothing else:
Player 1: Qs Qd 4c / 9h 9c 9d 4s 2h / Ah Kh 8h 6h 3h
(top / middle / bottom; ranks 2-9 T J Q K A, T = ten; suits s h d c)
If you're unsure of a card, still give your best guess and add "?" right after it, like Qd?`;
  $("chatPrompt").value = CHAT_PROMPT;
  $("btnCopyPrompt").addEventListener("click", async ()=>{
    try{ await navigator.clipboard.writeText(CHAT_PROMPT); $("copyNote").textContent = "Copied. Paste it into a Claude chat."; }
    catch(e){ const ta = $("chatPrompt"); ta.hidden = false; ta.focus(); ta.select(); $("copyNote").textContent = "Select this text and copy it."; }
  });
  $("btnImport").addEventListener("click", ()=>{
    const note = $("importNote");
    const lines = $("importBox").value.split(/\n+/).map(l=>l.trim()).filter(l=>l.includes("/"));
    if(!lines.length){ note.textContent = "Nothing to fill in. Paste lines like: Player 1: Qs Qd 4c / … / …"; return; }
    const unsure = [], bad = [];
    const hands = lines.slice(0,4).map(l=>{
      let name = "", body = l;
      const m = l.match(/^\s*[*_#\-\d.)\s]*([^:]{1,30}):\s*(.*)$/);
      if(m){ name = m[1].replace(/[*_]/g,"").trim(); body = m[2]; }
      const parts = body.split("/");
      const row = x => (x||"").replace(/[*_`,]/g," ").trim().split(/\s+/).filter(Boolean).map(t=>{
        if(t.endsWith("?")){ t = t.slice(0,-1); unsure.push(t); }
        const k = normCode(t); if(!k) bad.push(t); return k;
      }).filter(Boolean);
      return {name, top:row(parts[0]).slice(0,3), middle:row(parts[1]).slice(0,5), bottom:row(parts[2]).slice(0,5)};
    });
    markEdited();
    hands.forEach((h,i)=>{
      const p = state.players[i];
      if(h.name && !/^player\s*\d+$/i.test(h.name)) p.name = h.name;
      p.top = h.top; p.middle = h.middle; p.bottom = h.bottom;
    });
    state.count = Math.max(2, hands.length);
    save(); buildPlayers(); recompute();
    let msg = `Filled in ${hands.length} hand${hands.length>1?"s":""}.`;
    if(unsure.length) msg += ` Not sure about: ${unsure.join(", ")}.`;
    if(bad.length) msg += ` Couldn't read: ${bad.join(" ")}.`;
    note.textContent = msg + " Check them against the photos.";
  });

  buildPlayers(); recompute(); renderTally();

  if("serviceWorker" in navigator && location.protocol==="https:"){
    navigator.serviceWorker.register("sw.js").catch(()=>{});
  }
})();
