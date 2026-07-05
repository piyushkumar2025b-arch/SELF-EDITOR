/* ═══════════════════════════════════════════════════════════════
   js/outline.js — Chapter / Scene Outline Navigator
   Maintains a structured outline (chapters + scenes) separate from
   the manuscript, with drag-free reordering via up/down buttons.
   ═══════════════════════════════════════════════════════════════ */

const OUTLINE_KEY = 'inkwell-outline';

function _outlineLoad() {
  try { return JSON.parse(localStorage.getItem(OUTLINE_KEY) || '[]'); }
  catch { return []; }
}
function _outlineSave(chapters) {
  localStorage.setItem(OUTLINE_KEY, JSON.stringify(chapters));
}

function addOutlineChapter() {
  const chapters = _outlineLoad();
  chapters.push({ id: Date.now(), title: `Chapter ${chapters.length + 1}`, scenes: [] });
  _outlineSave(chapters);
  renderOutline();
}

function deleteOutlineChapter(chId) {
  if (!confirm('Delete this chapter and all its scenes?')) return;
  const chapters = _outlineLoad().filter(c => c.id !== chId);
  _outlineSave(chapters);
  renderOutline();
}

function renameOutlineChapter(chId, el) {
  const chapters = _outlineLoad();
  const ch = chapters.find(c => c.id === chId);
  if (ch) { ch.title = el.value || ch.title; _outlineSave(chapters); }
}

function moveOutlineChapter(chId, dir) {
  const chapters = _outlineLoad();
  const i = chapters.findIndex(c => c.id === chId);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= chapters.length) return;
  [chapters[i], chapters[j]] = [chapters[j], chapters[i]];
  _outlineSave(chapters);
  renderOutline();
}

function addOutlineScene(chId) {
  const chapters = _outlineLoad();
  const ch = chapters.find(c => c.id === chId);
  if (!ch) return;
  ch.scenes.push({ id: Date.now(), summary: '', status: 'planned' });
  _outlineSave(chapters);
  renderOutline();
}

function deleteOutlineScene(chId, scId) {
  const chapters = _outlineLoad();
  const ch = chapters.find(c => c.id === chId);
  if (!ch) return;
  ch.scenes = ch.scenes.filter(s => s.id !== scId);
  _outlineSave(chapters);
  renderOutline();
}

function updateOutlineScene(chId, scId, field, value) {
  const chapters = _outlineLoad();
  const ch = chapters.find(c => c.id === chId);
  const sc = ch?.scenes.find(s => s.id === scId);
  if (sc) { sc[field] = value; _outlineSave(chapters); }
}

function moveOutlineScene(chId, scId, dir) {
  const chapters = _outlineLoad();
  const ch = chapters.find(c => c.id === chId);
  if (!ch) return;
  const i = ch.scenes.findIndex(s => s.id === scId);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= ch.scenes.length) return;
  [ch.scenes[i], ch.scenes[j]] = [ch.scenes[j], ch.scenes[i]];
  _outlineSave(chapters);
  renderOutline();
}

const OUTLINE_STATUS_COLORS = {
  planned: '#8a8a92',
  drafting: '#3d5f9a',
  done: '#4c9a5c',
};

