// ── EXPORTS ───────────────────────────────────────

// TXT
function exportTxt() {
  const text = getPlainText();
  const title = getTitle();
  const blob = new Blob([document.getElementById('doc-title').value + '\n\n' + text], { type: 'text/plain' });
  dlBlob(blob, title + '.txt');
  showToast('✓ Exported as .txt');
}

// MD
function exportMd() {
  const title = getTitle();
  const html = editor.innerHTML;
  let md = '# ' + (document.getElementById('doc-title').value || 'Document') + '\n\n';
  // Basic HTML→MD
  md += html
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    .replace(/<u[^>]*>(.*?)<\/u>/gi, '_$1_')
    .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, '> $1\n\n')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    .replace(/<hr[^>]*>/gi, '\n---\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n').trim();
  const blob = new Blob([md], { type: 'text/markdown' });
  dlBlob(blob, title + '.md');
  showToast('✓ Exported as .md');
}

// HTML
function exportHtml() {
  const title = getTitle();
  const style = `<style>body{max-width:740px;margin:60px auto;font-family:'Lora',Georgia,serif;font-size:1.1rem;line-height:1.9;color:#1a1a1f;padding:0 24px}h1,h2,h3{font-family:'Playfair Display',Georgia,serif}blockquote{border-left:3px solid #2d4a7a;padding-left:16px;color:#555;margin:16px 0}</style>`;
  const content = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${document.getElementById('doc-title').value || 'Document'}</title>${style}</head><body><h1>${document.getElementById('doc-title').value || ''}</h1>${editor.innerHTML}</body></html>`;
  const blob = new Blob([content], { type: 'text/html' });
  dlBlob(blob, title + '.html');
  showToast('✓ Exported as .html');
}

// PDF
async function exportPDF() {
  showLoading('Generating PDF…');
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const margin = 20;
    const pageW = 210 - margin * 2;
    const title = document.getElementById('doc-title').value || '';
    const text  = getPlainText();

    doc.setFont('times', 'bold');
    doc.setFontSize(18);
    if (title) {
      doc.text(title, margin, margin + 8);
      doc.setFont('times', 'normal');
      doc.setFontSize(11);
      const lines = doc.splitTextToSize(text, pageW);
      doc.text(lines, margin, margin + 22);
    } else {
      doc.setFont('times', 'normal');
      doc.setFontSize(11);
      const lines = doc.splitTextToSize(text, pageW);
      doc.text(lines, margin, margin + 10);
    }
    doc.save(getTitle() + '.pdf');
    showToast('✓ Exported as .pdf');
  } catch(e) {
    showToast('⚠ PDF export failed. Try a shorter document.');
    console.error(e);
  }
  hideLoading();
}

// DOCX
async function exportDocx() {
  showLoading('Building Word document…');
  try {
    const { Document, Packer, Paragraph, TextRun, HeadingLevel } = window.docx;
    const title = document.getElementById('doc-title').value || '';
    const text  = getPlainText();

    const children = [];
    if (title) {
      children.push(new Paragraph({
        text: title,
        heading: HeadingLevel.HEADING_1,
      }));
    }
    // Split into paragraphs
    const paras = text.split(/\n\s*\n/).filter(p => p.trim());
    paras.forEach(p => {
      children.push(new Paragraph({
        children: [new TextRun({ text: p.trim(), size: 24, font: 'Times New Roman' })],
        spacing: { after: 200 },
      }));
    });

    const doc = new Document({
      sections: [{ properties: {}, children }]
    });
    const blob = await Packer.toBlob(doc);
    dlBlob(blob, getTitle() + '.docx');
    showToast('✓ Exported as .docx');
  } catch(e) {
    console.error(e);
    showToast('⚠ DOCX export failed.');
  }
  hideLoading();
}

// IMAGE (PNG / JPG)
async function exportImg(fmt) {
  showLoading('Rendering image…');
  try {
    const canvas = await html2canvas(page, {
      scale: 2,
      useCORS: true,
      backgroundColor: getComputedStyle(page).backgroundColor || '#f7f4ee',
      logging: false,
    });
    canvas.toBlob(blob => {
      dlBlob(blob, getTitle() + '.' + fmt);
      showToast(`✓ Exported as .${fmt}`);
      hideLoading();
    }, 'image/' + (fmt === 'jpg' ? 'jpeg' : fmt), 0.95);
  } catch(e) {
    console.error(e);
    showToast('⚠ Image export failed.');
    hideLoading();
  }
}

// Helper: trigger download
function dlBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href    = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
