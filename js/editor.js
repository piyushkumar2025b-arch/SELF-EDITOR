// ── FORMATTING ────────────────────────────────────
function fmt(cmd) { document.execCommand(cmd, false, null); editor.focus(); }

function fmtBlock(tag) {
  document.execCommand('formatBlock', false, tag);
  editor.focus();
}

function insertHR() {
  document.execCommand('insertHTML', false, '<hr style="border:none;border-top:1px solid rgba(45,74,122,.2);margin:20px 0"/>');
  editor.focus();
}

function changeFontSize(delta) {
  fontSize = Math.min(32, Math.max(10, fontSize + delta));
  editor.style.fontSize = fontSize + 'px';
  editor.style.lineHeight = Math.round(fontSize * 1.9) + 'px';
  document.getElementById('fs-display').textContent = fontSize;
}

// ── TEXT / HIGHLIGHT COLOR ───────────────────────────────────
const COLOR_SWATCHES = [
  '#1a1a1f','#48484f','#a84c4c','#c9a84c','#2d4a7a','#3d5f9a','#4c8a6a',
  '#8a4ca8','#d97b3f','#c94c8a','#5a5a5a','#ffffff','#f7f4ee','#e2c373',
  '#90b4ff','#90ffcc','#ffaaaa','#ffd090','#c8c4bb','#7ec8e3','#e37e9e'
];
let colorPopoverMode = 'text'; // 'text' or 'back'

function toggleColorPopover(evt, mode) {
  const pop = document.getElementById('color-popover');
  if (pop.classList.contains('show') && colorPopoverMode === mode) {
    pop.classList.remove('show');
    return;
  }
  colorPopoverMode = mode;
  saveSelectionRange();
  const grid = COLOR_SWATCHES.map(c => `<div class="color-swatch" style="background:${c}" onclick="applyColor('${c}')"></div>`).join('');
  pop.innerHTML = `
    <div style="font-size:.65rem;letter-spacing:.08em;text-transform:uppercase;color:rgba(247,244,238,.4);margin-bottom:8px">
      ${mode === 'text' ? 'Text Color' : 'Highlight Color'}
    </div>
    <div class="color-grid">${grid}</div>
    <div class="color-custom-row">
      <input type="color" id="custom-color-input" value="#c9a84c" onchange="applyColor(this.value)">
      <button class="mini-btn" onclick="applyColor('transparent')">Clear</button>
    </div>`;
  const rect = evt.currentTarget.getBoundingClientRect();
  pop.style.left = Math.min(window.innerWidth - 230, rect.right + 8) + 'px';
  pop.style.top = Math.min(window.innerHeight - 160, rect.top) + 'px';
  pop.classList.add('show');
}

function applyColor(color) {
  editor.focus();
  const sel = window.getSelection();
  if (savedRange) { sel.removeAllRanges(); sel.addRange(savedRange); }
  if (sel && sel.isCollapsed) { showToast('Select text first'); return; }
  document.execCommand(colorPopoverMode === 'text' ? 'foreColor' : 'hiliteColor', false, color);
  saveSelectionRange();
  if (typeof updateStats === 'function') updateStats();
  if (typeof triggerSave === 'function') triggerSave();
  document.getElementById('color-popover').classList.remove('show');
}

document.addEventListener('click', e => {
  const pop = document.getElementById('color-popover');
  if (pop && pop.classList.contains('show') && !pop.contains(e.target) && !e.target.closest('[data-tip="Text Color"]') && !e.target.closest('[data-tip="Highlight Color"]')) {
    pop.classList.remove('show');
  }
});

