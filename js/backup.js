/* ═══════════════════════════════════════════════════════════════
   js/backup.js — Full Backup & Restore
   Exports every Inkwell localStorage key into a single JSON file,
   and restores from a previously exported backup file.
   ═══════════════════════════════════════════════════════════════ */

function exportFullBackup() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('inkwell-')) {
      data[key] = localStorage.getItem(key);
    }
  }
  const payload = {
    exportedAt: new Date().toISOString(),
    app: 'inkwell',
    data,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `inkwell-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  if (typeof showToast === 'function') showToast('Backup downloaded ✓');
}

function triggerBackupRestore() {
  document.getElementById('backup-file-input')?.click();
}

function handleBackupRestore(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const payload = JSON.parse(reader.result);
      const data = payload.data || payload; // tolerate raw dumps too
      const keys = Object.keys(data).filter(k => k.startsWith('inkwell-'));
      if (!keys.length) {
        if (typeof showToast === 'function') showToast('No Inkwell data found in this file');
        return;
      }
      if (!confirm(`Restore ${keys.length} saved item(s)? This will overwrite any existing data with the same names.`)) return;

      keys.forEach(k => localStorage.setItem(k, data[k]));
      if (typeof showToast === 'function') showToast(`Restored ${keys.length} item(s) — reloading…`);
      setTimeout(() => location.reload(), 1200);
    } catch (e) {
      if (typeof showToast === 'function') showToast('Could not read backup file');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

function renderBackupPanel() {
  const out = document.getElementById('backup-output');
  if (!out) return;

  let count = 0, sizeBytes = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('inkwell-')) {
      count++;
      sizeBytes += (localStorage.getItem(key) || '').length;
    }
  }
  const sizeKb = (sizeBytes / 1024).toFixed(1);

  out.innerHTML = `
    <div style="font-size:.8rem;margin-bottom:10px">
      ${count} saved item${count === 1 ? '' : 's'} · approx. ${sizeKb} KB stored locally
    </div>
    <button class="mini-btn" style="width:100%;margin-bottom:6px" onclick="exportFullBackup()">⬇ Download Full Backup</button>
    <button class="mini-btn" style="width:100%" onclick="triggerBackupRestore()">⬆ Restore From Backup</button>
    <input type="file" id="backup-file-input" accept="application/json" style="display:none" onchange="handleBackupRestore(event)">
    <div style="font-size:.68rem;opacity:.4;margin-top:10px;line-height:1.4">
      Includes goals, streaks, snippets, characters, outline, world bible, scratchpad notes, and all other saved Inkwell data on this device.
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  if (typeof renderBackupPanel === 'function') renderBackupPanel();
});
