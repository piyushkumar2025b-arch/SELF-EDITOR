// ── STATE ─────────────────────────────────────────
const editor = document.getElementById('editor');
const page   = document.getElementById('page');
let fontSize = 17;
let saveTimer = null;
let savedRange = null;

// ── CLOCK ─────────────────────────────────────────
function updateClock() {
  const now = new Date();
  const t = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const clockEl = document.getElementById('topbar-clock');
  if (clockEl) clockEl.innerHTML = `<span>${t}</span>`;
}
updateClock();
setInterval(updateClock, 30000);

// ── PLAIN TEXT UTILITY ────────────────────────────
function getPlainText() {
  return editor ? (editor.innerText || '') : '';
}

function getTitle() {
  const titleEl = document.getElementById('doc-title');
  return titleEl ? (titleEl.value.trim() || 'inkwell-document') : 'inkwell-document';
}

// ── TOAST & LOADING OVERLAY ───────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  if (t) {
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2800);
  }
}

function showLoading(msg) {
  const msgEl = document.getElementById('loading-msg');
  if (msgEl) msgEl.textContent = msg || 'Preparing export…';
  const loadEl = document.getElementById('loading');
  if (loadEl) loadEl.classList.add('show');
}

function hideLoading() {
  const loadEl = document.getElementById('loading');
  if (loadEl) loadEl.classList.remove('show');
}

// ── SELECTION RANGE HELPERS ───────────────────────
function saveSelectionRange() {
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0 && editor && editor.contains(sel.anchorNode)) {
    savedRange = sel.getRangeAt(0).cloneRange();
  }
}

if (editor) {
  editor.addEventListener('mouseup', saveSelectionRange);
  editor.addEventListener('keyup', saveSelectionRange);
}
