// ============================================================================
// APP — login, shell, navigasi (SPA hash router), pencarian global, tema
// ============================================================================
const NAV = [
  { group: 'UTAMA', items: [
    { key: 'dashboard', label: 'Dashboard', ic: 'grid', mod: 'dashboard' },
    { key: 'jemaah', label: 'Data Jemaah', ic: 'users', mod: 'jemaah' },
    { key: 'paket', label: 'Paket & Harga', ic: 'briefcase', mod: 'paket' },
    { key: 'keberangkatan', label: 'Jadwal Keberangkatan', ic: 'plane', mod: 'keberangkatan' }] },
  { group: 'TRANSAKSI', items: [
    { key: 'pembayaran', label: 'Pembayaran Jemaah', ic: 'wallet', mod: 'pembayaran' },
    { key: 'cicilan', label: 'Skema Cicilan', ic: 'calendar', mod: 'cicilan' },
    { key: 'pengeluaran', label: 'Pengeluaran Operasional', ic: 'receipt', mod: 'pengeluaran' }] },
  { group: 'LAPORAN & SDM', tag: 'OWNER', items: [
    { key: 'laporan', label: 'Laporan Keuangan', ic: 'chart', mod: 'laporan' },
    { key: 'karyawan', label: 'Karyawan & Payroll', ic: 'idcard', mod: 'karyawan' },
    { key: 'pengguna', label: 'Manajemen Pengguna', ic: 'usercog', mod: 'pengguna' },
    { key: 'log', label: 'Riwayat Aktivitas', ic: 'history', mod: 'log' }] },
  { group: 'PENGATURAN', items: [
    { key: 'pengaturan', label: 'Pengaturan Sistem', ic: 'settings', mod: 'pengaturan' }] }
];
const Pages = window.Pages || (window.Pages = {});