function renderOutline() {
  const out = document.getElementById('outline-output');
  if (!out) return;
  const chapters = _outlineLoad();

  if (!chapters.length) {
    out.innerHTML = '<div style="opacity:.4;font-size:.78rem;text-align:center;padding:10px">No chapters yet. Add one to start outlining.</div>';
  } else {
    out.innerHTML = chapters.map((ch, ci) => `
      <div style="background:rgba(255,255,255,.04);border-radius:6px;padding:8px;margin-bottom:8px">
        <div style="display:flex;align-items:center;gap:4px;margin-bottom:6px">
          <input type="text" value="${(ch.title || '').replace(/"/g, '&quot;')}" oninput="renameOutlineChapter(${ch.id}, this)"
            style="flex:1;font-weight:600;font-size:.85rem;background:transparent;border:none;border-bottom:1px solid rgba(255,255,255,.15);color:inherit;padding:2px 0">
          <button class="mini-btn" style="padding:2px 6px;font-size:.65rem" onclick="moveOutlineChapter(${ch.id},-1)" ${ci === 0 ? 'disabled' : ''}>↑</button>
          <button class="mini-btn" style="padding:2px 6px;font-size:.65rem" onclick="moveOutlineChapter(${ch.id},1)" ${ci === chapters.length - 1 ? 'disabled' : ''}>↓</button>
          <button class="mini-btn" style="padding:2px 6px;font-size:.65rem" onclick="deleteOutlineChapter(${ch.id})">✕</button>
        </div>
        ${ch.scenes.map((sc, si) => `
          <div style="display:flex;gap:4px;align-items:flex-start;margin:4px 0;padding-left:8px;border-left:2px solid ${OUTLINE_STATUS_COLORS[sc.status] || '#8a8a92'}">
            <textarea rows="2" placeholder="Scene summary…" oninput="updateOutlineScene(${ch.id},${sc.id},'summary',this.value)"
              style="flex:1;font-size:.76rem;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:4px;color:inherit;padding:4px 6px;resize:vertical;font-family:inherit">${sc.summary || ''}</textarea>
            <div style="display:flex;flex-direction:column;gap:2px">
              <select onchange="updateOutlineScene(${ch.id},${sc.id},'status',this.value)" style="font-size:.65rem;background:rgba(255,255,255,.07);color:inherit;border:1px solid rgba(255,255,255,.15);border-radius:3px">
                <option value="planned" ${sc.status === 'planned' ? 'selected' : ''}>Planned</option>
                <option value="drafting" ${sc.status === 'drafting' ? 'selected' : ''}>Drafting</option>
                <option value="done" ${sc.status === 'done' ? 'selected' : ''}>Done</option>
              </select>
              <div style="display:flex;gap:2px">
                <button class="mini-btn" style="padding:1px 4px;font-size:.6rem" onclick="moveOutlineScene(${ch.id},${sc.id},-1)" ${si === 0 ? 'disabled' : ''}>↑</button>
                <button class="mini-btn" style="padding:1px 4px;font-size:.6rem" onclick="moveOutlineScene(${ch.id},${sc.id},1)" ${si === ch.scenes.length - 1 ? 'disabled' : ''}>↓</button>
                <button class="mini-btn" style="padding:1px 4px;font-size:.6rem" onclick="deleteOutlineScene(${ch.id},${sc.id})">✕</button>
              </div>
            </div>
          </div>
        `).join('')}
        <button class="mini-btn" style="width:100%;margin-top:6px;font-size:.72rem" onclick="addOutlineScene(${ch.id})">+ Add Scene</button>
      </div>
    `).join('');
  }

  const total = chapters.reduce((a, c) => a + c.scenes.length, 0);
  const done  = chapters.reduce((a, c) => a + c.scenes.filter(s => s.status === 'done').length, 0);
  const progressEl = document.getElementById('outline-progress');
  if (progressEl) {
    progressEl.textContent = total ? `${done}/${total} scenes complete` : '';
  }
}

function exportOutlineToEditor() {
  const chapters = _outlineLoad();
  if (!chapters.length || !editor) return;
  let html = '';
  chapters.forEach(ch => {
    html += `<h2>${ch.title}</h2>`;
    ch.scenes.forEach(sc => {
      html += `<p><em>${sc.summary || '(no summary)'}</em></p>`;
    });
  });
  editor.focus();
  document.execCommand('insertHTML', false, html);
  if (typeof showToast === 'function') showToast('Outline inserted into document ✓');
}

document.addEventListener('DOMContentLoaded', () => {
  if (typeof renderOutline === 'function') renderOutline();
});
