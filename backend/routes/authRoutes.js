const express = require('express');
const {  loginUser, getUserProfile, updateUserProfile, logoutUser, changePassword, forgotPassword, resetPassword } = require('../controllers/authController');
const { verifyToken } = require('../middlewares/verifyToken');

const router = express.Router();

// Public routes
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/profile', verifyToken, getUserProfile);
router.put('/profile', verifyToken, updateUserProfile);
router.post('/logout', verifyToken, logoutUser);
router.post('/change-password', verifyToken, changePassword);

module.exports = router;
