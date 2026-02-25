/**
 * src/models/Letter.js — Schema de "cartas privadas"
 * 
 * Cartas entre los dos usuarios con seguimiento de lectura.
 */

const mongoose = require('mongoose');

const letterSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El remitente es obligatorio'],
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El destinatario es obligatorio'],
    },
    content: {
      type: String,
      required: [true, 'El contenido de la carta es obligatorio'],
      trim: true,
      maxlength: [5000, 'La carta no puede exceder 5000 caracteres'],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Letter', letterSchema);
