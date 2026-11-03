// ============================================================================
// UI HELPERS — ikon, format, badge, modal, toast, tabel, grafik, berkas
// ============================================================================
const ICONS = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  plane: '<path d="M2 22h20"/><path d="M6.4 17.4 3 13l2-1 3 2 4-2-5-6 2-1 7 5 4-2a2 2 0 0 1 2 3.5l-12 6a2 2 0 0 1-2.6-.1z"/>',
  wallet: '<path d="M20 12V8H6a2 2 0 0 1 0-4h12v4"/><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',
  receipt: '<path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 1 .7V2l-1 .7-3-2-3 2-3-2-3 2-3-2z"/><path d="M8 8h8M8 12h8M8 16h5"/>',
  chart: '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 6-6"/>',
  idcard: '<rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="12" r="2.5"/><path d="M14 10h5M14 14h4"/>',
  usercog: '<circle cx="9" cy="8" r="4"/><path d="M2 21v-1a6 6 0 0 1 9.5-4.9"/><circle cx="18" cy="17" r="2.5"/><path d="M18 13v1.5M18 19.5V21M14.5 17H16M20 17h1.5"/>',
  history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l4 2"/>',
  printer: '<path d="M6 9V2h12v7"/><rect x="2" y="9" width="20" height="9" rx="2"/><path d="M6 14h12v8H6z"/>',
  settings: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', plusc: '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>', check: '<path d="M20 6 9 17l-5-5"/>', checkc: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  trash: '<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>',
  left: '<path d="m15 18-6-6 6-6"/>', right: '<path d="m9 18 6-6-6-6"/>', back: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
  filter: '<path d="M22 3H2l8 9.5V19l4 2v-8.5z"/>', refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>', key: '<circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.7 12.3 9.3-9.3M17 6l3 3M14 9l2 2"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>', hotel: '<path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h1M14 9h1M9 13h1M14 13h1M10 21v-4h4v4"/>',
  coins: '<circle cx="8" cy="8" r="6"/><path d="M18.1 10.4A6 6 0 1 1 10.3 18"/><path d="M7 6h1v4"/>', trend: '<path d="m23 6-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/>',
  passport: '<rect x="4" y="2" width="16" height="20" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M8 17h8"/>', send: '<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>', bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>',
  logo: '<path d="M4 21V10l8-6 8 6v11"/><path d="M9 21v-6h6v6M2 21h20"/>', moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  more: '<circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>', copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  bank: '<path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/>', power: '<path d="M18.4 6.6a9 9 0 1 1-12.8 0M12 2v10"/>'
};
const icon = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24">${ICONS[n] || ''}</svg>`;

const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const BLN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

