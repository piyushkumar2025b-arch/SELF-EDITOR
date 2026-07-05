// ── PRESENT TIME WIDGET ──────────────────────────────────────
function updateWidgetClock() {
  const now    = new Date();
  const timeEl = document.getElementById('widget-clock-time');
  const dateEl = document.getElementById('widget-clock-date');
  if (timeEl) timeEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  if (dateEl) dateEl.textContent = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}
updateWidgetClock();
setInterval(updateWidgetClock, 1000);

// ── COLLAPSIBLE PANEL SECTIONS ─────────────────────────────
function toggleCollapse(id) {
  const head = document.getElementById('head-' + id);
  const body = document.getElementById('body-' + id);
  if (!head || !body) return;
  const open = body.classList.toggle('open');
  head.classList.toggle('open', open);
}

function jumpToSection(id) {
  const body   = document.getElementById('body-' + id);
  const head   = document.getElementById('head-' + id);
  if (body && !body.classList.contains('open')) {
    body.classList.add('open');
    if (head) head.classList.add('open');
  }
  const target = document.getElementById(id + '-section') || document.getElementById(id) || body;
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    target.classList.add('jump-flash');
    setTimeout(() => target.classList.remove('jump-flash'), 1100);
  }
}

// ── FOCUS MODE ────────────────────────────────────────────────
function toggleFocusMode() {
  const on  = document.body.classList.toggle('focus-mode');
  const btn = document.getElementById('focus-mode-btn');
  if (btn) btn.classList.toggle('active', on);
  showToast(on ? '◎ Focus Mode on — press Esc to exit' : 'Focus Mode off');
  if (on && editor) editor.focus();
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && document.body.classList.contains('focus-mode')) {
    toggleFocusMode();
  }
});

// ── OUTLINE NAVIGATOR ────────────────────────────────────────
let outlineHeadingCounter = 0;
function rebuildOutline() {
  const list = document.getElementById('outline-list');
  if (!list) return;
  const headings = editor.querySelectorAll('h1, h2, h3');
  if (!headings.length) {
    list.innerHTML = '<div class="outline-empty">Add H1/H2/H3 headings to build an outline.</div>';
    return;
  }
  let html = '';
  headings.forEach(h => {
    if (!h.id) h.id = 'iw-heading-' + (outlineHeadingCounter++);
    const lvl  = h.tagName === 'H1' ? 1 : (h.tagName === 'H2' ? 2 : 3);
    const text = (h.textContent || '').trim() || '(untitled heading)';
    html += `<button class="outline-item lvl-${lvl}" onclick="jumpToHeading('${h.id}')">${text.replace(/</g,'&lt;')}</button>`;
  });
  list.innerHTML = html;
}

function jumpToHeading(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.classList.add('jump-flash');
  setTimeout(() => el.classList.remove('jump-flash'), 1100);
}

let outlineDebounce = null;
if (editor) {
  editor.addEventListener('input', () => {
    clearTimeout(outlineDebounce);
    outlineDebounce = setTimeout(rebuildOutline, 500);
  });
}
rebuildOutline();

// ── POMODORO / WRITING TIMER ─────────────────────────────────
let pomoSecondsLeft = 25 * 60;
let pomoInterval   = null;
let pomoIsBreak    = false;
let pomoSessions   = 0;

function pomoFormat(s) {
  const m   = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return m + ':' + sec;
}
function pomoRender() {
  const t = document.getElementById('pomo-time');
  if (t) t.textContent = pomoFormat(pomoSecondsLeft);
}
function pomodoroStart() {
  if (pomoInterval) return;
  const startBtn = document.getElementById('pomo-start-btn');
  if (startBtn) startBtn.textContent = 'Running…';
  pomoInterval = setInterval(() => {
    pomoSecondsLeft--;
    if (pomoSecondsLeft <= 0) {
      clearInterval(pomoInterval);
      pomoInterval = null;
      if (startBtn) startBtn.textContent = 'Start';
      if (!pomoIsBreak) {
        pomoSessions++;
        const sc = document.getElementById('pomo-session-count');
        if (sc) sc.textContent = pomoSessions;
        showToast('⏰ Session complete — take a short break');
      } else {
        showToast('⏰ Break over — back to writing');
      }
      pomoIsBreak = !pomoIsBreak;
      pomoSecondsLeft = pomoIsBreak ? 5 * 60 : 25 * 60;
      const lbl = document.getElementById('pomo-phase-label');
      if (lbl) lbl.textContent = pomoIsBreak ? 'Break' : 'Focus session';
      pomoRender();
      pomodoroStart();
    } else {
      pomoRender();
    }
  }, 1000);
  showToast('▶ Timer started');
}
function pomodoroPause() {
  clearInterval(pomoInterval);
  pomoInterval = null;
  const startBtn = document.getElementById('pomo-start-btn');
  if (startBtn) startBtn.textContent = 'Resume';
}
function pomodoroReset() {
  clearInterval(pomoInterval);
  pomoInterval = null;
  pomoIsBreak = false;
  pomoSecondsLeft = 25 * 60;
  const lbl = document.getElementById('pomo-phase-label');
  if (lbl) lbl.textContent = 'Focus session';
  const startBtn = document.getElementById('pomo-start-btn');
  if (startBtn) startBtn.textContent = 'Start';
  pomoRender();
}
pomoRender();

