// ud_amanah_backend/models/Pendapatan.js

const mongoose = require('mongoose');

const PendapatanSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['pokok', 'laba'], // Hanya boleh salah satu dari dua nilai ini
    required: [true, 'Tipe pendapatan wajib diisi (pokok atau laba).'],
  },
  description: {
    type: String,
    required: [true, 'Deskripsi pendapatan wajib diisi.'],
    trim: true,
  },
  nominal: {
    type: Number,
    required: [true, 'Nominal pendapatan wajib diisi.'],
    min: [0, 'Nominal tidak boleh negatif.'],
  },
  date: {
    type: Date,
    required: [true, 'Tanggal pendapatan wajib diisi.'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('Pendapatan', PendapatanSchema);