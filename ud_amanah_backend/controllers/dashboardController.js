// ud_amanah_backend/controllers/dashboardController.js

const KasKeluar = require('../models/KasKeluar');
const TabunganMaster = require('../models/TabunganMaster');
const HutangTransaksi = require('../models/HutangTransaksi');
const PiutangTransaksi = require('../models/PiutangTransaksi');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');

const { calculateTotalSaldo } = require('./pendapatanController');
const { calculateTabunganSaldo } = require('./tabunganController');
const { calculateHutangSaldo } = require('./hutangController');

// @desc    Get All Dashboard Summary Data
// @route   GET /api/dashboard
const getDashboardData = async (req, res) => {
    try {
        // FIX: Menggunakan 'new Date()' yang benar
        const today = new Date(); 

        // --- 1. Saldo Pendapatan & Tabungan ---
        const pendapatanSaldo = await calculateTotalSaldo();
        const tabunganSaldoMap = await calculateTabunganSaldo();
        const tabunganMaster = await TabunganMaster.find().sort({ nama: 1 });

        const tabunganList = tabunganMaster.map(master => ({
            ...master.toObject(),
            saldo: tabunganSaldoMap[master._id.toString()] || 0,
        })).filter(t => t.saldo > 0);

        // --- 2. Hutang Mendekati Jatuh Tempo (Dalam 30 Hari) ---
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);
        
        const activeHutang = await calculateHutangSaldo();
        const expiringHutang = activeHutang.filter(h => 
            new Date(h.due_date) > today && new Date(h.due_date) <= thirtyDaysFromNow
        ).slice(0, 5); 

        // Populasikan nama Supplier
        const supplierIds = expiringHutang.map(h => h.supplier_id);
        const suppliers = await Supplier.find({ _id: { $in: supplierIds } }).select('nama');
        const supplierMap = suppliers.reduce((acc, s) => ({ ...acc, [s._id.toString()]: s.nama }), {});
        
        const expiringHutangDetails = expiringHutang.map(h => ({
             ...h,
             supplier_name: supplierMap[h.supplier_id.toString()] || 'N/A',
             // Hanya sertakan sisa hutang jika nilainya ada
             sisa_hutang: h.sisa_hutang 
        }));


        // --- 3. Piutang Jatuh Tempo (Lewat Hari Ini) ---
        const overduePiutang = await PiutangTransaksi.find({ 
            is_settled: false,
            due_date: { $lte: today } 
        }).sort({ due_date: 1 }).limit(5);

        // Populasikan nama Customer
        const customerIds = overduePiutang.map(p => p.customer_id);
        const customers = await Customer.find({ _id: { $in: customerIds } }).select('nama');
        const customerMap = customers.reduce((acc, c) => ({ ...acc, [c._id.toString()]: c.nama }), {});

        const overduePiutangDetails = overduePiutang.map(p => ({
            ...p.toObject(),
            customer_name: customerMap[p.customer_id.toString()] || 'N/A',
            // Hitung keterlambatan dalam hari
            days_overdue: Math.ceil((today.getTime() - new Date(p.due_date).getTime()) / (1000 * 3600 * 24))
        }));


        // --- 4. Kas Keluar Terbaru (5 Transaksi) ---
        const latestKasKeluar = await KasKeluar.find({})
            .sort({ date: -1, createdAt: -1 })
            .limit(5)
            .populate('tabungan_id', 'nama');

        
        // --- Kumpulkan dan Kirim Data ---
        res.json({
            pendapatanSaldo,
            tabunganList,
            expiringHutang: expiringHutangDetails,
            overduePiutang: overduePiutangDetails,
            latestKasKeluar,
        });

    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        res.status(500).json({ message: `Gagal memuat data dashboard: ${error.message}` });
    }
};

module.exports = { getDashboardData };