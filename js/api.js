/* ═══════════════════════════════════════════════════════════════
   js/api.js — Premium API integrations for Inkwell
   APIs used (all free, no auth required except optional AI key):
     1. Datamuse API     — https://api.datamuse.com
     2. Free Dictionary  — https://api.dictionaryapi.dev
     3. Quotable.io      — https://api.quotable.io
     4. Lorem Picsum     — https://picsum.photos  (cover images)
     5. OpenAI-compatible— configurable by user (stored in localStorage)
   ═══════════════════════════════════════════════════════════════ */

// ── DATAMUSE THESAURUS (live synonyms) ────────────────────────
async function fetchSynonymsFromAPI(word) {
  try {
    const res  = await fetch(`https://api.datamuse.com/words?rel_syn=${encodeURIComponent(word)}&max=10`);
    const data = await res.json();
    return data.map(d => d.word);
  } catch(e) {
    console.warn('Datamuse API error:', e);
    return [];
  }
}

async function fetchRelatedWords(word) {
  try {
    const [syn, sim] = await Promise.all([
      fetch(`https://api.datamuse.com/words?rel_syn=${encodeURIComponent(word)}&max=6`).then(r => r.json()),
      fetch(`https://api.datamuse.com/words?ml=${encodeURIComponent(word)}&max=4`).then(r => r.json()),
    ]);
    return { synonyms: syn.map(d => d.word), related: sim.map(d => d.word) };
  } catch(e) {
    return { synonyms: [], related: [] };
  }
}

