// ============================================================================
// HALAMAN KEUANGAN — Pembayaran & Kwitansi, Skema Cicilan, Pengeluaran, Laporan
// ============================================================================
window.Pages = window.Pages || {};
window.Forms = window.Forms || {};
const METODE = ['Transfer Bank', 'Virtual Account', 'Tunai', 'QRIS', 'Lainnya'];
const KAT_KELUAR = ['Tiket', 'Hotel', 'Visa', 'Transportasi', 'Konsumsi', 'Operasional', 'Lainnya'];

// ============================== PEMBAYARAN ==============================
Pages.pembayaran = {
  title: 'Pembayaran Jemaah', group: 'Transaksi',
  async render(el) {
    const list = (await Api.call('listPembayaran')).data;
    const bln = UI.today().slice(0, 7);
    const ver = list.filter(p => p.status_verifikasi === 'Terverifikasi' && p.tanggal_bayar.slice(0, 7) === bln);
    const wait = list.filter(p => p.status_verifikasi === 'Menunggu');
    const canV = App.can('pembayaran', 'V'), canD = App.can('pembayaran', 'D'), me = App.state.user.username;
    el.innerHTML = `<div class="page-head"><div><div class="eyebrow">Keuangan & Akuntansi Jemaah • ${icon('shield')} Bukti tersimpan di Google Drive</div><h1>Pembayaran Jemaah & Kwitansi</h1>
      <p>Pencatatan uang muka, cicilan, dan pelunasan. Kwitansi bernomor urut otomatis${canV ? '' : '; pembayaran yang Anda catat menunggu verifikasi owner'}.</p></div>
      <div class="actions">${App.can('pembayaran', 'C') ? `<button class="btn gold" id="pyAdd">${icon('plusc')} Catat Pembayaran Baru</button>` : ''}</div></div>
      <div class="grid g3 mb">
        <div class="card kpi"><div class="lbl">Total Terverifikasi Bulan Ini</div><div class="ico">${icon('checkc')}</div><div class="val money">${UI.rp(ver.reduce((s, p) => s + p.jumlah, 0))}</div><div class="sub">${ver.length} transaksi selesai • ${UI.periode(bln)}</div></div>
        <div class="card kpi"><div class="lbl" style="color:#7c5800">Menunggu Verifikasi Owner</div><div class="ico gold">${icon('clock')}</div><div class="val money" style="color:#7c5800">${UI.rp(wait.reduce((s, p) => s + p.jumlah, 0))}</div><div class="sub">${wait.length} bukti transfer baru ${wait.length ? `• <button class="link-btn" id="pyWait">Lihat antrean ${icon('right')}</button>` : ''}</div></div>
        <div class="card kpi"><div class="lbl">Kwitansi Diterbitkan</div><div class="ico mint">${icon('receipt')}</div><div class="val">${list.filter(p => p.status_verifikasi !== 'Ditolak').length}<small>Dokumen</small></div><div class="sub">${icon('upload')} Arsip PDF di folder Drive "Kwitansi PDF"</div></div>
      </div>
      <div class="card"><div class="card-head"><div><h3>Buku Kas & Ledger Pembayaran</h3><p>Rekam setoran dari kasir dan mutasi rekening penampung</p></div>
        <div class="alert info" style="margin:0;padding:8px 12px">${icon('lock')}<div class="small">Catatan terverifikasi terkunci. Koreksi hanya oleh <b>Owner</b> dan tercatat di riwayat aktivitas.</div></div></div>
        <div class="toolbar"><div class="search-in">${icon('search')}<input class="input" id="pyQ" placeholder="Cari no kwitansi, nama jemaah, no registrasi..."></div>
          <select class="input" id="pyM" style="width:180px"><option value="">Semua Metode</option>${METODE.map(x => `<option>${x}</option>`).join('')}</select>
          <select class="input" id="pyS" style="width:190px"><option value="">Semua Status</option><option>Menunggu</option><option>Terverifikasi</option><option>Ditolak</option></select>
          <input class="input" type="month" id="pyB" style="width:160px" title="Filter bulan">
          <button class="btn" id="pyCsv" title="Unduh CSV">${icon('download')}</button></div>
        <div id="pyT"></div></div>`;
    const tbl = UI.table(el.querySelector('#pyT'), {
      rows: [], emptyText: 'Belum ada pembayaran.', rowClass: p => p.status_verifikasi === 'Ditolak' ? 'deleted' : '',
      columns: [
        { label: 'No. Kwitansi', render: p => `<span class="code-tag">${UI.esc(p.no_kwitansi)}</span>` },
        { label: 'Tgl Bayar', render: p => `<div class="name"><b style="font-weight:500">${UI.tgl(p.tanggal_bayar)}</b><small>oleh ${UI.esc(p.created_by)}</small></div>` },
        { label: 'Jemaah', render: p => `<div class="name"><b><a href="#/jemaah/${p.id_jemaah}" style="color:inherit">${UI.esc(p.nama_jemaah)}</a></b><small>${UI.esc(p.no_registrasi)} • ${UI.esc(p.nama_paket)}</small></div>` },
        { label: 'Kategori', render: p => `<span class="small">${UI.esc(p.kategori)}</span>` },
        { label: 'Jumlah (IDR)', cls: 'r', render: p => `<b class="tabular">${UI.rp(p.jumlah)}</b>` },
        { label: 'Metode', render: p => `<span class="small">${UI.esc(p.metode)}</span>` },
        { label: 'Bukti', render: p => p.id_bukti_drive ? `<button class="btn xs" data-bukti="${p.id_bukti_drive}">${icon('eye')} Drive</button>` : '<span class="xs muted">-</span>' },
        { label: 'Status', render: p => UI.badge(p.status_verifikasi === 'Menunggu' ? 'Menunggu Owner' : p.status_verifikasi, p.status_verifikasi === 'Menunggu' ? 'warn' : undefined) },
        { label: 'Aksi', cls: 'r', render: p => `<div class="row-actions">
          ${canV && p.status_verifikasi === 'Menunggu' ? `<button class="btn xs primary" data-ok="${p.id}" title="Verifikasi">${icon('check')}</button><button class="btn xs danger" data-no="${p.id}" title="Tolak">${icon('x')}</button>` : ''}
          ${p.status_verifikasi !== 'Ditolak' ? `<button class="btn icon" data-kw="${p.id}" title="Cetak kwitansi PDF">${icon('printer')}</button>` : ''}
          ${p.status_verifikasi === 'Terverifikasi' ? `<button class="btn icon" data-mail="${p.id}" title="Kirim kwitansi ke email jemaah" ${p.email_jemaah ? '' : 'disabled'}>${icon('mail')}</button>` : ''}
          ${canD || (p.status_verifikasi === 'Menunggu' && p.created_by === me) ? `<button class="btn icon" data-edit="${p.id}" title="Koreksi">${icon('edit')}</button>` : ''}
          ${canD ? `<button class="btn icon" data-del="${p.id}" title="Hapus">${icon('trash')}</button>` : ''}</div>` }
      ],
      onRender: t => {
        t.querySelectorAll('[data-bukti]').forEach(b => b.onclick = () => UI.viewFile(b.dataset.bukti, b));
        t.querySelectorAll('[data-kw]').forEach(b => b.onclick = () => UI.pdf('kwitansiPdf', { id: b.dataset.kw }, b, false));
        t.querySelectorAll('[data-mail]').forEach(b => b.onclick = async () => { const r = await UI.busy(b, () => Api.safe('emailKwitansi', { id: b.dataset.mail })); if (r) UI.toast(r.message); });
        t.querySelectorAll('[data-ok]').forEach(b => b.onclick = async () => { const r = await UI.busy(b, () => Api.safe('verifyPembayaran', { id: b.dataset.ok, status: 'Terverifikasi' })); if (r) { UI.toast(r.message); App.refreshCounts(); App.reload(); } });
        t.querySelectorAll('[data-no]').forEach(b => b.onclick = async () => { const why = await UI.confirm('Tolak pembayaran ini? Jemaah perlu mengirim bukti yang benar.', { danger: true, ok: 'Tolak', input: 'Alasan penolakan' }); if (!why) return; const r = await Api.safe('verifyPembayaran', { id: b.dataset.no, status: 'Ditolak', catatan: 'Ditolak: ' + why }); if (r) { UI.toast(r.message); App.refreshCounts(); App.reload(); } });
        t.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => Forms.pembayaran(list.find(p => p.id === b.dataset.edit), () => App.reload()));
        t.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => { const why = await UI.confirm('Hapus pembayaran ini? Saldo jemaah & status termin akan dihitung ulang.', { danger: true, ok: 'Hapus', input: 'Alasan penghapusan (dicatat di log)' }); if (!why) return; const r = await Api.safe('deletePembayaran', { id: b.dataset.del, alasan: why }); if (r) { UI.toast(r.message); App.reload(); } });
      }
    });
    const $ = s => el.querySelector(s);
    const apply = () => {
      const q = $('#pyQ').value.toLowerCase(), m = $('#pyM').value, s = $('#pyS').value, b = $('#pyB').value;
      tbl.setRows(list.filter(p => (!q || [p.no_kwitansi, p.nama_jemaah, p.no_registrasi, p.keterangan].join(' ').toLowerCase().includes(q)) && (!m || p.metode === m) && (!s || p.status_verifikasi === s) && (!b || p.tanggal_bayar.slice(0, 7) === b)));
    };
    ['#pyQ', '#pyM', '#pyS', '#pyB'].forEach(s => $(s).addEventListener('input', apply));
    apply();
    if ($('#pyWait')) $('#pyWait').onclick = () => { $('#pyS').value = 'Menunggu'; apply(); };
    if ($('#pyAdd')) $('#pyAdd').onclick = () => Forms.pembayaran({}, () => App.reload());
    $('#pyCsv').onclick = () => UI.csv('Ledger_Pembayaran_' + UI.today(), list, [{ label: 'No Kwitansi', key: 'no_kwitansi' }, { label: 'Tanggal', key: 'tanggal_bayar' }, { label: 'No Reg', key: 'no_registrasi' }, { label: 'Jemaah', key: 'nama_jemaah' }, { label: 'Kategori', key: 'kategori' }, { label: 'Jumlah', key: 'jumlah' }, { label: 'Metode', key: 'metode' }, { label: 'Status', key: 'status_verifikasi' }, { label: 'Petugas', key: 'created_by' }, { label: 'Keterangan', key: 'keterangan' }]);
  }
};

