/* ═══════════════════════════════════════════════════════════════
   js/rhyme.js — Poetry, Rhyme & Word Association Assistant (Datamuse API)
   ═══════════════════════════════════════════════════════════════ */

async function searchRhymes() {
  const inp  = document.getElementById('rhyme-input');
  const out  = document.getElementById('rhyme-output');
  const type = document.getElementById('rhyme-type')?.value || 'rel_rhy';
  if (!inp || !out) return;

  const word = inp.value.trim().toLowerCase().replace(/[^a-z']/g, '');
  if (!word) {
    showToast('Enter a word to search');
    return;
  }

  out.innerHTML = `<div class="rhyme-loading">Searching Datamuse...</div>`;

  try {
    const url = `https://api.datamuse.com/words?${type}=${encodeURIComponent(word)}&max=30`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('API failure');
    const data = await res.json();

    if (!data.length) {
      out.innerHTML = `<div class="rhyme-empty">No results found for "<em>${word}</em>".</div>`;
      return;
    }

    // Sort by score/frequency if applicable
    data.sort((a, b) => b.score - a.score);

    out.innerHTML = `
      <div class="rhyme-results-header">Results for "${word}" (${data.length}):</div>
      <div class="rhyme-list">
        ${data.map(d => `
          <span class="rhyme-chip" onclick="insertRhymeWord('${d.word}')" title="Syllables: ${d.numSyllables || '?'} | Score: ${d.score}">
            ${d.word}
            ${d.numSyllables ? `<span class="rhyme-syl">${d.numSyllables}</span>` : ''}
          </span>
        `).join('')}
      </div>
      <div class="rhyme-footer">Click any word to insert it into the editor.</div>
    `;
  } catch (e) {
    out.innerHTML = `<div class="rhyme-error">Error connecting to Datamuse API. Please try again.</div>`;
  }
}

function insertRhymeWord(word) {
  if (typeof editor === 'undefined') return;
  editor.focus();
  document.execCommand('insertText', false, word);
  if (typeof updateStats === 'function') updateStats();
  if (typeof triggerSave === 'function') triggerSave();
  showToast(`✓ Inserted "${word}"`);
}

function searchSelectedWordForRhymes() {
  const sel = window.getSelection();
  const word = sel ? sel.toString().trim().toLowerCase().replace(/[^a-z']/g, '') : '';
  if (!word) {
    showToast('Select a word in the editor first');
    return;
  }
  const inp = document.getElementById('rhyme-input');
  if (inp) {
    inp.value = word;
    searchRhymes();
    // Switch to rhyme tab/panel
    jumpToSection('ep-poetry');
  }
}
