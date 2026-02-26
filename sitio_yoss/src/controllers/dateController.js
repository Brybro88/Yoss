/**
 * src/controllers/dateController.js
 * Controlador para la Ruleta de Citas
 */

const DateIdea = require('../models/DateIdea');

/**
 * POST /api/dates
 * Agrega una nueva idea para cita a la BD.
 */
const createDateIdea = async (req, res, next) => {
  try {
    const { title, category } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'El título de la cita es obligatorio',
      });
    }

    const idea = await DateIdea.create({
      title: title.trim(),
      category: category || 'otro',
      addedBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Idea agregada a la ruleta 🎡',
      idea,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/dates/random
 * Obtiene una idea al azar que no haya sido usada (isUsed: false).
 */
const getRandomDate = async (req, res, next) => {
  try {
    // Pipeline de agregación para obtener un documento al azar que no esté usado
    const randomIdeas = await DateIdea.aggregate([
      { $match: { isUsed: false } },
      { $sample: { size: 1 } }
    ]);

    if (!randomIdeas || randomIdeas.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No hay ideas nuevas en la ruleta. ¡Es hora de agregar más!',
      });
    }

    res.status(200).json({
      success: true,
      idea: randomIdeas[0],
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createDateIdea, getRandomDate };