async function showApiThesaurus(evt) {
  const sel  = window.getSelection();
  const word = sel ? sel.toString().trim().toLowerCase().replace(/[^a-z']/g, '') : '';
  const pop  = document.getElementById('thesaurus-popover');
  if (!pop) return;

  if (!word) {
    pop.innerHTML = `<div class="thes-empty">Select a single word, then click Thesaurus.</div>`;
  } else {
    pop.innerHTML = `<div class="thes-word">${word}</div><div class="thes-list"><span class="thes-chip" style="opacity:.5">Loading…</span></div>`;
    pop.classList.add('show');

    saveSelectionRange();
    const { synonyms, related } = await fetchRelatedWords(word);
    const combined = [...new Set([...synonyms, ...related])];

    if (combined.length) {
      pop.innerHTML = `
        <div class="thes-word">${word}</div>
        <div style="font-size:.6rem;letter-spacing:.08em;text-transform:uppercase;color:rgba(247,244,238,.3);margin-bottom:5px">Synonyms & Related</div>
        <div class="thes-list">
          ${combined.map(s => `<span class="thes-chip" onclick="applyThesaurusWord('${s}')">${s}</span>`).join('')}
        </div>
        <div style="font-size:.6rem;color:rgba(247,244,238,.3);margin-top:8px">Powered by Datamuse API</div>`;
    } else {
      pop.innerHTML = `<div class="thes-word">${word}</div><div class="thes-empty">No synonyms found.</div>`;
    }
  }

  const rect = evt.currentTarget.getBoundingClientRect();
  pop.style.left = Math.min(window.innerWidth - 240, rect.right + 8) + 'px';
  pop.style.top  = Math.min(window.innerHeight - 160, rect.top) + 'px';
  pop.classList.add('show');
}

function applyThesaurusWord(word) {
  editor.focus();
  const sel = window.getSelection();
  if (savedRange) { sel.removeAllRanges(); sel.addRange(savedRange); }
  document.execCommand('insertText', false, word);
  const pop = document.getElementById('thesaurus-popover');
  if (pop) pop.classList.remove('show');
  if (typeof updateStats === 'function') updateStats();
  if (typeof triggerSave  === 'function') triggerSave();
}

document.addEventListener('click', e => {
  const pop = document.getElementById('thesaurus-popover');
  if (pop && pop.classList.contains('show') && !pop.contains(e.target) &&
      !e.target.closest('[data-tip="Thesaurus (select a word)"]')) {
    pop.classList.remove('show');
  }
});

// ── FREE DICTIONARY API (definitions) ────────────────────────
async function lookupDefinition() {
  const inp  = document.getElementById('dict-input');
  const out  = document.getElementById('dict-output');
  if (!inp || !out) return;
  const word = inp.value.trim();
  if (!word) { showToast('Enter a word to look up'); return; }
  out.innerHTML = `<div class="dict-loading">Looking up <em>${word}</em>…</div>`;
  try {
    const res  = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    if (!res.ok) throw new Error('Not found');
    const data = await res.json();
    const entry = data[0];
    let html = `<div class="dict-word">${entry.word}</div>`;
    if (entry.phonetics && entry.phonetics[0] && entry.phonetics[0].text) {
      html += `<div class="dict-phonetic">${entry.phonetics[0].text}</div>`;
    }
    (entry.meanings || []).slice(0, 3).forEach(m => {
      html += `<div class="dict-pos">${m.partOfSpeech}</div>`;
      (m.definitions || []).slice(0, 2).forEach(d => {
        html += `<div class="dict-def">• ${d.definition}</div>`;
        if (d.example) html += `<div class="dict-example">"${d.example}"</div>`;
      });
    });
    out.innerHTML = html;
  } catch(e) {
    out.innerHTML = `<div class="dict-empty">No definition found for "<em>${word}</em>".</div>`;
  }
}

async function lookupSelectedWord() {
  const sel  = window.getSelection();
  const word = sel ? sel.toString().trim() : '';
  if (!word) { showToast('Select a word first'); return; }
  const inp = document.getElementById('dict-input');
  if (inp) { inp.value = word; }
  lookupDefinition();
  jumpToSection('ep-dictionary');
}

// ── WRITING PROMPTS (Quotable.io for inspiration) ────────────
const FALLBACK_PROMPTS = [
  'Write about a moment when silence spoke louder than words.',
  'Describe a room you\'ve never been in, but feel you know intimately.',
  'A letter written to a version of yourself five years ago.',
  'The last conversation you wish you could have again.',
  'What does freedom smell like? Describe it in full sensory detail.',
  'Write from the perspective of the moon watching the earth below.',
  'A character discovers something hidden inside a library book.',
  'The morning after a storm — describe the world\'s quiet recovery.',
  'Write about a gift that cannot be wrapped.',
  'Two strangers share an umbrella in the rain.',
  'The sound of a place you miss most.',
  'Begin with: "I wasn\'t supposed to be there that day."',
  'Describe the colour blue to someone who has never seen it.',
  'A map of your heart — what territories exist within it?',
  'Write the story of a single candle burning through the night.',
];

async function fetchWritingPrompt() {
  const el = document.getElementById('prompt-output');
  if (!el) return;
  el.style.opacity = '0.4';
  try {
    const res  = await fetch('https://api.quotable.io/random?tags=inspirational|wisdom&minLength=40&maxLength=140');
    if (!res.ok) throw new Error('fetch failed');
    const data = await res.json();
    // Turn quote into a creative prompt
    el.textContent = `Inspired by: "${data.content}" — ${data.author}`;
  } catch(e) {
    const idx = Math.floor(Math.random() * FALLBACK_PROMPTS.length);
    el.textContent = FALLBACK_PROMPTS[idx];
  }
  el.style.transition = 'opacity .35s';
  el.style.opacity = '1';
}

function insertPromptIntoEditor() {
  const el = document.getElementById('prompt-output');
  if (!el || !el.textContent) { showToast('Generate a prompt first'); return; }
  editor.focus();
  document.execCommand('insertHTML', false,
    `<p><em style="color:rgba(26,26,31,.5)">[Prompt: ${el.textContent}]</em></p><p><br></p>`
  );
  if (typeof updateStats === 'function') updateStats();
  if (typeof triggerSave  === 'function') triggerSave();
  showToast('✓ Prompt inserted');
}

// ── COVER / HERO IMAGE SEARCH ─────────────────────────────────
let coverSearchPage = 1;
let coverSearchTerm = '';

async function searchCoverImages() {
  const inp = document.getElementById('cover-search-input');
  if (!inp) return;
  const term = inp.value.trim() || 'nature writing desk';
  coverSearchTerm = term;
  coverSearchPage = 1;
  await loadCoverImagePage();
}

async function loadCoverImagePage() {
  const grid = document.getElementById('cover-image-grid');
  if (!grid) return;
  grid.innerHTML = '<div class="cover-loading">Searching…</div>';
  try {
    // Picsum provides beautiful random photos; we use seed=term+page for variety
    const seeds = Array.from({ length: 6 }, (_, i) =>
      btoa(coverSearchTerm + coverSearchPage + i).replace(/[^a-z0-9]/gi,'').slice(0, 8)
    );
    const imgs = seeds.map(seed =>
      `https://picsum.photos/seed/${seed}/300/200`
    );
    grid.innerHTML = imgs.map((url, i) =>
      `<div class="cover-img-cell" title="Click to insert">
         <img src="${url}" alt="Cover image ${i+1}" loading="lazy"
              onclick="insertCoverImage('${url}')"
              onerror="this.closest('.cover-img-cell').remove()">
       </div>`
    ).join('');
  } catch(e) {
    grid.innerHTML = '<div class="cover-loading" style="color:#ffaaaa">Failed to load images.</div>';
  }
}

function insertCoverImage(url) {
  editor.focus();
  document.execCommand('insertHTML', false,
    `<img src="${url}" alt="cover image" style="max-width:100%;border-radius:6px;margin:12px 0;display:block"><p><br></p>`
  );
  if (typeof updateStats === 'function') updateStats();
  if (typeof triggerSave  === 'function') triggerSave();
  showToast('✓ Image inserted');
}

// ── AI WRITING COMPANION ──────────────────────────────────────
// Uses OpenAI-compatible API if key is configured; otherwise uses smart offline transforms.

function getAIKey() {
  return localStorage.getItem('inkwell-ai-key') || '';
}

function saveAIKey(key) {
  if (key) {
    localStorage.setItem('inkwell-ai-key', key.trim());
    showToast('✓ API key saved');
  }
}

async function aiTransform(mode) {
  const sel        = window.getSelection();
  const hasSelection = sel && !sel.isCollapsed && editor.contains(sel.anchorNode);
  const text       = hasSelection ? sel.toString().trim() : getPlainText().trim();
  if (!text) { showToast('Select text or write something first'); return; }

  const aiOut = document.getElementById('ai-output');
  if (aiOut) { aiOut.textContent = 'Thinking…'; aiOut.style.opacity = '0.5'; }

  const key    = getAIKey();
  const apiUrl = localStorage.getItem('inkwell-ai-url') || 'https://api.openai.com/v1/chat/completions';
  const model  = localStorage.getItem('inkwell-ai-model') || 'gpt-3.5-turbo';

  const prompts = {
    formal:    `Rewrite the following text in a formal, professional tone. Keep the meaning intact:\n\n${text}`,
    casual:    `Rewrite the following text in a warm, conversational tone:\n\n${text}`,
    poetic:    `Rewrite the following text in a lyrical, poetic style:\n\n${text}`,
    shorter:   `Condense the following text to be shorter while keeping all key ideas:\n\n${text}`,
    longer:    `Expand the following text with more detail and depth:\n\n${text}`,
    grammar:   `Fix grammar and spelling in the following text, changing nothing else:\n\n${text}`,
    summarize: `Summarize the following text in 2-3 sentences:\n\n${text}`,
    bullets:   `Convert the following text into a concise bullet point list:\n\n${text}`,
  };

  const sysPrompt = prompts[mode] || `Improve the following text:\n\n${text}`;

  if (key) {
    // Real AI call
    try {
      const res  = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: 'You are a world-class writing editor helping an author improve their writing. Return ONLY the improved text, nothing else.' },
            { role: 'user',   content: sysPrompt }
          ],
          temperature: 0.7,
          max_tokens: 600,
        }),
      });
      const data   = await res.json();
      const result = data.choices?.[0]?.message?.content?.trim() || '';
      if (aiOut) { aiOut.textContent = result; aiOut.style.opacity = '1'; }
    } catch(e) {
      if (aiOut) { aiOut.textContent = '⚠ API call failed. Check your key/URL and try again.'; aiOut.style.opacity = '1'; }
    }
  } else {
    // Offline intelligent transforms
    const result = offlineAITransform(text, mode);
    if (aiOut) {
      setTimeout(() => { aiOut.textContent = result; aiOut.style.opacity = '1'; }, 600);
    }
  }
}

