// ud_amanah_backend/routes/tabunganRoutes.js

const express = require('express');
const router = express.Router();
const {
  getTabunganDashboard,
  createDeposit,
} = require('../controllers/tabunganController');

// Routes Dashboard Tabungan (GET Saldo & List Akun)
router.route('/dashboard')
    .get(getTabunganDashboard);

// Routes untuk Deposit (POST)
router.route('/deposit')
    .post(createDeposit);

module.exports = router;