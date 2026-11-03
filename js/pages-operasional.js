// ============================================================================
// HALAMAN OPERASIONAL — Dashboard, Data Jemaah (+detail & dokumen), Paket, Keberangkatan
// ============================================================================
window.Pages = window.Pages || {};
window.Forms = window.Forms || {};

// ============================== DASHBOARD ==============================
Pages.dashboard = {
  title: 'Dashboard', group: 'Utama',
  async render(el) {
    const d = (await Api.call('getDashboard')).data;
    const u = App.state.user, k = d.keuangan, kb = d.keberangkatan_terdekat;
    const now = new Date();
    const pct = kb ? Math.round(kb.terisi / Math.max(1, kb.kuota) * 100) : 0;
    el.innerHTML = `
    <div class="page-head">
      <div><h1>Selamat datang, ${UI.esc(u.nama_lengkap)}</h1>
        <div class="actions"><span class="badge b-ok">${icon('checkc')} ${u.peran === 'Owner' ? 'Akses Penuh: Owner / Pimpinan' : 'Akses ' + (u.akses_admin ? 'Karyawan + Admin' : 'Karyawan')}</span>
        <span class="muted small">${HARI[now.getDay()]}, ${UI.tglPanjang(UI.today())}</span></div></div>
      <div class="actions">${App.can('jemaah', 'C') ? `<button class="btn" id="dbAddJ">${icon('users')} Daftarkan Jemaah</button>` : ''}
        ${App.can('laporan') ? `<a class="btn primary" href="#/laporan">${icon('chart')} Laporan Keuangan</a>` : ''}</div>
    </div>
    <div class="grid g4 mb">
      <div class="card kpi"><div class="lbl">Jemaah Aktif</div><div class="ico">${icon('users')}</div>
        <div class="val">${d.jemaah_aktif}<small>Orang</small></div>
        <span class="chip-up">${icon('trend')} +${d.jemaah_baru_bulan_ini} bulan ini</span>
        <div class="sub" style="margin-top:8px">${d.dokumen_lengkap} dokumen lengkap 4/4</div></div>
      <div class="card kpi"><div class="lbl">Keberangkatan Terdekat</div><div class="ico gold">${icon('plane')}</div>
        ${kb ? `<div class="val" style="font-size:24px">${UI.tgl(kb.tanggal_berangkat)}</div><div class="sub">${UI.esc(kb.kode_keberangkatan)} • ${UI.esc(kb.nama_paket)}</div>
        <div class="dl" style="border:0;margin-top:6px"><span>Kapasitas ${kb.terisi}/${kb.kuota}</span><b style="color:#7c5800">Sisa ${kb.sisa_kursi} kursi</b></div>
        <div class="progress gold"><i style="width:${pct}%"></i></div>` : `<div class="val" style="font-size:22px">-</div><div class="sub">Belum ada jadwal mendatang</div>`}</div>
      <div class="card kpi"><div class="lbl">Jatuh Tempo (≤7 hari)</div><div class="ico gold">${icon('clock')}</div>
        <div class="val">${d.cicilan_minggu_ini}<small>Termin</small></div>
        <span class="badge b-warn">${UI.rp(d.nominal_jatuh_tempo)}</span>
        <div class="sub" style="margin-top:8px">Termasuk yang sudah terlambat</div></div>
      <div class="card kpi"><div class="lbl">Menunggu Verifikasi</div><div class="ico">${icon('file')}</div>
        <div class="val">${d.menunggu_verifikasi}<small>Transaksi</small></div>
        <div class="sub">Total: <b>${UI.rp(d.nominal_menunggu)}</b></div>
        <a class="link-btn" style="margin-top:8px" href="#/pembayaran">Lihat antrean ${icon('right')}</a></div>
    </div>
    ${k ? `<div class="grid g3 mb">
      <div class="card kpi"><div class="lbl">Pemasukan Bulan Ini</div><div class="val money">${UI.rp(k.pemasukan_bulan_ini)}</div><div class="sub">Pembayaran jemaah terverifikasi</div></div>
      <div class="card kpi"><div class="lbl">Pengeluaran Operasional</div><div class="val money">${UI.rp(k.pengeluaran_bulan_ini)}</div><div class="sub">Tiket, hotel, visa & operasional bulan ini</div></div>
      <div class="card kpi dark"><div class="lbl">Saldo Bersih Operasional</div><div class="val money">${UI.rp(k.saldo_bersih)}</div><div class="sub">Piutang jemaah belum tertagih: <b style="color:var(--gold-soft)">${UI.rp(k.piutang)}</b></div></div>
    </div>` : ''}
    <div class="grid ${k ? 'g-6040' : ''} mb">
      ${k ? `<div class="card"><div class="card-head"><div><h3>Pemasukan vs Pengeluaran</h3><p>6 bulan terakhir</p></div>
        <div class="legend"><span><i style="background:var(--primary)"></i>Pemasukan</span><span><i style="background:var(--gold)"></i>Pengeluaran</span></div></div>
        <div class="card-body">${UI.barChart(k.grafik.map((g, i, a) => ({ a: g.pemasukan, b: g.pengeluaran, label: BLN[+g.bulan.slice(5) - 1], now: i === a.length - 1 })))}</div></div>` : ''}
      <div class="card"><div class="card-head"><div><h3>Kesiapan Kloter Terdekat</h3><p>Kuota kursi, kelengkapan & jadwal</p></div><a class="link-btn" href="#/keberangkatan">Semua kloter ${icon('right')}</a></div>
        <div class="card-body">${d.kloter.length ? d.kloter.map(x => {
          const p = Math.round(x.terisi / Math.max(1, x.kuota) * 100);
          return `<div class="kloter"><div class="kloter-top"><span><b class="mono">${UI.esc(x.kode_keberangkatan)}</b> ${UI.badge(x.status)}</span><b>${x.terisi} / ${x.kuota} Pax</b></div>
            <div style="font-weight:600;margin-bottom:8px">${UI.tgl(x.tanggal_berangkat)} • ${UI.esc(x.nama_paket)}</div>
            <div class="progress ${p >= 90 ? 'gold' : ''}"><i style="width:${p}%"></i></div>
            <div class="dl" style="border:0;padding-bottom:0"><span>${icon('plane')} ${UI.esc(x.maskapai || '-')} ${UI.esc(x.no_penerbangan || '')}</span><span>${UI.daysBetween(UI.today(), x.tanggal_berangkat)} hari lagi</span></div></div>`;
        }).join('') : UI.empty('Belum ada jadwal keberangkatan mendatang.', 'plane')}</div></div>
    </div>
    <div class="grid ${App.isOwner() ? 'g-main' : ''}">
      <div class="card"><div class="card-head"><div><h3>Cicilan Perlu Perhatian & Jatuh Tempo <span class="badge b-bad">${d.cicilan_perhatian.length} Kasus</span></h3><p>Terlambat atau jatuh tempo dalam 7 hari</p></div><a class="link-btn" href="#/cicilan/tunggakan">Buka buku cicilan ${icon('right')}</a></div>
        <div id="dbCic"></div></div>
      ${App.isOwner() ? `<div class="card"><div class="card-head"><div><h3>Aktivitas Terkini</h3><p>Log transaksi & berkas staf</p></div></div>
        <div class="card-body">${d.aktivitas.length ? d.aktivitas.map(a => `<div class="list-item"><div class="li-ico">${icon(a.modul === 'pembayaran' ? 'wallet' : a.modul === 'jemaah' ? 'users' : a.modul === 'auth' ? 'key' : 'history')}</div>
          <div><div class="small"><b>${UI.esc(a.username)}</b> — ${UI.esc(a.aksi)} <span class="muted">${UI.esc(a.modul)}</span></div><div class="xs muted">${UI.esc(String(a.keterangan || '').slice(0, 90))}</div><div class="xs muted">${UI.relTime(a.waktu)}</div></div></div>`).join('') : UI.empty('Belum ada aktivitas.')}
          <a class="btn block sm" href="#/log" style="margin-top:10px">Lihat seluruh log ${icon('right')}</a></div></div>` : ''}
    </div>
    <div class="footer-note"><span>${icon('shield')} ${UI.esc(App.state.settings.nama_brand)} • Google Apps Script + Google Sheets</span><span>Diperbarui ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span></div>`;

    UI.table(el.querySelector('#dbCic'), {
      rows: d.cicilan_perhatian, pageSize: 6, emptyText: 'Tidak ada cicilan jatuh tempo minggu ini. Alhamdulillah 🎉',
      columns: [
        { label: 'Jemaah', render: r => `<div class="name"><b>${UI.esc(r.nama)}</b><small>${UI.esc(r.no_registrasi)}</small></div>` },
        { label: 'Paket', render: r => `<span class="small">${UI.esc(r.paket)}</span>` },
        { label: 'Termin', render: r => r.termin_ke == 0 ? 'Uang Muka' : 'Termin ke-' + r.termin_ke },
        { label: 'Jatuh Tempo', render: r => `<span style="color:${r.selisih_hari < 0 ? 'var(--bad)' : 'inherit'}">${UI.tgl(r.tanggal_jatuh_tempo)}</span>` },
        { label: 'Nominal', cls: 'r', render: r => UI.rp(r.nominal) },
        { label: 'Status', render: r => r.selisih_hari < 0 ? UI.badge('Terlambat ' + Math.abs(r.selisih_hari) + ' Hari', 'bad') : UI.badge(r.selisih_hari === 0 ? 'Hari ini' : 'H-' + r.selisih_hari + ' Jatuh Tempo', 'warn') },
        { label: '', cls: 'r', render: r => App.can('pembayaran', 'C') ? `<button class="btn xs gold" data-pay="${r.id_jemaah}" data-term="${r.id}">${icon('wallet')} Catat</button>` : '' }
      ],
      onRender: t => t.querySelectorAll('[data-pay]').forEach(b => b.onclick = () => Forms.pembayaran({ id_jemaah: b.dataset.pay, id_cicilan: b.dataset.term }, () => App.reload()))
    });
    const add = el.querySelector('#dbAddJ'); if (add) add.onclick = () => Forms.jemaah({}, j => location.hash = '#/jemaah/' + j.id);
  }
};

