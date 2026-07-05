/* ═══════════════════════════════════════════════════════════════
   js/characters.js — Character Name Generator & Character Sheet Builder
   Uses local name pools + randomization. Character sheets saved in localStorage.
   ═══════════════════════════════════════════════════════════════ */

const CHAR_STORAGE_KEY = 'inkwell-characters';

// ── NAME POOLS ────────────────────────────────────────────────
const NAME_DATA = {
  fantasy: {
    first: ['Aelindra','Bran','Caelith','Dorin','Elowen','Faelor','Galwen','Hazel',
            'Isenor','Jorn','Kaelith','Lirien','Marek','Nadir','Oryn','Petra',
            'Quen','Rhovan','Seren','Thalor','Ulric','Vaya','Wren','Xira','Yvaine','Zephyr'],
    last:  ['Ashwood','Blackthorn','Coldwater','Dawnseeker','Emberveil','Frostmere',
            'Grimhold','Highwatch','Ironvale','Jadecroft','Kindlemoor','Lightweaver',
            'Moonshard','Nighthollow','Oakhurst','Pinecrest','Quicksilver','Ravenmist',
            'Stonecliff','Thornwall','Underhill','Voidwalker','Wolfsbane','Yearwood'],
  },
  scifi: {
    first: ['Ari','Bex','Cael','Dex','Echo','Fern','Grix','Halo','Ion','Jett',
            'Kael','Lux','Mira','Nyx','Orbit','Pax','Quill','Rix','Sol','Taz',
            'Umi','Vex','Wren','Xen','Yara','Zion'],
    last:  ['Aldric','Bastion','Centurion','Dawnport','Eclipse','Forge','Grav','Hatch',
            'Iridian','Jolt','Kova','Lycanth','Matrix','Nova','Oblique','Proton',
            'Quantix','Relay','Solaris','Terra','Umbral','Vertex','Weave','Xenith'],
  },
  historical: {
    first: ['Agnes','Baldwin','Cecily','Duncan','Eleanor','Frederick','Gwendolyn',
            'Harold','Isolde','John','Katherine','Lionel','Margaret','Nicholas',
            'Oswald','Philippa','Quentin','Rowena','Sylvester','Thomasin',
            'Ursula','Vivienne','Walter','Xenia','Ysabel','Zacharias'],
    last:  ['Blackwood','Cavendish','Dunmore','Eastham','Fairfax','Grenville',
            'Hartley','Ingram','Jenkinson','Kingsley','Lovell','Montague',
            'Norwood','Osgood','Pemberton','Quinby','Radcliffe','Sommerset',
            'Thornton','Upton','Vane','Wentworth','Yarborough'],
  },
  modern: {
    first: ['Alex','Blake','Casey','Drew','Elliott','Finley','Gray','Harper',
            'Indigo','Jordan','Kai','Logan','Morgan','Noah','Oakley','Parker',
            'Quinn','Reese','Sage','Taylor','Uma','Val','West','Xander','Yael','Zoe'],
    last:  ['Anderson','Brooks','Clarke','Davis','Evans','Foster','Grant','Hayes',
            'Irving','Jensen','Knox','Lawson','Mills','Nash','Owen','Pierce',
            'Quinn','Reed','Sawyer','Torres','Underwood','Vega','Walsh','Xavier'],
  },
};

const TRAITS_POSITIVE = ['ambitious','brave','charismatic','compassionate','curious',
  'determined','empathetic','honest','imaginative','loyal','perceptive','resilient',
  'resourceful','sincere','witty'];

const TRAITS_NEGATIVE = ['arrogant','bitter','cynical','deceptive','envious',
  'hot-headed','impatient','insecure','manipulative','paranoid','reckless',
  'stubborn','suspicious','vengeful','withdrawn'];

const MOTIVATIONS = ['seeking redemption','protecting loved ones','pursuing justice',
  'craving power','longing for belonging','running from the past',
  'driven by curiosity','searching for truth','preserving a legacy',
  'proving themselves','surviving at any cost','seeking forgiveness'];

const FLAWS = ['haunted by guilt','distrustful of authority','self-sabotages when close to success',
  'overconfident in their abilities','hides vulnerability behind humor',
  'puts others first to avoid their own problems','unable to ask for help',
  'obsessed with control','prone to jealousy','holds on to grudges'];

