// ud_amanah_backend/controllers/kasKeluarController.js

const KasKeluar = require('../models/KasKeluar');
const TabunganTransaksi = require('../models/TabunganTransaksi'); // Diperlukan untuk memotong/mengembalikan saldo tabungan
const TabunganMaster = require('../models/TabunganMaster');
const { calculateTotalSaldo } = require('./pendapatanController'); 
const { calculateTabunganSaldo } = require('./tabunganController'); 


// ==================================================================
// 1. READ (GET DASHBOARD) OPERATIONS
// ==================================================================

// @desc    Get Kas Keluar transactions, Saldo Pokok/Laba, dan Saldo Tabungan
// @route   GET /api/kaskeluar/dashboard
const getKasKeluarDashboard = async (req, res) => {
  const { month, year } = req.query;
  let filter = {};
  
  // Logika filter tanggal
  if (month && year) {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59); 
    filter.date = { $gte: startOfMonth, $lte: endOfMonth };
  } else if (year) {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59);
    filter.date = { $gte: startOfYear, $lte: endOfYear };
  }

  try {
    const transactions = await KasKeluar.find(filter).sort({ date: -1, createdAt: -1 });
    const pendapatanSaldo = await calculateTotalSaldo(); 
    const tabunganSaldoMap = await calculateTabunganSaldo(); 
    const tabunganMaster = await TabunganMaster.find().sort({ nama: 1 }); 

    // Gabungkan master data Tabungan dengan saldo aktualnya
    const tabunganList = tabunganMaster.map(master => ({
      ...master.toObject(),
      saldo: tabunganSaldoMap[master._id.toString()] || 0,
    })); 

    res.json({
        transactions,
        pendapatanSaldo,
        tabunganList
    });
  } catch (error) {
    console.error("Kesalahan saat menjalankan getKasKeluarDashboard:", error);
    res.status(500).json({ message: 'Internal Server Error: Gagal memuat data keuangan.' });
  }
};


// ==================================================================
// 2. CREATE (POST) OPERATION - Menggunakan Saldo
// ==================================================================

// @desc    Create a new Kas Keluar transaction
// @route   POST /api/kaskeluar
const createKasKeluar = async (req, res) => {
  const { nominal, source_of_fund, tabungan_id, date } = req.body;
  
  try {
    // 1. Cek Ketersediaan Saldo
    let saldoTersedia = 0;

    if (source_of_fund === 'pokok' || source_of_fund === 'laba') {
      const currentSaldo = await calculateTotalSaldo();
      saldoTersedia = currentSaldo[source_of_fund];
    } else if (source_of_fund === 'tabungan') {
      if (!tabungan_id) throw new Error('Pilih akun Tabungan sebagai sumber dana.');
      const tabunganSaldoMap = await calculateTabunganSaldo();
      saldoTersedia = tabunganSaldoMap[tabungan_id] || 0;
    } else {
        throw new Error('Sumber dana tidak valid.');
    }

    // Pastikan nominal > 0
    if (!nominal || nominal <= 0) {
        throw new Error('Nominal transaksi harus lebih besar dari 0.');
    }

    if (saldoTersedia < nominal) {
      return res.status(400).json({ 
          message: `Saldo ${source_of_fund.toUpperCase()} tidak cukup. Saldo tersedia: Rp ${saldoTersedia.toLocaleString('id-ID')}` 
      });
    }
    
    // 2. REKAM TRANSAKSI KELUAR (KasKeluar)
    // Gunakan req.body utuh, Mongoose akan memvalidasi field lain (description, dll.)
    const newTransaction = await KasKeluar.create(req.body);

    // 3. POTONG SALDO TABUNGAN jika sumber dana dari TABUNGAN
    if (source_of_fund === 'tabungan') {
        await TabunganTransaksi.create({
            tabungan_id: tabungan_id,
            type: 'withdraw',
            source_fund: 'pengeluaran', 
            nominal: nominal,
            date: new Date(date),
            // Tambahkan referensi transaksi KasKeluar untuk DELETE yang akurat
            kas_keluar_id: newTransaction._id 
        });
    }
    
    res.status(201).json(newTransaction);
  } catch (error) {
    console.error("VALIDATION/DATABASE ERROR during KasKeluar POST:", error.message);
    // Mongoose Validation Error (400)
    res.status(400).json({ message: error.message });
  }
};


// ==================================================================
// 3. UPDATE OPERATION - Logika Sederhana (Membutuhkan Perbaikan Lanjutan di Tabungan)
// ==================================================================

// @desc    Update an existing Kas Keluar transaction
// @route   PUT /api/kaskeluar/:id
const updateKasKeluar = async (req, res) => {
    // NOTE: Logika ini diimplementasikan secara sederhana dan BISA menyebabkan ketidakseimbangan saldo Tabungan 
    // jika sumber dana/nominal diubah. Logika yang benar memerlukan transaksi DB.
    try {
        const transaction = await KasKeluar.findByIdAndUpdate(req.params.id, req.body, { 
            new: true, 
            runValidators: true 
        });
        
        if (!transaction) return res.status(404).json({ message: 'Transaksi tidak ditemukan.' });

        // Asumsi: Jika sumber Tabungan, Anda harus menghapus withdraw lama dan membuat withdraw baru.
        // Untuk saat ini, kita hanya mengizinkan update KasKeluar saja.

        res.json(transaction);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


// ==================================================================
// 4. DELETE OPERATION - Logika UNDO Saldo Tabungan
// ==================================================================

// @desc    Delete a Kas Keluar transaction
// @route   DELETE /api/kaskeluar/:id
const deleteKasKeluar = async (req, res) => {
    try {
        const transaction = await KasKeluar.findByIdAndDelete(req.params.id);

        if (!transaction) return res.status(404).json({ message: 'Transaksi tidak ditemukan.' });
        
        // LOGIC UNDO: Jika transaksi lama menggunakan Tabungan, kembalikan saldo Tabungan
        if (transaction.source_of_fund === 'tabungan') {
            // Hapus transaksi penarikan (withdraw) terkait di TabunganTransaksi
            const deletedWithdraw = await TabunganTransaksi.findOneAndDelete({ 
                tabungan_id: transaction.tabungan_id, 
                type: 'withdraw',
                nominal: transaction.nominal,
                // Menggunakan kas_keluar_id (jika diimplementasikan) akan lebih akurat
            });
            
            if (!deletedWithdraw) {
                // Ini adalah masalah serius: KasKeluar dihapus tapi withdraw tidak ditemukan
                console.warn(`Peringatan: Transaksi withdraw untuk KasKeluar ID ${transaction._id} tidak ditemukan.`);
            }
        }
        // Jika sumber Pokok/Laba, saldo NET otomatis ter-undo karena dokumen KasKeluar dihapus.

        res.json({ message: 'Transaksi Kas Keluar berhasil dihapus.' });
    } catch (error) {
        console.error("Kesalahan saat menghapus KasKeluar:", error.message);
        res.status(500).json({ message: 'Gagal menghapus transaksi.' });
    }
};

module.exports = {
  getKasKeluarDashboard,
  createKasKeluar,
  updateKasKeluar,
  deleteKasKeluar,
};