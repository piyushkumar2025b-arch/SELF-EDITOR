/* ═══════════════════════════════════════════════════════════════
   js/goals.js — Writing Goals, Streaks & Habit Tracker
   Tracks daily word goals, streaks, writing sessions, and milestones.
   All data stored in localStorage. No external API needed.
   ═══════════════════════════════════════════════════════════════ */

const GOALS_KEY   = 'inkwell-goals';
const STREAK_KEY  = 'inkwell-streak';
const SESSION_KEY = 'inkwell-sessions';

// ── DEFAULT GOALS ─────────────────────────────────────────────
const DEFAULT_GOALS = {
  dailyWords: 500,
  weeklyWords: 3000,
  projectWords: 50000,
  dailyMinutes: 30,
};

// ── LOAD / SAVE ───────────────────────────────────────────────
function loadGoals() {
  try {
    return JSON.parse(localStorage.getItem(GOALS_KEY) || 'null') || { ...DEFAULT_GOALS };
  } catch { return { ...DEFAULT_GOALS }; }
}

function saveGoals(g) {
  localStorage.setItem(GOALS_KEY, JSON.stringify(g));
}

function loadStreak() {
  try {
    return JSON.parse(localStorage.getItem(STREAK_KEY) || 'null') || {
      current: 0, longest: 0, lastDate: null, history: {}
    };
  } catch {
    return { current: 0, longest: 0, lastDate: null, history: {} };
  }
}

function saveStreak(s) {
  localStorage.setItem(STREAK_KEY, JSON.stringify(s));
}

function loadSessions() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || '[]');
  } catch { return []; }
}

function saveSessions(sess) {
  // Keep last 90 sessions
  localStorage.setItem(SESSION_KEY, JSON.stringify(sess.slice(-90)));
}

// ── SESSION TRACKING ──────────────────────────────────────────
let _sessionStart    = Date.now();
let _sessionStartWC  = 0;
let _sessionActive   = false;

function startWritingSession() {
  _sessionStart   = Date.now();
  _sessionStartWC = countWords(getPlainText());
  _sessionActive  = true;
}

function endWritingSession() {
  if (!_sessionActive) return;
  const mins  = Math.round((Date.now() - _sessionStart) / 60000);
  const words = Math.max(0, countWords(getPlainText()) - _sessionStartWC);
  if (mins < 1 && words < 10) { _sessionActive = false; return; }

  const sess = loadSessions();
  sess.push({ date: todayStr(), mins, words, ts: Date.now() });
  saveSessions(sess);
  _sessionActive = false;

  updateStreakForToday(words);
}

function countWords(text) {
  return (text.trim().match(/\b\w+\b/g) || []).length;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// ── STREAK LOGIC ──────────────────────────────────────────────
function updateStreakForToday(wordsWritten) {
  const goals = loadGoals();
  if (wordsWritten < Math.max(1, goals.dailyWords * 0.1)) return; // Need at least 10% of goal

  const streak = loadStreak();
  const today  = todayStr();
  if (streak.lastDate === today) { saveStreak(streak); return; } // Already counted today

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (streak.lastDate === yesterday) {
    streak.current++;
  } else if (streak.lastDate !== today) {
    streak.current = 1; // reset
  }

  streak.longest  = Math.max(streak.longest, streak.current);
  streak.lastDate = today;
  streak.history  = streak.history || {};
  streak.history[today] = (streak.history[today] || 0) + wordsWritten;

  saveStreak(streak);
}

// ── TODAY'S PROGRESS ──────────────────────────────────────────
function getTodayWords() {
  const streak = loadStreak();
  return (streak.history || {})[todayStr()] || 0;
}

function getWeekWords() {
  const streak = loadStreak();
  const hist   = streak.history || {};
  let total = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    total += hist[d] || 0;
  }
  return total;
}

