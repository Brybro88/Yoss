/**
 * src/models/User.js — Schema de usuario para el sistema cerrado
 * 
 * Solo existirán 2 usuarios, creados mediante seed.js.
 * No hay ruta /register. Las contraseñas se hashean en el seed.
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'El username es obligatorio'],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: [30, 'El username no puede exceder 30 caracteres'],
    },
    passwordHash: {
      type: String,
      required: [true, 'El hash de contraseña es obligatorio'],
    },
    displayName: {
      type: String,
      required: [true, 'El nombre visible es obligatorio'],
      trim: true,
      maxlength: [50, 'El nombre no puede exceder 50 caracteres'],
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
  },
  {
    timestamps: true,
    // No devolver passwordHash en queries por defecto
    toJSON: {
      transform(doc, ret) {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('User', userSchema);
