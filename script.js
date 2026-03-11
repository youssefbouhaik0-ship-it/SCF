// ====================================================================
//  SCF_DATA — All firm-level data.
// ====================================================================
const SCF_DATA = [
    { id: "tokos", name: "Tokos SCF", city: "TO", region: "Turin, Piedmont", tier: 1, employees: 23, revenue: 1665292, ebitda: 542000, fcfe: 407310, netCash: 354000, cagr: 0.45, foType: "Full MFO", distance: 36, scoreFinancial: 5, scoreValuation: 3, scoreStrategic: 5, scoreResponsive: 0, scoreConvergence: 0 },
    { id: "stratos", name: "Stratos SCF", city: "UD", region: "Udine, Friuli-Venezia Giulia", tier: 1, employees: 4, revenue: 468329, ebitda: 278000, fcfe: 279383, netCash: 340000, cagr: 1.50, foType: "Full FO", distance: 154, scoreFinancial: 5, scoreValuation: 4, scoreStrategic: 5, scoreResponsive: 5, scoreConvergence: 5 },
    { id: "absolut", name: "A.B. Solute SCF", city: "VI", region: "Vicenza, Veneto", tier: 1, employees: 5, revenue: 549593, ebitda: 242000, fcfe: 183184, netCash: 418000, cagr: -0.07, foType: "Full FO", distance: 40, scoreFinancial: 4, scoreValuation: 5, scoreStrategic: 3.5, scoreResponsive: 0, scoreConvergence: 0 },
    { id: "81scf", name: "81 SCF", city: "VI", region: "Vicenza, Veneto", tier: 1, employees: 4, revenue: 464888, ebitda: 166000, fcfe: 136310, netCash: 38000, cagr: 0.18, foType: "Full FO", distance: 34, scoreFinancial: 4, scoreValuation: 4, scoreStrategic: 5, scoreResponsive: 0, scoreConvergence: 0 },
    { id: "foitalia", name: "Family Office Italia", city: "RN", region: "Rimini, Emilia-Romagna", tier: 2, employees: 9, revenue: 384647, ebitda: 71000, fcfe: 55764, netCash: 78000, cagr: 0.36, foType: "Full FO", distance: 236, scoreFinancial: 4, scoreValuation: 4, scoreStrategic: 3.5, scoreResponsive: 0, scoreConvergence: 0 },
    { id: "csfo", name: "CS Family Office", city: "LC", region: "Lecco, Lombardy", tier: 2, employees: 3, revenue: 304252, ebitda: 43000, fcfe: 26567, netCash: 24000, cagr: 0.28, foType: "Full FO", distance: 228, scoreFinancial: 3, scoreValuation: 5, scoreStrategic: 3.5, scoreResponsive: 0, scoreConvergence: 0 },
    { id: "veneris", name: "Veneris FO", city: "TV", region: "Spresiano, Treviso", tier: 2, employees: 3, revenue: 204614, ebitda: 40000, fcfe: 27906, netCash: 25000, cagr: 0.31, foType: "Full FO", distance: 72, scoreFinancial: 3, scoreValuation: 5, scoreStrategic: 4.5, scoreResponsive: 0, scoreConvergence: 0 },
    { id: "secolare", name: "Secolare SCF", city: "MI", region: "Milan, Lombardy", tier: 3, employees: 3, revenue: 593717, ebitda: 74000, fcfe: 61540, netCash: 109000, cagr: 10.12, foType: "Partial FO", distance: 233, scoreFinancial: 3, scoreValuation: 4, scoreStrategic: 2.5, scoreResponsive: 0, scoreConvergence: 0 },
    { id: "mpfo", name: "MP Family Office", city: "BO", region: "Bologna, Emilia-Romagna", tier: 3, employees: 1, revenue: 259736, ebitda: 14000, fcfe: 0, netCash: 9000, cagr: 2.07, foType: "Full FO", distance: 130, scoreFinancial: 2, scoreValuation: 5, scoreStrategic: 4, scoreResponsive: 0, scoreConvergence: 0 },
    { id: "rinascimento", name: "Rinascimento SCF", city: "MI", region: "Milan, Lombardy", tier: 3, employees: 2, revenue: 125105, ebitda: 26000, fcfe: 20447, netCash: 95000, cagr: null, foType: "Partial FO", distance: 243, scoreFinancial: 2, scoreValuation: 5, scoreStrategic: 2.5, scoreResponsive: 0, scoreConvergence: 0 }
];

// Pre-defined scenarios
const SCENARIOS = {
    conservative: ["tokos", "stratos", "absolut"],
    ambitious: ["tokos", "stratos", "absolut", "81scf", "foitalia"],
    fullsweep: ["tokos", "stratos", "absolut", "81scf", "foitalia", "secolare", "veneris", "csfo"],
    vicenza: ["stratos", "absolut", "81scf"],
    none: []
};

