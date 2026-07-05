/* ═══════════════════════════════════════════════════════════════
   js/querytools.js — Query Letter & Synopsis Builder
   Helps authors assemble an agent query letter from form fields,
   using standard structure, saved to localStorage as a draft.
   ═══════════════════════════════════════════════════════════════ */

const QUERY_DRAFT_KEY = 'inkwell-query-draft';

function _queryLoad() {
  try { return JSON.parse(localStorage.getItem(QUERY_DRAFT_KEY) || 'null') || {}; }
  catch { return {}; }
}
function _querySave(d) {
  localStorage.setItem(QUERY_DRAFT_KEY, JSON.stringify(d));
}

function renderQueryForm() {
  const out = document.getElementById('querytools-output');
  if (!out) return;
  const d = _queryLoad();

  out.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:6px">
      <label style="font-size:.74rem">Agent / Recipient name
        <input type="text" id="q-agent" value="${d.agent || ''}" placeholder="e.g. Jane Smith"
          style="width:100%;margin-top:3px;padding:4px 8px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.15);border-radius:4px;color:inherit">
      </label>
      <label style="font-size:.74rem">Book title
        <input type="text" id="q-title" value="${d.title || ''}"
          style="width:100%;margin-top:3px;padding:4px 8px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.15);border-radius:4px;color:inherit">
      </label>
      <div style="display:flex;gap:6px">
        <label style="flex:1;font-size:.74rem">Genre
          <input type="text" id="q-genre" value="${d.genre || ''}" placeholder="e.g. Adult Fantasy"
            style="width:100%;margin-top:3px;padding:4px 8px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.15);border-radius:4px;color:inherit">
        </label>
        <label style="flex:1;font-size:.74rem">Word count
          <input type="text" id="q-wordcount" value="${d.wordcount || ''}" placeholder="e.g. 95,000"
            style="width:100%;margin-top:3px;padding:4px 8px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.15);border-radius:4px;color:inherit">
        </label>
      </div>
      <label style="font-size:.74rem">Comparable titles (comps)
        <input type="text" id="q-comps" value="${d.comps || ''}" placeholder="e.g. THE NAME OF THE WIND meets GONE GIRL"
          style="width:100%;margin-top:3px;padding:4px 8px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.15);border-radius:4px;color:inherit">
      </label>
      <label style="font-size:.74rem">Hook / Pitch (1–2 sentences)
        <textarea id="q-hook" rows="2" style="width:100%;margin-top:3px;padding:4px 8px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.15);border-radius:4px;color:inherit;font-family:inherit;resize:vertical">${d.hook || ''}</textarea>
      </label>
      <label style="font-size:.74rem">Synopsis (1–2 paragraphs)
        <textarea id="q-synopsis" rows="5" style="width:100%;margin-top:3px;padding:4px 8px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.15);border-radius:4px;color:inherit;font-family:inherit;resize:vertical">${d.synopsis || ''}</textarea>
      </label>
      <label style="font-size:.74rem">Author bio (1–2 sentences)
        <textarea id="q-bio" rows="2" style="width:100%;margin-top:3px;padding:4px 8px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.15);border-radius:4px;color:inherit;font-family:inherit;resize:vertical">${d.bio || ''}</textarea>
      </label>
      <button class="mini-btn" style="width:100%;margin-top:4px" onclick="saveQueryDraft()">💾 Save Draft</button>
      <button class="mini-btn" style="width:100%" onclick="assembleQueryLetter()">✉ Assemble Query Letter</button>
    </div>
    <div id="q-assembled" style="margin-top:12px"></div>
  `;
}

function _queryReadForm() {
  return {
    agent:     document.getElementById('q-agent')?.value.trim()     || '',
    title:     document.getElementById('q-title')?.value.trim()     || '',
    genre:     document.getElementById('q-genre')?.value.trim()     || '',
    wordcount: document.getElementById('q-wordcount')?.value.trim() || '',
    comps:     document.getElementById('q-comps')?.value.trim()     || '',
    hook:      document.getElementById('q-hook')?.value.trim()      || '',
    synopsis:  document.getElementById('q-synopsis')?.value.trim()  || '',
    bio:       document.getElementById('q-bio')?.value.trim()       || '',
  };
}

function saveQueryDraft() {
  _querySave(_queryReadForm());
  if (typeof showToast === 'function') showToast('Query draft saved ✓');
}

function assembleQueryLetter() {
  const d = _queryReadForm();
  _querySave(d);

  const greeting = d.agent ? `Dear ${d.agent},` : 'Dear [Agent Name],';
  const titleLine = d.title
    ? `${d.title.toUpperCase()} is a ${d.wordcount ? d.wordcount + '-word ' : ''}${d.genre || 'novel'}${d.comps ? `, perfect for readers of ${d.comps}` : ''}.`
    : '[TITLE] is a [word count] [genre] novel.';

  const letter = [
    greeting,
    '',
    d.hook || '[Your hook / pitch goes here.]',
    '',
    titleLine,
    '',
    d.synopsis || '[Your synopsis goes here — introduce your protagonist, the central conflict, and the stakes.]',
    '',
    d.bio || '[A sentence or two about you as the author.]',
    '',
    'Thank you for your time and consideration.',
    '',
    'Sincerely,',
    '[Your Name]',
  ].join('\n');

  const el = document.getElementById('q-assembled');
  if (el) {
    el.innerHTML = `
      <div style="font-size:.7rem;text-transform:uppercase;letter-spacing:.07em;opacity:.4;margin-bottom:6px">Assembled Letter</div>
      <textarea readonly rows="12" style="width:100%;padding:8px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.15);border-radius:4px;color:inherit;font-family:'Lora',serif;font-size:.8rem;resize:vertical">${letter}</textarea>
      <button class="mini-btn" style="width:100%;margin-top:6px" onclick="copyQueryLetter()">📋 Copy to Clipboard</button>
      <button class="mini-btn" style="width:100%;margin-top:6px" onclick="insertQueryLetterToEditor()">→ Insert into Editor</button>
    `;
    el.dataset.letter = letter;
  }
}

function copyQueryLetter() {
  const el = document.getElementById('q-assembled');
  const letter = el?.dataset?.letter;
  if (!letter) return;
  navigator.clipboard?.writeText(letter).then(() => {
    if (typeof showToast === 'function') showToast('Copied to clipboard ✓');
  }).catch(() => {
    if (typeof showToast === 'function') showToast('Could not copy — select and copy manually');
  });
}

function insertQueryLetterToEditor() {
  const el = document.getElementById('q-assembled');
  const letter = el?.dataset?.letter;
  if (!letter || !editor) return;
  editor.focus();
  document.execCommand('insertText', false, letter);
  if (typeof showToast === 'function') showToast('Inserted into document ✓');
}

document.addEventListener('DOMContentLoaded', () => {
  if (typeof renderQueryForm === 'function') renderQueryForm();
});
