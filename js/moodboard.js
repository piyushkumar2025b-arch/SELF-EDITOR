/* ═══════════════════════════════════════════════════════════════
   js/moodboard.js — Inspiration Mood Board
   Save quotes, color palettes, and reference notes for a project.
   ═══════════════════════════════════════════════════════════════ */

const MOODBOARD_KEY = 'inkwell-moodboard';

function _moodLoad() {
  try { return JSON.parse(localStorage.getItem(MOODBOARD_KEY) || '[]'); }
  catch { return []; }
}
function _moodSave(items) {
  localStorage.setItem(MOODBOARD_KEY, JSON.stringify(items));
}

function addMoodItem() {
  const textEl  = document.getElementById('mood-new-text');
  const colorEl = document.getElementById('mood-new-color');
  const text = (textEl?.value || '').trim();
  if (!text) { if (typeof showToast === 'function') showToast('Add some text or a quote first'); return; }

  const items = _moodLoad();
  items.unshift({ id: Date.now(), text, color: colorEl?.value || '#e2c373' });
  _moodSave(items);
  if (textEl) textEl.value = '';
  renderMoodboard();
}

function deleteMoodItem(id) {
  _moodSave(_moodLoad().filter(i => i.id !== id));
  renderMoodboard();
}

function insertMoodItemToEditor(id) {
  const item = _moodLoad().find(i => i.id === id);
  if (!item || !editor) return;
  editor.focus();
  document.execCommand('insertText', false, item.text + ' ');
  if (typeof showToast === 'function') showToast('Inserted into document ✓');
}

function renderMoodboard() {
  const out = document.getElementById('moodboard-output');
  if (!out) return;
  const items = _moodLoad();

  if (!items.length) {
    out.innerHTML = '<div style="opacity:.4;font-size:.78rem;text-align:center;padding:10px">Your mood board is empty. Add quotes, colors, or notes for inspiration.</div>';
    return;
  }

  out.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      ${items.map(i => `
        <div style="background:rgba(255,255,255,.05);border-top:3px solid ${i.color};border-radius:4px;padding:8px;display:flex;flex-direction:column;gap:6px">
          <div style="font-size:.78rem;font-family:'Lora',serif;line-height:1.4;min-height:40px">${i.text}</div>
          <div style="display:flex;gap:4px">
            <button class="mini-btn" style="flex:1;padding:2px 4px;font-size:.65rem" onclick="insertMoodItemToEditor(${i.id})">→ Insert</button>
            <button class="mini-btn" style="padding:2px 6px;font-size:.65rem" onclick="deleteMoodItem(${i.id})">✕</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  if (typeof renderMoodboard === 'function') renderMoodboard();
});
