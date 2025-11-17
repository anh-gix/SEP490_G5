const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
// const { verifyToken } = require('../middlewares/verifyToken');

// All routes are protected
// router.use(verifyToken); // Temporarily disabled for testing

// Student CRUD
router.get('/', studentController.getAllStudents);
router.get('/stats', studentController.getStudentStats);
router.get('/:id', studentController.getStudentById);
router.get('/:id/schedule', studentController.getStudentSchedule);
router.post('/', studentController.createStudent);
router.put('/:id', studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);

module.exports = router;

