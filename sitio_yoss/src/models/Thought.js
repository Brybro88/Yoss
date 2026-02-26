/**
 * src/models/Thought.js — Schema de "pensamientos" (mini-feed compartido)
 * 
 * Permite a ambos usuarios publicar mensajes cortos con un emoji.
 */

const mongoose = require('mongoose');

const thoughtSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El autor es obligatorio'],
    },
    content: {
      type: String,
      required: [true, 'El contenido es obligatorio'],
      trim: true,
      maxlength: [500, 'El pensamiento no puede exceder 500 caracteres'],
    },
    emoji: {
      type: String,
      default: '💭',
      maxlength: 4,
    },
    readBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Thought', thoughtSchema);
