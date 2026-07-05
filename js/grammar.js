/* ═══════════════════════════════════════════════════════════════
   js/grammar.js — Style, Readability & Grammar Analyzer
   ═══════════════════════════════════════════════════════════════ */

const CLICHES = [
  "at the end of the day",
  "piece of cake",
  "once upon a time",
  "think outside the box",
  "read between the lines",
  "spill the beans",
  "bite the bullet",
  "under the weather",
  "actions speak louder than words",
  "last but not least",
  "in the nick of time",
  "play it by ear",
  "cry over spilled milk",
  "add insult to injury"
];

const REDUNDANCIES = {
  "due to the fact that": "because",
  "at this point in time": "now",
  "in order to": "to",
  "first and foremost": "first",
  "make a decision": "decide",
  "take into consideration": "consider",
  "with the exception of": "except",
  "in the event that": "if",
  "at the present time": "now",
  "until such time as": "until"
};

// Auxiliary verbs for passive voice detection
const PASSIVE_AUXILIARIES = /\b(am|is|are|was|were|be|been|being)\b/gi;
// Common past participles or verbs ending in ed/en for basic offline passive checking
const PASSIVE_VERBS = /\b(written|taken|made|done|seen|given|kept|held|known|shown|built|run|told|brought|written|created|added|developed|prepared|submitted|provided|sent|received)\b/i;

function runGrammarCheck() {
  const text = getPlainText();
  const out = document.getElementById('grammar-output');
  if (!out) return;

  if (!text.trim()) {
    out.innerHTML = `<div class="grammar-empty">Write some text in the editor to analyze.</div>`;
    updateReadabilityUI(null);
    return;
  }

  // 1. Calculate Readability
  const stats = analyzeReadability(text);
  updateReadabilityUI(stats);

  // 2. Scan for Style issues
  const issues = scanStyleIssues(text);

  if (issues.length === 0) {
    out.innerHTML = `<div class="grammar-success">🎉 No writing style issues found! Excellent work.</div>`;
    return;
  }

  out.innerHTML = `
    <div class="grammar-list-header">Suggestions (${issues.length}):</div>
    <div class="grammar-issue-list">
      ${issues.map((iss, i) => `
        <div class="grammar-issue-card ${iss.type}">
          <div class="grammar-issue-type">${iss.typeLabel}</div>
          <div class="grammar-issue-match">"${iss.match}"</div>
          <div class="grammar-issue-desc">${iss.desc}</div>
          ${iss.suggestion ? `
            <button class="grammar-fix-btn" onclick="fixGrammarIssue(${i}, '${iss.type}', '${iss.match.replace(/'/g, "\\'")}', '${iss.suggestion.replace(/'/g, "\\'")}')">
              Replace with "${iss.suggestion}"
            </button>
          ` : ''}
        </div>
      `).join('')}
    </div>
  `;

  // Store active issues globally to reference in fixing
  window.currentGrammarIssues = issues;
}

function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;
  word = word.replace(/(?:es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const vowels = word.match(/[aeiouy]{1,2}/g);
  return vowels ? vowels.length : 1;
}

function analyzeReadability(text) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  if (!wordCount) return null;

  // Approx sentence split
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = sentences.length || 1;

  let syllableCount = 0;
  let complexWordCount = 0;

  words.forEach(w => {
    const syl = countSyllables(w);
    syllableCount += syl;
    if (syl >= 3) complexWordCount++;
  });

  const avgSentenceLength = wordCount / sentenceCount;
  const avgSyllablesPerWord = syllableCount / wordCount;

  // Flesch Reading Ease
  let readingEase = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
  readingEase = Math.max(0, Math.min(100, readingEase));

  // Flesch-Kincaid Grade Level
  let gradeLevel = (0.39 * avgSentenceLength) + (11.8 * avgSyllablesPerWord) - 15.59;
  gradeLevel = Math.max(0, gradeLevel);

  // Gunning Fog
  const pctComplex = (complexWordCount / wordCount) * 100;
  const gunningFog = 0.4 * (avgSentenceLength + pctComplex);

  return {
    readingEase: readingEase.toFixed(1),
    gradeLevel: gradeLevel.toFixed(1),
    gunningFog: gunningFog.toFixed(1),
    sentenceCount,
    wordCount
  };
}

