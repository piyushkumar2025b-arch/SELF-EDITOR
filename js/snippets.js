/* ═══════════════════════════════════════════════════════════════
   js/snippets.js — Reusable Text Snippets & Templates Manager
   Stores snippets in localStorage. No external API needed.
   ═══════════════════════════════════════════════════════════════ */

const SNIPPETS_KEY = 'inkwell-snippets';

const DEFAULT_SNIPPETS = [
  { id: 1, name: 'Chapter Heading', tag: 'structure', text: 'Chapter [N]\n\n' },
  { id: 2, name: 'Scene Break', tag: 'structure', text: '\n* * *\n\n' },
  { id: 3, name: 'Time Skip', tag: 'structure', text: '\n— [TIME LATER] —\n\n' },
  { id: 4, name: 'Dialogue Beat', tag: 'fiction', text: '"[Dialogue]," [Character] said, "[action]."' },
  { id: 5, name: 'Internal Thought', tag: 'fiction', text: '[Character] thought, [thought]. But [complication].' },
  { id: 6, name: 'Dear [Name],', tag: 'letter', text: 'Dear [Name],\n\nI am writing to [purpose].\n\nSincerely,\n[Your Name]' },
  { id: 7, name: 'Email Sign-off', tag: 'letter', text: '\nBest regards,\n[Your Name]\n[Your Title]' },
  { id: 8, name: 'TBD Placeholder', tag: 'util', text: '[TBD — expand this section]' },
];

// ── LOAD / SAVE ───────────────────────────────────────────────
function loadSnippets() {
  try {
    const raw = localStorage.getItem(SNIPPETS_KEY);
    return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(DEFAULT_SNIPPETS));
  } catch { return JSON.parse(JSON.stringify(DEFAULT_SNIPPETS)); }
}

function saveSnippets(snippets) {
  localStorage.setItem(SNIPPETS_KEY, JSON.stringify(snippets));
}

// ── RENDER LIST ───────────────────────────────────────────────
function renderSnippetList(filter = '') {
  const out = document.getElementById('snippets-list');
  if (!out) return;

  const snippets = loadSnippets();
  const lf = filter.toLowerCase();
  const filtered = lf
    ? snippets.filter(s => s.name.toLowerCase().includes(lf) || s.tag.toLowerCase().includes(lf))
    : snippets;

  if (!filtered.length) {
    out.innerHTML = `<div class="snip-empty">No snippets found. Add one below.</div>`;
    return;
  }

  const tags = [...new Set(snippets.map(s => s.tag))];
  const tagColors = {};
  const palette = ['#6c8ebf','#82b366','#d6a520','#b05fbf','#bf6c6c','#5fafbf'];
  tags.forEach((t, i) => tagColors[t] = palette[i % palette.length]);

  out.innerHTML = filtered.map(s => `
    <div class="snip-item" data-id="${s.id}">
      <div class="snip-top">
        <span class="snip-name">${s.name}</span>
        <span class="snip-tag" style="background:${tagColors[s.tag]}22;color:${tagColors[s.tag]};border:1px solid ${tagColors[s.tag]}44">${s.tag}</span>
      </div>
      <div class="snip-preview">${s.text.replace(/\n/g, ' ↵ ').slice(0, 60)}${s.text.length > 60 ? '…' : ''}</div>
      <div class="snip-actions">
        <button class="snip-btn snip-insert" onclick="insertSnippet(${s.id})" title="Insert into editor">Insert</button>
        <button class="snip-btn snip-copy"   onclick="copySnippet(${s.id})"   title="Copy to clipboard">Copy</button>
        <button class="snip-btn snip-delete" onclick="deleteSnippet(${s.id})" title="Delete snippet">✕</button>
      </div>
    </div>
  `).join('');
}

// ── INSERT / COPY ─────────────────────────────────────────────
function insertSnippet(id) {
  const snippets = loadSnippets();
  const s = snippets.find(x => x.id === id);
  if (!s || typeof editor === 'undefined') return;

  editor.focus();
  if (typeof restoreSelectionRange === 'function') restoreSelectionRange();
  document.execCommand('insertText', false, s.text);
  if (typeof updateStats === 'function') updateStats();
  if (typeof triggerSave === 'function') triggerSave();
  showToast(`✓ Inserted "${s.name}"`);
}

