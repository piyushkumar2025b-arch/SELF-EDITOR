// ── THEME ─────────────────────────────────────────
function setTheme(el, theme) {
  if (page) {
    page.className = theme ? 'theme-' + theme : '';
  }
  document.querySelectorAll('.theme-dot').forEach(d => d.classList.remove('selected'));
  if (el) el.classList.add('selected');
}

// ── FONT ──────────────────────────────────────────
function setFont(el, font) {
  if (editor) {
    editor.style.fontFamily = font;
  }
  document.querySelectorAll('.font-opt').forEach(b => b.classList.remove('selected'));
  if (el) el.classList.add('selected');
}

// ── PAGE FILTERS ────────────────────────────────────────────
function setPageFilter(el, filterName) {
  const layout = document.getElementById('layout');
  if (layout) {
    layout.className = layout.className.replace(/\bfilter-\S+/g, '').trim();
    if (filterName) layout.classList.add('filter-' + filterName);
  }
  document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('selected'));
  if (el) el.classList.add('selected');
  try { localStorage.setItem('inkwell-filter', filterName); } catch(e) {}
}

// Initialize Page Filter on load
try {
  const savedFilter = localStorage.getItem('inkwell-filter');
  if (savedFilter) {
    const btn = document.querySelector(`[data-filter="${savedFilter}"]`);
    if (btn) setPageFilter(btn, savedFilter);
  }
} catch(e) {}
