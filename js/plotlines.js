/* ═══════════════════════════════════════════════════════════════
   js/plotlines.js — Story Structure & Plotline Tracker
   Visual kanban-style board for tracking story beats / scenes.
   Data stored in localStorage.
   ═══════════════════════════════════════════════════════════════ */

const PLOT_KEY = 'inkwell-plotlines';

const DEFAULT_STAGES = ['Idea', 'Draft', 'Written', 'Polished', 'Cut'];

// ── LOAD / SAVE ───────────────────────────────────────────────
function loadPlot() {
  try {
    return JSON.parse(localStorage.getItem(PLOT_KEY) || 'null') || {
      stages: [...DEFAULT_STAGES],
      beats : [],
    };
  } catch { return { stages: [...DEFAULT_STAGES], beats: [] }; }
}

function savePlot(data) {
  localStorage.setItem(PLOT_KEY, JSON.stringify(data));
}

// ── RENDER ────────────────────────────────────────────────────
const BEAT_COLORS = ['#e2c373','#90b4ff','#90ffcc','#ffaaaa','#c8c4bb','#ffd090'];

function renderPlotlines() {
  const out = document.getElementById('plotlines-output');
  if (!out) return;

  const data = loadPlot();
  const { stages, beats } = data;

  const cols = stages.map((stage, si) => {
    const stageBeats = beats.filter(b => b.stage === stage);
    const cards = stageBeats.map(b => {
      const bi = beats.indexOf(b);
      const col = BEAT_COLORS[bi % BEAT_COLORS.length];
      return `
        <div style="background:${col}18;border:1px solid ${col}44;border-radius:5px;padding:6px 8px;margin-bottom:5px;cursor:pointer;position:relative"
             draggable="true" ondragstart="plotDragStart(event,${bi})" ondragover="event.preventDefault()" ondrop="plotDrop(event,${si})">
          <div style="font-size:.78rem;font-weight:600;color:${col};line-height:1.3">${escHtml(b.title)}</div>
          ${b.pov  ? `<div style="font-size:.65rem;opacity:.55;margin-top:2px">👤 ${escHtml(b.pov)}</div>` : ''}
          ${b.note ? `<div style="font-size:.67rem;opacity:.5;margin-top:2px;line-height:1.3">${escHtml(b.note)}</div>` : ''}
          <div style="display:flex;gap:3px;margin-top:5px">
            ${si > 0 ? `<button onclick="moveBeat(${bi},-1)" style="${arrowBtn()}">◀</button>` : ''}
            ${si < stages.length-1 ? `<button onclick="moveBeat(${bi},1)" style="${arrowBtn()}">▶</button>` : ''}
            <button onclick="deleteBeat(${bi})" style="${arrowBtn('#e07070')}">✕</button>
            <button onclick="insertBeatToEditor(${bi})" style="${arrowBtn('#90b4ff')}" title="Send to editor">→</button>
          </div>
        </div>`;
    }).join('');

    return `
      <div style="min-width:120px;max-width:160px;background:rgba(255,255,255,.04);border-radius:6px;padding:8px"
           ondragover="event.preventDefault()" ondrop="plotDrop(event,${si})">
        <div style="font-size:.65rem;text-transform:uppercase;letter-spacing:.08em;opacity:.5;margin-bottom:6px;text-align:center">${escHtml(stage)}</div>
        ${cards}
      </div>`;
  }).join('');

  out.innerHTML = `
    <div style="overflow-x:auto;padding-bottom:6px">
      <div style="display:flex;gap:8px;min-width:max-content">${cols}</div>
    </div>

    <details style="margin-top:10px">
      <summary style="font-size:.76rem;cursor:pointer;color:rgba(247,244,238,.55)">＋ Add Scene / Beat</summary>
      <div style="display:flex;flex-direction:column;gap:5px;margin-top:8px">
        <input type="text" id="beat-title" placeholder="Scene title…"
          style="${inputStyle()}">
        <input type="text" id="beat-pov" placeholder="POV character (optional)…"
          style="${inputStyle()}">
        <textarea id="beat-note" rows="2" placeholder="Notes…"
          style="${inputStyle()}resize:vertical;font-family:inherit"></textarea>
        <select id="beat-stage" style="${inputStyle()}">
          ${stages.map(s => `<option value="${s}">${s}</option>`).join('')}
        </select>
        <button class="mini-btn" onclick="addBeat()">Add Scene</button>
      </div>
    </details>

    <details style="margin-top:6px">
      <summary style="font-size:.76rem;cursor:pointer;color:rgba(247,244,238,.55)">⚙ Edit Stages</summary>
      <div style="display:flex;flex-direction:column;gap:5px;margin-top:8px">
        <div id="stage-list">${stages.map((s,i) => `
          <div style="display:flex;gap:4px;align-items:center;margin-bottom:4px">
            <input type="text" value="${escHtml(s)}" id="stage-name-${i}" style="${inputStyle()}margin-bottom:0">
            <button onclick="deleteStage(${i})" style="${arrowBtn('#e07070')}">✕</button>
          </div>`).join('')}</div>
        <button class="mini-btn" onclick="addStage()">+ Stage</button>
        <button class="mini-btn" onclick="saveStages()">Save Stages</button>
      </div>
    </details>`;
}

