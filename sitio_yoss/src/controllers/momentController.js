/**
 * src/controllers/momentController.js — CRUD de Momentos Especiales
 * 
 * Endpoints:
 *   GET    /api/moments          — Listar todos (admin)
 *   GET    /api/moments/active   — Obtener momento activo no visto (para Yoss)
 *   POST   /api/moments          — Crear nuevo (admin)
 *   PATCH  /api/moments/:id/seen — Marcar como visto
 *   DELETE /api/moments/:id      — Eliminar (admin)
 */

const Moment = require('../models/Moment');

/**
 * GET /api/moments — Listar todos los momentos (admin view)
 */
const getMoments = async (req, res, next) => {
  try {
    const moments = await Moment.find()
      .populate('createdBy', 'displayName')
      .populate('seenBy', 'displayName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: moments.length,
      moments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/moments/active — Obtener el momento activo más reciente
 * que el usuario actual NO ha visto.
 */
const getActiveMoment = async (req, res, next) => {
  try {
    const moment = await Moment.findOne({
      isActive: true,
      seenBy: { $nin: [req.user.id] },
    })
      .populate('createdBy', 'displayName')
      .sort({ createdAt: -1 });

    if (!moment) {
      return res.status(200).json({
        success: true,
        moment: null,
      });
    }

    res.status(200).json({
      success: true,
      moment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/moments — Crear un momento especial (solo admin)
 */
const createMoment = async (req, res, next) => {
  try {
    const { title, content, emoji, imageUrl } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Dale un título a tu momento especial 💖',
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Escribe algo especial para ella 💌',
      });
    }

    // Desactivar momentos anteriores para que solo haya uno activo
    await Moment.updateMany({ isActive: true }, { isActive: false });

    const moment = await Moment.create({
      title: title.trim(),
      content: content.trim(),
      emoji: emoji || '💖',
      imageUrl: imageUrl || '',
      createdBy: req.user.id,
    });

    await moment.populate('createdBy', 'displayName');

    res.status(201).json({
      success: true,
      message: 'Momento especial creado ✨ Yoss lo verá al entrar',
      moment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/moments/:id/seen — Marcar momento como visto
 */
const markSeen = async (req, res, next) => {
  try {
    const moment = await Moment.findById(req.params.id);

    if (!moment) {
      return res.status(404).json({
        success: false,
        message: 'Momento no encontrado',
      });
    }

    // Agregar usuario al array de seenBy si no está
    if (!moment.seenBy.includes(req.user.id)) {
      moment.seenBy.push(req.user.id);
      await moment.save();
    }

    res.status(200).json({
      success: true,
      message: 'Momento marcado como visto',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/moments/:id — Eliminar un momento (solo admin)
 */
const deleteMoment = async (req, res, next) => {
  try {
    const moment = await Moment.findById(req.params.id);

    if (!moment) {
      return res.status(404).json({
        success: false,
        message: 'Momento no encontrado',
      });
    }

    await moment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Momento eliminado',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMoments,
  getActiveMoment,
  createMoment,
  markSeen,
  deleteMoment,
};
