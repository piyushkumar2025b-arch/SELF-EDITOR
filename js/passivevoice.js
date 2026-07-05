/* ═══════════════════════════════════════════════════════════════
   js/passivevoice.js — Passive Voice & Weak Verb Detector
   Runs entirely client-side, no API needed.
   ═══════════════════════════════════════════════════════════════ */

const PV_BE_FORMS = ['am','is','are','was','were','be','been','being'];

// Common irregular past participles (so we don't only rely on -ed)
const PV_IRREGULAR_PP = new Set([
  'done','made','seen','known','given','taken','written','held','said',
  'told','found','built','brought','bought','caught','chosen','driven',
  'eaten','fallen','felt','forgotten','frozen','gone','grown','heard',
  'hidden','hit','kept','left','lost','met','paid','put','read','ridden',
  'run','sent','set','shown','shot','shut','sold','sent','spoken','spent',
  'stolen','struck','swept','swum','taught','thrown','understood','woken',
  'won','worn'
]);

const PV_WEAK_VERBS = new Set([
  'is','are','was','were','be','been','being','has','have','had',
  'do','does','did','get','gets','got','getting','make','makes','made',
  'go','goes','went','put','puts','seem','seems','seemed','look','looks','looked'
]);

// ── DETECTION ─────────────────────────────────────────────────
function pvFindPassiveSentences(text) {
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
  const hits = [];

  sentences.forEach((raw, idx) => {
    const s = raw.trim();
    if (!s) return;
    const words = s.toLowerCase().match(/[a-z']+/g) || [];
    for (let i = 0; i < words.length; i++) {
      if (PV_BE_FORMS.includes(words[i])) {
        // allow one adverb in between, e.g. "was quickly written"
        let j = i + 1;
        if (j < words.length && words[j].endsWith('ly')) j++;
        const next = words[j];
        if (next && (next.endsWith('ed') || PV_IRREGULAR_PP.has(next))) {
          hits.push({ index: idx, sentence: s, trigger: `${words[i]} ${next}` });
          break;
        }
      }
    }
  });
  return hits;
}

function pvFindWeakVerbs(text) {
  const words = text.toLowerCase().match(/\b[a-z']+\b/g) || [];
  const freq = {};
  words.forEach(w => {
    if (PV_WEAK_VERBS.has(w)) freq[w] = (freq[w] || 0) + 1;
  });
  return Object.entries(freq).sort((a, b) => b[1] - a[1]);
}

function pvFindAdverbOveruse(text) {
  const words = text.toLowerCase().match(/\b[a-z']+ly\b/g) || [];
  const EXCLUDE = new Set(['only','really','family','early','likely','friendly','lovely','ugly','holy','silly','ally','rely','supply','apply','reply','imply','multiply']);
  const freq = {};
  words.forEach(w => {
    if (!EXCLUDE.has(w)) freq[w] = (freq[w] || 0) + 1;
  });
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 12);
}

// ── RENDER ────────────────────────────────────────────────────
function analyzePassiveVoice() {
  const out = document.getElementById('pv-output');
  if (!out) return;

  const text = getPlainText().trim();
  if (!text) {
    out.innerHTML = `<div class="pv-empty">Write something first, then scan.</div>`;
    return;
  }

  const passives = pvFindPassiveSentences(text);
  const weak     = pvFindWeakVerbs(text);
  const adverbs  = pvFindAdverbOveruse(text);
  const totalSentences = (text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || []).length || 1;
  const pct = ((passives.length / totalSentences) * 100).toFixed(0);

  out.innerHTML = `
    <div class="pv-summary">
      <div class="pv-stat"><span class="pv-stat-n">${passives.length}</span><span class="pv-stat-l">passive sentences</span></div>
      <div class="pv-stat"><span class="pv-stat-n">${pct}%</span><span class="pv-stat-l">of document</span></div>
      <div class="pv-stat"><span class="pv-stat-n">${adverbs.reduce((a,[,c])=>a+c,0)}</span><span class="pv-stat-l">-ly adverbs</span></div>
    </div>

    ${passives.length ? `
    <div class="pv-section-head">⚠ Passive Constructions</div>
    <div class="pv-list">
      ${passives.slice(0, 10).map(h => `
        <div class="pv-item" onclick="pvHighlightSentence(${h.index})" title="Click to locate in editor">
          <span class="pv-trigger">${h.trigger}</span>
          <span class="pv-snippet">${h.sentence.length > 90 ? h.sentence.slice(0, 90) + '…' : h.sentence}</span>
        </div>
      `).join('')}
      ${passives.length > 10 ? `<div class="pv-hint">+ ${passives.length - 10} more not shown.</div>` : ''}
    </div>` : `<div class="pv-ok">✓ Little to no passive voice detected.</div>`}

    ${weak.length ? `
    <div class="pv-section-head">Weak / Vague Verbs</div>
    <div class="pv-chips">
      ${weak.slice(0, 10).map(([w, c]) => `<span class="pv-chip" onclick="highlightWordInEditor('${w}')" title="Click to highlight">${w} <em>${c}×</em></span>`).join('')}
    </div>` : ''}

    ${adverbs.length ? `
    <div class="pv-section-head">Frequent Adverbs</div>
    <div class="pv-chips">
      ${adverbs.map(([w, c]) => `<span class="pv-chip pv-chip-adv" onclick="highlightWordInEditor('${w}')" title="Click to highlight">${w} <em>${c}×</em></span>`).join('')}
    </div>` : ''}

    <div class="pv-hint">Tip: not all passive voice is bad — use it deliberately, not by default.</div>
  `;
}

// ── LOCATE SENTENCE IN EDITOR ─────────────────────────────────
function pvHighlightSentence(sentenceIdx) {
  if (typeof editor === 'undefined' || !editor) return;
  const text = getPlainText();
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
  const target = (sentences[sentenceIdx] || '').trim();
  if (!target) return;

  const words = target.split(/\s+/).slice(0, 6).join(' ');
  if (typeof highlightWordInEditor === 'function' && words) {
    // Reuse word-highlight infra with the first few words as a loose anchor
    clearWordHighlights();
    const safe = words.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').split(/\s+/).join('\\s+');
    try {
      const regex = new RegExp(safe, 'i');
      const html = editor.innerHTML;
      const match = editor.innerText.match(regex);
      if (match) {
        editor.innerHTML = html.replace(new RegExp(safe), `<mark class="wf-highlight">$&</mark>`);
        const marks = editor.querySelectorAll('.wf-highlight');
        if (marks.length) marks[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch (e) { /* ignore malformed regex from odd punctuation */ }
  }
  showToast('Located sentence in editor');
}

// ── STYLES ────────────────────────────────────────────────────
(function injectPvStyles() {
  if (document.getElementById('pv-styles')) return;
  const s = document.createElement('style');
  s.id = 'pv-styles';
  s.textContent = `
    .pv-empty,.pv-ok { font-size:.82rem; padding:6px 2px; }
    .pv-ok { color:#5a8; }
    .pv-summary { display:flex; gap:10px; margin-bottom:10px; flex-wrap:wrap; }
    .pv-stat { background:var(--bg2,#f4f4f4); border-radius:6px; padding:6px 10px; text-align:center; flex:1; min-width:70px; }
    .pv-stat-n { display:block; font-size:1.15rem; font-weight:700; color:var(--accent,#557); }
    .pv-stat-l { display:block; font-size:.72rem; color:var(--muted,#888); }
    .pv-section-head { font-size:.75rem; font-weight:700; letter-spacing:.05em; text-transform:uppercase; color:var(--muted,#888); margin:10px 0 4px; }
    .pv-list { display:flex; flex-direction:column; gap:6px; }
    .pv-item { cursor:pointer; padding:6px 8px; border-radius:6px; background:var(--bg2,#f4f4f4); transition:opacity .15s; }
    .pv-item:hover { opacity:.8; }
    .pv-trigger { display:block; font-size:.72rem; font-weight:700; color:#b03030; text-transform:uppercase; letter-spacing:.03em; }
    .pv-snippet { display:block; font-size:.8rem; margin-top:2px; }
    .pv-chips { display:flex; flex-wrap:wrap; gap:5px; }
    .pv-chip { font-size:.8rem; padding:3px 8px; border-radius:20px; cursor:pointer; background:#fdecea; color:#b03030; border:1px solid #f3b3b3; transition:opacity .15s; }
    .pv-chip:hover { opacity:.75; }
    .pv-chip-adv { background:#eef3fb; color:#345d8a; border-color:#c3d7ef; }
    .pv-chip em { font-style:normal; opacity:.7; margin-left:3px; }
    .pv-hint { font-size:.72rem; color:var(--muted,#888); margin-top:6px; }
  `;
  document.head.appendChild(s);
})();
