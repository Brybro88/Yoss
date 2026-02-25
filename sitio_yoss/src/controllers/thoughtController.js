/**
 * src/controllers/thoughtController.js — CRUD de pensamientos
 * 
 * Endpoints:
 *   GET    /api/thoughts     — Listar todos los pensamientos
 *   POST   /api/thoughts     — Crear nuevo pensamiento
 *   DELETE /api/thoughts/:id — Eliminar (solo si eres el autor)
 */

const Thought = require('../models/Thought');

/**
 * GET /api/thoughts — Listar todos, ordenados por más recientes
 */
const getThoughts = async (req, res, next) => {
  try {
    const thoughts = await Thought.find()
      .populate('author', 'displayName username')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: thoughts.length,
      thoughts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/thoughts — Crear un nuevo pensamiento
 */
const createThought = async (req, res, next) => {
  try {
    const { content, emoji } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Escribe algo bonito primero 💭',
      });
    }

    const thought = await Thought.create({
      author: req.user.id,
      content: content.trim(),
      emoji: emoji || '💭',
    });

    // Populate para devolver datos completos
    await thought.populate('author', 'displayName username');

    res.status(201).json({
      success: true,
      message: 'Pensamiento compartido 💖',
      thought,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/thoughts/:id — Eliminar un pensamiento (solo el autor)
 */
const deleteThought = async (req, res, next) => {
  try {
    const thought = await Thought.findById(req.params.id);

    if (!thought) {
      return res.status(404).json({
        success: false,
        message: 'Pensamiento no encontrado',
      });
    }

    // Solo el autor puede eliminar
    if (thought.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Solo puedes eliminar tus propios pensamientos',
      });
    }

    await thought.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Pensamiento eliminado',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getThoughts, createThought, deleteThought };
