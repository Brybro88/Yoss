/**
 * src/routes/letterRoutes.js — Rutas de cartas privadas
 */

const { Router } = require('express');
const { getLetters, createLetter, deleteLetter, updateLetter, markLetterRead } = require('../controllers/letterController');
const { protect, requireAdmin } = require('../middlewares/authMiddleware');

const router = Router();

// Todas las rutas requieren autenticación
router.use(protect);

router.get('/', getLetters);
router.post('/', createLetter);                // Both users can send letters
router.patch('/:id/read', markLetterRead);      // Partner marks as read
router.put('/:id', requireAdmin, updateLetter); // Admin edits capsules
router.delete('/:id', requireAdmin, deleteLetter);

module.exports = router;
