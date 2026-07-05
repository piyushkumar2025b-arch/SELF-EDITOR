// ── AUTO SAVE ─────────────────────────────────────
function triggerSave() {
  const indicator = document.getElementById('save-indicator');
  if (indicator) indicator.textContent = 'saving…';
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem('inkwell-content', editor.innerHTML);
      const docTitle = document.getElementById('doc-title');
      if (docTitle) localStorage.setItem('inkwell-title', docTitle.value);
      if (indicator) indicator.textContent = 'saved';
    } catch(e) {
      if (indicator) indicator.textContent = 'not saved';
    }
  }, 800);
}

// ── SAVE & DOWNLOAD ──────────────────────────────
let saveDownloadFormat = 'docx';
function setSaveDownloadFormat(el, fmt) {
  saveDownloadFormat = fmt;
  document.querySelectorAll('[data-sdfmt]').forEach(b => b.classList.remove('selected'));
  if (el) el.classList.add('selected');
}

async function saveThenDownload() {
  // 1. Save locally first
  try {
    localStorage.setItem('inkwell-content', editor.innerHTML);
    const docTitle = document.getElementById('doc-title');
    if (docTitle) localStorage.setItem('inkwell-title', docTitle.value);
    const indicator = document.getElementById('save-indicator');
    if (indicator) indicator.textContent = 'saved';
  } catch(e) {
    const indicator = document.getElementById('save-indicator');
    if (indicator) indicator.textContent = 'not saved';
  }
  // 2. Then trigger the chosen export/download
  if (typeof exportPDF === 'function' && typeof exportTxt === 'function' && 
      typeof exportMd === 'function' && typeof exportHtml === 'function' && 
      typeof exportDocx === 'function') {
    switch (saveDownloadFormat) {
      case 'pdf':  await exportPDF(); break;
      case 'txt':  exportTxt(); break;
      case 'md':   exportMd(); break;
      case 'html': exportHtml(); break;
      case 'docx':
      default:     await exportDocx(); break;
    }
  } else {
    console.warn("Export functions not loaded yet.");
  }
  showToast('✓ Saved & downloaded');
}

// ── VERSION HISTORY ──────────────────────────────────────────
const VERSION_KEY = 'inkwell-versions';
function loadVersions() {
  try { return JSON.parse(localStorage.getItem(VERSION_KEY) || '[]'); } catch(e) { return []; }
}
function persistVersions(list) {
  try { localStorage.setItem(VERSION_KEY, JSON.stringify(list.slice(0, 20))); } catch(e) {}
}
function saveVersionSnapshot(manual) {
  const text = getPlainText().trim();
  const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
  const list = loadVersions();
  const preview = text.slice(0, 90) || '(empty document)';
  const docTitle = document.getElementById('doc-title');
  list.unshift({
    id: 'v' + Date.now(),
    time: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    words,
    preview,
    title: docTitle ? docTitle.value : '',
    html: editor.innerHTML
  });
  persistVersions(list);
  renderVersionList();
  if (manual) showToast('📌 Snapshot saved');
}
function renderVersionList() {
  const el = document.getElementById('version-list');
  if (!el) return;
  const list = loadVersions();
  if (!list.length) { el.innerHTML = '<div class="version-empty">No snapshots yet.</div>'; return; }
  el.innerHTML = list.map(v => `
    <div class="version-item">
      <div class="vi-top"><span class="vi-time">${v.time}</span><span class="vi-words">${v.words} words</span></div>
      <div class="vi-preview">${(v.preview || '').replace(/</g,'&lt;')}</div>
      <div class="vi-actions">
        <button onclick="restoreVersion('${v.id}')">Restore</button>
        <button class="vi-delete" onclick="deleteVersion('${v.id}')">Delete</button>
      </div>
    </div>`).join('');
}
function restoreVersion(id) {
  const list = loadVersions();
  const v = list.find(x => x.id === id);
  if (!v) return;
  if (!confirm('Restore this snapshot? Your current unsaved text will be replaced (this version’s own copy stays in history).')) return;
  editor.innerHTML = v.html;
  const docTitle = document.getElementById('doc-title');
  if (docTitle) docTitle.value = v.title || '';
  if (typeof updateStats === 'function') updateStats();
  if (typeof updateGoalDisplay === 'function') updateGoalDisplay();
  if (typeof rebuildOutline === 'function') rebuildOutline();
  triggerSave();
  showToast('↺ Version restored');
}
function deleteVersion(id) {
  const list = loadVersions().filter(x => x.id !== id);
  persistVersions(list);
  renderVersionList();
}

