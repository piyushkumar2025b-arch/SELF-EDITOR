/* ═══════════════════════════════════════════════════════════════
   js/scratchpad.js — Persistent Multi-Note Scratchpad
   Stores notes in localStorage. Separate from the main document.
   ═══════════════════════════════════════════════════════════════ */

const SCRATCH_KEY   = 'inkwell-scratchpad-notes';
const SCRATCH_ACTIVE = 'inkwell-scratchpad-active';
let scratchActiveId = null;

// ── DATA LAYER ────────────────────────────────────────────────
function loadNotes() {
  try {
    return JSON.parse(localStorage.getItem(SCRATCH_KEY) || '[]');
  } catch { return []; }
}

function saveNotes(notes) {
  localStorage.setItem(SCRATCH_KEY, JSON.stringify(notes));
}

function getNoteById(id) {
  return loadNotes().find(n => n.id === id) || null;
}

// ── INIT ──────────────────────────────────────────────────────
function initScratchpad() {
  let notes = loadNotes();
  if (!notes.length) {
    const starter = {
      id: Date.now(),
      title: 'Quick Notes',
      body: 'Use this pad for ideas, to-dos, or anything that doesn\'t belong in the main doc.',
      color: '#fff9c4',
      updated: Date.now(),
    };
    notes = [starter];
    saveNotes(notes);
  }
  scratchActiveId = parseInt(localStorage.getItem(SCRATCH_ACTIVE) || notes[0].id, 10);
  renderScratchTabs();
  loadActiveNote();
}

// ── TABS ──────────────────────────────────────────────────────
function renderScratchTabs() {
  const tabs = document.getElementById('scratch-tabs');
  if (!tabs) return;
  const notes = loadNotes();

  tabs.innerHTML = notes.map(n => `
    <div class="scratch-tab${n.id === scratchActiveId ? ' active' : ''}"
         onclick="switchScratchNote(${n.id})"
         title="${n.title}">
      <span class="scratch-tab-dot" style="background:${n.color}"></span>
      <span class="scratch-tab-label">${n.title.slice(0, 14)}${n.title.length > 14 ? '…' : ''}</span>
    </div>
  `).join('') + `
    <button class="scratch-add-btn" onclick="addScratchNote()" title="New note">＋</button>
  `;
}

function switchScratchNote(id) {
  // Save current note first
  flushActiveNote();
  scratchActiveId = id;
  localStorage.setItem(SCRATCH_ACTIVE, id);
  renderScratchTabs();
  loadActiveNote();
}

// ── LOAD / FLUSH ──────────────────────────────────────────────
function loadActiveNote() {
  const note = getNoteById(scratchActiveId);
  const titleEl = document.getElementById('scratch-title');
  const bodyEl  = document.getElementById('scratch-body');
  const colorEl = document.getElementById('scratch-color');
  const wc      = document.getElementById('scratch-wc');

  if (!note) return;
  if (titleEl) titleEl.value = note.title;
  if (bodyEl)  bodyEl.value  = note.body;
  if (colorEl) colorEl.value = note.color || '#fff9c4';
  updateScratchBg(note.color);
  updateScratchWordCount(note.body);
}

function flushActiveNote() {
  const titleEl = document.getElementById('scratch-title');
  const bodyEl  = document.getElementById('scratch-body');
  if (!titleEl || !bodyEl) return;

  const notes = loadNotes();
  const idx   = notes.findIndex(n => n.id === scratchActiveId);
  if (idx === -1) return;

  notes[idx].title   = titleEl.value.trim() || 'Untitled';
  notes[idx].body    = bodyEl.value;
  notes[idx].updated = Date.now();
  saveNotes(notes);
  renderScratchTabs();
}

// ── ADD / DELETE ──────────────────────────────────────────────
function addScratchNote() {
  flushActiveNote();
  const colors  = ['#fff9c4','#c8e6c9','#bbdefb','#f8bbd9','#ffe0b2','#e1bee7'];
  const newNote = {
    id:      Date.now(),
    title:   'New Note',
    body:    '',
    color:   colors[loadNotes().length % colors.length],
    updated: Date.now(),
  };
  const notes = loadNotes();
  notes.push(newNote);
  saveNotes(notes);
  scratchActiveId = newNote.id;
  localStorage.setItem(SCRATCH_ACTIVE, newNote.id);
  renderScratchTabs();
  loadActiveNote();
  document.getElementById('scratch-title')?.select();
}

