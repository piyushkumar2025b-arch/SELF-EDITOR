// ── TRANSLATOR (offline word-match + optional API fallback) ──

const MINI_DICT = {
  es: { the:'el', and:'y', love:'amor', life:'vida', hope:'esperanza', friend:'amigo', beautiful:'hermoso', strong:'fuerte', heart:'corazón', dream:'sueño', water:'agua', fire:'fuego', light:'luz', dark:'oscuro', good:'bueno', bad:'malo', time:'tiempo', world:'mundo', truth:'verdad', peace:'paz' },
  fr: { the:'le', and:'et', love:'amour', life:'vie', hope:'espoir', friend:'ami', beautiful:'beau', strong:'fort', heart:'cœur', dream:'rêve', water:'eau', fire:'feu', light:'lumière', dark:'sombre', good:'bon', bad:'mauvais', time:'temps', world:'monde', truth:'vérité', peace:'paix' },
  de: { the:'die', and:'und', love:'liebe', life:'leben', hope:'hoffnung', friend:'freund', beautiful:'schön', strong:'stark', heart:'herz', dream:'traum', water:'wasser', fire:'feuer', light:'licht', dark:'dunkel', good:'gut', bad:'schlecht', time:'zeit', world:'welt', truth:'wahrheit', peace:'frieden' },
  hi: { the:'', and:'और', love:'प्यार', life:'ज़िंदगी', hope:'आशा', friend:'दोस्त', beautiful:'सुंदर', strong:'मजबूत', heart:'दिल', dream:'सपना', water:'पानी', fire:'आग', light:'रोशनी', dark:'अंधेरा', good:'अच्छा', bad:'बुरा', time:'समय', world:'दुनिया', truth:'सत्य', peace:'शांति' },
  ja: { the:'', and:'と', love:'愛', life:'人生', hope:'希望', friend:'友達', beautiful:'美しい', strong:'強い', heart:'心', dream:'夢', water:'水', fire:'火', light:'光', dark:'暗い', good:'良い', bad:'悪い', time:'時間', world:'世界', truth:'真実', peace:'平和' },
  zh: { the:'', and:'和', love:'爱', life:'生活', hope:'希望', friend:'朋友', beautiful:'美丽', strong:'坚强', heart:'心', dream:'梦想', water:'水', fire:'火', light:'光', dark:'黑暗', good:'好', bad:'坏', time:'时间', world:'世界', truth:'真理', peace:'和平' },
  ar: { the:'', and:'و', love:'حب', life:'حياة', hope:'أمل', friend:'صديق', beautiful:'جميل', strong:'قوي', heart:'قلب', dream:'حلم', water:'ماء', fire:'نار', light:'ضوء', dark:'مظلم', good:'جيد', bad:'سيء', time:'وقت', world:'عالم', truth:'حقيقة', peace:'سلام' },
  ru: { the:'', and:'и', love:'любовь', life:'жизнь', hope:'надежда', friend:'друг', beautiful:'красивый', strong:'сильный', heart:'сердце', dream:'мечта', water:'вода', fire:'огонь', light:'свет', dark:'темный', good:'хороший', bad:'плохой', time:'время', world:'мир', truth:'правда', peace:'мир' },
  pt: { the:'o', and:'e', love:'amor', life:'vida', hope:'esperança', friend:'amigo', beautiful:'bonito', strong:'forte', heart:'coração', dream:'sonho', water:'água', fire:'fogo', light:'luz', dark:'escuro', good:'bom', bad:'ruim', time:'tempo', world:'mundo', truth:'verdade', peace:'paz' },
  it: { the:'il', and:'e', love:'amore', life:'vita', hope:'speranza', friend:'amico', beautiful:'bello', strong:'forte', heart:'cuore', dream:'sogno', water:'acqua', fire:'fuoco', light:'luce', dark:'buio', good:'buono', bad:'cattivo', time:'tempo', world:'mondo', truth:'verità', peace:'pace' },
  ko: { the:'', and:'그리고', love:'사랑', life:'삶', hope:'희망', friend:'친구', beautiful:'아름다운', strong:'강한', heart:'마음', dream:'꿈', water:'물', fire:'불', light:'빛', dark:'어두운', good:'좋은', bad:'나쁜', time:'시간', world:'세계', truth:'진실', peace:'평화' },
  tr: { the:'', and:'ve', love:'sevgi', life:'hayat', hope:'umut', friend:'arkadaş', beautiful:'güzel', strong:'güçlü', heart:'kalp', dream:'rüya', water:'su', fire:'ateş', light:'ışık', dark:'karanlık', good:'iyi', bad:'kötü', time:'zaman', world:'dünya', truth:'gerçek', peace:'barış' },
};

function translateSelectionOrAll() {
  const sel = window.getSelection();
  let text = (sel && !sel.isCollapsed && editor.contains(sel.anchorNode)) ? sel.toString() : getPlainText();
  text = text.trim();
  if (!text) { showToast('Nothing to translate'); return; }
  const lang = document.getElementById('translate-lang').value;
  const dict = MINI_DICT[lang] || {};
  const words = text.split(/(\s+)/);
  const translated = words.map(w => {
    const clean = w.toLowerCase().replace(/[^a-z']/g, '');
    if (dict[clean]) {
      const repl = dict[clean];
      return repl ? repl : w;
    }
    return w;
  }).join('');
  const out = document.getElementById('translate-output');
  if (out) out.textContent = translated;
  showToast('✓ Translated (offline word-match — try a dedicated translator for full accuracy)');
}

// ── COPY TRANSLATION ─────────────────────────────────────────
async function copyTranslation() {
  const out = document.getElementById('translate-output');
  if (!out || !out.textContent || out.textContent === 'Translation will appear here…') {
    showToast('Nothing to copy yet — translate first');
    return;
  }
  try {
    await navigator.clipboard.writeText(out.textContent);
    showToast('✓ Translation copied to clipboard');
  } catch(e) {
    showToast('⚠ Copy failed');
  }
}

// ── INSERT TRANSLATION ────────────────────────────────────────
function insertTranslation() {
  const out = document.getElementById('translate-output');
  if (!out || !out.textContent || out.textContent === 'Translation will appear here…') {
    showToast('Nothing to insert — translate first');
    return;
  }
  editor.focus();
  document.execCommand('insertText', false, '\n\n[Translation]\n' + out.textContent);
  if (typeof updateStats === 'function') updateStats();
  if (typeof triggerSave  === 'function') triggerSave();
  showToast('✓ Translation inserted into document');
}
