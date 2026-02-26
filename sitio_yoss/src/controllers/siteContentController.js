/**
 * src/controllers/siteContentController.js — Controlador del CMS Ligero
 * 
 * Permite obtener y actualizar la configuración dinámica de la página 
 * de inicio (hero imageUrl, welcome message, notas, etc).
 */

const SiteContent = require('../models/SiteContent');

/**
 * GET /api/site-content
 * Obtiene la configuración pública. 
 * Si no existe en BD, inserta los valores default del modelo.
 */
const getSiteContent = async (req, res, next) => {
  try {
    let content = await SiteContent.findOne();

    if (!content) {
      // Si la base de datos está vacía, creamos el documento inicial
      content = await SiteContent.create({});
    }

    res.status(200).json({
      success: true,
      data: content,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/site-content
 * Actualiza el contenido del CMS. Solo accesible por Admin.
 */
const updateSiteContent = async (req, res, next) => {
  try {
    // Buscar el documento actual
    let content = await SiteContent.findOne();

    if (!content) {
      content = new SiteContent(req.body);
      await content.save();
    } else {
      // Usar runValidators para respetar los maxlengths del Schema
      content = await SiteContent.findOneAndUpdate(
        {}, 
        req.body, 
        { new: true, runValidators: true }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Contenido del sitio actualizado correctamente',
      data: content,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSiteContent,
  updateSiteContent
};
