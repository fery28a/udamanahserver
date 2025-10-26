// ud_amanah_backend/models/KasKeluar.js

const mongoose = require('mongoose');

const KasKeluarSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, 'Deskripsi kas keluar wajib diisi.'],
    trim: true,
  },
  nominal: {
    type: Number,
    required: [true, 'Nominal kas keluar wajib diisi.'],
    min: [1, 'Nominal harus lebih dari 0.'],
  },
  date: {
    type: Date,
    required: [true, 'Tanggal wajib diisi.'],
  },
  
  source_of_fund: { // SUMBER DANA: Pokok, Laba, atau Tabungan
    type: String,
    enum: ['pokok', 'laba', 'tabungan'], // <-- 'tabungan' DITAMBAHKAN
    required: [true, 'Sumber dana (pokok/laba/tabungan) wajib diisi.'],
  },
  
  tabungan_id: { // Hanya diisi jika source_of_fund = 'tabungan'
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TabunganMaster',
    // Properti required dipicu HANYA jika source_of_fund adalah 'tabungan'
    required: function() { 
      return this.source_of_fund === 'tabungan'; 
    }
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('KasKeluar', KasKeluarSchema);