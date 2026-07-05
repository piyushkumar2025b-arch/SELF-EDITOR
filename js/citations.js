/* ═══════════════════════════════════════════════════════════════
   js/citations.js — Citation & Bibliography Manager
   Supports APA, MLA, Chicago styles. Sources stored in localStorage.
   ═══════════════════════════════════════════════════════════════ */

const CITES_KEY = 'inkwell-citations';

// ── LOAD / SAVE ───────────────────────────────────────────────
function loadCitations() {
  try { return JSON.parse(localStorage.getItem(CITES_KEY) || '[]'); }
  catch { return []; }
}

function saveCitations(list) {
  localStorage.setItem(CITES_KEY, JSON.stringify(list));
}

// ── FORMATTERS ────────────────────────────────────────────────
const CITE_STYLES = ['APA', 'MLA', 'Chicago'];

function formatCitation(src, style) {
  const { type, author, title, year, publisher, url, journal, volume, issue, pages, city } = src;
  const au  = (author || 'Unknown Author').trim();
  const yr  = year   || 'n.d.';
  const ti  = title  || 'Untitled';
  const pub = publisher || '';
  const jrn = journal || '';

  if (style === 'APA') {
    if (type === 'book')
      return `${au} (${yr}). <em>${ti}</em>. ${[city, pub].filter(Boolean).join(': ')}.`;
    if (type === 'journal')
      return `${au} (${yr}). ${ti}. <em>${jrn}</em>${volume ? `, ${volume}` : ''}${issue ? `(${issue})` : ''}${pages ? `, ${pages}` : ''}.`;
    if (type === 'website')
      return `${au} (${yr}). ${ti}. ${url ? `Retrieved from <a href="${url}" target="_blank">${url}</a>` : ''}`;
    return `${au} (${yr}). <em>${ti}</em>.`;
  }

  if (style === 'MLA') {
    if (type === 'book')
      return `${au}. <em>${ti}</em>. ${[city, pub].filter(Boolean).join(': ')}, ${yr}.`;
    if (type === 'journal')
      return `${au}. "${ti}." <em>${jrn}</em>, vol. ${volume || '—'}, no. ${issue || '—'}, ${yr}, pp. ${pages || '—'}.`;
    if (type === 'website')
      return `${au}. "${ti}." <em>Web</em>, ${yr}. ${url ? `<a href="${url}" target="_blank">${url}</a>` : ''}`;
    return `${au}. <em>${ti}</em>. ${yr}.`;
  }

  if (style === 'Chicago') {
    if (type === 'book')
      return `${au}. <em>${ti}</em>. ${city ? city + ': ' : ''}${pub}${pub ? ', ' : ''}${yr}.`;
    if (type === 'journal')
      return `${au}. "${ti}." <em>${jrn}</em> ${volume || ''}${issue ? ', no. ' + issue : ''} (${yr}): ${pages || ''}.`;
    if (type === 'website')
      return `${au}. "${ti}." Accessed ${yr}. ${url ? `<a href="${url}" target="_blank">${url}</a>` : ''}`;
    return `${au}. <em>${ti}</em>. ${yr}.`;
  }

  return `${au}. ${ti}. ${yr}.`;
}

// ── RENDER PANEL ──────────────────────────────────────────────
let _citeStyle = 'APA';

