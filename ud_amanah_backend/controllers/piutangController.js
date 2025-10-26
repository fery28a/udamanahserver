// ud_amanah_backend/controllers/piutangController.js

const PiutangTransaksi = require('../models/PiutangTransaksi');
const Customer = require('../models/Customer'); 

// ==================================================================
// 1. GET OPERATIONS
// ==================================================================

// @desc    Get Piutang Aktif (is_settled: false)
// @route   GET /api/piutang/active
const getActivePiutang = async (req, res) => {
    try {
        const activePiutang = await PiutangTransaksi.find({ is_settled: false }).sort({ due_date: 1 });
        
        // Ambil detail Customer
        const customerIds = activePiutang.map(p => p.customer_id);
        const customers = await Customer.find({ _id: { $in: customerIds } }).select('nama');
        const customerMap = customers.reduce((acc, c) => ({ ...acc, [c._id.toString()]: c.nama }), {});
        
        // Gabungkan dengan nama customer
        const piutangListWithDetails = activePiutang.map(p => ({
            ...p.toObject(),
            customer_name: customerMap[p.customer_id.toString()] || 'N/A',
        }));

        res.json(piutangListWithDetails);
    } catch (error) {
        console.error("Error getActivePiutang:", error);
        res.status(500).json({ message: 'Gagal memuat Piutang Aktif.' });
    }
};

// @desc    Get Piutang Lunas (is_settled: true)
// @route   GET /api/piutang/settled
const getSettledPiutang = async (req, res) => {
    const { month, year } = req.query;
    let filter = { is_settled: true };

    if (month && year) {
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59);
        filter.settlement_date = { $gte: startOfMonth, $lte: endOfMonth };
    }
    
    try {
        const settledPiutang = await PiutangTransaksi.find(filter)
            .populate('customer_id', 'nama')
            .sort({ settlement_date: -1 })
            .lean();

        res.json(settledPiutang);
    } catch (error) {
        res.status(500).json({ message: 'Gagal memuat Piutang Lunas.' });
    }
};

// ==================================================================
// 2. CREATE & UPDATE OPERATIONS
// ==================================================================

// @desc    Record New Piutang
// @route   POST /api/piutang
const createPiutang = async (req, res) => {
    try {
        // Cek jika transaction_number sudah ada
        const existing = await PiutangTransaksi.findOne({ transaction_number: req.body.transaction_number });
        if (existing) {
            return res.status(400).json({ message: 'Nomor transaksi piutang sudah ada.' });
        }
        
        const newPiutang = await PiutangTransaksi.create(req.body);
        res.status(201).json(newPiutang);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update Piutang (Edit)
// @route   PUT /api/piutang/:id
const updatePiutang = async (req, res) => {
    try {
        const updatedPiutang = await PiutangTransaksi.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!updatedPiutang) {
            return res.status(404).json({ message: 'Piutang tidak ditemukan.' });
        }
        res.json(updatedPiutang);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Mark Piutang as Settled (Lunas)
// @route   PUT /api/piutang/settle/:id
const settlePiutang = async (req, res) => {
    try {
        const piutang = await PiutangTransaksi.findByIdAndUpdate(req.params.id, {
            is_settled: true,
            settlement_date: new Date(),
        }, { new: true });

        if (!piutang) {
            return res.status(404).json({ message: 'Piutang tidak ditemukan.' });
        }
        res.json(piutang);
    } catch (error) {
        res.status(500).json({ message: `Gagal menandai lunas: ${error.message}` });
    }
};

module.exports = {
    getActivePiutang,
    getSettledPiutang,
    createPiutang,
    updatePiutang,
    settlePiutang,
};