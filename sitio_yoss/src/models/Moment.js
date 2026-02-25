/**
 * src/models/Moment.js — Schema de "Momentos Especiales"
 * 
 * Mensajes sorpresa que Bryan publica y que Yoss ve
 * como un popup romántico fullscreen al entrar al sitio.
 */

const mongoose = require('mongoose');

const momentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'El título es obligatorio'],
      trim: true,
      maxlength: [100, 'El título no puede exceder 100 caracteres'],
    },
    content: {
      type: String,
      required: [true, 'El contenido es obligatorio'],
      trim: true,
      maxlength: [5000, 'El contenido no puede exceder 5000 caracteres'],
    },
    emoji: {
      type: String,
      default: '💖',
      maxlength: 4,
    },
    imageUrl: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    seenBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Moment', momentSchema);
