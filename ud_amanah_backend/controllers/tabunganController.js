// ud_amanah_backend/controllers/tabunganController.js

const TabunganMaster = require('../models/TabunganMaster');
const TabunganTransaksi = require('../models/TabunganTransaksi');
const KasKeluar = require('../models/KasKeluar'); 
const { calculateTotalSaldo } = require('./pendapatanController'); 

// ==================================================================
// FUNGSI BANTU (SALDO TABUNGAN)
// ==================================================================

/**
 * @description Menghitung saldo Tabungan NET per ID (Deposit - Withdraw).
 */
const calculateTabunganSaldo = async () => {
    const result = await TabunganTransaksi.aggregate([
        {
            $group: {
                _id: '$tabungan_id',
                totalDeposit: { $sum: { $cond: [{ $eq: ['$type', 'deposit'] }, '$nominal', 0] } },
                totalWithdraw: { $sum: { $cond: [{ $eq: ['$type', 'withdraw'] }, '$nominal', 0] } },
            },
        },
        { $project: { _id: 1, saldo: { $subtract: ['$totalDeposit', '$totalWithdraw'] } } },
    ]);
    
    const saldoMap = {};
    result.forEach(item => {
        saldoMap[item._id.toString()] = item.saldo;
    });
    return saldoMap;
};

// ==================================================================
// CRUD OPERATIONS
// ==================================================================

// @desc    Get Saldo Pendapatan & Daftar Saldo Tabungan
const getTabunganDashboard = async (req, res) => {
  try {
    const pendapatanSaldo = await calculateTotalSaldo(); // Saldo NET Pokok/Laba
    const tabunganSaldoMap = await calculateTabunganSaldo();
    const tabunganMaster = await TabunganMaster.find().sort({ createdAt: 1 });
    
    const tabunganList = tabunganMaster.map(master => ({
      ...master.toObject(),
      saldo: tabunganSaldoMap[master._id.toString()] || 0,
    }));

    res.json({ pendapatanSaldo, tabunganList });
  } catch (error) {
    res.status(500).json({ message: 'Gagal memuat dashboard Tabungan.' });
  }
};

// @desc    Deposit funds into a Tabungan account (Memotong saldo Pendapatan)
const createDeposit = async (req, res) => {
  const { nominal, tabungan_id, source_fund } = req.body; 

  try {
    // 1. CEK SALDO PENDAPATAN
    const currentSaldo = await calculateTotalSaldo();
    const danaTersedia = currentSaldo[source_fund];

    if (danaTersedia < nominal) {
      return res.status(400).json({ message: `Saldo Pendapatan ${source_fund.toUpperCase()} tidak cukup. Saldo tersedia: Rp ${danaTersedia.toLocaleString('id-ID')}` });
    }

    // 2. REKAM PENGELUARAN DANA (Memotong Saldo Pokok/Laba) -> Dicatat sebagai Kas Keluar
    const masterTabungan = await TabunganMaster.findById(tabungan_id);
    await KasKeluar.create({
      description: `Transfer ke Tabungan (${masterTabungan.nama})`,
      nominal: nominal,
      date: new Date(),
      source_of_fund: source_fund, 
    });

    // 3. REKAM DEPOSIT DI TABUNGAN
    const newTransaction = await TabunganTransaksi.create({
      tabungan_id,
      type: 'deposit',
      source_fund: source_fund,
      nominal: nominal,
      date: new Date(),
    });

    res.status(201).json(newTransaction);
  } catch (error) {
    res.status(500).json({ message: `Transaksi deposit gagal: ${error.message}` });
  }
};


module.exports = {
  getTabunganDashboard,
  createDeposit,
  calculateTabunganSaldo, // <-- EKSPOR SALDO TABUNGAN (Diperlukan oleh Kas Keluar/Hutang)
};