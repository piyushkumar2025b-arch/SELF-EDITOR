/* ═══════════════════════════════════════════════════════════════
   js/focustimer.js — Focus / Pomodoro Timer
   Simple work/break interval timer with session logging.
   ═══════════════════════════════════════════════════════════════ */

const FOCUS_LOG_KEY = 'inkwell-focus-log';

let _focusMode      = 'work';   // 'work' | 'break'
let _focusRemaining = 25 * 60;  // seconds
let _focusTicker    = null;
let _focusRunning    = false;
let _focusWorkLen   = 25;
let _focusBreakLen  = 5;

function _focusLoad() {
  try { return JSON.parse(localStorage.getItem(FOCUS_LOG_KEY) || '[]'); }
  catch { return []; }
}
function _focusSave(log) {
  localStorage.setItem(FOCUS_LOG_KEY, JSON.stringify(log.slice(-60)));
}

function focusFmt(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function renderFocusTimer() {
  const out = document.getElementById('focustimer-output');
  if (!out) return;

  const log = _focusLoad();
  const today = new Date().toISOString().slice(0, 10);
  const todaySessions = log.filter(l => l.date === today && l.type === 'work');
  const todayMins = todaySessions.reduce((a, b) => a + b.mins, 0);

  out.innerHTML = `
    <div style="text-align:center;padding:14px 0">
      <div style="font-size:.68rem;text-transform:uppercase;letter-spacing:.1em;opacity:.5;margin-bottom:4px">
        ${_focusMode === 'work' ? '✍️ Focus Session' : '☕ Break'}
      </div>
      <div style="font-family:'Playfair Display',serif;font-size:2.6rem;color:#c9a84c;line-height:1">
        ${focusFmt(_focusRemaining)}
      </div>
    </div>
    <div style="display:flex;gap:6px;margin-bottom:10px">
      <button class="mini-btn" style="flex:1" onclick="focusStartPause()">${_focusRunning ? '⏸ Pause' : '▶ Start'}</button>
      <button class="mini-btn" style="flex:1" onclick="focusReset()">⟲ Reset</button>
      <button class="mini-btn" style="flex:1" onclick="focusSkip()">⏭ Skip</button>
    </div>
    <details>
      <summary style="font-size:.76rem;cursor:pointer;color:rgba(247,244,238,.55)">⚙ Interval Settings</summary>
      <div style="display:flex;gap:8px;margin-top:8px">
        <label style="flex:1;font-size:.74rem">Work (min)
          <input type="number" id="focus-work-len" value="${_focusWorkLen}" min="1" max="120"
            style="width:100%;margin-top:3px;padding:4px 8px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.15);border-radius:4px;color:inherit">
        </label>
        <label style="flex:1;font-size:.74rem">Break (min)
          <input type="number" id="focus-break-len" value="${_focusBreakLen}" min="1" max="60"
            style="width:100%;margin-top:3px;padding:4px 8px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.15);border-radius:4px;color:inherit">
        </label>
      </div>
      <button class="mini-btn" style="width:100%;margin-top:8px" onclick="focusApplySettings()">Apply</button>
    </details>
    <div style="margin-top:12px;font-size:.7rem;text-transform:uppercase;letter-spacing:.07em;opacity:.4">Today</div>
    <div style="font-size:.85rem;margin-top:4px">${todaySessions.length} session${todaySessions.length === 1 ? '' : 's'} · ${todayMins} min focused</div>
  `;
}

function focusApplySettings() {
  const w = parseInt(document.getElementById('focus-work-len')?.value, 10);
  const b = parseInt(document.getElementById('focus-break-len')?.value, 10);
  if (w > 0) _focusWorkLen = w;
  if (b > 0) _focusBreakLen = b;
  if (!_focusRunning) {
    _focusRemaining = (_focusMode === 'work' ? _focusWorkLen : _focusBreakLen) * 60;
  }
  renderFocusTimer();
  if (typeof showToast === 'function') showToast('Timer settings updated ✓');
}

function focusStartPause() {
  if (_focusRunning) {
    clearInterval(_focusTicker);
    _focusRunning = false;
  } else {
    _focusRunning = true;
    _focusTicker = setInterval(focusTick, 1000);
  }
  renderFocusTimer();
}

function focusTick() {
  _focusRemaining--;
  if (_focusRemaining <= 0) {
    _focusLogSession();
    focusSwitchMode();
    if (typeof showToast === 'function') {
      showToast(_focusMode === 'work' ? '☕ Break time!' : '✍️ Back to writing!');
    }
  }
  renderFocusTimer();
}

function _focusLogSession() {
  const log = _focusLoad();
  const mins = _focusMode === 'work' ? _focusWorkLen : _focusBreakLen;
  log.push({ date: new Date().toISOString().slice(0, 10), type: _focusMode, mins, ts: Date.now() });
  _focusSave(log);
}

function focusSwitchMode() {
  clearInterval(_focusTicker);
  _focusMode = _focusMode === 'work' ? 'break' : 'work';
  _focusRemaining = (_focusMode === 'work' ? _focusWorkLen : _focusBreakLen) * 60;
  if (_focusRunning) _focusTicker = setInterval(focusTick, 1000);
}

function focusSkip() {
  focusSwitchMode();
  renderFocusTimer();
}

function focusReset() {
  clearInterval(_focusTicker);
  _focusRunning = false;
  _focusMode = 'work';
  _focusRemaining = _focusWorkLen * 60;
  renderFocusTimer();
}

document.addEventListener('DOMContentLoaded', () => {
  if (typeof renderFocusTimer === 'function') renderFocusTimer();
});
