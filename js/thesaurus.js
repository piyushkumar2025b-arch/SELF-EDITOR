/* ═══════════════════════════════════════════════════════════════
   js/thesaurus.js — Offline Thesaurus Utility
   ═══════════════════════════════════════════════════════════════ */

const THESAURUS = {
  happy: ['joyful','cheerful','glad','content','delighted'],
  sad: ['sorrowful','downcast','unhappy','melancholy','gloomy'],
  big: ['large','huge','immense','substantial','massive'],
  small: ['tiny','little','compact','modest','minute'],
  good: ['fine','excellent','admirable','superb','pleasant'],
  bad: ['poor','unpleasant','inferior','substandard','dreadful'],
  beautiful: ['lovely','gorgeous','stunning','elegant','exquisite'],
  strong: ['powerful','sturdy','robust','forceful','resilient'],
  fast: ['quick','swift','rapid','speedy','brisk'],
  slow: ['sluggish','gradual','unhurried','leisurely','plodding'],
  important: ['significant','crucial','vital','essential','notable'],
  beautiful2: [],
  interesting: ['fascinating','intriguing','engaging','compelling','absorbing'],
  said: ['stated','remarked','declared','mentioned','expressed'],
  walk: ['stroll','stride','amble','march','wander'],
  look: ['gaze','glance','observe','peer','stare'],
  think: ['believe','consider','ponder','reflect','reckon'],
  begin: ['commence','start','initiate','launch','embark'],
  end: ['conclude','finish','terminate','wrap up','cease'],
  clear: ['obvious','evident','transparent','plain','lucid'],
  difficult: ['hard','challenging','arduous','tough','demanding'],
  easy: ['simple','effortless','straightforward','uncomplicated','manageable'],
  angry: ['furious','irritated','annoyed','enraged','indignant'],
  quiet: ['silent','still','hushed','tranquil','serene'],
  bright: ['radiant','luminous','vivid','brilliant','gleaming'],
  dark: ['dim','shadowy','murky','gloomy','pitch-black'],
  old: ['ancient','aged','vintage','elderly','antiquated'],
  new: ['fresh','recent','novel','modern','contemporary'],
  love: ['adore','cherish','treasure','admire','fancy'],
  hate: ['despise','loathe','detest','abhor','resent']
};

function showThesaurusForSelection(evt) {
  const sel = window.getSelection();
  let word = sel && sel.toString().trim().toLowerCase().replace(/[^a-z']/g, '');
  const pop = document.getElementById('thesaurus-popover');
  if (!pop) return;
  if (!word) {
    pop.innerHTML = `<div class="thes-empty">Select a single word in the text, then click this button.</div>`;
  } else {
    const synonyms = THESAURUS[word];
    if (synonyms && synonyms.length) {
      if (typeof saveSelectionRange === 'function') saveSelectionRange();
      pop.innerHTML = `<div class="thes-word">${word}</div><div class="thes-list">${synonyms.map(s => `<span class="thes-chip" onclick="applyThesaurusWord('${s}')">${s}</span>`).join('')}</div>`;
    } else {
      pop.innerHTML = `<div class="thes-word">${word}</div><div class="thes-empty">No synonyms found in the built-in thesaurus for this word.</div>`;
    }
  }
  const rect = evt.currentTarget.getBoundingClientRect();
  pop.style.left = Math.min(window.innerWidth - 240, rect.right + 8) + 'px';
  pop.style.top = Math.min(window.innerHeight - 140, rect.top) + 'px';
  pop.classList.add('show');
}
