// ud_amanah_backend/models/Customer.js

const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  nama: {
    type: String,
    required: [true, 'Nama customer wajib diisi'],
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Customer', CustomerSchema);