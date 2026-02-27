/**
 * scripts/seedCoreDatos.js
 * Script para llenar la Base de Datos con datos iniciales
 * para probar el Timeline, Ruleta de Citas y Easter Eggs (aunque no se guardan).
 */
require('dotenv').config();
const mongoose = require('mongoose');

// Modelos
const User = require('../src/models/User');
const TimelineEvent = require('../src/models/TimelineEvent');
const DateIdea = require('../src/models/DateIdea');

async function seedCore() {
  try {
    console.log('⏳ Conectando a MongoDB para insertar datos de prueba...');
    await mongoose.connect(process.env.MONGO_URI);
    
    // Obtener a Bryan (Admin) para asignar la autoría
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('❌ No se encontró usuario Admin');
      process.exit(1);
    }
    
    // ─── 1. TIMELINE EVENTS ───
    console.log('🧹 Limpiando TimelineEvent y DateIdea...');
    await TimelineEvent.deleteMany({});
    await DateIdea.deleteMany({});
    
    console.log('✨ Insertando eventos en el Timeline...');
    const timelineEvents = [
      {
        title: 'El primer reencuentro',
        date: new Date('2025-10-15T18:00:00Z'),
        description: 'Ese día en el café donde cruzamos miradas por primera vez después de dos años.',
      },
      {
        title: 'La plática hasta la madrugada',
        date: new Date('2025-11-02T03:00:00Z'),
        description: 'Cuando nos quedamos hablando por teléfono toda la noche arreglando el mundo.',
      },
      {
        title: 'El primer Día de San Valentín Juntos (de nuevo)',
        date: new Date('2026-02-14T20:00:00Z'),
        description: 'El día oficial que lanzaste esta página para sorprenderla.',
      }
    ];
    await TimelineEvent.insertMany(timelineEvents);

    // ─── 2. DATE IDEAS FORE THE ROULETTE ───
    console.log('🎡 Insertando ideas en la Ruleta de Citas...');
    const dateIdeas = [
      { title: 'Noche de Sushi y peli Ghibli', category: 'comida', addedBy: adminUser._id },
      { title: 'Día de campo en la Marquesa', category: 'aventura', addedBy: adminUser._id },
      { title: 'Tarde de pintar cerámica', category: 'relajacion', addedBy: adminUser._id },
      { title: 'Preparar pizza casera', category: 'casa', addedBy: adminUser._id },
      { title: 'Ir a ese café que guardamos en TikTok', category: 'comida', addedBy: adminUser._id }
    ];
    await DateIdea.insertMany(dateIdeas);

    console.log('✅ ¡Base de datos poblada con éxito con datos Core!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en el script de seedCore:', error);
    process.exit(1);
  }
}

seedCore();