// ── SHORTCUTS MODAL ──────────────────────────────────────────
function toggleShortcutsModal() {
  const el = document.getElementById('shortcuts-modal-overlay');
  if (el) el.classList.toggle('show');
}
const shortcutsOverlay = document.getElementById('shortcuts-modal-overlay');
if (shortcutsOverlay) {
  shortcutsOverlay.addEventListener('click', e => {
    if (e.target.id === 'shortcuts-modal-overlay') toggleShortcutsModal();
  });
}

// ── TEMPLATE MODAL ───────────────────────────────────────────
function toggleTemplateModal() {
  const el = document.getElementById('template-modal-overlay');
  if (el) el.classList.toggle('show');
}
const templateOverlay = document.getElementById('template-modal-overlay');
if (templateOverlay) {
  templateOverlay.addEventListener('click', e => {
    if (e.target.id === 'template-modal-overlay') toggleTemplateModal();
  });
}

const TEMPLATES = {
  letter:  `<p>Your Name<br>Your Address<br>City, State ZIP</p><p><br></p><p>${new Date().toLocaleDateString()}</p><p><br></p><p>Dear [Recipient],</p><p><br></p><p>[Body of your letter…]</p><p><br></p><p>Sincerely,<br>[Your Name]</p>`,
  essay:   `<h1>Essay Title</h1><p><em>Introduction — state your thesis and preview your main points.</em></p><h2>First Point</h2><p>[Supporting evidence and analysis…]</p><h2>Second Point</h2><p>[Supporting evidence and analysis…]</p><h2>Conclusion</h2><p>[Restate thesis and summarize the argument…]</p>`,
  story:   `<h1>Story Title</h1><p style="text-align:center"><em>by Author Name</em></p><h3>Chapter One</h3><p>[Open with a hook that pulls the reader in…]</p><p style="text-align:center">* * *</p><p>[Scene continues…]</p>`,
  resume:  `<h1>Your Name</h1><p>email@example.com · (555) 123-4567 · City, State</p><h2>Experience</h2><p><b>Job Title</b> — Company Name (Year–Year)<br>[Key achievement or responsibility…]</p><h2>Education</h2><p>Degree — Institution (Year)</p><h2>Skills</h2><p>[Skill], [Skill], [Skill]</p>`,
  meeting: `<h1>Meeting Notes</h1><p><b>Date:</b> ${new Date().toLocaleDateString()}<br><b>Attendees:</b> [Names]</p><h2>Agenda</h2><ul><li>[Topic one]</li><li>[Topic two]</li></ul><h2>Action Items</h2><ul class="inkwell-checklist" contenteditable="false"><li><input type="checkbox" onclick="toggleChecklistItem(this)"><span contenteditable="true">[Action item]</span></li></ul>`,
  journal: `<h2>${new Date().toLocaleDateString([], { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</h2><p>[How are you feeling today? What happened? What are you grateful for?]</p>`,
  poem:    `<h1>Poem Title</h1><p style="text-align:center"><em>by Author</em></p><p><br></p><p>[First stanza…]</p><p><br></p><p>[Second stanza…]</p><p><br></p><p><em>— fin —</em></p>`,
  report:  `<h1>Report Title</h1><p><b>Date:</b> ${new Date().toLocaleDateString()} &nbsp;|&nbsp; <b>Author:</b> [Name]</p><h2>Executive Summary</h2><p>[Brief overview of findings…]</p><h2>Background</h2><p>[Context and objectives…]</p><h2>Findings</h2><p>[Main discoveries and data…]</p><h2>Recommendations</h2><p>[What should be done next…]</p>`,
};

