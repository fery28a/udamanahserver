// ud_amanah_backend/config/db.js

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Opsi ini tidak lagi diperlukan di Mongoose 6+
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    // Keluar dari proses jika koneksi gagal
    process.exit(1);
  }
};

module.exports = connectDB;