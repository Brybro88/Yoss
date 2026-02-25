/**
 * src/routes/thoughtRoutes.js — Rutas de pensamientos
 */

const { Router } = require('express');
const { getThoughts, createThought, deleteThought } = require('../controllers/thoughtController');
const { protect } = require('../middlewares/authMiddleware');

const router = Router();

// Todas las rutas requieren autenticación
router.use(protect);

router.get('/', getThoughts);
router.post('/', createThought);
router.delete('/:id', deleteThought);

module.exports = router;