function updateReadabilityUI(stats) {
  const easeEl = document.getElementById('readability-ease');
  const gradeEl = document.getElementById('readability-grade');
  const fogEl = document.getElementById('readability-fog');

  if (!easeEl || !gradeEl || !fogEl) return;

  if (!stats) {
    easeEl.textContent = '—';
    gradeEl.textContent = '—';
    fogEl.textContent = '—';
    return;
  }

  easeEl.textContent = stats.readingEase;
  gradeEl.textContent = `Grade ${stats.gradeLevel}`;
  fogEl.textContent = stats.gunningFog;

  // Set colors or messages based on scores
  let easeDesc = 'Standard';
  if (stats.readingEase > 90) easeDesc = 'Very Easy';
  else if (stats.readingEase > 80) easeDesc = 'Easy';
  else if (stats.readingEase > 70) easeDesc = 'Fairly Easy';
  else if (stats.readingEase > 60) easeDesc = 'Standard';
  else if (stats.readingEase > 50) easeDesc = 'Fairly Difficult';
  else if (stats.readingEase > 30) easeDesc = 'Difficult';
  else easeDesc = 'Very Confusing';

  easeEl.title = `Flesch Reading Ease: ${easeDesc}`;
}

function scanStyleIssues(text) {
  const issues = [];
  const lines = text.split('\n');

  lines.forEach((line, lineIdx) => {
    // 1. Scan for Cliches
    CLICHES.forEach(cliche => {
      const regex = new RegExp(`\\b${cliche}\\b`, 'gi');
      let match;
      while ((match = regex.exec(line)) !== null) {
        issues.push({
          type: 'cliche',
          typeLabel: 'Cliché',
          match: match[0],
          desc: 'Overused expression. Try using fresher language or writing more concretely.',
          lineIndex: lineIdx,
          index: match.index
        });
      }
    });

    // 2. Scan for Redundancies
    for (const [red, suggestion] of Object.entries(REDUNDANCIES)) {
      const regex = new RegExp(`\\b${red}\\b`, 'gi');
      let match;
      while ((match = regex.exec(line)) !== null) {
        issues.push({
          type: 'redundancy',
          typeLabel: 'Redundancy / Wordiness',
          match: match[0],
          desc: `Wordy phrase. Consider replacing it to make your writing tighter and direct.`,
          suggestion,
          lineIndex: lineIdx,
          index: match.index
        });
      }
    }

    // 3. Scan for Excessive Adverbs
    const adverbRegex = /\b\w+ly\b/gi;
    let advMatch;
    const commonNonAdverbs = ['only', 'family', 'reply', 'early', 'holy', 'silly', 'ugly', 'lonely', 'lovely', 'fly', 'rely', 'belly', 'jelly', 'ally'];
    while ((advMatch = adverbRegex.exec(line)) !== null) {
      const word = advMatch[0].toLowerCase();
      if (!commonNonAdverbs.includes(word)) {
        issues.push({
          type: 'adverb',
          typeLabel: 'Adverb usage',
          match: advMatch[0],
          desc: 'Adverbs can weaken verbs. Consider replacing the verb-adverb combo with a stronger, active verb.',
          lineIndex: lineIdx,
          index: advMatch.index
        });
      }
    }

    // 4. Basic passive voice check
    // Look for auxiliary verb followed closely by a past participle verb (e.g. was taken, is written)
    const words = line.split(/\s+/);
    for (let i = 0; i < words.length - 1; i++) {
      const w1 = words[i].replace(/[^a-zA-Z]/g, '');
      const w2 = words[i+1].replace(/[^a-zA-Z]/g, '');
      if (w1.match(PASSIVE_AUXILIARIES) && w2.match(PASSIVE_VERBS)) {
        const fullMatch = `${words[i]} ${words[i+1]}`;
        issues.push({
          type: 'passive',
          typeLabel: 'Passive Voice',
          match: fullMatch,
          desc: 'Passive voice shifts the focus from the agent to the action receiver. Use active voice for stronger impact.',
          lineIndex: lineIdx,
          index: line.indexOf(fullMatch)
        });
      }
    }
  });

  return issues;
}

function fixGrammarIssue(issueIndex, type, matchStr, replacement) {
  if (typeof editor === 'undefined') return;

  // Let's replace the match in the editor
  editor.focus();
  
  // Basic replacement: search for matchStr in the editor's text/html and replace it
  const html = editor.innerHTML;
  
  // Ensure we replace a literal word to prevent corrupting HTML tags
  const text = getPlainText();
  const indexInText = text.indexOf(matchStr);

  if (indexInText !== -1) {
    // A clean approach: select the match and replace it
    if (window.find && window.find(matchStr, true, false, false, false, false, false)) {
      document.execCommand('insertText', false, replacement);
      showToast(`✓ Replaced "${matchStr}" with "${replacement}"`);
    } else {
      // Fallback simple replacement in innerHTML (careful with tags)
      const escapedMatch = matchStr.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedMatch}\\b`, 'i');
      editor.innerHTML = html.replace(regex, replacement);
      showToast(`✓ Replaced text`);
    }
  } else {
    showToast(`Could not find "${matchStr}" in editor`);
  }

  if (typeof updateStats === 'function') updateStats();
  if (typeof triggerSave === 'function') triggerSave();
  runGrammarCheck();
}
