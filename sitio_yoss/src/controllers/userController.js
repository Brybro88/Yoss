/**
 * src/controllers/userController.js
 * Controlador para operaciones del usuario (como Mood Tracker)
 */

const User = require('../models/User');

/**
 * PATCH /api/users/mood
 * Actualiza el mood actual del usuario que llama.
 */
const updateMood = async (req, res, next) => {
  try {
    const { mood } = req.body;

    if (!mood || !mood.trim()) {
      return res.status(400).json({
        success: false,
        message: 'El estado de ánimo es requerido',
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    user.currentMood = mood.trim();
    user.lastMoodUpdate = Date.now();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Estado de ánimo actualizado ✨',
      mood: user.currentMood,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/moods
 * Devuelve el mood actual de todos los usuarios registrados (solo hay 2).
 */
const getMoods = async (req, res, next) => {
  try {
    const users = await User.find().select('displayName currentMood lastMoodUpdate');

    res.status(200).json({
      success: true,
      moods: users,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { updateMood, getMoods };
