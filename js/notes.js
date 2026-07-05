/* ═══════════════════════════════════════════════════════════════
   js/notes.js — Smart Annotations & Margin Notes
   Lets writers pin colour-coded margin notes to their document.
   Notes persist in localStorage, anchored by paragraph index.
   ═══════════════════════════════════════════════════════════════ */

const ANNOTATIONS_KEY = 'inkwell-annotations';

// ── DATA ──────────────────────────────────────────────────────
function loadAnnotations() {
  try { return JSON.parse(localStorage.getItem(ANNOTATIONS_KEY) || '[]'); }
  catch { return []; }
}

function saveAnnotations(list) {
  localStorage.setItem(ANNOTATIONS_KEY, JSON.stringify(list));
}

// ── COLOUR TAGS ───────────────────────────────────────────────
const NOTE_COLORS = {
  yellow : { bg: '#fff9c4', border: '#f0d060', label: 'Note'     },
  blue   : { bg: '#d0e8ff', border: '#6aadff', label: 'Research' },
  green  : { bg: '#d4f5e0', border: '#5dbf80', label: 'Idea'     },
  red    : { bg: '#fde0e0', border: '#e07070', label: 'Fix'      },
  purple : { bg: '#ecdaff', border: '#b07adc', label: 'Todo'     },
};

// ── RENDER PANEL ──────────────────────────────────────────────
function renderAnnotationsPanel() {
  const out = document.getElementById('annotations-output');
  if (!out) return;

  const list = loadAnnotations();

  const colorPicker = Object.entries(NOTE_COLORS).map(([key, c]) =>
    `<span title="${c.label}" onclick="_noteColor='${key}';renderAnnotationsPanel()"
      style="display:inline-block;width:18px;height:18px;border-radius:50%;background:${c.bg};border:2px solid ${c.border};cursor:pointer;${_noteColor===key?'outline:2px solid white;outline-offset:1px':''}"></span>`
  ).join('');

  const items = list.length ? [...list].reverse().map((note, ri) => {
    const i = list.length - 1 - ri;
    const c = NOTE_COLORS[note.color] || NOTE_COLORS.yellow;
    return `
      <div style="background:${c.bg};border-left:3px solid ${c.border};border-radius:0 5px 5px 0;padding:7px 9px;margin-bottom:6px;color:#222">
        <div style="font-size:.65rem;opacity:.6;margin-bottom:3px">${c.label} · ${new Date(note.ts).toLocaleDateString()}</div>
        <div style="font-size:.8rem;line-height:1.4">${escapeHtml(note.text)}</div>
        <div style="display:flex;gap:4px;margin-top:6px">
          <button onclick="editAnnotation(${i})" style="font-size:.65rem;padding:2px 6px;border:1px solid ${c.border};background:transparent;border-radius:3px;cursor:pointer;color:#333">Edit</button>
          <button onclick="deleteAnnotation(${i})" style="font-size:.65rem;padding:2px 6px;border:1px solid ${c.border};background:transparent;border-radius:3px;cursor:pointer;color:#333">Delete</button>
          <button onclick="insertAnnotationText(${i})" style="font-size:.65rem;padding:2px 6px;border:1px solid ${c.border};background:transparent;border-radius:3px;cursor:pointer;color:#333">→ Editor</button>
        </div>
      </div>`;
  }).join('') : `<div style="font-size:.75rem;opacity:.4;text-align:center;padding:12px">No margin notes yet.</div>`;

  out.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
      <span style="font-size:.7rem;opacity:.5">Colour:</span>
      <div style="display:flex;gap:5px">${colorPicker}</div>
    </div>
    <div style="display:flex;gap:5px;margin-bottom:10px">
      <textarea id="note-input" rows="2" placeholder="Write a margin note…"
        style="flex:1;padding:5px 8px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.15);border-radius:4px;color:inherit;font-size:.8rem;resize:vertical;font-family:inherit"></textarea>
      <button class="mini-btn" style="align-self:flex-end" onclick="addAnnotation()">Add</button>
    </div>
    <div id="annotation-list">${items}</div>
    ${list.length > 0 ? `<button class="mini-btn" style="width:100%;margin-top:4px;opacity:.6" onclick="clearAllAnnotations()">Clear All Notes</button>` : ''}`;
}

let _noteColor = 'yellow';

function addAnnotation() {
  const inp  = document.getElementById('note-input');
  const text = (inp?.value || '').trim();
  if (!text) return;

  const list = loadAnnotations();
  list.push({ id: Date.now(), text, color: _noteColor, ts: Date.now() });
  saveAnnotations(list);
  if (inp) inp.value = '';
  renderAnnotationsPanel();
  if (typeof showToast === 'function') showToast('Note added ✓');
}

function deleteAnnotation(i) {
  const list = loadAnnotations();
  list.splice(i, 1);
  saveAnnotations(list);
  renderAnnotationsPanel();
}

function editAnnotation(i) {
  const list = loadAnnotations();
  const note = list[i];
  if (!note) return;
  const newText = prompt('Edit note:', note.text);
  if (newText === null) return;
  note.text = newText.trim();
  note.ts   = Date.now();
  saveAnnotations(list);
  renderAnnotationsPanel();
}

function insertAnnotationText(i) {
  const note = loadAnnotations()[i];
  if (!note || typeof editor === 'undefined') return;
  editor.focus();
  document.execCommand('insertText', false, note.text);
  if (typeof updateStats === 'function') updateStats();
  if (typeof triggerSave  === 'function') triggerSave();
  if (typeof showToast    === 'function') showToast('Note inserted into editor');
}

function clearAllAnnotations() {
  if (!confirm('Delete all margin notes?')) return;
  saveAnnotations([]);
  renderAnnotationsPanel();
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
