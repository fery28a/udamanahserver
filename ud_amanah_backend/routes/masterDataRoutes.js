// ud_amanah_backend/routes/masterDataRoutes.js (FINAL)

const express = require('express');
const router = express.Router();
const {
  // GET & POST
  getSuppliers,
  createSupplier,
  getCustomers,
  createCustomer,
  getTabunganMaster,
  createTabunganMaster,
  
  // UPDATE & DELETE (NEW)
  updateSupplier,
  deleteSupplier,
  updateCustomer,
  deleteCustomer,
  updateTabunganMaster,
  deleteTabunganMaster,
} = require('../controllers/masterDataController');

// --------------------------------------------------
// 1. Routes untuk Suppliers
// --------------------------------------------------
router.route('/suppliers')
    .get(getSuppliers)   // GET: /api/masterdata/suppliers
    .post(createSupplier); // POST: /api/masterdata/suppliers

// Routes yang membutuhkan ID (Update dan Delete)
router.route('/suppliers/:id')
    .put(updateSupplier)   // PUT: /api/masterdata/suppliers/:id
    .delete(deleteSupplier); // DELETE: /api/masterdata/suppliers/:id


// --------------------------------------------------
// 2. Routes untuk Customers
// --------------------------------------------------
router.route('/customers')
    .get(getCustomers)
    .post(createCustomer);

// Routes yang membutuhkan ID
router.route('/customers/:id')
    .put(updateCustomer)
    .delete(deleteCustomer);


// --------------------------------------------------
// 3. Routes untuk Tabungan Masterdata
// --------------------------------------------------
router.route('/tabungan')
    .get(getTabunganMaster)
    .post(createTabunganMaster);

// Routes yang membutuhkan ID
router.route('/tabungan/:id')
    .put(updateTabunganMaster)
    .delete(deleteTabunganMaster);

module.exports = router;