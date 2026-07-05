/* ═══════════════════════════════════════════════════════════════
   js/books.js — Open Library Book Search & Academic Citation Builder
   API: https://openlibrary.org/search.json?q={query}
   ═══════════════════════════════════════════════════════════════ */

let booksLastResults = [];

async function searchBooks() {
  const inp  = document.getElementById('books-input');
  const type = document.getElementById('books-search-type')?.value || 'q';
  const out  = document.getElementById('books-output');
  if (!inp || !out) return;

  const query = inp.value.trim();
  if (!query) { showToast('Enter a title, author, or ISBN to search'); return; }

  out.innerHTML = `
    <div class="wiki-loading">
      <span class="wiki-spinner"></span>
      Searching Open Library for "<em>${query}</em>"…
    </div>`;

  try {
    const param = encodeURIComponent(query);
    const url   = `https://openlibrary.org/search.json?${type}=${param}&limit=6&fields=key,title,author_name,first_publish_year,publisher,isbn,cover_i,subject`;
    const res   = await fetch(url);
    if (!res.ok) throw new Error('API error');
    const data  = await res.json();

    const docs = data.docs || [];
    if (!docs.length) {
      out.innerHTML = `<div class="wiki-not-found">No books found for "<em>${query}</em>".</div>`;
      return;
    }

    booksLastResults = docs;

    out.innerHTML = `
      <div class="books-count">${data.numFound?.toLocaleString() || docs.length} results — showing top ${docs.length}</div>
      <div class="books-list">
        ${docs.map((book, i) => renderBookCard(book, i)).join('')}
      </div>`;

  } catch (e) {
    out.innerHTML = `<div class="wiki-not-found">Error connecting to Open Library. Check your connection.</div>`;
  }
}

function renderBookCard(book, index) {
  const title   = book.title || 'Unknown Title';
  const authors = (book.author_name || []).slice(0, 2).join(', ') || 'Unknown Author';
  const year    = book.first_publish_year || '?';
  const pub     = (book.publisher || [])[0] || '';
  const isbn    = (book.isbn || [])[0] || '';
  const coverId = book.cover_i;
  const coverUrl = coverId
    ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
    : null;

  return `
    <div class="book-card">
      <div class="book-cover-wrap">
        ${coverUrl
          ? `<img src="${coverUrl}" alt="${title}" class="book-cover" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
          : ''}
        <div class="book-cover-placeholder" style="${coverUrl ? 'display:none' : ''}">📖</div>
      </div>
      <div class="book-info">
        <div class="book-title" title="${title}">${title.length > 48 ? title.slice(0, 48) + '…' : title}</div>
        <div class="book-author">${authors}</div>
        <div class="book-meta">${year}${pub ? ' · ' + pub.slice(0, 30) : ''}${isbn ? ' · ISBN: ' + isbn : ''}</div>
        <div class="book-cite-row">
          <button class="book-cite-btn" onclick="insertBookCitation(${index}, 'mla')">MLA</button>
          <button class="book-cite-btn" onclick="insertBookCitation(${index}, 'apa')">APA</button>
          <button class="book-cite-btn" onclick="insertBookCitation(${index}, 'chicago')">Chicago</button>
        </div>
      </div>
    </div>`;
}

function buildCitation(book, style) {
  const title   = book.title || 'Untitled';
  const authors = book.author_name || ['Unknown Author'];
  const year    = book.first_publish_year || 'n.d.';
  const pub     = (book.publisher || [])[0] || 'Unknown Publisher';
  const isbn    = (book.isbn || [])[0] || '';
  const today   = new Date().getFullYear();

  // Format author for MLA/APA (Last, First)
  const authorFull = authors[0] || 'Unknown Author';
  const authorParts = authorFull.trim().split(' ');
  const authorLast  = authorParts[authorParts.length - 1] || authorFull;
  const authorFirst = authorParts.slice(0, -1).join(' ') || '';
  const authorMLA   = authorFirst ? `${authorLast}, ${authorFirst}` : authorLast;
  const extraAuthors = authors.slice(1).length > 0 ? `, et al.` : '.';

  switch (style) {
    case 'mla':
      return `${authorMLA}${extraAuthors} <em>${title}</em>. ${pub}, ${year}.`;
    case 'apa':
      return `${authorLast}, ${authorFirst ? authorFirst[0] + '.' : ''}${authors.slice(1).length ? ', et al.' : ''} (${year}). <em>${title}</em>. ${pub}.`;
    case 'chicago':
      return `${authorFull}. <em>${title}</em>. ${pub}, ${year}.`;
    default:
      return `${authorFull}. <em>${title}</em>. ${year}.`;
  }
}

function insertBookCitation(bookIndex, style) {
  const book = booksLastResults[bookIndex];
  if (!book) { showToast('Book data missing — please search again'); return; }
  if (typeof editor === 'undefined') return;

  const citation = buildCitation(book, style);
  const label    = style.toUpperCase();

  editor.focus();
  document.execCommand('insertHTML', false,
    `<p style="font-size:.85em;line-height:1.6;padding-left:24px;text-indent:-24px;color:inherit">
       [${label}] ${citation}
     </p><p><br></p>`
  );
  if (typeof updateStats === 'function') updateStats();
  if (typeof triggerSave  === 'function') triggerSave();
  showToast(`✓ ${label} citation inserted`);
}

function copyBookCitation(bookIndex, style) {
  const book = booksLastResults[bookIndex];
  if (!book) return;
  // Strip HTML tags for clipboard
  const citation = buildCitation(book, style).replace(/<[^>]+>/g, '');
  navigator.clipboard.writeText(citation).then(() => {
    showToast('✓ Citation copied to clipboard');
  }).catch(() => {
    showToast('Could not copy — try manually');
  });
}
