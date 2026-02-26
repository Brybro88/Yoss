/**
 * src/routes/userRoutes.js
 */

const { Router } = require('express');
const { updateMood, getMoods } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

const router = Router();

// Todas las rutas requieren autenticación
router.use(protect);

router.patch('/mood', updateMood);
router.get('/moods', getMoods);

module.exports = router;
