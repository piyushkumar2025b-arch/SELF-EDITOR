/* ═══════════════════════════════════════════════════════════════
   js/templates2.js — Extended Document Templates Library
   Pre-built writing templates for fiction, non-fiction, business,
   academia, screenwriting, and more.
   ═══════════════════════════════════════════════════════════════ */

const EXTENDED_TEMPLATES = [
  // ── FICTION ───────────────────────────────────────────────
  {
    id   : 'novel-chapter',
    cat  : 'Fiction',
    name : 'Novel Chapter',
    icon : '📖',
    html : `<h2>Chapter [N]: [Chapter Title]</h2>
<p>[Scene-setting paragraph. Establish where and when we are, grounding the reader in sensory detail.]</p>
<p>[Inciting action — something shifts. A character arrives, a choice is forced, a secret surfaces.]</p>
<p>"[Dialogue that reveals character and advances the scene]," [Character] said.</p>
<p>[Complication or reversal. The stakes rise or a plan unravels.]</p>
<p>[Closing beat — leave the chapter on a question, decision, or image that pulls the reader forward.]</p>`,
  },
  {
    id   : 'short-story',
    cat  : 'Fiction',
    name : 'Short Story',
    icon : '✍️',
    html : `<h1>[Story Title]</h1>
<p>[Opening hook — drop the reader mid-action or in a striking moment. Establish the protagonist's want within the first paragraph.]</p>
<p>[Rising action — obstacle or complication deepens. Show the world through the protagonist's eyes.]</p>
<p>[Crisis — the moment of highest tension. The protagonist must make an impossible choice.]</p>
<p>[Climax — the choice is made, consequences unfold.]</p>
<p>[Resolution — a brief, resonant closing image or line that re-frames everything that came before.]</p>`,
  },
  {
    id   : 'scene-outline',
    cat  : 'Fiction',
    name : 'Scene Outline',
    icon : '🎬',
    html : `<h3>Scene: [Scene Title]</h3>
<p><strong>Goal:</strong> What does the POV character want?</p>
<p><strong>Conflict:</strong> What stands in the way?</p>
<p><strong>Disaster:</strong> How does it go wrong (or worse than expected)?</p>
<hr/>
<p><strong>Reaction:</strong> How does the character feel/respond?</p>
<p><strong>Dilemma:</strong> What are the options, none of them good?</p>
<p><strong>Decision:</strong> What do they choose, and what does it cost?</p>`,
  },
  {
    id   : 'flash-fiction',
    cat  : 'Fiction',
    name : 'Flash Fiction (under 1000w)',
    icon : '⚡',
    html : `<h2>[Title]</h2>
<p>[Single, tight opening sentence that drops the reader into the world.]</p>
<p>[Body — every word earns its place. No exposition. Show the turn.]</p>
<p>[Final line — surprising, inevitable, resonant.]</p>`,
  },

  // ── NON-FICTION ───────────────────────────────────────────
  {
    id   : 'essay-argumentative',
    cat  : 'Essays',
    name : 'Argumentative Essay',
    icon : '🗣️',
    html : `<h1>[Essay Title]</h1>
<h2>Introduction</h2>
<p>[Hook. Establish the stakes — why does this question matter?]</p>
<p>[Background context in 2–3 sentences.]</p>
<p><strong>Thesis:</strong> [One clear, arguable claim.]</p>
<h2>Body Paragraph 1 — Strongest Point</h2>
<p><strong>Claim:</strong> [Topic sentence.]</p>
<p><strong>Evidence:</strong> [Data, quote, example.]</p>
<p><strong>Analysis:</strong> [Explain how the evidence supports the claim.]</p>
<h2>Body Paragraph 2 — Supporting Point</h2>
<p><strong>Claim:</strong></p>
<p><strong>Evidence:</strong></p>
<p><strong>Analysis:</strong></p>
<h2>Counterargument & Rebuttal</h2>
<p>[Acknowledge the strongest opposing view. Then dismantle it.]</p>
<h2>Conclusion</h2>
<p>[Restate thesis in new language. Broaden out — what are the implications?]</p>`,
  },
  {
    id   : 'personal-essay',
    cat  : 'Essays',
    name : 'Personal Essay',
    icon : '💭',
    html : `<h1>[Title]</h1>
<p>[Scene-in. Begin with a vivid, specific memory or moment — not a general statement.]</p>
<p>[Develop the scene. Use dialogue, sensory detail, the texture of the moment.]</p>
<p>[Pivot inward. What does the narrator understand now that they didn't then?]</p>
<p>[Complicate the understanding. Resist the easy lesson.]</p>
<p>[Resonant closing image or line — circling back to the opening in a transformed way.]</p>`,
  },
  {
    id   : 'listicle',
    cat  : 'Essays',
    name : 'Listicle / How-To',
    icon : '📋',
    html : `<h1>[N] Ways to [Achieve Goal]</h1>
<p>[Brief intro: who this is for and what they'll get out of reading.]</p>
<h2>1. [First Point]</h2>
<p>[Explanation. Concrete example or tip.]</p>
<h2>2. [Second Point]</h2>
<p>[Explanation.]</p>
<h2>3. [Third Point]</h2>
<p>[Explanation.]</p>
<h2>Key Takeaway</h2>
<p>[One sentence summary. Optional CTA.]</p>`,
  },

  // ── BUSINESS ─────────────────────────────────────────────
  {
    id   : 'executive-summary',
    cat  : 'Business',
    name : 'Executive Summary',
    icon : '📊',
    html : `<h1>Executive Summary — [Project/Report Title]</h1>
<p><strong>Date:</strong> [Date] &nbsp;|&nbsp; <strong>Author:</strong> [Name] &nbsp;|&nbsp; <strong>Audience:</strong> [Audience]</p>
<h2>The Problem</h2>
<p>[One paragraph. What challenge or opportunity prompted this report?]</p>
<h2>Our Recommendation</h2>
<p>[One clear action. What should be done, by whom, and when?]</p>
<h2>Key Findings</h2>
<ul>
  <li>[Finding 1 with supporting data]</li>
  <li>[Finding 2]</li>
  <li>[Finding 3]</li>
</ul>
<h2>Financial Impact</h2>
<p>[Cost, savings, or ROI if applicable.]</p>
<h2>Next Steps</h2>
<p>[Immediate actions with owners and deadlines.]</p>`,
  },
  {
    id   : 'proposal',
    cat  : 'Business',
    name : 'Project Proposal',
    icon : '📝',
    html : `<h1>[Project Name] — Proposal</h1>
<p><strong>Prepared by:</strong> [Name] &nbsp;|&nbsp; <strong>Date:</strong> [Date]</p>
<h2>Overview</h2>
<p>[2–3 sentences: what is being proposed and why now?]</p>
<h2>Objectives</h2>
<ul>
  <li>[Objective 1 — specific, measurable]</li>
  <li>[Objective 2]</li>
</ul>
<h2>Scope of Work</h2>
<p>[What is included. What is explicitly out of scope.]</p>
<h2>Timeline</h2>
<p>[Phase 1: Week 1–2 — …]</p>
<p>[Phase 2: Week 3–4 — …]</p>
<h2>Budget</h2>
<p>[Estimated cost breakdown.]</p>
<h2>Risks & Mitigations</h2>
<p>[Key risks and how they will be addressed.]</p>
<h2>Approval</h2>
<p>Approved by: _________________________ &nbsp; Date: _____________</p>`,
  },
  {
    id   : 'press-release',
    cat  : 'Business',
    name : 'Press Release',
    icon : '📰',
    html : `<p style="text-align:right"><strong>FOR IMMEDIATE RELEASE</strong></p>
<p><strong>Contact:</strong> [Name] | [Email] | [Phone]</p>
<h1>[Headline: Compelling, Active-Voice Summary of News]</h1>
<h3>[Subheadline: one more supporting detail]</h3>
<p><strong>[CITY, Date]</strong> — [Lead paragraph: Who, What, Where, When, Why in 2–3 sentences. Most important info first.]</p>
<p>[Second paragraph: Supporting details, context, or background.]</p>
<p>[Quote from spokesperson: "…," said [Name], [Title], [Organisation].]</p>
<p>[Third paragraph: Product/initiative details, availability, pricing if relevant.]</p>
<p>[Boilerplate: 2–3 sentences about the company/organisation.]</p>
<p style="text-align:center">###</p>`,
  },

  // ── ACADEMIC ──────────────────────────────────────────────
  {
    id   : 'research-paper',
    cat  : 'Academic',
    name : 'Research Paper',
    icon : '🎓',
    html : `<h1>[Title]</h1>
<p style="text-align:center">[Author Name] · [Institution] · [Date]</p>
<h2>Abstract</h2>
<p>[150–250 words. Background, aim, methods, results, conclusion.]</p>
<h2>1. Introduction</h2>
<p>[Context, research gap, thesis/research question, paper structure.]</p>
<h2>2. Literature Review</h2>
<p>[What has been established? Where do gaps remain?]</p>
<h2>3. Methodology</h2>
<p>[How was the research conducted? Data sources, sample, analysis method.]</p>
<h2>4. Results</h2>
<p>[What was found? Present data objectively.]</p>
<h2>5. Discussion</h2>
<p>[Interpretation. How do findings relate to existing literature? Limitations.]</p>
<h2>6. Conclusion</h2>
<p>[Summary of contributions. Implications. Future research directions.]</p>
<h2>References</h2>
<p>[Citations in your chosen style — use the Citations tool to insert them.]</p>`,
  },
  {
    id   : 'lab-report',
    cat  : 'Academic',
    name : 'Lab Report',
    icon : '🔬',
    html : `<h1>[Experiment Title]</h1>
<p><strong>Date:</strong> [Date] &nbsp;|&nbsp; <strong>Lab Partner(s):</strong> [Names]</p>
<h2>Aim</h2>
<p>[One sentence: what are you investigating?]</p>
<h2>Hypothesis</h2>
<p>[Prediction based on background knowledge, with reasoning.]</p>
<h2>Materials</h2>
<ul><li>[Item 1]</li><li>[Item 2]</li></ul>
<h2>Method</h2>
<ol><li>[Step 1]</li><li>[Step 2]</li></ol>
<h2>Results</h2>
<p>[Data tables, observations, measurements.]</p>
<h2>Analysis</h2>
<p>[Calculations, trends, patterns.]</p>
<h2>Discussion</h2>
<p>[Do results support the hypothesis? Sources of error. Improvements.]</p>
<h2>Conclusion</h2>
<p>[Summary of findings in relation to the aim.]</p>`,
  },

  // ── SCREENWRITING ─────────────────────────────────────────
  {
    id   : 'screenplay-scene',
    cat  : 'Screenwriting',
    name : 'Screenplay Scene',
    icon : '🎥',
    html : `<p><strong>INT. [LOCATION] — [DAY/NIGHT]</strong></p>
<p>[Scene description. Active voice. What the camera sees, nothing more.]</p>
<p><strong>[CHARACTER NAME]</strong></p>
<p style="margin-left:2em">[Dialogue line. Characters speak in their voice, not the writer's.]</p>
<p><strong>[SECOND CHARACTER]</strong></p>
<p style="margin-left:2em">[Response.]</p>
<p>[Action beat. What does the character do?]</p>`,
  },
  {
    id   : 'logline',
    cat  : 'Screenwriting',
    name : 'Logline & Treatment',
    icon : '🎞️',
    html : `<h2>Logline</h2>
<p>When [inciting incident], a [protagonist with flaw] must [objective] before [stakes/deadline], or [consequence].</p>
<h2>Treatment</h2>
<h3>Act I — Setup</h3>
<p>[Establish world, protagonist, want vs. need. Inciting incident at ~10%.]</p>
<h3>Act II — Confrontation</h3>
<p>[Escalating obstacles. Midpoint reversal. All-is-lost moment at ~75%.]</p>
<h3>Act III — Resolution</h3>
<p>[Final confrontation. Climax. Resolution — protagonist changed?]</p>`,
  },

  // ── PERSONAL ──────────────────────────────────────────────
  {
    id   : 'cover-letter',
    cat  : 'Personal',
    name : 'Cover Letter',
    icon : '💼',
    html : `<p>[Your Name]<br>[Address]<br>[City, State, Zip]<br>[Email] | [Phone]<br>[Date]</p>
<p>[Hiring Manager's Name]<br>[Title]<br>[Company]<br>[Address]</p>
<p>Dear [Name],</p>
<p>[Opening — name the role and why this company, not any company. One concrete, specific reason.]</p>
<p>[Middle paragraph — your most relevant achievement. Use numbers. Show what you've done, not just what you can do.]</p>
<p>[Second middle paragraph — one more aligned skill or experience. Keep it tight.]</p>
<p>[Closing — restate enthusiasm, invite next step. "I'd welcome the chance to discuss how I can contribute to [specific team or goal]." No "Please find attached my résumé."]</p>
<p>Sincerely,<br>[Your Name]</p>`,
  },
  {
    id   : 'journal',
    cat  : 'Personal',
    name : 'Journal Entry',
    icon : '📓',
    html : `<h3>[Date] — [Optional Title or Mood Tag]</h3>
<p>[What happened today — just the facts, briefly.]</p>
<p>[What I felt about it. Don't explain or justify — just notice.]</p>
<p>[One thing I'm grateful for.]</p>
<p>[One thing I want to do differently, or carry forward.]</p>`,
  },
];