function offlineAITransform(text, mode) {
  switch(mode) {
    case 'formal':
      return text
        .replace(/\bcan't\b/g,"cannot").replace(/\bwon't\b/g,"will not")
        .replace(/\bdon't\b/g,"do not").replace(/\bisn't\b/g,"is not")
        .replace(/\bI'm\b/g,"I am").replace(/\byou're\b/g,"you are")
        .replace(/\bit's\b/g,"it is").replace(/\bthat's\b/g,"that is")
        .replace(/\bkinda\b/g,"rather").replace(/\bgonna\b/g,"going to")
        .replace(/\bwanna\b/g,"want to").replace(/\bgotta\b/g,"must");
    case 'casual':
      return text
        .replace(/\bcannot\b/g,"can't").replace(/\bwill not\b/g,"won't")
        .replace(/\bdo not\b/g,"don't").replace(/\bis not\b/g,"isn't")
        .replace(/\bI am\b/g,"I'm").replace(/\byou are\b/g,"you're")
        .replace(/\bit is\b/g,"it's").replace(/\bthat is\b/g,"that's");
    case 'shorter': {
      const sents = text.match(/[^.!?]+[.!?]+/g) || [text];
      return sents.filter((_, i) => i % 2 === 0).join(' ').trim();
    }
    case 'bullets': {
      const sents = text.match(/[^.!?]+[.!?]+/g) || [text];
      return sents.map(s => '• ' + s.trim()).join('\n');
    }
    case 'summarize': {
      const sents = text.match(/[^.!?]+[.!?]+/g) || [text];
      return sents.slice(0, Math.min(3, sents.length)).join(' ').trim();
    }
    case 'poetic':
      return text.split('. ').map(s => s.trim()).filter(Boolean).join(',\n') + '.';
    case 'grammar':
      return text.replace(/\s{2,}/g,' ').replace(/([.!?,])\s*/g,'$1 ').trim();
    default:
      return text;
  }
}

