// ud_amanah_backend/controllers/hutangController.js

const HutangTransaksi = require('../models/HutangTransaksi');
const Supplier = require('../models/Supplier');
const KasKeluar = require('../models/KasKeluar'); 
const TabunganTransaksi = require('../models/TabunganTransaksi');
// Import fungsi dari controller lain
const { calculateTotalSaldo } = require('./pendapatanController'); 
const { calculateTabunganSaldo } = require('./tabunganController'); 

// ==================================================================
// FUNGSI BANTU UTAMA: MENGHITUNG SALDO HUTANG AKTIF & TANDAI LUNAS
// ==================================================================

/**
 * @description Menghitung saldo Hutang Aktif per No. Transaksi dan menandai Hutang Lunas.
 * @returns {Array} Daftar hutang aktif (lean objects) dengan sisa_hutang.
 */
const calculateHutangSaldo = async () => { // <-- DEFINISI FUNGSI INI
    const transactions = await HutangTransaksi.find({ is_settled: false });

    const groupedHutang = transactions.reduce((acc, tx) => {
        const key = tx.transaction_number;
        if (!acc[key]) {
            acc[key] = {
                principal: 0,
                payment: 0,
                details: tx
            };
        }
        if (tx.type === 'principal') {
            acc[key].principal += tx.nominal;
            acc[key].details = tx; 
        } else if (tx.type === 'payment') {
            acc[key].payment += tx.nominal;
        }
        return acc;
    }, {});
    
    const activeHutang = [];
    for (const num in groupedHutang) {
        const item = groupedHutang[num];
        const sisa = item.principal - item.payment;

        if (sisa <= 0) {
            await HutangTransaksi.updateMany(
                { transaction_number: num, is_settled: false },
                { $set: { is_settled: true, settlement_date: new Date() } }
            );
        } else {
            activeHutang.push({
                ...item.details.toObject(),
                nominal_awal: item.principal,
                sisa_hutang: sisa,
            });
        }
    }
    return activeHutang;
};

// ==================================================================
// 1. GET OPERATIONS
// ==================================================================

const getHutangDashboard = async (req, res) => {
    // ... (kode di sini tidak diubah) ...
    try {
        const activeHutang = await calculateHutangSaldo();
        const pendapatanSaldo = await calculateTotalSaldo(); 
        const tabunganSaldoMap = await calculateTabunganSaldo();
        
        const supplierIds = activeHutang.map(h => h.supplier_id);
        const suppliers = await Supplier.find({ _id: { $in: supplierIds } }).select('nama');
        const supplierMap = suppliers.reduce((acc, s) => ({ ...acc, [s._id.toString()]: s.nama }), {});
        
        const hutangListWithDetails = activeHutang.map(h => {
            const totalDays = (new Date(h.due_date).getTime() - new Date(h.start_date).getTime()) / (1000 * 3600 * 24);
            return {
                ...h,
                supplier_name: supplierMap[h.supplier_id.toString()] || 'N/A',
                rekomendasi_cicilan: h.sisa_hutang / (totalDays > 0 ? totalDays : 1)
            };
        });

        res.json({
            pendapatanSaldo,
            tabunganSaldoMap, 
            hutangList: hutangListWithDetails,
        });
    } catch (error) {
        console.error("Error getHutangDashboard:", error);
        res.status(500).json({ message: `Gagal memuat dashboard Hutang: ${error.message}` });
    }
};

const getSettledHutang = async (req, res) => {
    // ... (kode di sini tidak diubah) ...
    const { month, year } = req.query;
    let filter = { is_settled: true, type: 'principal' };

    if (month && year) {
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59);
        filter.settlement_date = { $gte: startOfMonth, $lte: endOfMonth };
    }
    
    try {
        const settledHutang = await HutangTransaksi.find(filter)
            .populate('supplier_id', 'nama')
            .sort({ settlement_date: -1 })
            .lean();

        res.json(settledHutang);
    } catch (error) {
        res.status(500).json({ message: 'Gagal memuat Hutang Lunas.' });
    }
};

