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
    const letters = await Letter.find().sort({ unlockDate: 1 });

    const now = new Date();

    // Map time-lock logic
    const safeLetters = letters.map((letter) => {
      const isLocked = now < letter.unlockDate;
      const isAdmin = req.user.role === 'admin';

      const publicLetter = letter.toObject();

      if (isAdmin) {
        publicLetter.isLocked = false;
        return publicLetter;
      }

      // Si es partner
      if (!isLocked) {
        publicLetter.isLocked = false;
        return publicLetter;
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

    if (!title || !body || !unlockDate) {
      return res.status(400).json({
        success: false,
        message: 'Título, contenido y fecha de desbloqueo son obligatorios 💌',
      });
    }

    const letter = await Letter.create({
      title: title.trim(),
      body: body.trim(),
      unlockDate: new Date(unlockDate)
    });

    res.status(201).json({
      success: true,
      message: 'Carta cápsula de tiempo creada con éxito 📜⏳',
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

module.exports = { getLetters, createLetter, deleteLetter, updateLetter };
