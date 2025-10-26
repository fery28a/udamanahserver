// ud_amanah_backend/routes/dashboardRoutes.js

const express = require('express');
const router = express.Router();
const { getDashboardData } = require('../controllers/dashboardController');

router.route('/')
    .get(getDashboardData);

module.exports = router;