const UI = {
  // ---------- Format ----------
  esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); },
  rp(n) { const v = Math.round(Number(n) || 0); return (v < 0 ? '-Rp ' : 'Rp ') + Math.abs(v).toLocaleString('id-ID'); },
  rpShort(n) { n = Number(n) || 0; const a = Math.abs(n); if (a >= 1e9) return 'Rp ' + (n / 1e9).toFixed(2).replace('.', ',') + ' M'; if (a >= 1e6) return 'Rp ' + (n / 1e6).toFixed(1).replace('.', ',') + ' Jt'; return UI.rp(n); },
  numFmt(n) { return (Number(n) || 0).toLocaleString('id-ID'); },
  tgl(s) { if (!s) return '-'; const p = String(s).slice(0, 10).split('-'); if (p.length < 3) return s; return +p[2] + ' ' + BLN[+p[1] - 1] + ' ' + p[0]; },
  tglPanjang(s) { if (!s) return '-'; const p = String(s).slice(0, 10).split('-'); return +p[2] + ' ' + BULAN[+p[1] - 1] + ' ' + p[0]; },
  waktu(s) { if (!s) return '-'; return UI.tgl(s) + (String(s).length > 10 ? ' • ' + String(s).slice(11, 16) : ''); },
  periode(p) { if (!p) return '-'; return BULAN[+String(p).slice(5, 7) - 1] + ' ' + String(p).slice(0, 4); },
  today() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); },
  addDays(s, n) { const d = new Date(s + 'T00:00:00'); d.setDate(d.getDate() + n); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); },
  addMonths(s, n) { const [y, m, d] = s.split('-').map(Number); const t = new Date(y, m - 1 + n, 1); const last = new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate(); return t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(Math.min(d, last)).padStart(2, '0'); },
  daysBetween(a, b) { return Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 864e5); },
  relTime(s) { if (!s) return ''; const d = new Date(String(s).replace(' ', 'T')); const m = Math.round((Date.now() - d) / 6e4); if (m < 1) return 'baru saja'; if (m < 60) return m + ' menit lalu'; if (m < 1440) return Math.round(m / 60) + ' jam lalu'; return Math.round(m / 1440) + ' hari lalu'; },
  initials(n) { return String(n || '?').replace(/^(H|Hj|Drs|Dra|Ust|Ir|Dr)\.?\s+/i, '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?'; },
  kamar(t) { return { quad: 'Quad (4 Bed)', triple: 'Triple (3 Bed)', double: 'Double (2 Bed)' }[t] || t || '-'; },

  // ---------- Badge ----------
  badge(text, kind) {
    const map = {
      'Lunas': 'ok', 'Aktif': 'ok', 'Terverifikasi': 'ok', 'Buka': 'ok', 'Dokumen Lengkap': 'info', 'Dibayar': 'ok', 'Selesai': 'off',
      'Menunggu': 'warn', 'Belum': 'warn', 'Terdaftar': 'warn', 'Hampir Penuh': 'warn',
      'Terlambat': 'bad', 'Ditolak': 'bad', 'Penuh': 'bad', 'Batal': 'bad', 'Nonaktif': 'off', 'Draft': 'off', 'Ditutup': 'off',
      'Berangkat': 'info', 'Final': 'info'
    };
    return `<span class="badge dot b-${kind || map[text] || 'off'}">${UI.esc(text)}</span>`;
  },

  // ---------- Toast ----------
  toast(msg, type = 'ok') {
    const el = document.createElement('div');
    el.className = 'toast ' + (type === 'ok' ? '' : type);
    el.innerHTML = icon(type === 'error' ? 'alert' : type === 'warn' ? 'info' : 'checkc') + '<div>' + UI.esc(msg) + '</div>';
    document.getElementById('toasts').appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; setTimeout(() => el.remove(), 300); }, type === 'error' ? 6000 : 3800);
  },

  // ---------- Modal ----------
  modal({ title, eyebrow = '', body = '', foot = '', size = '', onClose, locked = false } = {}) {
    const back = document.createElement('div');
    back.className = 'modal-back';
    back.innerHTML = `<div class="modal ${size}" role="dialog" aria-modal="true">
      <div class="modal-head"><div>${eyebrow ? `<div class="eyebrow">${eyebrow}</div>` : ''}<h3>${title}</h3></div>
      <button class="icon-btn" data-close aria-label="Tutup">${icon('x')}</button></div>
      <div class="modal-body">${body}</div>${foot ? `<div class="modal-foot">${foot}</div>` : ''}</div>`;
    document.getElementById('modalRoot').appendChild(back);
    document.body.style.overflow = 'hidden';
    const close = () => { back.remove(); if (!document.querySelector('.modal-back')) document.body.style.overflow = ''; onClose && onClose(); };
    back.addEventListener('click', e => { if (e.target.closest('[data-close]')) close(); });
    back.addEventListener('mousedown', e => { if (e.target === back) back._down = true; });
    back.addEventListener('mouseup', e => { if (e.target === back && back._down && !locked) close(); back._down = false; });
    if (locked) back.querySelector('.modal-head [data-close]').remove();
    const first = back.querySelector('input:not([type=hidden]):not([readonly]),select,textarea');
    if (first) setTimeout(() => first.focus(), 50);
    return { el: back, close, $: s => back.querySelector(s), $$: s => back.querySelectorAll(s) };
  },

  confirm(msg, { title = 'Konfirmasi', ok = 'Ya, lanjutkan', danger = false, input = null } = {}) {
    return new Promise(resolve => {
      const m = UI.modal({
        title, size: 'sm',
        body: `<p style="margin:0 0 ${input ? 12 : 0}px">${msg}</p>${input ? `<div class="field"><label>${input}</label><textarea class="input" id="cfInput" rows="2"></textarea></div>` : ''}`,
        foot: `<button class="btn" data-close>Batal</button><button class="btn ${danger ? 'danger' : 'primary'}" id="cfOk">${ok}</button>`,
        onClose: () => resolve(false)
      });
      m.$('#cfOk').onclick = () => {
        const v = input ? m.$('#cfInput').value.trim() : true;
        if (input && !v) { m.$('#cfInput').focus(); return; }
        m.el.remove(); document.body.style.overflow = ''; resolve(v);
      };
    });
  },

  // Tombol jadi loading selama promise berjalan
  async busy(btn, fn) {
    if (!btn) return fn();
    const html = btn.innerHTML; btn.disabled = true;
    btn.innerHTML = '<span class="spinner" style="width:16px;height:16px;border-width:2px"></span> Memproses...';
    try { return await fn(); } finally { btn.disabled = false; btn.innerHTML = html; }
  },

  loading(el, text = 'Memuat data...') { el.innerHTML = `<div class="page-loading"><span class="spinner"></span><span>${text}</span></div>`; },
  empty(text = 'Belum ada data.', ic = 'file') { return `<div class="empty">${icon(ic)}<div>${text}</div></div>`; },

  // ---------- Form ----------
  formData(form) {
    const o = {};
    form.querySelectorAll('[name]').forEach(el => {
      if (el.type === 'radio') { if (el.checked) o[el.name] = el.value; }
      else if (el.type === 'checkbox') o[el.name] = el.checked;
      else if (el.type !== 'file') o[el.name] = el.value.trim();
    });
    return o;
  },
  fill(form, data) {
    Object.keys(data || {}).forEach(k => {
      const els = form.querySelectorAll(`[name="${k}"]`);
      els.forEach(el => {
        if (el.type === 'radio') el.checked = el.value === String(data[k]);
        else if (el.type === 'checkbox') el.checked = !!data[k] && data[k] !== 'false';
        else if (el.type !== 'file') el.value = data[k] ?? '';
      });
    });
  },
  // Input rupiah: tampil 32.500.000, nilai asli via UI.parseRp
  parseRp(v) { return Number(String(v || '').replace(/[^\d]/g, '')) || 0; },
  bindRupiah(root) {
    root.querySelectorAll('input[data-rp]').forEach(el => {
      const f = () => { const n = UI.parseRp(el.value); el.value = n ? n.toLocaleString('id-ID') : ''; };
      el.addEventListener('input', f); f();
    });
  },
  options(list, valKey, labelFn, selected, placeholder) {
    return (placeholder !== undefined ? `<option value="">${placeholder}</option>` : '') +
      list.map(x => `<option value="${UI.esc(x[valKey])}" ${String(x[valKey]) === String(selected ?? '') ? 'selected' : ''}>${UI.esc(labelFn(x))}</option>`).join('');
  },

  // ---------- Berkas ----------
  // Baca berkas → {fileName, mimeType, base64}; gambar dikompres ke JPEG
  async readFile(file, { maxPx = APP_CONFIG.imageMaxPx, quality = 0.82, keepPng = false } = {}) {
    if (!file) return null;
    const maxB = APP_CONFIG.maxUploadMB * 1024 * 1024;
    if (/^image\/(jpeg|png|webp)$/.test(file.type)) {
      const url = URL.createObjectURL(file);
      const img = await new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = url; });
      const s = Math.min(1, maxPx / Math.max(img.width, img.height));
      const c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      const ctx = c.getContext('2d');
      const png = keepPng && file.type === 'image/png';
      if (!png) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); }
      ctx.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      const mime = png ? 'image/png' : 'image/jpeg';
      const data = c.toDataURL(mime, quality);
      const b64 = data.split(',')[1];
      if (b64.length * 0.75 > maxB) throw new Error('Gambar masih melebihi ' + APP_CONFIG.maxUploadMB + ' MB setelah dikompres.');
      return { fileName: file.name.replace(/\.\w+$/, png ? '.png' : '.jpg'), mimeType: mime, base64: b64, size: Math.round(b64.length * 0.75) };
    }
    if (file.type !== 'application/pdf') throw new Error('Format tidak didukung. Gunakan JPG, PNG, atau PDF.');
    if (file.size > maxB) throw new Error('Ukuran PDF melebihi ' + APP_CONFIG.maxUploadMB + ' MB.');
    const b64 = await new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(r.result.split(',')[1]); r.onerror = no; r.readAsDataURL(file); });
    return { fileName: file.name, mimeType: file.type, base64: b64, size: file.size };
  },
  fileSize(b) { b = Number(b) || 0; return b > 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.round(b / 1024) + ' KB'; },
  // Buka/unduh base64 (PDF & gambar) tanpa membuka folder Drive yang privat
  openBase64(b64, mime, name, download) {
    const bin = atob(b64); const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    const url = URL.createObjectURL(new Blob([arr], { type: mime }));
    if (download) { const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); }
    else { const w = window.open(url, '_blank'); if (!w) { const a = document.createElement('a'); a.href = url; a.download = name; a.click(); } }
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  },
  async viewFile(fileId, btn) {
    const r = await UI.busy(btn, () => Api.safe('getFile', { fileId }));
    if (r) UI.openBase64(r.data.base64, r.data.mimeType, r.data.name);
  },
  async pdf(action, data, btn, download = true) {
    const r = await UI.busy(btn, () => Api.safe(action, data));
    if (r) { UI.openBase64(r.data.base64, 'application/pdf', r.data.name, download); UI.toast('PDF dibuat & tersimpan di Google Drive.'); }
    return r;
  },
  csv(name, rows, cols) {
    const q = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
    const text = '﻿' + [cols.map(c => q(c.label)).join(';')].concat(rows.map(r => cols.map(c => q(typeof c.get === 'function' ? c.get(r) : r[c.key])).join(';'))).join('\n');
    const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = name + '.csv'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  },
  copy(text) { navigator.clipboard?.writeText(text).then(() => UI.toast('Disalin ke clipboard.')); },

  // ---------- Tabel dengan pencarian & paginasi ----------
  table(el, { columns, rows, pageSize = APP_CONFIG.pageSize, emptyText = 'Belum ada data.', rowClass, onRender, footNote = '' }) {
    const st = { page: 1, rows };
    const draw = () => {
      const total = st.rows.length, pages = Math.max(1, Math.ceil(total / pageSize));
      st.page = Math.min(st.page, pages);
      const slice = st.rows.slice((st.page - 1) * pageSize, st.page * pageSize);
      const head = '<tr>' + columns.map(c => `<th class="${c.cls || ''}">${c.label}</th>`).join('') + '</tr>';
      const body = slice.length ? slice.map(r => `<tr class="${rowClass ? rowClass(r) : ''}">` + columns.map(c => `<td class="${c.cls || ''}">${c.render ? c.render(r) : UI.esc(r[c.key])}</td>`).join('') + '</tr>').join('')
        : `<tr><td colspan="${columns.length}">${UI.empty(emptyText)}</td></tr>`;
      let pg = '';
      if (pages > 1) {
        const nums = []; for (let i = 1; i <= pages; i++) if (i === 1 || i === pages || Math.abs(i - st.page) <= 1) nums.push(i); else if (nums[nums.length - 1] !== '…') nums.push('…');
        pg = `<div class="pager"><button data-p="${st.page - 1}" ${st.page === 1 ? 'disabled' : ''}>${icon('left')}</button>` + nums.map(n => n === '…' ? '<button disabled>…</button>' : `<button data-p="${n}" class="${n === st.page ? 'on' : ''}">${n}</button>`).join('') + `<button data-p="${st.page + 1}" ${st.page === pages ? 'disabled' : ''}>${icon('right')}</button></div>`;
      }
      el.innerHTML = `<div class="tbl-wrap"><table class="tbl"><thead>${head}</thead><tbody>${body}</tbody></table></div>
        <div class="tbl-foot"><span>Menampilkan ${total ? (st.page - 1) * pageSize + 1 : 0}–${Math.min(total, st.page * pageSize)} dari <b>${total}</b> data ${footNote}</span>${pg}</div>`;
      el.querySelectorAll('[data-p]').forEach(b => b.onclick = () => { st.page = +b.dataset.p; draw(); });
      onRender && onRender(el);
    };
    draw();
    return { setRows(r) { st.rows = r; st.page = 1; draw(); }, redraw: draw };
  },

  // Ring kelengkapan dokumen x/4
  ring(n, of = 4) {
    const p = n / of, c = 2 * Math.PI * 16, col = p >= 1 ? 'var(--primary)' : p >= .5 ? 'var(--gold)' : 'var(--bad)';
    return `<span class="ring"><svg viewBox="0 0 38 38"><circle cx="19" cy="19" r="16" stroke="var(--surface-mid)" stroke-width="3.5" fill="none"/><circle cx="19" cy="19" r="16" stroke="${col}" stroke-width="3.5" fill="none" stroke-dasharray="${c * p} ${c}" stroke-linecap="round"/></svg>${n}/${of}</span>`;
  },

  // Grafik batang ganda (pemasukan vs pengeluaran)
  barChart(data, { h = 240, labels = d => d.label } = {}) {
    if (!data.length) return UI.empty('Belum ada data grafik.', 'chart');
    const W = 640, pad = { l: 52, r: 10, t: 16, b: 30 };
    const max = Math.max(1, ...data.map(d => Math.max(d.a, d.b))) * 1.1;
    const step = (W - pad.l - pad.r) / data.length, bw = Math.min(26, step / 3.2);
    const y = v => pad.t + (h - pad.t - pad.b) * (1 - v / max);
    let g = '';
    for (let i = 0; i <= 4; i++) { const v = max / 4 * i; g += `<line class="grid-l" x1="${pad.l}" x2="${W - pad.r}" y1="${y(v)}" y2="${y(v)}"/><text x="${pad.l - 8}" y="${y(v) + 4}" text-anchor="end">${v >= 1e9 ? (v / 1e9).toFixed(1) + 'M' : v >= 1e6 ? Math.round(v / 1e6) + 'Jt' : v >= 1e3 ? Math.round(v / 1e3) + 'rb' : Math.round(v)}</text>`; }
    data.forEach((d, i) => {
      const cx = pad.l + step * i + step / 2;
      g += `<rect class="bar-in" x="${cx - bw - 2}" y="${y(d.a)}" width="${bw}" height="${Math.max(0, h - pad.b - y(d.a))}" rx="3"><title>Pemasukan ${UI.rp(d.a)}</title></rect>`;
      g += `<rect class="bar-out" x="${cx + 2}" y="${y(d.b)}" width="${bw}" height="${Math.max(0, h - pad.b - y(d.b))}" rx="3"><title>Pengeluaran ${UI.rp(d.b)}</title></rect>`;
      g += `<text x="${cx}" y="${h - 10}" text-anchor="middle" ${d.now ? 'style="font-weight:700;fill:var(--text)"' : ''}>${UI.esc(labels(d))}</text>`;
    });
    return `<svg class="chart" viewBox="0 0 ${W} ${h}" preserveAspectRatio="none" style="height:${h}px">${g}</svg>`;
  }
};
