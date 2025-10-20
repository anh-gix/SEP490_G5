const express = require('express');
const { registerUser, loginUser, getUserProfile, updateUserProfile, logoutUser } = require('../controllers/authController');
const { verifyToken } = require('../middlewares/verifyToken');

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/profile', verifyToken, getUserProfile);
router.put('/profile', verifyToken, updateUserProfile);
router.post('/logout', verifyToken, logoutUser);

module.exports = router;
