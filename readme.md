# Boothin — Photo Booth SaaS (Web Demo)

Aplikasi photo booth kiosk berbasis web: QRIS (simulasi) → pilih frame & filter → foto → cetak thermal 80mm (simulasi) → share digital.

## 🚀 Cara Deploy ke Netlify

### Cara Termudah: Drag-and-Drop
1. Buka https://app.netlify.com → login/daftar.
2. Klik **"Add new site"** → **"Deploy manually"**.
3. Seret folder `boothin-netlify` ini (yang berisi `index.html`, folder `booth/`, dan `netlify.toml`) ke area upload.
4. Tunggu ±10 detik → situs langsung online dengan URL `https://nama-acak.netlify.app`.
5. (Opsional) Ubah nama situs di **Site settings → Change site name**.

### Alternatif: via Git (untuk update otomatis)
1. Push folder ini ke repository GitHub/GitLab.
2. Di Netlify: **Add new site → Import from Git** → pilih repo.
3. Biarkan build command kosong, publish directory = `.` (sudah diatur di `netlify.toml`).
4. Setiap push, situs otomatis ter-update.

## 🔗 URL Penting
| Halaman | URL |
|---|---|
| Hub utama | `https://SITUS.netlify.app/` |
| Booth kiosk | `https://SITUS.netlify.app/booth` |

## 📱 Tips Tes di Tablet/HP
- Buka URL `/booth` di browser tablet → izinkan akses kamera saat diminta.
- HTTPS sudah otomatis dari Netlify, jadi kamera pasti bisa jalan.
- Tekan ⚙️ di pojok kanan bawah booth untuk Panel Operator (tema, frame, harga, logo).

## 🗺 Roadmap
- [x] Alur booth lengkap (QRIS simulasi, frame studio, cetak simulasi, share)
- [x] Sistem tema & panel operator
- [ ] QRIS asli (Midtrans/Xendit) + backend
- [ ] Dashboard operator (laporan penjualan per kotak)
- [ ] Integrasi cetak nyata EP-80ECO (ESC/POS via native Android)