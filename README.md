# SIMTRA Umroh — Sistem Manajemen Travel Umroh

Frontend SPA (HTML/CSS/JavaScript vanilla) untuk GitHub Pages. Backend: Google Apps Script sebagai REST API JSON (berkas `Kode.gs`, dipasang terpisah di script.google.com).

## Modul
Dashboard • Data Jemaah & Dokumen • Paket & Harga • Jadwal Keberangkatan (daftar + kalender) • Pembayaran & Kwitansi PDF • Skema Cicilan + pengingat email • Pengeluaran • Laporan Keuangan • Karyawan & Payroll + slip gaji • Manajemen Pengguna (RBAC) • Riwayat Aktivitas • Pengaturan

## Struktur
```
index.html
css/style.css
js/config.js            ← isi GAS_URL di sini
js/api.js               ← fetch POST text/plain ke GAS
js/ui.js                ← helper UI, tabel, modal, grafik, unggah
js/app.js               ← login, router, navigasi
js/pages-operasional.js ← dashboard, jemaah, paket, keberangkatan
js/pages-keuangan.js    ← pembayaran, cicilan, pengeluaran, laporan
js/pages-admin.js       ← payroll, pengguna, log, pengaturan
```

Panduan lengkap: lihat `PANDUAN-INSTALASI.md`.