function applyTemplate(key) {
  const tpl = TEMPLATES[key];
  if (!tpl) return;
  editor.focus();
  document.execCommand('selectAll', false, null);
  document.getSelection().collapseToStart();
  document.execCommand('insertHTML', false, tpl + '<p><br></p>');
  if (typeof updateStats       === 'function') updateStats();
  if (typeof updateGoalDisplay === 'function') updateGoalDisplay();
  if (typeof rebuildOutline    === 'function') rebuildOutline();
  if (typeof triggerSave       === 'function') triggerSave();
  toggleTemplateModal();
  showToast('✓ Template inserted');
}

// ── QUICK DOCUMENT ACTIONS ───────────────────────────────────
function printDocument() { window.print(); }

async function copyDocumentToClipboard() {
  const text = getPlainText();
  try {
    await navigator.clipboard.writeText(text);
    showToast('✓ Copied to clipboard');
  } catch(e) {
    showToast('⚠ Copy failed — select text manually');
  }
}

function newDocument() {
  if (!confirm('Start a new document? Current text will be cleared (version history is kept).')) return;
  if (typeof saveVersionSnapshot === 'function') saveVersionSnapshot(false);
  editor.innerHTML = '';
  const titleEl = document.getElementById('doc-title');
  if (titleEl) titleEl.value = '';
  if (typeof updateStats       === 'function') updateStats();
  if (typeof updateGoalDisplay === 'function') updateGoalDisplay();
  if (typeof rebuildOutline    === 'function') rebuildOutline();
  if (typeof triggerSave       === 'function') triggerSave();
  editor.focus();
  showToast('✓ New document started');
}

// ── AMBIENT SOUNDS ────────────────────────────────────────────
let ambientCtx    = null;
let ambientNodes  = {};
let ambientActive = null;
let ambientGain   = null;

function ensureAmbientContext() {
  if (!ambientCtx) {
    ambientCtx  = new (window.AudioContext || window.webkitAudioContext)();
    ambientGain = ambientCtx.createGain();
    const vol   = parseInt((document.getElementById('ambient-volume') || {}).value || 35, 10);
    ambientGain.gain.value = (vol / 100) * 0.5;
    ambientGain.connect(ambientCtx.destination);
  }
  if (ambientCtx.state === 'suspended') ambientCtx.resume();
}

function makeNoiseBuffer(ctx) {
  const bufferSize = 2 * ctx.sampleRate;
  const buffer     = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data       = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

function buildAmbientGraph(kind) {
  const src    = ambientCtx.createBufferSource();
  src.buffer   = makeNoiseBuffer(ambientCtx);
  src.loop     = true;
  const filter = ambientCtx.createBiquadFilter();
  if (kind === 'rain')  { filter.type = 'highpass'; filter.frequency.value = 900; }
  else if (kind === 'cafe')  { filter.type = 'bandpass'; filter.frequency.value = 500; filter.Q.value = 0.6; }
  else                       { filter.type = 'lowpass';  filter.frequency.value = 400; } // waves
  src.connect(filter);
  filter.connect(ambientGain);
  let lfo = null;
  if (kind === 'waves') {
    lfo = ambientCtx.createOscillator();
    lfo.frequency.value = 0.12;
    const lfoGain = ambientCtx.createGain();
    lfoGain.gain.value = 200;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();
  }
  src.start();
  return { src, filter, lfo };
}

function toggleAmbient(kind) {
  ensureAmbientContext();
  document.querySelectorAll('.ambient-row button').forEach(b => b.classList.remove('active'));
  if (ambientActive === kind) { stopAmbient(); return; }
  stopAmbient();
  ambientNodes  = buildAmbientGraph(kind);
  ambientActive = kind;
  const btn = document.getElementById('ambient-btn-' + kind);
  if (btn) btn.classList.add('active');
  showToast('🔊 ' + kind.charAt(0).toUpperCase() + kind.slice(1) + ' sounds on');
}

function stopAmbient() {
  if (ambientNodes.src)  { try { ambientNodes.src.stop(); }  catch(e) {} }
  if (ambientNodes.lfo)  { try { ambientNodes.lfo.stop(); }  catch(e) {} }
  ambientNodes  = {};
  ambientActive = null;
}

function setAmbientVolume(val) {
  if (ambientGain) ambientGain.gain.value = (parseInt(val, 10) / 100) * 0.5;
}

// ── TYPEWRITER MODE ───────────────────────────────────────────
let typewriterEnabled = false;
function toggleTypewriterMode(on) {
  typewriterEnabled = on;
  showToast(on ? '✓ Typewriter mode on' : 'Typewriter mode off');
  if (on) centerCaretLine();
}
function centerCaretLine() {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const range    = sel.getRangeAt(0).cloneRange();
  range.collapse(true);
  const rect     = range.getClientRects()[0];
  if (!rect) return;
  const wrap     = document.getElementById('page-wrap');
  const wrapRect = wrap.getBoundingClientRect();
  const target   = wrap.scrollTop + (rect.top - wrapRect.top) - (wrapRect.height / 2);
  wrap.scrollTo({ top: target, behavior: 'smooth' });
}
if (editor) {
  editor.addEventListener('keyup',  () => { if (typewriterEnabled) centerCaretLine(); });
  editor.addEventListener('click',  () => { if (typewriterEnabled) centerCaretLine(); });
}

// ── FULLSCREEN ─────────────────────────────────────────────────
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => showToast('⚠ Fullscreen not available'));
  } else {
    document.exitFullscreen();
  }
}