// ── INSERT LINK ───────────────────────────────────────────────
function promptInsertLink() {
  editor.focus();
  const sel = window.getSelection();
  const hasSelection = sel && !sel.isCollapsed && editor.contains(sel.anchorNode);
  const url = prompt('Enter URL:', 'https://');
  if (!url) return;
  if (hasSelection) {
    document.execCommand('createLink', false, url);
  } else {
    const label = prompt('Link text:', url) || url;
    document.execCommand('insertHTML', false, `<a href="${url}" target="_blank" rel="noopener">${label}</a>`);
  }
  if (typeof updateStats === 'function') updateStats();
  if (typeof triggerSave === 'function') triggerSave();
  showToast('✓ Link inserted');
}

// ── TABLE INSERTION (grid picker) ────────────────────────────
function toggleTableGridPopover(evt) {
  const pop = document.getElementById('table-grid-popover');
  if (pop.classList.contains('show')) { pop.classList.remove('show'); return; }
  saveSelectionRange();
  let cells = '';
  for (let i = 0; i < 36; i++) cells += `<div class="tg-cell" data-i="${i}"></div>`;
  pop.innerHTML = `<div class="tg-grid" id="tg-grid">${cells}</div><div class="tg-label" id="tg-label">Insert table</div>`;
  const grid = pop.querySelector('#tg-grid');
  const label = pop.querySelector('#tg-label');
  grid.addEventListener('mousemove', e => {
    const cell = e.target.closest('.tg-cell');
    if (!cell) return;
    const idx = parseInt(cell.dataset.i, 10);
    const row = Math.floor(idx / 6), col = idx % 6;
    grid.querySelectorAll('.tg-cell').forEach((c, i) => {
      const r = Math.floor(i / 6), cc = i % 6;
      c.classList.toggle('hi', r <= row && cc <= col);
    });
    label.textContent = `${row + 1} × ${col + 1} table`;
  });
  grid.addEventListener('click', e => {
    const cell = e.target.closest('.tg-cell');
    if (!cell) return;
    const idx = parseInt(cell.dataset.i, 10);
    const rows = Math.floor(idx / 6) + 1, cols = (idx % 6) + 1;
    insertTable(rows, cols);
    pop.classList.remove('show');
  });
  const rect = evt.currentTarget.getBoundingClientRect();
  pop.style.left = Math.min(window.innerWidth - 190, rect.right + 8) + 'px';
  pop.style.top = Math.min(window.innerHeight - 200, rect.top) + 'px';
  pop.classList.add('show');
}

function insertTable(rows, cols) {
  editor.focus();
  const sel = window.getSelection();
  if (savedRange) { sel.removeAllRanges(); sel.addRange(savedRange); }
  let html = '<table style="border-collapse:collapse;width:100%;margin:14px 0">';
  for (let r = 0; r < rows; r++) {
    html += '<tr>';
    for (let c = 0; c < cols; c++) {
      html += '<td style="border:1px solid rgba(45,74,122,.35);padding:8px 10px;min-width:60px">&nbsp;</td>';
    }
    html += '</tr>';
  }
  html += '</table><p><br></p>';
  document.execCommand('insertHTML', false, html);
  if (typeof updateStats === 'function') updateStats();
  if (typeof triggerSave === 'function') triggerSave();
  showToast(`✓ ${rows}×${cols} table inserted`);
}

document.addEventListener('click', e => {
  const pop = document.getElementById('table-grid-popover');
  if (pop && pop.classList.contains('show') && !pop.contains(e.target) && !e.target.closest('[data-tip="Insert Table"]')) {
    pop.classList.remove('show');
  }
});

// ── CHECKLIST ─────────────────────────────────────────────────
function insertChecklist() {
  editor.focus();
  const html = `<ul class="inkwell-checklist" contenteditable="false">
    <li><input type="checkbox" onclick="toggleChecklistItem(this)"><span contenteditable="true">Checklist item</span></li>
  </ul><p><br></p>`;
  document.execCommand('insertHTML', false, html);
  if (typeof updateStats === 'function') updateStats();
  if (typeof triggerSave === 'function') triggerSave();
  showToast('✓ Checklist inserted — click ☑ again to add rows');
}

