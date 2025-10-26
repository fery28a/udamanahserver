// ud_amanah_backend/models/TabunganTransaksi.js

const mongoose = require('mongoose');

const TabunganTransaksiSchema = new mongoose.Schema({
  tabungan_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TabunganMaster',
    required: [true, 'ID Tabungan wajib diisi.'],
  },
  
  type: {
    type: String,
    enum: ['deposit', 'withdraw'],
    required: [true, 'Tipe transaksi (deposit/withdraw) wajib diisi.'],
  },
  
  source_fund: { // Sumber dana untuk deposit, atau alasan penarikan (withdraw)
    type: String,
    // Nilai valid: Pokok/Laba (dari Pendapatan), Transfer (antar Tabungan), Pengeluaran (untuk Kas Keluar)
    enum: ['pokok', 'laba', 'transfer', 'pengeluaran'], // <-- 'pengeluaran' DITAMBAHKAN
    required: [true, 'Sumber dana/alasan wajib diisi.'],
  },
  
  nominal: {
    type: Number,
    required: [true, 'Nominal wajib diisi.'],
    min: [1, 'Nominal harus lebih dari 0.'],
  },
  
  date: {
    type: Date,
    required: [true, 'Tanggal wajib diisi.'],
  },
  
  // Field opsional untuk menautkan transaksi penarikan ke KasKeluar
  kas_keluar_id: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KasKeluar',
    required: false,
  }

}, { timestamps: true });

module.exports = mongoose.model('TabunganTransaksi', TabunganTransaksiSchema);