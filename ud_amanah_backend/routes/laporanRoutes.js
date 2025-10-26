// ud_amanah_backend/routes/laporanRoutes.js

const express = require('express');
const router = express.Router();

// Import Models (untuk Query Langsung)
const Pendapatan = require('../models/Pendapatan');
const KasKeluar = require('../models/KasKeluar');
const HutangTransaksi = require('../models/HutangTransaksi');
const PiutangTransaksi = require('../models/PiutangTransaksi');
const TabunganMaster = require('../models/TabunganMaster');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');

// Import Fungsi Saldo (FIX: calculateHutangSaldo dijamin ada)
const { calculateTotalSaldo } = require('../controllers/pendapatanController');
const { calculateTabunganSaldo } = require('../controllers/tabunganController');
const { calculateHutangSaldo } = require('../controllers/hutangController'); 

// @desc    Universal Endpoint for various reports
// @route   GET /api/laporan/:type
router.get('/:type', async (req, res) => {
    const { type } = req.params;
    const { month, year } = req.query;
    
    try {
        let data = [];
        const filter = {};
        
        if (month && year) {
            const startOfMonth = new Date(year, month - 1, 1);
            const endOfMonth = new Date(year, month, 0, 23, 59, 59);
            filter.date = { $gte: startOfMonth, $lte: endOfMonth };
        }

        const getSettlementFilter = () => {
             if (!month || !year) return {};
             const startOfMonth = new Date(year, month - 1, 1);
             const endOfMonth = new Date(year, month, 0, 23, 59, 59);
             return { settlement_date: { $gte: startOfMonth, $lte: endOfMonth } };
        };


        switch (type) {
            case 'pokok':
            case 'laba':
                const incomeFilter = { ...filter, type };
                data = await Pendapatan.find(incomeFilter).sort({ date: -1 });
                break;
            case 'kaskeluar':
                data = await KasKeluar.find(filter).sort({ date: -1 });
                break;
            case 'saldotabungan':
                const tabunganSaldoMap = await calculateTabunganSaldo();
                const tabunganMaster = await TabunganMaster.find();
                data = tabunganMaster.map(master => ({
                    NamaTabungan: master.nama,
                    Saldo: tabunganSaldoMap[master._id.toString()] || 0,
                    ID: master._id
                }));
                break;
            case 'hutangaktif':
                // Query dokumen Mongoose dan gabungkan kembali dengan saldo
                const activeHutangList = await calculateHutangSaldo();
                
                const saldoMap = activeHutangList.reduce((acc, h) => {
                    acc[h._id.toString()] = h.sisa_hutang;
                    return acc;
                }, {});

                let hutangData = await HutangTransaksi.find({ 
                    _id: { $in: activeHutangList.map(h => h._id) },
                    is_settled: false 
                })
                .populate('supplier_id', 'nama')
                .lean();
                
                data = hutangData.map(h => ({
                    ...h,
                    sisa_hutang: saldoMap[h._id.toString()] || 0,
                }));
                break;
            case 'hutanglunas':
                data = await HutangTransaksi.find({ is_settled: true, ...getSettlementFilter() })
                    .populate('supplier_id', 'nama')
                    .sort({ settlement_date: -1 });
                break;
            case 'piutangaktif':
                data = await PiutangTransaksi.find({ is_settled: false })
                    .populate('customer_id', 'nama')
                    .sort({ due_date: 1 });
                break;
            case 'piutanglunas':
                 data = await PiutangTransaksi.find({ is_settled: true, ...getSettlementFilter() })
                    .populate('customer_id', 'nama')
                    .sort({ settlement_date: -1 });
                 break;
            default:
                return res.status(404).json({ message: 'Jenis laporan tidak valid.' });
        }
        
        res.json({ type, data, filter: req.query });

    } catch (error) {
        console.error(`Error fetching report ${type}:`, error);
        res.status(500).json({ message: `Gagal memuat laporan: ${error.message}` });
    }
});

module.exports = router;