Forms.pembayaran = async (pre = {}, done) => {
  const isEdit = !!pre.id;
  const jemaah = (await App.jemaahCache(true)).filter(j => j.status !== 'Batal' && (j.sisa > 0 || j.id === pre.id_jemaah));
  const m = UI.modal({
    title: isEdit ? 'Koreksi Pembayaran ' + UI.esc(pre.no_kwitansi) : 'Catat Pembayaran Baru', eyebrow: 'Transaksi Jemaah', size: 'lg',
    body: `<form id="fB"><div class="form-grid">
      ${isEdit ? `<div class="field span2"><label>Jemaah</label><input class="input" readonly value="${UI.esc(pre.nama_jemaah + ' — ' + pre.no_registrasi)}"><input type="hidden" name="id_jemaah" value="${pre.id_jemaah}"></div>`
        : `<div class="field span2"><label>Jemaah <span class="req">*</span></label><input class="input" id="bFind" placeholder="Ketik untuk memfilter nama / no registrasi..." style="margin-bottom:6px">
          <select class="input" name="id_jemaah" size="5" style="height:auto;padding:6px">${jemaah.map(j => `<option value="${j.id}" ${j.id === pre.id_jemaah ? 'selected' : ''}>${UI.esc(j.no_registrasi)} — ${UI.esc(j.nama_lengkap)} • sisa ${UI.rp(j.sisa)}</option>`).join('')}</select></div>`}
      <div class="span2" id="bInfo"></div>
      <div class="field"><label>Termin cicilan <span class="hint">opsional</span></label><select class="input" name="id_cicilan"><option value="">— Tanpa termin —</option></select></div>
      <div class="field"><label>Kategori</label><select class="input" name="kategori"><option value="">Otomatis</option><option>Uang Muka (DP)</option><option>Pelunasan</option><option>Pembayaran</option></select></div>
      <div class="field"><label>Tanggal bayar <span class="req">*</span></label><input class="input" type="date" name="tanggal_bayar" max="${UI.today()}"></div>
      <div class="field"><label>Jumlah (Rp) <span class="req">*</span></label><input class="input" name="jumlah" data-rp style="font-weight:700;font-size:16px"></div>
      <div class="field"><label>Metode <span class="req">*</span></label><select class="input" name="metode">${METODE.map(x => `<option>${x}</option>`).join('')}</select></div>
      <div class="field"><label>Bukti transfer / struk <span class="hint">JPG/PNG/PDF</span></label><input class="input" type="file" id="bFile" accept="image/*,application/pdf" style="padding:7px"></div>
      <div class="field span2"><label>Keterangan</label><input class="input" name="keterangan" placeholder="Rek. pengirim, no. referensi, catatan kasir..."></div>
      ${isEdit && App.can('pembayaran', 'D') ? `<div class="field span2"><label>Alasan koreksi <span class="req">*</span></label><input class="input" id="bWhy" placeholder="Dicatat di riwayat aktivitas"></div>` : ''}
    </div></form>${App.can('pembayaran', 'V') ? '' : `<div class="alert warn" style="margin-top:14px">${icon('info')}<div>Pembayaran yang Anda catat berstatus <b>Menunggu</b> sampai diverifikasi owner. Saldo jemaah diperbarui setelah verifikasi.</div></div>`}`,
    foot: `<button class="btn" data-close>Batal</button><button class="btn gold" id="fBSave">${icon('check')} ${isEdit ? 'Simpan Koreksi' : 'Simpan & Terbitkan Kwitansi'}</button>`
  });
  const f = m.$('#fB');
  UI.fill(f, Object.assign({ tanggal_bayar: UI.today(), metode: 'Transfer Bank' }, isEdit ? pre : {}));
  if (isEdit) f.querySelector('[name=jumlah]').value = pre.jumlah;
  UI.bindRupiah(f);
  const sel = f.querySelector('[name=id_jemaah]'), term = f.querySelector('[name=id_cicilan]'), jml = f.querySelector('[name=jumlah]');
  let detail = null;
  const load = async () => {
    if (!sel.value) { m.$('#bInfo').innerHTML = ''; return; }
    m.$('#bInfo').innerHTML = '<div class="skel" style="height:64px"></div>';
    const r = await Api.safe('getJemaah', { id: sel.value }, { silent: true });
    if (!r) return; detail = r.data;
    m.$('#bInfo').innerHTML = `<div class="grid g4" style="gap:10px"><div class="mini-stat"><small>Total tagihan</small><b class="small">${UI.rp(detail.total_tagihan)}</b></div><div class="mini-stat"><small>Terbayar</small><b class="small">${UI.rp(detail.terbayar)}</b></div>
      <div class="mini-stat"><small>Menunggu verifikasi</small><b class="small">${UI.rp(detail.menunggu)}</b></div><div class="mini-stat" style="background:var(--gold-pale)"><small>Sisa tagihan</small><b class="small" style="color:#7c5800">${UI.rp(detail.sisa - detail.menunggu)}</b></div></div>`;
    const jd = detail.skema ? detail.skema.jadwal.filter(x => x.status !== 'Lunas' || x.id === pre.id_cicilan) : [];
    term.innerHTML = '<option value="">— Tanpa termin —</option>' + jd.map(x => `<option value="${x.id}" data-n="${x.nominal}" ${x.id === pre.id_cicilan ? 'selected' : ''}>${x.termin_ke == 0 ? 'Uang Muka (DP)' : 'Termin ke-' + x.termin_ke} • ${UI.tgl(x.tanggal_jatuh_tempo)} • ${UI.rp(x.nominal)} ${x.status === 'Terlambat' ? '(TERLAMBAT)' : ''}</option>`).join('');
    if (!isEdit && term.value) term.onchange();
  };
  term.onchange = () => { const o = term.selectedOptions[0]; if (o && o.dataset.n && !isEdit) { jml.value = Number(o.dataset.n).toLocaleString('id-ID'); } };
  if (!isEdit) {
    sel.onchange = load;
    m.$('#bFind').oninput = e => { const q = e.target.value.toLowerCase(); [...sel.options].forEach(o => o.hidden = q && !o.textContent.toLowerCase().includes(q)); };
  }
  if (sel.value) load();
  m.$('#fBSave').onclick = async e => {
    const d = UI.formData(f);
    d.jumlah = UI.parseRp(d.jumlah);
    if (!d.id_jemaah) return UI.toast('Pilih jemaah terlebih dahulu.', 'error');
    if (!d.jumlah) return UI.toast('Isi jumlah pembayaran.', 'error');
    if (isEdit) { d.id = pre.id; if (m.$('#bWhy')) { d.alasan = m.$('#bWhy').value.trim(); if (!d.alasan) return UI.toast('Isi alasan koreksi.', 'error'); } }
    const btn = e.currentTarget;
    try {
      const file = m.$('#bFile').files[0];
      if (file) d.bukti = await UI.readFile(file);
    } catch (err) { return UI.toast(err.message, 'error'); }
    const r = await UI.busy(btn, () => Api.safe('savePembayaran', d));
    if (!r) return;
    UI.toast(r.message); m.close(); App.cache = {}; App.refreshCounts();
    if (!isEdit && r.data.status_verifikasi === 'Terverifikasi') {
      const ok = await UI.confirm(`Kwitansi <b>${UI.esc(r.data.no_kwitansi)}</b> siap. Cetak PDF sekarang?`, { ok: 'Cetak Kwitansi', title: 'Pembayaran tersimpan' });
      if (ok) await UI.pdf('kwitansiPdf', { id: r.data.id }, null, false);
    }
    done && done(r.data);
  };
};

