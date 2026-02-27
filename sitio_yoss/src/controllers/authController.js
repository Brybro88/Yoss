/**
 * src/controllers/authController.js — Lógica de autenticación
 * 
 * Endpoints:
 *   POST /api/auth/login  — Autenticar usuario y emitir JWT en cookie
 *   POST /api/auth/logout — Limpiar cookie de sesión
 *   GET  /api/auth/me     — Retornar datos del usuario autenticado
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Genera un JWT y lo configura como cookie HTTP-Only
 */
const sendTokenCookie = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

  const cookieOptions = {
    httpOnly: true,                                    // No accesible desde JS del cliente
    secure: process.env.NODE_ENV === 'production',     // Solo HTTPS en producción
    sameSite: 'lax',                                   // Protección CSRF básica
    maxAge: 7 * 24 * 60 * 60 * 1000,                  // 7 días en ms
    path: '/',
  };

  res.cookie('token', token, cookieOptions);
  return token;
};

/**
 * POST /api/auth/login
 * Envía credenciales y recibe cookie JWT de sesión si son correctas.
 * @param {import('express').Request} req - Express Request object (body: username, password)
 * @param {import('express').Response} res - Express Response object
 * @param {import('express').NextFunction} next - Express Next function
 */
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Validación de campos
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Ingresa tu usuario y contraseña',
      });
    }

    // Buscar usuario (incluir passwordHash explícitamente)
    const user = await User.findOne({ username: username.trim().toLowerCase() });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas',
      });
    }

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas',
      });
    }

    // Generar token y enviar respuesta
    sendTokenCookie(res, user._id);

    res.status(200).json({
      success: true,
      message: `¡Bienvenid@, ${user.displayName}! 💖`,
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/logout
 */
const logout = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),    // Expira inmediatamente
    path: '/',
  });

  res.status(200).json({
    success: true,
    message: 'Sesión cerrada correctamente',
  });
};

/**
 * GET /api/auth/me
 * Requiere authMiddleware previo
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, logout, getMe };