function inputStyle() {
  return 'width:100%;padding:4px 8px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.15);border-radius:4px;color:inherit;font-size:.8rem;box-sizing:border-box;';
}

function arrowBtn(color = 'rgba(247,244,238,.5)') {
  return `font-size:.6rem;padding:2px 5px;background:transparent;border:1px solid rgba(255,255,255,.15);border-radius:3px;color:${color};cursor:pointer`;
}

function escHtml(s) {
  return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── CRUD ──────────────────────────────────────────────────────
function addBeat() {
  const title = document.getElementById('beat-title')?.value.trim();
  if (!title) { if (typeof showToast === 'function') showToast('Enter a scene title'); return; }
  const data = loadPlot();
  data.beats.push({
    title,
    pov  : document.getElementById('beat-pov')?.value.trim()   || '',
    note : document.getElementById('beat-note')?.value.trim()   || '',
    stage: document.getElementById('beat-stage')?.value         || data.stages[0],
    id   : Date.now(),
  });
  savePlot(data);
  renderPlotlines();
  if (typeof showToast === 'function') showToast('Scene added ✓');
}

function deleteBeat(i) {
  const data = loadPlot();
  data.beats.splice(i, 1);
  savePlot(data);
  renderPlotlines();
}

function moveBeat(bi, dir) {
  const data  = loadPlot();
  const beat  = data.beats[bi];
  const si    = data.stages.indexOf(beat.stage);
  const newSi = si + dir;
  if (newSi < 0 || newSi >= data.stages.length) return;
  beat.stage = data.stages[newSi];
  savePlot(data);
  renderPlotlines();
}

function insertBeatToEditor(bi) {
  const beat = loadPlot().beats[bi];
  if (!beat || typeof editor === 'undefined') return;
  editor.focus();
  const txt = `[SCENE: ${beat.title}${beat.pov ? ' — ' + beat.pov : ''}]\n${beat.note || ''}\n`;
  document.execCommand('insertText', false, txt);
  if (typeof updateStats === 'function') updateStats();
  if (typeof triggerSave  === 'function') triggerSave();
  if (typeof showToast    === 'function') showToast('Scene outline inserted');
}

// ── DRAG & DROP ───────────────────────────────────────────────
let _dragBeat = null;

function plotDragStart(e, bi) {
  _dragBeat = bi;
  e.dataTransfer.effectAllowed = 'move';
}

function plotDrop(e, si) {
  e.preventDefault();
  if (_dragBeat === null) return;
  const data = loadPlot();
  data.beats[_dragBeat].stage = data.stages[si];
  savePlot(data);
  _dragBeat = null;
  renderPlotlines();
}

// ── STAGES CRUD ───────────────────────────────────────────────
function addStage() {
  const data = loadPlot();
  data.stages.push('New Stage');
  savePlot(data);
  renderPlotlines();
}

function deleteStage(i) {
  const data = loadPlot();
  if (data.stages.length <= 1) return;
  const removed = data.stages.splice(i, 1)[0];
  data.beats.forEach(b => { if (b.stage === removed) b.stage = data.stages[0]; });
  savePlot(data);
  renderPlotlines();
}

function saveStages() {
  const data = loadPlot();
  data.stages = data.stages.map((_, i) => document.getElementById(`stage-name-${i}`)?.value.trim() || _);
  savePlot(data);
  renderPlotlines();
  if (typeof showToast === 'function') showToast('Stages saved ✓');
}
