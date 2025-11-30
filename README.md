🌃 SAFE GROWTH: URBAN DEFENSE SYSTEM 🚀

01. 💀 PROTOKOL KLASIFIKASI: DESKRIPSI PROYEK

SafeGrowth adalah sistem pertahanan sipil berbasis pemetaan (Geospatial) yang berfokus pada pelaporan dan pencegahan kriminalitas perkotaan secara real-time. Dibangun dengan arsitektur Monorepo yang memisahkan Frontend (React JS) dan Backend (Node.js/Express) untuk skalabilitas tinggi.

Tema visual proyek ini adalah Cyberpunk Taktis, di mana data, keamanan, dan fungsionalitas disajikan dengan estetika neon yang tajam dan immersive.

02. 🤖 ARSITEKTUR SISTEM

Proyek ini menggunakan arsitektur Monorepo dengan teknologi full-stack modern:

Komponen

Teknologi Utama

Fungsi

Frontend (FE)

React JS (Vite), Tailwind CSS

User Interface publik (Peta, Lapor) dan Dashboard Admin yang responsif.

Backend (BE)

Node.js, Express, Multer, MySQL2

API Gateway, Logic CRUD, Otentikasi Admin, dan pengolahan data lokasi/gambar.

Database

MySQL (safegrowthdb)

Penyimpanan terstruktur untuk Laporan (reports), Validasi Komunitas (validations), dan Akun (users).

Geospatial

Leaflet JS, OSRM (Routing Service), Nominatim (Geocoding)

Pemetaan interaktif, perhitungan rute aman (AI Route), dan pencarian lokasi.

03. ⚙️ PANDUAN SETUP DAN DEPLOYMENT

A. Persiapan Backend (API - Port 3000)

Struktur Database: Pastikan database safegrowthdb sudah dibuat dan memiliki tabel reports, users, dan validations sesuai ERD.

Konfigurasi Akun Admin: Tambahkan akun admin default di tabel users:

INSERT INTO users (username, password_hash, role, anonymous_id, created_at) 
VALUES ('admin', 'admin123', 'admin', 'admin-master', NOW());


Instalasi Dependensi:

cd safegrowth-backend
npm install


Konfigurasi Lingkungan (.env): Pastikan file .env sudah diisi dengan kredensial MySQL yang benar.

Jalankan Server:

npm run dev


B. Persiapan Frontend (REACT - Port 5173)

Instalasi Dependensi:

cd safegrowth-frontend
npm install


Jalankan Aplikasi:

npm run dev


Aplikasi User Interface akan berjalan di http://localhost:5173/.

04. 💡 KEY FEATURES (Fungsi Taktis)

A. Interface Warga (User)

Peta Live Interaktif: Menampilkan marker laporan dengan indikator status (Pending/Verified).

Sistem Filter Cepat: Dapat memfilter marker berdasarkan kategori (Begal, Gelap) secara real-time.

Validasi Komunitas: Pengguna dapat memberikan Preset Tags/Votes (Benar/Valid, Sudah Aman) pada kartu detail untuk validasi sosial.

Pelaporan Canggih: Form laporan dilengkapi fitur:

Anti-Bot CAPTCHA (Verifikasi Matematika)

Voice Input (Input Suara untuk deskripsi darurat)

Map Picker (Memilih lokasi dengan akurat di peta, didukung Reverse Geocoding).

Responsif Penuh: Tampilan Bottom Navigation Bar di HP untuk UX yang optimal.

B. Command Center (Admin)

Akses Terproteksi: Login Admin menggunakan otentikasi berbasis token/session.

Dashboard Visual: Menampilkan Area Chart (smooth curve) dan statistik laporan (Total, Pending, Verified, Rejected).

Antrean Validasi: Admin dapat langsung memproses laporan yang masuk dengan aksi Terima (verified) atau Tolak (rejected).

Manajemen Laporan: Tabel lengkap untuk melihat dan menghapus laporan secara permanen.

05. 🚀 ENDPOINTS API UTAMA

METHOD

ENDPOINT

DESKRIPSI

GET

/api/reports

Mengambil semua laporan aktif (dengan data validasi).

POST

/api/reports

Mengirim laporan baru (support multipart/form-data untuk gambar).

PUT

/api/reports/:id/status

Admin: Mengubah status laporan (verified, rejected).

POST

/api/validations

User: Menambah vote/tag validasi ke sebuah laporan.

POST

/api/login

Admin: Otentikasi dan mendapatkan akses.

WARNING: Jangan pernah menghapus data di Production! Gunakan fitur Factory Reset hanya untuk testing.
