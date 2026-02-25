/**
 * src/middlewares/authMiddleware.js — Protección de rutas con JWT
 * 
 * Lee el JWT de la cookie 'token', lo verifica, y adjunta
 * req.user con los datos completos del usuario desde la BD.
 * 
 * Middlewares disponibles:
 *   - protect      → API routes (401 JSON)
 *   - protectView  → HTML views (redirect /login.html)
 *   - requireAdmin → Solo permite acceso a role: 'admin'
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware para rutas de API — responde 401 si no hay token válido
 * Carga el usuario completo (con role) desde la BD.
 */
const protect = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No autorizado. Inicia sesión.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido o expirado. Inicia sesión nuevamente.',
    });
  }
};

/**
 * Middleware para vistas — redirige a /login.html si no hay token válido
 * Carga el usuario completo (con role) desde la BD.
 */
const protectView = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.redirect('/login.html');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.redirect('/login.html');
    }

    req.user = user;
    next();
  } catch (error) {
    return res.redirect('/login.html');
  }
};

/**
 * Middleware que restringe acceso solo a usuarios con role: 'admin'
 * DEBE usarse después de protect o protectView.
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requiere rol de administrador.',
    });
  }
  next();
};

module.exports = { protect, protectView, requireAdmin };
