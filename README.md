<p align="center">
  <img src="logo.png" width="140" />
</p>

<h1 align="center">🌃 SAFE GROWTH: URBAN DEFENSE SYSTEM 🚀</h1>

<p align="center">
  <i>Sistem Pertahanan Sipil Real-Time Berbasis Geospatial • Cyberpunk Tactical Interface</i>
</p>

---

# 01. 💀 PROTOKOL KLASIFIKASI  
## **Deskripsi Proyek**

SafeGrowth adalah sistem pertahanan sipil berbasis pemetaan (**Geospatial Intelligence**) yang berfokus pada **pelaporan dan pencegahan kriminalitas** secara real-time.  
Dibangun dengan arsitektur **Monorepo** modern yang memisahkan:

- **Frontend:** React + Tailwind  
- **Backend:** Node.js/Express  
- **Database:** MySQL  

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

- `reports`
- `users`
- `validations`

### 2. Tambahkan Akun Admin Default

```sql
INSERT INTO users (username, password_hash, role, anonymous_id, created_at) 
VALUES ('admin', 'admin123', 'admin', 'admin-master', NOW());
