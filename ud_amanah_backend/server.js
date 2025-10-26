// ud_amanah_backend/server.js

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Muat variabel lingkungan
dotenv.config();

// Hubungkan ke Database
connectDB();

// Inisialisasi Aplikasi
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Memungkinkan akses dari frontend (default: http://localhost:5173)
app.use(express.json()); // Parsing body request JSON

// --- Import Routes ---
const masterDataRoutes = require('./routes/masterDataRoutes');
const pendapatanRoutes = require('./routes/pendapatanRoutes');
const kasKeluarRoutes = require('./routes/kasKeluarRoutes');
const tabunganRoutes = require('./routes/tabunganRoutes');
const hutangRoutes = require('./routes/hutangRoutes');
const piutangRoutes = require('./routes/piutangRoutes');
const laporanRoutes = require('./routes/laporanRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// --- Gunakan Routes ---
// Endpoint akan menjadi http://localhost:5027/api/masterdata/suppliers
app.use('/api/masterdata', masterDataRoutes);
app.use('/api/pendapatan', pendapatanRoutes);
app.use('/api/kaskeluar', kasKeluarRoutes);
app.use('/api/tabungan', tabunganRoutes);
app.use('/api/hutang', hutangRoutes);
app.use('/api/piutang', piutangRoutes);
app.use('/api/laporan', laporanRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Jalankan Server
app.listen(PORT, () => console.log(`Server berjalan di port http://localhost:${PORT}`));