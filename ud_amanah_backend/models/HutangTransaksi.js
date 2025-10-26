// ud_amanah_backend/models/HutangTransaksi.js

const mongoose = require('mongoose');

const HutangTransaksiSchema = new mongoose.Schema({
  // Identifikasi Hutang: Digunakan untuk mengelompokkan cicilan
  transaction_number: {
    type: String,
    required: [true, 'Nomor transaksi wajib diisi.'],
    // BATASAN unique: true DIHAPUS agar cicilan bisa menggunakan nomor yang sama
    trim: true,
  },
  
  // Identitas Pihak: Supplier
  supplier_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: [true, 'ID Supplier wajib diisi.'],
  },
  
  type: {
    type: String,
    enum: ['principal', 'payment'], // principal: Hutang baru, payment: Pembayaran/Cicilan
    required: true,
  },
  
  nominal: {
    type: Number,
    required: true,
    min: [0, 'Nominal tidak boleh negatif.'],
  },
  
  // Hanya untuk tipe 'principal' (Hutang Baru)
  due_date: {
    type: Date,
    required: function() { return this.type === 'principal'; }
  },
  start_date: {
    type: Date,
    required: function() { return this.type === 'principal'; }
  },
  
  // Hanya untuk tipe 'payment' (Pembayaran)
  source_fund: {
    type: String,
    enum: ['pokok', 'laba', 'tabungan'], 
    required: function() { return this.type === 'payment'; }
  },
  tabungan_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TabunganMaster',
    required: function() { return this.source_fund === 'tabungan'; }
  },
  
  // Status Lunas (Hanya diisi jika saldo hutang <= 0)
  is_settled: {
    type: Boolean,
    default: false,
  },
  settlement_date: {
    type: Date,
    required: function() { return this.is_settled === true; }
  }

}, { timestamps: true });

module.exports = mongoose.model('HutangTransaksi', HutangTransaksiSchema);