function renderCitationsPanel() {
  const out = document.getElementById('citations-output');
  if (!out) return;

  const list = loadCitations();

  const styleButtons = CITE_STYLES.map(s =>
    `<button class="mini-btn${_citeStyle === s ? ' selected' : ''}" style="flex:1" onclick="setCiteStyle('${s}')">${s}</button>`
  ).join('');

  const rows = list.length ? list.map((src, i) => `
    <div style="background:rgba(255,255,255,.05);border-radius:6px;padding:8px 10px;margin-bottom:6px">
      <div style="font-size:.76rem;line-height:1.5">${formatCitation(src, _citeStyle)}</div>
      <div style="display:flex;gap:5px;margin-top:6px">
        <button class="mini-btn" style="flex:1;padding:3px 6px;font-size:.7rem" onclick="insertCitationInline(${i})">Insert</button>
        <button class="mini-btn" style="flex:1;padding:3px 6px;font-size:.7rem" onclick="deleteCitation(${i})">Delete</button>
      </div>
    </div>`).join('') : `<div style="font-size:.75rem;opacity:.4;text-align:center;padding:12px">No sources yet — add one below.</div>`;

  out.innerHTML = `
    <div style="display:flex;gap:4px;margin-bottom:10px">${styleButtons}</div>
    <div id="cite-list">${rows}</div>
    ${list.length ? `<button class="mini-btn" style="width:100%;margin-bottom:10px" onclick="insertBibliography()">Insert Full Bibliography</button>` : ''}
    <details id="cite-add-details">
      <summary style="font-size:.76rem;cursor:pointer;color:rgba(247,244,238,.55)">＋ Add source</summary>
      <div style="display:flex;flex-direction:column;gap:5px;margin-top:8px">
        <select id="cite-type" style="padding:4px 8px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.15);border-radius:4px;color:inherit">
          <option value="book">Book</option>
          <option value="journal">Journal Article</option>
          <option value="website">Website</option>
          <option value="other">Other</option>
        </select>
        ${['author','title','year','publisher','journal','volume','issue','pages','city','url'].map(f => `
          <input type="text" id="cite-${f}" placeholder="${f.charAt(0).toUpperCase() + f.slice(1)}…"
            style="padding:4px 8px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.15);border-radius:4px;color:inherit;font-size:.8rem">`
        ).join('')}
        <button class="mini-btn" onclick="addCitationFromForm()">Save Source</button>
      </div>
    </details>`;
}

function setCiteStyle(style) {
  _citeStyle = style;
  renderCitationsPanel();
}

function addCitationFromForm() {
  const get = id => (document.getElementById(`cite-${id}`)?.value || '').trim();
  const src = {
    id: Date.now(),
    type:      document.getElementById('cite-type')?.value || 'book',
    author:    get('author'),
    title:     get('title'),
    year:      get('year'),
    publisher: get('publisher'),
    journal:   get('journal'),
    volume:    get('volume'),
    issue:     get('issue'),
    pages:     get('pages'),
    city:      get('city'),
    url:       get('url'),
  };
  if (!src.title) { if (typeof showToast === 'function') showToast('Enter at least a title'); return; }
  const list = loadCitations();
  list.push(src);
  saveCitations(list);
  renderCitationsPanel();
  if (typeof showToast === 'function') showToast('Source saved ✓');
}

function deleteCitation(i) {
  const list = loadCitations();
  list.splice(i, 1);
  saveCitations(list);
  renderCitationsPanel();
}

function insertCitationInline(i) {
  const src  = loadCitations()[i];
  if (!src) return;
  const au   = src.author ? src.author.split(' ').pop() : 'Unknown';
  const yr   = src.year || 'n.d.';
  const text = _citeStyle === 'MLA' ? `(${au} ${yr})` : `(${au}, ${yr})`;
  if (typeof editor !== 'undefined') {
    editor.focus();
    const sel = window.getSelection();
    if (typeof savedRange !== 'undefined' && savedRange) { sel.removeAllRanges(); sel.addRange(savedRange); }
    document.execCommand('insertText', false, text);
    if (typeof updateStats === 'function') updateStats();
    if (typeof triggerSave  === 'function') triggerSave();
  }
  if (typeof showToast === 'function') showToast('Citation inserted');
}

function insertBibliography() {
  const list = loadCitations();
  if (!list.length) return;
  const sorted = [...list].sort((a, b) => (a.author || '').localeCompare(b.author || ''));
  const title  = _citeStyle === 'Chicago' ? 'Bibliography' : _citeStyle === 'MLA' ? 'Works Cited' : 'References';
  const html   = `<h2>${title}</h2><ol>${sorted.map(src => `<li>${formatCitation(src, _citeStyle)}</li>`).join('')}</ol><p></p>`;
  if (typeof editor !== 'undefined') {
    editor.focus();
    document.execCommand('insertHTML', false, html);
    if (typeof updateStats === 'function') updateStats();
    if (typeof triggerSave  === 'function') triggerSave();
  }
  if (typeof showToast === 'function') showToast(`${title} inserted`);
}