function toggleChecklistItem(cb) {
  const li = cb.closest('li');
  if (li) li.classList.toggle('done', cb.checked);
  if (typeof triggerSave === 'function') triggerSave();
}

// Allow Enter key inside a checklist span to add a new checklist row
if (editor) {
  editor.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const li = sel.anchorNode && sel.anchorNode.parentElement && sel.anchorNode.parentElement.closest && sel.anchorNode.parentElement.closest('.inkwell-checklist li');
    if (!li) return;
    e.preventDefault();
    const newLi = document.createElement('li');
    newLi.innerHTML = '<input type="checkbox" onclick="toggleChecklistItem(this)"><span contenteditable="true">New item</span>';
    li.after(newLi);
    const span = newLi.querySelector('span');
    const range = document.createRange();
    range.selectNodeContents(span);
    sel.removeAllRanges();
    sel.addRange(range);
    if (typeof triggerSave === 'function') triggerSave();
  });
}

// ── CODE BLOCK ────────────────────────────────────────────────
function insertCodeBlock() {
  editor.focus();
  const html = `<pre class="inkwell-code" contenteditable="true">// your code here</pre><p><br></p>`;
  document.execCommand('insertHTML', false, html);
  if (typeof updateStats === 'function') updateStats();
  if (typeof triggerSave === 'function') triggerSave();
  showToast('✓ Code block inserted');
}

// ── SPECIAL CHARACTERS ───────────────────────────────────────
const SPECIAL_CHARS = ["—","–","…","§","¶","†","‡","•","·","°","±","×","÷","≈","≠","≤","≥","∞","√","∑","∆","Ω","π","α","β","γ","λ","µ","€","£","¥","©","®","™","℅","№","‰","„","“","”","‘","’","‹","›","«","»","¡","¿","⁂","☙","❦","✦","✧","☾","☀"];

function toggleSpecialCharPopover(evt) {
  const pop = document.getElementById('specialchar-popover');
  if (pop.classList.contains('show')) { pop.classList.remove('show'); return; }
  saveSelectionRange();
  pop.innerHTML = `<div class="sc-grid">${SPECIAL_CHARS.map(c => `<button class="sc-cell" onclick="insertSpecialChar('${c === "'" ? "\\'" : c}')">${c}</button>`).join('')}</div>`;
  const rect = evt.currentTarget.getBoundingClientRect();
  pop.style.left = Math.min(window.innerWidth - 270, rect.right + 8) + 'px';
  pop.style.top = Math.min(window.innerHeight - 280, rect.top) + 'px';
  pop.classList.add('show');
}

function insertSpecialChar(ch) {
  editor.focus();
  const sel = window.getSelection();
  if (savedRange) { sel.removeAllRanges(); sel.addRange(savedRange); }
  document.execCommand('insertText', false, ch);
  saveSelectionRange();
  if (typeof updateStats === 'function') updateStats();
  if (typeof triggerSave === 'function') triggerSave();
}

document.addEventListener('click', e => {
  const pop = document.getElementById('specialchar-popover');
  if (pop && pop.classList.contains('show') && !pop.contains(e.target) && !e.target.closest('[data-tip="Special Character"]')) {
    pop.classList.remove('show');
  }
});

// ── FIND & REPLACE ────────────────────────────────────────────
let frMatches = [];
let frIndex = -1;

function toggleFindReplace() {
  const bar = document.getElementById('find-replace-bar');
  if (bar) {
    bar.classList.toggle('show');
    if (bar.classList.contains('show')) {
      document.getElementById('fr-find').focus();
    } else {
      clearFindHighlights();
    }
  }
}

function clearFindHighlights() {
  editor.querySelectorAll('mark.fr-hit').forEach(m => {
    const parent = m.parentNode;
    if (parent) {
      parent.replaceChild(document.createTextNode(m.textContent), m);
      parent.normalize();
    }
  });
  frMatches = [];
  frIndex = -1;
}