// State
let selectedIds = new Set();

// ====================================================================
//  PARAMETER READING
// ====================================================================
function getParams() {
    const feeRate = parseFloat(document.getElementById('fee-rate').value) / 100;
    const aumMult = parseFloat(document.getElementById('aum-mult').value) / 100;
    const discRate = parseFloat(document.getElementById('discount-rate').value) / 100;
    const growthRate = parseFloat(document.getElementById('growth-rate').value) / 100;
    const dcfWeight = parseFloat(document.getElementById('dcf-weight').value) / 100;
    const wFin = parseFloat(document.getElementById('w-fin').value) / 100;
    const wVal = parseFloat(document.getElementById('w-val').value) / 100;
    const wStrat = parseFloat(document.getElementById('w-strat').value) / 100;
    const wResp = parseFloat(document.getElementById('w-resp').value) / 100;
    const wConv = parseFloat(document.getElementById('w-conv').value) / 100;
    return { feeRate, aumMult, discRate, growthRate, dcfWeight, wFin, wVal, wStrat, wResp, wConv };
}

// ====================================================================
//  VALUATION CALCULATIONS
// ====================================================================
function computeValuation(scf, params) {
    const { feeRate, aumMult, discRate, growthRate, dcfWeight } = params;
    const derivedAuA = scf.revenue / feeRate;

    // P/AUM valuation
    const priceAUM = derivedAuA * aumMult;

    // DCF valuation
    let priceDCF = 0;
    if (discRate > growthRate && scf.fcfe > 0) {
        priceDCF = scf.fcfe / (discRate - growthRate);
    }

    // Blended
    const blended = dcfWeight * priceDCF + (1 - dcfWeight) * priceAUM;

    // EV/EBITDA cross-check
    const evEbitda = scf.ebitda > 0 ? blended / scf.ebitda : null;

    return { derivedAuA, priceDCF, priceAUM, blended, evEbitda };
}

function computeScore(scf, params) {
    const { wFin, wVal, wStrat, wResp, wConv } = params;
    const totalW = wFin + wVal + wStrat + wResp + wConv;
    if (totalW === 0) return 0;
    const raw = (
        scf.scoreFinancial * wFin +
        scf.scoreValuation * wVal +
        scf.scoreStrategic * wStrat +
        scf.scoreResponsive * wResp +
        scf.scoreConvergence * wConv
    ) / totalW;
    return raw;
}

// ====================================================================
//  RENDER FUNCTIONS
// ====================================================================
function formatEur(val) {
    if (val === null || val === undefined || isNaN(val)) return '—';
    if (Math.abs(val) >= 1e9) return '€' + (val / 1e9).toFixed(2) + 'B';
    if (Math.abs(val) >= 1e6) return '€' + (val / 1e6).toFixed(2) + 'M';
    if (Math.abs(val) >= 1e3) return '€' + (val / 1e3).toFixed(0) + 'K';
    return '€' + val.toFixed(0);
}

function formatPct(val) {
    if (val === null || val === undefined) return '—';
    return (val * 100).toFixed(0) + '%';
}

function renderSCFGrid() {
    const grid = document.getElementById('scf-grid');
    grid.innerHTML = '';
    SCF_DATA.forEach(scf => {
        const isSelected = selectedIds.has(scf.id);
        const cagrText = scf.cagr !== null ? (scf.cagr >= 0 ? '+' : '') + (scf.cagr * 100).toFixed(0) + '%' : 'N/A';
        const cagrClass = scf.cagr !== null ? (scf.cagr >= 0 ? 'positive' : 'negative') : '';
        const marginPct = scf.ebitda / scf.revenue;

        const el = document.createElement('div');
        el.className = 'scf-item' + (isSelected ? ' selected' : '');
        el.onclick = () => toggleSCF(scf.id);
        el.innerHTML = `
        <span class="scf-tier tier-${scf.tier}">Tier ${scf.tier}</span>
        <div class="scf-name">${scf.name}</div>
        <div class="scf-location">${scf.region} · ${scf.foType} · ${scf.employees} emp</div>
        <div class="scf-metrics">
            <div class="scf-metric">
                <span class="scf-metric-label">Revenue '24</span>
                <span class="scf-metric-value">${formatEur(scf.revenue)}</span>
            </div>
            <div class="scf-metric">
                <span class="scf-metric-label">3yr CAGR</span>
                <span class="scf-metric-value ${cagrClass}">${cagrText}</span>
            </div>
            <div class="scf-metric">
                <span class="scf-metric-label">EBITDA Margin</span>
                <span class="scf-metric-value">${(marginPct * 100).toFixed(0)}%</span>
            </div>
            <div class="scf-metric">
                <span class="scf-metric-label">Net Cash</span>
                <span class="scf-metric-value">${formatEur(scf.netCash)}</span>
            </div>
        </div>
    `;
        grid.appendChild(el);
    });
}

