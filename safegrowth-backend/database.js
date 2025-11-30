const mysql = require('mysql2');
require('dotenv').config();

// Buat Pool Koneksi (Lebih baik dari koneksi tunggal untuk traffic tinggi)
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Promisify agar bisa pakai async/await (Modern JS)
const promisePool = pool.promise();

console.log(`✅ Terhubung ke Database: ${process.env.DB_NAME}`);

module.exports = promisePool;