const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');

// Class routes
router.get('/stats', classController.getClassStats);
router.get('/', classController.getAllClasses);
router.get('/:id', classController.getClassById);
router.post('/', classController.createClass);
router.post('/:id/check-student-conflicts', classController.checkStudentConflicts);
router.post('/:id/check-teacher-room-conflicts', classController.checkTeacherRoomConflicts);
router.put('/:id', classController.updateClass);
router.delete('/:id', classController.deleteClass);

module.exports = router;
