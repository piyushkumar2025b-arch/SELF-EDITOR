/* ═══════════════════════════════════════════════════════════════
   js/readability.js — Deep Readability & Style Analysis
   Flesch-Kincaid, Gunning Fog, SMOG, Dale-Chall indices.
   Passive voice detector, adverb counter, cliché spotter.
   Entirely client-side.
   ═══════════════════════════════════════════════════════════════ */

// ── SYLLABLE COUNTER ──────────────────────────────────────────
function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!word) return 0;
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const m = word.match(/[aeiouy]{1,2}/g);
  return m ? m.length : 1;
}

// ── PASSIVE VOICE PATTERNS ────────────────────────────────────
const TO_BE = /\b(am|is|are|was|were|be|been|being)\b/i;
const PAST_PART = /\b\w+ed\b|\b(broken|known|given|taken|written|spoken|chosen|driven|forgiven|hidden|proven|risen|shown|stolen|thrown|worn|won)\b/i;

function detectPassive(sentence) {
  return TO_BE.test(sentence) && PAST_PART.test(sentence);
}

// ── ADVERB PATTERNS ───────────────────────────────────────────
const ADVERB_RE = /\b\w+ly\b/gi;

// ── CLICHÉ LIST ───────────────────────────────────────────────
const CLICHES = [
  'at the end of the day','back to square one','ball is in your court','barking up the wrong tree',
  'beat around the bush','bite the bullet','bite the hand that feeds','blessing in disguise',
  'bottom line','break a leg','burning the midnight oil','by the skin of your teeth',
  'caught between a rock and a hard place','cost an arm and a leg','cut corners',
  'dead as a doornail','easier said than done','few and far between','get out of hand',
  'hit the nail on the head','it is what it is','leave no stone unturned','let the cat out of the bag',
  'make ends meet','miss the boat','no pain no gain','on thin ice','once in a blue moon',
  'piece of cake','pull someone\'s leg','put all your eggs in one basket','reading between the lines',
  'see eye to eye','shape up or ship out','sit on the fence','speak of the devil','spill the beans',
  'the ball is in your court','the best of both worlds','the tip of the iceberg','time flies',
  'time will tell','under the weather','up in the air','when pigs fly','you can\'t have your cake and eat it',
];

