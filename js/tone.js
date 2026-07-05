/* ═══════════════════════════════════════════════════════════════
   js/tone.js — Prose Style & Tone Analyzer
   Flags passive voice, adverb overuse, filter words, and clichés.
   Purely client-side heuristics — no external API required.
   ═══════════════════════════════════════════════════════════════ */

const TONE_FILTER_WORDS = [
  'suddenly', 'very', 'really', 'just', 'literally', 'somehow', 'basically',
  'actually', 'definitely', 'totally', 'seemed', 'felt', 'noticed', 'realized',
  'started to', 'began to', 'wondered',
];

const TONE_CLICHES = [
  'in the nick of time', 'at the end of the day', 'time will tell',
  'only time will tell', 'against all odds', 'without further ado',
  'it was a dark and stormy night', 'little did she know', 'little did he know',
  'all of a sudden', 'as luck would have it', 'in a nutshell',
  'thick as thieves', 'cold as ice', 'quiet as a mouse', 'sly as a fox',
  'the calm before the storm', 'each and every', 'last but not least',
];

const TONE_PASSIVE_RE = /\b(am|is|are|was|were|be|been|being)\b\s+\w+ed\b/gi;
const TONE_ADVERB_RE  = /\b\w+ly\b/gi;

function analyzeTone() {
  const text = getPlainText();
  const out = document.getElementById('tone-output');
  if (!out) return;

  if (!text.trim()) {
    out.innerHTML = '<div style="opacity:.4;font-size:.78rem;text-align:center;padding:10px">Write something first, then click Analyze.</div>';
    return;
  }

  const words = (text.match(/\b\w+\b/g) || []);
  const wordCount = words.length || 1;

  // Passive voice
  const passiveMatches = text.match(TONE_PASSIVE_RE) || [];

  // Adverbs
  const adverbMatches = (text.match(TONE_ADVERB_RE) || []).filter(w => !['family', 'only', 'early', 'supply', 'reply'].includes(w.toLowerCase()));

  // Filter words
  const filterCounts = {};
  TONE_FILTER_WORDS.forEach(fw => {
    const re = new RegExp(`\\b${fw.replace(/\s+/g, '\\s+')}\\b`, 'gi');
    const m = text.match(re);
    if (m && m.length) filterCounts[fw] = m.length;
  });

  // Clichés
  const clichesFound = TONE_CLICHES.filter(c => text.toLowerCase().includes(c));

  const passiveRate = ((passiveMatches.length / (text.split(/[.!?]+/).length || 1)) * 100).toFixed(0);
  const adverbRate  = ((adverbMatches.length / wordCount) * 1000).toFixed(1); // per 1000 words

  const scoreLabel = (val, thresholds) => {
    if (val <= thresholds[0]) return { label: 'Great', color: '#4c9a5c' };
    if (val <= thresholds[1]) return { label: 'OK', color: '#c9a84c' };
    return { label: 'Heavy', color: '#a84c4c' };
  };

  const passiveScore = scoreLabel(Number(passiveRate), [10, 25]);
  const adverbScore  = scoreLabel(Number(adverbRate), [10, 20]);

  out.innerHTML = `
    <div style="display:flex;gap:8px;margin-bottom:12px">
      <div style="flex:1;background:rgba(255,255,255,.05);border-radius:6px;padding:10px;text-align:center">
        <div style="font-size:1.1rem;font-weight:700;color:${passiveScore.color}">${passiveRate}%</div>
        <div style="font-size:.62rem;opacity:.5">passive sentences</div>
        <div style="font-size:.68rem;color:${passiveScore.color}">${passiveScore.label}</div>
      </div>
      <div style="flex:1;background:rgba(255,255,255,.05);border-radius:6px;padding:10px;text-align:center">
        <div style="font-size:1.1rem;font-weight:700;color:${adverbScore.color}">${adverbRate}</div>
        <div style="font-size:.62rem;opacity:.5">adverbs / 1000 words</div>
        <div style="font-size:.68rem;color:${adverbScore.color}">${adverbScore.label}</div>
      </div>
    </div>

    <div style="font-size:.7rem;text-transform:uppercase;letter-spacing:.07em;opacity:.4;margin-bottom:6px">Filter Words</div>
    ${Object.keys(filterCounts).length
      ? `<div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:12px">
          ${Object.entries(filterCounts).sort((a,b)=>b[1]-a[1]).map(([w, n]) =>
            `<span style="background:rgba(168,76,76,.18);border:1px solid rgba(168,76,76,.35);border-radius:10px;padding:2px 8px;font-size:.72rem">${w} ×${n}</span>`
          ).join('')}
        </div>`
      : '<div style="font-size:.75rem;opacity:.4;margin-bottom:12px">None detected — nice and clean.</div>'
    }

    <div style="font-size:.7rem;text-transform:uppercase;letter-spacing:.07em;opacity:.4;margin-bottom:6px">Clichés</div>
    ${clichesFound.length
      ? `<ul style="font-size:.78rem;padding-left:18px;margin-bottom:4px">${clichesFound.map(c => `<li>"${c}"</li>`).join('')}</ul>`
      : '<div style="font-size:.75rem;opacity:.4">No common clichés found.</div>'
    }
  `;
}

function renderTonePanel() {
  const out = document.getElementById('tone-output');
  if (out && !out.innerHTML.trim()) {
    out.innerHTML = '<div style="opacity:.4;font-size:.78rem;text-align:center;padding:10px">Click Analyze to check your prose style.</div>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (typeof renderTonePanel === 'function') renderTonePanel();
});
