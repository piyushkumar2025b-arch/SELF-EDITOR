/* ═══════════════════════════════════════════════════════════════
   js/focusmode.js — Focus Mode & Typewriter Scrolling
   Dims everything but the sidebar toggle and centers the active line.
   ═══════════════════════════════════════════════════════════════ */

let fmFocusActive = false;
let fmTypewriterActive = false;

// ── FOCUS MODE (hide chrome, dim non-active paragraph) ────────
function fmToggleFocusMode() {
  fmFocusActive = !fmFocusActive;
  document.body.classList.toggle('fm-focus-active', fmFocusActive);
  const btn = document.getElementById('fm-focus-btn');
  if (btn) btn.classList.toggle('active', fmFocusActive);
  showToast(fmFocusActive ? 'Focus mode on — press Esc to exit' : 'Focus mode off');
  if (fmFocusActive && editor) editor.focus();
}

// ── TYPEWRITER MODE (keep caret vertically centered) ──────────
function fmToggleTypewriterMode() {
  fmTypewriterActive = !fmTypewriterActive;
  const btn = document.getElementById('fm-typewriter-btn');
  if (btn) btn.classList.toggle('active', fmTypewriterActive);
  showToast(fmTypewriterActive ? 'Typewriter scrolling on' : 'Typewriter scrolling off');
  if (fmTypewriterActive) fmCenterCaret();
}

function fmCenterCaret() {
  if (!fmTypewriterActive || !editor) return;
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const range = sel.getRangeAt(0);
  if (!editor.contains(range.startContainer)) return;

  const rects = range.getClientRects();
  const rect = rects.length ? rects[0] : range.startContainer.parentElement?.getBoundingClientRect();
  if (!rect) return;

  const scrollContainer = document.getElementById('page') || editor;
  const containerRect = scrollContainer.getBoundingClientRect();
  const target = rect.top - containerRect.top - (containerRect.height / 2);

  scrollContainer.scrollBy({ top: target, behavior: 'smooth' });
}

function fmHandleTypewriterKeyup() {
  if (fmTypewriterActive) fmCenterCaret();
}

if (editor) {
  editor.addEventListener('keyup', fmHandleTypewriterKeyup);
  editor.addEventListener('click', fmHandleTypewriterKeyup);
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && fmFocusActive) fmToggleFocusMode();
});

// ── STYLES ────────────────────────────────────────────────────
(function injectFmStyles() {
  if (document.getElementById('fm-styles')) return;
  const s = document.createElement('style');
  s.id = 'fm-styles';
  s.textContent = `
    .fm-row { display:flex; gap:8px; margin-bottom:6px; }
    .fm-row .mini-btn { flex:1; }
    .fm-row .mini-btn.active { background:var(--accent,#557aaa); color:#fff; border-color:var(--accent,#557aaa); }
    body.fm-focus-active #topbar,
    body.fm-focus-active #toolbar,
    body.fm-focus-active #export-panel { opacity:.06; transition:opacity .25s; pointer-events:none; }
    body.fm-focus-active #topbar:hover,
    body.fm-focus-active #toolbar:hover,
    body.fm-focus-active #export-panel:hover { opacity:1; pointer-events:auto; }
    .fm-hint { font-size:.72rem; color:var(--muted,#888); margin-top:4px; }
  `;
  document.head.appendChild(s);
})();