// ── IMAGE INSERT ──────────────────────────────────────────────
function triggerImageUpload() {
  saveSelectionRange();
  const inp = document.getElementById('image-file-input');
  if (inp) inp.click();
}

function handleImageUpload(evt) {
  const file = evt.target.files && evt.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { showToast('⚠ Please choose an image file'); return; }
  const reader = new FileReader();
  reader.onload = e => {
    editor.focus();
    const sel = window.getSelection();
    if (savedRange) { sel.removeAllRanges(); sel.addRange(savedRange); }
    document.execCommand('insertHTML', false, `<img src="${e.target.result}" alt="${file.name.replace(/"/g,'')}"><p><br></p>`);
    if (typeof updateStats === 'function') updateStats();
    if (typeof triggerSave  === 'function') triggerSave();
    showToast('✓ Image inserted');
  };
  reader.readAsDataURL(file);
  evt.target.value = '';
}

// ── PAGE SETUP ────────────────────────────────────────────────
function setPageSize(el, size) {
  page.className = page.className.replace(/\bpsize-\S+/g, '').trim();
  page.classList.add('psize-' + size);
  document.querySelectorAll('[data-psize]').forEach(b => b.classList.remove('selected'));
  if (el) el.classList.add('selected');
}

function setLineHeight(val) {
  const v = (val / 100).toFixed(1);
  editor.style.lineHeight = v + 'em';
  const lhVal = document.getElementById('lh-val');
  if (lhVal) lhVal.textContent = v;
}

function setPagePadding(val) {
  page.style.padding = val + 'px';
  const padVal = document.getElementById('pad-val');
  if (padVal) padVal.textContent = val + 'px';
}

function setLetterSpacing(val) {
  const v = (val / 1000).toFixed(3);
  editor.style.letterSpacing = v + 'em';
  const lsVal = document.getElementById('ls-val');
  if (lsVal) lsVal.textContent = val / 10;
}

// ── ADDITIONAL KEYBOARD SHORTCUTS ────────────────────────────
document.addEventListener('keydown', e => {
  if (!e.ctrlKey && !e.metaKey) return;
  const key = e.key.toLowerCase();
  if      (key === 's' && !e.altKey) { e.preventDefault(); if (typeof triggerSave === 'function') triggerSave(); showToast('✓ Saved locally'); }
  else if (key === 'e')              { e.preventDefault(); if (typeof exportTxt  === 'function') exportTxt(); }
  else if (key === 'f' && !e.shiftKey) { e.preventDefault(); if (typeof toggleFindReplace === 'function') toggleFindReplace(); }
  else if (key === 'k')              { e.preventDefault(); if (typeof promptInsertLink === 'function') promptInsertLink(); }
  else if (key === '.')              { e.preventDefault(); toggleFocusMode(); }
  else if (key === '/')              { e.preventDefault(); toggleShortcutsModal(); }
  else if (key === 's' && e.altKey)  { e.preventDefault(); if (typeof saveVersionSnapshot === 'function') saveVersionSnapshot(true); }
});
