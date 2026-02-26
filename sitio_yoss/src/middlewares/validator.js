const { validationResult } = require('express-validator');

/**
 * Middleware para validar el request y retornar errores de express-validator
 * @param {import('express').Request} req - Express Request object
 * @param {import('express').Response} res - Express Response object
 * @param {import('express').NextFunction} next - Express Next function
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      message: 'Errores de validación',
      errors: errors.array() 
    });
  }
  next();
};

module.exports = { validateRequest };