function findNext() {
  const term = document.getElementById('fr-find').value;
  if (!term) return;
  clearFindHighlights();
  const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, null);
  const textNodes = [];
  let node;
  while ((node = walker.nextNode())) textNodes.push(node);
  const lowerTerm = term.toLowerCase();
  textNodes.forEach(tn => {
    const text = tn.textContent;
    const lower = text.toLowerCase();
    if (!lower.includes(lowerTerm)) return;
    const frag = document.createDocumentFragment();
    let start = 0, idx;
    while ((idx = lower.indexOf(lowerTerm, start)) !== -1) {
      frag.appendChild(document.createTextNode(text.slice(start, idx)));
      const mark = document.createElement('mark');
      mark.className = 'fr-hit';
      mark.style.background = 'rgba(201,168,76,.5)';
      mark.textContent = text.slice(idx, idx + term.length);
      frag.appendChild(mark);
      frMatches.push(mark);
      start = idx + term.length;
    }
    frag.appendChild(document.createTextNode(text.slice(start)));
    if (tn.parentNode) tn.parentNode.replaceChild(frag, tn);
  });
  const countEl = document.getElementById('fr-count');
  if (countEl) countEl.textContent = frMatches.length ? `${frMatches.length} found` : 'No matches';
  if (frMatches.length) {
    frIndex = (frIndex + 1) % frMatches.length;
    frMatches[frIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
    frMatches.forEach(m => m.style.outline = '');
    frMatches[frIndex].style.outline = '2px solid var(--gold)';
  }
}

function replaceOne() {
  if (!frMatches.length || frIndex < 0) { findNext(); return; }
  const replacement = document.getElementById('fr-replace').value;
  const mark = frMatches[frIndex];
  if (mark) {
    mark.outerHTML = replacement;
  }
  if (typeof updateStats === 'function') updateStats();
  if (typeof triggerSave === 'function') triggerSave();
  findNext();
}

function replaceAll() {
  const term = document.getElementById('fr-find').value;
  const replacement = document.getElementById('fr-replace').value;
  if (!term) return;
  clearFindHighlights();
  const html = editor.innerHTML;
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(escaped, 'gi');
  const count = (html.match(re) || []).length;
  editor.innerHTML = html.replace(re, replacement);
  const countEl = document.getElementById('fr-count');
  if (countEl) countEl.textContent = `${count} replaced`;
  if (typeof updateStats === 'function') updateStats();
  if (typeof triggerSave === 'function') triggerSave();
  showToast(`✓ Replaced ${count} occurrence(s)`);
}

const frFindEl = document.getElementById('fr-find');
if (frFindEl) frFindEl.addEventListener('keydown', e => { if (e.key === 'Enter') findNext(); });
const frRepEl = document.getElementById('fr-replace');
if (frRepEl) frRepEl.addEventListener('keydown', e => { if (e.key === 'Enter') replaceOne(); });

// ── TEXT EFFECTS ────────────────────────────────────────────
function applyTextEffect(cls) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
    showToast('Select some text first to apply an effect');
    return;
  }
  const range = sel.getRangeAt(0);
  const span = document.createElement('span');
  span.className = cls;
  try {
    range.surroundContents(span);
  } catch(e) {
    const frag = range.extractContents();
    span.appendChild(frag);
    range.insertNode(span);
  }
  sel.removeAllRanges();
  editor.focus();
  if (typeof updateStats === 'function') updateStats();
  if (typeof triggerSave === 'function') triggerSave();
  showToast('✓ Effect applied');
}

function clearTextEffects() {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
    showToast('Select text to clear effects');
    return;
  }
  document.execCommand('removeFormat');
  editor.focus();
  showToast('✓ Effects cleared');
}

