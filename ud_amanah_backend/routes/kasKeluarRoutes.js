// ud_amanah_backend/routes/kasKeluarRoutes.js

const express = require('express');
const router = express.Router();
const {
  getKasKeluarDashboard, // <-- Dashboard/GET utama
  createKasKeluar,
  updateKasKeluar,
  deleteKasKeluar,
} = require('../controllers/kasKeluarController');

router.route('/dashboard') // Route untuk GET semua data dan saldo
    .get(getKasKeluarDashboard);

router.route('/') // Route POST untuk CREATE
    .post(createKasKeluar);

router.route('/:id') // Route PUT/DELETE
    .put(updateKasKeluar)
    .delete(deleteKasKeluar);

module.exports = router;