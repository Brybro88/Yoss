/**
 * src/routes/siteContentRoutes.js
 * 
 * Rutas para el CMS ligero.
 */

const express = require('express');
const { getSiteContent, updateSiteContent } = require('../controllers/siteContentController');
const { protect } = require('../middlewares/authMiddleware');
const { requireAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @route   GET /api/site-content
 * @desc    Obtener contenido dinámico de la página
 * @access  Private (Cualquier usuario logueado)
 */
router.get('/', protect, getSiteContent);

/**
 * @route   PUT /api/site-content
 * @desc    Actualizar contenido dinámico
 * @access  Private (Solo admin)
 */
router.put('/', protect, requireAdmin, updateSiteContent);

module.exports = router;
