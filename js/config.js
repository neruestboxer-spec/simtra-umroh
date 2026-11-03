// ============================================================================
// KONFIGURASI FRONTEND — SIMTRA Umroh
// ⚠️ WAJIB DIISI sebelum push ke GitHub:
//    Ganti URL di bawah dengan URL Web App /exec dari Google Apps Script Anda
//    (Deploy → New deployment → Web app → salin "Web app URL").
// ============================================================================
const GAS_URL = 'https://script.google.com/macros/s/AKfycbwDkeYikPxe9mJ3MwiYi-6gt_gec76qt5Ts3hNJkbq1-QAeoYcHFl_b_aWEdT8eSC8g/exec';

const APP_CONFIG = {
  appName: 'SIMTRA Umroh',
  maxUploadMB: 5,          // samakan dengan MAX_UPLOAD_MB di Kode.gs
  imageMaxPx: 1800,        // foto dikompres di browser sebelum diunggah
  pageSize: 10             // baris per halaman tabel
};