// ============================== DATA JEMAAH ==============================
Pages.jemaah = {
  title: 'Data Jemaah', group: 'Utama',
  filter: 'semua',
  async render(el, id) {
    if (id) return Pages.jemaahDetail.render(el, id);
    const list = await App.jemaahCache(true);
    const aktif = list.filter(j => !['Selesai', 'Batal'].includes(j.status));
    const cnt = {
      semua: list.length, dok: aktif.filter(j => j.dok_count < 4).length, paspor: aktif.filter(j => j.paspor_warning).length,
      menunggu: aktif.filter(j => j.menunggu > 0).length, lunas: aktif.filter(j => j.sisa <= 0 && j.total_tagihan > 0).length
    };
    el.innerHTML = `
    <div class="hero">
      <div class="page-head" style="margin:0;align-items:flex-start">
        <div><div class="eyebrow">${icon('shield')} Registri Utama Operasional • Musim ${new Date().getFullYear()}</div><h1>Data Jemaah & Status Dokumen</h1>
        <p>Kelola pendaftaran jemaah, audit kelengkapan berkas paspor, KTP, pas foto & visa, serta kesiapan manifes keberangkatan.</p></div>
        <div class="actions"><button class="btn glass" id="jmExport">${icon('download')} Ekspor Data</button>
        ${App.can('jemaah', 'C') ? `<button class="btn gold" id="jmAdd">${icon('plus')} Tambah Jemaah Baru</button>` : ''}</div>
      </div>
      <div class="hero-stats">
        <div><span class="hi">${icon('users')}</span><span><small>Total Jemaah Aktif</small><b>${aktif.length}</b></span></div>
        <div><span class="hi">${icon('checkc')}</span><span><small>Lunas Siap Berangkat</small><b>${cnt.lunas}</b></span></div>
        <div class="warn"><span class="hi">${icon('file')}</span><span><small>Pending Berkas</small><b>${cnt.dok}</b></span></div>
        <div class="warn"><span class="hi">${icon('alert')}</span><span><small>Atensi Paspor &lt;6 Bulan</small><b>${cnt.paspor}</b></span></div>
      </div>
    </div>
    <div class="chips" id="jmChips">
      ${[['semua', 'Semua'], ['dok', 'Dokumen Belum Lengkap'], ['paspor', 'Paspor < 6 Bulan'], ['menunggu', 'Menunggu Verifikasi'], ['lunas', 'Lunas Siap Berangkat']]
        .map(([k, l]) => `<button class="chip ${k === this.filter ? 'on' : ''} ${k === 'paspor' && cnt.paspor ? 'alert' : ''}" data-f="${k}">${k === 'paspor' ? icon('alert') : ''}${l}<span class="n">${cnt[k]}</span></button>`).join('')}
    </div>
    <div class="card">
      <div class="toolbar">
        <div class="search-in">${icon('search')}<input class="input" id="jmQ" placeholder="Cari nama jemaah, NIK, no paspor, atau no registrasi..."></div>
        <select class="input" id="jmPaket" style="width:200px">${UI.options(App.state.paket, 'id', p => p.nama_paket, '', 'Semua Paket Umrah')}</select>
        <select class="input" id="jmKb" style="width:200px">${UI.options(App.state.kb, 'id', k => k.kode_keberangkatan + ' • ' + UI.tgl(k.tanggal_berangkat), '', 'Semua Jadwal')}</select>
        <select class="input" id="jmSt" style="width:170px"><option value="">Semua Status</option>${['Terdaftar', 'Dokumen Lengkap', 'Lunas', 'Berangkat', 'Selesai', 'Batal'].map(s => `<option>${s}</option>`).join('')}</select>
      </div>
      <div id="jmTable"></div>
    </div>`;
    const tbl = UI.table(el.querySelector('#jmTable'), {
      rows: [], emptyText: 'Tidak ada jemaah yang cocok dengan filter.',
      rowClass: j => j.status === 'Batal' ? 'deleted' : '',
      columns: [
        { label: 'No. Registrasi', render: j => `<div class="name"><b class="mono nowrap">${UI.esc(j.no_registrasi)}</b><div style="margin-top:4px">${UI.badge(j.status)}</div></div>` },
        { label: 'Nama Jemaah & Identitas', render: j => `<div style="display:flex;gap:10px;align-items:center"><div class="avatar" style="${j.jenis_kelamin === 'P' ? 'background:var(--gold-pale);color:#7c5800' : ''}">${UI.initials(j.nama_lengkap)}</div><div class="name"><b><a href="#/jemaah/${j.id}" style="color:inherit">${UI.esc(j.nama_lengkap)}</a></b><small class="mono">${UI.esc(j.nik)}</small><small> • ${j.jenis_kelamin} (${j.umur} th)</small></div></div>` },
        { label: 'Paket & Kamar', render: j => `<div class="name"><b style="font-weight:500">${UI.esc(j.nama_paket)}</b><small>${UI.kamar(j.tipe_kamar)}</small></div>` },
        { label: 'Keberangkatan', render: j => j.kb ? `<div class="name"><b style="font-weight:500">${UI.tgl(j.kb.tanggal_berangkat)}</b><small>${UI.esc(j.kb.kode)} • ${UI.esc(j.kb.rute || j.kb.maskapai || '')}</small></div>` : '<span class="muted small">Belum dijadwalkan</span>' },
        { label: 'Kelengkapan', cls: 'c', render: j => UI.ring(j.dok_count) },
        { label: 'Paspor', render: j => j.paspor_kosong ? '<span class="badge b-warn">Belum input</span>' : `<div class="name"><b class="mono" style="font-weight:600">${UI.esc(j.no_paspor)}</b><small style="color:${j.paspor_warning ? 'var(--bad)' : 'inherit'}">${j.paspor_warning ? '⚠ ' : ''}Exp: ${UI.tgl(j.masa_berlaku_paspor)}</small></div>` },
        { label: 'Keuangan', render: j => `<div>${j.sisa <= 0 && j.total_tagihan ? UI.badge('Lunas ' + UI.rpShort(j.total_tagihan), 'ok') : UI.badge('Sisa ' + UI.rpShort(j.sisa), j.terbayar ? 'warn' : 'bad')}</div><div class="xs muted" style="margin-top:3px">${j.persen_lunas}% terbayar${j.menunggu ? ' • ' + UI.rpShort(j.menunggu) + ' menunggu' : ''}</div>` },
        { label: '', cls: 'r', render: j => `<div class="row-actions"><a class="btn icon" href="#/jemaah/${j.id}" title="Detail">${icon('eye')}</a>${App.can('jemaah', 'U') ? `<button class="btn icon" data-edit="${j.id}" title="Ubah">${icon('edit')}</button>` : ''}</div>` }
      ],
      onRender: t => t.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => Forms.jemaah(list.find(x => x.id === b.dataset.edit), () => App.reload()))
    });
    const apply = () => {
      const q = el.querySelector('#jmQ').value.toLowerCase(), pk = el.querySelector('#jmPaket').value, kb = el.querySelector('#jmKb').value, st = el.querySelector('#jmSt').value;
      const f = this.filter, isAktif = j => !['Selesai', 'Batal'].includes(j.status);
      tbl.setRows(list.filter(j =>
        (!q || [j.nama_lengkap, j.nik, j.no_paspor, j.no_registrasi, j.no_hp].join(' ').toLowerCase().includes(q)) &&
        (!pk || j.id_paket === pk) && (!kb || j.id_keberangkatan === kb) && (!st || j.status === st) &&
        (f === 'semua' || (f === 'dok' && isAktif(j) && j.dok_count < 4) || (f === 'paspor' && isAktif(j) && j.paspor_warning) ||
          (f === 'menunggu' && isAktif(j) && j.menunggu > 0) || (f === 'lunas' && isAktif(j) && j.sisa <= 0 && j.total_tagihan > 0))));
    };
    ['#jmQ', '#jmPaket', '#jmKb', '#jmSt'].forEach(s => el.querySelector(s).addEventListener('input', apply));
    el.querySelectorAll('#jmChips [data-f]').forEach(b => b.onclick = () => { this.filter = b.dataset.f; el.querySelectorAll('#jmChips .chip').forEach(c => c.classList.toggle('on', c === b)); apply(); });
    apply();
    const add = el.querySelector('#jmAdd'); if (add) add.onclick = () => Forms.jemaah({}, j => location.hash = '#/jemaah/' + j.id);
    el.querySelector('#jmExport').onclick = () => UI.csv('Data_Jemaah_' + UI.today(), list, [
      { label: 'No Registrasi', key: 'no_registrasi' }, { label: 'Nama', key: 'nama_lengkap' }, { label: 'NIK', get: j => "'" + j.nik }, { label: 'L/P', key: 'jenis_kelamin' },
      { label: 'Tgl Lahir', key: 'tanggal_lahir' }, { label: 'No HP', get: j => "'" + j.no_hp }, { label: 'Email', key: 'email' }, { label: 'Paket', key: 'nama_paket' }, { label: 'Kamar', key: 'tipe_kamar' },
      { label: 'Kloter', get: j => j.kb ? j.kb.kode : '' }, { label: 'No Paspor', key: 'no_paspor' }, { label: 'Exp Paspor', key: 'masa_berlaku_paspor' }, { label: 'Dokumen', get: j => j.dok_count + '/4' },
      { label: 'Tagihan', key: 'total_tagihan' }, { label: 'Terbayar', key: 'terbayar' }, { label: 'Sisa', key: 'sisa' }, { label: 'Status', key: 'status' }]);
  }
};

