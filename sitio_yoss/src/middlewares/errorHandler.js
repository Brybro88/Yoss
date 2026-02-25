/**
 * src/middlewares/errorHandler.js — Middleware global de errores
 * 
 * Captura errores no manejados y responde con formato JSON consistente.
 */

const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.stack || err.message);

  // Errores de validación de Mongoose
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: messages,
    });
  }

  // Errores de duplicados de MongoDB (unique constraint)
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'El registro ya existe',
    });
  }

  // Error de JWT malformado
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido',
    });
  }

  // Error de JWT expirado
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado. Inicia sesión nuevamente.',
    });
  }

  // Error genérico
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
