/**
 * src/routes/momentRoutes.js — Rutas de Momentos Especiales
 */

const { Router } = require('express');
const {
  getMoments,
  getActiveMoment,
  createMoment,
  markSeen,
  deleteMoment,
} = require('../controllers/momentController');
const { protect, requireAdmin } = require('../middlewares/authMiddleware');

const router = Router();

// Todas las rutas requieren autenticación
router.use(protect);

// Rutas para cualquier usuario autenticado
router.get('/active', getActiveMoment);
router.patch('/:id/seen', markSeen);

// Rutas solo para admin
router.get('/', requireAdmin, getMoments);
router.post('/', requireAdmin, createMoment);
router.delete('/:id', requireAdmin, deleteMoment);

module.exports = router;
