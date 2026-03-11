/* ==================================================================
   DATA — Edit SCF information here.
   Each object = one SCF target. Add/remove as needed.
   ================================================================== */
const D = [
  { id:"tokos", name:"Tokos SCF", city:"TO", region:"Turin, Piedmont", tier:1, emp:23, rev:1665292, ebitda:542000, fcfe:407310, cash:354000, cagr:0.45, fo:"Full MFO", dist:36, sF:5, sV:3, sS:5, sR:0, sC:0 },
  { id:"stratos", name:"Stratos SCF", city:"UD", region:"Udine, Friuli-Venezia Giulia", tier:1, emp:4, rev:468329, ebitda:278000, fcfe:279383, cash:340000, cagr:1.50, fo:"Full FO", dist:154, sF:5, sV:4, sS:5, sR:5, sC:5 },
  { id:"absolut", name:"A.B. Solute SCF", city:"VI", region:"Vicenza, Veneto", tier:1, emp:5, rev:549593, ebitda:242000, fcfe:183184, cash:418000, cagr:-0.07, fo:"Full FO", dist:40, sF:4, sV:5, sS:3.5, sR:0, sC:0 },
  { id:"81scf", name:"81 SCF", city:"VI", region:"Vicenza, Veneto", tier:1, emp:4, rev:464888, ebitda:166000, fcfe:136310, cash:38000, cagr:0.18, fo:"Full FO", dist:34, sF:4, sV:4, sS:5, sR:0, sC:0 },
  { id:"foitalia", name:"Family Office Italia", city:"RN", region:"Rimini, Emilia-Romagna", tier:2, emp:9, rev:384647, ebitda:71000, fcfe:55764, cash:78000, cagr:0.36, fo:"Full FO", dist:236, sF:4, sV:4, sS:3.5, sR:0, sC:0 },
  { id:"csfo", name:"CS Family Office", city:"LC", region:"Lecco, Lombardy", tier:2, emp:3, rev:304252, ebitda:43000, fcfe:26567, cash:24000, cagr:0.28, fo:"Full FO", dist:228, sF:3, sV:5, sS:3.5, sR:0, sC:0 },
  { id:"veneris", name:"Veneris FO", city:"TV", region:"Spresiano, Treviso", tier:2, emp:3, rev:204614, ebitda:40000, fcfe:27906, cash:25000, cagr:0.31, fo:"Full FO", dist:72, sF:3, sV:5, sS:4.5, sR:0, sC:0 },
  { id:"secolare", name:"Secolare SCF", city:"MI", region:"Milan, Lombardy", tier:3, emp:3, rev:593717, ebitda:74000, fcfe:61540, cash:109000, cagr:10.12, fo:"Partial FO", dist:233, sF:3, sV:4, sS:2.5, sR:0, sC:0 },
  { id:"mpfo", name:"MP Family Office", city:"BO", region:"Bologna, Emilia-Romagna", tier:3, emp:1, rev:259736, ebitda:14000, fcfe:0, cash:9000, cagr:2.07, fo:"Full FO", dist:130, sF:2, sV:5, sS:4, sR:0, sC:0 },
  { id:"rinascimento", name:"Rinascimento SCF", city:"MI", region:"Milan, Lombardy", tier:3, emp:2, rev:125105, ebitda:26000, fcfe:20447, cash:95000, cagr:null, fo:"Partial FO", dist:243, sF:2, sV:5, sS:2.5, sR:0, sC:0 },
];

const SCENARIOS = {
  conservative:["tokos","stratos","absolut"],
  ambitious:["tokos","stratos","absolut","81scf","foitalia"],
  fullsweep:["tokos","stratos","absolut","81scf","foitalia","secolare","veneris","csfo"],
  vicenza:["stratos","absolut","81scf"],
  none:[],
};
const SCEN_LABELS = [
  {label:"Conservative (Top 3)", k:"conservative"},
  {label:"Ambitious (Top 5)", k:"ambitious"},
  {label:"Full Sweep (All 8)", k:"fullsweep"},
  {label:"Vicenza Cluster", k:"vicenza"},
  {label:"Clear All", k:"none"},
];

