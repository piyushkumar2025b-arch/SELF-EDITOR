/* ═══════════════════════════════════════════════════════════════
   js/research.js — Wikipedia Live Research Assistant
   API: https://en.wikipedia.org/api/rest_v1/page/summary/{query}
   ═══════════════════════════════════════════════════════════════ */

async function searchWikipedia() {
  const inp   = document.getElementById('wiki-input');
  const out   = document.getElementById('wiki-output');
  if (!inp || !out) return;

  const query = inp.value.trim();
  if (!query) { showToast('Enter a topic to search'); return; }

  out.innerHTML = `
    <div class="wiki-loading">
      <span class="wiki-spinner"></span>
      Searching Wikipedia for "<em>${query}</em>"…
    </div>`;

  try {
    // Wikipedia summary endpoint
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
    const res  = await fetch(url);

    if (res.status === 404) {
      // Try search disambiguation
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=5&format=json&origin=*`;
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();
      const suggestions = searchData[1];

      if (suggestions && suggestions.length > 0) {
        out.innerHTML = `
          <div class="wiki-not-found">
            No direct match. Did you mean:
          </div>
          <div class="wiki-suggestions">
            ${suggestions.map(s => `
              <button class="wiki-sugg-btn" onclick="document.getElementById('wiki-input').value='${s.replace(/'/g,"\\'")}';searchWikipedia()">
                ${s}
              </button>
            `).join('')}
          </div>`;
      } else {
        out.innerHTML = `<div class="wiki-not-found">No Wikipedia article found for "<em>${query}</em>".</div>`;
      }
      return;
    }

    if (!res.ok) throw new Error('API error');
    const data = await res.json();

    const title       = data.title || query;
    const extract     = data.extract || '';
    const description = data.description || '';
    const pageUrl     = data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`;
    const thumbnail   = data.thumbnail?.source || null;
    const lastModified = data.timestamp ? new Date(data.timestamp).toLocaleDateString() : '';

    // Store for insert buttons
    window.wikiCurrentData = { title, extract, description, pageUrl };

    out.innerHTML = `
      <div class="wiki-card">
        ${thumbnail ? `<img src="${thumbnail}" alt="${title}" class="wiki-thumb">` : ''}
        <div class="wiki-card-body">
          <div class="wiki-title">${title}</div>
          ${description ? `<div class="wiki-desc">${description}</div>` : ''}
          <div class="wiki-extract">${extract.split('. ').slice(0, 4).join('. ')}.</div>
          <div class="wiki-footer">
            <span>Wikipedia${lastModified ? ` · Updated ${lastModified}` : ''}</span>
            <a href="${pageUrl}" target="_blank" rel="noopener noreferrer" class="wiki-link">Full Article ↗</a>
          </div>
        </div>
      </div>
      <div class="wiki-actions">
        <button class="mini-btn" onclick="insertWikiExtract()">↩ Insert Summary</button>
        <button class="mini-btn" onclick="insertWikiCitation()">📎 Insert Citation</button>
      </div>
    `;

  } catch (e) {
    out.innerHTML = `<div class="wiki-not-found">Error fetching Wikipedia data. Check your connection.</div>`;
  }
}

function insertWikiExtract() {
  if (!window.wikiCurrentData || !window.wikiCurrentData.extract) {
    showToast('Search for a topic first');
    return;
  }
  if (typeof editor === 'undefined') return;
  const { title, extract } = window.wikiCurrentData;
  const short = extract.split('. ').slice(0, 3).join('. ') + '.';
  editor.focus();
  document.execCommand('insertHTML', false,
    `<blockquote style="border-left:3px solid rgba(201,168,76,.5);padding-left:14px;margin:14px 0;color:inherit;font-style:italic">
       ${short}
       <br><small style="font-size:.75em;opacity:.55">— Wikipedia: ${title}</small>
     </blockquote><p><br></p>`
  );
  if (typeof updateStats === 'function') updateStats();
  if (typeof triggerSave  === 'function') triggerSave();
  showToast(`✓ Summary of "${title}" inserted`);
}

function insertWikiCitation() {
  if (!window.wikiCurrentData) {
    showToast('Search for a topic first');
    return;
  }
  if (typeof editor === 'undefined') return;
  const { title, pageUrl } = window.wikiCurrentData;
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  editor.focus();
  document.execCommand('insertHTML', false,
    `<p style="font-size:.85em;color:rgba(26,26,31,.55)">
       [Source] "Wikipedia contributors. "<em>${title}</em>." <em>Wikipedia, The Free Encyclopedia</em>. Retrieved ${today} from <a href="${pageUrl}" target="_blank">${pageUrl}</a>.]
     </p><p><br></p>`
  );
  if (typeof updateStats === 'function') updateStats();
  if (typeof triggerSave  === 'function') triggerSave();
  showToast(`✓ Wikipedia citation inserted`);
}

// Allow searching with Enter key
document.addEventListener('DOMContentLoaded', () => {
  const inp = document.getElementById('wiki-input');
  if (inp) {
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter') searchWikipedia();
    });
  }
});
