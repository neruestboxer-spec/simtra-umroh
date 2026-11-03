# 📋 Panduan Instalasi — SIMTRA Umroh

Sistem Manajemen Travel Umroh • Backend Google Apps Script (REST API) + Frontend GitHub Pages

Ada **dua bagian** yang dipasang terpisah:

| Bagian | Berkas | Dipasang di |
|---|---|---|
| Backend | `Kode.gs` | Google Apps Script (akun Google perusahaan) |
| Frontend | isi ZIP `simtra-umroh.zip` | GitHub Pages |

> ⚠️ `Kode.gs` **tidak ikut** di dalam ZIP dan **jangan** di-upload ke GitHub.

---

## BAGIAN A — Backend (Google Apps Script)

### A1. Buat proyek
1. Login ke akun Google **khusus perusahaan** (disarankan verifikasi 2 langkah aktif).
2. Buka https://script.google.com → **Proyek baru**.
3. Ganti nama proyek menjadi `SIMTRA Umroh API`.
4. Rename `Code.gs` → `Kode`, hapus isinya, lalu **paste seluruh isi `Kode.gs`** → Simpan (Ctrl+S).

### A2. Jalankan setup — HANYA SEKALI
1. Dropdown fungsi di toolbar → pilih **`setupAppEnvironment`** → klik **▶ Jalankan**.
2. Klik **Tinjau izin** → pilih akun → *Advanced* → *Go to SIMTRA Umroh API (unsafe)* → **Izinkan** (akses Drive, Sheets, Gmail, trigger).
3. Buka **Log eksekusi**. Pastikan muncul `✅ SETUP SELESAI!` beserta:
   - link Spreadsheet & folder Drive
   - **Username `owner` dan password sementara** → **CATAT SEKARANG** (hanya tampil sekali)
4. Cek Google Drive: folder **📁 SIMTRA Umroh** berisi spreadsheet database dan 9 subfolder (Dokumen Jemaah, Bukti Pembayaran, Kwitansi PDF, Slip Gaji PDF, dll.).

> Jika setup dijalankan dua kali, fungsi akan menolak (aman). Untuk setup ulang dari nol: hapus semua **Script Properties** (⚙ Project Settings) dan folder lama, baru jalankan lagi.

### A3. Deploy sebagai Web App
1. **Deploy → New deployment** → ikon ⚙ → **Web app**.
2. Isi:
   - Description: `v1.0`
   - **Execute as: Me**
   - **Who has access: Anyone**
3. Klik **Deploy** → salin **Web app URL** (berakhiran `/exec`).

> "Anyone" aman: semua data dilindungi login aplikasi (username + password, hash + salt) dan hak akses dicek di server pada setiap permintaan.

### A4. Setiap kali Kode.gs diubah
**Deploy → Manage deployments → ✏ Edit → Version: New version → Deploy.** URL `/exec` tetap sama.

---

## BAGIAN B — Frontend (GitHub Pages)

### B1. Ekstrak ZIP
Ekstrak `simtra-umroh.zip`. Hasilnya folder **`simtra-umroh`** yang isinya langsung:

```
simtra-umroh/          ← folder INI yang di-git init
├── index.html
├── README.md
├── PANDUAN-INSTALASI.md
├── css/style.css
└── js/ (config.js, api.js, ui.js, app.js, pages-*.js)
```

### B2. Isi URL backend — WAJIB sebelum push
Buka `simtra-umroh/js/config.js`, ganti:
```js
const GAS_URL = 'https://script.google.com/macros/s/GANTI_DENGAN_ID_DEPLOYMENT_ANDA/exec';
```
dengan URL `/exec` dari langkah A3. Simpan.

### B3. Buat repository di GitHub
github.com → **+ → New repository** → nama mis. `simtra-umroh` → **Public** → **JANGAN** centang README/.gitignore/license → Create.