// ── RENDER EXTENDED TEMPLATE GRID ─────────────────────────────
function renderExtendedTemplates() {
  const out = document.getElementById('templates2-output');
  if (!out) return;

  const cats = [...new Set(EXTENDED_TEMPLATES.map(t => t.cat))];
  const search = (document.getElementById('templates2-search')?.value || '').toLowerCase();

  const filtered = search
    ? EXTENDED_TEMPLATES.filter(t => t.name.toLowerCase().includes(search) || t.cat.toLowerCase().includes(search))
    : EXTENDED_TEMPLATES;

  const grouped = cats.map(cat => {
    const items = filtered.filter(t => t.cat === cat);
    if (!items.length) return '';
    return `
      <div style="margin-bottom:10px">
        <div style="font-size:.65rem;text-transform:uppercase;letter-spacing:.08em;opacity:.4;margin-bottom:5px">${cat}</div>
        <div style="display:flex;flex-direction:column;gap:4px">
          ${items.map(t => `
            <div style="display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.05);border-radius:5px;padding:6px 9px;cursor:pointer"
                 onclick="applyExtendedTemplate('${t.id}')">
              <span style="font-size:1rem">${t.icon}</span>
              <span style="font-size:.8rem">${t.name}</span>
            </div>`).join('')}
        </div>
      </div>`;
  }).join('');

  out.innerHTML = `
    <input type="text" id="templates2-search" placeholder="Search templates…" oninput="renderExtendedTemplates()"
      style="width:100%;padding:5px 8px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.15);border-radius:4px;color:inherit;font-size:.8rem;margin-bottom:10px;box-sizing:border-box">
    ${grouped || '<div style="font-size:.75rem;opacity:.4;text-align:center;padding:10px">No templates match.</div>'}`;
}

function applyExtendedTemplate(id) {
  const tmpl = EXTENDED_TEMPLATES.find(t => t.id === id);
  if (!tmpl || typeof editor === 'undefined') return;

  if (editor.innerHTML && editor.innerHTML !== '<br>' && editor.innerHTML !== '') {
    if (!confirm('Replace current document content with this template?')) return;
  }

  editor.innerHTML = tmpl.html;
  editor.focus();

  if (typeof updateStats === 'function') updateStats();
  if (typeof triggerSave  === 'function') triggerSave();
  if (typeof showToast    === 'function') showToast(`Template "${tmpl.name}" applied`);
}