// ── MAIN ANALYSIS ─────────────────────────────────────────────
function runReadabilityAnalysis() {
  const out  = document.getElementById('readability2-output');
  if (!out) return;

  const text = (typeof getPlainText === 'function') ? getPlainText().trim() : '';
  if (!text || text.length < 50) {
    out.innerHTML = `<div style="font-size:.75rem;opacity:.4;text-align:center;padding:14px">Write at least a paragraph to analyze.</div>`;
    return;
  }

  // Tokenize
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const words     = text.match(/\b\w+\b/g) || [];
  const syllables = words.reduce((s, w) => s + countSyllables(w), 0);

  const wCount = words.length;
  const sCount = Math.max(1, sentences.length);
  const sylCount = syllables;

  const avgWps  = wCount / sCount;       // avg words per sentence
  const avgSpw  = sylCount / wCount;     // avg syllables per word

  // Flesch Reading Ease (higher = easier)
  const flesch = 206.835 - 1.015 * avgWps - 84.6 * avgSpw;
  const fleschClamped = Math.max(0, Math.min(100, flesch));

  // Flesch-Kincaid Grade Level
  const fkGrade = 0.39 * avgWps + 11.8 * avgSpw - 15.59;

  // Gunning Fog Index
  const complexWords = words.filter(w => countSyllables(w) >= 3).length;
  const fog = 0.4 * (avgWps + 100 * (complexWords / wCount));

  // SMOG (needs ≥30 sentences for accuracy)
  const smog = 3 + Math.sqrt(complexWords * (30 / sCount));

  // Passive voice sentences
  const passiveSents = sentences.filter(detectPassive);

  // Adverbs
  const adverbs = (text.match(ADVERB_RE) || []).map(w => w.toLowerCase());
  const adverbFreq = {};
  adverbs.forEach(w => adverbFreq[w] = (adverbFreq[w] || 0) + 1);
  const topAdverbs = Object.entries(adverbFreq).sort((a,b) => b[1]-a[1]).slice(0,8);

  // Clichés
  const foundCliches = CLICHES.filter(c => text.toLowerCase().includes(c));

  // Grade label
  const gradeLabel = (g) => {
    g = Math.max(1, Math.round(g));
    if (g <= 5)  return `Grade ${g} (Elementary)`;
    if (g <= 8)  return `Grade ${g} (Middle school)`;
    if (g <= 12) return `Grade ${g} (High school)`;
    if (g <= 16) return `Grade ${g} (College)`;
    return `Grade ${g}+ (Graduate)`;
  };

  // Ease label
  const easeLabel = (f) => {
    if (f >= 90) return { label: 'Very Easy', color: '#90ffcc' };
    if (f >= 70) return { label: 'Easy',      color: '#90b4ff' };
    if (f >= 50) return { label: 'Standard',  color: '#c9a84c' };
    if (f >= 30) return { label: 'Difficult', color: '#ffd090' };
    return              { label: 'Very Hard', color: '#ffaaaa' };
  };

  const ease = easeLabel(fleschClamped);

  const meter = (val, max, color) => {
    const pct = Math.min(100, Math.round((val / max) * 100));
    return `<div style="background:rgba(255,255,255,.08);border-radius:3px;height:5px;margin:3px 0 8px">
      <div style="width:${pct}%;height:100%;background:${color};border-radius:3px"></div></div>`;
  };

  out.innerHTML = `
    <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">
      <div style="flex:1;min-width:80px;background:rgba(255,255,255,.05);border-radius:6px;padding:9px;text-align:center">
        <div style="font-size:1.3rem;font-weight:700;color:${ease.color}">${Math.round(fleschClamped)}</div>
        <div style="font-size:.6rem;opacity:.5">Flesch ease</div>
        <div style="font-size:.65rem;color:${ease.color}">${ease.label}</div>
      </div>
      <div style="flex:1;min-width:80px;background:rgba(255,255,255,.05);border-radius:6px;padding:9px;text-align:center">
        <div style="font-size:1.3rem;font-weight:700;color:#c9a84c">${Math.round(fkGrade * 10) / 10}</div>
        <div style="font-size:.6rem;opacity:.5">F-K grade</div>
        <div style="font-size:.65rem;opacity:.7">${gradeLabel(fkGrade)}</div>
      </div>
      <div style="flex:1;min-width:80px;background:rgba(255,255,255,.05);border-radius:6px;padding:9px;text-align:center">
        <div style="font-size:1.3rem;font-weight:700;color:#90b4ff">${Math.round(fog * 10) / 10}</div>
        <div style="font-size:.6rem;opacity:.5">Gunning Fog</div>
        <div style="font-size:.65rem;opacity:.7">${gradeLabel(fog)}</div>
      </div>
    </div>

    <div style="font-size:.7rem;text-transform:uppercase;letter-spacing:.07em;opacity:.4;margin-bottom:4px">Avg sentence length</div>
    <div style="font-size:.82rem;display:flex;justify-content:space-between">
      <span>${Math.round(avgWps * 10) / 10} words/sentence</span>
      <span style="opacity:.5">${avgWps > 25 ? '⚠ quite long' : avgWps < 10 ? '↯ choppy' : '✓ good'}</span>
    </div>
    ${meter(avgWps, 40, '#c9a84c')}

    <div style="font-size:.7rem;text-transform:uppercase;letter-spacing:.07em;opacity:.4;margin-bottom:4px">Passive voice</div>
    <div style="font-size:.82rem;display:flex;justify-content:space-between">
      <span>${passiveSents.length} of ${sCount} sentences (${Math.round(passiveSents.length/sCount*100)}%)</span>
      <span style="opacity:.5">${passiveSents.length/sCount > 0.2 ? '⚠ high' : '✓ ok'}</span>
    </div>
    ${meter(passiveSents.length, sCount, '#ffaaaa')}

    ${topAdverbs.length ? `
    <div style="font-size:.7rem;text-transform:uppercase;letter-spacing:.07em;opacity:.4;margin-bottom:4px">Top adverbs (${adverbs.length} total)</div>
    <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px">
      ${topAdverbs.map(([w,n]) => `<span style="background:rgba(255,208,144,.15);border:1px solid rgba(255,208,144,.3);border-radius:3px;padding:2px 6px;font-size:.72rem">${w} ×${n}</span>`).join('')}
    </div>` : ''}

    ${foundCliches.length ? `
    <div style="font-size:.7rem;text-transform:uppercase;letter-spacing:.07em;opacity:.4;margin-bottom:4px">Clichés found (${foundCliches.length})</div>
    <div style="display:flex;flex-direction:column;gap:3px;margin-bottom:10px">
      ${foundCliches.map(c => `<span style="background:rgba(255,170,170,.12);border-radius:3px;padding:3px 7px;font-size:.74rem;font-style:italic">"${c}"</span>`).join('')}
    </div>` : `<div style="font-size:.74rem;color:#90ffcc;margin-bottom:8px">✓ No clichés detected</div>`}

    <div style="font-size:.68rem;opacity:.3;margin-top:4px">Based on ${wCount.toLocaleString()} words · ${sCount} sentences · ${sylCount.toLocaleString()} syllables</div>`;
}
