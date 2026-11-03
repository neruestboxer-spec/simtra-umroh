// ============================================================================
// API CLIENT — semua komunikasi ke GAS lewat fetch POST (text/plain → tanpa CORS preflight)
// ============================================================================
const Api = {
  token: sessionStorage.getItem('simtra_token') || '',

  setToken(t) {
    this.token = t || '';
    if (t) sessionStorage.setItem('simtra_token', t); else sessionStorage.removeItem('simtra_token');
  },

  async call(action, data = {}, opts = {}) {
    const bar = document.getElementById('topload');
    if (!opts.silent && bar) { bar.className = 'topload on'; }
    try {
      if (GAS_URL.indexOf('GANTI_DENGAN') >= 0) throw new Error('GAS_URL di js/config.js belum diisi URL Web App Apps Script.');
      const res = await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // WAJIB text/plain
        body: JSON.stringify({ action, data, token: this.token }),
        redirect: 'follow'
      });
      const text = await res.text();
      let json;
      try { json = JSON.parse(text); } catch (e) { throw new Error('Respons server tidak valid. Pastikan Web App di-deploy dengan akses "Anyone".'); }
      if (!json.success) {
        if (json.code === 'SESSION') { this.setToken(''); if (window.App) App.sessionExpired(json.message); }
        const err = new Error(json.message || 'Terjadi kesalahan.');
        err.code = json.code; throw err;
      }
      return json;
    } catch (err) {
      if (err instanceof TypeError) err = new Error('Tidak dapat terhubung ke server. Periksa koneksi internet atau GAS_URL.');
      throw err;
    } finally {
      if (!opts.silent && bar) { bar.className = 'topload done'; setTimeout(() => bar.className = 'topload', 600); }
    }
  },

  // Versi aman: menampilkan toast bila gagal, mengembalikan null
  async safe(action, data, opts) {
    try { return await this.call(action, data, opts); }
    catch (e) { if (e.code !== 'SESSION') UI.toast(e.message, 'error'); return null; }
  },

  async ping() {
    try {
      const r = await fetch(GAS_URL + '?action=ping');
      return await r.json();
    } catch (e) { return null; }
  }
};
