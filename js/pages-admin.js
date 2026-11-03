// ============================================================================
// HALAMAN OWNER — Karyawan & Payroll, Manajemen Pengguna (RBAC), Riwayat Aktivitas, Pengaturan
// ============================================================================
window.Pages = window.Pages || {};
window.Forms = window.Forms || {};

// ============================== KARYAWAN & PAYROLL ==============================
Pages.karyawan = {
  title: 'Karyawan & Payroll', group: 'Laporan & SDM', periode: null,
  async render(el, tab) {
    tab = tab || 'payroll';
    el.innerHTML = `<div class="page-head"><div><div class="eyebrow">Laporan & SDM • <span class="badge b-gold">Akses Owner</span></div><h1>Manajemen Karyawan & Penggajian</h1>
      <p>Gaji bersih = gaji pokok + tunjangan + bonus/komisi − potongan. Payroll berstatus Final terkunci; perubahan wajib beralasan dan tercatat.</p></div>
      <div class="actions" id="kyAct"></div></div>
      <div class="tabs mb" style="display:inline-flex"><button data-t="payroll" class="${tab === 'payroll' ? 'on' : ''}">${icon('wallet')} Penggajian Periode</button><button data-t="direktori" class="${tab === 'direktori' ? 'on' : ''}">${icon('idcard')} Direktori Karyawan</button></div>
      <div id="kyBody"><div class="page-loading"><span class="spinner"></span></div></div>`;
    el.querySelectorAll('[data-t]').forEach(b => b.onclick = () => location.hash = '#/karyawan/' + b.dataset.t);
    const body = el.querySelector('#kyBody'), act = el.querySelector('#kyAct');
    if (tab === 'direktori') return this.direktori(body, act);
    return this.payroll(body, act);
  },

  async payroll(body, act) {
    const r = (await Api.call('listPayroll', { periode: this.periode || '' })).data;
    this.periode = r.periode;
    const rows = r.rows, sum = k => rows.reduce((s, x) => s + x[k], 0);
    const st = s => rows.filter(x => x.status === s).length;
    act.innerHTML = `<input class="input" type="month" id="prP" value="${this.periode}" style="width:170px"><button class="btn" id="prBank">${icon('download')} Ekspor Bank (.csv)</button><button class="btn gold" id="prGen">${icon('plusc')} Proses Periode</button>`;
    body.innerHTML = `<div class="grid g4 mb">
        <div class="card kpi"><div class="lbl">Total Beban Payroll</div><div class="ico mint">${icon('coins')}</div><div class="val money">${UI.rp(sum('gaji_bersih'))}</div><div class="sub">${rows.length} staf • ${st('Dibayar')} dibayar • ${st('Draft')} draft</div></div>
        <div class="card kpi"><div class="lbl">Gaji Pokok & Tunjangan</div><div class="ico">${icon('bank')}</div><div class="val money">${UI.rp(sum('gaji_pokok') + sum('tunjangan'))}</div><div class="sub">Komitmen tetap SDM</div></div>
        <div class="card kpi"><div class="lbl">Komisi & Bonus</div><div class="ico gold">${icon('trend')}</div><div class="val money" style="color:#7c5800">${UI.rp(sum('bonus'))}</div><div class="sub">Komisi penjualan paket & kloter</div></div>
        <div class="card kpi"><div class="lbl">Potongan & Pajak</div><div class="ico red">${icon('receipt')}</div><div class="val money">${UI.rp(sum('potongan'))}</div><div class="sub">BPJS, PPh 21, kasbon</div></div>
      </div>
      <div class="card"><div class="card-head"><div><h3>Penggajian ${UI.periode(this.periode)}</h3><p>Centang baris untuk aksi massal</p></div>
        <div class="actions"><button class="btn sm" data-bulk="Final">${icon('lock')} Finalkan</button><button class="btn sm primary" data-bulk="Dibayar">${icon('checkc')} Tandai Dibayar</button><button class="btn sm gold" id="prMail">${icon('mail')} Kirim Slip via Gmail</button></div></div>
        <div id="prT"></div></div>`;
    const sel = new Set();
    UI.table(body.querySelector('#prT'), {
      rows, pageSize: 20, emptyText: 'Belum ada payroll periode ini. Klik "Proses Periode" untuk membuat draft dari data karyawan aktif.',
      columns: [
        { label: '<input type="checkbox" id="prAll">', render: x => `<input type="checkbox" data-sel="${x.id}" ${sel.has(x.id) ? 'checked' : ''}>` },
        { label: 'Karyawan', render: x => `<div style="display:flex;gap:10px;align-items:center"><div class="avatar">${UI.initials(x.nama)}</div><div class="name"><b>${UI.esc(x.nama)}</b><small>${UI.esc(x.jabatan)}</small></div></div>` },
        { label: 'Rekening', render: x => `<div class="name"><b style="font-weight:500">${UI.esc(x.bank || '-')}</b><small class="mono">${UI.esc(x.no_rekening)}</small></div>` },
        { label: 'Gaji Pokok', cls: 'r', render: x => UI.rp(x.gaji_pokok) }, { label: 'Tunjangan', cls: 'r', render: x => UI.rp(x.tunjangan) },
        { label: 'Bonus', cls: 'r', render: x => `<span style="color:#7c5800">${UI.rp(x.bonus)}</span>` }, { label: 'Potongan', cls: 'r', render: x => `<span style="color:var(--bad)">${x.potongan ? '-' + UI.rp(x.potongan) : UI.rp(0)}</span>` },
        { label: 'Take Home', cls: 'r', render: x => `<b>${UI.rp(x.gaji_bersih)}</b>` }, { label: 'Status', render: x => UI.badge(x.status) + (x.tanggal_bayar ? `<div class="xs muted">${UI.tgl(x.tanggal_bayar)}</div>` : '') },
        { label: '', cls: 'r', render: x => `<div class="row-actions">${x.status !== 'Dibayar' ? `<button class="btn icon" data-e="${x.id}" title="Ubah">${icon('edit')}</button>` : ''}<button class="btn icon" data-slip="${x.id}" title="Slip PDF">${icon('printer')}</button></div>` }
      ],
      onRender: t => {
        t.querySelectorAll('[data-sel]').forEach(c => c.onchange = () => c.checked ? sel.add(c.dataset.sel) : sel.delete(c.dataset.sel));
        const all = t.querySelector('#prAll'); if (all) all.onchange = () => t.querySelectorAll('[data-sel]').forEach(c => { c.checked = all.checked; c.onchange(); });
        t.querySelectorAll('[data-e]').forEach(b => b.onclick = () => this.editPayroll(rows.find(x => x.id === b.dataset.e)));
        t.querySelectorAll('[data-slip]').forEach(b => b.onclick = () => UI.pdf('slipPdf', { id: b.dataset.slip }, b, false));
      }
    });
    const need = () => { if (!sel.size) { UI.toast('Centang minimal satu karyawan.', 'warn'); return false; } return true; };
    body.querySelectorAll('[data-bulk]').forEach(b => b.onclick = async () => {
      if (!need()) return;
      const s = b.dataset.bulk;
      if (!(await UI.confirm(`Ubah ${sel.size} slip menjadi <b>${s}</b>?${s === 'Final' ? ' Slip Final terkunci dari perubahan biasa.' : ''}`, { ok: 'Ya, ' + s }))) return;
      const r = await Api.safe('setPayrollStatus', { ids: [...sel], status: s }); if (r) { UI.toast(r.message); App.reload(); }
    });
    body.querySelector('#prMail').onclick = async e => {
      if (!need()) return;
      if (!(await UI.confirm(`Kirim slip gaji PDF ke email ${sel.size} karyawan? (hanya slip berstatus Final/Dibayar)`, { ok: 'Kirim' }))) return;
      const r = await UI.busy(e.currentTarget, () => Api.safe('emailSlip', { ids: [...sel] })); if (r) UI.toast(r.message, r.message.includes('Gagal') ? 'warn' : 'ok');
    };
    act.querySelector('#prP').onchange = ev => { this.periode = ev.target.value; App.reload(); };
    act.querySelector('#prGen').onclick = async e => {
      const p = act.querySelector('#prP').value;
      if (!(await UI.confirm(`Buat draft payroll <b>${UI.periode(p)}</b> untuk semua karyawan aktif yang belum punya slip periode ini?`, { ok: 'Proses' }))) return;
      const r = await UI.busy(e.currentTarget, () => Api.safe('generatePayroll', { periode: p })); if (r) { UI.toast(r.message); this.periode = p; App.reload(); }
    };
    act.querySelector('#prBank').onclick = () => UI.csv('Batch_Transfer_' + this.periode, rows.filter(x => x.status !== 'Draft'), [{ label: 'Nama', key: 'nama' }, { label: 'Bank', key: 'bank' }, { label: 'No Rekening', get: x => "'" + x.no_rekening }, { label: 'Nominal', key: 'gaji_bersih' }, { label: 'Keterangan', get: () => 'Gaji ' + UI.periode(this.periode) }]);
  },

  editPayroll(x) {
    const m = UI.modal({
      title: UI.esc(x.nama), eyebrow: 'Payroll ' + UI.periode(x.periode) + ' • ' + x.status, size: 'sm',
      body: `${x.status === 'Final' ? `<div class="alert warn">${icon('lock')}<div>Slip berstatus <b>Final</b>. Perubahan wajib disertai alasan dan tercatat di riwayat aktivitas.</div></div>` : ''}
        <form id="fPr" class="grid" style="gap:12px"><div class="field"><label>Gaji pokok</label><input class="input" name="gaji_pokok" data-rp></div><div class="field"><label>Tunjangan</label><input class="input" name="tunjangan" data-rp></div>
        <div class="field"><label>Bonus / komisi</label><input class="input" name="bonus" data-rp></div><div class="field"><label>Potongan (BPJS, PPh 21, kasbon)</label><input class="input" name="potongan" data-rp></div>
        <div class="field"><label>Catatan</label><input class="input" name="catatan" placeholder="Komisi 22 pax kloter NOV-01, kasbon termin 2/3..."></div>
        ${x.status === 'Final' ? '<div class="field"><label>Alasan perubahan <span class="req">*</span></label><input class="input" name="alasan"></div>' : ''}</form>
        <div class="sisa-box" style="margin-top:14px;text-align:center"><div class="eyebrow">Take Home Pay</div><div class="big" id="prNet"></div></div>`,
      foot: `<button class="btn" data-close>Batal</button><button class="btn primary" id="fPrSave">Simpan</button>`
    });
    const f = m.$('#fPr'); UI.fill(f, x); UI.bindRupiah(f);
    const calc = () => { const d = UI.formData(f); m.$('#prNet').textContent = UI.rp(UI.parseRp(d.gaji_pokok) + UI.parseRp(d.tunjangan) + UI.parseRp(d.bonus) - UI.parseRp(d.potongan)); };
    f.addEventListener('input', calc); calc();
    m.$('#fPrSave').onclick = async e => {
      const d = UI.formData(f); ['gaji_pokok', 'tunjangan', 'bonus', 'potongan'].forEach(k => d[k] = UI.parseRp(d[k])); d.id = x.id;
      const r = await UI.busy(e.currentTarget, () => Api.safe('savePayroll', d)); if (r) { UI.toast(r.message); m.close(); App.reload(); }
    };
  },

  async direktori(body, act) {
    const [kr, us] = await Promise.all([Api.call('listKaryawan'), Api.safe('listPengguna', {}, { silent: true })]);
    const list = kr.data, users = us ? us.data : [];
    act.innerHTML = `<button class="btn gold" id="kyAdd">${icon('plus')} Tambah Karyawan</button>`;
    body.innerHTML = `<div class="card"><div class="toolbar"><div class="search-in">${icon('search')}<input class="input" id="kyQ" placeholder="Cari nama, jabatan..."></div></div><div id="kyT"></div></div>`;
    const tbl = UI.table(body.querySelector('#kyT'), {
      rows: list, emptyText: 'Belum ada data karyawan.',
      columns: [{ label: 'Karyawan', render: k => `<div style="display:flex;gap:10px;align-items:center"><div class="avatar">${UI.initials(k.nama)}</div><div class="name"><b>${UI.esc(k.nama)}</b><small>${UI.esc(k.jabatan)} • masuk ${UI.tgl(k.tanggal_masuk)}</small></div></div>` },
        { label: 'Kontak', render: k => `<div class="name"><b style="font-weight:500">${UI.esc(k.email || '-')}</b><small>${UI.esc(k.no_hp || '')}</small></div>` },
        { label: 'Rekening', render: k => `<div class="name"><b style="font-weight:500">${UI.esc(k.bank || '-')}</b><small class="mono">${UI.esc(k.no_rekening || '')}</small></div>` },
        { label: 'Gaji Pokok', cls: 'r', render: k => UI.rp(k.gaji_pokok) }, { label: 'Tunjangan Tetap', cls: 'r', render: k => UI.rp(k.tunjangan_tetap) },
        { label: 'Akun', render: k => { const u = users.find(x => x.id === k.id_pengguna); return u ? `<span class="pill">@${UI.esc(u.username)}</span>` : '<span class="xs muted">-</span>'; } },
        { label: 'Status', render: k => UI.badge(k.status || 'Aktif') },
        { label: '', cls: 'r', render: k => `<div class="row-actions"><button class="btn icon" data-e="${k.id}">${icon('edit')}</button><button class="btn icon" data-d="${k.id}">${icon('trash')}</button></div>` }],
      onRender: t => {
        t.querySelectorAll('[data-e]').forEach(b => b.onclick = () => this.formKaryawan(list.find(k => k.id === b.dataset.e), users));
        t.querySelectorAll('[data-d]').forEach(b => b.onclick = async () => { if (await UI.confirm('Hapus data karyawan ini? (soft delete — riwayat payroll tetap tersimpan)', { danger: true })) { const r = await Api.safe('deleteKaryawan', { id: b.dataset.d }); if (r) { UI.toast(r.message); App.reload(); } } });
      }
    });
    body.querySelector('#kyQ').oninput = e => { const q = e.target.value.toLowerCase(); tbl.setRows(list.filter(k => (k.nama + ' ' + k.jabatan).toLowerCase().includes(q))); };
    act.querySelector('#kyAdd').onclick = () => this.formKaryawan({}, users);
  },

  formKaryawan(data, users) {
    const m = UI.modal({
      title: data.id ? 'Ubah Data Karyawan' : 'Tambah Karyawan', eyebrow: 'Direktori SDM', size: 'lg',
      body: `<form id="fKy" class="form-grid">
        <div class="field"><label>Nama lengkap <span class="req">*</span></label><input class="input" name="nama"></div>
        <div class="field"><label>Jabatan / divisi <span class="req">*</span></label><input class="input" name="jabatan" placeholder="Senior Sales & Konsultan"></div>
        <div class="field"><label>NIK</label><input class="input mono" name="nik" maxlength="16" inputmode="numeric"></div>
        <div class="field"><label>Tanggal masuk</label><input class="input" type="date" name="tanggal_masuk"></div>
        <div class="field"><label>Email <span class="hint">tujuan slip gaji</span></label><input class="input" type="email" name="email"></div>
        <div class="field"><label>No. HP</label><input class="input" name="no_hp"></div>
        <div class="field"><label>Gaji pokok <span class="req">*</span></label><input class="input" name="gaji_pokok" data-rp></div>
        <div class="field"><label>Tunjangan tetap</label><input class="input" name="tunjangan_tetap" data-rp></div>
        <div class="field"><label>Bank</label><input class="input" name="bank" placeholder="BSI / Mandiri / BCA"></div>
        <div class="field"><label>No. rekening</label><input class="input mono" name="no_rekening"></div>
        <div class="field"><label>Akun aplikasi terkait</label><select class="input" name="id_pengguna">${UI.options(users, 'id', u => '@' + u.username + ' — ' + u.nama_lengkap, data.id_pengguna, '— Tidak terhubung —')}</select></div>
        <div class="field"><label>Status</label><select class="input" name="status"><option>Aktif</option><option>Nonaktif</option></select></div>
      </form>`,
      foot: `<button class="btn" data-close>Batal</button><button class="btn primary" id="fKySave">Simpan</button>`
    });
    const f = m.$('#fKy'); UI.fill(f, Object.assign({ status: 'Aktif' }, data)); UI.bindRupiah(f);
    m.$('#fKySave').onclick = async e => {
      const d = UI.formData(f); d.gaji_pokok = UI.parseRp(d.gaji_pokok); d.tunjangan_tetap = UI.parseRp(d.tunjangan_tetap); if (data.id) d.id = data.id;
      const r = await UI.busy(e.currentTarget, () => Api.safe('saveKaryawan', d)); if (r) { UI.toast(r.message); m.close(); App.reload(); }
    };
  }
};

