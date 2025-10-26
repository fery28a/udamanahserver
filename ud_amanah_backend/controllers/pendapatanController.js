// ud_amanah_backend/controllers/pendapatanController.js

const Pendapatan = require('../models/Pendapatan');
const KasKeluar = require('../models/KasKeluar'); 

// ==================================================================
// FUNGSI BANTU (SALDO DAN PENGELUARAN NET)
// ==================================================================

/**
 * @description Menghitung total pengeluaran dari Kas Keluar, dikelompokkan berdasarkan sumber dana.
 */
const calculateTotalPengeluaran = async () => {
    const result = await KasKeluar.aggregate([
        {
            $group: {
                _id: '$source_of_fund',
                total: { $sum: '$nominal' },
            },
        },
    ]);
    const pengeluaran = { pokok: 0, laba: 0 };
    result.forEach(item => {
        // Hanya hitung pengeluaran yang sumber dananya Pokok atau Laba
        if (item._id !== 'tabungan') {
            pengeluaran[item._id] = item.total;
        }
    });
    return pengeluaran;
};

/**
 * @description Menghitung saldo NET (Pemasukan - Pengeluaran dari Pokok/Laba).
 * @returns {Object} { pokok: Number, laba: Number }
 */
const calculateTotalSaldo = async () => {
    
    // 1. Hitung Total Pemasukan
    const pemasukanResult = await Pendapatan.aggregate([
        { $group: { _id: '$type', total: { $sum: '$nominal' } } },
    ]);
    const pemasukan = { pokok: 0, laba: 0 };
    pemasukanResult.forEach(item => {
        pemasukan[item._id] = item.total;
    });

    // 2. Hitung Total Pengeluaran (yang bersumber dari Pendapatan Pokok/Laba)
    const pengeluaran = await calculateTotalPengeluaran();

    // 3. Hitung Saldo NET
    const saldo = {
        pokok: pemasukan.pokok - pengeluaran.pokok,
        laba: pemasukan.laba - pengeluaran.laba,
    };
    
    return saldo;
};


// ==================================================================
// CRUD OPERATIONS
// ==================================================================

const getPendapatan = async (req, res) => {
    const { type, month, year } = req.query;
    let filter = {};
    // ... (Logika filter tanggal) ...
    if (month && year) {
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59);
        filter.date = { $gte: startOfMonth, $lte: endOfMonth };
    } else if (year) {
        const startOfYear = new Date(year, 0, 1);
        const endOfYear = new Date(year, 11, 31, 23, 59, 59);
        filter.date = { $gte: startOfYear, $lte: endOfYear };
    }
    
    // Filter berdasarkan tipe pendapatan (pokok/laba)
    if (type) {
        filter.type = type;
    }

    try {
        const transactions = await Pendapatan.find(filter).sort({ date: -1, createdAt: -1 });
        const saldo = await calculateTotalSaldo(); 
        
        res.json({
            transactions,
            saldo 
        });
        
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data pendapatan.' });
    }
};

const createPendapatan = async (req, res) => {
    try {
        const newTransaction = await Pendapatan.create(req.body);
        res.status(201).json(newTransaction);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updatePendapatan = async (req, res) => {
    try {
        const transaction = await Pendapatan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!transaction) return res.status(404).json({ message: 'Transaksi Pendapatan tidak ditemukan.' });
        res.json(transaction);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deletePendapatan = async (req, res) => {
    try {
        const transaction = await Pendapatan.findByIdAndDelete(req.params.id);
        if (!transaction) return res.status(404).json({ message: 'Transaksi Pendapatan tidak ditemukan.' });
        res.json({ message: 'Transaksi pendapatan berhasil dihapus.' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus transaksi.' });
    }
};


module.exports = {
    getPendapatan,
    createPendapatan,
    updatePendapatan,
    deletePendapatan,
    calculateTotalSaldo, // <-- EKSPOR SALDO
};