// ---------- Detail jemaah ----------
Pages.jemaahDetail = {
  title: 'Detail Jemaah', group: 'Data Jemaah',
  async render(el, id) {
    const j = (await Api.call('getJemaah', { id })).data;
    const sec = (no, title, sub, right, body) => `<div class="card mb"><div class="card-head"><div style="display:flex;gap:12px;align-items:center"><span class="avatar" style="border-radius:8px;background:var(--primary);color:#fff">${no}</span><div><h3>${title}</h3><p>${sub}</p></div></div>${right || ''}</div><div class="card-body">${body}</div></div>`;
    const docs = {}; j.dokumen.forEach(d => docs[d.jenis] = d);
    const lain = j.dokumen.filter(d => d.jenis === 'Lainnya');
    const canU = App.can('jemaah', 'U');
    const pIcon = { Paspor: 'passport', KTP: 'idcard', 'Pas Foto': 'users', Visa: 'file' };
    el.innerHTML = `
    <a class="link-btn" href="#/jemaah">${icon('back')} Data Jemaah</a> <span class="muted small">/ <span class="mono">${UI.esc(j.no_registrasi)}</span> / Detail & Verifikasi</span>
    <div class="page-head" style="margin-top:8px"><div><h1>Detail & Berkas Jemaah</h1><div class="actions">${UI.badge(j.status)} ${j.paspor_warning ? UI.badge('Paspor < 6 bulan dari kepulangan', 'bad') : ''} ${j.dok_count < 4 ? UI.badge('Berkas ' + j.dok_count + '/4', 'warn') : ''}</div></div>
      <div class="actions">${App.can('jemaah', 'D') ? `<button class="btn danger" id="jdDel">${icon('trash')} Hapus</button>` : ''}${canU ? `<button class="btn primary" id="jdEdit">${icon('edit')} Ubah Data</button>` : ''}</div></div>
    <div class="grid g-main">
      <div>
        ${sec(1, 'Data Pribadi & Identitas', 'Sesuai KTP dan data kependudukan', '', `<dl class="kv">
          <dt>Nama lengkap</dt><dd><b>${UI.esc(j.nama_lengkap)}</b></dd><dt>NIK</dt><dd class="mono">${UI.esc(j.nik)} <span class="badge b-ok">16 digit</span></dd>
          <dt>Tempat, tgl lahir</dt><dd>${UI.esc(j.tempat_lahir || '-')}, ${UI.tglPanjang(j.tanggal_lahir)} (${j.umur} tahun)</dd><dt>Jenis kelamin</dt><dd>${j.jenis_kelamin === 'P' ? 'Perempuan' : 'Laki-laki'}</dd>
          <dt>Mahram</dt><dd>${UI.esc(j.nama_mahram || '-')} ${j.hubungan_mahram ? '(' + UI.esc(j.hubungan_mahram) + ')' : ''} ${j.mahram_profil ? `<a class="link-btn" href="#/jemaah/${j.mahram_profil}">Buka profil</a>` : ''}</dd></dl>`)}
        ${sec(2, 'Informasi Kontak & Alamat', 'WhatsApp, email tagihan & kontak darurat', '', `<dl class="kv">
          <dt>WhatsApp / HP</dt><dd>${UI.esc(j.no_hp)} <a class="btn xs" target="_blank" rel="noopener" href="https://wa.me/${String(j.no_hp).replace(/^0/, '62').replace(/\D/g, '')}">Chat WA</a></dd>
          <dt>Email</dt><dd>${UI.esc(j.email || '-')}${!j.email ? ' <span class="badge b-warn">Pengingat email tidak aktif</span>' : ''}</dd><dt>Alamat</dt><dd>${UI.esc(j.alamat || '-')}</dd>
          <dt>Kontak darurat</dt><dd>${UI.esc(j.kontak_darurat || '-')}</dd><dt>Catatan</dt><dd>${UI.esc(j.catatan || '-')}</dd></dl>`)}
        ${sec(3, 'Data Paspor & Dokumen Perjalanan', 'Masa berlaku minimal 6 bulan dari tanggal kepulangan', j.paspor_kosong ? UI.badge('Belum input', 'warn') : j.paspor_warning ? UI.badge('Paspor < 6 bln', 'bad') : UI.badge('Paspor Valid', 'ok'), `<dl class="kv">
          <dt>Nomor paspor</dt><dd class="mono">${UI.esc(j.no_paspor || '-')}</dd><dt>Nama di paspor</dt><dd>${UI.esc(j.nama_paspor || '-')}</dd>
          <dt>Diterbitkan</dt><dd>${UI.tglPanjang(j.tgl_terbit_paspor)}</dd><dt>Berlaku s.d.</dt><dd style="color:${j.paspor_warning ? 'var(--bad)' : 'inherit'}">${UI.tglPanjang(j.masa_berlaku_paspor)}${j.paspor_warning ? ' — perlu perpanjangan' : ''}</dd>
          <dt>Kantor imigrasi</dt><dd>${UI.esc(j.kantor_imigrasi || '-')}</dd></dl>`)}
        ${sec(4, 'Upload & Verifikasi Berkas Digital', 'Disimpan privat di Google Drive • JPG/PNG/PDF maks ' + APP_CONFIG.maxUploadMB + ' MB (foto dikompres otomatis)', `<span class="code-tag">${j.dok_count} / 4 Selesai</span>`, `
          <div class="grid g2">${DOK_JENIS.map(jn => { const d = docs[jn]; return `<div class="doc-card"><div style="display:flex;justify-content:space-between;align-items:center"><b>${icon(pIcon[jn])} ${jn}</b>${d ? UI.badge('Terunggah', 'ok') : UI.badge(jn === 'Visa' ? 'Proses pengajuan' : 'Belum ada', jn === 'Visa' ? 'gold' : 'warn')}</div>
            ${d ? `<div class="file"><div class="thumb">${icon(d.mime === 'application/pdf' ? 'file' : 'eye')}</div><div style="min-width:0"><div class="small mono" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${UI.esc(d.nama_file)}</div><div class="xs muted">${UI.fileSize(d.ukuran)} • oleh ${UI.esc(d.created_by)} • ${UI.tgl(d.created_at)}</div></div></div>
              <div class="actions">${canU ? `<button class="btn sm" data-up="${jn}">${icon('refresh')} Ganti</button>` : ''}<button class="btn sm primary" data-view="${d.id_file_drive}">${icon('eye')} Lihat</button></div>`
              : `<div class="dropzone" data-up="${jn}">${icon('upload')}<div>${canU ? 'Klik untuk unggah ' + jn : 'Belum diunggah'}</div></div>`}</div>`; }).join('')}</div>
          ${lain.length ? `<h4 style="margin:16px 0 8px">Dokumen lainnya</h4>${lain.map(d => `<div class="dl"><span>${UI.esc(d.nama_file)}</span><span><button class="btn xs" data-view="${d.id_file_drive}">Lihat</button> ${canU ? `<button class="btn xs danger" data-deldoc="${d.id}">Hapus</button>` : ''}</span></div>`).join('')}` : ''}
          ${canU ? `<button class="btn sm" style="margin-top:12px" data-up="Lainnya">${icon('upload')} Unggah dokumen lain (surat mahram, buku nikah, vaksin, dll.)</button>` : ''}
          <input type="file" id="jdFile" accept="image/jpeg,image/png,image/webp,application/pdf" class="hidden">`)}
      </div>
      <div>
        <div class="card profile-card mb">
          <div class="top"><div class="avatar lg gold">${UI.initials(j.nama_lengkap)}</div><div><div class="serif" style="font-size:22px;font-weight:700">${UI.esc(j.nama_lengkap)}</div><div class="mono" style="color:#cfe6dc">ID: ${UI.esc(j.no_registrasi)}</div><div class="xs" style="color:#cfe6dc">Daftar: ${UI.tglPanjang(j.created_at)}</div></div></div>
          <div class="card-body">
            <div class="mini-stat mb"><small>PAKET & AKOMODASI</small><b class="serif">${UI.esc(j.nama_paket)}</b>
              <div class="small" style="margin-top:6px">${icon('hotel')} Kamar: ${UI.kamar(j.tipe_kamar)}</div>
              <div class="small">${icon('plane')} ${j.kb ? `Berangkat: <b>${UI.tgl(j.kb.tanggal_berangkat)}</b> (${UI.esc(j.kb.kode)} • ${UI.esc(j.kb.no_penerbangan || j.kb.maskapai || '')})` : 'Belum dijadwalkan'}</div></div>
            <div class="eyebrow" style="color:var(--muted)">Rincian Finansial & Tagihan</div>
            <div class="dl"><span>Total biaya paket</span><b>${UI.rp(j.total_tagihan)}</b></div>
            <div class="dl"><span>${icon('checkc')} Sudah terbayar</span><b>${UI.rp(j.terbayar)}</b></div>
            ${j.menunggu ? `<div class="dl"><span>Menunggu verifikasi</span><b style="color:var(--warn)">${UI.rp(j.menunggu)}</b></div>` : ''}
            <div class="sisa-box" style="margin:12px 0"><div class="eyebrow">Sisa Tagihan Pelunasan <span class="badge b-gold" style="float:right">${j.persen_lunas}% Lunas</span></div>
              <div class="big">${UI.rp(j.sisa)}</div>${j.skema && j.skema.jadwal.find(x => x.status !== 'Lunas') ? (() => { const n = j.skema.jadwal.find(x => x.status !== 'Lunas'); return `<div class="small">${icon('calendar')} Termin berikut: ${n.termin_ke == 0 ? 'DP' : 'ke-' + n.termin_ke} • <b>${UI.tgl(n.tanggal_jatuh_tempo)}</b> • ${UI.rp(n.nominal)}</div>`; })() : ''}</div>
            <div class="progress"><i style="width:${j.persen_lunas}%"></i></div>
            <div class="grid" style="gap:8px;margin-top:16px">
              ${App.can('pembayaran', 'C') && j.sisa > 0 ? `<button class="btn gold block" id="jdPay">${icon('wallet')} Catat Pembayaran Baru</button>` : ''}
              ${!j.skema && App.can('cicilan', 'C') && j.sisa > 0 ? `<button class="btn block" id="jdSkema">${icon('calendar')} Buat Skema Cicilan (Termin)</button>` : ''}
              ${j.skema ? `<a class="btn block" href="#/cicilan">${icon('calendar')} Kelola Skema Cicilan</a>` : ''}
            </div>
          </div>
        </div>
        ${j.skema ? `<div class="card mb"><div class="card-head"><div><h3>Jadwal Cicilan</h3><p>${j.skema.jadwal.length} termin • ${UI.badge(j.skema.status)}</p></div></div><div class="card-body"><div class="timeline">
          ${j.skema.jadwal.map(x => `<div class="tl-item ${x.status === 'Lunas' ? 'ok' : x.status === 'Terlambat' ? 'bad' : ''}"><div style="display:flex;justify-content:space-between;gap:8px"><b class="small">${x.termin_ke == 0 ? 'Uang Muka (DP)' : 'Termin ke-' + x.termin_ke}</b>${UI.badge(x.status)}</div>
            <div class="xs muted">${UI.tgl(x.tanggal_jatuh_tempo)} • ${UI.rp(x.nominal)}${x.tanggal_lunas ? ' • lunas ' + UI.tgl(x.tanggal_lunas) : ''}</div></div>`).join('')}</div></div></div>` : ''}
        <div class="card"><div class="card-head"><div><h3>Riwayat Pembayaran</h3><p>${j.pembayaran.length} transaksi</p></div></div><div class="card-body">
          ${j.pembayaran.length ? j.pembayaran.map(p => `<div class="list-item"><div class="li-ico">${icon('receipt')}</div><div style="flex:1;min-width:0"><div style="display:flex;justify-content:space-between;gap:6px"><b class="small mono">${UI.esc(p.no_kwitansi)}</b><b class="small">${UI.rp(p.jumlah)}</b></div>
            <div class="xs muted">${UI.tgl(p.tanggal_bayar)} • ${UI.esc(p.kategori)} • ${UI.esc(p.metode)}</div><div style="margin-top:4px;display:flex;gap:4px;flex-wrap:wrap">${UI.badge(p.status_verifikasi)}
            ${p.status_verifikasi !== 'Ditolak' ? `<button class="btn xs" data-kw="${p.id}">${icon('printer')} Kwitansi</button>` : ''}${p.status_verifikasi === 'Terverifikasi' && j.email ? `<button class="btn xs" data-mail="${p.id}">${icon('mail')}</button>` : ''}</div></div></div>`).join('') : UI.empty('Belum ada pembayaran.', 'wallet')}
        </div></div>
      </div>
    </div>`;
    const $ = s => el.querySelector(s);
    if ($('#jdEdit')) $('#jdEdit').onclick = () => Forms.jemaah(j, () => App.reload());
    if ($('#jdDel')) $('#jdDel').onclick = async () => {
      if (!(await UI.confirm(`Hapus jemaah <b>${UI.esc(j.nama_lengkap)}</b>? Data ditandai terhapus (soft delete) dan bisa dipulihkan owner dari spreadsheet.`, { danger: true, ok: 'Hapus' }))) return;
      const r = await Api.safe('deleteJemaah', { id: j.id }); if (r) { UI.toast(r.message); App.cache = {}; location.hash = '#/jemaah'; }
    };
    if ($('#jdPay')) $('#jdPay').onclick = () => Forms.pembayaran({ id_jemaah: j.id }, () => App.reload());
    if ($('#jdSkema')) $('#jdSkema').onclick = () => Forms.skema({ id_jemaah: j.id }, () => App.reload());
    el.querySelectorAll('[data-view]').forEach(b => b.onclick = () => UI.viewFile(b.dataset.view, b));
    el.querySelectorAll('[data-kw]').forEach(b => b.onclick = () => UI.pdf('kwitansiPdf', { id: b.dataset.kw }, b, false));
    el.querySelectorAll('[data-mail]').forEach(b => b.onclick = async () => { const r = await UI.busy(b, () => Api.safe('emailKwitansi', { id: b.dataset.mail })); if (r) UI.toast(r.message); });
    el.querySelectorAll('[data-deldoc]').forEach(b => b.onclick = async () => { if (await UI.confirm('Hapus dokumen ini?', { danger: true })) { const r = await Api.safe('deleteDokumen', { id: b.dataset.deldoc }); if (r) { UI.toast(r.message); App.reload(); } } });
    // Unggah dokumen
    const fileIn = $('#jdFile'); let jenis = '';
    if (canU) el.querySelectorAll('[data-up]').forEach(b => b.onclick = () => { jenis = b.dataset.up; fileIn.value = ''; fileIn.click(); });
    fileIn.onchange = async () => {
      const f = fileIn.files[0]; if (!f) return;
      try {
        UI.toast('Mengunggah ' + jenis + '...', 'warn');
        const payload = await UI.readFile(f);
        const r = await Api.call('uploadDokumen', Object.assign({ id_jemaah: j.id, jenis }, payload));
        UI.toast(r.message); App.cache = {}; App.reload();
      } catch (e) { UI.toast(e.message, 'error'); }
    };
  }
};
const DOK_JENIS = ['Paspor', 'KTP', 'Pas Foto', 'Visa'];

