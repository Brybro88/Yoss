/**
 * src/models/TimelineEvent.js — Eventos cronológicos de la historia
 * (Solo el Admin crea eventos, ambos los ven en orden)
 */

const mongoose = require('mongoose');

const timelineEventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'El título es obligatorio'],
      trim: true,
      maxlength: [100, 'El título no puede exceder 100 caracteres'],
    },
    date: {
      type: Date,
      required: [true, 'La fecha del evento es obligatoria'],
    },
    description: {
      type: String,
      required: [true, 'La descripción es obligatoria'],
      trim: true,
      maxlength: [1000, 'La descripción no puede exceder 1000 caracteres'],
    },
    mediaUrl: {
      type: String,
      trim: true,
      // Opcional: URL a imagen, video o canción
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('TimelineEvent', timelineEventSchema);
