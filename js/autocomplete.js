// ── EMOJI DATA & PICKER ─────────────────────────────────────
const EMOJI_SETS = {
  'Smileys':  ['😀','😁','😂','🤣','😊','😍','😘','😎','🤔','😴','😭','😡','🥳','😇','🙃','😅'],
  'Gestures': ['👍','👎','👏','🙌','🙏','✌️','🤝','👋','💪','🤞','✍️','👌'],
  'Hearts':   ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','💕','💔','💗','✨'],
  'Nature':   ['🌸','🌿','🌙','⭐','☀️','🔥','🌊','🍂','🌈','⚡','❄️','🌻'],
  'Objects':  ['📖','✒️','📜','🕯️','☕','🔑','⏳','🎭','🎨','🎯','💡','🏆'],
  'Symbols':  ['✅','❗','❓','💯','🔔','🚀','⚔️','🕊️','♾️','🌀','🔮','🎶']
};

function buildEmojiPopoverHTML(filterTerms) {
  let html = '';
  if (filterTerms && filterTerms.suggestions && filterTerms.suggestions.length) {
    html += `<div class="emoji-suggest-row">` +
      filterTerms.suggestions.map(e => `<span class="emoji-suggest-chip" onclick="insertEmoji('${e}')">${e}</span>`).join('') +
      `</div>`;
  }
  Object.entries(EMOJI_SETS).forEach(([label, list]) => {
    html += `<div class="ep-mini-label">${label}</div><div class="emoji-grid">`;
    list.forEach(e => { html += `<button class="emoji-cell" onclick="insertEmoji('${e}')">${e}</button>`; });
    html += `</div>`;
  });
  return html;
}

function toggleEmojiPopover(evt) {
  const pop = document.getElementById('emoji-popover');
  if (pop.classList.contains('show')) { pop.classList.remove('show'); return; }
  saveSelectionRange();
  const smart = getSmartEmojiSuggestions();
  pop.innerHTML = buildEmojiPopoverHTML({ suggestions: smart });
  const rect = evt.currentTarget.getBoundingClientRect();
  pop.style.left = Math.min(window.innerWidth - 280, rect.right + 8) + 'px';
  pop.style.top  = Math.min(window.innerHeight - 340, rect.top) + 'px';
  pop.classList.add('show');
}

function insertEmoji(emoji) {
  editor.focus();
  const sel = window.getSelection();
  if (savedRange) { sel.removeAllRanges(); sel.addRange(savedRange); }
  document.execCommand('insertText', false, emoji);
  saveSelectionRange();
  if (typeof updateStats === 'function') updateStats();
  if (typeof triggerSave  === 'function') triggerSave();
}

document.addEventListener('click', e => {
  const pop = document.getElementById('emoji-popover');
  if (pop && pop.classList.contains('show') &&
      !pop.contains(e.target) &&
      !e.target.closest('[data-tip="Insert Emoji"]')) {
    pop.classList.remove('show');
  }
});

// ── SMART EMOJI SUGGESTOR ────────────────────────────────────
const EMOJI_KEYWORDS = [
  [/\b(love|loving|heart|adore)\b/i,              ['❤️','💕','😍']],
  [/\b(happy|joy|glad|delight)\b/i,               ['😊','😀','✨']],
  [/\b(sad|cry|tears|heartbreak|grief)\b/i,       ['😭','💔','😢']],
  [/\b(angry|mad|furious|rage)\b/i,               ['😡','🔥','💢']],
  [/\b(fire|burn|forge|steel)\b/i,                ['🔥','⚔️','💪']],
  [/\b(star|dream|hope|wish)\b/i,                 ['⭐','🌙','✨']],
  [/\b(sun|morning|dawn)\b/i,                     ['☀️','🌅','🌻']],
  [/\b(night|dark|moon)\b/i,                      ['🌙','🌌','⭐']],
  [/\b(idea|think|thought|smart)\b/i,             ['💡','🤔','🧠']],
  [/\b(win|success|achieve|victory|triumph)\b/i,  ['🏆','🎉','✅']],
  [/\b(book|read|write|story|essay)\b/i,          ['📖','✒️','📜']],
  [/\b(pray|god|spirit|soul)\b/i,                 ['🙏','🕊️','🔱']],
  [/\b(strong|strength|power)\b/i,                ['💪','⚔️','🔥']],
  [/\b(coffee|tea)\b/i,                           ['☕']],
  [/\b(music|song|sing)\b/i,                      ['🎶','🎵']],
  [/\b(rain|storm|ocean|wave)\b/i,                ['🌊','⚡','❄️']],
];

function getSmartEmojiSuggestions() {
  const text = getPlainText();
  const lastSentence = (text.split(/[.!?]\s*/).pop() || '').slice(-160);
  const found = [];
  EMOJI_KEYWORDS.forEach(([re, emojis]) => {
    if (re.test(lastSentence)) emojis.forEach(e => { if (!found.includes(e)) found.push(e); });
  });
  return found.slice(0, 6);
}

let smartEmojiEnabled = true;
function toggleSmartEmoji(on) {
  smartEmojiEnabled = on;
  if (!on) {
    const nudge = document.getElementById('emoji-nudge');
    if (nudge) nudge.classList.remove('show');
  }
}