function copySnippet(id) {
  const snippets = loadSnippets();
  const s = snippets.find(x => x.id === id);
  if (!s) return;
  navigator.clipboard.writeText(s.text).then(() => showToast('✓ Copied to clipboard'));
}

function deleteSnippet(id) {
  let snippets = loadSnippets();
  snippets = snippets.filter(x => x.id !== id);
  saveSnippets(snippets);
  renderSnippetList(document.getElementById('snippets-search')?.value || '');
  showToast('Snippet deleted');
}

// ── ADD NEW SNIPPET ───────────────────────────────────────────
function addSnippetFromForm() {
  const nameEl = document.getElementById('snip-new-name');
  const tagEl  = document.getElementById('snip-new-tag');
  const textEl = document.getElementById('snip-new-text');
  if (!nameEl || !textEl) return;

  const name = nameEl.value.trim();
  const tag  = (tagEl?.value.trim() || 'custom').toLowerCase();
  const text = textEl.value;

  if (!name) { showToast('Give the snippet a name'); return; }
  if (!text) { showToast('Snippet text is empty');   return; }

  const snippets = loadSnippets();
  const maxId = snippets.reduce((m, s) => Math.max(m, s.id), 0);
  snippets.push({ id: maxId + 1, name, tag, text });
  saveSnippets(snippets);

  nameEl.value = '';
  if (tagEl) tagEl.value = '';
  textEl.value = '';
  renderSnippetList();
  showToast(`✓ Snippet "${name}" saved`);
}

// ── SAVE SELECTION AS SNIPPET ─────────────────────────────────
function saveSelectionAsSnippet() {
  const sel  = window.getSelection();
  const text = sel ? sel.toString() : '';
  if (!text.trim()) { showToast('Select text in the editor first'); return; }

  const textEl = document.getElementById('snip-new-text');
  const nameEl = document.getElementById('snip-new-name');
  if (textEl) textEl.value = text;
  if (nameEl) nameEl.focus();

  jumpToSection('ep-snippets');
  showToast('Selection copied to new snippet form — give it a name!');
}

// ── INJECT STYLES ─────────────────────────────────────────────
(function injectSnipStyles() {
  if (document.getElementById('snip-styles')) return;
  const s = document.createElement('style');
  s.id = 'snip-styles';
  s.textContent = `
    .snip-item { background:var(--bg2,#2e2e2e); border:1px solid var(--border,#444); border-radius:7px; padding:8px 10px; margin-bottom:6px; }
    .snip-top { display:flex; align-items:center; gap:6px; margin-bottom:3px; }
    .snip-name { font-size:.84rem; font-weight:600; flex:1; }
    .snip-tag  { font-size:.68rem; padding:2px 7px; border-radius:10px; }
    .snip-preview { font-size:.75rem; color:var(--muted,#888); margin-bottom:6px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .snip-actions { display:flex; gap:5px; }
    .snip-btn { font-size:.74rem; padding:3px 9px; border-radius:4px; border:1px solid var(--border,#555); background:var(--bg,#222); color:inherit; cursor:pointer; }
    .snip-btn:hover { background:var(--accent,#557aaa); color:#fff; border-color:var(--accent,#557aaa); }
    .snip-insert { border-color:var(--accent,#557aaa); color:var(--accent,#557aaa); }
    .snip-delete { color:#c44; border-color:#c44; }
    .snip-delete:hover { background:#c44; color:#fff; border-color:#c44; }
    .snip-empty { font-size:.82rem; color:var(--muted,#888); padding:8px 0; }
  `;
  document.head.appendChild(s);
})();

// ── SEARCH FILTER ─────────────────────────────────────────────
function filterSnippets() {
  const val = document.getElementById('snippets-search')?.value || '';
  renderSnippetList(val);
}

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderSnippetList();
});
