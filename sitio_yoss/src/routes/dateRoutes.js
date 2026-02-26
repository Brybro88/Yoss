/**
 * src/routes/dateRoutes.js
 */

const { Router } = require('express');
const { createDateIdea, getRandomDate } = require('../controllers/dateController');
const { protect } = require('../middlewares/authMiddleware');

const router = Router();

// Todas las rutas requieren autenticación
router.use(protect);

router.get('/random', getRandomDate);
router.post('/', createDateIdea);

module.exports = router;
