// ud_amanah_backend/routes/pendapatanRoutes.js

const express = require('express');
const router = express.Router();
const {
  getPendapatan,
  createPendapatan,
  updatePendapatan,
  deletePendapatan,
} = require('../controllers/pendapatanController');

// Route utama untuk GET semua dan POST Create
router.route('/')
    .get(getPendapatan)
    .post(createPendapatan);

// Route untuk Update dan Delete berdasarkan ID
router.route('/:id')
    .put(updatePendapatan)
    .delete(deletePendapatan);

module.exports = router;