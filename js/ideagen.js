/* ═══════════════════════════════════════════════════════════════
   js/ideagen.js — Plot Twist & Conflict Idea Generator
   Fully offline — combines local word banks, no API needed.
   ═══════════════════════════════════════════════════════════════ */

const IDEA_TWISTS = [
  'the trusted ally has been working for the antagonist all along',
  'the narrator has been unreliable — key events happened differently',
  'the mentor figure faked their own death years ago',
  'the "villain" was trying to prevent a worse outcome the whole time',
  'the protagonist and antagonist are related by blood',
  'the object everyone is searching for was destroyed at the very start',
  'the safe haven is actually the source of the danger',
  'a minor character has been secretly manipulating events from the shadows',
  'the hero\'s greatest victory actually caused the central problem',
  'time is not moving the way the reader assumed',
  'the love interest is a spy sent to gather information',
  'the disaster was engineered, not accidental',
  'the protagonist has been dead the entire story',
  'the map/clue/prophecy was deliberately falsified generations ago',
  'the sidekick is the true chosen one, not the protagonist'
];

const IDEA_CONFLICTS = [
  'two characters want the same outcome but for opposite reasons',
  'a promise made in good faith becomes impossible to keep',
  'loyalty to a friend conflicts directly with loyalty to a cause',
  'the only way to save one person dooms a hundred others',
  'a character must publicly denounce something they privately believe',
  'the truth would destroy someone the protagonist loves',
  'success requires becoming the thing the protagonist has always opposed',
  'a character discovers their life\'s work was built on a lie',
  'two allies discover they are competing for the same limited resource',
  'a character must choose between duty and personal happiness'
];

const IDEA_SETTINGS = [
  'a city built on the back of a sleeping, ancient creature',
  'a research station where the last message was sent a year in the future',
  'a small town where every resident shares the same recurring dream',
  'a library where reading a book erases it from existence',
  'a train that never stops and has no visible end',
  'a coastal village that vanishes at high tide and returns at dawn',
  'a courtroom where the judge is the only one who remembers the crime',
  'a wedding where the officiant refuses to say the vows are binding',
  'an archive of letters never delivered, opened only after their authors die',
  'a border checkpoint between two versions of the same country'
];

const IDEA_PROMPTS = [
  'Write the scene where a character realizes they were wrong about everything.',
  'Two characters have the same argument they\'ve had a hundred times, but this time something is different.',
  'A character finds a letter addressed to them, written by someone who shouldn\'t know they exist.',
  'Someone keeps a promise long after it stopped making sense to keep it.',
  'A character has to explain a decision they can\'t actually justify.',
  'Write the last five minutes before a character crosses a point of no return.',
  'A reunion where both people have rehearsed what they\'d say, and neither uses it.',
  'Someone discovers a version of themselves they don\'t recognize in an old photo or recording.',
  'A character is given exactly what they asked for, and it is a disaster.',
  'Write a goodbye that neither character is willing to call a goodbye.'
];

function idPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function generateStoryIdea() {
  const out = document.getElementById('idea-output');
  if (!out) return;

  const twist    = idPick(IDEA_TWISTS);
  const conflict = idPick(IDEA_CONFLICTS);
  const setting  = idPick(IDEA_SETTINGS);
  const prompt   = idPick(IDEA_PROMPTS);

  out.innerHTML = `
    <div class="idea-card">
      <div class="idea-label">Plot Twist</div>
      <div class="idea-text">What if ${twist}?</div>
    </div>
    <div class="idea-card">
      <div class="idea-label">Core Conflict</div>
      <div class="idea-text">${conflict[0].toUpperCase() + conflict.slice(1)}.</div>
    </div>
    <div class="idea-card">
      <div class="idea-label">Setting Seed</div>
      <div class="idea-text">${setting[0].toUpperCase() + setting.slice(1)}.</div>
    </div>
    <div class="idea-card">
      <div class="idea-label">Scene Prompt</div>
      <div class="idea-text">${prompt}</div>
    </div>
  `;
  out.dataset.lastIdea = `Plot Twist: What if ${twist}?\nCore Conflict: ${conflict}.\nSetting Seed: ${setting}.\nScene Prompt: ${prompt}`;
}

function insertStoryIdeaIntoEditor() {
  const out = document.getElementById('idea-output');
  if (!out || !out.dataset.lastIdea) { showToast('Generate an idea first'); return; }
  if (typeof editor === 'undefined' || !editor) return;

  editor.focus();
  const block = document.createElement('div');
  block.innerHTML = out.dataset.lastIdea
    .split('\n')
    .map(line => `<div>${line}</div>`)
    .join('') + '<div><br></div>';

  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0 && editor.contains(sel.anchorNode)) {
    const range = sel.getRangeAt(0);
    range.collapse(false);
    range.insertNode(block);
  } else {
    editor.appendChild(block);
  }
  showToast('Idea inserted into editor');
}

// ── STYLES ────────────────────────────────────────────────────
(function injectIdeaStyles() {
  if (document.getElementById('idea-styles')) return;
  const s = document.createElement('style');
  s.id = 'idea-styles';
  s.textContent = `
    .idea-card { background:var(--bg2,#f4f4f4); border-radius:8px; padding:8px 10px; margin-bottom:6px; }
    .idea-label { font-size:.68rem; font-weight:700; letter-spacing:.05em; text-transform:uppercase; color:var(--accent,#557aaa); margin-bottom:2px; }
    .idea-text { font-size:.82rem; line-height:1.35; }
    .idea-actions { display:flex; gap:8px; margin-top:8px; }
    .idea-actions .mini-btn { flex:1; }
  `;
  document.head.appendChild(s);
})();