function renderResults() {
    const params = getParams();
    const selected = SCF_DATA.filter(s => selectedIds.has(s.id));

    // Compute per-SCF valuations
    const valuations = selected.map(s => ({
        scf: s,
        ...computeValuation(s, params),
        score: computeScore(s, params)
    }));

    // Aggregates
    const totalCost = valuations.reduce((sum, v) => sum + v.blended, 0);
    const totalAuA = valuations.reduce((sum, v) => sum + v.derivedAuA, 0);
    const totalRev = selected.reduce((sum, s) => sum + s.revenue, 0);
    const totalFCFE = selected.reduce((sum, s) => sum + s.fcfe, 0);
    const totalEmp = selected.reduce((sum, s) => sum + s.employees, 0);
    const totalEBITDA = selected.reduce((sum, s) => sum + s.ebitda, 0);
    const avgMargin = totalRev > 0 ? totalEBITDA / totalRev : 0;
    const costPerAuA = totalAuA > 0 ? (totalCost / totalAuA * 100) : 0;

    // KPI tiles
    document.getElementById('total-cost').textContent = selected.length ? formatEur(totalCost) : '—';
    document.getElementById('total-cost-sub').textContent = selected.length ? `Blended (${(params.dcfWeight * 100).toFixed(0)}% DCF + ${((1 - params.dcfWeight) * 100).toFixed(0)}% P/AUM)` : '';
    document.getElementById('total-aua').textContent = selected.length ? formatEur(totalAuA) : '—';
    document.getElementById('total-aua-sub').textContent = selected.length ? `at ${(params.feeRate * 100).toFixed(2)}% fee rate` : '';
    document.getElementById('total-rev').textContent = selected.length ? formatEur(totalRev) : '—';
    document.getElementById('total-rev-sub').textContent = selected.length ? 'FY 2024' : '';
    document.getElementById('total-fcfe').textContent = selected.length ? formatEur(totalFCFE) : '—';
    document.getElementById('total-fcfe-sub').textContent = selected.length ? `Implied yield: ${totalCost > 0 ? (totalFCFE / totalCost * 100).toFixed(1) : 0}%` : '';
    document.getElementById('avg-margin').textContent = selected.length ? (avgMargin * 100).toFixed(1) + '%' : '—';
    document.getElementById('cost-per-aua').textContent = selected.length ? costPerAuA.toFixed(3) + '%' : '—';
    document.getElementById('num-scfs').textContent = selected.length;
    document.getElementById('total-emp').textContent = selected.length ? totalEmp : '—';

    // Detailed table — ALL SCFs, sorted by score
    const allValuations = SCF_DATA.map(s => ({
        scf: s,
        ...computeValuation(s, params),
        score: computeScore(s, params),
        isSelected: selectedIds.has(s.id)
    })).sort((a, b) => b.score - a.score);

    const tbody = document.getElementById('valuation-tbody');
    tbody.innerHTML = '';
    allValuations.forEach(v => {
        const tr = document.createElement('tr');
        tr.style.opacity = v.isSelected ? '1' : '0.45';
        tr.innerHTML = `
        <td>${v.isSelected ? ' ' : ''}${v.scf.name} (${v.scf.city})</td>
        <td>${formatEur(v.scf.revenue)}</td>
        <td>${formatEur(v.scf.fcfe)}</td>
        <td>${formatEur(v.derivedAuA)}</td>
        <td>${formatEur(v.priceDCF)}</td>
        <td>${formatEur(v.priceAUM)}</td>
        <td style="font-weight:700;color:var(--text-primary)">${formatEur(v.blended)}</td>
        <td>${v.evEbitda !== null ? v.evEbitda.toFixed(1) + 'x' : '—'}</td>
        <td style="font-weight:700;color:var(--accent-teal)">${v.score.toFixed(2)}</td>
    `;
        tbody.appendChild(tr);
    });

    // Bar chart ranking
    const barContainer = document.getElementById('ranking-bars');
    barContainer.innerHTML = '';
    const maxScore = 5;
    const colors = [
        'linear-gradient(90deg, #22c55e, #2dd4bf)',
        'linear-gradient(90deg, #3b82f6, #60a5fa)',
        'linear-gradient(90deg, #8b5cf6, #a78bfa)',
        'linear-gradient(90deg, #d4a843, #f0c866)',
        'linear-gradient(90deg, #ef4444, #f87171)',
    ];
    allValuations.forEach((v, i) => {
        const pct = (v.score / maxScore * 100).toFixed(1);
        const row = document.createElement('div');
        row.className = 'bar-row';
        row.innerHTML = `
        <div class="bar-label">${v.scf.name}</div>
        <div class="bar-track">
            <div class="bar-fill" style="width:${pct}%;background:${colors[i % colors.length]}">
                ${v.score.toFixed(2)} / 5.00
            </div>
        </div>
    `;
        barContainer.appendChild(row);
    });

    // Sensitivity heatmap
    renderSensitivity(params);
}

