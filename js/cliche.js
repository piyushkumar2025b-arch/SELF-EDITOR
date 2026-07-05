/* ═══════════════════════════════════════════════════════════════
   js/cliche.js — Cliché & Filler Phrase Detector
   Runs entirely client-side, no API needed.
   ═══════════════════════════════════════════════════════════════ */

const CLICHE_PHRASES = [
  'at the end of the day','in the nick of time','last but not least',
  'it was a dark and stormy night','time will tell','only time will tell',
  'against all odds','avoid like the plague','beat around the bush',
  'better late than never','bite the bullet','burn the midnight oil',
  'calm before the storm','cry over spilled milk','cut to the chase',
  'easier said than done','face the music','few and far between',
  'food for thought','go with the flow','hit the nail on the head',
  'in the blink of an eye','it goes without saying','last straw',
  'light at the end of the tunnel','more than meets the eye',
  'needle in a haystack','once in a blue moon','piece of cake',
  'read between the lines','see eye to eye','sink or swim',
  'the calm before the storm','the elephant in the room',
  'thick as thieves','tip of the iceberg','when push comes to shove',
  'a blessing in disguise','all walks of life','at a crossroads',
  'few and far between','icing on the cake','in this day and age',
  'raining cats and dogs','the whole nine yards','without further ado',
  'heart of gold','cold as ice','white as snow','quiet as a mouse',
  'busy as a bee','strong as an ox','sly as a fox','brave as a lion'
];

const FILLER_PHRASES = [
  'in order to','due to the fact that','at this point in time',
  'for all intents and purposes','it is important to note that',
  'needless to say','as a matter of fact','in spite of the fact that',
  'in the event that','with regard to','in the process of',
  'the fact that','a large number of','a majority of',
  'basically','essentially','actually','literally','really',
  'very','just','simply','somewhat','rather','quite','sort of','kind of'
];

// ── DETECTION ─────────────────────────────────────────────────
function clScanPhrases(text, list) {
  const lower = text.toLowerCase();
  const found = [];
  list.forEach(phrase => {
    const safe = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${safe}\\b`, 'gi');
    const matches = lower.match(regex);
    if (matches) found.push({ phrase, count: matches.length });
  });
  return found.sort((a, b) => b.count - a.count);
}

// ── RENDER ────────────────────────────────────────────────────
function analyzeCliches() {
  const out = document.getElementById('cl-output');
  if (!out) return;

  const text = getPlainText().trim();
  if (!text) {
    out.innerHTML = `<div class="cl-empty">Write something first, then scan.</div>`;
    return;
  }

  const cliches = clScanPhrases(text, CLICHE_PHRASES);
  const fillers = clScanPhrases(text, FILLER_PHRASES);
  const total = cliches.reduce((a, c) => a + c.count, 0) + fillers.reduce((a, c) => a + c.count, 0);

  out.innerHTML = `
    <div class="cl-summary">
      <div class="cl-stat"><span class="cl-stat-n">${cliches.length}</span><span class="cl-stat-l">cliché phrases</span></div>
      <div class="cl-stat"><span class="cl-stat-n">${fillers.length}</span><span class="cl-stat-l">filler phrases</span></div>
      <div class="cl-stat"><span class="cl-stat-n">${total}</span><span class="cl-stat-l">total hits</span></div>
    </div>

    ${cliches.length ? `
    <div class="cl-section-head">⚠ Clichés Found</div>
    <div class="cl-list">
      ${cliches.map(({ phrase, count }) => `
        <div class="cl-item" onclick="clHighlightPhrase('${phrase.replace(/'/g, "\\'")}')" title="Click to highlight in editor">
          <span class="cl-phrase">"${phrase}"</span>
          <span class="cl-count">${count}×</span>
        </div>
      `).join('')}
    </div>` : `<div class="cl-ok">✓ No common clichés detected.</div>`}

    ${fillers.length ? `
    <div class="cl-section-head">Filler &amp; Hedge Words</div>
    <div class="cl-chips">
      ${fillers.slice(0, 14).map(({ phrase, count }) => `<span class="cl-chip" onclick="clHighlightPhrase('${phrase.replace(/'/g, "\\'")}')" title="Click to highlight">${phrase} <em>${count}×</em></span>`).join('')}
    </div>` : ''}

    <div class="cl-hint">Click any phrase to highlight its occurrences in the editor.</div>
  `;
}

function clHighlightPhrase(phrase) {
  if (typeof editor === 'undefined' || !editor) return;
  clearWordHighlights();
  const safe = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`\\b(${safe})\\b`, 'gi');
  editor.innerHTML = editor.innerHTML.replace(regex, `<mark class="wf-highlight">$1</mark>`);
  const marks = editor.querySelectorAll('.wf-highlight');
  if (marks.length) marks[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
  showToast(`Highlighted ${marks.length} instance${marks.length !== 1 ? 's' : ''} of "${phrase}"`);
  const clearBtn = document.getElementById('wf-clear-btn');
  if (clearBtn) clearBtn.style.display = 'inline-block';
}

// ── STYLES ────────────────────────────────────────────────────
(function injectClStyles() {
  if (document.getElementById('cl-styles')) return;
  const s = document.createElement('style');
  s.id = 'cl-styles';
  s.textContent = `
    .cl-empty,.cl-ok { font-size:.82rem; padding:6px 2px; }
    .cl-ok { color:#5a8; }
    .cl-summary { display:flex; gap:10px; margin-bottom:10px; flex-wrap:wrap; }
    .cl-stat { background:var(--bg2,#f4f4f4); border-radius:6px; padding:6px 10px; text-align:center; flex:1; min-width:70px; }
    .cl-stat-n { display:block; font-size:1.15rem; font-weight:700; color:var(--accent,#557); }
    .cl-stat-l { display:block; font-size:.72rem; color:var(--muted,#888); }
    .cl-section-head { font-size:.75rem; font-weight:700; letter-spacing:.05em; text-transform:uppercase; color:var(--muted,#888); margin:10px 0 4px; }
    .cl-list { display:flex; flex-direction:column; gap:4px; }
    .cl-item { display:flex; justify-content:space-between; align-items:center; cursor:pointer; padding:5px 8px; border-radius:6px; background:var(--bg2,#f4f4f4); transition:opacity .15s; }
    .cl-item:hover { opacity:.8; }
    .cl-phrase { font-size:.8rem; font-style:italic; }
    .cl-count { font-size:.75rem; color:var(--muted,#888); }
    .cl-chips { display:flex; flex-wrap:wrap; gap:5px; }
    .cl-chip { font-size:.78rem; padding:3px 8px; border-radius:20px; cursor:pointer; background:#fff6e0; color:#8a6d1c; border:1px solid #edd9a3; transition:opacity .15s; }
    .cl-chip:hover { opacity:.75; }
    .cl-chip em { font-style:normal; opacity:.7; margin-left:3px; }
    .cl-hint { font-size:.72rem; color:var(--muted,#888); margin-top:6px; }
  `;
  document.head.appendChild(s);
})();
