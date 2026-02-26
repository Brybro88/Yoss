/**
 * src/middleware/requireAdmin.js
 * 
 * Middleware para asegurar que el usuario autenticado tiene rol de administrador.
 * Se asume que el token ya ha sido validado por un middleware previo (ej. authenticateToken)
 * y que req.user está definido.
 */

const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'No autorizado - Usuario no encontrado en la petición',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado - Se requieren privilegios de administrador',
    });
  }

  next();
};

module.exports = requireAdmin;