// ── CASE CONVERTER ────────────────────────────────────────────
function transformCaseText(text, mode) {
  switch (mode) {
    case 'upper': return text.toUpperCase();
    case 'lower': return text.toLowerCase();
    case 'title': return text.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    case 'sentence': return text.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, c => c.toUpperCase());
    default: return text;
  }
}

function convertCase(mode) {
  editor.focus();
  const sel = window.getSelection();
  const hasSelection = sel && !sel.isCollapsed && editor.contains(sel.anchorNode);
  if (hasSelection) {
    const text = sel.toString();
    document.execCommand('insertText', false, transformCaseText(text, mode));
  } else {
    if (!confirm('No text selected — convert the entire document to ' + mode + ' case?')) return;
    const text = getPlainText();
    editor.innerText = transformCaseText(text, mode);
  }
  if (typeof updateStats === 'function') updateStats();
  if (typeof triggerSave === 'function') triggerSave();
  showToast('✓ Case converted');
}

// ── TABLE OF CONTENTS ─────────────────────────────────────────
function insertTableOfContents() {
  if (typeof rebuildOutline === 'function') rebuildOutline();
  const headings = editor.querySelectorAll('h1, h2, h3');
  if (!headings.length) { showToast('Add some headings first to build a table of contents'); return; }
  let items = '';
  headings.forEach(h => {
    const lvl = h.tagName.toLowerCase() === 'h1' ? 1 : (h.tagName.toLowerCase() === 'h2' ? 2 : 3);
    const text = (h.textContent || '').trim() || '(untitled heading)';
    items += `<li class="toc-lvl-${lvl}"><a href="#${h.id}">${text.replace(/</g,'&lt;')}</a></li>`;
  });
  const block = `<div class="inkwell-toc" contenteditable="false"><div class="toc-title">Table of Contents</div><ul>${items}</ul></div><p><br></p>`;
  editor.focus();
  document.execCommand('selectAll', false, null);
  document.getSelection().collapseToStart();
  document.execCommand('insertHTML', false, block);
  if (typeof updateStats === 'function') updateStats();
  if (typeof triggerSave === 'function') triggerSave();
  showToast('✓ Table of contents inserted at the top');
}

// Let TOC links jump within the document instead of navigating away
if (editor) {
  editor.addEventListener('click', e => {
    const a = e.target.closest('.inkwell-toc a');
    if (!a) return;
    e.preventDefault();
    const id = a.getAttribute('href').slice(1);
    if (typeof jumpToHeading === 'function') jumpToHeading(id);
  });
}

// ── FOOTNOTES ──────────────────────────────────────────────────
let footnoteCounter = editor ? editor.querySelectorAll('.inkwell-fnref').length : 0;
function insertFootnote() {
  const note = prompt('Footnote text:');
  if (!note) return;
  footnoteCounter++;
  const num = footnoteCounter;
  editor.focus();
  document.execCommand('insertHTML', false, `<sup class="inkwell-fnref" contenteditable="false">[${num}]</sup>`);
  let block = editor.querySelector('.inkwell-footnotes');
  if (!block) {
    editor.insertAdjacentHTML('beforeend', `<div class="inkwell-footnotes" contenteditable="false"></div>`);
    block = editor.querySelector('.inkwell-footnotes');
  }
  block.insertAdjacentHTML('beforeend', `<div class="fn-item"><span class="fn-num">[${num}]</span><span contenteditable="true">${note.replace(/</g,'&lt;')}</span></div>`);
  if (typeof updateStats === 'function') updateStats();
  if (typeof triggerSave === 'function') triggerSave();
  showToast('✓ Footnote added');
}

// ── PAGE BREAK ─────────────────────────────────────────────────
function insertPageBreak() {
  editor.focus();
  document.execCommand('insertHTML', false, `<div class="inkwell-pagebreak" contenteditable="false"></div><p><br></p>`);
  if (typeof updateStats === 'function') updateStats();
  if (typeof triggerSave === 'function') triggerSave();
  showToast('✓ Page break inserted');
}