// ============================== SKEMA CICILAN ==============================
Pages.cicilan = {
  title: 'Skema Cicilan', group: 'Transaksi',
  async render(el, tab) {
    tab = tab || 'skema';
    const list = (await Api.call('listCicilan')).data;
    const today = UI.today();
    const all = list.filter(s => s.status === 'Aktif').flatMap(s => s.jadwal.filter(x => x.status !== 'Lunas').map(x => Object.assign({}, x, { nama: s.nama_jemaah, no_registrasi: s.no_registrasi, paket: s.nama_paket, email: s.email })));
    const telat = all.filter(x => x.status === 'Terlambat'), minggu = all.filter(x => x.selisih_hari >= 0 && x.selisih_hari <= 7);
    el.innerHTML = `<div class="page-head"><div><div class="eyebrow">Transaksi • Buku Cicilan</div><h1>Skema Cicilan & Jatuh Tempo</h1><p>Jadwal termin dibuat otomatis dari uang muka dan jumlah termin. Pengingat email terkirim otomatis setiap pagi pukul 07.00 WIB: beberapa hari sebelum jatuh tempo, pada hari-H, dan saat terlambat.</p></div>
      <div class="actions">${App.isOwner() ? `<button class="btn" id="ccRun">${icon('send')} Jalankan Pengingat Sekarang</button>` : ''}${App.can('cicilan', 'C') ? `<button class="btn gold" id="ccAdd">${icon('plus')} Buat Skema Cicilan</button>` : ''}</div></div>
      <div class="grid g4 mb">
        <div class="card kpi"><div class="lbl">Skema Aktif</div><div class="ico">${icon('calendar')}</div><div class="val">${list.filter(s => s.status === 'Aktif').length}<small>Jemaah</small></div><div class="sub">${list.filter(s => s.status === 'Lunas').length} skema sudah lunas</div></div>
        <div class="card kpi"><div class="lbl">Piutang Terjadwal</div><div class="ico gold">${icon('coins')}</div><div class="val money">${UI.rp(all.reduce((s, x) => s + x.nominal, 0))}</div><div class="sub">${all.length} termin belum lunas</div></div>
        <div class="card kpi"><div class="lbl">Terlambat</div><div class="ico red">${icon('alert')}</div><div class="val" style="color:var(--bad)">${telat.length}<small>Termin</small></div><div class="sub">${UI.rp(telat.reduce((s, x) => s + x.nominal, 0))}</div></div>
        <div class="card kpi"><div class="lbl">Jatuh Tempo ≤ 7 Hari</div><div class="ico gold">${icon('clock')}</div><div class="val">${minggu.length}<small>Termin</small></div><div class="sub">${UI.rp(minggu.reduce((s, x) => s + x.nominal, 0))}</div></div>
      </div>
      <div class="tabs mb" style="display:inline-flex"><button class="${tab === 'skema' ? 'on' : ''}" data-t="skema">${icon('list')} Skema per Jemaah</button><button class="${tab === 'tunggakan' ? 'on' : ''}" data-t="tunggakan">${icon('alert')} Tunggakan & Jatuh Tempo <span class="badge b-bad">${telat.length + minggu.length}</span></button></div>
      <div id="ccBody"></div>`;
    el.querySelectorAll('[data-t]').forEach(b => b.onclick = () => location.hash = '#/cicilan/' + b.dataset.t);
    const body = el.querySelector('#ccBody');
    if (tab === 'tunggakan') this.tunggakan(body, all); else this.skema(body, list);
    const add = el.querySelector('#ccAdd'); if (add) add.onclick = () => Forms.skema({}, () => App.reload());
    const run = el.querySelector('#ccRun'); if (run) run.onclick = async () => { const r = await UI.busy(run, () => Api.safe('runReminderNow')); if (r) { UI.toast(r.message); App.reload(); } };
  },
  skema(body, list) {
    body.innerHTML = `<div class="card mb"><div class="toolbar" style="border:0"><div class="search-in">${icon('search')}<input class="input" id="ccQ" placeholder="Cari nama jemaah / no registrasi..."></div>
      <select class="input" id="ccS" style="width:170px"><option value="Aktif">Skema Aktif</option><option value="Lunas">Lunas</option><option value="">Semua</option></select></div></div><div id="ccList"></div>`;
    const draw = () => {
      const q = body.querySelector('#ccQ').value.toLowerCase(), s = body.querySelector('#ccS').value;
      const rows = list.filter(x => (!q || (x.nama_jemaah + ' ' + x.no_registrasi).toLowerCase().includes(q)) && (!s || x.status === s));
      body.querySelector('#ccList').innerHTML = rows.length ? rows.map(s => {
        const n = s.jadwal.length, p = Math.round(s.termin_lunas / Math.max(1, n) * 100), nx = s.termin_berikut;
        return `<div class="accordion" data-id="${s.id}"><div class="acc-head"><span class="chev">${icon('right')}</span><div class="avatar">${UI.initials(s.nama_jemaah)}</div>
          <div style="flex:1;min-width:0"><b>${UI.esc(s.nama_jemaah)}</b> <span class="xs muted mono">${UI.esc(s.no_registrasi)}</span><div class="xs muted">${UI.esc(s.nama_paket)} • Total ${UI.rp(s.total_tagihan)} • DP ${UI.rp(s.uang_muka)} • ${s.jumlah_termin} termin</div></div>
          <div style="width:180px" class="hide-sm"><div class="xs muted" style="display:flex;justify-content:space-between"><span>${s.termin_lunas}/${n} lunas</span><span>${p}%</span></div><div class="progress"><i style="width:${p}%"></i></div></div>
          <div style="text-align:right;min-width:150px">${s.termin_terlambat ? UI.badge(s.termin_terlambat + ' terlambat', 'bad') : nx ? UI.badge('Berikut ' + UI.tgl(nx.tanggal_jatuh_tempo), 'warn') : UI.badge('Lunas')}</div></div>
          <div class="acc-body"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Termin</th><th>Jatuh Tempo</th><th class="r">Nominal</th><th>Status</th><th>Pengingat</th><th class="r">Aksi</th></tr></thead><tbody>
          ${s.jadwal.map(x => `<tr><td><b>${x.termin_ke == 0 ? 'Uang Muka (DP)' : 'Termin ke-' + x.termin_ke}</b></td><td>${UI.tgl(x.tanggal_jatuh_tempo)} ${x.status !== 'Lunas' ? `<span class="xs muted">(${x.selisih_hari < 0 ? Math.abs(x.selisih_hari) + ' hari lalu' : x.selisih_hari === 0 ? 'hari ini' : 'H-' + x.selisih_hari})</span>` : ''}</td>
            <td class="r tabular">${UI.rp(x.nominal)}</td><td>${UI.badge(x.status)}${x.tanggal_lunas ? `<div class="xs muted">lunas ${UI.tgl(x.tanggal_lunas)}</div>` : ''}</td><td class="xs muted">${UI.esc(x.pengingat_terkirim || '-')}</td>
            <td class="r"><div class="row-actions">${x.status !== 'Lunas' && App.can('pembayaran', 'C') ? `<button class="btn xs gold" data-pay="${s.id_jemaah}" data-term="${x.id}">${icon('wallet')} Bayar</button>` : ''}
            ${x.status !== 'Lunas' && App.can('cicilan', 'U') ? `<button class="btn xs" data-ej='${JSON.stringify({ id: x.id, n: x.nominal, t: x.tanggal_jatuh_tempo, k: x.termin_ke })}'>${icon('edit')}</button>` : ''}</div></td></tr>`).join('')}
          </tbody></table></div>
          <div class="actions" style="margin-top:12px;justify-content:space-between"><span class="xs muted">Email pengingat: ${UI.esc(s.email || 'belum diisi — pengingat tidak terkirim')}</span><span class="actions"><a class="btn sm" href="#/jemaah/${s.id_jemaah}">${icon('eye')} Profil jemaah</a>${App.can('cicilan', 'D') ? `<button class="btn sm danger" data-del="${s.id}">${icon('trash')} Hapus skema</button>` : ''}</span></div></div></div>`;
      }).join('') : `<div class="card card-pad">${UI.empty('Belum ada skema cicilan.', 'calendar')}</div>`;
      body.querySelectorAll('.acc-head').forEach(h => h.onclick = () => h.parentElement.classList.toggle('open'));
      body.querySelectorAll('[data-pay]').forEach(b => b.onclick = () => Forms.pembayaran({ id_jemaah: b.dataset.pay, id_cicilan: b.dataset.term }, () => App.reload()));
      body.querySelectorAll('[data-ej]').forEach(b => b.onclick = () => this.editTermin(JSON.parse(b.dataset.ej)));
      body.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => { if (await UI.confirm('Hapus skema cicilan ini? Pembayaran yang sudah tercatat tetap tersimpan.', { danger: true, ok: 'Hapus' })) { const r = await Api.safe('deleteSkema', { id: b.dataset.del }); if (r) { UI.toast(r.message); App.reload(); } } });
      const first = body.querySelector('.accordion'); if (first && rows.length === 1) first.classList.add('open');
    };
    body.querySelector('#ccQ').oninput = draw; body.querySelector('#ccS').onchange = draw;
    draw();
  },
  editTermin(x) {
    const m = UI.modal({
      title: 'Ubah ' + (x.k == 0 ? 'Uang Muka' : 'Termin ke-' + x.k), eyebrow: 'Penyesuaian manual', size: 'sm',
      body: `<form id="fE" class="grid" style="gap:12px"><div class="field"><label>Tanggal jatuh tempo</label><input class="input" type="date" name="tanggal_jatuh_tempo" value="${x.t}"></div>
        <div class="field"><label>Nominal</label><input class="input" name="nominal" data-rp value="${x.n}"></div></form>
        <div class="alert warn" style="margin-top:12px">${icon('info')}<div>Pastikan total seluruh termin tetap sama dengan total tagihan skema.</div></div>`,
      foot: `<button class="btn" data-close>Batal</button><button class="btn primary" id="fESave">Simpan</button>`
    });
    UI.bindRupiah(m.$('#fE'));
    m.$('#fESave').onclick = async e => {
      const d = UI.formData(m.$('#fE')); d.id = x.id; d.nominal = UI.parseRp(d.nominal);
      const r = await UI.busy(e.currentTarget, () => Api.safe('updateJadwal', d));
      if (r) { UI.toast(r.message, r.message.includes('⚠') ? 'warn' : 'ok'); m.close(); App.reload(); }
    };
  },
  tunggakan(body, all) {
    body.innerHTML = `<div class="card"><div class="toolbar"><div class="search-in">${icon('search')}<input class="input" id="tgQ" placeholder="Cari jemaah..."></div>
      <select class="input" id="tgF" style="width:220px"><option value="due">Terlambat + jatuh tempo ≤ 7 hari</option><option value="late">Hanya terlambat</option><option value="all">Semua termin belum lunas</option></select>
      <button class="btn" id="tgCsv">${icon('download')} Ekspor CSV</button></div><div id="tgT"></div></div>`;
    const tbl = UI.table(body.querySelector('#tgT'), {
      rows: [], emptyText: 'Tidak ada tunggakan. Alhamdulillah.',
      columns: [
        { label: 'Jemaah', render: x => `<div class="name"><b><a href="#/jemaah/${x.id_jemaah}" style="color:inherit">${UI.esc(x.nama)}</a></b><small>${UI.esc(x.no_registrasi)}</small></div>` },
        { label: 'Paket', render: x => `<span class="small">${UI.esc(x.paket)}</span>` },
        { label: 'Termin', render: x => x.termin_ke == 0 ? 'Uang Muka' : 'Termin ke-' + x.termin_ke },
        { label: 'Jatuh Tempo', render: x => UI.tgl(x.tanggal_jatuh_tempo) },
        { label: 'Nominal', cls: 'r', render: x => UI.rp(x.nominal) },
        { label: 'Status', render: x => x.selisih_hari < 0 ? UI.badge('Terlambat ' + Math.abs(x.selisih_hari) + ' hari', 'bad') : UI.badge(x.selisih_hari === 0 ? 'Hari ini' : 'H-' + x.selisih_hari, 'warn') },
        { label: 'Pengingat', render: x => `<span class="xs muted">${UI.esc(x.pengingat_terkirim || (x.email ? 'belum' : 'email kosong'))}</span>` },
        { label: '', cls: 'r', render: x => App.can('pembayaran', 'C') ? `<button class="btn xs gold" data-pay="${x.id_jemaah}" data-term="${x.id}">${icon('wallet')} Catat</button>` : '' }
      ],
      onRender: t => t.querySelectorAll('[data-pay]').forEach(b => b.onclick = () => Forms.pembayaran({ id_jemaah: b.dataset.pay, id_cicilan: b.dataset.term }, () => App.reload()))
    });
    let rows = [];
    const apply = () => {
      const q = body.querySelector('#tgQ').value.toLowerCase(), f = body.querySelector('#tgF').value;
      rows = all.filter(x => (!q || (x.nama + x.no_registrasi).toLowerCase().includes(q)) && (f === 'all' || (f === 'late' && x.selisih_hari < 0) || (f === 'due' && x.selisih_hari <= 7)))
        .sort((a, b) => a.tanggal_jatuh_tempo < b.tanggal_jatuh_tempo ? -1 : 1);
      tbl.setRows(rows);
    };
    body.querySelector('#tgQ').oninput = apply; body.querySelector('#tgF').onchange = apply; apply();
    body.querySelector('#tgCsv').onclick = () => UI.csv('Tunggakan_Cicilan_' + UI.today(), rows, [{ label: 'No Reg', key: 'no_registrasi' }, { label: 'Jemaah', key: 'nama' }, { label: 'Paket', key: 'paket' }, { label: 'Termin', key: 'termin_ke' }, { label: 'Jatuh Tempo', key: 'tanggal_jatuh_tempo' }, { label: 'Nominal', key: 'nominal' }, { label: 'Status', key: 'status' }, { label: 'Selisih Hari', key: 'selisih_hari' }, { label: 'Email', key: 'email' }]);
  }
};