const BAR_COLORS = [
  'linear-gradient(90deg,hsl(142,71%,45%),hsl(168,76%,50%))',
  'linear-gradient(90deg,hsl(217,91%,60%),hsl(217,91%,70%))',
  'linear-gradient(90deg,hsl(258,90%,66%),hsl(258,90%,76%))',
  'linear-gradient(90deg,hsl(40,60%,55%),hsl(45,85%,67%))',
  'linear-gradient(90deg,hsl(0,84%,60%),hsl(0,84%,70%))',
];
const FEES = [0.003,0.004,0.005,0.006,0.007];
const DISCS = [0.06,0.08,0.10,0.12];

/* ==================================================================
   STATE
   ================================================================== */
let sel = new Set(SCENARIOS.conservative);

/* ==================================================================
   HELPERS
   ================================================================== */
function fmt(v) {
  if (v==null||isNaN(v)) return '—';
  if (Math.abs(v)>=1e9) return '€'+(v/1e9).toFixed(2)+'B';
  if (Math.abs(v)>=1e6) return '€'+(v/1e6).toFixed(2)+'M';
  if (Math.abs(v)>=1e3) return '€'+(v/1e3).toFixed(0)+'K';
  return '€'+v.toFixed(0);
}
function gp() {
  return {
    fee:  +document.getElementById('s-fee').value/100,
    aum:  +document.getElementById('s-aum').value/100,
    disc: +document.getElementById('s-disc').value/100,
    grow: +document.getElementById('s-grow').value/100,
    dcfw: +document.getElementById('s-dcfw').value/100,
    wF:   +document.getElementById('s-wf').value/100,
    wV:   +document.getElementById('s-wv').value/100,
    wS:   +document.getElementById('s-ws').value/100,
    wR:   +document.getElementById('s-wr').value/100,
    wC:   +document.getElementById('s-wc').value/100,
  };
}
function val(s,p) {
  const aua = s.rev/p.fee;
  const pAUM = aua*p.aum;
  let dcf = 0;
  if (p.disc>p.grow && s.fcfe>0) dcf = s.fcfe/(p.disc-p.grow);
  const bl = p.dcfw*dcf + (1-p.dcfw)*pAUM;
  const evEb = s.ebitda>0 ? bl/s.ebitda : null;
  return {aua,dcf,pAUM,bl,evEb};
}
function score(s,p) {
  const tw = p.wF+p.wV+p.wS+p.wR+p.wC;
  if (tw===0) return 0;
  return (s.sF*p.wF + s.sV*p.wV + s.sS*p.wS + s.sR*p.wR + s.sC*p.wC)/tw;
}

/* ==================================================================
   BUILD UI
   ================================================================== */
function buildQbtns() {
  const c = document.getElementById('qbtns');
  SCEN_LABELS.forEach(b => {
    const btn = document.createElement('button');
    btn.className = 'qbtn';
    btn.textContent = b.label;
    btn.onclick = () => { sel = new Set(SCENARIOS[b.k]||[]); render(); };
    c.appendChild(btn);
  });
}

