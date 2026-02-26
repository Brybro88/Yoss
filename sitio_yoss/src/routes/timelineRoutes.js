/**
 * src/routes/timelineRoutes.js
 */

const { Router } = require('express');
const { getTimelineEvents } = require('../controllers/timelineController');
const { protect } = require('../middlewares/authMiddleware');

const router = Router();

// Todas las rutas requieren autenticación
router.use(protect);

router.get('/', getTimelineEvents);

module.exports = router;
