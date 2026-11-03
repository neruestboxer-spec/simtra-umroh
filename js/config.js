// ============================================================================
// KONFIGURASI FRONTEND — SIMTRA Umroh
// ⚠️ WAJIB DIISI sebelum push ke GitHub:
//    Ganti URL di bawah dengan URL Web App /exec dari Google Apps Script Anda
//    (Deploy → New deployment → Web app → salin "Web app URL").
// ============================================================================
const GAS_URL = 'https://script.google.com/macros/s/AKfycbywxw9ymU_KigT2FTe2_6V14Y5-J1jDc0HYR7pSNcNTq2AAYIju7z3lYHphz-5q7a-jBQ/exec';

const APP_CONFIG = {
  appName: 'SIMTRA Umroh',
  maxUploadMB: 5,          // samakan dengan MAX_UPLOAD_MB di Kode.gs
  imageMaxPx: 1800,        // foto dikompres di browser sebelum diunggah
  pageSize: 10             // baris per halaman tabel
};
