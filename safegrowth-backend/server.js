const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./database'); // Import koneksi db
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// --- 1. MIDDLEWARE ---
app.use(cors()); // Izinkan semua request dari frontend
app.use(express.json()); // Parsing JSON body
app.use(express.urlencoded({ extended: true })); // Parsing form data

// Serve folder 'uploads' agar gambar bisa diakses lewat URL
// Contoh: http://localhost:3000/uploads/gambar-123.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Pastikan folder uploads ada
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// --- 2. KONFIGURASI UPLOAD GAMBAR (MULTER) ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Nama file unik: timestamp + ekstensi asli
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit 5MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) return cb(null, true);
        cb(new Error('Hanya file gambar yang diperbolehkan!'));
    }
});

// --- 3. API ROUTES ---

// A. TEST ROUTE
app.get('/', (req, res) => {
    res.json({ message: "SafeGrowth Backend is Running... 🚀" });
});

// B. GET ALL REPORTS (Untuk Peta User & Admin Dashboard)
app.get('/api/reports', async (req, res) => {
    try {
        // Query ini mengambil laporan + menghitung jumlah validasi per tag
        // Kita ambil data raw dulu
        const [reports] = await db.query(`
            SELECT * FROM reports ORDER BY created_at DESC
        `);

        // Kita perlu mengambil data validasi untuk setiap report agar formatnya sama dengan frontend
        
        const reportsWithValidation = await Promise.all(reports.map(async (report) => {
            const [validations] = await db.query(`
                SELECT tag_type, COUNT(*) as count 
                FROM validations 
                WHERE report_id = ? 
                GROUP BY tag_type
            `, [report.id]);

            const validationObj = {
                'Benar/Valid': 0,
                'Memang Gelap': 0,
                'Sudah Aman': 0,
                'Ada Polisi': 0
            };

            validations.forEach(v => {
                validationObj[v.tag_type] = v.count;
            });

            return {
                ...report,
                image: report.image_url ? `${process.env.BASE_URL}/${report.image_url}` : null,
                validations: validationObj
            };
        }));

        res.json(reportsWithValidation);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Gagal mengambil data laporan" });
    }
});


app.post('/api/reports', upload.single('image'), async (req, res) => {
    try {
        const { lat, lng, title, desc, type, locationName, anonymous_id } = req.body;
        
        let userId;
        
        const [existingUsers] = await db.query('SELECT id FROM users WHERE anonymous_id = ?', [anonymous_id]);
        
        if (existingUsers.length > 0) {
            userId = existingUsers[0].id;
        } else {
            const [newUser] = await db.query('INSERT INTO users (role, anonymous_id, created_at) VALUES (?, ?, NOW())', ['user', anonymous_id]);
            userId = newUser.insertId;
        }

        const imagePath = req.file ? req.file.path.replace(/\\/g, "/") : null;

        const query = `
            INSERT INTO reports 
            (user_id, latitude, longitude, location_name, title, description, category, image_url, status, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
        `;

        const [result] = await db.query(query, [
            userId, lat, lng, locationName, title, desc, type, imagePath
        ]);

        res.status(201).json({ 
            message: "Laporan berhasil disimpan", 
            reportId: result.insertId,
            status: 'pending'
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Gagal menyimpan laporan: " + err.message });
    }
});


app.put('/api/reports/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'verified' atau 'rejected'

        if (!['verified', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({ error: "Status tidak valid" });
        }

        await db.query('UPDATE reports SET status = ? WHERE id = ?', [status, id]);
        
        res.json({ message: `Laporan berhasil diubah menjadi ${status}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Gagal update status" });
    }
});

app.delete('/api/reports/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.query('SELECT image_url FROM reports WHERE id = ?', [id]);
        if (rows.length > 0 && rows[0].image_url) {
            const filePath = path.join(__dirname, rows[0].image_url);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        await db.query('DELETE FROM validations WHERE report_id = ?', [id]);
        await db.query('DELETE FROM reports WHERE id = ?', [id]);

        res.json({ message: "Laporan dihapus permanen" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Gagal menghapus laporan" });
    }
});

app.post('/api/validations', async (req, res) => {
    try {
        const { report_id, tag_type, user_identifier } = req.body;

        const [existing] = await db.query(
            'SELECT id FROM validations WHERE report_id = ? AND tag_type = ? AND user_identifier = ?',
            [report_id, tag_type, user_identifier]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: "Anda sudah memberikan validasi ini." });
        }

        await db.query(
            'INSERT INTO validations (report_id, tag_type, user_identifier, created_at) VALUES (?, ?, ?, NOW())',
            [report_id, tag_type, user_identifier]
        );

        res.status(201).json({ message: "Validasi ditambahkan" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Gagal menambah validasi" });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

      
        const [users] = await db.query(
            'SELECT * FROM users WHERE username = ? AND password_hash = ? AND role = "admin"', 
            [username, password]
        );

        if (users.length > 0) {
            const user = users[0];
            res.json({ 
                success: true, 
                message: "Login Berhasil",
                user: { id: user.id, username: user.username, role: user.role }
            });
        } else {
            res.status(401).json({ success: false, message: "Username atau Password salah!" });
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});