// ============================== MANAJEMEN PENGGUNA ==============================
const MOD_LABEL = { jemaah: 'Data Jemaah', paket: 'Paket & Harga', keberangkatan: 'Jadwal Keberangkatan', pembayaran: 'Pembayaran Jemaah', cicilan: 'Skema Cicilan', pengeluaran: 'Pengeluaran Operasional', laporan: 'Laporan Keuangan' };
const SHORT = { jemaah: 'Jemaah', paket: 'Paket', keberangkatan: 'Jadwal', pembayaran: 'Pembayaran', cicilan: 'Cicilan', pengeluaran: 'Pengeluaran', laporan: 'Laporan' };
const BASE_KRY = { jemaah: 'CRU', paket: 'R', keberangkatan: 'R', pembayaran: 'CRU', cicilan: 'CRU' };
Pages.pengguna = {
  title: 'Manajemen Pengguna', group: 'Pengaturan',
  async render(el) {
    const r = await Api.call('listPengguna'); const list = r.data; this.delegable = r.delegable;
    const admins = list.filter(u => u.akses_admin && u.status_aktif);
    el.innerHTML = `<div class="page-head"><div><h1>Manajemen Pengguna & Hak Akses</h1><p>Kelola akun staf, peran baku (Owner vs Karyawan), dan delegasi izin modul untuk karyawan berakses admin. Semua izin divalidasi di server.</p></div>
      <div class="actions"><button class="btn gold" id="usAdd">${icon('plus')} Tambah Pengguna Baru</button></div></div>
      <div class="grid g4 mb">
        <div class="card kpi"><div class="lbl">Total Akun Terdaftar</div><div class="ico">${icon('users')}</div><div class="val">${list.length}<small>Pengguna</small></div><div class="sub">${list.filter(u => u.peran === 'Owner').length} owner • ${list.filter(u => u.peran === 'Karyawan').length} karyawan</div></div>
        <div class="card kpi"><div class="lbl">Hak Akses Admin Aktif</div><div class="ico gold">${icon('shield')}</div><div class="val">${admins.length}<small>Karyawan</small></div><div class="sub">Delegasi granular oleh owner</div></div>
        <div class="card kpi"><div class="lbl">Integritas Keamanan</div><div class="ico mint">${icon('lock')}</div><div class="val" style="font-size:22px">Hash + Salt</div><div class="sub">Sesi 60 menit • kunci 15 menit setelah 5x gagal</div></div>
        <div class="card kpi"><div class="lbl">Akun Nonaktif</div><div class="ico red">${icon('power')}</div><div class="val">${list.filter(u => !u.status_aktif).length}<small>Akun</small></div><div class="sub">Tidak dapat login</div></div>
      </div>
      <div class="grid g-main"><div class="card"><div class="card-head"><div><h3>Daftar Akun Pengguna</h3></div></div><div id="usT"></div></div>
        <div><div class="card mb"><div class="card-head"><div><h3>${icon('shield')} Matriks RBAC Baku</h3><p>Sesuai PRD Bab 3.2</p></div></div><div class="card-body">
          <div class="rbac-box" style="background:var(--bad-bg);color:var(--bad)">${icon('lock')}<div><b>Owner only (tidak bisa didelegasikan)</b><br>Karyawan & payroll, manajemen akun, riwayat aktivitas, pengaturan.</div></div>
          <div class="rbac-box" style="background:var(--surface-mid)">${icon('users')}<div><b>Karyawan (baku)</b><br>Jemaah CRU • Pembayaran CRU • Cicilan CRU • Paket & Jadwal R • Dashboard tanpa angka keuangan.</div></div>
          <div class="rbac-box" style="background:var(--gold-pale);color:#7c5800">${icon('key')}<div><b>Delegasi akses admin</b><br>Owner dapat menambah: hapus jemaah/pembayaran, verifikasi pembayaran, kelola paket & jadwal, pengeluaran, lihat laporan.</div></div>
          <div class="rbac-box" style="background:var(--surface-mid)">${icon('trash')}<div><b>Soft delete</b><br>Data yang dihapus hanya ditandai <span class="mono">is_deleted = TRUE</span> di Sheets dan dapat dipulihkan owner.</div></div></div></div>
        <div class="card"><div class="card-head"><div><h3>${icon('alert')} Pusat Tindakan Darurat</h3><p>Bila ada indikasi kebocoran kredensial</p></div></div><div class="card-body">
          <button class="btn danger block" id="usForce">${icon('power')} Kunci Sesi Global (Force Logout)</button>
          <p class="xs muted">Semua pengguna — termasuk Anda — wajib login ulang. Perubahan peran/izin juga langsung berlaku pada permintaan berikutnya.</p></div></div></div></div>`;
    UI.table(el.querySelector('#usT'), {
      rows: list,
      columns: [
        { label: 'Pengguna & Profil', render: u => `<div style="display:flex;gap:10px;align-items:center"><div class="avatar ${u.peran === 'Owner' ? 'gold' : ''}">${UI.initials(u.nama_lengkap)}</div><div class="name"><b>${UI.esc(u.nama_lengkap)}</b><small>@${UI.esc(u.username)} • ${UI.esc(u.email || '-')}</small></div></div>` },
        { label: 'Peran', render: u => `<span class="badge ${u.peran === 'Owner' ? 'b-gold' : 'b-off'}">${u.peran}</span>` },
        { label: 'Akses Admin', render: u => u.peran === 'Owner' ? '<span class="badge b-green">Super Administrator</span>' : !u.status_aktif ? '<span class="badge b-off">Non-Aktif</span>' : u.akses_admin ? '<span class="badge b-green dot">Admin Aktif</span>' : '<span class="badge b-off">Staf Standar</span>' },
        { label: 'Izin Modul', render: u => u.peran === 'Owner' ? '<div class="pill-list"><span class="pill dark">Hak penuh (semua modul)</span><span class="pill gold">+ Payroll & Keuangan</span></div>'
          : `<div class="pill-list">${Object.entries(BASE_KRY).map(([m, v]) => { const ex = u.akses_admin ? (u.izin_modul[m] || '') : ''; return `<span class="pill ${ex ? 'gold' : ''}">${SHORT[m]} ${[...new Set((v + ex).split(''))].join('')}</span>`; }).join('')}${u.akses_admin ? Object.entries(u.izin_modul).filter(([m]) => !BASE_KRY[m]).map(([m, v]) => `<span class="pill gold">${SHORT[m]} ${v}</span>`).join('') : ''}</div>` },
        { label: 'Login Terakhir', render: u => `<span class="xs muted nowrap">${u.login_terakhir ? UI.tgl(u.login_terakhir) : 'Belum pernah'}</span>` },
        { label: '', cls: 'r', render: u => `<div class="row-actions"><button class="btn icon" data-e="${u.id}" title="Ubah & atur akses">${icon('edit')}</button><button class="btn icon" data-r="${u.id}" title="Reset password">${icon('key')}</button></div>` }
      ],
      onRender: t => {
        t.querySelectorAll('[data-e]').forEach(b => b.onclick = () => this.form(list.find(u => u.id === b.dataset.e)));
        t.querySelectorAll('[data-r]').forEach(b => b.onclick = async () => {
          const u = list.find(x => x.id === b.dataset.r);
          if (!(await UI.confirm(`Reset password <b>@${UI.esc(u.username)}</b>? Password sementara baru akan dibuat dan wajib diganti saat login.`, { ok: 'Reset' }))) return;
          const r = await Api.safe('resetPassword', { id: u.id }); if (r) this.showTemp(u.username, r.temp_password, r.message);
        });
      }
    });
    el.querySelector('#usAdd').onclick = () => this.form({});
    el.querySelector('#usForce').onclick = async () => {
      if (!(await UI.confirm('Cabut SEMUA sesi aktif sekarang? Seluruh pengguna termasuk Anda harus login ulang.', { danger: true, ok: 'Force Logout' }))) return;
      const r = await Api.safe('forceLogoutAll'); if (r) { UI.toast(r.message); setTimeout(() => App.sessionExpired('Semua sesi dicabut. Silakan login kembali.'), 1200); }
    };
  },
  showTemp(username, pass, msg) {
    const m = UI.modal({
      title: 'Password Sementara', eyebrow: msg, size: 'sm',
      body: `<p class="small">Berikan kredensial ini kepada staf melalui jalur aman. Password hanya ditampilkan <b>sekali</b> dan wajib diganti saat login pertama.</p>
        <div class="mini-stat"><small>Username</small><b class="mono">${UI.esc(username)}</b></div><div class="mini-stat" style="margin-top:8px;display:flex;justify-content:space-between;align-items:center"><div><small>Password sementara</small><b class="mono">${UI.esc(pass)}</b></div><button class="btn sm" id="tpCopy">${icon('copy')} Salin</button></div>`,
      foot: '<button class="btn primary" data-close>Selesai</button>'
    });
    m.$('#tpCopy').onclick = () => UI.copy('Username: ' + username + '\nPassword sementara: ' + pass + '\nLogin: ' + location.href.split('#')[0]);
  },
  form(u) {
    const isNew = !u.id, dl = this.delegable || {};
    const m = UI.modal({
      title: isNew ? 'Tambah Pengguna Baru & Konfigurasi Akses' : 'Ubah Pengguna @' + UI.esc(u.username), eyebrow: 'RBAC • PRD F1', size: 'lg',
      body: `<form id="fU"><div class="form-sec"><h4><span class="no">A</span>Kredensial & Profil Staf</h4><div class="form-grid">
        <div class="field"><label>Nama lengkap <span class="req">*</span></label><input class="input" name="nama_lengkap"></div>
        <div class="field"><label>Email</label><input class="input" type="email" name="email"></div>
        <div class="field"><label>Username unik <span class="req">*</span> <button type="button" class="link-btn xs" id="uGen">Generate otomatis</button></label><input class="input mono" name="username" ${isNew ? '' : ''} placeholder="fajri.ops"><span class="hint">Huruf kecil, angka, titik, garis bawah</span></div>
        <div class="field"><label>Jabatan / divisi</label><input class="input" name="jabatan" placeholder="Admin Operasional"></div>
        <div class="field"><label>No. WhatsApp</label><input class="input" name="no_hp"></div>
        <div class="field"><label>Peran sistem <span class="req">*</span></label><select class="input" name="peran"><option>Karyawan</option><option>Owner</option></select></div>
        <div class="field span2"><label class="check"><span class="switch"><input type="checkbox" name="status_aktif"><span></span></span> Akun aktif (dapat login)</label></div>
        ${isNew ? `<div class="alert info span2" style="margin:0">${icon('key')}<div>Password sementara dibuat otomatis oleh server & ditampilkan sekali setelah disimpan. Staf wajib menggantinya saat login pertama.</div></div>` : ''}
      </div></div>
      <div class="form-sec" id="uAdm"><h4><span class="no">B</span>Delegasi Akses Admin <label class="check" style="margin-left:auto;font-weight:500"><span class="switch"><input type="checkbox" name="akses_admin"><span></span></span> Aktifkan akses admin</label></h4>
        <p class="small muted" style="margin-top:0">Baris abu-abu = izin baku karyawan (selalu ada). Centang untuk menambah izin. Payroll, pengguna, log & pengaturan tetap khusus owner.</p>
        <div class="perm-grid" id="uPerm"><div class="hd">Modul</div><div class="hd">Tambah</div><div class="hd">Lihat</div><div class="hd">Ubah</div><div class="hd">Hapus</div><div class="hd">Verifikasi</div>
        ${Object.keys(MOD_LABEL).map(mod => `<div>${MOD_LABEL[mod]}</div>` + ['C', 'R', 'U', 'D', 'V'].map(op => {
          const base = (BASE_KRY[mod] || '').includes(op), can = (dl[mod] || '').includes(op), on = (u.izin_modul || {})[mod] && u.izin_modul[mod].includes(op);
          return `<div class="cb">${base ? `<input type="checkbox" checked disabled title="Izin baku">` : can ? `<input type="checkbox" data-m="${mod}" data-o="${op}" ${on ? 'checked' : ''}>` : '<span class="muted">—</span>'}</div>`;
        }).join('')).join('')}</div></div></form>`,
      foot: `<button class="btn" data-close>Batal</button><button class="btn primary" id="fUSave">${icon('check')} Simpan Akun</button>`
    });
    const f = m.$('#fU');
    UI.fill(f, Object.assign({ status_aktif: true, peran: 'Karyawan' }, u));
    const peran = f.querySelector('[name=peran]'), adm = f.querySelector('[name=akses_admin]');
    const vis = () => { m.$('#uAdm').style.display = peran.value === 'Owner' ? 'none' : ''; m.$('#uPerm').style.opacity = adm.checked ? 1 : .45; m.$$('#uPerm [data-m]').forEach(c => c.disabled = !adm.checked); };
    peran.onchange = vis; adm.onchange = vis; vis();
    m.$('#uGen').onclick = () => { const n = f.querySelector('[name=nama_lengkap]').value.toLowerCase().replace(/^(h|hj|ust|drs|dra)\.?\s+/, '').split(/\s+/).filter(Boolean); const j = (f.querySelector('[name=jabatan]').value.split(/\s+/)[0] || 'staf').toLowerCase().replace(/[^a-z]/g, '').slice(0, 5); if (n.length) f.querySelector('[name=username]').value = (n[0] + '.' + j).replace(/[^a-z0-9.]/g, ''); };
    m.$('#fUSave').onclick = async e => {
      const d = UI.formData(f);
      d.izin_modul = {};
      m.$$('#uPerm [data-m]:checked').forEach(c => d.izin_modul[c.dataset.m] = (d.izin_modul[c.dataset.m] || '') + c.dataset.o);
      if (u.id) d.id = u.id;
      const r = await UI.busy(e.currentTarget, () => Api.safe('savePengguna', d));
      if (!r) return;
      m.close(); UI.toast(r.message);
      if (r.temp_password) this.showTemp(r.data.username, r.temp_password, r.message);
      if (u.id === App.state.user.id) await App.boot(); else App.reload();
    };
  }
};

