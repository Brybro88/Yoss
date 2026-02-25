/**
 * src/controllers/letterController.js — CRUD de cartas privadas
 * 
 * Endpoints:
 *   GET   /api/letters      — Listar cartas del usuario
 *   POST  /api/letters      — Enviar carta al otro usuario
 *   PATCH /api/letters/:id  — Marcar como leída
 */

const Letter = require('../models/Letter');
const User = require('../models/User');

/**
 * GET /api/letters — Listar cartas donde el usuario es remitente o destinatario
 */
const getLetters = async (req, res, next) => {
  try {
    const letters = await Letter.find({
      $or: [{ from: req.user.id }, { to: req.user.id }],
    })
      .populate('from', 'displayName username')
      .populate('to', 'displayName username')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: letters.length,
      letters,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/letters — Enviar carta al otro usuario
 * 
 * Solo hay 2 usuarios, así que el destinatario es automáticamente
 * el otro usuario del sistema.
 */
const createLetter = async (req, res, next) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Escribe algo en tu carta 💌',
      });
    }

    // Encontrar al otro usuario automáticamente
    const otherUser = await User.findOne({
      _id: { $ne: req.user.id },
    });

    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró al destinatario',
      });
    }

    const letter = await Letter.create({
      from: req.user.id,
      to: otherUser._id,
      content: content.trim(),
    });

    await letter.populate('from', 'displayName username');
    await letter.populate('to', 'displayName username');

    res.status(201).json({
      success: true,
      message: `Carta enviada a ${otherUser.displayName} 💌`,
      letter,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/letters/:id — Marcar carta como leída
 * Solo el destinatario puede marcarla como leída.
 */
const markAsRead = async (req, res, next) => {
  try {
    const letter = await Letter.findById(req.params.id);

    if (!letter) {
      return res.status(404).json({
        success: false,
        message: 'Carta no encontrada',
      });
    }

    // Solo el destinatario puede marcarla como leída
    if (letter.to.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Solo el destinatario puede marcar como leída',
      });
    }

    letter.isRead = true;
    await letter.save();

    res.status(200).json({
      success: true,
      message: 'Carta marcada como leída',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getLetters, createLetter, markAsRead };
