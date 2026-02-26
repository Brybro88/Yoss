require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Letter = require('../models/Letter');
const SiteContent = require('../models/SiteContent');

const migrate = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🗄️  Conectado a MongoDB para aplicar migraciones...');

    // 1. Actualizar el rol de la usuaria Yoss a 'partner'
    // Se usa { upsert: false } porque asumimos que ya existe en DB.
    const resultUser = await User.updateMany(
      { username: 'yoss' }, 
      { $set: { role: 'partner' } }
    );
    console.log(`✅ Roles actualizados a partner: ${resultUser.modifiedCount} documento(s)`);

    // 2. Eliminar todas las cartas con el esquema incompatible anterior
    const resultLetters = await Letter.deleteMany({});
    console.log(`✅ Cartas antiguas eliminadas: ${resultLetters.deletedCount} documento(s) purgables`);

    // 3. Crear el Singleton del CMS predeterminado si no existe
    let content = await SiteContent.findOne();
    if (!content) {
      await SiteContent.create({});
      console.log('✅ CMS SiteContent generado satisfactoriamente con valores por defecto');
    } else {
      console.log('✅ CMS SiteContent ya existía; no es necesario recrearlo');
    }

    console.log('\n🌸 Migración a la Arquitectura Roles/TimeLock Completada');
  } catch (error) {
    console.error('❌ Error en script de migración:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexión a MongoDB cerrada');
    process.exit(0);
  }
};

migrate();
