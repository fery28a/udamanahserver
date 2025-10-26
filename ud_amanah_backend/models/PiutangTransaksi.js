// ud_amanah_backend/models/PiutangTransaksi.js

const mongoose = require('mongoose');

const PiutangTransaksiSchema = new mongoose.Schema({
  transaction_number: {
    type: String,
    required: [true, 'Nomor transaksi wajib diisi.'],
    unique: true, // Setiap piutang baru harus punya nomor unik
    trim: true,
  },
  
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'ID Customer wajib diisi.'],
  },
  
  nominal: {
    type: Number,
    required: [true, 'Nominal piutang wajib diisi.'],
    min: [0, 'Nominal tidak boleh negatif.'],
  },
  
  start_date: {
    type: Date,
    required: [true, 'Tanggal awal piutang wajib diisi.'],
  },
  
  due_date: {
    type: Date,
    required: [true, 'Tanggal jatuh tempo wajib diisi.'],
  },
  
  // Status Lunas
  is_settled: {
    type: Boolean,
    default: false,
  },
  settlement_date: {
    type: Date,
    required: function() { return this.is_settled === true; }
  }

}, { timestamps: true });

module.exports = mongoose.model('PiutangTransaksi', PiutangTransaksiSchema);