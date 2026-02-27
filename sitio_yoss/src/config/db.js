/**
 * src/config/db.js — Conexión a MongoDB con Mongoose
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`🗄️  MongoDB conectado: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error('❌ Error de conexión a MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
