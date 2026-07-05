/* ═══════════════════════════════════════════════════════════════
   js/keyboard.js — Keyboard Shortcut Manager & Custom Bindings
   Shows a cheat-sheet panel, lets users create custom shortcuts,
   and registers handlers on top of existing Inkwell shortcuts.
   ═══════════════════════════════════════════════════════════════ */

const KB_CUSTOM_KEY = 'inkwell-custom-shortcuts';

// ── BUILT-IN SHORTCUT REFERENCE ───────────────────────────────
const BUILTIN_SHORTCUTS = [
  { keys: 'Ctrl+B',         action: 'Bold'                     },
  { keys: 'Ctrl+I',         action: 'Italic'                   },
  { keys: 'Ctrl+U',         action: 'Underline'                },
  { keys: 'Ctrl+Z',         action: 'Undo'                     },
  { keys: 'Ctrl+Y',         action: 'Redo'                     },
  { keys: 'Ctrl+S',         action: 'Save & download'          },
  { keys: 'Ctrl+F',         action: 'Find & replace'           },
  { keys: 'Ctrl+Shift+F',   action: 'Toggle focus mode'        },
  { keys: 'Ctrl+Shift+R',   action: 'Read aloud'               },
  { keys: 'Ctrl+Shift+M',   action: 'Toggle mindmap'           },
  { keys: 'Ctrl+Shift+G',   action: 'Grammar check'            },
  { keys: 'Ctrl+Shift+.',   action: 'Increase font size'       },
  { keys: 'Ctrl+Shift+,',   action: 'Decrease font size'       },
  { keys: 'Ctrl+Shift+T',   action: 'Thesaurus'                },
  { keys: 'Ctrl+Enter',     action: 'Insert page break'        },
  { keys: 'Esc',            action: 'Close panels / exit focus'},
];

// ── CUSTOM SHORTCUT SNIPPETS ───────────────────────────────────
// Each entry: { id, keys, type, value, label }
// type = 'snippet' | 'command'

function loadCustomShortcuts() {
  try { return JSON.parse(localStorage.getItem(KB_CUSTOM_KEY) || '[]'); }
  catch { return []; }
}

function saveCustomShortcuts(list) {
  localStorage.setItem(KB_CUSTOM_KEY, JSON.stringify(list));
}

// ── KEYPRESS HANDLER ──────────────────────────────────────────
function handleCustomShortcut(e) {
  const list = loadCustomShortcuts();
  if (!list.length) return;

  const combo = buildCombo(e);
  const match = list.find(s => s.keys === combo);
  if (!match) return;

  e.preventDefault();
  if (match.type === 'snippet') {
    if (typeof editor !== 'undefined') {
      editor.focus();
      document.execCommand('insertText', false, match.value);
      if (typeof updateStats === 'function') updateStats();
      if (typeof triggerSave  === 'function') triggerSave();
    }
  } else if (match.type === 'command') {
    // Evaluate a simple function name from the inkwell global scope
    const fn = window[match.value];
    if (typeof fn === 'function') fn();
  }
}

function buildCombo(e) {
  const parts = [];
  if (e.ctrlKey  || e.metaKey) parts.push('Ctrl');
  if (e.altKey)                 parts.push('Alt');
  if (e.shiftKey)               parts.push('Shift');
  if (e.key && e.key !== 'Control' && e.key !== 'Alt' && e.key !== 'Shift' && e.key !== 'Meta') {
    parts.push(e.key.length === 1 ? e.key.toUpperCase() : e.key);
  }
  return parts.join('+');
}

document.addEventListener('keydown', handleCustomShortcut);