### B4. Push dari terminal (PowerShell / Git Bash)
Masuk ke folder **`simtra-umroh`** (yang berisi `index.html`), lalu cek dulu:
```bash
dir        # PowerShell   — atau: ls -la (Git Bash/Mac)
```
Wajib terlihat `index.html`, `css`, `js`. Jika belum, jangan lanjut.

```bash
git init
git add .
git commit -m "Upload pertama SIMTRA Umroh"
git branch -M main
git remote add origin https://github.com/USERNAME/simtra-umroh.git
git push -u origin main
```
Saat diminta password, tempel **Personal Access Token** (github.com/settings/tokens → *Generate new token (classic)* → centang **repo**). Layar memang kosong saat menempel — itu normal.

### B5. Aktifkan Pages
Repo → **Settings → Pages** → Source: *Deploy from a branch* → Branch **main** / **(root)** → Save → centang **Enforce HTTPS**. Tunggu 1–2 menit hingga muncul `https://USERNAME.github.io/simtra-umroh/`.

### B6. Update di kemudian hari
```bash
git add .
git commit -m "Deskripsi perubahan"
git push
```
Hard refresh browser: **Ctrl+Shift+R**.

---

## BAGIAN C — Uji Penerimaan

1. Buka URL GitHub Pages → di bawah tombol Masuk harus tertulis **● Server terhubung**.
2. Login `owner` + password sementara → wajib buat password baru.
3. **Pengaturan Sistem** → isi profil agensi, unggah logo, cek tab Notifikasi → *Kirim Email Tes*.
4. **Paket & Harga** → sesuaikan/hapus 2 paket contoh. **Jadwal Keberangkatan** → sesuaikan 2 kloter contoh.
5. **Manajemen Pengguna** → buat akun karyawan → catat password sementaranya.
6. Alur nyata: daftar jemaah → unggah dokumen → buat skema cicilan → catat pembayaran → cetak kwitansi → proses payroll → slip gaji.
7. Login sebagai karyawan: menu Laporan, Payroll, Pengeluaran, Pengguna **tidak muncul** dan ditolak server bila dipaksa.
8. F12 → tab Console/Network: tidak ada error CORS.

---

## Troubleshooting

| Gejala | Penyebab & solusi |
|---|---|
| "GAS_URL di js/config.js belum diisi" | Isi `GAS_URL` (B2), lalu push ulang |
| "Server tidak terjangkau" | URL salah / bukan `/exec` / deploy belum "Anyone" |
| "Server belum di-setup" | Jalankan `setupAppEnvironment()` (A2) |
| "Respons server tidak valid" | Deploy ulang dengan *Who has access: Anyone* |
| Perubahan Kode.gs tidak berlaku | Buat **New version** di Manage deployments (A4) |
| Lupa password owner | Di editor Apps Script jalankan `resetPasswordOwnerDarurat()` → lihat log |
| Akun terkunci | Tunggu 15 menit, atau owner klik 🔑 Reset password di Manajemen Pengguna |
| Pengingat cicilan tidak terkirim | Pengaturan → tab Ekosistem: cek trigger `reminderHarian`; bila kosong jalankan `installTriggers()` di editor. Jemaah wajib punya email |
| Halaman GitHub 404 | `index.html` tidak di root repo — lihat panduan git (push ulang dari folder `simtra-umroh`) |
| Tampilan lama setelah update | Ctrl+Shift+R atau jendela Incognito |

## Catatan teknis
- Sesi: token di `CacheService`, berakhir 60 menit tidak aktif; disimpan di `sessionStorage` (tutup tab = keluar).
- Kunci akun: 5x gagal → 15 menit.
- Nomor registrasi & kwitansi: atomik via `LockService`, reset tiap 1 Januari.
- Soft delete: kolom `is_deleted = TRUE` di Sheets; owner memulihkan dengan mengubahnya menjadi `FALSE`.
- Trigger: `reminderHarian` (07.00 WIB) dan `backupMingguan` (Senin 02.00 WIB, menyimpan 8 salinan).
- Kuota email: Gmail biasa ±100/hari, Google Workspace ±1.500/hari.
