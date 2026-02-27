/**
 * src/controllers/letterController.js — CRUD "Time-Locked Letters"
 * 
 * Endpoints:
 *   GET   /api/letters      — Listar cartas (con contenido oculto si están bloqueadas)
 *   POST  /api/letters      — Crear una carta cápsula del tiempo (Admin)
 *   DELETE /api/letters/:id — Borrar carta (Admin)
 */

const Letter = require('../models/Letter');

/**
 * GET /api/letters — Listar todas las cartas. 
 * Si el usuario es 'partner', oculta el body de las cartas cuyo unlockDate no ha llegado.
 */
const getLetters = async (req, res, next) => {
  try {
    const letters = await Letter.find()
      .populate('author', 'displayName username role')
      .sort({ createdAt: -1 });

    const now = new Date();

    // Map time-lock logic
    const safeLetters = letters.map((letter) => {
      const isLocked = letter.unlockDate ? now < letter.unlockDate : false;
      const isAdmin = req.user.role === 'admin';

      const publicLetter = letter.toObject();

      if (isAdmin) {
        publicLetter.isLocked = false;
        return publicLetter;
      }

      // Si es partner
      if (!isLocked) {
        publicLetter.isLocked = false;
        return publicLetter; // includes isRead and readAt from the model
      } else {
        // Carta bloqueada: devolver estrictamente campos permitidos (ocultar content/body por la red)
        return {
          _id: publicLetter._id,
          title: publicLetter.title,
          unlockDate: publicLetter.unlockDate,
          isLocked: true
        };
      }
    });

    res.status(200).json({
      success: true,
      count: safeLetters.length,
      letters: safeLetters,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/letters — Crear carta con bloqueo de tiempo
 * Solamente el admin puede publicar cartas.
 */
const createLetter = async (req, res, next) => {
  try {
    const { title, body, unlockDate } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        message: 'Título y contenido son obligatorios 💌',
      });
    }

    const letterData = {
      author: req.user.id,
      title: title.trim(),
      body: body.trim(),
    };

    // Si hay unlockDate, es una cápsula de tiempo
    if (unlockDate) {
      letterData.unlockDate = new Date(unlockDate);
    }

    const letter = await Letter.create(letterData);
    await letter.populate('author', 'displayName username role');

    res.status(201).json({
      success: true,
      message: unlockDate ? 'Cápsula de tiempo creada 📜⏳' : 'Carta enviada 💌',
      letter,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/letters/:id — Eliminar una carta
 */
const deleteLetter = async (req, res, next) => {
  try {
    const letter = await Letter.findById(req.params.id);

    if (!letter) {
      return res.status(404).json({
        success: false,
        message: 'Carta no encontrada',
      });
    }

    await letter.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Carta eliminada correctamente 🗑️',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/letters/:id — Actualizar una carta existente (Admin)
 */
const updateLetter = async (req, res, next) => {
  try {
    const { title, body, unlockDate } = req.body;
    const letter = await Letter.findById(req.params.id);

    if (!letter) {
      return res.status(404).json({
        success: false,
        message: 'Carta no encontrada',
      });
    }

    if (title) letter.title = title.trim();
    if (body) letter.body = body.trim();
    if (unlockDate) letter.unlockDate = new Date(unlockDate);

    await letter.save();

    res.status(200).json({
      success: true,
      message: 'Carta actualizada con éxito ✏️',
      letter,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/letters/:id/read — Marcar carta como leída (solo el receptor)
 */
const markLetterRead = async (req, res, next) => {
  try {
    const letter = await Letter.findById(req.params.id);

    if (!letter) {
      return res.status(404).json({
        success: false,
        message: 'Carta no encontrada',
      });
    }

    // Solo el receptor (no el autor) puede marcar como leída
    if (letter.author && letter.author.toString() === req.user.id) {
      return res.status(200).json({ success: true, message: 'Eres el autor, no se marca como leída' });
    }

    // Si tiene unlockDate, verificar que esté desbloqueada
    if (letter.unlockDate && new Date() < letter.unlockDate) {
      return res.status(400).json({ success: false, message: 'La carta aún está bloqueada' });
    }

    // Solo marcar si no ha sido leída aún
    if (!letter.isRead) {
      letter.isRead = true;
      letter.readAt = new Date();
      await letter.save();
    }

    res.status(200).json({
      success: true,
      message: 'Carta marcada como leída 💌',
      readAt: letter.readAt,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getLetters, createLetter, deleteLetter, updateLetter, markLetterRead };
