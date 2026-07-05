/* ═══════════════════════════════════════════════════════════════
   js/dialogue.js — Dialogue & Punctuation Checker
   Flags common dialogue-formatting mistakes. Client-side only.
   ═══════════════════════════════════════════════════════════════ */

// ── DETECTION ─────────────────────────────────────────────────
function dlgCheckQuoteBalance(text) {
  const straightDouble = (text.match(/"/g) || []).length;
  const curlyOpen  = (text.match(/[\u201C]/g) || []).length;
  const curlyClose = (text.match(/[\u201D]/g) || []).length;
  const issues = [];
  if (straightDouble % 2 !== 0) {
    issues.push({ type: 'unbalanced', msg: `Odd number of straight double-quotes (${straightDouble}) — one may be unclosed.` });
  }
  if (curlyOpen !== curlyClose) {
    issues.push({ type: 'unbalanced', msg: `Mismatched curly quotes: ${curlyOpen} opening “ vs ${curlyClose} closing ”.` });
  }
  return issues;
}

function dlgCheckPunctuationBeforeQuote(text) {
  // Dialogue should usually end with , . ! or ? *before* the closing quote, not after.
  const pattern = /["\u201D]\s*[a-z]/g; // closing quote followed by lowercase (likely missing tag punctuation)
  const matches = [];
  let m;
  const re = /([,.!?])?["\u201D](\s+)([a-z])/g;
  while ((m = re.exec(text)) !== null) {
    if (!m[1]) {
      const context = text.slice(Math.max(0, m.index - 25), m.index + 15).trim();
      matches.push(context);
    }
  }
  return matches.slice(0, 8);
}

function dlgCheckSaidBookisms(text) {
  const BOOKISMS = [
    'exclaimed','ejaculated','opined','expostulated','interjected',
    'articulated','elucidated','proclaimed loudly','vociferated'
  ];
  const found = [];
  BOOKISMS.forEach(w => {
    const regex = new RegExp(`\\b${w}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) found.push({ word: w, count: matches.length });
  });
  return found.sort((a, b) => b.count - a.count);
}

function dlgCheckAdverbTags(text) {
  // "he said angrily" style tags — common overused pattern after dialogue
  const regex = /\b(said|asked|replied|whispered|shouted|muttered)\s+\w+ly\b/gi;
  const matches = text.match(regex) || [];
  return matches.slice(0, 8);
}

function dlgCheckSpacingBeforePunct(text) {
  const regex = /\s+([,.!?;:])/g;
  const matches = [];
  let m;
  while ((m = regex.exec(text)) !== null) {
    matches.push(text.slice(Math.max(0, m.index - 15), m.index + 5).trim());
  }
  return matches.slice(0, 8);
}

// ── RENDER ────────────────────────────────────────────────────
function analyzeDialogue() {
  const out = document.getElementById('dlg-output');
  if (!out) return;

  const text = getPlainText().trim();
  if (!text) {
    out.innerHTML = `<div class="dlg-empty">Write some dialogue first, then check it.</div>`;
    return;
  }

  const balance   = dlgCheckQuoteBalance(text);
  const missingP  = dlgCheckPunctuationBeforeQuote(text);
  const bookisms  = dlgCheckSaidBookisms(text);
  const advTags   = dlgCheckAdverbTags(text);
  const spacing   = dlgCheckSpacingBeforePunct(text);

  const totalIssues = balance.length + missingP.length + bookisms.length + advTags.length + spacing.length;

  out.innerHTML = `
    <div class="dlg-summary">
      <div class="dlg-stat"><span class="dlg-stat-n">${totalIssues}</span><span class="dlg-stat-l">flagged issues</span></div>
    </div>

    ${balance.length ? `
    <div class="dlg-section-head">⚠ Quote Balance</div>
    <div class="dlg-list">${balance.map(i => `<div class="dlg-item dlg-item-warn">${i.msg}</div>`).join('')}</div>` : ''}

    ${missingP.length ? `
    <div class="dlg-section-head">Missing Punctuation Before Quote</div>
    <div class="dlg-list">${missingP.map(c => `<div class="dlg-item">…${c}…</div>`).join('')}</div>` : ''}

    ${spacing.length ? `
    <div class="dlg-section-head">Stray Space Before Punctuation</div>
    <div class="dlg-list">${spacing.map(c => `<div class="dlg-item">…${c}…</div>`).join('')}</div>` : ''}

    ${bookisms.length ? `
    <div class="dlg-section-head">"Said" Bookisms</div>
    <div class="dlg-chips">${bookisms.map(({ word, count }) => `<span class="dlg-chip" onclick="highlightWordInEditor('${word}')">${word} <em>${count}×</em></span>`).join('')}</div>` : ''}

    ${advTags.length ? `
    <div class="dlg-section-head">Adverb-Heavy Dialogue Tags</div>
    <div class="dlg-list">${advTags.map(t => `<div class="dlg-item">${t}</div>`).join('')}</div>` : ''}

    ${totalIssues === 0 ? `<div class="dlg-ok">✓ No common dialogue issues found.</div>` : `<div class="dlg-hint">These are heuristics, not hard rules — use your judgment.</div>`}
  `;
}

// ── STYLES ────────────────────────────────────────────────────
(function injectDlgStyles() {
  if (document.getElementById('dlg-styles')) return;
  const s = document.createElement('style');
  s.id = 'dlg-styles';
  s.textContent = `
    .dlg-empty,.dlg-ok { font-size:.82rem; padding:6px 2px; }
    .dlg-ok { color:#5a8; }
    .dlg-summary { display:flex; gap:10px; margin-bottom:10px; }
    .dlg-stat { background:var(--bg2,#f4f4f4); border-radius:6px; padding:6px 10px; text-align:center; flex:1; }
    .dlg-stat-n { display:block; font-size:1.15rem; font-weight:700; color:var(--accent,#557); }
    .dlg-stat-l { display:block; font-size:.72rem; color:var(--muted,#888); }
    .dlg-section-head { font-size:.75rem; font-weight:700; letter-spacing:.05em; text-transform:uppercase; color:var(--muted,#888); margin:10px 0 4px; }
    .dlg-list { display:flex; flex-direction:column; gap:4px; }
    .dlg-item { font-size:.78rem; padding:5px 8px; border-radius:6px; background:var(--bg2,#f4f4f4); }
    .dlg-item-warn { background:#fdecea; color:#b03030; }
    .dlg-chips { display:flex; flex-wrap:wrap; gap:5px; }
    .dlg-chip { font-size:.78rem; padding:3px 8px; border-radius:20px; cursor:pointer; background:#fdecea; color:#b03030; border:1px solid #f3b3b3; }
    .dlg-chip em { font-style:normal; opacity:.7; margin-left:3px; }
    .dlg-hint { font-size:.72rem; color:var(--muted,#888); margin-top:6px; }
  `;
  document.head.appendChild(s);
})();
