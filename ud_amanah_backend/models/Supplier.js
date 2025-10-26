// ud_amanah_backend/models/Supplier.js

const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
  nama: {
    type: String,
    required: true,
    trim: true,
  },
  alamat: {
    type: String,
    default: '',
  },
  kontak: {
    type: String,
    default: '',
  },
}, { timestamps: true }); // Menambahkan createdAt dan updatedAt secara otomatis

module.exports = mongoose.model('Supplier', SupplierSchema);