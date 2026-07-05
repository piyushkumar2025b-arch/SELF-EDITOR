/* ═══════════════════════════════════════════════════════════════
   js/wordfreq.js — Word Frequency Analyzer & Overuse Highlighter
   Runs entirely client-side, no API needed.
   ═══════════════════════════════════════════════════════════════ */

// Common stop-words to exclude from meaningful analysis
const STOP_WORDS = new Set([
  'a','an','the','and','or','but','in','on','at','to','for','of','with',
  'by','from','up','about','into','through','during','before','after',
  'is','are','was','were','be','been','being','have','has','had','do',
  'does','did','will','would','could','should','may','might','shall',
  'can','i','you','he','she','it','we','they','me','him','her','us','them',
  'my','your','his','its','our','their','this','that','these','those',
  'what','which','who','whom','when','where','why','how','all','each',
  'both','few','more','most','other','some','such','no','not','only',
  'own','same','so','than','too','very','just','as','if','then','there',
  'also','here','now','even','back','any','well','still','way','get',
  'got','make','made','take','said','says','say'
]);

// ── ANALYSIS ──────────────────────────────────────────────────
function analyzeWordFrequency() {
  const out = document.getElementById('wordfreq-output');
  if (!out) return;

  const text = getPlainText().trim();
  if (!text) {
    out.innerHTML = `<div class="wf-empty">Write something first, then analyze.</div>`;
    return;
  }

  const raw   = text.toLowerCase().match(/\b[a-z']{3,}\b/g) || [];
  const total = raw.length;
  const freq  = {};
  raw.forEach(w => { freq[w] = (freq[w] || 0) + 1; });

  // Split into content words vs all words
  const content = {};
  Object.entries(freq).forEach(([w, c]) => {
    if (!STOP_WORDS.has(w)) content[w] = c;
  });

  const sorted = Object.entries(content).sort((a, b) => b[1] - a[1]);
  const topN   = sorted.slice(0, 20);
  const maxCnt = topN[0]?.[1] || 1;

  // Overuse threshold: appears > 1% of content words and > 3 times
  const contentTotal = Object.values(content).reduce((a, b) => a + b, 0);
  const overused = sorted.filter(([, c]) => c > 3 && c / contentTotal > 0.012);

  const uniqueWords = Object.keys(freq).length;
  const vocabulary  = Object.keys(content).length;
  const ttr = vocabulary > 0 ? ((vocabulary / contentTotal) * 100).toFixed(1) : 0; // type-token ratio

  out.innerHTML = `
    <div class="wf-summary">
      <div class="wf-stat"><span class="wf-stat-n">${total}</span><span class="wf-stat-l">total words</span></div>
      <div class="wf-stat"><span class="wf-stat-n">${uniqueWords}</span><span class="wf-stat-l">unique words</span></div>
      <div class="wf-stat"><span class="wf-stat-n">${ttr}%</span><span class="wf-stat-l">vocab richness</span></div>
    </div>

    ${overused.length ? `
    <div class="wf-section-head">⚠ Overused Words</div>
    <div class="wf-overused">
      ${overused.slice(0, 8).map(([w, c]) => `
        <span class="wf-chip wf-chip-warn" onclick="highlightWordInEditor('${w}')" title="Click to highlight in editor">
          ${w} <em>${c}×</em>
        </span>
      `).join('')}
    </div>` : `<div class="wf-ok">✓ No obviously overused content words.</div>`}

    <div class="wf-section-head">Top Content Words</div>
    <div class="wf-bars">
      ${topN.map(([w, c]) => `
        <div class="wf-row" onclick="highlightWordInEditor('${w}')" title="Click to highlight in editor">
          <span class="wf-word">${w}</span>
          <div class="wf-bar-wrap">
            <div class="wf-bar" style="width:${Math.round((c / maxCnt) * 100)}%"></div>
          </div>
          <span class="wf-count">${c}</span>
        </div>
      `).join('')}
    </div>
    <div class="wf-hint">Click any word to highlight it in the editor.</div>
  `;
}

// ── HIGHLIGHT WORD IN EDITOR ──────────────────────────────────
let wfHighlightWord = null;

function highlightWordInEditor(word) {
  if (typeof editor === 'undefined') return;

  // Clear previous highlights
  clearWordHighlights();

  wfHighlightWord = word;
  const text = editor.innerHTML;
  const safe = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`\\b(${safe})\\b`, 'gi');
  editor.innerHTML = editor.innerHTML.replace(regex,
    `<mark class="wf-highlight">$1</mark>`
  );

  // Count and scroll to first
  const marks = editor.querySelectorAll('.wf-highlight');
  if (marks.length) marks[0].scrollIntoView({ behavior: 'smooth', block: 'center' });

  showToast(`Highlighted ${marks.length} instance${marks.length !== 1 ? 's' : ''} of "${word}"`);

  const clearBtn = document.getElementById('wf-clear-btn');
  if (clearBtn) clearBtn.style.display = 'inline-block';
}

function clearWordHighlights() {
  if (typeof editor === 'undefined') return;
  const marks = editor.querySelectorAll('.wf-highlight');
  marks.forEach(m => {
    const parent = m.parentNode;
    parent.replaceChild(document.createTextNode(m.textContent), m);
    parent.normalize();
  });
  wfHighlightWord = null;
  const clearBtn = document.getElementById('wf-clear-btn');
  if (clearBtn) clearBtn.style.display = 'none';
}

// ── SENTENCE LENGTH ANALYSIS ──────────────────────────────────
function analyzeSentenceLengths() {
  const out = document.getElementById('wordfreq-output');
  if (!out) return;

  const text = getPlainText().trim();
  if (!text) { showToast('Write something first'); return; }

  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  if (!sentences.length) { showToast('No complete sentences found'); return; }

  const lengths = sentences.map(s => s.trim().split(/\s+/).filter(w => w).length);
  const avg     = (lengths.reduce((a, b) => a + b, 0) / lengths.length).toFixed(1);
  const max     = Math.max(...lengths);
  const min     = Math.min(...lengths);

  const short  = lengths.filter(l => l <= 8).length;
  const medium = lengths.filter(l => l > 8 && l <= 20).length;
  const long   = lengths.filter(l => l > 20).length;

  const barMax = Math.max(short, medium, long) || 1;

  out.innerHTML = `
    <div class="wf-summary">
      <div class="wf-stat"><span class="wf-stat-n">${avg}</span><span class="wf-stat-l">avg words/sentence</span></div>
      <div class="wf-stat"><span class="wf-stat-n">${min}–${max}</span><span class="wf-stat-l">range</span></div>
      <div class="wf-stat"><span class="wf-stat-n">${sentences.length}</span><span class="wf-stat-l">sentences</span></div>
    </div>
    <div class="wf-section-head">Sentence Length Mix</div>
    <div class="wf-bars">
      <div class="wf-row">
        <span class="wf-word">Short ≤8</span>
        <div class="wf-bar-wrap"><div class="wf-bar wf-bar-short" style="width:${Math.round(short/barMax*100)}%"></div></div>
        <span class="wf-count">${short}</span>
      </div>
      <div class="wf-row">
        <span class="wf-word">Medium 9–20</span>
        <div class="wf-bar-wrap"><div class="wf-bar wf-bar-med" style="width:${Math.round(medium/barMax*100)}%"></div></div>
        <span class="wf-count">${medium}</span>
      </div>
      <div class="wf-row">
        <span class="wf-word">Long >20</span>
        <div class="wf-bar-wrap"><div class="wf-bar wf-bar-long" style="width:${Math.round(long/barMax*100)}%"></div></div>
        <span class="wf-count">${long}</span>
      </div>
    </div>
    ${long > sentences.length * 0.3
      ? `<div class="wf-warn">⚠ Over 30% of sentences are long. Consider varying your rhythm.</div>`
      : `<div class="wf-ok">✓ Good sentence variety.</div>`
    }
  `;
}

// ── TAB SWITCHER ──────────────────────────────────────────────
function wfSetTab(tab) {
  document.querySelectorAll('.wf-tab').forEach(t => t.classList.remove('active'));
  const btn = document.getElementById('wf-tab-' + tab);
  if (btn) btn.classList.add('active');

  if (tab === 'freq')      analyzeWordFrequency();
  if (tab === 'sentences') analyzeSentenceLengths();
}

// ── AUTO STYLES (injected) ────────────────────────────────────
(function injectWfStyles() {
  if (document.getElementById('wf-styles')) return;
  const s = document.createElement('style');
  s.id = 'wf-styles';
  s.textContent = `
    .wf-empty,.wf-ok,.wf-warn { font-size:.82rem; padding:6px 2px; }
    .wf-warn { color:#c47; }
    .wf-ok   { color:#5a8; }
    .wf-summary { display:flex; gap:10px; margin-bottom:10px; flex-wrap:wrap; }
    .wf-stat { background:var(--bg2,#f4f4f4); border-radius:6px; padding:6px 10px; text-align:center; flex:1; min-width:70px; }
    .wf-stat-n { display:block; font-size:1.15rem; font-weight:700; color:var(--accent,#557); }
    .wf-stat-l { display:block; font-size:.72rem; color:var(--muted,#888); }
    .wf-section-head { font-size:.75rem; font-weight:700; letter-spacing:.05em; text-transform:uppercase; color:var(--muted,#888); margin:10px 0 4px; }
    .wf-overused { display:flex; flex-wrap:wrap; gap:5px; margin-bottom:8px; }
    .wf-chip { font-size:.8rem; padding:3px 8px; border-radius:20px; cursor:pointer; transition:opacity .15s; }
    .wf-chip:hover { opacity:.75; }
    .wf-chip-warn { background:#fdecea; color:#b03030; border:1px solid #f3b3b3; }
    .wf-chip em { font-style:normal; opacity:.7; margin-left:3px; }
    .wf-bars { display:flex; flex-direction:column; gap:4px; }
    .wf-row { display:flex; align-items:center; gap:6px; cursor:pointer; padding:2px 0; }
    .wf-row:hover .wf-word { text-decoration:underline; }
    .wf-word { font-size:.8rem; min-width:90px; flex-shrink:0; }
    .wf-bar-wrap { flex:1; background:var(--bg2,#eee); border-radius:3px; height:8px; overflow:hidden; }
    .wf-bar { height:100%; background:var(--accent,#557aaa); border-radius:3px; transition:width .3s; }
    .wf-bar-short { background:#5a8; }
    .wf-bar-med   { background:#557aaa; }
    .wf-bar-long  { background:#c47; }
    .wf-count { font-size:.78rem; min-width:26px; text-align:right; color:var(--muted,#888); }
    .wf-hint  { font-size:.72rem; color:var(--muted,#888); margin-top:6px; }
    .wf-highlight { background:#ffe082; border-radius:2px; }
    .wf-tabs  { display:flex; gap:4px; margin-bottom:8px; }
    .wf-tab   { flex:1; padding:4px; font-size:.78rem; border:1px solid var(--border,#ddd); border-radius:4px; cursor:pointer; background:transparent; }
    .wf-tab.active { background:var(--accent,#557aaa); color:#fff; border-color:var(--accent,#557aaa); }
  `;
  document.head.appendChild(s);
})();
