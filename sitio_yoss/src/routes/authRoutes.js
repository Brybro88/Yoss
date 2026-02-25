/**
 * src/routes/authRoutes.js — Rutas de autenticación
 */

const { Router } = require('express');
const { login, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

const router = Router();

// Rutas públicas
router.post('/login', login);
router.post('/logout', logout);

// Rutas protegidas
router.get('/me', protect, getMe);

module.exports = router;
