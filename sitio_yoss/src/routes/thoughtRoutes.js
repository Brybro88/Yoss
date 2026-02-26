/**
 * src/routes/thoughtRoutes.js — Rutas de pensamientos
 */

const { Router } = require('express');
const { getThoughts, createThought, deleteThought, markAsRead } = require('../controllers/thoughtController');
const { protect } = require('../middlewares/authMiddleware');

const router = Router();

// Todas las rutas requieren autenticación
router.use(protect);

router.get('/', getThoughts);
router.post('/', createThought);
router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteThought);

module.exports = router;