function deleteCurrentScratchNote() {
  let notes = loadNotes();
  if (notes.length <= 1) { showToast('Keep at least one note'); return; }
  notes = notes.filter(n => n.id !== scratchActiveId);
  saveNotes(notes);
  scratchActiveId = notes[notes.length - 1].id;
  localStorage.setItem(SCRATCH_ACTIVE, scratchActiveId);
  renderScratchTabs();
  loadActiveNote();
  showToast('Note deleted');
}

// ── UTILITIES ─────────────────────────────────────────────────
function updateScratchBg(color) {
  const area = document.getElementById('scratch-area');
  if (area) area.style.background = color || '#fff9c4';
}

function updateScratchWordCount(text) {
  const el = document.getElementById('scratch-wc');
  if (!el) return;
  const words = text ? text.trim().split(/\s+/).filter(w => w).length : 0;
  el.textContent = `${words} word${words !== 1 ? 's' : ''}`;
}

function onScratchInput() {
  const bodyEl = document.getElementById('scratch-body');
  if (bodyEl) updateScratchWordCount(bodyEl.value);
  clearTimeout(window._scratchTimer);
  window._scratchTimer = setTimeout(flushActiveNote, 800);
}

function onScratchColorChange() {
  const colorEl = document.getElementById('scratch-color');
  const color   = colorEl?.value || '#fff9c4';
  updateScratchBg(color);
  flushActiveNote();
  // persist color immediately
  const notes = loadNotes();
  const idx   = notes.findIndex(n => n.id === scratchActiveId);
  if (idx !== -1) { notes[idx].color = color; saveNotes(notes); }
}

// ── MOVE TO EDITOR ────────────────────────────────────────────
function moveScratchToEditor() {
  const note = getNoteById(scratchActiveId);
  if (!note || !note.body.trim()) { showToast('Nothing to move'); return; }
  if (typeof editor === 'undefined') return;
  editor.focus();
  document.execCommand('insertText', false, '\n' + note.body + '\n');
  if (typeof updateStats === 'function') updateStats();
  showToast('✓ Note moved to editor');
}

// ── INJECT STYLES ─────────────────────────────────────────────
(function injectScratchStyles() {
  if (document.getElementById('scratch-styles')) return;
  const s = document.createElement('style');
  s.id = 'scratch-styles';
  s.textContent = `
    .scratch-tabs-wrap { display:flex; gap:3px; align-items:center; flex-wrap:wrap; margin-bottom:6px; }
    .scratch-tab { display:flex; align-items:center; gap:4px; font-size:.75rem; padding:3px 8px; border-radius:12px;
                   border:1px solid var(--border,#ddd); cursor:pointer; white-space:nowrap; background:var(--bg,#fff); transition:.15s; }
    .scratch-tab.active { border-color:var(--accent,#557aaa); background:var(--accent,#557aaa); color:#fff; }
    .scratch-tab:hover:not(.active) { background:var(--bg2,#f5f5f5); }
    .scratch-tab-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
    .scratch-add-btn { font-size:1rem; line-height:1; padding:2px 6px; border:1px dashed var(--border,#ccc); border-radius:12px;
                       background:transparent; cursor:pointer; color:var(--muted,#888); }
    .scratch-add-btn:hover { border-color:var(--accent,#557aaa); color:var(--accent,#557aaa); }
    .scratch-area { border-radius:8px; overflow:hidden; border:1px solid var(--border,#e0e0e0); transition:background .2s; }
    #scratch-title { width:100%; box-sizing:border-box; border:none; border-bottom:1px solid var(--border,#e0e0e0);
                     background:transparent; padding:7px 10px; font-weight:600; font-size:.9rem; outline:none; }
    #scratch-body  { width:100%; box-sizing:border-box; border:none; background:transparent; padding:8px 10px;
                     font-size:.82rem; line-height:1.55; resize:none; outline:none; min-height:120px; font-family:inherit; }
    .scratch-footer { display:flex; align-items:center; gap:6px; padding:4px 8px; border-top:1px solid var(--border,#e0e0e0); background:rgba(255,255,255,.5); }
    #scratch-wc { font-size:.72rem; color:var(--muted,#888); flex:1; }
    .scratch-color-wrap { display:flex; align-items:center; gap:4px; font-size:.75rem; color:var(--muted,#888); }
    #scratch-color { width:22px; height:22px; border:none; border-radius:50%; padding:0; cursor:pointer; background:none; }
  `;
  document.head.appendChild(s);
})();

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', initScratchpad);