function renderCards() {
  const g = document.getElementById('scf-grid');
  g.innerHTML = '';
  D.forEach(s => {
    const isSel = sel.has(s.id);
    const cagrTxt = s.cagr!==null ? (s.cagr>=0?'+':'')+(s.cagr*100).toFixed(0)+'%' : 'N/A';
    const margin = ((s.ebitda/s.rev)*100).toFixed(0)+'%';
    const d = document.createElement('div');
    d.className = 'scf' + (isSel?' sel':'');
    d.onclick = () => { if(sel.has(s.id)) sel.delete(s.id); else sel.add(s.id); render(); };
    d.innerHTML = `
      <div class="chk">✓</div>
      <span class="tier t${s.tier}">Tier ${s.tier}</span>
      <div class="nm">${s.name}</div>
      <div class="loc">${s.region} · ${s.fo} · ${s.emp} emp</div>
      <div class="metrics">
        <div><div class="ml">Revenue '24</div><div class="mv">${fmt(s.rev)}</div></div>
        <div><div class="ml">3yr CAGR</div><div class="mv ${s.cagr!==null?(s.cagr>=0?'pos':'neg'):''}">${cagrTxt}</div></div>
        <div><div class="ml">EBITDA Margin</div><div class="mv">${margin}</div></div>
        <div><div class="ml">Net Cash</div><div class="mv">${fmt(s.cash)}</div></div>
      </div>`;
    g.appendChild(d);
  });
}