function renderSensitivity(params) {
    const grid = document.getElementById('sensitivity-grid');
    grid.innerHTML = '';
    const selected = SCF_DATA.filter(s => selectedIds.has(s.id));
    if (selected.length === 0) {
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:20px">Select SCFs to see sensitivity analysis</div>';
        return;
    }

    const feeRates = [0.003, 0.004, 0.005, 0.006, 0.007];
    const discRates = [0.06, 0.08, 0.10, 0.12];

    // Corner
    grid.innerHTML += '<div class="sens-header">r \\ fee</div>';
    feeRates.forEach(f => {
        grid.innerHTML += `<div class="sens-header">${(f * 100).toFixed(1)}%</div>`;
    });

    // Find min/max for color scale
    let allVals = [];
    discRates.forEach(r => {
        feeRates.forEach(f => {
            let total = 0;
            selected.forEach(s => {
                const p = { ...params, feeRate: f, discRate: r };
                total += computeValuation(s, p).blended;
            });
            allVals.push(total);
        });
    });
    const minVal = Math.min(...allVals);
    const maxVal = Math.max(...allVals);

    discRates.forEach(r => {
        grid.innerHTML += `<div class="sens-row-label">${(r * 100).toFixed(0)}%</div>`;
        feeRates.forEach(f => {
            let total = 0;
            selected.forEach(s => {
                const p = { ...params, feeRate: f, discRate: r };
                total += computeValuation(s, p).blended;
            });
            const ratio = maxVal > minVal ? (total - minVal) / (maxVal - minVal) : 0.5;
            // Interpolate from green (low cost = good) to red (high cost)
            const hue = (1 - ratio) * 120; // 120=green, 0=red
            const bg = `hsla(${hue}, 70%, 40%, 0.25)`;
            const isBase = Math.abs(f - params.feeRate) < 0.0001 && Math.abs(r - params.discRate) < 0.005;
            grid.innerHTML += `<div class="sens-cell" style="background:${bg};${isBase ? 'outline:2px solid var(--accent-teal);font-weight:800' : ''}">${formatEur(total)}</div>`;
        });
    });
}

// ====================================================================
//  EVENT HANDLERS
// ====================================================================
function toggleSCF(id) {
    if (selectedIds.has(id)) selectedIds.delete(id);
    else selectedIds.add(id);
    renderSCFGrid();
    renderResults();
}

function selectScenario(name) {
    selectedIds = new Set(SCENARIOS[name] || []);
    renderSCFGrid();
    renderResults();
}

function updateParams() {
    // Update slider display values
    const p = getParams();
    document.getElementById('fee-rate-val').textContent = (p.feeRate * 100).toFixed(2) + '%';
    document.getElementById('aum-mult-val').textContent = (p.aumMult * 100).toFixed(2) + '%';
    document.getElementById('discount-rate-val').textContent = (p.discRate * 100).toFixed(1) + '%';
    document.getElementById('growth-rate-val').textContent = (p.growthRate * 100).toFixed(1) + '%';
    document.getElementById('dcf-weight-val').textContent = (p.dcfWeight * 100).toFixed(0) + '%';
    document.getElementById('w-fin-val').textContent = (p.wFin * 100).toFixed(0) + '%';
    document.getElementById('w-val-val').textContent = (p.wVal * 100).toFixed(0) + '%';
    document.getElementById('w-strat-val').textContent = (p.wStrat * 100).toFixed(0) + '%';
    document.getElementById('w-resp-val').textContent = (p.wResp * 100).toFixed(0) + '%';
    document.getElementById('w-conv-val').textContent = (p.wConv * 100).toFixed(0) + '%';

    // Total weight indicator
    const totalW = p.wFin + p.wVal + p.wStrat + p.wResp + p.wConv;
    const twEl = document.getElementById('total-weight');
    twEl.textContent = (totalW * 100).toFixed(0) + '%';
    twEl.style.color = Math.abs(totalW - 1) < 0.001 ? 'var(--accent-teal)' : 'var(--accent-red)';

    renderResults();
}

// ====================================================================
//  INIT — select the Conservative scenario by default
// ====================================================================
selectScenario('conservative');
updateParams();

// ====================================================================
//  QR CODE GENERATOR
// ====================================================================
(function() {
    const url = window.location.href;
    const qrSrc = 'https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=0&data=' + encodeURIComponent(url);
    document.getElementById('qr-img').src = qrSrc;
    document.getElementById('qr-url-label').textContent = url.length > 60 ? url.slice(0,57)+'…' : url;
})();
