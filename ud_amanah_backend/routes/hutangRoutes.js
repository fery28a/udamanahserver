// ud_amanah_backend/routes/hutangRoutes.js

const express = require('express');
const router = express.Router();
const {
  getHutangDashboard,
  getSettledHutang,
  createPrincipal,
  createPayment,
  updatePrincipal, // Diperlukan untuk Edit Hutang Pokok
} = require('../controllers/hutangController');

// =======================================================
// Rute Hutang Aktif & Pembayaran
// =======================================================

// GET /api/hutang/dashboard
// Mengambil semua data saldo dan list hutang aktif
router.route('/dashboard')
    .get(getHutangDashboard);

// POST /api/hutang/principal
// Mencatat Hutang Baru (Pokok)
router.route('/principal')
    .post(createPrincipal);

// PUT /api/hutang/principal/:id
// Mengupdate/Edit detail Hutang Pokok
router.route('/principal/:id')
    .put(updatePrincipal);

// POST /api/hutang/payment
// Mencatat Pembayaran/Cicilan Hutang
router.route('/payment')
    .post(createPayment);
    
// =======================================================
// Rute Hutang Lunas (Settled)
// =======================================================

// GET /api/hutang/settled
// Mengambil Hutang yang sudah Lunas
router.route('/settled')
    .get(getSettledHutang);

module.exports = router;