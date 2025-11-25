const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { verifyToken, isStudent } = require('../middlewares/verifyToken');

// Student current user routes (require authentication)
router.get('/me', verifyToken, isStudent, studentController.getCurrentStudent);
router.get('/me/classes', verifyToken, isStudent, studentController.getMyClasses);
router.get('/me/schedule', verifyToken, isStudent, studentController.getMySchedule);

module.exports = router;
