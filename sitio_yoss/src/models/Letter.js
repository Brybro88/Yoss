/**
 * src/models/Letter.js — Schema de Cartas y Cápsulas de Tiempo
 * 
 * Soporta dos modos:
 *   - Carta instantánea: sin unlockDate, visible inmediatamente
 *   - Cápsula de tiempo: con unlockDate, bloqueada hasta esa fecha
 */

const mongoose = require('mongoose');

const letterSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
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
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    }
  }
);

module.exports = mongoose.model('Letter', letterSchema);