// ---------- Form jemaah ----------
Forms.jemaah = (data = {}, done) => {
  const isNew = !data.id;
  const m = UI.modal({
    title: isNew ? 'Pendaftaran Jemaah Baru' : 'Ubah Data Jemaah', eyebrow: isNew ? 'Nomor registrasi dibuat otomatis' : UI.esc(data.no_registrasi), size: 'lg',
    body: `<form id="fJ" novalidate>
      <div class="form-sec"><h4><span class="no">1</span>Data Pribadi & Identitas</h4><div class="form-grid">
        <div class="field span2"><label>Nama lengkap (sesuai KTP) <span class="req">*</span></label><input class="input" name="nama_lengkap" required></div>
        <div class="field"><label>NIK <span class="req">*</span> <span class="hint" id="nikHint">0/16 digit</span></label><input class="input mono" name="nik" inputmode="numeric" maxlength="16" required></div>
        <div class="field"><label>Jenis kelamin <span class="req">*</span></label><div class="seg"><label><input type="radio" name="jenis_kelamin" value="L"> Laki-laki</label><label><input type="radio" name="jenis_kelamin" value="P"> Perempuan</label></div></div>
        <div class="field"><label>Tempat lahir</label><input class="input" name="tempat_lahir"></div>
        <div class="field"><label>Tanggal lahir <span class="req">*</span></label><input class="input" type="date" name="tanggal_lahir" max="${UI.today()}" required></div>
        <div class="field"><label>Nama mahram</label><input class="input" name="nama_mahram" placeholder="Wajib bagi jemaah wanita tertentu"></div>
        <div class="field"><label>Hubungan mahram</label><input class="input" name="hubungan_mahram" placeholder="Suami / Anak kandung / Ayah"></div>
      </div></div>
      <div class="form-sec"><h4><span class="no">2</span>Kontak & Alamat</h4><div class="form-grid">
        <div class="field"><label>No. WhatsApp / HP <span class="req">*</span></label><input class="input" name="no_hp" inputmode="tel" placeholder="0812xxxxxxxx" required></div>
        <div class="field"><label>Email <span class="hint">untuk kwitansi & pengingat</span></label><input class="input" type="email" name="email"></div>
        <div class="field span2"><label>Alamat lengkap</label><textarea class="input" name="alamat" rows="2"></textarea></div>
        <div class="field span2"><label>Kontak darurat keluarga</label><input class="input" name="kontak_darurat" placeholder="Nama (hubungan) — nomor HP"></div>
      </div></div>
      <div class="form-sec"><h4><span class="no">3</span>Paspor <span class="hint" style="font-weight:400">(boleh diisi menyusul)</span></h4><div class="form-grid c3">
        <div class="field"><label>Nomor paspor</label><input class="input mono" name="no_paspor" style="text-transform:uppercase"></div>
        <div class="field span2"><label>Nama di paspor (min. 3 kata)</label><input class="input" name="nama_paspor" style="text-transform:uppercase"></div>
        <div class="field"><label>Tanggal terbit</label><input class="input" type="date" name="tgl_terbit_paspor"></div>
        <div class="field"><label>Berlaku sampai</label><input class="input" type="date" name="masa_berlaku_paspor"></div>
        <div class="field"><label>Kantor imigrasi</label><input class="input" name="kantor_imigrasi"></div>
      </div><div id="pasporWarn"></div></div>
      <div class="form-sec"><h4><span class="no">4</span>Paket, Kamar & Keberangkatan</h4><div class="form-grid">
        <div class="field span2"><label>Paket umrah <span class="req">*</span></label><select class="input" name="id_paket" required>${UI.options(App.state.paket.filter(p => p.status_aktif || p.id === data.id_paket), 'id', p => p.nama_paket + ' (' + p.durasi_hari + ' hari)', data.id_paket, '— Pilih paket —')}</select></div>
        <div class="field span2"><label>Tipe kamar <span class="req">*</span></label><div class="seg" id="kamarSeg"></div></div>
        <div class="field span2"><label>Jadwal keberangkatan <span class="hint">kuota dicek otomatis</span></label><select class="input" name="id_keberangkatan"></select></div>
        ${!isNew ? `<div class="field"><label>Status jemaah</label><select class="input" name="status">${['Terdaftar', 'Dokumen Lengkap', 'Lunas', 'Berangkat', 'Selesai', 'Batal'].map(s => `<option>${s}</option>`).join('')}</select><span class="hint">Terdaftar/Dokumen Lengkap/Lunas dihitung otomatis</span></div>` : ''}
        ${!isNew && App.isOwner() ? `<div class="field"><label>Total tagihan (owner)</label><input class="input" name="total_tagihan" data-rp><span class="hint">Untuk diskon/penyesuaian khusus</span></div>` : ''}
        <div class="field span2"><label>Catatan</label><input class="input" name="catatan"></div>
      </div><div id="tagihanInfo"></div></div>
    </form>`,
    foot: `<button class="btn" data-close>Batal</button><button class="btn primary" id="fJSave">${icon('check')} ${isNew ? 'Daftarkan Jemaah' : 'Simpan Perubahan'}</button>`
  });
  const f = m.$('#fJ');
  UI.fill(f, data);
  UI.bindRupiah(f);
  const nik = f.querySelector('[name=nik]');
  const nikUpd = () => { nik.value = nik.value.replace(/\D/g, '').slice(0, 16); m.$('#nikHint').textContent = nik.value.length + '/16 digit'; m.$('#nikHint').style.color = nik.value.length === 16 ? 'var(--ok)' : ''; };
  nik.addEventListener('input', nikUpd); nikUpd();
  const sel = f.querySelector('[name=id_paket]'), kbSel = f.querySelector('[name=id_keberangkatan]');
  const renderPaket = () => {
    const p = App.state.paket.find(x => x.id === sel.value);
    const cur = (f.querySelector('[name=tipe_kamar]:checked') || {}).value || data.tipe_kamar || 'quad';
    m.$('#kamarSeg').innerHTML = p ? ['quad', 'triple', 'double'].map(t => `<label><input type="radio" name="tipe_kamar" value="${t}" ${t === cur ? 'checked' : ''}> <span>${UI.kamar(t)}<br><b class="small">${UI.rp(p['harga_' + t])}</b></span></label>`).join('') : '<span class="muted small">Pilih paket terlebih dahulu.</span>';
    const kbs = App.state.kb.filter(k => p && k.id_paket === p.id && (['Buka'].includes(k.status) || k.id === data.id_keberangkatan));
    const others = App.state.kb.filter(k => p && k.id_paket === p.id && !kbs.includes(k) && ['Penuh', 'Ditutup'].includes(k.status));
    kbSel.innerHTML = '<option value="">— Belum dijadwalkan —</option>' + kbs.map(k => `<option value="${k.id}" ${k.id === data.id_keberangkatan ? 'selected' : ''}>${k.kode_keberangkatan} • ${UI.tgl(k.tanggal_berangkat)} • sisa ${k.sisa_kursi}/${k.kuota} kursi</option>`).join('')
      + others.map(k => `<option disabled>${k.kode_keberangkatan} • ${UI.tgl(k.tanggal_berangkat)} • ${k.status.toUpperCase()}</option>`).join('');
    m.$$('[name=tipe_kamar]').forEach(r => r.onchange = info);
    info(); pasporCheck();
  };
  const info = () => {
    const p = App.state.paket.find(x => x.id === sel.value), t = (f.querySelector('[name=tipe_kamar]:checked') || {}).value;
    const changed = isNew || data.id_paket !== sel.value || data.tipe_kamar !== t;
    m.$('#tagihanInfo').innerHTML = p && t ? `<div class="alert info" style="margin:12px 0 0">${icon('info')}<div>Tagihan ${changed ? 'yang akan dikunci' : 'terkunci'}: <b>${UI.rp(changed ? p['harga_' + t] : data.total_tagihan)}</b>. Perubahan harga paket di kemudian hari tidak mengubah tagihan jemaah ini.</div></div>` : '';
  };
  const pasporCheck = () => {
    const exp = f.querySelector('[name=masa_berlaku_paspor]').value, k = App.state.kb.find(x => x.id === kbSel.value);
    const ref = k ? (k.tanggal_pulang || k.tanggal_berangkat) : UI.today();
    m.$('#pasporWarn').innerHTML = exp && exp < UI.addMonths(ref, 6) ? `<div class="alert bad" style="margin:12px 0 0">${icon('alert')}<div>Masa berlaku paspor kurang dari 6 bulan dari ${k ? 'tanggal kepulangan (' + UI.tgl(ref) + ')' : 'hari ini'}. Jemaah perlu memperpanjang paspor.</div></div>` : '';
  };
  sel.onchange = renderPaket; kbSel.onchange = pasporCheck; f.querySelector('[name=masa_berlaku_paspor]').onchange = pasporCheck;
  renderPaket();
  m.$('#fJSave').onclick = async e => {
    const d = UI.formData(f);
    const miss = ['nama_lengkap', 'nik', 'jenis_kelamin', 'tanggal_lahir', 'no_hp', 'id_paket', 'tipe_kamar'].filter(k => !d[k]);
    if (miss.length) return UI.toast('Lengkapi kolom wajib: ' + miss.join(', ').replace(/_/g, ' '), 'error');
    if (!/^\d{16}$/.test(d.nik)) return UI.toast('NIK harus 16 digit angka.', 'error');
    if (!/^(\+62|62|0)8\d{7,12}$/.test(d.no_hp.replace(/[\s\-().]/g, ''))) return UI.toast('Nomor HP tidak valid (contoh 081234567890).', 'error');
    if (d.total_tagihan !== undefined) d.total_tagihan = UI.parseRp(d.total_tagihan);
    if (data.id) d.id = data.id;
    const r = await UI.busy(e.currentTarget, () => Api.safe('saveJemaah', d));
    if (r) { UI.toast(r.message); m.close(); App.cache = {}; await App.refreshMaster(); done && done(r.data); }
  };
};

