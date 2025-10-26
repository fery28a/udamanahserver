// ud_amanah_backend/controllers/masterDataController.js

const Supplier = require('../models/Supplier');
const Customer = require('../models/Customer'); // <-- KESALAHAN KETIK SUDAH DIPERBAIKI
const TabunganMaster = require('../models/TabunganMaster');

// ==================================================================
// 1. READ (GET ALL) OPERATIONS
// ==================================================================

// @desc    Get all Suppliers
// @route   GET /api/masterdata/suppliers
const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data Supplier.' });
  }
};

// @desc    Get all Customers
// @route   GET /api/masterdata/customers
const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data Customer.' });
  }
};

// @desc    Get all Tabungan Master Data
// @route   GET /api/masterdata/tabungan
const getTabunganMaster = async (req, res) => {
  try {
    const tabungan = await TabunganMaster.find().sort({ createdAt: -1 });
    res.json(tabungan);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data Master Tabungan.' });
  }
};


// ==================================================================
// 2. CREATE (POST) OPERATIONS
// ==================================================================

// @desc    Create a new Supplier
// @route   POST /api/masterdata/suppliers
const createSupplier = async (req, res) => {
  try {
    const newSupplier = await Supplier.create(req.body);
    res.status(201).json(newSupplier);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Create a new Customer
// @route   POST /api/masterdata/customers
const createCustomer = async (req, res) => {
  try {
    const newCustomer = await Customer.create(req.body);
    res.status(201).json(newCustomer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Create a new Tabungan Master Data
// @route   POST /api/masterdata/tabungan
const createTabunganMaster = async (req, res) => {
  try {
    const newTabungan = await TabunganMaster.create(req.body);
    res.status(201).json(newTabungan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// ==================================================================
// 3. UPDATE (PUT/PATCH) OPERATIONS
// ==================================================================

// @desc    Update an existing Supplier
// @route   PUT /api/masterdata/suppliers/:id
const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Mengembalikan dokumen yang telah diperbarui
      runValidators: true, // Menjalankan validasi skema
    });

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier tidak ditemukan.' });
    }

    res.json(supplier);
  } catch (error) {
    // 400 Bad Request untuk error validasi atau kesalahan input
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update an existing Customer
// @route   PUT /api/masterdata/customers/:id
const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer tidak ditemukan.' });
    }

    res.json(customer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update an existing Tabungan Master Data
// @route   PUT /api/masterdata/tabungan/:id
const updateTabunganMaster = async (req, res) => {
  try {
    const tabungan = await TabunganMaster.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!tabungan) {
      return res.status(404).json({ message: 'Master Tabungan tidak ditemukan.' });
    }

    res.json(tabungan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// ==================================================================
// 4. DELETE OPERATIONS
// ==================================================================

// @desc    Delete a Supplier
// @route   DELETE /api/masterdata/suppliers/:id
const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier tidak ditemukan.' });
    }

    res.json({ message: 'Supplier berhasil dihapus.' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus Supplier.' });
  }
};

// @desc    Delete a Customer
// @route   DELETE /api/masterdata/customers/:id
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: 'Customer tidak ditemukan.' });
    }

    res.json({ message: 'Customer berhasil dihapus.' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus Customer.' });
  }
};

// @desc    Delete a Tabungan Master Data
// @route   DELETE /api/masterdata/tabungan/:id
const deleteTabunganMaster = async (req, res) => {
  try {
    const tabungan = await TabunganMaster.findByIdAndDelete(req.params.id);

    if (!tabungan) {
      return res.status(404).json({ message: 'Master Tabungan tidak ditemukan.' });
    }

    res.json({ message: 'Master Tabungan berhasil dihapus.' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus Master Tabungan.' });
  }
};


// ==================================================================
// EXPORTS
// ==================================================================

module.exports = {
  // READ
  getSuppliers,
  getCustomers,
  getTabunganMaster,
  
  // CREATE
  createSupplier,
  createCustomer,
  createTabunganMaster,

  // UPDATE
  updateSupplier,
  updateCustomer,
  updateTabunganMaster,

  // DELETE
  deleteSupplier,
  deleteCustomer,
  deleteTabunganMaster,
};