const App = {
  state: { user: null, perms: {}, settings: {}, paket: [], kb: [], counts: {} },
  cache: {},
  $: s => document.querySelector(s),

  can(mod, op = 'R') { return (this.state.perms[mod] || '').indexOf(op) >= 0; },
  isOwner() { return this.state.user && this.state.user.peran === 'Owner'; },

  // ---------- Init ----------
  async init() {
    this.applyTheme(localStorage.getItem('simtra_theme') || 'light');
    this.bindLogin();
    this.bindShell();
    if (Api.token) await this.boot(); else this.showLogin();
  },

  showLogin(msg) {
    this.$('#appView').classList.add('hidden');
    this.$('#loginView').classList.remove('hidden');
    this.$('#loginAlert').innerHTML = msg ? `<div class="alert warn">${icon('info')}<div>${UI.esc(msg)}</div></div>` : '';
    document.title = 'Masuk — ' + APP_CONFIG.appName;
    setTimeout(() => this.$('#lgUser').focus(), 50);
    Api.ping().then(r => {
      const el = this.$('#srvStatus');
      if (!r) el.innerHTML = '<span style="color:var(--bad)">● Server tidak terjangkau — periksa GAS_URL di js/config.js</span>';
      else if (!r.ready) el.innerHTML = '<span style="color:var(--warn)">● Server belum di-setup — jalankan setupAppEnvironment()</span>';
      else el.innerHTML = '<span style="color:var(--ok)">● Server terhubung</span> • v' + UI.esc(r.version);
    });
  },

  bindLogin() {
    this.$('#lgEye').onclick = () => { const p = this.$('#lgPass'); p.type = p.type === 'password' ? 'text' : 'password'; };
    this.$('#loginForm').onsubmit = async e => {
      e.preventDefault();
      const btn = this.$('#lgBtn');
      this.$('#loginAlert').innerHTML = '';
      try {
        const r = await UI.busy(btn, () => Api.call('login', { username: this.$('#lgUser').value, password: this.$('#lgPass').value }));
        Api.setToken(r.data.token);
        this.$('#lgPass').value = '';
        if (r.data.wajib_ganti_password) await this.changePassword(true);
        await this.boot();
      } catch (err) {
        this.$('#loginAlert').innerHTML = `<div class="alert bad">${icon('alert')}<div>${UI.esc(err.message)}</div></div>`;
      }
    };
  },

  async boot() {
    try {
      const r = await Api.call('getBootstrap');
      const d = r.data;
      Object.assign(this.state, { user: d.user, perms: d.perms, settings: d.settings, paket: d.paket, kb: d.keberangkatan });
      if (d.wajib_ganti_password) await this.changePassword(true);
      this.renderShell();
      this.$('#loginView').classList.add('hidden');
      this.$('#appView').classList.remove('hidden');
      if (!location.hash || location.hash === '#/') location.hash = '#/dashboard'; else this.route();
      this.refreshCounts();
    } catch (err) {
      Api.setToken('');
      this.showLogin(err.message);
    }
  },

  sessionExpired(msg) {
    document.querySelectorAll('.modal-back').forEach(m => m.remove());
    document.body.style.overflow = '';
    this.state.user = null; this.cache = {};
    this.showLogin(msg || 'Sesi berakhir. Silakan login kembali.');
  },

  async logout() {
    if (!(await UI.confirm('Keluar dari aplikasi?', { ok: 'Keluar' }))) return;
    Api.call('logout', {}, { silent: true }).catch(() => { });
    Api.setToken(''); this.cache = {}; this.state.user = null;
    location.hash = '';
    this.showLogin('Anda telah keluar.');
  },

  // Muat ulang data master (paket & jadwal) setelah perubahan
  async refreshMaster() {
    const r = await Api.safe('getBootstrap', {}, { silent: true });
    if (r) { this.state.paket = r.data.paket; this.state.kb = r.data.keberangkatan; this.state.settings = r.data.settings; }
    this.cache = {};
  },

  async refreshCounts() {
    if (!this.can('dashboard')) return;
    const r = await Api.safe('getDashboard', {}, { silent: true });
    if (!r) return;
    this.state.counts = { menunggu: r.data.menunggu_verifikasi, jatuhTempo: r.data.cicilan_minggu_ini };
    this.$('#bellDot').classList.toggle('hidden', !(r.data.menunggu_verifikasi || r.data.cicilan_minggu_ini));
    const pb = document.querySelector('.sb-link[data-key="pembayaran"] .count');
    if (pb) { pb.textContent = r.data.menunggu_verifikasi; pb.classList.toggle('hidden', !r.data.menunggu_verifikasi || !this.can('pembayaran', 'V')); }
  },

  // ---------- Shell ----------
  renderShell() {
    const s = this.state.settings, u = this.state.user;
    const logo = s.logo ? `<img src="${s.logo}" alt="logo">` : icon('logo');
    ['#sbLogo', '#loginLogo'].forEach(id => this.$(id).innerHTML = logo);
    this.$('#sbBrand').textContent = s.nama_brand || APP_CONFIG.appName;
    this.$('#loginBrand').textContent = s.nama_brand || APP_CONFIG.appName;
    this.$('#loginFooter').textContent = '© ' + (s.nama_perusahaan || '');
    this.$('#sbName').textContent = u.nama_lengkap;
    this.$('#sbRole').textContent = u.peran === 'Owner' ? 'Owner / Pimpinan' : (u.jabatan || 'Karyawan') + (u.akses_admin ? ' • Admin' : '');
    this.$('#sbAvatar').textContent = this.$('#topAvatar').textContent = UI.initials(u.nama_lengkap);
    this.$('#modePill').textContent = 'Mode: ' + (u.peran === 'Owner' ? 'Owner' : u.akses_admin ? 'Karyawan + Admin' : 'Karyawan');
    this.$('#sbNav').innerHTML = NAV.map(g => {
      const items = g.items.filter(i => this.can(i.mod));
      if (!items.length) return '';
      return `<div class="sb-group">${g.group}${g.tag && this.isOwner() ? `<span class="tag">${g.tag}</span>` : ''}</div>` +
        items.map(i => `<a class="sb-link" href="#/${i.key}" data-key="${i.key}">${icon(i.ic)}<span>${i.label}</span>${i.key === 'pembayaran' ? '<span class="count hidden">0</span>' : ''}</a>`).join('');
    }).join('');
    if (this.current) document.querySelectorAll('.sb-link').forEach(a => a.classList.toggle('active', a.dataset.key === this.current.key));
    this.$('#gTopCta').innerHTML = this.can('pembayaran', 'C') ? `<button class="btn gold" id="btnTopCta">${icon('plusc')}<span class="btn-label">Transaksi Baru</span></button>` : '';
    const cta = this.$('#btnTopCta'); if (cta) cta.onclick = () => Forms.pembayaran({});
  },

  bindShell() {
    this.$('#btnLogout').onclick = () => this.logout();
    this.$('#btnMenu').onclick = () => document.body.classList.toggle('nav-open');
    this.$('#scrim').onclick = () => document.body.classList.remove('nav-open');
    this.$('#btnTheme').onclick = () => this.applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
    this.$('#topAvatar').onclick = () => this.profile();
    this.$('#btnBell').onclick = () => this.notifications();
    window.addEventListener('hashchange', () => this.route());
    // Pencarian global jemaah
    const inp = this.$('#globalSearch'), box = this.$('#searchResults');
    let t;
    inp.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => this.globalSearch(inp.value), 250); });
    inp.addEventListener('focus', () => { if (inp.value) this.globalSearch(inp.value); });
    document.addEventListener('click', e => { if (!e.target.closest('.search')) box.classList.add('hidden'); });
    inp.addEventListener('keydown', e => { if (e.key === 'Escape') { box.classList.add('hidden'); inp.blur(); } });
  },

  applyTheme(t) {
    document.documentElement.dataset.theme = t;
    localStorage.setItem('simtra_theme', t);
    const b = this.$('#btnTheme'); if (b) b.innerHTML = icon(t === 'dark' ? 'sun' : 'moon');
  },

  async jemaahCache(force) {
    if (!force && this.cache.jemaah && Date.now() - this.cache.jemaahAt < 120000) return this.cache.jemaah;
    const r = await Api.safe('listJemaah', {}, { silent: true });
    if (r) { this.cache.jemaah = r.data; this.cache.jemaahAt = Date.now(); }
    return this.cache.jemaah || [];
  },

  async globalSearch(q) {
    const box = this.$('#searchResults');
    q = q.trim().toLowerCase();
    if (q.length < 2 || !this.can('jemaah')) { box.classList.add('hidden'); return; }
    box.classList.remove('hidden');
    box.innerHTML = '<div style="padding:14px" class="muted small">Mencari...</div>';
    const list = await this.jemaahCache();
    const hit = list.filter(j => [j.nama_lengkap, j.nik, j.no_paspor, j.no_registrasi, j.no_hp].join(' ').toLowerCase().includes(q)).slice(0, 8);
    box.innerHTML = hit.length ? hit.map(j => `<a href="#/jemaah/${j.id}"><div class="avatar" style="width:32px;height:32px;font-size:11px">${UI.initials(j.nama_lengkap)}</div><div><b>${UI.esc(j.nama_lengkap)}</b><div class="xs muted">${UI.esc(j.no_registrasi)} • Paspor ${UI.esc(j.no_paspor || '-')} • ${UI.esc(j.status)}</div></div></a>`).join('')
      : '<div style="padding:14px" class="muted small">Tidak ada jemaah yang cocok.</div>';
    box.querySelectorAll('a').forEach(a => a.onclick = () => { box.classList.add('hidden'); this.$('#globalSearch').value = ''; });
  },

  // ---------- Router ----------
  route() {
    if (!this.state.user) return;
    const [key, param] = (location.hash.replace(/^#\/?/, '') || 'dashboard').split('/');
    const page = Pages[key];
    const nav = NAV.flatMap(g => g.items).find(i => i.key === key);
    if (!page) { location.hash = '#/dashboard'; return; }
    if (nav && !this.can(nav.mod)) { UI.toast('Anda tidak memiliki akses ke halaman tersebut.', 'error'); location.hash = '#/dashboard'; return; }
    document.querySelectorAll('.sb-link').forEach(a => a.classList.toggle('active', a.dataset.key === key));
    document.body.classList.remove('nav-open');
    this.$('#crumb').innerHTML = (page.group || 'Beranda') + ' ' + icon('right') + ' <b>' + (nav ? nav.label : page.title) + '</b>';
    document.title = (nav ? nav.label : page.title) + ' — ' + (this.state.settings.nama_brand || APP_CONFIG.appName);
    const view = this.$('#view');
    UI.loading(view);
    window.scrollTo(0, 0);
    this.current = { key, param };
    Promise.resolve(page.render(view, param)).catch(err => {
      if (err && err.code === 'SESSION') return;
      view.innerHTML = `<div class="card card-pad"><div class="alert bad">${icon('alert')}<div>${UI.esc(err.message || err)}</div></div><button class="btn" onclick="App.route()">${icon('refresh')} Coba lagi</button></div>`;
    });
  },
  reload() { this.route(); },

  // ---------- Profil & password ----------
  profile() {
    const u = this.state.user;
    const m = UI.modal({
      title: UI.esc(u.nama_lengkap), eyebrow: 'Profil Saya', size: 'sm',
      body: `<dl class="kv"><dt>Username</dt><dd class="mono">${UI.esc(u.username)}</dd><dt>Peran</dt><dd>${UI.esc(u.peran)}${u.akses_admin ? ' + Akses Admin' : ''}</dd><dt>Jabatan</dt><dd>${UI.esc(u.jabatan || '-')}</dd><dt>Email</dt><dd>${UI.esc(u.email || '-')}</dd></dl>
        <div class="alert info" style="margin-top:16px">${icon('shield')}<div>Hak akses Anda: ${Object.entries(this.state.perms).map(([k, v]) => `<span class="pill">${k} ${v}</span>`).join(' ')}</div></div>`,
      foot: `<button class="btn" id="pfPass">${icon('key')} Ganti Password</button><button class="btn danger" id="pfOut">${icon('power')} Keluar</button>`
    });
    m.$('#pfPass').onclick = () => { m.close(); this.changePassword(false); };
    m.$('#pfOut').onclick = () => { m.close(); this.logout(); };
  },

  changePassword(forced) {
    return new Promise(resolve => {
      const m = UI.modal({
        title: forced ? 'Buat Password Baru' : 'Ganti Password', eyebrow: forced ? 'Wajib — login pertama' : 'Keamanan Akun', size: 'sm',
        body: `${forced ? `<div class="alert warn">${icon('info')}<div>Anda masih memakai password sementara. Buat password pribadi sebelum melanjutkan.</div></div>` : ''}
          <form id="cpForm" class="grid" style="gap:12px">
            <div class="field"><label>Password lama / sementara</label><input class="input" type="password" name="lama" required autocomplete="current-password"></div>
            <div class="field"><label>Password baru</label><input class="input" type="password" name="baru" required minlength="8" autocomplete="new-password"><span class="hint">Minimal 8 karakter, berisi huruf dan angka.</span></div>
            <div class="field"><label>Ulangi password baru</label><input class="input" type="password" name="ulang" required autocomplete="new-password"></div>
          </form>`,
        foot: `${forced ? '' : '<button class="btn" data-close>Batal</button>'}<button class="btn primary" id="cpSave">Simpan Password</button>`,
        onClose: () => resolve(), locked: forced
      });
      m.$('#cpSave').onclick = async e => {
        const d = UI.formData(m.$('#cpForm'));
        if (d.baru !== d.ulang) return UI.toast('Konfirmasi password tidak sama.', 'error');
        const r = await UI.busy(e.currentTarget, () => Api.safe('changePassword', d));
        if (r) { UI.toast(r.message); m.close(); }
      };
    });
  },

  notifications() {
    const c = this.state.counts || {};
    const m = UI.modal({
      title: 'Notifikasi', eyebrow: 'Perlu tindakan', size: 'sm',
      body: `<div class="list-item"><div class="li-ico" style="background:var(--warn-bg);color:var(--warn)">${icon('wallet')}</div><div style="flex:1"><b>${c.menunggu || 0} pembayaran</b> menunggu verifikasi<div class="xs muted">Bukti transfer perlu dicek owner/admin</div></div><a class="btn sm" href="#/pembayaran" data-close>Buka</a></div>
        <div class="list-item"><div class="li-ico" style="background:var(--bad-bg);color:var(--bad)">${icon('clock')}</div><div style="flex:1"><b>${c.jatuhTempo || 0} cicilan</b> jatuh tempo ≤ 7 hari / terlambat<div class="xs muted">Pengingat email terkirim otomatis setiap pagi</div></div><a class="btn sm" href="#/cicilan/tunggakan" data-close>Buka</a></div>`
    });
    this.refreshCounts();
    return m;
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