// ==================================================================
// 2. CREATE OPERATIONS
// ==================================================================
const createPrincipal = async (req, res) => {
    // ... (kode di sini tidak diubah) ...
    try {
        const newPrincipal = await HutangTransaksi.create({
            ...req.body,
            type: 'principal',
        });
        res.status(201).json(newPrincipal);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const createPayment = async (req, res) => {
    // ... (kode di sini tidak diubah) ...
    const { nominal, transaction_number, source_fund, tabungan_id } = req.body; 
    
    try {
        // 1. CEK SALDO SUMBER DANA
        let saldoTersedia = 0;
        
        if (source_fund === 'pokok' || source_fund === 'laba') {
            const currentSaldo = await calculateTotalSaldo();
            saldoTersedia = currentSaldo[source_fund];
        } else if (source_fund === 'tabungan') {
            if (!tabungan_id) throw new Error('Pilih akun Tabungan.');
            const tabunganSaldoMap = await calculateTabunganSaldo();
            saldoTersedia = tabunganSaldoMap[tabungan_id] || 0;
        }

        if (saldoTersedia < nominal) {
            return res.status(400).json({ 
                message: `Saldo ${source_fund.toUpperCase()} tidak cukup. Saldo tersedia: Rp ${saldoTersedia.toLocaleString('id-ID')}` 
            });
        }
        
        // 2. REKAM PENGELUARAN DANA (Memotong Saldo)
        const masterHutang = await HutangTransaksi.findOne({ transaction_number: transaction_number, type: 'principal' }).populate('supplier_id', 'nama');
        if (!masterHutang) {
            return res.status(404).json({ message: `Transaksi Hutang Pokok dengan No. ${transaction_number} tidak ditemukan.` });
        }

        const description = `Pembayaran Hutang Tn ${transaction_number} (${masterHutang.supplier_id.nama || 'N/A'})`;

        if (source_fund === 'pokok' || source_fund === 'laba') {
            await KasKeluar.create({ description, nominal, date: new Date(), source_of_fund: source_fund });
        } else if (source_fund === 'tabungan') {
            await TabunganTransaksi.create({
                tabungan_id: tabungan_id,
                type: 'withdraw',
                source_fund: 'pengeluaran', 
                nominal: nominal,
                date: new Date(),
            });
        }

        // 3. REKAM PEMBAYARAN HUTANG (Cicilan)
        const newPayment = await HutangTransaksi.create({
            ...req.body,
            type: 'payment',
            supplier_id: masterHutang.supplier_id._id,
            transaction_number: transaction_number,
            date: new Date(),
        });

        // 4. Cek Saldo setelah Pembayaran dan Tandai Lunas
        await calculateHutangSaldo();

        res.status(201).json(newPayment);
    } catch (error) {
        console.error("KRITIS: Error saat memproses pembayaran hutang:", error); 
        res.status(400).json({ message: error.message });
    }
};


// ==================================================================
// 3. UPDATE OPERATIONS
// ==================================================================
const updatePrincipal = async (req, res) => {
    // ... (kode di sini tidak diubah) ...
    try {
        const transaction = await HutangTransaksi.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!transaction) {
            return res.status(404).json({ message: 'Transaksi Hutang Pokok tidak ditemukan.' });
        }
        
        await calculateHutangSaldo();

        res.json(transaction);
    } catch (error) {
        console.error("Error updating principal debt:", error);
        res.status(400).json({ message: error.message });
    }
};


// ==================================================================
// 4. EXPORTS
// ==================================================================

module.exports = {
  getHutangDashboard,
  getSettledHutang,
  createPrincipal,
  createPayment,
  updatePrincipal,
  calculateHutangSaldo, // <-- FIX: SEKARANG DIEKSPOR!
};