// ── UTILITIES ─────────────────────────────────────────────────
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function pickN(arr, n) {
  const copy = [...arr];
  const out  = [];
  for (let i = 0; i < Math.min(n, copy.length); i++) {
    const idx = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

// ── GENERATE NAME ─────────────────────────────────────────────
function generateCharacterName() {
  const genre = document.getElementById('char-genre')?.value || 'fantasy';
  const pool  = NAME_DATA[genre] || NAME_DATA.fantasy;
  const first = pick(pool.first);
  const last  = pick(pool.last);
  const nameOut = document.getElementById('char-name-result');
  if (nameOut) nameOut.textContent = `${first} ${last}`;
  return `${first} ${last}`;
}

// ── GENERATE FULL CHARACTER ───────────────────────────────────
function generateFullCharacter() {
  const name        = generateCharacterName();
  const positive    = pickN(TRAITS_POSITIVE, 2);
  const negative    = pickN(TRAITS_NEGATIVE, 1);
  const motivation  = pick(MOTIVATIONS);
  const flaw        = pick(FLAWS);
  const ages        = [16,19,22,25,28,32,38,45,52,60];
  const age         = pick(ages);

  const out = document.getElementById('char-sheet-preview');
  if (!out) return;

  out.innerHTML = `
    <div class="char-sheet">
      <div class="char-sheet-name">${name}</div>
      <div class="char-sheet-row"><span class="char-label">Age</span><span>${age}</span></div>
      <div class="char-sheet-row"><span class="char-label">Strengths</span><span>${positive.join(', ')}</span></div>
      <div class="char-sheet-row"><span class="char-label">Weakness</span><span>${negative[0]}</span></div>
      <div class="char-sheet-row"><span class="char-label">Motivation</span><span>${motivation}</span></div>
      <div class="char-sheet-row"><span class="char-label">Core Flaw</span><span>${flaw}</span></div>
    </div>
    <div class="char-sheet-actions">
      <button class="snip-btn snip-insert" onclick="insertCharacterSheet('${name}',${age},'${positive.join('&')}','${negative[0]}','${motivation}','${flaw}')">Insert into editor</button>
      <button class="snip-btn" onclick="saveCharacterSheet('${name}',${age},'${positive.join('&')}','${negative[0]}','${motivation}','${flaw}')">Save character</button>
    </div>
  `;
}

// ── INSERT INTO EDITOR ────────────────────────────────────────
function insertCharacterSheet(name, age, posStr, neg, motivation, flaw) {
  const positive = posStr.split('&');
  const text = `${name}\nAge: ${age}\nStrengths: ${positive.join(', ')}\nWeakness: ${neg}\nMotivation: ${motivation}\nFlaw: ${flaw}\n`;
  if (typeof editor === 'undefined') return;
  editor.focus();
  document.execCommand('insertText', false, text);
  if (typeof updateStats === 'function') updateStats();
  showToast(`✓ Inserted character sheet for ${name}`);
}

// ── SAVE CHARACTER ────────────────────────────────────────────
function saveCharacterSheet(name, age, posStr, neg, motivation, flaw) {
  const chars = loadCharacters();
  const id    = Date.now();
  chars.push({ id, name, age, traits: posStr.split('&'), weakness: neg, motivation, flaw });
  localStorage.setItem(CHAR_STORAGE_KEY, JSON.stringify(chars));
  renderSavedCharacters();
  showToast(`✓ "${name}" saved to your cast`);
}

function loadCharacters() {
  try {
    return JSON.parse(localStorage.getItem(CHAR_STORAGE_KEY) || '[]');
  } catch { return []; }
}

// ── RENDER SAVED CHARACTERS ───────────────────────────────────
function renderSavedCharacters() {
  const out = document.getElementById('char-saved-list');
  if (!out) return;
  const chars = loadCharacters();
  if (!chars.length) {
    out.innerHTML = `<div class="wf-empty">No characters saved yet.</div>`;
    return;
  }
  out.innerHTML = chars.map(c => `
    <div class="char-saved-item">
      <div class="char-saved-name">${c.name} <em style="font-weight:400;color:var(--muted,#888)">age ${c.age}</em></div>
      <div class="char-saved-traits">${c.traits?.join(', ')} · ${c.weakness}</div>
      <button class="snip-btn snip-delete" onclick="deleteCharacter(${c.id})">✕</button>
    </div>
  `).join('');
}

function deleteCharacter(id) {
  const chars = loadCharacters().filter(c => c.id !== id);
  localStorage.setItem(CHAR_STORAGE_KEY, JSON.stringify(chars));
  renderSavedCharacters();
}

// ── INJECT STYLES ─────────────────────────────────────────────
(function injectCharStyles() {
  if (document.getElementById('char-styles')) return;
  const s = document.createElement('style');
  s.id = 'char-styles';
  s.textContent = `
    .char-sheet { background:var(--bg2,#f9f9f9); border-radius:8px; padding:10px 12px; margin-bottom:8px; border:1px solid var(--border,#e0e0e0); }
    .char-sheet-name { font-size:1.05rem; font-weight:700; margin-bottom:8px; color:var(--accent,#557); }
    .char-sheet-row { display:flex; gap:8px; font-size:.82rem; padding:2px 0; }
    .char-label { min-width:80px; color:var(--muted,#888); font-weight:600; flex-shrink:0; }
    .char-sheet-actions { display:flex; gap:6px; }
    .char-saved-item { display:flex; align-items:flex-start; gap:6px; padding:5px 0; border-bottom:1px solid var(--border,#eee); }
    .char-saved-item:last-child { border-bottom:none; }
    .char-saved-name { font-size:.85rem; font-weight:600; flex:1; }
    .char-saved-traits { font-size:.76rem; color:var(--muted,#888); flex:2; }
    #char-name-result { font-size:1.1rem; font-weight:700; color:var(--accent,#557); display:block; margin:6px 0 8px; min-height:1.4em; }
  `;
  document.head.appendChild(s);
})();

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderSavedCharacters();
});
