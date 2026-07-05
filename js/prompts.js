/* ═══════════════════════════════════════════════════════════════
   js/prompts.js — Writing Prompt Generator
   Generates random story/essay prompts by genre, plus saved favorites.
   ═══════════════════════════════════════════════════════════════ */

const PROMPTS_FAV_KEY = 'inkwell-prompt-favs';

const PROMPT_BANK = {
  fantasy: [
    "A librarian discovers that one book in the archive rewrites itself each night.",
    "The last dragon isn't a beast — it's a title passed down through an unlikely family.",
    "A map only reveals new roads when the holder tells the truth.",
    "An apprentice mage accidentally binds their shadow to a stranger's.",
    "A kingdom's peace treaty requires a hostage who turns out to be a god in disguise.",
    "Someone inherits a garden where every flower is a memory that isn't theirs.",
  ],
  scifi: [
    "The last human colony ship receives a distress signal in a language nobody has heard before.",
    "An AI tasked with preserving humanity's culture starts editing history for its own reasons.",
    "A terraforming crew wakes early from cryosleep to find the planet already inhabited — by future versions of themselves.",
    "A city runs on a shared dream network, and someone starts sabotaging it from inside.",
    "Two rival scientists are forced to cooperate after their memories are accidentally swapped.",
    "A repair technician on a generation ship discovers the ship never actually left orbit.",
  ],
  mystery: [
    "A detective's only witness is a parrot that repeats the murderer's last words.",
    "Every year, one resident of a small town vanishes for exactly one day and returns with no memory of it.",
    "A locked-room mystery where the only clue is a half-finished letter addressed to the investigator.",
    "A forensic accountant finds a decades-old embezzlement scheme hidden inside a children's book.",
    "The alibi checks out for everyone in the house — except the house itself.",
    "A cold case reopens when the 'victim' is spotted alive at their own memorial.",
  ],
  romance: [
    "Two rival food-truck owners are forced to share a single generator during a blackout festival.",
    "A wedding planner falls for the groom's best friend three weddings in a row — same friend, different weddings.",
    "Strangers keep leaving notes in the same library book across a decade.",
    "An arranged marriage of convenience between two people who each have a secret they're keeping to protect the other.",
    "A ghostwriter falls for the client whose memoir she's secretly writing.",
    "Childhood pen pals reunite as adults without realizing they're already dating.",
  ],
  literary: [
    "Write about the last ordinary day before everything changed — without naming what changed.",
    "A character returns to their childhood home to find it exactly the same, and that's the horror of it.",
    "Two siblings inherit their parents' unfinished arguments along with the house.",
    "Someone spends a year writing letters they never intend to send.",
    "A retired translator realizes they've been mistranslating one word their entire career.",
    "Write a story that takes place entirely during a single commute, and it changes someone's life.",
  ],
  horror: [
    "Every mirror in the house shows the room five seconds in the future.",
    "A family tradition insists on setting a place at the table for a relative no one remembers.",
    "A children's rhyme accurately predicts each town death, one verse at a time.",
    "Something in the walls has learned to imitate the sound of your own footsteps.",
    "A lighthouse keeper's logbook contains entries dated a month after they went missing.",
    "The photographs of the family reunion show one extra person in every shot — never the same person twice.",
  ],
  essay: [
    "Write about a rule you followed for years before questioning why it existed.",
    "Describe an object that has quietly outlived its original purpose in your life.",
    "Reflect on a piece of advice that turned out to be exactly wrong for you.",
    "Write about the last time you changed your mind about something important.",
    "Describe a place that shaped you more than any person did.",
    "Reflect on a skill you were once proud of and have since let go.",
  ],
};

function _promptsLoadFavs() {
  try { return JSON.parse(localStorage.getItem(PROMPTS_FAV_KEY) || '[]'); }
  catch { return []; }
}
function _promptsSaveFavs(favs) {
  localStorage.setItem(PROMPTS_FAV_KEY, JSON.stringify(favs));
}

let _lastPrompt = null;

function generateWritingPrompt() {
  const genre = document.getElementById('prompt-genre')?.value || 'fantasy';
  const bank = PROMPT_BANK[genre] || PROMPT_BANK.fantasy;
  const choice = bank[Math.floor(Math.random() * bank.length)];
  _lastPrompt = { text: choice, genre };
  renderPromptResult();
}

function renderPromptResult() {
  const el = document.getElementById('prompt-result');
  if (!el) return;
  if (!_lastPrompt) {
    el.innerHTML = '<div style="opacity:.4;font-size:.8rem;text-align:center;padding:8px">Click Generate to get a prompt.</div>';
    return;
  }
  el.innerHTML = `
    <div style="background:rgba(255,255,255,.05);border-left:3px solid #c9a84c;border-radius:4px;padding:12px;font-family:'Lora',serif;font-style:italic;font-size:.9rem;line-height:1.5">
      "${_lastPrompt.text}"
    </div>
    <div style="display:flex;gap:6px;margin-top:8px">
      <button class="mini-btn" style="flex:1" onclick="insertPromptToEditor()">→ Insert into Editor</button>
      <button class="mini-btn" style="flex:1" onclick="savePromptFavorite()">★ Save</button>
    </div>
  `;
}

function insertPromptToEditor() {
  if (!_lastPrompt || !editor) return;
  editor.focus();
  document.execCommand('insertText', false, _lastPrompt.text + ' ');
  if (typeof showToast === 'function') showToast('Prompt inserted ✓');
}

function savePromptFavorite() {
  if (!_lastPrompt) return;
  const favs = _promptsLoadFavs();
  if (favs.some(f => f.text === _lastPrompt.text)) {
    if (typeof showToast === 'function') showToast('Already saved');
    return;
  }
  favs.unshift({ ..._lastPrompt, id: Date.now() });
  _promptsSaveFavs(favs.slice(0, 40));
  renderPromptFavorites();
  if (typeof showToast === 'function') showToast('Prompt saved to favorites ★');
}

function deletePromptFavorite(id) {
  const favs = _promptsLoadFavs().filter(f => f.id !== id);
  _promptsSaveFavs(favs);
  renderPromptFavorites();
}

function renderPromptFavorites() {
  const el = document.getElementById('prompt-favorites');
  if (!el) return;
  const favs = _promptsLoadFavs();
  if (!favs.length) {
    el.innerHTML = '<div style="opacity:.35;font-size:.75rem;text-align:center;padding:6px">No saved prompts yet.</div>';
    return;
  }
  el.innerHTML = favs.map(f => `
    <div style="display:flex;justify-content:space-between;gap:6px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06)">
      <span style="font-size:.78rem;flex:1">${f.text}</span>
      <button class="mini-btn" style="padding:2px 6px;font-size:.68rem" onclick="deletePromptFavorite(${f.id})">✕</button>
    </div>
  `).join('');
}

function renderPromptsPanel() {
  renderPromptResult();
  renderPromptFavorites();
}

document.addEventListener('DOMContentLoaded', () => {
  if (typeof renderPromptsPanel === 'function') renderPromptsPanel();
});
