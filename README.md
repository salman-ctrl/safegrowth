<p align="center">
  <img src="/safegrowth-frontend/public/icon.png" width="140" />
</p>

<h1 align="center">SAFE GROWTH: URBAN DEFENSE SYSTEM </h1>

<p align="center">
  <i>Sistem Pertahanan Sipil Real-Time Berbasis Geospatial • Cyberpunk Tactical Interface</i>
</p>

---

# 01. PROTOKOL KLASIFIKASI

## **Deskripsi Proyek**

SafeGrowth adalah sistem pertahanan sipil berbasis pemetaan (**Geospatial Intelligence**) yang berfokus pada **pelaporan dan pencegahan kriminalitas** secara real-time.
Dibangun dengan arsitektur **Monorepo** modern yang memisahkan:

* **Frontend:** React + Tailwind
* **Backend:** Node.js/Express
* **Database:** MySQL

Tema visual proyek ini adalah **Cyberpunk Taktis**, menghadirkan estetika neon yang tajam, immersive, dan futuristik.

---

# 02. 🤖 ARSITEKTUR SISTEM

## **The Monolith Breakdown**

<table>
  <tr>
    <th>Komponen</th>
    <th>Teknologi Utama</th>
    <th>Fungsi</th>
  </tr>
  <tr>
    <td><b>Frontend (FE)</b></td>
    <td>React JS (Vite), Tailwind CSS</td>
    <td>UI Publik (Peta, Lapor) + Dashboard Admin responsif</td>
  </tr>
  <tr>
    <td><b>Backend (BE)</b></td>
    <td>Node.js, Express, Multer, MySQL2</td>
    <td>API Gateway, CRUD, Autentikasi Admin, Upload Gambar</td>
  </tr>
  <tr>
    <td><b>Database</b></td>
    <td>MySQL (safegrowthdb)</td>
    <td>Penyimpanan laporan, validasi komunitas, akun</td>
  </tr>
  <tr>
    <td><b>Geospatial</b></td>
    <td>Leaflet JS, OSRM</td>
    <td>Peta live, AI Route, pencarian lokasi</td>
  </tr>
</table>

---

# 03. ⚙️ PANDUAN SETUP & DEPLOYMENT

## **Konsol Operasi**

Kami menggunakan **dua konsol** terpisah (Frontend & Backend).

---

## 🛰️ **A. Backend (API - Port 3000)**

### 1. Struktur Database

Pastikan `safegrowthdb` memiliki tabel:

* `reports`
* `users`
* `validations`

### 2. Tambahkan Akun Admin Default

```sql
INSERT INTO users (username, password_hash, role, anonymous_id, created_at) 
VALUES ('admin', 'admin123', 'admin', 'admin-master', NOW());
```

### 3. Instalasi Dependensi

```bash
cd safegrowth-backend
npm install
```

### 4. Konfigurasi Lingkungan

Isi file `.env` dengan kredensial MySQL.

### 5. Jalankan Server

```bash
npm run dev
```

---

## 🖥️ **B. Frontend (React - Port 5173)**

### 1. Instalasi Dependensi

```bash
cd safegrowth-frontend
npm install
```

### 2. Jalankan Aplikasi

```bash
npm run dev
```

Akses UI via: **[http://localhost:5173/](http://localhost:5173/)**

---

# 04. 💡 KEY FEATURES: FUNGSI TAKTIS

## A. Interface Warga (User)

### **LIVE MAP**

Peta interaktif dengan marker status (Pending/Verified).

### **FILTER MODE**

Filter kategori cepat dalam waktu nyata.

### **SOCIAL VALIDATION**

User memberi preset tags/vote pada laporan.

### **ADVANCED REPORTING**

* Anti-bot CAPTCHA (Math Verification)
* Voice Input darurat
* Map Picker (Reverse Geocoding)

### **MOBILE UX**

Desain responsif dengan Bottom Navigation.

---

## B. Command Center (Admin)

### **SECURITY**

Login admin terproteksi.

### **ANALYTICS**

Dashboard dengan Area Chart neon.

### **MODERATION**

Proses laporan: Verified / Rejected.

### **DATABASE CONTROL**

Kontrol penuh laporan dalam tabel admin.

---

# 05. 🚀 ENDPOINTS API UTAMA (CYBER-ROUTES)

| METHOD | ENDPOINT                | DESKRIPSI                     |
| ------ | ----------------------- | ----------------------------- |
| GET    | /api/reports            | Mengambil semua laporan aktif |
| POST   | /api/reports            | Mengirim laporan baru         |
| PUT    | /api/reports/:id/status | Update status laporan (admin) |
| POST   | /api/validations        | Tambah tag/vote validasi      |
| POST   | /api/login              | Otentikasi admin              |

---

⚠️ **WARNING:** Jangan hapus data di produksi. Gunakan *Factory Reset* hanya untuk testing.
