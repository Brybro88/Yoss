/**
 * src/scripts/seed.js — Script de seeding para crear los 2 usuarios iniciales
 * 
 * Uso: npm run seed
 * 
 * Este script es idempotente: si los usuarios ya existen, no los duplica.
 * Las contraseñas se hashean con bcrypt (12 rounds).
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// ─── Usuarios del sistema cerrado ───
const USERS = [
  {
    username: 'bryan',
    password: 'Yoss2026!',
    displayName: 'Bryan',
    role: 'admin',
  },
  {
    username: 'yoss',
    password: 'Bryan2026!',
    displayName: 'Yoss',
    role: 'partner',
  },
];

const seedUsers = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🗄️  Conectado a MongoDB para seeding...');

    for (const userData of USERS) {
      // Verificar si ya existe
      const existingUser = await User.findOne({ username: userData.username });

      if (existingUser) {
        console.log(`⚠️  Usuario "${userData.username}" ya existe. Saltando...`);
        continue;
      }

      // Hashear contraseña (12 rounds de bcrypt)
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(userData.password, salt);

      // Crear usuario
      await User.create({
        username: userData.username,
        passwordHash,
        displayName: userData.displayName,
        role: userData.role,
      });

      console.log(`✅ Usuario "${userData.username}" (${userData.displayName}) creado exitosamente`);
    }

    console.log('\n🌸 Seeding completado');
    console.log('─'.repeat(40));
    console.log('Usuarios disponibles:');
    USERS.forEach((u) => {
      console.log(`   👤 ${u.username} / ${u.password}`);
    });
    console.log('─'.repeat(40));
  } catch (error) {
    console.error('❌ Error en seeding:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexión a MongoDB cerrada');
    process.exit(0);
  }
};

seedUsers();
