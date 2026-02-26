/**
 * src/models/Letter.js — Schema de Cartas "Cápsula de Tiempo"
 * 
 * Permite dejar una carta bloqueada con una fecha de revelación.
 * El contenido permanecerá oculto hasta la fecha especificada (`unlockDate`).
 */

const mongoose = require('mongoose');

const letterSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'El título de la carta es obligatorio'],
      trim: true,
      maxlength: [100, 'El título no puede exceder 100 caracteres'],
    },
    body: {
      type: String,
      required: [true, 'El contenido (body) de la carta es obligatorio'],
      trim: true,
      maxlength: [10000, 'La carta no puede exceder 10000 caracteres'],
    },
    unlockDate: {
      type: Date,
      required: [true, 'La fecha de revelación (unlockDate) es obligatoria'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    }
  }
);

module.exports = mongoose.model('Letter', letterSchema);
