/**
 * src/routes/letterRoutes.js — Rutas de cartas privadas
 */

const { Router } = require('express');
const { getLetters, createLetter, deleteLetter, updateLetter } = require('../controllers/letterController');
const { protect } = require('../middlewares/authMiddleware');
const requireAdmin = require('../middleware/requireAdmin');

const router = Router();

// Todas las rutas requieren autenticación
router.use(protect);

router.get('/', getLetters);
router.post('/', requireAdmin, createLetter);
router.put('/:id', requireAdmin, updateLetter);
router.delete('/:id', requireAdmin, deleteLetter);

module.exports = router;