// ── RENDER GOALS PANEL ────────────────────────────────────────
function renderGoalsPanel() {
  const out = document.getElementById('goals-output');
  if (!out) return;

  const goals  = loadGoals();
  const streak = loadStreak();
  const todayW = getTodayWords();
  const weekW  = getWeekWords();
  const docW   = countWords(getPlainText());

  const pct = (val, max) => Math.min(100, Math.round((val / Math.max(1, max)) * 100));

  const bar = (val, max, color = '#c9a84c') => {
    const p = pct(val, max);
    return `
      <div style="background:rgba(255,255,255,.08);border-radius:3px;height:6px;margin:4px 0 8px">
        <div style="width:${p}%;height:100%;background:${color};border-radius:3px;transition:width .4s"></div>
      </div>`;
  };

  const flame = streak.current >= 3 ? '🔥' : streak.current >= 1 ? '✍️' : '💤';

  out.innerHTML = `
    <div style="display:flex;gap:10px;margin-bottom:12px">
      <div style="flex:1;background:rgba(255,255,255,.05);border-radius:6px;padding:10px;text-align:center">
        <div style="font-size:1.4rem">${flame}</div>
        <div style="font-size:1.1rem;font-weight:700;color:#c9a84c">${streak.current}</div>
        <div style="font-size:.6rem;opacity:.5">day streak</div>
      </div>
      <div style="flex:1;background:rgba(255,255,255,.05);border-radius:6px;padding:10px;text-align:center">
        <div style="font-size:1.4rem">🏆</div>
        <div style="font-size:1.1rem;font-weight:700;color:#c9a84c">${streak.longest}</div>
        <div style="font-size:.6rem;opacity:.5">best streak</div>
      </div>
      <div style="flex:1;background:rgba(255,255,255,.05);border-radius:6px;padding:10px;text-align:center">
        <div style="font-size:1.4rem">📄</div>
        <div style="font-size:1.1rem;font-weight:700;color:#c9a84c">${docW.toLocaleString()}</div>
        <div style="font-size:.6rem;opacity:.5">doc words</div>
      </div>
    </div>

    <div style="font-size:.7rem;text-transform:uppercase;letter-spacing:.07em;opacity:.4;margin-bottom:6px">Today's Goal</div>
    <div style="font-size:.8rem;display:flex;justify-content:space-between">
      <span>${todayW.toLocaleString()} / ${goals.dailyWords.toLocaleString()} words</span>
      <span style="color:#c9a84c">${pct(todayW, goals.dailyWords)}%</span>
    </div>
    ${bar(todayW, goals.dailyWords)}

    <div style="font-size:.7rem;text-transform:uppercase;letter-spacing:.07em;opacity:.4;margin-bottom:6px">This Week</div>
    <div style="font-size:.8rem;display:flex;justify-content:space-between">
      <span>${weekW.toLocaleString()} / ${goals.weeklyWords.toLocaleString()} words</span>
      <span style="color:#90b4ff">${pct(weekW, goals.weeklyWords)}%</span>
    </div>
    ${bar(weekW, goals.weeklyWords, '#90b4ff')}

    <div style="font-size:.7rem;text-transform:uppercase;letter-spacing:.07em;opacity:.4;margin-bottom:6px">Project Total</div>
    <div style="font-size:.8rem;display:flex;justify-content:space-between">
      <span>${docW.toLocaleString()} / ${goals.projectWords.toLocaleString()} words</span>
      <span style="color:#90ffcc">${pct(docW, goals.projectWords)}%</span>
    </div>
    ${bar(docW, goals.projectWords, '#90ffcc')}

    <details style="margin-top:10px">
      <summary style="font-size:.76rem;cursor:pointer;color:rgba(247,244,238,.55)">⚙ Edit Goals</summary>
      <div style="display:flex;flex-direction:column;gap:6px;margin-top:8px">
        <label style="font-size:.76rem">Daily word goal
          <input type="number" id="goal-daily" value="${goals.dailyWords}" min="1" max="99999"
            style="width:100%;margin-top:3px;padding:4px 8px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.15);border-radius:4px;color:inherit">
        </label>
        <label style="font-size:.76rem">Weekly word goal
          <input type="number" id="goal-weekly" value="${goals.weeklyWords}" min="1" max="999999"
            style="width:100%;margin-top:3px;padding:4px 8px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.15);border-radius:4px;color:inherit">
        </label>
        <label style="font-size:.76rem">Project word goal
          <input type="number" id="goal-project" value="${goals.projectWords}" min="1" max="9999999"
            style="width:100%;margin-top:3px;padding:4px 8px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.15);border-radius:4px;color:inherit">
        </label>
        <button class="mini-btn" onclick="saveGoalSettings()">Save Goals</button>
      </div>
    </details>

    <button class="mini-btn" style="width:100%;margin-top:10px" onclick="logTodayManually()">+ Log words written today</button>
    ${renderHeatmap()}
  `;
}

function saveGoalSettings() {
  const goals = loadGoals();
  goals.dailyWords   = parseInt(document.getElementById('goal-daily')?.value)   || goals.dailyWords;
  goals.weeklyWords  = parseInt(document.getElementById('goal-weekly')?.value)  || goals.weeklyWords;
  goals.projectWords = parseInt(document.getElementById('goal-project')?.value) || goals.projectWords;
  saveGoals(goals);
  renderGoalsPanel();
  if (typeof showToast === 'function') showToast('Goals saved ✓');
}

function logTodayManually() {
  const n = parseInt(prompt('Words written today (will add to today\'s count):'), 10);
  if (!n || n < 1) return;
  const streak = loadStreak();
  streak.history = streak.history || {};
  const today = todayStr();
  streak.history[today] = (streak.history[today] || 0) + n;
  saveStreak(streak);
  updateStreakForToday(n);
  renderGoalsPanel();
  if (typeof showToast === 'function') showToast(`+${n} words logged ✓`);
}

// ── 30-DAY HEATMAP ────────────────────────────────────────────
function renderHeatmap() {
  const streak = loadStreak();
  const hist   = streak.history || {};
  const goals  = loadGoals();
  const days   = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    const w = hist[d] || 0;
    const pct = Math.min(1, w / Math.max(1, goals.dailyWords));
    const alpha = pct > 0 ? (0.15 + pct * 0.85).toFixed(2) : '0.05';
    const label = d.slice(5).replace('-', '/');
    days.push(`<div title="${label}: ${w} words" style="width:16px;height:16px;border-radius:2px;background:rgba(201,168,76,${alpha})"></div>`);
  }
  return `
    <div style="font-size:.68rem;opacity:.4;margin:12px 0 4px;text-transform:uppercase;letter-spacing:.07em">30-day activity</div>
    <div style="display:flex;flex-wrap:wrap;gap:2px">${days.join('')}</div>`;
}

// ── AUTO SESSION START ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const editorEl = document.getElementById('editor');
  if (editorEl) {
    editorEl.addEventListener('focus', () => {
      if (!_sessionActive) startWritingSession();
    });
    editorEl.addEventListener('blur', () => {
      if (_sessionActive) endWritingSession();
    });
  }
  window.addEventListener('beforeunload', () => {
    if (_sessionActive) endWritingSession();
  });
});