// ============================== RIWAYAT AKTIVITAS ==============================
Pages.log = {
  title: 'Riwayat Aktivitas', group: 'Laporan & SDM',
  async render(el) {
    el.innerHTML = `<div class="page-head"><div><div class="eyebrow">Audit Log</div><h1>Riwayat Aktivitas</h1><p>Setiap tambah, ubah, hapus, verifikasi, cetak, dan login tercatat: siapa, kapan, dan apa. Maksimal 500 baris terbaru per pencarian.</p></div>
      <div class="actions"><button class="btn" id="lgCsv">${icon('download')} Unduh CSV</button></div></div>
      <div class="card"><div class="toolbar"><div class="search-in">${icon('search')}<input class="input" id="lgQ" placeholder="Cari aksi / keterangan..."></div>
        <select class="input" id="lgM" style="width:170px"><option value="">Semua Modul</option>${['auth', 'jemaah', 'paket', 'keberangkatan', 'pembayaran', 'cicilan', 'pengeluaran', 'laporan', 'karyawan', 'pengguna', 'pengaturan', 'sistem'].map(x => `<option>${x}</option>`).join('')}</select>
        <input class="input" id="lgU" placeholder="Username" style="width:150px"><input class="input" type="date" id="lgD1" style="width:160px" title="Dari"><input class="input" type="date" id="lgD2" style="width:160px" title="Sampai">
        <button class="btn primary" id="lgGo">${icon('filter')} Terapkan</button></div><div id="lgT"></div></div>`;
    const $ = s => el.querySelector(s);
    const tone = a => /HAPUS|TOLAK|GAGAL|TERKUNCI|FORCE|KOREKSI/.test(a) ? 'bad' : /LOGIN|LOGOUT/.test(a) ? 'off' : /VERIFIKASI|TAMBAH|SETUP/.test(a) ? 'ok' : 'info';
    let rows = [];
    const tbl = UI.table($('#lgT'), {
      rows: [], pageSize: 20, emptyText: 'Tidak ada aktivitas pada filter ini.',
      columns: [{ label: 'Waktu', render: l => `<span class="small">${UI.waktu(l.waktu)}</span>` }, { label: 'Pengguna', render: l => `<span class="pill">@${UI.esc(l.username)}</span>` },
        { label: 'Aksi', render: l => `<span class="badge b-${tone(l.aksi)}">${UI.esc(l.aksi)}</span>` }, { label: 'Modul', render: l => `<span class="small">${UI.esc(l.modul)}</span>` },
        { label: 'Keterangan', render: l => `<span class="small">${UI.esc(l.keterangan)}</span>` }]
    });
    const load = async () => {
      const r = await Api.safe('listLog', { q: $('#lgQ').value, modul: $('#lgM').value, username: $('#lgU').value.trim(), dari: $('#lgD1').value, sampai: $('#lgD2').value });
      if (r) { rows = r.data; tbl.setRows(rows); }
    };
    $('#lgGo').onclick = load; $('#lgQ').onkeydown = e => { if (e.key === 'Enter') load(); };
    $('#lgCsv').onclick = () => UI.csv('Log_Aktivitas_' + UI.today(), rows, [{ label: 'Waktu', key: 'waktu' }, { label: 'Username', key: 'username' }, { label: 'Aksi', key: 'aksi' }, { label: 'Modul', key: 'modul' }, { label: 'ID Data', key: 'id_data' }, { label: 'Keterangan', key: 'keterangan' }]);
    await load();
  }
};

