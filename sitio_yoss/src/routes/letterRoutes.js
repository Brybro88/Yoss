/**
 * src/routes/letterRoutes.js — Rutas de cartas privadas
 */

const { Router } = require('express');
const { getLetters, createLetter, markAsRead } = require('../controllers/letterController');
const { protect } = require('../middlewares/authMiddleware');

const router = Router();

// Todas las rutas requieren autenticación
router.use(protect);

router.get('/', getLetters);
router.post('/', createLetter);
router.patch('/:id', markAsRead);

module.exports = router;
