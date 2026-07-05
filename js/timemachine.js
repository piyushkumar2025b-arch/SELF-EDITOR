/* ═══════════════════════════════════════════════════════════════
   js/timemachine.js — Chronological Playback & Revision History
   ═══════════════════════════════════════════════════════════════ */

let tmHistory = [];
let tmPreviewMode = false;
let tmOriginalContent = '';
let tmPlayInterval = null;
let tmCurrentIndex = -1;

function initTimeMachine() {
  // Load saved history from localStorage if any
  try {
    const saved = localStorage.getItem('inkwell-timemachine-history');
    if (saved) {
      tmHistory = JSON.parse(saved);
    }
  } catch(e) {
    console.warn('Failed to load Time Machine history:', e);
  }

  // Setup listener on editor input to record history (throttled)
  if (typeof editor !== 'undefined') {
    let timer = null;
    editor.addEventListener('input', () => {
      if (tmPreviewMode) return; // Do not record edits while reviewing history
      clearTimeout(timer);
      timer = setTimeout(() => {
        recordSnapshot();
      }, 5000); // record every 5 seconds of idle time
    });

    // Make initial snapshot if empty
    setTimeout(() => {
      if (tmHistory.length === 0 && editor.innerHTML.trim() !== '') {
        recordSnapshot();
      }
    }, 1000);
  }
}

function recordSnapshot(manual = false) {
  if (typeof editor === 'undefined' || tmPreviewMode) return;
  const currentHtml = editor.innerHTML;

  // Don't record if same as last snapshot
  if (tmHistory.length > 0 && tmHistory[tmHistory.length - 1].html === currentHtml) {
    return;
  }

  const snapshot = {
    timestamp: Date.now(),
    html: currentHtml,
    wordCount: typeof getPlainText === 'function' ? getPlainText().trim().split(/\s+/).filter(Boolean).length : 0,
    manual: manual
  };

  tmHistory.push(snapshot);

  // Keep history size within limits (e.g. 100 snapshots)
  if (tmHistory.length > 100) {
    tmHistory.shift();
  }

  try {
    localStorage.setItem('inkwell-timemachine-history', JSON.stringify(tmHistory));
  } catch(e) {
    console.warn('LocalStorage limit reached for Time Machine history.');
  }

  updateTimeMachineUI();
}

function updateTimeMachineUI() {
  const list = document.getElementById('tm-snapshots-list');
  const scrubber = document.getElementById('tm-scrubber');
  if (!list) return;

  if (tmHistory.length === 0) {
    list.innerHTML = `<div class="tm-empty">No revision snapshots yet. Type in the editor to record history.</div>`;
    if (scrubber) { scrubber.disabled = true; scrubber.max = 0; }
    return;
  }

  if (scrubber) {
    scrubber.disabled = false;
    scrubber.max = tmHistory.length - 1;
    if (!tmPreviewMode) {
      scrubber.value = tmHistory.length - 1;
      tmCurrentIndex = tmHistory.length - 1;
    }
  }

  list.innerHTML = tmHistory.map((snap, i) => {
    const date = new Date(snap.timestamp);
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    const isCurrent = i === tmCurrentIndex;

    return `
      <div class="tm-snap-item ${isCurrent ? 'active' : ''} ${snap.manual ? 'manual' : ''}" onclick="previewSnapshot(${i})">
        <div class="tm-snap-info">
          <span class="tm-snap-time">${timeStr}</span>
          <span class="tm-snap-date">${dateStr}</span>
        </div>
        <div class="tm-snap-stats">
          <span>${snap.wordCount} words</span>
          ${snap.manual ? '<span class="tm-snap-badge">Save</span>' : ''}
        </div>
      </div>
    `;
  }).reverse().join('');
}

function previewSnapshot(index) {
  if (typeof editor === 'undefined' || index < 0 || index >= tmHistory.length) return;

  if (!tmPreviewMode) {
    tmPreviewMode = true;
    tmOriginalContent = editor.innerHTML;
    // Show preview banners in UI
    const banner = document.getElementById('tm-preview-banner');
    if (banner) banner.style.display = 'flex';
  }

  tmCurrentIndex = index;
  editor.innerHTML = tmHistory[index].html;

  // Update scrubber position
  const scrubber = document.getElementById('tm-scrubber');
  if (scrubber) scrubber.value = index;

  updateTimeMachineUI();
  if (typeof updateStats === 'function') updateStats();
}

function exitTimeMachinePreview() {
  if (typeof editor === 'undefined' || !tmPreviewMode) return;
  
  editor.innerHTML = tmOriginalContent;
  tmPreviewMode = false;
  tmOriginalContent = '';

  const banner = document.getElementById('tm-preview-banner');
  if (banner) banner.style.display = 'none';

  stopTimeMachinePlayback();
  updateTimeMachineUI();
  if (typeof updateStats === 'function') updateStats();
  showToast('Exited history preview');
}

function restoreSelectedSnapshot() {
  if (typeof editor === 'undefined' || tmCurrentIndex < 0 || tmCurrentIndex >= tmHistory.length) return;

  // The active content becomes the snapshot
  tmPreviewMode = false;
  tmOriginalContent = '';

  const banner = document.getElementById('tm-preview-banner');
  if (banner) banner.style.display = 'none';

  stopTimeMachinePlayback();
  recordSnapshot(true); // Save a fresh manual checkpoint
  showToast('✓ Document restored to selected version');
  if (typeof triggerSave === 'function') triggerSave();
}

function toggleTimeMachinePlayback() {
  if (tmPlayInterval) {
    stopTimeMachinePlayback();
  } else {
    startTimeMachinePlayback();
  }
}

function startTimeMachinePlayback() {
  if (tmHistory.length === 0) return;
  
  const playBtn = document.getElementById('tm-play-btn');
  if (playBtn) playBtn.textContent = '⏸ Pause';

  // Start from the beginning if we're at the end
  if (tmCurrentIndex === tmHistory.length - 1) {
    previewSnapshot(0);
  }

  tmPlayInterval = setInterval(() => {
    let nextIdx = tmCurrentIndex + 1;
    if (nextIdx >= tmHistory.length) {
      stopTimeMachinePlayback();
    } else {
      previewSnapshot(nextIdx);
    }
  }, 600);
}

function stopTimeMachinePlayback() {
  if (tmPlayInterval) {
    clearInterval(tmPlayInterval);
    tmPlayInterval = null;
  }
  const playBtn = document.getElementById('tm-play-btn');
  if (playBtn) playBtn.textContent = '▶ Play';
}

function handleScrubberChange(e) {
  const index = parseInt(e.target.value);
  previewSnapshot(index);
}

// ── INIT ON LOAD ─────────────────────────────────────────────
if (typeof editor !== 'undefined') {
  initTimeMachine();
}