function render() {
  const p = gp();

  // Update slider labels
  document.getElementById('v-fee').textContent = (p.fee*100).toFixed(2)+'%';
  document.getElementById('v-aum').textContent = (p.aum*100).toFixed(2)+'%';
  document.getElementById('v-disc').textContent = (p.disc*100).toFixed(1)+'%';
  document.getElementById('v-grow').textContent = (p.grow*100).toFixed(1)+'%';
  document.getElementById('v-dcfw').textContent = (p.dcfw*100).toFixed(0)+'%';
  document.getElementById('v-wf').textContent = (p.wF*100).toFixed(0)+'%';
  document.getElementById('v-wv').textContent = (p.wV*100).toFixed(0)+'%';
  document.getElementById('v-ws').textContent = (p.wS*100).toFixed(0)+'%';
  document.getElementById('v-wr').textContent = (p.wR*100).toFixed(0)+'%';
  document.getElementById('v-wc').textContent = (p.wC*100).toFixed(0)+'%';
  const tw = p.wF+p.wV+p.wS+p.wR+p.wC;
  const twEl = document.getElementById('tw');
  twEl.textContent = 'Σ = '+(tw*100).toFixed(0)+'%';
  twEl.style.color = Math.abs(tw-1)<.001 ? 'var(--teal)' : 'var(--red)';

  renderCards();

  // Compute all valuations + scores
  const all = D.map(s => ({...s, ...val(s,p), sc:score(s,p), isSel:sel.has(s.id)}))
    .sort((a,b)=>b.sc-a.sc);

  const selArr = all.filter(s=>s.isSel);

  // Totals
  const tCost = selArr.reduce((s,v)=>s+v.bl,0);
  const tAuA  = selArr.reduce((s,v)=>s+v.aua,0);
  const tRev  = selArr.reduce((s,v)=>s+v.rev,0);
  const tFCFE = selArr.reduce((s,v)=>s+v.fcfe,0);
  const tEmp  = selArr.reduce((s,v)=>s+v.emp,0);
  const tEB   = selArr.reduce((s,v)=>s+v.ebitda,0);
  const margin = tRev>0 ? tEB/tRev : 0;
  const cpAuA  = tAuA>0 ? tCost/tAuA*100 : 0;
  const n = selArr.length;

  function tile(lbl,v,sub,hl) {
    return `<div class="rt${hl?' hl':''}"><div class="rl">${lbl}</div><div class="rv">${v}</div>${sub?'<div class="rs">'+sub+'</div>':''}</div>`;
  }

  document.getElementById('tiles-top').innerHTML =
    tile('Total Cost', n?fmt(tCost):'—', n?`Blended (${(p.dcfw*100).toFixed(0)}% DCF + ${((1-p.dcfw)*100).toFixed(0)}% P/AUM)`:'', true) +
    tile('Total AuA', n?fmt(tAuA):'—', n?`at ${(p.fee*100).toFixed(2)}% fee rate`:'') +
    tile('Combined Revenue', n?fmt(tRev):'—', n?'FY 2024':'') +
    tile('Total FCFE', n?fmt(tFCFE):'—', n?`Implied yield: ${tCost>0?(tFCFE/tCost*100).toFixed(1):0}%`:'');

  document.getElementById('tiles-bot').innerHTML =
    tile('Avg EBITDA Margin', n?(margin*100).toFixed(1)+'%':'—') +
    tile('Cost / AuA', n?cpAuA.toFixed(3)+'%':'—') +
    tile('SCFs Selected', ''+n) +
    tile('Total Employees', n?''+tEmp:'—');

  // Valuation table
  const tb = document.getElementById('vtbody');
  tb.innerHTML = all.map(v => {
    const cls = v.isSel ? ' class="sel-row"' : '';
    const dot = v.isSel ? `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--teal);margin-right:6px;vertical-align:middle"></span>` : '';
    return `<tr${cls}>
      <td>${dot}${v.name} (${v.city})</td>
      <td>${fmt(v.rev)}</td><td>${fmt(v.fcfe)}</td>
      <td>${fmt(v.aua)}</td><td>${fmt(v.dcf)}</td><td>${fmt(v.pAUM)}</td>
      <td style="font-weight:700;color:var(--gold)">${fmt(v.bl)}</td>
      <td>${v.evEb!==null?v.evEb.toFixed(1)+'x':'—'}</td>
      <td style="font-weight:700;color:var(--teal)">${v.sc.toFixed(2)}</td>
    </tr>`;
  }).join('');

  // Ranking bars
  const barsEl = document.getElementById('bars');
  barsEl.innerHTML = all.map((v,i) => {
    const pct = (v.sc/5*100).toFixed(1);
    return `<div class="bar-row">
      <div class="bar-name">${v.name}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${BAR_COLORS[i%BAR_COLORS.length]}">${v.sc.toFixed(2)} / 5.00</div></div>
    </div>`;
  }).join('');

  // Sensitivity
  if (n===0) {
    document.getElementById('sens').innerHTML = '<div style="text-align:center;color:var(--txt3);padding:20px;grid-column:1/-1">Select SCFs to see sensitivity analysis</div>';
    document.getElementById('sens').style.gridTemplateColumns = '1fr';
    return;
  }
  const sG = document.getElementById('sens');
  sG.style.gridTemplateColumns = `auto repeat(${FEES.length},1fr)`;
  let html = '<div class="sh">r \\ fee</div>';
  FEES.forEach(f => html += `<div class="sh">${(f*100).toFixed(1)}%</div>`);
  const allVals = DISCS.map(r => FEES.map(f => {
    let t=0; selArr.forEach(s => t += val(s,{...p,fee:f,disc:r}).bl); return t;
  }));
  const flat = allVals.flat();
  const mn = Math.min(...flat), mx = Math.max(...flat);
  DISCS.forEach((r,ri) => {
    html += `<div class="srl">${(r*100).toFixed(0)}%</div>`;
    FEES.forEach((f,fi) => {
      const v = allVals[ri][fi];
      const ratio = mx>mn ? (v-mn)/(mx-mn) : .5;
      const hue = (1-ratio)*120;
      const isBase = Math.abs(f-p.fee)<.0001 && Math.abs(r-p.disc)<.005;
      html += `<div class="sc${isBase?' base':''}" style="background:hsla(${hue},70%,40%,.25)">${fmt(v)}</div>`;
    });
  });
  sG.innerHTML = html;
}

function up() { render(); }

/* ==================================================================
   INIT
   ================================================================== */
buildQbtns();
render();

// QR code auto-generation
(function(){
  const url = window.location.href;
  document.getElementById('qr-img').src = 'https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=0&data=' + encodeURIComponent(url);
  document.getElementById('qr-url').textContent = url.length>55 ? url.slice(0,52)+'…' : url;
})();
