/**
 * src/models/SiteContent.js — Schema de configuración dinámica del CMS ligero
 * 
 * Se utilizará como un Singleton (solo existirá 1 documento en la colección),
 * permitiendo al administrador editar el contenido de bienvenida
 * y otras variables dinámicas desde su propio panel (Admin Dashboard)
 * sin tocar el HTML crudo de las vistas.
 */

const mongoose = require('mongoose');

const siteContentSchema = new mongoose.Schema(
  {
    welcomeMessage: {
      type: String,
      trim: true,
      default: 'A veces la vida separa caminos… pero cuando dos personas se reencuentran, es porque algo nunca dejó de existir.',
      maxlength: [1000, 'El mensaje de bienvenida no puede exceder 1000 caracteres'],
    },
    heroImageUrl: {
      type: String,
      trim: true,
      default: '', // En caso de que se quiera poner una imagen de fondo en el futuro
    },
    dailyNote: {
      type: String,
      trim: true,
      default: 'Te amo infinito, yoss.', 
      maxlength: [500, 'La nota diaria no puede exceder 500 caracteres'],
    },
    // Aquí podemos agregar más campos en el futuro
    // ej. ourAnniversaryDate, counterTitle, etc.
  },
  {
    timestamps: true,
  }
);

// Middleware para asegurar que solo exista un documento activo
siteContentSchema.pre('save', async function () {
  const SiteContent = mongoose.model('SiteContent', siteContentSchema);
  
  if (this.isNew) {
    const count = await SiteContent.countDocuments();
    if (count >= 1) {
      throw new Error('Solo se permite 1 documento en la colección de Configuración.');
    }
  }
});

module.exports = mongoose.model('SiteContent', siteContentSchema);
