// ud_amanah_backend/routes/piutangRoutes.js

const express = require('express');
const router = express.Router();
const {
    getActivePiutang,
    getSettledPiutang,
    createPiutang,
    updatePiutang,
    settlePiutang,
} = require('../controllers/piutangController');

// Piutang Aktif dan Hutang Baru
router.route('/')
    .get(getActivePiutang) // GET /api/piutang/
    .post(createPiutang);  // POST /api/piutang/

// Edit Piutang
router.route('/:id')
    .put(updatePiutang); // PUT /api/piutang/:id

// Tandai Lunas
router.route('/settle/:id')
    .put(settlePiutang); // PUT /api/piutang/settle/:id

// Piutang Lunas
router.route('/settled')
    .get(getSettledPiutang); // GET /api/piutang/settled

module.exports = router;