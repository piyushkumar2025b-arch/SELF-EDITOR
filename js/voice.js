/* ═══════════════════════════════════════════════════════════════
   js/voice.js — Voice-to-text dictation using Web Speech API
   ═══════════════════════════════════════════════════════════════ */

let voiceRecognition = null;
let voiceActive      = false;
let voiceInterim     = '';

function initVoiceDictation() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    const btn = document.getElementById('voice-start-btn');
    if (btn) { btn.disabled = true; btn.textContent = '⚠ Not supported'; }
    return;
  }

  voiceRecognition = new SpeechRecognition();
  voiceRecognition.continuous     = true;
  voiceRecognition.interimResults = true;
  voiceRecognition.lang           = document.getElementById('voice-lang-select')?.value || 'en-US';

  voiceRecognition.onstart = () => {
    voiceActive = true;
    updateVoiceUI(true);
    showToast('🎙 Listening… speak now');
  };

  voiceRecognition.onend = () => {
    if (voiceActive) {
      // Auto-restart if user didn't manually stop
      voiceRecognition.start();
    } else {
      updateVoiceUI(false);
    }
  };

  voiceRecognition.onerror = (e) => {
    if (e.error !== 'no-speech') {
      showToast('⚠ Mic error: ' + e.error);
      stopVoiceDictation();
    }
  };

  voiceRecognition.onresult = (e) => {
    let interimText = '';
    let finalText   = '';

    for (let i = e.resultIndex; i < e.results.length; i++) {
      const transcript = e.results[i][0].transcript;
      if (e.results[i].isFinal) {
        finalText += transcript + ' ';
      } else {
        interimText += transcript;
      }
    }

    // Insert final text into editor
    if (finalText) {
      editor.focus();
      document.execCommand('insertText', false, finalText);
      if (typeof updateStats === 'function') updateStats();
      if (typeof triggerSave  === 'function') triggerSave();
    }

    // Show interim in the preview area
    const preview = document.getElementById('voice-interim');
    if (preview) preview.textContent = interimText;
  };
}

function startVoiceDictation() {
  if (!voiceRecognition) initVoiceDictation();
  if (!voiceRecognition) return;

  // Update language before each session
  const langSel = document.getElementById('voice-lang-select');
  if (langSel) voiceRecognition.lang = langSel.value;

  voiceActive = true;
  try {
    voiceRecognition.start();
  } catch(e) {
    // Already started
  }
}

function stopVoiceDictation() {
  voiceActive = false;
  if (voiceRecognition) {
    try { voiceRecognition.stop(); } catch(e) {}
  }
  updateVoiceUI(false);
  const preview = document.getElementById('voice-interim');
  if (preview) preview.textContent = '';
  showToast('🎙 Dictation stopped');
}

function toggleVoiceDictation() {
  if (voiceActive) {
    stopVoiceDictation();
  } else {
    startVoiceDictation();
  }
}

function updateVoiceUI(active) {
  const btn      = document.getElementById('voice-start-btn');
  const indicator= document.getElementById('voice-indicator');
  if (btn) {
    btn.textContent = active ? '⏹ Stop Dictation' : '🎙 Start Dictation';
    btn.style.background = active
      ? 'linear-gradient(135deg,#a84c4c,#c94c8a)'
      : 'rgba(201,168,76,.1)';
  }
  if (indicator) {
    indicator.style.display = active ? 'flex' : 'none';
  }
}

// ── VOICE COMMAND RECOGNITION ────────────────────────────────
// Recognise spoken commands like "new line", "bold that", etc.
const VOICE_COMMANDS = {
  'new line':        () => document.execCommand('insertParagraph'),
  'new paragraph':   () => document.execCommand('insertParagraph'),
  'period':          () => document.execCommand('insertText', false, '. '),
  'comma':           () => document.execCommand('insertText', false, ', '),
  'question mark':   () => document.execCommand('insertText', false, '? '),
  'exclamation mark':() => document.execCommand('insertText', false, '! '),
  'bold':            () => document.execCommand('bold'),
  'italic':          () => document.execCommand('italic'),
  'undo that':       () => document.execCommand('undo'),
  'redo that':       () => document.execCommand('redo'),
  'delete that':     () => document.execCommand('delete'),
  'select all':      () => document.execCommand('selectAll'),
  'clear line':      () => { document.execCommand('selectAll'); document.execCommand('delete'); },
  'heading one':     () => document.execCommand('formatBlock', false, 'h1'),
  'heading two':     () => document.execCommand('formatBlock', false, 'h2'),
  'heading three':   () => document.execCommand('formatBlock', false, 'h3'),
  'stop dictation':  () => stopVoiceDictation(),
};

// ── INIT ON LOAD ─────────────────────────────────────────────
if (typeof editor !== 'undefined') {
  initVoiceDictation();
}
