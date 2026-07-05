/* ═══════════════════════════════════════════════════════════════
   js/worldbuilding.js — World-Building Generator
   Generates fictional locations, factions, and artifacts, and lets
   the writer save them to a persistent "world bible".
   ═══════════════════════════════════════════════════════════════ */

const WORLD_KEY = 'inkwell-world-bible';

const WB_LOCATION_PREFIX = ['Vel', 'Kar', 'Thal', 'Or', 'Nym', 'Bel', 'Sar', 'Dun', 'Isk', 'Wyn'];
const WB_LOCATION_SUFFIX = ['mouth', 'hold', 'reach', 'spire', 'haven', 'gate', 'fell', 'crest', 'moor', 'thorpe'];
const WB_LOCATION_TYPES  = ['a fog-bound port city', 'a walled mountain citadel', 'a sprawling desert bazaar',
  'a half-sunken ruin', 'a floating market town', 'a monastery carved into a cliff',
  'a frontier trading post', 'a city built atop the bones of a dead titan'];

const WB_FACTION_ADJ  = ['Silent', 'Iron', 'Hollow', 'Gilded', 'Broken', 'Veiled', 'Ashen', 'Wandering', 'Crimson', 'Last'];
const WB_FACTION_NOUN = ['Order', 'Compact', 'Cartel', 'Circle', 'Guard', 'Choir', 'Syndicate', 'Covenant', 'Brotherhood', 'Assembly'];
const WB_FACTION_GOAL = [
  'seeks to control the flow of information across the realm',
  'believes the old gods will return and prepares in secret',
  'trades in forbidden knowledge for a price',
  'protects a secret that would collapse the current order',
  'is slowly buying up the region one debt at a time',
  'guards a border no map acknowledges',
];

const WB_ARTIFACT_ADJ = ['Whispering', 'Frozen', 'Unfinished', 'Bound', 'Weeping', 'Hollow', 'Everburning', 'Silent'];
const WB_ARTIFACT_NOUN = ['Crown', 'Ledger', 'Blade', 'Mirror', 'Bell', 'Compass', 'Lantern', 'Key'];
const WB_ARTIFACT_PROP = [
  'shows the truest desire of whoever looks into it',
  'cannot be destroyed, only passed on',
  'grows heavier the more lies are told near it',
  'was forged from a promise no one remembers making',
  'hums when someone nearby is about to die',
  'only works for someone who has lost something irreplaceable',
];

function _wbRand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function _wbLoad() {
  try { return JSON.parse(localStorage.getItem(WORLD_KEY) || '[]'); }
  catch { return []; }
}
function _wbSave(entries) {
  localStorage.setItem(WORLD_KEY, JSON.stringify(entries));
}

let _wbLast = null;

function generateWorldElement() {
  const kind = document.getElementById('wb-kind')?.value || 'location';
  let entry;

  if (kind === 'location') {
    const name = _wbRand(WB_LOCATION_PREFIX) + _wbRand(WB_LOCATION_SUFFIX);
    entry = { kind, name, detail: `${name} is ${_wbRand(WB_LOCATION_TYPES)}.` };
  } else if (kind === 'faction') {
    const name = `The ${_wbRand(WB_FACTION_ADJ)} ${_wbRand(WB_FACTION_NOUN)}`;
    entry = { kind, name, detail: `${name} ${_wbRand(WB_FACTION_GOAL)}.` };
  } else {
    const name = `The ${_wbRand(WB_ARTIFACT_ADJ)} ${_wbRand(WB_ARTIFACT_NOUN)}`;
    entry = { kind, name, detail: `${name} ${_wbRand(WB_ARTIFACT_PROP)}.` };
  }

  _wbLast = entry;
  renderWorldResult();
}

function renderWorldResult() {
  const el = document.getElementById('wb-result');
  if (!el) return;
  if (!_wbLast) {
    el.innerHTML = '<div style="opacity:.4;font-size:.78rem;text-align:center;padding:8px">Click Generate to create a location, faction, or artifact.</div>';
    return;
  }
  el.innerHTML = `
    <div style="background:rgba(255,255,255,.05);border-radius:6px;padding:10px">
      <div style="font-weight:700;color:#c9a84c;font-size:.9rem;margin-bottom:4px">${_wbLast.name}</div>
      <div style="font-size:.8rem;line-height:1.4;opacity:.85">${_wbLast.detail}</div>
    </div>
    <button class="mini-btn" style="width:100%;margin-top:8px" onclick="saveWorldElement()">＋ Add to World Bible</button>
  `;
}

function saveWorldElement() {
  if (!_wbLast) return;
  const entries = _wbLoad();
  entries.unshift({ ..._wbLast, id: Date.now() });
  _wbSave(entries);
  renderWorldBible();
  if (typeof showToast === 'function') showToast('Added to world bible ✓');
}

function deleteWorldElement(id) {
  _wbSave(_wbLoad().filter(e => e.id !== id));
  renderWorldBible();
}

const WB_KIND_ICON = { location: '🗺️', faction: '⚔️', artifact: '🔮' };

function renderWorldBible() {
  const el = document.getElementById('wb-bible-list');
  if (!el) return;
  const entries = _wbLoad();
  if (!entries.length) {
    el.innerHTML = '<div style="opacity:.35;font-size:.75rem;text-align:center;padding:6px">Your world bible is empty.</div>';
    return;
  }
  el.innerHTML = entries.map(e => `
    <div style="display:flex;justify-content:space-between;gap:6px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06)">
      <div style="font-size:.78rem;flex:1"><strong>${WB_KIND_ICON[e.kind] || ''} ${e.name}</strong><br><span style="opacity:.65">${e.detail}</span></div>
      <button class="mini-btn" style="padding:2px 6px;font-size:.65rem;height:fit-content" onclick="deleteWorldElement(${e.id})">✕</button>
    </div>
  `).join('');
}

function renderWorldbuildingPanel() {
  renderWorldResult();
  renderWorldBible();
}

document.addEventListener('DOMContentLoaded', () => {
  if (typeof renderWorldbuildingPanel === 'function') renderWorldbuildingPanel();
});