// ============================== PENGATURAN ==============================
Pages.pengaturan = {
  title: 'Pengaturan Sistem', group: 'Pengaturan', tab: 'profil',
  async render(el) {
    const r = (await Api.call('getPengaturan')).data, s = r.settings;
    const tabs = [['profil', 'Profil Agensi & Legalitas', 'building'], ['kop', 'Kop & Logo', 'file'], ['nomor', 'Format Penomoran', 'list'], ['notif', 'Notifikasi Email & Triggers', 'mail'], ['sistem', 'Ekosistem Google Workspace', 'shield']];
    el.innerHTML = `<div class="page-head"><div><h1>Pengaturan Sistem & Profil Agensi</h1><p>Identitas legal, kop dokumen PDF, prefiks penomoran otomatis, dan parameter pengingat cicilan.</p></div>
      <div class="actions"><span class="badge b-ok dot">Sinkron Sheets</span><button class="btn primary" id="stSave">${icon('check')} Simpan Semua Perubahan</button></div></div>
      <div class="tabs dark mb">${tabs.map(([k, l, i]) => `<button data-t="${k}" class="${this.tab === k ? 'on' : ''}">${icon(i === 'building' ? 'hotel' : i)} ${l}</button>`).join('')}</div>
      <div class="grid g-main"><form id="stF" class="card card-pad">
        <div data-p="profil"><h3 style="margin-top:0">Identitas Resmi & Izin Penyelenggara</h3><div class="form-grid">
          <div class="field span2"><label>Nama resmi badan usaha (PT)</label><input class="input" name="nama_perusahaan"></div>
          <div class="field"><label>Nama merek</label><input class="input" name="nama_brand"></div><div class="field"><label>Kota penerbitan</label><input class="input" name="kota"></div>
          <div class="field"><label>Nomor SK PPIU (Kemenag)</label><input class="input" name="izin_ppiu"></div><div class="field"><label>Nomor SK PIHK</label><input class="input" name="izin_pihk"></div>
          <div class="field span2"><label>Alamat kantor pusat</label><textarea class="input" name="alamat" rows="2"></textarea></div>
          <div class="field"><label>Telepon kantor</label><input class="input" name="telepon"></div><div class="field"><label>WhatsApp customer care</label><input class="input" name="whatsapp"></div>
          <div class="field"><label>Email korespondensi</label><input class="input" name="email_kantor"></div><div class="field"><label>Website</label><input class="input" name="website"></div>
          <div class="field"><label>Nama pimpinan (penanda tangan)</label><input class="input" name="nama_pimpinan"></div><div class="field"><label>Jabatan pimpinan</label><input class="input" name="jabatan_pimpinan"></div>
          <div class="field span2"><label>Rekening tujuan pembayaran jemaah</label><input class="input" name="rekening_pembayaran"><span class="hint">Ditampilkan di email pengingat cicilan</span></div></div></div>
        <div data-p="kop"><h3 style="margin-top:0">Aset Visual & Kop Dokumen PDF</h3>
          <div style="display:flex;gap:16px;align-items:center;margin-bottom:16px"><div class="logo-mark" style="width:84px;height:84px;border-radius:12px" id="stLogo">${s.logo_file_id && App.state.settings.logo ? `<img src="${App.state.settings.logo}">` : icon('logo')}</div>
            <div><b>Logo utama kop</b><div class="xs muted">PNG/JPG, idealnya persegi & latar transparan. Dikecilkan otomatis ke 300px.</div><button type="button" class="btn sm" id="stLogoBtn" style="margin-top:8px">${icon('upload')} Ganti logo</button><input type="file" id="stLogoIn" accept="image/png,image/jpeg" class="hidden"></div></div>
          <div class="field"><label>Teks catatan kaki dokumen</label><input class="input" name="footer_dokumen"><span class="hint">Tercetak di bawah setiap kwitansi, slip gaji, manifes & laporan</span></div></div>
        <div data-p="nomor"><h3 style="margin-top:0">Parameter Penomoran Otomatis</h3><div class="form-grid">
          <div class="field"><label>Prefiks nomor registrasi jemaah</label><input class="input mono" name="prefix_registrasi"><span class="hint" id="exReg"></span></div>
          <div class="field"><label>Prefiks nomor kwitansi</label><input class="input mono" name="prefix_kwitansi"><span class="hint" id="exKwt"></span></div>
          <div class="field"><label>Prefiks slip gaji</label><input class="input mono" name="prefix_slip"><span class="hint" id="exSlip"></span></div></div>
          <div class="alert info" style="margin-top:14px">${icon('info')}<div>Nomor urut dibuat atomik dengan LockService (anti duplikat saat dua staf menyimpan bersamaan) dan <b>reset otomatis setiap 1 Januari</b>.</div></div></div>
        <div data-p="notif"><h3 style="margin-top:0">Jadwal & Parameter Pengingat Cicilan</h3>
          <div class="form-grid"><div class="field span2"><label class="check"><span class="switch"><input type="checkbox" id="stRem"><span></span></span> Aktifkan pengingat cicilan otomatis (trigger harian 07.00 WIB)</label></div>
          <div class="field"><label>Kirim pengingat H-berapa sebelum jatuh tempo</label><input class="input" type="number" min="1" max="14" name="reminder_hari_sebelum"></div>
          <div class="field"><label>Tembusan (BCC) finance</label><input class="input" type="email" name="bcc_finance" placeholder="finance@agensi.co.id"></div>
          <div class="field span2"><label class="check"><span class="switch"><input type="checkbox" id="stLate"><span></span></span> Kirim pemberitahuan saat cicilan terlambat (sekali per termin)</label></div></div>
          <div class="form-sec" style="margin-top:16px"><h4>${icon('send')} Uji Eksekusi</h4><div class="actions"><input class="input" type="email" id="stTest" placeholder="Email tujuan uji" style="max-width:280px" value="${UI.esc(App.state.user.email || '')}"><button type="button" class="btn gold" id="stTestBtn">Kirim Email Tes</button><button type="button" class="btn" id="stRun">Force Run Pengingat</button></div>
          <div class="xs muted" style="margin-top:8px">Sisa kuota email Google hari ini: <b>${r.email_quota ?? '?'}</b> (Gmail biasa ±100/hari, Workspace ±1.500/hari)</div></div></div>
        <div data-p="sistem"><h3 style="margin-top:0">Ekosistem Google Workspace</h3>
          <div class="list-item"><div class="li-ico">${icon('file')}</div><div style="flex:1"><b>Master Database (Google Sheets)</b><div class="xs muted">Semua tabel: Pengguna, Jemaah, Pembayaran, dll. Hanya pemilik akun yang dapat membuka.</div></div>${r.spreadsheet_url ? `<a class="btn sm" target="_blank" rel="noopener" href="${UI.esc(r.spreadsheet_url)}">Buka</a>` : ''}</div>
          <div class="list-item"><div class="li-ico">${icon('upload')}</div><div style="flex:1"><b>Folder Induk Google Drive</b><div class="xs muted">Dokumen jemaah, bukti transfer, kwitansi, slip gaji, manifes, laporan, backup — tidak dibagikan publik.</div></div>${r.drive_url ? `<a class="btn sm" target="_blank" rel="noopener" href="${UI.esc(r.drive_url)}">Buka</a>` : ''}</div>
          <div class="list-item"><div class="li-ico">${icon('clock')}</div><div style="flex:1"><b>Trigger terpasang</b><div class="xs muted">${r.triggers.length ? r.triggers.map(t => `<span class="pill">${UI.esc(t)}</span>`).join(' ') : '<span style="color:var(--bad)">Belum ada — jalankan installTriggers() di editor Apps Script</span>'}</div></div></div>
          <div class="list-item"><div class="li-ico">${icon('shield')}</div><div><b>Keamanan</b><div class="xs muted">ID spreadsheet & folder disimpan di Script Properties. Password: SHA-256 berulang + salt per pengguna. Disarankan memakai akun Google khusus perusahaan dengan verifikasi 2 langkah.</div></div></div></div>
      </form>
      <div><div class="card mb"><div class="card-head"><div><h3>Pratinjau Kop Dokumen</h3><p>A4 • langsung</p></div></div><div class="card-body" id="stPrev"></div></div>
        <div class="card"><div class="card-body"><div class="eyebrow">${icon('info')} Catatan</div><p class="small muted">Perubahan profil langsung dipakai pada PDF berikutnya. Dokumen yang sudah dicetak sebelumnya tidak berubah.</p></div></div></div></div>`;
    const f = el.querySelector('#stF');
    UI.fill(f, s);
    el.querySelector('#stRem').checked = /^(ya|yes|true)$/i.test(s.reminder_aktif);
    el.querySelector('#stLate').checked = /^(ya|yes|true)$/i.test(s.reminder_terlambat);
    const show = () => { f.querySelectorAll('[data-p]').forEach(p => p.style.display = p.dataset.p === this.tab ? '' : 'none'); el.querySelectorAll('[data-t]').forEach(b => b.classList.toggle('on', b.dataset.t === this.tab)); };
    el.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { this.tab = b.dataset.t; show(); });
    show();
    const prev = () => {
      const d = UI.formData(f), y = UI.today().slice(0, 4), mm = UI.today().slice(5, 7);
      el.querySelector('#exReg').textContent = 'Contoh: ' + d.prefix_registrasi + '-' + y + '-0042';
      el.querySelector('#exKwt').textContent = 'Contoh: ' + d.prefix_kwitansi + '-' + y + '-0128';
      el.querySelector('#exSlip').textContent = 'Contoh: ' + d.prefix_slip + '/' + y + '/' + mm + '/002';
      el.querySelector('#stPrev').innerHTML = `<div style="border:1px solid var(--border);border-radius:8px;padding:14px;background:#fff;color:#14221C;font-family:Arial,sans-serif">
        <div style="display:flex;gap:10px;align-items:center;border-bottom:3px double #C8993A;padding-bottom:8px"><div style="width:42px;height:42px;flex:none">${App.state.settings.logo ? `<img src="${App.state.settings.logo}" style="width:42px;height:42px;object-fit:contain">` : '<div style="width:42px;height:42px;background:#0F4D3A;border-radius:6px"></div>'}</div>
        <div><div style="font-family:Georgia,serif;font-weight:bold;color:#0F4D3A;font-size:14px">${UI.esc(d.nama_perusahaan)}</div><div style="font-size:9px;color:#7c5800;font-weight:bold">${UI.esc(d.nama_brand)} • Penyelenggara Perjalanan Ibadah Umrah</div>
        <div style="font-size:8px;color:#404944">${UI.esc(d.izin_ppiu)} • ${UI.esc(d.izin_pihk)}<br>${UI.esc(d.alamat)}<br>Telp ${UI.esc(d.telepon)} • ${UI.esc(d.email_kantor)}</div></div></div>
        <div style="text-align:center;font-family:Georgia,serif;font-size:11px;letter-spacing:1px;margin:10px 0 4px">KWITANSI PEMBAYARAN</div><div style="text-align:center;font-size:8px;color:#5B6B63">No. ${UI.esc(d.prefix_kwitansi)}-${y}-0001</div>
        <div style="height:60px;background:#FAF7F0;border:1px dashed #E4DFD2;border-radius:4px;margin:8px 0;display:grid;place-items:center;font-size:8px;color:#707974">AREA ISI DOKUMEN</div>
        <div style="font-size:8px;text-align:right">${UI.esc(d.kota)}, ${UI.tglPanjang(UI.today())}<br>${UI.esc(d.jabatan_pimpinan)}<br><br><b>${UI.esc(d.nama_pimpinan)}</b></div>
        <div style="border-top:1px solid #E4DFD2;margin-top:8px;padding-top:4px;font-size:7px;color:#707974;text-align:center">${UI.esc(d.footer_dokumen)}</div></div>`;
    };
    f.addEventListener('input', prev); prev();
    el.querySelector('#stSave').onclick = async e => {
      const d = UI.formData(f);
      d.reminder_aktif = el.querySelector('#stRem').checked ? 'ya' : 'tidak';
      d.reminder_terlambat = el.querySelector('#stLate').checked ? 'ya' : 'tidak';
      const res = await UI.busy(e.currentTarget, () => Api.safe('savePengaturan', d));
      if (res) { UI.toast(res.message); await App.refreshMaster(); App.renderShell(); }
    };
    const li = el.querySelector('#stLogoIn');
    el.querySelector('#stLogoBtn').onclick = () => li.click();
    li.onchange = async () => {
      try {
        const p = await UI.readFile(li.files[0], { maxPx: 300, keepPng: true, quality: .9 });
        const res = await Api.call('uploadLogo', p);
        UI.toast(res.message); App.state.settings.logo = res.data.logo; App.renderShell(); App.reload();
      } catch (err) { UI.toast(err.message, 'error'); }
    };
    el.querySelector('#stTestBtn').onclick = async e => { const res = await UI.busy(e.currentTarget, () => Api.safe('sendTestEmail', { email: el.querySelector('#stTest').value })); if (res) UI.toast(res.message); };
    el.querySelector('#stRun').onclick = async e => { const res = await UI.busy(e.currentTarget, () => Api.safe('runReminderNow')); if (res) UI.toast(res.message); };
  }
};
