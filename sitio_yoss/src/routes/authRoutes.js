/**
 * src/routes/authRoutes.js — Rutas de autenticación
 */

const { Router } = require('express');
const { body } = require('express-validator');
const { login, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const { validateRequest } = require('../middlewares/validator');

const router = Router();

// Rutas públicas
router.post(
  '/login',
  [
    body('username').trim().notEmpty().withMessage('Ingresa tu usuario'),
    body('password').notEmpty().withMessage('Ingresa tu contraseña'),
    validateRequest
  ],
  login
);
router.post('/logout', logout);

// Rutas protegidas
router.get('/me', protect, getMe);

module.exports = router;
