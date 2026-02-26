/**
 * src/models/DateIdea.js — La Ruleta de Citas
 * Ambos usuarios pueden agregar ideas, el sistema selecciona una al azar
 */

const mongoose = require('mongoose');

const dateIdeaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'El título de la cita es obligatorio'],
      trim: true,
      maxlength: [100, 'El título no puede exceder 100 caracteres'],
    },
    category: {
      type: String,
      required: [true, 'La categoría es obligatoria'],
      trim: true,
      enum: ['comida', 'salida', 'casa', 'aventura', 'relajacion', 'otro'], // Categorías para filtrar o animar la ruleta
      default: 'otro',
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El creador de la idea es obligatorio'],
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('DateIdea', dateIdeaSchema);
