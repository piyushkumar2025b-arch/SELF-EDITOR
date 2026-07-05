// ── READ ALOUD (Speech Synthesis) ────────────────────────────
let raUtterance = null;

function populateVoices() {
  const select = document.getElementById('ra-voice-select');
  if (!select || !('speechSynthesis' in window)) return;
  const voices = speechSynthesis.getVoices();
  if (!voices.length) return;
  select.innerHTML = voices.map((v, i) =>
    `<option value="${i}">${v.name} (${v.lang})</option>`
  ).join('');
}

if ('speechSynthesis' in window) {
  populateVoices();
  speechSynthesis.onvoiceschanged = populateVoices;
}

function readAloudPlay() {
  if (!('speechSynthesis' in window)) {
    showToast('⚠ Text-to-speech isn\'t supported in this browser');
    return;
  }
  if (speechSynthesis.paused && speechSynthesis.speaking) {
    speechSynthesis.resume();
    return;
  }
  speechSynthesis.cancel();
  const text = getPlainText().trim();
  if (!text) { showToast('Nothing to read yet'); return; }

  raUtterance = new SpeechSynthesisUtterance(text);
  const voices  = speechSynthesis.getVoices();
  const select  = document.getElementById('ra-voice-select');
  const idx     = select ? parseInt(select.value, 10) : NaN;
  if (!isNaN(idx) && voices[idx]) raUtterance.voice = voices[idx];

  const rateEl = document.getElementById('ra-rate');
  raUtterance.rate = rateEl ? (parseFloat(rateEl.value) || 1) : 1;

  const playBtn = document.getElementById('ra-play-btn');
  if (playBtn) playBtn.classList.add('active');

  raUtterance.onend = () => {
    if (playBtn) playBtn.classList.remove('active');
  };

  // ── word highlight while reading ─────────────────────────
  raUtterance.onboundary = (e) => {
    if (e.name !== 'word') return;
    const wordEl = document.getElementById('ra-current-word');
    if (!wordEl) return;
    const chunk = text.substr(e.charIndex, e.charLength || 6);
    wordEl.textContent = chunk;
  };

  speechSynthesis.speak(raUtterance);
  showToast('🔊 Reading aloud…');
}

function readAloudPause() {
  if ('speechSynthesis' in window && speechSynthesis.speaking) {
    speechSynthesis.pause();
    showToast('⏸ Paused');
  }
}

function readAloudStop() {
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  const playBtn = document.getElementById('ra-play-btn');
  if (playBtn) playBtn.classList.remove('active');
  const wordEl = document.getElementById('ra-current-word');
  if (wordEl) wordEl.textContent = '';
  showToast('⏹ Stopped');
}