let smartEmojiTimer = null;
function handleSmartEmojiInput() {
  if (!smartEmojiEnabled) return;
  clearTimeout(smartEmojiTimer);
  smartEmojiTimer = setTimeout(() => {
    const suggestions = getSmartEmojiSuggestions();
    const nudge = document.getElementById('emoji-nudge');
    if (!nudge) return;
    if (!suggestions.length) { nudge.classList.remove('show'); return; }
    saveSelectionRange();
    nudge.innerHTML = suggestions.map(e => `<button onclick="insertEmojiFromNudge('${e}')">${e}</button>`).join('');
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const rect = sel.getRangeAt(0).getClientRects();
      const r = rect.length ? rect[rect.length - 1] : editor.getBoundingClientRect();
      nudge.style.left = Math.min(window.innerWidth - 160, r.left) + 'px';
      nudge.style.top  = (r.bottom || r.top) + 8 + 'px';
      nudge.classList.add('show');
    }
  }, 900);
}

function insertEmojiFromNudge(emoji) {
  insertEmoji(emoji);
  const nudge = document.getElementById('emoji-nudge');
  if (nudge) nudge.classList.remove('show');
}

// ── ENGLISH WORD SUGGESTOR (autocomplete) ────────────────────
const WORD_BANK = [
  'resilience','resilient','heartbreak','solitude','solace','transcend','transcendence',
  'unyielding','tenacity','tenacious','fortitude','perseverance','perseverant','wisdom',
  'serenity','clarity','courage','courageous','vulnerability','vulnerable','authentic',
  'authenticity','introspection','introspective','equanimity','catharsis','cathartic',
  'melancholy','melancholic','ephemeral','eternal','eternity','luminous','luminescent',
  'radiant','radiance','profound','profundity','sublime','ethereal','gratitude','grateful',
  'compassion','compassionate','empathy','empathetic','discipline','disciplined',
  'ambition','ambitious','integrity','humility','humble','forgiveness','forgive',
  'transformation','transformative','metamorphosis','awakening','enlightenment',
  'perspective','purpose','meaning','meaningful','journey','growth','grow','healing',
  'heal','strength','strengthen','wound','wounded','scar','scarred','beauty','beautiful',
  'wonder','wonderful','curiosity','curious','knowledge','knowledgeable',
  'algorithm','architecture','engineering','optimization','optimize','implementation',
  'implement','recursion','recursive','iteration','iterative','abstraction','abstract',
  'inheritance','polymorphism','encapsulation','concurrency','concurrent','asynchronous',
  'synchronous','database','function','variable','structure','pointer','reference'
];

let wordSuggestEnabled = true;
function toggleWordSuggest(on) {
  wordSuggestEnabled = on;
  if (!on) {
    const box = document.getElementById('word-suggest-box');
    if (box) box.classList.remove('show');
  }
}

function getCurrentTypedWord() {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0);
  if (!range.collapsed) return null;
  const node = range.startContainer;
  if (node.nodeType !== Node.TEXT_NODE) return null;
  const textBefore = node.textContent.slice(0, range.startOffset);
  const match = textBefore.match(/([A-Za-z']{2,})$/);
  return match ? { word: match[1], node, offset: range.startOffset } : null;
}

let wsHighlightIndex = -1;
function handleWordSuggestInput() {
  if (!wordSuggestEnabled) return;
  const box = document.getElementById('word-suggest-box');
  if (!box) return;
  const cur = getCurrentTypedWord();
  if (!cur || cur.word.length < 2) { box.classList.remove('show'); return; }
  const lower = cur.word.toLowerCase();
  const matches = WORD_BANK.filter(w => w.startsWith(lower) && w.toLowerCase() !== lower).slice(0, 6);
  if (!matches.length) { box.classList.remove('show'); return; }
  wsHighlightIndex = -1;
  box.innerHTML = matches.map((w, i) => `<div class="ws-item" data-i="${i}" onclick="applyWordSuggestion('${w}')">${w}</div>`).join('');
  const sel = window.getSelection();
  const rect = sel.getRangeAt(0).getClientRects();
  const r = rect.length ? rect[rect.length - 1] : editor.getBoundingClientRect();
  box.style.left = Math.min(window.innerWidth - 160, r.left) + 'px';
  box.style.top  = (r.bottom || r.top) + 6 + 'px';
  box.classList.add('show');
}

function applyWordSuggestion(word) {
  const cur = getCurrentTypedWord();
  const box = document.getElementById('word-suggest-box');
  if (box) box.classList.remove('show');
  if (!cur) return;
  const sel = window.getSelection();
  const range = document.createRange();
  range.setStart(cur.node, cur.offset - cur.word.length);
  range.setEnd(cur.node, cur.offset);
  sel.removeAllRanges();
  sel.addRange(range);
  document.execCommand('insertText', false, word + ' ');
  editor.focus();
  if (typeof updateStats === 'function') updateStats();
  if (typeof triggerSave  === 'function') triggerSave();
}

document.addEventListener('click', e => {
  const box = document.getElementById('word-suggest-box');
  if (box && box.classList.contains('show') && !box.contains(e.target)) box.classList.remove('show');
});

// ── Hook both into editor input ─────────────────────────────
if (editor) {
  editor.addEventListener('input', () => {
    handleSmartEmojiInput();
    handleWordSuggestInput();
  });
  editor.addEventListener('keydown', e => {
    const box = document.getElementById('word-suggest-box');
    if (box && box.classList.contains('show') && e.key === 'Escape') {
      box.classList.remove('show');
    }
  });
}