// Auto-snapshot every 4 minutes if there's content
let lastAutoSnapshotWordCount = -1;
setInterval(() => {
  const text = getPlainText().trim();
  if (!text) return;
  const words = text.split(/\s+/).filter(Boolean).length;
  if (words !== lastAutoSnapshotWordCount) {
    lastAutoSnapshotWordCount = words;
    saveVersionSnapshot(false);
  }
}, 240000);

// ── DOCUMENT LIBRARY ─────────────────────────────────────────
const DOCLIB_KEY = 'inkwell-library';
let currentLibDocId = null;
function loadLibrary() {
  try { return JSON.parse(localStorage.getItem(DOCLIB_KEY) || '[]'); } catch(e) { return []; }
}
function persistLibrary(list) {
  try { localStorage.setItem(DOCLIB_KEY, JSON.stringify(list)); } catch(e) {}
}
function toggleDocLibraryModal() {
  renderDocLibrary();
  const modal = document.getElementById('doclib-modal-overlay');
  if (modal) modal.classList.toggle('show');
}
function saveCurrentToLibrary(manual) {
  const list = loadLibrary();
  const docTitle = document.getElementById('doc-title');
  const title = (docTitle ? docTitle.value.trim() : '') || 'Untitled document';
  const html = editor.innerHTML;
  const words = getPlainText().trim() ? getPlainText().trim().split(/\s+/).filter(Boolean).length : 0;
  const now = new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  if (currentLibDocId) {
    const existing = list.find(d => d.id === currentLibDocId);
    if (existing) {
      existing.title = title; existing.html = html; existing.words = words; existing.updated = now;
    } else {
      currentLibDocId = 'd' + Date.now();
      list.unshift({ id: currentLibDocId, title, html, words, updated: now });
    }
  } else {
    currentLibDocId = 'd' + Date.now();
    list.unshift({ id: currentLibDocId, title, html, words, updated: now });
  }
  persistLibrary(list);
  renderDocLibrary();
  if (manual) showToast('💾 Saved to library');
}
function renderDocLibrary() {
  const el = document.getElementById('doclib-list');
  if (!el) return;
  const list = loadLibrary();
  if (!list.length) { el.innerHTML = '<div class="doclib-empty">No saved documents yet.</div>'; return; }
  el.innerHTML = list.map(d => `
    <div class="doclib-item ${d.id === currentLibDocId ? 'active-doc' : ''}" onclick="switchToLibraryDoc('${d.id}', event)">
      <div class="dl-title">${(d.title || 'Untitled').replace(/</g,'&lt;')}</div>
      <div class="dl-meta">${d.updated} · ${d.words} words</div>
      <div class="dl-actions">
        <button onclick="renameLibraryDoc('${d.id}', event)">Rename</button>
        <button class="dl-delete" onclick="deleteLibraryDoc('${d.id}', event)">Delete</button>
      </div>
    </div>`).join('');
}
function switchToLibraryDoc(id, evt) {
  if (evt && evt.target.tagName === 'BUTTON') return;
  const list = loadLibrary();
  const d = list.find(x => x.id === id);
  if (!d) return;
  saveCurrentToLibrary(false);
  currentLibDocId = id;
  editor.innerHTML = d.html;
  const docTitle = document.getElementById('doc-title');
  if (docTitle) docTitle.value = d.title;
  if (typeof updateStats === 'function') updateStats();
  if (typeof updateGoalDisplay === 'function') updateGoalDisplay();
  if (typeof rebuildOutline === 'function') rebuildOutline();
  triggerSave();
  toggleDocLibraryModal();
  showToast('✓ Switched to "' + d.title + '"');
}
function renameLibraryDoc(id, evt) {
  if (evt) evt.stopPropagation();
  const list = loadLibrary();
  const d = list.find(x => x.id === id);
  if (!d) return;
  const name = prompt('Rename document:', d.title);
  if (!name) return;
  d.title = name;
  persistLibrary(list);
  const docTitle = document.getElementById('doc-title');
  if (id === currentLibDocId && docTitle) docTitle.value = name;
  renderDocLibrary();
}
function deleteLibraryDoc(id, evt) {
  if (evt) evt.stopPropagation();
  if (!confirm('Delete this document from the library? This cannot be undone.')) return;
  persistLibrary(loadLibrary().filter(x => x.id !== id));
  if (id === currentLibDocId) currentLibDocId = null;
  renderDocLibrary();
}

// Add overlay click events
const doclibOverlay = document.getElementById('doclib-modal-overlay');
if (doclibOverlay) {
  doclibOverlay.addEventListener('click', e => {
    if (e.target.id === 'doclib-modal-overlay') toggleDocLibraryModal();
  });
}