// ============================== PAKET & HARGA ==============================
Pages.paket = {
  title: 'Paket & Harga', group: 'Utama',
  async render(el) {
    const list = (await Api.call('listPaket')).data;
    App.state.paket = list;
    const canC = App.can('paket', 'C'), canU = App.can('paket', 'U');
    el.innerHTML = `<div class="page-head"><div><div class="eyebrow">${icon('briefcase')} Katalog Paket</div><h1>Paket Umrah & Harga</h1><p>Harga per tipe kamar menjadi acuan tagihan saat pendaftaran. Tagihan jemaah yang sudah terdaftar tidak berubah walau harga diperbarui.</p></div>
      <div class="actions">${canC ? `<button class="btn gold" id="pkAdd">${icon('plus')} Tambah Paket</button>` : ''}</div></div>
      ${!canU ? `<div class="alert info">${icon('info')}<div>Anda melihat paket yang aktif saja. Perubahan paket dilakukan oleh owner.</div></div>` : ''}
      <div class="grid g3">${list.length ? list.map(p => {
        const kbs = App.state.kb.filter(k => k.id_paket === p.id && !['Selesai'].includes(k.status));
        return `<div class="card" style="display:flex;flex-direction:column${p.status_aktif ? '' : ';opacity:.65'}"><div class="card-body" style="flex:1">
          <div style="display:flex;justify-content:space-between;gap:8px">${UI.badge(p.status_aktif ? 'Aktif' : 'Nonaktif')}<span class="pill gold">${p.durasi_hari} Hari</span></div>
          <h3 class="serif" style="font-size:22px;margin:12px 0 4px">${UI.esc(p.nama_paket)}</h3><p class="small muted" style="margin:0 0 12px">${UI.esc(p.deskripsi || '')}</p>
          <div class="small" style="display:grid;gap:5px">${p.maskapai ? `<span>${icon('plane')} ${UI.esc(p.maskapai)}</span>` : ''}${p.hotel_makkah ? `<span>${icon('hotel')} Makkah: ${UI.esc(p.hotel_makkah)}</span>` : ''}${p.hotel_madinah ? `<span>${icon('hotel')} Madinah: ${UI.esc(p.hotel_madinah)}</span>` : ''}</div>
          ${p.fasilitas ? `<div class="pill-list" style="margin-top:10px;max-width:none">${String(p.fasilitas).split(/[,;\n]/).filter(Boolean).map(x => `<span class="pill">${UI.esc(x.trim())}</span>`).join('')}</div>` : ''}
          <div style="margin-top:14px">${['quad', 'triple', 'double'].map(t => `<div class="dl"><span>${icon('hotel')} ${UI.kamar(t)}</span><b class="tabular">${UI.rp(p['harga_' + t])}</b></div>`).join('')}</div>
          <div class="xs muted" style="margin-top:8px">${kbs.length} jadwal aktif</div></div>
          ${canU ? `<div class="modal-foot" style="justify-content:space-between"><button class="btn sm" data-edit="${p.id}">${icon('edit')} Ubah</button>
            ${App.can('paket', 'D') ? `<button class="btn sm danger" data-del="${p.id}">${icon('trash')}</button>` : ''}</div>` : ''}</div>`;
      }).join('') : `<div class="card card-pad" style="grid-column:1/-1">${UI.empty('Belum ada paket.', 'briefcase')}</div>`}</div>`;
    const add = el.querySelector('#pkAdd'); if (add) add.onclick = () => Forms.paket({}, () => App.reload());
    el.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => Forms.paket(list.find(p => p.id === b.dataset.edit), () => App.reload()));
    el.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => {
      if (!(await UI.confirm('Hapus paket ini? Paket yang masih dipakai jemaah aktif tidak dapat dihapus — nonaktifkan saja.', { danger: true, ok: 'Hapus' }))) return;
      const r = await Api.safe('deletePaket', { id: b.dataset.del }); if (r) { UI.toast(r.message); await App.refreshMaster(); App.reload(); }
    });
  }
};
Forms.paket = (data = {}, done) => {
  const m = UI.modal({
    title: data.id ? 'Ubah Paket' : 'Tambah Paket Umrah', eyebrow: 'Paket & Harga', size: 'lg',
    body: `<form id="fP" class="form-grid">
      <div class="field span2"><label>Nama paket <span class="req">*</span></label><input class="input" name="nama_paket" placeholder="Reguler Barokah 9 Hari"></div>
      <div class="field"><label>Durasi (hari) <span class="req">*</span></label><input class="input" type="number" min="1" name="durasi_hari"></div>
      <div class="field"><label>Maskapai</label><input class="input" name="maskapai"></div>
      <div class="field"><label>Hotel Makkah</label><input class="input" name="hotel_makkah"></div>
      <div class="field"><label>Hotel Madinah</label><input class="input" name="hotel_madinah"></div>
      <div class="field"><label>Harga Quad (4 pax) <span class="req">*</span></label><input class="input" name="harga_quad" data-rp></div>
      <div class="field"><label>Harga Triple (3 pax) <span class="req">*</span></label><input class="input" name="harga_triple" data-rp></div>
      <div class="field"><label>Harga Double (2 pax) <span class="req">*</span></label><input class="input" name="harga_double" data-rp></div>
      <div class="field"><label>Status</label><label class="check" style="height:40px;align-items:center"><span class="switch"><input type="checkbox" name="status_aktif"><span></span></span> Paket aktif (bisa dipilih saat pendaftaran)</label></div>
      <div class="field span2"><label>Deskripsi</label><textarea class="input" name="deskripsi" rows="2"></textarea></div>
      <div class="field span2"><label>Fasilitas <span class="hint">pisahkan dengan koma</span></label><textarea class="input" name="fasilitas" rows="2" placeholder="Tiket PP, Visa, Hotel, Makan 3x, Muthawwif"></textarea></div>
    </form>`,
    foot: `<button class="btn" data-close>Batal</button><button class="btn primary" id="fPSave">${icon('check')} Simpan Paket</button>`
  });
  UI.fill(m.$('#fP'), Object.assign({ status_aktif: true }, data));
  UI.bindRupiah(m.$('#fP'));
  m.$('#fPSave').onclick = async e => {
    const d = UI.formData(m.$('#fP'));
    ['harga_quad', 'harga_triple', 'harga_double'].forEach(k => d[k] = UI.parseRp(d[k]));
    if (data.id) d.id = data.id;
    const r = await UI.busy(e.currentTarget, () => Api.safe('savePaket', d));
    if (r) { UI.toast(r.message); m.close(); await App.refreshMaster(); done && done(); }
  };
};