function applyAIOutput() {
  const aiOut = document.getElementById('ai-output');
  if (!aiOut || !aiOut.textContent || aiOut.textContent === 'Thinking…') {
    showToast('Generate a result first');
    return;
  }
  editor.focus();
  const sel = window.getSelection();
  if (savedRange) { sel.removeAllRanges(); sel.addRange(savedRange); }
  const hasSelection = sel && !sel.isCollapsed && editor.contains(sel.anchorNode);
  if (hasSelection) {
    document.execCommand('insertText', false, aiOut.textContent);
  } else {
    editor.innerHTML += `<p>${aiOut.textContent.replace(/\n/g,'<br>')}</p>`;
  }
  if (typeof updateStats === 'function') updateStats();
  if (typeof triggerSave  === 'function') triggerSave();
  showToast('✓ Applied to document');
}

// ── WORD FREQUENCY (Datamuse contextual word suggestions) ─────
async function fetchContextualWords() {
  const text  = getPlainText().trim();
  if (!text) return;
  const lastWord = text.split(/\s+/).pop().replace(/[^a-z']/gi,'').toLowerCase();
  if (lastWord.length < 3) return;
  try {
    const res  = await fetch(`https://api.datamuse.com/words?lc=${encodeURIComponent(lastWord)}&max=8`);
    const data = await res.json();
    const cwBox = document.getElementById('contextual-words');
    if (!cwBox || !data.length) return;
    cwBox.innerHTML = data
      .map(d => `<span class="thes-chip" onclick="insertContextWord('${d.word}')" title="Score: ${d.score}">${d.word}</span>`)
      .join('');
  } catch(e) { /* silent fail */ }
}

function insertContextWord(word) {
  editor.focus();
  document.execCommand('insertText', false, ' ' + word);
  if (typeof updateStats === 'function') updateStats();
  if (typeof triggerSave  === 'function') triggerSave();
}

// Debounced trigger on typing
let contextWordTimer = null;
if (editor) {
  editor.addEventListener('input', () => {
    clearTimeout(contextWordTimer);
    contextWordTimer = setTimeout(fetchContextualWords, 1500);
  });
}

// ── INIT: load prompt on startup ──────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  fetchWritingPrompt();
});
// Fallback if DOMContentLoaded already fired
if (document.readyState !== 'loading') {
  fetchWritingPrompt();
}
