// ud_amanah_backend/models/TabunganMaster.js

const mongoose = require('mongoose');

const TabunganMasterSchema = new mongoose.Schema({
  nama: {
    type: String,
    required: [true, 'Nama jenis tabungan wajib diisi'],
    unique: true, // Pastikan tidak ada nama tabungan yang sama
    trim: true,
  },
  // Properti ini digunakan di halaman Tabungan untuk mengaitkan transaksi
  isAccount: { 
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('TabunganMaster', TabunganMasterSchema);