Forms.skema = async (pre = {}, done) => {
  const [jem, sk] = await Promise.all([App.jemaahCache(true), Api.safe('listCicilan', {}, { silent: true })]);
  const punya = new Set(((sk && sk.data) || []).filter(s => s.status === 'Aktif').map(s => s.id_jemaah));
  const cand = jem.filter(j => j.status !== 'Batal' && j.sisa > 0 && !punya.has(j.id));
  const m = UI.modal({
    title: 'Buat Skema Cicilan', eyebrow: 'Jadwal termin otomatis', size: 'lg',
    body: `<form id="fS"><div class="form-grid c3">
      <div class="field span3"><label>Jemaah <span class="req">*</span></label><select class="input" name="id_jemaah">${UI.options(cand, 'id', j => j.no_registrasi + ' — ' + j.nama_lengkap + ' • sisa ' + UI.rp(j.sisa), pre.id_jemaah, '— Pilih jemaah (yang belum punya skema aktif) —')}</select></div>
      <div class="field"><label>Total yang dicicil <span class="req">*</span></label><input class="input" name="total_tagihan" data-rp><span class="hint">Default: sisa tagihan jemaah</span></div>
      <div class="field"><label>Uang muka (DP)</label><input class="input" name="uang_muka" data-rp value="0"></div>
      <div class="field"><label>Jumlah termin (selain DP) <span class="req">*</span></label><input class="input" type="number" min="1" max="24" name="jumlah_termin" value="4"></div>
      <div class="field"><label>Tanggal mulai / DP <span class="req">*</span></label><input class="input" type="date" name="tanggal_mulai" value="${UI.today()}"></div>
      <div class="field span2" style="justify-content:flex-end"><button type="button" class="btn" id="sGen">${icon('refresh')} Hitung ulang jadwal</button></div>
    </div></form>
    <h4 style="margin:18px 0 8px">Pratinjau jadwal <span class="hint" style="font-weight:400">— nominal & tanggal boleh disesuaikan manual</span></h4>
    <div id="sPrev"></div>`,
    foot: `<button class="btn" data-close>Batal</button><button class="btn primary" id="fSSave">${icon('check')} Simpan Skema</button>`
  });
  const f = m.$('#fS'); UI.bindRupiah(f);
  const g = n => f.querySelector(`[name=${n}]`);
  let jadwal = [];
  const setDefault = () => { const j = cand.find(x => x.id === g('id_jemaah').value); if (j) { g('total_tagihan').value = j.sisa.toLocaleString('id-ID'); gen(); } };
  const gen = () => {
    const total = UI.parseRp(g('total_tagihan').value), dp = UI.parseRp(g('uang_muka').value), n = Math.max(1, Math.min(24, +g('jumlah_termin').value || 1)), mulai = g('tanggal_mulai').value;
    jadwal = [];
    if (total > 0 && mulai) {
      if (dp > 0) jadwal.push({ termin_ke: 0, tanggal_jatuh_tempo: mulai, nominal: dp });
      const sisa = total - dp, per = Math.floor(sisa / n / 1000) * 1000;
      for (let i = 1; i <= n; i++) jadwal.push({ termin_ke: i, tanggal_jatuh_tempo: UI.addMonths(mulai, i), nominal: i === n ? sisa - per * (n - 1) : per });
    }
    draw();
  };
  const draw = () => {
    const total = UI.parseRp(g('total_tagihan').value), sum = jadwal.reduce((s, x) => s + x.nominal, 0);
    m.$('#sPrev').innerHTML = jadwal.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Termin</th><th>Jatuh tempo</th><th class="r">Nominal</th></tr></thead><tbody>
      ${jadwal.map((x, i) => `<tr><td><b>${x.termin_ke == 0 ? 'Uang Muka (DP)' : 'Termin ke-' + x.termin_ke}</b></td><td><input class="input" type="date" data-i="${i}" data-k="tanggal_jatuh_tempo" value="${x.tanggal_jatuh_tempo}" style="max-width:180px"></td><td class="r"><input class="input" data-i="${i}" data-k="nominal" value="${x.nominal.toLocaleString('id-ID')}" style="max-width:180px;text-align:right"></td></tr>`).join('')}
      <tr><td colspan="2" class="r"><b>Total</b></td><td class="r"><b style="color:${sum === total ? 'var(--ok)' : 'var(--bad)'}">${UI.rp(sum)}</b>${sum !== total ? `<div class="xs" style="color:var(--bad)">harus ${UI.rp(total)}</div>` : ''}</td></tr></tbody></table></div>` : UI.empty('Isi total & tanggal mulai.');
    m.$$('#sPrev [data-i]').forEach(inp => inp.onchange = () => { const x = jadwal[+inp.dataset.i]; x[inp.dataset.k] = inp.dataset.k === 'nominal' ? UI.parseRp(inp.value) : inp.value; draw(); });
  };
  g('id_jemaah').onchange = setDefault;
  ['uang_muka', 'jumlah_termin', 'tanggal_mulai', 'total_tagihan'].forEach(n => g(n).addEventListener('change', gen));
  m.$('#sGen').onclick = gen;
  if (pre.id_jemaah) setDefault(); else gen();
  m.$('#fSSave').onclick = async e => {
    const d = UI.formData(f);
    d.total_tagihan = UI.parseRp(d.total_tagihan); d.uang_muka = UI.parseRp(d.uang_muka); d.jadwal = jadwal;
    if (!d.id_jemaah) return UI.toast('Pilih jemaah.', 'error');
    const r = await UI.busy(e.currentTarget, () => Api.safe('saveSkema', d));
    if (r) { UI.toast(r.message); m.close(); App.cache = {}; done && done(); }
  };
};

// ============================== PENGELUARAN ==============================
Pages.pengeluaran = {
  title: 'Pengeluaran Operasional', group: 'Transaksi',
  async render(el) {
    const list = (await Api.call('listPengeluaran')).data;
    const bln = UI.today().slice(0, 7), thn = bln.slice(0, 4);
    const ini = list.filter(x => x.tanggal.slice(0, 7) === bln), th = list.filter(x => x.tanggal.slice(0, 4) === thn);
    const perKat = {}; ini.forEach(x => perKat[x.kategori] = (perKat[x.kategori] || 0) + x.jumlah);
    const top = Object.entries(perKat).sort((a, b) => b[1] - a[1])[0];
    const totIni = ini.reduce((s, x) => s + x.jumlah, 0);
    el.innerHTML = `<div class="page-head"><div><div class="eyebrow">Transaksi • Owner</div><h1>Pengeluaran Operasional</h1><p>Biaya tiket, hotel, visa, transportasi, konsumsi & operasional kantor. Kaitkan dengan kloter agar laba per keberangkatan terhitung otomatis.</p></div>
      <div class="actions">${App.can('pengeluaran', 'C') ? `<button class="btn gold" id="peAdd">${icon('plus')} Catat Pengeluaran</button>` : ''}</div></div>
      <div class="grid g4 mb">
        <div class="card kpi"><div class="lbl">Pengeluaran Bulan Ini</div><div class="ico red">${icon('receipt')}</div><div class="val money">${UI.rp(totIni)}</div><div class="sub">${ini.length} transaksi • ${UI.periode(bln)}</div></div>
        <div class="card kpi"><div class="lbl">Akumulasi Tahun ${thn}</div><div class="ico">${icon('chart')}</div><div class="val money">${UI.rp(th.reduce((s, x) => s + x.jumlah, 0))}</div><div class="sub">${th.length} transaksi</div></div>
        <div class="card kpi"><div class="lbl">Kategori Terbesar (bulan ini)</div><div class="ico gold">${icon('coins')}</div><div class="val" style="font-size:24px">${top ? UI.esc(top[0]) : '-'}</div><div class="sub">${top ? UI.rp(top[1]) + ' • ' + Math.round(top[1] / totIni * 100) + '%' : 'Belum ada'}</div></div>
        <div class="card kpi"><div class="lbl">Terkait Kloter</div><div class="ico mint">${icon('plane')}</div><div class="val">${th.filter(x => x.id_keberangkatan).length}<small>/ ${th.length}</small></div><div class="sub">Sisanya biaya umum kantor</div></div>
      </div>
      <div class="card"><div class="toolbar"><div class="search-in">${icon('search')}<input class="input" id="peQ" placeholder="Cari deskripsi..."></div>
        <input class="input" type="month" id="peB" style="width:160px"><select class="input" id="peK" style="width:160px"><option value="">Semua Kategori</option>${KAT_KELUAR.map(k => `<option>${k}</option>`).join('')}</select>
        <select class="input" id="peKb" style="width:190px">${UI.options(App.state.kb, 'id', k => k.kode_keberangkatan, '', 'Semua Kloter')}<option value="-">Biaya umum (tanpa kloter)</option></select>
        <button class="btn" id="peCsv">${icon('download')}</button></div><div id="peT"></div></div>`;
    const canU = App.can('pengeluaran', 'U'), canD = App.can('pengeluaran', 'D');
    const tbl = UI.table(el.querySelector('#peT'), {
      rows: [], emptyText: 'Belum ada pengeluaran.',
      columns: [{ label: 'Tanggal', render: x => UI.tgl(x.tanggal) }, { label: 'Kategori', render: x => `<span class="pill gold">${UI.esc(x.kategori)}</span>` },
        { label: 'Deskripsi', render: x => `<div class="name"><b style="font-weight:500">${UI.esc(x.deskripsi)}</b><small>oleh ${UI.esc(x.created_by)}</small></div>` },
        { label: 'Kloter', render: x => x.kode_keberangkatan ? `<span class="code-tag">${UI.esc(x.kode_keberangkatan)}</span>` : '<span class="xs muted">Umum</span>' },
        { label: 'Jumlah', cls: 'r', render: x => `<b>${UI.rp(x.jumlah)}</b>` },
        { label: 'Bukti', render: x => x.id_bukti_drive ? `<button class="btn xs" data-b="${x.id_bukti_drive}">${icon('eye')}</button>` : '-' },
        { label: '', cls: 'r', render: x => `<div class="row-actions">${canU ? `<button class="btn icon" data-e="${x.id}">${icon('edit')}</button>` : ''}${canD ? `<button class="btn icon" data-d="${x.id}">${icon('trash')}</button>` : ''}</div>` }],
      onRender: t => {
        t.querySelectorAll('[data-b]').forEach(b => b.onclick = () => UI.viewFile(b.dataset.b, b));
        t.querySelectorAll('[data-e]').forEach(b => b.onclick = () => Forms.pengeluaran(list.find(x => x.id === b.dataset.e), () => App.reload()));
        t.querySelectorAll('[data-d]').forEach(b => b.onclick = async () => { if (await UI.confirm('Hapus pengeluaran ini?', { danger: true })) { const r = await Api.safe('deletePengeluaran', { id: b.dataset.d }); if (r) { UI.toast(r.message); App.reload(); } } });
      }
    });
    const $ = s => el.querySelector(s);
    let rows = list;
    const apply = () => {
      const q = $('#peQ').value.toLowerCase(), b = $('#peB').value, k = $('#peK').value, kb = $('#peKb').value;
      rows = list.filter(x => (!q || x.deskripsi.toLowerCase().includes(q)) && (!b || x.tanggal.slice(0, 7) === b) && (!k || x.kategori === k) && (!kb || (kb === '-' ? !x.id_keberangkatan : x.id_keberangkatan === kb)));
      tbl.setRows(rows);
    };
    ['#peQ', '#peB', '#peK', '#peKb'].forEach(s => $(s).addEventListener('input', apply)); apply();
    if ($('#peAdd')) $('#peAdd').onclick = () => Forms.pengeluaran({}, () => App.reload());
    $('#peCsv').onclick = () => UI.csv('Pengeluaran_' + UI.today(), rows, [{ label: 'Tanggal', key: 'tanggal' }, { label: 'Kategori', key: 'kategori' }, { label: 'Deskripsi', key: 'deskripsi' }, { label: 'Kloter', key: 'kode_keberangkatan' }, { label: 'Jumlah', key: 'jumlah' }, { label: 'Petugas', key: 'created_by' }]);
  }
};
Forms.pengeluaran = (data = {}, done) => {
  const m = UI.modal({
    title: data.id ? 'Ubah Pengeluaran' : 'Catat Pengeluaran', eyebrow: 'Pengeluaran Operasional',
    body: `<form id="fX" class="form-grid">
      <div class="field"><label>Tanggal <span class="req">*</span></label><input class="input" type="date" name="tanggal" max="${UI.today()}"></div>
      <div class="field"><label>Kategori <span class="req">*</span></label><select class="input" name="kategori">${KAT_KELUAR.map(k => `<option>${k}</option>`).join('')}</select></div>
      <div class="field span2"><label>Kloter terkait <span class="hint">opsional — untuk laba per keberangkatan</span></label><select class="input" name="id_keberangkatan">${UI.options(App.state.kb, 'id', k => k.kode_keberangkatan + ' • ' + UI.tgl(k.tanggal_berangkat) + ' • ' + k.nama_paket, data.id_keberangkatan, '— Biaya umum (tanpa kloter) —')}</select></div>
      <div class="field span2"><label>Deskripsi <span class="req">*</span></label><input class="input" name="deskripsi" placeholder="Contoh: Pelunasan group booking Saudia SV-816 (45 pax)"></div>
      <div class="field"><label>Jumlah (Rp) <span class="req">*</span></label><input class="input" name="jumlah" data-rp style="font-weight:700"></div>
      <div class="field"><label>Bukti / nota</label><input class="input" type="file" id="xFile" accept="image/*,application/pdf" style="padding:7px"></div>
    </form>`,
    foot: `<button class="btn" data-close>Batal</button><button class="btn primary" id="fXSave">${icon('check')} Simpan</button>`
  });
  const f = m.$('#fX');
  UI.fill(f, Object.assign({ tanggal: UI.today() }, data));
  UI.bindRupiah(f);
  m.$('#fXSave').onclick = async e => {
    const d = UI.formData(f); d.jumlah = UI.parseRp(d.jumlah); if (data.id) d.id = data.id;
    try { const file = m.$('#xFile').files[0]; if (file) d.bukti = await UI.readFile(file); } catch (err) { return UI.toast(err.message, 'error'); }
    const r = await UI.busy(e.currentTarget, () => Api.safe('savePengeluaran', d));
    if (r) { UI.toast(r.message); m.close(); done && done(); }
  };
};

// ============================== LAPORAN KEUANGAN ==============================
Pages.laporan = {
  title: 'Laporan Keuangan', group: 'Laporan & SDM', tahun: null,
  async render(el) {
    this.tahun = this.tahun || UI.today().slice(0, 4);
    const L = (await Api.call('getLaporan', { tahun: this.tahun })).data, r = L.ringkasan;
    const y = +UI.today().slice(0, 4);
    const kbs = L.per_keberangkatan, maxLaba = Math.max(1, ...kbs.map(k => Math.abs(k.laba)));
    const nowM = UI.today().slice(0, 7);
    const kat = Object.entries(L.per_kategori).sort((a, b) => b[1] - a[1]), maxKat = Math.max(1, ...kat.map(k => k[1]));
    el.innerHTML = `<div class="page-head"><div><h1>Laporan Keuangan & Laba per Kloter</h1><span class="badge b-ok">${icon('checkc')} ${App.isOwner() ? 'Owner Access Validated' : 'Akses laporan didelegasikan owner'}</span>
      <p style="margin-top:8px">Pemasukan = pembayaran jemaah terverifikasi. Pengeluaran = biaya operasional tercatat. Laba per kloter dihitung dari pembayaran jemaah kloter tersebut dikurangi biaya yang dikaitkan.</p></div>
      <div class="actions"><select class="input" id="lpY" style="width:150px">${[y + 1, y, y - 1, y - 2].map(v => `<option ${String(v) === this.tahun ? 'selected' : ''}>${v}</option>`).join('')}</select>
        <button class="btn" id="lpCsv">${icon('download')} Excel (.csv)</button><button class="btn primary" id="lpPdf">${icon('printer')} Ekspor PDF Resmi</button></div></div>
      <div class="grid g4 mb">
        <div class="card kpi"><div class="lbl">Total Pemasukan (Omset)</div><div class="ico">${icon('wallet')}</div><div class="val money">${UI.rp(r.pemasukan)}</div><div class="sub">Tahun ${L.tahun}</div></div>
        <div class="card kpi"><div class="lbl">Beban Operasional & COGS</div><div class="ico red">${icon('receipt')}</div><div class="val money">${UI.rp(r.pengeluaran)}</div><div class="sub">Umum (non-kloter): ${UI.rp(r.pengeluaran_umum)}</div></div>
        <div class="card kpi dark"><div class="lbl">Laba Bersih Agensi</div><div class="val money">${UI.rp(r.laba)}</div><div class="sub"><b style="color:var(--gold-soft)">${r.margin}% Net Margin</b></div></div>
        <div class="card kpi"><div class="lbl">Sisa Piutang Jemaah</div><div class="ico gold">${icon('clock')}</div><div class="val money" style="color:#7c5800">${UI.rp(r.piutang)}</div><div class="sub">${L.piutang.length} jemaah belum lunas</div></div>
      </div>
      <div class="grid g-6040 mb">
        <div class="card"><div class="card-head"><div><h3>Tren Pemasukan vs Pengeluaran Bulanan</h3><p>Realisasi arus kas ${L.tahun}</p></div><div class="legend"><span><i style="background:var(--primary)"></i>Pemasukan</span><span><i style="background:var(--gold)"></i>Pengeluaran</span></div></div>
          <div class="card-body">${UI.barChart(L.bulanan.map(b => ({ a: b.pemasukan, b: b.pengeluaran, label: BLN[+b.bulan.slice(5) - 1], now: b.bulan === nowM })))}</div></div>
        <div class="card"><div class="card-head"><div><h3>Komparasi Laba per Kloter</h3><p>Margin profitabilitas aktual</p></div><span class="pill">${kbs.length} kloter</span></div>
          <div class="card-body">${kbs.length ? kbs.slice(0, 6).map(k => `<div class="kloter"><div class="kloter-top"><b class="mono small">${UI.esc(k.kode)}</b><b class="small" style="color:${k.laba < 0 ? 'var(--bad)' : 'inherit'}">${UI.rp(k.laba)}</b></div>
            <div class="xs muted" style="display:flex;justify-content:space-between"><span>Omset ${UI.rpShort(k.pemasukan)} • Beban ${UI.rpShort(k.pengeluaran)}</span><span>Margin ${k.margin}%</span></div>
            <div class="progress ${k.laba < 0 ? 'red' : ''}" style="margin-top:6px"><i style="width:${Math.abs(k.laba) / maxLaba * 100}%"></i></div></div>`).join('') : UI.empty('Belum ada data kloter.', 'plane')}
            <div class="dl"><span>Total akumulasi laba kloter</span><b>${UI.rp(kbs.reduce((s, k) => s + k.laba, 0))}</b></div></div></div>
      </div>
      <div class="card mb"><div class="card-head"><div><h3>Rekapitulasi Finansial & Laba Bersih per Kloter</h3><p>Rincian omset, komponen beban, dan margin</p></div></div><div id="lpKb"></div></div>
      <div class="grid g-6040">
        <div class="card"><div class="card-head"><div><h3>Piutang Jemaah</h3><p>Tagihan belum terbayar (berdasarkan pembayaran terverifikasi)</p></div></div><div id="lpPi"></div></div>
        <div class="card"><div class="card-head"><div><h3>Pengeluaran per Kategori</h3><p>Tahun ${L.tahun}</p></div></div><div class="card-body">${kat.length ? kat.map(([k, v]) => `<div style="margin-bottom:12px"><div class="dl" style="border:0;padding:0 0 4px"><span>${UI.esc(k)}</span><b>${UI.rp(v)}</b></div><div class="progress gold"><i style="width:${v / maxKat * 100}%"></i></div></div>`).join('') : UI.empty('Belum ada pengeluaran.')}</div></div>
      </div>`;
    UI.table(el.querySelector('#lpKb'), {
      rows: kbs, emptyText: 'Belum ada data kloter.',
      columns: [{ label: 'Kode & Tanggal', render: k => `<div class="name"><b class="mono">${UI.esc(k.kode)}</b><small>${UI.tgl(k.tanggal)}</small></div>` }, { label: 'Paket', render: k => `<div class="name"><b style="font-weight:500">${UI.esc(k.paket)}</b><small>${UI.esc(k.maskapai || '')}</small></div>` },
        { label: 'Pax / Kuota', render: k => UI.badge(k.terisi + ' / ' + k.kuota + ' (' + Math.round(k.terisi / Math.max(1, k.kuota) * 100) + '%)', k.terisi >= k.kuota ? 'ok' : 'gold') },
        { label: 'Total Pemasukan', cls: 'r', render: k => UI.rp(k.pemasukan) }, { label: 'Tiket & Hotel', cls: 'r', render: k => `<span class="small">${UI.rp((k.rincian.Tiket || 0) + (k.rincian.Hotel || 0))}</span>` },
        { label: 'Visa, Ops & Lain', cls: 'r', render: k => `<span class="small">${UI.rp(k.pengeluaran - (k.rincian.Tiket || 0) - (k.rincian.Hotel || 0))}</span>` },
        { label: 'Total Beban', cls: 'r', render: k => `<span style="color:var(--bad)">${UI.rp(k.pengeluaran)}</span>` }, { label: 'Laba', cls: 'r', render: k => `<b>${UI.rp(k.laba)}</b><div class="xs muted">${k.margin}%</div>` }]
    });
    UI.table(el.querySelector('#lpPi'), {
      rows: L.piutang, pageSize: 8, emptyText: 'Tidak ada piutang.',
      columns: [{ label: 'Jemaah', render: p => `<div class="name"><b><a href="#/jemaah/${p.id}" style="color:inherit">${UI.esc(p.nama)}</a></b><small>${UI.esc(p.no_registrasi)} • ${UI.esc(p.kloter)}</small></div>` },
        { label: 'Tagihan', cls: 'r', render: p => UI.rp(p.tagihan) }, { label: 'Terbayar', cls: 'r', render: p => UI.rp(p.terbayar) }, { label: 'Sisa', cls: 'r', render: p => `<b style="color:#7c5800">${UI.rp(p.sisa)}</b>` }]
    });
    el.querySelector('#lpY').onchange = e => { this.tahun = e.target.value; App.reload(); };
    el.querySelector('#lpPdf').onclick = e => UI.pdf('laporanPdf', { tahun: this.tahun }, e.currentTarget, false);
    el.querySelector('#lpCsv').onclick = () => {
      UI.csv('Laporan_Bulanan_' + L.tahun, L.bulanan, [{ label: 'Bulan', get: b => UI.periode(b.bulan) }, { label: 'Pemasukan', key: 'pemasukan' }, { label: 'Pengeluaran', key: 'pengeluaran' }, { label: 'Laba', key: 'laba' }]);
      setTimeout(() => UI.csv('Laporan_per_Kloter_' + L.tahun, kbs, [{ label: 'Kloter', key: 'kode' }, { label: 'Tanggal', key: 'tanggal' }, { label: 'Paket', key: 'paket' }, { label: 'Pax', key: 'terisi' }, { label: 'Kuota', key: 'kuota' }, { label: 'Pemasukan', key: 'pemasukan' }, { label: 'Pengeluaran', key: 'pengeluaran' }, { label: 'Laba', key: 'laba' }, { label: 'Margin %', key: 'margin' }]), 400);
      setTimeout(() => UI.csv('Piutang_Jemaah_' + UI.today(), L.piutang, [{ label: 'No Reg', key: 'no_registrasi' }, { label: 'Nama', key: 'nama' }, { label: 'Paket', key: 'paket' }, { label: 'Kloter', key: 'kloter' }, { label: 'Tagihan', key: 'tagihan' }, { label: 'Terbayar', key: 'terbayar' }, { label: 'Sisa', key: 'sisa' }]), 800);
    };
  }
};
