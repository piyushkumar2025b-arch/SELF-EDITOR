// ── WRITING STATS ─────────────────────────────────
function updateStats() {
  const text = getPlainText().trim();
  const words = text ? text.split(/\s+/).filter(w => w).length : 0;
  const chars  = text.length;
  const sents  = text ? (text.match(/[.!?]+/g) || []).length : 0;
  const paras  = text ? text.split(/\n\s*\n/).filter(p => p.trim()).length : 0;
  const readMin = Math.max(1, Math.round(words / 200));
  const barW  = Math.min(100, Math.max(2, words / 5));

  const wordsEl = document.getElementById('stat-words');
  const charsEl = document.getElementById('stat-chars');
  const sentsEl = document.getElementById('stat-sents');
  const parasEl = document.getElementById('stat-paras');
  const readEl = document.getElementById('stat-read');
  const readBar = document.getElementById('read-bar');
  const sbWords = document.getElementById('statusbar-words');

  if (wordsEl) wordsEl.textContent = words.toLocaleString();
  if (charsEl) charsEl.textContent = chars.toLocaleString();
  if (sentsEl) sentsEl.textContent = sents.toLocaleString();
  if (parasEl) parasEl.textContent = paras.toLocaleString();
  if (readEl) readEl.textContent = readMin + ' min';
  if (readBar) readBar.style.width = barW + '%';
  if (sbWords) sbWords.textContent = words + ' words';
}

// ── WRITING GOAL ─────────────────────────────────────────────
let writingGoalTarget = parseInt(localStorage.getItem('inkwell-goal') || '500', 10) || 500;
function setWritingGoal(val) {
  writingGoalTarget = Math.max(0, parseInt(val, 10) || 0);
  try { localStorage.setItem('inkwell-goal', String(writingGoalTarget)); } catch(e) {}
  updateGoalDisplay();
}
function updateGoalDisplay() {
  const words = (getPlainText().trim() ? getPlainText().trim().split(/\s+/).filter(Boolean).length : 0);
  const target = writingGoalTarget || 1;
  const pct = Math.min(100, Math.round((words / target) * 100));
  const circumference = 188.5;
  const offset = circumference - (Math.min(1, words / target) * circumference);
  
  const ring = document.getElementById('goal-ring-fill');
  const pctText = document.getElementById('goal-ring-pct');
  const cur = document.getElementById('goal-current');
  const tgtDisplay = document.getElementById('goal-target-display');
  const remaining = document.getElementById('goal-remaining');
  const complete = document.getElementById('goal-complete-msg');

  if (ring) ring.style.strokeDashoffset = offset;
  if (pctText) pctText.textContent = pct + '%';
  if (cur) cur.textContent = words.toLocaleString();
  if (tgtDisplay) tgtDisplay.textContent = writingGoalTarget.toLocaleString();
  if (remaining) remaining.textContent = Math.max(0, writingGoalTarget - words).toLocaleString();
  if (complete) complete.classList.toggle('show', words >= writingGoalTarget && writingGoalTarget > 0);
}

// ── READABILITY & WORD FREQUENCY ─────────────────────────────
const STOPWORDS = new Set(['the','a','an','and','or','but','of','to','in','on','at','for','with','is','are','was','were','be','been','it','this','that','as','by','from','i','you','he','she','they','we','my','your','his','her','their','our','not','so','if','then','than','too','very','just','also']);
function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!word) return 0;
  const matches = word.match(/[aeiouy]+/g);
  let count = matches ? matches.length : 1;
  if (word.endsWith('e') && count > 1) count--;
  return Math.max(1, count);
}
function updateReadabilityAndFrequency() {
  const badge = document.getElementById('read-score-badge');
  const desc = document.getElementById('read-score-desc');
  const cloud = document.getElementById('wordfreq-cloud');
  if (!badge) return;
  const text = getPlainText().trim();
  const words = text ? text.split(/\s+/).filter(Boolean) : [];
  const sentences = Math.max(1, (text.match(/[.!?]+/g) || []).length);
  if (words.length < 15) {
    badge.textContent = '–';
    if (desc) desc.textContent = 'Write at least a few sentences to see your readability score.';
  } else {
    const syllables = words.reduce((s, w) => s + countSyllables(w), 0);
    const score = Math.max(0, Math.min(100, Math.round(206.835 - 1.015 * (words.length / sentences) - 84.6 * (syllables / words.length))));
    badge.textContent = score;
    let label;
    if (score >= 80) label = 'Very easy to read — plain, conversational.';
    else if (score >= 60) label = 'Easy to read — clear for most audiences.';
    else if (score >= 40) label = 'Fairly difficult — best for an educated audience.';
    else label = 'Difficult — dense, academic, or technical prose.';
    if (desc) desc.textContent = `Flesch Reading Ease: ${label}`;
  }
  const freq = {};
  words.forEach(w => {
    const clean = w.toLowerCase().replace(/[^a-z']/g, '');
    if (clean.length < 3 || STOPWORDS.has(clean)) return;
    freq[clean] = (freq[clean] || 0) + 1;
  });
  const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 8);
  if (cloud) {
    cloud.innerHTML = top.length
      ? top.map(([w, c]) => `<span class="wf-tag">${w} <b>×${c}</b></span>`).join('')
      : '<span class="wf-tag">Nothing yet</span>';
  }
}

// ── LISTENERS & INITIALIZATION ────────────────────────────────
let readabilityDebounce = null;
if (editor) {
  editor.addEventListener('input', () => {
    updateStats();
    updateGoalDisplay();
    clearTimeout(readabilityDebounce);
    readabilityDebounce = setTimeout(updateReadabilityAndFrequency, 600);
  });
}

// Run immediately
updateStats();
updateGoalDisplay();
updateReadabilityAndFrequency();
const goalInput = document.getElementById('goal-target');
if (goalInput) goalInput.value = writingGoalTarget;