// ── PANEL RENDER ──────────────────────────────────────────────
function renderKeyboardPanel() {
  const out = document.getElementById('keyboard-output');
  if (!out) return;

  const custom = loadCustomShortcuts();

  const builtinRows = BUILTIN_SHORTCUTS.map(s => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.06)">
      <span style="font-size:.78rem;opacity:.8">${s.action}</span>
      <kbd style="font-size:.68rem;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);border-radius:3px;padding:2px 6px;font-family:monospace">${s.keys}</kbd>
    </div>`).join('');

  const customRows = custom.length ? custom.map((s, i) => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.06)">
      <div>
        <kbd style="font-size:.68rem;background:rgba(201,168,76,.2);border:1px solid rgba(201,168,76,.4);border-radius:3px;padding:2px 6px;font-family:monospace">${s.keys}</kbd>
        <span style="font-size:.75rem;opacity:.7;margin-left:6px">${escKb(s.label || (s.type === 'snippet' ? s.value.slice(0,30) : s.value))}</span>
      </div>
      <button onclick="deleteCustomShortcut(${i})" style="font-size:.65rem;background:transparent;border:1px solid rgba(255,255,255,.15);border-radius:3px;padding:2px 5px;color:inherit;cursor:pointer">✕</button>
    </div>`).join('') : `<div style="font-size:.74rem;opacity:.35;padding:6px 0">No custom shortcuts yet.</div>`;

  out.innerHTML = `
    <div style="font-size:.7rem;text-transform:uppercase;letter-spacing:.07em;opacity:.4;margin-bottom:6px">Built-in Shortcuts</div>
    <div style="margin-bottom:12px">${builtinRows}</div>

    <div style="font-size:.7rem;text-transform:uppercase;letter-spacing:.07em;opacity:.4;margin-bottom:6px">Custom Shortcuts</div>
    <div style="margin-bottom:10px">${customRows}</div>

    <details>
      <summary style="font-size:.76rem;cursor:pointer;color:rgba(247,244,238,.55)">＋ Create custom shortcut</summary>
      <div style="display:flex;flex-direction:column;gap:6px;margin-top:8px">
        <div>
          <div style="font-size:.72rem;opacity:.55;margin-bottom:3px">Shortcut keys (e.g. Ctrl+Shift+1)</div>
          <input type="text" id="kb-keys" placeholder="Press keys or type combo…"
            style="${kbInput()}"
            onkeydown="captureKbCombo(event)">
        </div>
        <div>
          <div style="font-size:.72rem;opacity:.55;margin-bottom:3px">Type</div>
          <select id="kb-type" onchange="renderKbTypeHint()" style="${kbInput()}">
            <option value="snippet">Insert text snippet</option>
            <option value="command">Run function (advanced)</option>
          </select>
        </div>
        <div>
          <div style="font-size:.72rem;opacity:.55;margin-bottom:3px">Label (optional)</div>
          <input type="text" id="kb-label" placeholder="My shortcut…" style="${kbInput()}">
        </div>
        <div>
          <div style="font-size:.72rem;opacity:.55;margin-bottom:3px" id="kb-value-label">Text to insert</div>
          <textarea id="kb-value" rows="2" placeholder="Text or snippet…" style="${kbInput()}resize:vertical;font-family:inherit"></textarea>
        </div>
        <button class="mini-btn" onclick="addCustomShortcut()">Save Shortcut</button>
      </div>
    </details>`;
}

function kbInput() {
  return 'width:100%;padding:4px 8px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.15);border-radius:4px;color:inherit;font-size:.8rem;box-sizing:border-box;';
}

function escKb(s) {
  return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function captureKbCombo(e) {
  // Let Tab, Enter through; capture everything else
  if (['Tab'].includes(e.key)) return;
  e.preventDefault();
  const combo = buildCombo(e);
  if (combo) {
    const inp = document.getElementById('kb-keys');
    if (inp) inp.value = combo;
  }
}

function renderKbTypeHint() {
  const type  = document.getElementById('kb-type')?.value;
  const label = document.getElementById('kb-value-label');
  if (label) label.textContent = type === 'command' ? 'Function name (e.g. runGrammarCheck)' : 'Text to insert';
}

function addCustomShortcut() {
  const keys  = (document.getElementById('kb-keys')?.value  || '').trim();
  const type  = (document.getElementById('kb-type')?.value  || 'snippet');
  const label = (document.getElementById('kb-label')?.value || '').trim();
  const value = (document.getElementById('kb-value')?.value || '').trim();

  if (!keys)  { if (typeof showToast === 'function') showToast('Enter a key combo'); return; }
  if (!value) { if (typeof showToast === 'function') showToast('Enter a value'); return; }

  const list = loadCustomShortcuts();

  // Check for conflicts
  const conflict = BUILTIN_SHORTCUTS.find(s => s.keys === keys);
  if (conflict && !confirm(`"${keys}" is used by "${conflict.action}" — override?`)) return;

  const existing = list.findIndex(s => s.keys === keys);
  const entry    = { id: Date.now(), keys, type, label, value };
  if (existing >= 0) list[existing] = entry; else list.push(entry);

  saveCustomShortcuts(list);
  renderKeyboardPanel();
  if (typeof showToast === 'function') showToast(`Shortcut ${keys} saved ✓`);
}

function deleteCustomShortcut(i) {
  const list = loadCustomShortcuts();
  list.splice(i, 1);
  saveCustomShortcuts(list);
  renderKeyboardPanel();
}