// ============================== JADWAL KEBERANGKATAN ==============================
Pages.keberangkatan = {
  title: 'Jadwal Keberangkatan', group: 'Operasional',
  mode: 'daftar', filter: 'semua', month: null,
  async render(el) {
    const list = (await Api.call('listKeberangkatan')).data;
    App.state.kb = list;
    const today = UI.today(), year = today.slice(0, 4);
    const aktif = list.filter(k => k.status !== 'Selesai');
    const totK = aktif.reduce((s, k) => s + k.kuota, 0), totT = aktif.reduce((s, k) => s + k.terisi, 0);
    const next = list.find(k => k.tanggal_berangkat >= today);
    const hampir = k => k.status === 'Buka' && k.terisi / k.kuota >= .9;
    this.month = this.month || today.slice(0, 7);
    el.innerHTML = `<div class="page-head"><div><div class="eyebrow">Operasional Kloter • Musim ${year}</div><h1>Jadwal Keberangkatan & Alokasi Kuota</h1><p>Kuota kursi dan sisa dihitung otomatis dari jemaah terdaftar. Pendaftaran ditolak saat kuota penuh.</p></div>
      <div class="actions">${App.can('keberangkatan', 'C') ? `<button class="btn primary" id="kbAdd">${icon('plus')} Buat Jadwal Kloter</button>` : ''}</div></div>
      <div class="grid g4 mb">
        <div class="card kpi"><div class="lbl">Total Keberangkatan</div><div class="ico">${icon('plane')}</div><div class="val">${list.length}<small>Kloter</small></div><div class="sub">${list.filter(k => ['Buka', 'Penuh', 'Ditutup'].includes(k.status)).length} terjadwal • ${list.filter(k => k.status === 'Berangkat').length} di Tanah Suci • ${list.filter(k => k.status === 'Selesai').length} selesai</div></div>
        <div class="card kpi"><div class="lbl">Okupansi Kuota Global</div><div class="ico gold">${icon('users')}</div><div class="val">${totT}<small>/ ${totK} kursi</small></div><div class="progress gold"><i style="width:${totK ? totT / totK * 100 : 0}%"></i></div><div class="sub" style="margin-top:6px">${totK ? (totT / totK * 100).toFixed(1) : 0}% terisi • sisa ${totK - totT} kursi</div></div>
        <div class="card kpi"><div class="lbl">Kloter Terdekat</div><div class="ico">${icon('calendar')}</div>${next ? `<div class="val" style="font-size:24px">${UI.tgl(next.tanggal_berangkat)}</div><div class="sub">${UI.esc(next.kode_keberangkatan)} • ${UI.esc(next.maskapai || '')} • ${next.terisi}/${next.kuota} pax</div>` : '<div class="val">-</div>'}</div>
        <div class="card kpi"><div class="lbl">Status Kloter</div><div class="ico mint">${icon('checkc')}</div><div class="val">${list.filter(k => k.status === 'Penuh').length}<small>Penuh</small></div><div class="sub">${list.filter(hampir).length} hampir penuh (≥90%) • ${list.filter(k => k.status === 'Buka').length} buka</div></div>
      </div>
      <div class="card mb"><div class="toolbar" style="border:0">
        <div class="tabs dark"><button data-m="daftar" class="${this.mode === 'daftar' ? 'on' : ''}">${icon('list')} Daftar Kloter</button><button data-m="kalender" class="${this.mode === 'kalender' ? 'on' : ''}">${icon('calendar')} Kalender</button></div>
        <div class="chips" style="margin:0">${[['semua', 'Semua Kloter', list.length], ['buka', 'Buka Pendaftaran', list.filter(k => k.status === 'Buka').length], ['hampir', 'Hampir Penuh', list.filter(hampir).length], ['penuh', 'Penuh', list.filter(k => k.status === 'Penuh').length], ['jalan', 'Berangkat/Selesai', list.filter(k => ['Berangkat', 'Selesai'].includes(k.status)).length]]
          .map(([k, l, n]) => `<button class="chip ${this.filter === k ? 'on' : ''}" data-f="${k}">${l}<span class="n">${n}</span></button>`).join('')}</div>
      </div></div>
      <div id="kbBody"></div>`;
    const body = el.querySelector('#kbBody');
    const filt = () => list.filter(k => this.filter === 'semua' || (this.filter === 'buka' && k.status === 'Buka') || (this.filter === 'hampir' && hampir(k)) || (this.filter === 'penuh' && k.status === 'Penuh') || (this.filter === 'jalan' && ['Berangkat', 'Selesai'].includes(k.status)));
    const draw = () => this.mode === 'daftar' ? this.drawList(body, filt()) : this.drawCal(body, filt());
    el.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { this.mode = b.dataset.m; el.querySelectorAll('[data-m]').forEach(x => x.classList.toggle('on', x === b)); draw(); });
    el.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { this.filter = b.dataset.f; el.querySelectorAll('[data-f]').forEach(x => x.classList.toggle('on', x === b)); draw(); });
    const add = el.querySelector('#kbAdd'); if (add) add.onclick = () => Forms.keberangkatan({}, () => App.reload());
    draw();
  },
  card(k) {
    const p = Math.round(k.terisi / Math.max(1, k.kuota) * 100);
    const st = k.status === 'Buka' && p >= 90 ? UI.badge('Hampir Penuh (sisa ' + k.sisa_kursi + ')', 'warn') : k.status === 'Buka' ? UI.badge('Buka (sisa ' + k.sisa_kursi + ' kursi)', 'gold') : k.status === 'Penuh' ? UI.badge('Penuh (' + k.terisi + '/' + k.kuota + ' Pax)', 'bad') : UI.badge(k.status);
    return `<div class="card kb-card"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap"><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><span class="code-tag">${UI.esc(k.kode_keberangkatan)}</span>${st}<span class="small">${UI.esc(k.nama_paket)}</span></div>
      <span class="pill">${UI.tgl(k.tanggal_berangkat)} – ${UI.tgl(k.tanggal_pulang)} (${UI.daysBetween(k.tanggal_berangkat, k.tanggal_pulang) + 1} Hari)</span></div>
      <div class="flight"><div><div class="lbl">${icon('plane')} Penerbangan</div><h4>${UI.esc(k.maskapai || '-')}</h4><div class="small"><b style="color:#7c5800">${UI.esc(k.no_penerbangan || '')}</b> ${UI.esc(k.rute || '')}</div></div>
        <div><div class="lbl">${icon('hotel')} Akomodasi</div><div class="small" style="margin-top:6px">${UI.esc(k.hotel_makkah || '-')}<br>${UI.esc(k.hotel_madinah || '')}</div>${k.pembimbing ? `<div class="xs muted" style="margin-top:4px">Pembimbing: ${UI.esc(k.pembimbing)}</div>` : ''}</div></div>
      <div class="dl" style="border:0"><span>Keterisian kuota kursi</span><b>${k.terisi} / ${k.kuota} Kursi (${p}%)</b></div>
      <div class="progress ${p >= 100 ? '' : p >= 90 ? 'gold' : ''}"><i style="width:${Math.min(100, p)}%"></i></div>
      <div class="actions" style="margin-top:14px"><button class="btn sm" data-list="${k.id}">${icon('users')} Daftar Jemaah</button>
        <button class="btn sm primary" data-man="${k.id}">${icon('printer')} Manifes PDF</button>
        ${App.can('keberangkatan', 'U') ? `<button class="btn sm" data-edit="${k.id}">${icon('edit')} Ubah</button>` : ''}
        ${App.can('keberangkatan', 'D') && !k.terisi ? `<button class="btn sm danger" data-del="${k.id}">${icon('trash')}</button>` : ''}</div></div>`;
  },
  bind(root, list) {
    root.querySelectorAll('[data-list]').forEach(b => b.onclick = () => this.detail(list.find(k => k.id === b.dataset.list)));
    root.querySelectorAll('[data-man]').forEach(b => b.onclick = () => UI.pdf('manifestPdf', { id: b.dataset.man }, b, false));
    root.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => Forms.keberangkatan(list.find(k => k.id === b.dataset.edit), () => App.reload()));
    root.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => { if (await UI.confirm('Hapus jadwal ini?', { danger: true })) { const r = await Api.safe('deleteKeberangkatan', { id: b.dataset.del }); if (r) { UI.toast(r.message); await App.refreshMaster(); App.reload(); } } });
  },
  drawList(body, list) {
    const per = {}; App.state.paket.forEach(p => per[p.id] = { nama: p.nama_paket, n: 0, t: 0, k: 0 });
    list.forEach(k => { if (per[k.id_paket]) { per[k.id_paket].n++; per[k.id_paket].t += k.terisi; per[k.id_paket].k += k.kuota; } });
    body.innerHTML = `<div class="grid g-main"><div>${list.length ? list.map(k => this.card(k)).join('') : `<div class="card card-pad">${UI.empty('Tidak ada kloter pada filter ini.', 'plane')}</div>`}</div>
      <div><div class="card mb"><div class="card-head"><div><h3>Ringkasan per Paket</h3></div></div><div class="card-body">${Object.values(per).filter(x => x.n).map(x => `<div class="list-item"><div class="li-ico">${icon('briefcase')}</div><div style="flex:1"><b class="small">${UI.esc(x.nama)}</b><div class="xs muted">${x.n} kloter • ${x.t}/${x.k} pax</div><div class="progress" style="margin-top:6px"><i style="width:${x.k ? x.t / x.k * 100 : 0}%"></i></div></div></div>`).join('') || UI.empty('-')}</div></div>
      <div class="card"><div class="card-body"><div class="eyebrow">${icon('shield')} Aturan Kuota</div><p class="small muted">Status dihitung otomatis: <b>Buka</b> → <b>Penuh</b> saat kuota terisi 100% → <b>Berangkat</b> pada tanggal berangkat → <b>Selesai</b> setelah tanggal pulang. Jemaah berstatus Batal tidak dihitung dalam kuota.</p></div></div></div></div>`;
    this.bind(body, list);
  },
  drawCal(body, list) {
    const [y, mo] = this.month.split('-').map(Number);
    const first = new Date(y, mo - 1, 1), start = (first.getDay() + 6) % 7, days = new Date(y, mo, 0).getDate();
    const cells = []; const today = UI.today();
    const total = Math.ceil((start + days) / 7) * 7;
    for (let i = 0; i < total; i++) {
      const d = new Date(y, mo - 1, 1 - start + i);
      const ds = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      const ev = list.filter(k => k.tanggal_berangkat === ds).map(k => `<span class="ev ${k.status === 'Penuh' ? 'full' : 'go'}" data-k="${k.id}">✈ ${UI.esc(k.kode_keberangkatan)}<br>${k.terisi}/${k.kuota} pax</span>`).join('')
        + list.filter(k => k.tanggal_pulang === ds).map(k => `<span class="ev back" data-k="${k.id}">↩ Pulang ${UI.esc(k.kode_keberangkatan)}</span>`).join('');
      cells.push(`<div class="d ${d.getMonth() !== mo - 1 ? 'out' : ''} ${ds === today ? 'today' : ''}"><span class="n" style="${d.getDay() === 0 ? 'color:var(--bad)' : ''}">${d.getDate()}</span>${ev}</div>`);
    }
    body.innerHTML = `<div class="card"><div class="card-head"><div style="display:flex;gap:10px;align-items:center"><button class="btn icon" id="cPrev">${icon('left')}</button><h3 class="serif" style="font-size:22px;min-width:200px;text-align:center">${BULAN[mo - 1]} ${y}</h3><button class="btn icon" id="cNext">${icon('right')}</button><button class="btn sm" id="cNow">Hari ini</button></div>
      <div class="legend"><span><i style="background:var(--primary)"></i>Berangkat</span><span><i style="background:var(--bad-bg)"></i>Penuh</span><span><i style="background:var(--surface-mid)"></i>Kepulangan</span></div></div>
      <div class="cal">${['SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB', 'AHAD'].map((h, i) => `<div class="h ${i === 6 ? 'sun' : ''}">${h}</div>`).join('')}${cells.join('')}</div></div>`;
    const go = n => { const d = new Date(y, mo - 1 + n, 1); this.month = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); this.drawCal(body, list); };
    body.querySelector('#cPrev').onclick = () => go(-1); body.querySelector('#cNext').onclick = () => go(1);
    body.querySelector('#cNow').onclick = () => { this.month = UI.today().slice(0, 7); this.drawCal(body, list); };
    body.querySelectorAll('[data-k]').forEach(e => e.onclick = () => this.detail(list.find(k => k.id === e.dataset.k)));
  },
  async detail(k) {
    const m = UI.modal({ title: UI.esc(k.kode_keberangkatan) + ' • ' + UI.tgl(k.tanggal_berangkat), eyebrow: UI.esc(k.nama_paket), size: 'lg', body: this.card(k) + '<div id="kdJ"><div class="page-loading"><span class="spinner"></span></div></div>' });
    this.bind(m.el, [k]);
    const js = App.can('jemaah') ? (await App.jemaahCache(true)).filter(j => j.id_keberangkatan === k.id && j.status !== 'Batal') : [];
    const box = m.$('#kdJ');
    if (!box) return;
    const L = js.filter(j => j.jenis_kelamin === 'L').length;
    box.innerHTML = `<h4 style="margin:4px 0 10px">Daftar Jemaah (${js.length} pax • ${L} L / ${js.length - L} P)</h4><div id="kdT"></div>`;
    UI.table(box.querySelector('#kdT'), {
      rows: js, pageSize: 8, emptyText: 'Belum ada jemaah di kloter ini.',
      columns: [{ label: 'Jemaah', render: j => `<div class="name"><b><a href="#/jemaah/${j.id}" data-close>${UI.esc(j.nama_lengkap)}</a></b><small>${UI.esc(j.no_registrasi)}</small></div>` },
        { label: 'Kamar', render: j => UI.esc(j.tipe_kamar) }, { label: 'Paspor', render: j => (j.no_paspor ? UI.esc(j.no_paspor) : '-') + (j.paspor_warning ? ' ⚠' : '') },
        { label: 'Dok', render: j => j.dok_count + '/4' }, { label: 'Keuangan', render: j => j.sisa <= 0 ? UI.badge('Lunas') : UI.badge('Sisa ' + UI.rpShort(j.sisa), 'warn') }]
    });
  }
};
Forms.keberangkatan = (data = {}, done) => {
  const m = UI.modal({
    title: data.id ? 'Ubah Jadwal Keberangkatan' : 'Buat Jadwal Keberangkatan Baru', eyebrow: 'Operasional Kloter', size: 'lg',
    body: `<form id="fK">
      <div class="form-sec"><h4><span class="no">1</span>Identifikasi & Paket Kloter</h4><div class="form-grid c3">
        <div class="field"><label>Kode kloter</label><input class="input mono" name="kode_keberangkatan" placeholder="Otomatis: UMR-[BLN]-[NO]" style="text-transform:uppercase"><span class="hint">Kosongkan untuk dibuat otomatis</span></div>
        <div class="field"><label>Tanggal berangkat <span class="req">*</span></label><input class="input" type="date" name="tanggal_berangkat"></div>
        <div class="field"><label>Tanggal pulang <span class="req">*</span></label><input class="input" type="date" name="tanggal_pulang"><span class="hint">Terisi otomatis dari durasi paket</span></div>
        <div class="field span3"><label>Paket induk & referensi tarif <span class="req">*</span></label><select class="input" name="id_paket">${UI.options(App.state.paket, 'id', p => p.nama_paket + ' (' + p.durasi_hari + ' hari)', data.id_paket, '— Pilih paket —')}</select></div>
      </div><div class="grid g3" id="kPrice" style="gap:10px;margin-top:10px"></div></div>
      <div class="form-sec"><h4><span class="no">2</span>Penerbangan & Kuota</h4><div class="form-grid c3">
        <div class="field"><label>Maskapai</label><input class="input" name="maskapai"></div>
        <div class="field"><label>No. penerbangan</label><input class="input" name="no_penerbangan" placeholder="SV-816"></div>
        <div class="field"><label>Rute</label><input class="input" name="rute" placeholder="CGK - JED"></div>
        <div class="field"><label>Target kuota (pax) <span class="req">*</span></label><input class="input" type="number" min="1" name="kuota"></div>
        <div class="field"><label>Pembimbing / Tour leader</label><input class="input" name="pembimbing"></div>
        <div class="field"><label>Tutup pendaftaran manual</label><label class="check" style="height:40px;align-items:center"><span class="switch"><input type="checkbox" id="kTutup"><span></span></span> Ditutup</label></div>
        <div class="field span3"><label>Catatan</label><input class="input" name="catatan"></div>
      </div>${data.id ? `<div class="alert info" style="margin:12px 0 0">${icon('info')}<div>Terisi saat ini: <b>${data.terisi}</b> jemaah. Kuota tidak boleh lebih kecil dari angka ini.</div></div>` : ''}</div>
    </form>`,
    foot: `<button class="btn" data-close>Batal</button><button class="btn primary" id="fKSave">${icon('check')} Simpan Jadwal</button>`
  });
  const f = m.$('#fK');
  UI.fill(f, Object.assign({ kuota: 45 }, data));
  m.$('#kTutup').checked = data.status === 'Ditutup';
  const ps = f.querySelector('[name=id_paket]'), tb = f.querySelector('[name=tanggal_berangkat]'), tp = f.querySelector('[name=tanggal_pulang]');
  const upd = () => {
    const p = App.state.paket.find(x => x.id === ps.value);
    m.$('#kPrice').innerHTML = p ? ['quad', 'triple', 'double'].map(t => `<div class="mini-stat">${icon('hotel')} <small>${UI.kamar(t)}</small><b class="small">${UI.rp(p['harga_' + t])}</b></div>`).join('') : '';
    if (p && !f.querySelector('[name=maskapai]').value) f.querySelector('[name=maskapai]').value = p.maskapai || '';
    if (p && tb.value && (!tp.value || !data.id)) tp.value = UI.addDays(tb.value, p.durasi_hari - 1);
  };
  ps.onchange = upd; tb.onchange = upd; upd();
  m.$('#fKSave').onclick = async e => {
    const d = UI.formData(f);
    d.status = m.$('#kTutup').checked ? 'Ditutup' : '';
    if (data.id) d.id = data.id;
    const r = await UI.busy(e.currentTarget, () => Api.safe('saveKeberangkatan', d));
    if (r) { UI.toast(r.message); m.close(); await App.refreshMaster(); done && done(); }
  };
};
