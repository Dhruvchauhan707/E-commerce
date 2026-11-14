const express = require('express');
const { registerController, loginController, getProfile, logoutController } = require('../controllers/authController');
const { protectedMiddleware } = require('../middleware/authMiddleware');
const router = express.Router();
router.post('/login', loginController);
router.post('/register', registerController);
router.post('/logout', logoutController);
router.get('/profile', protectedMiddleware, getProfile);
module.exports = router;
